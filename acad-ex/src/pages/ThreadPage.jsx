import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import AnswerCard from '../components/AnswerCard';
import { useAuth } from '../context/AuthContext';
import { apiGetThread, apiPostAnswer, apiVoteQuestion, apiPinQuestion } from '../services/api';
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
  const [votes, setVotes]       = useState(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { question: q, answers: a } = await apiGetThread(id);
      setQuestion(q);
      setAnswers(a);
      setVotes(q?.votes || 0);
      setLoading(false);
    })();
  }, [id]);

  const handleVote = async (dir) => {
    setVotes(v => v + dir);
    try { await apiVoteQuestion(id, dir); } catch { setVotes(v => v - dir); }
  };

  const handleReply = async () => {
    if (!reply.trim()) return;
    setPosting(true);
    const newA = await apiPostAnswer(id, reply);
    setAnswers(prev => [...prev, newA]);
    setReply('');
    setPosting(false);
  };

  const handlePin = async () => {
    await apiPinQuestion(id);
    setQuestion(q => ({ ...q, pinned: !q.pinned }));
  };

  const handleAccepted = (answerId) => {
    setAnswers(prev => prev.map(a => ({ ...a, accepted: a.id === answerId })));
    setQuestion(q => ({ ...q, solved: true }));
  };

  if (loading) return (
    <>
      <Topbar title="Loading…" />
      <div className="empty-state"><div className="empty-icon">⏳</div></div>
    </>
  );

  if (!question) return (
    <>
      <Topbar title="Not Found" />
      <div className="empty-state">
        <div className="empty-icon">❓</div>
        <div className="empty-title">Question not found</div>
        <button className="btn btn-ghost" onClick={() => navigate('/')}>← Back to Forum</button>
      </div>
    </>
  );

  const timeAgo = (iso) => {
    const d = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (d < 3600) return Math.floor(d/60) + 'm ago';
    if (d < 86400) return Math.floor(d/3600) + 'h ago';
    return Math.floor(d/86400) + 'd ago';
  };

  return (
    <>
      <Topbar title="Thread" showSearch={false} />
      <div className="page-content" style={{ maxWidth: 800 }}>
        {/* Back */}
        <button className="btn btn-ghost" style={{ marginBottom:16, fontSize:13 }} onClick={() => navigate('/')}>
          ← Back to Forum
        </button>

        {/* Question */}
        <div className="thread-question">
          <div className="thread-header">
            <div className="thread-title">{question.title}</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
              {question.tags?.map(t => <span className="tag" key={t}>{t}</span>)}
              {question.pinned && <span className="tag" style={{ borderColor:'var(--amber)', color:'var(--amber)' }}>📌 Pinned</span>}
              <span className={question.solved ? 'badge-answered' : 'badge-open'}>
                {question.solved ? '✓ Answered' : 'Open'}
              </span>
            </div>
          </div>
          <div className="thread-body">{question.body}</div>
          <div className="thread-meta">
            <div className="avatar" style={{ width:28, height:28, fontSize:11, background:'rgba(124,106,247,0.2)', color:'var(--accent2)' }}>
              {question.author?.initials}
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:500 }}>{question.author?.name}</div>
              <div style={{ fontSize:11, color:'var(--muted)' }}>{question.className} · {timeAgo(question.createdAt)}</div>
            </div>
            <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
              <button className="vote-btn-q" onClick={() => handleVote(1)}>▲ {votes}</button>
              {isCR && (
                <button className="btn btn-ghost" style={{ fontSize:12, padding:'4px 12px' }} onClick={handlePin}>
                  {question.pinned ? '📌 Unpin' : '📌 Pin'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Answers */}
        <div className="answers-header">{answers.length} Answer{answers.length !== 1 ? 's' : ''}</div>
        {answers.length === 0 && (
          <div className="empty-state" style={{ padding:'24px 0' }}>
            <div className="empty-icon">🤔</div>
            <div className="empty-title">No answers yet</div>
            <p style={{ color:'var(--muted)', fontSize:13 }}>Be the first to help!</p>
          </div>
        )}
        {answers.map(a => (
          <AnswerCard
            key={a.id}
            answer={a}
            questionId={id}
            questionAuthorId={question.author?.id}
            onAccepted={handleAccepted}
          />
        ))}

        {/* Reply box */}
        <div className="reply-box">
          <h4>Your Answer</h4>
          <textarea
            className="form-input"
            rows={5}
            placeholder="Write a clear, helpful answer…"
            value={reply}
            onChange={e => setReply(e.target.value)}
            style={{ marginBottom:12 }}
          />
          <button className="btn btn-primary" onClick={handleReply} disabled={posting || !reply.trim()}>
            {posting ? 'Posting…' : 'Post Answer'}
          </button>
        </div>
      </div>
    </>
  );
}
