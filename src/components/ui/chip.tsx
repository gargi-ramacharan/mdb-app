import { Pressable, StyleSheet, Text } from 'react-native';

import { Palette } from '@/constants/theme';

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

/** Pill-shaped filter chip. Selected = grey fill / white text; unselected = translucent grey. */
export function Chip({ label, selected = false, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, { backgroundColor: selected ? Palette.neutralText : Palette.neutralChip }]}>
      <Text style={[styles.label, { color: selected ? Palette.white : Palette.neutralText }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 41,
    paddingHorizontal: 17,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
});
