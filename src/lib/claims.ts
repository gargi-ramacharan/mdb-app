import { sessionReady, supabase } from '@/lib/supabase';

export type StartClaimResult =
  | { status: 'started' }
  | { status: 'duplicate'; message: string }
  | { status: 'error'; message: string };

/**
 * Files a claim for the signed-in (anonymous) user. `user_id` is filled in by the database
 * (`default auth.uid()`), and RLS rejects anything not owned by the caller.
 *
 * Also opens a `pending` form for the claim so it shows up in the Forms tab. That second insert
 * is best-effort: the claim is what matters, so a form failure doesn't fail the call.
 */
export async function startClaim(settlementId: string): Promise<StartClaimResult> {
  try {
    await sessionReady;
  } catch {
    return { status: 'error', message: 'Couldn’t sign you in. Check your connection and try again.' };
  }

  const { error } = await supabase.from('claims').insert({ settlement_id: settlementId });

  if (error) {
    // 23505 = unique_violation on (user_id, settlement_id): already claimed.
    if (error.code === '23505') {
      return { status: 'duplicate', message: 'You’ve already started this claim. Find it in your Wallet.' };
    }
    return { status: 'error', message: 'Couldn’t start your claim. Please try again.' };
  }

  await supabase.from('forms').insert({ settlement_id: settlementId });
  return { status: 'started' };
}
