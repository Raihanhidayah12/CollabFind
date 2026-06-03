<!--
  _______  _____ __   _ _______ ______  ______
 |       |     | | \  | |       |      |
 |    _  |     | |  \ | |    ___|___   |
 |    \_| |_|||_| |   \| |    ___|___   |
 |     |       | | |\   |    |___|      |
 |_____|_______|_|_| \_|______|______|

  CollabFind - Platform Kolaborasi untuk Profesional
  =================================================

  Dibuat dengan ❤️ menggunakan React + Supabase
-->

<div align="center">

# 🚀 CollabFind

[![License](https://img.shields.io/github/license/username/collabfind?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Development-blue?style=for-the-badge)]()
[![Tech Stack](https://img.shields.io/badge/Made%20with-React%20%2B%20Supabase-orange?style=for-the-badge)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](https://github.com/username/collabfind/pulls)

---

**CollabFind** adalah platform kolaborasi inovatif yang dirancang untuk menghubungkan para profesional, developer, desainer, dan kreator dengan proyek-proyek menarik dan kolaborator yang tepat. ✨

**[🌐 Demo Website](https://collabfind.vercel.app)** · 
**[📖 Dokumentasi](https://docs.collabfind.app)** · 
**[🐛 Laporkan Bug](https://github.com/username/collabfind/issues)**

</div>

---

## 📋 Daftar Isi

- [✨ Fitur Utama](#-fitur-utama)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Memulai](#-memulai)
- [📁 Struktur Proyek](#-struktur-proyek)
- [🤝 Berkontribusi](#-berkontribusi)
- [📸 Preview](#-preview)
- [📄 Lisensi](#-lisensi)
- [📞 Kontak](#-kontak)

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 🔍 **Smart Match** | Algoritma cerdas yang mencocokkan talenta dengan proyek berdasarkan keahlian, minat, dan riwayat kolaborasi. |
| 👥 **Workspace Kolaboratif** | Ruang kerja terintegrasi dengan Kanban, Team Chat, File Storage, dan Wiki. |
| 📄 **Portfolio Editor** | Builder portofolio dinamis untuk showcase hasil karya profesional. |
| 🌎 **Eksplorasi Proyek** | Temukan dan ikuti proyek dari berbagai kategori & industri. |
| 🏆 **Hackathon & Events** | Ikut kompetisi dan event komunitas reguler. |
| 📊 **Task Management** | Sprint planning dengan task assignment dan progress tracking. |
| 💬 **Forum & Chat** | Diskusi real-time dengan komunitas. |

---

## 🛠️ Tech Stack

Built with modern and scalable technologies:

### Frontend
<p>
  <img src="https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/tailwindcss-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/react_router-CA4245?style=for-the-badge&logo=react-router&logoColor=white" alt="React Router" />
</p>

### Backend & Database
<p>
  <img src="https://img.shields.io/badge/supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=black" alt="Supabase" />
</p>

### Animation & Icons
<p>
  <img src="https://img.shields.io/badge/framer_motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/lucide_react-000000?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PC9zdmc+&alt="Lucide" />
</p>

---

## 🚀 Mem/getting Started

### Prerequisites

 Pastikan kamu sudah install:
- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) atau [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)

### Installation

1. **Clone repositori ini:**
```bash
git clone https://github.com/username/collabfind.git
cd collabfind
```

2. **Install dependencies:**
```bash
npm install
# atau menggunakan yarn
# yarn install
```

3. **Setup Environment Variables:**
```bash
# Copy contoh environment file
cp .env.example .env
```

Edit file `.env` dan tambahkan konfigurasi Supabase:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> 💡 **Catatan:** Untuk mendapatkan kredensial Supabase, buat proyek baru di [supabase.com](https://supabase.com) dan salin URL serta anon key dari Settings > API.

4. **Run development server:**
```bash
npm run dev
```

Aplikasi akan berjalan di **`http://localhost:5173`** 🎉

### Perintah Lainnya

| Perintah | Deskripsi |
|---------|-----------|
| `npm run build` | Build untuk production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview build production |

---

## 📁 Struktur Proyek

```
collabfind/
├── public/                 # Static assets
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/            # Images & static files
│   ├── components/        # React components
│   │   ├── landing/       # Landing page components
│   │   └── workspace/     # Workspace components
│   ├── pages/             # Page components
│   │   ├── community/     # Community pages
│   │   ├── resources/     # Resources pages
│   │   └── static/        # Static pages
│   ├── utils/             # Utility functions
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── supabase/             # SQL schemas
├── eslint.config.js      # ESLint config
├── vite.config.js        # Vite config
├── package.json
└── README.md
```

---

## 🤝 Berkontribusi

Kami sangat menyambut kontribusi dari komunitas! Untuk mulai berkontribusi:

1. **Fork** repositori ini
2. Buat branch fitur baru: `git checkout -b fitur/ nama-fitur`
3. Commit perubahan: `git commit -m 'feat: tambah fitur baru'`
4. Push ke branch: `git push origin fitur/nama-fitur`
5. Buat **Pull Request**

Baca [CONTRIBUTING.md](CONTRIBUTING.md) untuk panduan lengkap.

### Guidelines

- 🧹 Pastikan kode bersih dan terformat
- ✅ Test fitur sebelum submit PR
- 📝 Commit message mengikutiConventional Commits
- 🔧 Ikuti coding style yang ada di project

---

## 📸 Preview

| Landing Page | Dashboard | Workspace |
|:---:|:---:|:---:|
| ![Landing](/src/assets/hero.png) | ![Dashboard](/src/assets/demo-dashboard.png) | ![Workspace](/src/assets/demo-workspace.png) |

---

## 📄 Lisensi

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📞 Kontak

<div align="center">

 Built with 💖 by **[Tim CollabFind](https://github.com/username/collabfind)**

[![Follow on GitHub](https://img.shields.io/github/followers/username?label=Follow&style=social)](https://github.com/username)
[![Twitter Follow](https://img.shields.io/twitter/follow/username?label=Follow&style=social)](https://twitter.com/username)

 Jangan lupa ⭐ repositori ini jika membantu!

</div>

---

<p align="center">
  <a href="https://vercel.com">
    <img src="https://img.shields.io/badge/Powered%20by-Vercel-black?style=for-the-badge&logo=vercel" alt="Powered by Vercel" />
  </a>
</p>
