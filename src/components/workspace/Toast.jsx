import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, X } from 'lucide-react';

/**
 * Toast notification component.
 * Props:
 *   toasts: [{ id, type: 'success'|'error', message }]
 *   onRemove: (id) => void
 */
export default function Toast({ toasts, onRemove }) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const isSuccess = toast.type === 'success';

  return (
    <motion.div
      initial={{ opacity: 0, x: 60, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.9 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl min-w-[260px] max-w-sm"
      style={{
        background: isSuccess
          ? 'rgba(16,185,129,0.12)'
          : 'rgba(239,68,68,0.12)',
        borderColor: isSuccess
          ? 'rgba(16,185,129,0.35)'
          : 'rgba(239,68,68,0.35)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {isSuccess
        ? <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
        : <XCircle size={16} className="text-red-400 flex-shrink-0" />
      }
      <span className="text-sm text-slate-200 flex-1 leading-snug">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
        aria-label="Tutup notifikasi"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

/** Hook untuk menggunakan toast */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'error') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, removeToast };
}
