import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Link as LinkIcon, Calendar, Grid, Bookmark, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import PostCard from '../components/PostCard';
import Spinner from '../components/ui/Spinner';
import FollowButton from '../components/FollowButton';

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'bookmarks'
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState('');

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [website, setWebsite] = useState('');

  const isOwnProfile = currentUser && currentUser.username === username;

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getUserProfile(username);
      if (res.success && res.data) {
        setProfile(res.data);
        
        // Prep edit states
        setName(res.data.name || '');
        setBio(res.data.bio || '');
        setLocation(res.data.location || '');
        setSkills(res.data.skills?.join(', ') || '');
        setGithub(res.data.socialLinks?.github || '');
        setLinkedin(res.data.socialLinks?.linkedin || '');
        setTwitter(res.data.socialLinks?.twitter || '');
        setWebsite(res.data.socialLinks?.website || '');
      }
    } catch (err) {
      setError(err.message || 'Profile not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfilePosts = async () => {
    if (!profile) return;
    try {
      setPostsLoading(true);
      const filters = activeTab === 'bookmarks' 
        ? { bookmarkedBy: profile._id } 
        : { author: profile._id };
      
      const res = await api.getPosts(filters);
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
    fetchProfile();
  }, [username]);

  useEffect(() => {
    if (profile) {
      fetchProfilePosts();
    }
  }, [profile, activeTab]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
      const res = await api.updateProfile({
        name,
        bio,
        location,
        skills: skillsArray,
        socialLinks: { github, linkedin, twitter, website }
      });
      if (res.success) {
        setProfile((prev) => ({
          ...prev,
          ...res.data
        }));
        setIsEditing(false);
      }
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await api.uploadAvatar(formData);
      if (res.success && res.data) {
        setProfile((prev) => ({
          ...prev,
          avatar: res.data.avatar,
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) return <Spinner size="large" />;
  if (error) return <div style={{ color: 'var(--error)', padding: '40px', textAlign: 'center' }}><h3>{error}</h3></div>;
  if (!profile) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
      {/* Banner & Profile Header */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="profile-banner">
          {profile.banner?.url && <img src={profile.banner.url} alt="Banner" />}
        </div>
        
        <div className="profile-info-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div className="profile-avatar-container">
              <Avatar src={profile.avatar?.url} username={profile.username} size="large" />
              {isOwnProfile && (
                <label style={{ position: 'absolute', bottom: '0', right: '0', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '50%', padding: '6px', cursor: 'pointer', display: 'flex' }}>
                  <Calendar size={14} />
                  <input type="file" onChange={handleAvatarChange} style={{ display: 'none' }} />
                </label>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              {isOwnProfile ? (
                <button onClick={() => setIsEditing(!isEditing)} className="btn btn-secondary">
                  {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </button>
              ) : (
                <FollowButton targetUserId={profile._id} style={{ padding: '10px 20px', fontSize: '0.95rem' }} />
              )}
            </div>
          </div>

          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: '1.8rem', fontWeight: '700' }}>{profile.name}</h2>
            <div style={{ color: 'var(--text-sub)', fontSize: '0.95rem', fontWeight: '500' }}>@{profile.username}</div>
          </div>

          {profile.bio && <p style={{ marginTop: '14px', fontSize: '1rem', color: 'var(--text-main)', maxWidth: '600px' }}>{profile.bio}</p>}

          {/* Location and details */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {profile.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} />
                <span>{profile.location}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} />
              <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span><strong style={{ color: 'var(--text-white)' }}>{profile.followers?.length || 0}</strong> Followers</span>
              <span><strong style={{ color: 'var(--text-white)' }}>{profile.following?.length || 0}</strong> Following</span>
            </div>
          </div>

          {/* Social Links */}
          {profile.socialLinks && Object.values(profile.socialLinks).some(Boolean) && (
            <div style={{ display: 'flex', gap: '14px', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              {profile.socialLinks.github && (
                <a href={profile.socialLinks.github} target="_blank" rel="noreferrer" style={{ color: 'var(--text-sub)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/></svg>
                </a>
              )}
              {profile.socialLinks.linkedin && (
                <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer" style={{ color: 'var(--text-sub)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
              )}
              {profile.socialLinks.twitter && (
                <a href={profile.socialLinks.twitter} target="_blank" rel="noreferrer" style={{ color: 'var(--text-sub)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                </a>
              )}
              {profile.socialLinks.website && (
                <a href={profile.socialLinks.website} target="_blank" rel="noreferrer" style={{ color: 'var(--text-sub)' }}>
                  <LinkIcon size={20} />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Form (Expanded state) */}
      {isEditing && (
        <div className="glass-card fade-in">
          <h3 style={{ marginBottom: '20px' }}>Edit Profile Information</h3>
          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input label="Display Name" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. San Francisco, CA" />
            </div>
            
            <div className="form-group">
              <label>Bio</label>
              <textarea className="form-control" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." style={{ minHeight: '80px' }} />
            </div>

            <Input label="Skills (comma separated)" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g. React, Node.js, Python, CSS" />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input label="GitHub Profile URL" value={github} onChange={(e) => setGithub(e.target.value)} />
              <Input label="LinkedIn Profile URL" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
              <Input label="Twitter Profile URL" value={twitter} onChange={(e) => setTwitter(e.target.value)} />
              <Input label="Website URL" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>

            <div style={{ display: 'flex', justifySelf: 'end', gap: '10px', marginTop: '10px' }}>
              <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      )}

      {/* Grid: Details (Portfolio & Skills) vs Posts Feed */}
      <div className="profile-details-grid">
        {/* Left side: Bio, Portfolio, Skills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Skills Card */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '12px' }}>Skills & Tech Stack</h4>
            {profile.skills && profile.skills.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {profile.skills.map((skill, index) => (
                  <Badge key={index} variant="accent">{skill}</Badge>
                ))}
              </div>
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No skills listed yet.</span>
            )}
          </div>

          {/* Portfolio Card */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '12px' }}>Portfolio Showcase</h4>
            {profile.portfolio && profile.portfolio.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {profile.portfolio.map((p, idx) => (
                  <div key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-white)', fontSize: '0.9rem' }}>{p.title}</span>
                      {p.url && (
                        <a href={p.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <LinkIcon size={12} /> Visit
                        </a>
                      )}
                    </div>
                    {p.description && <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: '4px' }}>{p.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No showcase builds added yet.</span>
            )}
          </div>
        </div>

        {/* Right side: Posts Tabs & Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Feed Switcher Tabs */}
          <div className="glass-card" style={{ display: 'flex', padding: '4px', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('posts')}
              className={`btn ${activeTab === 'posts' ? 'btn-primary' : 'btn-text'}`}
              style={{ flex: 1, padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <Grid size={16} style={{ color: activeTab === 'posts' ? 'var(--bg-darker)' : 'inherit' }} />
              <span>Posts</span>
            </button>
            
            {isOwnProfile && (
              <button
                onClick={() => setActiveTab('bookmarks')}
                className={`btn ${activeTab === 'bookmarks' ? 'btn-primary' : 'btn-text'}`}
                style={{ flex: 1, padding: '8px 16px', fontSize: '0.85rem' }}
              >
                <Bookmark size={16} style={{ color: activeTab === 'bookmarks' ? 'var(--bg-darker)' : 'inherit' }} />
                <span>Bookmarked</span>
              </button>
            )}
          </div>

          {/* Posts Feed list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {postsLoading ? (
              <Spinner />
            ) : posts.length === 0 ? (
              <div className="glass-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No posts found in this tab.
              </div>
            ) : (
              posts.map((post) => (
                <PostCard key={post._id} post={post} onDelete={() => fetchProfilePosts()} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
