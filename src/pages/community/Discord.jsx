import { motion } from 'framer-motion';
import { Zap, Hash, ExternalLink } from 'lucide-react';
import PageNavbar from '../../components/PageNavbar';
import Footer from '../../components/landing/Footer';

const channels = [
  { name: 'find-teammates',  desc: 'Promosi cepat untuk cari anggota tim baru', color: '#3B82F6' },
  { name: 'share-your-project', desc: 'Pamer produk dan projek yang sedang kamu bangun', color: '#8B5CF6' },
  { name: 'react',           desc: 'Diskusi seputar React, Next.js, dan ekosistemnya', color: '#06B6D4' },
  { name: 'design-uiux',     desc: 'UI/UX design, Figma, dan visual storytelling', color: '#EC4899' },
  { name: 'supabase',        desc: 'Backend, database, auth, dan storage dengan Supabase', color: '#10B981' },
  { name: 'general',         desc: 'Ngobrol santai tentang apa saja', color: '#F59E0B' },
];

export default function Discord() {
  return (
    <div className="min-h-screen bg-[#050816]" style={{ fontFamily: "'Manrope',sans-serif" }}>
      <PageNavbar breadcrumbs={[{ label: 'Discord', href: null }]} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-6">
            <Zap size={11} /> Community
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 tracking-tight" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
            Join our{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
              Discord Server
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto mb-8">
            Ribuan builder, developer, dan desainer berkumpul di sini. Temukan rekan tim, berbagi progres, dan belajar bersama.
          </p>
          <a
            href="https://discord.gg/collabfind"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-[#5865F2] hover:bg-[#4752C4] shadow-[0_0_30px_rgba(88,101,242,0.4)] transition-all"
          >
            <ExternalLink size={15} /> Join Discord Server
          </a>
        </motion.div>

        {/* Channels preview */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-lg font-bold text-white mb-5" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
            Kanal Utama
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {channels.map((ch) => (
              <div key={ch.name}
                className="flex items-center gap-3 p-4 rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 hover:border-white/[0.14] transition-all">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${ch.color}18`, border: `1px solid ${ch.color}33` }}>
                  <Hash size={15} style={{ color: ch.color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">#{ch.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{ch.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
