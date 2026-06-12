import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, ArrowRight, Edit3, Trash2, MessageSquare, Upload, BookOpen,
  Loader2, Clock, User, Filter,
} from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import { ACTION_LABELS } from '../../utils/activityLogger';
import { useLanguage } from '../../i18n/LanguageContext';

const ACTION_ICONS = {
  task_created: Plus,
  task_moved: ArrowRight,
  task_edited: Edit3,
  task_deleted: Trash2,
  comment_added: MessageSquare,
  file_uploaded: Upload,
  wiki_edited: BookOpen,
};

const ACTION_COLORS = {
  task_created: '#10B981',
  task_moved: '#3B82F6',
  task_edited: '#F59E0B',
  task_deleted: '#EF4444',
  comment_added: '#8B5CF6',
  file_uploaded: '#06B6D4',
  wiki_edited: '#EC4899',
};

function timeAgo(dateStr, t) {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return t('at.justNow');
  if (seconds < 3600) return `${Math.floor(seconds / 60)} ${t('at.minsAgo')}`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} ${t('at.hoursAgo')}`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} ${t('at.daysAgo')}`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function groupByDate(activities, t) {
  const groups = {};
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  activities.forEach((act) => {
    const actDate = new Date(act.created_at).toDateString();
    let label;
    if (actDate === today) label = t('at.today');
    else if (actDate === yesterday) label = t('at.yesterday');
    else label = new Date(act.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    if (!groups[label]) groups[label] = [];
    groups[label].push(act);
  });

  return groups;
}

export default function ActivityTimeline({ projectId, session }) {
  const { t } = useLanguage();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState({});
  const [filter, setFilter] = useState('all');
  const [showFilter, setShowFilter] = useState(false);

  const fetchActivities = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from('workspace_activity')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (filter !== 'all') {
      query = query.eq('entity_type', filter);
    }

    const { data, error } = await query;

    if (!error && data) {
      setActivities(data);

      // Fetch profiles
      const userIds = [...new Set(data.map(a => a.user_id))];
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', userIds);

        const profileMap = {};
        (profilesData || []).forEach(p => {
          profileMap[p.id] = p;
        });
        setProfiles(profileMap);
      }
    }

    setLoading(false);
  }, [projectId, filter]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Real-time subscription
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`workspace_activity_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'workspace_activity',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          setActivities((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [projectId]);

  const filterOptions = [
    { value: 'all', labelKey: 'at.filterAll' },
    { value: 'task', labelKey: 'at.filterTask' },
    { value: 'thread', labelKey: 'at.filterComment' },
    { value: 'file', labelKey: 'at.filterFile' },
    { value: 'wiki', labelKey: 'at.filterWiki' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="text-blue-400 animate-spin" />
      </div>
    );
  }

  const grouped = groupByDate(activities, t);

  return (
    <div className="flex flex-col gap-4">
      {/* Filter */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 border border-white/[0.08] hover:text-white hover:border-white/[0.16] transition-all"
        >
          <Filter size={12} />
          Filter: {t(filterOptions.find(f => f.value === filter)?.labelKey)}
        </button>

        <AnimatePresence>
          {showFilter && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex gap-1"
            >
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setFilter(opt.value); setShowFilter(false); }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                    filter === opt.value
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'text-slate-500 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {t(opt.labelKey)}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Timeline */}
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
            <Clock size={24} className="text-slate-600" />
          </div>
          <p className="text-sm text-slate-500 mb-1">{t('at.noActivity')}</p>
          <p className="text-xs text-slate-600">{t('at.noActivityDesc')}</p>
        </div>
      ) : (
        Object.entries(grouped).map(([dateLabel, items]) => (
          <div key={dateLabel}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{dateLabel}</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            <div className="flex flex-col gap-2">
              <AnimatePresence>
                {items.map((activity) => {
                  const Icon = ACTION_ICONS[activity.action] || Clock;
                  const color = ACTION_COLORS[activity.action] || '#94A3B8';
                  const profile = profiles[activity.user_id];

                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      className="flex items-start gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all"
                    >
                      {/* Icon */}
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${color}18`, border: `1px solid ${color}33` }}
                      >
                        <Icon size={14} style={{ color }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[8px] font-bold text-white">
                            {profile?.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <span className="text-xs font-semibold text-white">{profile?.name || 'User'}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {ACTION_LABELS[activity.action] || activity.action}
                          {activity.entity_title && (
                            <span className="text-white font-medium"> "{activity.entity_title}"</span>
                          )}
                          {activity.details?.old_status && activity.details?.new_status && (
                            <span>
                              {' '}{t('at.from')} <span className="text-slate-300">{activity.details.old_status}</span> {t('at.to')} <span className="text-slate-300">{activity.details.new_status}</span>
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Time */}
                      <span className="text-[10px] text-slate-600 flex-shrink-0">
                        {timeAgo(activity.created_at, t)}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
