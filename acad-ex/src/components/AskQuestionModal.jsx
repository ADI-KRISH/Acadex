import { useState } from 'react';
import Modal from './Modal';
import { CLASS_MAP, TAG_LABELS } from '../services/mockData';

export default function AskQuestionModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({ title: '', body: '', classId: 'cs', tags: '' });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    setLoading(true);
    const tags = form.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    await onSubmit({ ...form, tags: tags.length ? tags : ['general'], className: CLASS_MAP[form.classId]?.label });
    setForm({ title: '', body: '', classId: 'cs', tags: '' });
    setLoading(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Ask a Question">
      <div className="form-group">
        <label className="form-label">Question Title *</label>
        <input className="form-input" placeholder="What is your question? Be specific."
          value={form.title} onChange={e => set('title', e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Details</label>
        <textarea className="form-input" rows={4}
          placeholder="Explain the problem, what you've tried, and what you expected…"
          value={form.body} onChange={e => set('body', e.target.value)} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Class / Subject</label>
          <select className="form-input" value={form.classId} onChange={e => set('classId', e.target.value)}>
            {Object.entries(CLASS_MAP).map(([k, { label }]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Tags (comma-separated)</label>
          <input className="form-input" placeholder="cv, python, exam…"
            value={form.tags} onChange={e => set('tags', e.target.value)} />
        </div>
      </div>
      <button className="btn btn-primary" style={{ width:'100%', padding:'11px', justifyContent:'center' }}
        onClick={handleSubmit} disabled={loading || !form.title.trim()}>
        {loading ? 'Posting…' : 'Post Question'}
      </button>
    </Modal>
  );
}
