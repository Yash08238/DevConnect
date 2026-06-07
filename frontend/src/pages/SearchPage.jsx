import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import PostCard from '../components/PostCard';
import UserCard from '../components/UserCard';
import CommunityCard from '../components/CommunityCard';
import JobCard from '../components/JobCard';
import Spinner from '../components/ui/Spinner';
import { Grid, Users, Briefcase, Sparkles, MessageSquare } from 'lucide-react';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState({ users: [], posts: [], communities: [], jobs: [] });
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'users' | 'communities' | 'jobs'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) return;
      try {
        setLoading(true);
        const res = await api.search(query);
        if (res.success && res.data) {
          setResults(res.data);
          
          // Auto-select tab with most results if current active is empty
          const counts = {
            posts: res.data.posts?.length || 0,
            users: res.data.users?.length || 0,
            communities: res.data.communities?.length || 0,
            jobs: res.data.jobs?.length || 0
          };
          
          if (counts[activeTab] === 0) {
            const maxTab = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
            if (counts[maxTab] > 0) {
              setActiveTab(maxTab);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  if (!query) {
    return (
      <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-sub)' }}>
        <h3>Search DevConnect</h3>
        <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>Type something in the search bar above to look for posts, developers, and jobs.</p>
      </div>
    );
  }

  const counts = {
    posts: results.posts?.length || 0,
    users: results.users?.length || 0,
    communities: results.communities?.length || 0,
    jobs: results.jobs?.length || 0
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
      <div>
        <h2 style={{ margin: 0 }}>Search Results</h2>
        <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginTop: '4px' }}>Showing matches for "{query}"</p>
      </div>

      {/* Tabs */}
      <div className="glass-card" style={{ display: 'flex', padding: '4px', gap: '8px' }}>
        <button
          onClick={() => setActiveTab('posts')}
          className={`btn ${activeTab === 'posts' ? 'btn-primary' : 'btn-text'}`}
          style={{ flex: 1, padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <MessageSquare size={15} style={{ color: activeTab === 'posts' ? 'var(--bg-darker)' : 'inherit' }} />
          <span>Posts ({counts.posts})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-text'}`}
          style={{ flex: 1, padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <Users size={15} style={{ color: activeTab === 'users' ? 'var(--bg-darker)' : 'inherit' }} />
          <span>Developers ({counts.users})</span>
        </button>

        <button
          onClick={() => setActiveTab('communities')}
          className={`btn ${activeTab === 'communities' ? 'btn-primary' : 'btn-text'}`}
          style={{ flex: 1, padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <Sparkles size={15} style={{ color: activeTab === 'communities' ? 'var(--bg-darker)' : 'inherit' }} />
          <span>Communities ({counts.communities})</span>
        </button>

        <button
          onClick={() => setActiveTab('jobs')}
          className={`btn ${activeTab === 'jobs' ? 'btn-primary' : 'btn-text'}`}
          style={{ flex: 1, padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <Briefcase size={15} style={{ color: activeTab === 'jobs' ? 'var(--bg-darker)' : 'inherit' }} />
          <span>Jobs ({counts.jobs})</span>
        </button>
      </div>

      {/* Results Content */}
      {loading ? (
        <Spinner size="large" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {activeTab === 'posts' && (
            counts.posts === 0 ? (
              <div className="glass-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>No matching posts.</div>
            ) : (
              results.posts.map((post) => <PostCard key={post._id} post={post} />)
            )
          )}

          {activeTab === 'users' && (
            counts.users === 0 ? (
              <div className="glass-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>No matching developers.</div>
            ) : (
              results.users.map((item) => <UserCard key={item._id} user={item} />)
            )
          )}

          {activeTab === 'communities' && (
            counts.communities === 0 ? (
              <div className="glass-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>No matching communities.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {results.communities.map((item) => <CommunityCard key={item._id} community={item} />)}
              </div>
            )
          )}

          {activeTab === 'jobs' && (
            counts.jobs === 0 ? (
              <div className="glass-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>No matching job postings.</div>
            ) : (
              <div className="jobs-grid">
                {results.jobs.map((item) => <JobCard key={item._id} job={item} />)}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
