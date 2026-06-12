import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import AuthParticles from '../components/AuthParticles';
import { useLanguage } from '../i18n/LanguageContext';

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
  const { t } = useLanguage();

  const strength = getStrength(form.password);
  const strengthInfo = strength === 0 ? null : [
    null,
    { label: t('auth.tooWeak'),       dot: '#ef4444', cls: 'active-weak'   },
    { label: t('auth.gettingThere'),  dot: '#f59e0b', cls: 'active-medium' },
    { label: t('auth.strong'),        dot: '#00FFC2', cls: 'active-strong' },
  ][strength];
  const info = strengthInfo;

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

  const handleOAuth = async (provider) => {
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) setError(error.message);
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
            {t('auth.signUp')} <span>✓</span>
          </h1>
          <p className="auth-subtitle" style={{ marginBottom: 32 }}>
            {t('auth.email')}
          </p>
          <Link to="/login" className="auth-btn auth-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            {t('auth.signIn')} →
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
          {t('auth.createAccount')}
        </h1>
        <p className="auth-subtitle">
          {t('auth.createAccountSubtitle')}
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
            <label className="auth-label">{t('auth.fullName')}</label>
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
            <label className="auth-label">{t('auth.email')}</label>
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
            <label className="auth-label">{t('auth.password')}</label>
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
            <label className="auth-label">{t('auth.confirmPassword')}</label>
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
              <><span className="auth-spinner" /> {t('auth.createAccount')}...</>
            ) : (
              <>
                {t('auth.createAccount')}
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="auth-divider">
          <div className="auth-divider-line" />
          <span className="auth-divider-text">{t('auth.orContinueWith')}</span>
          <div className="auth-divider-line" />
        </div>

        <div className="auth-oauth-row">
          <button
            type="button"
            onClick={() => handleOAuth('google')}
            className="auth-btn"
            style={{ flex: 1, justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"/><path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"/><path fill="#4A90D9" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"/><path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"/></svg>
            Google
          </button>
          <button
            type="button"
            onClick={() => handleOAuth('github')}
            className="auth-btn"
            style={{ flex: 1, justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z"/></svg>
            GitHub
          </button>
        </div>

        <p className="auth-footer">
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="auth-link">{t('auth.signIn')} →</Link>
        </p>
        <p className="auth-footer auth-footer-back">
          <Link to="/" className="auth-link auth-link--muted">← {t('common.back')}</Link>
        </p>
      </div>
    </div>
  );
}
