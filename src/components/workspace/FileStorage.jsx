import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Download, Trash2, File, FileImage, FileText,
  FileCode, FileArchive, AlertCircle, FolderOpen, Folder, X, Loader2, Eye, Lock,
} from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import { logActivity } from '../../utils/activityLogger';
import { useLanguage } from '../../i18n/LanguageContext';

// ── Konfigurasi ──────────────────────────────────────────────
const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

const ALLOWED_EXTENSIONS = new Set([
  'jpg','jpeg','png','gif','svg',
  'pdf','doc','docx','xls','xlsx','ppt','pptx',
  'zip','rar','fig',
  'js','ts','py','html','css',
]);

const IMG_EXTS  = new Set(['jpg','jpeg','png','gif','svg']);
const CODE_EXTS = new Set(['js','ts','py','html','css']);
const PDF_EXTS  = new Set(['pdf']);
const DOC_EXTS  = new Set(['doc','docx','xls','xlsx','ppt','pptx']);
const ARC_EXTS  = new Set(['zip','rar']);
const DESIGN_EXTS = new Set(['fig','svg']);

const FOLDERS = [
  { id: 'all',      labelKey: 'fs.allFiles',  icon: FolderOpen, exts: null,        color: '#3B82F6' },
  { id: 'images',   labelKey: 'fs.images',    icon: FileImage,  exts: IMG_EXTS,    color: '#8B5CF6' },
  { id: 'docs',     labelKey: 'fs.documents',      icon: FileText,   exts: DOC_EXTS,    color: '#10B981' },
  { id: 'pdf',      labelKey: 'fs.pdf',       icon: FileText,   exts: PDF_EXTS,    color: '#EF4444' },
  { id: 'code',     labelKey: 'fs.code',      icon: FileCode,   exts: CODE_EXTS,   color: '#3B82F6' },
  { id: 'archives', labelKey: 'fs.archives',  icon: FileArchive, exts: ARC_EXTS,   color: '#F59E0B' },
  { id: 'design',   labelKey: 'fs.design',    icon: File,       exts: DESIGN_EXTS, color: '#EC4899' },
];

function isPreviewable(ext) {
  return IMG_EXTS.has(ext) || PDF_EXTS.has(ext) || CODE_EXTS.has(ext);
}

function getExt(name) {
  return name.split('.').pop().toLowerCase();
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function FileIcon({ ext }) {
  const arcExts  = new Set(['zip','rar']);
  const docExts  = new Set(['doc','docx','xls','xlsx','ppt','pptx']);

  let Icon = File;
  let color = '#94A3B8';

  if (IMG_EXTS.has(ext))   { Icon = FileImage;   color = '#8B5CF6'; }
  else if (CODE_EXTS.has(ext))  { Icon = FileCode;    color = '#3B82F6'; }
  else if (arcExts.has(ext))    { Icon = FileArchive;  color = '#F59E0B'; }
  else if (docExts.has(ext))    { Icon = FileText;     color = '#10B981'; }
  else if (PDF_EXTS.has(ext))   { Icon = FileText;     color = '#EF4444'; }

  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: `${color}18`, border: `1px solid ${color}33` }}>
      <Icon size={18} style={{ color }} />
    </div>
  );
}

// ── Preview Modal ────────────────────────────────────────────
function PreviewModal({ file, url, onClose, onDownload }) {
  const ext = getExt(file.file_name);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-20 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl border border-white/[0.1] bg-[#0a0f1e] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.07] flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <FileIcon ext={ext} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{file.file_name}</p>
              <p className="text-xs text-slate-500">{formatBytes(file.file_size)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onDownload(file)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-400 border border-blue-500/20 hover:bg-blue-500/10 transition-all"
            >
              <Download size={12} /> Download
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-4 min-h-0">
          {IMG_EXTS.has(ext) && (
            <img
              src={url}
              alt={file.file_name}
              className="max-w-full max-h-full object-contain rounded-xl"
            />
          )}
          {PDF_EXTS.has(ext) && (
            <iframe
              src={url}
              title={file.file_name}
              className="w-full h-full min-h-[60vh] rounded-xl border border-white/[0.06]"
            />
          )}
          {CODE_EXTS.has(ext) && (
            <CodePreview url={url} fileName={file.file_name} />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Code Preview ─────────────────────────────────────────────
function CodePreview({ url, fileName }) {
  const [code, setCode]       = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    fetch(url)
      .then((r) => r.text())
      .then((text) => { setCode(text); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [url]);

  if (loading) return <Loader2 size={24} className="text-blue-400 animate-spin" />;
  if (error)   return <p className="text-sm text-red-400">Gagal memuat konten file.</p>;

  return (
    <pre className="w-full h-full min-h-[50vh] overflow-auto text-xs text-slate-300 bg-[#050816] rounded-xl p-5 border border-white/[0.06] leading-relaxed font-mono whitespace-pre-wrap break-words">
      {code}
    </pre>
  );
}

// ── Komponen Utama ───────────────────────────────────────────
export default function FileStorage({ projectId, session, addToast, readOnly = false }) {
  const { t } = useLanguage();
  const [files, setFiles]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [previewFile, setPreviewFile]     = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(null);
  const [dragOver, setDragOver]   = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const fileInputRef = useRef(null);

  // ── Fetch list file ──────────────────────────────────────
  const fetchFiles = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('workspace_files')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      addToast(t('fs.loadFail'), 'error');
    } else {
      setFiles(data || []);
    }
    setLoading(false);
  }, [projectId, addToast]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  // ── Real-time subscription ───────────────────────────────
  useEffect(() => {
    if (!projectId) return;

    const subscription = supabase
      .channel(`workspace_files:project_id=eq.${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workspace_files',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          fetchFiles();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [projectId]);

  // ── Validasi file ────────────────────────────────────────
  function validateFile(file) {
    const ext = getExt(file.name);
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return t('fs.unsupportedType');
    }
    if (file.size > MAX_SIZE_BYTES) {
      return t('fs.maxSizeError');
    }
    return null;
  }

  // ── Upload ───────────────────────────────────────────────
  async function handleUpload(file) {
    const validationError = validateFile(file);
    if (validationError) {
      addToast(validationError, 'error');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // Simulasi progress awal
    const progressInterval = setInterval(() => {
      setUploadProgress((p) => Math.min(p + 10, 85));
    }, 150);

    const timestamp   = Date.now();
    const storagePath = `${projectId}/${timestamp}_${file.name}`;

    const { error: storageError } = await supabase.storage
      .from('workspace-files')
      .upload(storagePath, file, { upsert: false });

    clearInterval(progressInterval);

    if (storageError) {
      setUploading(false);
      setUploadProgress(0);
      addToast(t('fs.uploadFail'), 'error');
      return;
    }

    setUploadProgress(95);

    const { error: dbError } = await supabase.from('workspace_files').insert({
      project_id:   projectId,
      uploader_id:  session.user.id,
      file_name:    file.name,
      file_size:    file.size,
      file_type:    getExt(file.name),
      storage_path: storagePath,
    });

    setUploadProgress(100);
    setUploading(false);

    if (dbError) {
      // Rollback storage object
      await supabase.storage.from('workspace-files').remove([storagePath]);
      addToast(t('fs.metaFail'), 'error');
    } else {
      addToast(t('fs.uploadSuccess'), 'success');
      fetchFiles();
      logActivity({
        projectId,
        userId: session.user.id,
        action: 'file_uploaded',
        entityType: 'file',
        entityTitle: file.name,
      });
    }

    setTimeout(() => setUploadProgress(0), 600);
  }

  function onFileInputChange(e) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = '';
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  }

  // ── Preview ──────────────────────────────────────────────
  async function handlePreview(file) {
    setLoadingPreview(file.id);
    const { data, error } = await supabase.storage
      .from('workspace-files')
      .createSignedUrl(file.storage_path, 3600);

    setLoadingPreview(null);

    if (error || !data?.signedUrl) {
      addToast(t('fs.previewFail'), 'error');
      return;
    }
    setPreviewFile({ file, url: data.signedUrl });
  }

  // ── Download ─────────────────────────────────────────────
  async function handleDownload(file) {
    const { data, error } = await supabase.storage
      .from('workspace-files')
      .createSignedUrl(file.storage_path, 3600);

    if (error || !data?.signedUrl) {
      addToast(t('fs.downloadLinkFail'), 'error');
      return;
    }

    try {
      const response = await fetch(data.signedUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      addToast(t('fs.downloadFail'), 'error');
    }
  }

  // ── Hapus ─────────────────────────────────────────────────
  async function handleDeleteConfirmed() {
    const file = confirmDelete;
    setConfirmDelete(null);
    setDeletingId(file.id);

    const [storageResult, dbResult] = await Promise.all([
      supabase.storage.from('workspace-files').remove([file.storage_path]),
      supabase.from('workspace_files').delete().eq('id', file.id),
    ]);

    setDeletingId(null);

    if (storageResult.error || dbResult.error) {
      addToast(t('fs.deleteFail'), 'error');
      fetchFiles();
    } else {
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      addToast(t('fs.deleteSuccess'), 'success');
    }
  }

  // ── Filter files by folder ─────────────────────────────────
  const activeFolder = FOLDERS.find(f => f.id === selectedFolder);
  const filteredFiles = selectedFolder === 'all'
    ? files
    : files.filter(f => activeFolder?.exts?.has(getExt(f.file_name)));

  // Count files per folder
  const folderCounts = {};
  FOLDERS.forEach(f => {
    if (f.id === 'all') {
      folderCounts[f.id] = files.length;
    } else {
      folderCounts[f.id] = files.filter(file => f.exts?.has(getExt(file.file_name))).length;
    }
  });

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="flex gap-4 min-h-[400px]">
      {/* Folder sidebar */}
      <div className="w-48 flex-shrink-0 rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 p-3 flex flex-col gap-1 self-start">
        <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2 px-2 font-semibold">Folder</p>
        {FOLDERS.map((folder) => {
          const Icon = folder.icon;
          const isActive = selectedFolder === folder.id;
          return (
            <button
              key={folder.id}
              onClick={() => setSelectedFolder(folder.id)}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs transition-all ${
                isActive
                  ? 'bg-white/[0.08] text-white font-medium border border-white/[0.1]'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <Icon size={13} style={{ color: isActive ? folder.color : undefined }} />
              <span className="truncate flex-1 text-left">{t(folder.labelKey)}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                isActive ? 'bg-white/[0.08] text-slate-300' : 'text-slate-700'
              }`}>
                {folderCounts[folder.id] || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col gap-5 min-w-0">

        {/* Upload area */}
        {readOnly ? (
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl border border-amber-500/20 bg-amber-500/8 text-amber-300">
            <Lock size={15} className="flex-shrink-0" />
            <p className="text-sm">{t('fs.uploadDisabled')}</p>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
              dragOver
                ? 'border-blue-400/60 bg-blue-500/10'
                : 'border-white/[0.1] bg-white/[0.02] hover:border-white/[0.2] hover:bg-white/[0.04]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={onFileInputChange}
              accept={[...ALLOWED_EXTENSIONS].map((e) => `.${e}`).join(',')}
            />

            {uploading ? (
              <>
                <Loader2 size={28} className="text-blue-400 animate-spin" />
                <p className="text-sm text-slate-400">{t('fs.uploading')}</p>
                <div className="w-48 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xs text-slate-500">{uploadProgress}%</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Upload size={20} className="text-blue-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-white">{t('fs.clickOrDrag')}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {t('fs.maxSize')}
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* File list */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-white/[0.03] animate-pulse border border-white/[0.05]" />
            ))}
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <FolderOpen size={36} className="text-slate-600" />
            <p className="text-sm text-slate-500">
              {selectedFolder === 'all'
                ? `${t('fs.noFiles')}${!readOnly ? ` ${t('fs.uploadFirst')}` : ''}`
                : `${t('fs.noFilesInFolder')} "${t(activeFolder?.labelKey)}"`
              }
            </p>
            {selectedFolder === 'all' && !readOnly && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-all"
              >
                <Upload size={14} /> Upload File
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredFiles.map((file) => (
              <motion.div
                key={file.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-4 p-4 rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 hover:border-white/[0.12] transition-all"
              >
                <FileIcon ext={file.file_type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{file.file_name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatBytes(file.file_size)} · {new Date(file.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {isPreviewable(getExt(file.file_name)) && (
                    <button
                      onClick={() => handlePreview(file)}
                      disabled={loadingPreview === file.id}
                      title="Preview file"
                      className="p-2 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all disabled:opacity-40"
                    >
                      {loadingPreview === file.id
                        ? <Loader2 size={15} className="animate-spin" />
                        : <Eye size={15} />
                      }
                    </button>
                  )}
                  <button
                    onClick={() => handleDownload(file)}
                    title="Unduh file"
                    className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                  >
                    <Download size={15} />
                  </button>
                  {!readOnly && (
                    <button
                      onClick={() => setConfirmDelete(file)}
                      disabled={deletingId === file.id}
                      title="Hapus file"
                      className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {deletingId === file.id
                        ? <Loader2 size={15} className="animate-spin" />
                        : <Trash2 size={15} />
                      }
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Preview modal */}
      <AnimatePresence>
        {previewFile && (
          <PreviewModal
            file={previewFile.file}
            url={previewFile.url}
            onClose={() => setPreviewFile(null)}
            onDownload={handleDownload}
          />
        )}
      </AnimatePresence>

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
                    {t('fs.deleteFile')}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {t('fs.deleteFileDesc')} <span className="text-white font-medium">"{confirmDelete.file_name}"</span> {t('fs.deleteWarn')}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 border border-white/[0.08] hover:bg-white/[0.05] transition-all"
                >
                  {t('fs.cancel')}
                </button>
                <button
                  onClick={handleDeleteConfirmed}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 transition-all"
                >
                  {t('fs.deleteBtn')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
