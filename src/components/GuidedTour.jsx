import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const tourSteps = [
  {
    id: 1,
    target: '#hero-section',
    title: 'Selamat Datang di CollabFind! 👋',
    description: 'Platform untuk menemukan tim dan proyek kolaboratif yang sempurna.',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 2,
    target: '.featured-projects',
    title: 'Jelajahi 2,500+ Proyek Aktif 🚀',
    description: 'Temukan proyek menarik dari komunitas developer, designer, dan creator worldwide.',
    position: 'top',
    highlight: true,
  },
  {
    id: 3,
    target: '.collaborators-section',
    title: 'Temukan Tim Sempurna 👥',
    description: 'Terhubung dengan 15,000+ developer berbakat dengan keahlian yang sesuai dengan proyek Anda.',
    position: 'top',
    highlight: true,
  },
  {
    id: 4,
    target: '.categories-section',
    title: 'Filter Berdasarkan Kategori 🎯',
    description: 'Cari proyek berdasarkan teknologi, industri, atau level keahlian yang Anda inginkan.',
    position: 'top',
    highlight: true,
  },
  {
    id: 5,
    target: '.features-section',
    title: 'Fitur Powerful ⚡',
    description: 'Manajemen proyek, real-time chat, dan portfolio generator terintegrasi dalam satu platform.',
    position: 'top',
    highlight: true,
  },
  {
    id: 6,
    target: '.kanban-section',
    title: 'Kelola Tugas dengan Kanban Board 📊',
    description: 'Visualisasi progress proyek dengan drag-and-drop interface yang intuitif.',
    position: 'top',
    highlight: true,
  },
  {
    id: 7,
    target: '.testimonials-section',
    title: '7,000+ Kisah Sukses 🏆',
    description: 'Bergabunglah dengan komunitas yang telah menciptakan produk amazing bersama-sama.',
    position: 'top',
    highlight: true,
  },
  {
    id: 8,
    target: '.cta-section',
    title: 'Siap untuk Memulai? 🎉',
    description: 'Klik tombol di bawah untuk membuat akun dan mulai kolaborasi hari ini!',
    position: 'top',
    highlight: true,
    isLast: true,
  },
];

export default function GuidedTour({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const navigate = useNavigate();

  const currentTour = tourSteps[currentStep];

  useEffect(() => {
    if (!isOpen) return;

    // Add small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const updateTargetPosition = () => {
        if (currentTour?.target) {
          const element = document.querySelector(currentTour.target);
          if (element) {
            const rect = element.getBoundingClientRect();
            setTargetRect({
              top: rect.top + window.scrollY,
              left: rect.left + window.scrollX,
              width: rect.width,
              height: rect.height,
            });

            // Scroll element into view
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Calculate tooltip position
            const tooltipY =
              currentTour.position === 'bottom'
                ? rect.top + rect.height + window.scrollY + 20
                : rect.top + window.scrollY - 200;

            setTooltipPosition({
              top: tooltipY,
              left: rect.left + rect.width / 2 + window.scrollX,
            });
          } else {
            console.warn(`Tour target not found: ${currentTour.target}`);
          }
        }
      };

      updateTargetPosition();
      const resizeObserver = new ResizeObserver(updateTargetPosition);
      const element = document.querySelector(currentTour?.target);
      if (element) resizeObserver.observe(element);

      return () => resizeObserver.disconnect();
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen, currentTour, currentStep]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStartCollaborating = () => {
    onClose();
    navigate('/register');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay with highlight */}
          <div className="fixed inset-0 z-40 pointer-events-auto">
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/70 pointer-events-none" />

            {/* Highlight box */}
            {targetRect && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute border-2 border-blue-400 rounded-lg pointer-events-none"
                style={{
                  top: targetRect.top - 10,
                  left: targetRect.left - 10,
                  width: targetRect.width + 20,
                  height: targetRect.height + 20,
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
                }}
              />
            )}
          </div>

          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed z-50 pointer-events-auto"
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="bg-slate-900 border border-blue-500/50 rounded-xl shadow-2xl p-6 max-w-sm backdrop-blur-sm">
              {/* Arrow */}
              <div
                className={`absolute w-3 h-3 bg-slate-900 border-t border-l border-blue-500/50 rotate-45 -z-10 ${
                  currentTour.position === 'bottom' ? '-top-1.5' : '-bottom-1.5'
                }`}
                style={{ left: 'calc(50% - 6px)' }}
              />

              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-white">{currentTour.title}</h3>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-white/10 rounded transition-colors text-slate-400"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Description */}
              <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                {currentTour.description}
              </p>

              {/* Progress */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    initial={{ width: '0%' }}
                    animate={{
                      width: `${((currentStep + 1) / tourSteps.length) * 100}%`,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className="text-xs text-slate-400">
                  {currentStep + 1}/{tourSteps.length}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-slate-600 text-slate-400 hover:text-slate-300 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                  Sebelumnya
                </button>

                {currentTour.isLast ? (
                  <button
                    onClick={handleStartCollaborating}
                    className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-400 hover:to-purple-500 transition-all shadow-lg hover:shadow-xl"
                  >
                    Mulai Berkolaborasi →
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-400 hover:to-purple-500 transition-all"
                  >
                    Selanjutnya
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
