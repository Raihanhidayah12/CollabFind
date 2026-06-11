import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Briefcase, Loader2, ArrowLeft, X, CheckCircle } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import PageNavbar from '../components/PageNavbar';

const CATEGORIES = [
  { value: 'web_dev', label: 'Web Development' },
  { value: 'mobile', label: 'Mobile Development' },
  { value: 'design', label: 'UI/UX Design' },
  { value: 'data', label: 'Data & Analytics' },
  { value: 'writing', label: 'Writing & Content' },
  { value: 'marketing', label: 'Marketing' },
];

const DURATIONS = [
  { value: 'less_1_week', label: 'Less than 1 week' },
  { value: '1_4_weeks', label: '1-4 weeks' },
  { value: '1_3_months', label: '1-3 months' },
  { value: '3_plus_months', label: '3+ months' },
];

const EXP_LEVELS = [
  { value: 'beginner', label: 'Beginner', desc: 'Entry-level, learning' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Some experience' },
  { value: 'expert', label: 'Expert', desc: 'Senior-level' },
];

function SkillTagInput({ value, onChange }) {
  const [input, setInput] = useState('');

  const addSkill = (raw) => {
    const tag = raw.trim();
    if (!tag || value.includes(tag)) return;
    onChange([...value, tag]);
  };

  const handleKeyDown = (e) => {
    if (['Enter', ',', 'Tab'].includes(e.key)) {
      e.preventDefault();
      addSkill(input);
      setInput('');
    }
    if (e.key === 'Backspace' && !input && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div
      className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 flex flex-wrap gap-1.5 items-center focus-within:border-blue-500/50 transition-all"
      onClick={(e) => e.currentTarget.querySelector('input')?.focus()}
    >
      {value.map((tag, i) => (
        <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/12 border border-blue-500/25 text-blue-300 text-xs font-semibold">
          {tag}
          <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))} className="text-blue-300/50 hover:text-white">
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (input.trim()) { addSkill(input); setInput(''); } }}
        placeholder={value.length === 0 ? 'Type a skill and press Enter...' : ''}
        className="flex-1 min-w-[120px] bg-transparent text-sm text-white placeholder-slate-600 outline-none py-0.5"
      />
    </div>
  );
}

export default function PostJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [session, setSession] = useState(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState([]);
  const [budgetType, setBudgetType] = useState('fixed');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [duration, setDuration] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('intermediate');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { navigate('/login', { state: { from: '/freelance/post' } }); return; }
      setSession(data.session);
    });
  }, [navigate]);

  const canSubmit = title.trim().length >= 5 && description.trim().length >= 30 && category && skills.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || loading || !session) return;
    setLoading(true);
    try {
      const { data: job, error } = await supabase
        .from('freelance_jobs')
        .insert({
          client_id: session.user.id,
          title: title.trim(),
          description: description.trim(),
          category,
          budget_type: budgetType,
          budget_min: budgetMin ? parseInt(budgetMin) : null,
          budget_max: budgetMax ? parseInt(budgetMax) : null,
          skills,
          duration: duration || null,
          experience_level: experienceLevel,
        })
        .select()
        .single();

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => navigate(`/freelance/job/${job.id}`), 1500);
    } catch (err) {
      console.error(err);
      alert('Failed to post job: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/15 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Job Posted!</h2>
          <p className="text-slate-400 text-sm">Redirecting to job details...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] font-['Manrope',sans-serif]">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[500px] h-[400px] bg-blue-600/8 rounded-full blur-[120px]" />
      </div>

      <PageNavbar breadcrumbs={[{ label: 'Freelance', href: '/freelance' }, { label: 'Post a Job' }]} />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => navigate('/freelance')} className="flex items-center gap-1 text-xs text-slate-500 hover:text-white mb-4 transition-colors">
            
          </button>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
            Post a <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Job</span>
          </h1>
          <p className="text-slate-400 text-sm mb-8">Describe your project and find the right freelancer.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Job Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Build a React dashboard for analytics"
                className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Category *</label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      category === cat.value
                        ? 'border-blue-500/50 bg-blue-500/10 text-blue-300'
                        : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-white hover:border-white/[0.15]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Description *</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe the project in detail — what needs to be built, requirements, deliverables..."
                rows={6}
                className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 transition-all resize-none"
              />
              <span className={`text-[10px] mt-1 ${description.length >= 30 ? 'text-green-400/60' : 'text-slate-600'}`}>
                {description.length}/30 min characters {description.length >= 30 && '✓'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Skills Required *</label>
              <SkillTagInput value={skills} onChange={setSkills} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Budget Type</label>
              <div className="flex gap-2 mb-3">
                {['fixed', 'hourly'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setBudgetType(t)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      budgetType === t
                        ? 'border-blue-500/50 bg-blue-500/10 text-blue-300'
                        : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-white hover:border-white/[0.15]'
                    }`}
                  >
                    {t === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Minimum (USD)</label>
                  <input
                    type="number"
                    min="0"
                    value={budgetMin}
                    onChange={e => setBudgetMin(e.target.value)}
                    placeholder="100"
                    className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Maximum (USD)</label>
                  <input
                    type="number"
                    min="0"
                    value={budgetMax}
                    onChange={e => setBudgetMax(e.target.value)}
                    placeholder="500"
                    className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Estimated Duration</label>
              <div className="grid grid-cols-2 gap-2">
                {DURATIONS.map(d => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDuration(d.value)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      duration === d.value
                        ? 'border-blue-500/50 bg-blue-500/10 text-blue-300'
                        : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-white hover:border-white/[0.15]'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Experience Level</label>
              <div className="grid grid-cols-3 gap-2">
                {EXP_LEVELS.map(l => (
                  <button
                    key={l.value}
                    type="button"
                    onClick={() => setExperienceLevel(l.value)}
                    className={`px-3 py-3 rounded-xl text-xs border transition-all text-center ${
                      experienceLevel === l.value
                        ? 'border-blue-500/50 bg-blue-500/10 text-blue-300'
                        : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-white hover:border-white/[0.15]'
                    }`}
                  >
                    <div className="font-semibold">{l.label}</div>
                    <div className="text-[10px] opacity-60 mt-0.5">{l.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {loading ? 'Posting...' : 'Post Job'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
