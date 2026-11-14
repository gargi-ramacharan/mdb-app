import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_KEY. Copy .env.example to .env and fill them in.',
  );
}

// The publishable key goes where the legacy anon key used to.
export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Only refresh tokens while the app is in the foreground.
AppState.addEventListener('change', (state) => {
  if (state === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});

/**
 * Restores the persisted session, or signs in anonymously if there is none.
 * Resolves with the user id. Hooks should `await sessionReady` before querying.
 * Requires "Allow anonymous sign-ins" enabled in Supabase Auth settings.
 */
async function ensureSession(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session.user.id;

  const { data: signedIn, error } = await supabase.auth.signInAnonymously();
  if (error || !signedIn.user) {
    throw error ?? new Error('Anonymous sign-in failed');
  }
  return signedIn.user.id;
}

export const sessionReady: Promise<string> = ensureSession();
// Avoid an unhandled-rejection warning; consumers still see the error when they await it.
sessionReady.catch((e) => console.warn('Supabase session error:', e?.message ?? e));
