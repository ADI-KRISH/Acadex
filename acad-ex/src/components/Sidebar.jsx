import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CLASS_MAP } from '../services/mockData';
import './Sidebar.css';

const NAV = [
  { path: '/',              icon: '💬', label: 'Forum' },
  { path: '/chat',          icon: '🗨️', label: 'Group Chat', badge: 3 },
  { path: '/reminders',     icon: '📌', label: 'Reminders' },
  { path: '/notifications', icon: '🔔', label: 'Notifications', badge: 2 },
  { path: '/settings',      icon: '⚙️', label: 'Appearance' },
];

export default function Sidebar({ activeClass, onClassChange }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-name">AcadEx</div>
        <div className="logo-sub">Amrita · AIE23</div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="nav-label">Menu</div>
        {NAV.map(item => (
          <button
            key={item.path}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && <span className="badge" style={{ marginLeft: 'auto' }}>{item.badge}</span>}
          </button>
        ))}

        {/* Classes */}
        <div className="nav-label" style={{ marginTop: 12 }}>Classes</div>
      </nav>

      <div className="class-list">
        <div
          className={`class-tag ${activeClass === 'all' ? 'active' : ''}`}
          onClick={() => onClassChange?.('all')}
        >
          <div className="class-dot" style={{ background: 'var(--accent)' }} />
          All Classes
        </div>
        {Object.entries(CLASS_MAP).map(([key, { label, color }]) => (
          <div
            key={key}
            className={`class-tag ${activeClass === key ? 'active' : ''}`}
            onClick={() => onClassChange?.(key)}
          >
            <div className="class-dot" style={{ background: color }} />
            {label}
          </div>
        ))}
      </div>

      {/* User Card */}
      <div className="sidebar-bottom">
        <div className="user-card" onClick={() => navigate('/profile')}>
          <div className="avatar" style={{ width: 32, height: 32 }}>
            {user?.initials || 'U'}
          </div>
          <div>
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-role">{user?.role === 'cr' ? 'Class Rep' : 'Student'} · {user?.rollNo?.slice(-5) || ''}</div>
          </div>
        </div>
        <button className="nav-item" onClick={logout} style={{ color: 'var(--red)', marginTop: 4 }}>
          <span className="nav-icon">🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}
