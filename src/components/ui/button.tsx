import { Image, type ImageSource } from 'expo-image';
import { Pressable, StyleSheet, Text, type PressableProps, type ViewStyle } from 'react-native';

import { Palette } from '@/constants/theme';

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  /**
   * `primary` = purple fill / white text. `inverse` = white fill / purple text (for use on the purple banner).
   * `secondary` = light grey fill / black text.
   */
  variant?: 'primary' | 'inverse' | 'secondary';
  /** `md` is the compact list button; `lg` is the full-width call-to-action. */
  size?: 'md' | 'lg';
  /** Optional icon shown after the label. */
  icon?: ImageSource;
  style?: ViewStyle;
};

const variants = {
  primary: { background: Palette.purple700, text: Palette.white },
  inverse: { background: Palette.white, text: '#6750a4' },
  secondary: { background: Palette.secondaryFill, text: Palette.black },
} as const;

export function Button({ label, variant = 'primary', size = 'md', icon, style, ...rest }: ButtonProps) {
  const { background, text } = variants[variant];
  const isLarge = size === 'lg';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.base,
        isLarge && styles.large,
        { backgroundColor: background },
        pressed && styles.pressed,
        style,
      ]}
      {...rest}>
      <Text style={[styles.label, isLarge && styles.largeLabel, { color: text }]}>{label}</Text>
      {icon && <Image source={icon} style={styles.icon} contentFit="contain" />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 35,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  large: {
    minHeight: 65,
    borderRadius: 15,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  largeLabel: {
    fontSize: 19,
  },
  icon: {
    width: 18,
    height: 18,
  },
});
