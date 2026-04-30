import { useAuth } from '../context/AuthContext';
import { apiDeleteReminder } from '../services/api';
import './ReminderCard.css';

const PRIORITY_LABELS = { urgent: 'Urgent', soon: 'Soon', normal: 'Normal' };

export default function ReminderCard({ reminder, onDeleted }) {
  const { isCR } = useAuth();

  const daysLeft = () => {
    const diff = Math.ceil((new Date(reminder.dueDate) - Date.now()) / 86400000);
    if (diff < 0) return 'Overdue';
    if (diff === 0) return 'Due Today';
    if (diff === 1) return 'Due Tomorrow';
    return `Due in ${diff} days`;
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this reminder?')) return;
    await apiDeleteReminder(reminder.id);
    onDeleted?.(reminder.id);
  };

  return (
    <div className={`reminder-card ${reminder.priority}`}>
      <div className="reminder-top">
        <div className="reminder-title">{reminder.title}</div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span className={`priority-badge ${reminder.priority}`}>
            {PRIORITY_LABELS[reminder.priority]}
          </span>
          {isCR && (
            <button className="rem-delete" onClick={handleDelete} title="Delete reminder">✕</button>
          )}
        </div>
      </div>
      <div className="reminder-meta">
        <span>{reminder.className}</span>
        <span className={`due-label ${reminder.priority}`}>{daysLeft()}</span>
      </div>
      <div className="reminder-date">{reminder.dueDate}</div>
    </div>
  );
}
