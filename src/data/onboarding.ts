/**
 * Everything the onboarding flow shows, as data. The flow screen (`src/app/onboarding.tsx`) walks
 * this array in order and renders each step with the one reusable `OnboardingScreen`; copy, order and
 * progress live here. Copy and layout come from the Figma "onboarding flow" frames.
 */

/** Named heroes / extras the intro screens can show (see `components/onboarding/heroes.tsx`). */
export type HeroKey = 'judge' | 'moneybag' | 'brands' | 'bell' | 'appleCard' | 'reviewCard' | 'stars';

export type WelcomeStep = {
  kind: 'welcome';
  button: string;
};

export type IntroStep = {
  kind: 'intro';
  progress: number;
  /** Small line above the hero / title. */
  eyebrow?: string;
  hero?: HeroKey;
  title: string;
  /** Display titles default to 40; the big-number screens go larger. */
  titleSize?: number;
  /** Shown between the title and the body (e.g. the review card, the stars). */
  extra?: HeroKey;
  body?: string;
  button: string;
};

export type BrandsStep = { kind: 'brands'; progress: number; title: string; body: string; button: string };
export type PayoutStep = { kind: 'payout'; progress: number; title: string; body: string; button: string };
export type LoadingStep = { kind: 'loading'; progress: number; body: string };
export type ResultStep = { kind: 'result'; progress: number; body: string; button: string };
export type PaywallStep = {
  kind: 'paywall';
  title: string;
  body: string;
  button: string;
};
export type OfferStep = {
  kind: 'offer';
  title: string;
  highlight: string;
  badge: string;
  body: string;
  button: string;
};

export type OnboardingStep =
  | WelcomeStep
  | IntroStep
  | BrandsStep
  | PayoutStep
  | LoadingStep
  | ResultStep
  | PaywallStep
  | OfferStep;

// Intro progress runs from 8% to 53%; the brand picker then picks up at 61% (222 / 365 in Figma).
const intro = (n: number) => 0.08 + (n - 1) * 0.075;

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { kind: 'welcome', button: 'Get Started' },
  {
    kind: 'intro',
    progress: intro(1),
    hero: 'judge',
    title: 'Class Action Settlements',
    body: 'Are when companies have to pay money to customers because they may have done something wrong or illegal.',
    button: 'Next',
  },
  {
    kind: 'intro',
    progress: intro(2),
    eyebrow: 'Last year people like you were awarded',
    hero: 'moneybag',
    title: '$1.3 Billion',
    body: 'Companies have to pay money to customers, but it is up to the people to claim the reward.',
    button: 'Next',
  },
  {
    kind: 'intro',
    progress: intro(3),
    hero: 'brands',
    title: 'New Settlements to claim every week',
    body: 'Many of the largest companies often pay penalties for misleading people. ModeMobile finds and organizes these opportunities for you to claim your cash.',
    button: 'Next',
  },
  {
    kind: 'intro',
    progress: intro(4),
    hero: 'bell',
    title: 'We find and track everything for you',
    body: 'When a new settlement opens, we’ll let you know. If you’re eligible, you can use ModeMobile for easy filing and skip the headache',
    button: 'Next',
  },
  {
    kind: 'intro',
    progress: intro(5),
    hero: 'appleCard',
    title: 'No proof? Still eligible!',
    body: 'You can still file a claim if you lost your receipt. If something requires proof, we’ll let you know before you file.',
    button: 'Next',
  },
  {
    kind: 'intro',
    progress: intro(6),
    eyebrow: 'On a yearly average you are owed',
    title: '$397',
    titleSize: 72,
    extra: 'reviewCard',
    button: 'Next',
  },
  {
    kind: 'intro',
    progress: intro(7),
    eyebrow: 'Class Action Payout App',
    title: '#1',
    titleSize: 72,
    extra: 'stars',
    body: 'Trusted by thousands of users',
    button: 'Next',
  },
  {
    kind: 'brands',
    progress: 0.61,
    title: 'Which brands have you purchased from in the past 5 years?',
    body: 'Pick the ones you haven’t claimed money from yet',
    button: 'Next',
  },
  {
    kind: 'payout',
    progress: 0.75,
    title: 'How would you like to receive payouts?',
    body: 'This will be set as the default payout method when claims are filled',
    button: 'Next',
  },
  { kind: 'loading', progress: 0.88, body: 'Estimating settlements you can claim now!' },
  {
    kind: 'result',
    progress: 1,
    body: 'Brands you selected are estimated to pay this much out to Class Actions',
    button: 'Claim My Cash',
  },
  {
    kind: 'paywall',
    title: '$1B in settlements coming this year',
    body: 'Gain Access to Unlimited Settlements! ModeMobile is the easiest way to get loads of cash with little effort',
    button: 'Continue',
  },
  {
    kind: 'offer',
    title: 'We want you to ',
    highlight: 'make some money',
    badge: '50% Discount Applied',
    body: 'Use the app for\na discount with our\none time offer!',
    button: 'Continue for 50% OFF',
  },
];

/** The 10 brands in the picker: the same brands (and `brand_key` slugs) as `backend/seed.ts`. */
export const ONBOARDING_BRANDS = [
  'Apple',
  'Instagram',
  'Tesla',
  'Meta',
  'Google',
  'DoorDash',
  'Amazon',
  'Fortnite',
  'Spotify',
  'Pepsi',
].map((name) => ({ name, key: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }));

export const PAYOUT_METHODS = ['Credit Card', 'Debit Card', 'Prepaid Card', 'Zelle', 'Venmo'] as const;
export type PayoutMethod = (typeof PAYOUT_METHODS)[number];

export type PlanId = 'weekly' | 'yearly';

export const PLANS: { id: PlanId; name: string; price: string; tagline: string; period: string }[] = [
  { id: 'weekly', name: 'Weekly Unlimited', price: '$9.99', tagline: 'Perfect for trying it out', period: 'Weekly' },
  { id: 'yearly', name: 'Yearly Unlimited', price: '$39.99', tagline: 'Make the most money', period: 'Yearly' },
];
