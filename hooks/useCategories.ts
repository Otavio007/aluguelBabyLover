import { useQuery } from '@tanstack/react-query';
import { settingsService } from '@/services/settingsService';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: settingsService.getCategories,
  });
}
