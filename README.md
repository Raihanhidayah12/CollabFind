<div align="center">

<br />

<img src="https://img.shields.io/badge/CollabFind-Platform%20Kolaborasi-0a0f1e?style=for-the-badge&labelColor=0a0f1e" alt="CollabFind" />

<br />

# CollabFind

### Temukan Proyek. Bentuk Tim. Bangun Bersama.

Platform kolaborasi inovatif yang menghubungkan developer, desainer, dan kreator dengan proyek menarik dan kolaborator yang tepat.

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
- [Screenshots](#screenshots)
- [Roadmap](#roadmap)
- [Berkontribusi](#berkontribusi)
- [Lisensi](#lisensi)

---

## Fitur Utama

<table>
  <tr>
    <td width="50%" valign="top">

### Smart Match
Algoritma cerdas yang mencocokkan talenta dengan proyek berdasarkan keahlian, minat, dan riwayat kolaborasi.

### Freelance Marketplace
Marketplace terintegrasi untuk menghubungkan freelancer dengan klien — mulai dari posting pekerjaan, proposal, kontrak, hingga milestone delivery.

### Workspace Kolaboratif
Ruang kerja terintegrasi dengan **Kanban Board**, **Team Chat**, **File Storage**, **Wiki**, dan **Activity Timeline**.

    </td>
    <td width="50%" valign="top">

### Eksplorasi Proyek
Temukan dan ikuti proyek dari berbagai kategori dan industri dengan pencarian cerdas.

### Portfolio Generator
Builder portofolio dinamis untuk showcase hasil karya secara profesional langsung dari profil.

### Forum & Komunitas
Diskusi real-time, hackathon, events, dan newsletter komunitas.

    </td>
  </tr>
</table>

**Dan masih banyak lagi:**

- **Freelance Contracts & Milestones** — Kelola kontrak, milestone delivery, dan pembayaran freelance
- **OAuth Login** — Sign in dengan Google atau GitHub
- **Real-time Notifications** — Notifikasi invitation dan update proyek secara langsung
- **Command Palette** — Tekan `Ctrl+K` untuk navigasi cepat (pengguna terdaftar)
- **Sprint & Task Management** — Sprint planning dengan task assignment, deadline, dan progress tracking
- **Task Thread Discussion** — Diskusi per tugas dengan @mention rekan tim
- **Error Boundary** — Crash protection di setiap halaman
- **Code Splitting** — Lazy loading untuk performa optimal
- **Responsive Design** — Tampilan optimal di desktop, tablet, dan mobile

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | React 19, Vite 8, Tailwind CSS 4 |
| **Backend & DB** | Supabase (PostgreSQL, Auth, Realtime, Storage) |
| **Routing** | React Router v7 |
| **Animation** | Framer Motion |
| **Icons** | Lucide React |
| **CI/CD** | GitHub Actions |
| **Deployment** | Vercel |

---

## Getting Started

### Prasyarat

- [Node.js](https://nodejs.org/) v18+
- [Git](https://git-scm.com/)
- Akun [Supabase](https://supabase.com) (gratis)

### Instalasi

**1. Clone repository**

```bash
git clone https://github.com/Raihanhidayah12/CollabFind.git
cd CollabFind
```

### Install Dependencies

```bash
npm install
```

### Configure Environment

```bash
cp .env.example .env
```

Edit file `.env` dengan credentials Supabase kamu:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-ref
```

> [!TIP]
> Untuk mendapatkan credentials, buat project baru di [supabase.com](https://supabase.com), lalu salin URL dan anon key dari **Settings → API**. Project ref bisa ditemukan di URL dashboard: `https://supabase.com/dashboard/project/<ref>`.

**4. Setup database tables**

Jalankan SQL berikut di **Supabase SQL Editor** untuk membuat tabel yang dibutuhkan:

- `supabase/create_project_collaborators.sql` — Tabel invitation by email
- `supabase/migrations/20260612_freelance_marketplace.sql` — Tabel freelance (jobs, proposals, contracts, milestones)

Pastikan tabel-tabel utama (`profiles`, `projects`, `invitations`) sudah ada sesuai skema aplikasi.

**5. Enable OAuth providers** _(opsional)_

Untuk login dengan Google/GitHub, aktifkan provider di **Supabase Dashboard → Authentication → Providers**.

**6. Jalankan development server**

```bash
npm run dev
```

Aplikasi berjalan di **http://localhost:5173**

### Perintah Lainnya

| Perintah | Deskripsi |
|---------|-----------|
| `npm run build` | Build untuk production |
| `npm run preview` | Preview hasil build |
| `npm run lint` | Jalankan ESLint |

---

## Struktur Proyek

```
CollabFind/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI pipeline
├── public/                     # Static assets
├── src/
│   ├── components/             # Shared components
│   │   ├── landing/            # Landing page sections
│   │   │   ├── Hero.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Features.jsx
│   │   │   ├── FreelanceMarketplace.jsx
│   │   │   └── ...
│   │   ├── workspace/          # Workspace features
│   │   │   ├── ProjectBoards.jsx
│   │   │   ├── FileStorage.jsx
│   │   │   ├── TeamChat.jsx
│   │   │   ├── Wiki.jsx
│   │   │   └── ...
│   │   ├── freelance/          # Freelance marketplace components
│   │   │   ├── JobCard.jsx
│   │   │   ├── FreelancerCard.jsx
│   │   │   ├── ProposalCard.jsx
│   │   │   ├── MilestoneTracker.jsx
│   │   │   ├── SubmitProposalModal.jsx
│   │   │   └── FreelanceFilters.jsx
│   │   ├── AuthProvider.jsx    # Auth context & session
│   │   ├── CommandPalette.jsx  # Ctrl+K navigation
│   │   ├── ErrorBoundary.jsx   # Crash protection
│   │   ├── NotificationMenu.jsx
│   │   ├── PageNavbar.jsx
│   │   ├── Skeleton.jsx        # Loading skeletons
│   │   └── ...
│   ├── pages/                  # Route pages
│   │   ├── Dashboard.jsx
│   │   ├── Explore.jsx
│   │   ├── FindTeammates.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Profile.jsx
│   │   ├── Settings.jsx
│   │   ├── Workspace.jsx
│   │   ├── FreelanceMarketplace.jsx
│   │   ├── PostJob.jsx
│   │   ├── JobDetail.jsx
│   │   ├── MyProposals.jsx
│   │   ├── ContractDetail.jsx
│   │   ├── FreelanceDashboard.jsx
│   │   ├── community/          # Forum, Events, Hackathons...
│   │   ├── resources/          # Blog, Docs, API Ref...
│   │   └── static/             # About, Privacy, Terms...
│   ├── hooks/                  # Custom hooks
│   ├── utils/                  # Utility functions
│   │   └── supabaseClient.js   # Supabase client config
│   ├── App.jsx                 # Landing page
│   ├── main.jsx                # Entry point + routes
│   └── index.css               # Global styles
├── supabase/                   # SQL migration files
│   └── migrations/
│       └── 20260612_freelance_marketplace.sql
├── .env.example                # Environment template
├── vercel.json                 # Vercel SPA rewrite rules
├── vite.config.js
└── package.json
```

---

## Screenshots

<div align="center">

| Landing Page | Dashboard |
|:---:|:---:|
| ![Landing](https://collab-find.vercel.app/og-image.png) | ![Dashboard](https://via.placeholder.com/600x350/0a0f1e/00D2FF?text=Dashboard) |

| Explore Projects | Freelance Marketplace |
|:---:|:---:|
| ![Explore](https://via.placeholder.com/600x350/0a0f1e/00D2FF?text=Explore) | ![Freelance](https://via.placeholder.com/600x350/0a0f1e/00D2FF?text=Freelance+Marketplace) |

| Workspace | Find Teammates |
|:---:|:---:|
| ![Workspace](https://via.placeholder.com/600x350/0a0f1e/00D2FF?text=Workspace) | ![Teammates](https://via.placeholder.com/600x350/0a0f1e/00D2FF?text=Teammates) |

</div>

> Ganti screenshot di atas dengan gambar asli setelah project di-deploy.

---

## Berkontribusi

Kontribusi sangat disambut! Berikut langkah-langkahnya:

1. **Fork** repository ini
2. Buat branch fitur: `git checkout -b fitur/nama-fitur`
3. Commit perubahan: `git commit -m "feat: tambah fitur baru"`
4. Push ke branch: `git push origin fitur/nama-fitur`
5. Buat **Pull Request**

### Panduan

- Gunakan [Conventional Commits](https://www.conventionalcommits.org/) untuk commit message
- Pastikan `npm run lint` pass sebelum submit PR
- Test fitur baru secara manual sebelum request review
- Ikuti coding style dan pattern yang sudah ada di project

---

## Roadmap

- [x] Authentication (Email + OAuth)
- [x] Project CRUD & Workspace
- [x] Kanban Board & Team Chat
- [x] Portfolio Generator
- [x] Smart Match & Find Teammates
- [x] Real-time Notifications
- [x] Forum, Events & Blog
- [x] Freelance Marketplace (Jobs, Proposals, Contracts, Milestones)
- [x] Code Splitting & Performance
- [ ] Unit & Integration Tests
- [ ] Dark/Light Mode Toggle
- [ ] Mobile App (React Native)
- [ ] AI-powered Project Recommendations
- [ ] Stripe Payment Integration for Freelance

---

## Lisensi

Distributed under the **MIT License**. See [LICENSE](LICENSE) for more information.

---

<div align="center">

**Dibuat oleh [Raihanhidayah12](https://github.com/Raihanhidayah12)**

<a href="https://github.com/Raihanhidayah12"><img src="https://img.shields.io/github/followers/Raihanhidayah12?label=Follow&style=social" alt="Follow" /></a>

<br />

<a href="https://vercel.com">
  <img src="https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel" alt="Vercel" />
</a>

<br />

**Jangan lupa star repo ini jika bermanfaat!**

</div>
