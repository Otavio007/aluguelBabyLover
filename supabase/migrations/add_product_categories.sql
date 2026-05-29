-- Migration: seed default product categories in app_settings
-- Execute no Supabase Dashboard > SQL Editor (se ainda não tiver categorias salvas)

INSERT INTO app_settings (chave, valor)
VALUES (
  'product_categories',
  '["Carrinhos","Cadeirinhas","Brinquedos","Quarto","Banho"]'
)
ON CONFLICT (chave) DO NOTHING;
