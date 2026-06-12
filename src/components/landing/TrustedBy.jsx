import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../utils/supabaseClient';
import { useLanguage } from '../../i18n/LanguageContext';

const FALLBACK_ORGS = [
  { id: 'f1',  name: 'Universitas Indonesia',    initial: 'UI' },
  { id: 'f2',  name: 'ITB',                       initial: 'IT' },
  { id: 'f3',  name: 'Dicoding',                  initial: 'DC' },
  { id: 'f4',  name: 'Bangkit Academy',           initial: 'BA' },
  { id: 'f5',  name: 'Google Developer Groups',   initial: 'GD' },
  { id: 'f6',  name: 'HMIF ITB',                  initial: 'HM' },
  { id: 'f7',  name: 'ITS Surabaya',              initial: 'IT' },
  { id: 'f8',  name: 'Microsoft Learn',           initial: 'MS' },
  { id: 'f9',  name: 'Universitas Gadjah Mada',   initial: 'UG' },
  { id: 'f10', name: 'Hacktiv8',                  initial: 'H8' },
];

export default function TrustedBy() {
  const [orgs, setOrgs] = useState([]);
  const { t } = useLanguage();

  useEffect(() => {
    supabase
      .from('trusted_orgs')
      .select('id, name, initial')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setOrgs(data);
        } else {
          setOrgs(FALLBACK_ORGS);
        }
      })
      .catch(() => setOrgs(FALLBACK_ORGS));
  }, []);

  const items = [...orgs, ...orgs];

  return (
    <section className="py-14 border-y border-white/[0.05] overflow-hidden">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center text-xs text-slate-600 uppercase tracking-widest mb-8"
      >
        {t('trust.tagline', 'Trusted by students & creators from')}
      </motion.p>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#050816] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#050816] to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex gap-10 items-center"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          style={{ width: 'max-content' }}
        >
          {items.map((org, i) => (
            <div
              key={`${org.id}-${i}`}
              className="flex items-center gap-2.5 text-slate-500 hover:text-slate-300 transition-colors whitespace-nowrap"
            >
              <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[10px] font-bold text-slate-400 flex-shrink-0">
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
