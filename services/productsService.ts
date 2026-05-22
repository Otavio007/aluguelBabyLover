import { supabase } from '@/lib/supabase';
import { Product } from '@/types';

export const productsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('ativo', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Product[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Product;
  },

  async getByCategoria(categoria: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('categoria', categoria)
      .eq('ativo', true);

    if (error) throw error;
    return data as Product[];
  }
};
