import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { SettlementDetailsContent } from '@/components/settlement-details-content';
import { StateMessage } from '@/components/state-message';
import { Button } from '@/components/ui/button';
import { MaxContentWidth, Palette } from '@/constants/theme';
import type { SettlementDetails } from '@/data/placeholder';
import { useSettlementDetails } from '@/hooks/use-settlement-details';
import { startClaim } from '@/lib/claims';

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
  const [claiming, setClaiming] = useState(false);
  // `done` covers both a new claim and a duplicate: either way there is nothing more to start.
  const [outcome, setOutcome] = useState<{ done: boolean; tone: 'ok' | 'error'; message: string } | null>(null);

  const getStarted = async () => {
    if (claiming) return;
    setClaiming(true);
    const result = await startClaim(settlement.id);
    setClaiming(false);

    if (result.status === 'started') {
      setOutcome({ done: true, tone: 'ok', message: 'Claim started! Track it in your Wallet.' });
    } else if (result.status === 'duplicate') {
      setOutcome({ done: true, tone: 'ok', message: result.message });
    } else {
      setOutcome({ done: false, tone: 'error', message: result.message });
    }
  };

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
          {outcome && (
            <Text
              accessibilityRole={outcome.tone === 'error' ? 'alert' : undefined}
              style={[styles.outcome, outcome.tone === 'error' && styles.outcomeError]}>
              {outcome.message}
            </Text>
          )}
          <Button
            label={claiming ? 'Starting…' : outcome?.done ? 'Claim started' : 'Get Started'}
            size="lg"
            onPress={getStarted}
            disabled={claiming || outcome?.done}
            style={outcome?.done || claiming ? { ...styles.getStarted, ...styles.disabled } : styles.getStarted}
          />
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
  disabled: {
    opacity: 0.6,
  },
  outcome: {
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
    color: Palette.mutedText,
  },
  outcomeError: {
    color: Palette.errorText,
  },
});
