/** `Apple` -> `apple`, `DoorDash` -> `doordash`. Matches the `brand_key` that `backend/seed.ts` writes. */
export const brandKey = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/**
 * Puts items whose brand the user picked in onboarding first, keeping the original order within each
 * group. With no picks, or no matches, the list comes back unchanged, so everything still shows.
 */
export function prioritizeBrands<T extends { company: string }>(items: T[], brandKeys: string[]): T[] {
  if (brandKeys.length === 0) return items;
  const mine = items.filter((item) => brandKeys.includes(brandKey(item.company)));
  if (mine.length === 0) return items;
  return [...mine, ...items.filter((item) => !brandKeys.includes(brandKey(item.company)))];
}
