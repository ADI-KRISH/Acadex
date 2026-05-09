import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Calendar, Plus, Clock, AlertCircle, CheckCircle, BookOpen, X } from 'lucide-react';

const Reminders = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', type: 'assignment', dueDate: '',
    class: user?.academic?.class || '', stream: user?.academic?.stream || '', priority: 'medium',
  });
  const [submitting, setSubmitting] = useState(false);
  const isPrivileged = ['cr', 'faculty', 'admin'].includes(user?.role);

  useEffect(() => { fetchReminders(); }, []);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reminders', {
        params: { class: user?.academic?.class, stream: user?.academic?.stream }
      });
      setReminders(response.data.reminders);
    } catch (error) {
      toast.error('Failed to load reminders');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/reminders', formData);
      toast.success('Reminder created and notifications sent!');
      setShowCreateForm(false);
      setFormData({ title: '', description: '', type: 'assignment', dueDate: '',
        class: user?.academic?.class || '', stream: user?.academic?.stream || '', priority: 'medium' });
      fetchReminders();
    } catch (error) {
      toast.error(error.message || 'Failed to create reminder');
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = { high: 'bg-red-100 text-red-800', medium: 'bg-yellow-100 text-yellow-800', low: 'bg-green-100 text-green-800' };
    return colors[priority] || colors.medium;
  };

  const getTypeIcon = (type) => {
    const icons = {
      assignment: <BookOpen className="h-5 w-5 text-blue-600" />,
      exam: <AlertCircle className="h-5 w-5 text-red-600" />,
      event: <Calendar className="h-5 w-5 text-purple-600" />,
      general: <Clock className="h-5 w-5 text-gray-600" />,
    };
    return icons[type] || icons.general;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const isOverdue = (dueDate) => new Date(dueDate) < new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reminders</h1>
            <p className="text-sm text-gray-600 mt-1">{user?.academic?.class} • {user?.academic?.stream}</p>
          </div>
          {isPrivileged && (
            <button onClick={() => setShowCreateForm(true)} className="btn-primary btn-md">
              <Plus className="h-4 w-4 mr-2" />Create Reminder
            </button>
          )}
        </div>

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Create Reminder</h2>
                <button onClick={() => setShowCreateForm(false)}><X className="h-5 w-5 text-gray-400" /></button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                    className="input" required placeholder="e.g., Data Structures Assignment 3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                    className="textarea" rows={3} placeholder="Additional details..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="input">
                      <option value="assignment">Assignment</option>
                      <option value="exam">Exam</option>
                      <option value="event">Event</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="input">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                  <input type="datetime-local" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})}
                    className="input" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                    <input type="text" value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stream</label>
                    <input type="text" value={formData.stream} onChange={e => setFormData({...formData, stream: e.target.value})} className="input" />
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button type="submit" disabled={submitting} className="btn-primary btn-md flex-1">
                    {submitting ? 'Creating...' : 'Create & Notify Students'}
                  </button>
                  <button type="button" onClick={() => setShowCreateForm(false)} className="btn-secondary btn-md">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reminders List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : reminders.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming reminders</h3>
            <p className="text-gray-600">No assignments or exams scheduled</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map(reminder => (
              <div key={reminder._id}
                className={`bg-white rounded-lg border p-5 ${isOverdue(reminder.dueDate) ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">{getTypeIcon(reminder.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-medium text-gray-900">{reminder.title}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(reminder.priority)}`}>
                        {reminder.priority}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                        {reminder.type}
                      </span>
                    </div>
                    {reminder.description && <p className="text-sm text-gray-600 mb-2">{reminder.description}</p>}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className={`flex items-center ${isOverdue(reminder.dueDate) ? 'text-red-600 font-medium' : ''}`}>
                        <Clock className="h-4 w-4 mr-1" />
                        {isOverdue(reminder.dueDate) ? 'Overdue: ' : 'Due: '}{formatDate(reminder.dueDate)}
                      </span>
                      <span>By: {reminder.createdBy?.profile?.firstName} {reminder.createdBy?.profile?.lastName}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Reminders;
