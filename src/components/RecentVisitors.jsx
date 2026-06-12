import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, ArrowRight } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useLanguage } from '../i18n/LanguageContext';

function getTimeAgo(dateStr, t) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t('rv.justNow');
  if (mins < 60) return `${mins}${t('rv.minsAgo')}`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}${t('rv.hoursAgo')}`;
  return `${Math.floor(hours / 24)}${t('rv.daysAgo')}`;
}

const AVATAR_COLORS = ['#3B82F6','#8B5CF6','#06B6D4','#10B981','#F59E0B','#EC4899'];

export default function RecentVisitors({ session }) {
  const { t } = useLanguage();
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    const uid = session.user.id;

    async function load() {
      // Try to fetch profile_views table (may not exist)
      const { data: views, error } = await supabase
        .from('profile_views')
        .select('viewer_id, created_at')
        .eq('profile_id', uid)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error || !views || views.length === 0) {
        // Fallback: show users who recently interacted with you
        const { data: recentMessages } = await supabase
          .from('messages')
          .select('sender_id, created_at')
          .neq('sender_id', uid)
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentMessages) {
          const uniqueSenders = [...new Map(recentMessages.map(m => [m.sender_id, m])).values()];
          setVisitors(uniqueSenders);
        }
        setLoading(false);
        return;
      }

      setVisitors(views);
      setLoading(false);
    }
    load();
  }, [session]);

  // Enrich visitors with profile data
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    if (visitors.length === 0) return;
    const viewerIds = visitors.map(v => v.viewer_id || v.sender_id).filter(Boolean);
    if (viewerIds.length === 0) return;

    supabase
      .from('profiles')
      .select('id, name, job_title, avatar_url')
      .in('id', viewerIds)
      .limit(5)
      .then(({ data }) => {
        if (data) {
          setProfiles(data.map(p => ({
            ...p,
            viewedAt: visitors.find(v => v.viewer_id === p.id || v.sender_id === p.id)?.created_at,
          })));
        }
      });
  }, [visitors]);

  if (loading || profiles.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/80 overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye size={14} className="text-cyan-400" />
          <h3 className="text-sm font-bold text-white">{t('rv.title')}</h3>
        </div>
      </div>
      <div className="p-2 space-y-1">
        {profiles.slice(0, 4).map((v, i) => {
          const initial = (v.name || 'U')[0].toUpperCase();
          const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
          return (
            <Link
              key={v.id}
              to={`/profile/${v.id}`}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-white/[0.04] transition-all group"
            >
              {v.avatar_url ? (
                <img src={v.avatar_url} alt={v.name} className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
                  {initial}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white font-medium truncate">{v.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{v.job_title || 'User'}</p>
              </div>
              <span className="text-[9px] text-slate-600 flex-shrink-0">{getTimeAgo(v.viewedAt, t)}</span>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}
