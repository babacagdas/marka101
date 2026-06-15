-- supabase/migrations/003_add_new_crm_tables.sql
-- ================================================================
-- Deep Creative Additional CRM & Workspace Tables
-- ================================================================

-- 1. Teklifler (proposals)
DO $$ BEGIN
  CREATE TYPE proposal_status_type AS ENUM ('draft', 'sent', 'accepted', 'declined');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS proposals (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  potential_id UUID REFERENCES potentials(id) ON DELETE SET NULL,
  client_id    UUID REFERENCES clients(id) ON DELETE SET NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  value        NUMERIC(12, 2) DEFAULT 0.00,
  status       proposal_status_type NOT NULL DEFAULT 'draft',
  sent_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Finans / Gelir-Gider (finances)
DO $$ BEGIN
  CREATE TYPE finance_type AS ENUM ('income', 'expense');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE finance_status_type AS ENUM ('pending', 'paid', 'overdue');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS finances (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID REFERENCES clients(id) ON DELETE SET NULL,
  project_id  UUID REFERENCES projects(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  type        finance_type NOT NULL DEFAULT 'income',
  amount      NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  status      finance_status_type NOT NULL DEFAULT 'pending',
  due_date    DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Dokümanlar (documents)
DO $$ BEGIN
  CREATE TYPE document_category_type AS ENUM ('contract', 'brand_guide', 'brief', 'meeting_notes', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID REFERENCES clients(id) ON DELETE SET NULL,
  project_id  UUID REFERENCES projects(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  file_url    TEXT,
  category    document_category_type NOT NULL DEFAULT 'other',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Toplantılar (meetings)
CREATE TABLE IF NOT EXISTS meetings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID REFERENCES clients(id) ON DELETE SET NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  meeting_link TEXT,
  host_name    TEXT DEFAULT 'Elena Creative',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Otomasyonlar (automations)
CREATE TABLE IF NOT EXISTS automations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  trigger_event TEXT NOT NULL,
  action        TEXT NOT NULL,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Bildirimler (notifications)
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  content    TEXT,
  is_read    BOOLEAN DEFAULT FALSE,
  type       TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Ekip Üyeleri (team_members)
CREATE TABLE IF NOT EXISTS team_members (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  role         TEXT NOT NULL,
  email        TEXT UNIQUE NOT NULL,
  avatar_color TEXT DEFAULT 'from-[#4f20c0] to-[#b5179e]',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Policies for Authenticated Studio Users
DROP POLICY IF EXISTS "auth_all_proposals" ON proposals;
CREATE POLICY "auth_all_proposals" ON proposals FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_all_finances" ON finances;
CREATE POLICY "auth_all_finances" ON finances FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_all_documents" ON documents;
CREATE POLICY "auth_all_documents" ON documents FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_all_meetings" ON meetings;
CREATE POLICY "auth_all_meetings" ON meetings FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_all_automations" ON automations;
CREATE POLICY "auth_all_automations" ON automations FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_all_notifications" ON notifications;
CREATE POLICY "auth_all_notifications" ON notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_all_team_members" ON team_members;
CREATE POLICY "auth_all_team_members" ON team_members FOR ALL TO authenticated USING (true) WITH CHECK (true);
