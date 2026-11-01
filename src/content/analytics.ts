/**
 * Google Analytics 4 for egypteyetravel.com.
 *
 * =========================================================================
 * THE MEASUREMENT ID IS NOT A SECRET
 * =========================================================================
 * It ships in the HTML of every page and is readable by anyone who views
 * source — that is how gtag works. So it lives here rather than in an
 * environment variable, and that is a deliberate choice: the owner has no
 * terminal (CLAUDE.md #2), and an env var would mean a Vercel step that, if
 * missed, produces a site that silently collects nothing with no error
 * anywhere. Hardcoded, it works on deploy.
 *
 * =========================================================================
 * THIS IS A DIFFERENT PROPERTY FROM FLYING DRESSES
 * =========================================================================
 * Flying Dresses Egypt is a separate brand on a separate domain under its own
 * root layout, and it has its own GA4 driven by NEXT_PUBLIC_GA_MEASUREMENT_ID.
 * The two must not share an ID: one property fed by two brands produces
 * numbers neither of them can read. check-analytics.mts asserts they stay
 * apart.
 *
 * =========================================================================
 * CONSENT IS THE POINT, NOT A WRAPPER AROUND IT
 * =========================================================================
 * GA4 writes the `_ga` cookie, which is not strictly necessary, so under
 * ePrivacy/GDPR a visitor in the EU or UK has to agree before it is set.
 * Egypt Eye sells into Europe, and its privacy policy already promised in
 * writing: "If we ever add something that needs your consent, we will ask for
 * it, and this page will say so before it happens."
 *
 * So the tag loads with Consent Mode v2 defaulting to DENIED and asks. Until
 * someone accepts, Google receives cookieless pings and nothing is stored on
 * their device.
 */

export const GA_MEASUREMENT_ID = "G-BLF0NZX69L";

/**
 * Where the visitor's choice is remembered.
 *
 * localStorage rather than a cookie, because a cookie asking for permission
 * to set cookies is its own small joke — and because this value never needs
 * to reach the server. It is read synchronously by the bootstrap script so a
 * returning visitor who already accepted is not re-asked and does not get a
 * flash of denied-then-granted.
 */
export const CONSENT_STORAGE_KEY = "ee-analytics-consent";

export type ConsentChoice = "granted" | "denied";

/**
 * Paths that are never tracked.
 *
 * /admin is the owner's own screens. On a site with this traffic volume one
 * person checking bookings every day is a visible fraction of the numbers,
 * and it is their own site — measuring themselves browsing it tells them
 * nothing and quietly inflates everything. /os and /studio sit under separate
 * root layouts and never mount this at all.
 */
export const UNTRACKED_PATH_PATTERN = /^\/(?:[a-z]{2}\/)?(admin|os|studio)(?:\/|$)/;

export function isTrackedPath(pathname: string): boolean {
  return !UNTRACKED_PATH_PATTERN.test(pathname);
}

/**
 * `window.gtag`, typed.
 *
 * Declared here rather than borrowed: the Flying Dresses analytics module
 * happens to declare the same global, so this compiles without it today, but
 * that is one brand's file supplying another brand's types. The signatures
 * are identical so the declarations merge; if Flying Dresses is ever removed,
 * nothing here breaks.
 *
 * Optional because it genuinely may be absent — the tag loads
 * afterInteractive, and a call can land before it.
 */
declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
