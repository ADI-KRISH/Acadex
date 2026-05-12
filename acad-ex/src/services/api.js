import axios from 'axios';
import { io } from 'socket.io-client';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = BASE_URL.replace('/api', '');

// ── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res.data,
  (error) => {
    // Only redirect to login if it's a 401 and NOT from the login endpoint itself
    if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// ── Socket.io ─────────────────────────────────────────────────────────────────
export const socket = io(SOCKET_URL, { autoConnect: false });

// ── Auth ──────────────────────────────────────────────────────────────────────
export const apiLogin = (email, password) =>
  api.post('/auth/login', { email, password });

export const apiRegister = (payload) =>
  api.post('/auth/register', payload);

export const apiGetMe = () =>
  api.get('/auth/me');

export const apiLogout = () =>
  api.post('/auth/logout');

// ── Class Groups ──────────────────────────────────────────────────────────────
export const apiGetPublicClassGroups = () =>
  api.get('/classgroups/public');

// ── Posts (Questions) ─────────────────────────────────────────────────────────
export const apiGetQuestions = (params = {}) =>
  api.get('/posts', { params });

export const apiGetThread = (id) =>
  Promise.all([
    api.get(`/posts/${id}`),
    api.get(`/comments/post/${id}`),
  ]).then(([postRes, commentsRes]) => ({
    question: postRes.data.post,
    answers: commentsRes.data.comments || [],
  }));

export const apiPostQuestion = (payload) =>
  api.post('/posts', payload);

export const apiVoteQuestion = (id, dir) =>
  api.post(`/posts/${id}/vote`, { voteType: dir > 0 ? 'upvote' : 'downvote' });

export const apiPinPost = (id) =>
  api.post(`/posts/${id}/pin`);

export const apiDeletePost = (id) =>
  api.delete(`/posts/${id}`);

export const apiSearchPosts = (q) =>
  api.get('/posts/search', { params: { q } });

// ── Comments (Answers) ────────────────────────────────────────────────────────
export const apiPostAnswer = (questionId, content) =>
  api.post('/comments', { content, post: questionId });

export const apiVoteAnswer = (id, dir) =>
  api.post(`/comments/${id}/vote`, { voteType: dir > 0 ? 'upvote' : 'downvote' });

export const apiAcceptAnswer = (commentId, questionId) =>
  api.post(`/posts/${questionId}/best-answer`, { commentId });

export const apiDeleteComment = (id) =>
  api.delete(`/comments/${id}`);

// ── Reminders ─────────────────────────────────────────────────────────────────
export const apiGetReminders = (params = {}) =>
  api.get('/reminders', { params });

export const apiPostReminder = (payload) =>
  api.post('/reminders', payload);

export const apiDeleteReminder = (id) =>
  api.delete(`/reminders/${id}`);

// ── Chat ──────────────────────────────────────────────────────────────────────
export const apiGetChatRooms = () =>
  api.get('/chat/rooms');

export const apiGetMessages = (roomId) =>
  api.get(`/chat/rooms/${roomId}/messages`);

export const apiCreateChatRoom = (name, classGroupId) =>
  api.post('/chat/rooms', { name, classGroupId });

// ── Notifications ─────────────────────────────────────────────────────────────
export const apiGetNotifications = (params = {}) =>
  api.get('/notifications', { params });

export const apiGetUnreadCount = () =>
  api.get('/notifications/unread-count');

export const apiMarkNotifRead = (id) =>
  api.put(`/notifications/${id}/read`);

export const apiMarkAllRead = () =>
  api.put('/notifications/mark-all-read');

export const apiDeleteNotification = (id) =>
  api.delete(`/notifications/${id}`);

// ── Admin ─────────────────────────────────────────────────────────────────────
export const apiGetAdminHealth = () =>
  api.get('/admin/health');

export const apiGetAdminUsers = () =>
  api.get('/admin/users');

export const apiUpdateUserRole = (id, role) =>
  api.put(`/admin/users/${id}/role`, { role });

export const apiDeleteUser = (id) =>
  api.delete(`/admin/users/${id}`);

export const apiGetAdminClasses = () =>
  api.get('/classgroups?isActive=all');

// ── Class Management ──────────────────────────────────────────────────────────
export const apiGetClassGroup = (id) =>
  api.get(`/classgroups/${id}`);

export const apiAddClassMember = (classId, userId) =>
  api.post(`/classgroups/${classId}/members`, { userId });

export const apiRemoveClassMember = (classId, userId) =>
  api.delete(`/classgroups/${classId}/members/${userId}`);

// ── Users ─────────────────────────────────────────────────────────────────────
export const apiGetProfile = (id) =>
  api.get(`/users/${id}`);

export const apiUpdateProfile = (payload) =>
  api.put('/users/profile', payload);

// ── Support / Complaints ──────────────────────────────────────────────────────
export const apiPostComplaint = (data) => api.post('/complaints', data);
export const apiGetComplaints = (params) => api.get('/complaints', { params });
export const apiResolveComplaint = (id, data) => api.put(`/complaints/${id}/resolve`, data);

export default api;
