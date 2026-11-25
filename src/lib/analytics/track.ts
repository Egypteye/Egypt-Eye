/**
 * Sending one custom event on the Egypt Eye site.
 *
 * The site already has GA4: SiteAnalytics.tsx bootstraps gtag with Consent
 * Mode (`analytics_storage` denied until the visitor accepts) and sends its
 * own page views. What it did not have was a way for a component to send an
 * interaction event, so every click on this site has been unmeasured.
 *
 * WHY THIS IS SAFE WITH THE COOKIE BANNER. Consent is handled by Google, not
 * here: with `analytics_storage: 'denied'` an event is sent without the `_ga`
 * cookie and without a persistent identifier. Gating these calls on the
 * stored choice as well would be belt-and-braces, but it would also mean
 * every caller reading localStorage, which is exactly the cascading-read
 * problem AnalyticsConsent.tsx was written to avoid. So the gate stays in one
 * place: the Consent Mode default.
 *
 * WHAT MUST NEVER BE PASSED. No name, email, phone number, message body or
 * any other field a visitor typed about themselves. Google's terms forbid
 * carrying it and an account found doing so can be purged — and the forms on
 * this site collect precisely that. Parameters are flat, short and about the
 * page, never the person. scripts/check-campaign.mts asserts that the
 * campaign's callers pass no field from the form.
 *
 * Unconfigured is the normal case in development: with no measurement ID,
 * `window.gtag` never exists and every call here is a no-op.
 */

type EventParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(name: string, params: EventParams = {}): void {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: (cmd: string, ...rest: unknown[]) => void }).gtag;
  if (!gtag) return;
  gtag("event", name, params);
}
