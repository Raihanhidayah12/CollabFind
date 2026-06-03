import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Zap, Users, ArrowRight, MessageSquare, MousePointer2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SkillBasedDemo({ onClose, isLoggedIn = false }) {
  const [step, setStep] = useState(0);
  const [activeTab, setActiveTab] = useState('projects');

  useEffect(() => {
    let timeouts = [];
    
    // Step 0: Start on Projects tab, wait a bit
    timeouts.push(setTimeout(() => setStep(1), 1000));
    
    // Step 1: Scan project card & show badge
    timeouts.push(setTimeout(() => setStep(2), 2500));
    
    // Step 2: Cursor moves to Teammates tab and clicks
    timeouts.push(setTimeout(() => {
      setActiveTab('teammates');
      setStep(3);
    }, 4500));
    
    // Step 3: Scan teammate card & show badge
    timeouts.push(setTimeout(() => setStep(4), 6000));

    // Step 4: Cursor moves to Invite button and clicks
    timeouts.push(setTimeout(() => setStep(5), 7500));

    // Step 5: Show completion & CTA
    timeouts.push(setTimeout(() => setStep(6), 9000));

    return () => timeouts.forEach(clearTimeout);
  }, []);

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
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-4xl rounded-2xl border border-white/[0.1] bg-[#0a0f1e]/95 backdrop-blur-xl p-6 shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6 border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                <Sparkles size={18} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                  Demo: Rekomendasi Pintar
                </h3>
                <p className="text-xs text-slate-500">Melihat fitur asli dari sudut pandang Dashboard</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-white rounded-lg hover:bg-white/[0.07] transition-all"
            >
              <X size={16} />
            </button>
          </div>

          {/* Simulated Dashboard UI */}
          <div className="relative rounded-xl border border-white/[0.08] bg-[#050816] p-6 overflow-hidden min-h-[360px]">
            
            {/* Fake Cursor Animation */}
            {step >= 2 && step < 6 && (
              <motion.div
                initial={{ x: 50, y: 200, opacity: 0 }}
                animate={
                  step === 2 ? { x: 340, y: -45, opacity: 1 } : // Move to Teammate tab
                  step === 3 ? { x: 340, y: -45, opacity: 1, scale: 0.9 } : // Click tab
                  step === 4 ? { x: 120, y: 240, opacity: 1 } : // Move to Invite button
                  step === 5 ? { x: 120, y: 240, opacity: 1, scale: 0.9 } : // Click Invite
                  { opacity: 0 }
                }
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute z-[100] pointer-events-none text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
              >
                <MousePointer2 size={24} className="fill-white stroke-black stroke-2" />
              </motion.div>
            )}

            {/* Dashboard Component Replica */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-medium mb-2">
                  <Sparkles size={11} /> Smart Match
                </div>
                <h2 className="text-xl font-extrabold text-white" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>
                  Rekomendasi Pintar
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Keahlianmu: <span className="text-blue-400">React, Tailwind CSS</span>
                </p>
              </div>
              
              <div className="flex bg-[#0a0f1e] rounded-xl border border-white/[0.08] p-1 self-start relative">
                {step === 3 && (
                  <motion.div 
                    initial={{ scale: 1, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    className="absolute inset-0 right-0 left-1/2 bg-purple-400/30 rounded-lg pointer-events-none"
                    transition={{ duration: 0.4 }}
                  />
                )}
                <button
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'projects' ? 'bg-blue-500/20 text-blue-400 shadow-sm' : 'text-slate-400'}`}
                >
                  Rekomendasi Proyek
                </button>
                <button
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'teammates' ? 'bg-purple-500/20 text-purple-400 shadow-sm' : 'text-slate-400'}`}
                >
                  Rekomendasi Rekan Tim
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
              {/* Project Card */}
              <AnimatePresence mode="wait">
                {activeTab === 'projects' && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="group relative flex flex-col p-5 rounded-2xl border border-blue-500/30 bg-blue-500/10 transition-all overflow-hidden"
                  >
                    {/* Scanner line */}
                    {step === 1 && (
                      <motion.div
                        className="absolute inset-0 border-t-2 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.8)] z-20 pointer-events-none"
                        initial={{ top: '0%' }}
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 1.2, ease: "linear" }}
                      />
                    )}

                    {/* Match badge */}
                    {step >= 2 && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-4 right-4 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border"
                        style={{ color: '#00FFC2', background: `#00FFC215`, borderColor: `#00FFC240` }}>
                        ✦ 95% Match
                      </motion.div>
                    )}

                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-500/20 border border-blue-500/40">
                        <Zap size={17} className="text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0 pr-14">
                        <p className="text-sm font-bold text-white">HydroGrow App</p>
                        <p className="text-xs text-slate-500">2 slots</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed flex-1">
                      Membangun aplikasi penyiraman tanaman otomatis berbasis IoT.
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      <span className="px-1.5 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.07] text-[10px] text-slate-400">React</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.07] text-[10px] text-slate-400">Tailwind</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white border border-white/[0.08] bg-white/[0.04]">
                      Lihat Proyek <ArrowRight size={12} />
                    </div>
                  </motion.div>
                )}

                {/* Teammate Card */}
                {activeTab === 'teammates' && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="group relative flex flex-col p-5 rounded-2xl border border-purple-500/30 bg-purple-500/10 transition-all overflow-hidden"
                  >
                    {/* Scanner line */}
                    {step === 4 && (
                      <motion.div
                        className="absolute inset-0 border-t-2 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.8)] z-20 pointer-events-none"
                        initial={{ top: '0%' }}
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 1.2, ease: "linear" }}
                      />
                    )}

                    {/* Match badge */}
                    {step >= 5 && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-4 right-4 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border"
                        style={{ color: '#00FFC2', background: `#00FFC215`, borderColor: `#00FFC240` }}>
                        ✦ 100% Match
                      </motion.div>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white bg-yellow-500/20 border border-yellow-500/40">
                        D
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Dimas UI/UX</p>
                        <p className="text-xs text-slate-500">Product Designer</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-4 flex-1">
                      <span className="px-1.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-300">Figma</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-300">UI/UX</span>
                    </div>

                    <div className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white transition-all ${step >= 6 ? 'bg-emerald-500/80' : 'bg-gradient-to-r from-blue-500/80 to-purple-600/80'}`}>
                      {step >= 6 ? <Sparkles size={12} /> : <MessageSquare size={12} />}
                      {step >= 6 ? 'Undangan Terkirim!' : 'Invite to Project'}
                    </div>

                    {step === 6 && (
                      <motion.div 
                        initial={{ scale: 1, opacity: 0 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        className="absolute bottom-4 left-4 right-4 h-10 bg-emerald-400/40 rounded-xl pointer-events-none"
                        transition={{ duration: 0.4 }}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Status Steps Tracker (Bottom) */}
            <AnimatePresence mode="wait">
              {step < 6 && (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm font-bold flex items-center justify-center w-max gap-2 text-white z-20 bg-blue-500/20 px-4 py-2 rounded-full border border-blue-500/40 backdrop-blur-md"
                >
                  {step <= 1 && 'Memindai profilmu untuk mencari Proyek...'}
                  {step === 2 && 'Proyek ditemukan! Pindah ke Tab Rekan Tim...'}
                  {step === 3 && 'Mengklik Tab Rekomendasi Rekan Tim...'}
                  {step === 4 && 'Memindai proyekmu untuk mencari Talenta...'}
                  {step === 5 && 'Kirim undangan langsung ke obrolan mereka!'}
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* CTA */}
          {step >= 6 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <div className="text-center text-sm text-slate-400 mb-4">
                Sistem tidak hanya membantu kamu mencari pekerjaan, tetapi juga membantu proyekmu menemukan orang yang tepat.
              </div>
              {isLoggedIn ? (
                <Link
                  to="/dashboard"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white transition-all bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 shadow-[0_0_24px_rgba(168,85,247,0.35)]"
                >
                  <Zap size={14} />
                  Lihat Rekomendasimu di Dashboard
                  <ArrowRight size={14} />
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white transition-all bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 shadow-[0_0_24px_rgba(168,85,247,0.35)]"
                >
                  <Zap size={14} />
                  Daftar Sekarang untuk Mencoba
                  <ArrowRight size={14} />
                </Link>
              )}
            </motion.div>
          )}

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
