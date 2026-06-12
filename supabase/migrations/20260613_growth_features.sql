-- Migration: Growth features (onboarding, referral, email notifications)
-- Run in Supabase SQL Editor

-- 1. New columns on profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code varchar(12) UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_badge varchar(30) DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_notifications jsonb DEFAULT '{"invitation":true,"milestone":true,"team":true}';

-- 2. Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(referrer_id, referred_id)
);

-- 3. Auto-generate referral code on profile creation
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := substr(md5(random()::text || NEW.id::text), 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_referral_code ON profiles;
CREATE TRIGGER trg_generate_referral_code
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION generate_referral_code();

-- 4. Enable RLS on referrals
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own referrals" ON referrals;
CREATE POLICY "Users can view their own referrals"
  ON referrals FOR SELECT
  USING (referrer_id = auth.uid() OR referred_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert referrals they initiated" ON referrals;
CREATE POLICY "Users can insert referrals they initiated"
  ON referrals FOR INSERT
  WITH CHECK (referrer_id = auth.uid());

-- 5. Index for referral lookups
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON profiles(referral_code);

-- 6. Backfill: generate codes for existing users who don't have one
UPDATE profiles
SET referral_code = substr(md5(random()::text || id::text), 1, 8)
WHERE referral_code IS NULL;
