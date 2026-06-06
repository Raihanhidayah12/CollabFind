import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import AuthParticles from '../components/AuthParticles';

function getStrength(pw) {
  if (!pw) return 0;
  if (pw.length < 6) return 1;
  if (pw.length < 10 || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) return 2;
  return 3;
}

const STRENGTH_INFO = [
  null,
  { label: 'Too weak',   dot: '#ef4444', cls: 'active-weak'   },
  { label: 'Getting there', dot: '#f59e0b', cls: 'active-medium' },
  { label: 'Strong',  dot: '#00FFC2', cls: 'active-strong' },
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [done, setDone]       = useState(false);

  const strength = getStrength(form.password);
  const info     = STRENGTH_INFO[strength];

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    if (strength < 2) return setError('Password is too weak. Use at least 6 characters.');
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Fallback: insert ke profiles kalau trigger belum ada atau gagal
    if (data?.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name: form.name || 'User',
        bio: 'Halo! Saya baru bergabung di CollabFind',
        role: 'user',
      }, { onConflict: 'id' });

      // Match pending invitations by email
      const emailLower = form.email.toLowerCase();
      const { data: pendingInvites } = await supabase
        .from('invitations')
        .select('id')
        .eq('invitee_email', emailLower)
        .eq('status', 'pending')
        .is('invitee_id', null);

      if (pendingInvites && pendingInvites.length > 0) {
        await supabase
          .from('invitations')
          .update({ invitee_id: data.user.id })
          .eq('invitee_email', emailLower)
          .eq('status', 'pending')
          .is('invitee_id', null);
      }
    }

    setDone(true);
    setLoading(false);
  };

  /* ── Success screen ── */
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
          <h1 className="auth-title">
            You're <span>in!</span>
          </h1>
          <p className="auth-subtitle" style={{ marginBottom: 32 }}>
            Check your email to confirm your account,<br />then sign in and start building.
          </p>
          <Link to="/login" className="auth-btn auth-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Go to Sign In →
          </Link>
        </div>
      </div>
    </div>
  );

  /* ── Register form ── */
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

        <h1 className="auth-title">
          Join the <span>Mission</span>
        </h1>
        <p className="auth-subtitle">
          Create your account and start collaborating with builders worldwide.
        </p>

        <form onSubmit={handleRegister} className="auth-form">

          {error && (
            <div className="auth-alert auth-alert--error">
              <span className="auth-alert-icon">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Full Name */}
          <div className="auth-field">
            <label className="auth-label">Full Name</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </span>
              <input
                type="text"
                name="name"
                className="auth-input"
                placeholder="Your full name"
                value={form.name}
                onChange={handle}
                autoComplete="name"
                required
              />
            </div>
          </div>

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
                name="email"
                className="auth-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handle}
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
                name="password"
                className="auth-input"
                placeholder="Create a strong password"
                value={form.password}
                onChange={handle}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="auth-pw-toggle"
                onClick={() => setShowPw(!showPw)}
                aria-label="Toggle password visibility"
              >
                {showPw ? '🙈' : '👁'}
              </button>
            </div>

            {/* Strength meter */}
            {form.password && (
              <div className="auth-strength">
                <div className="auth-strength-bars">
                  {[1, 2, 3].map((lvl) => (
                    <div
                      key={lvl}
                      className={`auth-strength-bar ${lvl <= strength ? info.cls : ''}`}
                    />
                  ))}
                </div>
                <div className="auth-strength-label">
                  <div className="auth-strength-dot" style={{ background: info.dot }} />
                  {info.label}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
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
                name="confirm"
                className={`auth-input ${
                  form.confirm && form.confirm !== form.password
                    ? 'auth-input--error'
                    : form.confirm && form.confirm === form.password
                    ? 'auth-input--ok'
                    : ''
                }`}
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={handle}
                autoComplete="new-password"
                required
              />
              {form.confirm && (
                <span className="auth-pw-toggle" style={{ pointerEvents: 'none' }}>
                  {form.confirm === form.password ? 'Match' : 'Mismatch'}
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="auth-btn auth-btn-primary"
            disabled={loading}
          >
            {loading ? (
              <><span className="auth-spinner" /> Creating account...</>
            ) : (
              <>
                Create Account
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in →</Link>
        </p>
        <p className="auth-footer" style={{ marginTop: 8 }}>
          <Link to="/" className="auth-link" style={{ color: 'rgba(148,163,184,0.5)', fontSize: 12 }}>← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
