import type { Claim } from '@/data/placeholder';
import { useLiveList } from '@/hooks/use-live-list';
import { fetchClaims, type DataSource } from '@/lib/api';

export type ClaimsState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; claims: Claim[] };

/** The user's claims (live from Supabase, with realtime updates) as loading / error / ready, plus `retry`. */
export function useClaims(source: DataSource) {
  const { state, retry } = useLiveList('claims', source, fetchClaims);

  const claimsState: ClaimsState = state.status === 'ready' ? { status: 'ready', claims: state.data } : state;

  return { state: claimsState, retry };
}
