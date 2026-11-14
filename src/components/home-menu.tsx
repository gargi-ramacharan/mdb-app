import { Image } from 'expo-image';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette } from '@/constants/theme';

export type HomeMenuItem = 'how' | 'privacy' | 'terms' | 'support';

/** Where the menu button is on screen, so the popover can sit just under it. */
export type MenuAnchor = { x: number; y: number; width: number; height: number };

const ITEMS: { id: HomeMenuItem; label: string; icon: number; iconSize: number }[] = [
  { id: 'how', label: 'How does this work', icon: require('@/assets/images/home/menu-info.svg'), iconSize: 20 },
  { id: 'privacy', label: 'Privacy Policy', icon: require('@/assets/images/home/menu-privacy.svg'), iconSize: 24 },
  { id: 'terms', label: 'Terms of Use', icon: require('@/assets/images/home/menu-terms.svg'), iconSize: 24 },
  { id: 'support', label: 'Contact Support', icon: require('@/assets/images/home/menu-support.svg'), iconSize: 17.33 },
];

type Props = {
  visible: boolean;
  anchor: MenuAnchor | null;
  onSelect: (item: HomeMenuItem) => void;
  onClose: () => void;
  /** iOS only: fires once the popover has finished dismissing (see the Home screen for why). */
  onDismiss?: () => void;
};

/** Small white popover under the Home header's menu button, over a dimmed backdrop. A tap outside closes it. */
export function HomeMenu({ visible, anchor, onSelect, onClose, onDismiss }: Props) {
  // Figma puts the card 16px under the button; fall back to that spot if the button wasn't measured.
  const top = anchor ? anchor.y + anchor.height + 16 : 134;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
      onDismiss={onDismiss}>
      <View style={styles.overlay}>
        {/* Behind the card, so only taps outside the card close it. */}
        <Pressable accessibilityRole="button" accessibilityLabel="Close menu" onPress={onClose} style={styles.backdrop} />

        <View accessibilityViewIsModal style={[styles.card, { top }]}>
          {ITEMS.map(({ id, label, icon, iconSize }) => (
            <Pressable
              key={id}
              accessibilityRole="menuitem"
              accessibilityLabel={label}
              onPress={() => onSelect(id)}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
              {/* Fixed 24px column so the labels line up whatever each icon's size. */}
              <View style={styles.iconBox}>
                <Image source={icon} style={{ width: iconSize, height: iconSize }} contentFit="contain" />
              </View>
              <Text style={styles.label}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.46)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  card: {
    position: 'absolute',
    right: 8,
    width: 238,
    paddingHorizontal: 19,
    paddingVertical: 28,
    gap: 27,
    borderRadius: 14,
    backgroundColor: Palette.white,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pressed: {
    opacity: 0.6,
  },
  iconBox: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '500',
    color: '#2c3e50',
  },
});
