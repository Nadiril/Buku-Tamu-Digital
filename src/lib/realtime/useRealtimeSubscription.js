'use client';

import { useEffect, useMemo, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { realtimeManager } from './manager';

export function useRealtimeSubscription(table, callback, filter = null, deps = []) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const filterKey = useMemo(() => JSON.stringify(filter), [filter]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, filterKey, ...deps]);
}
