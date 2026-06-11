import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'web_dev', label: 'Web Dev' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'design', label: 'Design' },
  { value: 'data', label: 'Data' },
  { value: 'writing', label: 'Writing' },
  { value: 'marketing', label: 'Marketing' },
];

const EXPERIENCE_LEVELS = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'expert', label: 'Expert' },
];

const BUDGET_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'fixed', label: 'Fixed Price' },
  { value: 'hourly', label: 'Hourly' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'budget_high', label: 'Highest Budget' },
  { value: 'budget_low', label: 'Lowest Budget' },
];

function MiniSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const selected = options.find(o => o.value === value) || options[0];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 text-xs hover:border-white/[0.16] transition-all whitespace-nowrap"
      >
        <span>{selected.label}</span>
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full mt-1 left-0 min-w-[140px] z-50 rounded-xl border border-white/[0.1] bg-[#0d1224]/95 backdrop-blur-xl shadow-xl overflow-hidden"
          >
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                  opt.value === value ? 'text-blue-300 bg-blue-500/10' : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FreelanceFilters({ filters, onFilterChange }) {
  const { search, category, experience, budgetType, sort } = filters;
  const [showAdvanced, setShowAdvanced] = useState(false);
  const hasAdvanced = experience !== 'all' || budgetType !== 'all' || sort !== 'newest';

  const set = (key, val) => onFilterChange({ ...filters, [key]: val });

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search jobs, skills..."
            value={search}
            onChange={e => set('search', e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-600 text-sm outline-none focus:border-blue-500/50 transition-all"
          />
          {search && (
            <button onClick={() => set('search', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              <X size={13} />
            </button>
          )}
        </div>

        <MiniSelect value={category} onChange={v => set('category', v)} options={CATEGORIES} />

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
            showAdvanced || hasAdvanced
              ? 'border-blue-500/50 bg-blue-500/10 text-blue-300'
              : 'border-white/[0.08] bg-white/[0.04] text-slate-400 hover:text-white hover:border-white/[0.15]'
          }`}
        >
          <SlidersHorizontal size={13} />
          Filters
          {hasAdvanced && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
        </button>
      </div>

      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 py-1">
              <MiniSelect value={experience} onChange={v => set('experience', v)} options={EXPERIENCE_LEVELS} />
              <MiniSelect value={budgetType} onChange={v => set('budgetType', v)} options={BUDGET_TYPES} />
              <MiniSelect value={sort} onChange={v => set('sort', v)} options={SORT_OPTIONS} />
              {hasAdvanced && (
                <button
                  onClick={() => onFilterChange({ search, category, experience: 'all', budgetType: 'all', sort: 'newest' })}
                  className="px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-red-400 border border-white/[0.06] hover:border-red-500/30 transition-all"
                >
                  Clear filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
