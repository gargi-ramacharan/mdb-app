import { useCallback, useEffect, useState } from 'react';

export type FetchedState<T> = { status: 'loading' } | { status: 'error' } | { status: 'ready'; data: T };

type Settled<T> = Exclude<FetchedState<T>, { status: 'loading' }>;

/**
 * Runs `fetcher(arg)` and exposes loading / error / ready, plus `retry`. Re-fetches when `arg` changes.
 * `fetcher` must be a stable (module-level) function, and `arg` a primitive.
 */
export function useFetched<T, A extends string | number>(fetcher: (arg: A) => Promise<T>, arg: A) {
  const [attempt, setAttempt] = useState(0);
  // A result only counts while its key matches the current request, so changing `arg` or retrying
  // shows "loading" again without setting state inside the effect.
  const [result, setResult] = useState<{ key: string; state: Settled<T> } | null>(null);

  const key = `${arg}:${attempt}`;

  useEffect(() => {
    // Ignores a slow response that lands after `arg` changed or the screen closed.
    let cancelled = false;

    fetcher(arg)
      .then((data) => {
        if (!cancelled) setResult({ key, state: { status: 'ready', data } });
      })
      .catch(() => {
        if (!cancelled) setResult({ key, state: { status: 'error' } });
      });

    return () => {
      cancelled = true;
    };
  }, [fetcher, arg, key]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const state: FetchedState<T> = result?.key === key ? result.state : { status: 'loading' };

  return { state, retry };
}
