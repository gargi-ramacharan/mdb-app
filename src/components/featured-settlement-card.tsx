import { Image } from 'expo-image';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { formatDue, type Settlement } from '@/components/settlement-row';
import { BrandAvatar } from '@/components/ui/brand-avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { MaxContentWidth, Palette } from '@/constants/theme';

/** Cards take 85% of the screen (375 of 440 in Figma) so the next card peeks in from the right. */
const FEATURED_CARD_WIDTH_RATIO = 0.85;

export function useFeaturedCardWidth() {
  const { width } = useWindowDimensions();
  // Home content is capped at MaxContentWidth, so the ratio is taken from the capped width.
  return Math.round(Math.min(width, MaxContentWidth) * FEATURED_CARD_WIDTH_RATIO);
}

export type FeaturedSettlement = Settlement & {
  claimsFilled: number;
  claimsTotal: number;
};

type Props = {
  settlement: FeaturedSettlement;
  width: number;
  onClaim?: (settlement: Settlement) => void;
};

/** Larger card used in the horizontal "Featured" carousel: shows claim progress too. */
export function FeaturedSettlementCard({ settlement, width, onClaim }: Props) {
  const { claimsFilled, claimsTotal } = settlement;

  return (
    <Card style={[styles.card, { width }]}>
      <View style={styles.topRow}>
        <BrandAvatar name={settlement.company} />

        <View style={styles.details}>
          <View style={styles.titleLine}>
            <Text style={styles.amount}>{settlement.amount}</Text>
            <View style={styles.checkCircle}>
              <Image
                source={require('@/assets/images/home/check.svg')}
                style={styles.check}
                contentFit="contain"
              />
            </View>
          </View>
          <Text style={styles.due}>{formatDue(settlement.dueInDays)}</Text>
        </View>

        <Button label="Claim" onPress={() => onClaim?.(settlement)} style={styles.claim} />
      </View>

      <View style={styles.progress}>
        <ProgressBar progress={claimsFilled / claimsTotal} />
        <Text style={styles.caption}>
          {claimsFilled} out of {claimsTotal} claims filled 🎉
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 132,
    paddingHorizontal: 23,
    paddingTop: 22,
    gap: 17,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  details: {
    flex: 1,
    gap: 2,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amount: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '700',
    color: Palette.black,
  },
  checkCircle: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: Palette.greenFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    width: 18,
    height: 18,
  },
  due: {
    fontSize: 15,
    lineHeight: 18,
    color: Palette.neutralText,
  },
  claim: {
    width: 88,
  },
  progress: {
    gap: 7,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: Palette.neutralText,
  },
});
