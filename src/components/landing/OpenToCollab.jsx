import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, ArrowRight, Sparkles, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { useLanguage } from '../../i18n/LanguageContext';

function UserCard({ user, index, t }) {
  const hasAvatar = user.avatar_url?.startsWith('http');
  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#06B6D4', '#EC4899'];
  const color = user.color || COLORS[index % COLORS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      whileHover={{ y: -4 }}
      className="group relative flex flex-col gap-3 p-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.14] hover:bg-white/[0.04] transition-all duration-300 overflow-hidden"
    >
      <div className="flex items-start gap-3">
        {hasAvatar ? (
          <img
            src={user.avatar_url}
            alt={user.name}
            className="w-11 h-11 rounded-xl object-cover flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}88)`, boxShadow: `0 0 16px ${color}33` }}
          >
            {user.name?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-white truncate">{user.name}</p>
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0"
              style={{ background: `${color}18`, color: color }}
            >
              {t(user.availability, user.availability === 'otc.activeThisWeek' ? 'Active this week' : 'Open for collab')}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{user.role}</p>
        </div>
      </div>

      {user.location && (
        <div className="flex items-center gap-1 text-[11px] text-slate-600">
          <MapPin size={10} />
          {user.location}
        </div>
      )}

      {user.skills && user.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {user.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 rounded-md text-[11px] border"
              style={{ background: `${color}0d`, borderColor: `${color}22`, color: color }}
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      <Link
        to="/teammates"
        className="mt-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white border border-white/[0.06] hover:border-white/[0.14] bg-white/[0.02] hover:bg-white/[0.06] transition-all duration-200"
      >
        {t('otc.viewProfile', 'View Profile')} <ArrowRight size={12} />
      </Link>

      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 30% 0%, ${color}0a, transparent 70%)` }}
      />
    </motion.div>
  );
}

export default function OpenToCollab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    async function fetchUsers() {
      const { data } = await supabase
        .from('profiles')
        .select('id, name, job_title, skills, location, avatar_url')
        .not('name', 'is', null)
        .order('created_at', { ascending: false })
        .limit(6);

      if (data && data.length > 0) {
        const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#06B6D4', '#EC4899'];
        const mapped = data.map((u, i) => ({
          id: u.id,
          name: u.name || 'Anonymous',
          role: u.job_title || u.skills?.[0] || 'Builder',
          skills: Array.isArray(u.skills) ? u.skills : [],
          location: u.location,
          avatar_url: u.avatar_url,
          color: COLORS[i % COLORS.length],
          availability: i % 2 === 0 ? 'otc.activeThisWeek' : 'otc.openForCollab',
        }));
        setUsers(mapped);
      } else {
        setUsers([]);
      }
      setLoading(false);
    }
    fetchUsers();
  }, []);

  return (
    <section className="open-to-collab-section py-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-600/6 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/6 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-green-300 text-xs font-medium mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              {t('otc.badge', 'Active This Week')}
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              {t('otc.heading', 'Open to')}{' '}
              <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">{t('otc.headingHighlight', 'Collab')}</span>
            </h2>
            <p className="text-slate-400 mt-2 max-w-md">
              {t('otc.subtitle', 'Builders actively looking for projects or teammates this week.')}
            </p>
          </div>
          <Link
            to="/teammates"
            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white border border-white/[0.08] hover:border-white/[0.18] bg-white/[0.03] hover:bg-white/[0.07] transition-all duration-200"
          >
            <Users size={15} /> {t('otc.seeAll', 'See All')}
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] animate-pulse h-40" />
            ))}
          </div>
        ) : users.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user, i) => (
              <UserCard key={user.id} user={user} index={i} t={t} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-500 text-sm">{t('otc.empty', 'No profiles available yet.')}</p>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 p-5 rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.01] flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Sparkles size={18} className="text-yellow-400" />
            <p className="text-sm text-slate-400">
              <span className="font-semibold text-white">{t('otc.calloutBold', 'You can be here too.')}</span>{' '}
              {t('otc.calloutText', 'Update your profile and mark yourself as open to collab.')}
            </p>
          </div>
          <Link
            to="/register"
            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-400 hover:to-cyan-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300"
          >
            {t('otc.registerNow', 'Register Now')} <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
