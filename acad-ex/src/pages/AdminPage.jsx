import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import api, { apiGetAdminHealth, apiGetAdminUsers, apiUpdateUserRole, apiDeleteUser, apiGetAdminClasses, apiGetComplaints, apiResolveComplaint } from '../services/api';
import './AdminPage.css';

export default function AdminPage() {
  const [health, setHealth] = useState(null);
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('users');

  const loadData = async () => {
    setLoading(true);
    try {
      const [healthRes, usersRes, classRes, complaintRes] = await Promise.all([
        apiGetAdminHealth(),
        apiGetAdminUsers(),
        apiGetAdminClasses(),
        apiGetComplaints()
      ]);
      setHealth(healthRes.data);
      setUsers(usersRes.data.users);
      setClasses(classRes.data.classGroups || []);
      setComplaints(complaintRes.data.complaints || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load admin data');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await apiUpdateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert(err.message || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    try {
      await apiDeleteUser(userId);
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch (err) {
      alert(err.message || 'Failed to delete user');
    }
  };

  const handleDeactivateClass = async (classId) => {
    if (!window.confirm('Are you sure you want to deactivate this class?')) return;
    try {
      await api.delete(`/classgroups/${classId}`);
      setClasses(prev => prev.map(c => c._id === classId ? { ...c, isActive: false } : c));
    } catch (err) {
      alert(err.message || 'Failed to deactivate class');
    }
  };

  const handleResolveComplaint = async (id, status) => {
    let msg = '';
    if (status === 'acknowledged') msg = 'Your complaint has been received and is being reviewed.';
    if (status === 'resolved') msg = 'This issue has been addressed.';
    
    const reply = window.prompt('Enter reply for the student:', msg);
    if (reply === null) return;

    try {
      await apiResolveComplaint(id, { status, adminReply: reply });
      setComplaints(prev => prev.map(c => c._id === id ? { ...c, status, adminReply: reply, resolvedAt: (status === 'resolved' ? new Date() : c.resolvedAt) } : c));
    } catch (err) {
      alert(err.message || 'Failed to update complaint');
    }
  };

  if (loading) return <><Topbar title="Admin Dashboard" /><div className="empty-state"><div className="empty-icon">⏳</div></div></>;

  return (
    <>
      <Topbar title="Admin Dashboard" showSearch={false} />
      <div className="page-content admin-page">
        {error && <div className="error-banner">{error}</div>}

        <div className="admin-grid">
          {/* Health Stats */}
          <div className="admin-card stats-card">
            <h3>System Health</h3>
            {health && (
              <div className="health-metrics">
                <div className="metric">
                  <span className="label">Uptime</span>
                  <span className="value">{Math.floor(health.uptime / 3600)}h {Math.floor((health.uptime % 3600) / 60)}m</span>
                </div>
                <div className="metric">
                  <span className="label">Database</span>
                  <span className={`value status-${health.database}`}>{health.database}</span>
                </div>
                <div className="metric">
                  <span className="label">Total Users</span>
                  <span className="value">{health.users.total}</span>
                </div>
                <div className="metric">
                  <span className="label">Heap Used</span>
                  <span className="value">{health.memoryUsage.heapUsed}</span>
                </div>
              </div>
            )}

              <div className="admin-nav" style={{ marginTop: 32 }}>
                <button 
                  className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => setActiveTab('users')}
                >
                  👥 Users
                </button>
                <button 
                  className={`nav-btn ${activeTab === 'classes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('classes')}
                >
                  🏫 Classes
                </button>
                <button 
                  className={`nav-btn ${activeTab === 'complaints' ? 'active' : ''}`}
                  onClick={() => setActiveTab('complaints')}
                >
                  🚩 Complaints {complaints.filter(c => c.status === 'open').length > 0 && <span className="badge">{complaints.filter(c => c.status === 'open').length}</span>}
                </button>
              </div>
            </div>

            {/* Dynamic Content Area */}
            <div className="admin-card content-card">
              {activeTab === 'users' ? (
                <>
                  <h3>User Management</h3>
                  <div className="table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u._id}>
                            <td>
                              <div className="user-info">
                                <div className="avatar small">{u.profile.firstName[0]}{u.profile.lastName[0]}</div>
                                <div>
                                  <div className="name">{u.profile.firstName} {u.profile.lastName}</div>
                                  <div className="username">@{u.username}</div>
                                </div>
                              </div>
                            </td>
                            <td>{u.email}</td>
                            <td>
                              <select 
                                className="role-select"
                                value={u.role}
                                onChange={(e) => handleRoleChange(u._id, e.target.value)}
                              >
                                <option value="student">Student</option>
                                <option value="cr">CR</option>
                                <option value="faculty">Faculty</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td>
                              <button className="btn-icon delete" onClick={() => handleDeleteUser(u._id)}>🗑️</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : activeTab === 'classes' ? (
                <>
                  <h3>Class Management</h3>
                  <div className="table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Class Name</th>
                          <th>Stream</th>
                          <th>Semester</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classes.map(c => (
                          <tr key={c._id}>
                            <td><div className="name">{c.name}</div></td>
                            <td>{c.stream}</td>
                            <td>{c.semester}</td>
                            <td>
                              <span className={`badge ${c.isActive ? 'badge-answered' : 'badge-open'}`}>
                                {c.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>
                              {c.isActive && (
                                <button className="btn-icon delete" onClick={() => handleDeactivateClass(c._id)} title="Deactivate">🚫</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <>
                  <h3>Student Complaints</h3>
                  <div className="table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Author</th>
                          <th>Subject</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {complaints.map(c => (
                          <tr key={c._id}>
                            <td>
                              <div className="user-info">
                                <div className="name">{c.author?.profile?.firstName} {c.author?.profile?.lastName}</div>
                                <div className="username">{c.author?.email}</div>
                                <a href={`mailto:${c.author?.email}`} className="contact-link" style={{ fontSize: 10, color: 'var(--accent)' }}>✉️ Contact CR</a>
                              </div>
                            </td>
                            <td>
                              <div className="complaint-subject" title={c.description}>
                                <strong>{c.subject}</strong>
                                <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{c.description.substring(0, 50)}...</p>
                                {c.adminReply && (
                                  <div className="admin-reply-preview">
                                    <strong>Reply:</strong> {c.adminReply}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <span className={`badge status-${c.status}`}>
                                {c.status}
                              </span>
                            </td>
                            <td>
                              {c.status === 'open' || c.status === 'acknowledged' ? (
                                <div style={{ display: 'flex', gap: 8 }}>
                                  {c.status === 'open' && (
                                    <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 11, background: 'rgba(255,193,7,0.1)', color: '#ffc107' }} onClick={() => handleResolveComplaint(c._id, 'acknowledged')}>Acknowledge</button>
                                  )}
                                  <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => handleResolveComplaint(c._id, 'resolved')}>Resolve</button>
                                  <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => handleResolveComplaint(c._id, 'dismissed')}>Dismiss</button>
                                </div>
                              ) : (
                                <span style={{ fontSize: 12, color: 'var(--muted)' }}>Finalized {new Date(c.resolvedAt).toLocaleDateString()}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
        </div>
      </div>
    </>
  );
}

