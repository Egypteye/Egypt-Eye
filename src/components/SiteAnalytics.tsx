"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  CONSENT_STORAGE_KEY,
  GA_MEASUREMENT_ID,
  isTrackedPath,
} from "@/content/analytics";

/**
 * GA4 for egypteyetravel.com, gated on consent.
 *
 * =========================================================================
 * WHY send_page_view IS FALSE
 * =========================================================================
 * Because this is an App Router site and gtag's automatic pageview is wrong
 * here in both directions. It fires once when the library loads — so a
 * visitor who browses six pages through client-side navigation is recorded as
 * one — and GA4's "page changes based on browser history events" enhanced
 * measurement then double-counts the pages it does catch, because the tag
 * already sent one for the initial load.
 *
 * Turning it off and sending exactly one page_view per pathname change gives
 * one event per page, counted once. This is the same decision the Flying
 * Dresses tag made, for the same reason.
 *
 * =========================================================================
 * WHY usePathname AND NOT useSearchParams
 * =========================================================================
 * useSearchParams opts every route that renders it out of static rendering
 * unless it is wrapped in Suspense — and this component sits in the root
 * layout, so that would be the whole site. On a site built almost entirely of
 * static marketing and product pages, trading static rendering for query
 * string accuracy in analytics is a bad bargain.
 *
 * So the effect keys on pathname and reads window.location at fire time,
 * which means page_location DOES carry the query string. The one thing it
 * misses is a navigation that changes only the query and not the path — a
 * filter being toggled. That is a known, deliberate gap, not an oversight.
 *
 * =========================================================================
 * CONSENT MODE v2
 * =========================================================================
 * The bootstrap sets consent defaults BEFORE config, which is the ordering
 * Google requires — and it is safe here regardless of which script finishes
 * loading first, because dataLayer is a queue and gtag.js processes it in
 * array order when it initialises.
 *
 * The default is read synchronously from localStorage, so a returning visitor
 * who already accepted starts granted rather than flickering from denied to
 * granted after hydration.
 */
export function SiteAnalytics() {
  const pathname = usePathname();
  // The first pathname is already covered by the page_view this effect sends
  // on mount, so there is nothing to skip — but a re-render with an unchanged
  // pathname must not fire a second one.
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || !isTrackedPath(pathname)) return;
    if (lastSent.current === pathname) return;
    lastSent.current = pathname;

    // Queued if gtag.js has not finished loading: dataLayer exists from the
    // bootstrap below, so the event is never dropped for arriving early.
    window.gtag?.("event", "page_view", {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname]);

  return (
    <>
      <Script id="ga-bootstrap" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
var eeStored = null;
try { eeStored = window.localStorage.getItem(${JSON.stringify(CONSENT_STORAGE_KEY)}); } catch (e) {}
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: eeStored === 'granted' ? 'granted' : 'denied',
  wait_for_update: 500
});
gtag('js', new Date());
gtag('config', ${JSON.stringify(GA_MEASUREMENT_ID)}, { send_page_view: false });`}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
    </>
  );
}
