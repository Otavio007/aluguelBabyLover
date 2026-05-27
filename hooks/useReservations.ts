import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { reservationsService } from '@/services/reservationsService';
import { Reservation } from '@/types';
import { format } from 'date-fns';

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

export function useBookedDates(productId: string) {
  const query = useQuery({
    queryKey: ['booked-ranges', productId],
    queryFn: () => reservationsService.getBookedRanges(productId),
    enabled: !!productId,
    staleTime: 30_000,
  });

  const bookedDatesSet = useMemo(() => {
    const set = new Set<string>();
    for (const range of query.data ?? []) {
      const current = new Date(range.retirada_data + 'T12:00:00');
      const end = new Date(range.devolucao_data + 'T12:00:00');
      while (current <= end) {
        set.add(format(current, 'yyyy-MM-dd'));
        current.setDate(current.getDate() + 1);
      }
    }
    return set;
  }, [query.data]);

  return { ...query, bookedDatesSet };
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
