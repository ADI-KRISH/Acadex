import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,
  error: null,
  unreadCount: 0,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_UNREAD_COUNT: 'SET_UNREAD_COUNT',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
    case AUTH_ACTIONS.LOAD_USER_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: !!action.payload.user,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
      
    case AUTH_ACTIONS.SET_UNREAD_COUNT:
      return {
        ...state,
        unreadCount: action.payload,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  // Fetch unread notifications count
  const fetchUnreadCount = async () => {
    if (!state.isAuthenticated) return;
    try {
      const { notificationsAPI } = await import('../services/api');
      const response = await notificationsAPI.getUnreadCount();
      dispatch({ type: AUTH_ACTIONS.SET_UNREAD_COUNT, payload: response.data.unreadCount });
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // Load user from token on app start
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          dispatch({ type: AUTH_ACTIONS.LOAD_USER_START });
          const response = await authAPI.getMe();
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
            payload: {
              user: response.data.user,
              token,
            },
          });
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER_FAILURE,
            payload: error.message || 'Failed to load user',
          });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.LOAD_USER_SUCCESS, payload: { user: null, token: null } });
      }
    };

    loadUser();
  }, []);

  // Poll for unread notifications
  useEffect(() => {
    let interval;
    if (state.isAuthenticated) {
      fetchUnreadCount();
      interval = setInterval(fetchUnreadCount, 30000); // Every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isAuthenticated]);

  // Login
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      const response = await authAPI.login(credentials);
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });
      
      return { success: true, user };
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message || 'Login failed',
      });
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  // Register
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.REGISTER_START });
      const response = await authAPI.register(userData);
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: { user, token },
      });
      
      return { success: true };
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: error.message || 'Registration failed',
      });
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authAPI.getMe();
        const user = response.data.user;
        localStorage.setItem('user', JSON.stringify(user));
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
          payload: { user, token },
        });
      } catch (error) {
        console.error('Refresh user error:', error);
      }
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    refreshUser,
    fetchUnreadCount,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
