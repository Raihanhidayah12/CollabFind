import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, Zap } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import UserMenu from '../UserMenu';
import NotificationMenu from '../NotificationMenu';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Explore', href: '#projects' },
  { label: 'Find Teammates', href: '#collaborators' },
  { label: 'Community', href: '#categories' },
  { label: 'About', href: '#features' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);
  const [session, setSession]   = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: l } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => l.subscription.unsubscribe();
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#050816]/80 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_32px_rgba(0,0,0,0.4)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_16px_rgba(59,130,246,0.5)] group-hover:shadow-[0_0_24px_rgba(59,130,246,0.7)] transition-shadow">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              Collab<span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Find</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all">
              <Search size={17} />
            </button>
            {session ? (
              <>
                <NotificationMenu session={session} />
                <UserMenu session={session} />
              </>
            ) : (
              <>
                <Link to="/login" state={{ from: location.pathname }} className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 shadow-[0_0_20px_rgba(59,130,246,0.35)] hover:shadow-[0_0_28px_rgba(59,130,246,0.55)] transition-all duration-200"
                >
                  Sign Up Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#050816]/95 backdrop-blur-xl border-t border-white/[0.06] overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex gap-3 mt-3 pt-3 border-t border-white/[0.06]">
                {session ? (
                  <div className="flex items-center gap-3 w-full">
                    <NotificationMenu session={session} />
                    <UserMenu session={session} />
                  </div>
                ) : (
                  <>
                    <Link to="/login" state={{ from: location.pathname }} className="flex-1 text-center py-2.5 text-sm text-slate-300 border border-white/10 rounded-lg hover:bg-white/[0.06] transition-all">Login</Link>
                    <Link to="/register" className="flex-1 text-center py-2.5 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">Sign Up</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
