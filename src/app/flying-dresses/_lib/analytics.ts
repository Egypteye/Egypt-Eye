/**
 * Measurement for Flying Dresses Egypt.
 *
 * =========================================================================
 * WHY THIS EXISTS
 * =========================================================================
 * Nothing on this brand was measured. Every judgement about the site — mine
 * included — has therefore been an opinion. A prettier page and a page that
 * sells more are indistinguishable without numbers, and the work queued after
 * this (stories, pricing tiers, a booking flow) is exactly the work that
 * needs a baseline to be worth anything.
 *
 * =========================================================================
 * WHAT IS DELIBERATELY NOT SENT
 * =========================================================================
 * No name, email address, phone number, message body, or any part of an
 * enquiry. Not as a policy gesture: Google's own terms forbid it, an account
 * found carrying it can be purged, and this site's forms collect exactly the
 * kind of data that gets an account purged. `track()` therefore takes a small
 * set of flat, non-identifying parameters and nothing is ever passed through
 * from a form field.
 *
 * What IS sent: which page, which product slug, which route out (form, email
 * or WhatsApp). That is enough to answer every question worth asking —
 * which shoots get read, which get enquired about, and where people leave.
 *
 * =========================================================================
 * SAFE WHEN UNCONFIGURED
 * =========================================================================
 * With no measurement ID set, `gtag` never exists and every call here is a
 * no-op. That is the state the site ships in: the code is live, the property
 * is not, and nothing breaks in between.
 */

/** Set in the hosting environment. Absent means analytics is simply off. */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

export const analyticsEnabled = GA_MEASUREMENT_ID.length > 0;

type GtagParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Send one event.
 *
 * Guards on `typeof window` because this module is imported by components
 * that render on the server first, and on `window.gtag` because the script
 * is `afterInteractive` — a click in the gap between hydration and the script
 * arriving must not throw.
 */
export function track(name: string, params: GtagParams = {}): void {
  if (typeof window === "undefined") return;
  if (!window.gtag) return;
  window.gtag("event", name, params);
}

/**
 * The address a page is PUBLISHED at, from the path the router reports.
 *
 * The app serves /flying-dresses/wardrobe; the canonical, the sitemap and the
 * URL in a search result all say /wardrobe. If analytics reported the internal
 * path, every report in GA4 would be keyed differently from every report in
 * Search Console, and joining "what ranks" to "what converts" — the one
 * question this measurement exists to answer — would mean a manual rewrite of
 * every row.
 *
 * Same transformation as fdUrl() in _lib/seo.ts, applied to the live path
 * rather than a build-time one.
 */
export function publicPath(pathname: string): string {
  const stripped = pathname.replace(/^\/flying-dresses(?=\/|$)/, "");
  return stripped === "" ? "/" : stripped;
}

/**
 * One page view, sent by hand.
 *
 * GA4 sends a `page_view` of its own the moment `config` runs, and in an App
 * Router site that fires once on first load and never again — client-side
 * navigation changes the URL without a new document. Sites that fix this by
 * sending their own view on every route change usually end up DOUBLE-COUNTING
 * the first one, because the automatic view already went.
 *
 * So the automatic one is switched off at config time (`send_page_view:
 * false`, in Analytics.tsx) and every view, including the first, comes from
 * here. Exactly one per page, by construction rather than by luck.
 */
export function trackPageView(path: string): void {
  if (typeof window === "undefined") return;
  if (!window.gtag) return;
  const published = publicPath(path);
  window.gtag("event", "page_view", {
    page_path: published,
    page_location: window.location.origin + published,
    page_title: document.title,
  });
}
