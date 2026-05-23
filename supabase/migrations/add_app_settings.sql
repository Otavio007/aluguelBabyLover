-- Migration: add_app_settings
-- Execute este SQL no Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave TEXT NOT NULL UNIQUE,
  valor TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Leitura pública (Footer lê sem autenticação)
CREATE POLICY "Public Read app_settings"
  ON app_settings FOR SELECT
  USING (true);

-- Apenas admin autenticado pode criar/editar/deletar
CREATE POLICY "Admin Insert app_settings"
  ON app_settings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin Update app_settings"
  ON app_settings FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin Delete app_settings"
  ON app_settings FOR DELETE
  USING (auth.role() = 'authenticated');

-- Trigger para updated_at automático
CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
