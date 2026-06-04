import { Link, useLocation } from 'react-router-dom';
import { Zap, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UserMenu from './UserMenu';
import NotificationMenu from './NotificationMenu';
import { useAuth } from './AuthProvider';

export default function PageNavbar({ breadcrumbs = [], homePath = '/' }) {
  // Use shared auth context - already initialized from localStorage
  const { session } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="fixed top-0 left-0 right-0 z-50 bg-[#050816]/85 backdrop-blur-xl border-b border-white/[0.06]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-4">
          <Link to={homePath} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_18px_rgba(59,130,246,0.45)]">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight hidden sm:block">
              Collab<span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Find</span>
            </span>
          </Link>

          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <div className="hidden sm:flex items-center text-slate-600 text-sm">
              {breadcrumbs.map((crumb, idx) => (
                <span key={idx} className="flex items-center">
                  <span className="mx-2">/</span>
                  {crumb.href ? (
                    <Link to={crumb.href} className="text-slate-300 hover:text-white transition-colors">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-slate-300 font-medium">{crumb.label}</span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right: Auth/Menu */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <>
              <NotificationMenu session={session} />
              <UserMenu session={session} />
            </>
          ) : (
            <>
              <Link to="/login" state={{ from: location.pathname }} className="text-sm text-slate-400 hover:text-white transition-colors">
                Login
              </Link>
              <Link to="/register" className="px-3 py-1.5 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 transition-all">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-[#050816]/95 border-t border-white/[0.06] overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {session ? (
                <>
                  <div className="flex items-center gap-3 py-2 border-b border-white/[0.06]">
                    <NotificationMenu session={session} />
                    <UserMenu session={session} />
                  </div>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link
                    to="/login"
                    state={{ from: location.pathname }}
                    className="flex-1 text-center py-2 text-sm text-slate-300 border border-white/10 rounded-lg hover:bg-white/[0.06] transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="flex-1 text-center py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-400 hover:to-purple-500 transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
