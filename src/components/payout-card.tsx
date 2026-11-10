import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { purpleGradient } from '@/constants/gradients';
import { Palette } from '@/constants/theme';

type Props = {
  /** Pre-formatted strings, so the card can show a placeholder (e.g. "–") while claims load. */
  total: string;
  claimed: string;
  notified: string;
  onInfoPress: () => void;
};

const gradient = purpleGradient(98.7);

/** Purple "Estimated Payout" summary at the top of the Wallet. */
export function PayoutCard({ total, claimed, notified, onInfoPress }: Props) {
  return (
    <View style={[styles.card, gradient]}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Estimated Payout</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="How estimated payouts work"
          hitSlop={12}
          onPress={onInfoPress}
          style={styles.info}>
          <Image source={require('@/assets/images/wallet/question.svg')} style={styles.infoIcon} contentFit="contain" />
        </Pressable>
      </View>

      <Text style={styles.total}>{total}</Text>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}># Claimed</Text>
          <Text style={styles.statValue}>{claimed}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Notified</Text>
          <Text style={styles.statValue}>{notified}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 29,
    paddingVertical: 25,
    gap: 16,
    borderRadius: 15,
    overflow: 'hidden',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    color: Palette.white,
  },
  // The icon art is 20.5px inside Figma's 24px box.
  info: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIcon: {
    width: 20.5,
    height: 20.5,
  },
  // Figma's 40px number sits in a 28px box and overflows it; 44px gives it room without clipping.
  total: {
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '700',
    color: Palette.white,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    gap: 6,
  },
  statLabel: {
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.25,
    color: 'rgba(255, 255, 255, 0.72)',
  },
  statValue: {
    fontSize: 24,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: 0.25,
    color: Palette.white,
  },
});
