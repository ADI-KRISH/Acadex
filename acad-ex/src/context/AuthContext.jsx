import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { apiGetMe, apiLogin, apiRegister, apiLogout, apiGetUnreadCount } from '../services/api';

// ── Helpers ───────────────────────────────────────────────────────────────────
const buildUser = (raw) => {
  if (!raw) return null;
  const firstName = raw.profile?.firstName || '';
  const lastName  = raw.profile?.lastName  || '';
  return {
    ...raw,
    name:     `${firstName} ${lastName}`.trim() || raw.username,
    initials: `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || raw.username?.[0]?.toUpperCase() || 'U',
    isCR:     raw.role === 'cr',
    rollNo:   raw.username || '',
  };
};

// ── State & Reducer ───────────────────────────────────────────────────────────
const init = {
  user:            null,
  token:           localStorage.getItem('token'),
  isAuthenticated: false,
  loading:         true,
  error:           null,
  unreadCount:     0,
};

const ACTIONS = {
  START:       'START',
  SUCCESS:     'SUCCESS',
  FAILURE:     'FAILURE',
  LOGOUT:      'LOGOUT',
  CLEAR_ERR:   'CLEAR_ERR',
  SET_UNREAD:  'SET_UNREAD',
};

const reducer = (state, { type, payload }) => {
  switch (type) {
    case ACTIONS.START:
      return { ...state, loading: true, error: null };
    case ACTIONS.SUCCESS:
      return { ...state, loading: false, error: null,
        user: buildUser(payload.user), token: payload.token,
        isAuthenticated: !!payload.user };
    case ACTIONS.FAILURE:
      return { ...state, loading: false, error: payload,
        user: null, token: null, isAuthenticated: false };
    case ACTIONS.LOGOUT:
      return { ...init, token: null, loading: false };
    case ACTIONS.CLEAR_ERR:
      return { ...state, error: null };
    case ACTIONS.SET_UNREAD:
      return { ...state, unreadCount: payload };
    default:
      return state;
  }
};

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, init);

  // On boot — verify stored token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      dispatch({ type: ACTIONS.SUCCESS, payload: { user: null, token: null } });
      return;
    }
    dispatch({ type: ACTIONS.START });
    apiGetMe()
      .then((res) => {
        dispatch({ type: ACTIONS.SUCCESS,
          payload: { user: res.data.user, token } });
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: ACTIONS.FAILURE, payload: 'Session expired. Please log in again.' });
      });
  }, []);

  // Poll unread notification count every 30 s
  const fetchUnreadCount = useCallback(async () => {
    if (!state.isAuthenticated) return;
    try {
      const res = await apiGetUnreadCount();
      dispatch({ type: ACTIONS.SET_UNREAD, payload: res.data.unreadCount });
    } catch (_) {}
  }, [state.isAuthenticated]);

  useEffect(() => {
    if (!state.isAuthenticated) return;
    fetchUnreadCount();
    const id = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(id);
  }, [state.isAuthenticated, fetchUnreadCount]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    dispatch({ type: ACTIONS.START });
    try {
      const res = await apiLogin(email, password);
      const { user, token } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: ACTIONS.SUCCESS, payload: { user, token } });
      return { success: true };
    } catch (err) {
      const msg = err?.message || 'Login failed';
      dispatch({ type: ACTIONS.FAILURE, payload: msg });
      return { success: false, error: msg };
    }
  };

  const register = async (payload) => {
    dispatch({ type: ACTIONS.START });
    try {
      const res = await apiRegister(payload);
      const { user, token } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: ACTIONS.SUCCESS, payload: { user, token } });
      return { success: true };
    } catch (err) {
      const msg = err?.message || 'Registration failed';
      dispatch({ type: ACTIONS.FAILURE, payload: msg });
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try { await apiLogout(); } catch (_) {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: ACTIONS.LOGOUT });
  };

  const loginUser = (user, token) => {
    localStorage.setItem('token', token);
    dispatch({ type: ACTIONS.SUCCESS, payload: { user, token } });
  };

  const clearError = () => dispatch({ type: ACTIONS.CLEAR_ERR });

  const value = {
    ...state,
    isCR: state.user?.isCR || false,
    login, register, logout, loginUser, clearError, fetchUnreadCount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
