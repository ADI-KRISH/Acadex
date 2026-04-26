import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { postsAPI, notificationsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  BookOpen,
  MessageSquare,
  Users,
  Bell,
  Search,
  Filter,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  LogOut,
  Settings,
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch posts
      const postsResponse = await postsAPI.getPosts({
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      // Fetch notifications
      const notificationsResponse = await notificationsAPI.getNotifications({
        limit: 5
      });
      
      const unreadResponse = await notificationsAPI.getUnreadCount();
      
      setPosts(postsResponse.data.posts);
      setNotifications(notificationsResponse.data.notifications);
      setUnreadCount(unreadResponse.data.unreadCount);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await postsAPI.searchPosts({
        q: searchTerm,
        limit: 10
      });
      setPosts(response.data.posts);
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const handleFilter = async (category) => {
    setFilterCategory(category);
    try {
      const params = { limit: 10 };
      if (category !== 'all') {
        params.category = category;
      }
      
      const response = await postsAPI.getPosts(params);
      setPosts(response.data.posts);
    } catch (error) {
      toast.error('Filter failed');
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Mark notification error:', error);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'question':
        return <AlertCircle className="h-4 w-4 text-warning-600" />;
      case 'announcement':
        return <Bell className="h-4 w-4 text-primary-600" />;
      case 'discussion':
        return <MessageSquare className="h-4 w-4 text-secondary-600" />;
      case 'assignment':
        return <CheckCircle className="h-4 w-4 text-success-600" />;
      case 'exam':
        return <Clock className="h-4 w-4 text-error-600" />;
      default:
        return <BookOpen className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-primary-600" />
              </div>
              <h1 className="ml-3 text-2xl font-bold text-gray-900">Kerala Connect</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search posts..."
                  className="input pl-10 pr-4 py-2 w-64"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
              </form>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-900"
                >
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-error-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                              !notification.isRead ? 'bg-primary-50' : ''
                            }`}
                            onClick={() => markNotificationAsRead(notification._id)}
                          >
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(notification.createdAt)}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.profile?.firstName} {user?.profile?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.profile?.firstName?.[0]}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.profile?.firstName}! 👋
          </h2>
          <p className="mt-2 text-gray-600">
            Stay updated with the latest discussions in {user?.academic?.class}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {user?.stats?.questionsAsked || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-success-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Answers Given</p>
                <p className="text-2xl font-bold text-gray-900">
                  {user?.stats?.answersGiven || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-warning-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Helpful Votes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {user?.stats?.helpfulVotes || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-error-100 rounded-lg">
                <Bell className="h-6 w-6 text-error-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => handleFilter('all')}
              className={`btn-sm ${
                filterCategory === 'all' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleFilter('question')}
              className={`btn-sm ${
                filterCategory === 'question' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              Questions
            </button>
            <button
              onClick={() => handleFilter('announcement')}
              className={`btn-sm ${
                filterCategory === 'announcement' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              Announcements
            </button>
            <button
              onClick={() => handleFilter('discussion')}
              className={`btn-sm ${
                filterCategory === 'discussion' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              Discussions
            </button>
          </div>

          <Link to="/posts/create" className="btn-primary btn-md">
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Link>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-4">
                Be the first to start a discussion in your class!
              </p>
              <Link to="/posts/create" className="btn-primary btn-md">
                Create First Post
              </Link>
            </div>
          ) : (
            posts.map((post) => (
              <Link
                key={post._id}
                to={`/posts/${post._id}`}
                className="block bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getCategoryIcon(post.category)}
                      <span className="text-xs font-medium text-gray-500 uppercase">
                        {post.category}
                      </span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">
                        {post.class} • {post.stream}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {post.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <div className="h-6 w-6 bg-primary-100 rounded-full flex items-center justify-center mr-2">
                            <span className="text-xs font-medium text-primary-600">
                              {post.author?.profile?.firstName?.[0]}
                            </span>
                          </div>
                          <span>
                            {post.author?.profile?.firstName} {post.author?.profile?.lastName}
                          </span>
                        </div>
                        <span>•</span>
                        <span>{formatDate(post.createdAt)}</span>
                        <span>•</span>
                        <span>{post.views} views</span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center text-gray-500">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {post.answerCount}
                        </div>
                        <div className="flex items-center text-gray-500">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          {post.voteScore || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {post.isAnswered && (
                    <div className="ml-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Answered
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
