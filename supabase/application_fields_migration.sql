-- Migration: Add portfolio_url, selected_skills, cv_url to applications table
-- Run this in Supabase SQL Editor

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS portfolio_url  text,
  ADD COLUMN IF NOT EXISTS selected_skills text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS cv_url         text,
  ADD COLUMN IF NOT EXISTS cv_file_name   text;

-- Allow storage bucket for CV uploads (run once)
-- Make sure bucket "cv-files" exists in Supabase Storage with private access.
-- The signed URL is generated on download.
