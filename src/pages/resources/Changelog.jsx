import { motion } from 'framer-motion';
import { Zap, Star, Wrench, ArrowUp, CheckCircle2 } from 'lucide-react';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';

// ─── Changelog data ───────────────────────────────────────────────────────────

const changelog = [
  {
    version: 'v1.2.0',
    date: 'June 2025',
    type: 'feature',
    title: 'Team Collaboration Workspace',
    description:
      'Workspace kini hadir untuk setiap projek — lengkap dengan Kanban Board untuk manajemen tugas tim, Wiki untuk dokumentasi internal, dan File Storage 50MB untuk aset dan dokumen.',
    items: ['Kanban Board dengan drag-and-drop', 'Wiki editor berbasis Markdown', 'File Storage 50MB per workspace'],
  },
  {
    version: 'v1.1.5',
    date: 'May 2025',
    type: 'improvement',
    title: 'Smart Search Performance',
    description:
      'Kecepatan pencarian projek ditingkatkan secara signifikan dengan beralih ke array-based indexing. Hasil pencarian kini muncul lebih cepat dan lebih akurat.',
    items: ['Array-based skill indexing', 'Latensi query turun ~60%', 'Improved ranking relevance'],
  },
  {
    version: 'v1.1.0',
    date: 'May 2025',
    type: 'fix',
    title: 'Login Redirect Intent Fix',
    description:
      'Memperbaiki bug dimana pengguna yang mengakses halaman detail projek tanpa login akan di-redirect ke dashboard setelah login, bukan kembali ke halaman projek yang dituju.',
    items: ['Redirect intent tersimpan di session storage', 'User kembali ke halaman tujuan setelah login', 'Edge case dari email magic link juga diperbaiki'],
  },
  {
    version: 'v1.0.5',
    date: 'April 2025',
    type: 'feature',
    title: 'Community Pages',
    description:
      'Meluncurkan tiga halaman komunitas baru: Forum diskusi terbuka, Events untuk acara kolaborasi, dan Hackathons untuk kompetisi tim.',
    items: ['Forum diskusi komunitas', 'Halaman Events', 'Halaman Hackathons'],
  },
  {
    version: 'v1.0.0',
    date: 'April 2025',
    type: 'milestone',
    title: 'CollabFind is Live!',
    description:
      'CollabFind resmi diluncurkan ke publik. Platform kolaborasi untuk mahasiswa, developer, dan kreator Indonesia untuk menemukan rekan tim dan membangun projek bersama.',
    items: ['Project discovery & Explore page', 'Smart-match berdasarkan skill', 'Apply to join & team management', 'User profiles & portfolios'],
  },
];

// ─── Type config ──────────────────────────────────────────────────────────────

const typeConfig = {
  feature:     { label: 'Feature',     color: '#3B82F6', bg: '#1d4ed820', icon: Star },
  improvement: { label: 'Improvement', color: '#8B5CF6', bg: '#6d28d920', icon: ArrowUp },
  fix:         { label: 'Bug Fix',     color: '#F97316', bg: '#c2410c20', icon: Wrench },
  milestone:   { label: 'Milestone',   color: '#10B981', bg: '#05966920', icon: CheckCircle2 },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Changelog() {
  return (
    <div className="min-h-screen bg-[#050816]" style={{ fontFamily: "'Manrope',sans-serif" }}>
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">

        {/* ── Hero ── */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-medium mb-6">
            <Zap size={11} /> Changelog
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight"
            style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
            What's{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              New
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-md mx-auto">
            Semua update, perbaikan, dan fitur baru CollabFind — dari yang terbaru.
          </p>
        </motion.div>

        {/* ── Timeline ── */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[22px] top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/40 via-white/[0.06] to-transparent" />

          <div className="space-y-10">
            {changelog.map((entry, i) => {
              const cfg = typeConfig[entry.type];
              const TypeIcon = cfg.icon;

              return (
                <motion.div
                  key={entry.version}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="relative flex gap-6"
                >
                  {/* Timeline dot */}
                  <div
                    className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center z-10 border"
                    style={{ background: cfg.bg, borderColor: `${cfg.color}40` }}
                  >
                    <TypeIcon size={18} style={{ color: cfg.color }} />
                  </div>

                  {/* Card */}
                  <div className="flex-1 rounded-2xl border border-white/[0.08] bg-[#0a0f1e]/70 p-6 hover:border-white/[0.14] transition-all">
                    {/* Top row */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="font-mono text-sm font-bold text-white">{entry.version}</span>
                      <span className="text-slate-600 text-xs">·</span>
                      <span className="text-xs text-slate-500">{entry.date}</span>
                      <span
                        className="ml-auto text-xs font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40` }}
                      >
                        {cfg.label}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-extrabold text-white mb-2"
                      style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                      {entry.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-slate-400 leading-relaxed mb-4">{entry.description}</p>

                    {/* Items */}
                    <ul className="space-y-1.5">
                      {entry.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-xs text-slate-500">
                          <span className="mt-0.5 flex-shrink-0 w-1.5 h-1.5 rounded-full"
                            style={{ background: cfg.color }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── Footer note ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center text-xs text-slate-700"
        >
          CollabFind is actively developed. Follow updates via{' '}
          <a href="/newsletter" className="text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-2">
            Newsletter
          </a>{' '}
          or{' '}
          <a href="/discord" className="text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-2">
            Discord
          </a>
          .
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
