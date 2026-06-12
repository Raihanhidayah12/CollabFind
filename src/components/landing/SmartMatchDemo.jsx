import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';

const FAKE_MATCHES = [
  { title: 'AI Study Assistant',    skills: ['React', 'FastAPI'],         match: 98, color: '#8B5CF6' },
  { title: 'Food Delivery App',     skills: ['React Native', 'Node.js'],  match: 87, color: '#F97316' },
  { title: 'Open Source CLI Toolkit', skills: ['TypeScript', 'Node.js'], match: 79, color: '#94A3B8' },
];

function ScanAnimation({ onDone, userSkills, recommendations, displayName, onClose, t }) {
  const [mode, setMode]       = useState('dummy');
  const [step, setStep]       = useState(0);
  const [showResult, setShowResult] = useState(false);

  const SCAN_STEPS = [
    { label: t('smartDemo.scan1'), delay: 0 },
    { label: t('smartDemo.scan2'), delay: 1.2 },
    { label: t('smartDemo.scan3'), delay: 2.4 },
  ];

  const isLoggedIn = !!userSkills;
  const isReal = mode === 'real';

  const displaySkills = isReal && userSkills?.length > 0 ? userSkills : ['React', 'TypeScript', 'Node.js', 'Figma'];
  const displayMatches = isReal && recommendations?.length > 0 ? recommendations.map(r => ({
    title: r.title,
    skills: r.skills_needed || [],
    match: r.matchScore || Math.floor(Math.random() * 20 + 80),
    color: r.accent_color || '#8B5CF6'
  })).slice(0, 3) : FAKE_MATCHES;

  const initial = isReal && displayName ? displayName[0].toUpperCase() : 'U';

  useEffect(() => {
    let timeouts = [];
    setStep(0);
    setShowResult(false);

    SCAN_STEPS.forEach((s, i) => {
      const t1 = setTimeout(() => {
        setStep(i + 1);
        if (i === SCAN_STEPS.length - 1) {
          const t2 = setTimeout(() => setShowResult(true), 800);
          timeouts.push(t2);
        }
      }, s.delay * 1000 + 400);
      timeouts.push(t1);
    });

    return () => timeouts.forEach(clearTimeout);
  }, [mode]);

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Profile card being scanned */}
      <div className="relative w-full max-w-xs">
        <div className="p-4 rounded-2xl border border-white/[0.1] bg-white/[0.04] text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 mx-auto mb-3 flex items-center justify-center text-lg font-bold text-white">
            {initial}
          </div>
          <div className="text-sm font-semibold text-white mb-1">{isReal ? t('smartDemo.yourProfile') : t('smartDemo.demoProfile')}</div>
          <div className="flex flex-wrap justify-center gap-1.5">
            {displaySkills.slice(0, 5).map(s => (
              <span key={s} className="px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/30 text-xs text-blue-300">{s}</span>
            ))}
          </div>
        </div>

        {/* Scanning beam */}
        {step > 0 && !showResult && (
          <motion.div
            className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
            initial={{ top: 0, opacity: 0 }}
            animate={{ top: ['0%', '100%', '0%'], opacity: [0, 1, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </div>

      {/* Steps */}
      <div className="w-full max-w-xs space-y-2">
        {SCAN_STEPS.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={step > i ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 text-xs text-slate-400"
          >
            {step > i ? (
              <CheckCircle size={13} className="text-green-400 flex-shrink-0" />
            ) : (
              <div className="w-3 h-3 rounded-full border border-slate-600 flex-shrink-0" />
            )}
            {s.label}
          </motion.div>
        ))}
      </div>

      {/* Results */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xs space-y-2"
          >
            <div className="text-center mb-3">
              <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
                style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                {displayMatches.length} {t('smartDemo.projectsFound')}
              </span>
            </div>
            {displayMatches.map((m, i) => (
              <motion.div
                key={m.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
                className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.07] bg-white/[0.04]"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${m.color}22`, border: `1px solid ${m.color}44` }}>
                  <Sparkles size={14} style={{ color: m.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{m.title}</div>
                  <div className="text-[10px] text-slate-500 truncate">{m.skills.join(', ')}</div>
                </div>
                <div className="text-sm font-extrabold flex-shrink-0"
                  style={{ color: m.match >= 90 ? '#00FFC2' : m.match >= 80 ? '#F59E0B' : '#94A3B8' }}>
                  {m.match}%
                </div>
              </motion.div>
            ))}

            {isReal ? (
              <button
                onClick={() => {
                  onClose();
                  const el = document.getElementById('recommendations');
                  if (el) {
                    const y = el.getBoundingClientRect().top + window.scrollY - 80;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                  }
                }}
                className="flex items-center justify-center gap-2 w-full mt-4 py-3 rounded-xl text-sm font-bold text-white transition-all"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                  boxShadow: '0 0 24px rgba(59,130,246,0.4)',
                }}
              >
                <Sparkles size={14} />
                {t('smartDemo.closeSeeResults')}
                <ArrowRight size={14} />
              </button>
            ) : isLoggedIn ? (
              <button
                onClick={() => setMode('real')}
                className="flex items-center justify-center gap-2 w-full mt-4 py-3 rounded-xl text-sm font-bold text-white transition-all"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                  boxShadow: '0 0 24px rgba(59,130,246,0.4)',
                }}
              >
                <Sparkles size={14} />
                {t('smartDemo.tryWithAccount')}
                <ArrowRight size={14} />
              </button>
            ) : (
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 w-full mt-4 py-3 rounded-xl text-sm font-bold text-white transition-all"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                  boxShadow: '0 0 24px rgba(59,130,246,0.4)',
                }}
              >
                <Sparkles size={14} />
                {t('smartDemo.registerTry')}
                <ArrowRight size={14} />
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {step > 0 && !showResult && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="w-3 h-3 border border-blue-500/40 border-t-blue-400 rounded-full animate-spin" />
          {t('smartDemo.analyzing')}
        </div>
      )}
    </div>
  );
}

export default function SmartMatchDemo({ onClose, userSkills, recommendations, displayName }) {
  const { t } = useLanguage();
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        style={{ background: 'rgba(5,8,22,0.85)', backdropFilter: 'blur(12px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-sm rounded-2xl border border-white/[0.1] bg-[#0a0f1e]/95 backdrop-blur-xl p-6 shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
          onClick={e => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/[0.07] transition-all"
          >
            <X size={16} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
              <Sparkles size={18} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                Smart Project Matching
              </h3>
              <p className="text-xs text-slate-500">{t('smartDemo.subtitle')}</p>
            </div>
          </div>

          <ScanAnimation
            onClose={onClose}
            userSkills={userSkills}
            recommendations={recommendations}
            displayName={displayName}
            t={t}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
