import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, FolderPlus, Users, Star, MessageSquare, CheckCircle, Zap, TrendingUp } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

const BADGES = [
  { id: 'first_project', label: 'First Project', icon: FolderPlus, desc: 'Buat proyek pertamamu', check: (_, projects) => projects.length >= 1, color: '#10B981' },
  { id: 'three_projects', label: '3 Projects', icon: FolderPlus, desc: 'Buat 3 proyek', check: (_, projects) => projects.length >= 3, color: '#3B82F6' },
  { id: 'first_collab', label: 'First Collab', icon: Users, desc: 'Join 1 kolaborasi', check: (_, __, accepted) => accepted >= 1, color: '#8B5CF6' },
  { id: 'five_collabs', label: 'Team Player', icon: Users, desc: 'Join 5 kolaborasi', check: (_, __, accepted) => accepted >= 5, color: '#F59E0B' },
  { id: 'first_chat', label: 'Chatter', icon: MessageSquare, desc: 'Kirim pesan pertama', check: (messages) => messages >= 1, color: '#06B6D4' },
  { id: 'ten_tasks', label: 'Get It Done', icon: CheckCircle, desc: 'Selesaikan 10 task', check: (_, __, ___, tasksDone) => tasksDone >= 10, color: '#EC4899' },
  { id: 'five_skills', label: 'Skilled', icon: Star, desc: 'Tambahkan 5 skills', check: (p) => (p?.skills?.length || 0) >= 5, color: '#F97316' },
  { id: 'top_rated', label: 'Top Rated', icon: Zap, desc: 'Collab score 80+', check: (p) => (p?.collaboration_score || 0) >= 80, color: '#EAB308' },
  { id: 'all_rounder', label: 'All Rounder', icon: TrendingUp, desc: 'Unlock 5 badges', check: (_, __, ___, ____, unlocked) => unlocked >= 5, color: '#14B8A6' },
];

export default function AchievementsBadges({ profile, myProjects, applications, session }) {
  const [messageCount, setMessageCount] = useState(0);
  const [tasksDone, setTasksDone] = useState(0);

  useEffect(() => {
    if (!session) return;
    const uid = session.user.id;

    supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('sender_id', uid)
      .then(({ count }) => setMessageCount(count || 0));

    supabase
      .from('workspace_tasks')
      .select('id', { count: 'exact', head: true })
      .eq('assignee_id', uid)
      .eq('status', 'done')
      .then(({ count }) => setTasksDone(count || 0));
  }, [session]);

  const acceptedCount = applications?.filter(a => a.status === 'accepted').length || 0;

  // Count unlocked (need to compute all_rounder last)
  let unlockedCount = 0;
  const tempUnlocked = BADGES.filter(b => {
    if (b.id === 'all_rounder') return false;
    const done = b.check(profile, myProjects, acceptedCount, tasksDone, 0);
    if (done) unlockedCount++;
    return done;
  });

  // Now check all_rounder
  const badges = BADGES.map(b => {
    let unlocked = false;
    if (b.id === 'all_rounder') {
      unlocked = unlockedCount >= 5;
    } else {
      unlocked = b.check(profile, myProjects, acceptedCount, tasksDone, unlockedCount);
    }
    return { ...b, unlocked };
  });

  unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/80 overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award size={14} className="text-yellow-400" />
          <h3 className="text-sm font-bold text-white">Achievements</h3>
        </div>
        <span className="text-[10px] text-slate-500">{unlockedCount}/{BADGES.length}</span>
      </div>

      {/* Progress bar */}
      <div className="px-4 pt-3">
        <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-amber-400"
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedCount / BADGES.length) * 100}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </div>

      {/* Badges grid */}
      <div className="p-3 grid grid-cols-3 gap-2">
        {badges.map(badge => {
          const Icon = badge.icon;
          return (
            <div
              key={badge.id}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                badge.unlocked
                  ? 'border-white/[0.1] bg-white/[0.04]'
                  : 'border-white/[0.03] opacity-40'
              }`}
              title={`${badge.label} — ${badge.desc}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${badge.unlocked ? '' : 'grayscale'}`}
                style={badge.unlocked ? { background: `${badge.color}18`, border: `1px solid ${badge.color}33` } : {}}
              >
                <Icon size={14} style={{ color: badge.unlocked ? badge.color : '#475569' }} />
              </div>
              <span className="text-[9px] text-center text-slate-400 leading-tight">{badge.label}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
