import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, MessageSquare, Lightbulb, Code2, Plus, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';

const CATEGORIES = [
  { id: 'idea',  label: 'Idea Validation', icon: Lightbulb, color: '#F59E0B', desc: 'Lempar ide mentahmu, lihat siapa yang tertarik' },
  { id: 'tech',  label: 'Tech Stack Q&A',  icon: Code2,     color: '#3B82F6', desc: 'Tanya masalah teknis dan diskusi stack pilihan' },
  { id: 'general', label: 'General',       icon: MessageSquare, color: '#8B5CF6', desc: 'Diskusi umum seputar kolaborasi dan produk' },
];

function PostCard({ post }) {
  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr);
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const cat = CATEGORIES.find(c => c.id === post.category) || CATEGORIES[2];

  return (
    <div className="flex gap-4 p-5 rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 hover:border-white/[0.14] transition-all group">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: `${cat.color}18`, border: `1px solid ${cat.color}33` }}>
        <cat.icon size={15} style={{ color: cat.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors leading-snug">{post.title}</p>
          <span className="text-[10px] text-slate-600 flex-shrink-0 mt-0.5">{timeAgo(post.created_at)}</span>
        </div>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{post.body}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold border"
            style={{ color: cat.color, background: `${cat.color}15`, borderColor: `${cat.color}30` }}>
            {cat.label}
          </span>
          <span className="text-[10px] text-slate-600">{post.profiles?.name || 'Anonymous'}</span>
          <span className="flex items-center gap-1 text-[10px] text-slate-600">
            <MessageSquare size={9} /> {post.reply_count || 0}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Forum() {
  const [posts,    setPosts]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [active,   setActive]   = useState('all');
  const [session,  setSession]  = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState({ title: '', body: '', category: 'idea' });
  const [posting,  setPosting]  = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    const { data } = await supabase
      .from('forum_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);
    
    if (!data) { setLoading(false); return; }

    // Fetch author names separately
    const authorIds = [...new Set(data.map(p => p.author_id).filter(Boolean))];
    let profileMap = {};
    if (authorIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', authorIds);
      (profiles || []).forEach(p => { profileMap[p.id] = p; });
    }

    setPosts(data.map(p => ({ ...p, profiles: profileMap[p.author_id] || null })));
    setLoading(false);
  }

  async function submitPost(e) {
    e.preventDefault();
    if (!session) return;
    setPosting(true);
    await supabase.from('forum_posts').insert({
      title:     form.title.trim(),
      body:      form.body.trim(),
      category:  form.category,
      author_id: session.user.id,
    });
    setForm({ title: '', body: '', category: 'idea' });
    setShowForm(false);
    setPosting(false);
    fetchPosts();
  }

  const filtered = active === 'all' ? posts : posts.filter(p => p.category === active);

  return (
    <div className="min-h-screen bg-[#050816]" style={{ fontFamily: "'Manrope',sans-serif" }}>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
              Community Forum
            </h1>
            <p className="text-slate-400 text-sm">Diskusi, validasi ide, dan tanya jawab teknis bersama builder lainnya.</p>
          </div>
          {session && (
            <button
              onClick={() => setShowForm(p => !p)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 transition-all flex-shrink-0"
            >
              <Plus size={14} /> New Post
            </button>
          )}
        </motion.div>

        {/* Category tabs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
          className="flex gap-2 mb-6 flex-wrap">
          {[{ id: 'all', label: 'All', color: '#94A3B8' }, ...CATEGORIES].map(c => (
            <button key={c.id} onClick={() => setActive(c.id)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                active === c.id
                  ? 'bg-white/[0.09] text-white border-white/[0.15]'
                  : 'text-slate-500 border-white/[0.06] hover:text-slate-300 hover:border-white/[0.12]'
              }`}>
              {c.label}
            </button>
          ))}
        </motion.div>

        {/* Category cards */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setActive(c.id)}
              className="text-left p-4 rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 hover:border-white/[0.14] transition-all">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                style={{ background: `${c.color}18`, border: `1px solid ${c.color}33` }}>
                <c.icon size={14} style={{ color: c.color }} />
              </div>
              <p className="text-sm font-bold text-white mb-1">{c.label}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{c.desc}</p>
            </button>
          ))}
        </motion.div>

        {/* New post form */}
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            onSubmit={submitPost}
            className="mb-6 p-5 rounded-2xl border border-blue-500/30 bg-blue-500/[0.04]"
          >
            <p className="text-sm font-bold text-white mb-4">Buat Post Baru</p>
            <div className="flex flex-col gap-3">
              <input
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Judul post..."
                required
                className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 transition-all"
              />
              <textarea
                value={form.body}
                onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                placeholder="Tulis idemu, pertanyaan, atau diskusi di sini..."
                rows={4}
                required
                className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-4 py-2.5 text-sm text-slate-300 placeholder-slate-600 outline-none focus:border-blue-500/50 transition-all resize-none"
              />
              <div className="flex gap-2 items-center justify-between">
                <select
                  value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="bg-[#0d1226] border border-white/[0.09] rounded-xl px-3 py-2 text-sm text-slate-300 outline-none focus:border-blue-500/50 transition-all"
                >
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-4 py-2 rounded-xl text-sm text-slate-400 border border-white/[0.08] hover:bg-white/[0.05] transition-all">
                    Batal
                  </button>
                  <button type="submit" disabled={posting}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-all disabled:opacity-50">
                    {posting ? <Loader2 size={13} className="animate-spin" /> : <ArrowRight size={13} />}
                    Post
                  </button>
                </div>
              </div>
            </div>
          </motion.form>
        )}

        {/* Posts */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={24} className="text-blue-400 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70">
            <p className="text-slate-500 text-sm">Belum ada post di kategori ini.</p>
            {session && <p className="text-slate-600 text-xs mt-1">Jadilah yang pertama memulai diskusi!</p>}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((post, i) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <PostCard post={post} />
              </motion.div>
            ))}
          </div>
        )}

        {!session && (
          <p className="text-center text-sm text-slate-500 mt-10">
            <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors">Login</Link>
            {' '}untuk ikut berdiskusi.
          </p>
        )}
      </main>
      <Footer />
    </div>
  );
}
