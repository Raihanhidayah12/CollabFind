import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Folder, Users, Settings, User, Plus,
  MessageSquare, Zap, Home, FileText, Calendar, Briefcase,
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useLanguage } from '../i18n/LanguageContext';

const NAV_ITEMS = [
  { labelKey: 'cp.navDashboard',     href: '/dashboard',          icon: Home,          catKey: 'cp.catNavigation' },
  { labelKey: 'cp.navExplore',       href: '/explore',            icon: Folder,        catKey: 'cp.catNavigation' },
  { labelKey: 'cp.navTeammates',     href: '/teammates',          icon: Users,         catKey: 'cp.catNavigation' },
  { labelKey: 'cp.navCreate',        href: '/create-project',     icon: Plus,          catKey: 'cp.catNavigation' },
  { labelKey: 'cp.navChat',          href: '/dashboard/chat',     icon: MessageSquare, catKey: 'cp.catNavigation' },
  { labelKey: 'cp.navFreelance',     href: '/freelance',          icon: Briefcase,     catKey: 'cp.catNavigation' },
  { labelKey: 'cp.navPostJob',       href: '/freelance/post',     icon: Briefcase,     catKey: 'cp.catNavigation' },
  { labelKey: 'cp.navFreelanceDash', href: '/freelance/dashboard',icon: Briefcase,     catKey: 'cp.catNavigation' },
  { labelKey: 'cp.navProfile',       href: '/profile',            icon: User,          catKey: 'cp.catNavigation' },
  { labelKey: 'cp.navSettings',      href: '/settings',           icon: Settings,      catKey: 'cp.catNavigation' },
  { labelKey: 'cp.navPortfolio',     href: '/dashboard/portfolio',icon: Zap,           catKey: 'cp.catNavigation' },
  { labelKey: 'cp.navDocs',          href: '/docs',               icon: FileText,      catKey: 'cp.catResources' },
  { labelKey: 'cp.navBlog',          href: '/blog',               icon: FileText,      catKey: 'cp.catResources' },
  { labelKey: 'cp.navForum',         href: '/forum',              icon: MessageSquare, catKey: 'cp.catCommunity' },
  { labelKey: 'cp.navEvents',        href: '/events',             icon: Calendar,      catKey: 'cp.catCommunity' },
];

export default function CommandPalette() {
  const { session } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const filtered = NAV_ITEMS.filter(item =>
    t(item.labelKey).toLowerCase().includes(query.toLowerCase()) ||
    t(item.catKey).toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (!session) return;

    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
        setQuery('');
        setSelectedIndex(0);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [session]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = useCallback((href) => {
    setOpen(false);
    navigate(href);
  }, [navigate]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      handleSelect(filtered[selectedIndex].href);
    }
  };

  if (!session) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-lg rounded-2xl border border-white/[0.1] bg-[#0d1224]/98 backdrop-blur-xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 border-b border-white/[0.08]">
              <Search size={18} className="text-slate-500 flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('cp.searchPages')}
                className="flex-1 bg-transparent py-4 text-sm text-white placeholder-slate-600 outline-none"
              />
              <button
                onClick={() => setOpen(false)}
                className="px-2 py-1 rounded-md text-[10px] font-mono text-slate-500 border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
              >
                ESC
              </button>
            </div>

            <div className="max-h-[320px] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">
                  {t('cp.noResults')}
                </div>
              ) : (
                filtered.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.href}
                      onClick={() => handleSelect(item.href)}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                        i === selectedIndex
                          ? 'bg-blue-500/15 text-white'
                          : 'text-slate-300 hover:bg-white/[0.04]'
                      }`}
                    >
                      <Icon size={16} className={i === selectedIndex ? 'text-blue-400' : 'text-slate-500'} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{t(item.labelKey)}</div>
                      </div>
                      <span className="text-[10px] text-slate-600 flex-shrink-0">{t(item.catKey)}</span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.06] text-[10px] text-slate-600">
              <div className="flex items-center gap-3">
                <span><kbd className="px-1.5 py-0.5 rounded border border-white/[0.1] bg-white/[0.04]">↑↓</kbd> {t('cp.navigate')}</span>
                <span><kbd className="px-1.5 py-0.5 rounded border border-white/[0.1] bg-white/[0.04]">↵</kbd> {t('cp.select')}</span>
              </div>
              <span><kbd className="px-1.5 py-0.5 rounded border border-white/[0.1] bg-white/[0.04]">Ctrl+K</kbd></span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
