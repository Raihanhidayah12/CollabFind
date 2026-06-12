import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, FolderOpen, X, ArrowRight } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useLanguage } from '../i18n/LanguageContext';

export default function QuickSearch() {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.length < 2) { setResults([]); setOpen(false); return; }

    setLoading(true);
    const timer = setTimeout(async () => {
      setSearching(true);

      const [projRes, profileRes] = await Promise.all([
        supabase
          .from('projects')
          .select('id, title, status')
          .ilike('title', `%${query}%`)
          .limit(5),
        supabase
          .from('profiles')
          .select('id, name, job_title')
          .or(`name.ilike.%${query}%,job_title.ilike.%${query}%`)
          .limit(5),
      ]);

      const items = [];
      if (projRes.data) projRes.data.forEach(p => items.push({ type: 'project', ...p }));
      if (profileRes.data) profileRes.data.forEach(p => items.push({ type: 'user', ...p }));

      setResults(items.slice(0, 8));
      setOpen(true);
      setLoading(false);
      setSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item) => {
    setOpen(false);
    setQuery('');
    if (item.type === 'project') navigate(`/project/${item.id}`);
    else navigate(`/profile/${item.id}`);
  };

  return (
    <div className="relative">
      {/* Search input */}
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/[0.08] bg-[#0a0f1e]/60 focus-within:border-blue-500/30 focus-within:bg-[#0a0f1e]/80 transition-all">
        <Search size={13} className="text-slate-500 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={t('qs.placeholder')}
          className="flex-1 bg-transparent text-xs text-white placeholder-slate-600 outline-none"
        />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false); }} className="text-slate-600 hover:text-slate-400">
            <X size={12} />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-white/[0.08] bg-[#0d1224]/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-1.5 space-y-0.5 max-h-56 overflow-y-auto">
              {results.map((item, i) => {
                const Icon = item.type === 'project' ? FolderOpen : Users;
                const color = item.type === 'project' ? '#3B82F6' : '#8B5CF6';
                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleSelect(item)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.04] transition-all text-left"
                    style={{ animationDelay: `${i * 0.03}s` }}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
                      <Icon size={12} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white font-medium truncate">{item.title || item.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{item.type === 'project' ? item.status : item.job_title || 'User'}</p>
                    </div>
                    <ArrowRight size={10} className="text-slate-700 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="absolute top-full left-0 right-0 mt-1 px-3 py-2 text-[10px] text-slate-600">
          {t('qs.searching')}
        </div>
      )}
    </div>
  );
}
