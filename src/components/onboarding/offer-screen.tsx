import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaxContentWidth, Palette } from '@/constants/theme';
import type { OfferStep } from '@/data/onboarding';

type Props = {
  step: OfferStep;
  onAccept: () => void;
  onClose: () => void;
};

/** The one-time 50% offer. White, unlike the blue steps, so it doesn't use `OnboardingScreen`. */
export function OfferScreen({ step, onAccept, onClose }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.column}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={12}
          onPress={onClose}
          style={[styles.close, { top: insets.top + 14 }]}>
          <Text style={styles.closeGlyph}>✕</Text>
        </Pressable>

        <View style={[styles.content, { paddingTop: insets.top + 100 }]}>
          <Text accessibilityRole="header" style={styles.title}>
            {step.title}
            <Text style={styles.highlight}>{step.highlight}</Text>
          </Text>

          <Text style={styles.gift}>🎁</Text>

          <View style={styles.badge}>
            <Text style={styles.badgeCheck}>✓</Text>
            <Text style={styles.badgeLabel}>{step.badge}</Text>
          </View>

          <Text style={styles.body}>{step.body}</Text>
        </View>

        <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={step.button}
            onPress={onAccept}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
            <Text style={styles.buttonLabel}>{step.button}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.white,
  },
  column: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  close: {
    position: 'absolute',
    right: 26,
    zIndex: 2,
    width: 33,
    height: 33,
    borderRadius: 17,
    backgroundColor: 'rgba(125,125,125,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeGlyph: {
    color: Palette.neutralText,
    fontSize: 15,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 24,
  },
  title: {
    fontSize: 34,
    lineHeight: 36,
    fontWeight: '900',
    letterSpacing: 1.5,
    textAlign: 'center',
    color: Palette.black,
    maxWidth: 343,
  },
  highlight: {
    color: Palette.purple600,
  },
  gift: {
    fontSize: 150,
    lineHeight: 170,
    textAlign: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 43,
    paddingHorizontal: 18,
    borderRadius: 50,
    backgroundColor: Palette.purple600,
  },
  badgeCheck: {
    color: Palette.white,
    fontSize: 16,
    fontWeight: '800',
  },
  badgeLabel: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: Palette.white,
  },
  body: {
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
    color: Palette.black,
  },
  bottom: {
    paddingHorizontal: 42,
    alignItems: 'center',
  },
  button: {
    width: '100%',
    minHeight: 62,
    borderRadius: 50,
    backgroundColor: Palette.purple600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  buttonLabel: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '600',
    color: Palette.white,
  },
});
