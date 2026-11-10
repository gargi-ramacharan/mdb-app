import { fetchForms, type Form, type PlaceholderSource } from '@/data/placeholder';
import { useFetched } from '@/hooks/use-fetched';

export type FormsState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; forms: Form[] };

/** Loads the saved forms and exposes loading / error / ready, plus `retry`. */
export function useForms(source: PlaceholderSource) {
  const { state, retry } = useFetched(fetchForms, source);

  const formsState: FormsState = state.status === 'ready' ? { status: 'ready', forms: state.data } : state;

  return { state: formsState, retry };
}
