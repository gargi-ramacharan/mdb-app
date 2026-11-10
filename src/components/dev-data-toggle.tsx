import { StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/ui/chip';
import { Palette } from '@/constants/theme';
import type { PlaceholderSource } from '@/data/placeholder';

const OPTIONS: { label: string; value: PlaceholderSource }[] = [
  { label: 'Sample', value: 'sample' },
  { label: 'Empty', value: 'empty' },
  { label: 'Error', value: 'error' },
];

/**
 * Developer-only switch for the placeholder data source, so the empty and error states can be
 * checked without a backend. Renders nothing in production builds.
 */
export function DevDataToggle({
  value,
  onChange,
}: {
  value: PlaceholderSource;
  onChange: (value: PlaceholderSource) => void;
}) {
  if (!__DEV__) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Dev: placeholder data</Text>
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
