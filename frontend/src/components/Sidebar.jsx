import { NavLink } from 'react-router-dom';
import { Home, Users, Briefcase, Search, Bookmark, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import ThemeToggle from './ThemeToggle';

export default function Sidebar() {
  const { user } = useAuth();
  const { unreadCount } = useSocket();

  if (!user) return null;

  return (
    <aside className="sidebar">
      <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
        <Home size={20} />
        <span>Home</span>
      </NavLink>

      <NavLink to="/communities" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
        <Users size={20} />
        <span>Communities</span>
      </NavLink>

      <NavLink to="/jobs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
        <Briefcase size={20} />
        <span>Jobs</span>
      </NavLink>

      <NavLink to={`/profile/${user.username}/bookmarks`} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
        <Bookmark size={20} />
        <span>Bookmarks</span>
      </NavLink>

      <NavLink to="/search" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
        <Search size={20} />
        <span>Search</span>
      </NavLink>

      <div style={{ marginTop: 'auto', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <ThemeToggle />
      </div>
    </aside>
  );
}
