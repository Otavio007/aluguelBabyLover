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

<<<<<<< HEAD
export function useBookedDates(productId: string) {
=======
export function useBookedDates(productId: string, quantity: number = 1) {
>>>>>>> 44bc8be (Ajustes)
  const query = useQuery({
    queryKey: ['booked-ranges', productId],
    queryFn: () => reservationsService.getBookedRanges(productId),
    enabled: !!productId,
    staleTime: 30_000,
  });

<<<<<<< HEAD
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
=======
  const { bookedDatesSet, countMap } = useMemo(() => {
    // Sum reserved quantities per date across all active reservations
    const countMap = new Map<string, number>();
    for (const range of query.data ?? []) {
      const qty = range.quantidade ?? 1;
      const current = new Date(range.retirada_data + 'T12:00:00');
      const end = new Date(range.devolucao_data + 'T12:00:00');
      while (current <= end) {
        const dateStr = format(current, 'yyyy-MM-dd');
        countMap.set(dateStr, (countMap.get(dateStr) ?? 0) + qty);
        current.setDate(current.getDate() + 1);
      }
    }
    // A date is fully booked only when total reserved >= stock quantity
    const bookedDatesSet = new Set<string>();
    for (const [date, count] of countMap.entries()) {
      if (count >= quantity) {
        bookedDatesSet.add(date);
      }
    }
    return { bookedDatesSet, countMap };
  }, [query.data, quantity]);

  return { ...query, bookedDatesSet, countMap };
>>>>>>> 44bc8be (Ajustes)
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
