-- Execute no SQL Editor do Supabase (projeto já em produção)
ALTER TABLE contract_client_data
ADD COLUMN IF NOT EXISTS observacoes TEXT;
