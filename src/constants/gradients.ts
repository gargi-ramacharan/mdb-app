import { Platform, type ViewStyle } from 'react-native';

import { Palette } from '@/constants/theme';

/**
 * Brand purple gradient (purple-800 to purple-500) at the given CSS angle, as a style object.
 * No gradient package is needed:
 * - native: RN 0.88 reads CSS gradients from `experimental_backgroundImage`
 * - web: react-native-web ignores that prop, but passes a plain CSS `backgroundImage` through
 * `backgroundColor` is the fallback anywhere the gradient isn't supported.
 */
export function purpleGradient(angleDeg: number): ViewStyle {
  const gradient = `linear-gradient(${angleDeg}deg, ${Palette.purple800} 0.65%, ${Palette.purple500} 97.45%)`;

  return Platform.select({
    web: { backgroundColor: Palette.purple800, backgroundImage: gradient },
    default: { backgroundColor: Palette.purple800, experimental_backgroundImage: gradient },
  }) as ViewStyle;
}
