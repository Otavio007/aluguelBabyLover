-- =============================================================================
-- CORRIGIR PERMISSÃO NEGADA — execute TUDO no SQL Editor do Supabase
-- =============================================================================
-- Antes: crie os buckets em Storage (se ainda não existirem):
--   • signatures  (público recomendado)
--   • contracts   (público recomendado)
--   • product-images
-- =============================================================================

-- ----- 1. INSERT nas tabelas (site usa chave anon, sem login) -----

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_client_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Create Reservation" ON reservations;
CREATE POLICY "Public Create Reservation"
  ON reservations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public Create Contract" ON contracts;
CREATE POLICY "Public Create Contract"
  ON contracts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public Create Client Data" ON contract_client_data;
CREATE POLICY "Public Create Client Data"
  ON contract_client_data FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Público pode ler datas de reserva para verificar disponibilidade no calendário
DROP POLICY IF EXISTS "Public Read Reservation Dates" ON reservations;
CREATE POLICY "Public Read Reservation Dates"
  ON reservations FOR SELECT
  TO anon
  USING (true);

-- Admin continua podendo ler tudo (painel logado)
DROP POLICY IF EXISTS "Admin Read Reservations" ON reservations;
CREATE POLICY "Admin Read Reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Read Contracts" ON contracts;
CREATE POLICY "Admin Read Contracts"
  ON contracts FOR SELECT
  TO authenticated
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Read Client Data" ON contract_client_data;
CREATE POLICY "Admin Read Client Data"
  ON contract_client_data FOR SELECT
  TO authenticated
  USING (auth.role() = 'authenticated');

-- Coluna observações (se ainda não existir)
ALTER TABLE contract_client_data
ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- ----- 2. Storage — upload de foto do documento e PDF -----

DROP POLICY IF EXISTS "Public read contracts bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public upload contracts bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public update contracts bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public read signatures bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public upload signatures bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public update signatures bucket" ON storage.objects;
DROP POLICY IF EXISTS "Anon all signatures bucket" ON storage.objects;
DROP POLICY IF EXISTS "Anon all contracts bucket" ON storage.objects;

-- Bucket: signatures (foto do documento)
CREATE POLICY "Public read signatures bucket"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'signatures');

CREATE POLICY "Public upload signatures bucket"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'signatures');

CREATE POLICY "Public update signatures bucket"
  ON storage.objects FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'signatures')
  WITH CHECK (bucket_id = 'signatures');

-- Bucket: contracts (PDF do contrato)
CREATE POLICY "Public read contracts bucket"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'contracts');

CREATE POLICY "Public upload contracts bucket"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'contracts');

CREATE POLICY "Public update contracts bucket"
  ON storage.objects FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'contracts')
  WITH CHECK (bucket_id = 'contracts');
