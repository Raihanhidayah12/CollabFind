import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Coffee, Search, Loader2 } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useLanguage } from '../i18n/LanguageContext';

const STATUSES = [
  { value: 'available', labelKey: 'qsu.available', icon: UserCheck, color: '#10B981', bg: 'bg-green-500/15', border: 'border-green-500/25' },
  { value: 'busy', labelKey: 'qsu.busy', icon: Coffee, color: '#F59E0B', bg: 'bg-yellow-500/15', border: 'border-yellow-500/25' },
  { value: 'looking', labelKey: 'qsu.looking', icon: Search, color: '#3B82F6', bg: 'bg-blue-500/15', border: 'border-blue-500/25' },
];

export default function QuickStatusUpdate({ session }) {
  const { t } = useLanguage();
  const [currentStatus, setCurrentStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!session) return;
    supabase
      .from('profiles')
      .select('collab_status')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        if (data?.collab_status) setCurrentStatus(data.collab_status);
      });
  }, [session]);

  async function setStatus(value) {
    if (saving || !session) return;
    setSaving(true);
    await supabase
      .from('profiles')
      .update({ collab_status: value, updated_at: new Date().toISOString() })
      .eq('id', session.user.id);
    setCurrentStatus(value);
    setSaving(false);
  }

  const active = STATUSES.find(s => s.value === currentStatus) || STATUSES[0];
  const ActiveIcon = active.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/80 overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse`} style={{ background: active.color }} />
            <h3 className="text-sm font-bold text-white">{t('qsu.status')}</h3>
          </div>
          {saving && <Loader2 size={12} className="text-slate-500 animate-spin" />}
        </div>
        <p className="text-[10px] text-slate-500 mt-0.5">
          {currentStatus === 'available' ? t('qsu.availableDesc') :
           currentStatus === 'busy' ? t('qsu.busyDesc') :
           currentStatus === 'looking' ? t('qsu.lookingDesc') :
           t('qsu.setPrompt')}
        </p>
      </div>
      <div className="p-2 grid grid-cols-3 gap-1.5">
        {STATUSES.map(s => {
          const Icon = s.icon;
          const isActive = s.value === currentStatus;
          return (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              disabled={saving}
              className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl text-[10px] font-semibold transition-all ${
                isActive ? `${s.bg} ${s.border} border` : 'border border-transparent hover:bg-white/[0.03]'
              }`}
              style={{ color: isActive ? s.color : '#94A3B8' }}
            >
              <Icon size={14} />
              {t(s.labelKey)}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
