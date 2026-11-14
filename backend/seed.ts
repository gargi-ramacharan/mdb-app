/**
 * Seeds the `settlements` table. Run with `npm run seed`.
 *
 * Uses the SECRET key, which bypasses RLS, so this must only ever run on your machine.
 * It is idempotent: rows are upserted on (brand_key, title), so re-running updates in place.
 */
import 'dotenv/config';

import { createClient } from '@supabase/supabase-js';

import { FEATURED_SETTLEMENTS, SETTLEMENTS, SETTLEMENT_DETAILS } from '../src/data/placeholder';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !secretKey) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env');
}

const supabase = createClient(url, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type Badge = 'No proof' | 'Uncapped';
type Category = 'Privacy' | 'False Ads' | 'Overbilling';

type SettlementRow = {
  brand: string;
  brand_key: string;
  title: string;
  payout_label: string;
  payout_min: number | null;
  payout_max: number | null;
  deadline: string; // YYYY-MM-DD
  badge: Badge | null;
  category: Category;
  description: string;
  claims_filed: number;
  claims_total: number;
  logo_url: string | null;
};

const keyOf = (brand: string) => brand.toLowerCase().replace(/[^a-z0-9]+/g, '-');

function inDays(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** '$20-$50' -> [20, 50]; '$3000+' -> [3000, null]; '$500' -> [500, 500]. */
function parseAmount(label: string): [number | null, number | null] {
  const nums = label.match(/[\d,]+(?:\.\d+)?/g)?.map((n) => Number(n.replace(/,/g, ''))) ?? [];
  if (nums.length === 0) return [null, null];
  if (nums.length === 1) return [nums[0], label.includes('+') ? null : nums[0]];
  return [nums[0], nums[1]];
}

function row(
  brand: string,
  title: string,
  payoutLabel: string,
  dueInDays: number,
  category: Category,
  description: string,
  extra: { badge?: Badge; filed?: number; total?: number } = {},
): SettlementRow {
  const [min, max] = parseAmount(payoutLabel);
  return {
    brand,
    brand_key: keyOf(brand),
    title,
    payout_label: payoutLabel,
    payout_min: min,
    payout_max: max,
    deadline: inDays(dueInDays),
    badge: extra.badge ?? null,
    category,
    description,
    claims_filed: extra.filed ?? 0,
    claims_total: extra.total ?? 0,
    logo_url: null,
  };
}

// --- From src/data/placeholder.ts (the Instagram rows the UI already shows) -------------------
// The placeholder repeats the same title, but (brand_key, title) must be unique, so the repeats
// get a distinct suffix.

const featured = FEATURED_SETTLEMENTS[0];
const s1 = SETTLEMENTS[0];
const s2 = SETTLEMENTS[1];

const fromPlaceholder: SettlementRow[] = [
  row(
    featured.company,
    SETTLEMENT_DETAILS[featured.id].title,
    featured.amount,
    featured.dueInDays,
    'Privacy',
    SETTLEMENT_DETAILS[featured.id].description.join('\n\n'),
    { filed: featured.claimsFilled, total: featured.claimsTotal },
  ),
  row(
    s1.company,
    `${SETTLEMENT_DETAILS[s1.id].title} (Tier 1)`,
    s1.amount,
    s1.dueInDays,
    'Privacy',
    SETTLEMENT_DETAILS[s1.id].description.join('\n\n'),
    { badge: 'No proof', filed: 640, total: 5000 },
  ),
  row(
    s2.company,
    `${SETTLEMENT_DETAILS[s2.id].title} (Tier 2)`,
    s2.amount,
    s2.dueInDays,
    'False Ads',
    SETTLEMENT_DETAILS[s2.id].description.join('\n\n'),
    { badge: 'Uncapped', filed: 2210, total: 9000 },
  ),
];

// --- Additional brands -------------------------------------------------------------------------

const additional: SettlementRow[] = [
  row('Apple', 'Apple Data Breach', '$25-$75', 21, 'Privacy',
    'Apple customers whose personal data was exposed in a breach may claim compensation. No receipt required.',
    { badge: 'No proof', filed: 3120, total: 20000 }),
  row('Tesla', 'Tesla Emissions', '$100-$400', 45, 'False Ads',
    'Owners of affected Tesla models may be eligible after allegations of misleading range and emissions claims.',
    { filed: 980, total: 8000 }),
  row('Meta', 'Facebook Retail', '$50-$150', 12, 'Overbilling',
    'Advertisers who were overcharged on Facebook ad campaigns may claim a refund of the difference.',
    { filed: 4400, total: 15000 }),
  row('Meta', 'Facebook Biometric Privacy', '$200+', 90, 'Privacy',
    'Users in affected states whose face data was collected without consent may be eligible for a payout.',
    { badge: 'Uncapped', filed: 12800, total: 60000 }),
  row('Google', 'Google Location Tracking', '$30-$100', 49, 'Privacy',
    'Users who had Location History turned off but were still tracked may claim a share of the settlement.',
    { badge: 'No proof', filed: 21000, total: 90000 }),
  row('Google', 'Google Play Store Overcharges', '$15-$45', 30, 'Overbilling',
    'Android users who paid inflated in-app and app-store prices may be eligible for a refund.',
    { filed: 7300, total: 40000 }),
  row('DoorDash', 'DoorDash Hidden Fees', '$20-$60', 14, 'Overbilling',
    'Customers charged undisclosed service and delivery fees on DoorDash orders may claim a refund.',
    { badge: 'No proof', filed: 1850, total: 12000 }),
  row('Amazon', 'Amazon Prime Cancellation', '$50-$100', 60, 'False Ads',
    'Prime members who found it deliberately difficult to cancel their subscription may be eligible.',
    { badge: 'No proof', filed: 15600, total: 70000 }),
  row('Fortnite', 'Fortnite Dark Patterns Refund', '$25-$75', 35, 'False Ads',
    'Players charged for unwanted purchases through misleading design may claim a refund.',
    { filed: 5200, total: 30000 }),
  row('Spotify', 'Spotify Premium Auto-Renewal', '$10-$30', 18, 'Overbilling',
    'Subscribers renewed without clear disclosure may claim reimbursement of the charges.',
    { filed: 920, total: 10000 }),
  row('Pepsi', 'Pepsi Misleading Labels', '$5-$20', 75, 'False Ads',
    'Buyers of products carrying misleading "natural" labels may claim a refund. Proof of purchase is not required.',
    { badge: 'Uncapped', filed: 430, total: 6000 }),
  row('Apple', 'Apple App Store Pricing', '$15-$50', 120, 'Overbilling',
    'App Store customers who paid inflated prices due to restrictive rules may be eligible for a payout.',
    { badge: 'Uncapped', filed: 2600, total: 25000 }),
];

const rows = [...fromPlaceholder, ...additional];

async function main() {
  const { data, error } = await supabase
    .from('settlements')
    .upsert(rows, { onConflict: 'brand_key,title' })
    .select('brand, title');

  if (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
  console.log(`Seeded ${data?.length ?? 0} settlements.`);
}

main();
