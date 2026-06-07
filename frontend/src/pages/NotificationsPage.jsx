import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Spinner from '../components/ui/Spinner';
import Avatar from '../components/ui/Avatar';
import timeAgo from '../utils/timeAgo';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAllNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllNotifications();
    api.markNotificationsRead().catch(console.error);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
      <div>
        <h2 style={{ margin: 0 }}>All Notifications</h2>
        <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginTop: '4px' }}>Keep track of interactions on your posts and profile</p>
      </div>

      {loading ? (
        <Spinner size="large" />
      ) : notifications.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-sub)' }}>
          <Bell size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <h3>No notifications yet</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>We'll notify you when someone likes your builds or comments.</p>
        </div>
      ) : (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => notif.post && navigate(`/posts/${notif.post._id || notif.post}`)}
              style={{
                display: 'flex',
                gap: '14px',
                padding: '16px',
                borderBottom: '1px solid var(--border-color)',
                cursor: notif.post ? 'pointer' : 'default',
                alignItems: 'center',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => { if (notif.post) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
              onMouseLeave={(e) => { if (notif.post) e.currentTarget.style.background = 'transparent'; }}
            >
              <Avatar src={notif.sender?.avatar?.url} username={notif.sender?.username} />
              <div style={{ flex: 1 }}>
                <div>
                  <span style={{ fontWeight: '600', color: 'var(--text-white)' }}>{notif.sender?.name}</span>{' '}
                  <span style={{ color: 'var(--text-sub)' }}>{notif.message}</span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>
                  {timeAgo(notif.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
