import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, BookOpen, CheckSquare, Lock, MessageSquare, Sparkles, Users, Zap,
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';

const tools = [
  {
    title: 'Workspace',
    copy: 'Satu ruang kerja untuk file, sprint, anggota tim, dan progress proyek.',
    icon: Users,
    color: '#8B5CF6',
    action: 'Buka Workspace',
  },
  {
    title: 'Real-time Chat',
    copy: 'Diskusi tim, kirim file, dan simpan konteks teknis tanpa pindah aplikasi.',
    icon: MessageSquare,
    color: '#3B82F6',
    action: 'Coba Chat',
  },
  {
    title: 'Kanban Board',
    copy: 'Ubah ide jadi task, pindahkan status, dan pantau siapa mengerjakan apa.',
    icon: CheckSquare,
    color: '#10B981',
    action: 'Buka Papan',
  },
  {
    title: 'Wiki',
    copy: 'Dokumentasi proyek, keputusan teknis, dan catatan produk yang rapi.',
    icon: BookOpen,
    color: '#F59E0B',
    action: 'Lihat Wiki',
  },
];

export default function ProductFeatures() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate('/dashboard', { replace: true });
      } else {
        setChecking(false);
      }
    });
  }, [navigate]);

  const requireLogin = () => {
    navigate('/login', { state: { from: '/dashboard' } });
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white font-['Manrope',sans-serif]">
      <Navbar />

      <main className="relative overflow-hidden pt-28">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[760px] h-[420px] bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute top-56 right-0 w-[360px] h-[360px] bg-purple-600/10 rounded-full blur-[110px]" />
        </div>

        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-semibold mb-5">
              <Sparkles size={12} /> Platform workspace
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.05]" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
              Semua alat kerja tim proyek dalam satu tempat.
            </h1>
            <p className="text-slate-400 text-lg mt-5 max-w-2xl">
              CollabFind memberi tim kecil ruang kerja lengkap: chat, board, wiki, file, dan portfolio output yang bisa dipamerkan.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-6 items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-white/[0.08] bg-[#0a0f1e]/80 overflow-hidden"
            >
              <div className="h-12 border-b border-white/[0.07] flex items-center gap-2 px-5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                <span className="ml-3 text-xs text-slate-500">MefaSafe Workspace</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[190px_1fr] min-h-[420px]">
                <aside className="border-r border-white/[0.07] p-4 bg-white/[0.02]">
                  {['Overview', 'Chat', 'Board', 'Wiki'].map((item, i) => (
                    <motion.div
                      key={item}
                      animate={{ x: [0, i === 2 ? 6 : 0, 0] }}
                      transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.25 }}
                      className={`mb-2 px-3 py-2 rounded-lg text-sm ${i === 2 ? 'bg-blue-500/15 text-blue-300' : 'text-slate-500 bg-white/[0.03]'}`}
                    >
                      {item}
                    </motion.div>
                  ))}
                </aside>
                <div className="p-5">
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {['Todo', 'Doing', 'Done'].map((col, colIndex) => (
                      <div key={col} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 min-h-[240px]">
                        <p className="text-xs font-bold text-slate-500 mb-3">{col}</p>
                        {[0, 1, 2].slice(0, colIndex + 1).map((task) => (
                          <motion.div
                            key={task}
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 2.4, repeat: Infinity, delay: (task + colIndex) * 0.2 }}
                            className="rounded-lg border border-white/[0.08] bg-[#050816] p-3 mb-2"
                          >
                            <div className="h-2 rounded bg-white/15 mb-2" />
                            <div className="h-2 rounded bg-white/10 w-2/3" />
                          </motion.div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={requireLogin}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600"
                  >
                    Buka Papan <Zap size={14} />
                  </button>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {tools.map(({ title, copy, icon: Icon, color, action }, i) => (
                <motion.button
                  key={title}
                  type="button"
                  onClick={requireLogin}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.12 + i * 0.08 }}
                  whileHover={{ y: -3 }}
                  className="text-left rounded-2xl border border-white/[0.08] bg-[#0a0f1e]/75 p-5 hover:border-white/[0.16] transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18`, border: `1px solid ${color}33` }}>
                      <Icon size={20} style={{ color }} />
                    </div>
                    <div>
                      <h2 className="font-bold text-white">{title}</h2>
                      <p className="text-sm text-slate-500 leading-relaxed mt-1">{copy}</p>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold mt-3" style={{ color }}>
                        {action} <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3 text-sm text-slate-500">
            <Lock size={15} className="text-slate-600" />
            Tombol fitur akan mengarahkan pengunjung ke login sebelum masuk workspace.
          </div>
        </section>

        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Chat tersimpan', 'Board siap pakai', 'Wiki tim'].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5"
              >
                <p className="text-2xl font-extrabold text-white mb-1">{i === 0 ? '24/7' : i === 1 ? '3x' : '1 hub'}</p>
                <p className="text-sm text-slate-500">{item}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-white/[0.08] border border-white/[0.1] hover:bg-white/[0.12] transition-all">
              Mulai kolaborasi gratis <ArrowRight size={15} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
