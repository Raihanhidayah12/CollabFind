import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Folder, Users, Settings, User, Plus,
  MessageSquare, Zap, Home, FileText, Calendar, Briefcase,
} from 'lucide-react';
import { useAuth } from './AuthProvider';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: Home, category: 'Navigation' },
  { label: 'Explore Projects', href: '/explore', icon: Folder, category: 'Navigation' },
  { label: 'Find Teammates', href: '/teammates', icon: Users, category: 'Navigation' },
  { label: 'Create Project', href: '/create-project', icon: Plus, category: 'Navigation' },
  { label: 'Chat', href: '/dashboard/chat', icon: MessageSquare, category: 'Navigation' },
  { label: 'Freelance Marketplace', href: '/freelance', icon: Briefcase, category: 'Navigation' },
  { label: 'Post a Job', href: '/freelance/post', icon: Briefcase, category: 'Navigation' },
  { label: 'Freelance Dashboard', href: '/freelance/dashboard', icon: Briefcase, category: 'Navigation' },
  { label: 'My Profile', href: '/profile', icon: User, category: 'Navigation' },
  { label: 'Settings', href: '/settings', icon: Settings, category: 'Navigation' },
  { label: 'Portfolio Editor', href: '/dashboard/portfolio', icon: Zap, category: 'Navigation' },
  { label: 'Documentation', href: '/docs', icon: FileText, category: 'Resources' },
  { label: 'Blog', href: '/blog', icon: FileText, category: 'Resources' },
  { label: 'Forum', href: '/forum', icon: MessageSquare, category: 'Community' },
  { label: 'Events', href: '/events', icon: Calendar, category: 'Community' },
];

export default function CommandPalette() {
  const { session } = useAuth();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const filtered = NAV_ITEMS.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
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
                placeholder="Search pages..."
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
                  No results found
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
                        <div className="text-sm font-medium truncate">{item.label}</div>
                      </div>
                      <span className="text-[10px] text-slate-600 flex-shrink-0">{item.category}</span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.06] text-[10px] text-slate-600">
              <div className="flex items-center gap-3">
                <span><kbd className="px-1.5 py-0.5 rounded border border-white/[0.1] bg-white/[0.04]">↑↓</kbd> Navigate</span>
                <span><kbd className="px-1.5 py-0.5 rounded border border-white/[0.1] bg-white/[0.04]">↵</kbd> Select</span>
              </div>
              <span><kbd className="px-1.5 py-0.5 rounded border border-white/[0.1] bg-white/[0.04]">Ctrl+K</kbd></span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
