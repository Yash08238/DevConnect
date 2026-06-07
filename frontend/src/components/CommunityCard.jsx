import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Button from './ui/Button';

export default function CommunityCard({ community: initialCommunity }) {
  const { user } = useAuth();
  const [community, setCommunity] = useState(initialCommunity);
  const [loading, setLoading] = useState(false);

  const isMember = user && community.members?.includes(user._id);
  const isCreator = user && community.creator === user._id;

  const handleJoinToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    try {
      setLoading(true);
      if (isMember) {
        if (isCreator) {
          alert('Creators cannot leave their community!');
          return;
        }
        const res = await api.leaveCommunity(community.slug);
        if (res.success) {
          setCommunity((prev) => ({
            ...prev,
            members: prev.members.filter((id) => id !== user._id),
            memberCount: Math.max(0, (prev.memberCount || 1) - 1),
          }));
        }
      } else {
        const res = await api.joinCommunity(community.slug);
        if (res.success) {
          setCommunity((prev) => ({
            ...prev,
            members: [...(prev.members || []), user._id],
            memberCount: (prev.memberCount || 0) + 1,
          }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card fade-in" style={{ padding: '0', overflow: 'hidden', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
      {/* Banner */}
      <div style={{ height: '80px', background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-blue) 100%)', position: 'relative' }}>
        {community.banner?.url && (
          <img src={community.banner.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
        )}
      </div>

      <div style={{ padding: '16px', position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Avatar Overlay */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '-36px', marginBottom: '8px' }}>
          <img
            src={community.avatar?.url || `https://api.dicebear.com/7.x/identicon/svg?seed=${community.slug}`}
            style={{ width: '54px', height: '54px', borderRadius: '8px', border: '3px solid var(--bg-card)', objectFit: 'cover', background: 'var(--bg-input)' }}
            alt=""
          />
          {user && (
            <button
              onClick={handleJoinToggle}
              className="btn btn-secondary"
              disabled={loading}
              style={{
                padding: '5px 12px',
                fontSize: '0.75rem',
                borderColor: isMember ? 'var(--border-color)' : 'rgba(0, 242, 254, 0.3)',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {isMember ? (
                <>
                  <Check size={12} style={{ color: 'var(--success)' }} />
                  <span>Joined</span>
                </>
              ) : (
                <span>Join</span>
              )}
            </button>
          )}
        </div>

        {/* Content */}
        <div>
          <Link to={`/communities/c/${community.slug}`} style={{ color: 'var(--text-white)' }}>
            <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: '600' }}>{community.name}</h4>
          </Link>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Users size={12} />
            <span>{community.memberCount || community.members?.length || 0} members</span>
          </div>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', margin: '4px 0 0', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {community.description || 'No description available for this community.'}
        </p>

        {community.tags && community.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: 'auto', paddingTop: '8px' }}>
            {community.tags.map((tag, i) => (
              <Badge key={i} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
