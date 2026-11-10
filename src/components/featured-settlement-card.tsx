import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { formatDue, settlementThumb, type Settlement } from '@/components/settlement-row';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Palette } from '@/constants/theme';

export const FEATURED_CARD_WIDTH = 375;

export type FeaturedSettlement = Settlement & {
  claimsFilled: number;
  claimsTotal: number;
};

type Props = {
  settlement: FeaturedSettlement;
  onClaim?: (settlement: Settlement) => void;
};

/** Larger card used in the horizontal "Featured" carousel: shows claim progress too. */
export function FeaturedSettlementCard({ settlement, onClaim }: Props) {
  const { claimsFilled, claimsTotal } = settlement;

  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <Image source={settlementThumb} style={styles.thumb} contentFit="cover" />

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
    width: FEATURED_CARD_WIDTH,
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
  thumb: {
    width: 45,
    height: 45,
    borderRadius: 5,
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
