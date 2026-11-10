import { useCallback, useEffect, useState } from 'react';

import { fetchSettlementDetails, type SettlementDetails } from '@/data/placeholder';

export type SettlementDetailsState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'empty' }
  | { status: 'ready'; settlement: SettlementDetails };

type Settled = Exclude<SettlementDetailsState, { status: 'loading' }>;

/** Loads one settlement by id and exposes loading / error / empty / ready, plus `retry`. */
export function useSettlementDetails(id: string | undefined) {
  const [attempt, setAttempt] = useState(0);
  // The request a result belongs to. A result only counts while its key matches the current
  // request, so changing `id` or retrying shows "loading" again without setting state in the effect.
  const [result, setResult] = useState<{ key: string; state: Settled } | null>(null);

  const key = `${id}:${attempt}`;

  useEffect(() => {
    if (!id) return;

    // `cancelled` stops a slow response from landing after the id changed or the screen closed.
    let cancelled = false;

    fetchSettlementDetails(id)
      .then((settlement) => {
        if (cancelled) return;
        setResult({ key, state: settlement ? { status: 'ready', settlement } : { status: 'empty' } });
      })
      .catch(() => {
        if (!cancelled) setResult({ key, state: { status: 'error' } });
      });

    return () => {
      cancelled = true;
    };
  }, [id, key]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  let state: SettlementDetailsState;
  if (!id) state = { status: 'empty' };
  else if (result?.key === key) state = result.state;
  else state = { status: 'loading' };

  return { state, retry };
}
