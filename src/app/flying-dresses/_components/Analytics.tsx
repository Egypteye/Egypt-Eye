"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  GA_MEASUREMENT_ID,
  analyticsEnabled,
  publicPath,
  track,
  trackPageView,
} from "../_lib/analytics";

/**
 * Loads GA4 and reports what happens on the page.
 *
 * =========================================================================
 * ONE PAGE VIEW PER PAGE
 * =========================================================================
 * `send_page_view: false` below turns off GA4's automatic view, and the
 * effect sends every view instead — including the first. The usual bug in
 * App Router analytics is sending a view on route change ON TOP of the
 * automatic one, which doubles the landing page and makes bounce rate
 * meaningless. See the note on trackPageView in _lib/analytics.ts.
 *
 * PATHNAME ONLY, NOT SEARCH PARAMS. Two reasons, and the second is the real
 * one. First, `useSearchParams()` in a client component forces the whole
 * tree out of static prerendering unless it is wrapped in Suspense, and this
 * layout wraps every page on the site. Second, and more importantly, the
 * query strings here are not pages: /wardrobe?dress=cherry is a lightbox
 * opening over the wardrobe, and counting each dress a visitor glances at as
 * a separate page view would inflate the only number anyone looks at.
 *
 * =========================================================================
 * WHY CLICKS ARE CAUGHT HERE AND NOT ON EACH BUTTON
 * =========================================================================
 * The ways out of this site — the enquiry form, the email link, the WhatsApp
 * draft, the deposit button — appear beside every item, in the header, in the
 * footer and on the phone's sticky bar. Instrumenting each one means an
 * onClick on dozens of elements, every new one a chance to forget.
 *
 * One delegated listener on the document reads the anchor that was clicked
 * and classifies it by its href, which already carries the context: a
 * wa.me link IS a WhatsApp click, a mailto: IS an email click. Nothing to
 * remember when adding a button, and nothing to keep in step.
 *
 * It listens in the CAPTURE phase so a handler that stops propagation (the
 * wardrobe's lightbox does) cannot swallow the measurement.
 */
export function Analytics() {
  const pathname = usePathname();

  /**
   * The path whose view has already been reported.
   *
   * THIS IS NOT BELT AND BRACES — the first version of this component sent
   * the landing page TWICE, and a browser test caught it before anything
   * shipped. React's Strict Mode double-invokes effects in development, so
   * an effect that sends an event is an effect that sends it twice.
   *
   * It would have been fair to call that development-only and move on. It is
   * the wrong call. The same thing happens for real whenever this component
   * remounts, and "correct in production, wrong in development" means every
   * future check of this code is done against numbers that are already
   * doubled — so the next person has no way to tell a real double-count from
   * the expected one.
   *
   * Comparing against the last path sent makes it idempotent whatever the
   * cause: one view per path, per arrival at it, by construction.
   */
  const reported = useRef<string | null>(null);

  useEffect(() => {
    if (!analyticsEnabled || !pathname) return;
    if (reported.current === pathname) return;
    reported.current = pathname;
    trackPageView(pathname);
  }, [pathname]);

  useEffect(() => {
    if (!analyticsEnabled) return;

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href") ?? "";
      if (!href) return;

      // The item being enquired about, where the link carries one. Slugs
      // only — never anything a visitor typed.
      const slugMatch = href.match(/[?&](?:package|service|experience)=([a-z0-9-]+)/i);
      const item = slugMatch?.[1];

      if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)/i.test(href)) {
        track("contact_click", { method: "whatsapp", item, page_path: pathname ? publicPath(pathname) : "" });
        return;
      }
      if (href.startsWith("mailto:")) {
        track("contact_click", { method: "email", item, page_path: pathname ? publicPath(pathname) : "" });
        return;
      }
      if (/paypal\.(com|me)/i.test(href)) {
        // NOT a payment. A payment is money confirmed by PayPal, which this
        // site never sees — see the report. This is the deposit button being
        // pressed, and it is named for what it is.
        track("begin_checkout", { method: "paypal", item, page_path: pathname ? publicPath(pathname) : "" });
        return;
      }
      if (/\/enquire(\?|$)/.test(href)) {
        track("contact_click", { method: "form", item, page_path: pathname ? publicPath(pathname) : "" });
      }
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  if (!analyticsEnabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="fd-ga4" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });`}
      </Script>
    </>
  );
}
