import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCircle,
  XCircle,
  Info,
  Loader2,
  MessageCircle,
  UserPlus
} from 'lucide-react';

import { supabase } from '../utils/supabaseClient';
import { useNotifications } from './NotificationProvider';

export default function NotificationMenu({ session }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const ref = useRef(null);
  const notificationChannels = useRef([]);
  const profileCache = useRef({});

  const { addToast } = useNotifications();

  // -------------------------
  // Outside Click
  // -------------------------
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);

    return () => {
      document.removeEventListener('mousedown', handler);
    };
  }, []);

  // -------------------------
  // Sound
  // -------------------------
  const playNotificationSound = useCallback(() => {
    try {
      const audioContext = new (
        window.AudioContext ||
        window.webkitAudioContext
      )();

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(
        0.2,
        audioContext.currentTime
      );

      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.4
      );

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.4);

      oscillator.onended = () => {
        audioContext.close();
      };
    } catch (err) {
      console.error(err);
    }
  }, []);

  // -------------------------
  // Cleanup
  // -------------------------
  const cleanupSubscriptions = useCallback(() => {
    notificationChannels.current.forEach((channel) => {
      supabase.removeChannel(channel);
    });

    notificationChannels.current = [];
  }, []);

  // -------------------------
  // Get Profile Name
  // -------------------------
  const getProfileName = useCallback(async (id) => {
    if (profileCache.current[id]) {
      return profileCache.current[id];
    }

    const { data } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', id)
      .single();

    const name = data?.name || 'Someone';

    profileCache.current[id] = name;

    return name;
  }, []);

  // -------------------------
  // Realtime Setup
  // -------------------------
  const setupRealtimeSubscriptions = useCallback(async () => {
    if (!session?.user?.id) return;

    cleanupSubscriptions();

    const uid = session.user.id;

    // ==========================
    // CHAT
    // ==========================
    const chatChannel = supabase
      .channel(`messages-${uid}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          const message = payload.new;

          if (message.sender_id === uid) return;

          const senderName = await getProfileName(
            message.sender_id
          );

const notification = {
  id: `chat-${message.id}`,
  type: 'message',
  title: senderName,
  message: message.content?.substring(0, 100) || '',
  time: message.created_at,
  link: `/dashboard/chat?conv=${message.conversation_id}`,
  isUnread: true
};

// masuk ke notification bell
setNotifications((prev) => [
  notification,
  ...prev
].slice(0, 20));

setUnreadCount((prev) => prev + 1);

// toast hanya muncul jika tidak sedang di halaman chat
if (!window.location.pathname.includes('/dashboard/chat')) {
  addToast({
    type: 'message',
    title: senderName,
    message: notification.message,
    link: notification.link
  });
}

playNotificationSound();
        }
      )
      .subscribe((status) => {
        console.log('CHAT STATUS:', status);
      });

    // ==========================
    // APPLICATION UPDATE
    // ==========================
    const appChannel = supabase
      .channel(`applications-${uid}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'applications',
          filter: `applicant_id=eq.${uid}`
        },
        async (payload) => {
          const app = payload.new;

          if (
            app.status !== 'accepted' &&
            app.status !== 'rejected'
          ) {
            return;
          }

          const { data: project } = await supabase
            .from('projects')
            .select('title')
            .eq('id', app.project_id)
            .single();

          const accepted =
            app.status === 'accepted';

          const notification = {
            id: `app-${app.id}`,
            type: app.status,
            title: accepted
              ? '✅ Application Accepted!'
              : '❌ Application Rejected',
            message: accepted
              ? `You have been accepted to join "${project?.title}".`
              : `Your application to "${project?.title}" was rejected.`,
            time: new Date().toISOString(),
            link: accepted
              ? `/dashboard/workspace/${app.project_id}`
              : `/project/${app.project_id}`,
            isUnread: true
          };

          setNotifications((prev) => [
            notification,
            ...prev
          ].slice(0, 20));

          setUnreadCount((prev) => prev + 1);

          addToast(notification);

          playNotificationSound();
        }
      )
      .subscribe((status) => {
        console.log('APP STATUS:', status);
      });

// ==========================
    // NEW INVITATIONS (when I receive an invitation to join a project)
    // ==========================
    const inviteChannel = supabase
      .channel(`invitations-${uid}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'invitations',
          filter: `invitee_id=eq.${uid}`
        },
        async (payload) => {
          const invite = payload.new;

          // Get inviter's name
          const inviterName = await getProfileName(invite.inviter_id);
          
          // Get project title
          const { data: project } = await supabase
            .from('projects')
            .select('title')
            .eq('id', invite.project_id)
            .single();

          const notification = {
            id: `invite-${invite.id}`,
            type: 'invite',
            title: `${inviterName} invited you`,
            message: `You have been invited to join "${project?.title || 'a project'}"`,
            time: invite.created_at,
            link: `/invite/${invite.id}`,
            isUnread: true
          };

          setNotifications((prev) => [
            notification,
            ...prev
          ].slice(0, 20));

          setUnreadCount((prev) => prev + 1);

          // Show toast
          addToast({
            type: 'info',
            title: notification.title,
            message: notification.message,
            link: notification.link
          });

          playNotificationSound();
        }
      )
      .subscribe();

    notificationChannels.current = [
      chatChannel,
      appChannel,
      inviteChannel
    ];
  }, [
    session,
    addToast,
    playNotificationSound,
    cleanupSubscriptions,
    getProfileName
  ]);

  // -------------------------
  // Fetch Notifications
  // -------------------------
  const fetchNotifications = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);

      const uid = session.user.id;

      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .neq('sender_id', uid)
        .order('created_at', {
          ascending: false
        })
        .limit(10);

      const { data: pendingInvites } = await supabase
        .from('invitations')
        .select('id, inviter_id, project_id, created_at')
        .eq('invitee_id', uid)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      const result = [];

      if (pendingInvites?.length) {
        for (const inv of pendingInvites) {
          const inviterName = await getProfileName(inv.inviter_id);

          const { data: project } = await supabase
            .from('projects')
            .select('title')
            .eq('id', inv.project_id)
            .single();

          result.push({
            id: `invite-${inv.id}`,
            type: 'invite',
            title: `${inviterName} invited you`,
            message: `You have been invited to join "${project?.title || 'a project'}"`,
            time: inv.created_at,
            link: `/invite/${inv.id}`,
            isUnread: true
          });
        }
      }

      if (messages?.length) {
        for (const msg of messages) {
          const senderName =
            await getProfileName(msg.sender_id);

          result.push({
            id: `chat-${msg.id}`,
            type: 'message',
            title: `Message from ${senderName}`,
            message:
              msg.content?.substring(0, 100),
            time: msg.created_at,
            link: `/dashboard/chat?conv=${msg.conversation_id}`,
            isUnread: false
          });
        }
      }

      result.sort(
        (a, b) =>
          new Date(b.time) -
          new Date(a.time)
      );

      setNotifications(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [session, getProfileName]);

  // -------------------------
  // Session
  // -------------------------
  useEffect(() => {
    if (!session) {
      cleanupSubscriptions();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setupRealtimeSubscriptions();

    return () => {
      cleanupSubscriptions();
    };
  }, [
    session,
    setupRealtimeSubscriptions,
    cleanupSubscriptions
  ]);

  // -------------------------
  // Open Notification
  // -------------------------
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  const markAllAsRead = () => {
    setUnreadCount(0);

    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        isUnread: false
      }))
    );
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition"
      >
        <Bell size={18} />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {unreadCount > 9
              ? '9+'
              : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              y: -8
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              y: -8
            }}
            className="absolute top-full right-0 mt-2 w-96 rounded-2xl border border-white/10 bg-[#0d1224]/95 backdrop-blur-xl overflow-hidden shadow-2xl z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h3 className="text-white font-semibold">
                Notifications
              </h3>

              <button
                onClick={markAllAsRead}
                className="text-xs text-slate-400 hover:text-white"
              >
                Mark all as read
              </button>
            </div>

            <div className="max-h-[500px] overflow-y-auto p-2">
              {loading ? (
                <div className="flex flex-col items-center py-8">
                  <Loader2
                    size={20}
                    className="animate-spin text-slate-400"
                  />
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">
                  No notifications
                </div>
              ) : (
                notifications.map((notif) => (
                  <Link
                    key={notif.id}
                    to={notif.link}
                    onClick={() =>
                      setOpen(false)
                    }
                    className="flex gap-3 p-3 rounded-xl hover:bg-white/5 transition"
                  >
                    <div>
                      {notif.type ===
                        'accepted' && (
                        <CheckCircle
                          size={18}
                          className="text-green-400"
                        />
                      )}

                      {notif.type ===
                        'rejected' && (
                        <XCircle
                          size={18}
                          className="text-red-400"
                        />
                      )}

                      {notif.type ===
                        'message' && (
                        <MessageCircle
                          size={18}
                          className="text-purple-400"
                        />
                      )}

{notif.type ===
                        'info' && (
                        <Info
                          size={18}
                          className="text-blue-400"
                        />
                      )}

                      {notif.type ===
                        'invite' && (
                        <UserPlus
                          size={18}
                          className="text-cyan-400"
                        />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">
                        {notif.title}
                      </div>

                      <div className="text-slate-400 text-xs mt-1">
                        {notif.message}
                      </div>

                      <div className="text-slate-500 text-[10px] mt-2">
                        {new Date(
                          notif.time
                        ).toLocaleString()}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}