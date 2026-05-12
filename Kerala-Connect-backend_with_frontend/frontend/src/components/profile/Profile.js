import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI, authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  BookOpen,
  GraduationCap,
  Award,
  MessageSquare,
  Lock,
  Save,
  ArrowLeft,
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: user?.profile?.firstName || '',
    lastName: user?.profile?.lastName || '',
    bio: user?.profile?.bio || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await usersAPI.updateProfile({
        profile: {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          bio: profileData.bio,
        },
      });
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-6">
            <div className="h-20 w-20 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {user?.profile?.firstName?.[0]}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.profile?.firstName} {user?.profile?.lastName}
              </h1>
              <p className="text-gray-600">@{user?.username}</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 capitalize mt-1">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <MessageSquare className="h-6 w-6 text-primary-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{user?.stats?.questionsAsked || 0}</p>
            <p className="text-sm text-gray-600">Questions</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <BookOpen className="h-6 w-6 text-success-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{user?.stats?.answersGiven || 0}</p>
            <p className="text-sm text-gray-600">Answers</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-2 text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Profile Info
          </button>
          <button
            onClick={() => setActiveTab('academic')}
            className={`pb-3 px-2 text-sm font-medium transition-colors ${
              activeTab === 'academic'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Academic
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`pb-3 px-2 text-sm font-medium transition-colors ${
              activeTab === 'password'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Change Password
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    className="input"
                    disabled={!editing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    className="input"
                    disabled={!editing}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={user?.email || ''} className="input" disabled />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="textarea"
                  rows={3}
                  disabled={!editing}
                  placeholder="Tell others about yourself..."
                />
              </div>

              <div className="flex space-x-3">
                {editing ? (
                  <>
                    <button type="submit" disabled={loading} className="btn-primary btn-md">
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="btn-secondary btn-md"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="btn-primary btn-md"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Academic Tab */}
        {activeTab === 'academic' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <GraduationCap className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Class</p>
                  <p className="text-lg text-gray-900">{user?.academic?.class}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <BookOpen className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Stream</p>
                  <p className="text-lg text-gray-900">{user?.academic?.stream}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Award className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Semester</p>
                  <p className="text-lg text-gray-900">{user?.academic?.semester || 'Not set'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  className="input"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  className="input"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary btn-md">
                <Lock className="h-4 w-4 mr-2" />
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
