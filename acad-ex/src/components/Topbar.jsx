import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import './Topbar.css';

export default function Topbar({ title, onSearch, onAskQuestion, showSearch = true }) {
  const { settings, toggleMode } = useTheme();
  const { unreadCount }          = useAuth();
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');

  const handleSearch = (e) => {
    setSearchVal(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <div className="topbar">
      <div className="topbar-title">{title}</div>

      {showSearch && (
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text" placeholder="Search questions…"
            value={searchVal} onChange={handleSearch}
          />
        </div>
      )}

      {onAskQuestion && (
        <button className="btn btn-primary" onClick={onAskQuestion}>+ Ask Question</button>
      )}

      <button className="icon-btn" onClick={() => navigate('/notifications')} title="Notifications" style={{ position: 'relative' }}>
        🔔
        {unreadCount > 0 && (
          <span className="badge" style={{ position: 'absolute', top: -4, right: -4, fontSize: 10, minWidth: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {unreadCount}
          </span>
        )}
      </button>
      <button className="icon-btn" onClick={toggleMode} title="Toggle theme">
        {settings.mode === 'light' ? '🌞' : '🌙'}
      </button>
    </div>
  );
}
