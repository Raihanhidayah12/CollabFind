import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Clock, DollarSign, Briefcase, Star, Users, Send,
  Loader2, CheckCircle, XCircle, ExternalLink,
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import PageNavbar from '../components/PageNavbar';
import SubmitProposalModal from '../components/freelance/SubmitProposalModal';
import ProposalCard from '../components/freelance/ProposalCard';

const CATEGORY_LABELS = {
  web_dev: 'Web Development', mobile: 'Mobile Development', design: 'UI/UX Design',
  data: 'Data & Analytics', writing: 'Writing & Content', marketing: 'Marketing',
};
const DURATION_LABELS = {
  less_1_week: '< 1 week', '1_4_weeks': '1-4 weeks', '1_3_months': '1-3 months', '3_plus_months': '3+ months',
};
const EXP_LABELS = { beginner: 'Beginner', intermediate: 'Intermediate', expert: 'Expert' };
const STATUS_STYLE = {
  open:        { label: 'Open',        cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
  in_progress: { label: 'In Progress', cls: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  completed:   { label: 'Completed',   cls: 'text-slate-400 bg-slate-400/10 border-slate-400/20' },
  closed:      { label: 'Closed',      cls: 'text-slate-400 bg-slate-400/10 border-slate-400/20' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'Today';
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)} weeks ago`;
}

function formatBudget(min, max, type) {
  if (!min && !max) return 'Negotiable';
  const fmt = (n) => `$${n.toLocaleString()}`;
  const range = min && max ? `${fmt(min)} - ${fmt(max)}` : min ? `From ${fmt(min)}` : `Up to ${fmt(max)}`;
  return `${range} (${type === 'hourly' ? '/hr' : 'fixed'})`;
}

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: l } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => l.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: jobData } = await supabase
        .from('freelance_jobs')
        .select('*')
        .eq('id', id)
        .single();

      if (!jobData) { setLoading(false); return; }
      setJob(jobData);

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, job_title')
        .eq('id', jobData.client_id)
        .single();
      setClientProfile(profile);

      if (session) {
        const { data: existingProposals } = await supabase
          .from('freelance_proposals')
          .select('*')
          .eq('job_id', id);
        setProposals(existingProposals || []);
        setHasApplied((existingProposals || []).some(p => p.freelancer_id === session.user.id));
      }
      setLoading(false);
    }
    load();
  }, [id, session]);

  const handleSubmitProposal = async (proposalData) => {
    if (!session) return;
    const { error } = await supabase
      .from('freelance_proposals')
      .insert({
        job_id: id,
        freelancer_id: session.user.id,
        ...proposalData,
      });
    if (error) { alert('Failed: ' + error.message); return; }
    setHasApplied(true);
    setShowProposalModal(false);
    const { data: updated } = await supabase.from('freelance_proposals').select('*').eq('job_id', id);
    setProposals(updated || []);
  };

  const handleHireFreelancer = async (proposal) => {
    if (!session || session.user.id !== job.client_id) return;
    if (!confirm('Hire this freelancer? A workspace project will be created for collaboration.')) return;

    try {
      const projectId = crypto.randomUUID();
      await supabase.from('projects').insert({
        id: projectId,
        title: job.title,
        description: `[Freelance] ${job.description}`,
        creator_id: session.user.id,
        status: 'ongoing',
        skills_needed: job.skills,
        max_members: 2,
        open_slots: 0,
      });

      await supabase.from('project_members').insert([
        { project_id: projectId, user_id: session.user.id, role: 'owner' },
        { project_id: projectId, user_id: proposal.freelancer_id, role: 'member' },
      ]);

      const { data: contract } = await supabase
        .from('freelance_contracts')
        .insert({
          job_id: job.id,
          proposal_id: proposal.id,
          client_id: session.user.id,
          freelancer_id: proposal.freelancer_id,
          project_id: projectId,
          agreed_rate: proposal.proposed_rate,
          budget_type: job.budget_type,
        })
        .select()
        .single();

      await supabase.from('freelance_proposals').update({ status: 'accepted' }).eq('id', proposal.id);
      await supabase.from('freelance_proposals').update({ status: 'rejected' }).eq('job_id', job.id).neq('id', proposal.id);
      await supabase.from('freelance_jobs').update({ status: 'in_progress' }).eq('id', job.id);

      setJob(prev => ({ ...prev, status: 'in_progress' }));
      navigate(`/freelance/contracts/${contract.id}`);
    } catch (err) {
      alert('Failed to hire: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <Loader2 size={24} className="text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-bold text-white mb-2">Job not found</h2>
          <Link to="/freelance" className="text-blue-400 text-sm hover:underline">Back to Marketplace</Link>
        </div>
      </div>
    );
  }

  const s = STATUS_STYLE[job.status] || STATUS_STYLE.open;
  const isOwner = session?.user.id === job.client_id;

  return (
    <div className="min-h-screen bg-[#050816] font-['Manrope',sans-serif]">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[500px] h-[400px] bg-blue-600/8 rounded-full blur-[120px]" />
      </div>

      <PageNavbar breadcrumbs={[{ label: 'Freelance', href: '/freelance' }, { label: job.title }]} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => navigate('/freelance')} className="flex items-center gap-1 text-xs text-slate-500 hover:text-white mb-6 transition-colors">
            <ArrowLeft size={13} /> Back to Marketplace
          </button>

          <div className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 overflow-hidden mb-6">
            <div className="h-1 w-full bg-gradient-to-r from-blue-500/60 to-purple-500/30" />
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${s.cls}`}>{s.label}</span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock size={11} /> Posted {timeAgo(job.created_at)}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-4" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-6">
                <span className="flex items-center gap-1.5">
                  <DollarSign size={14} className="text-green-400" />
                  {formatBudget(job.budget_min, job.budget_max, job.budget_type)}
                </span>
                {job.duration && (
                  <span className="flex items-center gap-1.5">
                    <Briefcase size={13} /> {DURATION_LABELS[job.duration] || job.duration}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Star size={13} /> {EXP_LABELS[job.experience_level]}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
                  {CATEGORY_LABELS[job.category] || job.category}
                </span>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-bold text-white mb-2">Description</h3>
                <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{job.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-bold text-white mb-2">Skills Required</h3>
                <div className="flex flex-wrap gap-2">
                  {(job.skills || []).map(sk => (
                    <span key={sk} className="px-3 py-1 rounded-lg bg-white/[0.05] border border-white/[0.08] text-xs text-slate-300 font-medium">{sk}</span>
                  ))}
                </div>
              </div>

              {clientProfile && (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.07] bg-white/[0.02]">
                  {clientProfile.avatar_url?.startsWith('http') ? (
                    <img src={clientProfile.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/25 to-purple-500/25 border border-white/[0.1] flex items-center justify-center font-bold text-white text-sm">
                      {(clientProfile.name || 'C')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-white">{clientProfile.name || 'Client'}</p>
                    <p className="text-xs text-slate-500">{clientProfile.job_title || 'Client'}</p>
                  </div>
                </div>
              )}

              {session && !isOwner && job.status === 'open' && (
                <div className="mt-6">
                  {hasApplied ? (
                    <div className="flex items-center gap-2 text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-3">
                      <CheckCircle size={16} /> You have already submitted a proposal
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowProposalModal(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition-all"
                    >
                      <Send size={14} /> Submit Proposal
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {isOwner && proposals.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                Proposals ({proposals.length})
              </h2>
              <div className="space-y-3">
                {proposals.map(p => (
                  <div key={p.id} className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 p-5">
                    <ProposalCard proposal={p} />
                    {job.status === 'open' && p.status === 'pending' && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleHireFreelancer(p)}
                          className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-green-500/20 border border-green-500/30 hover:bg-green-500/30 transition-all"
                        >
                          Hire Freelancer
                        </button>
                        <button
                          onClick={async () => {
                            await supabase.from('freelance_proposals').update({ status: 'rejected' }).eq('id', p.id);
                            setProposals(prev => prev.map(x => x.id === p.id ? { ...x, status: 'rejected' } : x));
                          }}
                          className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showProposalModal && (
          <SubmitProposalModal
            job={job}
            onSubmit={handleSubmitProposal}
            onClose={() => setShowProposalModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
