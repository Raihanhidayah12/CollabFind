<div align="center">

<br />

<img src="https://img.shields.io/badge/CollabFind-Platform%20Kolaborasi-0a0f1e?style=for-the-badge&labelColor=0a0f1e" alt="CollabFind" />

<br />

# CollabFind

### Temukan Proyek. Bentuk Tim. Bangun Bersama.

Platform kolaborasi all-in-one yang menghubungkan developer, desainer, dan kreator digital dengan proyek menarik serta tim yang tepat. CollabFind menyediakan workspace terintegrasi penuh — mulai dari manajemen proyek berbasis Kanban, real-time chat, penyimpanan file tim, hingga freelance marketplace — sehingga kolaborasi bisa terjadi dalam satu tempat tanpa berpindah-pindah tools.

<br />

<a href="https://collab-find.vercel.app"><img src="https://img.shields.io/badge/Live%20Demo-collab--find.vercel.app-00D2FF?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" /></a>
<a href="https://github.com/Raihanhidayah12/CollabFind/actions"><img src="https://img.shields.io/github/actions/workflow/status/Raihanhidayah12/CollabFind/ci.yml?style=for-the-badge&label=CI&logo=githubactions&logoColor=white" alt="CI Status" /></a>
<a href="https://github.com/Raihanhidayah12/CollabFind/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" /></a>

<br>

**[Live Demo](https://collab-find.vercel.app)** · **[Report Bug](https://github.com/Raihanhidayah12/CollabFind/issues)** · **[Request Feature](https://github.com/Raihanhidayah12/CollabFind/issues)**

</div>

---

## Daftar Isi

- [Apa itu CollabFind?](#apa-itu-collabfind)
- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Struktur Proyek](#struktur-proyek)
- [Berkontribusi](#berkontribusi)
- [Lisensi](#lisensi)

---

## Apa itu CollabFind?

CollabFind lahir dari masalah sederhana: developer dan kreator sering kesulitan menemukan proyek yang cocok dan kolaborator yang tepat. Platform yang ada biasanya hanya menyediakan satu fungsi — entah itu job board, project management, atau forum — sehingga user harus berpindah-pindah antara banyak tools.

CollabFind menggabungkan semuanya dalam satu platform:

- **Temukan proyek** — Jelajahi proyek dari berbagai kategori atau buat proyek kamu sendiri dan cari kolaborator.
- **Bentuk tim** — Cari talenta berdasarkan skill dan role, undang mereka ke tim, atau gabung ke proyek yang sedang mencari anggota.
- **Bangun bersama** — Workspace terintegrasi dengan Kanban board, real-time chat, file storage, wiki, dan sprint management untuk menjalankan proyek dari ide sampai selesai.
- **Hasilkan karya** — Freelance marketplace menghubungkan freelancer dengan klien, lengkap dengan sistem kontrak dan milestone delivery.

Setiap user mendapatkan profil dan portfolio publik yang bisa digunakan sebagai showcase hasil karya, serta AI assistant (CollabFindBot) yang membantu navigasi dan menjawab pertanyaan seputar platform.

---

## Fitur Utama

### Workspace Kolaboratif

Ruang kerja terintegrasi untuk menjalankan proyek bersama tim:

- **Kanban Board** — Board dengan kolom customizable, drag-and-drop task cards, dan filter berdasarkan assignee, label, atau prioritas.
- **Team Chat** — Real-time messaging menggunakan Supabase Realtime, dengan dukungan file attachment dan notifikasi.
- **File Storage** — Penyimpanan file tim terintegrasi langsung di dalam workspace proyek.
- **Wiki** — Dokumentasi proyek kolaboratif yang bisa diedit bersama anggota tim.
- **Sprint & Task Management** — Perencanaan sprint dengan task assignment, deadline, dan progress tracking.
- **Activity Timeline** — Riwayat aktivitas tim dan perubahan pada proyek secara kronologis.
- **Task Thread Discussion** — Diskusi spesifik di setiap task menggunakan @mention rekan tim.

### Freelance Marketplace

Marketplace terintegrasi untuk menghubungkan freelancer dengan klien:

- Posting pekerjaan dengan detail budget, deadline, dan skill yang dibutuhkan.
- Sistem proposal dari freelancer ke klien.
- Kontrak kerja dengan milestone delivery dan progress tracking.
- Dashboard freelance untuk memantau kontrak aktif dan riwayat pekerjaan.

### Eksplorasi & Pencarian

- **Explore Projects** — Temukan proyek dari berbagai kategori dan industri dengan pencarian dan filter.
- **Find Teammates** — Cari kolaborator berdasarkan skill, role, atau nama. Lihat profil dan keahlian sebelum mengundang ke tim.
- **Command Palette** — Navigasi cepat ke seluruh halaman dan fitur platform cukup dengan menekan `Ctrl+K`.

### Profil & Portfolio

- **Profile** — Halaman profil dengan bio, skill, job title, dan riwayat proyek.
- **Portfolio Generator** — Builder portofolio dinamis untuk showcase hasil karya. Setiap user mendapat halaman portfolio publik yang bisa dibagikan.
- **Achievements & Badges** — Sistem badge dan pencapaian berdasarkan aktivitas di platform.

### Komunitas

- **Forum** — Diskusi komunitas dengan thread dan kategori.
- **Events** — Kalender event dan meetup komunitas.
- **Hackathons** — Informasi dan pendaftaran hackathon.
- **Newsletter** — Subscribe newsletter untuk update terbaru.
- **Discord** — Integrasi dengan komunitas Discord CollabFind.
- **Blog** — Artikel dan tutorial dari tim dan komunitas.

### Kolaborasi & Pertumbuhan

- **Onboarding Wizard** — Panduan interaktif 4 langkah yang muncul otomatis untuk user baru: welcome, isi profil, pilih skill, dan tentukan tujuan (buat proyek, join proyek, atau eksplor).
- **Referral System** — Setiap user mendapat kode referral unik. Undang teman dan kumpulkan badge tier: Scout (0), Connector (1-4), Founding Member (5-9), Ambassador (10+).
- **Email Notification Preferences** — User mengatur sendiri kategori notifikasi email yang ingin diterima: lamaran proyek, pesan, update, atau newsletter.
- **Real-time Notifications** — Notifikasi langsung untuk undangan tim, update proyek, dan aktivitas penting lainnya.

### CollabFindBot (AI Assistant)

Chatbot AI yang terintegrasi di seluruh halaman, membantu user menavigasi platform, menjawab pertanyaan, dan memberikan rekomendasi. Menggunakan Groq API untuk respons yang cepat.

### Autentikasi & Keamanan

- **Email Registration** — Daftar dan login menggunakan email dan password.
- **OAuth Login** — Sign in instan menggunakan akun Google atau GitHub.
- **Referral Tracking** — Kode referral otomatis tercatat saat registrasi, berlaku untuk email maupun OAuth.
- **Row Level Security (RLS)** — Semua data di Supabase dilindungi dengan policy RLS sehingga user hanya bisa mengakses data milik sendiri.

### Lainnya

- **Internationalization (i18n)** — Dukungan penuh dua bahasa (Indonesia & English) dengan toggle instan di seluruh halaman.
- **Code Splitting & Lazy Loading** — Pemuatan halaman on-demand menggunakan React Router lazy loading untuk performa optimal.
- **Responsive Design** — Tampilan yang adaptif dan optimal di mobile, tablet, dan desktop.
- **Onboarding Checklist** — Checklist interaktif di dashboard untuk memandu user menyelesaikan setup awal.

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | React 19, Vite 8, Tailwind CSS 4 |
| **Backend & Database** | Supabase (PostgreSQL, Auth, Realtime, Storage) |
| **Routing** | React Router v7 (lazy loading) |
| **Animation** | Framer Motion |
| **AI** | Groq API (CollabFindBot) |
| **i18n** | Custom React Context (EN/ID) |
| **Icons** | Lucide React |
| **CI/CD & Deployment** | GitHub Actions & Vercel |

---

## Getting Started

### Prasyarat

- [Node.js](https://nodejs.org/) v18+
- [Git](https://git-scm.com/)
- Akun [Supabase](https://supabase.com)

### Instalasi

**1. Clone repository**

```bash
git clone https://github.com/Raihanhidayah12/CollabFind.git
cd CollabFind
```

**2. Install dependencies**

```bash
npm install
```

**3. Konfigurasi Environment Variables**

```bash
cp .env.example .env
```

Buka file `.env` dan masukkan credentials dari project Supabase kamu:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-ref
VITE_GROQ_API_KEY=your-groq-api-key
```

**4. Setup Database**

Jalankan file SQL berikut di Supabase SQL Editor untuk membuat skema tabel yang dibutuhkan:

- `supabase/create_project_collaborators.sql` — Skema manajemen kolaborator & undangan.
- `supabase/migrations/20260612_freelance_marketplace.sql` — Skema marketplace (jobs, proposals, contracts, milestones).
- `supabase/migrations/20260613_growth_features.sql` — Onboarding, referral system, email notifications.

**5. Jalankan Development Server**

```bash
npm run dev
```

Aplikasi berjalan di `http://localhost:5173`

---

## Struktur Proyek

```
CollabFind/
├── .github/workflows/          # GitHub Actions CI pipeline
├── public/                     # Static assets
├── src/
│   ├── components/             # Shared & feature components
│   │   ├── landing/            # Landing page (Hero, Navbar, Features, Footer, dll)
│   │   ├── workspace/          # Kanban, Chat, File Storage, Wiki, Sprint, Task Thread
│   │   └── freelance/          # JobCard, Proposal, Milestone Tracker, FreelanceFilters
│   ├── pages/                  # Halaman utama
│   │   ├── community/          # Forum, Events, Hackathons, Newsletter, Discord
│   │   ├── resources/          # Documentation, Blog, Changelog, Status, API Reference
│   │   └── static/             # About, Careers, Privacy, Terms, Press Kit
│   ├── hooks/                  # Custom React hooks
│   ├── i18n/                   # Internationalization (Context + EN/ID translations)
│   ├── utils/                  # Supabase client & helper functions
│   ├── App.jsx                 # Landing page entry point
│   ├── main.jsx                # Router & Provider setup
│   └── index.css               # Global Tailwind v4 styles
├── supabase/migrations/        # SQL migration files
├── vercel.json                 # Vercel SPA routing rules
└── package.json
```

---

## Berkontribusi

Kontribusi selalu terbuka! Ikuti langkah berikut:

1. **Fork** repository ini.
2. Buat branch fitur baru: `git checkout -b feature/NamaFitur`
3. Commit dengan [Conventional Commits](https://www.conventionalcommits.org/): `git commit -m "feat: tambah fitur X"`
4. Push ke branch kamu: `git push origin feature/NamaFitur`
5. Buka **Pull Request**.

Pastikan menjalankan `npm run lint` sebelum commit.

---

## Lisensi

Proyek ini dilisensikan di bawah **MIT License** — lihat file [LICENSE](LICENSE) untuk detail.

---

<div align="center">

Dibuat oleh [Raihanhidayah12](https://github.com/Raihanhidayah12)

Jangan lupa berikan star jika bermanfaat!

</div>
