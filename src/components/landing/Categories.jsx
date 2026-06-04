import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Code2, Smartphone, Palette, Brain, Cpu, Lightbulb, GitBranch, Trophy } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';

// Map icon string dari DB ke komponen lucide
const ICON_MAP = {
  Code2, Smartphone, Palette, Brain, Cpu, Lightbulb, GitBranch, Trophy,
};

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
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      // Fetch categories
      const { data: cats, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error || !cats) { setLoading(false); return; }

      // Fetch all projects skills_needed untuk hitung count per kategori
      const { data: projects } = await supabase
        .from('projects')
        .select('skills_needed');

      // Hitung berapa project match tiap kategori
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

  return (
    <section id="categories" className="categories-section py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : categories.map((cat, i) => {
                const Icon = ICON_MAP[cat.icon] || Code2;
                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    whileHover={{ y: -6, scale: 1.03 }}
                    onClick={() => navigate(`/explore?category=${cat.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`)}
                    className="group relative p-5 rounded-2xl border border-white/[0.07] hover:border-white/[0.15] transition-all duration-300 cursor-pointer overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${cat.color}14, ${cat.color}06)` }}
                  >
                    {/* Hover glow */}
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
                    <div className="text-xs text-slate-500">
                      {cat.count > 0 ? `${cat.count} project${cat.count !== 1 ? 's' : ''}` : 'Be the first'}
                    </div>
                  </motion.div>
                );
              })
          }
        </div>
      </div>
    </section>
  );
}
