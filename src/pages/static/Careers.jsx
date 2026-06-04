import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, MapPin, Clock, ArrowRight, Loader2,
  X, Upload, Send, CheckCircle, ExternalLink,
} from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import Footer from '../../components/landing/Footer';
import PageNavbar from '../../components/PageNavbar';

const perks = [
  '100% Remote', 'Async-first culture', 'Equity options', 'Learning budget',
  'Flexible hours', 'Build what you ship',
];

// ── Apply Modal ──────────────────────────────────────────────
function ApplyModal({ role, session, onClose }) {
  const navigate = useNavigate();
  const [message,      setMessage]      = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [cvFile,       setCvFile]       = useState(null);
  const [submitting,   setSubmitting]   = useState(false);
  const [success,      setSuccess]      = useState(false);
  const [error,        setError]        = useState('');

  // Pre-fill portfolio dari profile
  useEffect(() => {
    if (!session) return;
    supabase
      .from('profiles')
      .select('portfolio_url, name')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        if (data?.portfolio_url) setPortfolioUrl(data.portfolio_url);
      });
  }, [session]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!session) { navigate('/login'); return; }
    if (!message.trim()) { setError('Pesan tidak boleh kosong.'); return; }

    setSubmitting(true);
    setError('');

    let cvUrl = null;

    // Upload CV jika ada
    if (cvFile) {
      const ext       = cvFile.name.split('.').pop();
      const path      = `cv/${session.user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('job-applications')
        .upload(path, cvFile, { upsert: true });

      if (upErr) {
        setError('Gagal mengupload CV. Pastikan bucket "job-applications" sudah dibuat di Supabase Storage.');
        setSubmitting(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('job-applications')
        .getPublicUrl(path);
      cvUrl = urlData?.publicUrl || null;
    }

    const { error: dbErr } = await supabase.from('job_applications').insert({
      job_id:        role.id,
      applicant_id:  session.user.id,
      message:       message.trim(),
      cv_url:        cvUrl,
      portfolio_url: portfolioUrl.trim() || null,
    });

    if (dbErr) {
      setError(dbErr.message.includes('duplicate') 
        ? 'Kamu sudah pernah apply untuk posisi ini.' 
        : 'Gagal mengirim aplikasi. Coba lagi.');
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setSubmitting(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 16 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg rounded-2xl border border-white/[0.1] bg-[#0a0f1e] shadow-[0_32px_80px_rgba(0,0,0,0.7)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-white/[0.07]">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Applying for</p>
            <h2 className="text-base font-extrabold text-white" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
              {role.title}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              {role.team     && <span className="text-xs text-slate-500">{role.team}</span>}
              {role.type     && <span className="flex items-center gap-1 text-xs text-slate-500"><Clock size={10}/> {role.type}</span>}
              {role.location && <span className="flex items-center gap-1 text-xs text-slate-500"><MapPin size={10}/> {role.location}</span>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {success ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle size={28} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">Application Sent!</h3>
              <p className="text-sm text-slate-400">
                We'll review your application and get back to you via email.
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
            >
              Done
            </button>
          </div>
        ) : (
          /* ── Form ── */
          <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">

            {!session && (
              <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-300">
                Kamu harus{' '}
                <Link to="/login" className="underline font-semibold">login</Link>
                {' '}terlebih dahulu untuk apply.
              </div>
            )}

            {/* Pesan / cover letter */}
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">
                Cover Letter / Pesan <span className="text-red-400">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => { setMessage(e.target.value); setError(''); }}
                placeholder="Ceritakan tentang dirimu, pengalamanmu, dan kenapa kamu cocok untuk posisi ini..."
                rows={5}
                className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 focus:bg-blue-500/[0.04] transition-all resize-none"
                required
              />
            </div>

            {/* Portfolio URL */}
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block flex items-center gap-1">
                <ExternalLink size={11} /> Portfolio / GitHub URL
              </label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://github.com/username atau https://portfolio.com"
                className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 transition-all"
              />
            </div>

            {/* CV Upload */}
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block flex items-center gap-1">
                <Upload size={11} /> Upload CV <span className="text-slate-600 font-normal">(PDF, maks. 5MB)</span>
              </label>
              <div
                onClick={() => document.getElementById('cv-input').click()}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed cursor-pointer transition-all ${
                  cvFile
                    ? 'border-blue-500/40 bg-blue-500/[0.05]'
                    : 'border-white/[0.1] bg-white/[0.02] hover:border-white/[0.2] hover:bg-white/[0.04]'
                }`}
              >
                <Upload size={15} className={cvFile ? 'text-blue-400' : 'text-slate-500'} />
                <span className={`text-sm flex-1 truncate ${cvFile ? 'text-blue-300' : 'text-slate-500'}`}>
                  {cvFile ? cvFile.name : 'Klik untuk upload CV'}
                </span>
                {cvFile && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setCvFile(null); }}
                    className="text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <input
                id="cv-input"
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f && f.size > 5 * 1024 * 1024) {
                    setError('Ukuran CV maksimal 5MB.');
                    return;
                  }
                  if (f) setCvFile(f);
                  e.target.value = '';
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            {/* Submit */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-400 border border-white/[0.08] hover:bg-white/[0.05] transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting || !session}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting
                  ? <><Loader2 size={14} className="animate-spin" /> Sending...</>
                  : <><Send size={14} /> Send Application</>
                }
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ────────────────────────────────────────────────
export default function Careers() {
  const [roles,       setRoles]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [session,     setSession]     = useState(null);
  const [applyingFor, setApplyingFor] = useState(null); // role object

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
  }, []);

  useEffect(() => {
    supabase
      .from('job_openings')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setRoles(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#050816]" style={{ fontFamily: "'Manrope',sans-serif" }}>
      <PageNavbar breadcrumbs={[{ label: 'Careers', href: null }]} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-medium mb-6">
            <Zap size={11} /> We're Hiring
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 tracking-tight" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
            Build the future of{' '}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              collaboration
            </span>{' '}
            with us.
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            We're a small, fully remote team shipping fast and building in public. Join us.
          </p>
        </motion.div>

        {/* Perks */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mb-14">
          <h2 className="text-lg font-bold text-white mb-5" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>Why CollabFind</h2>
          <div className="flex flex-wrap gap-3">
            {perks.map((p) => (
              <span key={p} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 border border-white/[0.08] bg-white/[0.03]">
                {p}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Open Roles */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <h2 className="text-lg font-bold text-white mb-5" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>Open Roles</h2>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="text-blue-400 animate-spin" />
            </div>
          ) : roles.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70">
              <p className="text-slate-500 text-sm">No open positions right now.</p>
              <p className="text-slate-600 text-xs mt-1">Check back soon or send us your CV.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {roles.map((role) => (
                <div key={role.id}
                  className="flex items-center justify-between p-5 rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 hover:border-white/[0.14] transition-all group">
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">{role.title}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      {role.team     && <span className="text-xs text-slate-500">{role.team}</span>}
                      {role.type     && <span className="flex items-center gap-1 text-xs text-slate-500"><Clock size={10} /> {role.type}</span>}
                      {role.location && <span className="flex items-center gap-1 text-xs text-slate-500"><MapPin size={10} /> {role.location}</span>}
                    </div>
                    {role.description && (
                      <p className="text-xs text-slate-600 mt-1.5 max-w-lg">{role.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setApplyingFor(role)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-blue-400 border border-blue-500/20 hover:bg-blue-500/10 transition-all flex-shrink-0 ml-4"
                  >
                    Apply <ArrowRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-center text-sm text-slate-500 mt-12">
          Don't see your role?{' '}
          <a href="mailto:careers@collabfind.com" className="text-blue-400 hover:text-blue-300 transition-colors">
            Send us your CV anyway →
          </a>
        </motion.p>
      </main>

      {/* Apply Modal */}
      <AnimatePresence>
        {applyingFor && (
          <ApplyModal
            role={applyingFor}
            session={session}
            onClose={() => setApplyingFor(null)}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
