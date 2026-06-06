import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { motion } from 'framer-motion';
import { Check, X, Loader2 } from 'lucide-react';

export default function ProjectInvitation() {
  const { inviteId } = useParams();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState(null);
  const [project, setProject] = useState(null);
  const [inviter, setInviter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const { data: { session: sess } } = await supabase.auth.getSession();
      if (!sess) {
        navigate('/login');
        return;
      }
      setSession(sess);

      const { data: inv } = await supabase
        .from('invitations')
        .select('*')
        .eq('id', inviteId)
        .single();

      if (!inv) {
        navigate('/dashboard');
        return;
      }

      setInvitation(inv);

      const { data: proj } = await supabase
        .from('projects')
        .select('*')
        .eq('id', inv.project_id)
        .single();
      setProject(proj);

      const { data: prof } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('id', inv.inviter_id)
        .single();
      setInviter(prof);

      setLoading(false);
    };

    loadData();
  }, [inviteId, navigate]);

  const handleAccept = async () => {
    if (!session || !invitation) return;
    setResponding(true);

    try {
      const { error: invError } = await supabase.from('invitations')
        .update({ status: 'accepted' })
        .eq('id', inviteId);

      if (invError) throw invError;

      navigate(`/dashboard/workspace/${invitation.project_id}`);
    } catch (err) {
      console.error('Error accepting invitation:', err);
      alert('Failed to accept invitation. Please try again.');
      setResponding(false);
    }
  };

  const handleReject = async () => {
    if (!invitation) return;
    setResponding(true);

    await supabase.from('invitations')
      .update({ status: 'rejected' })
      .eq('id', inviteId);

    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <Loader2 size={24} className="text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center p-4 pt-32">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl border border-white/[0.1] bg-gradient-to-br from-[#0d1224] to-[#0a0f1e] p-8 backdrop-blur-xl shadow-2xl"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 mb-4">
            {inviter?.avatar_url ? (
              <img
                src={inviter.avatar_url}
                alt={inviter.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {inviter?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {inviter?.name || 'Someone'} invited you
          </h2>
          <p className="text-slate-400">
            to join <span className="text-white font-semibold">{project?.title}</span>
          </p>
        </div>

        {project?.description && (
          <div className="bg-white/[0.05] rounded-xl p-4 mb-6 border border-white/[0.08]">
            <p className="text-sm text-slate-300">{project.description}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleReject}
            disabled={responding}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all disabled:opacity-50"
          >
            {responding ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
            Decline
          </button>
          <button
            onClick={handleAccept}
            disabled={responding}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 transition-all disabled:opacity-50"
          >
            {responding ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Accept
          </button>
        </div>
      </motion.div>
    </div>
  );
}
