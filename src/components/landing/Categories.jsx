import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Code2, Smartphone, Palette, Brain, Cpu, Lightbulb, GitBranch, Trophy, ArrowRight } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';

const ICON_MAP = {
  Code2, Smartphone, Palette, Brain, Cpu, Lightbulb, GitBranch, Trophy,
};

const SIZE_FILTER = [
  { label: 'All', value: 'all' },
  { label: 'Banyak Project', value: 'many', min: 5 },
  { label: 'Sedang', value: 'mid', min: 2, max: 4 },
  { label: 'Baru Mulai', value: 'few', max: 1 },
];

function SkeletonCard() {
  return (
    <div className="p-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] animate-pulse">
      <div className="w-11 h-11 rounded-xl bg-white/[0.06] mb-3" />
      <div className="h-4 w-3/4 rounded bg-white/[0.06] mb-2" />
      <div className="h-3 w-1/3 rounded bg-white/[0.04]" />
    </div>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const { data: cats, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error || !cats) { setLoading(false); return; }

      const { data: projects } = await supabase
        .from('projects')
        .select('skills_needed');

      const allSkills = (projects || []).flatMap(p => p.skills_needed || []);

      const enriched = cats.map(cat => {
        const keywords = cat.skill_keywords || [];
        const count = allSkills.filter(skill =>
          keywords.some(kw => skill.toLowerCase().includes(kw.toLowerCase()))
        ).length;
        return { ...cat, count };
      });

      setCategories(enriched);
      setLoading(false);
    }

    fetchData();
  }, []);

  const filtered = categories.filter(cat => {
    if (activeFilter === 'all') return true;
    const f = SIZE_FILTER.find(f => f.value === activeFilter);
    if (!f) return true;
    if (f.min !== undefined && f.max !== undefined) return cat.count >= f.min && cat.count <= f.max;
    if (f.min !== undefined) return cat.count >= f.min;
    if (f.max !== undefined) return cat.count <= f.max;
    return true;
  });

  return (
    <section id="categories" className="categories-section py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Explore{' '}
            <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Categories
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Find your niche or go broad — there's a project for every skill set.
          </p>
        </motion.div>

        {/* Filter tabs */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-2 mb-10"
          >
            {SIZE_FILTER.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                  activeFilter === f.value
                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                    : 'bg-white/[0.03] border-white/[0.08] text-slate-500 hover:text-slate-300 hover:border-white/[0.16]'
                }`}
              >
                {f.label}
                {f.value !== 'all' && (
                  <span className="ml-1.5 text-xs opacity-60">
                    ({categories.filter(c => {
                      if (f.min !== undefined && f.max !== undefined) return c.count >= f.min && c.count <= f.max;
                      if (f.min !== undefined) return c.count >= f.min;
                      if (f.max !== undefined) return c.count <= f.max;
                      return true;
                    }).length})
                  </span>
                )}
              </button>
            ))}
          </motion.div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : (
              <AnimatePresence mode="popLayout">
                {filtered.map((cat, i) => {
                  const Icon = ICON_MAP[cat.icon] || Code2;
                  return (
                    <motion.div
                      key={cat.id}
                      layout
                      initial={{ opacity: 0, scale: 0.88 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.88 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                      whileHover={{ y: -6, scale: 1.03 }}
                      onClick={() => navigate(`/explore?category=${cat.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`)}
                      className="group relative p-5 rounded-2xl border border-white/[0.07] hover:border-white/[0.15] transition-all duration-300 cursor-pointer overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${cat.color}14, ${cat.color}06)` }}
                    >
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
                        style={{ background: `radial-gradient(circle at 50% 0%, ${cat.color}20, transparent 70%)` }}
                      />

                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 duration-300"
                        style={{ background: `${cat.color}18`, border: `1px solid ${cat.color}33` }}
                      >
                        <Icon size={20} style={{ color: cat.color }} />
                      </div>

                      <div className="font-semibold text-white text-sm mb-1 leading-snug">
                        {cat.label}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                          {cat.count > 0 ? `${cat.count} project${cat.count !== 1 ? 's' : ''}` : 'Be the first'}
                        </div>
                        <ArrowRight
                          size={13}
                          className="text-slate-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200"
                          style={{ color: cat.color }}
                        />
                      </div>

                      {/* Count badge on hover */}
                      {cat.count > 0 && (
                        <div
                          className="absolute top-3 right-3 px-1.5 py-0.5 rounded-md text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          style={{ background: `${cat.color}22`, color: cat.color }}
                        >
                          {cat.count}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
                {filtered.length === 0 && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-4 py-10 text-center text-slate-600 text-sm"
                  >
                    Belum ada kategori di filter ini.
                  </motion.div>
                )}
              </AnimatePresence>
            )
          }
        </div>
      </div>
    </section>
  );
}
