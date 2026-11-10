import { StyleSheet, View, type ViewProps } from 'react-native';

import { Palette } from '@/constants/theme';

type Props = ViewProps & {
  /**
   * `default` is the Home card (15px radius, soft drop shadow). `glow` is the rounder 20px card
   * with an even all-around shadow, used by the Wallet and Forms list rows.
   */
  variant?: 'default' | 'glow';
};

/**
 * White rounded surface used by the featured, list, wallet and forms cards.
 * Uses `boxShadow` (supported on native and web in RN 0.88) instead of the legacy `shadow*` props,
 * which rendered as a solid black shadow on web here. Keep the color free of spaces:
 * `rgba(0,0,0,0.08)`.
 */
export function Card({ variant = 'default', style, ...rest }: Props) {
  return <View style={[styles.card, variant === 'glow' && styles.glow, style]} {...rest} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.white,
    borderRadius: 15,
    boxShadow: '0px 2px 4px rgba(0,0,0,0.08)',
  },
  glow: {
    borderRadius: 20,
    boxShadow: '0px 0px 6px rgba(0,0,0,0.08)',
  },
});
