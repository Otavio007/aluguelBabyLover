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
    // Basic check: any reservation for the same product that overlaps
    // Simplified for now: just check if there are confirmed/in-progress reservations
    const { data, error } = await supabase
      .from('reservations')
      .select('id')
      .eq('product_id', productId)
      .in('status', ['Confirmado', 'Em andamento'])
      .or(`retirada_data.lte.${end},devolucao_data.gte.${start}`);

    if (error) throw error;
    return data.length === 0;
  }
};
