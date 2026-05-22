-- Preferir executar: supabase/fix-permissions.sql (inclui tabelas + storage)
-- Execute APÓS criar os buckets: contracts, signatures, product-images

DROP POLICY IF EXISTS "Public read contracts bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public upload contracts bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public update contracts bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public read signatures bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public upload signatures bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public update signatures bucket" ON storage.objects;

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
