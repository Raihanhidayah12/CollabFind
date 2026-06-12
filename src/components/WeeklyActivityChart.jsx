import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useLanguage } from '../i18n/LanguageContext';

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function WeeklyActivityChart({ session }) {
  const { t } = useLanguage();
  const dayLabels = [t('wac.sun'), t('wac.mon'), t('wac.tue'), t('wac.wed'), t('wac.thu'), t('wac.fri'), t('wac.sat')];
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    const uid = session.user.id;

    async function load() {
      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);

      // Get tasks completed this week
      const { data: tasks } = await supabase
        .from('workspace_tasks')
        .select('id, updated_at')
        .eq('assignee_id', uid)
        .eq('status', 'done')
        .gte('updated_at', weekAgo.toISOString());

      // Get messages sent this week
      const { data: messages } = await supabase
        .from('messages')
        .select('id, created_at')
        .eq('sender_id', uid)
        .gte('created_at', weekAgo.toISOString());

      // Build daily activity for last 7 days
      const daily = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayName = dayLabels[d.getDay()];
        const isToday = i === 0;

        const taskCount = tasks?.filter(tk => tk.updated_at?.startsWith(dateStr)).length || 0;
        const msgCount = messages?.filter(m => m.created_at?.startsWith(dateStr)).length || 0;
        const total = taskCount + msgCount;

        daily.push({ day: dayName, total, isToday, taskCount, msgCount });
      }

      const maxVal = Math.max(...daily.map(d => d.total), 1);
      setData(daily.map(d => ({ ...d, pct: Math.round((d.total / maxVal) * 100) })));
      setLoading(false);
    }
    load();
  }, [session]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/80 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
          <BarChart3 size={14} className="text-blue-400" />
          <h3 className="text-sm font-bold text-white">{t('wac.title')}</h3>
        </div>
        <div className="p-4 flex items-end justify-between gap-2 h-24">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="w-6 rounded-t bg-white/[0.05] animate-pulse h-12" />
          ))}
        </div>
      </div>
    );
  }

  const totalActivity = data.reduce((s, d) => s + d.total, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/80 overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 size={14} className="text-blue-400" />
          <h3 className="text-sm font-bold text-white">{t('wac.title')}</h3>
        </div>
        <span className="text-[10px] text-slate-500">{totalActivity} {t('wac.actions')}</span>
      </div>
      <div className="p-3">
        <div className="flex items-end justify-between gap-1.5 h-20">
          {data.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <motion.div
                className="w-full rounded-t min-h-[4px] transition-all"
                initial={{ height: 4 }}
                animate={{ height: `${Math.max(d.pct, 8)}%` }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                style={{
                  background: d.isToday
                    ? 'linear-gradient(to top, #3B82F6, #8B5CF6)'
                    : d.total > 0 ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)',
                }}
              />
              <span className={`text-[9px] ${d.isToday ? 'text-blue-400 font-bold' : 'text-slate-600'}`}>
                {d.day}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 pt-2 border-t border-white/[0.04] text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-blue-500/30" /> {t('wac.tasksDone')}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-purple-500/30" /> {t('wac.msgsSent')}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
