import { Link } from 'react-router-dom';
import Avatar from './ui/Avatar';
import Badge from './ui/Badge';
import FollowButton from './FollowButton';

export default function UserCard({ user }) {
  return (
    <div className="glass-card fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '16px', textAlign: 'left' }}>
      <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: 0 }}>
        <Link to={`/profile/${user.username}`}>
          <Avatar src={user.avatar?.url} username={user.username} />
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to={`/profile/${user.username}`} style={{ fontWeight: '600', color: 'var(--text-white)' }}>
              {user.name}
            </Link>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{user.username}</span>
          </div>
          
          {user.bio && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', margin: '4px 0', display: '-webkit-box', WebkitLineClamp: '1', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {user.bio}
            </p>
          )}

          {user.skills && user.skills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
              {user.skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} style={{ fontSize: '0.6rem', padding: '1px 5px' }}>
                  {skill}
                </Badge>
              ))}
              {user.skills.length > 3 && (
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>+{user.skills.length - 3} more</span>
              )}
            </div>
          )}
        </div>
      </div>

      <FollowButton targetUserId={user._id} />
    </div>
  );
}
