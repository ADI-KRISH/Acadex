import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiLogin, apiRegister } from '../services/api';
import './LoginPage.css';

export default function LoginPage() {
  const [mode, setMode]       = useState('login'); // 'login' | 'register'
  const [form, setForm]       = useState({ name: '', rollNo: '', email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser }         = useAuth();
  const navigate              = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let result;
      if (mode === 'login') {
        result = await apiLogin(form.email, form.password);
      } else {
        if (!form.name.trim() || !form.rollNo.trim()) {
          setError('Please fill in all fields.'); setLoading(false); return;
        }
        result = await apiRegister(form);
      }
      loginUser(result.user, result.token);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid credentials. Try again.');
    }
    setLoading(false);
  };

  return (
    <div className="login-shell">
      {/* Left panel */}
      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo">AcadEx</div>
          <div className="login-tagline">Your academic discussion platform</div>
        </div>
        <div className="login-features">
          <div className="lf-item"><span>💬</span><div><strong>Forum</strong><br/>Ask & answer class doubts</div></div>
          <div className="lf-item"><span>🗨️</span><div><strong>Group Chat</strong><br/>Talk with your class, in real time</div></div>
          <div className="lf-item"><span>📌</span><div><strong>Reminders</strong><br/>Never miss a deadline again</div></div>
        </div>
        <div className="login-footnote">Amrita · AIE23 · Group 20</div>
      </div>

      {/* Right panel */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-card-title">
            {mode === 'login' ? 'Welcome back 👋' : 'Create account ✨'}
          </div>
          <div className="login-card-sub">
            {mode === 'login' ? "Sign in to your AcadEx account" : "Join your class on AcadEx"}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" placeholder="e.g. Ihsal Riyas"
                    value={form.name} onChange={e => set('name', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Roll Number</label>
                  <input className="form-input" placeholder="AM.SC.U4AIE23037"
                    value={form.rollNo} onChange={e => set('rollNo', e.target.value)} required />
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
              <>Don't have an account? <button onClick={() => { setMode('register'); setError(''); }}>Register</button></>
            ) : (
              <>Already have an account? <button onClick={() => { setMode('login'); setError(''); }}>Sign In</button></>
            )}
          </div>

          {mode === 'login' && (
            <div className="login-demo">
              <div className="demo-label">Demo credentials</div>
              <div className="demo-creds">Any email + any password → logs you in (mock mode)</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
