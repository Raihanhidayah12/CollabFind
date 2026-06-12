import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, RotateCcw, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// ─── Extract link suggestions from bot response ───────────────────────────────
function extractLinks(text, t) {
  const linkMap = [
    { pattern: /\/register|daftar|sign up/i,       label: t('bot.linkRegister'),      to: '/register' },
    { pattern: /\/login|masuk|login/i,              label: t('bot.linkLogin'),          to: '/login' },
    { pattern: /\/explore|jelajahi project/i,       label: t('bot.linkExplore'),        to: '/explore' },
    { pattern: /\/teammates|cari teammate/i,        label: t('bot.linkTeammates'),      to: '/teammates' },
    { pattern: /\/dashboard\/portfolio|portfolio/i, label: t('bot.linkPortfolio'),      to: '/dashboard/portfolio' },
    { pattern: /\/features|fitur/i,                 label: t('bot.linkFeatures'),       to: '/features' },
    { pattern: /\/create-project|buat project/i,    label: t('bot.linkCreateProject'),  to: '/create-project' },
    { pattern: /\/hackathons|hackathon/i,           label: t('bot.linkHackathons'),     to: '/hackathons' },
    { pattern: /\/profile|profil/i,                 label: t('bot.linkProfile'),        to: '/profile' },
    { pattern: /\/dashboard(?!\/)|dashboard/i,      label: t('bot.linkDashboard'),      to: '/dashboard' },
    { pattern: /\/settings|pengaturan/i,            label: t('bot.linkSettings'),       to: '/settings' },
  ];

  const found = [];
  const seen = new Set();
  for (const { pattern, label, to } of linkMap) {
    if (pattern.test(text) && !seen.has(to)) {
      seen.add(to);
      found.push({ label, to });
      if (found.length >= 2) break;
    }
  }
  return found;
}

// ─── Call Groq API ──────────────────────────────────────────────────────────
async function callGroq(history, systemPrompt, errorFallback) {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text,
    })),
  ];

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 300,
      top_p: 0.9,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || errorFallback;
}

// ─── Message bubble ────────────────────────────────────────────────────────────
function Bubble({ msg }) {
  const isBot = msg.role === 'bot';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={`flex gap-2.5 ${isBot ? 'items-start' : 'items-end flex-row-reverse'}`}
    >
      {isBot && (
        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-[0_0_10px_rgba(59,130,246,0.4)]">
          <Bot size={14} className="text-white" />
        </div>
      )}
      <div className={`max-w-[85%] flex flex-col gap-2 ${isBot ? 'items-start' : 'items-end'}`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
            isBot
              ? 'bg-white/[0.06] border border-white/[0.08] text-slate-300 rounded-tl-sm'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-tr-sm shadow-[0_0_16px_rgba(59,130,246,0.3)]'
          }`}
        >
          {msg.text}
        </div>
        {isBot && msg.links && msg.links.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {msg.links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-blue-300 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 hover:text-white transition-all"
              >
                {l.label} <ArrowRight size={10} />
              </Link>
            ))}
          </div>
        )}
        {isBot && msg.error && (
          <div className="flex items-center gap-1.5 text-[11px] text-red-400">
            <AlertCircle size={11} /> {msg.errorText}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Typing indicator ──────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex gap-2.5 items-start"
    >
      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.4)]">
        <Bot size={14} className="text-white" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/[0.06] border border-white/[0.08] flex gap-1.5 items-center">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-slate-500"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CollabFindBot({ isDashboard = false }) {
  const { t } = useLanguage();

  const WELCOME_TEXT = isDashboard
    ? t('bot.welcomeDashboard')
    : t('bot.welcome');

  const QUICK_QUESTIONS = [
    t('bot.q1'),
    t('bot.q2'),
    t('bot.q3'),
    t('bot.q4'),
    t('bot.q5'),
    t('bot.q6'),
  ];

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 0, role: 'bot', text: WELCOME_TEXT, links: [] },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [hasNewMsg, setHasNewMsg] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const historyRef = useRef([]);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
      setHasNewMsg(false);
    }
  }, [messages, open]);

  useEffect(() => {
    const t = setTimeout(() => { if (!open) setHasNewMsg(true); }, 8000);
    return () => clearTimeout(t);
  }, [open]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || typing) return;

    const userMsg = { id: Date.now(), role: 'user', text: userText, links: [] };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    // Append to history for context
    historyRef.current = [...historyRef.current, { role: 'user', text: userText }];

    try {
      const reply = await callGroq(historyRef.current, t('bot.systemPrompt'), t('bot.apiError'));
      const links = extractLinks(reply, t);

      historyRef.current = [...historyRef.current, { role: 'model', text: reply }];

      if (historyRef.current.length > 20) {
        historyRef.current = historyRef.current.slice(-20);
      }

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'bot', text: reply, links },
      ]);
    } catch (err) {
      console.error('ColBot error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'bot',
          text: t('bot.errorFallback'),
          links: [],
          error: true,
          errorText: t('bot.connectionError'),
        },
      ]);
    } finally {
      setTyping(false);
      if (!open) setHasNewMsg(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const reset = () => {
    historyRef.current = [];
    setMessages([{ id: 0, role: 'bot', text: WELCOME_TEXT, links: [] }]);
  };

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {!open && hasNewMsg && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              className="px-4 py-2.5 rounded-2xl bg-[#0a0f1e]/95 border border-white/[0.1] text-xs text-slate-300 shadow-xl max-w-[200px] text-center"
            >
              {t('bot.askPrompt')}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setOpen((v) => !v)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:shadow-[0_0_44px_rgba(59,130,246,0.7)] transition-shadow duration-300"
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <X size={22} className="text-white" />
              </motion.div>
            ) : (
              <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <MessageSquare size={22} className="text-white" />
              </motion.div>
            )}
          </AnimatePresence>
          {!open && hasNewMsg && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-[#050816] animate-pulse" />
          )}
        </motion.button>
      </div>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-1.5rem)] flex flex-col rounded-3xl border border-white/[0.1] bg-[#080d1a]/95 backdrop-blur-xl shadow-[0_32px_80px_rgba(0,0,0,0.7)] overflow-hidden"
            style={{ maxHeight: 'min(560px, calc(100vh - 120px))' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.07] bg-white/[0.02] flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_14px_rgba(59,130,246,0.5)]">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">ColBot</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[11px] text-slate-500">{t('bot.subtitle')}</span>
                </div>
              </div>
              <div className="ml-auto flex gap-1">
                <button onClick={reset} className="p-2 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/[0.06] transition-all" title={t('bot.resetChat')}>
                  <RotateCcw size={14} />
                </button>
                <button onClick={() => setOpen(false)} className="p-2 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/[0.06] transition-all">
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 min-h-0">
              {messages.map((msg) => (
                <Bubble key={msg.id} msg={msg} />
              ))}
              <AnimatePresence>
                {typing && <TypingDots key="typing" />}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>

            {/* Quick questions — show only at start */}
            {messages.length <= 1 && !typing && (
              <div className="px-4 pb-3 flex-shrink-0">
                <p className="text-[11px] text-slate-600 mb-2 flex items-center gap-1">
                  <Sparkles size={10} /> {t('bot.popularQuestions')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="px-2.5 py-1 rounded-lg text-xs text-slate-400 bg-white/[0.04] border border-white/[0.07] hover:text-white hover:border-white/[0.16] hover:bg-white/[0.08] transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-white/[0.07] bg-white/[0.01] flex-shrink-0">
              <div className="flex gap-2 items-center">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('bot.placeholder')}
                  className="flex-1 min-w-0 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.09] transition-all"
                  disabled={typing}
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!input.trim() || typing}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-[0_0_14px_rgba(59,130,246,0.35)] disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                >
                  <Send size={15} className="text-white" />
                </motion.button>
              </div>
              <p className="text-[10px] text-slate-700 mt-2 text-center">
                {t('bot.poweredBy')}
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
