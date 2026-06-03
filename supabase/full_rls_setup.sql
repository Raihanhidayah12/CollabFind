-- ============================================================
-- Full RLS Setup — jalankan di Supabase SQL Editor
-- Kalau error "policy already exists", skip bagian itu
-- ============================================================

-- ── 1. Tambah kolom yang kurang di projects ───────────────
alter table public.projects
  add column if not exists category     text,
  add column if not exists max_members  integer default 4,
  add column if not exists is_featured  boolean default false,
  add column if not exists accent_color text    default '#3B82F6';

-- ── 2. RLS projects ───────────────────────────────────────
alter table public.projects enable row level security;

create policy "projects: public read"
  on public.projects for select using (true);

create policy "projects: auth insert"
  on public.projects for insert
  with check (auth.uid() = creator_id);

create policy "projects: owner update"
  on public.projects for update
  using (auth.uid() = creator_id);

create policy "projects: owner delete"
  on public.projects for delete
  using (auth.uid() = creator_id);

-- ── 3. RLS profiles ───────────────────────────────────────
alter table public.profiles enable row level security;

create policy "profiles: public read"
  on public.profiles for select using (true);

create policy "profiles: owner update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles: owner insert"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ── 4. RLS applications ───────────────────────────────────
alter table public.applications enable row level security;

create policy "applications: owner read"
  on public.applications for select
  using (auth.uid() = applicant_id);

create policy "applications: project creator read"
  on public.applications for select
  using (
    exists (
      select 1 from public.projects
      where id = project_id and creator_id = auth.uid()
    )
  );

create policy "applications: owner insert"
  on public.applications for insert
  with check (auth.uid() = applicant_id);

-- ── 5. RLS workspace_files ────────────────────────────────
alter table public.workspace_files enable row level security;

create policy "workspace_files: team select"
  on public.workspace_files for select
  using (public.is_team_member(project_id));

create policy "workspace_files: team insert"
  on public.workspace_files for insert
  with check (public.is_team_member(project_id));

create policy "workspace_files: team delete"
  on public.workspace_files for delete
  using (public.is_team_member(project_id));

-- ── 6. RLS workspace_wiki_pages ───────────────────────────
alter table public.workspace_wiki_pages enable row level security;

create policy "wiki: team select"
  on public.workspace_wiki_pages for select
  using (public.is_team_member(project_id));

create policy "wiki: team insert"
  on public.workspace_wiki_pages for insert
  with check (public.is_team_member(project_id));

create policy "wiki: team update"
  on public.workspace_wiki_pages for update
  using (public.is_team_member(project_id));

create policy "wiki: team delete"
  on public.workspace_wiki_pages for delete
  using (public.is_team_member(project_id));

-- ── 7. RLS workspace_tasks ────────────────────────────────
alter table public.workspace_tasks enable row level security;

create policy "tasks: team select"
  on public.workspace_tasks for select
  using (public.is_team_member(project_id));

create policy "tasks: team insert"
  on public.workspace_tasks for insert
  with check (public.is_team_member(project_id));

create policy "tasks: team update"
  on public.workspace_tasks for update
  using (public.is_team_member(project_id));

create policy "tasks: team delete"
  on public.workspace_tasks for delete
  using (public.is_team_member(project_id));
