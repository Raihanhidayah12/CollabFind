<div align="center">

<br />

<img src="https://img.shields.io/badge/CollabFind-Platform%20Kolaborasi-0a0f1e?style=for-the-badge&labelColor=0a0f1e" alt="CollabFind" />

<br />

# CollabFind

### Temukan Proyek. Bentuk Tim. Bangun Bersama.

Platform kolaborasi inovatif yang menghubungkan developer, desainer, dan kreator dengan proyek menarik serta kolaborator yang tepat.

<br />

<a href="https://collab-find.vercel.app"><img src="https://img.shields.io/badge/Live%20Demo-collab--find.vercel.app-00D2FF?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" /></a>
<a href="https://github.com/Raihanhidayah12/CollabFind/actions"><img src="https://img.shields.io/github/actions/workflow/status/Raihanhidayah12/CollabFind/ci.yml?style=for-the-badge&label=CI&logo=githubactions&logoColor=white" alt="CI Status" /></a>
<a href="https://github.com/Raihanhidayah12/CollabFind/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" /></a>

<br>

**[Explore Docs](https://collab-find.vercel.app/docs)** &nbsp;·&nbsp; **[Report Bug](https://github.com/Raihanhidayah12/CollabFind/issues)** &nbsp;·&nbsp; **[Request Feature](https://github.com/Raihanhidayah12/CollabFind/issues)**

</div>

---

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Struktur Proyek](#struktur-proyek)
- [Roadmap](#roadmap)
- [Berkontribusi](#berkontribusi)
- [Lisensi](#lisensi)

---

## Fitur Utama

<table>
  <tr>
    <td width="50%" valign="top">

### 🎯 Smart Match
Algoritma cerdas yang mencocokkan talenta dengan proyek berdasarkan keahlian, minat, dan riwayat kolaborasi.

### 💼 Freelance Marketplace
Marketplace terintegrasi untuk menghubungkan freelancer dengan klien — mulai dari posting pekerjaan, proposal, kontrak, hingga milestone delivery.

### 💻 Workspace Kolaboratif
Ruang kerja terintegrasi dengan **Kanban Board**, **Team Chat**, **File Storage**, **Wiki**, dan **Activity Timeline**.

    </td>
    <td width="50%" valign="top">

### 🔍 Eksplorasi Proyek
Temukan dan ikuti proyek dari berbagai kategori dan industri dengan pencarian cerdas.

### 📂 Portfolio Generator
Builder portofolio dinamis untuk showcase hasil karya secara profesional langsung dari profil.

### 🌐 Forum & Komunitas
Diskusi real-time, info hackathon, events, dan newsletter komunitas.

    </td>
  </tr>
</table>

### ✨ Fitur Unggulan Lainnya:
- **Freelance Contracts & Milestones** — Kelola kontrak, milestone delivery, dan tracking progres kerja.
- **OAuth Login** — Sign in instan dan aman menggunakan Google atau GitHub.
- **Real-time Notifications** — Notifikasi undangan tim dan update proyek secara langsung.
- **Command Palette** — Navigasi super cepat di seluruh platform hanya dengan menekan `Ctrl+K`.
- **Sprint & Task Management** — Perencanaan sprint lengkap dengan task assignment, deadline, dan progress tracking.
- **Task Thread Discussion** — Diskusi spesifik di setiap task menggunakan fitur @mention rekan tim.
- **Internationalization (i18n)** — Dukungan penuh dua bahasa (Indonesia & English) dengan toggle instan di seluruh halaman (926 keys).
- **Optimized Performance** — Menggunakan Code Splitting dan Lazy Loading untuk loading yang jauh lebih cepat.
- **Responsive Design** — Tampilan antarmuka yang responsif dan optimal di mobile, tablet, maupun desktop.

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | React 19, Vite 8, Tailwind CSS 4 |
| **Backend & Database** | Supabase (PostgreSQL, Auth, Realtime, Storage) |
| **Routing** | React Router v7 |
| **Animation** | Framer Motion |
| **i18n** | Custom React Context (926 keys, EN/ID) |
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
git clone [https://github.com/Raihanhidayah12/CollabFind.git](https://github.com/Raihanhidayah12/CollabFind.git)
cd CollabFind
2. Install dependencies

Bash
npm install
3. Konfigurasi Environment Variables

Bash
cp .env.example .env
Buka file .env dan masukkan credentials dari project Supabase kamu:

Cuplikan kode
VITE_SUPABASE_URL=[https://your-project.supabase.co](https://your-project.supabase.co)
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-ref
4. Setup Database Tables
Jalankan file SQL berikut di bagian Supabase SQL Editor untuk membuat skema tabel yang dibutuhkan:

supabase/create_project_collaborators.sql — Skema manajemen kolaborator & undangan.

supabase/migrations/20260612_freelance_marketplace.sql — Skema marketplace (jobs, proposals, contracts, milestones).

5. Jalankan Development Server

Bash
npm run dev
Aplikasi kamu sekarang sudah berjalan di http://localhost:5173

Struktur Proyek
CollabFind/
├── .github/workflows/          # GitHub Actions CI pipeline
├── public/                     # Static assets
├── src/
│   ├── components/             # Shared & feature-based components
│   │   ├── landing/            # Landing page sections (Hero, Navbar, dll)
│   │   ├── workspace/          # Kanban, Chat, Storage, Wiki
│   │   └── freelance/          # JobCard, Proposal, Milestone tracker
│   ├── pages/                  # Halaman utama aplikasi (Dashboard, Explore, dll)
│   ├── hooks/                  # Custom React hooks
│   ├── i18n/                   # Konfigurasi i18n (Context + 926 keys EN/ID)
│   ├── utils/                  # Inisialisasi Supabase client & helper
│   ├── App.jsx                 # Entry point Landing Page
│   ├── main.jsx                # Router & Provider setup
│   └── index.css               # Global styling Tailwind v4
├── supabase/migrations/        # SQL migration files
├── vercel.json                 # Vercel SPA routing rules
└── package.json
Roadmap
[x] Authentication (Email + OAuth Google & GitHub)

[x] Project CRUD & Workspace Management

[x] Kanban Board & Team Chat Real-time

[x] Portfolio Generator

[x] Smart Match Algorithm & Find Teammates

[x] Real-time Notifications System

[x] Forum, Events, & Blog Komunitas

[x] Freelance Marketplace Integration (Jobs, Proposals, Contracts, Milestones)

[x] Multi-language Support (i18n - 926 keys)

[ ] Unit & Integration Testing

[ ] Dark / Light Mode Toggle

[ ] Implementasi Payment Gateway (Stripe) untuk Freelance

[ ] AI-powered Project & Talents Recommendation

Berkontribusi
Kontribusi selalu terbuka! Jika ingin berkontribusi atau memperbaiki bug, silakan ikuti langkah berikut:

Fork repository ini.

Buat branch fitur baru: git checkout -b feature/NamaFitur.

Commit perubahan kamu dengan standard Conventional Commits: git commit -m "feat: tambah fitur X".

Push ke branch kamu: git push origin feature/NamaFitur.

Buka sebuah Pull Request.

Pastikan untuk menjalankan npm run lint dan memastikan kode berjalan dengan baik sebelum melakukan commit.

Lisensi
Proyek ini dilisensikan di bawah MIT License - lihat file LICENSE untuk detail lebih lanjut.

Dibuat dengan 💻 oleh Raihanhidayah12

Jangan lupa berikan ⭐ star pada repositori ini jika bermanfaat!
