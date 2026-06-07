import { useState, useEffect } from 'react';
import { api } from '../services/api';
import CommunityCard from '../components/CommunityCard';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { Users, Plus } from 'lucide-react';

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const res = await api.getCommunities();
      if (res.success && res.data?.communities) {
        setCommunities(res.data.communities);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    if (!name || !slug) {
      setError('Name and slug are required');
      return;
    }

    try {
      setFormLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('name', name);
      formData.append('slug', slug.toLowerCase().replace(/[^a-z0-9-_]/g, ''));
      formData.append('description', description);
      formData.append('isPrivate', isPrivate);

      const parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);
      formData.append('tags', JSON.stringify(parsedTags));

      if (avatarFile) formData.append('avatar', avatarFile);
      if (bannerFile) formData.append('banner', bannerFile);

      const res = await api.createCommunity(formData);
      if (res.success) {
        // Reset and close
        setName('');
        setSlug('');
        setDescription('');
        setTags('');
        setIsPrivate(false);
        setAvatarFile(null);
        setBannerFile(null);
        setIsModalOpen(false);
        // Refresh list
        fetchCommunities();
      }
    } catch (err) {
      setError(err.message || 'Failed to create community');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>Developer Communities</h2>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginTop: '4px' }}>Join groups matching your favorite stacks and tech fields</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="primary">
          <Plus size={16} style={{ color: 'var(--bg-darker)' }} />
          <span style={{ color: 'var(--bg-darker)' }}>Create Group</span>
        </Button>
      </div>

      {loading ? (
        <Spinner size="large" />
      ) : communities.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-sub)' }}>
          <Users size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <h3>No communities found</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>Be the first one to establish a community!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {communities.map((community) => (
            <CommunityCard key={community._id} community={community} />
          ))}
        </div>
      )}

      {/* Creation Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Community">
        {error && (
          <div style={{ color: 'var(--error)', fontSize: '0.85rem', marginBottom: '12px', background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '6px' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleCreateCommunity} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input label="Community Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. React Developers" required />
          <Input label="Slug (URL identifier)" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. react-devs" required />
          
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the purpose of this community..." style={{ minHeight: '80px' }} />
          </div>

          <Input label="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. frontend, react, spa" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Avatar Image</label>
              <input type="file" onChange={(e) => setAvatarFile(e.target.files[0])} accept="image/*" className="form-control" style={{ fontSize: '0.85rem', padding: '6px 12px' }} />
            </div>
            <div className="form-group">
              <label>Banner Image</label>
              <input type="file" onChange={(e) => setBannerFile(e.target.files[0])} accept="image/*" className="form-control" style={{ fontSize: '0.85rem', padding: '6px 12px' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="checkbox" id="isPrivate" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
            <label htmlFor="isPrivate" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>Make this community private</label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <Button type="submit" variant="primary" disabled={formLoading}>
              {formLoading ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
