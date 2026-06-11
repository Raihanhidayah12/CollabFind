import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  X, FolderOpen, BookOpen, LayoutDashboard, Activity,
  Upload, FileText, FileImage, FileCode, FileArchive,
  CheckSquare, ArrowRight, Users, MessageSquare, Clock,
  CheckCircle, Plus, Zap,
} from 'lucide-react';

const PREVIEW_SLIDES = [
  {
    id: 'boards',
    icon: LayoutDashboard,
    color: '#10B981',
    label: 'Project Boards',
    title: 'Kanban board dengan sprint & diskusi',
    desc: 'Atur tugas di papan Kanban, tetapkan assignee & deadline, dan diskusikan langsung di setiap task lewat thread.',
    preview: (
      <div className="flex flex-col gap-2">
        {/* Sprint header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/30 text-[10px] font-bold text-blue-300">Sprint 1</span>
            <span className="text-[9px] text-slate-600">deadline 20 Jun</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-24 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-blue-500 to-emerald-400" />
            </div>
            <span className="text-[9px] font-bold text-emerald-400">50%</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'To-Do', color: '#94A3B8', tasks: [
              { title: 'Notifikasi real-time', assignee: 'Rizky', thread: 2 },
              { title: 'Testing & QA', assignee: 'Rizky', thread: 0 },
            ]},
            { label: 'In Progress', color: '#3B82F6', tasks: [
              { title: 'Integrasi Supabase', assignee: 'Rina', thread: 5 },
            ]},
            { label: 'Done', color: '#10B981', tasks: [
              { title: 'Setup project', assignee: 'Dimas', thread: 3 },
              { title: 'Desain UI login', assignee: 'Rina', thread: 1 },
            ]},
          ].map((col) => (
            <div key={col.label} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: col.color }} />
                <p className="text-[10px] font-bold text-slate-400">{col.label}</p>
                <span className="text-[9px] text-slate-600">{col.tasks.length}</span>
              </div>
              {col.tasks.map((t) => (
                <div key={t.title} className="px-2 py-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03]">
                  <p className="text-[10px] text-slate-300 leading-snug mb-1">{t.title}</p>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-0.5 text-[8px] text-purple-300">
                      <Users size={7} /> {t.assignee}
                    </span>
                    {t.thread > 0 && (
                      <span className="flex items-center gap-0.5 text-[8px] text-blue-400">
                        <MessageSquare size={7} /> {t.thread}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'files',
    icon: FolderOpen,
    color: '#8B5CF6',
    label: 'File Storage',
    title: 'Semua aset proyek dengan folder otomatis',
    desc: 'Upload file dan otomatis terkategorisi ke folder virtual berdasarkan tipe — gambar, dokumen, kode, dan lainnya.',
    preview: (
      <div className="flex gap-2 h-[130px]">
        {/* Folder sidebar */}
        <div className="w-24 flex flex-col gap-0.5 overflow-hidden">
          {[
            { label: 'Semua File', icon: FolderOpen, color: '#3B82F6', active: true },
            { label: 'Gambar', icon: FileImage, color: '#8B5CF6' },
            { label: 'Dokumen', icon: FileText, color: '#10B981' },
            { label: 'Kode', icon: FileCode, color: '#3B82F6' },
            { label: 'Arsip', icon: FileArchive, color: '#F59E0B' },
          ].map((f) => (
            <div key={f.label} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[9px] ${
              f.active ? 'bg-blue-500/15 border border-blue-500/30 text-blue-300' : 'text-slate-500'
            }`}>
              <f.icon size={9} style={{ color: f.color }} /> {f.label}
            </div>
          ))}
        </div>
        {/* File list */}
        <div className="flex-1 flex flex-col gap-1.5 overflow-hidden">
          {[
            { name: 'design-mockup.fig', size: '2.4 MB', color: '#8B5CF6' },
            { name: 'api-docs.pdf',       size: '845 KB', color: '#10B981' },
            { name: 'app.js',             size: '12 KB',  color: '#3B82F6' },
          ].map((f) => (
            <div key={f.name} className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03]">
              <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}>
                <FolderOpen size={10} style={{ color: f.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-white truncate">{f.name}</p>
                <p className="text-[8px] text-slate-500">{f.size}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'wiki',
    icon: BookOpen,
    color: '#06B6D4',
    label: 'Wiki',
    title: 'Dokumentasi tim yang rapi',
    desc: 'Tulis code guidelines, jobdesk, rangkuman meeting, dan ide di halaman Wiki. Terintegrasi langsung dengan proyekmu.',
    preview: (
      <div className="flex gap-3 h-[130px]">
        <div className="w-24 flex flex-col gap-1">
          {['Code Guide', 'Jobdesk', 'Meeting Notes', 'Ideas'].map((p) => (
            <div key={p} className={`px-2 py-1.5 rounded-lg text-[10px] truncate ${
              p === 'Code Guide' ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300' : 'text-slate-500'
            }`}>
              {p}
            </div>
          ))}
        </div>
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
    id: 'activity',
    icon: Activity,
    color: '#F59E0B',
    label: 'Activity',
    title: 'Timeline aktivitas tim secara real-time',
    desc: 'Pantau semua aktivitas tim — task dibuat, dipindah, komentar baru, file diupload — semuanya di satu timeline.',
    preview: (
      <div className="flex flex-col gap-2">
        {[
          { action: 'completed', title: 'Setup project', user: 'Dimas', time: '2h lalu', color: '#10B981', icon: CheckCircle },
          { action: 'commented', title: 'Integrasi Supabase', user: 'Rina', time: '3h lalu', color: '#3B82F6', icon: MessageSquare },
          { action: 'uploaded', title: 'design-mockup.fig', user: 'Rina', time: '5h lalu', color: '#8B5CF6', icon: Upload },
          { action: 'created', title: 'Notifikasi real-time', user: 'Rizky', time: '1d lalu', color: '#F59E0B', icon: Plus },
        ].map((item) => (
          <div key={item.title} className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: `${item.color}18`, border: `1px solid ${item.color}30` }}>
              <item.icon size={10} style={{ color: item.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-white">
                <span className="font-semibold">{item.user}</span>
                <span className="text-slate-500"> {item.action} </span>
                <span className="text-blue-300">{item.title}</span>
              </p>
            </div>
            <span className="text-[8px] text-slate-600 flex-shrink-0 flex items-center gap-0.5">
              <Clock size={7} /> {item.time}
            </span>
          </div>
        ))}
      </div>
    ),
  },
];

export default function WorkspacePreviewModal({ onClose, isLoggedIn = false, firstWorkspaceId = null }) {
  const navigate      = useNavigate();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSlide((s) => (s + 1) % PREVIEW_SLIDES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

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
            <div className="flex flex-wrap gap-1.5 mt-4">
              {PREVIEW_SLIDES.map((s, i) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSlide(i)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
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
                    <Icon size={10} /> {s.label}
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
