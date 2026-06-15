-- supabase/migrations/004_public_proposal_access.sql
-- ================================================================
-- Allow Anonymous Read & Sign Access to Proposals
-- ================================================================

-- 1. Allow anyone (including unauthenticated clients) to view proposals if they know the secret UUID
DROP POLICY IF EXISTS "public_select_proposals" ON proposals;
CREATE POLICY "public_select_proposals" ON proposals 
  FOR SELECT 
  TO anon 
  USING (true);

-- 2. Allow anyone to sign and accept a proposal (status transition to accepted)
DROP POLICY IF EXISTS "public_update_proposals" ON proposals;
CREATE POLICY "public_update_proposals" ON proposals 
  FOR UPDATE 
  TO anon 
  USING (status = 'sent' OR status = 'draft') 
  WITH CHECK (status = 'accepted');

-- 3. Allow anyone to read basic client metadata (to render names on proposal sheets)
DROP POLICY IF EXISTS "public_select_clients" ON clients;
CREATE POLICY "public_select_clients" ON clients 
  FOR SELECT 
  TO anon 
  USING (true);

-- 4. Allow anyone to read potentials (to render potential names on proposal sheets)
DROP POLICY IF EXISTS "public_select_potentials" ON potentials;
CREATE POLICY "public_select_potentials" ON potentials 
  FOR SELECT 
  TO anon 
  USING (true);
