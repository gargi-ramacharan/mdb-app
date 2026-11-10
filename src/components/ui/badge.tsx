import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Palette } from '@/constants/theme';

const icons = {
  check: require('@/assets/images/home/check.svg'),
  star: require('@/assets/images/home/star.svg'),
} as const;

const tones = {
  green: { background: Palette.greenFill, text: Palette.greenText, icon: icons.check },
  gold: { background: Palette.goldFill, text: Palette.goldText, icon: icons.star },
} as const;

// `sm` is the list-row pill; `lg` is the larger pill on Settlement Details.
const sizes = {
  sm: { height: 23, radius: 10, paddingX: 6, gap: 3, fontSize: 13, letterSpacing: -0.26, icon: { green: 11, gold: 14 } },
  lg: { height: 34, radius: 17, paddingX: 20, gap: 2, fontSize: 15, letterSpacing: -0.3, icon: { green: 13, gold: 16 } },
} as const;

export type BadgeTone = keyof typeof tones;
export type BadgeSize = keyof typeof sizes;

/** Rounded status pill with a label and trailing icon, e.g. "No proof ✓" or "Uncapped ★". */
export function Badge({ label, tone, size = 'sm' }: { label: string; tone: BadgeTone; size?: BadgeSize }) {
  const { background, text, icon } = tones[tone];
  const s = sizes[size];
  const iconSize = s.icon[tone];

  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: background, height: s.height, borderRadius: s.radius, paddingHorizontal: s.paddingX, gap: s.gap },
      ]}>
      <Text style={[styles.label, { color: text, fontSize: s.fontSize, letterSpacing: s.letterSpacing }]}>{label}</Text>
      <Image source={icon} style={{ width: iconSize, height: iconSize }} contentFit="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    lineHeight: 18,
    fontWeight: '600',
  },
});
