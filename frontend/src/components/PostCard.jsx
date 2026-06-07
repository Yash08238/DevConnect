import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThumbsUp, MessageSquare, Bookmark, Trash2, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import timeAgo from '../utils/timeAgo';
import Avatar from './ui/Avatar';
import Badge from './ui/Badge';
import CodeBlock from './CodeBlock';
import CommentSection from './CommentSection';
import FollowButton from './FollowButton';

export default function PostCard({ post: initialPost, onDelete }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(initialPost);
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  const isLiked = user && post.likes?.includes(user._id);
  const isBookmarked = user && post.bookmarkedBy?.includes(user._id);
  const isAuthor = user && post.author?._id === user._id;

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) return navigate('/login');
    if (isLiking) return;

    try {
      setIsLiking(true);
      if (isLiked) {
        const res = await api.unlikePost(post._id);
        if (res.success) {
          setPost((prev) => ({
            ...prev,
            likes: prev.likes.filter((id) => id !== user._id),
          }));
        }
      } else {
        const res = await api.likePost(post._id);
        if (res.success) {
          setPost((prev) => ({
            ...prev,
            likes: [...prev.likes, user._id],
          }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleBookmark = async (e) => {
    e.stopPropagation();
    if (!user) return navigate('/login');
    if (isBookmarking) return;

    try {
      setIsBookmarking(true);
      const res = await api.bookmarkPost(post._id);
      if (res.success) {
        setPost((prev) => {
          const alreadyBookmarked = prev.bookmarkedBy?.includes(user._id);
          return {
            ...prev,
            bookmarkedBy: alreadyBookmarked
              ? prev.bookmarkedBy.filter((id) => id !== user._id)
              : [...(prev.bookmarkedBy || []), user._id],
          };
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const res = await api.deletePost(post._id);
      if (res.success && onDelete) {
        onDelete(post._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="glass-card post-card fade-in" style={{ padding: '20px' }}>
      {/* Header Info */}
      <div className="post-header">
        <div className="post-author-info">
          <Link to={`/profile/${post.author?.username}`}>
            <Avatar src={post.author?.avatar?.url} username={post.author?.username} />
          </Link>
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link to={`/profile/${post.author?.username}`} className="post-author-name">
                {post.author?.name}
              </Link>
              <span className="post-author-username">@{post.author?.username}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span className="post-time">{timeAgo(post.createdAt)}</span>
              {post.community && (
                <>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>•</span>
                  <Link to={`/communities/c/${post.community.slug}`}>
                    <Badge variant="accent" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                      c/{post.community.slug}
                    </Badge>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right header actions: Follow and Delete */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user && !isAuthor && <FollowButton targetUserId={post.author?._id} />}
          {user && (isAuthor || user.role === 'admin') && (
            <button onClick={handleDelete} className="btn-text btn-danger" style={{ padding: '6px' }}>
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div style={{ cursor: 'pointer' }} onClick={() => navigate(`/posts/${post._id}`)}>
        {post.title && <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', fontWeight: '600' }}>{post.title}</h3>}
        <p className="post-body">{post.content}</p>
      </div>

      {/* Post Code block */}
      {post.type === 'code' && post.codeSnippet && post.codeSnippet.code && (
        <CodeBlock code={post.codeSnippet.code} language={post.codeSnippet.language} />
      )}

      {/* Post Images Grid */}
      {post.images && post.images.length > 0 && (
        <div className="post-images">
          {post.images.map((img, index) => (
            <img
              key={index}
              src={img.url}
              className="post-image"
              alt="Post attachment"
              onClick={() => window.open(img.url, '_blank')}
              style={{ cursor: 'zoom-in' }}
            />
          ))}
        </div>
      )}

      {/* External Links */}
      {(post.githubLink || post.projectLink) && (
        <div style={{ display: 'flex', gap: '12px', margin: '14px 0', flexWrap: 'wrap' }}>
          {post.githubLink && (
            <a
              href={post.githubLink}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/></svg>
              <span>Repository</span>
            </a>
          )}
          {post.projectLink && (
            <a
              href={post.projectLink}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ExternalLink size={14} style={{ color: 'var(--bg-darker)' }} />
              <span style={{ color: 'var(--bg-darker)' }}>Live Demo</span>
            </a>
          )}
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="tag-list" style={{ marginTop: '12px', marginBottom: '14px' }}>
          {post.tags.map((tag, i) => (
            <Link key={i} to={`/search?q=${encodeURIComponent(tag)}`} className="tag">
              {tag}
            </Link>
          ))}
        </div>
      )}

      {/* Post Actions Footer */}
      <div className="post-actions">
        <button
          onClick={handleLike}
          className={`post-action-btn ${isLiked ? 'active' : ''}`}
        >
          <ThumbsUp size={16} style={{ fill: isLiked ? 'currentColor' : 'transparent' }} />
          <span>{post.likes?.length || 0}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="post-action-btn"
        >
          <MessageSquare size={16} />
          <span>{post.commentCount || 0}</span>
        </button>

        <button
          onClick={handleBookmark}
          className={`post-action-btn ${isBookmarked ? 'active' : ''}`}
        >
          <Bookmark size={16} style={{ fill: isBookmarked ? 'currentColor' : 'transparent' }} />
          <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
        </button>
      </div>

      {/* Dynamic Comment Section */}
      {showComments && (
        <div className="comment-section">
          <CommentSection
            postId={post._id}
            onCommentAdded={() => {
              setPost((prev) => ({
                ...prev,
                commentCount: (prev.commentCount || 0) + 1,
              }));
            }}
            onCommentDeleted={() => {
              setPost((prev) => ({
                ...prev,
                commentCount: Math.max(0, (prev.commentCount || 1) - 1),
              }));
            }}
          />
        </div>
      )}
    </div>
  );
}
