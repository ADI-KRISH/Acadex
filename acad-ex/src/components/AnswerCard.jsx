import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiVoteAnswer, apiAcceptAnswer } from '../services/api';
import './AnswerCard.css';

export default function AnswerCard({ answer, questionId, questionAuthorId, onAccepted }) {
  const { user, isCR } = useAuth();
  const [voteScore, setVoteScore] = useState(
    answer.voteScore ?? ((answer.votes?.upvotes?.length || 0) - (answer.votes?.downvotes?.length || 0))
  );
  const [accepted, setAccepted] = useState(answer.isBestAnswer ?? false);
  const [userVoted, setUserVoted] = useState(
    answer.votes?.upvotes?.some(v => (v.user?._id || v.user) === user?._id)
  );

  const canAccept = user?._id === questionAuthorId || isCR;

  const timeAgo = (iso) => {
    const d = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (d < 60) return 'just now';
    if (d < 3600) return Math.floor(d / 60) + 'm ago';
    if (d < 86400) return Math.floor(d / 3600) + 'h ago';
    return Math.floor(d / 86400) + 'd ago';
  };

  const authorName = answer.author?.profile
    ? `${answer.author.profile.firstName} ${answer.author.profile.lastName}`.trim()
    : answer.author?.username || 'Unknown';
  const initials = authorName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const [voting, setVoting] = useState(false);

  const hasUpvoted = answer.votes?.upvotes?.some(v => (v.user?._id || v.user) === user?._id);

  const handleVote = async (dir) => {
    if (voting) return;
    setVoting(true);
    try {
      const res = await apiVoteAnswer(answer._id, dir);
      if (res.data && res.data.voteScore !== undefined) {
        setVoteScore(res.data.voteScore);
        // Toggle the local state based on whether it was already upvoted
        setUserVoted(prev => !prev);
      }
    } catch (e) {
      console.error(e);
    }
    setVoting(false);
  };

  const handleAccept = async () => {
    try {
      await apiAcceptAnswer(answer._id, questionId);
      setAccepted(true);
      onAccepted?.(answer._id);
    } catch (e) { console.error(e); }
  };

  return (
    <div className={`answer-card fade-in ${accepted ? 'accepted' : ''}`}>
      {accepted && <div className="accepted-badge">✓ Accepted Answer</div>}
      <div className="answer-text">{answer.content || answer.body}</div>
      <div className="answer-footer">
        <button 
          className={`vote-btn ${userVoted ? 'active' : ''}`} 
          onClick={() => handleVote(1)}
          style={userVoted ? { color: 'var(--accent)', borderColor: 'var(--accent)' } : {}}
        >
          ▲ {voteScore} helpful
        </button>
        <span className="answer-author">
          <span className="avatar" style={{ width: 22, height: 22, fontSize: 9, background: 'rgba(124,106,247,0.2)', color: 'var(--accent2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', marginRight: 6 }}>
            {initials}
          </span>
          {authorName} · {timeAgo(answer.createdAt)}
        </span>
        {canAccept && !accepted && (
          <button className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 12px', marginLeft: 'auto' }} onClick={handleAccept}>
            ✓ Accept
          </button>
        )}
      </div>
    </div>
  );
}
