import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, DollarSign, Briefcase, ArrowRight, Star } from 'lucide-react';

const CATEGORY_LABELS = {
  web_dev: 'Web Dev',
  mobile: 'Mobile',
  design: 'Design',
  data: 'Data',
  writing: 'Writing',
  marketing: 'Marketing',
};

const EXP_LABELS = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  expert: 'Expert',
};

const DURATION_LABELS = {
  less_1_week: '< 1 week',
  '1_4_weeks': '1-4 weeks',
  '1_3_months': '1-3 months',
  '3_plus_months': '3+ months',
};

const STATUS_STYLE = {
  open:        { label: 'Open',         cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
  in_progress: { label: 'In Progress',  cls: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  completed:   { label: 'Completed',    cls: 'text-slate-400 bg-slate-400/10 border-slate-400/20' },
  cancelled:   { label: 'Cancelled',    cls: 'text-red-400 bg-red-400/10 border-red-400/20' },
  closed:      { label: 'Closed',       cls: 'text-slate-400 bg-slate-400/10 border-slate-400/20' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function formatBudget(min, max, type) {
  if (!min && !max) return 'Negotiable';
  const fmt = (n) => `$${n.toLocaleString()}`;
  const range = min && max ? `${fmt(min)} - ${fmt(max)}` : min ? `${fmt(min)}+` : `up to ${fmt(max)}`;
  return `${range} (${type === 'hourly' ? '/hr' : 'fixed'})`;
}

export default function JobCard({ job, index = 0 }) {
  const s = STATUS_STYLE[job.status] || STATUS_STYLE.open;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -3 }}
      className="group flex flex-col rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 backdrop-blur-sm overflow-hidden hover:border-white/[0.14] transition-all duration-300"
    >
      <div className="h-1 w-full bg-gradient-to-r from-blue-500/60 to-purple-500/30" />

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.cls}`}>{s.label}</span>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Clock size={11} /> {timeAgo(job.created_at)}
          </span>
        </div>

        <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-blue-300 transition-colors line-clamp-1">
          {job.title}
        </h3>
        <p className="text-xs text-slate-500 mb-3 leading-relaxed line-clamp-2">{job.description}</p>

        <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
          <span className="flex items-center gap-1">
            <DollarSign size={12} className="text-green-400" />
            {formatBudget(job.budget_min, job.budget_max, job.budget_type)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
          {job.duration && (
            <span className="flex items-center gap-1">
              <Briefcase size={11} /> {DURATION_LABELS[job.duration] || job.duration}
            </span>
          )}
          {job.experience_level && (
            <span className="flex items-center gap-1">
              <Star size={11} /> {EXP_LABELS[job.experience_level] || job.experience_level}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {(job.skills || []).slice(0, 3).map(sk => (
            <span key={sk} className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.07] text-xs text-slate-400">{sk}</span>
          ))}
          {(job.skills || []).length > 3 && (
            <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.07] text-xs text-slate-500">
              +{job.skills.length - 3}
            </span>
          )}
        </div>

        <Link
          to={`/freelance/job/${job.id}`}
          className="mt-auto w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-white border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.09] hover:border-white/[0.15] group/btn transition-all"
        >
          View Details <ArrowRight size={13} className="group-hover/btn:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}
