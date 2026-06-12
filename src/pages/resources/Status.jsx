import { useLanguage } from '../../i18n/LanguageContext';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Zap, Globe, Database, HardDrive } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import PageNavbar from '../../components/PageNavbar';
import Footer from '../../components/landing/Footer';

// ─── Status levels ────────────────────────────────────────────────────────────

const STATUS = {
  OPERATIONAL: 'Operational',
  DEGRADED:    'Degraded',
  DOWN:        'Down',
  CHECKING:    'Checking...',
};

const statusStyle = {
  [STATUS.OPERATIONAL]: { color: '#10B981', bg: '#05966920', border: '#10B98140', icon: CheckCircle2,    dot: 'bg-green-400' },
  [STATUS.DEGRADED]:    { color: '#F59E0B', bg: '#b4530920', border: '#F59E0B40', icon: AlertTriangle,   dot: 'bg-yellow-400' },
  [STATUS.DOWN]:        { color: '#EF4444', bg: '#dc262620', border: '#EF444440', icon: XCircle,         dot: 'bg-red-400' },
  [STATUS.CHECKING]:    { color: '#64748b', bg: '#1e293b30', border: '#33415530', icon: RefreshCw,        dot: 'bg-slate-500' },
};

// ─── Service definitions ──────────────────────────────────────────────────────

const SERVICE_DEFS = [
  {
    id:          'website',
    name:        'Main Website',
    description: 'CollabFind web app and static assets',
    icon:        Globe,
    iconColor:   '#3B82F6',
    check:       async () => {
      const t0 = performance.now();
      const res = await fetch(window.location.origin + '/', { method: 'HEAD', cache: 'no-store' });
      const ms = Math.round(performance.now() - t0);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return ms;
    },
  },
  {
    id:          'database',
    name:        'Supabase Database',
    description: 'PostgreSQL database via Supabase',
    icon:        Database,
    iconColor:   '#8B5CF6',
    check:       async () => {
      const t0 = performance.now();
      const { error } = await supabase.from('projects').select('id').limit(1);
      const ms = Math.round(performance.now() - t0);
      if (error) throw new Error(error.message);
      return ms;
    },
  },
  {
    id:          'storage',
    name:        'Storage Service',
    description: 'File storage for workspace assets',
    icon:        HardDrive,
    iconColor:   '#10B981',
    check:       async () => {
      const t0 = performance.now();
      const { error } = await supabase.storage.listBuckets();
      const ms = Math.round(performance.now() - t0);
      if (error) throw new Error(error.message);
      return ms;
    },
  },
];

// ─── Determine status from response time / error ──────────────────────────────

function resolveStatus(ms, err) {
  if (err)     return STATUS.DOWN;
  if (ms > 3000) return STATUS.DEGRADED;
  return STATUS.OPERATIONAL;
}

// ─── Service row ──────────────────────────────────────────────────────────────

function ServiceRow({ service }) {
  const cfg   = statusStyle[service.status] || statusStyle[STATUS.CHECKING];
  const Icon  = cfg.icon;
  const SIcon = service.icon;

  return (
    <div className="flex items-center gap-4 p-5 rounded-2xl border border-white/[0.08] bg-[#0a0f1e]/70">
      {/* Service icon */}
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${service.iconColor}18`, border: `1px solid ${service.iconColor}33` }}>
        <SIcon size={18} style={{ color: service.iconColor }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white">{service.name}</p>
        <p className="text-xs text-slate-500 truncate">{service.description}</p>
      </div>

      {/* Response time */}
      {service.status !== STATUS.CHECKING && (
        <div className="text-right flex-shrink-0 hidden sm:block">
          {service.responseMs != null ? (
            <p className="text-xs font-mono text-slate-400">{service.responseMs} ms</p>
          ) : (
            <p className="text-xs text-slate-700">—</p>
          )}
        </div>
      )}

      {/* Status badge */}
      <div
        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border"
        style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
      >
        <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${service.status === STATUS.CHECKING ? 'animate-pulse' : ''}`} />
        {service.status}
      </div>
    </div>
  );
}

// ─── Overall banner ───────────────────────────────────────────────────────────

function OverallBanner({ services }) {
  const statuses = services.map((s) => s.status);
  const anyDown     = statuses.includes(STATUS.DOWN);
  const anyDegraded = statuses.includes(STATUS.DEGRADED);
  const allChecking = statuses.every((s) => s === STATUS.CHECKING);

  let level, message;
  if (allChecking) {
    level   = STATUS.CHECKING;
    message = 'Checking all services...';
  } else if (anyDown) {
    level   = STATUS.DOWN;
    message = 'One or more services are down.';
  } else if (anyDegraded) {
    level   = STATUS.DEGRADED;
    message = 'Some services are experiencing degraded performance.';
  } else {
    level   = STATUS.OPERATIONAL;
    message = 'All systems operational.';
  }

  const cfg  = statusStyle[level];
  const Icon = cfg.icon;

  return (
    <div
      className="flex items-center gap-3 px-5 py-4 rounded-2xl border mb-8"
      style={{ background: cfg.bg, borderColor: cfg.border }}
    >
      <Icon size={18} style={{ color: cfg.color }} className={level === STATUS.CHECKING ? 'animate-spin' : ''} />
      <div className="flex-1">
        <p className="text-sm font-bold" style={{ color: cfg.color }}>
          {level === STATUS.CHECKING ? 'Checking...' : level}
        </p>
        <p className="text-xs" style={{ color: cfg.color, opacity: 0.7 }}>{message}</p>
      </div>
      <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot} ${level === STATUS.OPERATIONAL ? 'animate-pulse' : ''}`} />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const REFRESH_INTERVAL = 30; // seconds

export default function Status() { 
  const { t } = useLanguage();
  const [services, setServices] = useState(
    SERVICE_DEFS.map((s) => ({ ...s, status: STATUS.CHECKING, responseMs: null, error: null }))
  );
  const [lastChecked, setLastChecked]   = useState(null);
  const [secondsAgo, setSecondsAgo]     = useState(0);
  const [nextIn, setNextIn]             = useState(REFRESH_INTERVAL);
  const timerRef  = useRef(null);
  const countRef  = useRef(null);

  const runChecks = useCallback(async () => {
    // Reset to checking
    setServices((prev) => prev.map((s) => ({ ...s, status: STATUS.CHECKING, responseMs: null, error: null })));
    setNextIn(REFRESH_INTERVAL);

    // Check each service in parallel
    const results = await Promise.allSettled(
      SERVICE_DEFS.map((def) => def.check())
    );

    const now = Date.now();
    setLastChecked(now);
    setSecondsAgo(0);

    setServices(
      SERVICE_DEFS.map((def, i) => {
        const result = results[i];
        if (result.status === 'fulfilled') {
          const ms = result.value;
          return { ...def, status: resolveStatus(ms, null), responseMs: ms, error: null };
        } else {
          return { ...def, status: STATUS.DOWN, responseMs: null, error: result.reason?.message || 'Unknown error' };
        }
      })
    );
  }, []);

  // Initial check
  useEffect(() => {
    runChecks();
  }, [runChecks]);

  // Auto-refresh every 30s
  useEffect(() => {
    timerRef.current = setInterval(() => {
      runChecks();
    }, REFRESH_INTERVAL * 1000);
    return () => clearInterval(timerRef.current);
  }, [runChecks]);

  // Count up "X seconds ago" and count down "next in"
  useEffect(() => {
    countRef.current = setInterval(() => {
      if (lastChecked) {
        setSecondsAgo(Math.floor((Date.now() - lastChecked) / 1000));
      }
      setNextIn((prev) => (prev > 0 ? prev - 1 : REFRESH_INTERVAL));
    }, 1000);
    return () => clearInterval(countRef.current);
  }, [lastChecked]);

  return (
    <div className="bg-[#050816]" style={{ fontFamily: "'Manrope',sans-serif" }}>
      <PageNavbar breadcrumbs={[{ label: 'Status', href: null }]} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">

        {/* ── Hero ── */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-300 text-xs font-medium mb-6">
            <Activity size={11} /> System Status
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight"
            style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
            CollabFind{' '}
            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Status
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-md mx-auto">
            Real-time health status for all CollabFind services.
          </p>
        </motion.div>

        {/* ── Overall banner ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <OverallBanner services={services} />
        </motion.div>

        {/* ── Service list ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="space-y-3 mb-8"
        >
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.14 + i * 0.06 }}
            >
              <ServiceRow service={service} />
            </motion.div>
          ))}
        </motion.div>

        {/* ── Meta / refresh controls ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/50"
        >
          <div className="text-xs text-slate-600 text-center sm:text-left">
            {lastChecked ? (
              <>
                Last checked:{' '}
                <span className="text-slate-400 font-medium">
                  {secondsAgo === 0 ? 'just now' : `${secondsAgo}s ago`}
                </span>
                <span className="mx-2 text-slate-700">·</span>
                Next check in{' '}
                <span className="text-slate-400 font-medium">{nextIn}s</span>
              </>
            ) : (
              <span className="text-slate-500">Checking services...</span>
            )}
          </div>

          <button
            onClick={runChecks}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.1] text-xs font-semibold text-slate-400 hover:text-white hover:border-white/[0.2] transition-all"
          >
            <RefreshCw size={12} />
            Refresh Now
          </button>
        </motion.div>

        {/* ── Legend ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex flex-wrap items-center justify-center gap-5 mt-10 text-xs text-slate-600"
        >
          {[STATUS.OPERATIONAL, STATUS.DEGRADED, STATUS.DOWN].map((s) => {
            const cfg = statusStyle[s];
            return (
              <div key={s} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                <span style={{ color: cfg.color }}>{s}</span>
              </div>
            );
          })}
          <div className="flex items-center gap-1.5">
            <Zap size={11} className="text-slate-600" />
            <span>Auto-refresh every 30s</span>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
