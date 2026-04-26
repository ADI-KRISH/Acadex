import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  refreshToken: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
};

// Posts API
export const postsAPI = {
  getPosts: (params = {}) => api.get('/posts', { params }),
  getPost: (id) => api.get(`/posts/${id}`),
  createPost: (postData) => api.post('/posts', postData),
  updatePost: (id, postData) => api.put(`/posts/${id}`, postData),
  deletePost: (id) => api.delete(`/posts/${id}`),
  votePost: (id, voteType) => api.post(`/posts/${id}/vote`, { voteType }),
  markBestAnswer: (id, commentId) => api.post(`/posts/${id}/best-answer`, { commentId }),
  searchPosts: (params) => api.get('/posts/search', { params }),
};

// Comments API
export const commentsAPI = {
  getCommentsByPost: (postId, params = {}) => api.get(`/comments/post/${postId}`, { params }),
  getComment: (id) => api.get(`/comments/${id}`),
  createComment: (commentData) => api.post('/comments', commentData),
  updateComment: (id, commentData) => api.put(`/comments/${id}`, commentData),
  deleteComment: (id) => api.delete(`/comments/${id}`),
  voteComment: (id, voteType) => api.post(`/comments/${id}/vote`, { voteType }),
  markHelpful: (id) => api.post(`/comments/${id}/helpful`),
};

// Users API
export const usersAPI = {
  getUsers: (params = {}) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  getUsersByClass: (className, params = {}) => api.get(`/users/class/${className}`, { params }),
  updateUserRole: (id, roleData) => api.put(`/users/${id}/role`, roleData),
  updateUserStatus: (id, statusData) => api.put(`/users/${id}/status`, statusData),
  getLeaderboard: (params = {}) => api.get('/users/stats/leaderboard', { params }),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (params = {}) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  sendDeadlineNotification: (notificationData) => api.post('/notifications/send-deadline', notificationData),
  sendAnnouncement: (announcementData) => api.post('/notifications/send-announcement', announcementData),
  getStats: () => api.get('/notifications/stats'),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
