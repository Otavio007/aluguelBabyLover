import { supabase } from '@/lib/supabase';
import { Reservation } from '@/types';

export const reservationsService = {
  async create(reservation: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('reservations')
      .insert(reservation)
      .select()
      .single();

    if (error) throw error;
    return data as Reservation;
  },

  async getByCpfOrPhone(identifier: string) {
    const { data, error } = await supabase
      .from('reservations')
      .select('*, product:products(*)')
      .or(`cliente_cpf.eq.${identifier},cliente_telefone.eq.${identifier}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Reservation[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('reservations')
      .select('*, product:products(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Reservation;
  },

  async checkAvailability(productId: string, start: string, end: string) {
    const { data, error } = await supabase
      .from('reservations')
      .select('id')
      .eq('product_id', productId)
      .not('status', 'in', '("Cancelado","Finalizado")')
      .lte('retirada_data', end)
      .gte('devolucao_data', start);

    if (error) throw error;
    return data.length === 0;
  },

  async update(id: string, fields: Partial<Pick<Reservation, 'status' | 'entregue' | 'devolvido' | 'observacoes'>>) {
    const { data, error } = await supabase
      .from('reservations')
      .update(fields)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Reservation;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('reservations')
      .select('*, product:products(nome, imagem)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as (Reservation & { product?: { nome: string; imagem?: string } })[];
  },

  async getBookedRanges(productId: string): Promise<{ retirada_data: string; devolucao_data: string; quantidade: number }[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select('retirada_data, devolucao_data, quantidade')
      .eq('product_id', productId)
      .not('status', 'in', '("Cancelado","Finalizado")');

    if (error) throw error;
    return (data ?? []).map(r => ({ ...r, quantidade: r.quantidade ?? 1 }));
  },
};
