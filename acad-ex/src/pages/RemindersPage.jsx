import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import ReminderCard from '../components/ReminderCard';
import AddReminderModal from '../components/AddReminderModal';
import { useAuth } from '../context/AuthContext';
import { apiGetReminders, apiPostReminder } from '../services/api';

export default function RemindersPage() {
  const { isCR }              = useAuth();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await apiGetReminders();
    setReminders(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (payload) => {
    const newR = await apiPostReminder(payload);
    setReminders(prev => [newR, ...prev]);
  };

  const handleDeleted = (id) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  return (
    <>
      <Topbar title="Reminders" showSearch={false} />
      <div className="page-content" style={{ maxWidth: 700 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:600 }}>Reminders</h2>
          {isCR && (
            <button className="btn btn-primary" onClick={() => setModalOpen(true)}>+ Add Reminder</button>
          )}
        </div>

        {!isCR && (
          <div className="announce-bar" style={{ marginBottom:16 }}>
            <span>ℹ️</span>
            <div>Only Class Representatives can add reminders. Contact your CR to post deadlines.</div>
          </div>
        )}

        {loading ? (
          <div className="empty-state"><div className="empty-icon">⏳</div><div className="empty-title">Loading…</div></div>
        ) : reminders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📌</div>
            <div className="empty-title">No reminders yet</div>
            <p style={{ color:'var(--muted)', fontSize:13 }}>{isCR ? 'Add the first reminder for your class.' : 'Your CR hasn\'t posted any reminders yet.'}</p>
          </div>
        ) : (
          reminders.map(r => <ReminderCard key={r.id} reminder={r} onDeleted={handleDeleted} />)
        )}
      </div>

      {isCR && (
        <AddReminderModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleAdd} />
      )}
    </>
  );
}
