import type { Form } from '@/data/placeholder';
import { useLiveList } from '@/hooks/use-live-list';
import { fetchForms, type DataSource } from '@/lib/api';

export type FormsState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; forms: Form[] };

/** The user's forms (live from Supabase, with realtime updates) as loading / error / ready, plus `retry`. */
export function useForms(source: DataSource) {
  const { state, retry } = useLiveList('forms', source, fetchForms);

  const formsState: FormsState = state.status === 'ready' ? { status: 'ready', forms: state.data } : state;

  return { state: formsState, retry };
}
