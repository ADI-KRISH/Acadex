import { useState } from 'react';
import Modal from './Modal';

export default function ChatCustomizeModal({ open, onClose, groupName, onApply }) {
  const [form, setForm] = useState({ name: groupName || '', bg: '#0f0f13', bubble: '#3d3680', fontSize: 14 });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleApply = () => {
    onApply(form);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Customise Chat">
      <div className="form-group">
        <label className="form-label">Chat Group Name</label>
        <input className="form-input" placeholder="e.g. CSE-AI A — General"
          value={form.name} onChange={e => set('name', e.target.value)} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Background Colour</label>
          <input type="color" className="form-input" value={form.bg}
            onChange={e => set('bg', e.target.value)}
            style={{ height:44, padding:'4px 8px', cursor:'pointer' }} />
        </div>
        <div className="form-group">
          <label className="form-label">Your Bubble Colour</label>
          <input type="color" className="form-input" value={form.bubble}
            onChange={e => set('bubble', e.target.value)}
            style={{ height:44, padding:'4px 8px', cursor:'pointer' }} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Font Size — {form.fontSize}px</label>
        <input type="range" min={11} max={20} value={form.fontSize}
          onChange={e => set('fontSize', Number(e.target.value))}
          style={{ width:'100%', accentColor:'var(--accent)' }} />
      </div>
      <button className="btn btn-primary" style={{ width:'100%', padding:'11px', justifyContent:'center' }} onClick={handleApply}>
        Apply Changes
      </button>
    </Modal>
  );
}
