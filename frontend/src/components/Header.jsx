import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { api } from '../services/api';

export default function Header() {
  const { user, logout } = useAuth();
  const { unreadCount, setUnreadCount } = useSocket();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notificationsList, setNotificationsList] = useState([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotificationsList(res.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotifClick = () => {
    setShowNotifDropdown(!showNotifDropdown);
    if (!showNotifDropdown) {
      fetchNotifications();
      // Mark as read
      if (unreadCount > 0) {
        api.markNotificationsRead()
          .then(() => setUnreadCount(0))
          .catch(console.error);
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="header">
      {/* Brand Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-cyan) 100%)',
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--bg-darker)',
          fontWeight: 'bold',
          fontSize: '1.25rem',
          boxShadow: '0 0 10px var(--accent-glow)'
        }}>
          D
        </div>
        <span style={{
          fontWeight: '700',
          fontSize: '1.4rem',
          letterSpacing: '-0.03em',
          background: 'linear-gradient(135deg, var(--text-white) 30%, var(--accent-cyan) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          DevConnect
        </span>
      </Link>

      {/* Global Search Bar */}
      {user && (
        <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 20px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search posts, developers, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              paddingLeft: '38px',
              paddingRight: '16px',
              height: '38px',
              fontSize: '0.85rem',
              width: '100%',
              borderRadius: '20px'
            }}
          />
        </form>
      )}

      {/* User Actions */}
      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Notifications Dropdown Trigger */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              onClick={handleNotifClick}
              className="btn-text"
              style={{ padding: '6px', color: showNotifDropdown ? 'var(--accent-cyan)' : 'var(--text-sub)' }}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  background: 'var(--error)',
                  color: 'white',
                  borderRadius: '50%',
                  fontSize: '0.65rem',
                  padding: '1px 5px',
                  fontWeight: '700'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="glass-card" style={{
                position: 'absolute',
                right: '0',
                top: '40px',
                width: '320px',
                maxHeight: '400px',
                overflowY: 'auto',
                padding: '12px',
                borderRadius: '8px',
                zIndex: '200',
                textAlign: 'left'
              }}>
                <div style={{ fontWeight: '600', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '8px', color: 'var(--text-white)' }}>
                  Notifications
                </div>
                {notificationsList.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '12px 0', textAlign: 'center' }}>
                    No notifications yet
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {notificationsList.slice(0, 10).map((notif) => (
                      <div key={notif._id} style={{ display: 'flex', gap: '10px', fontSize: '0.8rem', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <img
                          src={notif.sender?.avatar?.url || '/placeholder.png'}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://api.dicebear.com/7.x/bottts/svg?seed=' + notif.sender?.username;
                          }}
                          style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <span style={{ fontWeight: '600', color: 'var(--text-white)' }}>{notif.sender?.name}</span>{' '}
                          <span style={{ color: 'var(--text-sub)' }}>{notif.message}</span>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '2px' }}>
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile Dropdown Menu */}
          <div ref={profileRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{ background: 'transparent', padding: '0', display: 'flex', alignItems: 'center' }}
            >
              <img
                src={user.avatar?.url || '/placeholder.png'}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://api.dicebear.com/7.x/bottts/svg?seed=' + user.username;
                }}
                className="avatar"
                style={{ width: '34px', height: '34px' }}
              />
            </button>

            {showProfileMenu && (
              <div className="glass-card" style={{
                position: 'absolute',
                right: '0',
                top: '44px',
                width: '180px',
                padding: '8px',
                borderRadius: '8px',
                zIndex: '200',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <Link
                  to={`/profile/${user.username}`}
                  onClick={() => setShowProfileMenu(false)}
                  className="nav-link"
                  style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                >
                  <UserIcon size={16} />
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="nav-link"
                  style={{
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    textAlign: 'left',
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--error)'
                  }}
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>Login</Link>
          <Link to="/register" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>Register</Link>
        </div>
      )}
    </header>
  );
}
