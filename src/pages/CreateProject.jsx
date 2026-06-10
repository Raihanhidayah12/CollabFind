import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import AuthParticles from '../components/AuthParticles';
import PageNavbar from '../components/PageNavbar';
import { Globe, Smartphone, Bot, Zap, Palette, Gamepad2, LineChart, Link as LinkIcon, Box, Rocket } from 'lucide-react';

const CATEGORIES = [
  { label: 'Web Dev',     icon: <Globe size={14} /> },
  { label: 'Mobile',      icon: <Smartphone size={14} /> },
  { label: 'AI / ML',     icon: <Bot size={14} /> },
  { label: 'IoT',         icon: <Zap size={14} /> },
  { label: 'Design',      icon: <Palette size={14} /> },
  { label: 'Game Dev',    icon: <Gamepad2 size={14} /> },
  { label: 'Data Science',icon: <LineChart size={14} /> },
  { label: 'Blockchain',  icon: <LinkIcon size={14} /> },
  { label: 'Other',       icon: <Box size={14} /> },
];

const STATUS_OPTIONS = [
  { value: 'open',      label: 'Recruiting',   desc: 'Actively looking for collaborators' },
  { value: 'ongoing',   label: 'In Progress',  desc: 'Project already started' },
  { value: 'completed', label: 'Completed',    desc: 'Project is done' },
];

// ---------- skill tag input ----------
function SkillTagInput({ value, onChange }) {
  const [input, setInput] = useState('');

  const addSkill = (raw) => {
    const tag = raw.trim();
    if (!tag || value.includes(tag)) return;
    onChange([...value, tag]);
  };

  const handleKeyDown = (e) => {
    if (['Enter', ',', 'Tab'].includes(e.key)) {
      e.preventDefault();
      addSkill(input);
      setInput('');
    }
    if (e.key === 'Backspace' && !input && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  const remove = (idx) => onChange(value.filter((_, i) => i !== idx));

  return (
    <div
      className="auth-input auth-input--no-icon"
      style={{
        minHeight: 44,
        height: 'auto',
        padding: '6px 12px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        alignItems: 'center',
        cursor: 'text',
      }}
      onClick={(e) => e.currentTarget.querySelector('input')?.focus()}
    >
      {value.map((tag, i) => (
        <span
          key={i}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 10px',
            borderRadius: 20,
            background: 'rgba(0,210,255,0.12)',
            border: '1px solid rgba(0,210,255,0.35)',
            color: '#00D2FF',
            fontSize: 12,
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          {tag}
          <button
            type="button"
            onClick={() => remove(i)}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(0,210,255,0.6)',
              cursor: 'pointer',
              padding: 0,
              lineHeight: 1,
              fontSize: 14,
            }}
          >×</button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (input.trim()) { addSkill(input); setInput(''); } }}
        placeholder={value.length === 0 ? 'React, Node.js, Design… (Enter to add)' : ''}
        style={{
          flex: 1,
          minWidth: 120,
          background: 'none',
          border: 'none',
          outline: 'none',
          color: '#e2e8f0',
          fontSize: 14,
          fontFamily: 'var(--sans)',
          padding: '2px 0',
        }}
      />
    </div>
  );
}

// ---------- Step indicator ----------
function StepDots({ current, total }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', margin: '8px 0 20px' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? 24 : 8,
            height: 8,
            borderRadius: 4,
            background: i === current
              ? 'linear-gradient(90deg,#00D2FF,#9D50BB)'
              : i < current
              ? 'rgba(0,210,255,0.4)'
              : 'rgba(255,255,255,0.1)',
            transition: 'all 0.3s ease',
          }}
        />
      ))}
    </div>
  );
}

// ============================================================
export default function CreateProject() {
  const navigate = useNavigate();

  // form state
  const [step, setStep]               = useState(0); // 0=basics, 1=details, 2=team
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory]       = useState('');
  const [status, setStatus]           = useState('open');
  const [skills, setSkills]           = useState([]);
  const [maxMembers, setMaxMembers]   = useState(4);
  const [inviteEmails, setInviteEmails] = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState(false);

  // validation per step
  const step0Valid = title.trim().length >= 3;
  const step1Valid = description.trim().length >= 20 && category;
  const canNext = [step0Valid, step1Valid, true][step];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 2) { setStep(s => s + 1); return; }

    setLoading(true);
    setError('');
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) { navigate('/login'); return; }

      const { data: project, error: projErr } = await supabase
        .from('projects')
        .insert({
          title:         title.trim(),
          description:   description.trim(),
          creator_id:    user.id,
          skills_needed: skills,
          status,
          max_members:   maxMembers,
          open_slots:    Math.max(0, maxMembers - 1),
          created_at:    new Date().toISOString(),
        })
        .select()
        .single();

      if (projErr) throw projErr;

// Process invited collaborators — simpan semua ke project_collaborators berdasarkan email.
      // Konversi ke invitations dilakukan di Dashboard saat user dengan email tsb login.
      if (inviteEmails.trim()) {
        const emails = inviteEmails.split(',').map(e => e.trim()).filter(Boolean);
        const collaboratorRows = emails.map(email => ({
          project_id: project.id,
          email: email.toLowerCase(),
          status: 'invited'
        }));

        const { error: collabError } = await supabase
          .from('project_collaborators')
          .insert(collaboratorRows);

        if (collabError) {
          console.error('Collaborator insert error:', collabError);
        }
      }

      setSuccess(true);
      setTimeout(() => navigate(`/project/${project.id}`), 2000);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Success state ────────────────────────────────────────
  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-bg" />
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <AuthParticles />
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-success-wrap">
            <div className="auth-success-ring">
              <div className="auth-success-ring-inner"><Rocket size={24} /></div>
            </div>
            <h2 className="auth-title">Project <span>Launched!</span></h2>
            <p className="auth-subtitle">Redirecting to your project page…</p>
            <div className="auth-spinner" style={{ margin: '12px auto 0', width: 20, height: 20 }} />
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ────────────────────────────────────────────
  return (
    <div className="auth-page pt-16">
      <PageNavbar breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Create Project' }]} homePath="/dashboard" />
      <div className="auth-bg" />
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />
      <AuthParticles />

      <div className="auth-card" style={{ maxWidth: 520, margin: 'auto', width: '100%' }}>

        {/* Logo */}
        <Link to="/dashboard" className="auth-logo">
          <div className="auth-logo-icon"><Zap size={18} /></div>
          <span className="auth-logo-text">CollabFind</span>
        </Link>

        {/* Header */}
        <h1 className="auth-title">
          Apply a <span>Project</span>
        </h1>
        <p className="auth-subtitle">
          {step === 0 && 'Start with the basics — give your project a name and identity.'}
          {step === 1 && 'Describe what you\'re building and who you need.'}
          {step === 2 && 'Set team size and optionally invite your first collaborators.'}
        </p>

        <StepDots current={step} total={3} />

        <form onSubmit={handleSubmit} className="auth-form">

          {/* ── Error ── */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="auth-alert auth-alert--error"
              >
                <span className="auth-alert-icon">!</span>
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ══════ STEP 0 — Basics ══════ */}
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                {/* Title */}
                <div className="auth-field">
                  <label className="auth-label">Project Title *</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                      </svg>
                    </span>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="e.g. AI Study Assistant"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  {title && title.trim().length < 3 && (
                    <span style={{ fontSize: 11, color: 'rgba(239,68,68,0.8)', marginTop: 2 }}>
                      At least 3 characters
                    </span>
                  )}
                </div>

                {/* Status */}
                <div className="auth-field">
                  <label className="auth-label">Project Status</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8 }}>
                    {STATUS_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setStatus(opt.value)}
                        style={{
                          padding: '10px 8px',
                          borderRadius: 10,
                          border: status === opt.value
                            ? '1px solid rgba(0,210,255,0.55)'
                            : '1px solid rgba(255,255,255,0.08)',
                          background: status === opt.value
                            ? 'rgba(0,210,255,0.09)'
                            : 'rgba(255,255,255,0.03)',
                          color: status === opt.value ? '#00D2FF' : 'rgba(148,163,184,0.75)',
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          textAlign: 'center',
                          lineHeight: 1.2,
                          minHeight: 70,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <span style={{ fontWeight: 700, fontSize: 11 }}>{opt.label}</span>
                        <div style={{ fontSize: 8, fontWeight: 400, marginTop: 4, opacity: 0.65, lineHeight: 1.1 }}>
                          {opt.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══════ STEP 1 — Details ══════ */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                {/* Description */}
                <div className="auth-field">
                  <label className="auth-label">Description *</label>
                  <textarea
                    className="auth-input auth-input--no-icon"
                    placeholder="What are you building? What's the goal? Who do you need?"
                    rows={4}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                    style={{ resize: 'vertical', height: 'auto', padding: '10px 14px' }}
                  />
                  <span style={{ fontSize: 11, color: description.length < 20 ? 'rgba(239,68,68,0.65)' : 'rgba(0,255,194,0.6)', marginTop: 2 }}>
                    {description.length}/20 min characters {description.length >= 20 && '✓'}
                  </span>
                </div>

                {/* Category */}
                <div className="auth-field">
                  <label className="auth-label">Category *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', gap: 7 }}>
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.label}
                        type="button"
                        onClick={() => setCategory(cat.label)}
                        style={{
                          padding: '8px 6px',
                          borderRadius: 20,
                          border: category === cat.label
                            ? '1px solid rgba(157,80,187,0.7)'
                            : '1px solid rgba(255,255,255,0.08)',
                          background: category === cat.label
                            ? 'rgba(157,80,187,0.15)'
                            : 'rgba(255,255,255,0.03)',
                          color: category === cat.label ? '#D1B4FF' : 'rgba(148,163,184,0.7)',
                          fontSize: 9,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 2,
                          minHeight: 50,
                          lineHeight: 1.1,
                        }}
                      >
                        <span style={{ fontSize: 14 }}>{cat.icon}</span>
                        <span style={{ textAlign: 'center', wordBreak: 'break-word' }}>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div className="auth-field">
                  <label className="auth-label">Skills Needed</label>
                  <SkillTagInput value={skills} onChange={setSkills} />
                  <span style={{ fontSize: 11, color: 'rgba(148,163,184,0.45)', marginTop: 2 }}>
                    Press Enter or comma to add a skill tag
                  </span>
                </div>
              </motion.div>
            )}

            {/* ══════ STEP 2 — Team ══════ */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                {/* Max members slider */}
                <div className="auth-field">
                  <label className="auth-label">
                    Team Size — <span style={{ color: '#00D2FF' }}>{maxMembers} people</span>
                  </label>
                  <div style={{ padding: '8px 0' }}>
                    <input
                      type="range"
                      min={2}
                      max={12}
                      value={maxMembers}
                      onChange={e => setMaxMembers(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#00D2FF' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(148,163,184,0.45)', marginTop: 4 }}>
                      <span>2 min</span>
                      <span style={{ color: 'rgba(0,210,255,0.6)', fontWeight: 600 }}>
                        {maxMembers - 1} open slot{maxMembers - 1 !== 1 ? 's' : ''}
                      </span>
                      <span>12 max</span>
                    </div>
                  </div>
                </div>

                {/* Invite emails */}
                <div className="auth-field">
                  <label className="auth-label">Invite Collaborators <span style={{ opacity: 0.5, textTransform: 'none', fontSize: 10, letterSpacing: 0 }}>(optional)</span></label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                    </span>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="email1@example.com, email2@example.com"
                      value={inviteEmails}
                      onChange={e => setInviteEmails(e.target.value)}
                    />
                  </div>
                  <span style={{ fontSize: 11, color: 'rgba(148,163,184,0.45)', marginTop: 2 }}>
                    Comma-separated email addresses
                  </span>
                </div>

                {/* Summary card */}
                <div style={{
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: '1px solid rgba(0,210,255,0.15)',
                  background: 'rgba(0,210,255,0.04)',
                  overflow: 'hidden',
                }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(0,210,255,0.7)', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 8px' }}>
                    Summary
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {[
                      ['Title',    title],
                      ['Category', category],
                      ['Status',   STATUS_OPTIONS.find(s => s.value === status)?.label],
                      ['Skills',   skills.length ? skills.join(', ') : '—'],
                      ['Team',     `${maxMembers} people · ${maxMembers - 1} open slots`],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', gap: 8, fontSize: 11, minHeight: 20, alignItems: 'center' }}>
                        <span style={{ color: 'rgba(148,163,184,0.5)', minWidth: 50, flexShrink: 0 }}>{k}</span>
                        <span style={{ color: '#e2e8f0', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Nav buttons ── */}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="auth-btn"
                style={{
                  flex: '0 0 auto',
                  width: 44,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8',
                }}
              >
                ←
              </button>
            )}

            <button
              type="submit"
              className="auth-btn auth-btn-primary"
              disabled={loading || !canNext}
              style={{ flex: 1 }}
            >
              {loading ? (
                <><span className="auth-spinner" /> Creating…</>
              ) : step < 2 ? (
                <>Next <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg></>
              ) : (
                <><Rocket size={14} style={{ marginRight: 6 }} /> Launch Project</>
              )}
            </button>
          </div>
        </form>

        <p className="auth-footer">
          <Link to="/dashboard" className="auth-link" style={{ color: 'rgba(148,163,184,0.45)', fontSize: 12 }}>
            ← Back to Dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}
