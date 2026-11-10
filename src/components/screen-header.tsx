import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette } from '@/constants/theme';

type Props = {
  title: string;
  /** Shows the pill on the right when provided. */
  onInfoPress?: () => void;
};

/** Back button on the left, centered title, optional "Info" pill on the right. */
export function ScreenHeader({ title, onInfoPress }: Props) {
  const insets = useSafeAreaInsets();

  // A deep link can open this screen with nothing to go back to; fall back to Home.
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <View style={styles.row}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={12} onPress={goBack} style={styles.back}>
          <Image source={require('@/assets/images/settlement/back.svg')} style={styles.chevron} contentFit="contain" />
          <Text style={styles.backLabel}>Back</Text>
        </Pressable>

        {/* Absolutely centered so the title stays centered regardless of the side items' widths. */}
        <View style={styles.titleWrap} pointerEvents="none">
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
        </View>

        {onInfoPress && (
          <Pressable accessibilityRole="button" accessibilityLabel="Info" onPress={onInfoPress} style={styles.info}>
            <Text style={styles.infoLabel}>Info</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Palette.white,
  },
  row: {
    height: 56,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chevron: {
    width: 14,
    height: 28,
  },
  backLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: Palette.linkBlue,
  },
  titleWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: 0.15,
    color: Palette.black,
  },
  info: {
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 0.1,
    borderColor: Palette.black,
    backgroundColor: Palette.infoFill,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Palette.linkBlue,
  },
});
