"use client";

import type { Price } from "@/content/types";
import { useTr } from "@/i18n/LocaleProvider";

// Prices are intentionally not displayed to customers anywhere on the
// public site (business decision) — every tour/experience/photoshoot still
// carries real `price` data (used internally for admin, reservations, and
// discount math), this component just never renders it. Kept as a single
// component so every card/detail page that used to show a dollar figure
// automatically shows a consistent "enquire" message instead.
//
// A client component (not async) so it renders identically whether its
// card is on a server-rendered page or inside a client tree like
// MyJourneyClient — an async component can't be used from client code.
export function PriceTag({ price }: { price: Price | null | undefined }) {
  const tr = useTr();
  return (
    <span className="text-sm font-semibold uppercase tracking-wide text-nile">
      {price?.note ?? tr("Enquire for Pricing")}
    </span>
  );
}
