import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, Bell,
  Users, FolderOpen, CheckCircle, Clock, ArrowRight,
  Plus, Sparkles, TrendingUp, Star, ExternalLink,
  MessageSquare, Loader2,
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import Features from '../components/landing/Features';
import TrustedBy from '../components/landing/TrustedBy';
import UserMenu from '../components/UserMenu';
import NotificationMenu from '../components/NotificationMenu';
import Footer from '../components/landing/Footer';

/* ── helpers ─────────────────────────────────────────────── */
const STATUS_STYLE = {
  open:      { label: 'Recruiting',   cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
  ongoing:   { label: 'In Progress',  cls: 'text-blue-400 bg-blue-400/10 border-blue-400/20'   },
  completed: { label: 'Completed',    cls: 'text-slate-400 bg-slate-400/10 border-slate-400/20'},
};

const AVATAR_COLORS = ['#3B82F6','#8B5CF6','#06B6D4','#10B981','#F59E0B','#EC4899'];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
});

/* ── Stat card (top row) ─────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div {...fadeUp(delay)}
      className="flex items-center gap-4 p-5 rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}33` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <div className="text-2xl font-extrabold text-white" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>{value}</div>
        <div className="text-xs text-slate-500 mt-0.5">{label}</div>
      </div>
    </motion.div>
  );
}

/* ── Navbar authenticated ────────────────────────────────── */
function AuthNavbar({ session, pendingCount }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const navLinks = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Explore',   to: '/explore'   },
  ];

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#050816]/85 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_32px_rgba(0,0,0,0.4)]'
                 : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_16px_rgba(59,130,246,0.5)] group-hover:shadow-[0_0_24px_rgba(59,130,246,0.7)] transition-shadow">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              Collab<span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Find</span>
            </span>
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link to="/create-project"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 shadow-[0_0_16px_rgba(59,130,246,0.3)] transition-all">
              <Plus size={13} /> New Project
            </Link>
            {session && <NotificationMenu session={session} />}
            {session && <UserMenu session={session} />}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

/* ── Hero section (post-login) ───────────────────────────── */
function AuthHero({ displayName, myProjectsCount, applicationsCount, myProjects, applications }) {
  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const [expandProjects, setExpandProjects] = useState(false);
  const [expandApps, setExpandApps]         = useState(false);

  return (
    <section className="relative min-h-[52vh] flex items-center pt-20 pb-10 overflow-hidden">
      {/* Background glows — removed */}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">

          {/* Left — greeting */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div {...fadeUp(0)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Workspace aktif · Welcome back
            </motion.div>

            <motion.h1 {...fadeUp(0.08)}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-4"
              style={{ fontFamily:"'Space Grotesk',sans-serif" }}>
              {greeting},{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                {displayName}
              </span>
            </motion.h1>

            <motion.p {...fadeUp(0.15)}
              className="text-lg text-slate-400 mb-8 max-w-xl leading-relaxed">
              Kelola proyekmu, temukan kolaborator baru, dan akses workspace tim — semuanya di satu tempat.
            </motion.p>


          </div>

          {/* Right — quick stats widget */}
          <motion.div {...fadeUp(0.25)}
            className="w-full lg:w-72 rounded-2xl border border-white/[0.08] bg-[#0a0f1e]/80 backdrop-blur-sm flex flex-col overflow-hidden">
            <div className="px-5 pt-5 pb-3 flex flex-col gap-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Aktivitasmu</p>

              {/* Row 1 — Proyek Aktif */}
              <div>
                <button
                  type="button"
                  onClick={() => { setExpandProjects(p => !p); setExpandApps(false); }}
                  className="w-full flex items-center gap-3 hover:bg-white/[0.03] rounded-xl px-2 py-1.5 -mx-2 transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center flex-shrink-0">
                    <FolderOpen size={16} className="text-blue-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-white">{myProjectsCount} Proyek Aktif</p>
                    <p className="text-xs text-slate-500">Kamu buat</p>
                  </div>
                  <span className={`text-blue-400 transition-transform duration-200 ${expandProjects ? 'rotate-90' : ''}`}>
                    <ArrowRight size={15} />
                  </span>
                </button>

                {/* Expand — list projects */}
                {expandProjects && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 ml-12 flex flex-col gap-1.5 overflow-hidden"
                  >
                    {(myProjects || []).length === 0 ? (
                      <p className="text-xs text-slate-600 italic py-1">Belum ada proyek. Buat proyek pertamamu!</p>
                    ) : (
                      (myProjects || []).slice(0, 5).map(p => (
                        <Link
                          key={p.id}
                          to={`/project/${p.id}`}
                          className="text-xs text-slate-300 hover:text-blue-300 truncate flex items-center gap-1.5 transition-colors"
                        >
                          <span className="w-1 h-1 rounded-full bg-blue-400/60 flex-shrink-0" />
                          {p.title}
                        </Link>
                      ))
                    )}
                  </motion.div>
                )}
              </div>

              {/* Row 2 — Lamaran */}
              <div>
                <button
                  type="button"
                  onClick={() => { setExpandApps(p => !p); setExpandProjects(false); }}
                  className="w-full flex items-center gap-3 hover:bg-white/[0.03] rounded-xl px-2 py-1.5 -mx-2 transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center flex-shrink-0">
                    <Users size={16} className="text-purple-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-white">{applicationsCount} Lamaran</p>
                    <p className="text-xs text-slate-500">Kamu kirim</p>
                  </div>
                  <span className={`text-purple-400 transition-transform duration-200 ${expandApps ? 'rotate-90' : ''}`}>
                    <ArrowRight size={15} />
                  </span>
                </button>

                {/* Expand — list applications */}
                {expandApps && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 ml-12 flex flex-col gap-1.5 overflow-hidden"
                  >
                    {(applications || []).length === 0 ? (
                      <p className="text-xs text-slate-600 italic py-1">Belum ada lamaran yang dikirim.</p>
                    ) : (
                      (applications || []).slice(0, 5).map(app => {
                        const statusColor = app.status === 'accepted' ? 'text-emerald-400' : app.status === 'rejected' ? 'text-red-400' : 'text-yellow-400';
                        return (
                          <Link
                            key={app.id}
                            to={`/project/${app.project_id}`}
                            className="text-xs text-slate-300 hover:text-purple-300 truncate flex items-center gap-1.5 transition-colors"
                          >
                            <span className="w-1 h-1 rounded-full bg-purple-400/60 flex-shrink-0" />
                            <span className="flex-1 truncate">{app.projects?.title || 'Project'}</span>
                            <span className={`text-[10px] font-semibold ${statusColor} flex-shrink-0`}>{app.status}</span>
                          </Link>
                        );
                      })
                    )}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Bottom CTA */}
            <Link to="/explore"
              className="flex items-center justify-center gap-2 py-3 px-5 text-xs font-semibold text-white bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-t border-white/[0.06] hover:from-blue-500/30 hover:to-purple-500/30 transition-all">
              <Plus size={13} /> Apply Proyek Baru
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ── My Workspaces section ───────────────────────────────── */
function MyWorkspaces({ projects }) {
  if (projects.length === 0) return null;

  return (
    <section id="workspaces" className="py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-white" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>
              Workspace Proyekmu
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">Proyek yang kamu buat — klik untuk buka workspace tim</p>
          </div>
          <Link to="/dashboard" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
            Lihat semua →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.slice(0, 6).map((p, i) => {
            const accent = p.accent_color || '#3B82F6';
            const s = STATUS_STYLE[p.status] || STATUS_STYLE.open;
            return (
              <motion.div key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="group relative flex flex-col rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 hover:border-white/[0.14] transition-all duration-300 overflow-hidden"
              >
                {/* top bar */}
                <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${accent}aa, ${accent}22)` }} />
                <div className="p-5 flex flex-col flex-1 gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${accent}18`, border: `1px solid ${accent}33` }}>
                      <Zap size={17} style={{ color: accent }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors truncate">{p.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{p.open_slots ?? 0} open slots</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border flex-shrink-0 ${s.cls}`}>
                      {s.label}
                    </span>
                  </div>

                  {p.description && (
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{p.description}</p>
                  )}

                  <div className="flex gap-2 mt-auto pt-2">
                    <Link to={`/project/${p.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-slate-300 border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] transition-all">
                      Detail
                    </Link>
                    <Link to={`/dashboard/workspace/${p.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 transition-all">
                      <ExternalLink size={11} /> Workspace
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Accepted Collaborations (sebagai member) ────────────── */
function MyCollaborations({ applications }) {
  const accepted = applications.filter(a => a.status === 'accepted');
  if (accepted.length === 0) return null;

  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-white" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>
              Kolaborasi Aktif
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">Proyek tempat kamu bergabung sebagai collaborator</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accepted.slice(0, 6).map((app, i) => {
            const accent = app.projects?.accent_color || '#8B5CF6';
            return (
              <motion.div key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="group flex items-center gap-4 p-4 rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 hover:border-purple-500/30 transition-all"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${accent}18`, border: `1px solid ${accent}33` }}>
                  <Users size={16} style={{ color: accent }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{app.projects?.title || 'Project'}</p>
                  <p className="text-xs text-slate-500">Collaborator</p>
                </div>
                <Link to={`/dashboard/workspace/${app.project_id}`}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-purple-400 border border-purple-500/20 hover:bg-purple-500/10 transition-all flex-shrink-0">
                  <ExternalLink size={11} /> Workspace
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Skill-Based Recommendations ────────────────────────────── */
function SkillBasedRecommendations({ recommendations, teammateRecommendations, userSkills, session, myProjects }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('projects');
  const [invitingId, setInvitingId] = useState(null);

  const hasSkills = userSkills && userSkills.length > 0;

  async function handleInvite(user) {
    if (invitingId) return;
    setInvitingId(user.id);
    
    // Find or create DM
    let convId = null;
    const { data: memberRows } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', session.user.id);

    if (memberRows && memberRows.length > 0) {
      const convIds = memberRows.map(r => r.conversation_id);
      const { data: dmConvs } = await supabase
        .from('conversations')
        .select('id')
        .eq('type', 'dm')
        .in('id', convIds);
      
      if (dmConvs && dmConvs.length > 0) {
        const dmIds = dmConvs.map(c => c.id);
        const { data: theirMemberships } = await supabase
          .from('conversation_members')
          .select('conversation_id')
          .eq('user_id', user.id)
          .in('conversation_id', dmIds);
        
        if (theirMemberships && theirMemberships.length > 0) {
          convId = theirMemberships[0].conversation_id;
        }
      }
    }

    if (!convId) {
      convId = crypto.randomUUID();
      await supabase.from('conversations').insert({ id: convId, type: 'dm', name: null });
      await supabase.from('conversation_members').insert([
        { conversation_id: convId, user_id: session.user.id },
        { conversation_id: convId, user_id: user.id }
      ]);
    }

    // Insert pre-filled message
    const msgId = crypto.randomUUID();
    const projName = myProjects[0]?.title || 'Proyek';
    const content = `Halo! Saya melihat profilmu sangat cocok dengan proyek ${projName} saya. Apakah kamu tertarik untuk mengobrol lebih lanjut?`;
    
    await supabase.from('messages').insert({
      id: msgId,
      conversation_id: convId,
      sender_id: session.user.id,
      type: 'text',
      content: content
    });

    navigate(`/dashboard/chat?conv=${convId}`);
  }

  return (
    <section id="recommendations" className="py-14 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 right-0 w-[400px] h-[300px] bg-purple-600/8 rounded-full blur-[100px]" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-medium mb-2">
              <Sparkles size={11} /> Smart Match
            </div>
            <h2 className="text-xl font-extrabold text-white" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>
              Rekomendasi Pintar
            </h2>
            {hasSkills && (
              <p className="text-xs text-slate-500 mt-0.5">
                Keahlianmu: <span className="text-blue-400">{userSkills.slice(0, 3).join(', ')}</span>
              </p>
            )}
          </div>
          
          <div className="flex bg-[#0a0f1e] rounded-xl border border-white/[0.08] p-1 self-start">
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'projects' ? 'bg-blue-500/20 text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'}`}
            >
              Rekomendasi Proyek
            </button>
            <button
              onClick={() => setActiveTab('teammates')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'teammates' ? 'bg-purple-500/20 text-purple-400 shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'}`}
            >
              Rekomendasi Rekan Tim
            </button>
          </div>
        </div>

        {!hasSkills && activeTab === 'projects' ? (
          <div className="p-8 rounded-2xl border border-white/[0.08] bg-[#0a0f1e]/80 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
              <Sparkles size={32} className="text-blue-400 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Rekomendasi Pintar Belum Siap ✨</h3>
            <p className="text-sm text-slate-400 max-w-md mb-6">
              Tulis keahlianmu (skills) di halaman profil terlebih dahulu agar AI kami bisa menyodorkan proyek dan rekan tim yang paling klop untukmu!
            </p>
            <Link to="/profile" className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 transition-colors shadow-[0_0_16px_rgba(59,130,246,0.4)]">
              Lengkapi Profil Sekarang
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTab === 'projects' && (
              recommendations.length > 0 ? (
                recommendations.slice(0, 6).map((p, i) => {
                  const accent     = p.accent_color || '#3B82F6';
                  const scoreColor = p.matchScore >= 80 ? '#00FFC2' : p.matchScore >= 50 ? '#F59E0B' : '#94A3B8';
                  const s = STATUS_STYLE[p.status] || STATUS_STYLE.open;
                  return (
                    <motion.div key={p.id}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      whileHover={{ y: -4 }}
                      className="group relative flex flex-col p-5 rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 hover:border-white/[0.14] transition-all overflow-hidden"
                    >
                      {/* Match badge */}
                      <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border"
                        style={{ color: scoreColor, background: `${scoreColor}15`, borderColor: `${scoreColor}40` }}>
                        ✦ {p.matchScore}%
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `${accent}18`, border: `1px solid ${accent}33` }}>
                          <Zap size={17} style={{ color: accent }} />
                        </div>
                        <div className="flex-1 min-w-0 pr-14">
                          <p className="text-sm font-bold text-white truncate group-hover:text-blue-300 transition-colors">{p.title}</p>
                          <p className="text-xs text-slate-500">{p.open_slots ?? 0} slots</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed flex-1">{p.description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {(p.skills_needed || []).slice(0, 3).map(sk => (
                          <span key={sk} className="px-1.5 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.07] text-[10px] text-slate-400">{sk}</span>
                        ))}
                      </div>
                      <Link to={`/project/${p.id}`}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.09] transition-all">
                        Lihat Proyek <ArrowRight size={12} />
                      </Link>
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-full py-12 text-center text-slate-500 text-sm">
                  Belum ada proyek yang cocok dengan keahlianmu saat ini.
                </div>
              )
            )}

            {activeTab === 'teammates' && (
              myProjects.length === 0 ? (
                <div className="col-span-full p-8 rounded-2xl border border-white/[0.08] bg-[#0a0f1e]/80 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4">
                    <Users size={32} className="text-purple-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Buat Proyek Dahulu</h3>
                  <p className="text-sm text-slate-400 max-w-md mb-6">
                    Kamu belum memiliki proyek. Buat proyek dan tentukan keahlian yang dicari untuk melihat rekomendasi rekan tim di sini.
                  </p>
                  <Link to="/create-project" className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-purple-500 hover:bg-purple-600 transition-colors shadow-[0_0_16px_rgba(168,85,247,0.4)]">
                    Buat Proyek Baru
                  </Link>
                </div>
              ) : teammateRecommendations.length > 0 ? (
                teammateRecommendations.slice(0, 6).map((u, i) => {
                  const initial = (u.name || 'U')[0].toUpperCase();
                  const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                  const scoreColor = u.matchScore >= 80 ? '#00FFC2' : u.matchScore >= 50 ? '#F59E0B' : '#94A3B8';
                  
                  return (
                    <motion.div key={u.id}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      whileHover={{ y: -4 }}
                      className="group relative flex flex-col p-5 rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 hover:border-white/[0.14] transition-all overflow-hidden"
                    >
                      <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border"
                        style={{ color: scoreColor, background: `${scoreColor}15`, borderColor: `${scoreColor}40` }}>
                        ✦ {u.matchScore}% Match
                      </div>
                      
                      <div className="flex items-center gap-3 mb-4">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt={u.name} className="w-12 h-12 rounded-xl object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white"
                               style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
                            {initial}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.job_title || 'Member'}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-4 flex-1">
                        {(u.matchedSkills || []).slice(0, 4).map(sk => (
                          <span key={sk} className="px-1.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-300">{sk}</span>
                        ))}
                      </div>

                      <button 
                        onClick={() => handleInvite(u)}
                        disabled={invitingId === u.id}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-600 transition-all disabled:opacity-50">
                        {invitingId === u.id ? <Loader2 size={12} className="animate-spin" /> : <MessageSquare size={12} />}
                        Invite to Project
                      </button>
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-full py-12 text-center text-slate-500 text-sm">
                  Belum ada talenta yang cocok dengan kebutuhan proyekmu saat ini.
                </div>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Featured Projects (public) ─────────────────────────── */
function FeaturedSection({ featured }) {
  return (
    <section className="py-14 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[350px] bg-blue-600/8 rounded-full blur-[120px]" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-medium mb-2">
              <TrendingUp size={11} /> Populer Minggu Ini
            </div>
            <h2 className="text-xl font-extrabold text-white" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>
              Proyek Unggulan
            </h2>
          </div>
          <Link to="/explore" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
            Lihat semua →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((p, i) => {
            const accent = p.accent_color || '#3B82F6';
            const s = STATUS_STYLE[p.status] || STATUS_STYLE.open;
            return (
              <motion.div key={p.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="group relative flex flex-col rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/60 hover:border-white/[0.14] transition-all overflow-hidden"
              >
                <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${accent}99, ${accent}33)` }} />
                <div className="h-28 flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${accent}18, ${accent}08)` }}>
                  <div className="w-12 h-12 rounded-2xl border border-white/10 bg-white/[0.05] flex items-center justify-center"
                    style={{ boxShadow: `0 0 24px ${accent}44` }}>
                    <Zap size={22} style={{ color: accent }} />
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.cls}`}>{s.label}</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Users size={11} /> {p.open_slots ?? 0} slots
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-blue-300 transition-colors">{p.title}</h3>
                  <p className="text-xs text-slate-500 mb-3 flex-1 leading-relaxed line-clamp-2">{p.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(p.skills_needed || []).slice(0, 3).map(sk => (
                      <span key={sk} className="px-1.5 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.07] text-[10px] text-slate-400">{sk}</span>
                    ))}
                  </div>
                  <Link to={`/project/${p.id}`}
                    className="flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-white border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.09] transition-all">
                    Join Project <ArrowRight size={13} />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Top Collaborators ───────────────────────────────────── */
function TopCollaborators({ collaborators }) {
  return (
    <section className="py-14 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-purple-600/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-medium mb-2">
              <Star size={11} /> Top Rated
            </div>
            <h2 className="text-xl font-extrabold text-white" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>
              Top Collaborators
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {collaborators.map((u, i) => {
            const color   = AVATAR_COLORS[i % AVATAR_COLORS.length];
            const initial = (u.name || 'U')[0].toUpperCase();
            const score   = u.collaborationScore || 0;
            return (
              <motion.div key={u.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4, scale: 1.01 }}
                className="group relative p-5 rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/60 hover:border-white/[0.14] transition-all"
              >
                {score > 0 && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-300 text-xs font-bold">
                    <Star size={9} className="fill-yellow-300" /> {score}
                  </div>
                )}
                <div className="flex items-center gap-3 mb-4">
                  {u.avatar_url?.startsWith('http') ? (
                    <img
                      src={u.avatar_url}
                      alt={u.name}
                      className="w-12 h-12 rounded-xl object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <div
                    className="w-12 h-12 rounded-xl items-center justify-center text-lg font-bold text-white flex-shrink-0"
                    style={{ background: `${color}22`, border: `1px solid ${color}44`, boxShadow: `0 0 16px ${color}33`, display: u.avatar_url?.startsWith('http') ? 'none' : 'flex' }}
                  >
                    {initial}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm group-hover:text-blue-300 transition-colors">{u.name || 'Anonymous'}</div>
                    <div className="text-xs text-slate-500">{u.job_title || 'Member'}</div>
                  </div>
                </div>
                {(u.skills || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(u.skills || []).slice(0, 3).map(s => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.07] text-xs text-slate-400">{s}</span>
                    ))}
                  </div>
                )}
                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                    <span>Collaboration Score</span>
                    <span style={{ color }}>{score > 0 ? `${score}/100` : 'Not rated yet'}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                    <motion.div className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


/* ════════════════════════════════════════════════════════════
   MAIN EXPORT — HomeAuth page
   ════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const navigate = useNavigate();

  const [session, setSession]           = useState(null);
  const [profile, setProfile]           = useState(null);
  const [myProjects, setMyProjects]     = useState([]);
  const [applications, setApplications] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [teammateRecommendations, setTeammateRecommendations] = useState([]);
  const [featured, setFeatured]         = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading]           = useState(true);

  /* ── 1. Get session ──────────────────────────────────────── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { navigate('/login'); return; }
      setSession(data.session);
    });
  }, [navigate]);

  /* ── 2. Load all data in parallel ───────────────────────── */
  useEffect(() => {
    if (!session) return;
    const uid = session.user.id;

    async function load() {
      const [
        { data: prof },
        { data: proj },
        { data: apps },
        { data: feat },
        collabsRes,
        { data: allProj },
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', uid).single(),
        supabase.from('projects').select('*').eq('creator_id', uid).order('created_at', { ascending: false }),
        supabase.from('applications').select('*, projects(id, title, accent_color, status)').eq('applicant_id', uid).order('created_at', { ascending: false }),
        supabase.from('projects').select('*').eq('is_featured', true).order('created_at', { ascending: false }).limit(6),
        supabase.from('profiles').select('id, name, bio, skills, job_title, avatar_url').order('created_at', { ascending: false }).limit(6),
        supabase.from('projects').select('*').neq('creator_id', uid).eq('status', 'open'),
      ]);

      if (prof)    setProfile(prof);
      if (proj)    setMyProjects(proj);
      if (apps)    setApplications(apps);
      if (feat)    setFeatured(feat);
      
      let collabs = collabsRes?.data || [];
      if (collabs.length > 0) {
        const collabIds = collabs.map(c => c.id);
        const { data: ratingsData } = await supabase
          .from('user_ratings')
          .select('ratee_id, score')
          .in('ratee_id', collabIds);
          
        if (ratingsData) {
          collabs.forEach(c => {
            const userRatings = ratingsData.filter(r => r.ratee_id === c.id);
            if (userRatings.length > 0) {
              const total = userRatings.reduce((sum, r) => sum + r.score, 0);
              c.collaborationScore = Math.round(total / userRatings.length);
            } else {
              c.collaborationScore = 0;
            }
          });
        } else {
          collabs.forEach(c => c.collaborationScore = 0);
        }
        setCollaborators(collabs);
      }

      // Smart match
      if (allProj && prof?.skills?.length > 0) {
        const userSkills = (prof.skills || []).map(s => s.toLowerCase());
        const scored = allProj
          .map(p => {
            const needed = (p.skills_needed || []).map(s => s.toLowerCase());
            const matches = userSkills.filter(s => needed.some(n => n.includes(s) || s.includes(n)));
            const score = needed.length > 0 ? Math.round((matches.length / needed.length) * 100) : 0;
            return { ...p, matchScore: score };
          })
          .filter(p => p.matchScore > 0)
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, 6);
        setRecommendations(scored);
      }

      // Teammate Recommendations for My Projects
      if (proj && proj.length > 0) {
        // Collect all skills needed across my projects
        const myProjectSkills = new Set();
        proj.forEach(p => {
          (p.skills_needed || []).forEach(s => myProjectSkills.add(s.toLowerCase()));
        });
        const neededSkills = Array.from(myProjectSkills);

        if (neededSkills.length > 0) {
          const { data: allUsers } = await supabase
            .from('profiles')
            .select('id, name, job_title, skills, avatar_url')
            .neq('id', uid);
          
          if (allUsers) {
            const scoredUsers = allUsers
              .filter(u => u.skills && u.skills.length > 0)
              .map(u => {
                const uSkills = u.skills.map(s => s.toLowerCase());
                const matches = neededSkills.filter(n => uSkills.some(s => s.includes(n) || n.includes(s)));
                const score = Math.round((matches.length / neededSkills.length) * 100);
                return { ...u, matchScore: score, matchedSkills: matches };
              })
              .filter(u => u.matchScore > 0)
              .sort((a, b) => b.matchScore - a.matchScore)
              .slice(0, 6);
            setTeammateRecommendations(scoredUsers);
          }
        }
      }

      setLoading(false);
    }
    load();
  }, [session]);

  const displayName = profile?.name || session?.user?.email?.split('@')[0] || 'User';
  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const userSkills = profile?.skills || [];
  const firstWorkspaceId = myProjects[0]?.id || applications.find(a => a.status === 'accepted')?.project_id;

  /* ── Stats ───────────────────────────────────────────────── */
  const stats = [
    { icon: FolderOpen,  label: 'My Projects',  value: myProjects.length,                                            color: '#3B82F6', delay: 0.05 },
    { icon: Users,       label: 'Applications', value: applications.length,                                          color: '#8B5CF6', delay: 0.10 },
    { icon: CheckCircle, label: 'Accepted',      value: applications.filter(a => a.status === 'accepted').length,    color: '#10B981', delay: 0.15 },
    { icon: Clock,       label: 'Pending',       value: applications.filter(a => a.status === 'pending').length,     color: '#F59E0B', delay: 0.20 },
  ];

  if (loading) return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050816]" style={{ fontFamily:"'Manrope',sans-serif" }}>

      <AuthNavbar session={session} pendingCount={pendingCount} />

      {/* Hero */}
      <AuthHero
        displayName={displayName}
        myProjectsCount={myProjects.length}
        applicationsCount={applications.length}
        myProjects={myProjects}
        applications={applications}
      />

      {/* Stats row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => <StatCard key={s.label} {...s} />)}
        </div>
      </div>

      {/* Trusted By */}
      <TrustedBy />

      {/* Profile completion banner */}
      {(!profile?.skills || profile.skills.length === 0) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="p-5 rounded-2xl border border-blue-500/25 bg-blue-500/8 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-sm font-semibold text-white mb-1">Lengkapi profilmu</div>
              <div className="text-xs text-slate-400">Tambahkan skills agar sistem bisa merekomendasikan proyek dan menampilkanmu sebagai Top Collaborator.</div>
            </div>
            <Link to="/profile"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-all flex-shrink-0">
              Edit Profil <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* My Workspaces */}
      {myProjects.length > 0 && <MyWorkspaces projects={myProjects} />}

      {/* Active Collaborations */}
      {applications.some(a => a.status === 'accepted') && <MyCollaborations applications={applications} />}

      {/* Recommendations */}
      <SkillBasedRecommendations 
        recommendations={recommendations} 
        teammateRecommendations={teammateRecommendations} 
        userSkills={userSkills} 
        session={session} 
        myProjects={myProjects} 
      />

      {/* Featured Projects */}
      {featured.length > 0 && <FeaturedSection featured={featured} />}

      {/* Features */}
      <Features 
        isDashboard={true} 
        firstWorkspaceId={firstWorkspaceId} 
        userSkills={userSkills} 
        recommendations={recommendations} 
        displayName={displayName} 
      />

      {/* Top Collaborators */}
      {collaborators.length > 0 && <TopCollaborators collaborators={collaborators} />}


      <Footer />
    </div>
  );
}
