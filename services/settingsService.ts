import { supabase } from '@/lib/supabase';

export interface SocialLink {
  texto: string;
  link: string;
}

const SOCIAL_LINKS_KEY = 'social_links';
const CATEGORIES_KEY = 'product_categories';

export const DEFAULT_CATEGORIES = [
  'Carrinhos',
  'Cadeirinhas',
  'Brinquedos',
  'Quarto',
  'Banho',
];

export const settingsService = {
  async getSocialLinks(): Promise<SocialLink[]> {
    const { data, error } = await supabase
      .from('app_settings')
      .select('valor')
      .eq('chave', SOCIAL_LINKS_KEY)
      .maybeSingle();

    if (error) throw error;
    if (!data?.valor) return [];

    try {
      return JSON.parse(data.valor) as SocialLink[];
    } catch {
      return [];
    }
  },

  async saveSocialLinks(links: SocialLink[]): Promise<void> {
    const { error } = await supabase
      .from('app_settings')
      .upsert(
        { chave: SOCIAL_LINKS_KEY, valor: JSON.stringify(links) },
        { onConflict: 'chave' }
      );

    if (error) throw error;
  },

  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('app_settings')
      .select('valor')
      .eq('chave', CATEGORIES_KEY)
      .maybeSingle();

    if (error) throw error;
    if (!data?.valor) return DEFAULT_CATEGORIES;

    try {
      const parsed = JSON.parse(data.valor) as string[];
      return parsed.length > 0 ? parsed : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },

  async saveCategories(categories: string[]): Promise<void> {
    const { error } = await supabase
      .from('app_settings')
      .upsert(
        { chave: CATEGORIES_KEY, valor: JSON.stringify(categories) },
        { onConflict: 'chave' }
      );

    if (error) throw error;
  },
};
