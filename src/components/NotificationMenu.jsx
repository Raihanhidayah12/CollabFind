import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, XCircle, Info, Loader2 } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

export default function NotificationMenu({ session }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const ref = useRef();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!session || !open) return;
    fetchNotifications();
  }, [session, open]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const uid = session.user.id;
      const notifs = [];

      // 1. My application updates (accepted/rejected)
      const { data: myApps } = await supabase
        .from('applications')
        .select('*, projects(title)')
        .eq('applicant_id', uid)
        .in('status', ['accepted', 'rejected'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (myApps) {
        myApps.forEach(app => {
          notifs.push({
            id: `app-update-${app.id}`,
            type: app.status,
            title: app.status === 'accepted' ? 'Application Accepted!' : 'Application Rejected',
            message: app.status === 'accepted' 
              ? `You have been accepted to join "${app.projects?.title}".`
              : `Your application to "${app.projects?.title}" was not successful this time.`,
            time: app.created_at,
            link: app.status === 'accepted' ? `/dashboard/workspace/${app.project_id}` : `/project/${app.project_id}`
          });
        });
      }

      // 2. Incoming applications to my projects
      const { data: myProjects } = await supabase
        .from('projects')
        .select('id, title')
        .eq('creator_id', uid);

      if (myProjects && myProjects.length > 0) {
        const projectIds = myProjects.map(p => p.id);
        const { data: incomingApps } = await supabase
          .from('applications')
          .select('*')
          .in('project_id', projectIds)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(10);

        if (incomingApps) {
          // fetch applicant profiles
          const applicantIds = incomingApps.map(a => a.applicant_id);
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, name')
            .in('id', applicantIds);

          incomingApps.forEach(app => {
            const project = myProjects.find(p => p.id === app.project_id);
            const profile = profiles?.find(p => p.id === app.applicant_id);
            const applicantName = profile?.name || 'Someone';

            notifs.push({
              id: `incoming-${app.id}`,
              type: 'info',
              title: 'New Application',
              message: `${applicantName} applied to join "${project?.title}".`,
              time: app.created_at,
              link: `/project/${app.project_id}`
            });
          });
        }
      }

      // Sort by time descending
      notifs.sort((a, b) => new Date(b.time) - new Date(a.time));
      setNotifications(notifs.slice(0, 15));
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // We show a dot if there are notifications. 
  // In a real app we'd query unread count on mount. For now we just show a dot if there's any data
  const hasNotifications = true; // Ideally fetched independently, but we can assume true for demo

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all"
      >
        <Bell size={16} />
        {hasNotifications && (
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-400" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-white/[0.1] bg-[#0d1224]/95 backdrop-blur-xl shadow-[0_16px_48px_rgba(0,0,0,0.6)] overflow-hidden z-50 flex flex-col max-h-[80vh]"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <div className="text-sm font-semibold text-white">Notifications</div>
              <span className="text-xs text-slate-400 cursor-pointer hover:text-white">Mark all as read</span>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 p-2 scrollbar-hide">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <Loader2 size={20} className="text-slate-500 animate-spin" />
                  <span className="text-xs text-slate-500">Loading notifications...</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-10 px-4 text-sm text-slate-400">
                  You have no new notifications.
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {notifications.map((notif) => (
                    <Link
                      key={notif.id}
                      to={notif.link}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.06] transition-all group"
                    >
                      {/* Icon based on type */}
                      <div className="mt-0.5 flex-shrink-0">
                        {notif.type === 'accepted' && <CheckCircle size={18} className="text-emerald-400" />}
                        {notif.type === 'rejected' && <XCircle size={18} className="text-red-400" />}
                        {notif.type === 'info' && <Info size={18} className="text-blue-400" />}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                          {notif.title}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                          {notif.message}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1.5">
                          {new Date(notif.time).toLocaleDateString()}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
