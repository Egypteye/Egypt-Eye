"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Keeps the old deep links working.
//
// Until the reviews were split across pages, a product's star chip linked to
// `/testimonials#reviews-tour-1-day-giza-tour` and the page scrolled to that
// group. Those URLs are in the wild — in search results, in bookmarks, in
// messages already sent to travellers — and a fragment never reaches the
// server, so no redirect rule in next.config can catch one. This is the only
// place that can: read the hash in the browser and send it on.
//
// The map comes from the server, so an anchor only redirects where a real
// page exists. Anything else — a category anchor, a product whose reviews
// were removed — is left alone and the visitor stays on the hub, which is a
// reasonable landing place for all of them.

export function LegacyReviewHashRedirect({ destinations }: { destinations: Record<string, string> }) {
  const router = useRouter();

  useEffect(() => {
    const go = () => {
      const anchor = window.location.hash.slice(1);
      const href = anchor && destinations[anchor];
      if (href) router.replace(href);
    };
    go();
    window.addEventListener("hashchange", go);
    return () => window.removeEventListener("hashchange", go);
  }, [destinations, router]);

  return null;
}
