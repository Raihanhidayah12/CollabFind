import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, MoreHorizontal, Trash2, Edit3, AlertCircle,
  Loader2, Calendar, User, ChevronRight, X, Save, Lock, MessageSquare,
} from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import { useLanguage } from '../../i18n/LanguageContext';
import SprintForm from './SprintForm';
import TaskThread from './TaskThread';
import { logActivity } from '../../utils/activityLogger';

// ── Konfigurasi kolom ────────────────────────────────────────
const COLUMNS = [
  { id: 'todo',        label: 'To-Do',       color: '#94A3B8' },
  { id: 'in_progress', label: 'In Progress', color: '#3B82F6' },
  { id: 'done',        label: 'Done',        color: '#10B981' },
];

// ── Warna kolom ──────────────────────────────────────────────
function getColColor(status) {
  return COLUMNS.find((c) => c.id === status)?.color || '#94A3B8';
}

function isPastDeadline(deadline) {
  if (!deadline) return false;
  return new Date(deadline) < new Date(new Date().toDateString());
}

// ── Form tugas ───────────────────────────────────────────────
function TaskForm({ task, teamMembers, defaultStatus, sprintOptions = [], defaultSprintId = null, onSave, onClose, saving, t }) {
  const [title, setTitle]       = useState(task?.title || '');
  const [desc, setDesc]         = useState(task?.description || '');
  const [deadline, setDeadline] = useState(task?.deadline || '');
  const [assignee, setAssignee] = useState(task?.assignee_id || '');
  const [sprintId, setSprintId] = useState(task?.sprint_id || defaultSprintId || '');
  const [titleError, setTitleError] = useState('');

  function handleSubmit() {
    if (!title.trim()) { setTitleError(t('wb.titleRequired')); return; }
    setTitleError('');
    onSave({
      title:       title.trim(),
      description: desc.trim() || null,
      deadline:    deadline || null,
      assignee_id: assignee || null,
      status:      task?.status || defaultStatus,
        sprint_id: sprintId || null,
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Judul */}
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setTitleError(''); }}
          placeholder={t('wb.taskTitle')}
          autoFocus
          className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 focus:bg-blue-500/[0.04] transition-all"
        />
        {titleError && (
          <p className="text-xs text-red-400 flex items-center gap-1 mt-1.5">
            <AlertCircle size={11} /> {titleError}
          </p>
        )}
      </div>

      {/* Deskripsi */}
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder={t('wb.taskDesc')}
        rows={3}
        className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-3 py-2.5 text-sm text-slate-300 placeholder-slate-600 outline-none focus:border-blue-500/50 transition-all resize-none"
      />

      {/* Deadline & Assignee */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">{t('wb.deadline')}</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-3 py-2 text-sm text-slate-300 outline-none focus:border-blue-500/50 transition-all"
            style={{ colorScheme: 'dark' }}
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">{t('wb.assignee')}</label>
          <select
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="w-full bg-[#0d1226] border border-white/[0.09] rounded-xl px-3 py-2 text-sm text-slate-300 outline-none focus:border-blue-500/50 transition-all"
          >
            <option value="">{t('wb.noAssignee')}</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>{m.name || m.email}</option>
            ))}
          </select>
          {/* Sprint selection */}
          <label className="text-xs text-slate-500 mt-2">{t('wb.sprint')}</label>
          <select
            value={sprintId}
            onChange={(e) => setSprintId(e.target.value)}
            className="w-full bg-[#0d1226] border border-white/[0.09] rounded-xl px-3 py-2 text-sm text-slate-300 outline-none focus:border-blue-500/50 transition-all"
          >
            <option value="">{t('wb.backlog')}</option>
            {sprintOptions.map((sp) => (
              <option key={sp.id} value={sp.id}>{sp.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end pt-1">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 border border-white/[0.08] hover:bg-white/[0.05] transition-all"
        >
          {t('wb.cancel')}
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {t('wb.save')}
        </button>
      </div>
    </div>
  );
}

// ── Task Card ────────────────────────────────────────────────
function TaskCard({ task, teamMembers, threadCount, onMove, onEdit, onDelete, onOpenThread, readOnly = false, canEdit = true, t }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const assigneeName = teamMembers.find((m) => m.id === task.assignee_id)?.name || null;
  const pastDeadline = isPastDeadline(task.deadline);

  const otherCols = COLUMNS.filter((c) => c.id !== task.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative p-2.5 sm:p-3 rounded-xl border border-white/[0.07] bg-[#0d1226] hover:border-white/[0.14] transition-all group"
    >
      {/* Header kartu */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-white leading-snug flex-1">{task.title}</p>
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="p-1 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/[0.06] transition-all opacity-0 group-hover:opacity-100 sm:opacity-100"
          >
            <MoreHorizontal size={14} />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-7 z-20 w-44 rounded-xl border border-white/[0.1] bg-[#0a0f1e] shadow-2xl overflow-hidden"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <div className="p-1">
                  {canEdit && (
                    <button
                      onClick={() => { setMenuOpen(false); onEdit(task); }}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all"
                    >
                      <Edit3 size={12} /> {t('wb.editTask')}
                    </button>
                  )}
                  {otherCols.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => { setMenuOpen(false); onMove(task, col.id); }}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all"
                    >
                      <ChevronRight size={12} style={{ color: col.color }} />
                      {t('wb.moveTo')} {col.label}
                    </button>
                  ))}
                  {canEdit && (
                    <>
                      <div className="h-px bg-white/[0.06] my-1" />
                      <button
                        onClick={() => { setMenuOpen(false); onDelete(task); }}
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 size={12} /> {t('wb.deleteTask')}
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {assigneeName && (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-300">
            <User size={9} /> {assigneeName}
          </span>
        )}
        {task.deadline && (
          <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] ${
            pastDeadline
              ? 'bg-red-500/10 border-red-500/25 text-red-400'
              : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
          }`}>
            <Calendar size={9} />
            {new Date(task.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
          </span>
        )}
      </div>

      {/* Thread button */}
      <button
        onClick={() => onOpenThread(task)}
        className="flex items-center gap-1.5 mt-2 px-2 py-1 rounded-lg text-[10px] text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 transition-all"
      >
        <MessageSquare size={10} />
        <span>{t('wb.discuss')}</span>
        {threadCount > 0 && (
          <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[9px] font-bold">
            {threadCount}
          </span>
        )}
      </button>
    </motion.div>
  );
}

// ── Kolom Kanban ─────────────────────────────────────────────
function KanbanColumn({ col, tasks, teamMembers, threadCounts, sprints, selectedSprintId, onMove, onEdit, onDelete, onAddTask, onOpenThread, readOnly = false, canEdit = true, t }) {
  const [adding, setAdding]     = useState(false);
  const [saving, setSaving]     = useState(false);

  async function handleAdd(data) {
    setSaving(true);
    await onAddTask({ ...data, status: col.id });
    setSaving(false);
    setAdding(false);
  }

  return (
    <div className="flex flex-col gap-2 sm:gap-3 min-w-0">
      {/* Header kolom */}
      <div className="flex items-center gap-2 px-1">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: col.color }} />
        <h3 className="text-xs sm:text-sm font-bold text-white flex-1 truncate" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
          {col.label}
        </h3>
        <span
          className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
          style={{ color: col.color, background: `${col.color}15`, borderColor: `${col.color}35` }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Body kolom */}
      <div
        className="flex-1 flex flex-col gap-2 p-2 sm:p-3 rounded-2xl border border-white/[0.06] min-h-[150px] sm:min-h-[200px]"
        style={{ background: `${col.color}06` }}
      >
        <AnimatePresence>
          {tasks.length === 0 && !adding ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-slate-600 text-center py-6"
            >
              {t('wb.noTasks')}
            </motion.p>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                teamMembers={teamMembers}
                threadCount={threadCounts[task.id] || 0}
                onMove={onMove}
                onEdit={onEdit}
                onDelete={onDelete}
                onOpenThread={onOpenThread}
                readOnly={readOnly}
                canEdit={canEdit}
                t={t}
              />
            ))
          )}
        </AnimatePresence>

        {/* Inline add form */}
        {adding && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/[0.05]"
          >
            <TaskForm
              defaultStatus={col.id}
              teamMembers={teamMembers}
              sprintOptions={sprints}
              defaultSprintId={selectedSprintId || null}
              onSave={handleAdd}
              onClose={() => setAdding(false)}
              saving={saving}
              t={t}
            />
          </motion.div>
        )}
      </div>

      {/* Tombol tambah — hidden when readOnly */}
      {!adding && !readOnly && (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-500 border border-dashed border-white/[0.08] hover:text-white hover:border-white/[0.18] hover:bg-white/[0.03] transition-all"
        >
          <Plus size={13} /> {t('wb.addTask')}
        </button>
      )}
    </div>
  );
}

// ── Komponen Utama ───────────────────────────────────────────
export default function ProjectBoards({ projectId, session, addToast, readOnly = false }) {
  const { t } = useLanguage();
  const [tasks, setTasks]               = useState([]);
  const [teamMembers, setTeamMembers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDemo, setShowDemo] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [sprints, setSprints] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState(null); // null = Backlog
  const [showSprintForm, setShowSprintForm] = useState(false);
  const [editingTask, setEditingTask]   = useState(null);
  const [savingEdit, setSavingEdit]     = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [threadCounts, setThreadCounts] = useState({});
  const [threadModalTask, setThreadModalTask] = useState(null);

  // ── Fetch data ───────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);

    const [{ data: tasksData }, { data: appData }, { data: projData }, { data: sprintsData }] = await Promise.all([
      supabase
        .from('workspace_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true }),
      supabase
        .from('applications')
        .select('applicant_id')
        .eq('project_id', projectId)
        .eq('status', 'accepted'),
      supabase
        .from('projects')
        .select('creator_id')
        .eq('id', projectId)
        .single(),
      supabase
        .from('project_sprints')
        .select('*')
        .eq('project_id', projectId),
    ]);

    setTasks(tasksData || []);

    // Set sprints data
    setSprints(sprintsData || []);

    // Determine if current user is owner
    setIsOwner(projData?.creator_id === session?.user?.id);

    // Kumpulkan semua user ID (owner + accepted applicants)
    const userIds = [];
    if (projData?.creator_id) userIds.push(projData.creator_id);
    (appData || []).forEach((a) => {
      if (a.applicant_id && !userIds.includes(a.applicant_id)) {
        userIds.push(a.applicant_id);
      }
    });

    // Fetch profiles terpisah
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', userIds);
      setTeamMembers(profilesData || []);
    } else {
      setTeamMembers([]);
    }

    // Fetch thread counts for all tasks
    if (tasksData && tasksData.length > 0) {
      const taskIds = tasksData.map(t => t.id);
      const { data: threadCountsData } = await supabase
        .from('workspace_task_threads')
        .select('task_id')
        .in('task_id', taskIds);

      const counts = {};
      (threadCountsData || []).forEach(t => {
        counts[t.task_id] = (counts[t.task_id] || 0) + 1;
      });
      setThreadCounts(counts);
    }

    setLoading(false);
  }, [projectId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Real-time subscription ───────────────────────────────
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`workspace_tasks_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workspace_tasks',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks((prev) => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setTasks((prev) =>
              prev.map((tk) => tk.id === payload.new.id ? payload.new : tk)
            );
          } else if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter((tk) => tk.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [projectId]);


  async function handleAddTask(data) {
    const { data: newTask, error } = await supabase
      .from('workspace_tasks')
      .insert({ ...data, project_id: projectId, created_by: session.user.id })
      .select()
      .single();

    if (error) {
      addToast(t('wb.addTaskFail'), 'error');
    } else {
      setTasks((prev) => [...prev, newTask]);
      logActivity({
        projectId,
        userId: session.user.id,
        action: 'task_created',
        entityType: 'task',
        entityId: newTask.id,
        entityTitle: newTask.title,
      });
    }
  }

  // ── Pindah task (optimistic) ─────────────────────────────
  async function handleMove(task, newStatus) {
    const prevTasks = tasks;
    const oldStatus = task.status;
    setTasks((prev) =>
      prev.map((tk) => tk.id === task.id ? { ...tk, status: newStatus } : tk)
    );

    const { error } = await supabase
      .from('workspace_tasks')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', task.id);

    if (error) {
      setTasks(prevTasks);
      console.error('Move error:', error);
      addToast(t('wb.moveFail'), 'error');
    } else {
      logActivity({
        projectId,
        userId: session.user.id,
        action: 'task_moved',
        entityType: 'task',
        entityId: task.id,
        entityTitle: task.title,
        details: { old_status: oldStatus, new_status: newStatus },
      });
    }
  }

  // ── Edit task ────────────────────────────────────────────
  async function handleEditSave(data) {
    setSavingEdit(true);
    const { data: updated, error } = await supabase
      .from('workspace_tasks')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', editingTask.id)
      .select()
      .single();

    setSavingEdit(false);

    if (error) {
      addToast(t('wb.editFail'), 'error');
    } else {
      setTasks((prev) => prev.map((tk) => tk.id === updated.id ? updated : tk));
      setEditingTask(null);
      addToast(t('wb.editSuccess'), 'success');
      logActivity({
        projectId,
        userId: session.user.id,
        action: 'task_edited',
        entityType: 'task',
        entityId: updated.id,
        entityTitle: updated.title,
      });
    }
  }

  // ── Hapus task ───────────────────────────────────────────
  async function handleDeleteConfirmed() {
    const task = confirmDelete;
    setConfirmDelete(null);

    const { error } = await supabase
      .from('workspace_tasks')
      .delete()
      .eq('id', task.id);

    if (error) {
      addToast(t('wb.deleteFail'), 'error');
    } else {
      setTasks((prev) => prev.filter((tk) => tk.id !== task.id));
      addToast(t('wb.deleteSuccess'), 'success');
      logActivity({
        projectId,
        userId: session.user.id,
        action: 'task_deleted',
        entityType: 'task',
        entityId: task.id,
        entityTitle: task.title,
      });
    }
  }

  // ── Sprint created handler ──────────────────────────────────────
  function handleSprintCreated(newSprint) {
    if (newSprint) setSprints((prev) => [...prev, newSprint]);
    setShowSprintForm(false);
    setSelectedSprint(newSprint);
  }

  // ── Render ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {COLUMNS.map((col) => (
          <div key={col.id} className="flex flex-col gap-3">
            <div className="h-7 w-24 rounded-lg bg-white/[0.04] animate-pulse" />
            <div className="h-[200px] rounded-2xl bg-white/[0.02] animate-pulse border border-white/[0.05]" />
          </div>
        ))}
      </div>
    );
  }

  // Compute progress for selected sprint (or all)
  const filteredTasks = selectedSprint ? tasks.filter(t => t.sprint_id === selectedSprint.id) : tasks.filter(t => !t.sprint_id);
  const totalTasks = filteredTasks.length;
  const doneTasks = filteredTasks.filter(t => t.status === 'done').length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);


  return (
    <>
      {/* Sprint navigation */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <button
          onClick={() => setSelectedSprint(null)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            selectedSprint === null
              ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/25'
              : 'bg-white/[0.04] border-white/[0.09] text-slate-400 hover:text-white hover:border-white/[0.2]'
          }`}
        >
          Backlog
        </button>
        {sprints.map((sp) => (
          <button
            key={sp.id}
            onClick={() => setSelectedSprint(sp)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              selectedSprint?.id === sp.id
                ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/25'
                : 'bg-white/[0.04] border-white/[0.09] text-slate-400 hover:text-white hover:border-white/[0.2]'
            }`}
          >
            {sp.name}
          </button>
        ))}
        {isOwner && !readOnly && (
          <button
            onClick={() => setShowSprintForm(true)}
            className="ml-auto px-4 py-1.5 rounded-full text-xs font-semibold border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all"
          >
            + {t('wb.newSprint')}
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs text-slate-500">{t('wb.progress')} {selectedSprint ? selectedSprint.name : t('wb.backlog')}</p>
          <p className="text-xs font-bold text-slate-300">{progressPercent}%</p>
        </div>
        <div className="w-full bg-white/[0.04] h-1.5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <p className="text-[10px] text-slate-600 mt-1">{doneTasks} {t('wb.ofTotal')} {totalTasks} {t('wb.tasksDone')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            col={col}
            tasks={tasks.filter((tk) => tk.status === col.id && (selectedSprint ? tk.sprint_id === selectedSprint.id : !tk.sprint_id))}
            teamMembers={teamMembers}
            threadCounts={threadCounts}
            sprints={sprints}
            selectedSprintId={selectedSprint?.id || null}
            onMove={handleMove}
            onEdit={(task) => setEditingTask(task)}
            onDelete={(task) => setConfirmDelete(task)}
            onAddTask={handleAddTask}
            onOpenThread={(task) => setThreadModalTask(task)}
            readOnly={readOnly}
            canEdit={isOwner}
            t={t}
          />
        ))}
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {editingTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md p-5 rounded-2xl border border-white/[0.1] bg-[#0a0f1e]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                  {t('wb.editTask')}
                </h3>
                <button
                  onClick={() => setEditingTask(null)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all"
                >
                  <X size={15} />
                </button>
              </div>
              <TaskForm
                task={editingTask}
                teamMembers={teamMembers}
                sprintOptions={sprints}
                defaultSprintId={selectedSprint?.id || null}
                onSave={handleEditSave}
                onClose={() => setEditingTask(null)}
                saving={savingEdit}
                t={t}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm delete modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm p-6 rounded-2xl border border-white/[0.1] bg-[#0a0f1e]"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={18} className="text-red-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                    {t('wb.deleteTaskTitle')}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {t('wb.deleteTaskDesc')} <span className="text-white font-medium">"{confirmDelete.title}"</span> {t('wb.deleteConfirmWarn')}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 border border-white/[0.08] hover:bg-white/[0.05] transition-all"
                >
                  {t('wb.cancel')}
                </button>
                <button
                  onClick={handleDeleteConfirmed}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 transition-all"
                >
                  {t('wb.deleteBtn')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Sprint creation modal */}
      <AnimatePresence>
        {showSprintForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSprintForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 16 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-sm rounded-2xl border border-white/[0.1] bg-[#0a0f1e]/95 backdrop-blur-xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-white" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                  {t('wb.newSprintTitle')}
                </h3>
                <button
                  onClick={() => setShowSprintForm(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all"
                >
                  <X size={15} />
                </button>
              </div>
              <SprintForm
                projectId={projectId}
                addToast={addToast}
                onClose={() => setShowSprintForm(false)}
                onSprintCreated={handleSprintCreated}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Thread modal */}
      <AnimatePresence>
        {threadModalTask && (
          <TaskThread
            task={threadModalTask}
            session={session}
            teamMembers={teamMembers}
            projectId={projectId}
            onClose={() => setThreadModalTask(null)}
            addToast={addToast}
          />
        )}
      </AnimatePresence>
    </>
  );
}
