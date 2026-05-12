import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI, classGroupsAPI, adminAPI, postsAPI, complaintsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Shield, Users, Search, UserCheck, UserX, BookOpen, Plus, X, Activity, Server, MessageSquare, AlertTriangle, CheckCircle, LogOut, Trash2 } from 'lucide-react';

const AdminPanel = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'classes'
  
  // Users state
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');


  // Classes state
  const [classGroups, setClassGroups] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [newCourse, setNewCourse] = useState('');
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [newClassData, setNewClassData] = useState({ 
    name: '', 
    stream: '', 
    semester: '', 
    description: '', 
    courses: [{ name: '', teacher_name: '', teacher_email: '' }] 
  });

  // Complaints state
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);

  // Health state
  const [healthData, setHealthData] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  // Posts state
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Bulk Upload state
  const [showUserUpload, setShowUserUpload] = useState(false);
  const [userUploadType, setUserUploadType] = useState('students');
  const [userFile, setUserFile] = useState(null);
  const [uploadingUsers, setUploadingUsers] = useState(false);

  const [showSubjectUpload, setShowSubjectUpload] = useState(false);
  const [subjectFile, setSubjectFile] = useState(null);
  const [uploadingSubjects, setUploadingSubjects] = useState(false);

  useEffect(() => { 
    if (activeTab === 'users') {
      fetchUsers(); 
    } else if (activeTab === 'classes') {
      fetchClassGroups();
      // Fetch users to populate CR dropdown if not fetched yet
      fetchUsers();
    } else if (activeTab === 'health') {
      fetchHealth();
    } else if (activeTab === 'announcements') {
      fetchPosts();
    } else if (activeTab === 'complaints') {
      fetchComplaints();
    }
  }, [roleFilter, activeTab]);

  const fetchComplaints = async () => {
    try {
      setLoadingComplaints(true);
      const response = await complaintsAPI.getComplaints();
      setComplaints(response.data.complaints);
    } catch (error) {
      toast.error('Failed to load complaints');
    } finally {
      setLoadingComplaints(false);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoadingPosts(true);
      const response = await postsAPI.getPosts({ limit: 50 });
      setPosts(response.data.posts);
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchHealth = async () => {
    try {
      setLoadingHealth(true);
      const response = await adminAPI.getHealth();
      setHealthData(response.data);
    } catch (error) {
      toast.error('Failed to load system health');
    } finally {
      setLoadingHealth(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await adminAPI.getUsers();
      // api interceptor returns response.data (the server JSON body)
      const userList = response?.data?.users || response?.users || [];
      setUsers(userList);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchClassGroups = async () => {
    try {
      setLoadingClasses(true);
      const response = await classGroupsAPI.getClassGroups();
      // api interceptor returns response.data, server wraps in { success, data: { classGroups } }
      const groups = response?.data?.classGroups || response?.classGroups || [];
      setClassGroups(groups);
    } catch (error) {
      toast.error('Failed to load classes');
    } finally {
      setLoadingClasses(false);
    }
  };
  const handleRoleChange = async (userId, newRole) => {
    const targetUser = users.find(u => u._id === userId);
    try {
      await adminAPI.updateUserRole(userId, newRole);
      toast.success('User role updated and class synced');
      
      if (targetUser?.role === 'cr' && newRole === 'student') {
        toast.warning(`Class ${targetUser.academic?.class} no longer has a CR. Please assign a new one.`);
      }

      fetchUsers();
      if (activeTab === 'classes') fetchClassGroups();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to update role');
    }
  };
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      window.location.href = '/login';
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      await usersAPI.updateUserStatus(userId, { isActive: !currentStatus });
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDisconnectUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to permanently disconnect user "${userName}" from the database and website? This action cannot be undone.`)) {
      try {
        await adminAPI.deleteUser(userId);
        toast.success('User disconnected successfully');
        fetchUsers();
        if (activeTab === 'classes') fetchClassGroups();
      } catch (error) {
        toast.error('Failed to disconnect user');
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is now handled client-side instantly
  };

  const handleUserUpload = async (e) => {
    e.preventDefault();
    if (!userFile) return toast.error("Please select a file");
    setUploadingUsers(true);
    try {
      const formData = new FormData();
      formData.append('file', userFile);
      if (userUploadType === 'students') {
        await adminAPI.bulkUploadStudents(formData);
      } else {
        await adminAPI.bulkUploadTeachers(formData);
      }
      toast.success(`${userUploadType === 'students' ? 'Students' : 'Teachers'} uploaded successfully`);
      setShowUserUpload(false);
      setUserFile(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.message || 'Failed to upload users');
    } finally {
      setUploadingUsers(false);
    }
  };

  const handleSubjectUpload = async (e) => {
    e.preventDefault();
    if (!subjectFile) return toast.error("Please select a file");
    setUploadingSubjects(true);
    try {
      const formData = new FormData();
      formData.append('file', subjectFile);
      const response = await adminAPI.bulkUploadSubjects(formData);
      // api interceptor gives us the server JSON body directly: { success, message, data: { successful, failed, errors } }
      const resultData = response?.data || response;
      const successful = resultData?.successful ?? 0;
      const failed = resultData?.failed ?? 0;
      const errors = resultData?.errors || [];

      if (failed > 0) {
        toast.error(`${failed} row(s) failed. Check browser console for details.`);
        console.error('Bulk Upload Errors:', errors);
      }
      if (successful > 0) {
        toast.success(`${successful} subject(s) uploaded successfully!`);
      } else if (failed === 0) {
        toast.info('No subjects processed from the file.');
      }

      setShowSubjectUpload(false);
      setSubjectFile(null);
      await fetchClassGroups();
      await fetchUsers();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(typeof error === 'string' ? error : error?.message || 'Failed to upload subjects');
    } finally {
      setUploadingSubjects(false);
    }
  };

  const handleAssignCR = async (classGroupId, userId) => {
    try {
      await classGroupsAPI.updateClassGroup(classGroupId, { classRepresentative: userId });
      toast.success('Class Representative assigned successfully');
      fetchClassGroups();
      fetchUsers(); // Refresh users to sync roles across tabs
    } catch (error) {
      toast.error(error.message || 'Failed to assign CR');
    }
  };

  const handleRemoveCR = async (classGroupId) => {
    if (window.confirm('Are you sure you want to remove the current Class Representative?')) {
      try {
        await classGroupsAPI.updateClassGroup(classGroupId, { classRepresentative: '' });
        toast.success('Class Representative removed successfully');
        fetchClassGroups();
        fetchUsers();
      } catch (error) {
        toast.error(error.message || 'Failed to remove CR');
      }
    }
  };

  const handleAddCourse = async (classGroupId, coursesList, newCourseName) => {
    if (!newCourseName.trim()) return;
    try {
      const updatedCourses = [...coursesList, { name: newCourseName.trim(), teacher: null }];
      await classGroupsAPI.updateClassGroup(classGroupId, { courses: updatedCourses });
      toast.success('Course added successfully');
      setNewCourse('');
      fetchClassGroups();
    } catch (error) {
      toast.error('Failed to add course');
    }
  };

  const handleRemoveCourse = async (classGroupId, coursesList, courseToRemoveName) => {
    try {
      const updatedCourses = coursesList.filter(c => c.name !== courseToRemoveName);
      await classGroupsAPI.updateClassGroup(classGroupId, { courses: updatedCourses });
      toast.success('Course removed successfully');
      fetchClassGroups();
    } catch (error) {
      toast.error('Failed to remove course');
    }
  };

  const handleUpdateCourseTeacher = async (classGroupId, coursesList, courseIdx, teacherId) => {
    try {
      const updatedCourses = [...coursesList];
      updatedCourses[courseIdx] = { 
        ...updatedCourses[courseIdx], 
        teacher: teacherId || null 
      };
      
      await classGroupsAPI.updateClassGroup(classGroupId, { courses: updatedCourses });
      toast.success('Teacher assigned to course successfully');
      fetchClassGroups();
    } catch (error) {
      toast.error('Failed to assign teacher');
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      // Filter out empty courses
      const processedCourses = newClassData.courses
        .filter(c => c.name.trim() !== '')
        .map(c => ({
          name: c.name.trim(),
          teacher_name: c.teacher_name.trim(),
          teacher_email: c.teacher_email.trim()
        }));

      await classGroupsAPI.createClassGroup({
        ...newClassData,
        courses: processedCourses
      });
      
      toast.success('Class created successfully!');
      setShowCreateClass(false);
      setNewClassData({ 
        name: '', 
        stream: '', 
        semester: '', 
        description: '', 
        courses: [{ name: '', teacher_name: '', teacher_email: '' }] 
      });
      await fetchClassGroups();
    } catch (error) {
      console.error('Create class error:', error);
      const msg = error?.data?.message || error?.message || typeof error === 'string' ? error : 'Failed to create class';
      toast.error(msg);
    }
  };

  const addCourseInput = () => {
    setNewClassData({
      ...newClassData,
      courses: [...newClassData.courses, { name: '', teacher_name: '', teacher_email: '' }]
    });
  };

  const removeCourseInput = (index) => {
    const updatedCourses = [...newClassData.courses];
    updatedCourses.splice(index, 1);
    setNewClassData({
      ...newClassData,
      courses: updatedCourses
    });
  };

  const updateCourseInput = (index, field, value) => {
    const updatedCourses = [...newClassData.courses];
    updatedCourses[index][field] = value;
    setNewClassData({
      ...newClassData,
      courses: updatedCourses
    });
  };

  const handleResolveComplaint = async (complaintId) => {
    try {
      await complaintsAPI.resolveComplaint(complaintId, { status: 'resolved' });
      toast.success('Complaint resolved');
      fetchComplaints();
    } catch (error) {
      toast.error('Failed to resolve complaint');
    }
  };

  // Compute unique classes for filter
  const uniqueClasses = [...new Set(users.map(u => u.academic?.class).filter(Boolean))].sort();

  // Compute filtered users client-side
  const filteredUsers = users.filter(u => {
    const matchesSearch = !searchTerm || 
      (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.profile?.firstName && u.profile.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.profile?.lastName && u.profile.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = !roleFilter || u.role === roleFilter;
    const matchesClass = !classFilter || u.academic?.class === classFilter;

    return matchesSearch && matchesRole && matchesClass;
  });

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Admin privileges required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              <Shield className="h-6 w-6 inline mr-2 text-primary-600" />Admin Panel
            </h1>
            <p className="text-sm text-gray-600 mt-1">Manage users, roles, classes, and system settings</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Users className="h-5 w-5 mr-2" />
              User Management
            </button>
            <button
              onClick={() => setActiveTab('classes')}
              className={`${
                activeTab === 'classes'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Class Management
            </button>
            <button
              onClick={() => setActiveTab('health')}
              className={`${
                activeTab === 'health'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Activity className="h-5 w-5 mr-2" />
              System Health
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`${
                activeTab === 'announcements'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              Announcements
            </button>
            <button
              onClick={() => setActiveTab('complaints')}
              className={`${
                activeTab === 'complaints'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <AlertTriangle className="h-5 w-5 mr-2" />
              Complaints
              {complaints.filter(c => c.status === 'open').length > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                  {complaints.filter(c => c.status === 'open').length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {activeTab === 'users' ? (
          /* User Management Tab */
          <>
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                      placeholder="Search users..." className="input pl-10" />
                  </div>
                  <button type="submit" className="btn-primary btn-md">Search</button>
                </form>
                <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input w-auto">
                  <option value="">All Roles</option>
                  <option value="student">Student</option>
                  <option value="cr">Class Representative</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                </select>
                <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="input w-auto">
                  <option value="">All Classes</option>
                  {uniqueClasses.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
                <button onClick={() => setShowUserUpload(!showUserUpload)} className="btn-primary btn-md flex items-center whitespace-nowrap">
                  {showUserUpload ? <X className="h-4 w-4 mr-1"/> : <Plus className="h-4 w-4 mr-1" />} 
                  {showUserUpload ? 'Cancel' : 'Bulk Upload Users'}
                </button>
              </div>
              
              {showUserUpload && (
                <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold mb-2">Bulk Upload Users</h3>
                  <form onSubmit={handleUserUpload} className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                      <select value={userUploadType} onChange={e => setUserUploadType(e.target.value)} className="input">
                        <option value="students">Students</option>
                        <option value="teachers">Teachers</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">CSV File</label>
                      <input type="file" accept=".csv" onChange={e => setUserFile(e.target.files[0])} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
                    </div>
                    <button type="submit" disabled={uploadingUsers || !userFile} className="btn-primary btn-md disabled:opacity-50">
                      {uploadingUsers ? 'Uploading...' : 'Upload'}
                    </button>
                  </form>
                  <p className="text-xs text-gray-500 mt-2">
                    Upload a CSV file containing user details. Ensure headers match the schema (e.g. first_name, last_name, email, password, class_name, stream for students; first_name, last_name, email, password, assignments for teachers).
                  </p>
                </div>
              )}
            </div>

            {loadingUsers ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredUsers.map(u => (
                        <tr key={u._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-sm font-medium text-primary-600">{u.profile?.firstName?.[0]}</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{u.profile?.firstName} {u.profile?.lastName}</p>
                                <p className="text-xs text-gray-500">@{u.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {u.role === 'faculty' ? (
                              <div className="flex flex-col gap-1">
                                {classGroups.filter(cg => 
                                  cg.faculty?.some(f => (f._id || f).toString() === u._id.toString())
                                ).map(cg => (
                                  <div key={cg._id} className="text-xs">
                                    <span className="font-semibold">{cg.name}:</span> {
                                      cg.courses?.filter(c => (c.teacher?._id || c.teacher)?.toString() === u._id.toString())
                                        .map(c => c.name).join(', ') || 'No specific subjects'
                                    }
                                  </div>
                                ))}
                                {classGroups.filter(cg => 
                                  cg.faculty?.some(f => (f._id || f).toString() === u._id.toString())
                                ).length === 0 && (
                                  <span className="text-gray-400 italic">No assignments</span>
                                )}
                              </div>
                            ) : (
                              `${u.academic?.class} - ${u.academic?.stream}`
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {u.role === 'student' || u.role === 'cr' ? (
                              <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)}
                                className="text-xs rounded-full px-2 py-1 border border-gray-200 focus:outline-none"
                                disabled={u._id === user._id}>
                                <option value="student">Student</option>
                                <option value="cr">CR</option>
                              </select>
                            ) : (
                              <span className="text-sm font-medium text-gray-700 capitalize">
                                {u.role}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {u.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {u.role !== 'admin' && (
                              <div className="flex gap-2">
                                <button onClick={() => handleStatusToggle(u._id, u.isActive)}
                                  className={`text-xs px-3 py-1 rounded-md transition-colors ${u.isActive ? 'text-orange-600 bg-orange-50 hover:bg-orange-100' : 'text-green-600 bg-green-50 hover:bg-green-100'}`}
                                  title={u.isActive ? "Deactivate User" : "Activate User"}>
                                  {u.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                </button>
                                <button onClick={() => handleDisconnectUser(u._id, u.username)}
                                  className="text-xs px-3 py-1 rounded-md text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center"
                                  title="Disconnect User Permanently">
                                  <LogOut className="h-3 w-3 mr-1" />
                                  Disconnect
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredUsers.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No users found</p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : activeTab === 'classes' ? (
          /* Class Management Tab */
          <>
            {loadingClasses ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Manage Classes & Courses</h2>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowSubjectUpload(!showSubjectUpload)}
                      className="btn-primary btn-sm flex items-center bg-green-600 hover:bg-green-700 border-green-600"
                    >
                      {showSubjectUpload ? <X className="h-4 w-4 mr-1"/> : <Plus className="h-4 w-4 mr-1"/>}
                      {showSubjectUpload ? 'Cancel Upload' : 'Bulk Upload Subjects'}
                    </button>
                    <button 
                      onClick={() => setShowCreateClass(!showCreateClass)}
                      className="btn-primary btn-sm flex items-center"
                    >
                      {showCreateClass ? <X className="h-4 w-4 mr-1"/> : <Plus className="h-4 w-4 mr-1"/>}
                      {showCreateClass ? 'Cancel' : 'Create New Class'}
                    </button>
                  </div>
                </div>

                {showSubjectUpload && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Bulk Upload Subjects</h3>
                    <form onSubmit={handleSubjectUpload} className="flex flex-col sm:flex-row gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">CSV File</label>
                        <input type="file" accept=".csv" onChange={e => setSubjectFile(e.target.files[0])} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
                      </div>
                      <button type="submit" disabled={uploadingSubjects || !subjectFile} className="btn-primary btn-md bg-green-600 hover:bg-green-700 disabled:opacity-50">
                        {uploadingSubjects ? 'Uploading...' : 'Upload Subjects'}
                      </button>
                    </form>
                    <p className="text-xs text-gray-500 mt-2">
                      Upload a CSV file containing subjects mapped to classes. Headers must include <code>course_name</code>, <code>class_name</code>, <code>teacher_name</code>, and <code>teacher_email</code>. This automatically assigns courses and teachers to classes and creates isolated chat rooms.
                    </p>
                  </div>
                )}

                {showCreateClass && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Create New Class</h3>
                    <form onSubmit={handleCreateClass} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Class Name</label>
                        <input type="text" required value={newClassData.name} onChange={e => setNewClassData({...newClassData, name: e.target.value})} className="input mt-1" placeholder="e.g. CS-A" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Stream</label>
                        <input type="text" required value={newClassData.stream} onChange={e => setNewClassData({...newClassData, stream: e.target.value})} className="input mt-1" placeholder="e.g. Computer Science" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Semester</label>
                        <input type="number" value={newClassData.semester} onChange={e => setNewClassData({...newClassData, semester: e.target.value})} className="input mt-1" min="1" max="10" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <input type="text" value={newClassData.description} onChange={e => setNewClassData({...newClassData, description: e.target.value})} className="input mt-1" placeholder="Optional description" />
                      </div>
                      <div className="md:col-span-2 space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                          <label className="block text-sm font-semibold text-gray-700">Courses & Teachers</label>
                          <button type="button" onClick={addCourseInput} className="text-xs btn-primary bg-blue-600 px-2 py-1 flex items-center">
                            <Plus className="h-3 w-3 mr-1" /> Add Course
                          </button>
                        </div>
                        
                        {newClassData.courses.map((course, idx) => (
                          <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg relative border border-gray-100">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Course Name</label>
                              <input 
                                type="text" 
                                value={course.name} 
                                onChange={e => updateCourseInput(idx, 'name', e.target.value)}
                                className="input text-sm py-1 h-8" 
                                placeholder="e.g. Math" 
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Teacher Name</label>
                              <input 
                                type="text" 
                                value={course.teacher_name} 
                                onChange={e => updateCourseInput(idx, 'teacher_name', e.target.value)}
                                className="input text-sm py-1 h-8" 
                                placeholder="e.g. John Doe" 
                              />
                            </div>
                            <div className="pr-8">
                              <label className="block text-xs font-medium text-gray-500 mb-1">Teacher Email</label>
                              <input 
                                type="email" 
                                value={course.teacher_email} 
                                onChange={e => updateCourseInput(idx, 'teacher_email', e.target.value)}
                                className="input text-sm py-1 h-8" 
                                placeholder="e.g. john@test.com" 
                              />
                            </div>
                            {newClassData.courses.length > 1 && (
                              <button 
                                type="button" 
                                onClick={() => removeCourseInput(idx)}
                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                        <button type="button" onClick={() => setShowCreateClass(false)} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">Create Class Group</button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6">
                {classGroups.map(cg => (
                  <div key={cg._id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{cg.name}</h3>
                        <p className="text-sm text-gray-500">{cg.stream}</p>
                      </div>
                      <div className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                        Semester {cg.semester || 'N/A'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* CR Assignment */}
                      <div>
                        <div className="flex items-center justify-between mb-2 border-b pb-1">
                          <h4 className="text-sm font-semibold text-gray-700">Class Representative</h4>
                          {cg.classRepresentative ? (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full flex items-center"><UserCheck className="h-3 w-3 mr-1" /> Has CR</span>
                          ) : (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full flex items-center"><AlertTriangle className="h-3 w-3 mr-1" /> No CR Found</span>
                          )}
                        </div>
                        
                        {cg.classRepresentative ? (
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-200">
                              <p className="text-sm text-gray-800 flex items-center font-medium">
                                {cg.classRepresentative.profile?.firstName} {cg.classRepresentative.profile?.lastName}
                              </p>
                              <button 
                                onClick={() => handleRemoveCR(cg._id)}
                                className="text-xs text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
                              >
                                Remove CR
                              </button>
                            </div>
                            <p className="text-xs text-gray-500">Remove the current CR to assign a new one.</p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <select 
                              value="" 
                              onChange={(e) => handleAssignCR(cg._id, e.target.value)}
                              className="input text-sm flex-1"
                            >
                              <option value="">-- Assign a CR --</option>
                              {/* We filter all users to show those belonging to this class */}
                              {users.filter(u => u.academic?.class === cg.name && u.academic?.stream === cg.stream).map(student => (
                                <option key={student._id} value={student._id}>
                                  {student.profile?.firstName} {student.profile?.lastName} (@{student.username})
                                </option>
                              ))}
                            </select>
                            <p className="text-xs text-orange-600 flex items-center"><AlertTriangle className="h-3 w-3 mr-1" /> Please assign a CR for this class.</p>
                          </div>
                        )}
                      </div>

                      {/* Course Management */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 border-b pb-1">Assigned Courses (Subjects)</h4>
                        <div className="grid grid-cols-1 gap-3 mb-4">
                          {cg.courses && cg.courses.length > 0 ? (
                            cg.courses.map((course, idx) => (
                              <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex flex-col space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-gray-800 text-sm">{course.name}</span>
                                  <button onClick={() => handleRemoveCourse(cg._id, cg.courses, course.name)} className="text-gray-400 hover:text-red-500">
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <select 
                                    className="text-xs input py-1 h-8 flex-1"
                                    value={course.teacher?._id || course.teacher || ''}
                                    onChange={(e) => handleUpdateCourseTeacher(cg._id, cg.courses, idx, e.target.value)}
                                  >
                                    <option value="">-- Assign Teacher --</option>
                                    {users.filter(u => u.role === 'faculty').map(teacher => (
                                      <option key={teacher._id} value={teacher._id}>
                                        {teacher.profile?.firstName} {teacher.profile?.lastName}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400 italic">No courses added yet.</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            id={`new-course-${cg._id}`}
                            placeholder="Add a new course..." 
                            className="input text-sm flex-1 py-1 px-2 h-8"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleAddCourse(cg._id, cg.courses || [], e.target.value);
                                e.target.value = '';
                              }
                            }}
                          />
                          <button 
                            onClick={() => {
                              const input = document.getElementById(`new-course-${cg._id}`);
                              handleAddCourse(cg._id, cg.courses || [], input.value);
                              input.value = '';
                            }}
                            className="btn-primary text-xs px-3 py-1 h-8"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {classGroups.length === 0 && (
                  <div className="p-8 text-center text-gray-500 bg-white rounded-lg border border-gray-200">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No class groups found. Ensure classes are created in the database.</p>
                  </div>
                )}
                </div>
              </div>
            )}
          </>
        ) : activeTab === 'health' ? (
          /* Health Tab */
          <>
            {loadingHealth ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : healthData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center text-gray-900 mb-2">
                    <Activity className="h-6 w-6 mr-2 text-primary-600" />
                    <h3 className="font-semibold text-lg">System Status</h3>
                  </div>
                  <p className="text-3xl font-bold text-green-600">Online</p>
                  <p className="text-sm text-gray-500 mt-2">Uptime: {Math.floor(healthData.uptime / 60)} minutes</p>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center text-gray-900 mb-2">
                    <Server className="h-6 w-6 mr-2 text-primary-600" />
                    <h3 className="font-semibold text-lg">Memory Usage</h3>
                  </div>
                  <div className="space-y-2 text-sm mt-4">
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-gray-500">RSS:</span>
                      <span className="font-medium">{healthData.memoryUsage.rss}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-gray-500">Heap Total:</span>
                      <span className="font-medium">{healthData.memoryUsage.heapTotal}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-gray-500">Heap Used:</span>
                      <span className="font-medium">{healthData.memoryUsage.heapUsed}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center text-gray-900 mb-2">
                    <Users className="h-6 w-6 mr-2 text-primary-600" />
                    <h3 className="font-semibold text-lg">Users</h3>
                  </div>
                  <div className="space-y-2 text-sm mt-4">
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-gray-500">Total Registered:</span>
                      <span className="font-medium">{healthData.users.total}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-gray-500">Active Accounts:</span>
                      <span className="font-medium">{healthData.users.active}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-gray-500">Database Connection:</span>
                      <span className={`font-medium ${healthData.database === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                        {healthData.database}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p>No health data available.</p>
              </div>
            )}
          </>
        ) : activeTab === 'announcements' ? (
          /* Announcements Tab */
          <>
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Platform Announcements</h2>
              <a href="/posts/create" className="btn-primary text-sm px-4 py-2">
                <Plus className="h-4 w-4 mr-2" /> Create Announcement
              </a>
            </div>
            {loadingPosts ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : posts.length > 0 ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {posts.map(post => (
                    <li key={post._id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="truncate">
                          <p className="text-sm font-medium text-primary-600 truncate">{post.title}</p>
                          <p className="mt-1 text-sm text-gray-500 truncate">{post.content?.substring(0, 100)}...</p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 capitalize`}>
                            {post.category}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-xs text-gray-500">
                            By {post.author?.profile?.firstName} {post.author?.profile?.lastName}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-xs text-gray-500 sm:mt-0">
                          <p>
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 bg-white rounded-lg border border-gray-200">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No announcements found.</p>
              </div>
            )}
          </>
        ) : (
          /* Complaints Tab */
          <>
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">System Complaints</h2>
            </div>
            {loadingComplaints ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : complaints.length > 0 ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {complaints.map(complaint => (
                    <li key={complaint._id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="truncate flex-1">
                          <p className="text-base font-bold text-gray-900 truncate">{complaint.subject}</p>
                          <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{complaint.description}</p>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex flex-col items-end space-y-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            complaint.status === 'open' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          } capitalize`}>
                            {complaint.status}
                          </span>
                          {complaint.status === 'open' && (
                            <button
                              onClick={() => handleResolveComplaint(complaint._id)}
                              className="btn-primary btn-sm flex items-center bg-green-600 hover:bg-green-700 border-green-600"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" /> Mark Resolved
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 sm:flex sm:justify-between border-t pt-2 border-gray-100">
                        <div className="sm:flex">
                          <p className="flex items-center text-xs text-gray-500">
                            Reported by: <span className="font-semibold ml-1">{complaint.author?.profile?.firstName} {complaint.author?.profile?.lastName}</span> ({complaint.author?.role})
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-xs text-gray-500 sm:mt-0">
                          <p>
                            {new Date(complaint.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 bg-white rounded-lg border border-gray-200">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No complaints reported.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
