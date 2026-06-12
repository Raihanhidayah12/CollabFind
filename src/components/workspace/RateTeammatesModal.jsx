import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Loader2, CheckCircle, Users } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import { useLanguage } from '../../i18n/LanguageContext';

// Reusable card for rating a single person
function RateeCard({ user, rating, onChange, isOwner: ownerBadge }) {
  return (
    <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] transition-colors hover:border-white/[0.1]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold overflow-hidden border border-slate-700 flex-shrink-0">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            (user.name || 'U')[0].toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-white font-medium truncate">{user.name || 'Anonymous User'}</h4>
            {ownerBadge && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold text-purple-300 bg-purple-500/15 border border-purple-500/25 flex-shrink-0">
                Owner
              </span>
            )}
          </div>
          {user.job_title && (
            <p className="text-xs text-slate-500">{user.job_title}</p>
          )}
          {/* Star rating */}
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => onChange('score', star)}
                className={`transition-all hover:scale-110 ${rating.score >= star ? 'text-yellow-400' : 'text-slate-600'}`}
              >
                <Star size={18} fill={rating.score >= star ? 'currentColor' : 'none'} />
              </button>
            ))}
            {rating.score > 0 && (
              <span className="ml-1 text-xs text-slate-400 self-center">{rating.score}/5</span>
            )}
          </div>
        </div>
      </div>

      <textarea
        value={rating.feedback}
        onChange={e => onChange('feedback', e.target.value)}
        placeholder="Optional feedback (e.g. great communicator, delivered on time…)"
        className="w-full h-16 px-3 py-2 text-sm rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-300 placeholder-slate-600 outline-none focus:border-blue-500/50 resize-none transition-colors"
      />
    </div>
  );
}

export default function RateTeammatesModal({ project, session, onClose }) {
  const { t } = useLanguage();
  const [teammates, setTeammates] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ratings, setRatings]     = useState({});
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);

  const currentUserId = session?.user?.id;
  const isOwner       = currentUserId === project.creator_id;

  useEffect(() => {
    fetchTeammates();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  const fetchTeammates = async () => {
    try {
      setLoading(true);

      // 1. Accepted applicants
      const { data: apps } = await supabase
        .from('applications')
        .select('applicant_id')
        .eq('project_id', project.id)
        .eq('status', 'accepted');

      // 2. Accepted invitees
      const { data: invites } = await supabase
        .from('invitations')
        .select('invitee_id')
        .eq('project_id', project.id)
        .eq('status', 'accepted');

      // 3. Always include owner
      const ownerId      = project.creator_id;
      const applicantIds = (apps    || []).map(a => a.applicant_id).filter(Boolean);
      const inviteeIds   = (invites || []).map(i => i.invitee_id).filter(Boolean);

      // All team member IDs (owner + collaborators), deduplicated
      const allIds = [...new Set([ownerId, ...applicantIds, ...inviteeIds])];

      // 4. Fetch profiles
      let users = [];
      if (allIds.length > 0) {
        const { data: profiles, error: profileErr } = await supabase
          .from('profiles')
          .select('id, name, avatar_url, job_title')
          .in('id', allIds);

        if (!profileErr) users = profiles || [];
      }

      // 5. Remove self — everyone rates everyone EXCEPT themselves
      const others = users.filter(u => u.id !== currentUserId);
      setTeammates(others);

      // 6. Load any existing ratings submitted by this user
      const { data: existingRatings } = await supabase
        .from('user_ratings')
        .select('ratee_id, score, feedback')
        .eq('project_id', project.id)
        .eq('rater_id', currentUserId);

      if (existingRatings?.length) {
        const init = {};
        existingRatings.forEach(r => {
          init[r.ratee_id] = { score: Math.round(r.score / 20), feedback: r.feedback || '' };
        });
        setRatings(init);
      }

    } catch (err) {
      console.error('RateTeammatesModal fetchTeammates error:', err);
      setError(t('rtm.loadFail'));
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (rateeId, field, value) => {
    setRatings(prev => ({
      ...prev,
      [rateeId]: { ...(prev[rateeId] || { score: 0, feedback: '' }), [field]: value },
    }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');

      const payload = teammates
        .filter(tm => ratings[tm.id]?.score > 0)
        .map(tm => ({
          project_id: project.id,
          rater_id:   currentUserId,
          ratee_id:   tm.id,
          score:      ratings[tm.id].score * 20, // 5 stars = 100 pts
          feedback:   ratings[tm.id].feedback || '',
        }));

      if (payload.length === 0) {
        setError(t('rtm.minRating'));
        setSubmitting(false);
        return;
      }

      const { error: upsertErr } = await supabase
        .from('user_ratings')
        .upsert(payload, { onConflict: 'project_id,rater_id,ratee_id' });

      if (upsertErr) throw upsertErr;

      setSuccess(true);
      setTimeout(onClose, 2200);

    } catch (err) {
      console.error('RateTeammatesModal submit error:', err);
      setError(t('rtm.saveFail'));
    } finally {
      setSubmitting(false);
    }
  };

  const ratedCount = teammates.filter(tm => ratings[tm.id]?.score > 0).length;

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-lg rounded-2xl border border-white/[0.1] bg-[#0d1224] overflow-hidden max-h-[90vh] flex flex-col shadow-2xl"
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <div>
              <h2 className="text-lg font-bold text-white">{t('rtm.title')}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isOwner
                  ? t('rtm.ownerDesc')
                  : t('rtm.memberDesc')}
              </p>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/[0.06]">
              <X size={18} />
            </button>
          </div>

          {/* ── Body ── */}
          <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-sm">{t('rtm.loading')}</p>
              </div>

            ) : success ? (
              <div className="flex flex-col items-center justify-center py-12 text-emerald-400 gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <CheckCircle className="w-14 h-14" />
                </motion.div>
                <h3 className="text-xl font-bold">{t('rtm.saved')}</h3>
                <p className="text-sm text-slate-400 text-center">
                  {t('rtm.savedDesc')}
                </p>
              </div>

            ) : teammates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3">
                <Users className="w-10 h-10 opacity-40" />
                <p className="text-sm text-center">
                  {t('rtm.noTeammates')}
                </p>
              </div>

            ) : (
              <>
                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Progress indicator */}
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Star size={11} className="text-yellow-500" />
                    {ratedCount} / {teammates.length} {t('rtm.rated')}
                  </span>
                  {ratedCount === teammates.length && teammates.length > 0 && (
                    <span className="text-emerald-400 font-medium">{t('rtm.allRated')}</span>
                  )}
                </div>

                {/* Rating cards for each teammate */}
                {teammates.map(u => (
                  <RateeCard
                    key={u.id}
                    user={u}
                    rating={ratings[u.id] || { score: 0, feedback: '' }}
                    onChange={(field, val) => handleRatingChange(u.id, field, val)}
                    isOwner={u.id === project.creator_id}
                  />
                ))}
              </>
            )}
          </div>

          {/* ── Footer ── */}
          {!loading && !success && teammates.length > 0 && (
            <div className="px-6 py-4 border-t border-white/[0.06] flex justify-end gap-3 bg-white/[0.01]">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                {t('rtm.cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || ratedCount === 0}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {t('rtm.saveRating')}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
