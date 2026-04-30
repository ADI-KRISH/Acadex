import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import { MOCK_QUESTIONS } from '../services/mockData';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const myQuestions = MOCK_QUESTIONS.filter(q => q.mine);
  const myAnswered  = MOCK_QUESTIONS.filter(q => q.solved && !q.mine);

  return (
    <>
      <Topbar title="Profile" showSearch={false} />
      <div className="page-content" style={{ maxWidth: 680 }}>

        {/* Profile card */}
        <div className="profile-card">
          <div className="profile-avatar">
            {user?.initials || 'U'}
          </div>
          <div className="profile-info">
            <div className="profile-name">{user?.name}</div>
            <div className="profile-roll">{user?.rollNo}</div>
            <div className="profile-role-badge">
              {user?.role === 'cr' ? '⭐ Class Representative' : '🎓 Student'}
            </div>
          </div>
          <button className="btn btn-danger" style={{ marginLeft:'auto' }} onClick={logout}>
            🚪 Logout
          </button>
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-num">{myQuestions.length}</div>
            <div className="stat-label">Questions Asked</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">3</div>
            <div className="stat-label">Answers Given</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">18</div>
            <div className="stat-label">Votes Received</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">1</div>
            <div className="stat-label">Accepted Answers</div>
          </div>
        </div>

        {/* My Questions */}
        <div className="profile-section-title">My Questions</div>
        {myQuestions.length === 0 ? (
          <div className="empty-state" style={{ padding:'24px 0' }}>
            <div className="empty-icon">💬</div>
            <div className="empty-title">No questions posted yet</div>
          </div>
        ) : (
          myQuestions.map(q => (
            <div
              key={q.id}
              className="profile-q-row"
              onClick={() => navigate(`/question/${q.id}`)}
            >
              <div className="profile-q-title">{q.title}</div>
              <div className="profile-q-meta">
                <span className={q.solved ? 'badge-answered' : 'badge-open'} style={{ fontSize:10 }}>
                  {q.solved ? '✓ Answered' : 'Open'}
                </span>
                <span style={{ fontSize:11, color:'var(--muted)' }}>▲ {q.votes} · 💬 {q.answers}</span>
                <span className="tag" style={{ fontSize:10 }}>{q.className}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
