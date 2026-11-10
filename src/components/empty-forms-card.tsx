import { Image } from 'expo-image';
import { StyleSheet, Text } from 'react-native';

import { Card } from '@/components/ui/card';
import { Palette } from '@/constants/theme';

/** "No saved forms" card shown when the user has not submitted any forms yet. */
export function EmptyFormsCard() {
  return (
    <Card style={styles.card}>
      <Image source={require('@/assets/images/forms/empty-icon.svg')} style={styles.icon} contentFit="contain" />
      <Text style={styles.title}>No saved forms</Text>
      <Text style={styles.message}>Forms you fill out will be saved here for your records</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 221,
    alignItems: 'center',
    paddingTop: 27,
    paddingBottom: 38,
    paddingHorizontal: 27,
    gap: 16,
    // Slightly stronger than the other cards in the design.
    boxShadow: '0px 0px 4.2px rgba(0,0,0,0.15)',
  },
  icon: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: 0.15,
    color: Palette.black,
  },
  message: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '500',
    textAlign: 'center',
    color: Palette.subtleText,
  },
});
