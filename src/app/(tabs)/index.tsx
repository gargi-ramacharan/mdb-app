import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DevDataToggle } from '@/components/dev-data-toggle';
import { FeaturedSettlementCard, useFeaturedCardWidth } from '@/components/featured-settlement-card';
import { HomeHeader } from '@/components/home-header';
import { HomeMenu, type HomeMenuItem, type MenuAnchor } from '@/components/home-menu';
import { SettlementRow, type Settlement } from '@/components/settlement-row';
import { StateMessage } from '@/components/state-message';
import { Chip } from '@/components/ui/chip';
import { InfoModal } from '@/components/ui/info-modal';
import { UpgradeBanner } from '@/components/upgrade-banner';
import { MaxContentWidth, Palette, Spacing } from '@/constants/theme';
import { useSettlements } from '@/hooks/use-settlements';
import type { DataSource } from '@/lib/api';
import { useProfile } from '@/lib/profile';
import { prioritizeBrands } from '@/utils/brands';
import { HOME_FILTERS, filterSettlements, type HomeFilter } from '@/utils/settlements';

const INFO_TITLE = 'How Class Action Lawsuits Work';
const INFO_MESSAGE = [
  'Class action lawsuits allow groups of people who have been harmed by a company to sue together. When companies settle these lawsuits, they often pay money to affected customers.',
  'This app helps you discover and claim your share of these settlements.\nSimply tap on any settlement to learn more and submit your claim if you’re eligible.',
];

// Privacy Policy, Terms of Use and Contact Support have no destinations yet.
const PLACEHOLDER_TITLES: Record<Exclude<HomeMenuItem, 'how'>, string> = {
  privacy: 'Privacy Policy',
  terms: 'Terms of Use',
  support: 'Contact Support',
};

function openSettlement({ id }: Settlement) {
  router.push({ pathname: '/settlement/[id]', params: { id } });
}

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
  const [source, setSource] = useState<DataSource>('live');
  const [filter, setFilter] = useState<HomeFilter>('All');
  const cardWidth = useFeaturedCardWidth();

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<MenuAnchor | null>(null);
  const [infoVisible, setInfoVisible] = useState(false);
  // What to do once the popover has finished closing. iOS can't present a second modal (or an alert)
  // while the first is still dismissing, so there it waits for `onDismiss`; elsewhere it runs at once.
  const afterMenuClose = useRef<(() => void) | null>(null);

  const openMenu = (anchor: MenuAnchor) => {
    setMenuAnchor(anchor);
    setMenuVisible(true);
  };

  const selectMenuItem = (item: HomeMenuItem) => {
    setMenuVisible(false);
    const action =
      item === 'how'
        ? () => setInfoVisible(true)
        : () => Alert.alert(PLACEHOLDER_TITLES[item], 'Coming soon.');

    if (Platform.OS === 'ios') afterMenuClose.current = action;
    else action();
  };

  const onMenuDismissed = () => {
    afterMenuClose.current?.();
    afterMenuClose.current = null;
  };
  const { state, retry } = useSettlements(source);

  // The user's onboarding brands come first; with none (or no matches) everything shows as before.
  const { state: profile } = useProfile();
  const myBrands = profile.status === 'ready' ? profile.brands : [];

  const featured = state.status === 'ready' ? prioritizeBrands(state.featured, myBrands) : [];
  const visible = state.status === 'ready' ? prioritizeBrands(filterSettlements(state.settlements, filter), myBrands) : [];

  return (
    <View style={styles.screen}>
      <HomeHeader onMenuPress={openMenu} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {featured.length > 0 && (
          <>
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
              {featured.map((item) => (
                <FeaturedSettlementCard key={item.id} settlement={item} width={cardWidth} onClaim={openSettlement} />
              ))}
            </ScrollView>
          </>
        )}

        <UpgradeBanner />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.carousel}
          contentContainerStyle={styles.chips}>
          {HOME_FILTERS.map((name) => (
            <Chip key={name} label={name} selected={filter === name} onPress={() => setFilter(name)} />
          ))}
        </ScrollView>

        {state.status === 'loading' && (
          <View style={styles.statePadding}>
            <ActivityIndicator size="large" color={Palette.purple600} accessibilityLabel="Loading settlements" />
          </View>
        )}

        {state.status === 'error' && (
          <View style={styles.stateBox}>
            <StateMessage
              tone="error"
              title="Couldn’t load settlements"
              message="Check your connection and try again."
              action={{ label: 'Try again', onPress: retry }}
            />
          </View>
        )}

        {state.status === 'ready' && visible.length === 0 && (
          <View style={styles.stateBox}>
            <StateMessage
              title={filter === 'All' ? 'No settlements yet' : 'No settlements match'}
              message={filter === 'All' ? 'New settlements will show up here.' : 'Try a different filter.'}
            />
          </View>
        )}

        {visible.length > 0 && (
          <View style={styles.list}>
            {visible.map((item) => (
              <SettlementRow key={item.id} settlement={item} onPress={openSettlement} onClaim={openSettlement} />
            ))}
          </View>
        )}

        <DevDataToggle value={source} onChange={setSource} />
      </ScrollView>

      <HomeMenu
        visible={menuVisible}
        anchor={menuAnchor}
        onSelect={selectMenuItem}
        onClose={() => setMenuVisible(false)}
        onDismiss={onMenuDismissed}
      />
      <InfoModal visible={infoVisible} title={INFO_TITLE} message={INFO_MESSAGE} onClose={() => setInfoVisible(false)} />
    </View>
  );
}

const PAGE_PADDING = 20;
const CARD_GAP = 17;
const SHADOW_ROOM = 12;

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
  // A horizontal ScrollView clips to its bounds, so it pads SHADOW_ROOM top/bottom to keep the card
  // shadow from being cut off; the negative margin cancels it so the 16px rhythm is unchanged.
  featuredCarousel: {
    marginVertical: -SHADOW_ROOM,
  },
  carouselContent: {
    paddingHorizontal: PAGE_PADDING,
    paddingVertical: SHADOW_ROOM,
    gap: CARD_GAP,
  },
  chips: {
    paddingHorizontal: PAGE_PADDING,
    gap: 6,
  },
  list: {
    gap: 17,
  },
  statePadding: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  // StateMessage is flex: 1 (built for full screens); give it a fixed box inside the scroll view.
  stateBox: {
    height: 220,
  },
});
