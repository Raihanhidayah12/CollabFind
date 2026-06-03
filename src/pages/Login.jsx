import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import AuthParticles from '../components/AuthParticles';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      const from = location.state?.from || '/dashboard';
      navigate(from, { replace: true });
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      {/* Layered background */}
      <div className="auth-bg" />
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />
      <AuthParticles />

      <div className="auth-card">
        {/* Logo */}
        <Link to="/" className="auth-logo">
          <div className="auth-logo-icon">⚡</div>
          <span className="auth-logo-text">CollabFind</span>
        </Link>

        <h1 className="auth-title">
          Welcome <span>back</span>
        </h1>
        <p className="auth-subtitle">
          Sign in to your Mission Control and keep building.
        </p>

        <form onSubmit={handleLogin} className="auth-form">

          {error && (
            <div className="auth-alert auth-alert--error">
              <span className="auth-alert-icon">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Email */}
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

          {/* Password */}
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </span>
              <input
                type={showPw ? 'text' : 'password'}
                className="auth-input"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="auth-pw-toggle"
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="auth-row">
            <label className="auth-check-label">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
          </div>

          <button
            type="submit"
            className="auth-btn auth-btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="auth-spinner" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <p className="auth-footer">
          No account yet?{' '}
          <Link to="/register" className="auth-link">Create one free →</Link>
        </p>
        <p className="auth-footer" style={{ marginTop: 8 }}>
          <Link to="/" className="auth-link" style={{ color: 'rgba(148,163,184,0.5)', fontSize: 12 }}>← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
