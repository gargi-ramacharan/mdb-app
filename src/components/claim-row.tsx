import { StyleSheet, Text, View } from 'react-native';

import { formatDue } from '@/components/settlement-row';
import { BrandAvatar } from '@/components/ui/brand-avatar';
import { Card } from '@/components/ui/card';
import { StatusPill, type StatusPillTone } from '@/components/ui/status-pill';
import { Palette } from '@/constants/theme';
import type { Claim, ClaimStatus } from '@/data/placeholder';

const statuses: Record<ClaimStatus, { label: string; tone: StatusPillTone; check: boolean }> = {
  claimed: { label: 'Claimed', tone: 'success', check: true },
  notified: { label: 'Notified', tone: 'info', check: false },
  paid: { label: 'Paid', tone: 'success', check: true },
};

/** One claim in the Wallet: brand letter, amount, due date and a status pill. */
export function ClaimRow({ claim }: { claim: Claim }) {
  const status = statuses[claim.status];

  return (
    <Card variant="glow" style={styles.row}>
      <BrandAvatar name={claim.company} size={48} radius={8} />

      <View style={styles.details}>
        <Text style={styles.amount}>{claim.amount}</Text>
        <Text style={styles.due}>{formatDue(claim.dueInDays)}</Text>
      </View>

      <StatusPill label={status.label} tone={status.tone} check={status.check} />
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 17,
    paddingVertical: 16,
  },
  details: {
    flex: 1,
    gap: 2,
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
});
