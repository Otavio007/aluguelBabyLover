import { useQuery } from '@tanstack/react-query';
import { productsService } from '@/services/productsService';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: productsService.getAll,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsService.getById(id),
    enabled: !!id,
  });
}

export function useProductsByCategory(categoria: string) {
  return useQuery({
    queryKey: ['products', 'category', categoria],
    queryFn: () => productsService.getByCategoria(categoria),
    enabled: !!categoria,
  });
}
