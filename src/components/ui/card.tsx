import { StyleSheet, View, type ViewProps } from 'react-native';

import { Palette } from '@/constants/theme';

/** White rounded surface with the soft shadow used by the featured and list cards. */
export function Card({ style, ...rest }: ViewProps) {
  return <View style={[styles.card, style]} {...rest} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.white,
    borderRadius: 15,
    shadowColor: Palette.black,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});
