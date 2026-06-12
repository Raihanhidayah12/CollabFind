import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, FolderOpen, Star, Zap } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import { useLanguage } from '../../i18n/LanguageContext';

function getFallback(t) {
  return [
    { icon: Users,      color: '#3B82F6', text: `Ardi ${t('live.joinedProject')}`, project: 'React Native E-Commerce', time: `2 ${t('live.minutesAgo')}` },
    { icon: FolderOpen, color: '#8B5CF6', text: `Kezia ${t('live.createdProject')}`, project: 'AI Study Buddy', time: `4 ${t('live.minutesAgo')}` },
    { icon: Star,       color: '#F59E0B', text: `Budi ${t('live.gotRating')}`, project: 'DevConnect App', time: `7 ${t('live.minutesAgo')}` },
    { icon: Zap,        color: '#10B981', text: `Tim Sari ${t('live.shipped')}`, project: 'Open Source Dashboard', time: `11 ${t('live.minutesAgo')}` },
    { icon: Users,      color: '#06B6D4', text: `Reza ${t('live.joinedTeam')}`, project: 'Flutter Fintech App', time: `13 ${t('live.minutesAgo')}` },
    { icon: FolderOpen, color: '#EC4899', text: `Nadia ${t('live.postedProject')}`, project: 'UI Kit for Startups', time: `18 ${t('live.minutesAgo')}` },
    { icon: Star,       color: '#F59E0B', text: `Haikal ${t('live.completedMilestone')}`, project: 'Machine Learning API', time: `21 ${t('live.minutesAgo')}` },
    { icon: Zap,        color: '#3B82F6', text: `Tim Dika ${t('live.launched')}`, project: 'Social Media Tracker', time: `25 ${t('live.minutesAgo')}` },
  ];
}

function timeAgo(dateStr, t) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}${t('live.secondsAgo')}`;
  if (diff < 3600) return `${Math.floor(diff / 60)}${t('live.minutesAgo')}`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}${t('live.hoursAgo')}`;
  return `${Math.floor(diff / 86400)}${t('live.daysAgo')}`;
}

export default function LiveActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [visible, setVisible] = useState([]);
  const queueRef = useRef([]);
  const timerRef = useRef(null);
  const { t } = useLanguage();

  useEffect(() => {
    async function fetchActivities() {
      const [{ data: apps }, { data: projects }] = await Promise.all([
        supabase
          .from('applications')
          .select('id, created_at, role_applied, project_id, projects(title), profiles!applicant_id(name)')
          .order('created_at', { ascending: false })
          .limit(8),
        supabase
          .from('projects')
          .select('id, title, created_at, creator_id, profiles!creator_id(name)')
          .order('created_at', { ascending: false })
          .limit(6),
      ]);

      const items = [];

      if (apps && apps.length > 0) {
        apps.forEach((a) => {
          const name = a.profiles?.name || t('live.someone');
          const project = a.projects?.title || 'sebuah project';
          items.push({
            icon: Users,
            color: '#3B82F6',
            text: `${name} ${t('live.joinedProject')}`,
            project,
            time: timeAgo(a.created_at, t),
          });
        });
      }

      if (projects && projects.length > 0) {
        projects.forEach((p) => {
          const name = p.profiles?.name || t('live.someone');
          items.push({
            icon: FolderOpen,
            color: '#8B5CF6',
            text: `${name} ${t('live.createdProject')}`,
            project: p.title,
            time: timeAgo(p.created_at, t),
          });
        });
      }

      const allItems = items.length >= 4 ? items : getFallback(t);

      // Shuffle slightly for variety
      const shuffled = allItems.sort(() => Math.random() - 0.4);
      setActivities(shuffled);
    }

    fetchActivities();
  }, [t]);

  // Start rotating feed once data is ready
  useEffect(() => {
    if (activities.length === 0) return;

    queueRef.current = [...activities];

    const init = setTimeout(() => {
      const first = queueRef.current.shift();
      setVisible([first]);
    }, 1500);

    timerRef.current = setInterval(() => {
      setVisible((prev) => {
        if (queueRef.current.length === 0) {
          queueRef.current = [...activities];
        }
        const next = queueRef.current.shift();
        return [next, ...prev].slice(0, 3);
      });
    }, 3500);

    return () => {
      clearTimeout(init);
      clearInterval(timerRef.current);
    };
  }, [activities]);

  if (visible.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {visible.map((activity, i) => {
          const Icon = activity.icon;
          return (
            <motion.div
              key={`${activity.project}-${i}`}
              layout
              initial={{ opacity: 0, x: -60, scale: 0.92 }}
              animate={{ opacity: i === 0 ? 1 : 0.6 - i * 0.1, x: 0, scale: 1 - i * 0.03 }}
              exit={{ opacity: 0, x: -40, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/[0.08] bg-[#0a0f1e]/90 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.5)] max-w-xs"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${activity.color}22`, border: `1px solid ${activity.color}44` }}
              >
                <Icon size={15} style={{ color: activity.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-300 leading-snug truncate">
                  <span>{activity.text} </span>
                  <span className="font-semibold text-white">{activity.project}</span>
                </p>
                <p className="text-[10px] text-slate-600 mt-0.5">{activity.time}</p>
              </div>
              {i === 0 && (
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
