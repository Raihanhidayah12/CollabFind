import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, CheckSquare, Circle, Clock, User, Calendar,
  ChevronRight, Zap, Plus, TrendingUp, Target,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ── Demo data ─────────────────────────────────────────────────
const SPRINT = { name: 'Sprint 1', end: '20 Jun 2025' };

const INITIAL_TASKS = [
  { id: 1, title: 'Desain UI login page',      status: 'done',        assignee: 'Rina',  deadline: '10 Jun', color: '#10B981' },
  { id: 2, title: 'Buat REST API auth',         status: 'done',        assignee: 'Dimas', deadline: '11 Jun', color: '#10B981' },
  { id: 3, title: 'Integrasi Supabase storage', status: 'in_progress', assignee: 'Rina',  deadline: '14 Jun', color: '#3B82F6' },
  { id: 4, title: 'Halaman dashboard user',     status: 'in_progress', assignee: 'Dimas', deadline: '15 Jun', color: '#3B82F6' },
  { id: 5, title: 'Notifikasi real-time',       status: 'todo',        assignee: 'Rizky', deadline: '18 Jun', color: '#94A3B8' },
  { id: 6, title: 'Testing & QA',               status: 'todo',        assignee: 'Rizky', deadline: '20 Jun', color: '#94A3B8' },
];

const COLS = [
  { id: 'todo',        label: 'To-Do',       color: '#94A3B8' },
  { id: 'in_progress', label: 'In Progress', color: '#3B82F6' },
  { id: 'done',        label: 'Done',        color: '#10B981' },
];

const MOVE_SEQUENCE = [
  // [taskId, toStatus, delay(ms)]
  [5, 'in_progress', 1200],
  [6, 'in_progress', 2800],
  [3, 'done',        4400],
  [4, 'done',        5600],
];

function TaskCard({ task, animating }) {
  const colColor = COLS.find(c => c.id === task.status)?.color || '#94A3B8';
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.3 }}
      className={`p-2.5 rounded-xl border transition-all ${
        animating
          ? 'border-blue-400/50 bg-blue-500/10 shadow-[0_0_12px_rgba(59,130,246,0.25)]'
          : 'border-white/[0.07] bg-white/[0.03]'
      }`}
    >
      <div className="text-xs font-semibold text-white leading-snug mb-1.5">{task.title}</div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="flex items-center gap-1 text-[10px] text-purple-300">
          <User size={8} /> {task.assignee}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-slate-400">
          <Calendar size={8} /> {task.deadline}
        </span>
      </div>
    </motion.div>
  );
}

function KanbanBoard({ tasks, animatingId }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {COLS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id);
        return (
          <div key={col.id} className="flex flex-col gap-2">
            {/* Column header */}
            <div className="flex items-center gap-1.5 px-0.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: col.color }} />
              <span className="text-[10px] font-bold text-white">{col.label}</span>
              <span
                className="ml-auto px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                style={{ color: col.color, background: `${col.color}20` }}
              >
                {colTasks.length}
              </span>
            </div>
            {/* Column body */}
            <div
              className="flex flex-col gap-1.5 p-2 rounded-xl border border-white/[0.05] min-h-[80px]"
              style={{ background: `${col.color}06` }}
            >
              <AnimatePresence>
                {colTasks.map(task => (
                  <TaskCard key={task.id} task={task} animating={task.id === animatingId} />
                ))}
              </AnimatePresence>
              {colTasks.length === 0 && (
                <p className="text-[10px] text-slate-700 text-center py-3">Kosong</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProgressBar({ tasks }) {
  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'done').length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Target size={11} className="text-emerald-400" />
          <span className="text-[11px] font-semibold text-white">{SPRINT.name}</span>
          <span className="text-[10px] text-slate-500">· deadline {SPRINT.end}</span>
        </div>
        <motion.span
          key={pct}
          initial={{ scale: 1.3, color: '#00FFC2' }}
          animate={{ scale: 1, color: pct === 100 ? '#10B981' : '#94A3B8' }}
          transition={{ duration: 0.4 }}
          className="text-xs font-extrabold"
          style={{ fontFamily: "'Space Grotesk',sans-serif" }}
        >
          {pct}%
        </motion.span>
      </div>
      <div className="w-full bg-white/[0.05] h-2 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-slate-600">{done} dari {total} tugas selesai</span>
        {pct === 100 && (
          <motion.span
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[10px] font-bold text-emerald-400"
          >
            Sprint selesai!
          </motion.span>
        )}
      </div>
    </div>
  );
}

export default function TaskManagementDemo({ onClose, isLoggedIn = false, firstWorkspaceId = null }) {
  const [tasks, setTasks]           = useState(INITIAL_TASKS);
  const [animatingId, setAnimatingId] = useState(null);
  const [step, setStep]             = useState(0); // 0–4
  const [autoplay, setAutoplay]     = useState(true);

  // Auto-run move sequence once on mount
  useEffect(() => {
    if (!autoplay) return;
    const timers = [];

    MOVE_SEQUENCE.forEach(([taskId, toStatus, delay]) => {
      const t = setTimeout(() => {
        setAnimatingId(taskId);
        setTimeout(() => {
          setTasks(prev => prev.map(tk => tk.id === taskId ? { ...tk, status: toStatus } : tk));
          setStep(s => s + 1);
          setTimeout(() => setAnimatingId(null), 400);
        }, 400);
      }, delay);
      timers.push(t);
    });

    return () => timers.forEach(clearTimeout);
  }, [autoplay]);

  function handleReplay() {
    setTasks(INITIAL_TASKS);
    setStep(0);
    setAnimatingId(null);
    setAutoplay(false);
    setTimeout(() => setAutoplay(true), 50);
  }

  const done = tasks.filter(t => t.status === 'done').length;
  const pct = Math.round((done / tasks.length) * 100);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        style={{ background: 'rgba(5,8,22,0.88)', backdropFilter: 'blur(14px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 24 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-2xl rounded-2xl border border-white/[0.1] bg-[#0a0f1e]/95 backdrop-blur-xl p-6 shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
          onClick={e => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/[0.07] transition-all"
          >
            <X size={16} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <CheckSquare size={18} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                Task Management Demo
              </h3>
              <p className="text-xs text-slate-500">Simulasi Kanban Board &amp; Sprint Tracking otomatis</p>
            </div>
            <button
              onClick={handleReplay}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/[0.09] bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all"
            >
              <TrendingUp size={11} /> Ulangi Demo
            </button>
          </div>

          {/* Step label */}
          <div className="flex items-center gap-2 mb-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-1.5 text-[11px] text-slate-400"
              >
                {step < MOVE_SEQUENCE.length ? (
                  <>
                    <div className="w-3 h-3 rounded-full border border-blue-500/40 border-t-blue-400 animate-spin" />
                    {step === 0 && 'Memulai sprint — tim siap bekerja...'}
                    {step === 1 && 'Rizky mulai mengerjakan "Notifikasi real-time"...'}
                    {step === 2 && 'Rizky juga ambil task "Testing & QA"...'}
                    {step === 3 && 'Rina selesaikan "Integrasi Supabase storage" ✓'}
                    {step >= 4 && 'Sprint hampir selesai!'}
                  </>
                ) : (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckSquare size={12} /> Semua tugas selesai! Sprint berhasil!
                  </span>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress */}
          <ProgressBar tasks={tasks} />

          {/* Kanban Board */}
          <KanbanBoard tasks={tasks} animatingId={animatingId} />

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: 'Total Tugas', val: tasks.length, color: '#94A3B8' },
              { label: 'Selesai', val: done, color: '#10B981' },
              { label: 'Progress', val: `${pct}%`, color: pct >= 100 ? '#10B981' : '#3B82F6' },
            ].map(s => (
              <div key={s.label} className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.03] text-center">
                <motion.div
                  key={s.val}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-base font-extrabold"
                  style={{ color: s.color, fontFamily: "'Space Grotesk',sans-serif" }}
                >
                  {s.val}
                </motion.div>
                <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          {isLoggedIn ? (
            firstWorkspaceId ? (
              <Link
                to={`/dashboard/workspace/${firstWorkspaceId}`}
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full mt-5 py-3 rounded-xl text-sm font-bold text-white transition-all"
                style={{
                  background: 'linear-gradient(135deg, #10B981, #3B82F6)',
                  boxShadow: '0 0 24px rgba(16,185,129,0.35)',
                }}
              >
                <Zap size={14} />
                Buka Workspace Kamu
                <ChevronRight size={14} />
              </Link>
            ) : (
              <Link
                to="/dashboard"
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full mt-5 py-3 rounded-xl text-sm font-bold text-white transition-all"
                style={{
                  background: 'linear-gradient(135deg, #10B981, #3B82F6)',
                  boxShadow: '0 0 24px rgba(16,185,129,0.35)',
                }}
              >
                <Zap size={14} />
                Buat Proyek Baru
                <ChevronRight size={14} />
              </Link>
            )
          ) : (
            <Link
              to="/register"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full mt-5 py-3 rounded-xl text-sm font-bold text-white transition-all"
              style={{
                background: 'linear-gradient(135deg, #10B981, #3B82F6)',
                boxShadow: '0 0 24px rgba(16,185,129,0.35)',
              }}
            >
              <Zap size={14} />
              Mulai Kelola Proyek Kamu Sekarang
              <ChevronRight size={14} />
            </Link>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
