import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, ArrowRight, Zap, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { useLanguage } from '../../i18n/LanguageContext';

const STATUS_STYLE = {
  open:      { labelKey: 'fp.recruiting',   cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
  ongoing:   { labelKey: 'fp.inProgress',   cls: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  completed: { labelKey: 'fp.completed',    cls: 'text-slate-400 bg-slate-400/10 border-slate-400/20' },
};

function timeAgo(dateStr, t) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return t('fp.today');
  if (days < 7) return `${days}${t('fp.daysAgo')}`;
  if (days < 30) return `${Math.floor(days / 7)}${t('fp.weeksAgo')}`;
  return `${Math.floor(days / 30)}${t('fp.monthsAgo')}`;
}

function ProjectSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 overflow-hidden animate-pulse">
      <div className="h-1 bg-white/10" />
      <div className="h-32 bg-white/[0.03]" />
      <div className="p-5 flex flex-col gap-3">
        <div className="flex justify-between">
          <div className="h-4 w-20 rounded-full bg-white/[0.06]" />
          <div className="h-4 w-16 rounded bg-white/[0.06]" />
        </div>
        <div className="h-4 w-3/4 rounded bg-white/[0.06]" />
        <div className="h-3 w-full rounded bg-white/[0.04]" />
        <div className="h-3 w-4/5 rounded bg-white/[0.04]" />
        <div className="flex gap-2">
          <div className="h-5 w-14 rounded bg-white/[0.05]" />
          <div className="h-5 w-16 rounded bg-white/[0.05]" />
          <div className="h-5 w-12 rounded bg-white/[0.05]" />
        </div>
        <div className="h-8 rounded-xl bg-white/[0.05] mt-1" />
      </div>
    </div>
  );
}

export default function FeaturedProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [session, setSession]   = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: l } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => l.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchProjects() {
      let { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error || !data || data.length === 0) {
        const fallback = await supabase
          .from('projects')
          .select('*')
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(6);
        data = fallback.data || [];
      }

      setProjects(data);
      setLoading(false);
    }
    fetchProjects();
  }, []);

  return (
    <section id="projects" className="featured-projects py-24 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-[400px] h-[350px] bg-purple-600/6 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-medium mb-4">
            <Zap size={12} /> {t('fp.badge')}
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight"
            style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
            {t('fp.title')} <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{t('fp.titleHighlight')}</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            {t('fp.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <ProjectSkeleton key={i} />)
            : projects.map((p, i) => {
                const accent = p.accent_color || '#3B82F6';
                const s = STATUS_STYLE[p.status] || STATUS_STYLE.open;

                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    whileHover={{ y: -4 }}
                    className="group flex flex-col rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 backdrop-blur-sm overflow-hidden hover:border-white/[0.14] transition-all duration-300"
                  >
                    <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${accent}99, ${accent}22)` }} />
                    <div className="h-32 flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${accent}15, ${accent}06)` }}>
                      <div className="w-12 h-12 rounded-2xl border border-white/10 bg-white/[0.05] flex items-center justify-center"
                        style={{ boxShadow: `0 0 20px ${accent}44` }}>
                        <Zap size={20} style={{ color: accent }} />
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.cls}`}>
                          {t(s.labelKey)}
                        </span>
                        <div className="flex items-center gap-1 text-slate-500 text-xs">
                          <Users size={12} />
                          <span>{p.current_members ?? 1} · {p.open_slots ?? 0} {t('fp.slots')}</span>
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-white mb-2 group-hover:text-blue-300 transition-colors line-clamp-1">
                        {p.title}
                      </h3>
                      <p className="text-xs text-slate-500 mb-4 flex-1 leading-relaxed line-clamp-2">
                        {p.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {(p.skills_needed || []).slice(0, 3).map(sk => (
                          <span key={sk} className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.07] text-xs text-slate-400">{sk}</span>
                        ))}
                        {(p.skills_needed || []).length > 3 && (
                          <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.07] text-xs text-slate-500">
                            +{p.skills_needed.length - 3}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-600 mb-3">
                        <Clock size={10} /> {timeAgo(p.created_at, t)}
                      </div>

                      <Link
                        to={`/project/${p.id}`}
                        state={{ from: '/explore' }}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-white border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.09] hover:border-white/[0.15] group/btn transition-all"
                      >
                        {session ? t('fp.joinProject') : t('fp.viewProject')}
                        <ArrowRight size={13} className="group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })
          }
        </div>

        {projects.length === 0 && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Zap size={48} className="text-slate-600/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">{t('fp.noProjects')}</h3>
            <p className="text-slate-500 text-sm mb-6">{t('fp.noProjectsDesc')}</p>
            <Link to="/create-project" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600">
              {t('fp.createProject')} <ArrowRight size={14} />
            </Link>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-12">
          <Link to="/explore" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold text-slate-300 border border-white/10 hover:border-white/20 hover:text-white hover:bg-white/[0.04] transition-all duration-200">
            {t('fp.viewAll')} <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
