import { Pressable, StyleSheet, Text, type PressableProps, type ViewStyle } from 'react-native';

import { Palette } from '@/constants/theme';

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  /** `primary` = purple fill / white text. `inverse` = white fill / purple text (for use on the purple banner). */
  variant?: 'primary' | 'inverse';
  style?: ViewStyle;
};

export function Button({ label, variant = 'primary', style, ...rest }: ButtonProps) {
  const isInverse = variant === 'inverse';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: isInverse ? Palette.white : Palette.purple700 },
        pressed && styles.pressed,
        style,
      ]}
      {...rest}>
      <Text style={[styles.label, { color: isInverse ? '#6750a4' : Palette.white }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 35,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
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
});
