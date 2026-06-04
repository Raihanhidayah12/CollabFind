import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, X, Users, ArrowRight, Zap,
  Code2, Smartphone, Palette, Brain, Cpu, Lightbulb, GitBranch, Trophy,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import PageNavbar from '../components/PageNavbar';

const ICON_MAP = { Code2, Smartphone, Palette, Brain, Cpu, Lightbulb, GitBranch, Trophy };

const STATUS_STYLE = {
  open:      { label: 'Recruiting',  cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
  ongoing:   { label: 'In Progress', cls: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  completed: { label: 'Completed',   cls: 'text-slate-400 bg-slate-400/10 border-slate-400/20' },
};

/* ── Custom Select ─────────────────────────────────────── */
function CustomSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find(o => o.value === value) || options[0];

  return (
    <div ref={ref} className="relative min-w-[148px]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 text-sm hover:border-white/[0.16] hover:bg-white/[0.07] transition-all"
      >
        <span>{selected.label}</span>
        {open ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-1.5 left-0 right-0 z-50 rounded-xl border border-white/[0.1] bg-[#0d1224]/95 backdrop-blur-xl shadow-[0_16px_48px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  opt.value === value
                    ? 'text-blue-300 bg-blue-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Project Card ──────────────────────────────────────── */
function ProjectCard({ p, i, session }) {
  const accent = p.accent_color || '#3B82F6';
  const s = STATUS_STYLE[p.status] || STATUS_STYLE.open;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3, delay: i * 0.04 }}
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
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.cls}`}>{s.label}</span>
          <div className="flex items-center gap-1 text-slate-500 text-xs">
            <Users size={12} />
            <span>{p.current_members ?? 1} · {p.open_slots ?? 0} slots</span>
          </div>
        </div>

        <h3 className="text-sm font-bold text-white mb-2 group-hover:text-blue-300 transition-colors line-clamp-1">
          {p.title}
        </h3>
        <p className="text-xs text-slate-500 mb-4 flex-1 leading-relaxed line-clamp-2">{p.description}</p>

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

        <Link
          to={`/project/${p.id}`}
          state={{ from: '/explore' }}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-white border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.09] hover:border-white/[0.15] group/btn transition-all"
        >
          {session ? 'Join Project' : 'View Project'} <ArrowRight size={13} className="group-hover/btn:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}

function ProjectSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 overflow-hidden animate-pulse">
      <div className="h-1 bg-white/10" />
      <div className="h-32 bg-white/[0.03]" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-4 w-20 rounded-full bg-white/[0.06]" />
        <div className="h-4 w-3/4 rounded bg-white/[0.06]" />
        <div className="h-3 w-full rounded bg-white/[0.04]" />
        <div className="h-3 w-4/5 rounded bg-white/[0.04]" />
        <div className="flex gap-2"><div className="h-5 w-14 rounded bg-white/[0.05]" /><div className="h-5 w-16 rounded bg-white/[0.05]" /></div>
        <div className="h-8 rounded-xl bg-white/[0.05] mt-1" />
      </div>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────── */
export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects]         = useState([]);
  const [categories, setCategories]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showFilter, setShowFilter]     = useState(false);
  const [session, setSession]           = useState(null);

  const search   = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'all';
  const status   = searchParams.get('status') || 'all';
  const sort     = searchParams.get('sort') || 'newest';

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: l } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => l.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchProjects() {
      setLoading(true);
      let query = supabase.from('projects').select('*');
      if (status !== 'all') query = query.eq('status', status);
      if (sort === 'newest') query = query.order('created_at', { ascending: false });
      else if (sort === 'oldest') query = query.order('created_at', { ascending: true });
      else if (sort === 'slots') query = query.order('open_slots', { ascending: false });

      const { data } = await query;
      let filtered = data || [];

      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(p =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          (p.skills_needed || []).some(s => s.toLowerCase().includes(q))
        );
      }

      if (category !== 'all') {
        const cat = categories.find(c =>
          c.label.toLowerCase().replace(/[^a-z0-9]/g, '-') === category
        );
        if (cat?.skill_keywords?.length) {
          filtered = filtered.filter(p =>
            (p.skills_needed || []).some(skill =>
              cat.skill_keywords.some(kw => skill.toLowerCase().includes(kw.toLowerCase()))
            )
          );
        }
      }

      if (!cancelled) {
        setProjects(filtered);
        setLoading(false);
      }
    }

    fetchProjects();
    return () => { cancelled = true; };
  }, [search, category, status, sort, categories]);

  const setParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (!val || val === 'all') next.delete(key);
    else next.set(key, val);
    setSearchParams(next);
  };

  const clearAll = () => setSearchParams({});
  const hasFilters = search || category !== 'all' || status !== 'all' || sort !== 'newest';

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'open', label: 'Recruiting' },
    { value: 'ongoing', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'slots', label: 'Most Slots' },
  ];

  return (
    <div className="min-h-screen bg-[#050816] font-['Manrope',sans-serif]">
      {/* Bg glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[500px] h-[400px] bg-blue-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-0 w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.018]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* Navbar */}
      <PageNavbar breadcrumbs={[{ label: 'Explore', href: null }]} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Explore <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Projects</span>
          </h1>
          <p className="text-slate-400 text-sm">Find your next collaboration and build something amazing.</p>
        </motion.div>

        {/* Search + controls */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 mb-5"
        >
          <div className="relative flex-1">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search projects, skills, keywords..."
              value={search}
              onChange={e => setParam('q', e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-600 text-sm outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all"
            />
            {search && (
              <button onClick={() => setParam('q', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1">
                <X size={13} />
              </button>
            )}
          </div>

          <CustomSelect value={status} onChange={v => setParam('status', v)} options={statusOptions} />
          <CustomSelect value={sort}   onChange={v => setParam('sort', v)}   options={sortOptions} />

          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all whitespace-nowrap ${
              showFilter || category !== 'all'
                ? 'border-blue-500/50 bg-blue-500/10 text-blue-300'
                : 'border-white/[0.08] bg-white/[0.04] text-slate-400 hover:text-white hover:border-white/[0.15]'
            }`}
          >
            <SlidersHorizontal size={14} />
            Categories
            {category !== 'all' && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
          </button>
        </motion.div>

        {/* Category filter panel */}
        <AnimatePresence>
          {showFilter && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-5"
            >
              <div className="flex flex-wrap gap-2 py-2">
                <button
                  onClick={() => setParam('category', 'all')}
                  className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                    category === 'all'
                      ? 'border-blue-500/50 bg-blue-500/15 text-blue-300'
                      : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-white hover:border-white/[0.15]'
                  }`}
                >
                  All Categories
                </button>
                {categories.map(cat => {
                  const Icon = ICON_MAP[cat.icon] || Code2;
                  const slug = cat.label.toLowerCase().replace(/[^a-z0-9]/g, '-');
                  const active = category === slug;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setParam('category', slug)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                        active
                          ? 'text-white'
                          : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-white hover:border-white/[0.15]'
                      }`}
                      style={active ? { borderColor: `${cat.color}55`, background: `${cat.color}18`, color: cat.color } : {}}
                    >
                      <Icon size={11} /> {cat.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result count + clear */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-slate-500">
            {loading ? (
              <span className="inline-block w-24 h-4 rounded bg-white/[0.06] animate-pulse" />
            ) : (
              <><span className="text-white font-semibold">{projects.length}</span> projects found</>
            )}
          </p>
          {hasFilters && (
            <button onClick={clearAll} className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 transition-colors">
              <X size={12} /> Clear all
            </button>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProjectSkeleton key={i} />)
            : projects.length === 0
            ? (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="col-span-full text-center py-24"
              >
                <div className="flex justify-center mb-4"><Search size={48} className="text-slate-500/50" /></div>
                <h3 className="text-lg font-semibold text-white mb-2">No projects found</h3>
                <p className="text-slate-500 text-sm mb-6">Try adjusting your filters or search terms.</p>
                <button onClick={clearAll} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600">
                  Clear Filters
                </button>
              </motion.div>
            )
            : (
              <AnimatePresence mode="popLayout">
                {projects.map((p, i) => <ProjectCard key={p.id} p={p} i={i} session={session} />)}
              </AnimatePresence>
            )
          }
        </div>
      </div>
    </div>
  );
}
