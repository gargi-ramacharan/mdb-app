import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { FeaturedSettlementCard, useFeaturedCardWidth } from '@/components/featured-settlement-card';
import { HomeHeader } from '@/components/home-header';
import { SettlementRow, type Settlement } from '@/components/settlement-row';
import { Chip } from '@/components/ui/chip';
import { UpgradeBanner } from '@/components/upgrade-banner';
import { MaxContentWidth, Palette, Spacing } from '@/constants/theme';
import { FEATURED_SETTLEMENTS, SETTLEMENTS } from '@/data/placeholder';

function openSettlement({ id }: Settlement) {
  router.push({ pathname: '/settlement/[id]', params: { id } });
}

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
  const cardWidth = useFeaturedCardWidth();

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
          snapToInterval={cardWidth + CARD_GAP}
          decelerationRate="fast"
          style={[styles.carousel, styles.featuredCarousel]}
          contentContainerStyle={styles.carouselContent}>
          {FEATURED_SETTLEMENTS.map((item) => (
            <FeaturedSettlementCard key={item.id} settlement={item} width={cardWidth} onClaim={openSettlement} />
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
            <SettlementRow key={item.id} settlement={item} onPress={openSettlement} onClaim={openSettlement} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const PAGE_PADDING = 20;
const CARD_GAP = 17;

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
    paddingTop: 18, // Figma: header bottom (129) to "Featured" (147)
    paddingBottom: Spacing.four,
    gap: 16, // Figma: 16 between the cards, banner, chips and list
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 9, // 16 gap + 9 = the 25 Figma puts between the title row and the cards
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
  // The cards' scroll view pads 4px top/bottom so their shadow isn't clipped; cancel it out so
  // the spacing around the cards still matches the design.
  featuredCarousel: {
    marginVertical: -4,
  },
  carouselContent: {
    paddingHorizontal: PAGE_PADDING,
    paddingVertical: 4, // room for the card shadow
    gap: CARD_GAP,
  },
  chips: {
    paddingHorizontal: PAGE_PADDING,
    gap: 6,
  },
  list: {
    gap: 17,
  },
});
