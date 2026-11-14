import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandAvatar } from '@/components/ui/brand-avatar';
import { Palette } from '@/constants/theme';

type Brand = { name: string; key: string };

type Props = {
  brands: Brand[];
  /** `brand_key`s currently selected. */
  selected: string[];
  onToggle: (key: string) => void;
};

/** Two-column multi-select grid of white brand tiles (a letter avatar stands in for each logo). */
export function BrandGrid({ brands, selected, onToggle }: Props) {
  return (
    <View style={styles.grid}>
      {brands.map(({ name, key }) => {
        const isSelected = selected.includes(key);
        return (
          <Pressable
            key={key}
            accessibilityRole="checkbox"
            accessibilityLabel={name}
            accessibilityState={{ checked: isSelected }}
            onPress={() => onToggle(key)}
            style={({ pressed }) => [styles.tile, isSelected && styles.tileSelected, pressed && styles.pressed]}>
            <BrandAvatar name={name} size={44} radius={12} />
            <Text style={styles.name}>{name}</Text>
            {isSelected && (
              <View style={styles.check}>
                <Text style={styles.checkGlyph}>✓</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 25,
    rowGap: 16,
  },
  // Two tiles per row: each takes ~40% of the width and grows to share the leftover space.
  tile: {
    flexBasis: '40%',
    flexGrow: 1,
    height: 109,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: 'transparent',
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  tileSelected: {
    borderColor: Palette.purple600,
  },
  pressed: {
    opacity: 0.85,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: Palette.black,
  },
  check: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Palette.purple600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkGlyph: {
    color: Palette.white,
    fontSize: 13,
    fontWeight: '800',
  },
});
