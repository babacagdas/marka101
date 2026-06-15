-- supabase/migrations/010_create_activity_logs.sql
-- ================================================================
-- Deep Creative Activity Logs Table
-- ================================================================

CREATE TABLE IF NOT EXISTS activity_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name   TEXT NOT NULL,
  user_email  TEXT NOT NULL,
  action_type TEXT NOT NULL, -- 'freelancer_add', 'task_assign', 'payment_made', 'brand_delete', etc.
  description TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type ON activity_logs(action_type);

-- Row Level Security (RLS)
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Policies for Authenticated Studio Users
DROP POLICY IF EXISTS "auth_all_activity_logs" ON activity_logs;
CREATE POLICY "auth_all_activity_logs" ON activity_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
