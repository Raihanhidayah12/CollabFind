import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';

function SkeletonCard() {
  return (
    <div className="p-6 rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/60 animate-pulse">
      <div className="w-5 h-5 rounded bg-white/[0.06] mb-3" />
      <div className="space-y-2 mb-5">
        <div className="h-3 w-full rounded bg-white/[0.05]" />
        <div className="h-3 w-5/6 rounded bg-white/[0.05]" />
        <div className="h-3 w-4/6 rounded bg-white/[0.05]" />
      </div>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/[0.06]" />
        <div className="flex flex-col gap-1.5">
          <div className="h-3.5 w-24 rounded bg-white/[0.06]" />
          <div className="h-3 w-20 rounded bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}

const fallbackTestimonials = [
  { id: '1', name: 'Alex Johnson', role: 'Software Engineer', quote: 'CollabFind helped me find the perfect team for my side project. The talent here is unmatched!', avatar_initial: 'A', accent_color: '#3b82f6', stars: 5 },
  { id: '2', name: 'Sarah Lee', role: 'Product Designer', quote: 'I was able to collaborate with developers from across the globe and build an amazing portfolio piece.', avatar_initial: 'S', accent_color: '#ec4899', stars: 5 },
  { id: '3', name: 'Michael Chen', role: 'Full Stack Developer', quote: 'The project matching system is incredibly accurate. Found a team building exactly what I wanted to learn.', avatar_initial: 'M', accent_color: '#10b981', stars: 5 },
  { id: '4', name: 'Emily Davis', role: 'UI/UX Designer', quote: 'As a designer, it\'s always hard to find developers to bring my ideas to life. CollabFind solved that for me.', avatar_initial: 'E', accent_color: '#f59e0b', stars: 5 },
  { id: '5', name: 'David Kim', role: 'Backend Developer', quote: 'Built a real-time chat application with a team I met here. We even launched it on Product Hunt!', avatar_initial: 'D', accent_color: '#8b5cf6', stars: 5 },
  { id: '6', name: 'Jessica Wilson', role: 'Frontend Developer', quote: 'The community is supportive and the platform is so easy to use. Highly recommend for any builder.', avatar_initial: 'J', accent_color: '#ef4444', stars: 5 }
];

export default function Testimonials() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(6);

        if (!error && data && data.length > 0) {
          setItems(data);
        } else {
          // Fallback to static data if table doesn't exist or is empty
          setItems(fallbackTestimonials);
        }
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setItems(fallbackTestimonials);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  return (
    <section className="testimonials-section py-24 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Loved by <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">builders</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Thousands of students and professionals trust CollabFind to grow their careers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : items.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                whileHover={{ y: -4 }}
                className="group relative p-6 rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/60 backdrop-blur-sm hover:border-white/[0.14] transition-all duration-300"
              >
                <Quote size={20} className="text-slate-700 mb-3" />
                <p className="text-sm text-slate-400 leading-relaxed mb-5 italic">"{t.quote}"</p>

                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: `${t.accent_color}22`, border: `1px solid ${t.accent_color}44` }}
                  >
                    {t.avatar_initial || t.name?.[0] || '?'}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: t.stars || 5 }).map((_, j) => (
                      <span key={j} className="text-yellow-400 text-xs">★</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))
          }
        </div>
      </div>
    </section>
  );
}
