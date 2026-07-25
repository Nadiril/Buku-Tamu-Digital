'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRealtimeSubscription } from '@/lib/realtime/useRealtimeSubscription';

export function profileKey(userId) {
  return ['profile', userId];
}

async function fetchProfile() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  if (data) return { ...data, email: session.user.email };
  return null;
}

export function useProfileQuery() {
  const queryClient = useQueryClient();

  const result = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  });

  useRealtimeSubscription(
    'profiles',
    useCallback(
      (payload) => {
        queryClient.setQueryData(['profile'], (old) => {
          if (!old) return old;
          if (payload.eventType === 'UPDATE' && old.id === payload.new.id) {
            return { ...old, ...payload.new };
          }
          return old;
        });
      },
      [queryClient]
    )
  );

  return result;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates) => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', session.user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], (old) => (old ? { ...old, ...data } : data));
    },
  });
}
