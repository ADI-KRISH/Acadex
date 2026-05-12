import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import ReminderCard from '../components/ReminderCard';
import AddReminderModal from '../components/AddReminderModal';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { apiGetReminders, apiPostReminder } from '../services/api';

export default function RemindersPage() {
  const { isCR, user }         = useAuth();
  const { activeClass }        = useApp();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (user?.role === 'admin') {
        if (activeClass && activeClass !== 'all') params.class = activeClass;
        // if all, leave params empty to get everything
      } else {
        const targetClass = (activeClass && activeClass !== 'all') ? activeClass : user?.academic?.class;
        if (targetClass) params.class = targetClass;
        if (user?.academic?.stream) params.stream = user.academic.stream;
      }
      
      const res = await apiGetReminders(params);
      setReminders(res.data?.reminders || []);
    } catch (e) {
      console.error(e);
      setReminders([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [activeClass]);

  const handleAdd = async (payload) => {
    try {
      const res = await apiPostReminder(payload);
      setReminders(prev => [res.data.reminder, ...prev]);
    } catch (e) { console.error(e); }
  };

  const handleDeleted = (id) => setReminders(prev => prev.filter(r => r._id !== id));

  // Map backend priority back to frontend display label
  const mapPriority = (p) => {
    if (p === 'high')   return 'urgent';
    if (p === 'medium') return 'soon';
    return 'normal';
  };

  return (
    <>
      <Topbar title="Reminders" showSearch={false} />
      <div className="page-content" style={{ maxWidth: 700 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600 }}>Reminders</h2>
          {isCR && (
            <button className="btn btn-primary" onClick={() => setModalOpen(true)}>+ Add Reminder</button>
          )}
        </div>

        {!isCR && (
          <div className="announce-bar" style={{ marginBottom: 16 }}>
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
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>
              {isCR ? 'Add the first reminder for your class.' : "Your CR hasn't posted any reminders yet."}
            </p>
          </div>
        ) : (
          reminders.map(r => (
            <ReminderCard
              key={r._id}
              reminder={{ ...r, id: r._id, priority: mapPriority(r.priority), className: r.class || r.stream }}
              onDeleted={handleDeleted}
            />
          ))
        )}
      </div>

      {isCR && (
        <AddReminderModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleAdd} />
      )}
    </>
  );
}
