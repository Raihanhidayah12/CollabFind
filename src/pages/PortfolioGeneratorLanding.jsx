import { useLanguage } from '../i18n/LanguageContext';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, CheckCircle, GitBranch, Sparkles, Star, Trophy, Zap } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import PageNavbar from '../components/PageNavbar';
import Footer from '../components/landing/Footer';

const templates = [
  { name: 'Raihan', role: 'Mobile Developer', skills: ['Flutter', 'Supabase', 'UI Design'], color: '#8B5CF6' },
  { name: 'Sarah', role: 'Product Designer', skills: ['Figma', 'Research', 'Branding'], color: '#EC4899' },
  { name: 'Dimas', role: 'Backend Engineer', skills: ['Node.js', 'Postgres', 'API'], color: '#10B981' },
];

export default function PortfolioGeneratorLanding() { 
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate('/dashboard/portfolio', { replace: true });
      } else {
        setChecking(false);
      }
    });
  }, [navigate]);

  if (checking) {
    return (
      <div className="flex-1 bg-[#050816] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#050816] text-white font-['Manrope',sans-serif]">
      <PageNavbar breadcrumbs={[{ label: 'Portfolio Generator' }]} homePath="/dashboard" />

      <main className="relative pt-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[720px] h-[420px] bg-purple-600/12 rounded-full blur-[130px]" />
          <div className="absolute top-96 left-0 w-[380px] h-[320px] bg-blue-600/8 rounded-full blur-[110px]" />
        </div>

        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
            <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-semibold mb-5">
                <Sparkles size={12} /> Portfolio Generator
              </div>
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.05]" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                Ubah proyek kolaborasi jadi resume publik.
              </h1>
              <p className="text-slate-400 text-lg mt-5 max-w-xl">
                CollabFind merangkum profil, skill, proyek selesai, link GitHub, dan testimoni menjadi portfolio yang siap dikirim ke rekruter.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Link to="/register" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600">
                  Buat Portofolio Gratis <Zap size={15} />
                </Link>
                <Link to="/login" state={{ from: '/dashboard/portfolio' }} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-slate-300 border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08]">
                  Sudah punya akun <ArrowRight size={15} />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              {templates.map((template, index) => (
                <motion.div
                  key={template.name}
                  animate={{ y: [0, index === 1 ? -10 : 8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: index * 0.35 }}
                  className={`rounded-2xl border border-white/[0.08] bg-[#0a0f1e]/85 overflow-hidden ${index === 1 ? 'sm:mt-10' : ''}`}
                >
                  <div className="h-2" style={{ background: `linear-gradient(90deg, ${template.color}, ${template.color}55)` }} />
                  <div className="p-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold mb-4" style={{ background: `${template.color}22`, border: `1px solid ${template.color}44` }}>
                      {template.name[0]}
                    </div>
                    <p className="font-bold text-white">{template.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{template.role}</p>
                    <div className="flex gap-2 my-4">
                      <GitBranch size={14} className="text-slate-500" />
                      <Briefcase size={14} className="text-slate-500" />
                      <Star size={14} className="text-yellow-300" />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {template.skills.map(skill => (
                        <span key={skill} className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.07] text-[10px] text-slate-400">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {[
              ['1.200+', 'portfolio dibuat'],
              ['38%', 'lebih cepat siap apply'],
              ['4.8/5', 'rating portfolio publik'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
                <p className="text-3xl font-extrabold text-white mb-1">{value}</p>
                <p className="text-sm text-slate-500">{label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#0a0f1e]/75 p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                'Ambil proyek selesai dari workspace',
                'Pilih project yang mau dipamerkan',
                'Publikasikan ke /portfolio/username',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-10">
            <Link to="/register" className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-purple-600 to-blue-600">
              Mulai dari proyek pertamamu <Trophy size={15} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
