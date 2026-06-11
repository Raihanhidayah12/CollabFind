import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FolderOpen, CheckCircle, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

function ProjectProgressCard({ project }) {
  const [total, setTotal] = useState(0);
  const [done, setDone] = useState(0);
  const [inProgress, setInProgress] = useState(0);
  const [overdue, setOverdue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: tasks } = await supabase
        .from('workspace_tasks')
        .select('id, status, deadline')
        .eq('project_id', project.id);

      if (tasks) {
        const all = tasks.length;
        const d = tasks.filter(t => t.status === 'done').length;
        const ip = tasks.filter(t => t.status === 'in_progress').length;
        const now = new Date(new Date().toDateString());
        const od = tasks.filter(t => t.deadline && new Date(t.deadline) < now && t.status !== 'done').length;
        setTotal(all);
        setDone(d);
        setInProgress(ip);
        setOverdue(od);
      }
      setLoading(false);
    }
    load();
  }, [project.id]);

  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const barColor = pct === 100 ? '#10B981' : pct > 50 ? '#3B82F6' : pct > 0 ? '#F59E0B' : '#94A3B8';

  if (loading) {
    return (
      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] animate-pulse h-28" />
    );
  }

  return (
    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-all">
      <div className="flex items-center justify-between mb-2">
        <Link to={`/dashboard/workspace/${project.id}`} className="text-xs font-semibold text-white hover:text-blue-300 truncate flex items-center gap-1.5">
          <FolderOpen size={11} className="text-slate-500 flex-shrink-0" />
          <span className="truncate">{project.title}</span>
        </Link>
        <span className="text-[10px] font-bold flex-shrink-0 ml-2" style={{ color: barColor }}>{pct}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden mb-2">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6 }}
          style={{ background: barColor }}
        />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 text-[10px] text-slate-500">
        <span className="flex items-center gap-1"><CheckCircle size={9} className="text-green-400" /> {done}</span>
        <span className="flex items-center gap-1"><Loader2 size={9} className="text-blue-400" /> {inProgress}</span>
        {overdue > 0 && <span className="flex items-center gap-1"><AlertCircle size={9} className="text-red-400" /> {overdue} overdue</span>}
      </div>
    </div>
  );
}

export default function ProjectProgressOverview({ myProjects }) {
  if (!myProjects || myProjects.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/80 overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen size={14} className="text-green-400" />
          <h3 className="text-sm font-bold text-white">Progress Proyek</h3>
        </div>
      </div>
      <div className="p-2 space-y-2 max-h-72 overflow-y-auto">
        {myProjects.slice(0, 5).map(p => (
          <ProjectProgressCard key={p.id} project={p} />
        ))}
      </div>
    </motion.div>
  );
}
