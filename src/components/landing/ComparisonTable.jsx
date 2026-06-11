import { motion } from 'framer-motion';
import { Check, X, Minus, Zap } from 'lucide-react';

const FEATURES = [
  { label: 'Project matching berbasis skill', collabfind: true,  github: false, upwork: false, discord: false },
  { label: 'Workspace kolaborasi terintegrasi', collabfind: true,  github: 'partial', upwork: false, discord: false },
  { label: 'Kanban & task management',         collabfind: true,  github: 'partial', upwork: false, discord: false },
  { label: 'Real-time team chat',              collabfind: true,  github: false, upwork: false, discord: true },
  { label: 'Portfolio generator otomatis',     collabfind: true,  github: false, upwork: false, discord: false },
  { label: 'Smart teammate recommendation',   collabfind: true,  github: false, upwork: false, discord: false },
  { label: 'Gratis untuk semua fitur dasar',   collabfind: true,  github: true,  upwork: false, discord: true },
  { label: 'Fokus untuk pelajar & builder',    collabfind: true,  github: false, upwork: false, discord: false },
  { label: 'Version control & code hosting',  collabfind: false, github: true,  upwork: false, discord: false },
  { label: 'Freelance marketplace',           collabfind: false, github: false, upwork: true,  discord: false },
];

const PLATFORMS = [
  { key: 'collabfind', label: 'CollabFind', color: '#3B82F6', highlight: true },
  { key: 'github',     label: 'GitHub',     color: '#6B7280', highlight: false },
  { key: 'upwork',     label: 'Upwork',     color: '#6B7280', highlight: false },
  { key: 'discord',    label: 'Discord',    color: '#6B7280', highlight: false },
];

function Cell({ value, isCollabFind }) {
  if (value === true) {
    return (
      <div className={`flex items-center justify-center ${isCollabFind ? 'text-green-400' : 'text-slate-500'}`}>
        <Check size={16} strokeWidth={2.5} />
      </div>
    );
  }
  if (value === 'partial') {
    return (
      <div className="flex items-center justify-center text-yellow-600">
        <Minus size={16} strokeWidth={2.5} />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center text-slate-700">
      <X size={14} strokeWidth={2} />
    </div>
  );
}

export default function ComparisonTable() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/6 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-medium mb-4">
            <Zap size={12} /> Why CollabFind?
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Beda dari platform{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">lainnya</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            CollabFind satu-satunya platform yang dibangun khusus untuk kolaborasi project — bukan sekadar coding platform atau chat tool.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-white/[0.08] overflow-hidden"
        >
          {/* Header row */}
          <div className="grid bg-white/[0.03] border-b border-white/[0.06]"
            style={{ gridTemplateColumns: '1fr repeat(4, minmax(0, 1fr))' }}>
            <div className="p-4 text-xs text-slate-600 uppercase tracking-wider font-medium">Fitur</div>
            {PLATFORMS.map((p) => (
              <div
                key={p.key}
                className={`p-4 text-center text-sm font-bold ${p.highlight ? 'text-white' : 'text-slate-500'}`}
              >
                {p.highlight ? (
                  <span
                    className="px-3 py-1 rounded-lg text-white"
                    style={{ background: `${p.color}22`, border: `1px solid ${p.color}44` }}
                  >
                    {p.label}
                  </span>
                ) : p.label}
              </div>
            ))}
          </div>

          {/* Feature rows */}
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className={`grid border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors duration-150 ${
                i === FEATURES.length - 1 ? 'border-b-0' : ''
              }`}
              style={{ gridTemplateColumns: '1fr repeat(4, minmax(0, 1fr))' }}
            >
              <div className="px-4 py-3.5 text-sm text-slate-400">{feature.label}</div>
              {PLATFORMS.map((p) => (
                <div
                  key={p.key}
                  className={`px-4 py-3.5 ${p.highlight ? 'bg-blue-500/[0.04]' : ''}`}
                >
                  <Cell value={feature[p.key]} isCollabFind={p.highlight} />
                </div>
              ))}
            </motion.div>
          ))}
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-6 mt-5 text-xs text-slate-600"
        >
          <span className="flex items-center gap-1.5"><Check size={12} className="text-green-400" /> Tersedia</span>
          <span className="flex items-center gap-1.5"><Minus size={12} className="text-yellow-600" /> Sebagian</span>
          <span className="flex items-center gap-1.5"><X size={12} className="text-slate-700" /> Tidak ada</span>
        </motion.div>
      </div>
    </section>
  );
}
