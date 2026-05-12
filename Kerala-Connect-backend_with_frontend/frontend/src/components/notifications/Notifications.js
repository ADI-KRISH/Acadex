import React, { useState, useEffect } from 'react';
import { notificationsAPI, complaintsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Bell, CheckCircle, MessageSquare, ThumbsUp, Clock, AlertCircle, Megaphone, Check, Trash2, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user, fetchUnreadCount } = useAuth();

  useEffect(() => { fetchNotifications(); }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = { limit: 50 };
      if (filter === 'unread') params.isRead = false;
      if (filter === 'read') params.isRead = true;
      const response = await notificationsAPI.getNotifications(params);
      setNotifications(response.data.notifications);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      // Update global navbar badge
      await fetchUnreadCount();
    } catch (error) { toast.error('Failed to mark as read'); }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      // Update global navbar badge
      await fetchUnreadCount();
      toast.success('All notifications marked as read');
    } catch (error) { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    try {
      await notificationsAPI.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) { toast.error('Failed to delete'); }
  };

  const getIcon = (type) => {
    const map = {
      answer: <MessageSquare className="h-5 w-5 text-blue-600" />,
      comment_reply: <MessageSquare className="h-5 w-5 text-purple-600" />,
      vote: <ThumbsUp className="h-5 w-5 text-green-600" />,
      deadline: <Clock className="h-5 w-5 text-red-600" />,
      announcement: <Megaphone className="h-5 w-5 text-orange-600" />,
      moderation: <AlertCircle className="h-5 w-5 text-yellow-600" />,
    };
    return map[type] || <Bell className="h-5 w-5 text-gray-600" />;
  };

  const formatDate = (dateString) => {
    const diff = Date.now() - new Date(dateString);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);
    if (days > 7) return new Date(dateString).toLocaleDateString();
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;



  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && <p className="text-sm text-gray-600 mt-1">{unreadCount} unread</p>}
          </div>
          <div className="flex space-x-3">
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead} className="btn-secondary btn-sm">
                <Check className="h-4 w-4 mr-1" />Mark all read
              </button>
            )}
          </div>
        </div>

        <div className="flex space-x-2 mb-6">
          {['all', 'unread', 'read'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`btn-sm capitalize ${filter === f ? 'btn-primary' : 'btn-secondary'}`}>{f}</button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(notification => (
              <div key={notification._id}
                className={`bg-white rounded-lg border p-4 ${!notification.isRead ? 'border-primary-200 bg-primary-50' : 'border-gray-200'}`}>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-2">{formatDate(notification.createdAt)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!notification.isRead && (
                      <button onClick={() => handleMarkAsRead(notification._id)}
                        className="p-1 text-gray-400 hover:text-green-600" title="Mark as read">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(notification._id)}
                      className="p-1 text-gray-400 hover:text-red-600" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}


      </main>
    </div>
  );
};

export default Notifications;
