import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ClaimsSection } from '@/components/claims-section';
import { DevDataToggle } from '@/components/dev-data-toggle';
import { HomeHeader } from '@/components/home-header';
import { PayoutCard } from '@/components/payout-card';
import { InfoModal } from '@/components/ui/info-modal';
import { MaxContentWidth, Palette, Spacing } from '@/constants/theme';
import type { PlaceholderSource } from '@/data/placeholder';
import { useClaims } from '@/hooks/use-claims';
import { formatCurrency, splitClaims, summarizeClaims } from '@/utils/claims';

const INFO_MESSAGE = [
  'The estimated payout is calculated by summing the estimated amounts from all your claimed settlements. These amounts are based on the settlement terms and your eligibility.',
  'All actual payouts are handled directly by the settlement administrators, not through this app. Payment timing and final amounts may vary based on the settlement process.',
];

export default function WalletScreen() {
  const [source, setSource] = useState<PlaceholderSource>('sample');
  const [infoVisible, setInfoVisible] = useState(false);
  const { state, retry } = useClaims(source);

  const claims = state.status === 'ready' ? state.claims : [];
  const { inProgress, finished } = splitClaims(claims);
  const { totalPayout, claimedCount, notifiedCount } = summarizeClaims(claims);

  // Until the claims are known, the card shows dashes instead of a misleading $0.
  const isReady = state.status === 'ready';
  const dash = '–';

  return (
    <View style={styles.screen}>
      <HomeHeader title="Wallet" titleSize={20} showMenu={false} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PayoutCard
          total={isReady ? formatCurrency(totalPayout) : dash}
          claimed={isReady ? String(claimedCount) : dash}
          notified={isReady ? String(notifiedCount) : dash}
          onInfoPress={() => setInfoVisible(true)}
        />

        <ClaimsSection
          title="IN-PROGRESS"
          state={state.status}
          claims={inProgress}
          empty={{ title: 'No active claims', message: 'Claims you’ve submitted will appear here' }}
          onRetry={retry}
        />
        <ClaimsSection
          title="FINISHED"
          state={state.status}
          claims={finished}
          empty={{ title: 'No completed claims', message: 'Finished claims will appear here' }}
          onRetry={retry}
        />

        <DevDataToggle value={source} onChange={setSource} />
      </ScrollView>

      <InfoModal
        visible={infoVisible}
        title="How Estimated Payouts Work"
        message={INFO_MESSAGE}
        onClose={() => setInfoVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.screenBackground,
  },
  content: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: 20,
    paddingTop: 23,
    paddingBottom: Spacing.four,
    gap: 20,
  },
});
