import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Button } from '@/components/ui/button';
import { Palette } from '@/constants/theme';

// RN 0.88 supports CSS gradients through `experimental_backgroundImage`. This avoids adding a
// gradient package. `backgroundColor` is the fallback where the gradient is not supported.
const gradient = {
  backgroundColor: Palette.purple800,
  experimental_backgroundImage: `linear-gradient(106deg, ${Palette.purple800} 0.65%, ${Palette.purple500} 97.4%)`,
} as ViewStyle;

export function UpgradeBanner({ onUpgrade }: { onUpgrade?: () => void }) {
  return (
    <View style={[styles.banner, gradient]}>
      <View style={styles.copy}>
        <Text style={styles.title}>Unlimited Claims</Text>
        <Text style={styles.subtitle}>Become a member for only $9.99</Text>
      </View>
      <Button label="Upgrade" variant="inverse" onPress={onUpgrade} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 29,
    borderRadius: 15,
    overflow: 'hidden',
  },
  copy: {
    width: 196,
    gap: 10,
  },
  title: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: Palette.white,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '600',
    color: Palette.white,
  },
  button: {
    width: 97,
    padding: 8,
  },
});
