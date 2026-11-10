import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Palette } from '@/constants/theme';

const icons = {
  check: require('@/assets/images/home/check.svg'),
  star: require('@/assets/images/home/star.svg'),
} as const;

const tones = {
  green: { background: Palette.greenFill, text: Palette.greenText, icon: icons.check, iconSize: 11 },
  gold: { background: Palette.goldFill, text: Palette.goldText, icon: icons.star, iconSize: 14 },
} as const;

export type BadgeTone = keyof typeof tones;

/** Rounded status pill with a label and trailing icon, e.g. "No proof ✓" or "Uncapped ★". */
export function Badge({ label, tone }: { label: string; tone: BadgeTone }) {
  const { background, text, icon, iconSize } = tones[tone];

  return (
    <View style={[styles.pill, { backgroundColor: background }]}>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
      <Image source={icon} style={{ width: iconSize, height: iconSize }} contentFit="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 23,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  label: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: -0.26,
  },
});
