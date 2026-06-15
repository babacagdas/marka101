-- supabase/migrations/002_create_crm_tables.sql
-- ================================================================
-- Deep Creative CRM & Workspace Tables
-- ================================================================

-- 1. Potansiyel Müşteriler (potentials)
DO $$ BEGIN
  CREATE TYPE potential_stage AS ENUM ('initial', 'meeting', 'proposal', 'won', 'lost');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS potentials (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnosis_id UUID REFERENCES diagnoses(id) ON DELETE SET NULL,
  brand_name   TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  stage        potential_stage NOT NULL DEFAULT 'initial',
  value        TEXT,
  notes        TEXT[] DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Müşteriler (clients)
DO $$ BEGIN
  CREATE TYPE contract_status_type AS ENUM ('active', 'expiring', 'pending_renewal');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS clients (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name   TEXT NOT NULL,
  logo_text      TEXT NOT NULL,
  domain         TEXT,
  contract_date  TEXT,
  services       TEXT[] DEFAULT '{}',
  contract_value TEXT,
  contract_status contract_status_type NOT NULL DEFAULT 'active',
  history        JSONB DEFAULT '[]'::jsonb,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Projeler (projects)
DO $$ BEGIN
  CREATE TYPE project_category_type AS ENUM ('website', 'marka', 'sosyalmedya', 'reklam');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE project_status_type AS ENUM ('planning', 'in_progress', 'review', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS projects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID REFERENCES clients(id) ON DELETE SET NULL,
  name         TEXT NOT NULL,
  client_name  TEXT NOT NULL,
  category     project_category_type NOT NULL DEFAULT 'website',
  progress     INTEGER DEFAULT 0,
  status       project_status_type NOT NULL DEFAULT 'planning',
  budget       TEXT,
  deadline     TEXT,
  tasks_done   INTEGER DEFAULT 0,
  tasks_total  INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Görevler (tasks)
DO $$ BEGIN
  CREATE TYPE task_priority_type AS ENUM ('low', 'medium', 'high');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE task_status_type AS ENUM ('todo', 'in_progress', 'done');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS tasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  project_name TEXT NOT NULL,
  assignee     JSONB NOT NULL DEFAULT '{}'::jsonb,
  deadline     TEXT,
  priority     task_priority_type NOT NULL DEFAULT 'medium',
  status       task_status_type NOT NULL DEFAULT 'todo',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Briefler (briefs)
DO $$ BEGIN
  CREATE TYPE brief_category_type AS ENUM ('marka', 'website', 'tasarim', 'icerik');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS briefs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  client_name TEXT NOT NULL,
  category    brief_category_type NOT NULL DEFAULT 'website',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  summary     TEXT,
  details     JSONB DEFAULT '[]'::jsonb
);

-- 6. Bilgi Bankası (knowledge_base)
DO $$ BEGIN
  CREATE TYPE kb_category_type AS ENUM ('onboarding', 'design', 'guides', 'contracts');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS knowledge_base (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  category    kb_category_type NOT NULL DEFAULT 'onboarding',
  updated_at  TEXT,
  summary     TEXT,
  content     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE potentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "auth_all_potentials" ON potentials;
CREATE POLICY "auth_all_potentials" ON potentials FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_all_clients" ON clients;
CREATE POLICY "auth_all_clients" ON clients FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_all_projects" ON projects;
CREATE POLICY "auth_all_projects" ON projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_all_tasks" ON tasks;
CREATE POLICY "auth_all_tasks" ON tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_all_briefs" ON briefs;
CREATE POLICY "auth_all_briefs" ON briefs FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_all_kb" ON knowledge_base;
CREATE POLICY "auth_all_kb" ON knowledge_base FOR ALL TO authenticated USING (true) WITH CHECK (true);
