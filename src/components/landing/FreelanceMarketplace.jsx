import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Briefcase, DollarSign, Users, CheckCircle, ArrowRight,
  Shield, Clock, Zap, MessageSquare, Star,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

function MockJobCard({ delay, t }) {
  return (
    <motion.div {...fadeUp(delay)} className="rounded-xl border border-white/[0.08] bg-[#0a0f1e]/80 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-green-400 bg-green-400/10 border border-green-400/20">{t('fm.open')}</span>
        <span className="text-[10px] text-slate-500">2h ago</span>
      </div>
      <h4 className="text-xs font-bold text-white mb-1">Build React Analytics Dashboard</h4>
      <p className="text-[10px] text-slate-500 mb-2 line-clamp-2">Need an experienced React developer to build a real-time analytics dashboard with charts and filters.</p>
      <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-2">
        <DollarSign size={10} className="text-green-400" /> $800 - $1,200 ({t('fm.fixed')})
      </div>
      <div className="flex gap-1">
        <span className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.07] text-[9px] text-slate-400">React</span>
        <span className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.07] text-[9px] text-slate-400">Chart.js</span>
        <span className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.07] text-[9px] text-slate-400">TypeScript</span>
      </div>
    </motion.div>
  );
}

function MockFreelancerCard({ delay, t }) {
  return (
    <motion.div {...fadeUp(delay)} className="rounded-xl border border-white/[0.08] bg-[#0a0f1e]/80 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/25 to-blue-500/25 border border-white/[0.1] flex items-center justify-center text-xs font-bold text-white">R</div>
        <div>
          <p className="text-xs font-bold text-white">Rina K.</p>
          <p className="text-[10px] text-slate-500">Full-stack Dev</p>
        </div>
        <span className="ml-auto px-1.5 py-0.5 rounded-full text-[9px] font-semibold text-green-400 bg-green-400/10 border border-green-400/20">{t('fm.available')}</span>
      </div>
      <div className="flex gap-1 mb-2">
        <span className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.07] text-[9px] text-slate-400">React</span>
        <span className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.07] text-[9px] text-slate-400">Node.js</span>
        <span className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.07] text-[9px] text-slate-400">PostgreSQL</span>
      </div>
      <div className="flex items-center gap-3 text-[10px] text-slate-400">
        <span className="flex items-center gap-1"><DollarSign size={9} className="text-green-400" /> $45/hr</span>
        <span className="flex items-center gap-1"><Star size={9} className="text-yellow-400" /> 12 {t('fm.jobs')}</span>
      </div>
    </motion.div>
  );
}

function MockMilestone({ t }) {
  return (
    <motion.div {...fadeUp(0.3)} className="rounded-xl border border-white/[0.08] bg-[#0a0f1e]/80 p-4">
      <h4 className="text-[10px] font-bold text-blue-300/70 uppercase tracking-wider mb-3">{t('fm.milestoneProgress')}</h4>
      {[
        { title: 'Design Mockups', status: 'approved', amount: 300 },
        { title: 'Frontend Development', status: 'submitted', amount: 500 },
        { title: 'Testing & Deploy', status: 'pending', amount: 200 },
      ].map((m, i) => {
        const colors = { approved: '#10B981', submitted: '#3B82F6', pending: '#F59E0B' };
        const color = colors[m.status];
        return (
          <div key={i} className="flex items-center gap-2 py-1.5">
            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border" style={{ borderColor: color, background: `${color}18` }}>
              {m.status === 'approved' ? <CheckCircle size={10} style={{ color }} /> : <Clock size={10} style={{ color }} />}
            </div>
            <span className="text-[10px] text-white flex-1">{m.title}</span>
            <span className="text-[10px] text-slate-500">${m.amount}</span>
          </div>
        );
      })}
    </motion.div>
  );
}

function getFeatures(t) {
  return [
    { icon: Shield, titleKey: 'fm.feat1Title', descKey: 'fm.feat1Desc' },
    { icon: Zap, titleKey: 'fm.feat2Title', descKey: 'fm.feat2Desc' },
    { icon: Users, titleKey: 'fm.feat3Title', descKey: 'fm.feat3Desc' },
    { icon: MessageSquare, titleKey: 'fm.feat4Title', descKey: 'fm.feat4Desc' },
  ];
}

export default function FreelanceMarketplaceSection() {
  const { t } = useLanguage();
  const features = getFeatures(t);

  return (
    <section id="marketplace" className="freelance-section relative py-24 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-[500px] h-[400px] bg-blue-600/6 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/6 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div {...fadeUp(0)}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-semibold mb-5">
                <Briefcase size={12} /> Freelance Marketplace
              </div>
            </motion.div>

            <motion.h2 {...fadeUp(0.05)}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5"
              style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
              {t('fm.heading')}{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {t('fm.headingHighlight')}
              </span>
            </motion.h2>

            <motion.p {...fadeUp(0.1)} className="text-slate-400 text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
              {t('fm.subtitle')}
            </motion.p>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div key={f.titleKey} {...fadeUp(0.15 + i * 0.05)} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={14} className="text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white mb-0.5">{t(f.titleKey)}</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{t(f.descKey)}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.div {...fadeUp(0.4)} className="flex flex-wrap gap-3">
              <Link to="/freelance" className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition-all shadow-lg shadow-blue-500/20">
                {t('fm.findFreelancer')} <ArrowRight size={15} />
              </Link>
              <Link to="/freelance" className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-slate-300 border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] transition-all">
                {t('fm.becomeFreelancer')}
              </Link>
            </motion.div>
          </div>

          <motion.div {...fadeUp(0.2)} className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl" />
            <div className="relative grid grid-cols-2 gap-3 p-4">
              <div className="space-y-3">
                <MockJobCard delay={0.15} t={t} />
                <MockFreelancerCard delay={0.2} t={t} />
              </div>
              <div className="space-y-3 pt-8">
                <MockJobCard delay={0.25} t={t} />
                <MockMilestone t={t} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
