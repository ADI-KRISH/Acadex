import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiGetPublicClassGroups } from '../services/api';
import './LoginPage.css';

export default function LoginPage() {
  const [mode, setMode]           = useState('login');
  const [form, setForm]           = useState({
    email: '', password: '', username: '',
    firstName: '', lastName: '', classGroupId: '',
  });
  const [classGroups, setClassGroups] = useState([]);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  // Fetch class groups when switching to register
  useEffect(() => {
    if (mode === 'register' && classGroups.length === 0) {
      apiGetPublicClassGroups()
        .then(res => setClassGroups(res.data?.classGroups || []))
        .catch(() => setClassGroups([]));
    }
  }, [mode]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let result;
    if (mode === 'login') {
      const res = await login(form.email, form.password);
      if (res.success) {
        navigate(res.user?.role === 'admin' ? '/admin' : '/');
        return;
      }
      result = res;
    } else {
      if (!form.classGroupId) {
        setError('Please select your class group.');
        setLoading(false);
        return;
      }
      result = await register({
        username: form.username,
        email: form.email,
        password: form.password,
        profile: { firstName: form.firstName, lastName: form.lastName },
        classGroupId: form.classGroupId,
      });
    }

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const switchMode = (m) => { setMode(m); setError(''); };

  return (
    <div className="login-shell">
      {/* Left branding panel */}
      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo">Kerala Connect</div>
          <div className="login-tagline">Your academic discussion platform</div>
        </div>
        <div className="login-features">
          <div className="lf-item"><span>💬</span><div><strong>Forum</strong><br/>Ask & answer class doubts</div></div>
          <div className="lf-item"><span>🗨️</span><div><strong>Group Chat</strong><br/>Talk with your class in real time</div></div>
          <div className="lf-item"><span>📌</span><div><strong>Reminders</strong><br/>Never miss a deadline again</div></div>
        </div>
        <div className="login-footnote">Amrita · AIE23 · Group 20</div>
      </div>

      {/* Right form panel */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-card-title">
            {mode === 'login' ? 'Welcome back 👋' : 'Create account ✨'}
          </div>
          <div className="login-card-sub">
            {mode === 'login' ? 'Sign in to your Kerala Connect account' : 'Join your class on Kerala Connect'}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input className="form-input" placeholder="Ihsal"
                      value={form.firstName} onChange={e => set('firstName', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input className="form-input" placeholder="Riyas"
                      value={form.lastName} onChange={e => set('lastName', e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input className="form-input" placeholder="ihsal_r"
                    value={form.username} onChange={e => set('username', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Class Group</label>
                  <select className="form-input" value={form.classGroupId}
                    onChange={e => set('classGroupId', e.target.value)} required>
                    <option value="">Select your class…</option>
                    {classGroups.length === 0 && (
                      <option disabled>Loading classes…</option>
                    )}
                    {classGroups.map(g => (
                      <option key={g._id} value={g._id}>
                        {g.name} — {g.stream}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="you@amrita.edu"
                value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••"
                value={form.password} onChange={e => set('password', e.target.value)} required />
            </div>

            {error && <div className="login-error">{error}</div>}

            <button className="btn btn-primary login-btn" type="submit" disabled={loading}>
              {loading ? 'Please wait…' : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="login-switch">
            {mode === 'login' ? (
              <>Don't have an account?{' '}
                <button onClick={() => switchMode('register')}>Register</button></>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => switchMode('login')}>Sign In</button></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
