import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiVoteAnswer, apiAcceptAnswer } from '../services/api';
import './AnswerCard.css';

export default function AnswerCard({ answer, questionId, questionAuthorId, onAccepted }) {
  const { user, isCR } = useAuth();
  const [votes, setVotes] = useState(answer.votes);
  const [accepted, setAccepted] = useState(answer.accepted);

  const canAccept = user?.id === questionAuthorId || isCR;

  const timeAgo = (iso) => {
    const d = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (d < 60) return 'just now';
    if (d < 3600) return Math.floor(d/60) + 'm ago';
    if (d < 86400) return Math.floor(d/3600) + 'h ago';
    return Math.floor(d/86400) + 'd ago';
  };

  const handleVote = async (dir) => {
    setVotes(v => v + dir);
    try { await apiVoteAnswer(answer.id, dir); } catch { setVotes(v => v - dir); }
  };

  const handleAccept = async () => {
    try {
      await apiAcceptAnswer(answer.id, questionId);
      setAccepted(true);
      onAccepted?.(answer.id);
    } catch (e) { console.error(e); }
  };

  return (
    <div className={`answer-card fade-in ${accepted ? 'accepted' : ''}`}>
      {accepted && (
        <div className="accepted-badge">✓ Accepted Answer</div>
      )}
      <div className="answer-text">{answer.body}</div>
      <div className="answer-footer">
        <button className="vote-btn" onClick={() => handleVote(1)}>▲ {votes} helpful</button>
        <span className="answer-author">
          <span className="avatar" style={{ width:22, height:22, fontSize:9, background:'rgba(124,106,247,0.2)', color:'var(--accent2)', display:'inline-flex', alignItems:'center', justifyContent:'center', borderRadius:'50%', marginRight:6 }}>
            {answer.author?.initials}
          </span>
          {answer.author?.name} · {timeAgo(answer.createdAt)}
        </span>
        {canAccept && !accepted && (
          <button className="btn btn-ghost" style={{ fontSize:12, padding:'4px 12px', marginLeft:'auto' }} onClick={handleAccept}>
            ✓ Accept
          </button>
        )}
      </div>
    </div>
  );
}
