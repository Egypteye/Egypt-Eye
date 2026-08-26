import type { Price } from "@/content/types";

// Prices are intentionally not displayed to customers anywhere on the
// public site (business decision) — every tour/experience/photoshoot still
// carries real `price` data (used internally for admin, reservations, and
// discount math), this component just never renders it. Kept as a single
// component so every card/detail page that used to show a dollar figure
// automatically shows a consistent "enquire" message instead.
export function PriceTag({ price }: { price: Price | null | undefined }) {
  return (
    <span className="text-sm font-semibold uppercase tracking-wide text-nile">
      {price?.note ?? "Enquire for Pricing"}
    </span>
  );
}
