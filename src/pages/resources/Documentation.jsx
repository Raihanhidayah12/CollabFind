import { useLanguage } from '../../i18n/LanguageContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, ChevronRight, Zap, User, FolderKanban,
  Users, Layers, ChevronDown,
} from 'lucide-react';
import PageNavbar from '../../components/PageNavbar';
import Footer from '../../components/landing/Footer';

// ─── Article data ───────────────────────────────────────────────────────────

const articles = {
  'membuat-akun': {
    title: 'Membuat Akun & Setup Profil',
    category: 'Getting Started',
    description: 'Panduan lengkap untuk membuat akun dan mengatur profil CollabFind kamu.',
    content: `
## Membuat Akun CollabFind

Untuk mulai menggunakan CollabFind, kamu perlu membuat akun terlebih dahulu. Berikut langkah-langkahnya:

### 1. Daftar via Email
Buka halaman **/register** dan isi form pendaftaran dengan nama lengkap, email, dan password. Setelah submit, cek email kamu untuk verifikasi.

### 2. Setup Profil
Setelah login, pergi ke **Dashboard → Edit Profil** dan isi:
- **Bio** — ceritakan sedikit tentang dirimu
- **Skills** — tambahkan teknologi/keahlian yang kamu kuasai
- **GitHub / Portfolio** — link profil luar agar calon kolaborator bisa melihat karyamu

### 3. Avatar
Upload foto profil yang jelas agar tim lebih mudah mengenalmu.

### Tips
- Profil yang lengkap mendapat **2–3× lebih banyak undangan** kolaborasi
- Tambahkan minimal **3 skill** supaya sistem smart-match bisa bekerja optimal
    `,
  },
  'membuat-projek': {
    title: 'Cara Membuat Projek Pertamamu',
    category: 'Getting Started',
    description: 'Buat projek pertamamu dan mulai cari kolaborator yang tepat.',
    content: `
## Membuat Projek Pertama

### Langkah 1 — Klik "Create Project"
Di navbar atau Dashboard, klik tombol **+ Create Project**.

### Langkah 2 — Isi Detail Projek
- **Judul** — nama projek yang singkat dan deskriptif
- **Deskripsi** — jelaskan apa yang kamu bangun dan apa tujuannya
- **Tech Stack** — pilih teknologi yang digunakan
- **Role yang Dibutuhkan** — misalnya Frontend Dev, UI Designer, ML Engineer

### Langkah 3 — Publish
Klik **Publish** dan projekmu akan langsung muncul di halaman Explore.

### Langkah 4 — Workspace Otomatis
Setiap projek otomatis mendapat Workspace dengan:
- Kanban Board
- File Storage (50MB)
- Wiki / Dokumentasi Tim
    `,
  },
  'menemukan-kolaborator': {
    title: 'Menemukan Kolaborator yang Tepat',
    category: 'Getting Started',
    description: 'Gunakan fitur Explore dan Smart Match untuk menemukan rekan tim ideal.',
    content: `
## Menemukan Kolaborator

### Halaman Explore
Halaman **/explore** menampilkan semua projek aktif. Gunakan filter berdasarkan:
- **Tech Stack** — cari projek yang menggunakan teknologi favoritmu
- **Kategori** — Web, Mobile, AI/ML, Game, dsb.
- **Status** — Open (masih menerima anggota) atau Closed

### Smart Match
Sistem CollabFind secara otomatis menyarankan projek berdasarkan skill di profilmu.

### Cara Melamar
1. Buka halaman detail projek
2. Klik **Apply to Join**
3. Tulis pesan singkat (opsional)
4. Tunggu konfirmasi dari owner projek

### Tips
- Lamar projek yang skill-nya benar-benar cocok — acceptance rate lebih tinggi
- Cek aktivitas terakhir projek sebelum melamar
    `,
  },
  'kanban-board': {
    title: 'Mengelola Kanban Board',
    category: 'Workspace',
    description: 'Atur tugas tim dengan Kanban Board bawaan CollabFind.',
    content: `
## Kanban Board

Setiap workspace CollabFind dilengkapi Kanban Board untuk manajemen tugas tim.

### Kolom Default
- **Backlog** — tugas yang belum dikerjakan
- **In Progress** — sedang dikerjakan
- **Done** — selesai

### Cara Menambah Task
1. Klik **+ Add Task** di kolom mana saja
2. Isi judul task dan deskripsi opsional
3. Assign ke anggota tim

### Memindahkan Task
Drag-and-drop kartu dari satu kolom ke kolom lain untuk mengupdate statusnya.

### Tips Produktif
- Batasi task "In Progress" per orang — max 2–3 task agar fokus
- Gunakan deskripsi task yang jelas agar semua anggota tahu konteksnya
    `,
  },
  'file-storage': {
    title: 'Menggunakan File Storage',
    category: 'Workspace',
    description: 'Upload dan kelola file tim dengan File Storage 50MB.',
    content: `
## File Storage

Setiap workspace mendapat **50MB** file storage gratis.

### Mengupload File
1. Buka tab **Files** di workspace
2. Klik **Upload File** atau drag-and-drop file
3. File langsung tersedia untuk semua anggota tim

### Format yang Didukung
- Gambar (PNG, JPG, WebP, SVG)
- Dokumen (PDF, DOCX, XLSX)
- Kode (ZIP, JSON, CSV)

### Berbagi File
Setiap file punya link yang bisa di-share ke anggota tim. Link berlaku selama projek aktif.

### Batas Storage
Jika storage habis, hapus file lama atau hubungi support untuk upgrade.
    `,
  },
  'wiki': {
    title: 'Menulis & Mengedit Wiki',
    category: 'Workspace',
    description: 'Dokumentasikan projek tim dengan Wiki bawaan CollabFind.',
    content: `
## Wiki Projek

Wiki adalah tempat dokumentasi internal tim — arsitektur, panduan setup, keputusan desain, dan lainnya.

### Membuat Halaman Baru
1. Buka tab **Wiki** di workspace
2. Klik **New Page**
3. Tulis dengan editor Markdown

### Markdown yang Didukung
- Heading (# H1, ## H2)
- Bold, italic, inline code
- Daftar berurutan dan tidak berurutan
- Blok kode dengan syntax highlighting

### Kolaborasi
Semua anggota tim bisa mengedit wiki. Tidak ada version history saat ini — pastikan koordinasi dengan tim sebelum mengedit halaman penting.
    `,
  },
  'aturan-komunitas': {
    title: 'Aturan Komunitas CollabFind',
    category: 'Community',
    description: 'Baca dan pahami aturan komunitas agar ekosistem tetap sehat.',
    content: `
## Aturan Komunitas

CollabFind adalah ruang aman untuk berkolaborasi. Berikut aturan yang wajib dipatuhi:

### ✓ Yang Boleh
- Promosi projek kamu di halaman Explore
- Memberi feedback konstruktif ke sesama builder
- Bertanya dan berbagi ilmu di Forum

### ✗ Yang Tidak Boleh
- Spam undangan ke banyak user sekaligus
- Konten yang mengandung ujaran kebencian atau SARA
- Mengklaim karya orang lain sebagai milikmu
- Projek fiktif yang hanya dibuat untuk menambah kolaborator palsu

### Pelanggaran
Pelanggaran ringan mendapat peringatan. Pelanggaran berat atau berulang dapat mengakibatkan suspend akun.

### Laporan
Gunakan tombol **Report** di profil/projek atau email support@collabfind.dev.
    `,
  },
  'tips-kolaborasi': {
    title: 'Tips Menjaga Kolaborasi Tim Tetap Sehat',
    category: 'Community',
    description: 'Praktik terbaik untuk kolaborasi tim yang produktif dan menyenangkan.',
    content: `
## Tips Kolaborasi Sehat

### Komunikasi Rutin
- Adakan check-in singkat seminggu sekali (15 menit cukup)
- Update status task di Kanban Board secara konsisten
- Beri tahu tim jika kamu sedang busy atau tidak bisa contribute sementara

### Dokumentasi
- Tulis keputusan penting di Wiki agar tidak hilang dari ingatan
- Simpan aset desain di File Storage, bukan hanya di chat

### Conflict Resolution
- Sampaikan ketidaksetujuan dengan data dan argumen, bukan emosi
- Jika ada konflik serius, libatkan owner projek sebagai mediator
- CollabFind tidak menyediakan fitur arbitrase — selesaikan secara langsung

### Keluar dari Tim
Jika ingin meninggalkan tim, informasikan minimal **3 hari sebelumnya** dan serahkan task yang belum selesai ke anggota lain.
    `,
  },
  'profil-projek': {
    title: 'Cara Membuat Profil Projek yang Menarik',
    category: 'Projects',
    description: 'Optimalkan halaman projek agar lebih banyak kolaborator yang tertarik.',
    content: `
## Profil Projek yang Menarik

### Judul yang Jelas
Hindari judul generik seperti "Projek Web Saya". Gunakan nama spesifik:
✓ "EduTrack — Platform LMS untuk SMK"
✗ "Aplikasi Pendidikan"

### Deskripsi yang Kuat
Jawab 3 pertanyaan ini dalam deskripsi:
1. **Apa** yang kamu bangun?
2. **Untuk siapa** produk ini?
3. **Kenapa** ini penting?

### Tech Stack yang Akurat
Cantumkan semua teknologi yang benar-benar digunakan. Ini membantu smart-match menemukan kolaborator yang tepat.

### Role yang Dibutuhkan
Spesifik soal skill yang dicari:
✓ "React Developer, familiar dengan Tailwind CSS"
✗ "Frontend Developer"

### Cover Image (opsional)
Upload screenshot atau mockup untuk membuat projek lebih menarik secara visual.
    `,
  },
  'mengelola-aplikasi': {
    title: 'Mengelola Aplikasi Masuk',
    category: 'Projects',
    description: 'Cara mereview dan merespons lamaran kolaborator untuk projekmu.',
    content: `
## Mengelola Aplikasi Masuk

### Melihat Aplikasi
Di halaman detail projek, buka tab **Applicants** untuk melihat semua lamaran.

### Review Profil
Klik nama pelamar untuk melihat:
- Skill dan pengalaman
- Projek sebelumnya
- Link GitHub / portfolio

### Menerima atau Menolak
- **Accept** — pelamar otomatis jadi anggota tim dan dapat akses workspace
- **Decline** — pelamar mendapat notifikasi bahwa posisi sudah terisi atau tidak cocok

### Tips
- Respons dalam **48 jam** — pelamar yang menunggu lama biasanya kehilangan antusias
- Jika belum yakin, tanya satu pertanyaan teknis singkat sebelum accept
- Tutup projek (ubah status ke "Closed") jika semua posisi sudah terisi
    `,
  },
};

// ─── Category config ─────────────────────────────────────────────────────────

const categories = [
  {
    id: 'getting-started',
    label: 'Getting Started',
    icon: Zap,
    color: '#3B82F6',
    articles: ['membuat-akun', 'membuat-projek', 'menemukan-kolaborator'],
  },
  {
    id: 'workspace',
    label: 'Workspace',
    icon: FolderKanban,
    color: '#8B5CF6',
    articles: ['kanban-board', 'file-storage', 'wiki'],
  },
  {
    id: 'community',
    label: 'Community',
    icon: Users,
    color: '#10B981',
    articles: ['aturan-komunitas', 'tips-kolaborasi'],
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: Layers,
    color: '#F59E0B',
    articles: ['profil-projek', 'mengelola-aplikasi'],
  },
];

// ─── Simple markdown renderer ─────────────────────────────────────────────────

function renderMarkdown(text) {
  const lines = text.trim().split('\n');
  const elements = [];
  let key = 0;

  for (const line of lines) {
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={key++} className="text-base font-bold text-white mt-6 mb-2">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="text-xl font-extrabold text-white mt-8 mb-3" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <li key={key++} className="text-sm text-slate-400 leading-relaxed ml-4 list-disc">
          {line.slice(2)}
        </li>
      );
    } else if (/^\d+\. /.test(line)) {
      elements.push(
        <li key={key++} className="text-sm text-slate-400 leading-relaxed ml-4 list-decimal">
          {line.replace(/^\d+\. /, '')}
        </li>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={key++} className="h-1" />);
    } else {
      // inline formatting: **bold**, *italic*, `code`
      const formatted = line
        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em class="text-slate-300">$1</em>')
        .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 rounded bg-white/[0.08] text-blue-300 text-xs font-mono">$1</code>');
      elements.push(
        <p key={key++} className="text-sm text-slate-400 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatted }} />
      );
    }
  }
  return elements;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Documentation() { 
  const { t } = useLanguage();
  const [selectedId, setSelectedId] = useState('membuat-akun');
  const [openCategories, setOpenCategories] = useState({ 'getting-started': true, workspace: false, community: false, projects: false });

  const toggleCategory = (id) =>
    setOpenCategories((prev) => ({ ...prev, [id]: !prev[id] }));

  const article = articles[selectedId];

  return (
    <div className="bg-[#050816]" style={{ fontFamily: "'Manrope',sans-serif" }}>
      <PageNavbar breadcrumbs={[{ label: 'Documentation', href: null }]} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-medium mb-4">
            <BookOpen size={11} /> Documentation
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
            Panduan CollabFind
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Step-by-step guides untuk memaksimalkan CollabFind.</p>
        </motion.div>

        <div className="flex gap-6 items-start">
          {/* ── Sidebar ── */}
          <motion.aside
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            className="w-64 flex-shrink-0 sticky top-24"
          >
            <div className="rounded-2xl border border-white/[0.08] bg-[#0a0f1e]/80 overflow-hidden">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isOpen = openCategories[cat.id];
                return (
                  <div key={cat.id} className="border-b border-white/[0.06] last:border-0">
                    <button
                      onClick={() => toggleCategory(cat.id)}
                      className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{ background: `${cat.color}18`, border: `1px solid ${cat.color}30` }}>
                        <Icon size={12} style={{ color: cat.color }} />
                      </div>
                      <span className="text-xs font-bold text-slate-300 flex-1 text-left">{cat.label}</span>
                      <ChevronDown size={12} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className="overflow-hidden"
                        >
                          {cat.articles.map((id) => (
                            <button
                              key={id}
                              onClick={() => setSelectedId(id)}
                              className={`w-full text-left px-4 py-2.5 pl-12 text-xs transition-all border-l-2 flex items-center gap-2 ${
                                selectedId === id
                                  ? 'text-white border-l-blue-500 bg-blue-500/10'
                                  : 'text-slate-500 border-l-transparent hover:text-slate-300 hover:bg-white/[0.02]'
                              }`}
                            >
                              <ChevronRight size={10} className="flex-shrink-0" />
                              {articles[id]?.title}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.aside>

          {/* ── Article content ── */}
          <AnimatePresence mode="wait">
            <motion.article
              key={selectedId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex-1 min-w-0 rounded-2xl border border-white/[0.08] bg-[#0a0f1e]/60 p-8"
            >
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-6">
                <BookOpen size={11} />
                <span>Docs</span>
                <ChevronRight size={10} />
                <span className="text-slate-500">{article?.category}</span>
                <ChevronRight size={10} />
                <span className="text-slate-400">{article?.title}</span>
              </div>

              {/* Badge */}
              {(() => {
                const cat = categories.find((c) => c.label === article?.category);
                if (!cat) return null;
                return (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-4"
                    style={{ background: `${cat.color}18`, color: cat.color, border: `1px solid ${cat.color}33` }}>
                    <cat.icon size={10} />
                    {cat.label}
                  </div>
                );
              })()}

              <h1 className="text-2xl font-extrabold text-white mb-2" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                {article?.title}
              </h1>
              <p className="text-sm text-slate-500 mb-8 pb-8 border-b border-white/[0.06]">{article?.description}</p>

              <div className="space-y-0.5">
                {article && renderMarkdown(article.content)}
              </div>

              {/* Navigation */}
              <div className="mt-12 pt-6 border-t border-white/[0.06]">
                <p className="text-xs text-slate-600 mb-3">Artikel lainnya</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(articles)
                    .filter(([id]) => id !== selectedId)
                    .slice(0, 4)
                    .map(([id, art]) => (
                      <button
                        key={id}
                        onClick={() => setSelectedId(id)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/[0.2] transition-all"
                      >
                        {art.title}
                      </button>
                    ))}
                </div>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
