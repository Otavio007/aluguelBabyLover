-- Create tables for AluguelBabyLover

-- 1. PRODUCTS
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT,
  imagem TEXT,
  valor DECIMAL(10,2) NOT NULL,
  marca TEXT,
  estado_conservacao TEXT,
  quantidade INTEGER DEFAULT 1,
  tipo_cobranca TEXT DEFAULT 'Dia' CHECK (tipo_cobranca IN ('Hora', 'Dia', 'Semana')),
  ativo BOOLEAN DEFAULT true,
  regras_uso TEXT,
  devolucao_dias TEXT,
  entrega_hora_inicio TEXT,
  entrega_hora_fim TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. RESERVATIONS
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  cliente_nome TEXT NOT NULL,
  cliente_cpf TEXT NOT NULL,
  cliente_telefone TEXT NOT NULL,
  retirada_data DATE NOT NULL,
  retirada_hora TIME NOT NULL,
  devolucao_data DATE NOT NULL,
  devolucao_hora TIME NOT NULL,
  status TEXT DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Confirmado', 'Em andamento', 'Finalizado', 'Cancelado')),
  valor_total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CONTRACTS
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
  pdf_url TEXT,
  assinatura_url TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CONTRACT_CLIENT_DATA
CREATE TABLE contract_client_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL,
  rg TEXT,
  endereco TEXT NOT NULL,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  cep TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_client_data ENABLE ROW LEVEL SECURITY;

-- Public access policies
CREATE POLICY "Public Read Access" ON products FOR SELECT USING (true);

-- Admin access policies (requires auth)
CREATE POLICY "Admin Insert Access" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin Update Access" ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Delete Access" ON products FOR DELETE USING (auth.role() = 'authenticated');

-- Reservations & Contracts: Public can create, but only Admin can see all
CREATE POLICY "Public Create Reservation" ON reservations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin Read Reservations" ON reservations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Update Reservations" ON reservations FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Public Create Contract" ON contracts FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin Read Contracts" ON contracts FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Public Create Client Data" ON contract_client_data FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin Read Client Data" ON contract_client_data FOR SELECT USING (auth.role() = 'authenticated');

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_products_categoria ON products(categoria);
CREATE INDEX idx_reservations_cliente_cpf ON reservations(cliente_cpf);
CREATE INDEX idx_reservations_cliente_telefone ON reservations(cliente_telefone);
CREATE INDEX idx_contracts_reservation_id ON contracts(reservation_id);

-- Storage policies (execute after creating buckets: contracts, signatures, product-images)
-- No Supabase Dashboard: Storage > New bucket > marque "Public bucket" ou use as políticas abaixo.

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
