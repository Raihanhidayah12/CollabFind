import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Users, Calendar, Zap, CheckCircle, Clock, XCircle, Trophy, AlertTriangle, Upload, X,
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import UserMenu from '../components/UserMenu';

const STATUS_STYLE = {
  open:      { label: 'Recruiting',  cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
  ongoing:   { label: 'In Progress', cls: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  completed: { label: 'Completed',   cls: 'text-slate-400 bg-slate-400/10 border-slate-400/20' },
};

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [project, setProject]   = useState(null);
  const [creator, setCreator]   = useState(null);
  const [session, setSession]   = useState(null);
  const [applied, setApplied]   = useState(false);
  const [loading, setLoading]   = useState(true);
  const [applying, setApplying] = useState(false);
  const [appStatus, setAppStatus] = useState(null); // 'pending'|'accepted'|'rejected'|null
  const [message, setMessage]   = useState('');
  const [markingDone, setMarkingDone] = useState(false);

  // Apply form extra fields
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [cvFile, setCvFile]         = useState(null);
  const [cvUploading, setCvUploading] = useState(false);

  // Get session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  // Fetch project
  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: p } = await supabase.from('projects').select('*').eq('id', id).single();
      if (!p) { navigate('/explore'); return; }
      setProject(p);

      // Fetch creator profile
      if (p.creator_id) {
        const { data: c } = await supabase.from('profiles').select('name, job_title, avatar_url').eq('id', p.creator_id).single();
        setCreator(c);
      }

      setLoading(false);
    }
    load();
  }, [id, navigate]);

  // Auto-fill portfolio URL from user_portfolios
  useEffect(() => {
    if (!session) return;
    supabase
      .from('user_portfolios')
      .select('username')
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.username) {
          setPortfolioUrl(`${window.location.origin}/portfolio/${data.username}`);
        }
      });
  }, [session]);

  // Check if already applied
  useEffect(() => {
    if (!session || !id) return;
    supabase
      .from('applications')
      .select('id, status')
      .eq('project_id', id)
      .eq('applicant_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) { setApplied(true); setAppStatus(data.status); }
      });
  }, [session, id]);

  const handleApply = async () => {
    if (!session) { navigate('/login'); return; }
    if (applied) return;

    setApplying(true);

    let cvUrl = null;
    let cvFileName = null;

    // Upload CV if provided
    if (cvFile) {
      setCvUploading(true);
      const path = `cv/${session.user.id}/${Date.now()}_${cvFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('cv-files')
        .upload(path, cvFile, { upsert: true });

      if (!uploadError) {
        cvUrl = path;
        cvFileName = cvFile.name;
      }
      setCvUploading(false);
    }

    const { error } = await supabase.from('applications').insert({
      project_id:      id,
      applicant_id:    session.user.id,
      message:         message.trim() || null,
      role_applied:    'Member',
      status:          'pending',
      portfolio_url:   portfolioUrl.trim() || null,
      selected_skills: selectedSkills,
      cv_url:          cvUrl,
      cv_file_name:    cvFileName,
    });

    if (!error) {
      setApplied(true);
      setAppStatus('pending');
    } else {
      console.error('Apply error:', error);
    }
    setApplying(false);
  };

  const handleMarkStatus = async (newStatus) => {
    if (!isOwner) return;
    const confirmed = confirm(
      newStatus === 'completed'
        ? 'Mark this project as Completed? This will allow it to appear in Portfolio Generator.'
        : 'Close recruiting for this project? Status will change to "In Progress".'
    );
    if (!confirmed) return;
    setMarkingDone(true);
    const { error } = await supabase
      .from('projects')
      .update({ status: newStatus })
      .eq('id', id);
    if (!error) {
      setProject(prev => ({ ...prev, status: newStatus }));
    } else {
      alert('Failed to update status: ' + error.message);
    }
    setMarkingDone(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  if (!project) return null;

  const accent = project.accent_color || '#3B82F6';
  const s = STATUS_STYLE[project.status] || STATUS_STYLE.open;
  const isOwner = session?.user?.id === project.creator_id;

  return (
    <div className="min-h-screen bg-[#050816]" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Bg */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[500px] h-[400px] rounded-full blur-[120px]"
          style={{ background: `${accent}12` }} />
        <div className="absolute bottom-1/3 right-0 w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050816]/85 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Zap size={14} className="text-white" />
              </div>
              <span className="text-white font-bold text-base hidden sm:block">
                Collab<span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Find</span>
              </span>
            </Link>

            <div className="hidden sm:flex items-center text-slate-600 text-sm">
              <span className="mx-2">/</span>
              <Link to={location.state?.from || "/explore"} className="text-slate-400 hover:text-white transition-colors">
                {location.state?.from?.startsWith('/portfolio/') ? 'Portfolio' : 'Explore'}
              </Link>
              <span className="mx-2">/</span>
              <span className="text-slate-300 font-medium truncate max-w-[180px]">{project?.title || 'Loading...'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {session ? (
              <UserMenu session={session} />
            ) : (
              <>
                <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors">Login</Link>
                <Link to="/register" className="px-3 py-1.5 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: main content ── */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Hero card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 backdrop-blur-sm overflow-hidden"
            >
              {/* Accent header */}
              <div className="h-2" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}44)` }} />
              <div className="h-36 flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${accent}18, ${accent}06)` }}>
                <div className="w-16 h-16 rounded-2xl border border-white/10 bg-white/[0.05] flex items-center justify-center"
                  style={{ boxShadow: `0 0 32px ${accent}55` }}>
                  <Zap size={28} style={{ color: accent }} />
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${s.cls}`}>{s.label}</span>
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                    <Users size={13} />
                    <span>{project.current_members ?? 1} members · {project.open_slots ?? 0} open slots</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                    <Calendar size={13} />
                    <span>{new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {project.title}
                </h1>

                <p className="text-slate-400 leading-relaxed mb-5">{project.description}</p>

                {/* Skills */}
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Skills Needed</p>
                  <div className="flex flex-wrap gap-2">
                    {(project.skills_needed || []).map(s => (
                      <span key={s} className="px-3 py-1 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-slate-300">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Apply form — only when status is 'open' */}
            {!isOwner && project.status === 'open' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 p-6"
              >
                <h2 className="text-base font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Apply to Join
                </h2>
                <p className="text-sm text-slate-500 mb-5">
                  Fill in your details to apply. The more complete, the better your chances.
                </p>

                {applied ? (
                  <div className={`flex items-center gap-3 p-4 rounded-xl border ${
                    appStatus === 'accepted' ? 'bg-green-500/10 border-green-500/30 text-green-300' :
                    appStatus === 'rejected' ? 'bg-red-500/10 border-red-500/30 text-red-300' :
                    'bg-blue-500/10 border-blue-500/30 text-blue-300'
                  }`}>
                    {appStatus === 'accepted' ? <CheckCircle size={18} /> :
                     appStatus === 'rejected' ? <XCircle size={18} /> :
                     <Clock size={18} />}
                    <div>
                      <div className="font-semibold text-sm">
                        {appStatus === 'accepted' ? 'Application Accepted!' :
                         appStatus === 'rejected' ? 'Application Not Accepted' :
                         'Application Submitted'}
                      </div>
                      <div className="text-xs opacity-75 mt-0.5">
                        {appStatus === 'accepted' ? 'Welcome to the team!' :
                         appStatus === 'rejected' ? 'Keep exploring other projects.' :
                         'The team will review your application soon.'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {!session && (
                      <div className="p-3 mb-4 rounded-xl border border-yellow-500/25 bg-yellow-500/8 text-yellow-300 text-sm">
                        You need to <Link to="/login" state={{ from: location.pathname }} className="underline font-semibold">sign in</Link> to apply.
                      </div>
                    )}

                    <div className="flex flex-col gap-4">
                      {/* Portfolio URL */}
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                          Portfolio URL
                        </label>
                        <input
                          type="url"
                          value={portfolioUrl}
                          onChange={e => setPortfolioUrl(e.target.value)}
                          disabled={!session}
                          placeholder="https://collabfind.com/portfolio/username"
                          className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-600 text-sm outline-none focus:border-blue-500/40 transition-all disabled:opacity-40"
                        />
                        {portfolioUrl && (
                          <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                            <CheckCircle size={10} /> Auto-filled from your Portfolio Editor
                          </p>
                        )}
                      </div>

                      {/* Skills multi-select */}
                      {(project.skills_needed || []).length > 0 && (
                        <div>
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                            Relevant Skills You Have <span className="text-slate-600 font-normal normal-case">(select all that apply)</span>
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {(project.skills_needed || []).map(skill => {
                              const isSelected = selectedSkills.includes(skill);
                              return (
                                <button
                                  key={skill}
                                  type="button"
                                  disabled={!session}
                                  onClick={() => {
                                    setSelectedSkills(prev =>
                                      isSelected ? prev.filter(s => s !== skill) : [...prev, skill]
                                    );
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-40 ${
                                    isSelected
                                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                                      : 'bg-white/[0.04] border-white/[0.1] text-slate-400 hover:border-white/[0.25] hover:text-white'
                                  }`}
                                >
                                  {isSelected && <CheckCircle size={10} className="inline mr-1" />}
                                  {skill}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Message */}
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                          Cover Message
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Hi, I'm interested in joining because..."
                          value={message}
                          onChange={e => setMessage(e.target.value)}
                          disabled={!session}
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-600 text-sm outline-none focus:border-blue-500/40 transition-all resize-none disabled:opacity-40"
                        />
                      </div>

                      {/* CV Upload */}
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                          CV / Resume <span className="text-slate-600 font-normal normal-case">(PDF, DOC, max 5MB — optional)</span>
                        </label>
                        {cvFile ? (
                          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                            <span className="text-sm text-emerald-300 flex-1 truncate">{cvFile.name}</span>
                            <button
                              onClick={() => setCvFile(null)}
                              className="text-slate-500 hover:text-red-400 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] hover:border-white/[0.2] hover:bg-white/[0.04] transition-all cursor-pointer ${!session ? 'opacity-40 pointer-events-none' : ''}`}>
                            <Upload size={15} className="text-slate-500 flex-shrink-0" />
                            <span className="text-sm text-slate-500">Click to upload your CV</span>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              className="hidden"
                              disabled={!session}
                              onChange={e => {
                                const f = e.target.files?.[0];
                                if (f && f.size <= 5 * 1024 * 1024) setCvFile(f);
                                else if (f) alert('Max 5MB');
                                e.target.value = '';
                              }}
                            />
                          </label>
                        )}
                      </div>

                      {/* Submit */}
                      <button
                        onClick={handleApply}
                        disabled={applying || cvUploading || !session}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                          background: `linear-gradient(135deg, ${accent}, ${accent}88)`,
                          boxShadow: `0 0 24px ${accent}44`,
                        }}
                      >
                        {applying || cvUploading ? (
                          <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {cvUploading ? 'Uploading CV...' : 'Applying...'}</>
                        ) : (
                          <><Zap size={15} /> Apply to Join</>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* Notice for non-members when project is ongoing or completed */}
            {!isOwner && (project.status === 'ongoing' || project.status === 'completed') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className={`rounded-2xl border p-6 ${
                  project.status === 'completed'
                    ? 'border-slate-500/20 bg-slate-500/8'
                    : 'border-blue-500/20 bg-blue-500/8'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 ${
                    project.status === 'completed'
                      ? 'bg-slate-500/15 border-slate-500/25'
                      : 'bg-blue-500/15 border-blue-500/25'
                  }`}>
                    {project.status === 'completed'
                      ? <CheckCircle size={16} className="text-slate-400" />
                      : <Clock size={16} className="text-blue-400" />
                    }
                  </div>
                  <h2 className={`text-base font-bold ${
                    project.status === 'completed' ? 'text-slate-300' : 'text-blue-300'
                  }`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {project.status === 'completed' ? 'Project Completed' : 'Project In Progress'}
                  </h2>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {project.status === 'completed'
                    ? 'This project has been marked as completed and is no longer accepting new members.'
                    : 'This project is currently in progress and is no longer accepting new applicants.'}
                </p>
              </motion.div>
            )}
          </div>

          {/* ── Right: sidebar ── */}
          <div className="flex flex-col gap-4">

            {/* Creator */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 p-5"
            >
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Project Creator</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: `${accent}22`, border: `1px solid ${accent}44` }}>
                  {creator?.name?.[0] || '?'}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{creator?.name || 'Anonymous'}</div>
                  <div className="text-xs text-slate-500">{creator?.job_title || 'Member'}</div>
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 p-5"
            >
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Project Stats</p>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Current Members', value: project.current_members ?? 1 },
                  { label: 'Open Slots',       value: project.open_slots ?? 0 },
                  { label: 'Status',           value: s.label },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{stat.label}</span>
                    <span className="text-xs font-semibold text-white">{stat.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Owner Actions */}
            {isOwner && project.status !== 'completed' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.18 }}
                className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 p-5"
              >
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Owner Actions</p>
                <div className="flex flex-col gap-2">
                  {project.status === 'open' && (
                    <button
                      onClick={() => handleMarkStatus('ongoing')}
                      disabled={markingDone}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-blue-300 border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 transition-all disabled:opacity-50"
                    >
                      <Clock size={14} />
                      {markingDone ? 'Updating...' : 'Close Recruiting'}
                    </button>
                  )}
                  <button
                    onClick={() => handleMarkStatus('completed')}
                    disabled={markingDone}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-emerald-300 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                  >
                    <Trophy size={14} />
                    {markingDone ? 'Updating...' : 'Mark as Completed'}
                  </button>
                  <p className="text-[10px] text-slate-600 text-center mt-1 flex items-center justify-center gap-1">
                    <AlertTriangle size={10} /> Completed projects can be showcased in your Portfolio.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Similar projects link */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link
                to="/explore"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-slate-400 border border-white/[0.07] bg-white/[0.03] hover:text-white hover:border-white/[0.14] hover:bg-white/[0.06] transition-all"
              >
                Browse More Projects →
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
