"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackOutboundContact } from "@/lib/analytics/leads";

/**
 * Counts every tap on WhatsApp, email or phone, anywhere on the site.
 *
 * =========================================================================
 * WHY ONE DELEGATED LISTENER AND NOT A PROP ON EACH BUTTON
 * =========================================================================
 * WhatsApp links are scattered across at least twelve files — the footer,
 * the navbar, tour pages, experience pages, weekly trips, the departures
 * panel, two dedicated button components — and they are the site's single
 * biggest conversion route. Threading an onClick through all of them would
 * mean twelve edits now and a thirteenth missed the next time somebody adds
 * a button, which is exactly how measurement rots.
 *
 * One listener on the document catches all of them by href, including every
 * link added after this was written. It is attached once, does no work until
 * a click happens, and cannot be forgotten.
 *
 * =========================================================================
 * WHY IT LOOKS AT THE EVENT TARGET'S ANCESTORS
 * =========================================================================
 * These links wrap spans, SVGs and whole cards, so the click target is
 * usually a child rather than the anchor. `closest("a")` walks up to the
 * anchor that was actually activated. Without it the listener would miss
 * every button whose label sits in a nested element — which is all of them.
 *
 * Capture phase, because some of these anchors sit inside components that
 * stop propagation to manage their own UI.
 *
 * No personal data is sent: a channel and the current path, nothing else.
 */
export function OutboundTracker() {
  const pathname = usePathname();

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href") ?? "";
      if (!href) return;

      if (href.includes("wa.me") || href.includes("api.whatsapp.com")) {
        trackOutboundContact("whatsapp", pathname);
      } else if (href.startsWith("mailto:")) {
        trackOutboundContact("email", pathname);
      } else if (href.startsWith("tel:")) {
        trackOutboundContact("phone", pathname);
      }
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  return null;
}
