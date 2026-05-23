import { useQuery } from '@tanstack/react-query';
import { settingsService, SocialLink } from '@/services/settingsService';

export function useSocialLinks() {
  return useQuery<SocialLink[]>({
    queryKey: ['social_links'],
    queryFn: () => settingsService.getSocialLinks(),
    staleTime: 1000 * 60 * 5, // cache por 5 minutos
  });
}
