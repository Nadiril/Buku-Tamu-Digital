'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useRealtimeSubscription } from '@/lib/realtime/useRealtimeSubscription';
import { guestsKey } from './useGuestsQuery';
import { eventsKey } from './useEventsQuery';

export function statsKey() {
  return ['stats'];
}

function computeStats(guests, events) {
  const activeEvents = events.filter((e) => e.status === 'registrasi_dibuka');
  const today = new Date().toISOString().split('T')[0];
  const todayGuests = guests.filter(
    (g) => g.waktu_kedatangan && g.waktu_kedatangan.startsWith(today)
  );

  return {
    totalEvents: events.length,
    totalGuests: guests.length,
    checkInToday: todayGuests.length,
    activeEvents: activeEvents.length,
    checkedIn: guests.filter(
      (g) => g.status_kehadiran === 'hadir' || g.status_kehadiran === 'terlambat'
    ).length,
    notCheckedIn: guests.filter((g) => g.status_kehadiran === 'tidak_hadir').length,
  };
}

export function useStatsQuery() {
  const queryClient = useQueryClient();

  const result = useQuery({
    queryKey: statsKey(),
    queryFn: async () => {
      const [guestsRes, eventsRes] = await Promise.all([
        fetch('/api/guests'),
        fetch('/api/events'),
      ]);
      const guests = guestsRes.ok ? await guestsRes.json() : [];
      const events = eventsRes.ok ? await eventsRes.json() : [];
      return computeStats(guests, events);
    },
    refetchInterval: 30_000,
  });

  useRealtimeSubscription(
    'guests',
    useCallback(
      () => {
        queryClient.invalidateQueries({ queryKey: guestsKey() });
        queryClient.invalidateQueries({ queryKey: statsKey() });
      },
      [queryClient]
    )
  );

  useRealtimeSubscription(
    'events',
    useCallback(
      () => {
        queryClient.invalidateQueries({ queryKey: eventsKey() });
        queryClient.invalidateQueries({ queryKey: statsKey() });
      },
      [queryClient]
    )
  );

  return result;
}
