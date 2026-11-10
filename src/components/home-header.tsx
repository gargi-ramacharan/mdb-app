import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette } from '@/constants/theme';

type Props = {
  title?: string;
  /** Home's title is 17pt in Figma; the Wallet's is 20pt. */
  titleSize?: number;
  /** Hide the menu button (the Wallet header has none). */
  showMenu?: boolean;
  onMenuPress?: () => void;
};

/** Top bar: logo, centered title, optional menu button. Pads for the status bar. */
export function HomeHeader({ title = 'Settlements', titleSize = 17, showMenu = true, onMenuPress }: Props) {
  const insets = useSafeAreaInsets();

  return (
    // Figma leaves 18px of screen background between the status bar and the white header.
    <View style={[styles.safeArea, { paddingTop: insets.top + 18 }]}>
      <View style={styles.header}>
        <View style={styles.side}>
          <Image
            source={require('@/assets/images/home/logo.png')}
            style={styles.logo}
            contentFit="contain"
            accessibilityLabel="Mode"
          />
        </View>
        <Text accessibilityRole="header" style={[styles.title, { fontSize: titleSize }]}>
          {title}
        </Text>
        <View style={[styles.side, styles.sideEnd]}>
          {showMenu && (
            <Pressable accessibilityRole="button" accessibilityLabel="Menu" onPress={onMenuPress}>
              <Image
                source={require('@/assets/images/home/menu-button.svg')}
                style={styles.menu}
                contentFit="contain"
              />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Palette.screenBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 10,
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
    fontWeight: '700',
    color: Palette.black,
  },
  menu: {
    width: 35,
    height: 35,
  },
});
