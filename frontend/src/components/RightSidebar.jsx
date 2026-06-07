import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, UserMinus, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Avatar from './ui/Avatar';
import Button from './ui/Button';

export default function RightSidebar() {
  const { user, setUser } = useAuth();
  const [suggested, setSuggested] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSuggested = async () => {
    try {
      setLoading(true);
      const res = await api.getSuggestedUsers();
      if (res.success) {
        setSuggested(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSuggested();
    }
  }, [user]);

  const handleFollowToggle = async (userId, isFollowing) => {
    try {
      if (isFollowing) {
        const res = await api.unfollowUser(userId);
        if (res.success) {
          // Update local user state following list
          setUser((prev) => ({
            ...prev,
            following: prev.following.filter((id) => id !== userId),
          }));
        }
      } else {
        const res = await api.followUser(userId);
        if (res.success) {
          // Update local user state following list
          setUser((prev) => ({
            ...prev,
            following: [...prev.following, userId],
          }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <aside
      style={{
        width: '320px',
        padding: '24px 16px',
        background: 'var(--bg-darker)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        borderLeft: '1px solid var(--border-color)',
        overflowY: 'auto',
        position: 'fixed',
        top: 'var(--header-height)',
        bottom: '0',
        right: '0'
      }}
      className="right-sidebar"
    >
      <style>{`
        @media (max-width: 1200px) {
          .right-sidebar {
            display: none !important;
          }
        }
      `}</style>

      {/* Suggested Developers Card */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          <Sparkles size={16} style={{ color: 'var(--accent-cyan)' }} />
          <h4 style={{ margin: 0 }}>Suggested Developers</h4>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading suggestions...</div>
        ) : suggested.length === 0 ? (
          <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>No suggestions available</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {suggested.map((item) => {
              const isFollowing = user.following?.includes(item._id);
              return (
                <div key={item._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <Link to={`/profile/${item.username}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                    <Avatar src={item.avatar?.url} username={item.username} size="small" />
                    <div style={{ minWidth: 0, textAlign: 'left' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        @{item.username}
                      </div>
                    </div>
                  </Link>

                  <button
                    onClick={() => handleFollowToggle(item._id, isFollowing)}
                    className="btn btn-secondary"
                    style={{
                      padding: '5px 8px',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      borderColor: isFollowing ? 'var(--border-color)' : 'rgba(0, 242, 254, 0.3)'
                    }}
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus size={12} />
                        <span>Unfollow</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={12} style={{ color: 'var(--accent-cyan)' }} />
                        <span style={{ color: 'var(--text-white)' }}>Follow</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
