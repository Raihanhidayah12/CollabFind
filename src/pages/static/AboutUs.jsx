import { useLanguage } from '../../i18n/LanguageContext';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Users, Target, Heart } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import Footer from '../../components/landing/Footer';
import PageNavbar from '../../components/PageNavbar';

const values = [
  { icon: Users,  color: '#3B82F6', title: 'Community First',    desc: 'We believe great projects are built by great teams. Our platform is designed to connect the right people at the right time.' },
  { icon: Target, color: '#8B5CF6', title: 'Skill-Based Matching', desc: 'Stop searching endlessly. Our smart matching surfaces projects and collaborators that align with your actual skills and goals.' },
  { icon: Heart,  color: '#EC4899', title: 'Built for Builders',  desc: 'From students to indie hackers, CollabFind is designed for anyone who wants to build something real with others.' },
];

export default function AboutUs() { 
  const { t } = useLanguage();
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
  }, []);
  return (
    <div className="bg-[#050816]" style={{ fontFamily: "'Manrope',sans-serif" }}>
      <PageNavbar breadcrumbs={[{ label: 'About Us', href: null }]} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-medium mb-6">
            <Zap size={11} /> Our Story
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 tracking-tight" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
            We're building the{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              collaboration layer
            </span>{' '}
            for the next generation of builders.
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            CollabFind was born out of a simple frustration: finding the right people to build with is still too hard. 
            We're changing that.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-8 rounded-3xl border border-white/[0.08] bg-gradient-to-br from-blue-600/10 via-purple-600/8 to-transparent mb-16"
        >
          <h2 className="text-2xl font-extrabold text-white mb-3" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>Our Mission</h2>
          <p className="text-slate-400 leading-relaxed text-base">
            To make meaningful collaboration accessible to every student, developer, designer, and creator — 
            regardless of where they are or what they're building. We connect talent with opportunity, 
            and ideas with the people who can bring them to life.
          </p>
        </motion.div>

        {/* Values */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h2 className="text-2xl font-extrabold text-white mb-8 text-center" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>What We Stand For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {values.map((v) => (
              <div key={v.title} className="p-6 rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${v.color}18`, border: `1px solid ${v.color}33` }}>
                  <v.icon size={20} style={{ color: v.color }} />
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{v.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-center mt-16">
          {session ? (
            <Link to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 shadow-[0_0_24px_rgba(59,130,246,0.3)] transition-all">
              Go to Dashboard →
            </Link>
          ) : (
            <Link to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 shadow-[0_0_24px_rgba(59,130,246,0.3)] transition-all">
              Join CollabFind →
            </Link>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
