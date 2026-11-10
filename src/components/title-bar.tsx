import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette } from '@/constants/theme';

type Props = {
  title: string;
  /** Small grey text on the right, e.g. "3 files". */
  trailing?: string;
};

/** Tab header with a left-aligned title and optional trailing text. Pads for the status bar. */
export function TitleBar({ title, trailing }: Props) {
  const insets = useSafeAreaInsets();

  return (
    // Figma leaves 18px of screen background between the status bar and the white bar.
    <View style={[styles.safeArea, { paddingTop: insets.top + 18 }]}>
      <View style={styles.bar}>
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        {trailing ? <Text style={styles.trailing}>{trailing}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Palette.screenBackground,
  },
  bar: {
    height: 55,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Palette.white,
    boxShadow: '0px 0px 4px rgba(0,0,0,0.09)',
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: 0.15,
    color: Palette.black,
  },
  trailing: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: Palette.countText,
  },
});
