import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Trash2, MessageSquare, Loader2 } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import { useLanguage } from '../../i18n/LanguageContext';
import MentionInput from './MentionInput';
import { parseMentions, renderContentWithMentions } from '../../utils/mentionParser';
import { logActivity } from '../../utils/activityLogger';

function timeAgo(dateStr, t) {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return t('tt.justNow');
  if (seconds < 3600) return `${Math.floor(seconds / 60)} ${t('tt.minsAgo')}`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} ${t('tt.hoursAgo')}`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} ${t('tt.daysAgo')}`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function TaskThread({ task, session, teamMembers, projectId, onClose, addToast }) {
  const { t } = useLanguage();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [input, setInput] = useState('');
  const [profiles, setProfiles] = useState({});
  const bottomRef = useRef(null);

  // Fetch threads
  const fetchThreads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('workspace_task_threads')
      .select('*')
      .eq('task_id', task.id)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setThreads(data);

      // Fetch profiles for all users
      const userIds = [...new Set(data.map(t => t.user_id))];
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, name, avatar_url')
          .in('id', userIds);

        const profileMap = {};
        (profilesData || []).forEach(p => {
          profileMap[p.id] = p;
        });
        setProfiles(profileMap);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchThreads();
  }, [task.id]);

  // Real-time subscription
  useEffect(() => {
    if (!task.id) return;

    const channel = supabase
      .channel(`task_threads_${task.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workspace_task_threads',
          filter: `task_id=eq.${task.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setThreads((prev) => [...prev, payload.new]);
          } else if (payload.eventType === 'DELETE') {
            setThreads((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [task.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threads]);

  // Submit comment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || submitting) return;

    setSubmitting(true);
    const content = input.trim();
    setInput('');

    // Insert thread comment
    const { data: newThread, error } = await supabase
      .from('workspace_task_threads')
      .insert({
        task_id: task.id,
        user_id: session.user.id,
        content,
      })
      .select()
      .single();

    if (error) {
      addToast(t('tt.sendFail'), 'error');
      setSubmitting(false);
      return;
    }

    // Log activity
    logActivity({
      projectId,
      userId: session.user.id,
      action: 'comment_added',
      entityType: 'thread',
      entityId: newThread.id,
      entityTitle: task.title,
    });

    // Parse mentions and create notifications
    const mentions = parseMentions(content);
    if (mentions.length > 0 && newThread) {
      const mentionInserts = mentions
        .filter(m => m.userId !== session.user.id) // Don't notify self
        .map(m => ({
          project_id: projectId,
          task_id: task.id,
          thread_id: newThread.id,
          mentioned_user_id: m.userId,
          mentioned_by: session.user.id,
        }));

      if (mentionInserts.length > 0) {
        await supabase.from('workspace_mentions').insert(mentionInserts);
      }
    }

    setSubmitting(false);
  };

  // Delete comment
  const handleDelete = async (threadId) => {
    const { error } = await supabase
      .from('workspace_task_threads')
      .delete()
      .eq('id', threadId);

    if (error) {
      addToast(t('tt.deleteFail'), 'error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 16 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-2xl rounded-2xl border border-white/[0.1] bg-[#0a0f1e]/95 backdrop-blur-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.07] bg-white/[0.02] flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <MessageSquare size={16} className="text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
              {t('tt.title')}
            </h3>
            <p className="text-xs text-slate-500 truncate">{task.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} className="text-blue-400 animate-spin" />
            </div>
          ) : threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                <MessageSquare size={24} className="text-slate-600" />
              </div>
              <p className="text-sm text-slate-500 mb-1">{t('tt.noThreads')}</p>
              <p className="text-xs text-slate-600">{t('tt.noThreadsDesc')}</p>
            </div>
          ) : (
            <AnimatePresence>
              {threads.map((thread) => {
                const profile = profiles[thread.user_id];
                const isMine = thread.user_id === session.user.id;

                return (
                  <motion.div
                    key={thread.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`flex gap-3 ${isMine ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      {profile?.name?.[0]?.toUpperCase() || 'U'}
                    </div>

                    {/* Content */}
                    <div className={`flex-1 max-w-[75%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">
                          {profile?.name || 'User'}
                        </span>
                        <span className="text-[10px] text-slate-600">{timeAgo(thread.created_at, t)}</span>
                      </div>

                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMine
                          ? 'bg-gradient-to-br from-blue-600/80 to-purple-600/80 text-white rounded-tr-sm'
                          : 'bg-white/[0.06] border border-white/[0.08] text-slate-200 rounded-tl-sm'
                      }`}>
                        <div className="whitespace-pre-wrap break-words">
                          {renderContentWithMentions(thread.content, teamMembers).map((part, i) =>
                            part.type === 'mention' ? (
                              <span
                                key={i}
                                className={`px-1 py-0.5 rounded font-medium ${
                                  isMine
                                    ? 'bg-white/20 text-white'
                                    : 'bg-blue-500/20 text-blue-300'
                                }`}
                              >
                                @{part.name}
                              </span>
                            ) : (
                              <span key={i}>{part.value}</span>
                            )
                          )}
                        </div>
                      </div>

                      {isMine && (
                        <button
                          onClick={() => handleDelete(thread.id)}
                          className="p-1 rounded text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 hover:opacity-100"
                          title={t('tt.deleteComment')}
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="px-5 py-4 border-t border-white/[0.07] bg-white/[0.01] flex-shrink-0">
          <div className="flex gap-2 items-start">
            <div className="flex-1 min-w-0">
              <MentionInput
                value={input}
                onChange={setInput}
                placeholder={t('tt.placeholder')}
                teamMembers={teamMembers}
                disabled={submitting}
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!input.trim() || submitting}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-[0_0_14px_rgba(59,130,246,0.35)] disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              {submitting ? (
                <Loader2 size={15} className="text-white animate-spin" />
              ) : (
                <Send size={15} className="text-white" />
              )}
            </motion.button>
          </div>
          <p className="text-[10px] text-slate-700 mt-2 text-center">
            {t('tt.mentionHint')}
          </p>
        </form>
      </motion.div>
    </motion.div>
  );
}
