import { useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';

export default function AskQuestionModal({ open, onClose, onSubmit }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '', content: '',
    tags: '',
    class:  user?.academic?.class  || '',
    stream: user?.academic?.stream || '',
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    const title = form.title.trim();
    const content = form.content.trim();
    
    if (title.length < 5) {
      alert('Title must be at least 5 characters long.');
      return;
    }
    if (content.length < 10) {
      alert('Please provide more details (at least 10 characters).');
      return;
    }
    if (!form.class.trim() || !form.stream.trim()) {
      alert('Class and Stream are required.');
      return;
    }

    setLoading(true);
    try {
      const tags = form.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
      await onSubmit({
        title,
        content,
        tags: tags.length ? tags : ['general'],
        class: form.class.trim(),
        stream: form.stream.trim(),
      });
      setForm({ title: '', content: '', tags: '', class: user?.academic?.class || '', stream: user?.academic?.stream || '' });
      onClose();
    } catch (err) {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
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
          value={form.content} onChange={e => set('content', e.target.value)} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Class</label>
          <input className="form-input" placeholder="e.g. CS-A"
            value={form.class} onChange={e => set('class', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Stream</label>
          <input className="form-input" placeholder="e.g. Computer Science"
            value={form.stream} onChange={e => set('stream', e.target.value)} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Tags (comma-separated)</label>
        <input className="form-input" placeholder="cv, python, exam…"
          value={form.tags} onChange={e => set('tags', e.target.value)} />
      </div>
      <button className="btn btn-primary"
        style={{ width: '100%', padding: '11px', justifyContent: 'center' }}
        onClick={handleSubmit} disabled={loading || !form.title.trim()}>
        {loading ? 'Posting…' : 'Post Question'}
      </button>
    </Modal>
  );
}
