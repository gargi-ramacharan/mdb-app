/**
 * Collects open class-action settlements from ClaimDepot's public listing and upserts them into the
 * `settlements` table. Run with `npm run scrape`, or `npm run scrape -- --dry-run` to parse and print
 * without touching the database (no keys needed).
 *
 * Source: https://www.claimdepot.com/settlements. Its robots.txt allows crawling (and is re-checked
 * on every run below). One request per run, with an identifying User-Agent.
 *
 * Safe by construction: everything is fetched and parsed BEFORE the database is touched, so a layout
 * change on the site fails with a message and leaves the seeded data alone. Rows are upserted on
 * (brand_key, title), so reruns update in place instead of duplicating.
 */
import 'dotenv/config';

import { createClient } from '@supabase/supabase-js';

import { brandKey } from '../src/utils/brands';

const SITE = 'https://www.claimdepot.com';
const LISTING_PATH = '/settlements';
const USER_AGENT = 'mdb-app-scraper/1.0 (class action settlement aggregator)';
const DRY_RUN = process.argv.includes('--dry-run');

type Badge = 'No proof' | 'Uncapped';

type SettlementRow = {
  brand: string;
  brand_key: string;
  title: string;
  payout_label: string;
  payout_min: number | null;
  payout_max: number | null;
  deadline: string; // YYYY-MM-DD
  badge: Badge | null;
  category: string;
  description: string;
  claims_filed: number;
  claims_total: number;
  source_url: string;
};

class ScrapeError extends Error {}

// ---------------------------------------------------------------------------------------------
// robots.txt
// ---------------------------------------------------------------------------------------------

/** Minimal robots.txt check for `User-agent: *`: longest matching Allow / Disallow rule wins. */
function isAllowedByRobots(robots: string, path: string): boolean {
  const rules: { allow: boolean; pattern: RegExp; length: number }[] = [];
  let applies = false;
  let readingAgents = false;

  for (const raw of robots.split('\n')) {
    const line = raw.split('#')[0].trim();
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const field = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();

    if (field === 'user-agent') {
      if (!readingAgents) applies = false; // a new group starts
      readingAgents = true;
      if (value === '*') applies = true;
    } else {
      readingAgents = false;
      if (!applies || !value || (field !== 'allow' && field !== 'disallow')) continue;
      const source = value.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
      rules.push({ allow: field === 'allow', pattern: new RegExp(`^${source}`), length: value.length });
    }
  }

  const matches = rules.filter((r) => r.pattern.test(path)).sort((a, b) => b.length - a.length);
  return matches.length === 0 || matches[0].allow;
}

async function assertRobotsAllows(path: string) {
  let response: Response;
  try {
    response = await fetch(`${SITE}/robots.txt`, { headers: { 'User-Agent': USER_AGENT } });
  } catch (error) {
    throw new ScrapeError(`Couldn't fetch robots.txt, so not scraping: ${(error as Error).message}`);
  }
  // No robots.txt (4xx) means no restrictions; a server error means we can't tell, so stop.
  if (response.status >= 500) throw new ScrapeError(`robots.txt returned ${response.status}, so not scraping.`);
  if (response.ok && !isAllowedByRobots(await response.text(), path)) {
    throw new ScrapeError(`robots.txt disallows ${path} for crawlers, so not scraping.`);
  }
}

// ---------------------------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------------------------

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === '#') {
      const num = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(num) ? String.fromCodePoint(num) : match;
    }
    return ENTITIES[code.toLowerCase()] ?? match;
  });
}

/** The visible text lines inside a chunk of HTML (icons, scripts and styles dropped). */
function textLines(html: string): string[] {
  return html
    .replace(/<svg[\s\S]*?<\/svg>/g, '')
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, '')
    .split(/<[^>]+>/)
    .map((s) => decodeEntities(s).replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const DATE_LINE = /^([A-Za-z]+) (\d{1,2}), (\d{4})$/;

/** 'January 13, 2027' -> '2027-01-13', or null if it isn't a date. */
function parseDeadline(text: string): string | null {
  const m = text.match(DATE_LINE);
  if (!m) return null;
  const month = MONTHS.indexOf(m[1].toLowerCase());
  if (month === -1) return null;
  return `${m[3]}-${String(month + 1).padStart(2, '0')}-${m[2].padStart(2, '0')}`;
}

const money = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

/** Every dollar amount in the text, with K / M / B (or million / billion) suffixes applied. */
function amountsIn(text: string): number[] {
  const out: number[] = [];
  for (const m of text.matchAll(/\$\s?([\d,]+(?:\.\d+)?)\s?(k|m|b|thousand|million|billion)?\b/gi)) {
    const base = Number(m[1].replace(/,/g, ''));
    const unit = (m[2] ?? '').toLowerCase();
    const factor = unit.startsWith('k') || unit === 'thousand' ? 1e3 : unit.startsWith('m') ? 1e6 : unit.startsWith('b') ? 1e9 : 1;
    if (Number.isFinite(base)) out.push(base * factor);
  }
  return out;
}

/** Turns the site's payout text into the short label the app shows, plus min / max. */
function parsePayout(text: string): { label: string; min: number | null; max: number | null } {
  const amounts = amountsIn(text);
  if (amounts.length === 0) return { label: 'Varies', min: null, max: null };

  const lower = text.toLowerCase();
  const high = Math.max(...amounts);
  const low = Math.min(...amounts);

  if (/\bup to\b|\bas much as\b|\bmaximum\b/.test(lower)) return { label: `Up to ${money(high)}`, min: null, max: high };
  if (low !== high) return { label: `${money(low)}-${money(high)}`, min: low, max: high };
  if (/\bat least\b|\bor more\b|\bminimum\b|\+/.test(lower)) return { label: `${money(low)}+`, min: low, max: null };
  return { label: money(low), min: low, max: low };
}

/**
 * The brand is the company name at the start of the title: everything before the first year, dollar
 * amount or topic word. "Mixbook $1.99M False Advertising ..." -> "Mixbook".
 */
const TOPIC_WORDS = new Set([
  'data', 'unwanted', 'false', 'misleading', 'deceptive', 'unpaid', 'overcharge', 'overcharges', 'overdraft',
  'privacy', 'biometric', 'tcpa', 'bipa', 'wage', 'antitrust', 'price', 'pricing', 'product', 'products',
  'robocall', 'robocalls', 'text', 'texts', 'insurance', 'class', 'settlement', 'securities', 'consumer',
  'labeling', 'fees', 'fee', 'cyberattack', 'breach', 'hidden', 'recall', 'defective',
]);
const COMPANY_SUFFIX = /[,.]?\s+(inc|corp|corporation|llc|ltd|co|company|plc|n\.a|na)\.?$/i;

function extractBrand(title: string): string {
  const words = title.replace(/\s+Class Action Settlement.*$/i, '').split(/\s+/);
  const kept: string[] = [];
  for (const word of words) {
    if (/^(19|20)\d\d$/.test(word) || word.startsWith('$') || TOPIC_WORDS.has(word.toLowerCase().replace(/[^a-z]/g, ''))) break;
    kept.push(word);
  }
  let brand = (kept.length > 0 ? kept : words.slice(0, 2)).join(' ');
  brand = brand.split(/,| & | and /)[0]; // "GMFS, NewRez" -> "GMFS"
  brand = brand.replace(COMPANY_SUFFIX, '').trim().replace(/[,.]$/, '');
  return brand || title.split(/\s+/)[0];
}

/** Maps the listing's own category plus keywords in the text onto the app's chips. Falls back to "Upcoming". */
function inferCategory(siteCategory: string, text: string): string {
  const cat = siteCategory.toLowerCase();
  if (/false advertising|misleading|deceptive|mislabel/.test(cat + ' ' + text)) return 'False Ads';
  if (/overcharg|overbill|billing|hidden fee|junk fee|pricing|interest|unpaid|refund of fees/.test(cat + ' ' + text)) return 'Overbilling';
  if (/data breach|privacy|biometric|text message|tcpa|robocall|personal information|tracking/.test(cat + ' ' + text)) return 'Privacy';
  return 'Upcoming';
}

function inferBadge(text: string): Badge | null {
  if (/no proof|without proof|no receipt|proof of purchase (is |are )?not required|no documentation/.test(text)) return 'No proof';
  if (/uncapped|no cap\b|unlimited/.test(text)) return 'Uncapped';
  return null;
}

type Parsed = { rows: SettlementRow[]; found: number; skipped: Record<string, number> };

/** Reads the listing's cards. Positions inside a card are found by content, not by index, where possible. */
function parseListing(html: string, today: string): Parsed {
  const cards = html.split('<div role="listitem" class="c-collection_item w-dyn-item">').slice(1);
  const skipped: Record<string, number> = {};
  const skip = (reason: string) => (skipped[reason] = (skipped[reason] ?? 0) + 1);
  const rows: SettlementRow[] = [];

  for (const card of cards) {
    const href = card.match(/href="(\/settlements\/[^"#?]+)"/)?.[1];
    const lines = textLines(card);
    const status = lines[0] ?? '';
    const title = lines[1];
    if (!href || !title) {
      skip('unparseable');
      continue;
    }

    // "Open for Claims" and "No Proof" (open, and needs no receipt) can be claimed now. "Preliminarily
    // Approved" / "Pending Final Approval" have no deadline yet, so they are skipped until they open.
    if (!/open for claims|no proof/i.test(status)) {
      skip('not open for claims');
      continue;
    }

    const dateIdx = lines.findIndex((l) => DATE_LINE.test(l));
    const daysIdx = lines.findIndex((l) => /^days? left$/i.test(l));
    const deadline = dateIdx === -1 ? null : parseDeadline(lines[dateIdx]);
    if (!deadline || daysIdx === -1) {
      skip('unparseable');
      continue;
    }
    if (deadline < today) {
      skip('deadline passed');
      continue;
    }

    const payoutText = lines.slice(2, dateIdx).join(' ');
    const siteCategory = lines[daysIdx + 1] ?? '';
    const description = lines[daysIdx + 2] ?? '';
    const haystack = `${title} ${description} ${payoutText}`.toLowerCase();
    const payout = parsePayout(payoutText);
    const brand = extractBrand(title);

    rows.push({
      brand,
      brand_key: brandKey(brand),
      title,
      payout_label: payout.label,
      payout_min: payout.min,
      payout_max: payout.max,
      deadline,
      badge: /no proof/i.test(status) ? 'No proof' : inferBadge(haystack),
      category: inferCategory(siteCategory, haystack),
      description,
      // The site doesn't publish claim counts, so these stay 0 (existing rows keep theirs, see main()).
      claims_filed: 0,
      claims_total: 0,
      source_url: `${SITE}${href}`,
    });
  }

  return { rows, found: cards.length, skipped };
}

// ---------------------------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------------------------

async function fetchListing(): Promise<string> {
  let response: Response;
  try {
    response = await fetch(`${SITE}${LISTING_PATH}`, { headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' } });
  } catch (error) {
    throw new ScrapeError(`Couldn't reach ${SITE}${LISTING_PATH}: ${(error as Error).message}`);
  }
  if (!response.ok) throw new ScrapeError(`${SITE}${LISTING_PATH} returned HTTP ${response.status}.`);
  return response.text();
}

async function main() {
  const today = new Date().toISOString().slice(0, 10);

  await assertRobotsAllows(LISTING_PATH);
  const { rows: parsed, found, skipped } = parseListing(await fetchListing(), today);

  // If the layout changed, most cards stop parsing. Bail out before touching the database.
  const unparseable = skipped['unparseable'] ?? 0;
  if (found === 0 || unparseable > found / 2) {
    throw new ScrapeError(
      `Couldn't parse the listing (found ${found} cards, ${unparseable} unparseable). The site's layout has probably changed. ` +
        'Nothing was written; the existing data is untouched.',
    );
  }

  // The same settlement can appear twice; one upsert can't touch a row twice.
  const unique = new Map<string, SettlementRow>();
  for (const row of parsed) {
    const key = `${row.brand_key}|${row.title}`;
    if (unique.has(key)) skipped['duplicate'] = (skipped['duplicate'] ?? 0) + 1;
    else unique.set(key, row);
  }
  const rows = [...unique.values()];

  const skippedTotal = Object.values(skipped).reduce((a, b) => a + b, 0);
  const skippedDetail = Object.entries(skipped).map(([reason, n]) => `${reason}: ${n}`).join(', ');

  if (DRY_RUN) {
    console.log(`Dry run. Found ${found} cards, parsed ${rows.length}, skipped ${skippedTotal}${skippedDetail ? ` (${skippedDetail})` : ''}.`);
    for (const r of rows.slice(0, 8)) {
      console.log(
        `- [${r.brand}] ${r.title}\n    ${r.payout_label} (min ${r.payout_min}, max ${r.payout_max}) | due ${r.deadline} | ${r.category} | badge ${r.badge}`,
      );
    }
    return;
  }

  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) throw new ScrapeError('Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env');
  const supabase = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });

  // The scraper writes source_url; fail clearly if the column hasn't been added yet.
  const probe = await supabase.from('settlements').select('source_url').limit(1);
  if (probe.error) {
    throw new ScrapeError(
      `Couldn't read settlements.source_url (${probe.error.message}). Run the alter table line in supabase/schema.sql first.`,
    );
  }

  const existing = await supabase.from('settlements').select('brand_key, title, claims_filed, claims_total');
  if (existing.error) throw new ScrapeError(`Couldn't read existing settlements: ${existing.error.message}`);
  const known = new Map(existing.data.map((r) => [`${r.brand_key}|${r.title}`, r]));

  // Re-scraping must not wipe claim counts that already exist on a row.
  const payload = rows.map((row) => {
    const prior = known.get(`${row.brand_key}|${row.title}`);
    return prior ? { ...row, claims_filed: prior.claims_filed, claims_total: prior.claims_total } : row;
  });
  const created = payload.filter((row) => !known.has(`${row.brand_key}|${row.title}`)).length;

  const { error } = await supabase.from('settlements').upsert(payload, { onConflict: 'brand_key,title' });
  if (error) throw new ScrapeError(`Upsert failed: ${error.message}`);

  console.log(
    `Found ${found} cards: ${payload.length} saved (${created} new, ${payload.length - created} updated), ` +
      `${skippedTotal} skipped${skippedDetail ? ` (${skippedDetail})` : ''}.`,
  );
}

main().catch((error) => {
  console.error(error instanceof ScrapeError ? `Scrape failed: ${error.message}` : error);
  process.exitCode = 1;
});
