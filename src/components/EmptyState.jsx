import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Search,
  title,
  description,
  actionLabel,
  actionLink,
  actionOnClick,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-5">
        <Icon size={28} className="text-slate-500" />
      </div>

      <h3 className="text-base font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
        {title}
      </h3>

      {description && (
        <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-6">{description}</p>
      )}

      {actionLabel && actionLink && (
        <Link
          to={actionLink}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-all"
        >
          {actionLabel}
        </Link>
      )}

      {actionLabel && actionOnClick && (
        <button
          onClick={actionOnClick}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
