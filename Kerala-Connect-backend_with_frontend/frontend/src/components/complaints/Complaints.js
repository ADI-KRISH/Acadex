import React, { useState } from 'react';
import { complaintsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { AlertCircle, Send, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Complaints = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [complaintData, setComplaintData] = useState({ subject: '', description: '' });

  // Only allow CRs to access this page
  if (user?.role !== 'cr') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md text-center">
          <ShieldAlert className="h-12 w-12 text-error-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            Only Class Representatives (CR) are authorized to lodge system-wide complaints.
          </p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary w-full">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!complaintData.subject || !complaintData.description) {
      return toast.error('Subject and description are required');
    }

    try {
      setLoading(true);
      await complaintsAPI.createComplaint(complaintData);
      toast.success('Complaint submitted successfully');
      setComplaintData({ subject: '', description: '' });
      // Optional: navigate away or stay
    } catch (error) {
      toast.error(error.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="bg-error-600 px-6 py-8 text-white">
            <div className="flex items-center space-x-3 mb-2">
              <AlertCircle className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Lodge System Complaint</h1>
            </div>
            <p className="text-error-50 opacity-90">
              As a Class Representative, you can report technical issues, administrative concerns, or site-wide problems directly to the System Administrator.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                id="subject"
                type="text"
                required
                maxLength="100"
                className="input w-full focus:ring-error-500 focus:border-error-500"
                placeholder="What is the issue about? (e.g., Chat room bug, user misbehavior)"
                value={complaintData.subject}
                onChange={(e) => setComplaintData({ ...complaintData, subject: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Detailed Description
              </label>
              <textarea
                id="description"
                required
                maxLength="1000"
                rows="6"
                className="textarea w-full focus:ring-error-500 focus:border-error-500"
                placeholder="Provide as much detail as possible to help the administrator resolve the issue..."
                value={complaintData.description}
                onChange={(e) => setComplaintData({ ...complaintData, description: e.target.value })}
              ></textarea>
              <p className="mt-2 text-xs text-gray-500">
                Max 1000 characters. Please be professional and concise.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-900 font-medium text-sm"
              >
                Go Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary bg-error-600 hover:bg-error-700 text-white px-8 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit to Admin
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
          <ShieldAlert className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>Note:</strong> Complaints are reviewed by the System Administrator. Misuse of the complaint system or filing false reports may lead to disciplinary action or revocation of CR privileges.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Complaints;
