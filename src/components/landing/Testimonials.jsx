import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import { useLanguage } from '../../i18n/LanguageContext';

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

function getFallbackTestimonials(t) {
  return [
    { id: 'f1', quote: t('test.f1Quote'), name: t('test.f1Name'), role: t('test.f1Role'), accent_color: '#3B82F6', avatar_initial: 'A', stars: 5 },
    { id: 'f2', quote: t('test.f2Quote'), name: t('test.f2Name'), role: t('test.f2Role'), accent_color: '#8B5CF6', avatar_initial: 'R', stars: 5 },
    { id: 'f3', quote: t('test.f3Quote'), name: t('test.f3Name'), role: t('test.f3Role'), accent_color: '#EC4899', avatar_initial: 'M', stars: 5 },
    { id: 'f4', quote: t('test.f4Quote'), name: t('test.f4Name'), role: t('test.f4Role'), accent_color: '#10B981', avatar_initial: 'F', stars: 5 },
    { id: 'f5', quote: t('test.f5Quote'), name: t('test.f5Name'), role: t('test.f5Role'), accent_color: '#F59E0B', avatar_initial: 'B', stars: 5 },
    { id: 'f6', quote: t('test.f6Quote'), name: t('test.f6Name'), role: t('test.f6Role'), accent_color: '#06B6D4', avatar_initial: 'K', stars: 5 },
  ];
}

export default function Testimonials() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

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
          setItems(getFallbackTestimonials(t));
        }
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setItems(getFallbackTestimonials(t));
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [t]);

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
            {t('test.heading', 'Loved by')} <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{t('test.headingHighlight', 'builders')}</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            {t('test.subtitle', 'Thousands of students and professionals trust CollabFind to grow their careers.')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                whileHover={{ y: -4 }}
                className="group relative p-6 rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/60 backdrop-blur-sm hover:border-white/[0.14] transition-all duration-300"
              >
                <Quote size={20} className="text-slate-700 mb-3" />
                <p className="text-sm text-slate-400 leading-relaxed mb-5 italic">"{item.quote}"</p>

                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: `${item.accent_color}22`, border: `1px solid ${item.accent_color}44` }}
                  >
                    {item.avatar_initial || item.name?.[0] || '?'}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{item.name}</div>
                    <div className="text-xs text-slate-500">{item.role}</div>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: item.stars || 5 }).map((_, j) => (
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
