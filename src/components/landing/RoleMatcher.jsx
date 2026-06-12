import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Palette, Briefcase, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';

const QUESTIONS = [
  {
    id: 'role',
    questionKey: 'rm.q1',
    fallbackQ: 'What role do you usually take?',
    options: [
      { value: 'developer', labelKey: 'rm.q1opt1Label', fallbackLabel: 'Developer', icon: Code2, color: '#3B82F6', descKey: 'rm.q1opt1Desc', fallbackDesc: 'Frontend, Backend, or Fullstack' },
      { value: 'designer', labelKey: 'rm.q1opt2Label', fallbackLabel: 'Designer', icon: Palette, color: '#8B5CF6', descKey: 'rm.q1opt2Desc', fallbackDesc: 'UI/UX, Graphic, or Motion' },
      { value: 'pm', labelKey: 'rm.q1opt3Label', fallbackLabel: 'Project Manager', icon: Briefcase, color: '#10B981', descKey: 'rm.q1opt3Desc', fallbackDesc: 'Scrum Master, Product Owner, etc.' },
    ],
  },
  {
    id: 'goal',
    questionKey: 'rm.q2',
    fallbackQ: 'What is your main goal for joining?',
    options: [
      { value: 'build', labelKey: 'rm.q2opt1Label', fallbackLabel: 'Build something cool', icon: Sparkles, color: '#F59E0B', descKey: 'rm.q2opt1Desc', fallbackDesc: 'Have an idea and need a team' },
      { value: 'join', labelKey: 'rm.q2opt2Label', fallbackLabel: 'Join an existing project', icon: ArrowRight, color: '#06B6D4', descKey: 'rm.q2opt2Desc', fallbackDesc: 'Want to contribute to an active project' },
      { value: 'learn', labelKey: 'rm.q2opt3Label', fallbackLabel: 'Learn by doing', icon: Code2, color: '#EC4899', descKey: 'rm.q2opt3Desc', fallbackDesc: 'Looking for real experience' },
    ],
  },
  {
    id: 'time',
    questionKey: 'rm.q3',
    fallbackQ: 'How many hours/week can you commit?',
    options: [
      { value: 'light', labelKey: 'rm.q3opt1Label', fallbackLabel: '1–5 hours', icon: null, color: '#10B981', descKey: 'rm.q3opt1Desc', fallbackDesc: 'Part-time, relaxed' },
      { value: 'medium', labelKey: 'rm.q3opt2Label', fallbackLabel: '6–15 hours', icon: null, color: '#3B82F6', descKey: 'rm.q3opt2Desc', fallbackDesc: 'Serious but flexible' },
      { value: 'heavy', labelKey: 'rm.q3opt3Label', fallbackLabel: '15+ hours', icon: null, color: '#8B5CF6', descKey: 'rm.q3opt3Desc', fallbackDesc: 'All-in, top priority' },
    ],
  },
];

const RESULTS = {
  'developer-build-light':   { title: 'Side Project Explorer', desc: 'Cocok banget sama project weekend yang butuh developer handal tapi nggak makan waktu terlalu banyak.', tag: 'Weekend Builder', color: '#3B82F6' },
  'developer-build-medium':  { title: 'Core Developer', desc: 'Kamu ideal buat jadi tulang punggung tim kecil yang ingin build MVP dalam 1–2 bulan.', tag: 'MVP Builder', color: '#3B82F6' },
  'developer-build-heavy':   { title: 'Lead Developer', desc: 'Passion tinggi + waktu banyak = kandidat sempurna jadi tech lead di project ambisius.', tag: 'Tech Lead', color: '#3B82F6' },
  'developer-join-light':    { title: 'Open Source Contributor', desc: 'Tinggal pilih project open source yang seru dan mulai kontribusi tanpa pressure.', tag: 'Contributor', color: '#06B6D4' },
  'developer-join-medium':   { title: 'Team Player', desc: 'Cocok masuk tim yang sudah punya momentum dan butuh developer berpengalaman.', tag: 'Team Player', color: '#06B6D4' },
  'developer-join-heavy':    { title: 'Full-time Collaborator', desc: 'Siap jadi anggota inti tim yang sedang ngebut menuju launch.', tag: 'Core Member', color: '#8B5CF6' },
  'developer-learn-light':   { title: 'Junior Explorer', desc: 'Temukan project yang ramah untuk pemula dan mulai perjalananmu.', tag: 'Learner', color: '#F59E0B' },
  'developer-learn-medium':  { title: 'Growing Developer', desc: 'Project kolaborasi adalah cara terbaik untuk naik level dengan feedback nyata.', tag: 'Grower', color: '#F59E0B' },
  'developer-learn-heavy':   { title: 'Bootcamp Mode', desc: 'Dengan waktu sebanyak itu, kamu bisa jadi developer solid dalam hitungan bulan.', tag: 'Fast Learner', color: '#10B981' },
  'designer-build-light':    { title: 'Creative Side Hustler', desc: 'Bawa estetika ke project kecil yang butuh sentuhan desain profesional.', tag: 'Side Project', color: '#8B5CF6' },
  'designer-build-medium':   { title: 'Product Designer', desc: 'Kamu bisa punya ownership penuh atas visual identity sebuah produk.', tag: 'Product Owner', color: '#8B5CF6' },
  'designer-build-heavy':    { title: 'Design Lead', desc: 'Build design system dari nol dan guide seluruh experience produk.', tag: 'Design Lead', color: '#EC4899' },
  'designer-join-light':     { title: 'UI Booster', desc: 'Banyak project yang butuh polish UI dari designer berpengalaman seperti kamu.', tag: 'UI Expert', color: '#06B6D4' },
  'designer-join-medium':    { title: 'UX Collaborator', desc: 'Masuk tim yang sudah ada dan elevate pengalaman user mereka.', tag: 'UX Pro', color: '#06B6D4' },
  'designer-join-heavy':     { title: 'Design Partner', desc: 'Jadi mitra strategis tim dalam merancang produk dari user research sampai prototype.', tag: 'Strategic', color: '#8B5CF6' },
  'designer-learn-light':    { title: 'Portfolio Builder', desc: 'Kerjakan case study nyata untuk perkuat portofolio desainmu.', tag: 'Portfolio', color: '#F59E0B' },
  'designer-learn-medium':   { title: 'Design Apprentice', desc: 'Belajar dari senior designer sambil langsung eksekusi di project nyata.', tag: 'Apprentice', color: '#F59E0B' },
  'designer-learn-heavy':    { title: 'Design Sprint Champion', desc: 'Intensif tapi hasilnya luar biasa — portfolio dan skill naik drastis.', tag: 'Intensive', color: '#10B981' },
  'pm-build-light':          { title: 'Idea Validator', desc: 'Validasi ide, bangun lean canvas, dan cari tim yang tepat untuk eksekusi.', tag: 'Ideator', color: '#10B981' },
  'pm-build-medium':         { title: 'Product Founder', desc: 'Kamu punya visi dan waktu untuk build produk dari ide ke MVP bersama tim solid.', tag: 'Founder Mode', color: '#10B981' },
  'pm-build-heavy':          { title: 'Startup Builder', desc: 'All-in membangun produk dari nol — kamu adalah engine di balik tim.', tag: 'Builder', color: '#3B82F6' },
  'pm-join-light':           { title: 'Project Advisor', desc: 'Bantu tim yang ada dengan guidance dan struktur tanpa harus full commit.', tag: 'Advisor', color: '#06B6D4' },
  'pm-join-medium':          { title: 'Scrum Master', desc: 'Masuk tim yang butuh seseorang yang bisa pegang ritme sprint dan delivery.', tag: 'Scrum Master', color: '#06B6D4' },
  'pm-join-heavy':           { title: 'Product Lead', desc: 'Ambil alih roadmap dan jadilah suara product di tim yang sedang scaling.', tag: 'Product Lead', color: '#8B5CF6' },
  'pm-learn-light':          { title: 'PM Apprentice', desc: 'Pelajari cara kerja tim produk nyata sambil tetap punya waktu untuk hal lain.', tag: 'Learner', color: '#F59E0B' },
  'pm-learn-medium':         { title: 'Associate PM', desc: 'Kendalikan fitur kecil, tulis PRD pertamamu, dan belajar dari tim langsung.', tag: 'Associate', color: '#F59E0B' },
  'pm-learn-heavy':          { title: 'PM Fast Track', desc: 'Masuk project yang kompleks dan jadilah PM berpengalaman dalam waktu singkat.', tag: 'Fast Track', color: '#10B981' },
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
};

export default function RoleMatcher() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const { t } = useLanguage();

  const currentQ = QUESTIONS[step];

  const handleSelect = (value) => {
    const newAnswers = { ...answers, [currentQ.id]: value };
    setAnswers(newAnswers);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setDone(true);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setDone(false);
  };

  const resultKey = done ? `${answers.role}-${answers.goal}-${answers.time}` : null;
  const result = resultKey ? (RESULTS[resultKey] || RESULTS['developer-build-medium']) : null;

  return (
    <section className="role-matcher-section py-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/8 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-medium mb-4">
            <Sparkles size={12} /> {t('rm.badge', 'Role Matcher')}
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            {t('rm.heading', 'Find out where you fit')}{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{t('rm.headingHighlight', 'best')}</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            {t('rm.subtitle', 'Answer 3 quick questions, we show the projects and roles that best match you.')}
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {/* Progress bar */}
          <div className="flex gap-2 mb-8">
            {QUESTIONS.map((_, i) => (
              <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-white/[0.07]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                  initial={{ width: '0%' }}
                  animate={{ width: done || i < step ? '100%' : i === step ? '50%' : '0%' }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {!done ? (
              <motion.div key={`q-${step}`} {...fadeUp}>
                <div className="p-8 rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm">
                  <p className="text-xs text-slate-500 mb-2">{t('rm.questionOf', 'Question')} {step + 1} {t('rm.of', 'of')} {QUESTIONS.length}</p>
                  <h3 className="text-xl font-bold text-white mb-6">{t(currentQ.questionKey, currentQ.fallbackQ)}</h3>
                  <div className="flex flex-col gap-3">
                    {currentQ.options.map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <motion.button
                          key={opt.value}
                          onClick={() => handleSelect(opt.value)}
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          className="group flex items-center gap-4 p-4 rounded-2xl border border-white/[0.07] hover:border-white/[0.18] bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200 text-left"
                        >
                          {Icon && (
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:scale-110"
                              style={{ background: `${opt.color}18`, border: `1px solid ${opt.color}33` }}
                            >
                              <Icon size={18} style={{ color: opt.color }} />
                            </div>
                          )}
                          {!Icon && (
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
                              style={{ background: `${opt.color}18`, border: `1px solid ${opt.color}33`, color: opt.color }}
                            >
                              {t(opt.labelKey, opt.fallbackLabel).split('–')[0]}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-white group-hover:text-blue-200 transition-colors">{t(opt.labelKey, opt.fallbackLabel)}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{t(opt.descKey, opt.fallbackDesc)}</p>
                          </div>
                          <ArrowRight size={16} className="ml-auto text-slate-600 group-hover:text-slate-300 group-hover:translate-x-1 transition-all" />
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="result" {...fadeUp}>
                <div
                  className="p-8 rounded-3xl border backdrop-blur-sm text-center relative overflow-hidden"
                  style={{ borderColor: `${result.color}33`, background: `${result.color}08` }}
                >
                  <div
                    className="absolute inset-0 opacity-30 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at 50% 0%, ${result.color}22, transparent 70%)` }}
                  />
                  <div className="relative z-10">
                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4"
                      style={{ background: `${result.color}22`, color: result.color, border: `1px solid ${result.color}44` }}
                    >
                      <Sparkles size={11} /> {t(result.tagKey, result.fallbackTag)}
                    </div>
                    <h3 className="text-3xl font-extrabold text-white mb-3">{t(result.titleKey, result.fallbackTitle)}</h3>
                    <p className="text-slate-400 mb-8 max-w-sm mx-auto leading-relaxed">{t(result.descKey, result.fallbackDesc)}</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <Link
                        to="/explore"
                        className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 shadow-[0_0_24px_rgba(139,92,246,0.35)] hover:shadow-[0_0_36px_rgba(139,92,246,0.5)] transition-all duration-300"
                      >
                        {t('rm.viewMatches', 'See Matching Projects')}
                        <ArrowRight size={16} />
                      </Link>
                      <button
                        onClick={reset}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white border border-white/[0.08] hover:border-white/[0.18] bg-white/[0.03] hover:bg-white/[0.07] transition-all duration-200"
                      >
                        <RotateCcw size={14} /> {t('rm.tryAgain', 'Try Again')}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
