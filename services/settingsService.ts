import { supabase } from '@/lib/supabase';

export interface SocialLink {
  texto: string;
  link: string;
}

const SOCIAL_LINKS_KEY = 'social_links';

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
};
