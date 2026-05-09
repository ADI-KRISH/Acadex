import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Admin Header */}
      <nav className="bg-gray-900 border-b border-gray-800 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/admin" className="flex items-center text-white">
                <Shield className="h-8 w-8 text-primary-500" />
                <span className="ml-2 text-xl font-bold tracking-tight">Kerala Connect <span className="text-primary-500 font-normal">Admin</span></span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
                  {user?.profile?.firstName?.charAt(0) || 'A'}
                </div>
                <div className="hidden md:block text-sm text-gray-300">
                  <p className="font-medium leading-none">{user?.profile?.firstName} {user?.profile?.lastName}</p>
                  <p className="text-xs text-gray-500 mt-1 capitalize">{user?.role}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="text-gray-400 hover:text-white transition-colors flex items-center"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
