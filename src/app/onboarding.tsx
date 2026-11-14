import { Image } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BrandGrid } from '@/components/onboarding/brand-grid';
import { renderHero } from '@/components/onboarding/heroes';
import { OfferScreen } from '@/components/onboarding/offer-screen';
import { OnboardingScreen } from '@/components/onboarding/onboarding-screen';
import { PaywallScreen } from '@/components/onboarding/paywall-screen';
import { PayoutList } from '@/components/onboarding/payout-list';
import { Palette } from '@/constants/theme';
import {
  ONBOARDING_BRANDS,
  ONBOARDING_STEPS,
  PAYOUT_METHODS,
  type LoadingStep,
  type OnboardingStep,
  type PlanId,
} from '@/data/onboarding';
import { fetchClaimable } from '@/lib/api';
import { setDevPlan } from '@/lib/dev-flags';
import { useProfile } from '@/lib/profile';
import { formatCurrency } from '@/utils/claims';

const LAST = ONBOARDING_STEPS.length - 1;
const indexOfKind = (kind: OnboardingStep['kind']) => ONBOARDING_STEPS.findIndex((s) => s.kind === kind);
/** The loading screen stays up at least this long so "Estimating..." doesn't flash by. */
const MIN_ESTIMATING_MS = 2200;

const logo = require('@/assets/images/onboarding/logo.png');

/**
 * The whole first-run flow on one route: walks `ONBOARDING_STEPS` in order and keeps the answers.
 * Nothing is saved until "Claim My Cash". The paywall and offer come after: leaving the paywall shows
 * the offer, and leaving the offer (`leaveOffer`) hands the user over to the tabs.
 */
export default function OnboardingFlow() {
  const { state, saveOnboarding, leavePaywall, leaveOffer } = useProfile();

  // A user who already answered the questions but never left the paywall (e.g. quit on it) resumes there.
  const [index, setIndex] = useState(() => {
    const stage = state.status === 'ready' ? state.stage : 'onboarding';
    if (stage === 'paywall') return indexOfKind('paywall');
    if (stage === 'offer') return indexOfKind('offer');
    return 0;
  });
  const [brandKeys, setBrandKeys] = useState<string[]>([]);
  const [payout, setPayout] = useState<string | null>(null);
  const [claimable, setClaimable] = useState(0);
  const [plan, setPlan] = useState<PlanId>('yearly');
  const [saving, setSaving] = useState(false);

  const step = ONBOARDING_STEPS[index];
  const next = useCallback(() => setIndex((i) => Math.min(i + 1, LAST)), []);

  const toggleBrand = (key: string) =>
    setBrandKeys((keys) => (keys.includes(key) ? keys.filter((k) => k !== key) : [...keys, key]));

  const onEstimated = useCallback((total: number) => {
    setClaimable(total);
    next();
  }, [next]);

  const claimMyCash = async () => {
    if (saving || !payout) return;
    setSaving(true);
    // If the save fails, `saveOnboarding` logs it and lets the user straight through to Home.
    const result = await saveOnboarding({ brandKeys, payoutMethod: payout });
    setSaving(false);
    if (result === 'saved') next(); // on to the paywall
  };

  // Paywall and offer buttons only record a dev flag; there are no real purchases yet. Every way out
  // of them saves `paywall_seen` (via leavePaywall / leaveOffer).
  const closePaywall = () => {
    void leavePaywall();
    next(); // the one-time offer
  };
  const subscribe = async () => {
    await setDevPlan(plan);
    closePaywall();
  };
  const acceptOffer = async () => {
    await setDevPlan('offer');
    void leaveOffer();
  };

  switch (step.kind) {
    case 'welcome':
      return (
        <OnboardingScreen
          button={{ label: step.button, onPress: next }}
          footer={
            <Text style={styles.terms}>
              by continuing you agree to our <Text style={styles.underline}>Terms of Use</Text> and{' '}
              <Text style={styles.underline}>Class Action Terms</Text>
            </Text>
          }>
          <Image source={logo} style={styles.logo} contentFit="contain" accessibilityLabel="Mode mobile" />
        </OnboardingScreen>
      );

    case 'intro':
      return (
        <OnboardingScreen
          progress={step.progress}
          eyebrow={step.eyebrow}
          hero={step.hero && renderHero(step.hero)}
          title={step.title}
          titleSize={step.titleSize}
          extra={step.extra && renderHero(step.extra)}
          body={step.body}
          button={{ label: step.button, onPress: next }}
        />
      );

    case 'brands':
      return (
        <OnboardingScreen
          align="top"
          progress={step.progress}
          title={step.title}
          titleVariant="plain"
          body={step.body}
          button={{ label: step.button, onPress: next, disabled: brandKeys.length === 0 }}>
          <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
            <BrandGrid brands={ONBOARDING_BRANDS} selected={brandKeys} onToggle={toggleBrand} />
          </ScrollView>
        </OnboardingScreen>
      );

    case 'payout':
      return (
        <OnboardingScreen
          align="top"
          progress={step.progress}
          title={step.title}
          titleVariant="plain"
          body={step.body}
          button={{ label: step.button, onPress: next, disabled: !payout }}>
          <View style={styles.listWrap}>
            <PayoutList options={PAYOUT_METHODS} value={payout} onChange={setPayout} />
          </View>
        </OnboardingScreen>
      );

    case 'loading':
      return <EstimatingScreen step={step} brandKeys={brandKeys} onDone={onEstimated} />;

    case 'result':
      return (
        <OnboardingScreen
          progress={step.progress}
          hero={<Image source={logo} style={styles.logo} contentFit="contain" accessibilityLabel="Mode mobile" />}
          title={`${formatCurrency(claimable)} claimable`}
          body={step.body}
          button={{ label: step.button, onPress: claimMyCash, disabled: saving }}
        />
      );

    case 'paywall':
      // Continue and the X both lead to the one-time offer.
      return (
        <PaywallScreen step={step} plan={plan} onPlanChange={setPlan} onContinue={subscribe} onClose={closePaywall} />
      );

    case 'offer':
      return <OfferScreen step={step} onAccept={acceptOffer} onClose={() => void leaveOffer()} />;
  }
}

/** "Estimating settlements..." spinner. Looks up the claimable total, then moves on by itself. */
function EstimatingScreen({
  step,
  brandKeys,
  onDone,
}: {
  step: LoadingStep;
  brandKeys: string[];
  onDone: (total: number) => void;
}) {
  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchClaimable(brandKeys), new Promise((resolve) => setTimeout(resolve, MIN_ESTIMATING_MS))]).then(
      ([total]) => {
        if (!cancelled) onDone(total);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [brandKeys, onDone]);

  return (
    <OnboardingScreen
      progress={step.progress}
      hero={<Image source={logo} style={styles.logo} contentFit="contain" accessibilityLabel="Mode mobile" />}
      body={step.body}>
      <ActivityIndicator size="large" color={Palette.white} accessibilityLabel="Estimating settlements" />
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 263,
    height: 108,
  },
  terms: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: 0.5,
    textAlign: 'center',
    color: Palette.white,
  },
  underline: {
    textDecorationLine: 'underline',
  },
  // Lets a long grid scroll under the title without pushing the Next button off screen.
  pickerScroll: {
    flex: 1,
    width: '100%',
    maxWidth: 340,
  },
  listWrap: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 20,
  },
});
