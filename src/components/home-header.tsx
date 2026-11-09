import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette } from '@/constants/theme';

/** Top bar: logo, centered "Settlements" title, menu button. Pads for the status bar. */
export function HomeHeader({ onMenuPress }: { onMenuPress?: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
      <View style={styles.side}>
        <Image
          source={require('@/assets/images/home/logo.png')}
          style={styles.logo}
          contentFit="contain"
          accessibilityLabel="Mode"
        />
      </View>
      <Text style={styles.title}>Settlements</Text>
      <View style={[styles.side, styles.sideEnd]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Menu" onPress={onMenuPress}>
          <Image
            source={require('@/assets/images/home/menu-button.svg')}
            style={styles.menu}
            contentFit="contain"
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingBottom: 10,
    backgroundColor: Palette.white,
    shadowColor: Palette.black,
    shadowOpacity: 0.09,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  // Equal-width side columns keep the title truly centered.
  side: {
    flex: 1,
  },
  sideEnd: {
    alignItems: 'flex-end',
  },
  logo: {
    width: 68,
    height: 28,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.black,
  },
  menu: {
    width: 35,
    height: 35,
  },
});
