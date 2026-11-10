import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { SettlementDetailsContent } from '@/components/settlement-details-content';
import { StateMessage } from '@/components/state-message';
import { Button } from '@/components/ui/button';
import { MaxContentWidth, Palette } from '@/constants/theme';
import type { SettlementDetails } from '@/data/placeholder';
import { useSettlementDetails } from '@/hooks/use-settlement-details';

export default function SettlementDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, retry } = useSettlementDetails(id);

  return (
    <View style={styles.screen}>
      {/* Info has no destination in the design yet, so it is a no-op for now. */}
      <ScreenHeader title="Settlement Details" onInfoPress={state.status === 'ready' ? () => {} : undefined} />

      {state.status === 'loading' && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Palette.purple600} accessibilityLabel="Loading settlement" />
        </View>
      )}

      {state.status === 'error' && (
        <StateMessage
          tone="error"
          title="Couldn’t load this settlement"
          message="Check your connection and try again."
          action={{ label: 'Try again', onPress: retry }}
        />
      )}

      {state.status === 'empty' && (
        <StateMessage title="Settlement not found" message="It may have expired or been removed." />
      )}

      {state.status === 'ready' && <Ready settlement={state.settlement} />}
    </View>
  );
}

function Ready({ settlement }: { settlement: SettlementDetails }) {
  const insets = useSafeAreaInsets();

  const share = () =>
    // Share sheet is built into React Native; no extra package needed.
    Share.share({ message: `${settlement.title}: ${settlement.headline}` }).catch(() => {});

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <SettlementDetailsContent settlement={settlement} />
      </ScrollView>

      {/* Sits below the scroll view (not over it), so content never hides behind the buttons. */}
      <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.actionsInner}>
          <Button label="Tell your friends" variant="secondary" size="lg" icon={require('@/assets/images/settlement/send.svg')} onPress={share} />
          {/* The claim flow isn't designed yet, so Get Started has no handler. */}
          <Button label="Get Started" size="lg" style={styles.getStarted} />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.white,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  actions: {
    backgroundColor: Palette.white,
    paddingTop: 22,
    paddingHorizontal: 25,
    alignItems: 'center',
    shadowColor: Palette.black,
    shadowOpacity: 0.25,
    shadowRadius: 13,
    shadowOffset: { width: 0, height: -2 },
    elevation: 12,
  },
  actionsInner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: 7,
  },
  getStarted: {
    backgroundColor: Palette.purple600,
  },
});
