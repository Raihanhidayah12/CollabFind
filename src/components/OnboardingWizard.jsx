import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Sparkles, X, User, Briefcase, Camera, Code, Rocket, Search, Plus, FolderOpen, Compass } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useLanguage } from '../i18n/LanguageContext';

const POPULAR_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue', 'Angular',
  'Node.js', 'Python', 'Go', 'Rust', 'Java', 'C++',
  'Figma', 'UI/UX', 'Tailwind CSS', 'PostgreSQL', 'MongoDB', 'Docker',
  'AWS', 'Firebase', 'Flutter', 'React Native', 'Swift', 'Kotlin',
];

const INTENT_OPTIONS = [
  {
    id: 'create',
    icon: FolderOpen,
    color: '#3B82F6',
  },
  {
    id: 'join',
    icon: Compass,
    color: '#8B5CF6',
  },
  {
    id: 'explore',
    icon: Search,
    color: '#10B981',
  },
];

export default function OnboardingWizard({ profile, onComplete }) {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    job_title: profile?.job_title || '',
    avatar_url: profile?.avatar_url || '',
    skills: Array.isArray(profile?.skills) ? profile.skills : [],
  });
  const [customSkill, setCustomSkill] = useState('');
  const [selectedIntent, setSelectedIntent] = useState(null);

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        name: prev.name || profile.name || '',
        job_title: prev.job_title || profile.job_title || '',
        avatar_url: prev.avatar_url || profile.avatar_url || '',
        skills: prev.skills.length > 0 ? prev.skills : (Array.isArray(profile.skills) ? profile.skills : []),
      }));
    }
  }, [profile]);

  const saveProfile = useCallback(async (updates) => {
    if (!profile?.id) return;
    setSaving(true);
    try {
      await supabase.from('profiles').update({
        id: profile.id,
        ...updates,
      }).eq('id', profile.id);
    } catch {
      // Column may not exist yet — silently skip
    }
    setSaving(false);
  }, [profile?.id]);

  const handleSkip = async () => {
    await saveProfile({ onboarding_completed: true });
    onComplete();
  };

  const handleNext = async () => {
    if (step === 1) {
      await saveProfile({
        name: formData.name || null,
        job_title: formData.job_title || null,
        avatar_url: formData.avatar_url?.trim() || null,
      });
    }
    if (step === 2) {
      await saveProfile({
        skills: formData.skills.length > 0 ? formData.skills : null,
      });
    }
    if (step === 3) {
      await saveProfile({ onboarding_completed: true });
      onComplete(selectedIntent);
      return;
    }
    setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => s - 1);

  const toggleSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
    }
    setCustomSkill('');
  };

  const removeSkill = (skill) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-[#050816]/90 backdrop-blur-md" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-lg rounded-3xl border border-white/[0.1] bg-[#0a0f1e] shadow-[0_24px_80px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        {/* Top progress bar */}
        <div className="h-1 w-full bg-white/[0.05]">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: '0%' }}
            animate={{ width: `${((step + 1) / 4) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Skip + Close */}
        <div className="flex items-center justify-between px-6 pt-4">
          <span className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">
            {step + 1}/4
          </span>
          <button
            onClick={handleSkip}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
          >
            {t('onb.skipForNow')} <X size={12} />
          </button>
        </div>

        <div className="px-6 pb-6 pt-2 min-h-[380px] flex flex-col">
          <AnimatePresence mode="wait">

            {/* ── STEP 0: Welcome ────────────────────────────── */}
            {step === 0 && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="flex-1 flex flex-col items-center justify-center text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(59,130,246,0.3)]"
                >
                  <Sparkles size={28} className="text-white" />
                </motion.div>

                <h2 className="text-2xl font-extrabold text-white mb-3" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                  {t('onb.welcomeTitle')}
                </h2>
                <p className="text-sm text-slate-400 max-w-sm mb-8 leading-relaxed">
                  {t('onb.welcomeSubtitle')}
                </p>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5"><User size={12} /> {t('onb.stepProfile')}</div>
                  <div className="w-1 h-1 rounded-full bg-slate-700" />
                  <div className="flex items-center gap-1.5"><Code size={12} /> {t('onb.stepSkills')}</div>
                  <div className="w-1 h-1 rounded-full bg-slate-700" />
                  <div className="flex items-center gap-1.5"><Rocket size={12} /> {t('onb.stepIntent')}</div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 1: Profile Basics ──────────────────────── */}
            {step === 1 && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="flex-1 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
                    <Camera size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{t('onb.stepProfile')}</h2>
                    <p className="text-xs text-slate-500">{t('onb.profileDesc')}</p>
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('auth.fullName')}</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:outline-none transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('onb.jobTitle')}</label>
                    <div className="relative">
                      <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                      <input
                        type="text"
                        value={formData.job_title}
                        onChange={e => setFormData(p => ({ ...p, job_title: e.target.value }))}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:outline-none transition-colors"
                        placeholder="Full-Stack Developer"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('onb.avatarUrl')}</label>
                    <input
                      type="url"
                      value={formData.avatar_url}
                      onChange={e => setFormData(p => ({ ...p, avatar_url: e.target.value }))}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:outline-none transition-colors"
                      placeholder="https://github.com/your-avatar.jpg"
                    />
                    {formData.avatar_url && (
                      <div className="mt-2 flex items-center gap-2">
                        <img src={formData.avatar_url} alt="" className="w-8 h-8 rounded-lg object-cover border border-white/[0.1]" onError={e => e.currentTarget.style.display = 'none'} />
                        <span className="text-xs text-slate-500">{t('onb.preview')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Skills ────────────────────────────────── */}
            {step === 2 && (
              <motion.div
                key="skills"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="flex-1 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
                    <Code size={18} className="text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{t('onb.stepSkills')}</h2>
                    <p className="text-xs text-slate-500">{t('onb.skillsDesc')}</p>
                  </div>
                </div>

                {/* Selected skills */}
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {formData.skills.map(sk => (
                      <span key={sk} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/15 border border-blue-500/25 text-xs text-blue-300 font-medium">
                        {sk}
                        <button onClick={() => removeSkill(sk)} className="text-blue-400 hover:text-white transition-colors">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Custom skill input */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={customSkill}
                    onChange={e => setCustomSkill(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomSkill(); } }}
                    className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:border-purple-500/50 focus:outline-none transition-colors"
                    placeholder={t('onb.addSkill')}
                  />
                  <button
                    onClick={addCustomSkill}
                    disabled={!customSkill.trim()}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-white bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 transition-all disabled:opacity-30"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Popular skills grid */}
                <div className="flex-1 overflow-y-auto max-h-[180px]">
                  <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-2">{t('onb.popularSkills')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_SKILLS.filter(sk => !formData.skills.includes(sk)).map(sk => (
                      <button
                        key={sk}
                        onClick={() => toggleSkill(sk)}
                        className="px-2.5 py-1.5 rounded-lg text-xs text-slate-400 border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:text-white hover:border-white/[0.12] transition-all"
                      >
                        {sk}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Intent ────────────────────────────────── */}
            {step === 3 && (
              <motion.div
                key="intent"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="flex-1 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                    <Rocket size={18} className="text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{t('onb.stepIntent')}</h2>
                    <p className="text-xs text-slate-500">{t('onb.intentDesc')}</p>
                  </div>
                </div>

                <div className="space-y-3 flex-1">
                  {INTENT_OPTIONS.map(opt => {
                    const Icon = opt.icon;
                    const selected = selectedIntent === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedIntent(opt.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                          selected
                            ? 'border-blue-500/40 bg-blue-500/10'
                            : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]'
                        }`}
                      >
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `${opt.color}18`, border: `1px solid ${opt.color}33` }}
                        >
                          <Icon size={20} style={{ color: opt.color }} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{t(`onb.intent.${opt.id}`)}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{t(`onb.intent.${opt.id}Desc`)}</p>
                        </div>
                        {selected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-auto w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </motion.div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.06]">
            {step > 0 ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white border border-white/[0.08] hover:bg-white/[0.05] transition-all"
              >
                <ArrowLeft size={13} /> {t('common.back')}
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={handleNext}
              disabled={saving || (step === 3 && !selectedIntent)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-40"
            >
              {step === 3
                ? <>{t('onb.finish')}</>
                : <>{t('onb.continue')} <ArrowRight size={13} /></>
              }
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
