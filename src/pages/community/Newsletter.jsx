import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Mail, CheckCircle, TrendingUp, Users, Lightbulb, Loader2 } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';

const highlights = [
  { icon: TrendingUp, color: '#3B82F6', title: '5 Projek Tren',     desc: 'Daftar projek paling aktif dan dicari kolaborator minggu ini' },
  { icon: Users,      color: '#8B5CF6', title: 'Cerita Sukses',     desc: 'Tim yang berhasil merilis produk lewat CollabFind' },
  { icon: Lightbulb,  color: '#F59E0B', title: 'Tips Kolaborasi',   desc: 'Cara efektif membangun produk bersama tim remote' },
];

export default function Newsletter() {
  const [email,      setEmail]      = useState('');
  const [name,       setName]       = useState('');
  const [loading,    setLoading]    = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState('');
  const [session,    setSession]    = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user?.email) setEmail(data.session.user.email);
    });
  }, []);

  async function handleSubscribe(e) {
    e.preventDefault();
    if (!email.trim()) { setError('Email wajib diisi.'); return; }
    setLoading(true);
    setError('');

    const { error: dbErr } = await supabase.from('newsletter_subscribers').insert({
      email:    email.trim().toLowerCase(),
      name:     name.trim() || null,
      user_id:  session?.user?.id || null,
    });

    if (dbErr) {
      setError(dbErr.message.includes('duplicate') || dbErr.message.includes('unique')
        ? 'Email ini sudah terdaftar.'
        : 'Gagal mendaftar. Coba lagi.');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#050816]" style={{ fontFamily: "'Manrope',sans-serif" }}>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center mx-auto mb-6">
            <Mail size={28} className="text-blue-400" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
            CollabFind{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Newsletter
            </span>
          </h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
            Rangkuman mingguan tentang projek tren, cerita tim yang berhasil, dan tips kolaborasi remote. 
            Dikirim setiap Senin pagi.
          </p>
        </motion.div>

        {/* Content highlights */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {highlights.map(h => (
            <div key={h.title} className="p-5 rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 text-center">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: `${h.color}18`, border: `1px solid ${h.color}33` }}>
                <h.icon size={18} style={{ color: h.color }} />
              </div>
              <p className="text-sm font-bold text-white mb-1">{h.title}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{h.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Subscribe form */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          className="p-8 rounded-3xl border border-white/[0.08] bg-gradient-to-br from-blue-600/10 via-purple-600/8 to-transparent">

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 py-6 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle size={28} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">You're subscribed!</h3>
                  <p className="text-sm text-slate-400">
                    Cek inbox kamu setiap Senin pagi untuk update mingguan CollabFind.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubscribe} className="flex flex-col gap-4">
                <h2 className="text-lg font-bold text-white text-center" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                  Subscribe Gratis
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Nama (opsional)"
                    className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 transition-all"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="email@example.com"
                    required
                    className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 transition-all"
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                    {error}
                  </p>
                )}

                <button type="submit" disabled={loading}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 shadow-[0_0_24px_rgba(59,130,246,0.3)] transition-all disabled:opacity-50">
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
                  {loading ? 'Subscribing...' : 'Subscribe Sekarang'}
                </button>

                <p className="text-center text-xs text-slate-600">
                  Tidak ada spam. Bisa unsubscribe kapan saja.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
