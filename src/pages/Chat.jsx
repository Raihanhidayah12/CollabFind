import { useEffect, useState, useRef, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hash, MessageSquare, Plus, Send, Code2, Paperclip,
  // eslint-disable-next-line no-unused-vars
  X, ChevronRight, Loader2, Zap, Users, Search, ArrowLeft, UserPlus, Check, Pencil, Trash2, Settings, MoreVertical, Menu
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';
import PageNavbar from '../components/PageNavbar';

/* ── helpers ──────────────────────────────────────────────── */
function timeStr(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}
function dateStr(iso) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}
function sameDay(a, b) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

const LANGUAGES = ['javascript','typescript','python','html','css','sql','bash','json','go','rust'];

/* ── Code block ───────────────────────────────────────────── */
function CodeBlock({ content, language }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-1 rounded-xl overflow-hidden border border-white/[0.08] bg-[#050816]">
      <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.04] border-b border-white/[0.06]">
        <span className="text-[10px] font-mono text-slate-500">{language || 'code'}</span>
        <button onClick={() => { navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          className="text-[10px] text-slate-500 hover:text-white transition-colors">
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-3 text-xs text-emerald-300 font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap break-words">
        {content}
      </pre>
    </div>
  );
}

/* ── Message bubble ───────────────────────────────────────── */
function MessageBubble({ msg, isMine, senderName, showSender, onEdit, onDelete }) {
  const [hover, setHover] = useState(false);
  // Cek apakah pesan masih bisa diedit (< 5 menit)
  const ageMs = new Date() - new Date(msg.created_at);
  const canEdit = isMine && ageMs < 5 * 60 * 1000 && msg.type === 'text';

  return (
    <div className={`flex gap-2.5 ${isMine ? 'flex-row-reverse' : ''}`}
         onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {!isMine && (
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5">
          {(senderName || 'U')[0].toUpperCase()}
        </div>
      )}
      <div className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
        {showSender && !isMine && (
          <span className="text-[10px] text-slate-500 mb-0.5 ml-1">{senderName}</span>
        )}
        <div className="flex items-center gap-2 group relative">
          {hover && isMine && (
            <div className={`absolute ${isMine ? '-left-12' : '-right-12'} top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity`}>
              {canEdit && (
                <button onClick={() => onEdit(msg)} className="p-1 rounded bg-white/5 text-slate-400 hover:text-blue-400 hover:bg-white/10 transition-colors" title="Edit pesan (< 5 menit)">
                  <Pencil size={11} />
                </button>
              )}
              <button onClick={() => onDelete(msg.id)} className="p-1 rounded bg-white/5 text-slate-400 hover:text-red-400 hover:bg-white/10 transition-colors" title="Hapus pesan">
                <Trash2 size={11} />
              </button>
            </div>
          )}
          <div className={`rounded-2xl px-3.5 py-2 ${
            isMine
              ? 'bg-gradient-to-br from-blue-600/80 to-purple-600/80 text-white rounded-tr-sm'
              : 'bg-white/[0.06] border border-white/[0.08] text-slate-200 rounded-tl-sm'
          }`}>
            {msg.type === 'code' ? (
              <CodeBlock content={msg.content} language={msg.language} />
            ) : msg.type === 'file' ? (
              <a href={msg.file_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-blue-300 hover:text-blue-200 transition-colors">
                <Paperclip size={12} /> {msg.file_name || 'File'}
              </a>
            ) : (
              <p className="text-sm leading-relaxed break-words">
                {msg.content}
                {msg.is_edited && <span className="text-[10px] italic opacity-60 ml-2">(edited)</span>}
              </p>
            )}
          </div>
        </div>
        <span className="text-[10px] text-slate-600 mt-0.5 mx-1">{timeStr(msg.created_at)}</span>
      </div>
    </div>
  );
}

/* ── Input bar ────────────────────────────────────────────── */
function InputBar({ onSend, disabled, editingMsg, onSubmitEdit, onCancelEdit }) {
  const [text,    setText]    = useState('');
  const [mode,    setMode]    = useState('text'); // 'text' | 'code'
  const [lang,    setLang]    = useState('javascript');
  const [sending, setSending] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    if (editingMsg) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setText(editingMsg.content);
      setMode(editingMsg.type || 'text');
    } else {
      setText('');
      setMode('text');
    }
  }, [editingMsg]);

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);

    if (editingMsg) {
      await onSubmitEdit(editingMsg.id, trimmed);
    } else {
      await onSend({ type: mode, content: trimmed, language: mode === 'code' ? lang : null });
    }
    
    setText('');
    setSending(false);
  }

  async function handleFile(e) {
    if (editingMsg) return; // tidak bisa edit jadi file
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('Maks 10MB'); return; }
    const path = `chat/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('chat-files').upload(path, file);
    if (error) { alert('Upload gagal'); return; }
    const { data } = supabase.storage.from('chat-files').getPublicUrl(path);
    await onSend({ type: 'file', content: '', file_url: data.publicUrl, file_name: file.name, file_size: file.size });
    e.target.value = '';
  }

  return (
    <div className="border-t border-white/[0.07] p-4 bg-[#050816]">
      {editingMsg && (
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
            <Pencil size={12} /> Sedang mengedit pesan
          </span>
          <button onClick={onCancelEdit} className="text-xs text-slate-500 hover:text-red-400 transition-colors">Batal</button>
        </div>
      )}
      {mode === 'code' && !editingMsg && (
        <div className="flex items-center gap-2 mb-2">
          <Code2 size={12} className="text-emerald-400" />
          <span className="text-xs text-slate-500">Code snippet</span>
          <select value={lang} onChange={e => setLang(e.target.value)}
            className="ml-auto bg-[#0d1226] border border-white/[0.09] rounded-lg px-2 py-1 text-xs text-slate-300 outline-none">
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <button onClick={() => setMode('text')} className="text-slate-600 hover:text-red-400 transition-colors">
            <X size={13} />
          </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={mode === 'code' ? 'Tulis kode di sini...' : (editingMsg ? 'Edit pesan...' : 'Tulis pesan...')}
            rows={mode === 'code' ? 4 : 1}
            disabled={disabled}
            className={`w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 transition-all resize-none ${
              mode === 'code' ? 'font-mono text-xs text-emerald-300' : ''
            }`}
          />
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {!editingMsg && (
            <>
              <button onClick={() => setMode(m => m === 'code' ? 'text' : 'code')}
                title="Code snippet"
                className={`p-2 rounded-xl transition-all ${mode === 'code' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10'}`}>
                <Code2 size={16} />
              </button>
              <button onClick={() => fileRef.current?.click()} title="Kirim file"
                className="p-2 rounded-xl text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                <Paperclip size={16} />
              </button>
              <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
            </>
          )}
          <button onClick={handleSend} disabled={!text.trim() || sending || disabled}
            className="p-2 rounded-xl text-white bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            {sending ? <Loader2 size={16} className="animate-spin" /> : (editingMsg ? <Check size={16} /> : <Send size={16} />)}
          </button>
        </div>
      </div>
      {!editingMsg && <p className="text-[10px] text-slate-700 mt-1.5">Enter kirim · Shift+Enter baris baru</p>}
    </div>
  );
}

/* ── Message area ─────────────────────────────────────────── */
function MessageArea({ convId, session, profileMap }) {
  const [messages, setMessages] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [editingMsg, setEditingMsg] = useState(null);
  const bottomRef = useRef();

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setEditingMsg(null);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
      .limit(100);
    setMessages(data || []);
    setLoading(false);
  }, [convId]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // Realtime subscription for active chat
  useEffect(() => {
    const channel = supabase
      .channel(`active-chat:${convId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'messages',
        filter: `conversation_id=eq.${convId}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMessages(prev => {
            if (prev.some(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        } else if (payload.eventType === 'UPDATE') {
          setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new : m));
        } else if (payload.eventType === 'DELETE') {
          setMessages(prev => prev.filter(m => m.id !== payload.old.id));
        }
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [convId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(msgData) {
    const tempId = crypto.randomUUID();
    const tempMsg = {
      id: tempId,
      conversation_id: convId,
      sender_id: session.user.id,
      created_at: new Date().toISOString(),
      ...msgData,
    };
    
    // Optimistic update
    setMessages(prev => [...prev, tempMsg]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    await supabase.from('messages').insert({
      id: tempId,
      conversation_id: convId,
      sender_id: session.user.id,
      ...msgData,
    });
  }

  async function handleEditSubmit(msgId, newContent) {
    setEditingMsg(null);
    // Simpan konten lama untuk rollback jika error
    const oldMsg = messages.find(m => m.id === msgId);
    
    // Optimistic update
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: newContent, is_edited: true, updated_at: new Date().toISOString() } : m));
    
    const { error } = await supabase.from('messages').update({
      content: newContent,
      is_edited: true,
      updated_at: new Date().toISOString()
    }).eq('id', msgId);

    if (error) {
      console.error("Edit error:", error);
      alert("Gagal mengedit pesan: " + error.message);
      // Rollback
      setMessages(prev => prev.map(m => m.id === msgId ? oldMsg : m));
    }
  }

  async function handleDelete(msgId) {
    if (!confirm('Hapus pesan ini?')) return;
    // Optimistic
    setMessages(prev => prev.filter(m => m.id !== msgId));
    await supabase.from('messages').delete().eq('id', msgId);
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 size={22} className="text-blue-400 animate-spin" />
    </div>
  );

  return (
    <>
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-1.5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-20">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <MessageSquare size={20} className="text-blue-400" />
            </div>
            <p className="text-sm text-slate-500">Belum ada pesan. Mulai percakapan!</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMine     = msg.sender_id === session.user.id;
          const prevMsg    = messages[i - 1];
          const showDate   = !prevMsg || !sameDay(prevMsg.created_at, msg.created_at);
          const showSender = !prevMsg || prevMsg.sender_id !== msg.sender_id;
          const senderName = profileMap[msg.sender_id]?.name || 'User';
          return (
            <div key={msg.id}>
              {showDate && (
                <div className="flex items-center gap-3 my-3">
                  <div className="flex-1 h-px bg-white/[0.06]" />
                  <span className="text-[10px] text-slate-600">{dateStr(msg.created_at)}</span>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>
              )}
              <MessageBubble 
                msg={msg} 
                isMine={isMine} 
                senderName={senderName} 
                showSender={showSender} 
                onEdit={setEditingMsg}
                onDelete={handleDelete}
              />
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <InputBar 
        onSend={handleSend} 
        disabled={!session} 
        editingMsg={editingMsg} 
        onSubmitEdit={handleEditSubmit} 
        onCancelEdit={() => setEditingMsg(null)} 
      />
    </>
  );
}

/* ── New DM modal ─────────────────────────────────────────── */
function NewDMModal({ session, existingDMs, onCreated, onClose }) {
  const [query,    setQuery]    = useState('');
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      const { data } = await supabase.from('profiles')
        .select('id, name, job_title')
        .ilike('name', `%${query}%`)
        .neq('id', session.user.id)
        .limit(8);
      setResults(data || []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query, session]);

  async function startDM(user) {
    setCreating(true);
    const existing = existingDMs.find(dm =>
      dm.members?.some(m => m.user_id === user.id)
    );
    if (existing) { onCreated(existing); onClose(); return; }

    const newId = crypto.randomUUID();
    const { error: convError } = await supabase.from('conversations').insert({
      id: newId, type: 'dm', name: null,
    });

    if (!convError) {
      await supabase.from('conversation_members').insert([
        { conversation_id: newId, user_id: session.user.id },
        { conversation_id: newId, user_id: user.id },
      ]);
      onCreated({ id: newId, type: 'dm', name: null, otherUser: user, members: [{user_id: session.user.id}, {user_id: user.id}] });
    }
    setCreating(false);
    onClose();
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }}
        className="w-full max-w-sm rounded-2xl border border-white/[0.1] bg-[#0a0f1e] p-5"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-white">New Direct Message</p>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={query} onChange={e => setQuery(e.target.value)} autoFocus
            placeholder="Cari user..." 
            className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 transition-all" />
        </div>
        {loading && <div className="flex justify-center py-4"><Loader2 size={16} className="animate-spin text-blue-400" /></div>}
        <div className="flex flex-col gap-1">
          {results.map(u => (
            <button key={u.id} onClick={() => startDM(u)} disabled={creating}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.06] transition-all text-left">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {u.name[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{u.name}</p>
                <p className="text-xs text-slate-500">{u.job_title || 'Member'}</p>
              </div>
              <ChevronRight size={14} className="text-slate-600 ml-auto" />
            </button>
          ))}
          {!loading && query && results.length === 0 && (
            <p className="text-xs text-slate-600 text-center py-4">User tidak ditemukan.</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Join Channel Modal ───────────────────────────────────── */
function JoinChannelModal({ session, myChannelIds, onJoined, onClose }) {
  const [channels,   setChannels]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [requesting, setRequesting] = useState(null);
  const [done,       setDone]       = useState({});

  useEffect(() => {
    async function load() {
      // All channels that exist but user is NOT a member
      const { data: allConvs } = await supabase
        .from('conversations')
        .select('id, name, project_id')
        .eq('type', 'channel');

      const joinable = (allConvs || []).filter(c => !myChannelIds.includes(c.id));
      setChannels(joinable);
      setLoading(false);
    }
    load();
  }, [myChannelIds]);

  async function requestJoin(channel) {
    setRequesting(channel.id);
    // For now: directly add as member (owner approval can be added later)
    const { error } = await supabase.from('conversation_members').insert({
      conversation_id: channel.id,
      user_id: session.user.id,
    });
    setRequesting(null);
    if (!error) {
      setDone(p => ({ ...p, [channel.id]: true }));
      onJoined(channel);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }}
        className="w-full max-w-sm rounded-2xl border border-white/[0.1] bg-[#0a0f1e] p-5"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-white">Join Channel</p>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 size={18} className="animate-spin text-blue-400" /></div>
        ) : channels.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">Tidak ada channel tersedia untuk di-join.</p>
        ) : (
          <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
            {channels.map(ch => (
              <div key={ch.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.07] bg-white/[0.02]">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center flex-shrink-0">
                  <Hash size={14} className="text-blue-400" />
                </div>
                <span className="text-sm text-white flex-1 truncate">{ch.name || 'Channel'}</span>
                {done[ch.id] ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                    <Check size={12} /> Joined
                  </span>
                ) : (
                  <button
                    onClick={() => requestJoin(ch)}
                    disabled={requesting === ch.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-400 border border-blue-500/20 hover:bg-blue-500/10 transition-all disabled:opacity-50"
                  >
                    {requesting === ch.id
                      ? <Loader2 size={11} className="animate-spin" />
                      : <UserPlus size={11} />
                    }
                    Join
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ── Create Channel Modal ─────────────────────────────────── */
function CreateChannelModal({ session, onCreated, onClose }) {
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim() || creating) return;
    setCreating(true);

    const newId = crypto.randomUUID();
    const { error: convError } = await supabase.from('conversations').insert({
      id: newId, type: 'channel', name: name.trim(), project_id: null,
    });

    if (!convError) {
      await supabase.from('conversation_members').insert({
        conversation_id: newId, user_id: session.user.id
      });
      onCreated({ id: newId, type: 'channel', name: name.trim(), project_id: null, members: [{user_id: session.user.id}] });
    }
    setCreating(false);
    onClose();
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }}
        className="w-full max-w-sm rounded-2xl border border-white/[0.1] bg-[#0a0f1e] p-5"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-white">Buat Channel Baru</p>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Nama Channel</label>
            <input value={name} onChange={e => setName(e.target.value)} autoFocus
              placeholder="Misal: general, design, diskusi..." 
              className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 transition-all" />
          </div>
          <button type="submit" disabled={!name.trim() || creating}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 disabled:opacity-50 transition-all flex items-center justify-center">
            {creating ? <Loader2 size={16} className="animate-spin" /> : 'Buat Channel'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ── Channel Settings Modal ───────────────────────────────── */
function ChannelSettingsModal({ conv, onUpdate, onDelete, onClose }) {
  const [name, setName] = useState(conv.name || '');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    if (!name.trim() || loading || deleting) return;
    setLoading(true);
    await supabase.from('conversations').update({ name: name.trim() }).eq('id', conv.id);
    onUpdate(name.trim());
    setLoading(false);
    onClose();
  }

  async function handleDelete() {
    if (!confirm('Hapus channel ini permanen? Semua pesan akan hilang!')) return;
    setDeleting(true);
    await supabase.from('conversations').delete().eq('id', conv.id);
    onDelete(conv.id);
    setDeleting(false);
    onClose();
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }}
        className="w-full max-w-sm rounded-2xl border border-white/[0.1] bg-[#0a0f1e] p-5"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-white">Pengaturan Channel</p>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Nama Channel</label>
            <input value={name} onChange={e => setName(e.target.value)} autoFocus
              placeholder="Nama channel..." 
              className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 transition-all" />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={handleDelete} disabled={deleting || loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 transition-all flex items-center justify-center">
              {deleting ? <Loader2 size={16} className="animate-spin" /> : 'Hapus Channel'}
            </button>
            <button type="submit" disabled={!name.trim() || loading || deleting}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 disabled:opacity-50 transition-all flex items-center justify-center">
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Simpan'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ── Main Chat page ───────────────────────────────────────── */
export default function Chat() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();

  const [session,     setSession]     = useState(null);
  const [channels,    setChannels]    = useState([]);
  const [dms,         setDms]         = useState([]);
  const [activeConv,  setActiveConv]  = useState(null);
  const [profileMap,  setProfileMap]  = useState({});
  const [loading,     setLoading]     = useState(true);
  const [showNewDM,   setShowNewDM]   = useState(false);
  const [refreshKey,  setRefreshKey]  = useState(0);
  const [showJoin,    setShowJoin]    = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showChannelSettings, setShowChannelSettings] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Notifications
  const [notif, setNotif] = useState(null);

  /* ── Setup Real-time Notifications ── */
  useRealtimeNotifications(session);

  /* ── Auth guard ── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        sessionStorage.setItem('redirectAfterLogin', '/dashboard/chat');
        navigate('/login');
        return;
      }
      setSession(data.session);
    });
  }, [navigate]);

  /* ── Load conversations ── */
  useEffect(() => {
    if (!session) return;
    const uid = session.user.id;

    async function load() {
      // Get all conversation IDs this user is in
      const { data: memberRows } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('user_id', uid);

      if (!memberRows?.length) { setLoading(false); return; }

      const convIds = memberRows.map(r => r.conversation_id);

      const { data: convs } = await supabase
        .from('conversations')
        .select('*')
        .in('id', convIds);

      if (!convs) { setLoading(false); return; }

      // For each conversation, get members
      const { data: allMembers } = await supabase
        .from('conversation_members')
        .select('conversation_id, user_id')
        .in('conversation_id', convIds);

      // Collect unique user IDs for profile fetch
      const userIds = [...new Set((allMembers || []).map(m => m.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, job_title, avatar_url')
        .in('id', userIds);

      const pMap = {};
      (profiles || []).forEach(p => { pMap[p.id] = p; });
      setProfileMap(pMap);

      const membersByConv = {};
      (allMembers || []).forEach(m => {
        if (!membersByConv[m.conversation_id]) membersByConv[m.conversation_id] = [];
        membersByConv[m.conversation_id].push(m);
      });

      const enriched = convs.map(c => ({
        ...c,
        members: membersByConv[c.id] || [],
        otherUser: c.type === 'dm'
          ? profiles?.find(p => p.id !== uid && membersByConv[c.id]?.some(m => m.user_id === p.id))
          : null,
      }));

      setChannels(enriched.filter(c => c.type === 'channel'));
      setDms(enriched.filter(c => c.type === 'dm'));

      // Auto-select from URL param or first conv
      const targetId = searchParams.get('conv');
      const target   = enriched.find(c => c.id === targetId) || enriched[0];
      if (target) setActiveConv(target);

      setLoading(false);
    }

    load();
  }, [session, searchParams, refreshKey]);

  /* ── Auto-create project channels & reload ── */
  useEffect(() => {
    if (!session) return;
    const uid = session.user.id;

    async function ensureChannels() {
      const [{ data: owned }, { data: apps }] = await Promise.all([
        supabase.from('projects').select('id, title').eq('creator_id', uid),
        supabase.from('applications').select('project_id, projects(id, title)')
          .eq('applicant_id', uid).eq('status', 'accepted'),
      ]);

      const projects = [
        ...(owned || []),
        ...(apps || []).map(a => a.projects).filter(Boolean),
      ];

      let created = false;
      for (const proj of projects) {
        // Check if channel exists for this project
        const { data: existing } = await supabase
          .from('conversations')
          .select('id')
          .eq('type', 'channel')
          .eq('project_id', proj.id)
          .maybeSingle();

        let convId = existing?.id;

        if (!convId) {
          // Create the channel
          const newId = crypto.randomUUID();
          const { error: insertError } = await supabase.from('conversations').insert({
            id: newId, type: 'channel', project_id: proj.id, name: proj.title,
          });
          if (!insertError) {
            convId = newId;
            created = true;
            // Add member only if we just created it
            await supabase.from('conversation_members').insert({
              conversation_id: convId, user_id: uid
            });
          }
        }
      }

      // Reload conversations if new channels were created
      if (created) setRefreshKey(k => k + 1);
    }

    ensureChannels();
  }, [session]);

  /* ── Conversations Realtime Listener ── */
  useEffect(() => {
    if (!session) return;
    const channel = supabase
      .channel('conversations-realtime')
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'conversations'
      }, (payload) => {
        setChannels(prev => prev.map(c => c.id === payload.new.id ? { ...c, name: payload.new.name } : c));
        setActiveConv(prev => prev?.id === payload.new.id ? { ...prev, name: payload.new.name } : prev);
      })
      .on('postgres_changes', {
        event: 'DELETE', schema: 'public', table: 'conversations'
      }, (payload) => {
        setChannels(prev => prev.filter(c => c.id !== payload.old.id));
        setActiveConv(prev => prev?.id === payload.old.id ? null : prev);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [session]);

  /* ── Global Realtime Listener untuk Notifikasi ── */
  useEffect(() => {
    if (!session || channels.length + dms.length === 0) return;
    
    // Subscribe ke semua messages (ideal-nya difilter lewat RLS atau in-filter, tapi pub-sub Supabase untuk public schema mendengarkan semua insert jika tidak difilter)
    // Kita filter di client side untuk memastikan kita member.
    const allConvIds = [...channels, ...dms].map(c => c.id);
    
    const globalChannel = supabase
      .channel('global-notifications')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages'
      }, (payload) => {
        const msg = payload.new;
        // Hanya notif jika: bukan dari kita sendiri, kita adalah member, dan bukan di chat yang sedang aktif
        if (
          msg.sender_id !== session.user.id &&
          allConvIds.includes(msg.conversation_id) &&
          msg.conversation_id !== activeConv?.id
        ) {
          const senderName = profileMap[msg.sender_id]?.name || 'Seseorang';
          const conv = channels.find(c => c.id === msg.conversation_id) || dms.find(d => d.id === msg.conversation_id);
          const convText = conv ? (conv.name || conv.otherUser?.name || 'Grup') : 'Grup';
          
          setNotif({
            title: `${senderName} di ${convText}`,
            body: msg.type === 'text' ? msg.content : `Mengirim ${msg.type}`,
            conv: conv
          });
          
          // Auto hide notif
          setTimeout(() => setNotif(null), 4000);
        }
      })
      .subscribe();
      
    return () => supabase.removeChannel(globalChannel);
  }, [session, channels, dms, activeConv, profileMap]);

  const convName = (conv) => {
    if (conv.type === 'channel') return conv.name || 'Channel';
    return conv.otherUser?.name || 'Direct Message';
  };

  if (!session || loading) return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center">
      <Loader2 size={24} className="text-blue-400 animate-spin" />
    </div>
  );

  return (
    <div className="h-screen bg-[#050816] flex flex-col" style={{ fontFamily: "'Manrope',sans-serif" }}>
      <PageNavbar breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Real-time Chat' }]} homePath="/dashboard" />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Hidden on mobile, visible on md+ */}
        <aside className="hidden md:flex md:w-64 flex-shrink-0 border-r border-white/[0.06] bg-[#07091a] flex-col overflow-hidden">
          <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1">
            {/* Channels */}
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Channels</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setShowJoin(true)}
                    className="p-1 rounded-md text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors" title="Join Channel">
                    <Search size={13} />
                  </button>
                  <button onClick={() => setShowCreateChannel(true)}
                    className="p-1 rounded-md text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors" title="Buat Channel">
                    <Plus size={13} />
                  </button>
                </div>
              </div>
              {channels.length === 0 ? (
                <p className="text-xs text-slate-700 px-1">Belum ada channel. Buat atau gabung projek dulu.</p>
              ) : (
                channels.map(c => (
                  <button key={c.id} onClick={() => setActiveConv(c)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
                      activeConv?.id === c.id
                        ? 'bg-blue-500/15 text-white border border-blue-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                    }`}>
                    <Hash size={14} className="flex-shrink-0" />
                    <span className="truncate">{convName(c)}</span>
                  </button>
                ))
              )}
            </div>

            {/* DMs */}
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Direct Messages</p>
                <button onClick={() => setShowNewDM(true)}
                  className="text-slate-500 hover:text-white transition-colors" title="New DM">
                  <Plus size={13} />
                </button>
              </div>
              {dms.length === 0 ? (
                <p className="text-xs text-slate-700 px-1">Belum ada DM.</p>
              ) : (
                dms.map(c => (
                  <button key={c.id} onClick={() => setActiveConv(c)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
                      activeConv?.id === c.id
                        ? 'bg-purple-500/15 text-white border border-purple-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                    }`}>
                    <div className="w-5 h-5 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                      {(convName(c))[0].toUpperCase()}
                    </div>
                    <span className="truncate">{convName(c)}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Mobile Drawer - Visible on mobile, hidden on md+ */}
        <AnimatePresence>
          {showMobileSidebar && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMobileSidebar(false)}
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
              />
              {/* Drawer Panel */}
              <motion.aside
                initial={{ x: -256 }}
                animate={{ x: 0 }}
                exit={{ x: -256 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="fixed left-0 top-0 bottom-0 w-64 border-r border-white/[0.06] bg-[#07091a] flex flex-col overflow-hidden z-50 md:hidden"
              >
                <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1">
                  {/* Channels */}
                  <div>
                    <div className="flex items-center justify-between mb-2 px-1">
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Channels</p>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setShowJoin(true); setShowMobileSidebar(false); }}
                          className="p-1 rounded-md text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors" title="Join Channel">
                          <Search size={13} />
                        </button>
                        <button onClick={() => { setShowCreateChannel(true); setShowMobileSidebar(false); }}
                          className="p-1 rounded-md text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors" title="Buat Channel">
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                    {channels.length === 0 ? (
                      <p className="text-xs text-slate-700 px-1">Belum ada channel. Buat atau gabung projek dulu.</p>
                    ) : (
                      channels.map(c => (
                        <button key={c.id} onClick={() => { setActiveConv(c); setShowMobileSidebar(false); }}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
                            activeConv?.id === c.id
                              ? 'bg-blue-500/15 text-white border border-blue-500/30'
                              : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                          }`}>
                          <Hash size={14} className="flex-shrink-0" />
                          <span className="truncate">{convName(c)}</span>
                        </button>
                      ))
                    )}
                  </div>

                  {/* DMs */}
                  <div>
                    <div className="flex items-center justify-between mb-2 px-1">
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Direct Messages</p>
                      <button onClick={() => { setShowNewDM(true); setShowMobileSidebar(false); }}
                        className="text-slate-500 hover:text-white transition-colors" title="New DM">
                        <Plus size={13} />
                      </button>
                    </div>
                    {dms.length === 0 ? (
                      <p className="text-xs text-slate-700 px-1">Belum ada DM.</p>
                    ) : (
                      dms.map(c => (
                        <button key={c.id} onClick={() => { setActiveConv(c); setShowMobileSidebar(false); }}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
                            activeConv?.id === c.id
                              ? 'bg-purple-500/15 text-white border border-purple-500/30'
                              : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                          }`}>
                          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                            {(convName(c))[0].toUpperCase()}
                          </div>
                          <span className="truncate">{convName(c)}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main chat */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {activeConv ? (
            <>
              <div className="flex-shrink-0 flex items-center gap-2 md:gap-3 px-3 md:px-5 py-2 md:py-3 border-b border-white/[0.06] bg-[#050816]/60">
                {activeConv.type === 'channel'
                  ? <Hash size={16} className="text-slate-400 flex-shrink-0" />
                  : <MessageSquare size={16} className="text-slate-400 flex-shrink-0" />
                }
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm font-bold text-white truncate">{convName(activeConv)}</p>
                  <p className="text-[10px] md:text-xs text-slate-600">
                    {activeConv.type === 'channel'
                      ? `${activeConv.members?.length || 0} members`
                      : 'Direct Message'
                    }
                  </p>
                </div>
                {activeConv.type === 'channel' && (
                  <div className="ml-auto flex items-center gap-2 md:gap-3">
                    <div className="hidden md:flex items-center gap-1">
                      <Users size={13} className="text-slate-600" />
                      <span className="text-xs text-slate-600">{activeConv.members?.length || 0}</span>
                    </div>
                    <button onClick={() => setShowChannelSettings(true)} className="p-1 md:p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/5 transition-all flex-shrink-0" title="Pengaturan Channel">
                      <Settings size={14} />
                    </button>
                  </div>
                )}
              </div>
              <MessageArea convId={activeConv.id} session={session} profileMap={profileMap} />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-4 md:p-8">
              <div className="w-12 md:w-16 h-12 md:h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <MessageSquare size={24} className="text-blue-400" />
              </div>
              <div>
                <p className="text-sm md:text-base font-bold text-white mb-1">Pilih percakapan</p>
                <p className="text-xs md:text-sm text-slate-500">Pilih channel atau DM dari sidebar, atau mulai percakapan baru.</p>
              </div>
              <button onClick={() => setShowNewDM(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 transition-all">
                <Plus size={14} /> New Direct Message
              </button>
            </div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {showNewDM && (
          <NewDMModal
            session={session}
            existingDMs={dms}
            onCreated={(conv) => { setDms(prev => [...prev.filter(d => d.id !== conv.id), conv]); setActiveConv(conv); }}
            onClose={() => setShowNewDM(false)}
          />
        )}
        {showJoin && (
          <JoinChannelModal
            session={session}
            myChannelIds={channels.map(c => c.id)}
            // eslint-disable-next-line no-unused-vars
            onJoined={(conv) => {
              setRefreshKey(k => k + 1);
            }}
            onClose={() => setShowJoin(false)}
          />
        )}
        {showCreateChannel && (
          <CreateChannelModal
            session={session}
            onCreated={(conv) => {
              setRefreshKey(k => k + 1);
              setActiveConv(conv);
            }}
            onClose={() => setShowCreateChannel(false)}
          />
        )}
        {showChannelSettings && activeConv && (
          <ChannelSettingsModal
            conv={activeConv}
            onUpdate={(newName) => {
              // Optimistic UI update
              setChannels(prev => prev.map(c => c.id === activeConv.id ? { ...c, name: newName } : c));
              setActiveConv(prev => ({ ...prev, name: newName }));
            }}
            onDelete={(id) => {
              // Optimistic UI delete
              setChannels(prev => prev.filter(c => c.id !== id));
              setActiveConv(null);
            }}
            onClose={() => setShowChannelSettings(false)}
          />
        )}
      </AnimatePresence>


      {/* Global Notification Toast */}
      <AnimatePresence>
        {notif && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-6 left-1/2 z-[100] max-w-sm w-full px-4 cursor-pointer"
            onClick={() => {
              if (notif.conv) setActiveConv(notif.conv);
              setNotif(null);
            }}
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-3 shadow-lg shadow-blue-500/20 border border-white/10 flex gap-3 items-start">
              <div className="mt-0.5 bg-white/20 p-1.5 rounded-lg flex-shrink-0">
                <MessageSquare size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{notif.title}</p>
                <p className="text-xs text-white/80 truncate">{notif.body}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setNotif(null); }} className="text-white/60 hover:text-white">
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
