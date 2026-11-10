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
      style={[
        styles.chip,
        // Figma: the selected chip is 2px wider on each side than the others.
        { backgroundColor: selected ? Palette.neutralText : Palette.neutralChip, paddingHorizontal: selected ? 18 : 16 },
      ]}>
      <Text style={[styles.label, { color: selected ? Palette.white : Palette.neutralText }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 41,
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
