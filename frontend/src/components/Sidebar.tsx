import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const NAV_USER = [
  { to: '/dashboard',    icon: '⬡', label: 'Overview' },
  { to: '/submit',       icon: '↑',  label: 'New Drop' },
  { to: '/drops',        icon: '◆',  label: 'All Drops' },
  { to: '/my-drops',     icon: '◈',  label: 'My Drops' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isMod = false; // Not needed - no review section
  const isAdmin = false; // Not needed - no admin section


  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">⬡</span>
        <div>
          <div className="logo-name">SecureDrop</div>
          <div className="logo-sub mono">v2.0.0 · encrypted</div>
        </div>
      </div>

      <div className="sidebar-section-label">Navigation</div>
      <nav className="sidebar-nav">
        {NAV_USER.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="user-avatar">{user?.email?.[0]?.toUpperCase() || '?'}</div>
          <div className="user-info">
            <div className="user-name truncate">{user?.email}</div>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Sign out</button>
      </div>
    </aside>
  );
}
