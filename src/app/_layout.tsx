import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { StateMessage } from '@/components/state-message';
// Importing this module starts the anonymous sign-in on app launch.
import '@/lib/supabase';
import { ProfileProvider, useProfile } from '@/lib/profile';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ProfileProvider>
        <AnimatedSplashOverlay />
        <RootStack />
      </ProfileProvider>
    </ThemeProvider>
  );
}

/**
 * The first-run flow (onboarding, paywall, offer: all one route) until the stage is `done`, the tabs after.
 * Each set of screens is only reachable in its own state. See `Stage` in `lib/profile.tsx`.
 */
function RootStack() {
  const { state, retry } = useProfile();

  // The splash overlay covers the screen while the profile loads.
  if (state.status === 'loading') return null;

  if (state.status === 'error') {
    return (
      <StateMessage
        tone="error"
        title="Couldn’t load your profile"
        message="Check your connection and try again."
        action={{ label: 'Try again', onPress: retry }}
      />
    );
  }

  const inFlow = state.stage !== 'done';

  return (
    // Screens draw their own headers to match the Figma design.
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={inFlow}>
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!inFlow}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settlement/[id]" />
      </Stack.Protected>
    </Stack>
  );
}
