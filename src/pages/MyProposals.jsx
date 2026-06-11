import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Loader2, Send } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import PageNavbar from '../components/PageNavbar';
import ProposalCard from '../components/freelance/ProposalCard';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'rejected', label: 'Rejected' },
];

export default function MyProposals() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [jobs, setJobs] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { navigate('/login', { state: { from: '/freelance/proposals' } }); return; }
      setSession(data.session);
    });
    const { data: l } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => l.subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!session) return;
    async function load() {
      setLoading(true);
      const { data: proposalData } = await supabase
        .from('freelance_proposals')
        .select('*')
        .eq('freelancer_id', session.user.id)
        .order('created_at', { ascending: false });

      setProposals(proposalData || []);

      if (proposalData?.length) {
        const jobIds = [...new Set(proposalData.map(p => p.job_id))];
        const { data: jobData } = await supabase.from('freelance_jobs').select('*').in('id', jobIds);
        const map = {};
        (jobData || []).forEach(j => { map[j.id] = j; });
        setJobs(map);
      }
      setLoading(false);
    }
    load();
  }, [session]);

  const filtered = useMemo(() => {
    if (tab === 'all') return proposals;
    return proposals.filter(p => p.status === tab);
  }, [proposals, tab]);

  return (
    <div className="min-h-screen bg-[#050816] font-['Manrope',sans-serif]">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[500px] h-[400px] bg-blue-600/8 rounded-full blur-[120px]" />
      </div>

      <PageNavbar breadcrumbs={[{ label: 'Freelance', href: '/freelance' }, { label: 'My Proposals' }]} />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => navigate('/freelance')} className="flex items-center gap-1 text-xs text-slate-500 hover:text-white mb-4 transition-colors">
            <ArrowLeft size={13} /> Back to Marketplace
          </button>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
            My <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Proposals</span>
          </h1>
          <p className="text-slate-400 text-sm mb-6">Track all your freelance proposals.</p>

          <div className="flex items-center gap-1 mb-6 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  tab === t.key
                    ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20'
                    : 'text-slate-500 hover:text-white border border-transparent'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={24} className="text-blue-500 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="flex justify-center mb-4">
                <FileText size={48} className="text-slate-500/50" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No proposals yet</h3>
              <p className="text-slate-500 text-sm mb-6">Browse jobs and submit your first proposal.</p>
              <Link to="/freelance" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600">
                <Send size={14} /> Browse Jobs
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((p, i) => (
                <ProposalCard key={p.id} proposal={p} job={jobs[p.job_id]} showJobLink index={i} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
