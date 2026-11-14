import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette } from '@/constants/theme';

type Props = {
  options: readonly string[];
  value: string | null;
  onChange: (value: string) => void;
};

/** Single-select list of white pill rows with a lavender outline (purple when chosen). */
export function PayoutList({ options, value, onChange }: Props) {
  return (
    <View style={styles.list} accessibilityRole="radiogroup">
      {options.map((option) => {
        const selected = value === option;
        return (
          <Pressable
            key={option}
            accessibilityRole="radio"
            accessibilityLabel={option}
            accessibilityState={{ selected }}
            onPress={() => onChange(option)}
            style={({ pressed }) => [styles.row, selected && styles.rowSelected, pressed && styles.pressed]}>
            <Text style={styles.label}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    width: '100%',
    maxWidth: 345,
    gap: 20,
  },
  row: {
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#d0bcff',
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowSelected: {
    borderColor: Palette.purple600,
    backgroundColor: '#efe6ff',
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    color: Palette.black,
  },
});
