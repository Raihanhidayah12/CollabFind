import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';

const STATUS_STYLE = {
  'open':      'text-green-400 bg-green-400/10 border-green-400/20',
  'ongoing':   'text-blue-400 bg-blue-400/10 border-blue-400/20',
  'completed': 'text-slate-400 bg-slate-400/10 border-slate-400/20',
};

const STATUS_LABEL = {
  'open':      'Recruiting',
  'ongoing':   'In Progress',
  'completed': 'Completed',
};

function ProjectSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/60 overflow-hidden animate-pulse">
      <div className="h-1 w-full bg-white/10" />
      <div className="h-36 bg-white/[0.04]" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-4 w-24 rounded-full bg-white/[0.06]" />
        <div className="h-5 w-3/4 rounded bg-white/[0.06]" />
        <div className="h-3 w-full rounded bg-white/[0.04]" />
        <div className="h-3 w-5/6 rounded bg-white/[0.04]" />
        <div className="flex gap-2 mt-1">
          {[1,2,3].map(i => <div key={i} className="h-5 w-16 rounded-md bg-white/[0.05]" />)}
        </div>
        <div className="h-9 w-full rounded-xl bg-white/[0.05] mt-2" />
      </div>
    </div>
  );
}

export default function FeaturedProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (!error && data) setProjects(data);
      setLoading(false);
    }
    fetch();
  }, []);

  return (
    <section id="projects" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-medium mb-4">
            <Zap size={12} /> Popular This Week
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Featured <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Projects</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Join high-impact projects and build things that matter with talented teams.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <ProjectSkeleton key={i} />)
            : projects.map((p, i) => {
                const accent = p.accent_color || '#3B82F6';
                const statusStyle = STATUS_STYLE[p.status] || STATUS_STYLE['open'];

                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    whileHover={{ y: -4 }}
                    className="group relative flex flex-col rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/60 backdrop-blur-sm overflow-hidden hover:border-white/[0.14] transition-all duration-300"
                  >
                    {/* Top accent bar */}
                    <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${accent}99, ${accent}33)` }} />

                    {/* Image / hero area */}
                    <div className="h-36 flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${accent}18, ${accent}08)` }}>
                      <div className="w-14 h-14 rounded-2xl border border-white/10 bg-white/[0.05] flex items-center justify-center"
                        style={{ boxShadow: `0 0 24px ${accent}44` }}>
                        <Zap size={24} style={{ color: accent }} />
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusStyle}`}>
                          {p.status}
                        </span>
                        <div className="flex items-center gap-1 text-slate-500 text-xs">
                          <Users size={12} />
                          <span>{p.current_members ?? 0} members · {p.open_slots ?? 0} slots</span>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                        {p.title}
                      </h3>
                      <p className="text-sm text-slate-500 mb-4 flex-1 leading-relaxed">{p.description}</p>

                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {(p.skills_needed || []).map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.07] text-xs text-slate-400">
                            {s}
                          </span>
                        ))}
                      </div>

                      <Link
                        to={`/project/${p.id}`}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.09] hover:border-white/[0.15] group/btn transition-all duration-200"
                      >
                        Join Project
                        <ArrowRight size={15} className="group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })
          }
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-12">
          <Link to="/explore" className="inline-block px-8 py-3 rounded-xl text-sm font-semibold text-slate-300 border border-white/10 hover:border-white/20 hover:text-white hover:bg-white/[0.04] transition-all duration-200">
            View All Projects →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
