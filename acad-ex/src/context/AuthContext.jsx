import { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USER } from '../services/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('acad_token');
    const savedUser  = localStorage.getItem('acad_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const loginUser = (userData, jwt) => {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem('acad_token', jwt);
    localStorage.setItem('acad_user', JSON.stringify(userData));
  };

  // Mock login — replaces with real API once backend is ready
  const mockLogin = (email, _password) => {
    const fakeToken = 'mock-jwt-' + Date.now();
    const userData  = { ...MOCK_USER, email };
    loginUser(userData, fakeToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('acad_token');
    localStorage.removeItem('acad_user');
  };

  const isCR = user?.role === 'cr';

  return (
    <AuthContext.Provider value={{ user, token, loading, loginUser, mockLogin, logout, isCR }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
