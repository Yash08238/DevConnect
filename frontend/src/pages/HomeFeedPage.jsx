import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import Spinner from '../components/ui/Spinner';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Rss } from 'lucide-react';

export default function HomeFeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [feedType, setFeedType] = useState('global'); // 'global' or 'following'
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPosts = useCallback(async (pageNum, type, isReset = false) => {
    try {
      setLoading(true);
      setError('');
      const queryType = type === 'following' ? 'following' : '';
      const res = await api.getPosts(queryType, pageNum);
      
      if (res.success && res.data) {
        const fetchedPosts = res.data.posts || [];
        const meta = res.data.meta || {};

        setPosts((prev) => {
          if (isReset) return fetchedPosts;
          
          // Avoid duplicate posts
          const prevIds = new Set(prev.map((p) => p._id));
          const filteredNew = fetchedPosts.filter((p) => !prevIds.has(p._id));
          return [...prev, ...filteredNew];
        });

        // Determine if more posts exist
        setHasMore(pageNum < meta.totalPages);
      }
    } catch (err) {
      setError('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchPosts(1, feedType, true);
  }, [feedType, fetchPosts]);

  const loadMore = () => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, feedType, false);
  };

  useInfiniteScroll(loadMore, hasMore, loading);

  const handlePostCreated = (newPost) => {
    // Unshift the newly created post into the posts array
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (deletedPostId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedPostId));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Tabs */}
      {user && (
        <div
          className="glass-card"
          style={{
            display: 'flex',
            padding: '4px',
            borderRadius: '10px',
            gap: '8px',
            position: 'sticky',
            top: '78px',
            zIndex: '50'
          }}
        >
          <button
            onClick={() => setFeedType('global')}
            className={`btn ${feedType === 'global' ? 'btn-primary' : 'btn-text'}`}
            style={{ flex: 1, padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <Sparkles size={16} style={{ color: feedType === 'global' ? 'var(--bg-darker)' : 'inherit' }} />
            <span>Global Feed</span>
          </button>
          <button
            onClick={() => setFeedType('following')}
            className={`btn ${feedType === 'following' ? 'btn-primary' : 'btn-text'}`}
            style={{ flex: 1, padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <Rss size={16} style={{ color: feedType === 'following' ? 'var(--bg-darker)' : 'inherit' }} />
            <span>Following</span>
          </button>
        </div>
      )}

      {/* Post Publisher */}
      {user && <CreatePost onPostCreated={handlePostCreated} />}

      {error && (
        <div style={{ color: 'var(--error)', padding: '16px', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {/* Feed list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {posts.map((post) => (
          <PostCard key={post._id} post={post} onDelete={handlePostDeleted} />
        ))}
      </div>

      {loading && <Spinner />}

      {!loading && posts.length === 0 && (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-sub)' }}>
          <h3>Nothing to see here yet</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>
            {feedType === 'following'
              ? "Follow other developers or toggle to the 'Global Feed' to see what's happening!"
              : 'Be the first one to create a post!'}
          </p>
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          You've caught up with everything! 🎉
        </div>
      )}
    </div>
  );
}
