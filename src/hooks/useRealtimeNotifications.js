import { useEffect, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNotifications } from '../components/NotificationProvider';

export function useRealtimeNotifications(session) {
  const { addToast } = useNotifications();
  const channelsRef = useRef([]);
  const setupDoneRef = useRef(false);
  const audioContextRef = useRef(null);

  const playSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(err => console.warn('AudioContext resume failed:', err));
      }

      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + 0.3);
    // eslint-disable-next-line no-unused-vars
    } catch (e) {
      // silent fail
    }
  };

  useEffect(() => {
    if (!session?.user?.id) {
      console.log('⏭️  useRealtimeNotifications: No session, skipping');
      return;
    }

    if (setupDoneRef.current) {
      console.log('⏭️  useRealtimeNotifications: Already setup, skipping');
      return;
    }

    setupDoneRef.current = true;
    const uid = session.user.id;
    console.log('🔴 Setting up real-time subscriptions for user:', uid);

    // ========== CHAT MESSAGES ==========
    const chatSub = supabase
      .channel(`chat-messages-${uid}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          const msg = payload.new;
          
          // Skip if it's our own message
          if (msg.sender_id === uid) {
            console.log('⏩ Skipping own message');
            return;
          }

          console.log('💬 New message received:', msg.sender_id);

          const { data: sender } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', msg.sender_id)
            .single();

          const senderName = sender?.name || 'Someone';
          const msgPreview = msg.content?.substring(0, 60) || 'Sent a message';

          console.log('🎉 Showing toast for message from', senderName);
          addToast({
            type: 'message',
            title: `💬 ${senderName}`,
            message: msgPreview,
            link: `/dashboard/chat?conv=${msg.conversation_id}`,
            autoClose: 6000
          });

          playSound();
        }
      )
      .subscribe((status) => {
        console.log('✅ Chat subscription status:', status);
      });

    // ========== APPLICATION ACCEPTED/REJECTED ==========
    const appStatusSub = supabase
      .channel(`app-status-${uid}`)
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
          if (!['accepted', 'rejected'].includes(app.status)) return;

          const { data: project } = await supabase
            .from('projects')
            .select('title')
            .eq('id', app.project_id)
            .single();

          const isAccepted = app.status === 'accepted';
          const title = isAccepted ? '✅ Application Accepted!' : '❌ Application Rejected';
          const message = isAccepted
            ? `You've been accepted to join "${project?.title}"`
            : `Your application to "${project?.title}" was rejected`;

          console.log('🎉 Showing toast for app', app.status);
          addToast({
            type: app.status,
            title,
            message,
            link: isAccepted ? `/dashboard/workspace/${app.project_id}` : `/project/${app.project_id}`,
            autoClose: 8000
          });

          playSound();
        }
      )
      .subscribe();

    // ========== NEW APPLICATIONS TO MY PROJECTS ==========
    const incomingAppsSub = supabase
      .channel(`incoming-apps-${uid}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'applications',
        },
        async (payload) => {
          const app = payload.new;

          const { data: project } = await supabase
            .from('projects')
            .select('creator_id, title')
            .eq('id', app.project_id)
            .single();

          if (project?.creator_id !== uid) return;

          const { data: applicant } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', app.applicant_id)
            .single();

          const applicantName = applicant?.name || 'Someone';

          console.log('🎉 Showing toast for new application');
          addToast({
            type: 'info',
            title: `👤 New Application`,
            message: `${applicantName} applied to "${project?.title}"`,
            link: `/project/${app.project_id}`,
            autoClose: 8000
          });

          playSound();
        }
      )
      .subscribe();

    channelsRef.current = [chatSub, appStatusSub, incomingAppsSub];
    console.log('✅ All subscriptions set up');

    // Cleanup function
    return () => {
      console.log('🔵 Cleaning up real-time subscriptions');
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
      setupDoneRef.current = false;
    };
  }, [session?.user?.id, addToast]);
}
