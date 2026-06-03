-- ============================================================
-- Rating System Schema - CollabFind
-- ============================================================

create table public.user_ratings (
  id uuid primary key default gen_random_uuid(),
  project_id text not null references public.projects(id) on delete cascade,
  rater_id uuid not null references auth.users(id) on delete cascade,
  ratee_id uuid not null references auth.users(id) on delete cascade,
  score integer not null check (score >= 0 and score <= 100),
  feedback text,
  created_at timestamptz default now(),
  
  -- Prevent multiple ratings by the same user to the same ratee in a single project
  unique (project_id, rater_id, ratee_id),
  
  -- Prevent self-rating
  check (rater_id != ratee_id)
);

-- Index for fast lookups
create index user_ratings_ratee_idx on public.user_ratings(ratee_id);
create index user_ratings_project_idx on public.user_ratings(project_id);

-- Enable RLS
alter table public.user_ratings enable row level security;

-- Policies

-- 1. Anyone can read ratings (for public profile and dashboard calculations)
create policy "ratings: public read"
  on public.user_ratings for select
  using (true);

-- 2. Authenticated users can insert if they are a collaborator (or owner) on the project
create policy "ratings: auth insert"
  on public.user_ratings for insert
  with check (
    auth.uid() = rater_id 
    and (
      -- rater is a collaborator (accepted applicant)
      exists (select 1 from public.applications where project_id = user_ratings.project_id and applicant_id = auth.uid() and status = 'accepted')
      or 
      -- rater is the owner
      exists (select 1 from public.projects where id = user_ratings.project_id and creator_id = auth.uid())
    )
    and (
      -- ratee is a collaborator (accepted applicant)
      exists (select 1 from public.applications where project_id = user_ratings.project_id and applicant_id = ratee_id and status = 'accepted')
      or
      -- ratee is the owner
      exists (select 1 from public.projects where id = user_ratings.project_id and creator_id = ratee_id)
    )
  );

-- 3. Users can update their own ratings
create policy "ratings: self update"
  on public.user_ratings for update
  using (auth.uid() = rater_id);

-- 4. Users can delete their own ratings
create policy "ratings: self delete"
  on public.user_ratings for delete
  using (auth.uid() = rater_id);
