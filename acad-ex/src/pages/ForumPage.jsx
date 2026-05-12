import { useState, useEffect, useCallback } from 'react';
import Topbar from '../components/Topbar';
import QuestionCard from '../components/QuestionCard';
import AskQuestionModal from '../components/AskQuestionModal';
import { apiGetQuestions, apiPostQuestion } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import './ForumPage.css';

const TABS = [
  { key: 'all',        label: 'All Questions' },
  { key: 'unanswered', label: 'Unanswered'    },
  { key: 'mine',       label: 'My Posts'      },
];

export default function ForumPage() {
  const { user } = useAuth();
  const { activeClass } = useApp();
  const [questions, setQuestions] = useState([]);
  const [tab, setTab]             = useState('all');
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [askOpen, setAskOpen]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      // Map tab to backend query params
      if (tab === 'unanswered') params.isAnswered = false;
      if (tab === 'mine' && user?._id) params.author = user._id;
      if (search) params.search = search;
      if (activeClass && activeClass !== 'all') params.class = activeClass;

      const res = await apiGetQuestions(params);
      setQuestions(res.data?.posts || []);
    } catch (err) {
      console.error(err);
      setQuestions([]);
    }
    setLoading(false);
  }, [activeClass, tab, search, user]);

  useEffect(() => { load(); }, [load]);

  const handleAsk = async (payload) => {
    try {
      await apiPostQuestion(payload);
      load();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to post question. Check your connection and try again.');
    }
  };

  return (
    <>
      <Topbar
        title="Forum"
        onSearch={setSearch}
        onAskQuestion={() => setAskOpen(true)}
      />

      <div style={{ display: 'flex', flex: 1 }}>
        <div className="page-content">
          {/* Tabs */}
          <div className="tabs" style={{ marginBottom: 12 }}>
            {TABS.map(t => (
              <button key={t.key}
                className={`tab ${tab === t.key ? 'active' : ''}`}
                onClick={() => setTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="empty-state"><div className="empty-icon">⏳</div><div className="empty-title">Loading…</div></div>
          ) : questions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <div className="empty-title">No questions found</div>
              <p>Try a different filter or{' '}
                <button className="link-btn" onClick={() => setAskOpen(true)}>
                  ask a new question
                </button>.
              </p>
            </div>
          ) : (
            questions.map(q => <QuestionCard key={q._id} question={q} />)
          )}
        </div>

        {/* Right panel — recent activity placeholder */}
        <div className="forum-right-panel">
          <div className="panel-title">Tip</div>
          <div className="activity-item">
            <div className="a-dot" />
            <div className="a-text">Use the search bar to find questions by keyword or tag.</div>
          </div>
          <div className="activity-item">
            <div className="a-dot" style={{ background: 'var(--green)' }} />
            <div className="a-text">Switch to <strong>My Posts</strong> to see your own questions.</div>
          </div>
          <div className="activity-item">
            <div className="a-dot" style={{ background: 'var(--amber)' }} />
            <div className="a-text">Check <strong>Reminders</strong> for upcoming deadlines from your CR.</div>
          </div>
        </div>
      </div>

      <AskQuestionModal open={askOpen} onClose={() => setAskOpen(false)} onSubmit={handleAsk} />
    </>
  );
}
