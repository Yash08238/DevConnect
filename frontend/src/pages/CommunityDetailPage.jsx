import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import Spinner from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import { Users, Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CommunityDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);

  const isMember = user && community?.members?.some(m => (m._id || m) === user._id);
  const isCreator = user && community?.creator === user._id;

  const fetchCommunityDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getCommunity(slug);
      if (res.success && res.data) {
        setCommunity(res.data);
      }
    } catch (err) {
      setError(err.message || 'Community not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunityPosts = async () => {
    if (!community) return;
    try {
      setPostsLoading(true);
      const res = await api.getPosts({ community: community._id });
      if (res.success && res.data?.posts) {
        setPosts(res.data.posts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityDetails();
  }, [slug]);

  useEffect(() => {
    if (community) {
      fetchCommunityPosts();
    }
  }, [community]);

  const handleJoinToggle = async () => {
    if (!user) return navigate('/login');
    if (joinLoading) return;

    try {
      setJoinLoading(true);
      if (isMember) {
        if (isCreator) {
          alert('Creators cannot leave their community!');
          return;
        }
        const res = await api.leaveCommunity(community.slug);
        if (res.success) {
          setCommunity(prev => ({
            ...prev,
            members: prev.members.filter(m => (m._id || m) !== user._id),
            memberCount: Math.max(0, (prev.memberCount || 1) - 1)
          }));
        }
      } else {
        const res = await api.joinCommunity(community.slug);
        if (res.success) {
          setCommunity(prev => ({
            ...prev,
            members: [...prev.members, user],
            memberCount: (prev.memberCount || 0) + 1
          }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setJoinLoading(false);
    }
  };

  if (loading && !community) return <Spinner size="large" />;
  if (error) return <div style={{ color: 'var(--error)', padding: '40px', textAlign: 'center' }}><h3>{error}</h3><button onClick={() => navigate('/communities')} className="btn btn-secondary" style={{ marginTop: '14px' }}>Back to communities</button></div>;
  if (!community) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
      <button onClick={() => navigate('/communities')} className="btn-text" style={{ display: 'flex', alignItems: 'center', gap: '6px', width: 'fit-content', padding: '0', marginBottom: '4px' }}>
        <ArrowLeft size={16} /> Back to Communities
      </button>

      {/* Banner & Header */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ height: '140px', background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-cyan) 100%)', position: 'relative' }}>
          {community.banner?.url && (
            <img src={community.banner.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
          )}
        </div>
        <div style={{ padding: '20px', position: 'relative', marginTop: '-36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
            <img
              src={community.avatar?.url || `https://api.dicebear.com/7.x/identicon/svg?seed=${community.slug}`}
              style={{ width: '72px', height: '72px', borderRadius: '10px', border: '4px solid var(--bg-card)', objectFit: 'cover', background: 'var(--bg-input)' }}
              alt=""
            />
            <button
              onClick={handleJoinToggle}
              className="btn btn-primary"
              disabled={joinLoading}
              style={{ padding: '8px 20px', fontSize: '0.85rem' }}
            >
              {isMember ? 'Leave Group' : 'Join Group'}
            </button>
          </div>

          <div>
            <h2 style={{ margin: '0 0 6px', fontSize: '1.6rem', fontWeight: '700' }}>c/{community.slug}</h2>
            <h4 style={{ margin: '0 0 10px', fontSize: '1.1rem', fontWeight: '500', color: 'var(--text-sub)' }}>{community.name}</h4>
          </div>

          <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 0 16px' }}>
            {community.description || 'Welcome to the group! This community is dedicated to developer builds and discussions.'}
          </p>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: '0.8rem', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={16} />
              <span>{community.members?.length || 0} members</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={16} />
              <span>{community.moderators?.length || 0} moderators</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Members list vs Feed */}
      <div className="profile-details-grid">
        {/* Left: Community metadata & members */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '16px' }}>
            <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px' }}>Members ({community.members?.length || 0})</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {community.members?.slice(0, 10).map((member) => (
                <div key={member._id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Avatar src={member.avatar?.url} username={member.username} size="small" style={{ width: '28px', height: '28px' }} />
                  <div style={{ fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-white)' }}>{member.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{member.username}</div>
                  </div>
                </div>
              ))}
              {community.members?.length > 10 && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>+{community.members.length - 10} more members</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Posts feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Create Post (only for members) */}
          {isMember ? (
            <CreatePost
              onPostCreated={(newPost) => setPosts(prev => [newPost, ...prev])}
              forcedCommunityId={community._id}
            />
          ) : (
            <div className="glass-card" style={{ padding: '16px', textAlign: 'center', color: 'var(--text-sub)' }}>
              Join this community to make posts!
            </div>
          )}

          {postsLoading ? (
            <Spinner />
          ) : posts.length === 0 ? (
            <div className="glass-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No discussions in this community yet.
            </div>
          ) : (
            posts.map(post => (
              <PostCard key={post._id} post={post} onDelete={(id) => setPosts(prev => prev.filter(p => p._id !== id))} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
