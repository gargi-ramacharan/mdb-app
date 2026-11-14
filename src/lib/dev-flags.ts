import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Stand-in for a real purchase. The paywall buttons only record which plan was "chosen" here;
 * nothing is charged. Replace with a real subscription check when purchases are built.
 */
const KEY = 'dev.plan';

export type DevPlan = 'weekly' | 'yearly' | 'offer';

export async function setDevPlan(plan: DevPlan) {
  try {
    await AsyncStorage.setItem(KEY, plan);
  } catch {
    // Storage can be unavailable; the flag is only a dev convenience.
  }
}

export async function getDevPlan(): Promise<DevPlan | null> {
  try {
    return (await AsyncStorage.getItem(KEY)) as DevPlan | null;
  } catch {
    return null;
  }
}

export async function clearDevPlan() {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
