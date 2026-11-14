import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/ui/chip';
import { Palette } from '@/constants/theme';
import { useDevMode } from '@/hooks/use-dev-mode';
import { useProfile } from '@/lib/profile';
import type { DataSource } from '@/lib/api';

const OPTIONS: { label: string; value: DataSource }[] = [
  { label: 'Live', value: 'live' },
  { label: 'Sample', value: 'sample' },
  { label: 'Empty', value: 'empty' },
  { label: 'Error', value: 'error' },
];

/**
 * Developer-only switch for the data source: `Live` is Supabase, the rest are placeholder data
 * or a forced empty / error, so every state can be checked. Renders nothing unless `__DEV__` and
 * the app was opened with a `?dev` flag (see `useDevMode`).
 */
export function DevDataToggle({
  value,
  onChange,
}: {
  value: DataSource;
  onChange: (value: DataSource) => void;
}) {
  const devMode = useDevMode();
  const { resetOnboarding } = useProfile();
  const [resetting, setResetting] = useState(false);
  if (!devMode) return null;

  // Clears the saved answers and `onboarded`; the root layout then sends you back to onboarding.
  const reset = async () => {
    setResetting(true);
    try {
      await resetOnboarding();
    } catch {
      setResetting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Dev: data source</Text>
      <View style={styles.options}>
        {OPTIONS.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={value === option.value}
            onPress={() => onChange(option.value)}
          />
        ))}
        <Chip label={resetting ? 'Resetting…' : 'Reset onboarding'} onPress={resetting ? undefined : reset} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Palette.divider,
  },
  label: {
    fontSize: 13,
    color: Palette.neutralText,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
});
