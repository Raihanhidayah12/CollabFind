import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Users, FolderOpen, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import GuidedTourSimple from '../GuidedTourSimple';
import { useLanguage } from '../../i18n/LanguageContext';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function Hero() {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const { t } = useLanguage();

  const stats = [
    { icon: FolderOpen, value: '2,500+', label: t('hero.activeProjects'), color: 'from-blue-500 to-cyan-400' },
    { icon: Users,      value: '15,000+', label: t('hero.members'),        color: 'from-purple-500 to-pink-400' },
    { icon: Trophy,     value: '7,000+',  label: t('hero.successes'),      color: 'from-cyan-500 to-teal-400' },
  ];
  return (
    <>
      <section id="home" className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-16 overflow-hidden">

      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-cyan-500/8 rounded-full blur-[80px]" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center overflow-hidden">

        {/* Badge */}
        <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          {t('hero.badge')}
          <ArrowRight size={14} />
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...fadeUp(0.1)}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-6"
        >
          {t('hero.title')}{' '}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              {t('hero.titleHighlight')}
            </span>
            <motion.span
              className="absolute -bottom-2 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
          </span>
          {' '}
          {t('hero.titleSuffix')}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          {...fadeUp(0.2)}
          className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {t('hero.subtitle')}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            to="/register"
            className="group flex items-center gap-2 px-7 py-3.5 text-base font-semibold text-white rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] transition-all duration-300"
          >
            {t('hero.exploreProjects')}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <button
            onClick={() => {
              console.log('Watch Demo clicked!');
              setIsTourOpen(true);
            }}
            className="group flex items-center gap-2.5 px-7 py-3.5 text-base font-semibold text-slate-300 hover:text-white rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.07] transition-all duration-300">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.4)]">
              <Play size={13} className="text-white fill-white ml-0.5" />
            </div>
            {t('hero.watchDemo')}
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          {...fadeUp(0.4)}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-20"
        >
          {stats.map(({ icon: Icon, value, label, color }) => (
            <div
              key={label}
              className="relative group flex flex-col items-center gap-2 p-5 rounded-2xl border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 backdrop-blur-sm"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} bg-opacity-20 flex items-center justify-center mb-1`} style={{ background: 'rgba(255,255,255,0.05)' }}>
                <Icon size={18} className="text-slate-300" />
              </div>
              <span className={`text-2xl font-extrabold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                {value}
              </span>
              <span className="text-sm text-slate-500">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-5xl mx-auto overflow-hidden"
        >
          {/* Glow behind mockup */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 rounded-3xl blur-2xl" />

          <div className="relative rounded-2xl border border-white/[0.08] bg-[#0a0f1e]/90 backdrop-blur-sm overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
            {/* Fake browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 mx-4 h-6 rounded-md bg-white/[0.04] flex items-center px-3">
                <span className="text-xs text-slate-600">app.collabfind.io/workspace</span>
              </div>
            </div>

            {/* Mock workspace content */}
            <div className="p-5">
              {/* Workspace header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
                  <Users size={12} className="text-blue-400" />
                </div>
                <div>
                  <div className="text-[9px] text-slate-600 uppercase tracking-widest font-semibold">Workspace</div>
                  <div className="text-xs font-bold text-white">E-Commerce App</div>
                </div>
              </div>

              {/* Tab navigation */}
              <div className="flex gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06] w-fit mb-4">
                {['File Storage', 'Wiki', 'Project Boards', 'Activity'].map((tab, i) => (
                  <div key={tab} className={`px-3 py-1.5 rounded-md text-[10px] font-medium flex items-center gap-1.5 ${i === 2 ? 'bg-white/[0.09] text-white' : 'text-slate-600'}`}>
                    {tab}
                  </div>
                ))}
              </div>

              {/* Sprint tabs */}
              <div className="flex items-center gap-2 mb-3">
                {['Backlog', 'Sprint 1', 'Sprint 2'].map((sp, i) => (
                  <div key={sp} className={`px-3 py-1 rounded-full text-[9px] font-semibold border ${i === 1 ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white/[0.04] border-white/[0.09] text-slate-500'}`}>
                    {sp}
                  </div>
                ))}
                <div className="ml-auto px-3 py-1 rounded-full text-[9px] font-semibold border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                  + Sprint Baru
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] text-slate-600">Progress Sprint 1</span>
                  <span className="text-[9px] font-bold text-slate-400">67%</span>
                </div>
                <div className="w-full bg-white/[0.04] h-1 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500" style={{ width: '67%' }} />
                </div>
                <span className="text-[8px] text-slate-700">4 dari 6 tugas selesai</span>
              </div>

              {/* Main area — Kanban + Activity */}
              <div className="grid grid-cols-12 gap-3 min-h-[220px]">
                {/* Kanban board */}
                <div className="col-span-8 grid grid-cols-3 gap-2">
                  {[
                    {
                      title: 'To Do', color: '#94A3B8',
                      items: [
                        { name: 'API docs', assignee: 'B', deadline: '20 Jun', threads: 0 },
                        { name: 'Auth flow', assignee: 'S', deadline: '22 Jun', threads: 3 },
                      ],
                    },
                    {
                      title: 'In Progress', color: '#3B82F6',
                      items: [
                        { name: 'Landing page', assignee: 'R', deadline: '18 Jun', threads: 5 },
                        { name: 'DB schema', assignee: 'K', deadline: '19 Jun', threads: 2 },
                      ],
                    },
                    {
                      title: 'Done', color: '#10B981',
                      items: [
                        { name: 'Wireframes', assignee: 'K', deadline: null, threads: 4 },
                        { name: 'Setup repo', assignee: 'R', deadline: null, threads: 1 },
                        { name: 'CI/CD pipeline', assignee: 'B', deadline: null, threads: 0 },
                      ],
                    },
                  ].map((col) => (
                    <div key={col.title} className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 px-1">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: col.color }} />
                        <span className="text-[9px] font-bold text-slate-400">{col.title}</span>
                        <span className="ml-auto px-1.5 py-0.5 rounded-full text-[8px] font-bold border" style={{ color: col.color, background: `${col.color}15`, borderColor: `${col.color}35` }}>
                          {col.items.length}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1.5 p-2 rounded-xl border border-white/[0.06] min-h-[120px]" style={{ background: `${col.color}06` }}>
                        {col.items.map((task) => (
                          <div key={task.name} className="p-2 rounded-lg bg-[#0d1226] border border-white/[0.07] hover:border-white/[0.14] transition-colors">
                            <div className="text-[10px] font-semibold text-white leading-snug mb-1">{task.name}</div>
                            <div className="flex items-center gap-1 flex-wrap">
                              {task.assignee && (
                                <span className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[7px] text-purple-300">
                                  {task.assignee}
                                </span>
                              )}
                              {task.deadline && (
                                <span className="px-1 py-0.5 rounded bg-slate-500/10 border border-slate-500/20 text-[7px] text-slate-400">
                                  {task.deadline}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-1.5 text-[8px] text-slate-600">
                              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                              <span>Diskusi</span>
                              {task.threads > 0 && (
                                <span className="px-1 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[7px] font-bold">{task.threads}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right — Activity Timeline */}
                <div className="col-span-4 flex flex-col gap-2">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="text-[9px] text-slate-500 mb-2 font-semibold uppercase tracking-wider">Hari ini</div>
                    {[
                      { user: 'R', name: 'Raihan', action: 'membuat task', detail: '"Auth flow"', color: '#10B981', icon: '+' },
                      { user: 'K', name: 'Kezia', action: 'memindahkan task', detail: '→ In Progress', color: '#3B82F6', icon: '→' },
                      { user: 'B', name: 'Budi', action: 'menambahkan komentar', detail: 'di "DB schema"', color: '#8B5CF6', icon: '💬' },
                    ].map((a, i) => (
                      <div key={i} className="flex items-start gap-2 py-1.5">
                        <div className="w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-bold flex-shrink-0" style={{ background: `${a.color}18`, border: `1px solid ${a.color}33`, color: a.color }}>
                          {a.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-semibold text-white">{a.name}</span>
                          <span className="text-[8px] text-slate-500"> {a.action} </span>
                          <span className="text-[8px] text-white font-medium">{a.detail}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="text-[9px] text-slate-500 mb-2 font-semibold uppercase tracking-wider">Kemarin</div>
                    {[
                      { user: 'S', name: 'Sari', action: 'mengupload file', detail: '"mockup.fig"', color: '#06B6D4', icon: '↑' },
                      { user: 'R', name: 'Raihan', action: 'mengedit wiki', detail: '"Setup Guide"', color: '#EC4899', icon: '✎' },
                    ].map((a, i) => (
                      <div key={i} className="flex items-start gap-2 py-1.5">
                        <div className="w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-bold flex-shrink-0" style={{ background: `${a.color}18`, border: `1px solid ${a.color}33`, color: a.color }}>
                          {a.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-semibold text-white">{a.name}</span>
                          <span className="text-[8px] text-slate-500"> {a.action} </span>
                          <span className="text-[8px] text-white font-medium">{a.detail}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
      <GuidedTourSimple isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
    </>
  );
}