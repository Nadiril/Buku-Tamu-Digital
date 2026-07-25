'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useRealtimeSubscription } from '@/lib/realtime/useRealtimeSubscription';

export function guestsKey(filters = {}) {
  return ['guests', filters];
}

async function fetchGuests() {
  const res = await fetch('/api/guests');
  if (!res.ok) throw new Error('Gagal memuat data tamu');
  return res.json();
}

export function useGuestsQuery() {
  const queryClient = useQueryClient();

  const result = useQuery({
    queryKey: guestsKey(),
    queryFn: fetchGuests,
  });

  useRealtimeSubscription(
    'guests',
    useCallback(
      (payload) => {
        queryClient.setQueryData(guestsKey(), (old) => {
          if (!old) return old;
          switch (payload.eventType) {
            case 'INSERT':
              return [payload.new, ...old];
            case 'UPDATE':
              return old.map((g) => (g.id === payload.new.id ? { ...g, ...payload.new } : g));
            case 'DELETE':
              return old.filter((g) => g.id !== payload.old.id);
            default:
              return old;
          }
        });
      },
      [queryClient]
    )
  );

  return result;
}

export function useGuestMutations() {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: async (guest) => {
      const res = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guest),
      });
      if (!res.ok) throw new Error('Gagal menambah tamu');
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const res = await fetch(`/api/guests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Gagal mengupdate tamu');
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/guests/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus tamu');
      return true;
    },
  });

  const addGuest = async (guest) => {
    const data = await addMutation.mutateAsync(guest);
    return data;
  };

  const updateGuest = async (id, updates) => {
    const data = await updateMutation.mutateAsync({ id, ...updates });
    return data;
  };

  const deleteGuest = async (id) => {
    await deleteMutation.mutateAsync(id);
    return true;
  };

  return { addGuest, updateGuest, deleteGuest, addMutation, updateMutation, deleteMutation };
}
