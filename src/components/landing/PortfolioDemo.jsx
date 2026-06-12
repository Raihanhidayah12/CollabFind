import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Code2, Sparkles, Layout, CheckCircle, TrendingUp, ChevronRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';

export default function PortfolioDemo({ onClose, isLoggedIn = false }) {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  const DEMO_STEPS = [
    { id: 0, text: t('portDemo.step0'), icon: Code2, color: "text-blue-400" },
    { id: 1, text: t('portDemo.step1'), icon: Sparkles, color: "text-purple-400" },
    { id: 2, text: t('portDemo.step2'), icon: Layout, color: "text-cyan-400" },
    { id: 3, text: t('portDemo.step3'), icon: CheckCircle, color: "text-emerald-400" },
  ];

  useEffect(() => {
    if (!autoplay) return;
    const timers = [];
    
    // Sequence timing
    timers.push(setTimeout(() => setStep(1), 1500));
    timers.push(setTimeout(() => setStep(2), 3000));
    timers.push(setTimeout(() => setStep(3), 4500));

    return () => timers.forEach(clearTimeout);
  }, [autoplay]);

  function handleReplay() {
    setStep(0);
    setAutoplay(false);
    setTimeout(() => setAutoplay(true), 50);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        style={{ background: 'rgba(5,8,22,0.88)', backdropFilter: 'blur(14px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 24 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-2xl rounded-2xl border border-white/[0.1] bg-[#0a0f1e]/95 backdrop-blur-xl p-6 shadow-[0_32px_80px_rgba(0,0,0,0.7)] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/[0.07] transition-all z-10"
          >
            <X size={16} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
              <Sparkles size={18} className="text-purple-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                Portfolio Generator
              </h3>
              <p className="text-xs text-slate-500">{t('portDemo.subtitle')}</p>
            </div>
            <button
              onClick={handleReplay}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/[0.09] bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all"
            >
              <TrendingUp size={11} /> {t('portDemo.replay')}
            </button>
          </div>

          {/* Main Visual Area */}
          <div className="relative h-[320px] rounded-xl border border-white/[0.05] bg-[#050816] overflow-hidden flex flex-col items-center justify-center">
            
            {/* Status Steps Tracker */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
              {DEMO_STEPS.map((s, i) => (
                <div key={s.id} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ 
                      scale: step >= i ? 1 : 0.8, 
                      opacity: step >= i ? 1 : 0.2,
                      backgroundColor: step >= i ? (i === 3 ? '#10B981' : '#3B82F6') : 'rgba(255,255,255,0.1)'
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                  >
                    <s.icon size={14} className="text-white" />
                  </motion.div>
                  {i < DEMO_STEPS.length - 1 && (
                    <div className="hidden sm:block absolute top-4 w-full border-t-2 border-white/5 -z-10" 
                         style={{ transform: 'translateX(50%)', width: 'calc(100% - 2rem)' }}>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: step > i ? '100%' : '0%' }}
                        className="border-t-2 border-blue-500"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Current Status Text */}
            <AnimatePresence mode="wait">
              {step < 3 && (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mt-16 text-sm font-semibold flex items-center gap-2 ${DEMO_STEPS[step].color}`}
                >
                  {(() => {
                    const CurrentIcon = DEMO_STEPS[step].icon;
                    return <CurrentIcon size={16} />;
                  })()}
                  {DEMO_STEPS[step].text}
                  <div className="w-4 flex justify-start"><span className="animate-pulse">...</span></div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Simulated UI Assembly */}
            <div className="relative w-full h-full flex items-center justify-center mt-8">
              
              {/* Skeleton parts flying in */}
              <AnimatePresence>
                {step === 0 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute w-48 p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col gap-2"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-600 animate-pulse mx-auto mb-2" />
                    <div className="h-3 w-3/4 bg-slate-600 rounded mx-auto" />
                    <div className="h-2 w-1/2 bg-slate-700 rounded mx-auto" />
                  </motion.div>
                )}
                
                {step === 1 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="absolute w-64 p-4 rounded-xl border border-blue-500/30 bg-blue-500/10 flex flex-wrap gap-2 justify-center"
                  >
                    {['React', 'Node.js', 'UI/UX', 'Framer'].map((skill, idx) => (
                      <motion.span 
                        key={skill}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="px-2 py-1 text-[10px] rounded bg-blue-500/20 text-blue-300"
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </motion.div>
                )}

                {/* Final Rendered Portfolio */}
                {step >= 2 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 40, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', damping: 20 }}
                    className="absolute w-full max-w-sm bg-[#0f152b] border border-white/10 rounded-xl overflow-hidden shadow-2xl"
                  >
                    <div className="h-24 bg-gradient-to-r from-blue-600 to-purple-600 relative">
                      <div className="absolute -bottom-8 left-6 w-16 h-16 rounded-full border-4 border-[#0f152b] bg-[#1a2342] flex items-center justify-center font-bold text-xl text-white">
                        HD
                      </div>
                    </div>
                    <div className="pt-10 pb-4 px-6">
                      <h4 className="text-white font-bold text-lg leading-none">Han Developer</h4>
                      <p className="text-slate-400 text-xs mt-1">Full-Stack Engineer</p>
                      
                      <div className="flex gap-2 mt-4">
                        <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 text-[9px] font-semibold">React</span>
                        <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 text-[9px] font-semibold">Node.js</span>
                      </div>
                      
                      <div className="mt-5 space-y-3">
                        <div className="p-3 rounded-lg border border-white/5 bg-white/[0.02]">
                          <div className="text-white text-xs font-semibold mb-1">E-Commerce Platform</div>
                          <div className="text-slate-400 text-[10px]">Built a scalable marketplace with Next.js and Supabase.</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Completion Overlay */}
            {step === 3 && (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="absolute inset-0 bg-gradient-to-t from-[#050816] via-transparent to-transparent pointer-events-none"
               />
            )}
          </div>

          {/* CTA */}
          {step === 3 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5"
            >
              {isLoggedIn ? (
                <Link
                  to="/dashboard/portfolio"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white transition-all bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-400 hover:to-blue-500 shadow-[0_0_24px_rgba(168,85,247,0.35)]"
                >
                  <Zap size={14} />
                  {t('portDemo.generateNow')}
                  <ChevronRight size={14} />
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white transition-all bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-400 hover:to-blue-500 shadow-[0_0_24px_rgba(168,85,247,0.35)]"
                >
                  <Zap size={14} />
                  {t('portDemo.joinToGenerate')}
                  <ChevronRight size={14} />
                </Link>
              )}
            </motion.div>
          )}

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
