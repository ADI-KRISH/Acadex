import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './QuestionCard.css';

export default function QuestionCard({ question: q }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const timeAgo = (iso) => {
    const d = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (d < 60) return 'just now';
    if (d < 3600) return Math.floor(d / 60) + 'm ago';
    if (d < 86400) return Math.floor(d / 3600) + 'h ago';
    return Math.floor(d / 86400) + 'd ago';
  };

  // Map backend shape to display values
  const authorName = q.author?.profile
    ? `${q.author.profile.firstName} ${q.author.profile.lastName}`.trim()
    : q.author?.username || 'Unknown';
  const initials = authorName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const votes    = q.voteScore ?? (q.votes?.upvotes?.length || 0) - (q.votes?.downvotes?.length || 0);
  const answers  = q.answerCount ?? 0;
  const solved   = q.isAnswered ?? false;
  const tags     = q.tags || [];

  return (
    <div
      className={`question-card fade-in ${q.isPinned ? 'pinned' : ''}`}
      onClick={() => navigate(`/question/${q._id}`)}
      role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/question/${q._id}`)}
    >
      <div className="q-header">
        <div className="avatar q-avatar" style={{ background: 'rgba(124,106,247,0.2)', color: 'var(--accent2)' }}>
          {initials}
        </div>
        <div className="q-meta">
          <div className="q-author">
            {q.isPinned && <span style={{ marginRight: 6 }}>📌</span>}
            {authorName} · {q.academic?.class || q.classGroup?.name || ''}
          </div>
          <span className="q-time">{timeAgo(q.createdAt)}</span>
        </div>
        <span className={solved ? 'badge-answered' : 'badge-open'}>
          {solved ? '✓ Answered' : 'Open'}
        </span>
      </div>

      <div className="q-title">{q.title}</div>
      <div className="q-excerpt">{(q.content || q.body || '').slice(0, 140)}…</div>

      <div className="q-tags">
        {tags.map(t => <span className="tag" key={t}>{t}</span>)}
      </div>

      <div className="q-footer">
        <div className="q-stat"><span>▲</span> {votes}</div>
        <div className="q-stat"><span>💬</span> {answers} answers</div>
        <span className="q-time">{timeAgo(q.createdAt)}</span>
      </div>
    </div>
  );
}
