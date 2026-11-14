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
        {/* Takes whatever width the Claim button leaves, so nothing here can run underneath it. */}
        <View style={styles.left}>
          <BrandAvatar name={settlement.company} />

          <View style={styles.details}>
            <View style={styles.titleLine}>
              {/* Shrinks to fit on one line (down to 80%) instead of pushing the check under the button. */}
              <Text style={styles.amount} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                {settlement.amount}
              </Text>
              <View style={styles.checkCircle}>
                <Image
                  source={require('@/assets/images/home/check.svg')}
                  style={styles.check}
                  contentFit="contain"
                />
              </View>
            </View>
            <Text style={styles.due} numberOfLines={1}>
              {formatDue(settlement.dueInDays)}
            </Text>
          </View>
        </View>

        <Button label="Claim" onPress={() => onClaim?.(settlement)} style={styles.claim} />
      </View>

      <View style={styles.progress}>
        <ProgressBar progress={claimsTotal > 0 ? claimsFilled / claimsTotal : 0} />
        <Text style={styles.caption}>
          {claimsFilled} out of {claimsTotal} claims filled 🎉
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    // minHeight (not height) so larger text sizes grow the card instead of clipping its content.
    minHeight: 132,
    paddingHorizontal: 23,
    paddingTop: 22,
    paddingBottom: 18,
    gap: 17,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // minWidth: 0 lets this block (and the text inside it) shrink below its content's width.
  left: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  details: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amount: {
    flexShrink: 1,
    fontSize: 22, // 24 in the design; $50-$150 plus the check must fit on a 360pt-wide phone
    lineHeight: 28,
    fontWeight: '700',
    color: Palette.black,
  },
  checkCircle: {
    flexShrink: 0,
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
  // Natural width (the label's own size plus padding) so it never takes more room than it needs.
  claim: {
    flexShrink: 0,
    marginLeft: 12,
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
