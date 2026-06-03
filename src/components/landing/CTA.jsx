import { motion } from 'framer-motion';
import { ArrowRight, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-3xl border border-white/[0.1] bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-cyan-600/10 p-12 text-center overflow-hidden"
        >
          {/* Background glows */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, transparent 50%, rgba(139,92,246,0.08) 100%)' }} />

          {/* Animated border */}
          <div className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{ background: 'linear-gradient(90deg, #3B82F6, #8B5CF6, #06B6D4, #3B82F6)', padding: 1, WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', opacity: 0.3 }} />

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute top-8 right-8 w-16 h-16 rounded-full border border-dashed border-blue-500/20 pointer-events-none"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-8 left-8 w-12 h-12 rounded-full border border-dashed border-purple-500/20 pointer-events-none"
          />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-medium mb-6">
              <Users size={14} /> 15,000+ builders already joined
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-5 tracking-tight leading-[1.1]">
              Ready to build your{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                next big project?
              </span>
            </h2>

            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
              Join thousands of students, developers, designers and creators who are
              already collaborating and building portfolio-worthy projects.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="group flex items-center gap-2 px-8 py-4 text-base font-bold text-white rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 shadow-[0_0_40px_rgba(59,130,246,0.4)] hover:shadow-[0_0_60px_rgba(59,130,246,0.6)] transition-all duration-300"
              >
                Start Collaborating
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/discord"
                className="px-8 py-4 text-base font-semibold text-slate-300 hover:text-white rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300">
                Join Community →
              </Link>
            </div>

            <p className="text-xs text-slate-600 mt-6">No credit card required · Free forever plan available</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
