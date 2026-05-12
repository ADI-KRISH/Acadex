import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import { apiGetClassGroup, apiRemoveClassMember, apiAddClassMember, apiGetComplaints, apiPostComplaint } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ClassManagementPage.css';

export default function ClassManagementPage() {
  const { user } = useAuth();
  const [classGroup, setClassGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [complaints, setComplaints] = useState([]);

  const loadClass = async () => {
    if (!user?.classGroupId && !user?.academic?.class && !user?.classGroup) return;
    setLoading(true);
    try {
      const id = user.classGroupId || user.classGroup?._id || user.classGroup;
      if (id) {
        const res = await apiGetClassGroup(id);
        setClassGroup(res.data.classGroup);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load class group details');
    }
    setLoading(false);
  };

  const loadComplaints = async () => {
    try {
      const res = await apiGetComplaints({ author: user?._id });
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadClass();
    loadComplaints();
  }, [user]);

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this student from the class?')) return;
    try {
      await apiRemoveClassMember(classGroup._id, userId);
      setClassGroup(prev => ({
        ...prev,
        members: prev.members.filter(m => m._id !== userId)
      }));
    } catch (err) {
      alert(err.message || 'Failed to remove member');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;
    setAdding(true);
    try {
      alert('Adding members currently requires a valid User ID in the backend. This UI would typically search for users first.');
    } catch (err) {
      alert(err.message || 'Failed to add member');
    }
    setAdding(false);
  };

  const handleSendComplaint = async () => {
    const subject = window.prompt('Enter subject:');
    const message = window.prompt('Enter details:');
    if (subject && message) {
      try {
        await apiPostComplaint({ subject, description: message });
        alert('Complaint sent to admin!');
        loadComplaints();
      } catch (err) {
        alert('Failed to send: ' + err.message);
      }
    }
  };

  if (loading) return <><Topbar title="Class Management" /><div className="empty-state"><div className="empty-icon">⏳</div></div></>;

  if (!classGroup) return (
    <>
      <Topbar title="Class Management" />
      <div className="empty-state">
        <div className="empty-icon">📂</div>
        <div className="empty-title">No Class Group Found</div>
        <p>You are not assigned to a managed class group.</p>
      </div>
    </>
  );

  return (
    <>
      <Topbar title="Class Management" showSearch={false} />
      <div className="page-content class-mgmt">
        <div className="class-header-card">
          <div className="info">
            <h2>{classGroup.name}</h2>
            <p>{classGroup.stream} · Semester {classGroup.semester}</p>
          </div>
          <div className="stats">
            <div className="stat">
              <span className="num">{classGroup.members.length}</span>
              <span className="label">Students</span>
            </div>
          </div>
        </div>

        <div className="mgmt-grid">
          {/* Members List */}
          <div className="admin-card">
            <h3>Class Members</h3>
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Roll No</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classGroup.members.map(m => (
                    <tr key={m._id}>
                      <td>
                        <div className="user-info">
                          <div className="avatar small">{m.profile.firstName[0]}{m.profile.lastName[0]}</div>
                          <div>
                            <div className="name">{m.profile.firstName} {m.profile.lastName}</div>
                            <div className="username">{m.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{m.username}</td>
                      <td>
                        {m._id !== user._id && (
                          <button className="btn-icon delete" onClick={() => handleRemoveMember(m._id)}>🗑️</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="sidebar-actions">
            <div className="admin-card">
              <h3>Add Student</h3>
              <form onSubmit={handleAddMember}>
                <div className="form-group">
                  <label className="form-label">Student Email</label>
                  <input 
                    className="form-input" 
                    placeholder="student@example.com"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                  />
                </div>
                <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} disabled={adding}>
                  {adding ? 'Adding...' : 'Add to Class'}
                </button>
              </form>
            </div>

            <div className="admin-card" style={{ marginTop: 20 }}>
              <h3>Contact Admin</h3>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>Send a formal request or report an issue to the system admin.</p>
              <button className="btn btn-ghost" style={{ width: '100%' }} onClick={handleSendComplaint}>
                🚩 Send Complaint
              </button>
            </div>

            <div className="admin-card" style={{ marginTop: 20 }}>
              <h3>My Complaints</h3>
              <div className="complaint-list" style={{ marginTop: 12 }}>
                {complaints.length === 0 ? (
                  <p style={{ fontSize: 12, color: 'var(--muted)' }}>No complaints lodged yet.</p>
                ) : (
                  complaints.map(c => (
                    <div key={c._id} className="complaint-item" style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: 13 }}>{c.subject}</strong>
                        <span className={`badge status-${c.status}`} style={{ fontSize: 10 }}>{c.status}</span>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{c.description}</p>
                      {c.adminReply && (
                        <div className="admin-reply" style={{ marginTop: 8, padding: 8, background: 'var(--bg)', borderRadius: 4, borderLeft: '2px solid var(--accent)' }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase' }}>Admin Reply</div>
                          <div style={{ fontSize: 12 }}>{c.adminReply}</div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
