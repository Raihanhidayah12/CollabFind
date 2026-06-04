import { motion } from 'framer-motion';
import { Download, Zap } from 'lucide-react';
import Footer from '../../components/landing/Footer';
import PageNavbar from '../../components/PageNavbar';

const facts = [
  { label: 'Founded',      value: '2025' },
  { label: 'Headquarters', value: 'Remote-first' },
  { label: 'Focus',        value: 'Student & creator collaboration' },
  { label: 'Stack',        value: 'React, Vite, Supabase, Tailwind CSS' },
];

const assets = [
  { name: 'Logo — Light (SVG)', desc: 'For use on dark backgrounds' },
  { name: 'Logo — Dark (SVG)',  desc: 'For use on light backgrounds' },
  { name: 'Brand Colors',       desc: 'Primary palette and usage guidelines' },
  { name: 'Product Screenshots',desc: 'Hi-res screenshots of the platform' },
];

export default function PressKit() {
  return (
    <div className="min-h-screen bg-[#050816]" style={{ fontFamily: "'Manrope',sans-serif" }}>
      <PageNavbar breadcrumbs={[{ label: 'Press Kit', href: null }]} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-medium mb-6">
            <Zap size={11} /> Press & Media
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 tracking-tight" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
            Press Kit
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Everything you need to write about CollabFind. For interviews and inquiries, 
            reach us at{' '}
            <a href="mailto:press@collabfind.com" className="text-blue-400 hover:text-blue-300 transition-colors">
              press@collabfind.com
            </a>
          </p>
        </motion.div>

        {/* About */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="p-8 rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 mb-8">
          <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>About CollabFind</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            CollabFind is a collaboration platform designed for students, developers, designers, 
            and creators to find teammates and build real projects together. The platform features 
            smart skill-based matching, project workspaces with kanban boards, file storage, 
            and a wiki — all in one place.
          </p>
        </motion.div>

        {/* Facts */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {facts.map((f) => (
            <div key={f.label} className="p-5 rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 text-center">
              <p className="text-xs text-slate-500 mb-1">{f.label}</p>
              <p className="text-sm font-bold text-white">{f.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Brand assets */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <h2 className="text-lg font-bold text-white mb-5" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>Brand Assets</h2>
          <div className="flex flex-col gap-3">
            {assets.map((a) => (
              <div key={a.name} className="flex items-center justify-between p-4 rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70">
                <div>
                  <p className="text-sm font-semibold text-white">{a.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{a.desc}</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 border border-white/[0.08] hover:text-white hover:bg-white/[0.06] transition-all">
                  <Download size={12} /> Download
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Brand colors */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-8">
          <h2 className="text-lg font-bold text-white mb-5" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>Brand Colors</h2>
          <div className="flex gap-4 flex-wrap">
            {[
              { name: 'Blue',   hex: '#3B82F6', bg: 'bg-blue-500' },
              { name: 'Purple', hex: '#8B5CF6', bg: 'bg-purple-500' },
              { name: 'Cyan',   hex: '#06B6D4', bg: 'bg-cyan-500' },
              { name: 'Dark',   hex: '#050816', bg: 'bg-[#050816] border border-white/20' },
            ].map((c) => (
              <div key={c.name} className="flex flex-col items-center gap-2">
                <div className={`w-16 h-16 rounded-2xl ${c.bg}`} />
                <p className="text-xs font-semibold text-white">{c.name}</p>
                <p className="text-xs text-slate-500 font-mono">{c.hex}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
