import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

function buildTourSteps(t) {
  return [
    { id: 1, target: '#home', title: t('gt.welcomeTitle'), description: t('gt.welcomeDesc') },
    { id: 2, target: '#how-it-works', title: t('gt.howItWorksTitle'), description: t('gt.howItWorksDesc') },
    { id: 3, target: '.featured-projects', title: t('gt.exploreTitle'), description: t('gt.exploreDesc') },
    { id: 4, target: '.kanban-section', title: t('gt.kanbanTitle'), description: t('gt.kanbanDesc') },
    { id: 5, target: '.features-section', title: t('gt.featuresTitle'), description: t('gt.featuresDesc') },
    { id: 6, target: '.freelance-section', title: t('gt.freelanceTitle'), description: t('gt.freelanceDesc') },
    { id: 7, target: '.comparison-section', title: t('gt.comparisonTitle'), description: t('gt.comparisonDesc') },
    { id: 8, target: '.role-matcher-section', title: t('gt.roleMatcherTitle'), description: t('gt.roleMatcherDesc') },
    { id: 9, target: '.testimonials-section', title: t('gt.testimonialsTitle'), description: t('gt.testimonialsDesc') },
    { id: 10, target: '.cta-section', title: t('gt.ctaTitle'), description: t('gt.ctaDesc'), isLast: true },
  ];
}

export default function GuidedTour({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const tourSteps = buildTourSteps(t);
  const currentTour = tourSteps[currentStep];

  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTargetRect(null);
      return;
    }

    // Small delay to ensure DOM and step change are ready
    const timer = setTimeout(() => {
      const element = document.querySelector(currentTour.target);

      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });

        // Scroll to element
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      } else {
        // Fallback: Still show tooltip, just in center
        setTargetRect({
          top: window.innerHeight / 2,
          left: window.innerWidth / 2,
          width: 150,
          height: 150,
        });
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [isOpen, currentStep, currentTour.target]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <AnimatePresence mode="wait">
        {/* Dark overlay */}
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 z-40 pointer-events-auto"
        />

        {/* Highlight box if element found */}
        {targetRect && targetRect.width > 50 && (
          <motion.div
            key="highlight"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed border-2 border-blue-400 rounded-lg pointer-events-none z-40"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 30px rgba(59, 130, 246, 0.6)',
            }}
          />
        )}

        {/* Tooltip - ALWAYS CENTER */}
        {targetRect && (
          <motion.div
            key={`tooltip-${currentStep}`}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed z-50 pointer-events-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-blue-500/40 rounded-2xl shadow-2xl p-8 w-96 relative backdrop-blur-xl">
              {/* Glow background */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-cyan-600/5 pointer-events-none" />

              {/* Arrow indicator */}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-blue-500/60" />

              <div className="relative z-10">
                {/* Badge step */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-semibold mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  {t('gt.stepOf', `Step ${currentStep + 1} of ${tourSteps.length}`)}
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-200 via-blue-100 to-cyan-200 bg-clip-text text-transparent mb-3">
                  {currentTour.title}
                </h2>

                {/* Description */}
                <p className="text-slate-300 text-base mb-8 leading-relaxed">
                  {currentTour.description}
                </p>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-8">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400"
                    initial={{ width: '0%' }}
                    animate={{
                      width: `${((currentStep + 1) / tourSteps.length) * 100}%`,
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    className="px-5 py-3 rounded-lg border border-slate-600/50 text-slate-400 font-semibold hover:text-white hover:border-slate-500 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {t('gt.prev')}
                  </button>

                  {currentTour.isLast ? (
                    <button
                      onClick={() => {
                        onClose();
                        navigate('/register');
                      }}
                      className="flex-1 px-5 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-semibold shadow-lg hover:shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-200"
                    >
                      {t('gt.getStart')}
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentStep(currentStep + 1)}
                      className="flex-1 px-5 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-semibold shadow-lg hover:shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-200"
                    >
                      {t('gt.next')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
