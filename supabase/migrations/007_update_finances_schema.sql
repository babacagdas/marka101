-- supabase/migrations/007_update_finances_schema.sql
-- ================================================================
-- Deep Creative Finances Schema Updates
-- ================================================================

ALTER TABLE finances ADD COLUMN IF NOT EXISTS transaction_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE finances ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'single'; -- 'single', 'installment', 'recurring'
ALTER TABLE finances ADD COLUMN IF NOT EXISTS category_type TEXT DEFAULT 'general'; -- 'project_fee', 'consulting', 'software', 'freelancer', etc.
ALTER TABLE finances ADD COLUMN IF NOT EXISTS relation_type TEXT DEFAULT 'general'; -- 'brand', 'general', 'freelancer', 'project'
ALTER TABLE finances ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'bank_transfer'; -- 'bank_transfer', 'credit_card', 'cash', 'other'
ALTER TABLE finances ADD COLUMN IF NOT EXISTS invoice_status TEXT DEFAULT 'unknown'; -- 'unknown', 'invoiced', 'without_invoice'
ALTER TABLE finances ADD COLUMN IF NOT EXISTS vat_rate INTEGER DEFAULT 0;
ALTER TABLE finances ADD COLUMN IF NOT EXISTS invoice_no TEXT;
ALTER TABLE finances ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE finances ADD COLUMN IF NOT EXISTS notes TEXT;
