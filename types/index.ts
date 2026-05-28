export interface Product {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  imagem: string;
  valor: number;
  tipo_cobranca: 'Hora' | 'Dia' | 'Semana';
  marca: string;
  estado_conservacao: string;
  quantidade: number;
  ativo: boolean;
  regras_uso?: string;
  devolucao_dias?: string;
  entrega_hora_inicio?: string;
  entrega_hora_fim?: string;
  created_at: string;
  updated_at: string;
}

export type ReservationStatus = 'Pendente' | 'Confirmado' | 'Em andamento' | 'Finalizado' | 'Cancelado';

export interface Reservation {
  id: string;
  product_id: string;
  cliente_nome: string;
  cliente_cpf: string;
  cliente_telefone: string;
  retirada_data: string;
  retirada_hora: string;
  devolucao_data: string;
  devolucao_hora: string;
  status: ReservationStatus;
  valor_total: number;
  quantidade: number;
  entregue: boolean;
  devolvido: boolean;
  observacoes?: string | null;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface Contract {
  id: string;
  reservation_id: string;
  pdf_url: string;
  assinatura_url?: string;
  documento_url?: string;
  observacoes: string;
  created_at: string;
}

export interface ContractClientData {
  id: string;
  reservation_id: string;
  nome: string;
  cpf: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  email: string;
  observacoes?: string | null;
}
