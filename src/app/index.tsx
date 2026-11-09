import { Image } from 'expo-image';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { FEATURED_CARD_WIDTH, FeaturedSettlementCard, type FeaturedSettlement } from '@/components/featured-settlement-card';
import { HomeHeader } from '@/components/home-header';
import { SettlementRow, type Settlement } from '@/components/settlement-row';
import { Chip } from '@/components/ui/chip';
import { UpgradeBanner } from '@/components/upgrade-banner';
import { BottomTabInset, MaxContentWidth, Palette, Spacing } from '@/constants/theme';

// Placeholder data matching the Figma design until a real settlements API exists.
const FEATURED: FeaturedSettlement[] = [
  { id: 'f1', amount: '$20-$50', dueInDays: 5, claimsFilled: 1274, claimsTotal: 12000 },
  { id: 'f2', amount: '$20-$50', dueInDays: 5, claimsFilled: 1274, claimsTotal: 12000 },
];

const SETTLEMENTS: Settlement[] = [
  { id: 's1', amount: '$3000+', dueInDays: 5, badge: { label: 'No proof', tone: 'green' } },
  { id: 's2', amount: '$1000+', dueInDays: 567, badge: { label: 'Uncapped', tone: 'gold' } },
  { id: 's3', amount: '$1000+', dueInDays: 567, badge: { label: 'Uncapped', tone: 'gold' } },
  { id: 's4', amount: '$1000+', dueInDays: 567, badge: { label: 'Uncapped', tone: 'gold' } },
];

const FILTERS = ['All', 'Upcoming', 'Privacy', 'False Ads', 'Overbilling'];

function LegendItem({ label, tone }: { label: string; tone: 'green' | 'gold' }) {
  const isGreen = tone === 'green';
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: isGreen ? Palette.greenFill : Palette.goldFill }]}>
        <Image
          source={isGreen ? require('@/assets/images/home/check.svg') : require('@/assets/images/home/star.svg')}
          style={isGreen ? styles.legendCheck : styles.legendStar}
          contentFit="contain"
        />
      </View>
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const [filter, setFilter] = useState(FILTERS[0]);

  return (
    <View style={styles.screen}>
      <HomeHeader />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured</Text>
          <View style={styles.legend}>
            <LegendItem label="No Proof" tone="green" />
            <LegendItem label="Uncapped" tone="gold" />
          </View>
        </View>

        {/* Bleeds past the page padding so the next card peeks in, as in the design. */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={FEATURED_CARD_WIDTH + 17}
          decelerationRate="fast"
          style={styles.carousel}
          contentContainerStyle={styles.carouselContent}>
          {FEATURED.map((item) => (
            <FeaturedSettlementCard key={item.id} settlement={item} />
          ))}
        </ScrollView>

        <UpgradeBanner />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.carousel}
          contentContainerStyle={styles.chips}>
          {FILTERS.map((name) => (
            <Chip key={name} label={name} selected={filter === name} onPress={() => setFilter(name)} />
          ))}
        </ScrollView>

        <View style={styles.list}>
          {SETTLEMENTS.map((item) => (
            <SettlementRow key={item.id} settlement={item} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const PAGE_PADDING = 20;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.screenBackground,
  },
  content: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 24,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: 17,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '700',
    color: Palette.black,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  legendDot: {
    width: 23,
    height: 23,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendCheck: { width: 13, height: 13 },
  legendStar: { width: 15, height: 15 },
  legendLabel: {
    fontSize: 15,
    lineHeight: 28,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.46)',
  },
  // Negative margin cancels the page padding so rows can scroll edge to edge.
  carousel: {
    marginHorizontal: -PAGE_PADDING,
    flexGrow: 0,
  },
  carouselContent: {
    paddingHorizontal: PAGE_PADDING,
    paddingVertical: 4, // room for the card shadow
    gap: 17,
  },
  chips: {
    paddingHorizontal: PAGE_PADDING,
    gap: 6,
  },
  list: {
    gap: 17,
  },
});
