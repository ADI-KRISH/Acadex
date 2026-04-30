import axios from 'axios';
import {
  MOCK_QUESTIONS, MOCK_ANSWERS, MOCK_REMINDERS,
  MOCK_MESSAGES, MOCK_NOTIFICATIONS, MOCK_USER,
} from './mockData';

const BASE = import.meta.env.VITE_API_URL;
const USE_MOCK = !BASE;

const http = axios.create({ baseURL: BASE });

// Attach JWT to every request
http.interceptors.request.use(cfg => {
  const token = localStorage.getItem('acad_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ── Auth ──────────────────────────────────────────────────────────────────────
export const apiLogin = async (email, password) => {
  if (USE_MOCK) {
    await delay(400);
    return { user: { ...MOCK_USER, email }, token: 'mock-jwt-' + Date.now() };
  }
  const { data } = await http.post('/auth/login', { email, password });
  return data;
};

export const apiRegister = async (payload) => {
  if (USE_MOCK) {
    await delay(400);
    return { user: { ...MOCK_USER, ...payload }, token: 'mock-jwt-' + Date.now() };
  }
  const { data } = await http.post('/auth/register', payload);
  return data;
};

export const apiGetMe = async () => {
  if (USE_MOCK) return MOCK_USER;
  const { data } = await http.get('/users/me');
  return data;
};

// ── Questions ─────────────────────────────────────────────────────────────────
export const apiGetQuestions = async (filters = {}) => {
  if (USE_MOCK) {
    await delay(200);
    let list = [...MOCK_QUESTIONS];
    if (filters.classId && filters.classId !== 'all')
      list = list.filter(q => q.classId === filters.classId);
    if (filters.tag && filters.tag !== 'all')
      list = list.filter(q => q.tags.includes(filters.tag));
    if (filters.tab === 'unanswered') list = list.filter(q => q.answers === 0);
    if (filters.tab === 'mine') list = list.filter(q => q.mine);
    if (filters.search)
      list = list.filter(q =>
        q.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        q.tags.some(t => t.includes(filters.search.toLowerCase()))
      );
    return list;
  }
  const { data } = await http.get('/questions', { params: filters });
  return data;
};

export const apiGetThread = async (id) => {
  if (USE_MOCK) {
    await delay(200);
    const question = MOCK_QUESTIONS.find(q => q.id === id);
    const answers  = MOCK_ANSWERS[id] || [];
    return { question, answers };
  }
  const { data } = await http.get(`/questions/${id}`);
  return data;
};

export const apiPostQuestion = async (payload) => {
  if (USE_MOCK) {
    await delay(300);
    const newQ = {
      id: String(Date.now()), ...payload,
      author: MOCK_USER, answers: 0, votes: 0,
      solved: false, pinned: false, mine: true,
      createdAt: new Date().toISOString(),
    };
    MOCK_QUESTIONS.unshift(newQ);
    return newQ;
  }
  const { data } = await http.post('/questions', payload);
  return data;
};

export const apiVoteQuestion = async (id, dir) => {
  if (USE_MOCK) {
    const q = MOCK_QUESTIONS.find(x => x.id === id);
    if (q) q.votes += dir;
    return { votes: q?.votes };
  }
  const { data } = await http.post(`/questions/${id}/vote`, { dir });
  return data;
};

export const apiPinQuestion = async (id) => {
  if (USE_MOCK) {
    const q = MOCK_QUESTIONS.find(x => x.id === id);
    if (q) q.pinned = !q.pinned;
    return q;
  }
  const { data } = await http.patch(`/questions/${id}/pin`);
  return data;
};

// ── Answers ───────────────────────────────────────────────────────────────────
export const apiPostAnswer = async (questionId, body) => {
  if (USE_MOCK) {
    await delay(300);
    const newA = {
      id: 'a' + Date.now(), questionId, body,
      author: MOCK_USER, votes: 0, accepted: false,
      createdAt: new Date().toISOString(),
    };
    if (!MOCK_ANSWERS[questionId]) MOCK_ANSWERS[questionId] = [];
    MOCK_ANSWERS[questionId].push(newA);
    const q = MOCK_QUESTIONS.find(x => x.id === questionId);
    if (q) q.answers++;
    return newA;
  }
  const { data } = await http.post(`/questions/${questionId}/answers`, { body });
  return data;
};

export const apiVoteAnswer = async (id, dir) => {
  if (USE_MOCK) return { votes: 0 };
  const { data } = await http.post(`/answers/${id}/vote`, { dir });
  return data;
};

export const apiAcceptAnswer = async (answerId, questionId) => {
  if (USE_MOCK) {
    const answers = MOCK_ANSWERS[questionId] || [];
    answers.forEach(a => { a.accepted = a.id === answerId; });
    const q = MOCK_QUESTIONS.find(x => x.id === questionId);
    if (q) q.solved = true;
    return {};
  }
  const { data } = await http.patch(`/answers/${answerId}/accept`);
  return data;
};

// ── Reminders ─────────────────────────────────────────────────────────────────
export const apiGetReminders = async () => {
  if (USE_MOCK) { await delay(200); return [...MOCK_REMINDERS]; }
  const { data } = await http.get('/reminders');
  return data;
};

export const apiPostReminder = async (payload) => {
  if (USE_MOCK) {
    await delay(300);
    const newR = { id: 'r' + Date.now(), ...payload };
    MOCK_REMINDERS.unshift(newR);
    return newR;
  }
  const { data } = await http.post('/reminders', payload);
  return data;
};

export const apiDeleteReminder = async (id) => {
  if (USE_MOCK) {
    const idx = MOCK_REMINDERS.findIndex(r => r.id === id);
    if (idx !== -1) MOCK_REMINDERS.splice(idx, 1);
    return {};
  }
  await http.delete(`/reminders/${id}`);
};

// ── Chat ──────────────────────────────────────────────────────────────────────
export const apiGetMessages = async (classId) => {
  if (USE_MOCK) { await delay(150); return MOCK_MESSAGES[classId] || []; }
  const { data } = await http.get(`/chats/${classId}/messages`);
  return data;
};

export const apiSendMessage = async (classId, text) => {
  if (USE_MOCK) {
    const msg = {
      id: 'm' + Date.now(), name: MOCK_USER.name,
      initials: MOCK_USER.initials, text,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      mine: true, color: '#3ccf91',
    };
    if (!MOCK_MESSAGES[classId]) MOCK_MESSAGES[classId] = [];
    MOCK_MESSAGES[classId].push(msg);
    return msg;
  }
  const { data } = await http.post(`/chats/${classId}/messages`, { text });
  return data;
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const apiGetNotifications = async () => {
  if (USE_MOCK) { await delay(150); return [...MOCK_NOTIFICATIONS]; }
  const { data } = await http.get('/notifications');
  return data;
};

export const apiMarkAllRead = async () => {
  if (USE_MOCK) {
    MOCK_NOTIFICATIONS.forEach(n => { n.read = true; });
    return {};
  }
  await http.post('/notifications/read-all');
};

// ── Utility ───────────────────────────────────────────────────────────────────
const delay = (ms) => new Promise(r => setTimeout(r, ms));
