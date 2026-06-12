import { useLanguage } from '../i18n/LanguageContext';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Loader2, DollarSign, Clock, CheckCircle,
  ExternalLink, MessageSquare, Briefcase, User,
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import PageNavbar from '../components/PageNavbar';
import MilestoneTracker from '../components/freelance/MilestoneTracker';

const STATUS_STYLE = {
  active:    { label: 'Active',    cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
  completed: { label: 'Completed', cls: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  disputed:  { label: 'Disputed',  cls: 'text-red-400 bg-red-400/10 border-red-400/20' },
  cancelled: { label: 'Cancelled', cls: 'text-slate-400 bg-slate-400/10 border-slate-400/20' },
};

export default function ContractDetail() { 
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [job, setJob] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [freelancerProfile, setFreelancerProfile] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { navigate('/login'); return; }
      setSession(data.session);
    });
    const { data: l } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => l.subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!session) return;
    async function load() {
      setLoading(true);
      const { data: contractData } = await supabase
        .from('freelance_contracts')
        .select('*')
        .eq('id', id)
        .single();

      if (!contractData) { setLoading(false); return; }
      setContract(contractData);

      const [jobRes, milestonesRes, freelancerRes, clientRes] = await Promise.all([
        supabase.from('freelance_jobs').select('*').eq('id', contractData.job_id).single(),
        supabase.from('freelance_milestones').select('*').eq('contract_id', id).order('created_at'),
        supabase.from('profiles').select('id, name, avatar_url, job_title').eq('id', contractData.freelancer_id).single(),
        supabase.from('profiles').select('id, name, avatar_url, job_title').eq('id', contractData.client_id).single(),
      ]);

      setJob(jobRes.data);
      setMilestones(milestonesRes.data || []);
      setFreelancerProfile(freelancerRes.data);
      setClientProfile(clientRes.data);
      setLoading(false);
    }
    load();
  }, [id, session]);

  const handleMilestoneSubmit = async (milestoneId) => {
    await supabase.from('freelance_milestones').update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    }).eq('id', milestoneId);
    setMilestones(prev => prev.map(m => m.id === milestoneId ? { ...m, status: 'submitted', submitted_at: new Date().toISOString() } : m));
  };

  const handleMilestoneApprove = async (milestoneId) => {
    await supabase.from('freelance_milestones').update({
      status: 'approved',
      approved_at: new Date().toISOString(),
    }).eq('id', milestoneId);
    setMilestones(prev => prev.map(m => m.id === milestoneId ? { ...m, status: 'approved', approved_at: new Date().toISOString() } : m));
  };

  const handleMilestoneReject = async (milestoneId) => {
    await supabase.from('freelance_milestones').update({ status: 'pending', submitted_at: null }).eq('id', milestoneId);
    setMilestones(prev => prev.map(m => m.id === milestoneId ? { ...m, status: 'pending', submitted_at: null } : m));
  };

  const handleAddMilestone = async () => {
    const title = prompt('Milestone title:');
    const amount = prompt('Amount (USD):');
    if (!title || !amount) return;
    const { data } = await supabase.from('freelance_milestones').insert({
      contract_id: id,
      title,
      amount: parseInt(amount),
    }).select().single();
    if (data) setMilestones(prev => [...prev, data]);
  };

  const handleCompleteContract = async () => {
    if (!confirm('Mark this contract as completed?')) return;
    await supabase.from('freelance_contracts').update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    }).eq('id', id);
    await supabase.from('freelance_jobs').update({ status: 'completed' }).eq('id', contract.job_id);
    setContract(prev => ({ ...prev, status: 'completed' }));
  };

  if (loading) {
    return (
      <div className="bg-[#050816] flex items-center justify-center">
        <Loader2 size={24} className="text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="bg-[#050816] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-bold text-white mb-2">Contract not found</h2>
          <Link to="/freelance" className="text-blue-400 text-sm hover:underline">Back to Marketplace</Link>
        </div>
      </div>
    );
  }

  const s = STATUS_STYLE[contract.status] || STATUS_STYLE.active;
  const isFreelancer = session?.user.id === contract.freelancer_id;
  const isClient = session?.user.id === contract.client_id;
  const otherProfile = isFreelancer ? clientProfile : freelancerProfile;

  const totalAmount = milestones.reduce((sum, m) => sum + m.amount, 0);
  const paidAmount = milestones.filter(m => m.status === 'paid' || m.status === 'approved').reduce((sum, m) => sum + m.amount, 0);

  return (
    <div className="bg-[#050816] font-['Manrope',sans-serif]">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[500px] h-[400px] bg-blue-600/8 rounded-full blur-[120px]" />
      </div>

      <PageNavbar breadcrumbs={[{ label: 'Freelance', href: '/freelance' }, { label: 'Contract' }]} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => navigate('/freelance/dashboard')} className="flex items-center gap-1 text-xs text-slate-500 hover:text-white mb-6 transition-colors">
            <ArrowLeft size={13} /> Back to Dashboard
          </button>

          <div className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 overflow-hidden mb-6">
            <div className="h-1 w-full bg-gradient-to-r from-green-500/60 to-blue-500/30" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${s.cls}`}>{s.label}</span>
                {contract.project_id && (
                  <Link to={`/project/${contract.project_id}`} className="flex items-center gap-1 text-xs text-blue-400 hover:underline">
                    <ExternalLink size={12} /> Open Workspace
                  </Link>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-white mb-4" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                {job?.title || 'Freelance Contract'}
              </h1>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-xs text-slate-500 mb-1">Agreed Rate</div>
                  <div className="text-sm font-bold text-white flex items-center gap-1">
                    <DollarSign size={13} className="text-green-400" />
                    ${contract.agreed_rate?.toLocaleString()}
                    <span className="text-xs text-slate-500">/{contract.budget_type === 'hourly' ? 'hr' : 'fixed'}</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-xs text-slate-500 mb-1">Total Milestones</div>
                  <div className="text-sm font-bold text-white">${totalAmount.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-xs text-slate-500 mb-1">Approved</div>
                  <div className="text-sm font-bold text-green-400">${paidAmount.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-xs text-slate-500 mb-1">Started</div>
                  <div className="text-sm font-bold text-white">{new Date(contract.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] mb-4">
                <div className="flex items-center gap-2 flex-1">
                  <User size={13} className="text-slate-500" />
                  <span className="text-xs text-slate-500">{isFreelancer ? 'Client' : 'Freelancer'}:</span>
                  <span className="text-sm font-semibold text-white">{otherProfile?.name || 'User'}</span>
                </div>
                {contract.project_id && (
                  <Link to={`/project/${contract.project_id}`} className="flex items-center gap-1 text-xs text-blue-400 hover:underline">
                    <MessageSquare size={12} /> Chat
                  </Link>
                )}
              </div>

              {contract.status === 'active' && isClient && (
                <button
                  onClick={handleCompleteContract}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-green-500/20 border border-green-500/30 hover:bg-green-500/30 transition-all"
                >
                  Mark as Completed
                </button>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>Milestones</h2>
              {contract.status === 'active' && (
                <button
                  onClick={handleAddMilestone}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-all"
                >
                  + Add Milestone
                </button>
              )}
            </div>

            <MilestoneTracker
              milestones={milestones}
              isFreelancer={isFreelancer}
              isClient={isClient}
              onSubmit={handleMilestoneSubmit}
              onApprove={handleMilestoneApprove}
              onReject={handleMilestoneReject}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
