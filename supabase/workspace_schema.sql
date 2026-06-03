-- ============================================================
-- Team Collaboration Workspace — Supabase Schema & RLS
-- Jalankan seluruh file ini di Supabase SQL Editor
-- ============================================================

-- ── 1. Tabel workspace_files ─────────────────────────────────
create table if not exists public.workspace_files (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  uploader_id  uuid not null references auth.users(id) on delete cascade,
  file_name    text not null,
  file_size    bigint not null,
  file_type    text not null,
  storage_path text not null,
  created_at   timestamptz not null default now()
);

-- ── 2. Tabel workspace_wiki_pages ────────────────────────────
create table if not exists public.workspace_wiki_pages (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title      text not null,
  content    text not null default '',
  author_id  uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── 3. Tabel workspace_tasks ─────────────────────────────────
create table if not exists public.workspace_tasks (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  title       text not null,
  description text,
  status      text not null default 'todo' check (status in ('todo','in_progress','done')),
  assignee_id uuid references auth.users(id) on delete set null,
  deadline    date,
  created_by  uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── 4. Storage bucket ────────────────────────────────────────
-- Buat bucket via Dashboard > Storage > New bucket
-- Name: workspace-files, Public: OFF

-- ── 5. Helper function: is_team_member ───────────────────────
create or replace function public.is_team_member(p_project_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.projects
    where id = p_project_id and creator_id = auth.uid()
  )
  or exists (
    select 1 from public.applications
    where project_id = p_project_id
      and applicant_id = auth.uid()
      and status = 'accepted'
  );
$$;

-- ── 6. Enable RLS ─────────────────────────────────────────────
alter table public.workspace_files      enable row level security;
alter table public.workspace_wiki_pages enable row level security;
alter table public.workspace_tasks      enable row level security;

-- ── 7. RLS Policies — workspace_files ────────────────────────
create policy "workspace_files: team member select"
  on public.workspace_files for select
  using (public.is_team_member(project_id));

create policy "workspace_files: team member insert"
  on public.workspace_files for insert
  with check (public.is_team_member(project_id));

create policy "workspace_files: team member delete"
  on public.workspace_files for delete
  using (public.is_team_member(project_id));

-- ── 8. RLS Policies — workspace_wiki_pages ───────────────────
create policy "wiki_pages: team member select"
  on public.workspace_wiki_pages for select
  using (public.is_team_member(project_id));

create policy "wiki_pages: team member insert"
  on public.workspace_wiki_pages for insert
  with check (public.is_team_member(project_id));

create policy "wiki_pages: team member update"
  on public.workspace_wiki_pages for update
  using (public.is_team_member(project_id));

create policy "wiki_pages: team member delete"
  on public.workspace_wiki_pages for delete
  using (public.is_team_member(project_id));

-- ── 9. RLS Policies — workspace_tasks ────────────────────────
create policy "workspace_tasks: team member select"
  on public.workspace_tasks for select
  using (public.is_team_member(project_id));

create policy "workspace_tasks: team member insert"
  on public.workspace_tasks for insert
  with check (public.is_team_member(project_id));

create policy "workspace_tasks: team member update"
  on public.workspace_tasks for update
  using (public.is_team_member(project_id));

create policy "workspace_tasks: team member delete"
  on public.workspace_tasks for delete
  using (public.is_team_member(project_id));

-- ── 10. Storage RLS (jalankan di SQL Editor) ─────────────────
-- Objects table di storage schema
create policy "storage workspace: team member upload"
  on storage.objects for insert
  with check (
    bucket_id = 'workspace-files'
    and public.is_team_member((storage.foldername(name))[1]::uuid)
  );

create policy "storage workspace: team member download"
  on storage.objects for select
  using (
    bucket_id = 'workspace-files'
    and public.is_team_member((storage.foldername(name))[1]::uuid)
  );

create policy "storage workspace: team member delete"
  on storage.objects for delete
  using (
    bucket_id = 'workspace-files'
    and public.is_team_member((storage.foldername(name))[1]::uuid)
  );
