import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge, type BadgeTone } from '@/components/ui/badge';
import { BrandAvatar } from '@/components/ui/brand-avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Palette } from '@/constants/theme';

export type Settlement = {
  id: string;
  /** Brand the settlement is against; its first letter is shown as the avatar. */
  company: string;
  amount: string;
  dueInDays: number;
  badge?: { label: string; tone: BadgeTone };
  /** Used by the Home filter chips (Privacy, False Ads, Overbilling). */
  category?: string;
};

export function formatDue(days: number) {
  return `Due in ${days} ${days === 1 ? 'day' : 'days'}`;
}

type Props = {
  settlement: Settlement;
  onPress?: (settlement: Settlement) => void;
  onClaim?: (settlement: Settlement) => void;
};

export function SettlementRow({ settlement, onPress, onClaim }: Props) {
  return (
    <Card style={styles.row}>
      {/* Only the info area is the "open" target, so it doesn't nest a button inside a button. */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${settlement.amount} settlement, ${formatDue(settlement.dueInDays)}`}
        onPress={() => onPress?.(settlement)}
        style={({ pressed }) => [styles.info, pressed && styles.pressed]}>
        <BrandAvatar name={settlement.company} />

        <View style={styles.details}>
          <View style={styles.titleLine}>
            <Text style={styles.amount}>{settlement.amount}</Text>
            {settlement.badge && <Badge label={settlement.badge.label} tone={settlement.badge.tone} />}
          </View>
          <Text style={styles.due}>{formatDue(settlement.dueInDays)}</Text>
        </View>
      </Pressable>

      <Button label="Claim" onPress={() => onClaim?.(settlement)} style={styles.claim} />
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    height: 79,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 19,
    gap: 15,
  },
  info: {
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  pressed: {
    opacity: 0.7,
  },
  details: {
    flex: 1,
    gap: 4,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  amount: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: 0.15,
    color: Palette.black,
  },
  due: {
    fontSize: 15,
    lineHeight: 18,
    color: Palette.neutralText,
  },
  claim: {
    width: 78,
  },
});
