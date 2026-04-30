import { useState, useEffect, useCallback } from 'react';
import Topbar from '../components/Topbar';
import QuestionCard from '../components/QuestionCard';
import AskQuestionModal from '../components/AskQuestionModal';
import { apiGetQuestions, apiPostQuestion } from '../services/api';
import { TAG_LABELS, MOCK_REMINDERS } from '../services/mockData';
import './ForumPage.css';

const TABS = [
  { key: 'all', label: 'All Questions' },
  { key: 'unanswered', label: 'Unanswered' },
  { key: 'mine', label: 'My Posts' },
];

export default function ForumPage({ activeClass }) {
  const [questions, setQuestions] = useState([]);
  const [tab, setTab]             = useState('all');
  const [tag, setTag]             = useState('all');
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [askOpen, setAskOpen]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await apiGetQuestions({ classId: activeClass, tab, tag, search });
    setQuestions(data);
    setLoading(false);
  }, [activeClass, tab, tag, search]);

  useEffect(() => { load(); }, [load]);

  const handleAsk = async (payload) => {
    await apiPostQuestion(payload);
    load();
  };

  return (
    <>
      <Topbar
        title="Forum"
        onSearch={setSearch}
        onAskQuestion={() => setAskOpen(true)}
      />

      <div style={{ display:'flex', flex:1 }}>
        {/* Main content */}
        <div className="page-content">
          {/* Announcement */}
          <div className="announce-bar">
            <span>📢</span>
            <div><strong>Mid-sem exams in 2 weeks.</strong> Lab submissions due this Friday. Post your doubts early!</div>
          </div>

          {/* Tabs */}
          <div className="tabs">
            {TABS.map(t => (
              <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Tag filters */}
          <div className="filters">
            <button className={`filter-chip ${tag === 'all' ? 'active' : ''}`} onClick={() => setTag('all')}>All</button>
            {Object.entries(TAG_LABELS).map(([k, l]) => (
              <button key={k} className={`filter-chip ${tag === k ? 'active' : ''}`} onClick={() => setTag(k)}>{l}</button>
            ))}
          </div>

          {/* Questions */}
          {loading ? (
            <div className="empty-state"><div className="empty-icon">⏳</div><div className="empty-title">Loading…</div></div>
          ) : questions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <div className="empty-title">No questions found</div>
              <p>Try a different filter or <button className="link-btn" onClick={() => setAskOpen(true)}>ask a new question</button>.</p>
            </div>
          ) : (
            questions.map(q => <QuestionCard key={q.id} question={q} />)
          )}
        </div>

        {/* Right panel */}
        <div className="forum-right-panel">
          <div className="panel-title">Upcoming</div>
          {MOCK_REMINDERS.slice(0, 3).map(r => (
            <div key={r.id} className={`mini-reminder ${r.priority}`}>
              <div className="mr-title">{r.title}</div>
              <div className="mr-meta"><span>{r.className}</span><span>{r.dueDate}</span></div>
            </div>
          ))}

          <div className="panel-title" style={{ marginTop: 24 }}>Recent Activity</div>
          <div className="activity-item"><div className="a-dot" /><div className="a-text"><strong>Ihsal Riyas</strong> answered your SIFT keypoints question</div></div>
          <div className="activity-item"><div className="a-dot" style={{ background:'var(--green)' }} /><div className="a-text"><strong>CR</strong> posted a new reminder for WSN assignment</div></div>
          <div className="activity-item"><div className="a-dot" style={{ background:'var(--amber)' }} /><div className="a-text"><strong>Dhruv Nair</strong> upvoted your answer on Otsu's method</div></div>
          <div className="activity-item"><div className="a-dot" /><div className="a-text"><strong>Faculty</strong> commented on the SE Lab discussion</div></div>
        </div>
      </div>

      <AskQuestionModal open={askOpen} onClose={() => setAskOpen(false)} onSubmit={handleAsk} />
    </>
  );
}
