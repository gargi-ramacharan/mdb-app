import type { Form } from '@/data/placeholder';

/** The filter chips, in display order. Each one decides which forms it keeps. */
export const FORM_FILTERS = [
  { label: 'Pending', test: (form: Form) => form.status === 'pending' },
  { label: 'Payment Sent', test: (form: Form) => form.status === 'paymentSent' },
  { label: 'Case Closed', test: (form: Form) => form.status === 'caseClosed' },
  { label: 'Rejected Ads', test: (form: Form) => form.topic === 'Rejected Ads' },
  { label: 'Overbilling', test: (form: Form) => form.topic === 'Overbilling' },
] as const;

export type FormFilterLabel = (typeof FORM_FILTERS)[number]['label'];

/** `null` means no chip is selected, so every form is shown. */
export function filterForms(forms: Form[], filter: FormFilterLabel | null) {
  if (!filter) return forms;
  const match = FORM_FILTERS.find((f) => f.label === filter);
  return match ? forms.filter(match.test) : forms;
}

// `timeZone: 'UTC'` because the dates are plain `YYYY-MM-DD`, which parse as UTC midnight; formatting
// in the device's zone could show the previous day.
const submittedFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

export const formatSubmitted = (isoDate: string) => `Submitted: ${submittedFormat.format(new Date(isoDate))}`;

export const formatFileCount = (count: number) => `${count} ${count === 1 ? 'file' : 'files'}`;
