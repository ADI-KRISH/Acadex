import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  BookOpen,
  Bell,
  Search,
  Plus,
  LogOut,
  User,
  Calendar,
  Shield,
  Menu,
  X,
  MessageCircle,
  AlertTriangle,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, unreadCount } = useAuth();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isPrivileged = ['cr', 'faculty', 'admin'].includes(user?.role);
  const isAdmin = user?.role === 'admin';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center">
            <BookOpen className="h-8 w-8 text-primary-600" />
            <h1 className="ml-3 text-xl font-bold text-gray-900 hidden sm:block">
              Kerala Connect
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/dashboard"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
            >
              Forum
            </Link>
            <Link
              to="/reminders"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
            >
              <Calendar className="h-4 w-4 inline mr-1" />
              Reminders
            </Link>
            <Link
              to="/notifications"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors relative"
            >
              <Bell className="h-4 w-4 inline mr-1" />
              Notifications
              {unreadCount > 0 && (
                <span className="absolute -top-1 -left-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
              )}
            </Link>
            {user?.role !== 'faculty' && user?.role !== 'admin' && (
              <Link
                to="/chat"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                <MessageCircle className="h-4 w-4 inline mr-1" />
                Chat Rooms
              </Link>
            )}
            {user?.role === 'cr' && (
              <Link
                to="/complaints"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                <AlertTriangle className="h-4 w-4 inline mr-1 text-red-500" />
                Complaints
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                <Shield className="h-4 w-4 inline mr-1" />
                Admin
              </Link>
            )}
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {!isAdmin && (
              <Link to="/posts/create" className="btn-primary btn-sm hidden sm:flex">
                <Plus className="h-4 w-4 mr-1" />
                New Post
              </Link>
            )}

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.profile?.firstName?.[0]}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.profile?.firstName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="h-4 w-4 inline mr-2" />
                    Profile
                  </Link>
                  <Link
                    to="/notifications"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 relative"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Bell className="h-4 w-4 inline mr-2" />
                        Notifications
                      </div>
                      {unreadCount > 0 && (
                        <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-error-600 hover:bg-error-50"
                  >
                    <LogOut className="h-4 w-4 inline mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-600"
            >
              {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              to="/dashboard"
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50"
              onClick={() => setShowMobileMenu(false)}
            >
              Forum
            </Link>
            <Link
              to="/reminders"
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50"
              onClick={() => setShowMobileMenu(false)}
            >
              Reminders
            </Link>
            <Link
              to="/notifications"
              className="flex items-center justify-between px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50"
              onClick={() => setShowMobileMenu(false)}
            >
              <div className="flex items-center">
                <Bell className="h-5 w-5 mr-3 text-gray-400" />
                Notifications
              </div>
              {unreadCount > 0 && (
                <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {unreadCount}
                </span>
              )}
            </Link>
            {user?.role !== 'faculty' && (
              <Link
                to="/chat"
                className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={() => setShowMobileMenu(false)}
              >
                Chat Rooms
              </Link>
            )}
            {user?.role === 'cr' && (
              <Link
                to="/complaints"
                className="block px-3 py-2 rounded-md text-red-600 font-medium hover:bg-red-50"
                onClick={() => setShowMobileMenu(false)}
              >
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                Lodge Complaint
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={() => setShowMobileMenu(false)}
              >
                Admin Panel
              </Link>
            )}
            {!isAdmin && (
              <Link
                to="/posts/create"
                className="block px-3 py-2 rounded-md text-white bg-primary-600 hover:bg-primary-700"
                onClick={() => setShowMobileMenu(false)}
              >
                <Plus className="h-4 w-4 inline mr-1" />
                New Post
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
