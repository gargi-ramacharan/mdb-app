import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandCluster } from '@/components/onboarding/heroes';
import { OnboardingScreen } from '@/components/onboarding/onboarding-screen';
import { Palette } from '@/constants/theme';
import { PLANS, type PaywallStep, type PlanId } from '@/data/onboarding';

type Props = {
  step: PaywallStep;
  plan: PlanId;
  onPlanChange: (plan: PlanId) => void;
  onContinue: () => void;
  onClose: () => void;
};

/** Weekly / yearly plan cards on the blue background. Buttons only set a dev flag (no purchases). */
export function PaywallScreen({ step, plan, onPlanChange, onContinue, onClose }: Props) {
  return (
    <OnboardingScreen
      hero={<BrandCluster />}
      title={step.title}
      body={step.body}
      onClose={onClose}
      button={{ label: step.button, onPress: onContinue }}
      footer={
        <View style={styles.links}>
          {/* No destinations yet: Terms / Privacy pages and purchase restore don't exist. */}
          {['Terms', 'Privacy', 'Restore'].map((label) => (
            <Pressable key={label} accessibilityRole="link" accessibilityLabel={label} hitSlop={8}>
              <Text style={styles.link}>{label}</Text>
            </Pressable>
          ))}
        </View>
      }>
      <View style={styles.plans} accessibilityRole="radiogroup">
        {PLANS.map((p) => {
          const selected = plan === p.id;
          return (
            <Pressable
              key={p.id}
              accessibilityRole="radio"
              accessibilityLabel={`${p.name}, ${p.price} ${p.period}`}
              accessibilityState={{ selected }}
              onPress={() => onPlanChange(p.id)}
              style={[styles.plan, selected && styles.planSelected]}>
              <View style={styles.row}>
                <Text style={styles.planName}>{p.name}</Text>
                <Text style={styles.planName}>{p.price}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.planNote}>{p.tagline}</Text>
                <Text style={styles.planNote}>{p.period}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  plans: {
    width: '100%',
    maxWidth: 365,
    gap: 14,
  },
  plan: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  planSelected: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planName: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: 0.15,
    color: Palette.white,
  },
  planNote: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: Palette.white,
  },
  links: {
    flexDirection: 'row',
    gap: 40,
  },
  link: {
    fontSize: 12,
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: 0.5,
    textDecorationLine: 'underline',
    color: Palette.white,
  },
});
