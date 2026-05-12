import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import { apiGetNotifications, apiMarkAllRead, apiMarkNotifRead } from '../services/api';
import './NotificationsPage.css';

const TYPE_ICON = { answer: '💬', reminder: '📌', vote: '▲', general: '🔔', announcement: '📢', deadline: '⏰', comment_reply: '↩️' };

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetNotifications()
      .then(res => {
        setNotifications(res.data?.notifications || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await apiMarkAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleClick = async (n) => {
    // Mark as read
    if (!n.isRead) {
      await apiMarkNotifRead(n._id).catch(() => {});
      setNotifications(prev => prev.map(x => x._id === n._id ? { ...x, isRead: true } : x));
    }
    // Navigate if there's a related post
    if (n.relatedPost?._id || n.relatedPost) {
      const postId = n.relatedPost?._id || n.relatedPost;
      navigate(`/question/${postId}`);
    }
  };

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <Topbar title="Notifications" showSearch={false} />
      <div className="page-content" style={{ maxWidth: 640 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600 }}>
            Notifications {unread > 0 && <span className="badge">{unread}</span>}
          </h2>
          {unread > 0 && (
            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={markAllRead}>
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
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>No new notifications.</p>
          </div>
        ) : (
          <div className="notif-list">
            {notifications.map(n => (
              <div
                key={n._id}
                className={`notif-item ${n.isRead ? '' : 'unread'} ${(n.relatedPost) ? 'clickable' : ''}`}
                onClick={() => handleClick(n)}
              >
                <div className="notif-icon">{TYPE_ICON[n.type] || '🔔'}</div>
                <div className="notif-body">
                  <div className="notif-text" style={{ fontWeight: n.isRead ? 400 : 500 }}>{n.title || n.message}</div>
                  {n.message && n.title && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{n.message}</div>}
                  <div className="notif-time">{new Date(n.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                </div>
                {!n.isRead && <div className="unread-dot" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
