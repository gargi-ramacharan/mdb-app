import { useCallback, useEffect, useState } from 'react';

import type { DataSource } from '@/lib/api';
import { sessionReady, supabase } from '@/lib/supabase';

export type LiveListState<T> = { status: 'loading' } | { status: 'error' } | { status: 'ready'; data: T[] };

type Settled<T> = Exclude<LiveListState<T>, { status: 'loading' }>;

/**
 * Loads a list for the signed-in user and, for the `live` source, keeps it fresh: any insert,
 * update or delete on `table` for this user triggers a silent refetch (so the list never flashes
 * back to "loading"). Realtime only delivers rows RLS lets this user see.
 *
 * `fetcher` must be a stable (module-level) function.
 */
export function useLiveList<T>(table: 'claims' | 'forms', source: DataSource, fetcher: (s: DataSource) => Promise<T[]>) {
  const [attempt, setAttempt] = useState(0);
  // A result only counts while its key matches the current request (see useFetched).
  const [result, setResult] = useState<{ key: string; state: Settled<T> } | null>(null);

  const key = `${source}:${attempt}`;

  useEffect(() => {
    let cancelled = false;

    const load = (isRefresh: boolean) =>
      fetcher(source)
        .then((data) => {
          if (!cancelled) setResult({ key, state: { status: 'ready', data } });
        })
        .catch(() => {
          // A failed background refresh keeps showing the last good data.
          if (!cancelled && !isRefresh) setResult({ key, state: { status: 'error' } });
        });

    load(false);

    if (source !== 'live') {
      return () => {
        cancelled = true;
      };
    }

    let channel: ReturnType<typeof supabase.channel> | undefined;
    sessionReady
      .then((userId) => {
        if (cancelled) return;
        channel = supabase
          .channel(`${table}-${userId}-${Math.random().toString(36).slice(2)}`)
          .on('postgres_changes', { event: '*', schema: 'public', table, filter: `user_id=eq.${userId}` }, () => {
            load(true);
          })
          .subscribe();
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetcher, source, table, key]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const state: LiveListState<T> = result?.key === key ? result.state : { status: 'loading' };

  return { state, retry };
}
