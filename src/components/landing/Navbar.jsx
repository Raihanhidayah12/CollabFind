import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, Zap, Plus } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import UserMenu from '../UserMenu';
import NotificationMenu from '../NotificationMenu';


const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Projects', href: '#projects' },
  { label: 'Collaborators', href: '#collaborators' },
  { label: 'Categories', href: '#categories' },
  { label: 'Features', href: '#features' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(null);

  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);

    window.addEventListener('scroll', handler);

    return () => {
      window.removeEventListener('scroll', handler);
    };
  }, []);

  const handleNavClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const id = href.slice(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setOpen(false);
      }
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: listener,
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#050816]/85 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_32px_rgba(0,0,0,0.45)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_18px_rgba(59,130,246,0.45)] group-hover:shadow-[0_0_30px_rgba(59,130,246,0.75)] transition-all duration-300">
              <Zap size={18} className="text-white" />
            </div>

            <span className="text-white font-bold text-xl tracking-tight">
              Collab
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Find
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="
                  px-4 py-2
                  text-sm
                  text-slate-400
                  hover:text-white
                  rounded-lg
                  hover:bg-white/[0.06]
                  transition-all duration-200
                "
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">

            <button
              className="
                p-2.5
                text-slate-400
                hover:text-white
                hover:bg-white/[0.06]
                rounded-lg
                transition-all
              "
            >
              <Search size={18} />
            </button>

            {session ? (
              <>
                <Link
                  to="/projects/create"
                  className="
                    flex items-center gap-2
                    px-4 py-2
                    text-sm
                    font-medium
                    text-white
                    border border-white/10
                    rounded-lg
                    hover:border-blue-500/40
                    hover:bg-blue-500/10
                    transition-all duration-200
                  "
                >
                  <Plus size={16} />
                  Post Project
                </Link>

                <NotificationMenu session={session} />
                <UserMenu session={session} />
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  state={{ from: location.pathname }}
                  className="
                    px-4 py-2
                    text-sm
                    text-slate-300
                    hover:text-white
                    transition-colors
                  "
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="
                    px-5 py-2.5
                    text-sm
                    font-semibold
                    text-white
                    rounded-lg
                    bg-gradient-to-r
                    from-blue-500
                    to-purple-600
                    hover:from-blue-400
                    hover:to-purple-500
                    shadow-[0_0_20px_rgba(59,130,246,0.35)]
                    hover:shadow-[0_0_30px_rgba(59,130,246,0.55)]
                    transition-all duration-300
                  "
                >
                  Start Collaborating
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            className="
              md:hidden
              p-2
              text-slate-400
              hover:text-white
              transition-colors
            "
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: 'auto',
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            transition={{
              duration: 0.25,
            }}
            className="
              md:hidden
              bg-[#050816]/95
              backdrop-blur-xl
              border-t border-white/[0.06]
              overflow-hidden
            "
          >
            <div className="px-4 py-4 flex flex-col gap-2">

              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="
                    px-4 py-3
                    text-slate-300
                    hover:text-white
                    hover:bg-white/[0.06]
                    rounded-lg
                    transition-all
                  "
                >
                  {link.label}
                </a>
              ))}

              <div className="pt-4 mt-2 border-t border-white/[0.06]">

                {session ? (
                  <div className="flex flex-col gap-3">

                    <Link
                      to="/projects/create"
                      className="
                        flex items-center
                        justify-center
                        gap-2
                        py-3
                        text-white
                        rounded-lg
                        border border-white/10
                        hover:bg-blue-500/10
                      "
                    >
                      <Plus size={16} />
                      Post Project
                    </Link>

                    <div className="flex items-center gap-3">
                      <NotificationMenu session={session} />
                      <UserMenu session={session} />
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Link
                      to="/login"
                      state={{ from: location.pathname }}
                      className="
                        flex-1
                        text-center
                        py-3
                        text-sm
                        text-slate-300
                        border border-white/10
                        rounded-lg
                        hover:bg-white/[0.06]
                        transition-all
                      "
                    >
                      Login
                    </Link>

                    <Link
                      to="/register"
                      className="
                        flex-1
                        text-center
                        py-3
                        text-sm
                        font-semibold
                        text-white
                        rounded-lg
                        bg-gradient-to-r
                        from-blue-500
                        to-purple-600
                      "
                    >
                      Join Now
                    </Link>
                  </div>
                )}

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}