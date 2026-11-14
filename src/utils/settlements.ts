import type { Settlement } from '@/components/settlement-row';

export const HOME_FILTERS = ['All', 'Upcoming', 'Privacy', 'False Ads', 'Overbilling'] as const;
export type HomeFilter = (typeof HOME_FILTERS)[number];

/** "Upcoming" = deadline within this many days. */
const UPCOMING_DAYS = 30;

/** `All` keeps everything, `Upcoming` keeps soon-due settlements, the rest match `category`. */
export function filterSettlements(settlements: Settlement[], filter: HomeFilter) {
  if (filter === 'All') return settlements;
  if (filter === 'Upcoming') return settlements.filter((s) => s.dueInDays <= UPCOMING_DAYS);
  return settlements.filter((s) => s.category === filter);
}
