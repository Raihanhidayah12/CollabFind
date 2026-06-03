import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Edit3, Save, X, BookOpen,
  AlertCircle, Loader2, FileText, ChevronRight, Lock,
} from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';

// ── Toolbar actions untuk rich-text sederhana ────────────────
const TOOLBAR_ACTIONS = [
  { label: 'H1',  action: (t, s, e) => wrapLine(t, s, e, '# ') },
  { label: 'H2',  action: (t, s, e) => wrapLine(t, s, e, '## ') },
  { label: 'H3',  action: (t, s, e) => wrapLine(t, s, e, '### ') },
  { label: 'B',   action: (t, s, e) => wrapSel(t, s, e, '**') },
  { label: 'I',   action: (t, s, e) => wrapSel(t, s, e, '_') },
  { label: 'Code',action: (t, s, e) => wrapSel(t, s, e, '`') },
  { label: '```', action: (t, s, e) => wrapBlock(t, s, e) },
  { label: '• List', action: (t, s, e) => wrapLine(t, s, e, '- ') },
  { label: '1. List', action: (t, s, e) => wrapLine(t, s, e, '1. ') },
];

function wrapSel(text, selStart, selEnd, mark) {
  const sel = text.slice(selStart, selEnd);
  return text.slice(0, selStart) + mark + sel + mark + text.slice(selEnd);
}

function wrapLine(text, selStart, _selEnd, prefix) {
  const lineStart = text.lastIndexOf('\n', selStart - 1) + 1;
  return text.slice(0, lineStart) + prefix + text.slice(lineStart);
}

function wrapBlock(text, selStart, selEnd) {
  const sel = text.slice(selStart, selEnd);
  return text.slice(0, selStart) + '```\n' + sel + '\n```' + text.slice(selEnd);
}

// ── Renderer Markdown sederhana ──────────────────────────────
function renderMarkdown(text) {
  if (!text) return '';
  let html = text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    // code block
    .replace(/```([\s\S]*?)```/g, '<pre class="wiki-code-block"><code>$1</code></pre>')
    // inline code
    .replace(/`([^`]+)`/g, '<code class="wiki-inline-code">$1</code>')
    // bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // italic
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // headings
    .replace(/^### (.+)$/gm, '<h3 class="wiki-h3">$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2 class="wiki-h2">$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1 class="wiki-h1">$1</h1>')
    // list items
    .replace(/^\d+\. (.+)$/gm, '<li class="wiki-li">$1</li>')
    .replace(/^- (.+)$/gm,     '<li class="wiki-li-ul">$1</li>')
    // line breaks
    .replace(/\n/g, '<br/>');
  return html;
}

// ── Komponen Utama ───────────────────────────────────────────
export default function Wiki({ projectId, session, addToast, readOnly = false }) {
  const [pages, setPages]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activePage, setActivePage] = useState(null);
  const [isEditing, setIsEditing]   = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editTitle, setEditTitle]   = useState('');
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving]           = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [titleError, setTitleError]   = useState('');
  const textareaRef = useState(null);

  // ── Fetch pages ──────────────────────────────────────────
  const fetchPages = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('workspace_wiki_pages')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      addToast('Gagal memuat Wiki.', 'error');
    } else {
      setPages(data || []);
    }
    setLoading(false);
  }, [projectId, addToast]);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  // ── Buat halaman baru ────────────────────────────────────
  function startCreate() {
    setActivePage(null);
    setIsEditing(false);
    setIsCreating(true);
    setEditTitle('');
    setEditContent('');
    setTitleError('');
  }

  // ── Edit halaman yang ada ────────────────────────────────
  function startEdit(page) {
    setActivePage(page);
    setIsCreating(false);
    setIsEditing(true);
    setEditTitle(page.title);
    setEditContent(page.content);
    setTitleError('');
  }

  // ── Simpan (create atau update) ──────────────────────────
  async function handleSave() {
    if (!editTitle.trim()) {
      setTitleError('Judul halaman tidak boleh kosong.');
      return;
    }
    setTitleError('');
    setSaving(true);

    if (isCreating) {
      const { data, error } = await supabase
        .from('workspace_wiki_pages')
        .insert({
          project_id: projectId,
          title:      editTitle.trim(),
          content:    editContent,
          author_id:  session.user.id,
        })
        .select()
        .single();

      if (error) {
        addToast('Gagal menyimpan halaman.', 'error');
      } else {
        setPages((prev) => [...prev, data]);
        setActivePage(data);
        setIsCreating(false);
        setIsEditing(false);
        addToast('Halaman berhasil dibuat.', 'success');
      }
    } else {
      const { data, error } = await supabase
        .from('workspace_wiki_pages')
        .update({
          title:      editTitle.trim(),
          content:    editContent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', activePage.id)
        .select()
        .single();

      if (error) {
        addToast('Gagal menyimpan perubahan.', 'error');
      } else {
        setPages((prev) => prev.map((p) => p.id === data.id ? data : p));
        setActivePage(data);
        setIsEditing(false);
        addToast('Halaman berhasil disimpan.', 'success');
      }
    }

    setSaving(false);
  }

  // ── Hapus halaman ────────────────────────────────────────
  async function handleDeleteConfirmed() {
    const page = confirmDelete;
    setConfirmDelete(null);

    const { error } = await supabase
      .from('workspace_wiki_pages')
      .delete()
      .eq('id', page.id);

    if (error) {
      addToast('Gagal menghapus halaman. Silakan coba lagi.', 'error');
    } else {
      setPages((prev) => prev.filter((p) => p.id !== page.id));
      if (activePage?.id === page.id) {
        setActivePage(null);
        setIsEditing(false);
        setIsCreating(false);
      }
      addToast('Halaman berhasil dihapus.', 'success');
    }
  }

  // ── Toolbar handler ──────────────────────────────────────
  function applyToolbar(actionFn) {
    const textarea = document.getElementById('wiki-editor-textarea');
    if (!textarea) return;
    const s = textarea.selectionStart;
    const e = textarea.selectionEnd;
    const newContent = actionFn(editContent, s, e);
    setEditContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(s, e);
    }, 0);
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="flex gap-4 h-[600px]">

      {/* Sidebar */}
      <div className="w-56 flex-shrink-0 flex flex-col gap-2">
        {readOnly ? (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-amber-500/20 bg-amber-500/8 text-amber-300 text-xs">
            <Lock size={12} /> View only
          </div>
        ) : (
          <button
            onClick={startCreate}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 hover:from-blue-500/30 hover:to-purple-500/30 transition-all"
          >
            <Plus size={15} /> Buat Halaman Baru
          </button>
        )}

        <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-9 rounded-xl bg-white/[0.04] animate-pulse" />
              ))
            : pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => { setActivePage(page); setIsEditing(false); setIsCreating(false); }}
                  className={`group flex items-center gap-2 w-full px-3 py-2 rounded-xl text-left text-sm transition-all ${
                    activePage?.id === page.id
                      ? 'bg-blue-500/15 border border-blue-500/30 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
                  }`}
                >
                  <FileText size={13} className="flex-shrink-0" />
                  <span className="truncate flex-1">{page.title}</span>
                  {!readOnly && (
                    <button
                      onClick={(ev) => { ev.stopPropagation(); setConfirmDelete(page); }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-600 hover:text-red-400 transition-all"
                      title="Hapus halaman"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </button>
              ))
          }
          {!loading && pages.length === 0 && (
            <p className="text-xs text-slate-600 text-center mt-4 px-2">
              Belum ada halaman. Buat yang pertama!
            </p>
          )}
        </div>
      </div>

      {/* Editor / Viewer area */}
      <div className="flex-1 flex flex-col rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 overflow-hidden">
        {/* State: tidak ada yang dipilih */}
        {!activePage && !isCreating && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
            <BookOpen size={36} className="text-slate-600" />
            <p className="text-sm text-slate-500">
              Pilih halaman di sidebar{!readOnly && ' atau buat halaman baru'}
            </p>
            {!readOnly && (
              <button
                onClick={startCreate}
                className="mt-1 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-all"
              >
                <Plus size={14} /> Buat Halaman
              </button>
            )}
          </div>
        )}

        {/* State: mode view */}
        {activePage && !isEditing && !isCreating && (
          <>
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
              <h2 className="text-base font-bold text-white truncate" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                {activePage.title}
              </h2>
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-600 mr-2">
                  Diperbarui {new Date(activePage.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </span>
                {!readOnly && (
                  <button
                    onClick={() => startEdit(activePage)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-400 border border-blue-500/20 hover:bg-blue-500/10 transition-all"
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                )}
              </div>
            </div>
            <div
              className="flex-1 overflow-y-auto p-5 wiki-content text-sm text-slate-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(activePage.content) }}
            />
          </>
        )}

        {/* State: mode edit / create */}
        {(isEditing || isCreating) && (
          <>
            {/* Header editor */}
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => { setEditTitle(e.target.value); setTitleError(''); }}
                placeholder="Judul halaman..."
                className={`flex-1 bg-transparent text-white font-bold text-base outline-none placeholder-slate-600 mr-4 ${
                  titleError ? 'border-b border-red-500/50' : ''
                }`}
                style={{ fontFamily: "'Space Grotesk',sans-serif" }}
              />
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => { setIsEditing(false); setIsCreating(false); }}
                  className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all"
                  title="Batal"
                >
                  <X size={15} />
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                  Simpan
                </button>
              </div>
            </div>

            {titleError && (
              <div className="px-4 py-1.5 bg-red-500/10 border-b border-red-500/20">
                <p className="text-xs text-red-400 flex items-center gap-1.5">
                  <AlertCircle size={11} /> {titleError}
                </p>
              </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center gap-1 px-3 py-2 border-b border-white/[0.06] flex-wrap">
              {TOOLBAR_ACTIONS.map((tb) => (
                <button
                  key={tb.label}
                  type="button"
                  onClick={() => applyToolbar(tb.action)}
                  className="px-2 py-1 rounded-md text-xs font-mono font-semibold text-slate-400 hover:text-white hover:bg-white/[0.07] transition-all"
                >
                  {tb.label}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              id="wiki-editor-textarea"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Tulis konten di sini... Gunakan Markdown: **bold**, _italic_, `code`, # Heading, - list"
              className="flex-1 bg-transparent text-sm text-slate-300 p-4 outline-none resize-none placeholder-slate-600 font-mono leading-relaxed"
            />
          </>
        )}
      </div>

      {/* Confirm delete modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm p-6 rounded-2xl border border-white/[0.1] bg-[#0a0f1e]"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={18} className="text-red-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                    Hapus Halaman?
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Halaman <span className="text-white font-medium">"{confirmDelete.title}"</span> akan dihapus permanen.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 border border-white/[0.08] hover:bg-white/[0.05] transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteConfirmed}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 transition-all"
                >
                  Hapus
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
