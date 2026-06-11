import { CheckCircle, Clock, XCircle, CircleDot, Send, DollarSign } from 'lucide-react';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   icon: Clock,       color: '#F59E0B', lineColor: 'border-yellow-500/30' },
  submitted: { label: 'Submitted', icon: Send,        color: '#3B82F6', lineColor: 'border-blue-500/30' },
  approved:  { label: 'Approved',  icon: CheckCircle, color: '#10B981', lineColor: 'border-green-500/30' },
  rejected:  { label: 'Rejected',  icon: XCircle,     color: '#EF4444', lineColor: 'border-red-500/30' },
  paid:      { label: 'Paid',      icon: DollarSign,  color: '#8B5CF6', lineColor: 'border-purple-500/30' },
};

export default function MilestoneTracker({ milestones, isFreelancer, isClient, onSubmit, onApprove, onReject }) {
  return (
    <div className="space-y-0">
      {milestones.map((ms, i) => {
        const config = STATUS_CONFIG[ms.status] || STATUS_CONFIG.pending;
        const Icon = config.icon;
        const isLast = i === milestones.length - 1;

        return (
          <div key={ms.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2"
                style={{ borderColor: config.color, background: `${config.color}18` }}
              >
                <Icon size={16} style={{ color: config.color }} />
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 my-1 border-l-2 ${config.lineColor}`} />
              )}
            </div>

            <div className={`flex-1 pb-6 ${isLast ? '' : ''}`}>
              <div className="rounded-xl border border-white/[0.07] bg-[#0a0f1e]/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-white">{ms.title}</h4>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                    style={{ color: config.color, borderColor: `${config.color}33`, background: `${config.color}12` }}
                  >
                    {config.label}
                  </span>
                </div>

                {ms.description && (
                  <p className="text-xs text-slate-500 mb-2">{ms.description}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                  <span className="flex items-center gap-1">
                    <DollarSign size={12} className="text-green-400" />
                    ${ms.amount.toLocaleString()}
                  </span>
                  {ms.due_date && (
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> Due {new Date(ms.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                  {ms.submitted_at && (
                    <span className="text-blue-400">
                      Submitted {new Date(ms.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                  {ms.approved_at && (
                    <span className="text-green-400">
                      Approved {new Date(ms.approved_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  {isFreelancer && ms.status === 'pending' && (
                    <button
                      onClick={() => onSubmit?.(ms.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-all"
                    >
                      Submit Deliverable
                    </button>
                  )}
                  {isClient && ms.status === 'submitted' && (
                    <>
                      <button
                        onClick={() => onApprove?.(ms.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-green-500/20 border border-green-500/30 hover:bg-green-500/30 transition-all"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onReject?.(ms.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 transition-all"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {milestones.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-sm">
          No milestones yet
        </div>
      )}
    </div>
  );
}
