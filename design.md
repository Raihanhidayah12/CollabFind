# 🚀 CollabFind - Futuristic Collaboration Hub

CollabFind adalah sebuah platform digital "Mission Control" modern yang dirancang khusus untuk mempertemukan mahasiswa, pengembang, desainer, dan kreator bertalenta dari seluruh dunia untuk berkolaborasi membangun proyek-proyek berdampak tinggi.

---

## 🎨 Design System & Branding

Aplikasi ini menggunakan tema **Cyberpunk / Futuristic Dark Mode** dengan kontras tinggi untuk memberikan pengalaman pengguna yang energetik dan canggih.

### 1. Palet Warna (Color Palette)
* **Background Deep:** `#08090D` (Latar belakang utama yang pekat)
* **Accent Cyan (Neon):** `#00D2FF` / `#00E5FF` (Warna utama untuk tombol aksi, teks penting, dan efek *glow*)
* **Accent Purple:** `#9D50BB` / `#D1B4FF` (Warna sekunder untuk aksen gradasi)
* **Success Neon:** `#00FFC2` (Indikator status aktif/merekrut)

### 2. Tipografi (Typography)
* **Heading & Display:** `Space Grotesk` (Memberikan kesan tegas, tech-forward, dan futuristik)
* **Body & Caption:** `Manrope` (Memastikan keterbacaan teks deskripsi tetap nyaman dan bersih)

---

## 🖥️ Komponen Antarmuka (UI Components)

Berdasarkan rancangan halaman utama (Landing Page), berikut adalah komponen-komponen visual yang telah diimplementasikan:

### 🌌 Top Navigation Bar
* **Efek Glassmorphism:** Menggunakan *backdrop blur* (`20px`) dan border semi-transparan dengan efek pendaran (*border-glow*).
* **Navigasi Menu:** Home, Explore Projects, Find Teammates, Portfolio Hub, dan Community.
* **Aksi Utama:** Tombol *Login* (minimalis) dan tombol *Sign Up* berbentuk kapsul dengan efek gradasi neon pulsa.

### ⚡ Hero Section
* **Headline:** *"Build Amazing Projects Together"* menggunakan efek gradasi teks klip dari warna Cyan ke Purple.
* **Call to Action (CTA):** * Tombol Utama: `Explore Projects` (Gradasi penuh + ikon panah).
    * Tombol Sekunder: `Create Project` (Transparan dengan border neon).
* **Floating Stats Cards:** Panel melayang interaktif beranimasi yang menampilkan data statis riil:
    * `2,500+` Active Projects (Aksen Cyan)
    * `15k+` Members (Aksen Purple)
    * `7k+` Successes (Aksen Success Neon)

### 📊 Featured Projects Grid
Menampilkan kartu-kartu proyek (*Project Cards*) menggunakan efek interaktif hover angkat (`hover:-translate-y-1`). Contoh proyek awal:
1.  **Food Delivery App** (Tag: *React Native, Node.js, UI/UX*) - Status: `Recruiting`
2.  **Smart Farming IoT** (Tag: *Python, C++, Hardware*) - Status: `In Progress`
3.  **AI Study Assistant** (Tag: *OpenAI API, React, FastAPI*) - Status: `Recruiting`

---

## 🛠️ Langkah Pengembangan Selanjutnya (Next Milestones)

Karena kamu adalah **Solo Developer**, berikut adalah target yang harus diintegrasikan ke desain HTML ini:

* [ ] **Integrasi Supabase SDK:** Menghubungkan tombol "Join" dan pengisian data proyek langsung ke database Supabase.
* [ ] **Sistem Autentikasi Nyata:** Mengaktifkan tombol *Login/Sign Up* menggunakan fitur `supabase.auth`.
* [ ] **Halaman Eksplorasi Dinamis:** Mengubah bagian *Featured Projects* agar melakukan *fetching* data asli dari tabel `projects` menggunakan React `useEffect`.

---
*Built with ⚡ React, Vite, Tailwind CSS, and Supabase.*