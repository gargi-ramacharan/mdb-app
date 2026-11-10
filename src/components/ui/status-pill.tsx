import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Palette } from '@/constants/theme';

const tones = {
  success: Palette.successFill,
  info: Palette.progressFill,
  warning: Palette.warningFill,
  danger: Palette.dangerFill,
} as const;

// `md` is the Wallet's 112x36 status button; `sm` is the compact tag on Forms rows.
const sizes = {
  md: { minWidth: 112, height: 36, paddingHorizontal: 13, borderRadius: 5, gap: 2, fontSize: 15 },
  sm: { minWidth: 0, height: 25, paddingHorizontal: 18, borderRadius: 11, gap: 2, fontSize: 13 },
} as const;

export type StatusPillTone = keyof typeof tones;
export type StatusPillSize = keyof typeof sizes;

type Props = { label: string; tone: StatusPillTone; check?: boolean; size?: StatusPillSize };

/** Solid rounded status label, e.g. "Claimed ✓". Not the same as Badge, which is the light-filled tag. */
export function StatusPill({ label, tone, check = false, size = 'md' }: Props) {
  const { fontSize, ...box } = sizes[size];

  return (
    <View style={[styles.pill, box, { backgroundColor: tones[tone] }]}>
      <Text style={[styles.label, { fontSize }]}>{label}</Text>
      {check && <Image source={require('@/assets/images/wallet/check.svg')} style={styles.check} contentFit="contain" />}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    lineHeight: 18,
    fontWeight: '600',
    color: Palette.white,
  },
  check: {
    width: 20,
    height: 20,
  },
});
