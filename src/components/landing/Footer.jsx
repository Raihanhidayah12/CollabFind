import { useState } from 'react';
import { Zap, GitBranch, Globe, Briefcase, Camera, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../AuthProvider';

const linkGroups = {
  Product: [
    { labelKey: 'footer.exploreProjects',    to: '/explore' },
    { labelKey: 'footer.findTeammates',      to: '/teammates' },
    { labelKey: 'footer.features',           to: '/features' },
    { labelKey: 'footer.portfolioGenerator', to: '/portfolio-generator' },
    { labelKey: 'footer.hackathons',         to: '/hackathons' },
  ],
  Community: [
    { labelKey: 'footer.discord',    to: '/discord' },
    { labelKey: 'footer.forum',      to: '/forum' },
    { labelKey: 'footer.events',     to: '/events' },
    { labelKey: 'footer.newsletter', to: '/newsletter' },
  ],
  Resources: [
    { labelKey: 'footer.documentation', to: '/docs' },
    { labelKey: 'footer.apiReference',  to: '/api' },
    { labelKey: 'footer.blog',          to: '/blog' },
    { labelKey: 'footer.changelog',     to: '/changelog' },
    { labelKey: 'footer.statusPage',    to: '/status' },
  ],
  Company: [
    { labelKey: 'footer.aboutUs',  to: '/about' },
    { labelKey: 'footer.careers',  to: '/careers' },
    { labelKey: 'footer.pressKit', to: '/press' },
  ],
  Legal: [
    { labelKey: 'footer.privacyPolicy',  to: '/privacy' },
    { labelKey: 'footer.termsOfService', to: '/terms' },
  ],
};

const socials = [
  { icon: GitBranch, href: '#', label: 'GitHub' },
  { icon: Globe,     href: '#', label: 'Twitter' },
  { icon: Briefcase, href: '#', label: 'LinkedIn' },
  { icon: Camera,    href: '#', label: 'Instagram' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { t } = useLanguage();
  const { session } = useAuth();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <footer className="border-t border-white/[0.06] bg-[#030712]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Top */}
        <div className="grid grid-cols-1 md:grid-cols-8 gap-10 mb-12">

          {/* Brand col — spans 2 */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_16px_rgba(59,130,246,0.4)]">
                <Zap size={16} className="text-white" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">
                Collab<span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Find</span>
              </span>
            </Link>

            <p className="text-sm text-slate-500 leading-relaxed mb-5 max-w-xs">
              {t('footer.tagline')}
            </p>

            {/* Social icons */}
            <div className="flex gap-2 mb-6">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-slate-500 hover:text-white hover:border-white/[0.15] hover:bg-white/[0.07] transition-all duration-200"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>

            {/* Newsletter */}
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2">{t('footer.newsletterTitle')}</p>
              {submitted ? (
                <p className="text-xs text-green-400">{t('footer.newsletterSuccess')}</p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('footer.newsletterPlaceholder')}
                    className="flex-1 min-w-0 px-3 py-2 text-xs rounded-lg border border-white/[0.08] bg-white/[0.04] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-blue-500/30 hover:bg-blue-500/50 border border-blue-500/30 transition-all flex-shrink-0"
                  >
                    <ArrowRight size={13} />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(linkGroups).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{t(`footer.${section.toLowerCase()}`)}</h4>
              <ul className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <li key={item.labelKey}>
                    <Link to={item.to} className="text-sm text-slate-500 hover:text-slate-300 transition-colors duration-200">
                      {t(item.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Get started CTA col */}
          <div className="flex flex-col gap-3">
            {session ? (
              <>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('footer.dashboard')}</h4>
                <Link
                  to="/dashboard"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 shadow-[0_0_20px_rgba(59,130,246,0.25)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all duration-300"
                >
                  {t('footer.goToDashboard')} <ArrowRight size={14} />
                </Link>
                <Link
                  to="/explore"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white border border-white/[0.08] hover:border-white/[0.18] hover:bg-white/[0.04] transition-all duration-200"
                >
                  {t('hero.exploreProjects')}
                </Link>
              </>
            ) : (
              <>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('footer.getStarted')}</h4>
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 shadow-[0_0_20px_rgba(59,130,246,0.25)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all duration-300"
                >
                  {t('nav.signUp')} <ArrowRight size={14} />
                </Link>
                <Link
                  to="/explore"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white border border-white/[0.08] hover:border-white/[0.18] hover:bg-white/[0.04] transition-all duration-200"
                >
                  {t('hero.exploreProjects')}
                </Link>
                <div className="mt-2 p-3 rounded-xl border border-white/[0.05] bg-white/[0.02]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-slate-500">{t('common.success')}</span>
                  </div>
                  <p className="text-[11px] text-slate-600">{t('cta.noCreditCard')}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-white/[0.05] gap-4">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} CollabFind. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-1 text-xs text-slate-600">
            {t('footer.builtWith')}
          </div>
        </div>
      </div>
    </footer>
  );
}
