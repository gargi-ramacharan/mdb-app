import { StyleSheet, Text, View } from 'react-native';

import { Palette } from '@/constants/theme';

/** Rounded grey square showing the brand's first letter. Stands in for a logo until real ones exist. */
export function BrandAvatar({ name, size = 45, radius = 5 }: { name: string; size?: number; radius?: number }) {
  const letter = name.trim().charAt(0).toUpperCase();

  return (
    <View
      accessible
      accessibilityLabel={name}
      style={[styles.square, { width: size, height: size, borderRadius: radius }]}>
      <Text style={[styles.letter, { fontSize: Math.round(size * 0.45) }]}>{letter}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  square: {
    backgroundColor: Palette.secondaryFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontWeight: '700',
    color: Palette.neutralText,
  },
});
