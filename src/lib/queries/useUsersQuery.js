'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useRealtimeSubscription } from '@/lib/realtime/useRealtimeSubscription';

export function usersKey() {
  return ['users'];
}

async function fetchUsers() {
  const res = await fetch('/api/users');
  if (!res.ok) throw new Error('Gagal memuat data pengguna');
  return res.json();
}

export function useUsersQuery() {
  const queryClient = useQueryClient();

  const result = useQuery({
    queryKey: usersKey(),
    queryFn: fetchUsers,
  });

  useRealtimeSubscription(
    'profiles',
    useCallback(
      (payload) => {
        queryClient.setQueryData(usersKey(), (old) => {
          if (!old) return old;
          switch (payload.eventType) {
            case 'INSERT':
              return [payload.new, ...old];
            case 'UPDATE':
              return old.map((u) => (u.id === payload.new.id ? { ...u, ...payload.new } : u));
            case 'DELETE':
              return old.filter((u) => u.id !== payload.old.id);
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

export function useUserMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (form) => {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membuat pengguna');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKey() });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengupdate pengguna');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKey() });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, password }) => {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mereset password');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKey() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus pengguna');
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKey() });
    },
  });

  const createUser = async (form) => {
    return await createMutation.mutateAsync(form);
  };

  const updateUser = async (id, updates) => {
    return await updateMutation.mutateAsync({ id, ...updates });
  };

  const resetPassword = async (id, password) => {
    return await resetPasswordMutation.mutateAsync({ id, password });
  };

  const deleteUser = async (id) => {
    await deleteMutation.mutateAsync(id);
  };

  return { createUser, updateUser, resetPassword, deleteUser, createMutation, updateMutation, resetPasswordMutation, deleteMutation };
}
