import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Spinner from '../components/ui/Spinner';
import PostCard from '../components/PostCard';
import { Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BookmarksPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarkedPosts = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await api.getPosts({ bookmarkedBy: user._id });
      if (res.success && res.data?.posts) {
        setPosts(res.data.posts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarkedPosts();
  }, [user]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
      <div>
        <h2 style={{ margin: 0 }}>Bookmarked Posts</h2>
        <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginTop: '4px' }}>Save interest builds to view later</p>
      </div>

      {loading ? (
        <Spinner size="large" />
      ) : posts.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-sub)' }}>
          <Bookmark size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <h3>No bookmarks found</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>Click the Bookmark button on post items to save them.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onDelete={() => fetchBookmarkedPosts()} />
          ))}
        </div>
      )}
    </div>
  );
}
