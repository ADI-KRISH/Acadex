import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { chatAPI, classGroupsAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Plus, Users, Shield, BookOpen, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ChatRooms = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [userClassGroup, setUserClassGroup] = useState(null);

  const isCR = user?.role === 'cr' || user?.role === 'admin';

  useEffect(() => {
    fetchRooms();
    if (isCR) {
      fetchClassGroupData();
    }
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getRooms();
      setRooms(response.data.chatRooms);
    } catch (error) {
      toast.error('Failed to load chat rooms');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassGroupData = async () => {
    try {
      // Find the class group this CR belongs to
      const response = await classGroupsAPI.getClassGroups();
      const groups = response.data.classGroups;
      
      let myGroup;
      if (user.role === 'admin') {
        // Admin might need to select a group, but for simplicity let's just pick the first one 
        // or actually admins shouldn't create rooms for a specific class unless they select it. 
        // We'll just show all available courses across all groups for admin, or let them pick.
        // Flatten all courses across all groups and get unique names
        const allCourseNames = [...new Set(groups.flatMap(g => (g.courses || []).map(c => c.name)))];
        setAvailableCourses(allCourseNames.map(name => ({ name })));
        if (groups.length > 0) setUserClassGroup(groups[0]);
      } else {
        myGroup = groups.find(g => g.classRepresentative?._id === user._id || g.classRepresentative === user._id);
        
        // Fallback: If not explicitly set as CR, find the group by the user's academic details
        if (!myGroup && user.academic?.class && user.academic?.stream) {
          myGroup = groups.find(g => g.name === user.academic.class && g.stream === user.academic.stream);
        }

        if (myGroup) {
          setUserClassGroup(myGroup);
          setAvailableCourses(myGroup.courses || []);
        }
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!selectedCourse) {
      toast.error('Please select a course');
      return;
    }
    if (!userClassGroup) {
      toast.error('You are not assigned as a CR to any class yet.');
      return;
    }
    
    try {
      await chatAPI.createRoom({
        name: selectedCourse,
        classGroupId: userClassGroup._id
      });
      toast.success('Chat room created successfully');
      setShowModal(false);
      setSelectedCourse('');
      fetchRooms();
    } catch (error) {
      toast.error(error?.message || 'Failed to create room. It might already exist.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <MessageCircle className="h-8 w-8 text-primary-600 mr-3" />
              Subject Chat Rooms
            </h1>
            <p className="mt-2 text-gray-600">
              Join real-time discussions for your subjects.
            </p>
          </div>
          
          {isCR && (
            <button onClick={() => setShowModal(true)} className="btn-primary btn-md">
              <Plus className="h-5 w-5 mr-2" />
              Create Chat Room
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : rooms.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Shield className="h-16 w-16 text-primary-200 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Active Chat Rooms</h3>
            {isCR ? (
              <p className="text-gray-500 mb-6">
                You haven't created any subject chat rooms for your class yet.
              </p>
            ) : (
              <p className="text-gray-500 mb-6">
                Your Class Representative hasn't created any chat rooms yet. Check back later!
              </p>
            )}
            {isCR && (
              <button onClick={() => setShowModal(true)} className="btn-primary btn-md mx-auto">
                <Plus className="h-5 w-5 mr-2" />
                Create First Room
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map(room => (
              <div 
                key={room._id} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/chat/${room._id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary-50 rounded-lg text-primary-600">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 bg-green-100 text-green-800 rounded-full">
                    {room.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{room.name}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {room.classGroup?.name} - {room.classGroup?.stream}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex -space-x-2">
                    {/* Placeholder for participant avatars */}
                    <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-600">
                      <Users className="h-4 w-4" />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-primary-600 hover:text-primary-700">
                    Join Discussion →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        
      </div>

      {/* Create Room Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 sm:mx-0 sm:h-10 sm:w-10">
                    <MessageCircle className="h-6 w-6 text-primary-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Create Subject Chat Room
                    </h3>
                    <div className="mt-4">
                      {availableCourses.length === 0 ? (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                          No courses available. Your class must have courses assigned by an Admin before you can create a chat room.
                        </div>
                      ) : (
                        <form onSubmit={handleCreateRoom}>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Select Subject/Course
                            </label>
                            <select
                              value={selectedCourse}
                              onChange={(e) => setSelectedCourse(e.target.value)}
                              className="input w-full"
                              required
                            >
                              <option value="">-- Choose a course --</option>
                              {availableCourses.map((course, idx) => (
                                <option key={idx} value={course.name}>{course.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse -mx-6 -mb-6 mt-6">
                            <button
                              type="submit"
                              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                            >
                              Create Room
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowModal(false)}
                              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRooms;
