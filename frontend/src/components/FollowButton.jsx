import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UserPlus, UserMinus } from 'lucide-react';

export default function FollowButton({ targetUserId, style }) {
  const { user, setUser } = useAuth();

  if (!user || user._id === targetUserId) return null;

  const isFollowing = user.following?.includes(targetUserId);

  const handleFollowToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (isFollowing) {
        const res = await api.unfollowUser(targetUserId);
        if (res.success) {
          setUser((prev) => ({
            ...prev,
            following: prev.following.filter((id) => id !== targetUserId),
          }));
        }
      } else {
        const res = await api.followUser(targetUserId);
        if (res.success) {
          setUser((prev) => ({
            ...prev,
            following: [...prev.following, targetUserId],
          }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button
      onClick={handleFollowToggle}
      className="btn btn-secondary"
      style={{
        padding: '6px 12px',
        fontSize: '0.8rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        borderColor: isFollowing ? 'var(--border-color)' : 'rgba(0, 242, 254, 0.3)',
        ...style
      }}
    >
      {isFollowing ? (
        <>
          <UserMinus size={13} />
          <span>Unfollow</span>
        </>
      ) : (
        <>
          <UserPlus size={13} style={{ color: 'var(--accent-cyan)' }} />
          <span style={{ color: 'var(--text-white)' }}>Follow</span>
        </>
      )}
    </button>
  );
}
