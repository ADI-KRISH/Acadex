import { useState } from 'react';
import Modal from './Modal';
import { CLASS_MAP } from '../services/mockData';

export default function AddReminderModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({ title: '', dueDate: '', classId: 'cs', priority: 'urgent' });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    setLoading(true);
    await onSubmit({ ...form, className: CLASS_MAP[form.classId]?.label || form.classId });
    setForm({ title: '', dueDate: '', classId: 'cs', priority: 'urgent' });
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
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Due Date</label>
          <input type="date" className="form-input"
            value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Class</label>
          <select className="form-input" value={form.classId} onChange={e => set('classId', e.target.value)}>
            {Object.entries(CLASS_MAP).map(([k, { label }]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Priority</label>
        <select className="form-input" value={form.priority} onChange={e => set('priority', e.target.value)}>
          <option value="urgent">🔴 Urgent</option>
          <option value="soon">🟡 Soon</option>
          <option value="normal">🔵 Normal</option>
        </select>
      </div>
      <button className="btn btn-primary" style={{ width:'100%', padding:'11px', justifyContent:'center' }}
        onClick={handleSubmit} disabled={loading || !form.title.trim()}>
        {loading ? 'Adding…' : 'Add Reminder'}
      </button>
    </Modal>
  );
}
