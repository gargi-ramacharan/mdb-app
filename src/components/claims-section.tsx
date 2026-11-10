import { Image } from 'expo-image';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ClaimRow } from '@/components/claim-row';
import { Button } from '@/components/ui/button';
import { Palette } from '@/constants/theme';
import type { Claim } from '@/data/placeholder';

type Props = {
  /** Section heading, e.g. "IN-PROGRESS". */
  title: string;
  state: 'loading' | 'error' | 'ready';
  claims: Claim[];
  empty: { title: string; message: string };
  onRetry: () => void;
};

/** A titled list of claims that also handles its own loading, error and empty states. */
export function ClaimsSection({ title, state, claims, empty, onRetry }: Props) {
  const isEmpty = state === 'ready' && claims.length === 0;

  return (
    <View style={[styles.section, isEmpty && styles.sectionEmpty]}>
      <Text accessibilityRole="header" style={styles.heading}>
        {title}
      </Text>

      {state === 'loading' && (
        <View style={styles.placeholder}>
          <ActivityIndicator color={Palette.purple600} accessibilityLabel={`Loading ${title.toLowerCase()} claims`} />
        </View>
      )}

      {state === 'error' && (
        <View style={styles.placeholder} accessibilityRole="alert">
          <Text style={[styles.emptyTitle, styles.errorTitle]}>Couldn’t load claims</Text>
          <Button label="Try again" onPress={onRetry} style={styles.retry} />
        </View>
      )}

      {isEmpty && (
        <View style={styles.empty}>
          <View style={styles.clockBox}>
            <Image source={require('@/assets/images/wallet/clock.svg')} style={styles.clock} contentFit="contain" />
          </View>
          <View>
            <Text style={styles.emptyTitle}>{empty.title}</Text>
            <Text style={styles.emptyMessage}>{empty.message}</Text>
          </View>
        </View>
      )}

      {state === 'ready' && claims.length > 0 && (
        <View style={styles.list}>
          {claims.map((claim) => (
            <ClaimRow key={claim.id} claim={claim} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 15,
  },
  // Figma spaces the two empty sections 51 apart, versus 20 when they hold rows.
  sectionEmpty: {
    gap: 40,
    paddingBottom: 31,
  },
  heading: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    color: Palette.sectionText,
  },
  list: {
    gap: 17,
  },
  // Same height as the empty state so the layout doesn't jump when loading finishes.
  placeholder: {
    minHeight: 84,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  empty: {
    alignItems: 'center',
    gap: 6,
  },
  // The clock art is 24.83px inside Figma's 28px box.
  clockBox: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clock: {
    width: 24.83,
    height: 24.83,
  },
  emptyTitle: {
    fontSize: 16,
    lineHeight: 28,
    fontWeight: '600',
    textAlign: 'center',
    color: Palette.sectionText,
  },
  errorTitle: {
    color: Palette.errorText,
  },
  emptyMessage: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    color: Palette.sectionTextMuted,
  },
  retry: {
    minWidth: 120,
  },
});
