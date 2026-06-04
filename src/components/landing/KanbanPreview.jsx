import { motion } from 'framer-motion';

const columns = [
  {
    title: 'To Do',
    color: '#94A3B8',
    borderColor: 'border-slate-600/50',
    cards: [
      { title: 'Design onboarding flow', tag: 'Design', tagColor: '#EC4899', assignee: 'S' },
      { title: 'Write API documentation', tag: 'Docs', tagColor: '#94A3B8', assignee: 'D' },
      { title: 'Set up CI/CD pipeline', tag: 'DevOps', tagColor: '#F59E0B', assignee: 'K' },
    ],
  },
  {
    title: 'In Progress',
    color: '#3B82F6',
    borderColor: 'border-blue-500/50',
    cards: [
      { title: 'Build authentication system', tag: 'Backend', tagColor: '#10B981', assignee: 'A', progress: 70 },
      { title: 'Create project dashboard UI', tag: 'Frontend', tagColor: '#3B82F6', assignee: 'R', progress: 45 },
    ],
  },
  {
    title: 'Review',
    color: '#F59E0B',
    borderColor: 'border-amber-500/50',
    cards: [
      { title: 'User profile page', tag: 'Frontend', tagColor: '#3B82F6', assignee: 'L' },
      { title: 'Database schema optimization', tag: 'Backend', tagColor: '#10B981', assignee: 'K' },
    ],
  },
  {
    title: 'Completed',
    color: '#10B981',
    borderColor: 'border-emerald-500/50',
    cards: [
      { title: 'Wireframes & prototypes', tag: 'Design', tagColor: '#EC4899', assignee: 'S' },
      { title: 'Project setup & repo', tag: 'DevOps', tagColor: '#F59E0B', assignee: 'A' },
      { title: 'Tech stack decision', tag: 'Planning', tagColor: '#8B5CF6', assignee: 'D' },
    ],
  },
];

const avatarColors = { A: '#3B82F6', S: '#EC4899', K: '#06B6D4', D: '#8B5CF6', L: '#10B981', R: '#F97316' };

export default function KanbanPreview() {
  return (
    <section className="kanban-section py-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Collaboration{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Dashboard</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            A beautiful Kanban board to manage your team's workflow from idea to launch.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {/* Glow frame */}
          <div className="absolute -inset-3 bg-gradient-to-r from-blue-600/15 via-purple-600/15 to-cyan-600/15 rounded-3xl blur-2xl" />

          <div className="relative rounded-2xl border border-white/[0.08] bg-[#080d1a]/90 backdrop-blur-sm overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
            {/* Top bar */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <span className="text-sm font-semibold text-slate-400">CollabFind — Food Delivery App</span>
              </div>
              <div className="flex -space-x-1.5">
                {['A','S','K','L'].map((a) => (
                  <div key={a} className="w-6 h-6 rounded-full border-2 border-[#080d1a] flex items-center justify-center text-[9px] font-bold text-white"
                    style={{ background: avatarColors[a] }}>
                    {a}
                  </div>
                ))}
                <div className="w-6 h-6 rounded-full border-2 border-[#080d1a] bg-white/10 flex items-center justify-center text-[9px] text-slate-400">+2</div>
              </div>
            </div>

            {/* Kanban columns */}
            <div className="p-5 grid grid-cols-4 gap-4 overflow-x-auto">
              {columns.map((col, ci) => (
                <div key={col.title} className="min-w-[180px]">
                  {/* Column header */}
                  <div className={`flex items-center gap-2 pb-3 mb-3 border-b ${col.borderColor}`}>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
                    <span className="text-xs font-semibold text-slate-400">{col.title}</span>
                    <span className="ml-auto text-xs text-slate-600 bg-white/[0.05] px-1.5 py-0.5 rounded-md">
                      {col.cards.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="flex flex-col gap-2">
                    {col.cards.map((card, ki) => (
                      <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: ci * 0.05 + ki * 0.06 }}
                        whileHover={{ scale: 1.02, y: -1 }}
                        className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.07] transition-all duration-200 cursor-pointer"
                      >
                        <p className="text-xs text-slate-300 mb-2.5 leading-snug">{card.title}</p>

                        {card.progress !== undefined && (
                          <div className="mb-2.5">
                            <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                                style={{ width: `${card.progress}%` }} />
                            </div>
                            <div className="text-[10px] text-slate-600 mt-1">{card.progress}%</div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium"
                            style={{ background: `${card.tagColor}18`, color: card.tagColor, border: `1px solid ${card.tagColor}33` }}>
                            {card.tag}
                          </span>
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                            style={{ background: avatarColors[card.assignee] }}>
                            {card.assignee}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
