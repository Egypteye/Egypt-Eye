"use client";

import type { Price } from "@/content/types";
import { useTr } from "@/i18n/LocaleProvider";

// What a product costs, or an invitation to ask.
//
// Egypt Eye does not publish prices by default. Every tour, experience and
// photoshoot carries a real `price` used for admin, reservations and discount
// maths, and this component renders "Enquire for Pricing" over it — one
// component so every card and detail page says the same thing.
//
// `reveal` is the deliberate exception, and it is opt-in per surface rather
// than global. Products offered for Instant Booking have to show a price:
// the booking popup shows the customer "$200 × 2 = $400, 25% deposit = $100",
// and a page that refuses to name a price next to a popup that names one
// reads as a trick. So the three types that participate in backend pricing —
// photoshoots, experiences, weekly trips — pass `reveal`; tours and the rest
// do not, and are unchanged.
//
// Revealing still depends on a real figure. `reveal` with no amount set falls
// back to "Enquire for Pricing" rather than inventing one, which is the rule
// everywhere else in the booking system: no configuration means silence,
// never a guess.
export function PriceTag({
  price,
  reveal = false,
  suffix,
}: {
  price: Price | null | undefined;
  /** Show the real figure. Only for product types with backend pricing. */
  reveal?: boolean;
  /** e.g. "per person" — only shown alongside a revealed figure. */
  suffix?: string;
}) {
  const tr = useTr();
  const amount = price?.amount;
  const showing = reveal && typeof amount === "number" && Number.isFinite(amount) && amount > 0;

  if (!showing) {
    return (
      <span className="text-sm font-semibold uppercase tracking-wide text-nile">
        {price?.note ?? tr("Enquire for Pricing")}
      </span>
    );
  }

  const figure = amount % 1 === 0 ? `$${amount}` : `$${amount.toFixed(2)}`;
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="font-display text-xl font-semibold text-ink tabular-nums">{figure}</span>
      {suffix ? <span className="text-xs font-semibold text-ink-soft">{tr(suffix)}</span> : null}
    </span>
  );
}
