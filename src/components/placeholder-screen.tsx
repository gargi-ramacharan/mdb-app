import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette } from '@/constants/theme';

/** Temporary body for tabs whose real screens are not built yet. */
export function PlaceholderScreen({ title }: { title: string }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Palette.screenBackground,
  },
  title: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '700',
    color: Palette.black,
  },
  subtitle: {
    fontSize: 15,
    color: Palette.neutralText,
  },
});
