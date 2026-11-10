import type { Claim } from '@/data/placeholder';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const formatCurrency = (dollars: number) => currency.format(dollars);

/** `paid` claims are finished; everything else is still in progress. */
export function splitClaims(claims: Claim[]) {
  return {
    inProgress: claims.filter((claim) => claim.status !== 'paid'),
    finished: claims.filter((claim) => claim.status === 'paid'),
  };
}

/** Numbers for the Estimated Payout card, all derived from the claims list. */
export function summarizeClaims(claims: Claim[]) {
  return {
    totalPayout: claims.reduce((sum, claim) => sum + claim.estimatedPayout, 0),
    // Every claim in the wallet has been claimed by the user.
    claimedCount: claims.length,
    notifiedCount: claims.filter((claim) => claim.status === 'notified').length,
  };
}
