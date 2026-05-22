import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationsService } from '@/services/reservationsService';
import { Reservation } from '@/types';

export function useReservationsSearch(identifier: string) {
  return useQuery({
    queryKey: ['reservations', identifier],
    queryFn: () => reservationsService.getByCpfOrPhone(identifier),
    enabled: !!identifier,
  });
}

export function useReservation(id: string) {
  return useQuery({
    queryKey: ['reservation', id],
    queryFn: () => reservationsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (reservation: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>) => 
      reservationsService.create(reservation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
}
