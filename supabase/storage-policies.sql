-- Execute no SQL Editor do Supabase APÓS criar os buckets:
-- contracts, signatures, product-images

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
USING (bucket_id = 'contracts');

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
USING (bucket_id = 'signatures');
