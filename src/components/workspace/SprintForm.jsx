import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import { useLanguage } from '../../i18n/LanguageContext';

export default function SprintForm({ projectId, addToast, onClose, onSprintCreated }) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) {
      setError(t('sf.nameRequired'));
      return;
    }
    setError('');
    setSaving(true);
    const { data: newSprint, error: dbError } = await supabase
      .from('project_sprints')
      .insert({
        project_id: projectId,
        name: name.trim(),
        start_date: startDate || null,
        end_date: endDate || null,
      })
      .select()
      .single();
    setSaving(false);
    if (dbError) {
      console.error('Sprint insert error', dbError);
      addToast(t('sf.createFail'), 'error');
    } else {
      addToast(t('sf.createSuccess'), 'success');
      if (onSprintCreated) onSprintCreated(newSprint);
      onClose();
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="text-xs text-slate-500">{t('sf.name')}</label>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Sprint 1"
        className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:bg-blue-500/[0.04] transition-all"
      />
      <label className="text-xs text-slate-500">{t('sf.startDate')}</label>
      <input
        type="date"
        value={startDate}
        onChange={e => setStartDate(e.target.value)}
        className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:border-blue-500/50 transition-all"
      />
      <label className="text-xs text-slate-500">{t('sf.endDate')}</label>
      <input
        type="date"
        value={endDate}
        onChange={e => setEndDate(e.target.value)}
        className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:border-blue-500/50 transition-all"
      />
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <AlertCircle size={11} /> {error}
        </p>
      )}
      <div className="flex gap-2 justify-end mt-2">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 border border-white/[0.08] hover:bg-white/[0.05] transition-all"
        >
          {t('sf.cancel')}
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-green-500/20 border border-green-500/30 hover:bg-green-500/30 transition-all disabled:opacity-50"
        >
          {saving ? <CheckCircle size={13} className="animate-spin" /> : <CheckCircle size={13} />} {t('sf.saveSprint')}
        </button>
      </div>
    </div>
  );
}
