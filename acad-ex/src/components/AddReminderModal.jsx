import { useState } from 'react';
import Modal from './Modal';
import { apiGetPublicClassGroups } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PRIORITY_MAP = { urgent: 'high', soon: 'medium', normal: 'low' };

export default function AddReminderModal({ open, onClose, onSubmit }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '', description: '', dueDate: '',
    class: user?.academic?.class || '',
    stream: user?.academic?.stream || '',
    priority: 'urgent',
    type: 'assignment',
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.dueDate || !form.class || !form.stream) return;
    setLoading(true);
    await onSubmit({
      ...form,
      priority: PRIORITY_MAP[form.priority] || 'medium',
    });
    setForm({ title: '', description: '', dueDate: '', class: user?.academic?.class || '', stream: user?.academic?.stream || '', priority: 'urgent', type: 'assignment' });
    setLoading(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Reminder">
      <div className="form-group">
        <label className="form-label">Title *</label>
        <input className="form-input" placeholder="Assignment / Test name"
          value={form.title} onChange={e => set('title', e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="form-input" rows={2} placeholder="Optional details…"
          value={form.description} onChange={e => set('description', e.target.value)} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Due Date *</label>
          <input type="date" className="form-input"
            value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Type</label>
          <select className="form-input" value={form.type} onChange={e => set('type', e.target.value)}>
            <option value="assignment">Assignment</option>
            <option value="exam">Exam</option>
            <option value="lab">Lab</option>
            <option value="general">General</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Class *</label>
          <input className="form-input" placeholder="e.g. CS-A"
            value={form.class} onChange={e => set('class', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Stream *</label>
          <input className="form-input" placeholder="e.g. Computer Science"
            value={form.stream} onChange={e => set('stream', e.target.value)} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Priority</label>
        <select className="form-input" value={form.priority} onChange={e => set('priority', e.target.value)}>
          <option value="urgent">🔴 Urgent (High)</option>
          <option value="soon">🟡 Soon (Medium)</option>
          <option value="normal">🔵 Normal (Low)</option>
        </select>
      </div>
      <button className="btn btn-primary" style={{ width: '100%', padding: '11px', justifyContent: 'center' }}
        onClick={handleSubmit} disabled={loading || !form.title.trim() || !form.dueDate}>
        {loading ? 'Adding…' : 'Add Reminder'}
      </button>
    </Modal>
  );
}
