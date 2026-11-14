import * as Linking from 'expo-linking';
import { useEffect } from 'react';

// Once seen, dev mode stays on for the rest of the session, since later navigation drops the query.
let sticky = false;

/** True for `?dev`, `?dev=1`, `&dev` ... anywhere in the URL's query string. */
const hasDevFlag = (url: string | null) => !!url && /[?&]dev(=|&|#|$)/.test(url);

/**
 * Dev tools (data toggle, reset button) show only when `__DEV__` is true AND the app was opened
 * with a `dev` query flag: `http://localhost:8081/?dev` on web, or a deep link such as
 * `exp://<host>:8081/--/?dev` on a device. Release builds never show them.
 */
export function useDevMode(): boolean {
  const url = Linking.useLinkingURL();
  const flagged = hasDevFlag(url);

  // Remember the flag for later renders, after navigation has dropped the query.
  useEffect(() => {
    if (flagged) sticky = true;
  }, [flagged]);

  return __DEV__ && (sticky || flagged);
}
