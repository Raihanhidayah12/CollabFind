<div align="center">

<br />

<img src="https://img.shields.io/badge/CollabFind-Platform%20Kolaborasi-0a0f1e?style=for-the-badge&labelColor=0a0f1e" alt="CollabFind" />

<br />

# CollabFind

### Temukan Proyek. Bentuk Tim. Bangun Bersama.

Platform kolaborasi yang menghubungkan developer, desainer, dan kreator dengan proyek menarik serta kolaborator yang tepat.

<br />

<a href="https://collab-find.vercel.app"><img src="https://img.shields.io/badge/Live%20Demo-collab--find.vercel.app-00D2FF?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" /></a>
<a href="https://github.com/Raihanhidayah12/CollabFind/actions"><img src="https://img.shields.io/github/actions/workflow/status/Raihanhidayah12/CollabFind/ci.yml?style=for-the-badge&label=CI&logo=githubactions&logoColor=white" alt="CI Status" /></a>
<a href="https://github.com/Raihanhidayah12/CollabFind/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" /></a>

<br>

**[Explore Docs](https://collab-find.vercel.app/docs)** · **[Report Bug](https://github.com/Raihanhidayah12/CollabFind/issues)** · **[Request Feature](https://github.com/Raihanhidayah12/CollabFind/issues)**

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

### Smart Match
Algoritma pencocokan talenta dengan proyek berdasarkan keahlian, minat, dan riwayat kolaborasi.

### Freelance Marketplace
Marketplace terintegrasi untuk menghubungkan freelancer dengan klien — posting pekerjaan, proposal, kontrak, hingga milestone delivery.

### Workspace Kolaboratif
Ruang kerja terintegrasi dengan **Kanban Board**, **Team Chat**, **File Storage**, **Wiki**, dan **Activity Timeline**.

    </td>
    <td width="50%" valign="top">

### Eksplorasi Proyek
Temukan dan ikuti proyek dari berbagai kategori dan industri dengan pencarian cerdas.

### Portfolio Generator
Builder portofolio dinamis untuk showcase hasil karya secara profesional langsung dari profil.

### Forum & Komunitas
Diskusi real-time, info hackathon, events, dan newsletter komunitas.

    </td>
  </tr>
</table>

### Fitur Unggulan Lainnya

- **Onboarding Wizard** — Panduan interaktif 4 langkah untuk user baru agar langsung produktif setelah mendaftar.
- **Referral System** — Undang teman dengan kode referral unik, kumpulkan badge (Scout, Connector, Founding Member, Ambassador).
- **Email Notification Preferences** — User mengatur notifikasi email yang ingin diterima (lamaran, pesan, update, newsletter).
- **Freelance Contracts & Milestones** — Kelola kontrak, milestone delivery, dan tracking progres kerja.
- **OAuth Login** — Sign in instan menggunakan Google atau GitHub.
- **Real-time Notifications** — Notifikasi undangan tim dan update proyek secara langsung.
- **Command Palette** — Navigasi cepat di seluruh platform dengan `Ctrl+K`.
- **Sprint & Task Management** — Perencanaan sprint dengan task assignment, deadline, dan progress tracking.
- **Task Thread Discussion** — Diskusi di setiap task menggunakan @mention rekan tim.
- **Internationalization (i18n)** — Dukungan dua bahasa (Indonesia & English) dengan toggle instan.
- **Code Splitting & Lazy Loading** — Performa optimal dengan pemuatan halaman on-demand.
- **Responsive Design** — Tampilan optimal di mobile, tablet, dan desktop.

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | React 19, Vite 8, Tailwind CSS 4 |
| **Backend & Database** | Supabase (PostgreSQL, Auth, Realtime, Storage) |
| **Routing** | React Router v7 |
| **Animation** | Framer Motion |
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
│   │   ├── landing/            # Landing page (Hero, Navbar, Features, dll)
│   │   ├── workspace/          # Kanban, Chat, File Storage, Wiki
│   │   └── freelance/          # JobCard, Proposal, Milestone Tracker
│   ├── pages/                  # Halaman utama (Dashboard, Explore, Profile, dll)
│   ├── hooks/                  # Custom React hooks
│   ├── i18n/                   # Internationalization (Context + EN/ID)
│   ├── utils/                  # Supabase client & helper functions
│   ├── App.jsx                 # Landing page entry point
│   ├── main.jsx                # Router & Provider setup
│   └── index.css               # Global Tailwind v4 styles
├── supabase/migrations/        # SQL migration files
├── vercel.json                 # Vercel SPA routing rules
└── package.json
```

---

## Roadmap

- [x] Authentication (Email + OAuth Google & GitHub)
- [x] Project CRUD & Workspace Management
- [x] Kanban Board & Team Chat Real-time
- [x] Portfolio Generator
- [x] Smart Match Algorithm & Find Teammates
- [x] Real-time Notifications System
- [x] Forum, Events, & Blog Komunitas
- [x] Freelance Marketplace (Jobs, Proposals, Contracts, Milestones)
- [x] Multi-language Support (i18n — EN/ID)
- [x] Onboarding Wizard
- [x] Referral System & Badge Tiers
- [x] Email Notification Preferences
- [ ] Unit & Integration Testing
- [ ] Dark / Light Mode Toggle
- [ ] Payment Gateway (Stripe) untuk Freelance
- [ ] AI-powered Project & Talents Recommendation

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
