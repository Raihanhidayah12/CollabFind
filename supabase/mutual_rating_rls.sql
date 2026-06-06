-- ============================================================
-- Fix: Mutual Rating System - CORRECTED (no recursive policies)
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── STEP 1: Drop the broken recursive policy if it exists ──
DROP POLICY IF EXISTS "applications: collaborator read team" ON public.applications;
DROP POLICY IF EXISTS "applications: invitee read team" ON public.applications;

-- ── STEP 2: Fix the is_team_member helper to include invitees ──
-- (safe to call from other table policies since no self-reference)
CREATE OR REPLACE FUNCTION public.is_team_member(p_project_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects
    WHERE id::text = p_project_id::text 
      AND (creator_id::text = auth.uid()::text OR creator_id = auth.uid())
  )
  OR EXISTS (
    SELECT 1 FROM public.applications
    WHERE project_id::text = p_project_id::text
      AND applicant_id::text = auth.uid()::text
      AND status = 'accepted'
  )
  OR EXISTS (
    SELECT 1 FROM public.invitations
    WHERE project_id::text = p_project_id::text
      AND invitee_id::text = auth.uid()::text
      AND status = 'accepted'
  );
$$;

-- ── STEP 3: Add team member read policy for applications ──
-- Use is_team_member() with explicit uuid cast to avoid recursion (it references the table via SECURITY DEFINER)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'applications'
      AND policyname = 'applications: team member read'
  ) THEN
    CREATE POLICY "applications: team member read"
      ON public.applications FOR SELECT
      USING ( public.is_team_member(project_id::uuid) );
  END IF;
END $$;

-- ── STEP 3b: Add team member read policy for invitations ──
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'invitations'
      AND policyname = 'invitations: team member read'
  ) THEN
    CREATE POLICY "invitations: team member read"
      ON public.invitations FOR SELECT
      USING ( public.is_team_member(project_id::uuid) );
  END IF;
END $$;

-- ── STEP 4: user_ratings table (create if not exists) ─────────
CREATE TABLE IF NOT EXISTS public.user_ratings (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  rater_id   uuid not null references auth.users(id) on delete cascade,
  ratee_id   uuid not null references auth.users(id) on delete cascade,
  score      integer not null check (score between 0 and 100),
  feedback   text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, rater_id, ratee_id)
);

ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;

-- ── STEP 5: RLS for user_ratings ──────────────────────────────

-- Anyone can read ratings (for collaboration score display)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'user_ratings'
      AND policyname = 'ratings: public read'
  ) THEN
    CREATE POLICY "ratings: public read"
      ON public.user_ratings FOR SELECT
      USING (true);
  END IF;
END $$;

-- Team members can insert their own ratings (cannot rate themselves)
-- Uses project_id::text cast to handle text vs uuid type mismatch
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'user_ratings'
      AND policyname = 'ratings: team member insert'
  ) THEN
    CREATE POLICY "ratings: team member insert"
      ON public.user_ratings FOR INSERT
      WITH CHECK (
        auth.uid() = rater_id
        AND auth.uid() <> ratee_id
        AND public.is_team_member(project_id::uuid)
      );
  END IF;
END $$;

-- Team members can update their own submitted ratings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'user_ratings'
      AND policyname = 'ratings: rater update own'
  ) THEN
    CREATE POLICY "ratings: rater update own"
      ON public.user_ratings FOR UPDATE
      USING (auth.uid() = rater_id);
  END IF;
END $$;
