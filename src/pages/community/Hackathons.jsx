import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Trophy, Clock, Users, ArrowRight, Loader2, Timer } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';

const STATUS_STYLE = {
  open:     { label: 'Open',      cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
  ongoing:  { label: 'Ongoing',   cls: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  ended:    { label: 'Ended',     cls: 'text-slate-400 bg-slate-400/10 border-slate-400/20' },
  upcoming: { label: 'Upcoming',  cls: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
};

function Countdown({ endDate }) {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => {
      const diff = new Date(endDate) - new Date();
      if (diff <= 0) { setTime('Ended'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTime(`${d}d ${h}h ${m}m`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [endDate]);
  return <span>{time}</span>;
}

export default function Hackathons() {
  const [hackathons, setHackathons] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [session,    setSession]    = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    supabase
      .from('hackathons')
      .select('*')
      .order('start_date', { ascending: false })
      .then(({ data }) => {
        setHackathons(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#050816]" style={{ fontFamily: "'Manrope',sans-serif" }}>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 text-xs font-medium mb-5">
            <Trophy size={11} /> Hackathons
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
            Build Fast.{' '}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Ship Together.
            </span>
          </h1>
          <p className="text-slate-400 text-base max-w-2xl leading-relaxed">
            Kompetisi kilat 48 jam hingga 1 minggu. Tim dibentuk otomatis lewat Smart Project Matching, 
            eksekusi produk di dalam Workspace CollabFind. Cara terbaik untuk membangun portofolio nyata.
          </p>
        </motion.div>

        {/* How it works */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
          {[
            { step: '01', title: 'Daftar', desc: 'Register hackathon dan isi skill yang kamu kuasai', color: '#3B82F6' },
            { step: '02', title: 'Tim Otomatis', desc: 'Smart Matching membentuk tim berdasarkan skill yang saling melengkapi', color: '#8B5CF6' },
            { step: '03', title: 'Build & Ship', desc: 'Kerjakan produk di Workspace selama durasi hackathon', color: '#10B981' },
          ].map(s => (
            <div key={s.step} className="p-5 rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70">
              <span className="text-xs font-bold tracking-widest mb-3 block" style={{ color: s.color }}>{s.step}</span>
              <h3 className="text-sm font-bold text-white mb-1">{s.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Hackathon list */}
        <h2 className="text-lg font-bold text-white mb-5" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
          Hackathons
        </h2>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={24} className="text-blue-400 animate-spin" /></div>
        ) : hackathons.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70">
            <Trophy size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Belum ada hackathon yang dijadwalkan.</p>
            <p className="text-slate-600 text-xs mt-1">Stay tuned — hackathon pertama segera hadir!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {hackathons.map((h, i) => {
              const s = STATUS_STYLE[h.status] || STATUS_STYLE.upcoming;
              return (
                <motion.div key={h.id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className="p-5 rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 hover:border-white/[0.14] transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-white">{h.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${s.cls}`}>{s.label}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-lg">{h.description}</p>
                    </div>
                    {h.prize && (
                      <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-300 text-xs font-bold flex-shrink-0">
                        <Trophy size={11} /> {h.prize}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 flex-wrap mb-3">
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock size={11} /> {h.duration}
                    </span>
                    {h.max_teams && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Users size={11} /> Max {h.max_teams} tim
                      </span>
                    )}
                    {h.status === 'ongoing' && h.end_date && (
                      <span className="flex items-center gap-1 text-xs text-yellow-400 font-semibold">
                        <Timer size={11} /> <Countdown endDate={h.end_date} />
                      </span>
                    )}
                  </div>
                  {h.status !== 'ended' && (
                    session ? (
                      <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 hover:from-yellow-500/30 hover:to-orange-500/30 transition-all">
                        Join Hackathon <ArrowRight size={12} />
                      </button>
                    ) : (
                      <Link to="/login" className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 border border-white/[0.08] hover:bg-white/[0.05] transition-all w-fit">
                        Login untuk join <ArrowRight size={12} />
                      </Link>
                    )
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
