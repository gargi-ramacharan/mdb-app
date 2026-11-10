import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { StatusPill, type StatusPillTone } from '@/components/ui/status-pill';
import { Palette } from '@/constants/theme';
import type { Form, FormStatus } from '@/data/placeholder';
import { formatSubmitted } from '@/utils/forms';

const statuses: Record<FormStatus, { label: string; tone: StatusPillTone }> = {
  pending: { label: 'Pending', tone: 'warning' },
  paymentSent: { label: 'Payment Sent', tone: 'success' },
  caseClosed: { label: 'Case Closed', tone: 'danger' },
};

/** One saved form: document icon, title, submitted date and a colored status tag. */
export function FormRow({ form }: { form: Form }) {
  const status = statuses[form.status];

  return (
    <Card variant="glow" style={styles.row}>
      <Image source={require('@/assets/images/forms/form-icon.svg')} style={styles.icon} contentFit="contain" />

      <View style={styles.details}>
        <Text style={styles.title}>{form.title}</Text>
        <Text style={styles.submitted}>{formatSubmitted(form.submittedOn)}</Text>
      </View>

      {/* Top-aligned like the design, not centered with the text. */}
      <View style={styles.status}>
        <StatusPill label={status.label} tone={status.tone} size="sm" />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 13,
    paddingHorizontal: 17,
    paddingVertical: 16,
  },
  icon: {
    width: 49,
    height: 48,
  },
  // Same height as the icon so a one-line title and the date center against it.
  details: {
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
    gap: 2,
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: 0.15,
    color: Palette.black,
  },
  submitted: {
    fontSize: 15,
    lineHeight: 18,
    color: Palette.neutralText,
  },
  status: {
    marginTop: 1,
  },
});
