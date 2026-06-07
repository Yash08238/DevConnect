import { useState, useEffect } from 'react';
import { Image, Code, Link as LinkIcon, Plus, X, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Avatar from './ui/Avatar';
import Button from './ui/Button';
import Input from './ui/Input';

export default function CreatePost({ onPostCreated }) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [community, setCommunity] = useState('');
  const [communities, setCommunities] = useState([]);
  
  // Snippet State
  const [showSnippet, setShowSnippet] = useState(false);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');

  // Links State
  const [showLinks, setShowLinks] = useState(false);
  const [githubLink, setGithubLink] = useState('');
  const [projectLink, setProjectLink] = useState('');

  // Image upload
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (expanded && user) {
      api.getCommunities()
        .then((res) => {
          if (res.success && res.data?.communities) {
            setCommunities(res.data.communities);
          }
        })
        .catch(console.error);
    }
  }, [expanded, user]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imageFiles.length > 4) {
      setError('You can upload up to 4 images only');
      return;
    }
    setError('');
    setImageFiles((prev) => [...prev, ...files]);

    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && imageFiles.length === 0) {
      setError('Post content cannot be empty');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('title', title || 'Untitled Post');
      formData.append('content', content);
      
      const parsedTags = tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
      formData.append('tags', JSON.stringify(parsedTags));

      if (community) {
        formData.append('community', community);
      }

      if (showSnippet && code) {
        formData.append('type', 'code');
        formData.append('codeSnippet', JSON.stringify({ code, language }));
      } else if (githubLink || projectLink) {
        formData.append('type', 'project');
      } else {
        formData.append('type', 'text');
      }

      if (githubLink) formData.append('githubLink', githubLink);
      if (projectLink) formData.append('projectLink', projectLink);

      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      const res = await api.createPost(formData);
      if (res.success) {
        // Reset states
        setTitle('');
        setContent('');
        setTagsInput('');
        setCommunity('');
        setShowSnippet(false);
        setCode('');
        setShowLinks(false);
        setGithubLink('');
        setProjectLink('');
        setImageFiles([]);
        setImagePreviews([]);
        setExpanded(false);
        
        if (onPostCreated) {
          onPostCreated(res.data);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="glass-card publisher-card fade-in" style={{ padding: expanded ? '24px' : '16px' }}>
      <form onSubmit={handleSubmit}>
        <div className="publisher-input-area">
          <Avatar src={user.avatar?.url} username={user.username} size="small" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {expanded && (
              <input
                type="text"
                className="form-control"
                placeholder="Post Title (Optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', borderRadius: '0', padding: '6px 0', fontSize: '1.1rem', color: 'var(--text-white)' }}
              />
            )}
            <textarea
              className="publisher-textarea"
              placeholder="What are you building today?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setExpanded(true)}
            />
          </div>
        </div>

        {/* Dynamic Image Preview */}
        {imagePreviews.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px', margin: '12px 0' }}>
            {imagePreviews.map((preview, index) => (
              <div key={index} style={{ position: 'relative', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Upload preview" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', borderRadius: '50%', padding: '2px', cursor: 'pointer', display: 'flex' }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Code Snippet Builder Option */}
        {expanded && showSnippet && (
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px', margin: '14px 0', background: 'rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Add Code Snippet</span>
              <select
                className="form-control"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{ width: 'auto', padding: '4px 10px', height: '30px', fontSize: '0.8rem' }}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="bash">Bash</option>
              </select>
            </div>
            <textarea
              className="form-control"
              placeholder="Paste code here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', minHeight: '120px' }}
            />
          </div>
        )}

        {/* Project Links Form */}
        {expanded && showLinks && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '14px 0' }}>
            <Input
              placeholder="GitHub Repository URL"
              value={githubLink}
              onChange={(e) => setGithubLink(e.target.value)}
              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
            />
            <Input
              placeholder="Live Demo URL"
              value={projectLink}
              onChange={(e) => setProjectLink(e.target.value)}
              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
            />
          </div>
        )}

        {expanded && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            {/* Tags and Community Selection */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                placeholder="Tags (comma separated, e.g. react, node)"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              />
              <div className="form-group" style={{ margin: 0 }}>
                <select
                  className="form-control"
                  value={community}
                  onChange={(e) => setCommunity(e.target.value)}
                  style={{ height: '38px', fontSize: '0.85rem' }}
                >
                  <option value="">Post to (Choose Community)</option>
                  {communities.map((c) => (
                    <option key={c._id} value={c._id}>
                      c/{c.slug} ({c.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={{ color: 'var(--error)', fontSize: '0.85rem', textAlign: 'left', marginBottom: '12px' }}>
            {error}
          </div>
        )}

        {/* Toolbar Footer */}
        {expanded ? (
          <div className="publisher-actions">
            <div className="publisher-icons">
              <label className="btn-text publisher-icon-btn" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Image size={20} />
                <input type="file" multiple accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              </label>
              <button
                type="button"
                className="btn-text publisher-icon-btn"
                onClick={() => setShowSnippet(!showSnippet)}
                style={{ color: showSnippet ? 'var(--accent-cyan)' : '' }}
              >
                <Code size={20} />
              </button>
              <button
                type="button"
                className="btn-text publisher-icon-btn"
                onClick={() => setShowLinks(!showLinks)}
                style={{ color: showLinks ? 'var(--accent-cyan)' : '' }}
              >
                <LinkIcon size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setExpanded(false)}
                style={{ padding: '6px 14px', fontSize: '0.85rem' }}
              >
                Cancel
              </button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                style={{ padding: '6px 16px', fontSize: '0.85rem' }}
              >
                {loading ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="primary"
              onClick={() => setExpanded(true)}
              style={{ padding: '6px 16px', fontSize: '0.85rem' }}
            >
              Expand Editor
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
