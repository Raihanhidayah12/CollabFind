import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, ArrowRight, Sparkles } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useLanguage } from '../i18n/LanguageContext';

const buildSteps = (t) => [
  { id: 'profile', label: t('onb.step1'), to: '/profile', check: (p) => p?.skills?.length > 0 },
  { id: 'project', label: t('onb.step2'), to: '/create-project', check: (_, projects) => projects.length > 0 },
  { id: 'explore', label: t('onb.step3'), to: '/explore', check: () => true },
  { id: 'chat', label: t('onb.step4'), to: '/dashboard/chat', check: () => true },
];

export default function OnboardingChecklist({ profile, myProjects }) {
  const { t } = useLanguage();
  const STEPS = buildSteps(t);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const val = localStorage.getItem('onboarding-dismissed');
    if (val) setDismissed(true);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('onboarding-dismissed', '1');
    setDismissed(true);
  };

  if (dismissed) return null;

  const allDone = STEPS.every(s => s.check(profile, myProjects));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-blue-500/20 bg-[#0a0f1e]/80 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-blue-400" />
          <h3 className="text-sm font-bold text-white">{t('onb.gettingStarted')}</h3>
        </div>
        <button onClick={handleDismiss} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
          {t('onb.dismiss')}
        </button>
      </div>

      {allDone ? (
        <div className="p-4 text-center">
          <CheckCircle size={28} className="text-green-400 mx-auto mb-2" />
          <p className="text-xs text-slate-400">{t('onb.allDone')}</p>
        </div>
      ) : (
        <div className="p-3 space-y-1">
          {STEPS.map((step, i) => {
            const done = step.check(profile, myProjects);
            return (
              <Link
                key={step.id}
                to={step.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all group ${done ? 'opacity-50' : ''}`}
              >
                {done ? (
                  <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                ) : (
                  <Circle size={16} className="text-slate-600 flex-shrink-0" />
                )}
                <span className={`text-xs flex-1 ${done ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                  {step.label}
                </span>
                {!done && <ArrowRight size={12} className="text-slate-700 group-hover:text-slate-400 transition-colors flex-shrink-0" />}
              </Link>
            );
          })}
        </div>
      )}

      {/* Progress bar */}
      <div className="px-4 pb-3">
        <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-green-400"
            initial={{ width: 0 }}
            animate={{ width: `${(STEPS.filter(s => s.check(profile, myProjects)).length / STEPS.length) * 100}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
        <p className="text-[10px] text-slate-600 mt-1">
          {STEPS.filter(s => s.check(profile, myProjects)).length}/{STEPS.length} {t('onb.finished')}
        </p>
      </div>
    </motion.div>
  );
}
