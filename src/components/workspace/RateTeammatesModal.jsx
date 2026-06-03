import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';

export default function RateTeammatesModal({ project, session, onClose }) {
  const [teammates, setTeammates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ratings, setRatings] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchTeammates();
  }, [project.id]);

  const fetchTeammates = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch collaborators (accepted applicants)
      const { data: apps, error: appErr } = await supabase
        .from('applications')
        .select('applicant_id')
        .eq('project_id', project.id)
        .eq('status', 'accepted');
      
      if (appErr) throw appErr;

      // Also need the owner
      const ownerId = project.creator_id;
      
      const applicantIds = apps.map(a => a.applicant_id);
      const allIds = [...new Set([...applicantIds, ownerId])];
      
      // We need user records to get their IDs and names
      const { data: users, error: userErr } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', allIds);

      if (userErr) throw userErr;

      // Filter out the current user
      const others = (users || []).filter(u => u.id !== session.user.id);
      setTeammates(others);

      // Fetch existing ratings by this user for this project
      const { data: existingRatings, error: rateErr } = await supabase
        .from('user_ratings')
        .select('*')
        .eq('project_id', project.id)
        .eq('rater_id', session.user.id);
        
      if (!rateErr && existingRatings) {
        const initialRatings = {};
        existingRatings.forEach(r => {
          initialRatings[r.ratee_id] = { score: Math.round(r.score / 20), feedback: r.feedback || '', existing: true };
        });
        setRatings(initialRatings);
      }
      
    } catch (err) {
      console.error(err);
      setError('Failed to load teammates.');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (rateeId, field, value) => {
    setRatings(prev => ({
      ...prev,
      [rateeId]: {
        ...prev[rateeId],
        [field]: value,
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');
      
      // Prepare upsert payload
      const payload = teammates
        .filter(t => ratings[t.id]?.score)
        .map(t => ({
          project_id: project.id,
          rater_id: session.user.id,
          ratee_id: t.id,
          score: ratings[t.id].score * 20, // 5 stars = 100
          feedback: ratings[t.id].feedback || '',
        }));

      if (payload.length === 0) {
        setError('Please rate at least one teammate.');
        return;
      }

      // Upsert ratings
      const { error: upsertErr } = await supabase
        .from('user_ratings')
        .upsert(payload, { onConflict: 'project_id, rater_id, ratee_id' });

      if (upsertErr) throw upsertErr;

      setSuccess(true);
      setTimeout(onClose, 2000);
      
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to submit ratings.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg rounded-2xl border border-white/[0.1] bg-[#0d1224] overflow-hidden max-h-[90vh] flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
            <h2 className="text-lg font-bold text-white">Rate Your Teammates</h2>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>Loading teammates...</p>
              </div>
            ) : success ? (
              <div className="flex flex-col items-center justify-center py-10 text-emerald-400">
                <CheckCircle className="w-12 h-12 mb-4" />
                <h3 className="text-xl font-bold mb-2">Ratings Submitted!</h3>
                <p className="text-sm text-slate-400 text-center">Thank you for sharing your feedback.</p>
              </div>
            ) : teammates.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                You have no teammates to rate on this project.
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}
                
                {teammates.map((u) => {
                  const rating = ratings[u.id] || { score: 0, feedback: '' };
                  return (
                    <div key={u.id} className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold overflow-hidden border border-slate-700">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt={u.name} className="w-full h-full object-cover" />
                          ) : (
                            (u.name || 'U')[0].toUpperCase()
                          )}
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{u.name || 'Anonymous User'}</h4>
                          <div className="flex gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => handleRatingChange(u.id, 'score', star)}
                                className={`transition-all hover:scale-110 ${
                                  rating.score >= star ? 'text-yellow-400' : 'text-slate-600'
                                }`}
                              >
                                <Star size={18} fill={rating.score >= star ? 'currentColor' : 'none'} />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <textarea
                        value={rating.feedback}
                        onChange={(e) => handleRatingChange(u.id, 'feedback', e.target.value)}
                        placeholder="Optional feedback..."
                        className="w-full h-20 px-3 py-2 text-sm rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-300 placeholder-slate-600 outline-none focus:border-blue-500/50 resize-none transition-colors"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {!loading && !success && teammates.length > 0 && (
            <div className="p-5 border-t border-white/[0.06] flex justify-end gap-3 bg-white/[0.01]">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit Ratings
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
