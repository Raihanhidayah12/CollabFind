# Requirements Document

## Introduction

Fitur **Team Collaboration Workspace** adalah ruang kerja digital terpadu di dalam platform CollabFind yang memungkinkan tim (Project Owner dan Collaborator yang diterima) untuk tetap sinkron dalam satu proyek. Workspace terdiri dari tiga komponen utama: **File Storage** (penyimpanan dan berbagi aset proyek), **Wiki** (dokumentasi berbasis rich-text), dan **Project Boards** (manajemen tugas berbasis Kanban). Akses ke workspace dibatasi secara ketat menggunakan Supabase Row-Level Security (RLS) sehingga hanya anggota tim yang sah yang dapat membaca dan memodifikasi data workspace.

---

## Glosarium

- **Workspace**: Ruang kerja kolaboratif yang terikat pada satu proyek (`project_id`) di CollabFind, terdiri dari File Storage, Wiki, dan Project Boards.
- **Project Owner**: Pengguna yang membuat proyek (`projects.creator_id`), memiliki hak akses penuh ke seluruh workspace.
- **Collaborator**: Pengguna dengan entri di tabel `applications` dengan kolom `project_id` yang cocok dan `status = 'accepted'`.
- **Team Member**: Istilah kolektif yang mencakup Project Owner dan semua Collaborator dari suatu proyek.
- **File Storage**: Komponen Workspace untuk mengunggah, menyimpan, dan mengunduh aset proyek menggunakan Supabase Storage.
- **Wiki**: Komponen Workspace untuk membuat dan mengedit halaman dokumentasi berbasis rich-text.
- **Wiki Page**: Satu halaman dokumen dalam Wiki, berisi judul dan konten rich-text.
- **Project Board**: Komponen Workspace yang menampilkan Task Card dalam kolom-kolom Kanban.
- **Kanban Column**: Kolom bertahap dalam Project Board, terdiri dari: `To-Do`, `In Progress`, dan `Done`.
- **Task Card**: Kartu tugas dalam Project Board yang berisi judul, deskripsi, deadline, dan assignee.
- **Assignee**: Team Member yang ditunjuk bertanggung jawab atas suatu Task Card.
- **Visitor**: Pengguna yang belum login ke CollabFind.
- **Workspace_Access_Guard**: Mekanisme validasi sisi client yang memeriksa apakah pengguna yang login adalah Team Member dari proyek yang bersangkutan sebelum merender Workspace.
- **RLS_Policy**: Row-Level Security policy di Supabase yang mengontrol akses baca/tulis ke tabel-tabel workspace di sisi database.
- **Promotion_Card**: Komponen kartu promosi fitur Workspace yang ditampilkan di landing page untuk Visitor.
- **Preview_Modal**: Modal pop-up yang ditampilkan saat Visitor mengklik Promotion_Card, berisi animasi preview fitur dan CTA pendaftaran.
- **Supabase_Storage**: Layanan penyimpanan objek Supabase yang digunakan sebagai backend File Storage.

---

## Requirements


---

### Requirement 1: Akses Workspace oleh Team Member

**User Story:** Sebagai Team Member (Project Owner atau Collaborator yang diterima), saya ingin mengakses halaman Workspace proyek saya di dalam dashboard, sehingga saya dapat menggunakan semua tools kolaborasi yang tersedia.

#### Acceptance Criteria

1. WHEN seorang pengguna yang telah login mengunjungi halaman Workspace suatu proyek, THE Workspace_Access_Guard SHALL memverifikasi bahwa pengguna tersebut adalah Project Owner (`projects.creator_id = user.id`) atau memiliki entri di tabel `applications` dengan `project_id` yang cocok dan `status = 'accepted'` sebelum merender konten Workspace.
2. IF verifikasi Workspace_Access_Guard gagal (pengguna bukan Team Member), THEN THE Workspace_Access_Guard SHALL menampilkan halaman error 403 dengan pesan "Kamu tidak memiliki akses ke workspace ini" dan tautan untuk kembali ke `/dashboard`.
3. IF pengguna yang belum login mencoba mengakses URL halaman Workspace secara langsung, THEN THE Workspace_Access_Guard SHALL mengarahkan pengguna ke halaman `/login`.
4. WHEN seorang Team Member berhasil diverifikasi, THE Workspace SHALL menampilkan tiga tab navigasi: "File Storage", "Wiki", dan "Project Boards".
5. THE RLS_Policy SHALL memblokir semua operasi `SELECT`, `INSERT`, `UPDATE`, dan `DELETE` pada tabel-tabel workspace dari pengguna yang bukan Team Member dari proyek yang bersangkutan.

---

### Requirement 2: Promosi Workspace untuk Visitor

**User Story:** Sebagai Visitor (pengguna yang belum login), saya ingin melihat preview fitur Workspace di landing page, sehingga saya tertarik untuk mendaftar dan menggunakan fitur tersebut.

#### Acceptance Criteria

1. THE Promotion_Card SHALL ditampilkan di bagian fitur pada halaman landing page CollabFind, berisi judul, deskripsi singkat, dan ilustrasi fitur Workspace.
2. WHEN seorang Visitor mengklik Promotion_Card, THE Preview_Modal SHALL muncul dan menampilkan animasi atau preview visual dari ketiga komponen Workspace (File Storage, Wiki, Project Boards).
3. THE Preview_Modal SHALL menampilkan tombol CTA dengan teks "Kelola Projekmu Lebih Profesional, Daftar Sekarang (Gratis)" yang mengarahkan pengguna ke halaman `/register` saat diklik.
4. WHEN Preview_Modal ditampilkan, THE Preview_Modal SHALL dapat ditutup oleh Visitor dengan mengklik tombol tutup atau area di luar modal.
5. THE Promotion_Card dan THE Preview_Modal SHALL tidak menampilkan data workspace sungguhan milik proyek manapun.

---

### Requirement 3: File Storage — Upload Aset Proyek

**User Story:** Sebagai Team Member, saya ingin mengunggah berbagai jenis file aset proyek ke dalam File Storage, sehingga seluruh anggota tim dapat mengakses aset yang diperlukan di satu tempat.

#### Acceptance Criteria

1. WHEN seorang Team Member memilih file dan mengklik tombol upload, THE File_Storage SHALL mengunggah file tersebut ke Supabase_Storage di dalam bucket yang terisolasi per `project_id`.
2. THE File_Storage SHALL menerima file dengan ekstensi: `.jpg`, `.jpeg`, `.png`, `.gif`, `.svg`, `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx`, `.zip`, `.rar`, `.fig`, dan ekstensi kode sumber (`.js`, `.ts`, `.py`, `.html`, `.css`).
3. IF ukuran file yang diunggah melebihi 50 MB, THEN THE File_Storage SHALL menolak upload dan menampilkan pesan error "Ukuran file maksimal adalah 50 MB".
4. IF ekstensi file tidak termasuk dalam daftar yang diizinkan, THEN THE File_Storage SHALL menolak upload dan menampilkan pesan error "Tipe file tidak didukung".
5. WHEN upload berhasil, THE File_Storage SHALL menambahkan entri baru ke tabel `workspace_files` dengan kolom: `id`, `project_id`, `uploader_id`, `file_name`, `file_size`, `file_type`, `storage_path`, dan `created_at`.
6. WHEN upload sedang berlangsung, THE File_Storage SHALL menampilkan indikator progres upload kepada pengguna.

---

### Requirement 4: File Storage — Lihat dan Unduh Aset

**User Story:** Sebagai Team Member, saya ingin melihat daftar semua file yang telah diunggah dan mengunduhnya, sehingga saya dapat mengakses aset proyek kapan saja dibutuhkan.

#### Acceptance Criteria

1. WHEN seorang Team Member membuka tab "File Storage", THE File_Storage SHALL menampilkan daftar semua file yang terkait dengan `project_id` yang bersangkutan, diambil dari tabel `workspace_files`.
2. THE File_Storage SHALL menampilkan setiap file dengan informasi: nama file, tipe file (ikon sesuai ekstensi), ukuran file dalam format yang mudah dibaca (KB/MB), nama pengunggah, dan waktu upload.
3. WHEN seorang Team Member mengklik tombol unduh pada suatu file, THE File_Storage SHALL menghasilkan signed URL dari Supabase_Storage dan memulai proses unduhan file tersebut.
4. THE File_Storage SHALL menampilkan daftar file yang diurutkan berdasarkan waktu upload terbaru (descending).
5. IF tabel `workspace_files` tidak memiliki entri untuk `project_id` yang bersangkutan, THEN THE File_Storage SHALL menampilkan pesan "Belum ada file yang diunggah. Upload file pertamamu!" beserta tombol upload.

---

### Requirement 5: File Storage — Hapus File

**User Story:** Sebagai Team Member, saya ingin menghapus file yang sudah tidak relevan dari File Storage, sehingga penyimpanan tim tetap terorganisir.

#### Acceptance Criteria

1. WHEN seorang Team Member mengklik tombol hapus pada suatu file, THE File_Storage SHALL menampilkan dialog konfirmasi sebelum menjalankan penghapusan.
2. WHEN penghapusan dikonfirmasi oleh Team Member, THE File_Storage SHALL menghapus objek file dari Supabase_Storage dan menghapus entri yang bersesuaian dari tabel `workspace_files` secara bersamaan (atomik).
3. IF penghapusan dari Supabase_Storage atau dari tabel `workspace_files` gagal, THEN THE File_Storage SHALL menampilkan pesan error "Gagal menghapus file. Silakan coba lagi." dan memastikan tidak terjadi kondisi inkonsistensi (file terhapus di storage tetapi entri masih ada di tabel, atau sebaliknya).
4. WHILE proses penghapusan berlangsung, THE File_Storage SHALL menonaktifkan tombol hapus pada file tersebut untuk mencegah duplikasi permintaan.

---

### Requirement 6: Wiki — Buat dan Edit Halaman Dokumentasi

**User Story:** Sebagai Team Member, saya ingin membuat dan mengedit halaman dokumentasi di Wiki, sehingga pengetahuan dan panduan tim terdokumentasi dengan baik.

#### Acceptance Criteria

1. WHEN seorang Team Member mengklik tombol "Buat Halaman Baru" di tab Wiki, THE Wiki SHALL menampilkan form editor dengan field judul dan area konten rich-text.
2. THE Wiki SHALL mendukung pemformatan teks berikut di area rich-text: heading (H1, H2, H3), bold, italic, inline code, code block, ordered list, unordered list, dan hyperlink.
3. WHEN seorang Team Member menyimpan Wiki Page, THE Wiki SHALL menyimpan data ke tabel `workspace_wiki_pages` dengan kolom: `id`, `project_id`, `title`, `content` (format JSON atau HTML), `author_id`, `created_at`, dan `updated_at`.
4. IF judul Wiki Page kosong saat disimpan, THEN THE Wiki SHALL menolak penyimpanan dan menampilkan pesan validasi "Judul halaman tidak boleh kosong".
5. WHEN seorang Team Member mengklik tombol edit pada suatu Wiki Page, THE Wiki SHALL menampilkan konten halaman tersebut di dalam editor yang sama dan memperbarui kolom `updated_at` saat disimpan.
6. THE Wiki SHALL menampilkan daftar semua Wiki Page milik proyek di panel samping (sidebar), diurutkan berdasarkan waktu pembuatan.

---

### Requirement 7: Wiki — Hapus Halaman Dokumentasi

**User Story:** Sebagai Team Member, saya ingin menghapus halaman Wiki yang sudah tidak relevan, sehingga dokumentasi tim tetap bersih dan terkini.

#### Acceptance Criteria

1. WHEN seorang Team Member mengklik tombol hapus pada suatu Wiki Page, THE Wiki SHALL menampilkan dialog konfirmasi sebelum menjalankan penghapusan.
2. WHEN penghapusan dikonfirmasi, THE Wiki SHALL menghapus entri Wiki Page dari tabel `workspace_wiki_pages` dan memperbarui daftar halaman di sidebar secara instan.
3. IF penghapusan gagal karena error database, THEN THE Wiki SHALL menampilkan pesan error "Gagal menghapus halaman. Silakan coba lagi." tanpa mengubah daftar halaman yang ada.

---

### Requirement 8: Project Boards — Tampilan Kanban

**User Story:** Sebagai Team Member, saya ingin melihat papan Kanban proyek dengan kolom-kolom yang jelas, sehingga saya dapat memahami status pekerjaan tim secara keseluruhan sekilas.

#### Acceptance Criteria

1. WHEN seorang Team Member membuka tab "Project Boards", THE Project_Board SHALL menampilkan tiga kolom Kanban secara berdampingan: "To-Do", "In Progress", dan "Done".
2. THE Project_Board SHALL menampilkan setiap Task Card di dalam kolom yang sesuai berdasarkan nilai kolom `status` pada tabel `workspace_tasks`.
3. THE Project_Board SHALL menampilkan informasi berikut pada setiap Task Card: judul tugas, nama assignee (jika ada), dan deadline (jika ada).
4. IF tidak ada Task Card dalam suatu kolom Kanban, THEN THE Project_Board SHALL menampilkan placeholder teks "Belum ada tugas di sini" di dalam kolom tersebut.
5. THE Project_Board SHALL menampilkan jumlah total Task Card di setiap header kolom Kanban.

---

### Requirement 9: Project Boards — Buat Task Card

**User Story:** Sebagai Team Member, saya ingin membuat Task Card baru di Project Board, sehingga pekerjaan tim dapat dipecah menjadi tugas-tugas yang jelas dan terukur.

#### Acceptance Criteria

1. WHEN seorang Team Member mengklik tombol "Tambah Tugas" di salah satu kolom Kanban, THE Project_Board SHALL menampilkan form untuk mengisi detail Task Card baru.
2. THE Project_Board SHALL menerima input berikut saat pembuatan Task Card: judul tugas (wajib), deskripsi (opsional), deadline (opsional, format tanggal), dan assignee (opsional, dipilih dari daftar Team Member proyek).
3. IF judul tugas kosong saat form disimpan, THEN THE Project_Board SHALL menolak penyimpanan dan menampilkan pesan validasi "Judul tugas tidak boleh kosong".
4. WHEN form Task Card yang valid disimpan, THE Project_Board SHALL menyimpan data ke tabel `workspace_tasks` dengan kolom: `id`, `project_id`, `title`, `description`, `status` (default: `todo`), `assignee_id`, `deadline`, `created_by`, `created_at`, dan `updated_at`.
5. WHEN Task Card baru berhasil disimpan, THE Project_Board SHALL menampilkan kartu baru tersebut di kolom yang sesuai tanpa memuat ulang halaman penuh.

---

### Requirement 10: Project Boards — Pindahkan Task Card Antar Kolom

**User Story:** Sebagai Team Member, saya ingin memindahkan Task Card dari satu kolom ke kolom lain, sehingga status pekerjaan selalu mencerminkan kondisi terkini.

#### Acceptance Criteria

1. WHEN seorang Team Member memindahkan Task Card ke kolom yang berbeda (melalui mekanisme drag-and-drop atau tombol pindah), THE Project_Board SHALL memperbarui nilai kolom `status` pada tabel `workspace_tasks` dari nilai lama ke nilai kolom tujuan (`todo`, `in_progress`, atau `done`).
2. WHEN pemindahan Task Card berhasil, THE Project_Board SHALL menampilkan kartu di kolom tujuan secara instan (optimistic update) dan mengonfirmasi hasil dari database.
3. IF pemindahan Task Card gagal karena error database, THEN THE Project_Board SHALL mengembalikan Task Card ke posisi kolom semula dan menampilkan pesan error "Gagal memperbarui status tugas. Silakan coba lagi."

---

### Requirement 11: Project Boards — Edit dan Hapus Task Card

**User Story:** Sebagai Team Member, saya ingin mengedit detail Task Card atau menghapusnya jika sudah tidak relevan, sehingga data di papan tugas selalu akurat.

#### Acceptance Criteria

1. WHEN seorang Team Member mengklik suatu Task Card, THE Project_Board SHALL membuka panel detail atau modal yang menampilkan semua informasi Task Card dan tombol untuk mengedit setiap field.
2. WHEN perubahan pada Task Card disimpan, THE Project_Board SHALL memperbarui entri yang bersesuaian di tabel `workspace_tasks` dan memperbarui kolom `updated_at`.
3. WHEN seorang Team Member mengklik tombol hapus pada suatu Task Card dan mengonfirmasi, THE Project_Board SHALL menghapus entri dari tabel `workspace_tasks` dan menghilangkan kartu dari tampilan kolom Kanban.
4. IF penghapusan Task Card gagal karena error database, THEN THE Project_Board SHALL menampilkan pesan error "Gagal menghapus tugas. Silakan coba lagi." tanpa mengubah tampilan papan yang ada.

---

### Requirement 12: Keamanan Data Workspace via RLS

**User Story:** Sebagai Project Owner, saya ingin data workspace tim saya terlindungi dari akses oleh pengguna lain yang bukan anggota proyek, sehingga informasi sensitif proyek tetap aman.

#### Acceptance Criteria

1. THE RLS_Policy pada tabel `workspace_files` SHALL mengizinkan operasi `SELECT` hanya untuk pengguna yang merupakan Team Member dari `project_id` yang bersesuaian.
2. THE RLS_Policy pada tabel `workspace_wiki_pages` SHALL mengizinkan operasi `SELECT`, `INSERT`, `UPDATE`, dan `DELETE` hanya untuk pengguna yang merupakan Team Member dari `project_id` yang bersesuaian.
3. THE RLS_Policy pada tabel `workspace_tasks` SHALL mengizinkan operasi `SELECT`, `INSERT`, `UPDATE`, dan `DELETE` hanya untuk pengguna yang merupakan Team Member dari `project_id` yang bersesuaian.
4. THE RLS_Policy SHALL mendefinisikan "Team Member" sebagai pengguna yang `auth.uid() = projects.creator_id` ATAU terdapat baris di tabel `applications` di mana `applicant_id = auth.uid()` dan `project_id` cocok dan `status = 'accepted'`.
5. IF sebuah query database dikirimkan oleh pengguna yang bukan Team Member ke tabel-tabel workspace, THEN THE RLS_Policy SHALL mengembalikan hasil kosong atau error permission denied, tanpa mengekspos data apapun.

---

### Requirement 13: Navigasi Workspace di dalam Dashboard

**User Story:** Sebagai Team Member yang memiliki atau bergabung ke beberapa proyek, saya ingin dapat berpindah antar Workspace proyek yang berbeda dari dashboard, sehingga saya dapat mengelola semua proyek dalam satu antarmuka yang terpadu.

#### Acceptance Criteria

1. THE Dashboard SHALL menampilkan tautan atau tombol "Buka Workspace" pada setiap proyek di daftar "My Projects" milik pengguna yang memenuhi syarat akses (Project Owner atau Collaborator dengan status accepted).
2. WHEN seorang Team Member mengklik "Buka Workspace" pada suatu proyek, THE Dashboard SHALL mengarahkan pengguna ke halaman Workspace dengan rute `/dashboard/workspace/:project_id`.
3. THE Workspace SHALL menampilkan judul proyek yang sedang aktif di bagian header halaman agar pengguna selalu tahu sedang berada di workspace proyek mana.
4. WHEN seorang pengguna login memiliki lamaran dengan `status = 'accepted'` pada suatu proyek, THE Dashboard SHALL juga menampilkan tautan "Buka Workspace" di bagian "My Applications" untuk proyek tersebut.
