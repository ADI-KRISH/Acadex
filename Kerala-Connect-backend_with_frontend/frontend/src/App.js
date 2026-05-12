import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import CreatePost from './components/posts/CreatePost';
import PostDetail from './components/posts/PostDetail';
import Profile from './components/profile/Profile';
import Notifications from './components/notifications/Notifications';
import Reminders from './components/reminders/Reminders';
import AdminPanel from './components/admin/AdminPanel';
import ChatRooms from './components/chat/ChatRooms';
import ChatRoomDetail from './components/chat/ChatRoomDetail';
import Complaints from './components/complaints/Complaints';
import Navbar from './components/common/Navbar';
import AdminLayout from './components/common/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import './index.css';

// Layout component for protected routes with shared Navbar
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {children}
    </div>
  );
};

// App content with auth context
const AppContent = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Kerala Connect...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
          }
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/posts/create"
          element={
            <ProtectedRoute>
              <Layout>
                <CreatePost />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/posts/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <PostDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Layout>
                <Notifications />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Layout>
                <ChatRooms />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ChatRoomDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reminders"
          element={
            <ProtectedRoute>
              <Layout>
                <Reminders />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/complaints"
          element={
            <ProtectedRoute>
              <Layout>
                <Complaints />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminPanel />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Redirect root to dashboard or login */}
        <Route
          path="/"
          element={
            <Navigate to={isAuthenticated ? (user?.role === 'admin' ? '/admin' : '/dashboard') : "/login"} replace />
          }
        />

        {/* Catch all route */}
        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated ? (user?.role === 'admin' ? '/admin' : '/dashboard') : "/login"} replace />
          }
        />
      </Routes>
      
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
