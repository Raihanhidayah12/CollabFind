import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Briefcase, DollarSign, FileText, Send,
  Loader2, Clock, CheckCircle, ArrowRight, Plus, Users,
  TrendingUp, Star,
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import PageNavbar from '../components/PageNavbar';
import ProposalCard from '../components/freelance/ProposalCard';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] },
});

function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div {...fadeUp(delay)}
      className="flex items-center gap-4 p-5 rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}33` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <div className="text-2xl font-extrabold text-white" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>{value}</div>
        <div className="text-xs text-slate-500 mt-0.5">{label}</div>
      </div>
    </motion.div>
  );
}

export default function FreelanceDashboard() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const [myJobs, setMyJobs] = useState([]);
  const [myProposals, setMyProposals] = useState([]);
  const [myContracts, setMyContracts] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { navigate('/login', { state: { from: '/freelance/dashboard' } }); return; }
      setSession(data.session);
    });
    const { data: l } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => l.subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!session) return;
    async function load() {
      setLoading(true);

      const { data: prof } = await supabase
        .from('profiles')
        .select('is_freelancer, hourly_rate, completed_jobs, total_earned')
        .eq('id', session.user.id)
        .single();
      setProfile(prof);

      const [jobsRes, proposalsRes, contractsRes, openJobsRes] = await Promise.all([
        supabase.from('freelance_jobs').select('*').eq('client_id', session.user.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('freelance_proposals').select('*').eq('freelancer_id', session.user.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('freelance_contracts').select('*, job:freelance_jobs(title)').eq('freelancer_id', session.user.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('freelance_jobs').select('*').eq('status', 'open').order('created_at', { ascending: false }).limit(6),
      ]);

      setMyJobs(jobsRes.data || []);
      setMyProposals(proposalsRes.data || []);
      setMyContracts(contractsRes.data || []);
      setRecommendedJobs(openJobsRes.data || []);
      setLoading(false);
    }
    load();
  }, [session]);

  const isFreelancer = profile?.is_freelancer;
  const activeContracts = myContracts.filter(c => c.status === 'active');
  const totalProposalsReceived = myJobs.reduce((sum, j) => sum + (j._proposalCount || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <Loader2 size={24} className="text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] font-['Manrope',sans-serif]">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[500px] h-[400px] bg-blue-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-0 w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-[100px]" />
      </div>

      <PageNavbar breadcrumbs={[{ label: 'Freelance', href: '/freelance' }, { label: 'Dashboard' }]} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                Freelance <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Dashboard</span>
              </h1>
              <p className="text-slate-400 text-sm mt-1">Manage your freelance activity</p>
            </div>
            <div className="flex gap-2">
              <Link to="/freelance" className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] transition-all">
                Marketplace <ArrowRight size={13} />
              </Link>
              <Link to="/freelance/post" className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition-all">
                <Plus size={13} /> Post Job
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <StatCard icon={Briefcase} label="Active Contracts" value={activeContracts.length} color="#3B82F6" delay={0} />
            <StatCard icon={FileText} label="Proposals Sent" value={myProposals.length} color="#8B5CF6" delay={0.05} />
            <StatCard icon={DollarSign} label="Total Earned" value={`$${(profile?.total_earned || 0).toLocaleString()}`} color="#10B981" delay={0.1} />
            <StatCard icon={CheckCircle} label="Jobs Completed" value={profile?.completed_jobs || 0} color="#F59E0B" delay={0.15} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                  My Jobs
                </h2>
                <Link to="/freelance" className="text-xs text-blue-400 hover:underline">View all</Link>
              </div>
              {myJobs.length === 0 ? (
                <div className="rounded-xl border border-white/[0.07] bg-[#0a0f1e]/70 p-6 text-center">
                  <p className="text-sm text-slate-500 mb-3">No jobs posted yet</p>
                  <Link to="/freelance/post" className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline">
                    <Plus size={12} /> Post your first job
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {myJobs.slice(0, 5).map(j => (
                    <Link key={j.id} to={`/freelance/job/${j.id}`}
                      className="flex items-center justify-between p-3 rounded-xl border border-white/[0.07] bg-[#0a0f1e]/70 hover:border-white/[0.12] transition-all">
                      <div>
                        <p className="text-sm font-semibold text-white">{j.title}</p>
                        <p className="text-xs text-slate-500">{j.status}</p>
                      </div>
                      <ArrowRight size={14} className="text-slate-600" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                  Active Contracts
                </h2>
                <Link to="/freelance/proposals" className="text-xs text-blue-400 hover:underline">My proposals</Link>
              </div>
              {activeContracts.length === 0 ? (
                <div className="rounded-xl border border-white/[0.07] bg-[#0a0f1e]/70 p-6 text-center">
                  <p className="text-sm text-slate-500">No active contracts</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeContracts.map(c => (
                    <Link key={c.id} to={`/freelance/contracts/${c.id}`}
                      className="flex items-center justify-between p-3 rounded-xl border border-white/[0.07] bg-[#0a0f1e]/70 hover:border-white/[0.12] transition-all">
                      <div>
                        <p className="text-sm font-semibold text-white">{c.job?.title || 'Contract'}</p>
                        <p className="text-xs text-slate-500">${c.agreed_rate?.toLocaleString()} · {c.budget_type}</p>
                      </div>
                      <ArrowRight size={14} className="text-slate-600" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                Recent Proposals
              </h2>
              <Link to="/freelance/proposals" className="text-xs text-blue-400 hover:underline">View all</Link>
            </div>
            {myProposals.length === 0 ? (
              <div className="rounded-xl border border-white/[0.07] bg-[#0a0f1e]/70 p-6 text-center">
                <p className="text-sm text-slate-500 mb-3">No proposals yet</p>
                <Link to="/freelance" className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline">
                  Browse jobs <ArrowRight size={12} />
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {myProposals.slice(0, 3).map(p => (
                  <ProposalCard key={p.id} proposal={p} showJobLink />
                ))}
              </div>
            )}
          </div>

          {recommendedJobs.length > 0 && (
            <div className="mt-8">
              <h2 className="text-base font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                Recommended Jobs
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {recommendedJobs.map(j => (
                  <Link key={j.id} to={`/freelance/job/${j.id}`}
                    className="p-4 rounded-xl border border-white/[0.07] bg-[#0a0f1e]/70 hover:border-white/[0.12] transition-all">
                    <p className="text-sm font-semibold text-white mb-1 line-clamp-1">{j.title}</p>
                    <p className="text-xs text-slate-500 mb-2 line-clamp-2">{j.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {(j.skills || []).slice(0, 2).map(sk => (
                        <span key={sk} className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.07] text-[10px] text-slate-400">{sk}</span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
