import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Users, FolderOpen, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import GuidedTourSimple from '../GuidedTourSimple';

const stats = [
  { icon: FolderOpen, value: '2,500+', label: 'Active Projects', color: 'from-blue-500 to-cyan-400' },
  { icon: Users,      value: '15,000+', label: 'Members',        color: 'from-purple-500 to-pink-400' },
  { icon: Trophy,     value: '7,000+',  label: 'Successes',      color: 'from-cyan-500 to-teal-400' },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function Hero() {
  const [isTourOpen, setIsTourOpen] = useState(false);
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        {/* Badge */}
        <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          Now in Beta — Join 15,000+ builders
          <ArrowRight size={14} />
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...fadeUp(0.1)}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-6"
        >
          Build Amazing{' '}
          <span className="relative">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Projects
            </span>
            <motion.span
              className="absolute -bottom-2 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
          </span>
          <br />Together
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          {...fadeUp(0.2)}
          className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Find talented teammates, join exciting projects, and create portfolio-worthy products
          with developers, designers, and creators worldwide.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            to="/register"
            className="group flex items-center gap-2 px-7 py-3.5 text-base font-semibold text-white rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] transition-all duration-300"
          >
            Explore Projects
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
            Watch Demo
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
          className="relative max-w-5xl mx-auto"
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
                <span className="text-xs text-slate-600">app.collabfind.io/dashboard</span>
              </div>
            </div>

            {/* Mock dashboard content */}
            <div className="p-6 grid grid-cols-12 gap-4 min-h-[320px]">
              {/* Sidebar */}
              <div className="col-span-2 flex flex-col gap-3">
                {['Dashboard','Projects','Team','Chat','Tasks','Portfolio'].map((item, i) => (
                  <div key={item} className={`h-7 rounded-lg text-xs flex items-center px-3 ${i === 0 ? 'bg-blue-500/20 text-blue-400' : 'text-slate-600 hover:bg-white/[0.04]'}`}>
                    {item}
                  </div>
                ))}
              </div>

              {/* Main area — Kanban */}
              <div className="col-span-7 grid grid-cols-3 gap-3">
                {[
                  { title: 'To Do', color: 'border-slate-600', items: ['Design system', 'API docs', 'Auth flow'] },
                  { title: 'In Progress', color: 'border-blue-500/50', items: ['Landing page', 'DB schema'] },
                  { title: 'Done', color: 'border-green-500/50', items: ['Wireframes', 'Setup repo', 'CI/CD'] },
                ].map((col) => (
                  <div key={col.title} className="flex flex-col gap-2">
                    <div className={`text-xs font-semibold text-slate-400 pb-1 border-b ${col.color}`}>{col.title}</div>
                    {col.items.map((task) => (
                      <div key={task} className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-slate-400 hover:bg-white/[0.07] transition-colors">
                        {task}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Right — Team & Chat */}
              <div className="col-span-3 flex flex-col gap-3">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-xs text-slate-500 mb-2">Team</div>
                  {['Raihan','Kezia','Budi','Sari'].map((name, i) => (
                    <div key={name} className="flex items-center gap-2 py-1">
                      <div className={`w-5 h-5 rounded-full text-[9px] flex items-center justify-center font-bold text-white`}
                        style={{ background: ['#3B82F6','#8B5CF6','#06B6D4','#10B981'][i] }}>
                        {name[0]}
                      </div>
                      <span className="text-xs text-slate-500">{name}</span>
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400" />
                    </div>
                  ))}
                </div>
                <div className="flex-1 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-xs text-slate-500 mb-2">Live Chat</div>
                  {[
                    { name: 'Raihan', msg: 'API is ready!', color: '#3B82F6' },
                    { name: 'Kezia', msg: 'Merging PR now', color: '#8B5CF6' },
                    { name: 'Budi', msg: 'Tests passing', color: '#06B6D4' },
                  ].map((m) => (
                    <div key={m.name} className="mb-2">
                      <span className="text-[10px] font-bold" style={{ color: m.color }}>{m.name}: </span>
                      <span className="text-[10px] text-slate-500">{m.msg}</span>
                    </div>
                  ))}
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