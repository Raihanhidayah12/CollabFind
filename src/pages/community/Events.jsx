import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Calendar, Clock, ExternalLink, Users, Loader2, Video } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';

const TYPE_STYLE = {
  webinar:  { label: 'Webinar',        color: '#3B82F6' },
  pitching: { label: 'Virtual Pitch',  color: '#8B5CF6' },
  workshop: { label: 'Workshop',       color: '#10B981' },
  ama:      { label: 'AMA Session',    color: '#F59E0B' },
};

function EventCard({ event, index }) {
  const type    = TYPE_STYLE[event.type] || { label: event.type, color: '#94A3B8' };
  const isPast  = new Date(event.event_date) < new Date();
  const dateStr = new Date(event.event_date).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const timeStr = new Date(event.event_date).toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`flex flex-col sm:flex-row gap-4 p-5 rounded-2xl border transition-all ${
        isPast
          ? 'border-white/[0.05] bg-white/[0.01] opacity-60'
          : 'border-white/[0.07] bg-[#0a0f1e]/70 hover:border-white/[0.14]'
      }`}
    >
      {/* Date badge */}
      <div className="flex-shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-center"
        style={{ background: `${type.color}15`, border: `1px solid ${type.color}30` }}>
        <span className="text-xl font-extrabold text-white leading-none">
          {new Date(event.event_date).getDate()}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: type.color }}>
          {new Date(event.event_date).toLocaleDateString('id-ID', { month: 'short' })}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
            style={{ color: type.color, background: `${type.color}15`, borderColor: `${type.color}30` }}>
            {type.label}
          </span>
          {isPast && <span className="text-[10px] text-slate-600 font-medium">Selesai</span>}
        </div>
        <h3 className="text-sm font-bold text-white mb-1">{event.title}</h3>
        {event.description && (
          <p className="text-xs text-slate-500 mb-2 leading-relaxed line-clamp-2">{event.description}</p>
        )}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-slate-500"><Calendar size={11} /> {dateStr}</span>
          <span className="flex items-center gap-1 text-xs text-slate-500"><Clock size={11} /> {timeStr} WIB</span>
          {event.speaker && <span className="flex items-center gap-1 text-xs text-slate-500"><Users size={11} /> {event.speaker}</span>}
        </div>
      </div>

      {/* CTA */}
      {!isPast && event.register_url && (
        <a
          href={event.register_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 self-center px-4 py-2 rounded-xl text-xs font-semibold text-white border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.09] transition-all flex-shrink-0 whitespace-nowrap"
        >
          <Video size={12} /> Register
        </a>
      )}
    </motion.div>
  );
}

export default function Events() {
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('upcoming');

  useEffect(() => {
    supabase
      .from('community_events')
      .select('*')
      .order('event_date', { ascending: true })
      .then(({ data }) => {
        setEvents(data || []);
        setLoading(false);
      });
  }, []);

  const now      = new Date();
  const upcoming = events.filter(e => new Date(e.event_date) >= now);
  const past     = events.filter(e => new Date(e.event_date) < now).reverse();
  const shown    = tab === 'upcoming' ? upcoming : past;

  return (
    <div className="min-h-screen bg-[#050816]" style={{ fontFamily: "'Manrope',sans-serif" }}>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-300 text-xs font-medium mb-5">
            <Zap size={11} /> Community Events
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
            Events & Sesi Virtual
          </h1>
          <p className="text-slate-400 text-base max-w-2xl leading-relaxed">
            Virtual pitching bulanan, webinar bersama pakar industri, dan workshop cara membangun MVP. 
            Semua gratis untuk komunitas CollabFind.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] w-fit">
          {['upcoming', 'past'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                tab === t ? 'bg-white/[0.09] text-white' : 'text-slate-500 hover:text-slate-300'
              }`}>
              {t === 'upcoming' ? `Upcoming (${upcoming.length})` : `Past (${past.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={24} className="text-blue-400 animate-spin" /></div>
        ) : shown.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70">
            <p className="text-slate-500 text-sm">
              {tab === 'upcoming' ? 'Belum ada event yang dijadwalkan.' : 'Belum ada event yang telah selesai.'}
            </p>
            <p className="text-slate-600 text-xs mt-1">Check back soon!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {shown.map((ev, i) => <EventCard key={ev.id} event={ev} index={i} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
