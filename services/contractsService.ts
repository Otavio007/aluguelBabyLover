import { supabase } from '@/lib/supabase';
import { Contract, ContractClientData } from '@/types';

export const contractsService = {
  async createContract(contract: Omit<Contract, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('contracts')
      .insert(contract)
      .select()
      .single();

    if (error) throw error;
    return data as Contract;
  },

  async createClientData(clientData: Omit<ContractClientData, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('contract_client_data')
      .insert(clientData)
      .select()
      .single();

    if (error) throw error;
    return data as ContractClientData;
  },

  async getByReservationId(reservationId: string) {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('reservation_id', reservationId)
      .maybeSingle();

    if (error) throw error;
    return data as Contract;
  },

  async getClientDataByReservationId(reservationId: string) {
    const { data, error } = await supabase
      .from('contract_client_data')
      .select('*')
      .eq('reservation_id', reservationId)
      .maybeSingle();

    if (error) throw error;
    return data as ContractClientData;
  }
};
