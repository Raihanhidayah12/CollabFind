# TODO - Invite Collaborators Notification Implementation

## Task Understanding
Fitur "Invite Collaborators (optional)" di CreateProject.jsx - user input email untuk undang collaborator.

**Yang dibutuhkan:**
1. Input email di CreateProject (comma-separated)
2. Cek apakah email SUDAH REGISTER di CollabFind
3. Kalau SUDAH:
   - Kirim notification ke user tsb muncul di "Rekomendasi Rekan Tim"
   - Kirim DM invite juga
4. Kalau BELUM:
   - Simpan ke table project_collaborators untuk tracking dengan status 'invited'

## Implementation Status

### Step 1: DONE - CreateProject.jsx
- Simpan semua undangan ke `project_collaborators` berdasarkan email (batch insert)
- Tidak lagi menggunakan `admin.listUsers()` yang gagal dengan anon key

### Step 2: DONE - Dashboard.jsx - Invitation Conversion & Display
- Konversi otomatis: saat user login, cek `project_collaborators` yang email-nya cocok → buat `invitations` record → update status ke 'converted'
- Pending invitations ditampilkan di tab "Rekomendasi Rekan Tim" dengan badge "Undangan"
- Tombol Accept/Decline berfungsi tanpa reload halaman

### Step 3: DONE - Real-time Notifications
- Subscription invitations INSERT ditangani oleh `NotificationMenu.jsx`
- Toast muncul saat menerima undangan baru
- Duplikasi subscription dari `useRealtimeNotifications.js` sudah dihapus

### Step 4: DONE - NotificationMenu.jsx
- Dropdown notification bell fetch pending invitations dari DB
- Undangan ditampilkan dengan ikon UserPlus dan link ke halaman `/invite/:id`

## Security Fixes Applied
- `.env` ditambahkan ke `.gitignore` dan di-untrack dari git
- `supabase.auth.admin.listUsers()` diganti dengan pendekatan `project_collaborators`
- Duplikasi real-time subscription dihapus (mencegah toast ganda)

## Files Updated:
- `.gitignore` - tambah .env entries
- `src/pages/CreateProject.jsx` - fix admin API, gunakan project_collaborators
- `src/pages/Dashboard.jsx` - invitation conversion, fix decline tanpa reload
- `src/components/NotificationMenu.jsx` - fetch invitations di dropdown
- `src/hooks/useRealtimeNotifications.js` - hapus duplikasi subscription

## Status: COMPLETE
