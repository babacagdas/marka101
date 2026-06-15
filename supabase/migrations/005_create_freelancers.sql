-- supabase/migrations/005_create_freelancers.sql
-- ================================================================
-- Deep Creative Freelancers & Suppliers Tables
-- ================================================================

CREATE TABLE IF NOT EXISTS freelancers (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_type            TEXT NOT NULL, -- 'freelancer', 'supplier', 'platform_software', 'production', 'team_support', 'other'
  name                   TEXT NOT NULL,
  expertise              TEXT,
  email                  TEXT,
  phone                  TEXT,
  status                 TEXT NOT NULL DEFAULT 'active', -- 'active', 'passive'
  note                   TEXT,
  iban                   TEXT,
  tax_no                 TEXT,
  company_type           TEXT,
  website                TEXT,
  social_link            TEXT,
  portfolio_link         TEXT,
  contract_link          TEXT,
  default_payment_method TEXT,
  average_project_fee    NUMERIC(12, 2) DEFAULT 0.00,
  currency               TEXT DEFAULT 'TRY',
  is_favorite            BOOLEAN DEFAULT FALSE,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indeksler
CREATE INDEX IF NOT EXISTS idx_freelancers_record_type ON freelancers(record_type);
CREATE INDEX IF NOT EXISTS idx_freelancers_status      ON freelancers(status);
CREATE INDEX IF NOT EXISTS idx_freelancers_is_favorite  ON freelancers(is_favorite);
CREATE INDEX IF NOT EXISTS idx_freelancers_created_at  ON freelancers(created_at DESC);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_freelancers_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_freelancers_updated_at ON freelancers;
CREATE TRIGGER trg_freelancers_updated_at
  BEFORE UPDATE ON freelancers
  FOR EACH ROW EXECUTE FUNCTION update_freelancers_updated_at();

-- RLS
ALTER TABLE freelancers ENABLE ROW LEVEL SECURITY;

-- Policies for Authenticated Studio Users
DROP POLICY IF EXISTS "auth_all_freelancers" ON freelancers;
CREATE POLICY "auth_all_freelancers" ON freelancers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow public read access (anon)
DROP POLICY IF EXISTS "public_select_freelancers" ON freelancers;
CREATE POLICY "public_select_freelancers" ON freelancers FOR SELECT TO anon USING (true);
