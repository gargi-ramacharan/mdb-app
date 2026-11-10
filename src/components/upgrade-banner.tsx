import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { purpleGradient } from '@/constants/gradients';
import { Palette } from '@/constants/theme';

// Figma angle for this banner.
const gradient = purpleGradient(105.84);

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
    // Figma's title box is 12px tall (the text overflows it). 22px line height + 25px padding keeps
    // the banner at the designed ~117px without clipping the 20px title.
    paddingVertical: 25,
    borderRadius: 15,
    overflow: 'hidden',
  },
  copy: {
    width: 196,
    gap: 8,
  },
  title: {
    fontSize: 20,
    lineHeight: 22,
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
