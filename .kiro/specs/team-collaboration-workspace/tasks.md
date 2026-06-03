# Implementation Plan

## Team Collaboration Workspace — CollabFind

Stack: React 19, Vite, Tailwind CSS v4, Framer Motion, Lucide React, Supabase (Auth + DB + Storage), React Router v7.

Design system: Dark mode `#050816` background, Space Grotesk headings, Manrope body, accent blue/purple gradients — konsisten dengan Dashboard yang sudah ada.

---

## Task 1: Setup Database Schema & RLS di Supabase

- [x] 1.1 Buat tabel `workspace_files`
- [x] 1.2 Buat tabel `workspace_wiki_pages`
- [x] 1.3 Buat tabel `workspace_tasks`
- [ ] 1.4 Buat Supabase Storage bucket `workspace-files` (**manual** via Dashboard > Storage)
- [x] 1.5 Buat helper SQL function `is_team_member(p_project_id uuid)`
- [x] 1.6 Terapkan RLS policy pada ketiga tabel
- [x] 1.7 Terapkan Storage RLS policy
> 📄 SQL lengkap tersedia di `supabase/workspace_schema.sql` — jalankan di Supabase SQL Editor

---

## Task 2: Halaman Workspace — Layout & Access Guard

- [x] 2.1 Buat `src/pages/Workspace.jsx`
- [x] 2.2 Implementasi `Workspace_Access_Guard`
- [x] 2.3 Redirect ke `/login` jika belum login
- [x] 2.4 Render 403 inline jika bukan team member
- [x] 2.5 Render header + tiga tab (files, wiki, boards)
- [x] 2.6 Daftarkan route `/dashboard/workspace/:projectId` di `main.jsx`
- [x] 2.7 Styling konsisten dengan Dashboard

---

## Task 3: Dashboard — Tombol "Buka Workspace"

- [x] 3.1 Tombol "Workspace" di setiap project card (My Projects)
- [x] 3.2 Tombol "Workspace" di applications dengan `status = 'accepted'`
- [x] 3.3 Style tombol purple dengan ikon `ExternalLink`

---

## Task 4: File Storage — Komponen Upload & List

- [x] 4.1 Buat `src/components/workspace/FileStorage.jsx`
- [x] 4.2 Fungsi upload ke Supabase Storage + insert ke `workspace_files`
- [x] 4.3 Validasi ekstensi dan ukuran file client-side
- [x] 4.4 Progress bar upload (simulasi + state)
- [x] 4.5 Fetch + tampilkan list file dengan JOIN ke `profiles`
- [x] 4.6 Tampilkan ikon, nama, ukuran, uploader, tanggal
- [x] 4.7 Download via signed URL
- [x] 4.8 Empty state

---

## Task 5: File Storage — Hapus File

- [x] 5.1 Dialog konfirmasi sebelum hapus
- [x] 5.2 Hapus dari Storage + tabel secara paralel (`Promise.all`)
- [x] 5.3 Error toast + rollback UI jika gagal
- [x] 5.4 Disable tombol hapus selama proses berlangsung

---

## Task 6: Wiki — List Halaman & Editor

- [x] 6.1 Buat `src/components/workspace/Wiki.jsx`
- [x] 6.2 Layout sidebar + editor area
- [x] 6.3 Textarea + toolbar format manual (Markdown-based)
- [x] 6.4 Toolbar: H1, H2, H3, Bold, Italic, Code, Code Block, List, Ordered List
- [x] 6.5 Simpan content sebagai plain Markdown string
- [x] 6.6 Validasi judul tidak boleh kosong
- [x] 6.7 Edit existing page (load ke editor, update + `updated_at`)
- [x] 6.8 Sidebar list terurut berdasarkan `created_at`
- [x] 6.9 Empty state di area editor

---

## Task 7: Wiki — Hapus Halaman

- [x] 7.1 Tombol hapus di sidebar dengan ikon `Trash2`
- [x] 7.2 Modal konfirmasi
- [x] 7.3 Delete dari tabel + update state list
- [x] 7.4 Error handling tanpa mengubah UI

---

## Task 8: Project Boards — Tampilan Kanban

- [x] 8.1 Buat `src/components/workspace/ProjectBoards.jsx`
- [x] 8.2 Render tiga kolom: To-Do, In Progress, Done
- [x] 8.3 Fetch tasks + group berdasarkan `status`
- [x] 8.4 Task Card: judul, assignee badge, deadline badge (merah jika lewat)
- [x] 8.5 Header kolom: label + badge count
- [x] 8.6 Empty state per kolom

---

## Task 9: Project Boards — Buat & Edit Task Card

- [x] 9.1 Tombol "Tambah Tugas" di setiap kolom
- [x] 9.2 Form: judul (wajib), deskripsi, deadline, assignee (dari team member)
- [x] 9.3 Validasi judul kosong
- [x] 9.4 Insert ke `workspace_tasks`, append ke state tanpa reload
- [x] 9.5 Klik card → modal edit dengan data ter-populate
- [x] 9.6 Save edit: update row + `updated_at`

---

## Task 10: Project Boards — Pindah & Hapus Task Card

- [x] 10.1 Menu `...` per card dengan opsi "Pindah ke [kolom]"
- [x] 10.2 Optimistic update + rollback jika gagal
- [x] 10.3 Hapus task dengan konfirmasi modal
- [x] 10.4 Error toast tanpa mengubah UI

---

## Task 11: Landing Page — Promotion Card & Preview Modal

- [x] 11.1 Card "Team Collaboration Workspace" sudah ada di Features
- [x] 11.2 onClick handler: buka `WorkspacePreviewModal`
- [x] 11.3 Buat `src/components/landing/WorkspacePreviewModal.jsx`
- [x] 11.4 Modal: 3 slide (File Storage, Wiki, Boards) dengan animasi Framer Motion + auto-advance
- [x] 11.5 Tutup dengan tombol X atau klik backdrop
- [x] 11.6 Data preview statis/dummy, bukan data sungguhan

---

## Task 12: Polish & Error Handling Global

- [x] 12.1 Komponen `Toast.jsx` + hook `useToast` terintegrasi di Workspace
- [x] 12.2 Spinner konsisten di semua komponen
- [x] 12.3 Semua pesan error dalam Bahasa Indonesia
- [ ] 12.4 Test manual akses (non-member → 403, owner → masuk)
- [x] 12.5 SQL schema terdokumentasi di `supabase/workspace_schema.sql`
