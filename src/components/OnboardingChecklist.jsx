import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Circle, ArrowRight, Sparkles, Camera, Code, Briefcase, FolderOpen, Compass, MessageSquare, X, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useLanguage } from '../i18n/LanguageContext';

const STEP_ICONS = [Camera, Code, Briefcase, FolderOpen, Compass, MessageSquare];

function buildSteps(t) {
  return [
    { id: 'avatar',  labelKey: 'onb.stepAvatar',  to: '/profile',            check: (p) => !!p?.avatar_url },
    { id: 'skills',  labelKey: 'onb.stepSkills',  to: '/profile',            check: (p) => Array.isArray(p?.skills) && p.skills.length > 0 },
    { id: 'job',     labelKey: 'onb.stepJob',      to: '/profile',            check: (p) => !!p?.job_title },
    { id: 'project', labelKey: 'onb.stepProject',  to: '/explore',            check: (_, projects) => projects.length > 0 },
    { id: 'explore', labelKey: 'onb.stepExplore',  to: '/explore',            check: () => false },
    { id: 'chat',    labelKey: 'onb.stepChat',      to: '/dashboard/chat',     check: () => false },
  ];
}

const TIER_BADGES = {
  scout:          { label: 'Scout',           color: '#94A3B8' },
  connector:      { label: 'Connector',       color: '#3B82F6' },
  founding:       { label: 'Founding Member', color: '#8B5CF6' },
  ambassador:     { label: 'Ambassador',      color: '#F59E0B' },
};

export default function OnboardingChecklist({ profile, myProjects }) {
  const { t } = useLanguage();
  const STEPS = buildSteps(t);
  const [expanded, setExpanded] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (profile?.onboarding_completed) {
      setCompleted(true);
      setExpanded(false);
    }
  }, [profile?.onboarding_completed]);

  const doneSteps = STEPS.filter(s => s.check(profile, myProjects));
  const doneCount = doneSteps.length;
  const allDone = doneCount === STEPS.length;

  useEffect(() => {
    if (allDone && !completed && profile?.id) {
      setCompleted(true);
      supabase.from('profiles').update({ onboarding_completed: true }).eq('id', profile.id).then(() => {}).catch(() => {});
    }
  }, [allDone, completed, profile?.id]);

  if (completed && !expanded) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl border border-green-500/20 bg-green-500/5 p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-400" />
            <span className="text-sm font-semibold text-green-300">{t('onb.allDone')}</span>
          </div>
          <button onClick={() => setExpanded(true)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            {t('onb.showAgain')}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-blue-500/20 bg-[#0a0f1e]/80 overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
            <Sparkles size={13} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{t('onb.gettingStarted')}</h3>
            <p className="text-[10px] text-slate-500">{doneCount}/{STEPS.length} {t('onb.finished')}</p>
          </div>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="p-1 text-slate-500 hover:text-slate-300 transition-colors">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-3 space-y-1">
              {STEPS.map((step, i) => {
                const done = step.check(profile, myProjects);
                const Icon = STEP_ICONS[i];
                return (
                  <Link
                    key={step.id}
                    to={step.to}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/[0.04] transition-all group ${done ? 'opacity-50' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-500/15 border border-green-500/25' : 'bg-white/[0.04] border border-white/[0.08]'}`}>
                      {done ? (
                        <CheckCircle size={14} className="text-green-400" />
                      ) : (
                        <Icon size={14} className="text-slate-500" />
                      )}
                    </div>
                    <span className={`text-xs flex-1 font-medium ${done ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                      {t(step.labelKey)}
                    </span>
                    {!done && <ArrowRight size={12} className="text-slate-700 group-hover:text-blue-400 transition-colors flex-shrink-0" />}
                  </Link>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="px-5 pb-4">
              <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-green-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${(doneCount / STEPS.length) * 100}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
