import { StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/ui/chip';
import { Palette } from '@/constants/theme';
import type { DataSource } from '@/lib/api';

const OPTIONS: { label: string; value: DataSource }[] = [
  { label: 'Live', value: 'live' },
  { label: 'Sample', value: 'sample' },
  { label: 'Empty', value: 'empty' },
  { label: 'Error', value: 'error' },
];

/**
 * Developer-only switch for the data source: `Live` is Supabase, the rest are placeholder data
 * or a forced empty / error, so every state can be checked. Renders nothing in production builds.
 */
export function DevDataToggle({
  value,
  onChange,
}: {
  value: DataSource;
  onChange: (value: DataSource) => void;
}) {
  if (!__DEV__) return null;

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
    gap: 6,
  },
});
