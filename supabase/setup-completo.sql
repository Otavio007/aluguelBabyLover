-- =============================================================================
-- SETUP COMPLETO SUPABASE — execute UMA VEZ no SQL Editor (ordem correta)
-- Corrige: "Permissão negada" ao finalizar aluguel (Storage + INSERT)
-- =============================================================================

-- 1) Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('signatures', 'signatures', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]),
  ('contracts', 'contracts', true, 20971520, ARRAY['application/pdf']::text[]),
  ('product-images', 'product-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2) Coluna observações
ALTER TABLE contract_client_data
ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- 3) RLS tabelas — INSERT público (site sem login)
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_client_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Create Reservation" ON reservations;
CREATE POLICY "Public Create Reservation"
  ON reservations FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Public Create Contract" ON contracts;
CREATE POLICY "Public Create Contract"
  ON contracts FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Public Create Client Data" ON contract_client_data;
CREATE POLICY "Public Create Client Data"
  ON contract_client_data FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Reservation Dates" ON reservations;
CREATE POLICY "Public Read Reservation Dates"
  ON reservations FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Admin Read Reservations" ON reservations;
CREATE POLICY "Admin Read Reservations"
  ON reservations FOR SELECT TO authenticated
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Read Contracts" ON contracts;
CREATE POLICY "Admin Read Contracts"
  ON contracts FOR SELECT TO authenticated
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Read Client Data" ON contract_client_data;
CREATE POLICY "Admin Read Client Data"
  ON contract_client_data FOR SELECT TO authenticated
  USING (auth.role() = 'authenticated');

-- 4) Storage — políticas amplas para upload (foto + PDF)
DROP POLICY IF EXISTS "Public read contracts bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public upload contracts bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public update contracts bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public read signatures bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public upload signatures bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public update signatures bucket" ON storage.objects;
DROP POLICY IF EXISTS "product_images_all_anon" ON storage.objects;
DROP POLICY IF EXISTS "signatures_all_anon" ON storage.objects;
DROP POLICY IF EXISTS "contracts_all_anon" ON storage.objects;

CREATE POLICY "signatures_all_anon"
  ON storage.objects FOR ALL
  TO anon, authenticated, public
  USING (bucket_id = 'signatures')
  WITH CHECK (bucket_id = 'signatures');

CREATE POLICY "contracts_all_anon"
  ON storage.objects FOR ALL
  TO anon, authenticated, public
  USING (bucket_id = 'contracts')
  WITH CHECK (bucket_id = 'contracts');

CREATE POLICY "product_images_all_anon"
  ON storage.objects FOR ALL
  TO anon, authenticated, public
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');
