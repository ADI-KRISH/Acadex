import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiGetAdminClasses } from '../services/api';
import './Sidebar.css';

export default function Sidebar({ activeClass, onClassChange }) {
  const { user, logout, unreadCount } = useAuth();
  const [classes, setClasses] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'admin') {
      apiGetAdminClasses().then(res => setClasses(res.data?.classGroups || []));
    }
  }, [user]);

  const NAV = [
    { path: '/',              icon: '💬', label: 'Forum' },
    { path: '/chat',          icon: '🗨️', label: 'Group Chat' },
    { path: '/reminders',     icon: '📌', label: 'Reminders' },
    { path: '/notifications', icon: '🔔', label: 'Notifications', badge: unreadCount > 0 ? unreadCount : null },
    { path: '/settings',      icon: '⚙️', label: 'Appearance' },
  ];

  if (user?.role === 'admin') {
    NAV.push({ path: '/admin', icon: '🛡️', label: 'Admin Panel' });
  }

  if (user?.role === 'cr') {
    NAV.push({ path: '/manage-class', icon: '👥', label: 'Manage Class' });
  }

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  // Derive the user's class from backend data
  const userClass = user?.academic?.class || user?.classGroup?.name;

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-name">Kerala Connect</div>
        <div className="logo-sub">Amrita · AIE23</div>
      </div>

      {/* Admin Context Switcher */}
      {user?.role === 'admin' && (
        <div className="admin-context" style={{ padding: '0 16px', marginBottom: 24 }}>
          <div className="nav-label" style={{ marginBottom: 8 }}>Viewing Class</div>
          <div className="class-list">
            <button 
              className={`class-item ${activeClass === 'all' ? 'active' : ''}`}
              onClick={() => onClassChange('all')}
            >
              <span className="dot" /> All Classes
            </button>
            {classes.map(c => (
              <button 
                key={c._id}
                className={`class-item ${activeClass === c.name ? 'active' : ''}`}
                onClick={() => onClassChange(c.name)}
              >
                <span className="dot" /> {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

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

      </nav>

      {/* User Card */}
      <div className="sidebar-bottom">
        <div className="user-card" onClick={() => navigate('/profile')}>
          <div className="avatar" style={{ width: 32, height: 32 }}>
            {user?.initials || 'U'}
          </div>
          <div>
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-role">
              {user?.role === 'admin' ? 'System Admin' : user?.role === 'cr' ? 'Class Rep' : user?.role === 'faculty' ? 'Faculty' : 'Student'} 
              {user?.rollNo ? ` · ${user.rollNo.slice(-5)}` : ''}
            </div>
          </div>
        </div>
        <button className="nav-item" onClick={logout} style={{ color: 'var(--red)', marginTop: 4 }}>
          <span className="nav-icon">🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}
