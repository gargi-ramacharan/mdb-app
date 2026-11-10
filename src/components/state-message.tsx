import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Palette } from '@/constants/theme';

type Props = {
  title: string;
  message: string;
  /** Renders a button under the message, e.g. "Try again". */
  action?: { label: string; onPress: () => void };
  tone?: 'neutral' | 'error';
};

/** Centered title + message used for the empty and error states. */
export function StateMessage({ title, message, action, tone = 'neutral' }: Props) {
  return (
    <View style={styles.container} accessibilityRole={tone === 'error' ? 'alert' : undefined}>
      <Text style={[styles.title, tone === 'error' && styles.errorTitle]}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {action && <Button label={action.label} onPress={action.onPress} style={styles.action} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 8,
  },
  title: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '600',
    textAlign: 'center',
    color: Palette.black,
  },
  errorTitle: {
    color: Palette.errorText,
  },
  message: {
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    color: Palette.mutedText,
  },
  action: {
    marginTop: 16,
    minWidth: 140,
  },
});
