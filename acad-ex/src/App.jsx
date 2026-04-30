import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import ForumPage from './pages/ForumPage';
import ThreadPage from './pages/ThreadPage';
import ChatPage from './pages/ChatPage';
import RemindersPage from './pages/RemindersPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import Layout from './components/Layout';

function PrivateRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--muted)', fontFamily:'var(--font)' }}>
      Loading…
    </div>
  );
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={
          <PrivateRoute>
            <Layout>
              <Routes>
                <Route path="/"             element={<ForumPage />} />
                <Route path="/question/:id" element={<ThreadPage />} />
                <Route path="/chat"         element={<ChatPage />} />
                <Route path="/reminders"    element={<RemindersPage />} />
                <Route path="/settings"     element={<SettingsPage />} />
                <Route path="/profile"      element={<ProfilePage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="*"             element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
