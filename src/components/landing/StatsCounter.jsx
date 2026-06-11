import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { FolderOpen, Users, Trophy, Zap } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';

const FALLBACK = [
  { icon: FolderOpen, label: 'Active Projects', value: 2500, suffix: '+', color: '#3B82F6' },
  { icon: Users,      label: 'Members',          value: 15000, suffix: '+', color: '#8B5CF6' },
  { icon: Trophy,     label: 'Successes',         value: 7000,  suffix: '+', color: '#10B981' },
  { icon: Zap,        label: 'Skills Matched',    value: 50000, suffix: '+', color: '#F59E0B' },
];

function useCountUp(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function StatCard({ icon: Icon, label, value, suffix, color, started }) {
  const count = useCountUp(value, 1800, started);

  const display = count >= 1000
    ? count >= 10000
      ? `${(count / 1000).toFixed(0)}K`
      : `${(count / 1000).toFixed(1)}K`
    : count.toString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col items-center gap-3 p-7 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.14] hover:bg-white/[0.04] transition-all duration-300 overflow-hidden"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
        style={{ background: `${color}18`, border: `1px solid ${color}33`, boxShadow: `0 0 20px ${color}18` }}
      >
        <Icon size={22} style={{ color }} />
      </div>
      <div className="text-center">
        <div
          className="text-4xl font-black tabular-nums"
          style={{ background: `linear-gradient(135deg, #fff 40%, ${color})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          {display}{suffix}
        </div>
        <div className="text-sm text-slate-500 mt-1">{label}</div>
      </div>
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}0d, transparent 70%)` }}
      />
    </motion.div>
  );
}

export default function StatsCounter() {
  const [stats, setStats] = useState(FALLBACK);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    async function fetchStats() {
      const [
        { count: projectCount },
        { count: memberCount },
        { count: appCount },
      ] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'accepted'),
      ]);

      if (projectCount || memberCount) {
        setStats([
          { icon: FolderOpen, label: 'Active Projects',      value: projectCount  || 2500,  suffix: '+', color: '#3B82F6' },
          { icon: Users,      label: 'Members',              value: memberCount   || 15000, suffix: '+', color: '#8B5CF6' },
          { icon: Trophy,     label: 'Kolaborasi Berhasil',  value: appCount      || 7000,  suffix: '+', color: '#10B981' },
          { icon: Zap,        label: 'Skills Terdaftar',     value: (memberCount  || 15000) * 3, suffix: '+', color: '#F59E0B' },
        ]);
      }
    }
    fetchStats();
  }, []);

  return (
    <section ref={ref} className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[200px] bg-blue-600/6 rounded-full blur-[120px]" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 text-xs font-medium mb-4">
            <Zap size={12} /> Platform in Numbers
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Angka yang{' '}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">bicara sendiri</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} started={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
