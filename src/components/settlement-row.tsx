import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Badge, type BadgeTone } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Palette } from '@/constants/theme';

export type Settlement = {
  id: string;
  amount: string;
  dueInDays: number;
  badge?: { label: string; tone: BadgeTone };
};

export const settlementThumb = require('@/assets/images/home/settlement-thumb.png');

export function formatDue(days: number) {
  return `Due in ${days} ${days === 1 ? 'day' : 'days'}`;
}

type Props = {
  settlement: Settlement;
  onClaim?: (settlement: Settlement) => void;
};

export function SettlementRow({ settlement, onClaim }: Props) {
  return (
    <Card style={styles.row}>
      <Image source={settlementThumb} style={styles.thumb} contentFit="cover" />

      <View style={styles.details}>
        <View style={styles.titleLine}>
          <Text style={styles.amount}>{settlement.amount}</Text>
          {settlement.badge && <Badge label={settlement.badge.label} tone={settlement.badge.tone} />}
        </View>
        <Text style={styles.due}>{formatDue(settlement.dueInDays)}</Text>
      </View>

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
  thumb: {
    width: 45,
    height: 45,
    borderRadius: 5,
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
