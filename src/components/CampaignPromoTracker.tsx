"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics/track";

/**
 * Measurement for the homepage campaign band, and nothing else.
 *
 * The band itself is a server component so it ships no JavaScript. This
 * wrapper exists only to answer the two questions the campaign is judged on:
 * how many people who reach the foot of the homepage SEE it, and how many
 * then click. Impressions matter more than usual here — the band sits below
 * the whole page, so a low click count could mean bad copy or simply that
 * nobody scrolled that far, and without the impression the two are
 * indistinguishable.
 *
 * IntersectionObserver rather than a scroll listener: a scroll handler on the
 * homepage would run on every frame of every scroll for one event that fires
 * once. It disconnects itself after firing, so a visitor who scrolls past
 * twice counts once.
 *
 * No personal data is sent — one event name and the campaign slug.
 */
export function CampaignPromoTracker({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    // Older browsers simply go unmeasured rather than throwing on the homepage.
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();
        trackEvent("campaign_promo_impression", { campaign: "shakira-got-you", placement: "homepage" });
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      onClick={() =>
        trackEvent("campaign_promo_click", { campaign: "shakira-got-you", placement: "homepage" })
      }
    >
      {children}
    </div>
  );
}
