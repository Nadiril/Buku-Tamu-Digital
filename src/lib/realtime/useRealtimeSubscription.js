'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { realtimeManager } from './manager';

export function useRealtimeSubscription(table, callback, filter = null, deps = []) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const supabase = createClient();

    const cleanup = realtimeManager.subscribe(
      supabase,
      table,
      filter,
      (payload) => {
        callbackRef.current(payload);
      }
    );

    return cleanup;
  }, [table, JSON.stringify(filter), ...deps]);
}
