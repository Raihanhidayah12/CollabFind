import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, X, Calendar, User, Tag, Zap, Loader2 } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORIES = ['All', 'Startup', 'Engineering', 'Design', 'Team'];

const categoryColors = {
  Startup:     { bg: '#3B82F6', text: '#93C5FD' },
  Engineering: { bg: '#8B5CF6', text: '#C4B5FD' },
  Design:      { bg: '#EC4899', text: '#F9A8D4' },
  Team:        { bg: '#10B981', text: '#6EE7B7' },
};

function CategoryBadge({ category }) {
  const c = categoryColors[category] || { bg: '#64748b', text: '#cbd5e1' };
  return (
    <span
      className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
      style={{ background: `${c.bg}22`, color: c.text, border: `1px solid ${c.bg}40` }}
    >
      {category}
    </span>
  );
}

// ─── Format date ──────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

// ─── Post card ────────────────────────────────────────────────────────────────

function PostCard({ post, onClick }) {
  return (
    <motion.button
      onClick={() => onClick(post)}
      whileHover={{ y: -3 }}
      className="w-full text-left rounded-2xl border border-white/[0.08] bg-[#0a0f1e]/70 overflow-hidden hover:border-white/[0.14] transition-all duration-200 group"
    >
      {/* Cover */}
      {post.cover_url ? (
        <div className="aspect-video w-full overflow-hidden bg-[#0d1226]">
          <img
            src={post.cover_url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="aspect-video w-full bg-gradient-to-br from-blue-900/30 to-purple-900/30 flex items-center justify-center">
          <BookOpen size={32} className="text-slate-700" />
        </div>
      )}

      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          {post.category && <CategoryBadge category={post.category} />}
          <span className="text-xs text-slate-600 flex items-center gap-1 ml-auto">
            <Calendar size={10} />
            {formatDate(post.published_at)}
          </span>
        </div>

        <h3 className="text-sm font-extrabold text-white mb-2 leading-snug group-hover:text-blue-300 transition-colors"
          style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-4">{post.excerpt}</p>
        )}

        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <User size={11} />
          <span>{post.author_name || 'CollabFind Team'}</span>
        </div>
      </div>
    </motion.button>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function PostModal({ post, onClose }) {
  // Close on backdrop click or Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!post) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ type: 'spring', damping: 24, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border border-white/[0.1] bg-[#0a0f1e] shadow-2xl"
        >
          {/* Cover */}
          {post.cover_url && (
            <div className="aspect-video w-full overflow-hidden rounded-t-3xl">
              <img src={post.cover_url} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="p-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                {post.category && (
                  <div className="mb-3">
                    <CategoryBadge category={post.category} />
                  </div>
                )}
                <h2 className="text-2xl font-extrabold text-white leading-snug"
                  style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                  {post.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 w-9 h-9 rounded-xl border border-white/[0.1] bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4 text-xs text-slate-500 pb-6 mb-6 border-b border-white/[0.07]">
              <span className="flex items-center gap-1.5">
                <User size={11} />
                {post.author_name || 'CollabFind Team'}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={11} />
                {formatDate(post.published_at)}
              </span>
              {post.slug && (
                <span className="flex items-center gap-1.5">
                  <Tag size={11} />
                  {post.slug}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">
              {post.content || post.excerpt || 'Konten belum tersedia.'}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ category }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-white/[0.07] flex items-center justify-center mb-4">
        <BookOpen size={28} className="text-slate-600" />
      </div>
      <p className="text-sm font-semibold text-slate-400 mb-1">
        {category === 'All' ? 'Belum ada artikel' : `Tidak ada artikel di kategori "${category}"`}
      </p>
      <p className="text-xs text-slate-600">Artikel baru akan segera hadir.</p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedPost, setSelectedPost] = useState(null);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('blog_posts')
        .select('id, title, excerpt, content, author_name, category, cover_url, published_at, slug')
        .order('published_at', { ascending: false });

      if (activeCategory !== 'All') {
        query = query.eq('category', activeCategory);
      }

      const { data, error: sbErr } = await query;
      if (sbErr) throw sbErr;
      setPosts(data || []);
    } catch (err) {
      console.error('Failed to fetch blog posts:', err);
      setError('Gagal memuat artikel. Coba lagi nanti.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="min-h-screen bg-[#050816]" style={{ fontFamily: "'Manrope',sans-serif" }}>
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">

        {/* ── Hero ── */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-medium mb-6">
            <Zap size={11} /> Blog
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight"
            style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
            Insights &{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Stories
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Tips, cerita, dan update dari tim CollabFind dan komunitas builder Indonesia.
          </p>
        </motion.div>

        {/* ── Category filter ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="flex flex-wrap gap-2 justify-center mb-10"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                activeCategory === cat
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                  : 'bg-white/[0.03] border-white/[0.08] text-slate-500 hover:text-slate-300 hover:border-white/[0.15]'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* ── Post grid ── */}
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-2 text-slate-500">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Memuat artikel...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-sm text-red-400 mb-3">{error}</p>
            <button
              onClick={fetchPosts}
              className="text-xs px-4 py-2 rounded-lg border border-white/[0.1] text-slate-400 hover:text-white transition-all"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {posts.length === 0 ? (
              <EmptyState category={activeCategory} />
            ) : (
              posts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <PostCard post={post} onClick={setSelectedPost} />
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </main>

      {/* ── Modal ── */}
      {selectedPost && (
        <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}

      <Footer />
    </div>
  );
}
