import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import AuthParticles from '../components/AuthParticles';

export default function ForgotPassword() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [sent, setSent]       = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  };

  /* ── Sent screen ── */
  if (sent) return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <AuthParticles />

      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-success-wrap">
          <div className="auth-success-ring">
            <div className="auth-success-ring-inner">📬</div>
          </div>
          <h1 className="auth-title">
            Check your <span>email</span>
          </h1>
          <p className="auth-subtitle" style={{ marginBottom: 8 }}>
            We sent a reset link to
          </p>
          <p style={{
            color: 'var(--cyan)',
            fontWeight: 600,
            fontSize: 14,
            marginBottom: 32,
            wordBreak: 'break-all'
          }}>
            {email}
          </p>
          <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.6)', marginBottom: 32 }}>
            Didn't receive it? Check your spam folder or try again in a few minutes.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
            <button
              className="auth-btn auth-btn-primary"
              onClick={() => { setSent(false); setEmail(''); }}
            >
              Try another email
            </button>
            <Link to="/login" className="auth-link" style={{ textAlign: 'center' }}>
              ← Back to Sign In
            </Link>
          </div>
        </div>
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


        <h1 className="auth-title" style={{ marginTop: 20 }}>
          Reset your <span>password</span>
        </h1>
        <p className="auth-subtitle">
          Enter your email and we'll send a secure reset link — valid for 60 minutes.
        </p>

        <form onSubmit={handleReset} className="auth-form">

          {error && (
            <div className="auth-alert auth-alert--error">
              <span className="auth-alert-icon">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label">Email Address</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </span>
              <input
                type="email"
                className="auth-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="auth-btn auth-btn-primary"
            disabled={loading}
          >
            {loading ? (
              <><span className="auth-spinner" /> Sending link...</>
            ) : (
              <>
                Send Reset Link
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <p className="auth-footer">
          Remembered it?{' '}
          <Link to="/login" className="auth-link">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
