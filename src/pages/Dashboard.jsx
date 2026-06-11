import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CollabFindBot from '../components/CollabFindBot';
import {
  Zap, Bell,
  Users, FolderOpen, CheckCircle, Clock, ArrowRight,
  Plus, Sparkles, TrendingUp, Star, ExternalLink,
  MessageSquare, Loader2, UserPlus, Search,
  Calendar, Activity, Eye, Wallet, Briefcase, Target,
  AlertCircle, Mail, BarChart3,
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';
import PageNavbar from '../components/PageNavbar';
import AuthFooter from '../components/AuthFooter';
import RatePlatform from '../components/RatePlatform';
import OnboardingChecklist from '../components/OnboardingChecklist';
import ChatInboxPreview from '../components/ChatInboxPreview';
import Features from '../components/landing/Features';
import ProjectProgressOverview from '../components/ProjectProgressOverview';
import QuickStatusUpdate from '../components/QuickStatusUpdate';
import AchievementsBadges from '../components/AchievementsBadges';
import QuickSearch from '../components/QuickSearch';
import WeeklyActivityChart from '../components/WeeklyActivityChart';
import RecentVisitors from '../components/RecentVisitors';
import ThemeToggle from '../components/ThemeToggle';

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

/* ── Stat card (top row) — clickable ──────────────────────── */
function StatCard({ icon: Icon, label, value, color, delay, onClick }) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <motion.div {...fadeUp(delay)}
      as={Comp}
      onClick={onClick}
      className={`flex items-center gap-4 p-5 rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 ${onClick ? 'cursor-pointer hover:border-white/[0.14] hover:bg-[#0a0f1e]/90 transition-all group' : ''}`}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}33` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div className="flex-1 text-left">
        <div className="text-2xl font-extrabold text-white" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>{value}</div>
        <div className="text-xs text-slate-500 mt-0.5">{label}</div>
      </div>
      {onClick && (
        <ArrowRight size={15} className="text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
      )}
    </motion.div>
  );
}

/* ── Quick Actions Bar ───────────────────────────────────── */
function QuickActions() {
  const actions = [
    { to: '/create-project', icon: Plus, label: 'Buat Proyek', gradient: 'from-blue-500 to-purple-600' },
    { to: '/explore', icon: Search, label: 'Cari Proyek', gradient: 'from-slate-600/40 to-slate-700/40' },
    { to: '/teammates', icon: Users, label: 'Cari Teammate', gradient: 'from-purple-500/40 to-cyan-500/40' },
    { to: '/dashboard/chat', icon: MessageSquare, label: 'Chat', gradient: 'from-emerald-500/40 to-teal-500/40' },
    { to: '/freelance', icon: Briefcase, label: 'Freelance', gradient: 'from-orange-500/40 to-pink-500/40' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a) => (
        <Link key={a.to} to={a.to}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r ${a.gradient} hover:opacity-90 transition-all shadow-lg`}>
          <a.icon size={13} /> {a.label}
        </Link>
      ))}
    </div>
  );
}

/* ── Skeleton Loader Grid ────────────────────────────────── */
function SkeletonGrid({ count = 6, cols = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' }) {
  return (
    <div className={`grid ${cols} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-5 rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/50 animate-pulse h-48" />
      ))}
    </div>
  );
}

/* ── Recent Activity Feed ─────────────────────────────────── */
function RecentActivityFeed({ activities, loading }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#0a0f1e]/50 animate-pulse h-16" />
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm">
        Belum ada aktivitas terbaru.
      </div>
    );
  }

  const ICONS = {
    message: { icon: MessageSquare, color: '#3B82F6' },
    application: { icon: UserPlus, color: '#8B5CF6' },
    task: { icon: Target, color: '#10B981' },
    invitation: { icon: Mail, color: '#F59E0B' },
  };

  return (
    <div className="space-y-3">
      {activities.slice(0, 8).map((act, i) => {
        const { icon: Icon, color } = ICONS[act.type] || ICONS.message;
        const timeAgo = getTimeAgo(act.created_at);
        return (
          <motion.div key={act.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-3 p-3 rounded-xl border border-white/[0.05] bg-[#0a0f1e]/40 hover:bg-[#0a0f1e]/70 transition-all"
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}18`, border: `1px solid ${color}33` }}>
              <Icon size={14} style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-300 leading-snug">{act.description}</p>
              <p className="text-[10px] text-slate-600 mt-0.5">{timeAgo}</p>
            </div>
            {act.link && (
              <Link to={act.link} className="text-[10px] text-blue-400 hover:text-blue-300 flex-shrink-0">
                Lihat
              </Link>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

function getTimeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins}m lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}j lalu`;
  const days = Math.floor(hours / 24);
  return `${days}h lalu`;
}

/* ── Upcoming Deadlines ───────────────────────────────────── */
function UpcomingDeadlines({ tasks, loading }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-3 rounded-xl bg-[#0a0f1e]/50 animate-pulse h-14" />
        ))}
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500 text-sm">
        Tidak ada deadline mendatang.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task, i) => {
        const daysLeft = getDaysLeft(task.deadline);
        const isUrgent = daysLeft <= 2;
        const isPast = daysLeft < 0;
        return (
          <motion.div key={task.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              isPast ? 'border-red-500/30 bg-red-500/5' :
              isUrgent ? 'border-yellow-500/30 bg-yellow-500/5' :
              'border-white/[0.05] bg-[#0a0f1e]/40'
            }`}
          >
            <Calendar size={14} className={isPast ? 'text-red-400' : isUrgent ? 'text-yellow-400' : 'text-slate-500'} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-300 truncate">{task.title}</p>
              <p className="text-[10px] text-slate-600">{task.projectTitle || 'Project'}</p>
            </div>
            <span className={`text-[10px] font-semibold flex-shrink-0 ${
              isPast ? 'text-red-400' : isUrgent ? 'text-yellow-400' : 'text-slate-500'
            }`}>
              {isPast ? `${Math.abs(daysLeft)}h lalu` : daysLeft === 0 ? 'Hari ini' : `${daysLeft}h lagi`}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

function getDaysLeft(deadline) {
  if (!deadline) return 999;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dl = new Date(deadline);
  dl.setHours(0, 0, 0, 0);
  return Math.ceil((dl - now) / (1000 * 60 * 60 * 24));
}


/* ── Pending Invitations Badge ────────────────────────────── */
function PendingInvitationsBadge({ invitations }) {
  const navigate = useNavigate();
  const pending = (invitations || []).filter(i => i.status === 'pending');
  if (pending.length === 0) return null;

  async function handleAccept(inviteId, projectId) {
    await supabase
      .from('invitations')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', inviteId);
    navigate(`/dashboard/workspace/${projectId}`);
  }

  async function handleDecline(inviteId) {
    await supabase
      .from('invitations')
      .update({ status: 'declined', updated_at: new Date().toISOString() })
      .eq('id', inviteId);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-yellow-500/20 bg-[#0a0f1e]/80 overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail size={14} className="text-yellow-400" />
          <h3 className="text-sm font-bold text-white">Undangan Masuk</h3>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/20 text-yellow-400">{pending.length}</span>
        </div>
      </div>
      <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
        {pending.slice(0, 4).map((inv) => (
          <div key={inv.id} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <p className="text-xs text-slate-300 font-medium truncate">{inv.projects?.title || 'Project'}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Dari: {inv.inviter_name || 'User'}</p>
            <div className="flex gap-1.5 mt-2">
              <button
                onClick={() => handleAccept(inv.id, inv.project_id)}
                className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold text-white bg-green-500/20 hover:bg-green-500/30 transition-all"
              >
                Terima
              </button>
              <button
                onClick={() => handleDecline(inv.id)}
                className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold text-slate-400 border border-white/[0.08] hover:bg-white/[0.05] transition-all"
              >
                Tolak
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
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
              className="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-white leading-[1.2] sm:leading-[1.1] tracking-tight mb-4"
              style={{ fontFamily:"'Space Grotesk',sans-serif" }}>
              {greeting},{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                {displayName}
              </span>
            </motion.h1>

            <motion.p {...fadeUp(0.15)}
              className="text-sm sm:text-base lg:text-lg text-slate-400 mb-8 max-w-xl leading-relaxed break-words">
              Kelola proyekmu, temukan kolaborator baru, dan akses workspace tim — semuanya di satu tempat.
            </motion.p>

            {/* Quick Actions */}
            <motion.div {...fadeUp(0.2)}>
              <QuickActions />
            </motion.div>


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
                  className="w-full flex items-center gap-3 hover:bg-white/[0.03] rounded-xl px-2 py-1.5 transition-all group"
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
                  className="w-full flex items-center gap-3 hover:bg-white/[0.03] rounded-xl px-2 py-1.5 transition-all group"
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
  const [declinedIds, setDeclinedIds] = useState([]);

  const hasSkills = userSkills && userSkills.length > 0;

  const visibleTeammates = teammateRecommendations.filter(u => !declinedIds.includes(u.inviteId));

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

    // Insert pre-filled message (INVITATION)
    const msgId = crypto.randomUUID();
    const projName = myProjects[0]?.title || 'Proyek';
    const content = `INVITE:${projName}:Halo! Saya melihat profilmu sangat cocok dengan proyek ${projName} saya. Apakah kamu tertarik untuk mengobrol lebih lanjut?`;
    
    await supabase.from('messages').insert({
      id: msgId,
      conversation_id: convId,
      sender_id: session.user.id,
      type: 'text',
      content: content
    });

    navigate(`/dashboard/chat?conv=${convId}`);
  }

  async function handleAcceptInvite(inviteId, projectId) {
    // Update invitation status to accepted
    await supabase
      .from('invitations')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', inviteId);
    
    // Navigate to workspace
    navigate(`/dashboard/workspace/${projectId}`);
  }

  async function handleDeclineInvite(inviteId) {
    await supabase
      .from('invitations')
      .update({ status: 'declined', updated_at: new Date().toISOString() })
      .eq('id', inviteId);

    setDeclinedIds(prev => [...prev, inviteId]);
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
                  // eslint-disable-next-line no-unused-vars
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
              ) : visibleTeammates.length > 0 ? (
                visibleTeammates.slice(0, 6).map((u, i) => {
                  const initial = (u.name || 'U')[0].toUpperCase();
                  const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                  const scoreColor = u.matchScore >= 80 ? '#00FFC2' : u.matchScore >= 50 ? '#F59E0B' : '#94A3B8';
                  
                  // Check if this is an invitation received
                  const isInvitedMe = u.invitedMe === true;
                  
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
                        {isInvitedMe ? '👤 Undangan' : `✦ ${u.matchScore}% Match`}
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
                          {isInvitedMe && u.inviteProjectTitle && (
                            <p className="text-xs text-purple-400 mt-1">Proyek: {u.inviteProjectTitle}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-4 flex-1">
                        {(u.matchedSkills || []).slice(0, 4).map(sk => (
                          <span key={sk} className="px-1.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-300">{sk}</span>
                        ))}
                      </div>

                      {isInvitedMe && u.inviteId ? (
                        <div className="flex gap-2">
                          <Link 
                            to={`/dashboard/workspace/${u.inviteProjectId}`}
                            onClick={(e) => {
                              e.preventDefault();
                              handleAcceptInvite(u.inviteId, u.inviteProjectId);
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white bg-green-500/80 hover:bg-green-500 transition-all"
                          >
                            <ExternalLink size={12} />
                            Join Workspace
                          </Link>
                          <button 
                            onClick={() => handleDeclineInvite(u.inviteId)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 transition-all"
                          >
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleInvite(u)}
                          disabled={invitingId === u.id}
                          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-600 transition-all disabled:opacity-50"
                        >
                          {invitingId === u.id ? <Loader2 size={12} className="animate-spin" /> : <MessageSquare size={12} />}
                          Invite to Project
                        </button>
                      )}
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


/* ── Find Teammates Preview ──────────────────────────────── */
function FindTeammatesPreview({ allProfiles, session, myProjects }) {
  const [invitingId, setInvitingId] = useState(null);

  async function handleInvite(profile) {
    if (!session || !myProjects.length) return;
    
    if (invitingId) return;
    setInvitingId(profile.id);

    let convId = null;
    const { data: memberRows } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', session.user.id);

    if (memberRows?.length) {
      const convIds = memberRows.map(row => row.conversation_id);
      const { data: dmConvs } = await supabase
        .from('conversations')
        .select('id')
        .eq('type', 'dm')
        .in('id', convIds);

      if (dmConvs?.length) {
        const { data: theirMemberships } = await supabase
          .from('conversation_members')
          .select('conversation_id')
          .eq('user_id', profile.id)
          .in('conversation_id', dmConvs.map(conv => conv.id));

        convId = theirMemberships?.[0]?.conversation_id || null;
      }
    }

    if (!convId) {
      convId = crypto.randomUUID();
      await supabase.from('conversations').insert({ id: convId, type: 'dm', name: null });
      await supabase.from('conversation_members').insert([
        { conversation_id: convId, user_id: session.user.id },
        { conversation_id: convId, user_id: profile.id },
      ]);
    }

    const firstName = (profile.name || 'Builder').split(' ')[0];
    await supabase.from('messages').insert({
      id: crypto.randomUUID(),
      conversation_id: convId,
      sender_id: session.user.id,
      type: 'text',
      content: `Halo ${firstName}! Saya tertarik mengajak kamu ngobrol soal proyek ${myProjects[0].title}.`,
    });

    setInvitingId(null);
    // eslint-disable-next-line react-hooks/immutability
    window.location.href = `/dashboard/chat?conv=${convId}`;
  }

  if (!allProfiles || allProfiles.length === 0) return null;

  return (
    <section className="py-14 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/8 rounded-full blur-[120px]" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-medium mb-2">
              <Users size={11} /> Talent Directory
            </div>
            <h2 className="text-xl font-extrabold text-white" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>
              Find Teammates
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">Temukan developer, designer, dan builder untuk proyek berikutnya</p>
          </div>
          <Link to="/teammates" className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
            Lihat semua <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allProfiles.slice(0, 6).map((profile, i) => {
            const initial = (profile.name || 'B')[0].toUpperCase();
            const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
            return (
              <motion.div key={profile.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4 }}
                className="group relative p-5 rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/60 hover:border-white/[0.14] transition-all overflow-hidden"
              >
                <div className="flex items-center gap-3 mb-4">
                  {profile.avatar_url?.startsWith('http') ? (
                    <img src={profile.avatar_url} alt={profile.name} className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white flex-shrink-0"
                      style={{ background: `${color}20`, border: `1px solid ${color}44` }}>
                      {initial}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors truncate">{profile.name || 'Anonymous'}</p>
                    <p className="text-xs text-slate-500 truncate">{profile.job_title || 'Builder'}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed min-h-[42px] mb-4">{profile.bio || 'Terbuka untuk kolaborasi proyek baru.'}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(profile.skills || []).slice(0, 3).map(skill => (
                    <span key={skill} className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.07] text-xs text-slate-400">{skill}</span>
                  ))}
                </div>

                {session && myProjects.length > 0 ? (
                  <button
                    onClick={() => handleInvite(profile)}
                    disabled={invitingId === profile.id || profile.id === session.user.id}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-600 disabled:opacity-45 disabled:cursor-not-allowed transition-all hover:from-blue-400 hover:to-cyan-500"
                  >
                    {invitingId === profile.id ? (
                      <>
                        <Loader2 size={12} className="animate-spin" /> Membuka chat...
                      </>
                    ) : (
                      <>
                        <MessageSquare size={12} /> Hubungi
                      </>
                    )}
                  </button>
                ) : (
                  <Link to="/teammates" className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-slate-300 border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] transition-all">
                    <UserPlus size={12} /> Lihat Profil
                  </Link>
                )}
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
  const [allProfiles, setAllProfiles]   = useState([]);
  const [loading, setLoading]           = useState(true);

  // New state for sidebar
  const [tasks, setTasks]               = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [activities, setActivities]     = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  /* ── 1. Get session ──────────────────────────────────────── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { navigate('/login'); return; }
      setSession(data.session);
    });
  }, [navigate]);

  /* ── Setup real-time notifications (must be after session) ── */
  useRealtimeNotifications(session);

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
        { data: allProfs },
        { data: invitations },
        { data: pendingInv },
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', uid).single(),
        supabase.from('projects').select('*').eq('creator_id', uid).order('created_at', { ascending: false }),
        supabase.from('applications').select('*, projects(id, title, accent_color, status)').eq('applicant_id', uid).order('created_at', { ascending: false }),
        supabase.from('projects').select('*').eq('is_featured', true).order('created_at', { ascending: false }).limit(6),
        supabase.from('profiles').select('id, name, bio, skills, job_title, avatar_url').order('created_at', { ascending: false }).limit(6),
        supabase.from('projects').select('*').neq('creator_id', uid).eq('status', 'open'),
        supabase.from('profiles').select('id, name, bio, skills, job_title, avatar_url').neq('id', uid).order('created_at', { ascending: false }).limit(24),
        supabase.from('invitations').select('*, projects(*)').eq('invitee_id', uid).eq('status', 'accepted'),
        supabase.from('invitations').select('*, projects(title), inviter_id').eq('invitee_id', uid).eq('status', 'pending').order('created_at', { ascending: false }),
      ]);

      // Fetch tasks from workspace_tasks table (may not exist in older schemas)
      let allTasks = null;
      try {
        const tasksRes = await supabase
          .from('workspace_tasks')
          .select('id, title, deadline, status, project_id, assignee_id')
          .eq('assignee_id', uid)
          .neq('status', 'done')
          .order('deadline', { ascending: true })
          .limit(10);
        if (!tasksRes.error && tasksRes.data) {
          allTasks = tasksRes.data;
        }
      } catch {
        // Table may not exist — silently skip
      }

      // Fetch inviter names for pending invitations
      if (pendingInv && pendingInv.length > 0) {
        const enriched = await Promise.all(
          pendingInv.map(async (inv) => {
            const { data: inviterProfile } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', inv.inviter_id)
              .single();
            return { ...inv, inviter_name: inviterProfile?.name || 'User' };
          })
        );
        setPendingInvitations(enriched);
      }

      // Enrich tasks with project titles
      if (allTasks && allTasks.length > 0) {
        const projectIds = [...new Set(allTasks.map(t => t.project_id))];
        const { data: projectData } = await supabase
          .from('projects')
          .select('id, title')
          .in('id', projectIds);

        const enrichedTasks = allTasks.map(t => ({
          ...t,
          projectTitle: projectData?.find(p => p.id === t.project_id)?.title || 'Project',
        }));
        setTasks(enrichedTasks);
      }
      setTasksLoading(false);

      // Build activity feed from applications + invitations + messages
      const activityItems = [];

      if (apps) {
        apps.slice(0, 4).forEach(app => {
          const typeMap = { pending: 'application', accepted: 'application', rejected: 'application' };
          activityItems.push({
            id: `app-${app.id}`,
            type: typeMap[app.status] || 'application',
            description: app.status === 'pending'
              ? `Lamaran kamu ke "${app.projects?.title}" masih pending`
              : app.status === 'accepted'
              ? `Lamaran kamu ke "${app.projects?.title}" diterima!`
              : `Lamaran kamu ke "${app.projects?.title}" ditolak`,
            created_at: app.created_at,
            link: `/project/${app.project_id}`,
          });
        });
      }

      if (pendingInv) {
        pendingInv.slice(0, 3).forEach(inv => {
          activityItems.push({
            id: `inv-${inv.id}`,
            type: 'invitation',
            description: `Undangan bergabung ke "${inv.projects?.title || 'project'}"`,
            created_at: inv.created_at,
            link: `/dashboard/workspace/${inv.project_id}`,
          });
        });
      }

      activityItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setActivities(activityItems.slice(0, 8));
      setActivitiesLoading(false);

      if (prof)    setProfile(prof);
      if (apps)    setApplications(apps);
      if (feat)    setFeatured(feat);
      if (allProfs) setAllProfiles(allProfs);

      // Merge own projects with accepted invitations
      let allMyProjects = proj || [];
      if (invitations && invitations.length > 0) {
        const invitedProjects = invitations
          .map(inv => inv.projects)
          .filter(p => p && !allMyProjects.some(mp => mp.id === p.id));
        allMyProjects = [...allMyProjects, ...invitedProjects];
      }
      setMyProjects(allMyProjects);

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
      // First, load pending invitations I received
      const { data: pendingInvites } = await supabase
        .from('invitations')
        .select('id, inviter_id, project_id')
        .eq('invitee_id', uid)
        .eq('status', 'pending');
      
      const inviteesFromMyProjects = [];
      if (pendingInvites && pendingInvites.length > 0) {
        // Get details of users who invited me and their project details
        for (const inv of pendingInvites) {
          const [{ data: inviter }, { data: project }] = await Promise.all([
            supabase
              .from('profiles')
              .select('id, name, job_title, skills, avatar_url')
              .eq('id', inv.inviter_id)
              .single(),
            supabase
              .from('projects')
              .select('title')
              .eq('id', inv.project_id)
              .single()
          ]);
          
          if (inviter) {
            inviteesFromMyProjects.push({
              ...inviter,
              invitedMe: true,
              inviteProjectTitle: project?.title,
              inviteProjectId: inv.project_id,
              inviteId: inv.id
            });
          }
        }
      }

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
            
            // Combine invited users with recommendations (put invited users first)
            const combined = [...inviteesFromMyProjects, ...scoredUsers];
            setTeammateRecommendations(combined);
          }
        } else {
          setTeammateRecommendations(inviteesFromMyProjects);
        }
      }

      setLoading(false);
    }
    load();
  }, [session]);

  const displayName = profile?.name || session?.user?.email?.split('@')[0] || 'User';
  // eslint-disable-next-line no-unused-vars
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

      <PageNavbar breadcrumbs={[{ label: 'Dashboard' }]} homePath="/dashboard" />

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

      {/* Main 2-column layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Main content (left) ─────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Profile completion banner (inline) */}
            {(!profile?.skills || profile.skills.length === 0) && (
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

            {/* Find Teammates Preview */}
            {allProfiles.length > 0 && <FindTeammatesPreview allProfiles={allProfiles} session={session} myProjects={myProjects} />}
          </div>

          {/* ── Sidebar (right, sticky) ─────────────────────── */}
          <aside className="w-full lg:w-80 flex-shrink-0 space-y-4">
            <div className="lg:sticky lg:top-20 space-y-4">
              {/* Quick Search */}
              <QuickSearch />

              {/* Onboarding Checklist */}
              <OnboardingChecklist profile={profile} myProjects={myProjects} />

              {/* Quick Status Update */}
              <QuickStatusUpdate session={session} />

              {/* Pending Invitations */}
              <PendingInvitationsBadge invitations={pendingInvitations} />

              {/* Chat Inbox Preview */}
              <ChatInboxPreview session={session} />

              {/* Project Progress Overview */}
              <ProjectProgressOverview myProjects={myProjects} />

              {/* Weekly Activity Chart */}
              <WeeklyActivityChart session={session} />

              {/* Recent Activity Feed */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/80 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
                  <Activity size={14} className="text-slate-400" />
                  <h3 className="text-sm font-bold text-white">Aktivitas Terbaru</h3>
                </div>
                <div className="p-3 max-h-64 overflow-y-auto">
                  <RecentActivityFeed activities={activities} loading={activitiesLoading} />
                </div>
              </motion.div>

              {/* Upcoming Deadlines */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/80 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
                  <Calendar size={14} className="text-red-400" />
                  <h3 className="text-sm font-bold text-white">Deadline Mendatang</h3>
                </div>
                <div className="p-3 max-h-64 overflow-y-auto">
                  <UpcomingDeadlines tasks={tasks} loading={tasksLoading} />
                </div>
              </motion.div>

              {/* Recent Visitors */}
              <RecentVisitors session={session} />

              {/* Achievements */}
              <AchievementsBadges
                profile={profile}
                myProjects={myProjects}
                applications={applications}
                session={session}
              />

              {/* Theme Toggle */}
              <ThemeToggle />
            </div>
          </aside>
        </div>
      </div>

      {/* Rate Platform — compact inline, not a full section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-lg mx-auto">
          <RatePlatform session={session} />
        </div>
      </div>

      <AuthFooter />
      <CollabFindBot isDashboard={true} />
    </div>
  );
}