import { motion } from 'framer-motion';
import { Moon } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function ThemeToggle() {
  const { t } = useLanguage();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/80 overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Moon size={14} className="text-indigo-400" />
          <h3 className="text-sm font-bold text-white">{t('th.title')}</h3>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          {t('th.comingSoon')}
        </span>
      </div>
      <div className="px-4 py-2">
        <p className="text-[10px] text-slate-500">
          {t('th.desc')}
        </p>
      </div>
    </motion.div>
  );
}
