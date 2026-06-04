import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, CheckCircle, MessageSquare, AlertCircle, X } from 'lucide-react';

export default function ToastNotification({ notification, onDismiss, autoClose }) {
  const navigate = useNavigate();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const delay = autoClose || notification.autoClose || 5000;
    if (!delay) return;
    const timer = setTimeout(onDismiss, delay);
    return () => clearTimeout(timer);
  }, [autoClose, notification.autoClose, onDismiss]);

  const getIcon = () => {
    switch (notification.type) {
      case 'message':
        return <MessageSquare size={20} className="text-blue-400" />;
      case 'accepted':
        return <CheckCircle size={20} className="text-emerald-400" />;
      case 'rejected':
        return <AlertCircle size={20} className="text-red-400" />;
      case 'info':
        return <Bell size={20} className="text-purple-400" />;
      default:
        return <Bell size={20} className="text-slate-400" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'message':
        return 'border-blue-500/30 bg-blue-500/10';
      case 'accepted':
        return 'border-emerald-500/30 bg-emerald-500/10';
      case 'rejected':
        return 'border-red-500/30 bg-red-500/10';
      case 'info':
        return 'border-purple-500/30 bg-purple-500/10';
      default:
        return 'border-slate-500/30 bg-slate-500/10';
    }
  };

  const handleClick = () => {
    if (notification.link && !hasError) {
      try {
        navigate(notification.link);
        onDismiss();
      } catch (error) {
        console.error('Navigation error:', error);
        setHasError(true);
        onDismiss();
      }
    }
  };

  if (hasError) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      onClick={handleClick}
      className={`flex items-start gap-3 p-4 rounded-2xl border ${getBgColor()} backdrop-blur-xl shadow-[0_16px_48px_rgba(0,0,0,0.6)] max-w-sm ${notification.link ? 'cursor-pointer hover:border-white/50 transition-colors' : ''}`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-white mb-1">{notification.title}</div>
        <div className="text-xs text-slate-300 leading-relaxed">{notification.message}</div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        className="flex-shrink-0 text-slate-400 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}
