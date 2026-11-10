import { Image } from 'expo-image';
import { TabList, Tabs, TabSlot, TabTrigger, type TabListProps, type TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaxContentWidth, Palette } from '@/constants/theme';

// Figma tab icons. Sizes are the icon frames from the design.
const ICONS = {
  home: { source: require('@/assets/images/home/tab-home.svg'), width: 30, height: 30 },
  wallet: { source: require('@/assets/images/home/tab-wallet.svg'), width: 34, height: 34 },
  forms: { source: require('@/assets/images/home/tab-forms.svg'), width: 31, height: 32 },
} as const;

export default function AppTabs() {
  return (
    <Tabs style={styles.root}>
      <TabSlot style={styles.slot} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton label="Home" icon="home" />
          </TabTrigger>
          <TabTrigger name="wallet" href="/wallet" asChild>
            <TabButton label="Wallet" icon="wallet" />
          </TabTrigger>
          <TabTrigger name="forms" href="/forms" asChild>
            <TabButton label="Forms" icon="forms" />
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

type TabButtonProps = TabTriggerSlotProps & {
  label: string;
  icon: keyof typeof ICONS;
};

/** One tab: icon over a 10pt label. Focused = black, otherwise grey. */
export function TabButton({ label, icon, isFocused, children: _children, ...props }: TabButtonProps) {
  const color = isFocused ? Palette.black : Palette.tabInactive;
  const { source, width, height } = ICONS[icon];

  return (
    // Cast: expo-router/ui types the slot's `ref` as a component instead of an element, which
    // Pressable rejects. At runtime the ref is a normal element ref.
    <Pressable {...(props as PressableProps)} accessibilityLabel={label} style={styles.tab}>
      <View style={styles.iconBox}>
        <Image source={source} style={{ width, height }} contentFit="contain" tintColor={color} />
      </View>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

/** White bar pinned under the screen. Bottom padding keeps it clear of the home indicator. */
export function CustomTabList(props: TabListProps) {
  const insets = useSafeAreaInsets();

  return (
    <View {...props} style={[styles.bar, { paddingBottom: insets.bottom }]}>
      <View style={styles.barInner}>{props.children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  slot: {
    flex: 1,
  },
  bar: {
    backgroundColor: Palette.white,
    borderTopWidth: 0.3,
    borderTopColor: Palette.tabBorder,
    shadowColor: Palette.black,
    shadowOpacity: 0.11,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: -3 },
    elevation: 8,
    alignItems: 'center',
  },
  barInner: {
    height: 64,
    width: '100%',
    maxWidth: MaxContentWidth,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  iconBox: {
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '500',
  },
});
