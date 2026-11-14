import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { BrandAvatar } from '@/components/ui/brand-avatar';
import { Palette } from '@/constants/theme';
import type { HeroKey } from '@/data/onboarding';

/** Maps a `HeroKey` from `data/onboarding.ts` to the picture / card it stands for. */
export function renderHero(key: HeroKey) {
  switch (key) {
    case 'judge':
      return <Text style={styles.emojiLarge}>👩‍⚖️</Text>;
    case 'moneybag':
      return <Text style={styles.emojiMedium}>💰</Text>;
    case 'brands':
      return <BrandCluster />;
    case 'bell':
      return <BellWithNotifications />;
    case 'appleCard':
      return <AppleCard />;
    case 'reviewCard':
      return <ReviewCard />;
    case 'stars':
      return <Stars />;
  }
}

// Positions (and sizes) of the five brand circles, from the Figma paywall / intro frames.
const CLUSTER = { width: 350, height: 226 };
const CLUSTER_BRANDS = [
  { name: 'Apple', x: 0, y: 35, size: 93 },
  { name: 'Spotify', x: 133, y: 0, size: 93 },
  { name: 'Pepsi', x: 258, y: 47, size: 74 },
  { name: 'Instagram', x: 61, y: 129, size: 93 },
  { name: 'Fortnite', x: 184, y: 133, size: 93 },
] as const;

/** Five overlapping brand-letter circles. Scales down on narrow phones. */
export function BrandCluster() {
  const { width } = useWindowDimensions();
  const scale = Math.min(1, (width - 24) / CLUSTER.width);

  return (
    <View style={{ width: CLUSTER.width * scale, height: CLUSTER.height * scale }}>
      <View style={{ ...CLUSTER, transform: [{ scale }], transformOrigin: 'top left' }}>
        {CLUSTER_BRANDS.map(({ name, x, y, size }) => (
          <View key={name} style={{ position: 'absolute', left: x, top: y }}>
            <BrandAvatar name={name} size={size} radius={size / 2} />
          </View>
        ))}
      </View>
    </View>
  );
}

function BellWithNotifications() {
  return (
    <View style={styles.bellWrap}>
      <Text style={styles.emojiMedium}>🔔</Text>
      <View style={styles.notifStack}>
        {/* Peeks out from behind the main notification. */}
        <View style={[styles.notif, styles.notifBack]}>
          <Text style={styles.notifBackText}>You just got paid $35</Text>
        </View>
        <View style={[styles.notif, styles.notifFront]}>
          <View style={styles.notifAvatar}>
            <Text style={styles.notifAvatarLetter}>m</Text>
          </View>
          <View style={styles.notifText}>
            <View style={styles.notifTitleRow}>
              <Text style={styles.notifTitle}>New $10 Claim!</Text>
              <Text style={styles.notifTime}>9:31 AM</Text>
            </View>
            <Text style={styles.notifBody}>We’re holding your spot</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function AppleCard() {
  return (
    <View style={styles.appleCard}>
      <BrandAvatar name="Apple" size={62} radius={10} />
      <View style={styles.appleText}>
        <View style={styles.appleTitleRow}>
          <Text style={styles.appleName}>Apple</Text>
          <View style={styles.proofPill}>
            <Text style={styles.proofLabel}>No Proof</Text>
          </View>
        </View>
        <Text style={styles.appleDue}>Claim by Aug 10th 2025</Text>
      </View>
    </View>
  );
}

function ReviewCard() {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewAvatar} />
        <View style={styles.reviewWho}>
          <Text style={styles.reviewName}>John D.</Text>
          <Text style={styles.reviewClaimed}>Claimed $41 last month</Text>
        </View>
        <Text style={styles.reviewStars}>★★★★★</Text>
      </View>
      <Text style={styles.reviewQuote}>“It’s like finding money on the ground every single week!”</Text>
    </View>
  );
}

function Stars() {
  return (
    <View style={styles.stars} accessibilityLabel="Five stars">
      {[0, 1, 2, 3, 4].map((i) => (
        <Text key={i} style={styles.star}>
          ⭐
        </Text>
      ))}
    </View>
  );
}

const CARD_WIDTH = 340;

const styles = StyleSheet.create({
  emojiLarge: { fontSize: 120, lineHeight: 140, textAlign: 'center' },
  emojiMedium: { fontSize: 96, lineHeight: 112, textAlign: 'center' },

  bellWrap: { alignItems: 'center', gap: 4 },
  notifStack: { width: CARD_WIDTH, maxWidth: '100%', height: 96 },
  notif: { borderRadius: 14, backgroundColor: Palette.white },
  notifBack: {
    position: 'absolute',
    top: 40,
    left: 14,
    right: 14,
    height: 54,
    paddingTop: 30,
    paddingHorizontal: 50,
    opacity: 0.9,
    overflow: 'hidden',
  },
  notifBackText: { fontSize: 12, color: Palette.black },
  notifFront: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    alignItems: 'center',
    boxShadow: '0px 2px 6px rgba(0,0,0,0.15)',
  },
  notifAvatar: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: Palette.purple600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifAvatarLetter: { color: Palette.white, fontSize: 24, fontWeight: '800' },
  notifText: { flex: 1, gap: 2 },
  notifTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notifTitle: { fontSize: 14, fontWeight: '700', color: Palette.black },
  notifTime: { fontSize: 11, color: Palette.neutralText },
  notifBody: { fontSize: 13, color: Palette.black },

  appleCard: {
    width: 365,
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
    backgroundColor: '#d0bcff',
  },
  appleText: { flex: 1, gap: 2 },
  appleTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  appleName: { fontSize: 24, lineHeight: 28, fontWeight: '700', color: Palette.white },
  proofPill: {
    paddingHorizontal: 8,
    height: 18,
    borderRadius: 9,
    backgroundColor: Palette.purple700,
    justifyContent: 'center',
  },
  proofLabel: { fontSize: 10, fontWeight: '700', color: Palette.white },
  appleDue: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },

  reviewCard: {
    width: 330,
    maxWidth: '100%',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
    backgroundColor: Palette.purple600,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Palette.white },
  reviewWho: { flex: 1 },
  reviewName: { fontSize: 14, fontWeight: '700', color: Palette.white },
  reviewClaimed: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  reviewStars: { fontSize: 13, color: '#ffc700' },
  reviewQuote: { fontSize: 14, lineHeight: 20, fontWeight: '700', color: Palette.white },

  stars: { flexDirection: 'row', gap: 4 },
  star: { fontSize: 52, lineHeight: 62 },
});
