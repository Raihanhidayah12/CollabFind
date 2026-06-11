import { Link } from 'react-router-dom';
import { DollarSign, Star, Briefcase, ArrowRight, Clock } from 'lucide-react';

const AVAILABILITY_STYLE = {
  available:     { label: 'Available',    cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
  busy:          { label: 'Busy',         cls: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  not_available: { label: 'Unavailable',  cls: 'text-slate-400 bg-slate-400/10 border-slate-400/20' },
};

export default function FreelancerCard({ profile, index = 0 }) {
  const avail = AVAILABILITY_STYLE[profile.availability] || AVAILABILITY_STYLE.not_available;
  const initial = (profile.name || 'F')[0].toUpperCase();

  return (
    <div
      className="group flex flex-col rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 backdrop-blur-sm p-5 hover:border-white/[0.14] transition-all duration-300"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-center gap-3 mb-4">
        {profile.avatar_url?.startsWith('http') ? (
          <img src={profile.avatar_url} alt={profile.name} className="w-12 h-12 rounded-xl object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/25 to-purple-500/25 border border-white/[0.1] flex items-center justify-center font-bold text-white">
            {initial}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-bold text-white truncate text-sm">{profile.name || 'Freelancer'}</p>
          <p className="text-xs text-slate-500 truncate">{profile.job_title || 'Developer'}</p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${avail.cls}`}>
          {avail.label}
        </span>
      </div>

      {(profile.bio) && (
        <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">{profile.bio}</p>
      )}

      <div className="flex flex-wrap gap-1.5 mb-4">
        {(profile.skills || []).slice(0, 4).map(sk => (
          <span key={sk} className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.07] text-xs text-slate-400">{sk}</span>
        ))}
        {(profile.skills || []).length > 4 && (
          <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.07] text-xs text-slate-500">
            +{profile.skills.length - 4}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
        {profile.hourly_rate > 0 && (
          <span className="flex items-center gap-1">
            <DollarSign size={12} className="text-green-400" />
            ${profile.hourly_rate}/hr
          </span>
        )}
        {profile.completed_jobs > 0 && (
          <span className="flex items-center gap-1">
            <Briefcase size={11} /> {profile.completed_jobs} jobs
          </span>
        )}
        {profile.total_earned > 0 && (
          <span className="flex items-center gap-1">
            <Star size={11} className="text-yellow-400" />
            ${profile.total_earned.toLocaleString()}
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center gap-1.5 text-[10px] text-slate-600">
        <Clock size={10} /> Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
      </div>
    </div>
  );
}
