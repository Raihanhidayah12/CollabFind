import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, DollarSign, Clock } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function SubmitProposalModal({ job, onSubmit, onClose }) {
  const { t } = useLanguage();
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedRate, setProposedRate] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = coverLetter.trim().length >= 20 && proposedRate > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    try {
      await onSubmit({
        cover_letter: coverLetter.trim(),
        proposed_rate: parseInt(proposedRate),
        estimated_duration: estimatedDuration,
      });
    } finally {
      setLoading(false);
    }
  };

  const durations = [
    { value: 'less_1_week', label: t('jc.lessThanWeek') },
    { value: '1_4_weeks', label: t('jc.weeks14') },
    { value: '1_3_months', label: t('jc.months13') },
    { value: '3_plus_months', label: t('jc.months3plus') },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg rounded-2xl border border-white/[0.1] bg-[#0d1224]/98 backdrop-blur-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <div>
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
              {t('sp.title')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{job?.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">{t('sp.coverLetter')}</label>
            <textarea
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              placeholder={t('sp.coverLetterPlaceholder')}
              rows={5}
              className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 transition-all resize-none"
            />
            <span className={`text-[10px] mt-1 ${coverLetter.length >= 20 ? 'text-green-400/60' : 'text-slate-600'}`}>
              {coverLetter.length}/20 {t('sp.minChars')} {coverLetter.length >= 20 && '✓'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                <span className="flex items-center gap-1"><DollarSign size={11} /> {t('sp.proposedRate')}</span>
              </label>
              <input
                type="number"
                min="1"
                value={proposedRate}
                onChange={e => setProposedRate(e.target.value)}
                placeholder="500"
                className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                <span className="flex items-center gap-1"><Clock size={11} /> {t('sp.estimatedDuration')}</span>
              </label>
              <select
                value={estimatedDuration}
                onChange={e => setEstimatedDuration(e.target.value)}
                className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50 transition-all appearance-none"
              >
                <option value="" className="bg-[#0d1224]">{t('sp.selectDuration')}</option>
                {durations.map(d => (
                  <option key={d.value} value={d.value} className="bg-[#0d1224]">{d.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-400 border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] transition-all"
            >
              {t('sp.cancel')}
            </button>
            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={14} />}
              {loading ? t('sp.submitting') : t('sp.submitProposal')}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
