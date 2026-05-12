import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import AnswerCard from '../components/AnswerCard';
import { useAuth } from '../context/AuthContext';
import { apiGetThread, apiPostAnswer, apiVoteQuestion, apiPinPost, apiDeletePost } from '../services/api';
import './ThreadPage.css';

export default function ThreadPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user, isCR } = useAuth();

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers]   = useState([]);
  const [reply, setReply]       = useState('');
  const [loading, setLoading]   = useState(true);
  const [posting, setPosting]   = useState(false);
  const [voteScore, setVoteScore] = useState(0);
  const [userVoted, setUserVoted] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { question: q, answers: a } = await apiGetThread(id);
        setQuestion(q);
        setAnswers(a);
        setVoteScore(q?.voteScore ?? 0);
        setUserVoted(q?.votes?.upvotes?.some(v => (v.user?._id || v.user) === user?._id));
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [id, user?._id]);

  const timeAgo = (iso) => {
    const d = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (d < 3600) return Math.floor(d / 60) + 'm ago';
    if (d < 86400) return Math.floor(d / 3600) + 'h ago';
    return Math.floor(d / 86400) + 'd ago';
  };

  const [voting, setVoting] = useState(false);

  const handleVote = async (dir) => {
    if (voting) return;
    setVoting(true);
    try {
      const res = await apiVoteQuestion(id, dir);
      if (res.data && res.data.voteScore !== undefined) {
        setVoteScore(res.data.voteScore);
        setUserVoted(prev => !prev);
      }
    } catch (e) {
      console.error(e);
    }
    setVoting(false);
  };

  const handleReply = async () => {
    if (!reply.trim()) return;
    setPosting(true);
    try {
      const res = await apiPostAnswer(id, reply);
      setAnswers(prev => [...prev, res.data.comment]);
      setReply('');
    } catch (e) { console.error(e); }
    setPosting(false);
  };

  const handleAccepted = (commentId) => {
    setAnswers(prev => prev.map(a => ({ ...a, isBestAnswer: a._id === commentId })));
    setQuestion(q => ({ ...q, isAnswered: true }));
  };

  const authorName = (a) => a?.profile
    ? `${a.profile.firstName} ${a.profile.lastName}`.trim()
    : a?.username || 'Unknown';

  const handlePin = async () => {
    try {
      const res = await apiPinPost(id);
      setQuestion(prev => ({ ...prev, isPinned: res.data.isPinned }));
    } catch (e) { alert(e.message || 'Failed to pin post'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      await apiDeletePost(id);
      navigate('/');
    } catch (e) { alert(e.message || 'Failed to delete post'); }
  };

  const canModerate = user?.role === 'admin' || (user?.role === 'cr' && question?.class === user?.academic?.class);

  if (loading) return (
    <><Topbar title="Loading…" /><div className="empty-state"><div className="empty-icon">⏳</div></div></>
  );
  if (!question) return (
    <><Topbar title="Not Found" />
      <div className="empty-state">
        <div className="empty-icon">❓</div>
        <div className="empty-title">Question not found</div>
        <button className="btn btn-ghost" onClick={() => navigate('/')}>← Back to Forum</button>
      </div>
    </>
  );

  return (
    <>
      <Topbar title="Thread" showSearch={false} />
      <div className="page-content" style={{ maxWidth: 800 }}>
        <button className="btn btn-ghost" style={{ marginBottom: 16, fontSize: 13 }} onClick={() => navigate('/')}>
          ← Back to Forum
        </button>

        {/* Question */}
        <div className="thread-question">
          <div className="thread-header">
            <div className="thread-title">{question.title}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {question.tags?.map(t => <span className="tag" key={t}>{t}</span>)}
              <span className={question.isAnswered ? 'badge-answered' : 'badge-open'}>
                {question.isAnswered ? '✓ Answered' : 'Open'}
              </span>
            </div>
          </div>
          <div className="thread-body">{question.content || question.body}</div>
          <div className="thread-meta">
            <div className="avatar" style={{ width: 28, height: 28, fontSize: 11, background: 'rgba(124,106,247,0.2)', color: 'var(--accent2)' }}>
              {authorName(question.author).split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{authorName(question.author)}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{question.academic?.class} · {timeAgo(question.createdAt)}</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              {canModerate && (
                <>
                  <button className="btn-icon" onClick={handlePin} title="Pin post">
                    {question.isPinned ? '📌' : '📍'}
                  </button>
                  <button className="btn-icon" onClick={handleDelete} title="Delete post">🗑️</button>
                </>
              )}
              <button 
                className={`vote-btn-q ${userVoted ? 'active' : ''}`} 
                onClick={() => handleVote(1)}
                style={userVoted ? { color: 'var(--accent)', borderColor: 'var(--accent)', background: 'rgba(124,106,247,0.1)' } : {}}
              >
                ▲ {voteScore}
              </button>
            </div>
          </div>
        </div>

        {/* Answers */}
        <div className="answers-header">{answers.length} Answer{answers.length !== 1 ? 's' : ''}</div>
        {answers.length === 0 && (
          <div className="empty-state" style={{ padding: '24px 0' }}>
            <div className="empty-icon">🤔</div>
            <div className="empty-title">No answers yet</div>
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>Be the first to help!</p>
          </div>
        )}
        {answers.map(a => (
          <AnswerCard
            key={a._id}
            answer={a}
            questionId={id}
            questionAuthorId={question.author?._id}
            onAccepted={handleAccepted}
          />
        ))}

        {/* Reply box */}
        <div className="reply-box">
          <h4>Your Answer</h4>
          <textarea
            className="form-input" rows={5}
            placeholder="Write a clear, helpful answer…"
            value={reply} onChange={e => setReply(e.target.value)}
            style={{ marginBottom: 12 }}
          />
          <button className="btn btn-primary" onClick={handleReply}
            disabled={posting || !reply.trim()}>
            {posting ? 'Posting…' : 'Post Answer'}
          </button>
        </div>
      </div>
    </>
  );
}
