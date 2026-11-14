import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { clearDevPlan } from '@/lib/dev-flags';
import { sessionReady, supabase } from '@/lib/supabase';

/**
 * Where the user is in the first-run flow. The root layout shows the onboarding route for every stage
 * except `done`, and the tabs for `done`.
 *
 * - `onboarding`: hasn't finished the questions (`profiles.onboarded` is false).
 * - `paywall`: answered the questions but hasn't left the paywall (`paywall_seen` is false).
 * - `offer`: left the paywall this session and is looking at the one-time offer.
 * - `done`: left the paywall / offer (`paywall_seen` is true).
 *
 * `offer` is session-only: `paywall_seen` is saved the moment the paywall is left, so after a relaunch
 * the stage is `done` and the offer is not shown again.
 */
export type Stage = 'onboarding' | 'paywall' | 'offer' | 'done';

type ProfileState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; stage: Stage; brands: string[] };

type ProfileContextValue = {
  state: ProfileState;
  retry: () => void;
  /**
   * Saves the onboarding answers and `onboarded = true`, then moves to the `paywall` stage. If the save
   * fails the error is logged and the user is let through to Home rather than stranded; returns
   * `'failed'` in that case so the flow knows not to carry on to the paywall.
   */
  saveOnboarding: (answers: { brandKeys: string[]; payoutMethod: string }) => Promise<'saved' | 'failed'>;
  /** Left the paywall (X or Continue): saves `paywall_seen` and moves to the `offer` stage. */
  leavePaywall: () => Promise<void>;
  /** Left the offer (X or its button): saves `paywall_seen` and moves to `done`, which shows the tabs. */
  leaveOffer: () => Promise<void>;
  /** Dev only: clears the answers, `onboarded` and `paywall_seen`, which sends the user back to onboarding. */
  resetOnboarding: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

/** Writes profile columns for the signed-in user. `upsert` also creates the row if the signup trigger never ran. */
async function writeProfile(values: Record<string, unknown>) {
  const userId = await sessionReady;
  const { error } = await supabase.from('profiles').upsert({ id: userId, ...values });
  if (error) throw error;
}

/** Loads the signed-in user's profile once and shares it (and the first-run actions) app-wide. */
export function ProfileProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProfileState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const userId = await sessionReady;
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarded, paywall_seen, brands')
          .eq('id', userId)
          .maybeSingle();
        if (error) throw error;

        // No row yet counts as "not onboarded"; saving later upserts it.
        const stage: Stage = !data?.onboarded ? 'onboarding' : data.paywall_seen ? 'done' : 'paywall';
        if (!cancelled) setState({ status: 'ready', stage, brands: data?.brands ?? [] });
      } catch {
        if (!cancelled) setState({ status: 'error' });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  const setStage = useCallback((stage: Stage, brands?: string[]) => {
    setState((s) => (s.status === 'ready' ? { ...s, stage, brands: brands ?? s.brands } : s));
  }, []);

  const saveOnboarding = useCallback(
    async ({ brandKeys, payoutMethod }: { brandKeys: string[]; payoutMethod: string }) => {
      try {
        await writeProfile({ brands: brandKeys, payout_method: payoutMethod, onboarded: true });
        setStage('paywall', brandKeys);
        return 'saved' as const;
      } catch (error) {
        // Don't strand the user on a flaky connection: skip the paywall and open Home. Nothing was
        // saved, so onboarding will show again next launch.
        console.error('Failed to save onboarding answers:', error);
        setStage('done', brandKeys);
        return 'failed' as const;
      }
    },
    [setStage],
  );

  // Both "leave" actions move on first and save in the background, so a slow or failed save never
  // blocks the screen. A failed save is logged; the worst case is seeing the paywall once more.
  const leavePaywall = useCallback(async () => {
    setStage('offer');
    try {
      await writeProfile({ paywall_seen: true });
    } catch (error) {
      console.error('Failed to save paywall_seen:', error);
    }
  }, [setStage]);

  const leaveOffer = useCallback(async () => {
    setStage('done');
    try {
      await writeProfile({ paywall_seen: true });
    } catch (error) {
      console.error('Failed to save paywall_seen:', error);
    }
  }, [setStage]);

  const resetOnboarding = useCallback(async () => {
    await writeProfile({ brands: [], payout_method: null, onboarded: false, paywall_seen: false });
    await clearDevPlan();
    setStage('onboarding', []);
  }, [setStage]);

  const value = useMemo(
    () => ({ state, retry, saveOnboarding, leavePaywall, leaveOffer, resetOnboarding }),
    [state, retry, saveOnboarding, leavePaywall, leaveOffer, resetOnboarding],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside <ProfileProvider>');
  return ctx;
}
