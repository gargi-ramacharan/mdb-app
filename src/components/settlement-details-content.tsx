import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { formatDue } from '@/components/settlement-row';
import { Badge } from '@/components/ui/badge';
import { BrandAvatar } from '@/components/ui/brand-avatar';
import { Palette } from '@/constants/theme';
import type { SettlementDetails } from '@/data/placeholder';

const calendarIcon = require('@/assets/images/settlement/calendar.svg');

/** The scrollable body of the Settlement Details screen. */
export function SettlementDetailsContent({ settlement }: { settlement: SettlementDetails }) {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <BrandAvatar name={settlement.company} size={67} radius={8} />
        <Text style={styles.headline}>{settlement.headline}</Text>
        <Text style={styles.company}>{settlement.company}</Text>
      </View>

      <View style={styles.divider} />

      {settlement.badge && (
        <View style={styles.badge}>
          <Badge label={settlement.badge.label} tone={settlement.badge.tone} size="lg" />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.title}>{settlement.title}</Text>
        <Text style={styles.body}>{settlement.summary}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Deadline to claim</Text>
        <View style={styles.deadline}>
          <Image source={calendarIcon} style={styles.calendar} contentFit="contain" />
          <Text style={styles.body}>{formatDue(settlement.dueInDays)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Description</Text>
        {settlement.description.map((paragraph) => (
          <Text key={paragraph} style={styles.body}>
            {paragraph}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 32,
    gap: 25,
  },
  hero: {
    alignItems: 'center',
    gap: 14,
  },
  headline: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '700',
    letterSpacing: 0.72,
    textAlign: 'center',
    color: Palette.black,
  },
  company: {
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.28,
    color: Palette.captionText,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Palette.divider,
  },
  badge: {
    alignSelf: 'flex-start',
  },
  // Sections are spaced 29 apart in the design, a little more than the 25 between the blocks above.
  section: {
    gap: 10,
    marginTop: 4,
  },
  title: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '600',
    color: Palette.black,
  },
  heading: {
    fontSize: 20,
    lineHeight: 30,
    fontWeight: '600',
    color: Palette.black,
  },
  body: {
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: -0.36,
    color: Palette.mutedText,
  },
  deadline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  calendar: {
    width: 26,
    height: 26,
  },
});
