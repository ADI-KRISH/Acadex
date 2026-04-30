import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './QuestionCard.css';

export default function QuestionCard({ question }) {
  const navigate = useNavigate();
  const { isCR } = useAuth();

  const timeAgo = (iso) => {
    const d = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (d < 60) return 'just now';
    if (d < 3600) return Math.floor(d/60) + 'm ago';
    if (d < 86400) return Math.floor(d/3600) + 'h ago';
    return Math.floor(d/86400) + 'd ago';
  };

  return (
    <div
      className={`question-card fade-in ${question.pinned ? 'pinned' : ''}`}
      onClick={() => navigate(`/question/${question.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/question/${question.id}`)}
    >
      <div className="q-header">
        <div
          className="avatar q-avatar"
          style={{ background: `rgba(124,106,247,0.2)`, color: 'var(--accent2)' }}
        >
          {question.author?.initials || '?'}
        </div>
        <div className="q-meta">
          <div className="q-author">{question.author?.name} · {question.className}</div>
        </div>
        {question.pinned && <span className="pin-label">📌 Pinned</span>}
        <span className={question.solved ? 'badge-answered' : 'badge-open'}>
          {question.solved ? '✓ Answered' : 'Open'}
        </span>
      </div>

      <div className="q-title">{question.title}</div>
      <div className="q-excerpt">{question.body?.slice(0, 130)}…</div>

      <div className="q-tags">
        {question.tags?.map(t => (
          <span className="tag" key={t}>{t}</span>
        ))}
      </div>

      <div className="q-footer">
        <div className="q-stat"><span>▲</span> {question.votes}</div>
        <div className="q-stat"><span>💬</span> {question.answers} answers</div>
        <span className="q-time">{timeAgo(question.createdAt)}</span>
        <span className="class-label">{question.className}</span>
      </div>
    </div>
  );
}
