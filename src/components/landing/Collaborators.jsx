import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';

const AVATAR_COLORS = ['#3B82F6','#8B5CF6','#06B6D4','#10B981','#F59E0B','#EC4899'];

function CardSkeleton() {
  return (
    <div className="p-5 rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/60 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-white/[0.06]" />
        <div className="flex flex-col gap-2">
          <div className="h-4 w-28 rounded bg-white/[0.06]" />
          <div className="h-3 w-20 rounded bg-white/[0.04]" />
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        {[1,2,3].map(i => <div key={i} className="h-5 w-14 rounded-md bg-white/[0.05]" />)}
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.05]" />
    </div>
  );
}

export default function Collaborators() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, name, bio, skills, role, job_title, avatar_url')
        .order('created_at', { ascending: false })
        .limit(6);

      if (!error && profiles) {
        const collabIds = profiles.map(c => c.id);
        const { data: ratingsData } = await supabase
          .from('user_ratings')
          .select('ratee_id, score')
          .in('ratee_id', collabIds);
          
        if (ratingsData) {
          profiles.forEach(c => {
            const userRatings = ratingsData.filter(r => r.ratee_id === c.id);
            if (userRatings.length > 0) {
              const total = userRatings.reduce((sum, r) => sum + r.score, 0);
              c.collaborationScore = Math.round(total / userRatings.length);
            } else {
              c.collaborationScore = 0;
            }
          });
        } else {
          profiles.forEach(c => c.collaborationScore = 0);
        }
        
        // Sort by score if we want "Top Rated", but for now just use the list
        setUsers(profiles);
      }
      setLoading(false);
    }
    fetch();
  }, []);

  return (
    <section id="collaborators" className="collaborators-section py-24 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-600/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-medium mb-4">
            <Star size={12} /> Top Rated
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Top <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Collaborators</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Work with the best — browse profiles of highly-rated builders.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
            : users.length === 0
            ? (
              <div className="col-span-3 text-center text-slate-600 py-12">
                No collaborators yet. Be the first to{' '}
                <a href="/register" className="text-blue-400 hover:underline">join</a>!
              </div>
            )
            : users.map((u, i) => {
                const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                const initial = (u.name || 'U')[0].toUpperCase();
                const skills = u.skills || [];
                const score = u.collaborationScore || 0; // use real score

                return (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.07 }}
                    whileHover={{ y: -4, scale: 1.01 }}
                    className="group relative p-5 rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/60 backdrop-blur-sm hover:border-white/[0.14] transition-all duration-300 cursor-pointer"
                  >
                    <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-300 text-xs font-bold">
                      <Star size={10} className="fill-yellow-300" /> {score}
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      {u.avatar_url?.startsWith('http') ? (
                        <img
                          src={u.avatar_url}
                          alt={u.name}
                          className="w-12 h-12 rounded-xl object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                        />
                      ) : null}
                      <div
                        className="w-12 h-12 rounded-xl items-center justify-center text-lg font-bold text-white flex-shrink-0"
                        style={{ background: `${color}22`, border: `1px solid ${color}44`, boxShadow: `0 0 16px ${color}33`, display: u.avatar_url?.startsWith('http') ? 'none' : 'flex' }}
                      >
                        {initial}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm group-hover:text-blue-300 transition-colors">{u.name || 'Anonymous'}</div>
                        <div className="text-xs text-slate-500">{u.job_title || u.role || 'Member'}</div>
                      </div>
                    </div>

                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {skills.slice(0, 3).map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.07] text-xs text-slate-400">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    <div>
                      <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                        <span>Collaboration Score</span>
                        <span style={{ color }}>{score}/100</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${score}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })
          }
        </div>
      </div>
    </section>
  );
}
