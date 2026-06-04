import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, XCircle, Info, Loader2, MessageCircle } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useNotifications } from './NotificationProvider';

export default function NotificationMenu({ session }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef();
  const { addToast } = useNotifications();
  const notificationChannels = useRef([]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const playNotificationSound = useCallback(() => {
    // Simple beep using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (err) {
      // Fallback: silent
    }
  }, []);

  const cleanupSubscriptions = useCallback(() => {
    notificationChannels.current.forEach(channel => {
      supabase.removeChannel(channel);
    });
    notificationChannels.current = [];
  }, []);

  const setupRealtimeSubscriptions = useCallback(async () => {
    const uid = session.user.id;

    // Chat messages subscription
    const chatChannel = supabase.channel(`messages:${uid}`);
    chatChannel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `NOT (sender_id=eq.${uid})`,
        },
        async (payload) => {
          const message = payload.new;
          
          // Get sender info
          const { data: sender } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', message.sender_id)
            .single();

          // Get conversation info
          const { data: conv } = await supabase
            .from('conversations')
            .select('name')
            .eq('id', message.conversation_id)
            .single();

          const senderName = sender?.name || 'Someone';
          const convName = conv?.name || 'Direct Message';

          // Add toast notification
          addToast({
            type: 'message',
            title: `💬 Message from ${senderName}`,
            message: message.content.substring(0, 100),
            link: `/dashboard/chat?conv=${message.conversation_id}`
          });

          // Add to notification list
          const notification = {
            id: `chat-${message.id}`,
            type: 'message',
            title: `Message from ${senderName}`,
            message: message.content.substring(0, 100),
            time: message.created_at,
            link: `/dashboard/chat?conv=${message.conversation_id}`,
            isUnread: true
          };
          setNotifications(prev => [notification, ...prev].slice(0, 15));
          setUnreadCount(prev => prev + 1);

          // Play sound
          playNotificationSound();
        }
      )
      .subscribe((status) => {
        console.log('Chat subscription:', status);
      });

    // Applications subscription - accepted/rejected
    const appsChannel = supabase.channel(`applications:${uid}`);
    appsChannel
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'applications',
          filter: `applicant_id=eq.${uid}`,
        },
        async (payload) => {
          const app = payload.new;
          if (app.status !== 'accepted' && app.status !== 'rejected') return;

          // Get project info
          const { data: project } = await supabase
            .from('projects')
            .select('title')
            .eq('id', app.project_id)
            .single();

          const title = app.status === 'accepted' ? '✅ Application Accepted!' : '❌ Application Rejected';
          const message = app.status === 'accepted' 
            ? `You have been accepted to join "${project?.title}".`
            : `Your application to "${project?.title}" was not successful this time.`;

          addToast({
            type: app.status,
            title,
            message,
            link: app.status === 'accepted' ? `/dashboard/workspace/${app.project_id}` : `/project/${app.project_id}`
          });

          const notification = {
            id: `app-${app.id}`,
            type: app.status,
            title,
            message,
            time: new Date().toISOString(),
            link: app.status === 'accepted' ? `/dashboard/workspace/${app.project_id}` : `/project/${app.project_id}`,
            isUnread: true
          };
          setNotifications(prev => [notification, ...prev].slice(0, 15));
          setUnreadCount(prev => prev + 1);
          playNotificationSound();
        }
      )
      .subscribe();

    // Incoming applications subscription (for project creators)
    const incomingChannel = supabase.channel(`incoming-apps:${uid}`);
    incomingChannel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'applications',
          filter: `status=eq.pending`,
        },
        async (payload) => {
          const app = payload.new;

          // Check if this app is for user's project
          const { data: project } = await supabase
            .from('projects')
            .select('creator_id, title')
            .eq('id', app.project_id)
            .single();

          if (project?.creator_id !== uid) return;

          // Get applicant info
          const { data: applicant } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', app.applicant_id)
            .single();

          const applicantName = applicant?.name || 'Someone';
          const title = `👤 New Application`;
          const message = `${applicantName} applied to join "${project?.title}".`;

          addToast({
            type: 'info',
            title,
            message,
            link: `/project/${app.project_id}`
          });

          const notification = {
            id: `incoming-${app.id}`,
            type: 'info',
            title,
            message,
            time: app.created_at,
            link: `/project/${app.project_id}`,
            isUnread: true
          };
          setNotifications(prev => [notification, ...prev].slice(0, 15));
          setUnreadCount(prev => prev + 1);
          playNotificationSound();
        }
      )
      .subscribe();

    notificationChannels.current = [chatChannel, appsChannel, incomingChannel];
  }, [session?.user?.id, addToast, playNotificationSound]);

  useEffect(() => {
    if (!session) return;
    setupRealtimeSubscriptions();
    return () => cleanupSubscriptions();
  }, [session, setupRealtimeSubscriptions, cleanupSubscriptions]);

  const fetchNotifications = useCallback(async () => {
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
            title: app.status === 'accepted' ? '✅ Application Accepted!' : '❌ Application Rejected',
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
              title: '👤 New Application',
              message: `${applicantName} applied to join "${project?.title}".`,
              time: app.created_at,
              link: `/project/${app.project_id}`
            });
          });
        }
      }

      // 3. Recent chat messages
      const { data: memberConvs } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('user_id', uid);

      if (memberConvs && memberConvs.length > 0) {
        const convIds = memberConvs.map(c => c.conversation_id);
        
        // Get recent messages from conversations
        const { data: recentMsgs } = await supabase
          .from('messages')
          .select('id, conversation_id, sender_id, content, created_at')
          .neq('sender_id', uid)
          .in('conversation_id', convIds)
          .order('created_at', { ascending: false })
          .limit(10);

        if (recentMsgs && recentMsgs.length > 0) {
          // Get sender profiles
          const senderIds = [...new Set(recentMsgs.map(m => m.sender_id))];
          const { data: senders } = await supabase
            .from('profiles')
            .select('id, name')
            .in('id', senderIds);

          recentMsgs.forEach((msg, idx) => {
            const sender = senders?.find(s => s.id === msg.sender_id);
            const senderName = sender?.name || 'Someone';
            
            notifs.push({
              id: `chat-${msg.id}`,
              type: 'message',
              title: `💬 Message from ${senderName}`,
              message: msg.content.substring(0, 100),
              time: msg.created_at,
              link: `/dashboard/chat?conv=${msg.conversation_id}`,
              isUnread: idx === 0
            });
          });
        }
      }

      // Sort by time descending
      notifs.sort((a, b) => new Date(b.time) - new Date(a.time));
      setNotifications(notifs.slice(0, 15));
      setUnreadCount(notifs.filter(n => n.isUnread).length);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session || !open) return;
    fetchNotifications();
  }, [session, open, fetchNotifications]);

  // We show a dot if there are notifications. 
  // In a real app we'd query unread count on mount. For now we just show a dot if there's any data
  const hasNotifications = unreadCount > 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(!open); if (open) fetchNotifications(); }}
        className="relative p-2 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all"
      >
        <Bell size={16} />
        {hasNotifications && (
          <span className="absolute top-0 right-0 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
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
              <div className="text-sm font-semibold text-white">Notifications {unreadCount > 0 && `(${unreadCount})`}</div>
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
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.06] transition-all group relative"
                    >
                      {notif.isUnread && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-blue-400" />
                      )}
                      {/* Icon based on type */}
                      <div className="mt-0.5 flex-shrink-0">
                        {notif.type === 'accepted' && <CheckCircle size={18} className="text-emerald-400" />}
                        {notif.type === 'rejected' && <XCircle size={18} className="text-red-400" />}
                        {notif.type === 'info' && <Info size={18} className="text-blue-400" />}
                        {notif.type === 'message' && <MessageCircle size={18} className="text-purple-400" />}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                          {notif.title}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
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
