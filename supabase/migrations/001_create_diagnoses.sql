-- ================================================================
-- 001_create_diagnoses.sql
-- Deep Creative Marka101 — Ana teşhis tablosu
--
-- Veri ayrımı:
--   public_submission  → markanın doldurduğu ham veriler
--   internal_analysis  → ajansın iç analizi (studio only)
--   scores_*           → hesaplanmış skorlar (studio only)
--   system_output      → Claude çıktısı (studio only)
-- ================================================================

DROP TABLE IF EXISTS diagnoses CASCADE;

DO $$ BEGIN
  CREATE TYPE diagnosis_status AS ENUM (
    'new', 'in_review', 'analyzed', 'output_ready', 'completed', 'archived'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE diagnosis_source AS ENUM ('public_form', 'manual');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS diagnoses (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status                   diagnosis_status NOT NULL DEFAULT 'new',
  source                   diagnosis_source NOT NULL DEFAULT 'public_form',

  -- Public taraftan gelen iletişim bilgileri
  brand_name               TEXT NOT NULL,
  submitted_email          TEXT,
  submitted_phone          TEXT,
  submitted_contact_name   TEXT,
  submitted_at             TIMESTAMPTZ,

  -- Markanın public formda doldurduğu ham cevaplar
  public_submission        JSONB,

  -- Ajans iç analizi (studio tarafı yazar, public asla görmez)
  reviewed_by              UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  internal_analysis        JSONB NOT NULL DEFAULT '{}',
  scores_detail            JSONB NOT NULL DEFAULT '{}',

  -- Hesaplanmış özet skorlar (0–10)
  overall_health_score     NUMERIC(4,1) CHECK (overall_health_score    IS NULL OR overall_health_score    BETWEEN 0 AND 10),
  lead_quality_score       NUMERIC(4,1) CHECK (lead_quality_score      IS NULL OR lead_quality_score      BETWEEN 0 AND 10),
  sales_readiness_score    NUMERIC(4,1) CHECK (sales_readiness_score   IS NULL OR sales_readiness_score   BETWEEN 0 AND 10),
  premium_potential_score  NUMERIC(4,1) CHECK (premium_potential_score IS NULL OR premium_potential_score BETWEEN 0 AND 10),
  creative_potential_score NUMERIC(4,1) CHECK (creative_potential_score IS NULL OR creative_potential_score BETWEEN 0 AND 10),
  offer_potential_score    NUMERIC(4,1) CHECK (offer_potential_score   IS NULL OR offer_potential_score   BETWEEN 0 AND 10),
  risk_level               TEXT CHECK (risk_level IS NULL OR risk_level IN ('low','medium','high','critical')),

  -- Manuel override
  scores_override          JSONB,
  scores_override_note     TEXT,
  scores_overridden_at     TIMESTAMPTZ,

  -- Claude / sistem çıktısı
  system_output            JSONB,

  -- Studio analiz wizard ilerleme
  analysis_completed_steps INTEGER[] NOT NULL DEFAULT '{}',
  analysis_current_step    INTEGER   NOT NULL DEFAULT 1
    CHECK (analysis_current_step BETWEEN 1 AND 9),

  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_diagnoses_status     ON diagnoses(status);
CREATE INDEX IF NOT EXISTS idx_diagnoses_source     ON diagnoses(source);
CREATE INDEX IF NOT EXISTS idx_diagnoses_created_at ON diagnoses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diagnoses_brand_fts
  ON diagnoses USING gin(to_tsvector('simple', brand_name));

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_diagnoses_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_diagnoses_updated_at ON diagnoses;
CREATE TRIGGER trg_diagnoses_updated_at
  BEFORE UPDATE ON diagnoses
  FOR EACH ROW EXECUTE FUNCTION update_diagnoses_updated_at();

-- RLS
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;

-- Anonim kullanıcı yalnızca public form başvurusu ekleyebilir.
-- Studio-only alanlara (skor, analiz, output, override) asla veri yazamaz.
DROP POLICY IF EXISTS "anon_public_submit" ON diagnoses;
CREATE POLICY "anon_public_submit" ON diagnoses
  FOR INSERT TO anon
  WITH CHECK (
    source = 'public_form'
    AND reviewed_by           IS NULL
    AND (internal_analysis     = '{}'::jsonb OR internal_analysis     IS NULL)
    AND (scores_detail         = '{}'::jsonb OR scores_detail         IS NULL)
    AND overall_health_score  IS NULL
    AND lead_quality_score    IS NULL
    AND sales_readiness_score IS NULL
    AND premium_potential_score  IS NULL
    AND creative_potential_score IS NULL
    AND offer_potential_score    IS NULL
    AND risk_level            IS NULL
    AND scores_override       IS NULL
    AND scores_override_note  IS NULL
    AND scores_overridden_at  IS NULL
    AND system_output         IS NULL
  );

-- Anonim kullanıcılar da okuyabilmeli (RETURNING clause ve sonuç sayfası için)
DROP POLICY IF EXISTS "anon_select_all" ON diagnoses;
CREATE POLICY "anon_select_all" ON diagnoses
  FOR SELECT TO anon
  USING (true);

-- Oturum açmış kullanıcılar her şeyi okuyabilir
DROP POLICY IF EXISTS "auth_select_all" ON diagnoses;
CREATE POLICY "auth_select_all" ON diagnoses
  FOR SELECT TO authenticated
  USING (true);

-- Oturum açmış kullanıcılar kayıt ekleyebilir (manuel)
DROP POLICY IF EXISTS "auth_insert_all" ON diagnoses;
CREATE POLICY "auth_insert_all" ON diagnoses
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Oturum açmış kullanıcılar güncelleyebilir
DROP POLICY IF EXISTS "auth_update_all" ON diagnoses;
CREATE POLICY "auth_update_all" ON diagnoses
  FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

-- Oturum açmış kullanıcılar silebilir
DROP POLICY IF EXISTS "auth_delete_all" ON diagnoses;
CREATE POLICY "auth_delete_all" ON diagnoses
  FOR DELETE TO authenticated
  USING (true);
