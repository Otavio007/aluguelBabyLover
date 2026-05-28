-- Adiciona suporte a alugar mais de uma unidade por reserva
ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS quantidade INTEGER NOT NULL DEFAULT 1 CHECK (quantidade >= 1);
