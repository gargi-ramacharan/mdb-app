import { StyleSheet, View } from 'react-native';

import { Palette } from '@/constants/theme';

/** Thin rounded progress track. `progress` is 0–1. */
export function ProgressBar({ progress }: { progress: number }) {
  const clamped = Math.min(1, Math.max(0, progress));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={styles.track}>
      <View style={[styles.fill, { width: `${clamped * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 7,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Palette.neutralTrack,
  },
  fill: {
    height: 7,
    minWidth: 7,
    borderRadius: 16,
    backgroundColor: Palette.progressFill,
  },
});
