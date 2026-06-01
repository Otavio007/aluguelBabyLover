import { supabase } from '@/lib/supabase';
import { ProductCategory } from '@/types';

export interface SocialLink {
  texto: string;
  link: string;
}

const SOCIAL_LINKS_KEY = 'social_links';
const CATEGORIES_KEY = 'product_categories';

export const DEFAULT_CATEGORIES: ProductCategory[] = [
  { nome: 'Carrinhos', imagem: null },
  { nome: 'Cadeirinhas', imagem: null },
  { nome: 'Brinquedos', imagem: null },
  { nome: 'Quarto', imagem: null },
  { nome: 'Banho', imagem: null },
];

function normalizeCategories(raw: unknown): ProductCategory[] {
  if (!Array.isArray(raw)) return DEFAULT_CATEGORIES;

  const items: ProductCategory[] = [];
  for (const item of raw) {
    if (typeof item === 'string' && item.trim()) {
      items.push({ nome: item.trim(), imagem: null });
      continue;
    }
    if (item && typeof item === 'object' && 'nome' in item) {
      const nome = String((item as ProductCategory).nome ?? '').trim();
      if (!nome) continue;
      const imagem = (item as ProductCategory).imagem;
      items.push({
        nome,
        imagem: typeof imagem === 'string' && imagem.trim() ? imagem.trim() : null,
      });
    }
  }

  return items.length > 0 ? items : DEFAULT_CATEGORIES;
}

export function getCategoryNames(categories: ProductCategory[]): string[] {
  return categories.map((c) => c.nome);
}

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

  async getCategories(): Promise<ProductCategory[]> {
    const { data, error } = await supabase
      .from('app_settings')
      .select('valor')
      .eq('chave', CATEGORIES_KEY)
      .maybeSingle();

    if (error) throw error;
    if (!data?.valor) return DEFAULT_CATEGORIES;

    try {
      return normalizeCategories(JSON.parse(data.valor));
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },

  async saveCategories(categories: ProductCategory[]): Promise<void> {
    const payload = categories.map((c) => ({
      nome: c.nome.trim(),
      imagem: c.imagem?.trim() || null,
    }));

    const { error } = await supabase
      .from('app_settings')
      .upsert(
        { chave: CATEGORIES_KEY, valor: JSON.stringify(payload) },
        { onConflict: 'chave' }
      );

    if (error) throw error;
  },
};
