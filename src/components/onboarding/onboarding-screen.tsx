import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaxContentWidth, Palette } from '@/constants/theme';

/** Onboarding's blue (the money-pattern image sits on top of it, and shows through while it loads). */
export const OnboardingBlue = '#2f7de9';

type Props = {
  /** 0 to 1. Leave out to hide the progress bar (welcome and paywall). */
  progress?: number;
  /** Small line above the hero / title. */
  eyebrow?: string;
  hero?: ReactNode;
  title?: string;
  /** `display` = heavy italic headline; `plain` = regular question text. */
  titleVariant?: 'display' | 'plain';
  titleSize?: number;
  /** Sits between the title and the body (review card, stars). */
  extra?: ReactNode;
  body?: string;
  /** Anything else (brand grid, payout list, spinner, plan cards). */
  children?: ReactNode;
  /** `center` floats the content in the middle; `top` stacks it under the progress bar. */
  align?: 'center' | 'top';
  button?: { label: string; onPress: () => void; disabled?: boolean };
  /** Under the button (terms line, Terms / Privacy / Restore). */
  footer?: ReactNode;
  /** Shows the round X at the top left. */
  onClose?: () => void;
};

/**
 * The shared onboarding layout: blue money-pattern background, progress bar, content, and a white
 * pill button. Every blue step in the flow is this component with different props.
 */
export function OnboardingScreen({
  progress,
  eyebrow,
  hero,
  title,
  titleVariant = 'display',
  titleSize,
  extra,
  body,
  children,
  align = 'center',
  button,
  footer,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
  const isDisplay = titleVariant === 'display';

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <Image source={require('@/assets/images/onboarding/background.png')} style={styles.background} contentFit="cover" />

      <View style={[styles.column, { paddingTop: insets.top + 8 }]}>
        {progress !== undefined && <ProgressBar progress={progress} />}

        {onClose && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            hitSlop={12}
            onPress={onClose}
            style={[styles.close, { top: insets.top + 4 }]}>
            <Text style={styles.closeGlyph}>✕</Text>
          </Pressable>
        )}

        <View style={[styles.content, align === 'center' ? styles.contentCenter : styles.contentTop]}>
          {eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
          {hero}
          {title && (
            <Text
              accessibilityRole="header"
              style={[
                isDisplay ? styles.displayTitle : styles.plainTitle,
                isDisplay && titleSize ? { fontSize: titleSize, lineHeight: Math.round(titleSize * 1.05) } : null,
              ]}>
              {title}
            </Text>
          )}
          {extra}
          {body && <Text style={isDisplay ? styles.body : styles.plainBody}>{body}</Text>}
          {children}
        </View>

        {(button || footer) && (
          <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 16) + 28 }]}>
            {button && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={button.label}
                accessibilityState={{ disabled: !!button.disabled }}
                disabled={button.disabled}
                onPress={button.onPress}
                style={({ pressed }) => [styles.button, button.disabled && styles.buttonDisabled, pressed && styles.pressed]}>
                <Text style={styles.buttonLabel}>{button.label}</Text>
              </Pressable>
            )}
            {footer}
          </View>
        )}
      </View>
    </View>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
      style={styles.track}>
      <View style={[styles.fill, { width: `${Math.min(Math.max(progress, 0), 1) * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: OnboardingBlue,
  },
  background: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  // Caps the content width on tablets / web, like the rest of the app.
  column: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  track: {
    height: 11,
    marginHorizontal: 38,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: Palette.white,
  },
  close: {
    position: 'absolute',
    left: 25,
    zIndex: 2,
    width: 33,
    height: 33,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeGlyph: {
    color: Palette.white,
    fontSize: 15,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  contentCenter: {
    justifyContent: 'center',
    paddingTop: 24,
    gap: 18,
  },
  contentTop: {
    paddingTop: 64,
    gap: 12,
  },
  eyebrow: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: 0.5,
    textAlign: 'center',
    color: Palette.white,
  },
  displayTitle: {
    fontSize: 40,
    lineHeight: 42,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: 1.5,
    textAlign: 'center',
    color: Palette.white,
    textShadowColor: '#236ac4',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 4,
    maxWidth: 340,
  },
  plainTitle: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '400',
    textAlign: 'center',
    color: Palette.white,
    maxWidth: 323,
  },
  body: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
    color: Palette.white,
    maxWidth: 300,
  },
  plainBody: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    textAlign: 'center',
    color: Palette.white,
    maxWidth: 260,
  },
  bottom: {
    alignItems: 'center',
    paddingHorizontal: 64,
    paddingTop: 16,
    gap: 16,
  },
  button: {
    width: '100%',
    maxWidth: 297,
    minHeight: 62,
    borderRadius: 50,
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
  buttonLabel: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '600',
    color: Palette.purple600,
  },
});
