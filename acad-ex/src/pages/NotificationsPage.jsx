import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import { apiGetNotifications, apiMarkAllRead } from '../services/api';
import './NotificationsPage.css';

const TYPE_ICON = { answer: '💬', reminder: '📌', vote: '▲', general: '🔔' };

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetNotifications().then(data => {
      setNotifications(data);
      setLoading(false);
    });
  }, []);

  const markAllRead = async () => {
    await apiMarkAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unread = notifications.filter(n => !n.read).length;

  return (
    <>
      <Topbar title="Notifications" showSearch={false} />
      <div className="page-content" style={{ maxWidth: 640 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:600 }}>
            Notifications {unread > 0 && <span className="badge">{unread}</span>}
          </h2>
          {unread > 0 && (
            <button className="btn btn-ghost" style={{ fontSize:12 }} onClick={markAllRead}>
              ✓ Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="empty-state"><div className="empty-icon">⏳</div></div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <div className="empty-title">All caught up!</div>
            <p style={{ color:'var(--muted)', fontSize:13 }}>No new notifications.</p>
          </div>
        ) : (
          <div className="notif-list">
            {notifications.map(n => (
              <div 
                key={n.id} 
                className={`notif-item ${n.read ? '' : 'unread'} ${n.link ? 'clickable' : ''}`}
                onClick={() => { if (n.link) navigate(n.link); }}
              >
                <div className="notif-icon">{TYPE_ICON[n.type] || '🔔'}</div>
                <div className="notif-body">
                  <div className="notif-text">{n.text}</div>
                  <div className="notif-time">{n.time}</div>
                </div>
                {!n.read && <div className="unread-dot" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
