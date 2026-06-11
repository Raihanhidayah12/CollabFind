import { Clock, DollarSign, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUS_STYLE = {
  pending:   { label: 'Pending',   icon: Clock,       cls: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  accepted:  { label: 'Accepted',  icon: CheckCircle,  cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
  rejected:  { label: 'Rejected',  icon: XCircle,      cls: 'text-red-400 bg-red-400/10 border-red-400/20' },
  withdrawn: { label: 'Withdrawn', icon: AlertCircle,  cls: 'text-slate-400 bg-slate-400/10 border-slate-400/20' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'today';
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default function ProposalCard({ proposal, job, showJobLink = false }) {
  const s = STATUS_STYLE[proposal.status] || STATUS_STYLE.pending;
  const StatusIcon = s.icon;

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 p-5 hover:border-white/[0.12] transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.cls}`}>
          <StatusIcon size={12} /> {s.label}
        </span>
        <span className="text-xs text-slate-500">{timeAgo(proposal.created_at)}</span>
      </div>

      {showJobLink && job && (
        <Link
          to={`/freelance/job/${job.id}`}
          className="block text-sm font-bold text-white hover:text-blue-300 transition-colors mb-1"
        >
          {job.title}
        </Link>
      )}

      <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-3">{proposal.cover_letter}</p>

      <div className="flex items-center gap-4 text-xs text-slate-400">
        {proposal.proposed_rate > 0 && (
          <span className="flex items-center gap-1">
            <DollarSign size={12} className="text-green-400" />
            ${proposal.proposed_rate.toLocaleString()} proposed
          </span>
        )}
        {proposal.estimated_duration && (
          <span className="flex items-center gap-1">
            <Clock size={11} /> {proposal.estimated_duration}
          </span>
        )}
      </div>
    </div>
  );
}
