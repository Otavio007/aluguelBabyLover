-- =============================================================================
-- Criar buckets de Storage no Supabase
-- Execute no SQL Editor, depois rode: supabase/fix-permissions.sql
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'signatures',
    'signatures',
    true,
    10485760, -- 10 MB (fotos de documento)
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
  ),
  (
    'contracts',
    'contracts',
    true,
    20971520, -- 20 MB (PDFs)
    ARRAY['application/pdf']::text[]
  ),
  (
    'product-images',
    'product-images',
    true,
    10485760, -- 10 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
