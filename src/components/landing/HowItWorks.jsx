import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, Rocket, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#06B6D4', '#EC4899'];
const SLOT_LABELS = ['1 open role', '2 open roles', '3 open roles', '4 open roles', '5 open roles'];

const FALLBACK_PROJECTS = [
  { title: 'React Native App', open_slots: 3 },
  { title: 'AI Study Tool', open_slots: 2 },
  { title: 'Open Source CLI', open_slots: 1 },
];

const FALLBACK_PROFILES = [
  { name: 'Ardi K.',  job_title: 'Frontend Dev',  color: '#3B82F6' },
  { name: 'Sari D.',  job_title: 'UI Designer',    color: '#8B5CF6' },
  { name: 'Budi H.',  job_title: 'Backend Dev',    color: '#10B981' },
];

const WORKSPACE_TOOLS = [
  { label: 'Kanban Board', color: '#3B82F6' },
  { label: 'Live Chat',    color: '#8B5CF6' },
  { label: 'Project Wiki', color: '#06B6D4' },
  { label: 'Auto Portfolio', color: '#10B981' },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function HowItWorks() {
  const [projects, setProjects] = useState(FALLBACK_PROJECTS);
  const [profiles, setProfiles] = useState(FALLBACK_PROFILES);

  useEffect(() => {
    async function fetchData() {
      const [{ data: projectData }, { data: profileData }] = await Promise.all([
        supabase
          .from('projects')
          .select('title, open_slots')
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('profiles')
          .select('name, job_title, skills')
          .not('job_title', 'is', null)
          .order('created_at', { ascending: false })
          .limit(3),
      ]);

      if (projectData && projectData.length >= 2) setProjects(projectData);
      if (profileData && profileData.length >= 2) {
        setProfiles(
          profileData.map((p, i) => ({
            name: p.name || 'Member',
            job_title: p.job_title || p.skills?.[0] || 'Collaborator',
            color: COLORS[i % COLORS.length],
          }))
        );
      }
    }
    fetchData();
  }, []);

  const steps = [
    {
      step: '01',
      icon: Search,
      color: '#3B82F6',
      title: 'Post atau Temukan Project',
      desc: 'Punya ide? Post projectmu dan deskripsikan apa yang kamu butuhkan. Atau jelajahi ratusan project aktif yang mencari kolaborator seperti kamu.',
      visual: (
        <div className="flex flex-col gap-2">
          {projects.map((p, i) => (
            <div key={p.title} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.07]">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="text-xs text-slate-400 truncate">{p.title}</span>
              <span className="ml-auto text-[10px] text-slate-600 flex-shrink-0">
                {SLOT_LABELS[Math.min((p.open_slots || 1) - 1, SLOT_LABELS.length - 1)]}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      step: '02',
      icon: Users,
      color: '#8B5CF6',
      title: 'Smart Match Temukan Teammu',
      desc: 'Algoritma kami mencocokkan kamu dengan developer, designer, dan PM berdasarkan skill, ketersediaan, dan gaya kerja — bukan sekadar keyword.',
      visual: (
        <div className="flex flex-col gap-2">
          {profiles.map((m, i) => (
            <div key={m.name} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.07]">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: m.color }}
              >
                {(m.name || '?')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{m.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{m.job_title}</p>
              </div>
              <div
                className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: `${m.color}22`, color: m.color }}
              >
                {['96%', '92%', '88%'][i] || '85%'}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      step: '03',
      icon: Rocket,
      color: '#10B981',
      title: 'Build & Ship Bersama',
      desc: 'Workspace lengkap: Kanban board, chat real-time, wiki project, dan portfolio generator otomatis. Semua yang kamu butuhkan untuk ship produk nyata.',
      visual: (
        <div className="grid grid-cols-2 gap-2">
          {WORKSPACE_TOOLS.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-center p-3 rounded-xl border text-[11px] font-medium text-center"
              style={{ borderColor: `${item.color}33`, background: `${item.color}0d`, color: item.color }}
            >
              {item.label}
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-600/6 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp()} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-medium mb-4">
            <Rocket size={12} /> How It Works
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Dari ide ke produk,{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">3 langkah</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Sederhana. Cepat. Terarah. Mulai kolaborasi nyata dalam hitungan menit.
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-16 left-[16.66%] right-[16.66%] h-px">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
            <div className="absolute left-1/3 top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/20" />
            <div className="absolute left-2/3 top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/20" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div key={step.step} {...fadeUp(i * 0.15)}>
                  <div className="relative flex flex-col h-full p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.14] hover:bg-white/[0.04] transition-all duration-300 group">
                    <div className="flex items-center gap-3 mb-5">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                        style={{ background: `${step.color}18`, border: `1px solid ${step.color}33`, boxShadow: `0 0 20px ${step.color}18` }}
                      >
                        <Icon size={22} style={{ color: step.color }} />
                      </div>
                      <span className="text-4xl font-black opacity-20" style={{ color: step.color }}>
                        {step.step}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-6">{step.desc}</p>
                    <div className="mt-auto p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                      {step.visual}
                    </div>
                    <div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{ background: `radial-gradient(ellipse at 50% 0%, ${step.color}0d, transparent 70%)` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div {...fadeUp(0.4)} className="text-center mt-14">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 shadow-[0_0_30px_rgba(59,130,246,0.35)] hover:shadow-[0_0_44px_rgba(59,130,246,0.55)] transition-all duration-300"
          >
            Mulai Sekarang — Gratis
            <ArrowRight size={18} />
          </Link>
          <p className="text-xs text-slate-600 mt-3">Tidak perlu kartu kredit. Setup dalam 2 menit.</p>
        </motion.div>
      </div>
    </section>
  );
}
