import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Spinner from '../components/ui/Spinner';
import PostCard from '../components/PostCard';
import { ArrowLeft } from 'lucide-react';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPostDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getPost(id);
      if (res.success && res.data) {
        setPost(res.data);
      }
    } catch (err) {
      setError(err.message || 'Post not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostDetails();
  }, [id]);

  if (loading && !post) return <Spinner size="large" />;
  if (error) return <div style={{ color: 'var(--error)', padding: '40px', textAlign: 'center' }}><h3>{error}</h3><button onClick={() => navigate('/')} className="btn btn-secondary" style={{ marginTop: '14px' }}>Back to feed</button></div>;
  if (!post) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
      <button onClick={() => navigate(-1)} className="btn-text" style={{ display: 'flex', alignItems: 'center', gap: '6px', width: 'fit-content', padding: '0', marginBottom: '4px' }}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* Expanded post item */}
      <PostCard post={post} onDelete={() => navigate('/')} />
    </div>
  );
}
