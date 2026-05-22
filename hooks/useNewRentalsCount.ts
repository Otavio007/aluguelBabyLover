import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { getLastSeenRentalsAt } from '@/utils/adminRentalsSeen';

export function useNewRentalsCount() {
  const [newCount, setNewCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const lastSeen = getLastSeenRentalsAt();

      let query = supabase
        .from('reservations')
        .select('id', { count: 'exact', head: true });

      if (lastSeen) {
        query = query.gt('created_at', lastSeen);
      } else {
        query = query.eq('status', 'Pendente');
      }

      const { count, error } = await query;
      if (error) throw error;
      setNewCount(count ?? 0);
    } catch {
      setNewCount(0);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return { newCount, refresh };
}
