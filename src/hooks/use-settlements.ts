import { useFetched } from '@/hooks/use-fetched';
import { fetchHome, type DataSource, type HomeData } from '@/lib/api';

export type SettlementsState =
  | { status: 'loading' }
  | { status: 'error' }
  | ({ status: 'ready' } & HomeData);

/** Home's featured + list settlements as loading / error / ready, plus `retry`. */
export function useSettlements(source: DataSource) {
  const { state, retry } = useFetched(fetchHome, source);

  const settlementsState: SettlementsState = state.status === 'ready' ? { status: 'ready', ...state.data } : state;

  return { state: settlementsState, retry };
}
