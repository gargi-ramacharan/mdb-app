/**
 * Data access for the app. Screens never talk to Supabase directly; they go through here, and
 * rows are mapped into the UI types the components already use (Settlement, Claim, Form, ...).
 *
 * `DataSource` is the dev toggle: `live` reads Supabase, the others serve the old placeholder
 * data (or a forced empty / error) so every UI state can be checked.
 */
import type { FeaturedSettlement } from '@/components/featured-settlement-card';
import type { Settlement } from '@/components/settlement-row';
import {
  FEATURED_SETTLEMENTS,
  SETTLEMENTS,
  SETTLEMENT_DETAILS,
  fetchClaims as fetchPlaceholderClaims,
  fetchForms as fetchPlaceholderForms,
  fetchSettlementDetails as fetchPlaceholderDetails,
  type Claim,
  type ClaimStatus,
  type Form,
  type FormStatus,
  type PlaceholderSource,
  type SettlementDetails,
} from '@/data/placeholder';
import { sessionReady, supabase } from '@/lib/supabase';

export type DataSource = 'live' | PlaceholderSource;

// ---------------------------------------------------------------------------------------------
// Row types (what the SQL schema returns) and mappers
// ---------------------------------------------------------------------------------------------

type SettlementRow = {
  id: string;
  brand: string;
  title: string;
  payout_label: string | null;
  payout_min: number | null;
  payout_max: number | null;
  deadline: string | null; // YYYY-MM-DD
  badge: string | null;
  category: string | null;
  description: string | null;
  claims_filed: number;
  claims_total: number;
};

type ClaimRow = {
  id: string;
  status: ClaimStatus;
  created_at: string;
  settlements: SettlementRow | null;
};

type FormRow = {
  id: string;
  status: FormStatus;
  submitted_at: string;
  settlements: SettlementRow | null;
};

const SETTLEMENT_COLUMNS =
  'id, brand, title, payout_label, payout_min, payout_max, deadline, badge, category, description, claims_filed, claims_total';

/** Whole days from today to a `YYYY-MM-DD` deadline, never negative. */
function daysUntil(deadline: string | null): number {
  if (!deadline) return 0;
  const [y, m, d] = deadline.split('-').map(Number);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.round((new Date(y, m - 1, d).getTime() - today.getTime()) / 86_400_000));
}

function todayISO(): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${mm}-${dd}`;
}

function toSettlement(row: SettlementRow): Settlement {
  const tone = row.badge === 'No proof' ? 'green' : row.badge === 'Uncapped' ? 'gold' : null;
  return {
    id: row.id,
    company: row.brand,
    amount: row.payout_label ?? '',
    dueInDays: daysUntil(row.deadline),
    badge: row.badge && tone ? { label: row.badge, tone } : undefined,
    category: row.category ?? undefined,
  };
}

function toDetails(row: SettlementRow): SettlementDetails {
  const description = row.description ?? '';
  const paragraphs = description.split(/\n\n+/).filter(Boolean);
  const summary = description.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? description;
  const headline =
    row.payout_min != null && row.payout_max == null
      ? `claim at least $${row.payout_min.toLocaleString('en-US')}`
      : `claim ${row.payout_label ?? ''}`.trim();

  return { ...toSettlement(row), headline, title: row.title, summary, description: paragraphs };
}

function toClaim(row: ClaimRow): Claim {
  const s = row.settlements;
  return {
    id: row.id,
    company: s?.brand ?? 'Unknown',
    amount: s?.payout_label ?? '',
    // Wallet total = sum of this over the user's claims.
    estimatedPayout: s?.payout_min ?? 0,
    dueInDays: daysUntil(s?.deadline ?? null),
    status: row.status,
  };
}

function toForm(row: FormRow): Form {
  const category = row.settlements?.category;
  return {
    id: row.id,
    title: row.settlements?.title ?? 'Untitled form',
    submittedOn: row.submitted_at.slice(0, 10),
    status: row.status,
    topic: category === 'False Ads' ? 'Rejected Ads' : category === 'Overbilling' ? 'Overbilling' : undefined,
  };
}

// ---------------------------------------------------------------------------------------------
// Queries. Each waits for the anonymous session first, so RLS sees an authenticated user.
// ---------------------------------------------------------------------------------------------

export type HomeData = { featured: FeaturedSettlement[]; settlements: Settlement[] };

export async function fetchHome(source: DataSource): Promise<HomeData> {
  if (source === 'error') throw new Error('Forced error (dev toggle)');
  if (source === 'empty') return { featured: [], settlements: [] };
  if (source === 'sample') return { featured: FEATURED_SETTLEMENTS, settlements: SETTLEMENTS };

  await sessionReady;
  const { data, error } = await supabase
    .from('settlements')
    .select(SETTLEMENT_COLUMNS)
    // Hide expired settlements.
    .or(`deadline.is.null,deadline.gte.${todayISO()}`)
    .order('deadline', { ascending: true, nullsFirst: false });
  if (error) throw error;

  const rows = (data ?? []) as unknown as SettlementRow[];
  const featured = rows
    .filter((r) => r.claims_total > 0)
    .sort((a, b) => b.claims_filed / b.claims_total - a.claims_filed / a.claims_total)
    .slice(0, 5)
    .map((r) => ({ ...toSettlement(r), claimsFilled: r.claims_filed, claimsTotal: r.claims_total }));

  return { featured, settlements: rows.map(toSettlement) };
}

/** Placeholder ids ('s1', 'f1', ...) still resolve locally; anything else is a Supabase uuid. */
export async function fetchSettlementDetails(id: string): Promise<SettlementDetails | null> {
  if (SETTLEMENT_DETAILS[id]) return fetchPlaceholderDetails(id);

  await sessionReady;
  const { data, error } = await supabase
    .from('settlements')
    .select(SETTLEMENT_COLUMNS)
    .eq('id', id)
    .maybeSingle();
  // 22P02 = the id isn't a valid uuid, which just means "not found".
  if (error) {
    if (error.code === '22P02') return null;
    throw error;
  }
  return data ? toDetails(data as unknown as SettlementRow) : null;
}

export async function fetchClaims(source: DataSource): Promise<Claim[]> {
  if (source !== 'live') return fetchPlaceholderClaims(source);

  await sessionReady;
  // RLS already limits this to the signed-in user's own claims.
  const { data, error } = await supabase
    .from('claims')
    .select(`id, status, created_at, settlements (${SETTLEMENT_COLUMNS})`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as ClaimRow[]).map(toClaim);
}

export async function fetchForms(source: DataSource): Promise<Form[]> {
  if (source !== 'live') return fetchPlaceholderForms(source);

  await sessionReady;
  const { data, error } = await supabase
    .from('forms')
    .select(`id, status, submitted_at, settlements (${SETTLEMENT_COLUMNS})`)
    .order('submitted_at', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as FormRow[]).map(toForm);
}

/**
 * Onboarding's "$X claimable": the most the selected brands' open settlements could pay out
 * (`payout_max`, or `payout_min` for uncapped ones). Falls back to a flat estimate per brand when the
 * table has nothing for them (e.g. before seeding), so the result screen is never "$0".
 */
export async function fetchClaimable(brandKeys: string[]): Promise<number> {
  const fallback = brandKeys.length * 50;
  try {
    await sessionReady;
    const { data, error } = await supabase
      .from('settlements')
      .select('payout_min, payout_max')
      .in('brand_key', brandKeys);
    if (error) throw error;
    const rows = (data ?? []) as { payout_min: number | null; payout_max: number | null }[];
    const total = rows.reduce((sum, r) => sum + (r.payout_max ?? r.payout_min ?? 0), 0);
    return total > 0 ? total : fallback;
  } catch {
    return fallback;
  }
}
