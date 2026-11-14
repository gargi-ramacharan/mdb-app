import { StyleSheet, Text, View } from 'react-native';

type Tone = { background: string; text: string };

// Soft pastel fill with a darker shade of the same hue for the letter.
const TONES: Tone[] = [
  { background: '#ffe0e6', text: '#c2374f' }, // rose
  { background: '#ffe8d1', text: '#c2691f' }, // peach
  { background: '#fff3c7', text: '#a07200' }, // butter
  { background: '#dff5e3', text: '#2b8a47' }, // mint
  { background: '#d9f3f1', text: '#1f8a84' }, // teal
  { background: '#dcecff', text: '#2f6fc0' }, // sky
  { background: '#e6e1ff', text: '#5a49c7' }, // periwinkle
  { background: '#f4e0f9', text: '#9a3fb3' }, // orchid
];

// Known brands get a fixed, distinct tone (index into TONES) so no two of them collide.
const BRAND_TONES: Record<string, number> = {
  apple: 0,
  instagram: 7,
  tesla: 5,
  meta: 6,
  facebook: 6,
  google: 2,
  doordash: 1,
  amazon: 3,
  fortnite: 4,
  spotify: 3,
  pepsi: 5,
  tyson: 1,
};

/** Same name always gets the same tone. Unknown brands fall back to a stable hash of the name. */
function toneFor(name: string): Tone {
  const key = name.trim().toLowerCase();
  const known = BRAND_TONES[key];
  if (known !== undefined) return TONES[known];

  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return TONES[hash % TONES.length];
}

/** Rounded pastel square showing the brand's first letter. Stands in for a logo until real ones exist. */
export function BrandAvatar({ name, size = 45, radius = 5 }: { name: string; size?: number; radius?: number }) {
  const letter = name.trim().charAt(0).toUpperCase();
  const tone = toneFor(name);

  return (
    <View
      accessible
      accessibilityLabel={name}
      style={[styles.square, { width: size, height: size, borderRadius: radius, backgroundColor: tone.background }]}>
      <Text style={[styles.letter, { fontSize: Math.round(size * 0.45), color: tone.text }]}>{letter}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  square: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontWeight: '800',
  },
});
