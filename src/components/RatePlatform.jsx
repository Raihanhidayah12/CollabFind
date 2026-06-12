import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Loader2, CheckCircle, Send } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useLanguage } from '../i18n/LanguageContext';

const COLORS = [
  '#3B82F6', // blue
  '#EC4899', // pink
  '#10B981', // emerald
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#EF4444', // red
];

export default function RatePlatform({ session, onSuccess }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
// Form fields
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [quote, setQuote] = useState('');
  const [stars, setStars] = useState(5);
  const [accentColor, setAccentColor] = useState(COLORS[0]);
  const [existingTestimonial, setExistingTestimonial] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }
      try {
        const [{ data: testimonial }, { data: profile }] = await Promise.all([
          supabase
            .from('testimonials')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle(),
          supabase
            .from('profiles')
            .select('name, job_title')
            .eq('id', session.user.id)
            .maybeSingle()
        ]);
        
if (testimonial) {
          setExistingTestimonial(testimonial);
          setName(testimonial.name || '');
          setRole(testimonial.role || '');
          setQuote(testimonial.quote || '');
          setStars(testimonial.stars || 5);
          setAccentColor(testimonial.accent_color || COLORS[0]);
        } else if (profile) {
          // Pre-fill name and role from profile if no testimonial exists
          setName(profile.name || '');
          setRole(profile.job_title || '');
        }
// eslint-disable-next-line no-unused-vars
} catch (_err) {
        console.log('No testimonial found or table not ready');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [session?.user?.id]);

const handleSubmit = async () => {
    if (!quote.trim()) return;
    
    setSubmitting(true);
    try {
const payload = {
        user_id: session.user.id,
        name: name.trim() || session.user.email?.split('@')[0] || 'User',
        role: role.trim() || null,
        quote: quote.trim(),
        avatar_initial: (name.trim() || session.user.email?.[0]?.toUpperCase()) || 'U',
        accent_color: accentColor,
        stars: stars,
        is_active: false, // Require admin approval
      };

      if (existingTestimonial) {
        const { error } = await supabase
          .from('testimonials')
          .update(payload)
          .eq('id', existingTestimonial.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert(payload);
        
        if (error) throw error;
      }

      setSuccess(true);
      setShowForm(false);
      if (onSuccess) onSuccess();

    } catch (err) {
      console.error('Error submitting testimonial:', err);
      alert(t('rp.alertFail'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  // User already submitted a testimonial
  if (existingTestimonial && !showForm) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl border border-emerald-500/25 bg-emerald-500/8"
      >
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle className="text-emerald-400" size={20} />
          <span className="text-sm font-semibold text-white">{t('rp.thanksTitle')}</span>
        </div>
        <p className="text-xs text-slate-400 italic mb-3">"{existingTestimonial.quote}"</p>
        <div className="flex items-center justify-between">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(star => (
              <Star 
                key={star} 
                size={14} 
                className={star <= existingTestimonial.stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'} 
              />
            ))}
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            {t('rp.editReview')}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl border border-white/[0.08] bg-[#0a0f1e]/80"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">{t('rp.heading')}</h3>
            <p className="text-xs text-slate-500">{t('rp.subtitle')}</p>
          </div>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setStars(star)}
                className={`transition-all hover:scale-110 ${stars >= star ? 'text-yellow-400' : 'text-slate-600'}`}
              >
                <Star size={20} fill={stars >= star ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={quote}
          onChange={e => setQuote(e.target.value)}
          placeholder={t('rp.placeholder')}
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-600 text-sm outline-none focus:border-blue-500/40 transition-all resize-none mb-4"
        />

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setAccentColor(color)}
                className={`w-6 h-6 rounded-lg transition-all ${
                  accentColor === color 
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0f1e]' 
                    : 'hover:scale-110'
                }`}
                style={{ background: color }}
              />
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || !quote.trim()}
            className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}88)`,
            }}
          >
            {submitting ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                {t('rp.submitting')}
              </>
            ) : success ? (
              <>
                <CheckCircle size={12} />
                {t('rp.submitted')}
              </>
            ) : (
              <>
                <Send size={12} />
                {t('rp.submitBtn')}
              </>
            )}
          </button>
        </div>

        {existingTestimonial && (
          <button 
            onClick={() => setShowForm(false)}
            className="text-xs text-slate-500 hover:text-slate-400 mt-3 w-full text-center transition-colors"
          >
            {t('rp.cancel')}
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
