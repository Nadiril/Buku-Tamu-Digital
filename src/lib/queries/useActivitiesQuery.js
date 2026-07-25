'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useRealtimeSubscription } from '@/lib/realtime/useRealtimeSubscription';

export function activitiesKey(limit = 50) {
  return ['activities', limit];
}

async function fetchActivities() {
  const res = await fetch('/api/activities');
  if (!res.ok) throw new Error('Gagal memuat aktivitas');
  return res.json();
}

export function useActivitiesQuery(limit = 50) {
  const queryClient = useQueryClient();

  const result = useQuery({
    queryKey: activitiesKey(limit),
    queryFn: fetchActivities,
  });

  useRealtimeSubscription(
    'activities',
    useCallback(
      (payload) => {
        if (payload.eventType !== 'INSERT') return;
        queryClient.setQueryData(activitiesKey(limit), (old) => {
          if (!old) return old;
          return [payload.new, ...old].slice(0, limit);
        });
      },
      [queryClient, limit]
    ),
    { event: 'INSERT' }
  );

  return result;
}

export function useLogActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ action, detail, ...meta }) => {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, detail, ...meta }),
      });
      if (!res.ok) throw new Error('Gagal mencatat aktivitas');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(activitiesKey(50), (old) => {
        if (!old) return old;
        return [data, ...old].slice(0, 50);
      });
    },
  });
}
