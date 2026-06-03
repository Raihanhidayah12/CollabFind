import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import AuthParticles from '../components/AuthParticles';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [ready, setReady]         = useState(false);
  const [done, setDone]           = useState(false);

  // Supabase sends the token in the URL hash — we need to let it process
  useEffect(() => {
    // Give Supabase time to parse the hash and set the session
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });

    // Also check if already in recovery session
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) return setError('Passwords do not match.');
    if (password.length < 6)  return setError('Password must be at least 6 characters.');

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    }
    setLoading(false);
  };

  /* ── Success ── */
  if (done) return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <AuthParticles />

      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-success-wrap">
          <div className="auth-success-ring">
            <div className="auth-success-ring-inner">✓</div>
          </div>
          <h1 className="auth-title">Password <span>Updated!</span></h1>
          <p className="auth-subtitle" style={{ marginBottom: 24 }}>
            Your password has been changed successfully.<br />
            Redirecting to sign in...
          </p>
          <Link to="/login" className="auth-btn auth-btn-primary" style={{ display: 'block', textAlign: 'center' }}>
            Sign In Now →
          </Link>
        </div>
      </div>
    </div>
  );

  /* ── Not ready (token not yet processed) ── */
  if (!ready) return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-spinner" style={{ margin: '0 auto 16px', width: 24, height: 24, borderWidth: 3 }} />
        <p className="auth-subtitle">Verifying reset link...</p>
      </div>
    </div>
  );

  /* ── Form ── */
  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />
      <AuthParticles />

      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <div className="auth-logo-icon">⚡</div>
          <span className="auth-logo-text">CollabFind</span>
        </Link>

        <h1 className="auth-title">New <span>Password</span></h1>
        <p className="auth-subtitle">Choose a strong password for your account.</p>

        <form onSubmit={handleReset} className="auth-form">
          {error && (
            <div className="auth-alert auth-alert--error">
              <span className="auth-alert-icon">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label">New Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </span>
              <input
                type={showPw ? 'text' : 'password'}
                className="auth-input"
                placeholder="Min. 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(!showPw)}>
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">Confirm Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </span>
              <input
                type={showPw ? 'text' : 'password'}
                className={`auth-input ${
                  confirm && confirm !== password ? 'auth-input--error' :
                  confirm && confirm === password ? 'auth-input--ok' : ''
                }`}
                placeholder="Repeat new password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                autoComplete="new-password"
                required
              />
              {confirm && (
                <span className="auth-pw-toggle" style={{ pointerEvents: 'none' }}>
                  {confirm === password ? 'Match' : 'Mismatch'}
                </span>
              )}
            </div>
          </div>

          <button type="submit" className="auth-btn auth-btn-primary" disabled={loading}>
            {loading
              ? <><span className="auth-spinner" /> Updating password...</>
              : 'Update Password →'
            }
          </button>
        </form>

        <p className="auth-footer" style={{ marginTop: 16 }}>
          <Link to="/login" className="auth-link" style={{ color: 'rgba(148,163,184,0.5)', fontSize: 12 }}>
            ← Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
