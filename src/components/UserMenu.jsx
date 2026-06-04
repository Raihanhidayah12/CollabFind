import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, ChevronDown, Settings, Loader2, Zap } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

export default function UserMenu({ session }) {
  const [open, setOpen]             = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const ref      = useRef();
  const location = useLocation();

// Initialize profile SYNCHRONOUSLY from localStorage - persists across all tabs/windows
  const [profile, setProfile] = useState(() => {
    if (!session) return null;
    const cacheKey = `profile_${session.user.id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Protected routes — redirect to /login after logout
  const protectedRoutes = ['/dashboard', '/profile', '/settings', '/home'];
  const isProtected = protectedRoutes.some(r => location.pathname.startsWith(r));

  // Background update only if needed (silent, no flicker)
  useEffect(() => {
    if (!session) return;
    const cacheKey = `profile_${session.user.id}`;
    supabase
      .from('profiles')
      .select('name, avatar_url, job_title')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => { 
        if (data) {
          setProfile(data);
          localStorage.setItem(cacheKey, JSON.stringify(data));
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    setLoggingOut(true);
    await supabase.auth.signOut();
    // Protected page → go to login
    // Public page → stay on same page (just reload to clear state)
    if (isProtected) {
      window.location.href = '/login';
    } else {
      window.location.reload();
    }
  };

// Use profile name ONLY - no email fallback to prevent flickering
  const displayName = profile?.name || 'User';
  const initial = displayName[0]?.toUpperCase() || 'U';

  return (
    <div ref={ref} className="relative">
      {/* Logout overlay */}
      <AnimatePresence>
        {loggingOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[999] bg-[#050816]/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-pulse">
              <Zap size={20} className="text-white" />
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Loader2 size={15} className="animate-spin" />
              Signing out...
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/[0.06] transition-all group"
      >
        {/* Avatar */}
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
          {profile?.avatar_url?.startsWith('http') ? (
            <img
              src={profile.avatar_url}
              alt={displayName}
              className="w-full h-full rounded-lg object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.textContent = initial; }}
            />
          ) : initial}
        </div>
        <span className="text-sm text-slate-300 group-hover:text-white transition-colors hidden sm:block max-w-[120px] truncate">
          {displayName}
        </span>
        <ChevronDown size={13} className={`text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-52 rounded-2xl border border-white/[0.1] bg-[#0d1224]/95 backdrop-blur-xl shadow-[0_16px_48px_rgba(0,0,0,0.6)] overflow-hidden z-50"
          >
            {/* User info */}
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <div className="text-sm font-semibold text-white truncate">{displayName}</div>
              <div className="text-xs text-slate-500 truncate">{profile?.job_title || 'Member'}</div>
            </div>

            {/* Menu items */}
            <div className="py-1.5">
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                <User size={15} /> My Profile
              </Link>
              <Link
                to="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                <Settings size={15} /> Settings
              </Link>
            </div>

            <div className="border-t border-white/[0.06] py-1.5">
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/[0.08] transition-all disabled:opacity-50"
              >
                {loggingOut
                  ? <><Loader2 size={15} className="animate-spin" /> Signing out...</>
                  : <><LogOut size={15} /> Sign Out</>
                }
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
