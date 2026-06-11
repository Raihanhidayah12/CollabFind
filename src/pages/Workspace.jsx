import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, FolderOpen, BookOpen, LayoutDashboard, Activity,
  ArrowLeft, Users, Lock,
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import PageNavbar from '../components/PageNavbar';
import FileStorage from '../components/workspace/FileStorage';
import Wiki from '../components/workspace/Wiki';
import ProjectBoards from '../components/workspace/ProjectBoards';
import ActivityTimeline from '../components/workspace/ActivityTimeline';
import RateTeammatesModal from '../components/workspace/RateTeammatesModal';
import Toast, { useToast } from '../components/workspace/Toast';

const TABS = [
  { id: 'files',    label: 'File Storage',    icon: FolderOpen },
  { id: 'wiki',     label: 'Wiki',            icon: BookOpen },
  { id: 'boards',   label: 'Project Boards',  icon: LayoutDashboard },
  { id: 'activity', label: 'Activity',        icon: Activity },
];

export default function Workspace() {
  const { projectId } = useParams();
  const navigate      = useNavigate();

  const [session, setSession]     = useState(null);
  const [project, setProject]     = useState(null);
  const [access, setAccess]       = useState(null); // null=loading, true=ok, false=denied
  const [activeTab, setActiveTab] = useState('files');
  const [showRateModal, setShowRateModal] = useState(false);
  const [isOwner, setIsOwner]     = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  // ── 1. Ambil session ──────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate('/login');
        return;
      }
      setSession(data.session);
    });
  }, [navigate]);

  // ── 2. Verifikasi akses & ambil project ───────────────────
  useEffect(() => {
    if (!session || !projectId) return;

    async function verifyAccess() {
      const uid = session.user.id;

      const [{ data: proj }, { data: app }, { data: invited }] = await Promise.all([
        supabase
          .from('projects')
          .select('id, title, accent_color, creator_id, status')
          .eq('id', projectId)
          .single(),
        supabase
          .from('applications')
          .select('id')
          .eq('project_id', projectId)
          .eq('applicant_id', uid)
          .eq('status', 'accepted')
          .maybeSingle(),
        supabase
          .from('invitations')
          .select('id')
          .eq('project_id', projectId)
          .eq('invitee_id', uid)
          .eq('status', 'accepted')
          .maybeSingle(),
      ]);

      if (!proj) {
        setAccess(false);
        return;
      }

      const isOwner       = proj.creator_id === uid;
      const isCollaborator = !!app || !!invited;

      // Deny non-owner access to completed projects
      if (proj.status === 'completed' && !isOwner) {
        setAccess(false);
        return;
      }

      setProject(proj);
      setIsOwner(isOwner);
      setAccess(isOwner || isCollaborator);
    }

    verifyAccess();
  }, [session, projectId]);

  // ── Loading ───────────────────────────────────────────────
  if (access === null) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  // ── 403 — Akses ditolak ───────────────────────────────────
  if (access === false) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center p-6" style={{ fontFamily: "'Manrope',sans-serif" }}>
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-red-600/6 rounded-full blur-[120px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
            <Lock size={26} className="text-red-400" />
          </div>
          <h1 className="text-xl font-extrabold text-white mb-2" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
            Akses Ditolak
          </h1>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            {project?.status === 'completed'
              ? 'Proyek ini telah selesai oleh owner dan workspace tidak lagi dapat diakses oleh anggota tim.'
              : 'Kamu tidak memiliki akses ke workspace ini. Hanya Project Owner dan Collaborator yang diterima yang dapat masuk.'}
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 transition-all"
          >
            <ArrowLeft size={14} /> Kembali ke Dashboard
          </Link>
        </motion.div>
      </div>
    );
  }

  // ── Main workspace ────────────────────────────────────────
  const accentColor = project?.accent_color || '#3B82F6';

  return (
    <div className="min-h-screen bg-[#050816]" style={{ fontFamily: "'Manrope',sans-serif" }}>
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[400px] bg-blue-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-0 w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-[100px]" />
      </div>

      <PageNavbar breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Workspace' }]} homePath="/dashboard" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}33` }}
            >
              <Users size={16} style={{ color: accentColor }} />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Workspace</p>
              <h1
                className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight"
                style={{ fontFamily: "'Space Grotesk',sans-serif" }}
              >
                {project?.title}
              </h1>
            </div>
          </div>
        </motion.div>

        {/* Tab navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] w-fit mb-6"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white/[0.09] text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </motion.div>

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'files' && (
            <FileStorage projectId={projectId} session={session} addToast={addToast} readOnly={false} />
          )}
          {activeTab === 'wiki' && (
            <Wiki projectId={projectId} session={session} addToast={addToast} />
          )}
          {activeTab === 'boards' && (
            <ProjectBoards projectId={projectId} session={session} addToast={addToast} readOnly={!isOwner} />
          )}
          {activeTab === 'activity' && (
            <ActivityTimeline projectId={projectId} session={session} />
          )}
        </motion.div>
      </div>

      {/* Toast notifications */}
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* Rate Teammates Modal */}
      {showRateModal && project && session && (
        <RateTeammatesModal
          project={project}
          session={session}
          onClose={() => setShowRateModal(false)}
        />
      )}
    </div>
  );
}
