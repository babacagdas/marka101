-- supabase/migrations/008_link_modules_relations.sql
-- ================================================================
-- Link Visual Library and Finances to Projects and Freelancers
-- ================================================================

-- 1. Link Visual Library to Projects
ALTER TABLE visual_library ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_visual_library_project_id ON visual_library(project_id);

-- 2. Link Finances to Freelancers
ALTER TABLE finances ADD COLUMN IF NOT EXISTS freelancer_id UUID REFERENCES freelancers(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_finances_freelancer_id ON finances(freelancer_id);
