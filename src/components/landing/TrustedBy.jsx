import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../utils/supabaseClient';

export default function TrustedBy() {
  const [orgs, setOrgs] = useState([]);

  useEffect(() => {
    supabase
      .from('trusted_orgs')
      .select('id, name, initial')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => { if (data) setOrgs(data); });
  }, []);

  // Need at least some items to show marquee
  if (orgs.length === 0) return null;

  // Duplicate for seamless infinite scroll
  const items = [...orgs, ...orgs];

  return (
    <section className="py-14 border-y border-white/[0.05] overflow-hidden">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center text-xs text-slate-600 uppercase tracking-widest mb-8"
      >
        Trusted by students &amp; creators from
      </motion.p>

      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#050816] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#050816] to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex gap-10 items-center"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          style={{ width: 'max-content' }}
        >
          {items.map((org, i) => (
            <div
              key={`${org.id}-${i}`}
              className="flex items-center gap-2.5 text-slate-500 hover:text-slate-300 transition-colors whitespace-nowrap"
            >
              <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-xs font-bold text-slate-400 flex-shrink-0">
                {org.initial || org.name[0]}
              </div>
              <span className="text-sm font-medium">{org.name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
