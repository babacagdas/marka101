-- supabase/migrations/006_create_visual_library.sql
-- ================================================================
-- Deep Creative Visual Library Tables
-- ================================================================

CREATE TABLE IF NOT EXISTS visual_library (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id              UUID REFERENCES clients(id) ON DELETE SET NULL, -- NULL represents "Genel Arşiv"
  title                  TEXT NOT NULL,
  drive_link             TEXT NOT NULL,
  visual_type            TEXT NOT NULL DEFAULT 'logo', -- 'logo', 'social_media', 'website', 'advertisement', 'photo', 'video', 'presentation', 'other'
  service_type           TEXT NOT NULL DEFAULT 'general', -- 'general', 'campaign', 'branding', 'other'
  status                 TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'in_progress', 'review', 'completed'
  is_publish_candidate   BOOLEAN NOT NULL DEFAULT FALSE,
  is_client_visible      BOOLEAN NOT NULL DEFAULT FALSE,
  notes                  TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_visual_library_client_id ON visual_library(client_id);
CREATE INDEX IF NOT EXISTS idx_visual_library_visual_type ON visual_library(visual_type);
CREATE INDEX IF NOT EXISTS idx_visual_library_status ON visual_library(status);
CREATE INDEX IF NOT EXISTS idx_visual_library_is_publish_candidate ON visual_library(is_publish_candidate);
CREATE INDEX IF NOT EXISTS idx_visual_library_is_client_visible ON visual_library(is_client_visible);
CREATE INDEX IF NOT EXISTS idx_visual_library_created_at ON visual_library(created_at DESC);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_visual_library_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_visual_library_updated_at ON visual_library;
CREATE TRIGGER trg_visual_library_updated_at
  BEFORE UPDATE ON visual_library
  FOR EACH ROW EXECUTE FUNCTION update_visual_library_updated_at();

-- RLS
ALTER TABLE visual_library ENABLE ROW LEVEL SECURITY;

-- Policies for Authenticated Studio Users
DROP POLICY IF EXISTS "auth_all_visual_library" ON visual_library;
CREATE POLICY "auth_all_visual_library" ON visual_library FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow public read access (for anon clients if client-visible)
DROP POLICY IF EXISTS "public_select_visual_library" ON visual_library;
CREATE POLICY "public_select_visual_library" ON visual_library FOR SELECT TO anon USING (true);
