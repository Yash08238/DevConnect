import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Avatar from './ui/Avatar';
import Button from './ui/Button';
import timeAgo from '../utils/timeAgo';
import { Reply, Trash } from 'lucide-react';

export default function CommentSection({ postId, onCommentAdded, onCommentDeleted }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [replies, setReplies] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTarget, setReplyTarget] = useState(null); // comment ID we are replying to
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await api.getComments(postId);
      if (res.success) {
        setComments(res.data.comments || []);
        setReplies(res.data.replies || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleCreateComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setError('');
      const res = await api.createComment(postId, { content: newComment });
      if (res.success) {
        setNewComment('');
        setComments((prev) => [res.data, ...prev]);
        if (onCommentAdded) onCommentAdded();
      }
    } catch (err) {
      setError(err.message || 'Failed to post comment');
    }
  };

  const handleCreateReply = async (e, parentId) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      setError('');
      const res = await api.createComment(postId, { content: replyContent, parentId });
      if (res.success) {
        setReplyContent('');
        setReplyTarget(null);
        setReplies((prev) => [...prev, res.data]);
        if (onCommentAdded) onCommentAdded();
      }
    } catch (err) {
      setError(err.message || 'Failed to post reply');
    }
  };

  const handleDeleteComment = async (commentId, isTopLevel) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      const res = await api.deleteComment(commentId);
      if (res.success) {
        if (isTopLevel) {
          setComments((prev) =>
            prev.map((c) =>
              c._id === commentId ? { ...c, isDeleted: true, content: '[Comment deleted]' } : c
            )
          );
        } else {
          setReplies((prev) =>
            prev.map((r) =>
              r._id === commentId ? { ...r, isDeleted: true, content: '[Comment deleted]' } : r
            )
          );
        }
        if (onCommentDeleted) onCommentDeleted();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to render nested comments recursively
  const renderReplies = (parentId, currentDepth) => {
    const childComments = replies.filter((r) => r.parent === parentId);
    if (childComments.length === 0) return null;

    return (
      <div className="comment-replies" style={{ marginTop: '8px' }}>
        {childComments.map((reply) => (
          <div key={reply._id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem' }}>
              <Avatar src={reply.author?.avatar?.url} username={reply.author?.username} size="small" style={{ width: '24px', height: '24px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-white)' }}>{reply.author?.name}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>@{reply.author?.username}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>•</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{timeAgo(reply.createdAt)}</span>
                </div>
                <div style={{ color: 'var(--text-main)', marginTop: '4px', fontStyle: reply.isDeleted ? 'italic' : 'normal' }}>
                  {reply.content}
                </div>
                
                {/* Reply action tags */}
                {user && !reply.isDeleted && (
                  <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                    {currentDepth < 3 && (
                      <button
                        onClick={() => {
                          setReplyTarget(reply._id);
                          setReplyContent('');
                        }}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-sub)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                      >
                        <Reply size={12} />
                        <span>Reply</span>
                      </button>
                    )}
                    {(user._id === reply.author?._id || user.role === 'admin') && (
                      <button
                        onClick={() => handleDeleteComment(reply._id, false)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--error)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                      >
                        <Trash size={12} />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Inline reply editor for replies */}
            {replyTarget === reply._id && (
              <form
                onSubmit={(e) => handleCreateReply(e, reply._id)}
                style={{ display: 'flex', gap: '8px', marginLeft: '34px', marginTop: '6px' }}
              >
                <input
                  type="text"
                  className="form-control"
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  style={{ flex: 1, height: '32px', fontSize: '0.8rem', padding: '4px 10px' }}
                  autoFocus
                />
                <Button type="submit" variant="primary" style={{ padding: '4px 12px', height: '32px', fontSize: '0.8rem' }}>
                  Reply
                </Button>
                <button type="button" onClick={() => setReplyTarget(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}>
                  Cancel
                </button>
              </form>
            )}

            {renderReplies(reply._id, currentDepth + 1)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top level comment input */}
      {user && (
        <form onSubmit={handleCreateComment} className="comment-input-container">
          <Avatar src={user.avatar?.url} username={user.username} size="small" />
          <input
            type="text"
            className="form-control"
            placeholder="Add to the discussion..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            style={{ flex: 1, height: '36px', fontSize: '0.85rem' }}
          />
          <Button type="submit" variant="primary" style={{ padding: '0 16px', height: '36px', fontSize: '0.85rem' }}>
            Comment
          </Button>
        </form>
      )}

      {error && (
        <div style={{ color: 'var(--error)', fontSize: '0.85rem', textAlign: 'left' }}>
          {error}
        </div>
      )}

      {/* Comment List */}
      {loading ? (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading comments...</div>
      ) : comments.length === 0 ? (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '10px 0' }}>No comments yet. Start the conversation!</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {comments.map((comment) => (
            <div key={comment._id} className="comment-card">
              <div style={{ display: 'flex', gap: '10px' }}>
                <Avatar src={comment.author?.avatar?.url} username={comment.author?.username} size="small" />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-white)' }}>{comment.author?.name}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>@{comment.author?.username}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>•</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{timeAgo(comment.createdAt)}</span>
                  </div>
                  <div style={{ color: 'var(--text-main)', marginTop: '4px', fontStyle: comment.isDeleted ? 'italic' : 'normal' }}>
                    {comment.content}
                  </div>

                  {/* Reply actions */}
                  {user && !comment.isDeleted && (
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                      <button
                        onClick={() => {
                          setReplyTarget(comment._id);
                          setReplyContent('');
                        }}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-sub)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                      >
                        <Reply size={12} />
                        <span>Reply</span>
                      </button>
                      {(user._id === comment.author?._id || user.role === 'admin') && (
                        <button
                          onClick={() => handleDeleteComment(comment._id, true)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--error)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                        >
                          <Trash size={12} />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Inline reply editor */}
              {replyTarget === comment._id && (
                <form
                  onSubmit={(e) => handleCreateReply(e, comment._id)}
                  style={{ display: 'flex', gap: '8px', marginLeft: '50px', marginTop: '8px' }}
                >
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    style={{ flex: 1, height: '32px', fontSize: '0.8rem', padding: '4px 10px' }}
                    autoFocus
                  />
                  <Button type="submit" variant="primary" style={{ padding: '4px 12px', height: '32px', fontSize: '0.8rem' }}>
                    Reply
                  </Button>
                  <button type="button" onClick={() => setReplyTarget(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </form>
              )}

              {/* Render Nested Replies */}
              {renderReplies(comment._id, 1)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
