import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  X, FolderOpen, BookOpen, LayoutDashboard,
  Upload, FileText, CheckSquare, ArrowRight, Users,
} from 'lucide-react';

const PREVIEW_SLIDES = [
  {
    id: 'files',
    icon: FolderOpen,
    color: '#8B5CF6',
    label: 'File Storage',
    title: 'Semua aset proyek di satu tempat',
    desc: 'Upload dan bagikan mockup desain, dokumen riset, file kode, dan aset lainnya. Semua tersimpan aman dan bisa diakses kapan saja oleh seluruh tim.',
    preview: (
      <div className="flex flex-col gap-2">
        {[
          { name: 'design-mockup.fig', size: '2.4 MB', type: 'fig', color: '#8B5CF6' },
          { name: 'api-docs.pdf',       size: '845 KB', type: 'pdf', color: '#10B981' },
          { name: 'assets.zip',         size: '12.1 MB', type: 'zip', color: '#F59E0B' },
        ].map((f) => (
          <div key={f.name} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.07] bg-white/[0.03]">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}>
              <FolderOpen size={14} style={{ color: f.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{f.name}</p>
              <p className="text-[10px] text-slate-500">{f.size}</p>
            </div>
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Upload size={10} className="text-blue-400" />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'wiki',
    icon: BookOpen,
    color: '#06B6D4',
    label: 'Wiki',
    title: 'Dokumentasi tim yang rapi',
    desc: 'Tulis code guidelines, jobdesk, rangkuman meeting, dan ide startup di halaman Wiki. Seperti Notion mini yang terintegrasi langsung dengan proyekmu.',
    preview: (
      <div className="flex gap-3 h-[140px]">
        {/* Sidebar */}
        <div className="w-28 flex flex-col gap-1">
          {['Code Guide', 'Jobdesk', 'Meeting Notes', 'Ideas'].map((p) => (
            <div key={p} className={`px-2 py-1.5 rounded-lg text-[10px] truncate ${
              p === 'Code Guide' ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300' : 'text-slate-500'
            }`}>
              {p}
            </div>
          ))}
        </div>
        {/* Content */}
        <div className="flex-1 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 overflow-hidden">
          <p className="text-xs font-bold text-white mb-2">Code Guidelines</p>
          <div className="flex flex-col gap-1">
            {['• Gunakan camelCase untuk variabel', '• Setiap fungsi wajib punya komentar', '• PR harus di-review minimal 1 orang'].map((l) => (
              <p key={l} className="text-[10px] text-slate-500 leading-relaxed">{l}</p>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'boards',
    icon: LayoutDashboard,
    color: '#10B981',
    label: 'Project Boards',
    title: 'Kanban board untuk progres tim',
    desc: 'Buat dan atur kartu tugas di papan Kanban dengan kolom To-Do, In Progress, dan Done. Tetapkan deadline dan assignee agar semua tahu tanggung jawabnya.',
    preview: (
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'To-Do', color: '#94A3B8', tasks: ['Setup Supabase', 'Desain Logo'] },
          { label: 'In Progress', color: '#3B82F6', tasks: ['Landing Page'] },
          { label: 'Done', color: '#10B981', tasks: ['Init Project', 'ERD Database'] },
        ].map((col) => (
          <div key={col.label} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: col.color }} />
              <p className="text-[10px] font-bold text-slate-400">{col.label}</p>
              <span className="text-[9px] text-slate-600">{col.tasks.length}</span>
            </div>
            {col.tasks.map((t) => (
              <div key={t} className="px-2 py-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03]">
                <p className="text-[10px] text-slate-300">{t}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    ),
  },
];

export default function WorkspacePreviewModal({ onClose, isLoggedIn = false, firstWorkspaceId = null }) {
  const navigate      = useNavigate();
  const [slide, setSlide] = useState(0);

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      setSlide((s) => (s + 1) % PREVIEW_SLIDES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const current = PREVIEW_SLIDES[slide];
  const SlideIcon = current.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg rounded-2xl border border-white/[0.1] overflow-hidden"
          style={{
            background: 'rgba(8,9,18,0.95)',
            backdropFilter: 'blur(32px)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset, 0 32px 80px rgba(0,0,0,0.7)',
          }}
        >
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4 border-b border-white/[0.07]">
            {/* Top glow */}
            <div
              className="absolute top-0 left-10 right-10 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${current.color}, transparent)` }}
            />

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${current.color}18`, border: `1px solid ${current.color}35` }}
                >
                  <Users size={18} style={{ color: current.color }} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Fitur Eksklusif</p>
                  <h2 className="text-base font-extrabold text-white" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                    Team Collaboration Workspace
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all"
                aria-label="Tutup modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tab pills */}
            <div className="flex gap-2 mt-4">
              {PREVIEW_SLIDES.map((s, i) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSlide(i)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      slide === i
                        ? 'text-white border'
                        : 'text-slate-500 hover:text-slate-300 border border-transparent'
                    }`}
                    style={slide === i ? {
                      background: `${s.color}18`,
                      borderColor: `${s.color}40`,
                      color: s.color,
                    } : {}}
                  >
                    <Icon size={11} /> {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slide content */}
          <div className="px-6 pt-5 pb-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.22 }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${current.color}18`, border: `1px solid ${current.color}30` }}
                  >
                    <SlideIcon size={15} style={{ color: current.color }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                      {current.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{current.desc}</p>
                  </div>
                </div>

                {/* Preview mockup */}
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                  {current.preview}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slide dots */}
            <div className="flex justify-center gap-1.5 mt-4">
              {PREVIEW_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  className="rounded-full transition-all"
                  style={{
                    width:  slide === i ? 20 : 6,
                    height: 6,
                    background: slide === i ? current.color : 'rgba(255,255,255,0.15)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* CTA footer */}
          <div className="px-6 pb-6">
            <button
              onClick={() => {
                onClose();
                if (isLoggedIn) {
                  if (firstWorkspaceId) {
                    navigate(`/dashboard/workspace/${firstWorkspaceId}`);
                  } else {
                    navigate('/dashboard');
                  }
                } else {
                  navigate('/register');
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all"
              style={{
                background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                boxShadow: '0 0 24px rgba(59,130,246,0.3)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 32px rgba(59,130,246,0.45)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 24px rgba(59,130,246,0.3)'; }}
            >
              {isLoggedIn
                ? (firstWorkspaceId ? 'Buka Workspace Kamu' : 'Buat Proyek Baru')
                : 'Kelola Projekmu Lebih Profesional, Daftar Sekarang (Gratis)'}
              <ArrowRight size={15} />
            </button>
            <p className="text-center text-xs text-slate-600 mt-2">
              {isLoggedIn ? 'Workspace siap digunakan' : 'Gratis selamanya · Tidak perlu kartu kredit'}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
