-- ============================================================
-- Portfolio Generator — Supabase Schema & RLS
-- ============================================================

-- 1. Create user_portfolios table
CREATE TABLE IF NOT EXISTS public.user_portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  headline text,
  bio text,
  github_url text,
  linkedin_url text,
  website_url text,
  show_testimonials boolean DEFAULT true,
  featured_project_ids uuid[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- 2. Add status to projects table (if not exists)
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed'));

-- 3. Enable RLS
ALTER TABLE public.user_portfolios ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DROP POLICY IF EXISTS "user_portfolios: public read" ON public.user_portfolios;
CREATE POLICY "user_portfolios: public read"
  ON public.user_portfolios FOR SELECT USING (true);

DROP POLICY IF EXISTS "user_portfolios: owner insert" ON public.user_portfolios;
CREATE POLICY "user_portfolios: owner insert"
  ON public.user_portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_portfolios: owner update" ON public.user_portfolios;
CREATE POLICY "user_portfolios: owner update"
  ON public.user_portfolios FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_portfolios: owner delete" ON public.user_portfolios;
CREATE POLICY "user_portfolios: owner delete"
  ON public.user_portfolios FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Helper function or trigger for updated_at (optional but good practice)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_portfolios_updated_at ON public.user_portfolios;
CREATE TRIGGER update_user_portfolios_updated_at
BEFORE UPDATE ON public.user_portfolios
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- ============================================================
-- 6. Create user_testimonials table for recommendations
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewer_name text NOT NULL,
  reviewer_role text,
  reviewer_avatar text,
  content text NOT NULL,
  rating integer DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_verified boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS for user_testimonials
ALTER TABLE public.user_testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_testimonials: public read" ON public.user_testimonials;
CREATE POLICY "user_testimonials: public read"
  ON public.user_testimonials FOR SELECT USING (true);

DROP POLICY IF EXISTS "user_testimonials: owner insert" ON public.user_testimonials;
CREATE POLICY "user_testimonials: owner insert"
  ON public.user_testimonials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_testimonials: owner update" ON public.user_testimonials;
CREATE POLICY "user_testimonials: owner update"
  ON public.user_testimonials FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_testimonials: owner delete" ON public.user_testimonials;
CREATE POLICY "user_testimonials: owner delete"
  ON public.user_testimonials FOR DELETE
  USING (auth.uid() = user_id);

