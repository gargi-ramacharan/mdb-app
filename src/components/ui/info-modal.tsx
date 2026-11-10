import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Palette } from '@/constants/theme';

type Props = {
  visible: boolean;
  title: string;
  /** One paragraph, or several (rendered with a gap between them). */
  message: string | string[];
  buttonLabel?: string;
  onClose: () => void;
};

/**
 * Centered frosted card over a dimmed backdrop, with a title, body text and one dismiss button.
 * Generic on purpose: any screen can use it for "how does this work?" explanations.
 * Closes from the button, a tap on the backdrop, or the Android back button.
 */
export function InfoModal({ visible, title, message, buttonLabel = 'Got it!', onClose }: Props) {
  const paragraphs = Array.isArray(message) ? message : [message];

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Sits behind the card, so only taps outside the card dismiss. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />

        <View accessibilityViewIsModal style={styles.card}>
          <Text accessibilityRole="header" style={styles.title}>
            {title}
          </Text>

          <View style={styles.body}>
            {paragraphs.map((paragraph) => (
              <Text key={paragraph} style={styles.paragraph}>
                {paragraph}
              </Text>
            ))}
          </View>

          <Button label={buttonLabel} variant="secondary" size="lg" onPress={onClose} style={styles.button} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: Palette.scrim,
  },
  card: {
    width: '100%',
    maxWidth: 327,
    paddingHorizontal: 27,
    paddingVertical: 31,
    gap: 17,
    borderRadius: 39,
    borderWidth: 1,
    borderColor: Palette.white,
    backgroundColor: Palette.modalFill,
  },
  title: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '600',
    textAlign: 'center',
    color: Palette.black,
  },
  body: {
    gap: 18,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.5,
    color: Palette.black,
  },
  // Figma's pill button: shorter and rounder than the default large button, on a translucent grey.
  button: {
    minHeight: 53,
    borderRadius: 32,
    marginTop: 8,
    backgroundColor: Palette.modalButton,
  },
});
