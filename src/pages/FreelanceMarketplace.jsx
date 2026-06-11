import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Users, Plus, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import PageNavbar from '../components/PageNavbar';
import Footer from '../components/landing/Footer';
import JobCard from '../components/freelance/JobCard';
import FreelancerCard from '../components/freelance/FreelancerCard';
import FreelanceFilters from '../components/freelance/FreelanceFilters';

function JobSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 overflow-hidden animate-pulse">
      <div className="h-1 bg-white/10" />
      <div className="p-5 flex flex-col gap-3">
        <div className="flex justify-between"><div className="h-4 w-16 rounded-full bg-white/[0.06]" /><div className="h-4 w-12 rounded bg-white/[0.06]" /></div>
        <div className="h-4 w-3/4 rounded bg-white/[0.06]" />
        <div className="h-3 w-full rounded bg-white/[0.04]" />
        <div className="h-3 w-4/5 rounded bg-white/[0.04]" />
        <div className="flex gap-2"><div className="h-5 w-14 rounded bg-white/[0.05]" /><div className="h-5 w-16 rounded bg-white/[0.05]" /></div>
        <div className="h-8 rounded-xl bg-white/[0.05] mt-1" />
      </div>
    </div>
  );
}

export default function FreelanceMarketplace() {
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);
  const [filters, setFilters] = useState({
    search: '', category: 'all', experience: 'all', budgetType: 'all', sort: 'newest',
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: l } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => l.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [jobsRes, freelancersRes] = await Promise.all([
        supabase.from('freelance_jobs').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('profiles').select('id, name, bio, skills, job_title, avatar_url, is_freelancer, hourly_rate, availability, completed_jobs, total_earned, created_at').eq('is_freelancer', true).limit(48),
      ]);
      setJobs(jobsRes.data || []);
      setFreelancers(freelancersRes.data || []);
      setLoading(false);
    }
    load();
  }, []);

  const filteredJobs = useMemo(() => {
    let result = jobs.filter(j => j.status === 'open');
    const q = filters.search.toLowerCase().trim();
    if (q) {
      result = result.filter(j =>
        j.title?.toLowerCase().includes(q) ||
        j.description?.toLowerCase().includes(q) ||
        (j.skills || []).some(s => s.toLowerCase().includes(q))
      );
    }
    if (filters.category !== 'all') result = result.filter(j => j.category === filters.category);
    if (filters.experience !== 'all') result = result.filter(j => j.experience_level === filters.experience);
    if (filters.budgetType !== 'all') result = result.filter(j => j.budget_type === filters.budgetType);

    if (filters.sort === 'budget_high') result.sort((a, b) => (b.budget_max || b.budget_min || 0) - (a.budget_max || a.budget_min || 0));
    else if (filters.sort === 'budget_low') result.sort((a, b) => (a.budget_min || 0) - (b.budget_min || 0));
    return result;
  }, [jobs, filters]);

  const filteredFreelancers = useMemo(() => {
    const q = filters.search.toLowerCase().trim();
    if (!q) return freelancers;
    return freelancers.filter(f =>
      f.name?.toLowerCase().includes(q) ||
      f.job_title?.toLowerCase().includes(q) ||
      (f.skills || []).some(s => s.toLowerCase().includes(q))
    );
  }, [freelancers, filters.search]);

  const items = tab === 'jobs' ? filteredJobs : filteredFreelancers;
  const displayed = items.slice(0, visibleCount);
  const hasMore = items.length > visibleCount;

  return (
    <div className="min-h-screen bg-[#050816] font-['Manrope',sans-serif]">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[500px] h-[400px] bg-blue-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-0 w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-[100px]" />
      </div>

      <PageNavbar breadcrumbs={[{ label: 'Freelance Marketplace', href: null }]} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-semibold mb-4">
            <Sparkles size={12} /> Freelance Marketplace
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                Find <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Talent</span> or Get <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Hired</span>
              </h1>
              <p className="text-slate-400 mt-3 max-w-2xl">
                Marketplace terintegrasi yang menghubungkan freelancer berbakat dengan proyek menarik. Dari hiring sampai delivery.
              </p>
            </div>
            <div className="flex gap-2">
              {session ? (
                <>
                  <Link to="/freelance/post" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition-all">
                    <Plus size={14} /> Post a Job
                  </Link>
                  <Link to="/freelance/dashboard" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] transition-all">
                    Dashboard <ArrowRight size={14} />
                  </Link>
                </>
              ) : (
                <Link to="/login" state={{ from: '/freelance' }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600">
                  Login untuk mulai <ArrowRight size={14} />
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <FreelanceFilters filters={filters} onFilterChange={(f) => { setFilters(f); setVisibleCount(12); }} />
        </motion.div>

        <div className="flex items-center gap-1 mb-6 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit">
          {[
            { key: 'jobs', label: 'Browse Jobs', icon: Briefcase },
            { key: 'freelancers', label: 'Browse Freelancers', icon: Users },
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setVisibleCount(12); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  tab === t.key
                    ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20'
                    : 'text-slate-500 hover:text-white border border-transparent'
                }`}
              >
                <Icon size={13} /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-slate-500">
            {loading ? (
              <span className="inline-block w-24 h-4 rounded bg-white/[0.06] animate-pulse" />
            ) : (
              <><span className="text-white font-semibold">{items.length}</span> {tab === 'jobs' ? 'jobs' : 'freelancers'} found</>
            )}
          </p>
        </div>

        <div className={`grid gap-4 ${tab === 'jobs' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <JobSkeleton key={i} />)
          ) : items.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-center py-24">
              <div className="flex justify-center mb-4">
                {tab === 'jobs' ? <Briefcase size={48} className="text-slate-500/50" /> : <Users size={48} className="text-slate-500/50" />}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {tab === 'jobs' ? 'No jobs found' : 'No freelancers found'}
              </h3>
              <p className="text-slate-500 text-sm mb-6">
                {tab === 'jobs' ? 'Try adjusting your filters or check back later.' : 'Be the first to become a freelancer!'}
              </p>
              {session && tab === 'jobs' && (
                <Link to="/freelance/post" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600">
                  <Plus size={14} /> Post the First Job
                </Link>
              )}
            </motion.div>
          ) : tab === 'jobs' ? (
            <AnimatePresence mode="popLayout">
              {displayed.map((job, i) => <JobCard key={job.id} job={job} index={i} />)}
            </AnimatePresence>
          ) : (
            displayed.map((profile, i) => <FreelancerCard key={profile.id} profile={profile} index={i} />)
          )}
        </div>

        {hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setVisibleCount(prev => prev + 12)}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.1] transition-all"
            >
              Load More ({items.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
