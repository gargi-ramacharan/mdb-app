import { fetchClaims, type Claim, type PlaceholderSource } from '@/data/placeholder';
import { useFetched } from '@/hooks/use-fetched';

export type ClaimsState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; claims: Claim[] };

/** Loads the wallet's claims and exposes loading / error / ready, plus `retry`. */
export function useClaims(source: PlaceholderSource) {
  const { state, retry } = useFetched(fetchClaims, source);

  const claimsState: ClaimsState = state.status === 'ready' ? { status: 'ready', claims: state.data } : state;

  return { state: claimsState, retry };
}
