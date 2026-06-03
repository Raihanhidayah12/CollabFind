-- ============================================================
-- Profiles Table — RLS Policies
-- Jalankan di Supabase Dashboard > SQL Editor
-- ============================================================

-- Pastikan RLS aktif
alter table public.profiles enable row level security;

-- Izinkan semua user (termasuk anonymous) untuk READ profiles
-- Diperlukan untuk: Top Collaborators, UserMenu, Dashboard
create policy "profiles: public read"
  on public.profiles for select
  using (true);

-- Izinkan user untuk UPDATE profile miliknya sendiri
create policy "profiles: owner update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Izinkan user untuk INSERT profile miliknya sendiri (saat register)
create policy "profiles: owner insert"
  on public.profiles for insert
  with check (auth.uid() = id);
