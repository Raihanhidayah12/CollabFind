import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useLanguage } from '../i18n/LanguageContext';

function getTimeAgo(dateStr, t) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t('cip.justNow');
  if (mins < 60) return `${mins}${t('cip.minsAgo')}`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}${t('cip.hoursAgo')}`;
  return `${Math.floor(hours / 24)}${t('cip.daysAgo')}`;
}

export default function ChatInboxPreview({ session }) {
  const { t } = useLanguage();
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    const uid = session.user.id;

    async function load() {
      // Get all conversations for this user
      const { data: memberRows } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('user_id', uid);

      if (!memberRows || memberRows.length === 0) {
        setLoading(false);
        return;
      }

      const convIds = memberRows.map(r => r.conversation_id);

      // Filter valid UUIDs only
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validConvIds = convIds.filter(id => uuidRegex.test(id));
      if (validConvIds.length === 0) {
        setLoading(false);
        return;
      }

      let convs = null;
      try {
        const convRes = await supabase
          .from('conversations')
          .select('id, type, name, created_at')
          .in('id', validConvIds.slice(0, 10))
          .order('created_at', { ascending: false })
          .limit(5);
        if (!convRes.error) convs = convRes.data;
      } catch {
        // RLS or schema issue — silently skip
      }

      if (!convs || convs.length === 0) {
        setLoading(false);
        return;
      }

      // Get last message and unread count for each conversation
      const convsWithDetails = await Promise.all(
        convs.map(async (conv) => {
          // Last message not from me
          const { data: lastMsgRows } = await supabase
            .from('messages')
            .select('content, sender_id, created_at')
            .eq('conversation_id', conv.id)
            .neq('sender_id', uid)
            .order('created_at', { ascending: false })
            .limit(1);
          const lastMsg = lastMsgRows?.[0] || null;

          // Unread count (messages not from me after my last read)
          // Simplified: count messages not from me in last 24h
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', uid)
            .gte('created_at', new Date(Date.now() - 86400000).toISOString());

          // Get other member name for DM
          let otherName = conv.name || 'Chat';
          let otherAvatar = null;
          if (conv.type === 'dm') {
            const { data: otherMember } = await supabase
              .from('conversation_members')
              .select('user_id')
              .eq('conversation_id', conv.id)
              .neq('user_id', uid)
              .limit(1)
              .single();

            if (otherMember) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('name, avatar_url')
                .eq('id', otherMember.user_id)
                .single();

              if (profile) {
                otherName = profile.name || 'User';
                otherAvatar = profile.avatar_url;
              }
            }
          }

          return {
            ...conv,
            lastMessage: lastMsg,
            unreadCount: count || 0,
            otherName,
            otherAvatar,
          };
        })
      );

      setConversations(convsWithDetails.filter(c => c.lastMessage));
      const totalUnread = convsWithDetails.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
      setUnreadCount(totalUnread);
      setLoading(false);
    }

    load();
  }, [session]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/80 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={14} className="text-blue-400" />
              <h3 className="text-sm font-bold text-white">{t('cip.messages')}</h3>
            </div>
          </div>
        </div>
        <div className="p-3 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.03] animate-pulse h-12" />
          ))}
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/80 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={14} className="text-blue-400" />
              <h3 className="text-sm font-bold text-white">{t('cip.messages')}</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400">{unreadCount}</span>
              )}
            </div>
            <Link to="/dashboard/chat" className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5">
              {t('cip.all')} <ArrowRight size={10} />
            </Link>
          </div>
        </div>
        <div className="p-6 text-center text-xs text-slate-500">
          {t('cip.empty')}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/80 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={14} className="text-blue-400" />
            <h3 className="text-sm font-bold text-white">{t('cip.messages')}</h3>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400">{unreadCount}</span>
            )}
          </div>
          <Link to="/dashboard/chat" className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5">
            {t('cip.all')} <ArrowRight size={10} />
          </Link>
        </div>
      </div>

      {/* Conversation list */}
      <div className="p-2 space-y-1 max-h-52 overflow-y-auto">
        {conversations.slice(0, 4).map((conv) => {
          const initial = (conv.otherName || 'U')[0].toUpperCase();
          return (
            <Link
              key={conv.id}
              to={`/dashboard/chat?conv=${conv.id}`}
              className="flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-white/[0.04] transition-all group"
            >
              {conv.otherAvatar ? (
                <img src={conv.otherAvatar} alt={conv.otherName} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-xs font-bold text-blue-300 flex-shrink-0">
                  {initial}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-white truncate">{conv.otherName}</p>
                  <span className="text-[10px] text-slate-600 flex-shrink-0 ml-2">{getTimeAgo(conv.lastMessage?.created_at, t)}</span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">{conv.lastMessage?.content?.substring(0, 40) || '...'}</p>
              </div>
              {conv.unreadCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}
