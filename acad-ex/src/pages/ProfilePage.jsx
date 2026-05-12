import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fullName = user?.name || `${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`.trim() || 'User';
  const initials = user?.initials || fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const className = user?.academic?.class || '—';
  const stream   = user?.academic?.stream || '—';
  const semester = user?.academic?.semester ? `Semester ${user.academic.semester}` : '';

  return (
    <>
      <Topbar title="Profile" showSearch={false} />
      <div className="page-content" style={{ maxWidth: 680 }}>

        <div className="profile-card">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-info">
            <div className="profile-name">{fullName}</div>
            <div className="profile-roll">{user?.username}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
              {className} · {stream} {semester && `· ${semester}`}
            </div>
            <div className="profile-role-badge">
              {user?.role === 'cr' ? '⭐ Class Representative'
                : user?.role === 'faculty' ? '🎓 Faculty'
                : user?.role === 'admin' ? '🛡️ Admin'
                : '👤 Student'}
            </div>
          </div>
          <button className="btn btn-danger" style={{ marginLeft: 'auto' }} onClick={logout}>
            🚪 Logout
          </button>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-num">{user?.stats?.questionsAsked ?? 0}</div>
            <div className="stat-label">Questions Asked</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{user?.stats?.answersGiven ?? 0}</div>
            <div className="stat-label">Answers Given</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{user?.stats?.helpfulVotes ?? 0}</div>
            <div className="stat-label">Votes Received</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{user?.stats?.bestAnswers ?? 0}</div>
            <div className="stat-label">Best Answers</div>
          </div>
        </div>

        <div className="profile-section-title">Account Details</div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Email</div>
              <div style={{ fontSize: 14 }}>{user?.email || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Username</div>
              <div style={{ fontSize: 14 }}>{user?.username || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Class</div>
              <div style={{ fontSize: 14 }}>{className}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Stream</div>
              <div style={{ fontSize: 14 }}>{stream}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
