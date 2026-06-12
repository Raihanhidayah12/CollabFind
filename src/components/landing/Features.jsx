import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles, Users, MessageSquare, CheckSquare, BookOpen, Star,
  Zap, Code2, Settings, Globe, Shield, Bell, Layout,
} from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import { useLanguage } from '../../i18n/LanguageContext';
import SmartMatchDemo from './SmartMatchDemo';
import ChatDemo from './ChatDemo';
import WorkspacePreviewModal from './WorkspacePreviewModal';
import TaskManagementDemo from './TaskManagementDemo';
import PortfolioDemo from './PortfolioDemo';
import SkillBasedDemo from './SkillBasedDemo';

const ICON_MAP = {
  Sparkles, Users, MessageSquare, CheckSquare, BookOpen, Star,
  Zap, Code2, Settings, Globe, Shield, Bell,
};

function SkeletonCard() {
  return (
    <div className="p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-white/[0.06] mb-4" />
      <div className="h-4 w-3/4 rounded bg-white/[0.06] mb-2" />
      <div className="h-3 w-full rounded bg-white/[0.04]" />
      <div className="h-3 w-5/6 rounded bg-white/[0.04] mt-1.5" />
    </div>
  );
}

export default function Features({ isDashboard = false, firstWorkspaceId = null, userSkills, recommendations, displayName }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDemo, setShowDemo] = useState(false);
  const [showChatDemo, setShowChatDemo] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showTaskDemo, setShowTaskDemo] = useState(false);
  const [showPortfolioDemo, setShowPortfolioDemo] = useState(false);
  const [showSkillDemo, setShowSkillDemo] = useState(false);

  useEffect(() => {
    supabase
      .from('features')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (data) setFeatures(data);
        setLoading(false);
      });
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleWorkspaceAction = () => {
    if (firstWorkspaceId) {
      navigate(`/dashboard/workspace/${firstWorkspaceId}`);
    } else {
      alert(t('feat.noWorkspace'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getDashboardAction = (title) => {
    switch (title) {
      case 'Smart Project Matching': return { label: t('feat.viewRecommendations'), action: () => scrollTo('recommendations') };
      case 'Team Collaboration Workspace': return { label: t('feat.openWorkspace'), action: handleWorkspaceAction };
      case 'Real-time Chat': return { label: t('feat.openChat'), link: '/dashboard/chat' };
      case 'Task Management': return { label: t('feat.openBoard'), action: handleWorkspaceAction };
      case 'Portfolio Generator': return { label: t('feat.editPortfolio'), link: '/dashboard/portfolio' };
      case 'Skill-Based Recommendations': return { label: t('feat.viewRecommendations'), action: () => scrollTo('recommendations') };
      default: return { label: t('feat.openFeature'), action: handleWorkspaceAction };
    }
  };

  return (
    <section id="features" className="features-section py-24 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-[500px] h-[400px] bg-blue-600/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-medium mb-4">
            <Sparkles size={12} /> {isDashboard ? t('feat.badgeDashboard') : t('feat.badge')}
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            {isDashboard ? t('feat.headingDashboard') : t('feat.heading')}{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{t('feat.ship')}</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            {isDashboard
              ? t('feat.subtitleDashboard')
              : t('feat.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : features.map((f, i) => {
              const Icon = ICON_MAP[f.icon] || Zap;
              const isSmartMatch = f.title === 'Smart Project Matching';
              const isSkillBased = f.title === 'Skill-Based Recommendations';
              const isWorkspace = f.title === 'Team Collaboration Workspace';
              const isChat = f.title === 'Real-time Chat';
              const isTask = f.title === 'Task Management';
              const isPortfolio = f.title === 'Portfolio Generator';
              return (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                  onClick={isWorkspace ? () => setShowWorkspaceModal(true) : undefined}
                  className={`group relative p-6 rounded-2xl border border-white/[0.07] hover:border-white/[0.14] transition-all duration-300 overflow-hidden flex flex-col ${isWorkspace ? 'cursor-pointer' : ''}`}
                  style={{ background: `linear-gradient(135deg, ${f.color}14, ${f.color}05)` }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                    style={{ background: `${f.color}18`, border: `1px solid ${f.color}33`, boxShadow: `0 0 20px ${f.color}22` }}
                  >
                    <Icon size={22} style={{ color: f.color }} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed flex-1">{f.description}</p>

                  {/* Smart Match demo button */}
                  {isSmartMatch && (
                    <button
                      onClick={() => setShowDemo(true)}
                      className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors self-start"
                    >
                      <Sparkles size={12} /> {t('feat.seeHowItWorks')} →
                    </button>
                  )}

                  {/* Skill-Based Recommendations demo button */}
                  {isSkillBased && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowSkillDemo(true); }}
                      className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors self-start"
                    >
                      <Sparkles size={12} /> {t('feat.seeHowItWorks')} →
                    </button>
                  )}

                  {/* Workspace preview button */}
                  {isWorkspace && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowWorkspaceModal(true); }}
                      className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors self-start"
                    >
                      <Users size={12} /> {t('feat.seePreview')} →
                    </button>
                  )}

                  {/* Chat demo button */}
                  {isChat && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowChatDemo(true); }}
                      className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors self-start"
                    >
                      <MessageSquare size={12} /> {t('feat.seeHowItWorks')} →
                    </button>
                  )}

                  {/* Task Management demo button */}
                  {isTask && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowTaskDemo(true); }}
                      className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors self-start"
                    >
                      <CheckSquare size={12} /> {t('feat.seeHowItWorks')} →
                    </button>
                  )}

                  {/* Portfolio Generator demo button */}
                  {isPortfolio && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowPortfolioDemo(true); }}
                      className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors self-start"
                    >
                      <Layout size={12} /> {t('feat.seeHowItWorks')} →
                    </button>
                  )}

                  {/* Action button */}
                  {isDashboard ? (
                    getDashboardAction(f.title).link ? (
                      <Link
                        to={getDashboardAction(f.title).link}
                        className="mt-4 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-semibold text-white border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.09] transition-all self-start"
                      >
                        {getDashboardAction(f.title).label} <Zap size={12} style={{ color: f.color }} />
                      </Link>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); getDashboardAction(f.title).action(); }}
                        className="mt-4 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-semibold text-white border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.09] transition-all self-start"
                      >
                        {getDashboardAction(f.title).label} <Zap size={12} style={{ color: f.color }} />
                      </button>
                    )
                  ) : (
                    <Link
                      to="/login"
                      state={{ from: '/dashboard' }}
                      className="mt-4 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-semibold text-white border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.09] transition-all self-start"
                    >
                      {t('feat.tryNow')} <Zap size={12} />
                    </Link>
                  )}

                  {/* Corner accent */}
                  <div
                    className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ background: `radial-gradient(circle at 100% 0%, ${f.color}20, transparent 70%)` }}
                  />
                </motion.div>
              );
            })
          }
        </div>

        {/* Smart Match Demo Modal */}
        {showDemo && (
          <SmartMatchDemo 
            onClose={() => setShowDemo(false)} 
            userSkills={userSkills} 
            recommendations={recommendations} 
            displayName={displayName} 
          />
        )}

        {/* Skill-Based Recommendations Demo Modal */}
        {showSkillDemo && (
          <SkillBasedDemo 
            onClose={() => setShowSkillDemo(false)} 
            isLoggedIn={isDashboard}
          />
        )}

        {/* Workspace Preview Modal */}
        {showWorkspaceModal && (
          <WorkspacePreviewModal
            onClose={() => setShowWorkspaceModal(false)}
            isLoggedIn={isDashboard}
            firstWorkspaceId={firstWorkspaceId}
          />
        )}

        {/* Chat Demo Modal */}
        {showChatDemo && (
          <ChatDemo
            onClose={() => setShowChatDemo(false)}
            isLoggedIn={isDashboard}
          />
        )}

        {/* Task Management Demo Modal */}
        {showTaskDemo && (
          <TaskManagementDemo
            onClose={() => setShowTaskDemo(false)}
            isLoggedIn={isDashboard}
            firstWorkspaceId={firstWorkspaceId}
          />
        )}

        {/* Portfolio Demo Modal */}
        {showPortfolioDemo && (
          <PortfolioDemo
            onClose={() => setShowPortfolioDemo(false)}
            isLoggedIn={isDashboard}
          />
        )}
      </div>
    </section>
  );
}
