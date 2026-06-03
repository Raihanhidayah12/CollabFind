import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, ArrowRight, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const CHAT_SEQUENCE = [
  { sender: 'Alex', isMine: false, text: 'Hey team, I just pushed the new API endpoints!', delay: 1000 },
  { sender: 'You', isMine: true, text: 'Awesome! Let me review the PR real quick.', delay: 3000 },
  { sender: 'Alex', isMine: false, text: 'Cool, let me know if you need help with testing.', delay: 5500 },
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-2xl rounded-tl-sm w-fit">
      <motion.div className="w-1.5 h-1.5 rounded-full bg-slate-400" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
      <motion.div className="w-1.5 h-1.5 rounded-full bg-slate-400" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
      <motion.div className="w-1.5 h-1.5 rounded-full bg-slate-400" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
    </div>
  );
}

function ChatAnimation({ onClose, isLoggedIn }) {
  const [visibleMessages, setVisibleMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    let timeouts = [];
    setVisibleMessages([]);
    setIsTyping(false);
    setShowCTA(false);

    // Initial typing
    timeouts.push(setTimeout(() => setIsTyping(true), 300));

    CHAT_SEQUENCE.forEach((msg, index) => {
      // Tampilkan pesan
      timeouts.push(setTimeout(() => {
        setVisibleMessages(prev => [...prev, msg]);
        setIsTyping(false);
      }, msg.delay));

      // Jika ada pesan berikutnya, tampilkan typing indicator sebelum pesan itu muncul
      if (index < CHAT_SEQUENCE.length - 1) {
        timeouts.push(setTimeout(() => {
          setIsTyping(true);
        }, msg.delay + 500));
      } else {
        // Setelah pesan terakhir, tampilkan CTA
        timeouts.push(setTimeout(() => {
          setShowCTA(true);
        }, msg.delay + 1000));
      }
    });

    return () => timeouts.forEach(clearTimeout);
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleMessages, isTyping]);

  return (
    <div className="flex flex-col gap-4 py-2 w-full max-w-sm mx-auto">
      {/* Chat Container */}
      <div 
        ref={containerRef}
        className="flex flex-col gap-4 overflow-y-auto max-h-[300px] p-2 hide-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <AnimatePresence>
          {visibleMessages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex flex-col ${msg.isMine ? 'items-end' : 'items-start'}`}
            >
              {!msg.isMine && <span className="text-[10px] text-slate-500 mb-1 ml-1">{msg.sender}</span>}
              <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm ${
                msg.isMine 
                  ? 'bg-gradient-to-br from-blue-600/90 to-purple-600/90 text-white rounded-tr-sm' 
                  : 'bg-white/[0.06] border border-white/[0.08] text-slate-200 rounded-tl-sm'
              }`}>
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-start"
          >
            <span className="text-[10px] text-slate-500 mb-1 ml-1">
              {visibleMessages.length % 2 === 0 ? 'Alex is typing...' : 'You are typing...'}
            </span>
            <TypingIndicator />
          </motion.div>
        )}
      </div>

      {/* CTA Button */}
      <AnimatePresence>
        {showCTA && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 pt-4 border-t border-white/[0.08]"
          >
            {isLoggedIn ? (
              <Link
                to="/dashboard/chat"
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                  boxShadow: '0 0 24px rgba(59,130,246,0.3)',
                }}
              >
                <Zap size={14} />
                Buka Chat Sekarang
                <ArrowRight size={14} />
              </Link>
            ) : (
              <Link
                to="/login"
                state={{ from: '/dashboard/chat' }}
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                  boxShadow: '0 0 24px rgba(59,130,246,0.3)',
                }}
              >
                <Zap size={14} />
                Coba Chat Sendiri
                <ArrowRight size={14} />
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ChatDemo({ onClose, isLoggedIn = false }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        style={{ background: 'rgba(5,8,22,0.85)', backdropFilter: 'blur(12px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-sm rounded-2xl border border-white/[0.1] bg-[#0a0f1e]/95 backdrop-blur-xl p-6 shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
          onClick={e => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/[0.07] transition-all"
          >
            <X size={16} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
              <MessageSquare size={18} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                Real-time Chat
              </h3>
              <p className="text-xs text-slate-500">Demo — Komunikasi instan</p>
            </div>
          </div>

          <ChatAnimation onClose={onClose} isLoggedIn={isLoggedIn} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
