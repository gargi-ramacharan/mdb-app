/**
 * Shared placeholder data matching the Figma designs, until a real settlements API exists.
 * Screens should read through the `fetch*` helpers below so swapping in a real API later
 * only changes this file (and the loading / error handling is already exercised).
 */

import type { FeaturedSettlement } from '@/components/featured-settlement-card';
import type { Settlement } from '@/components/settlement-row';

export const FEATURED_SETTLEMENTS: FeaturedSettlement[] = [
  { id: 'f1', company: 'Instagram', amount: '$20-$50', dueInDays: 5, claimsFilled: 1274, claimsTotal: 12000 },
  { id: 'f2', company: 'Instagram', amount: '$20-$50', dueInDays: 5, claimsFilled: 1274, claimsTotal: 12000 },
];

export const SETTLEMENTS: Settlement[] = [
  { id: 's1', company: 'Instagram', amount: '$3000+', dueInDays: 5, badge: { label: 'No proof', tone: 'green' } },
  { id: 's2', company: 'Instagram', amount: '$1000+', dueInDays: 567, badge: { label: 'Uncapped', tone: 'gold' } },
  { id: 's3', company: 'Instagram', amount: '$1000+', dueInDays: 567, badge: { label: 'Uncapped', tone: 'gold' } },
  { id: 's4', company: 'Instagram', amount: '$1000+', dueInDays: 567, badge: { label: 'Uncapped', tone: 'gold' } },
];

export type SettlementDetails = Settlement & {
  /** Big headline, e.g. "claim at least $1,000". */
  headline: string;
  title: string;
  summary: string;
  /** Body paragraphs under the "Description" heading. */
  description: string[];
};

// Lorem-style body copy: the Figma frame cuts off before showing the real description.
const PLACEHOLDER_DESCRIPTION = [
  'If you used Instagram in the United States during the class period, you may be eligible to file a claim. Eligibility is based on your account history, not on any proof of purchase.',
  'Payments are calculated per claimant after fees and expenses. The final amount depends on how many valid claims are filed before the deadline.',
];

const INSTAGRAM_DETAILS = {
  title: 'Instagram Social Media Addiction Arbitration Claims',
  summary:
    'You may get a cut of a $1M settlement over potential arbitration claims for harms from instagram’s allegedly addictive design..',
  description: PLACEHOLDER_DESCRIPTION,
} as const;

export const SETTLEMENT_DETAILS: Record<string, SettlementDetails> = {
  f1: { id: 'f1', company: 'Instagram', amount: '$20-$50', dueInDays: 5, ...INSTAGRAM_DETAILS, headline: 'claim $20-$50' },
  f2: { id: 'f2', company: 'Instagram', amount: '$20-$50', dueInDays: 5, ...INSTAGRAM_DETAILS, headline: 'claim $20-$50' },
  s1: { ...SETTLEMENTS[0], ...INSTAGRAM_DETAILS, headline: 'claim at least $3,000' },
  s2: { ...SETTLEMENTS[1], ...INSTAGRAM_DETAILS, headline: 'claim at least $1,000' },
  s3: { ...SETTLEMENTS[2], ...INSTAGRAM_DETAILS, headline: 'claim at least $1,000' },
  s4: { ...SETTLEMENTS[3], ...INSTAGRAM_DETAILS, headline: 'claim at least $1,000' },
};

const FAKE_LATENCY_MS = 600;

/**
 * Resolves with the settlement, or `null` when no settlement has that id (the "empty" state).
 * Rejects on failure so callers can show an error. Latency is simulated so the loading state is real.
 */
export function fetchSettlementDetails(id: string): Promise<SettlementDetails | null> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(SETTLEMENT_DETAILS[id] ?? null), FAKE_LATENCY_MS);
  });
}

// ---------------------------------------------------------------------------------------------
// Wallet claims
// ---------------------------------------------------------------------------------------------

/**
 * `claimed`: submitted, waiting on the administrator. `notified`: the administrator has confirmed
 * a payout. `paid`: finished. The Wallet puts `paid` claims under FINISHED and the rest under IN-PROGRESS.
 */
export type ClaimStatus = 'claimed' | 'notified' | 'paid';

export type Claim = {
  id: string;
  /** Brand the claim is against; its first letter is shown as the avatar. */
  company: string;
  /** Settlement amount shown on the row, e.g. "$3000". */
  amount: string;
  /** What this claim is expected to pay out, in dollars. The Wallet total is the sum of these. */
  estimatedPayout: number;
  dueInDays: number;
  status: ClaimStatus;
};

export const CLAIMS: Claim[] = [
  { id: 'c1', company: 'Google', amount: '$3000', estimatedPayout: 30, dueInDays: 49, status: 'claimed' },
  { id: 'c2', company: 'Instagram', amount: '$1000', estimatedPayout: 24, dueInDays: 120, status: 'notified' },
  { id: 'c3', company: 'DoorDash', amount: '$500', estimatedPayout: 20, dueInDays: 12, status: 'paid' },
  { id: 'c4', company: 'Tyson', amount: '$200', estimatedPayout: 20, dueInDays: 3, status: 'paid' },
];

/**
 * Which data `fetchClaims` returns. Lets you check each Wallet state without a backend:
 * `sample` = the claims above, `empty` = no claims, `error` = the request fails.
 */
export type PlaceholderSource = 'sample' | 'empty' | 'error';

export function fetchClaims(source: PlaceholderSource = 'sample'): Promise<Claim[]> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (source === 'error') reject(new Error('Placeholder claims request failed'));
      else resolve(source === 'empty' ? [] : CLAIMS);
    }, FAKE_LATENCY_MS);
  });
}

// ---------------------------------------------------------------------------------------------
// Forms
// ---------------------------------------------------------------------------------------------

export type FormStatus = 'pending' | 'paymentSent' | 'caseClosed';

export type Form = {
  id: string;
  title: string;
  /** Date the form was submitted, as `YYYY-MM-DD`. */
  submittedOn: string;
  status: FormStatus;
  /** Extra tag the filter chips can match, besides the status. */
  topic?: 'Rejected Ads' | 'Overbilling';
};

export const FORMS: Form[] = [
  { id: 'fm1', title: 'Apple Data Breach', submittedOn: '2026-02-14', status: 'pending' },
  { id: 'fm2', title: 'Facebook Retail', submittedOn: '2025-01-12', status: 'paymentSent', topic: 'Overbilling' },
  { id: 'fm3', title: 'Tesla Emissions', submittedOn: '2025-01-12', status: 'caseClosed', topic: 'Rejected Ads' },
];

/** Same `sample` / `empty` / `error` switch as `fetchClaims`. */
export function fetchForms(source: PlaceholderSource = 'sample'): Promise<Form[]> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (source === 'error') reject(new Error('Placeholder forms request failed'));
      else resolve(source === 'empty' ? [] : FORMS);
    }, FAKE_LATENCY_MS);
  });
}
