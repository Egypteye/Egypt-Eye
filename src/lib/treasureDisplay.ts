import type { Price, TreasureAvailability, TreasureProduct, TreasureStatus } from "@/content/types";

// How a product's status and price turn into words.
//
// One place, because the same product appears on a category page, in the
// request form's picker and (later) on a landing-page feature row, and a
// piece that reads "Sold out" on one and "Reserve" on another is the kind of
// thing customers screenshot.

/** The button label for each status. Hidden never reaches here — GROQ drops it. */
const CTA: Record<TreasureStatus, string> = {
  available: "Reserve this piece",
  preorder: "Pre-order for my trip",
  onRequest: "Request availability",
  soldOut: "Currently unavailable",
  hidden: "Currently unavailable",
};

export function ctaForStatus(status: TreasureStatus): string {
  return CTA[status] ?? CTA.onRequest;
}

/** Sold out is the only status where the button should not invite an action. */
export function isOrderable(status: TreasureStatus): boolean {
  return status === "available" || status === "preorder" || status === "onRequest";
}

const AVAILABILITY: Record<TreasureAvailability, string> = {
  inStock: "In stock",
  limited: "Limited",
  outOfStock: "Out of stock",
  checkAvailability: "Check availability",
};

export function availabilityLabel(availability?: TreasureAvailability): string | null {
  return availability ? (AVAILABILITY[availability] ?? null) : null;
}

const STATUS_LABEL: Record<TreasureStatus, string | null> = {
  available: null,
  preorder: "Pre-order",
  onRequest: "On request",
  soldOut: "Sold out",
  hidden: null,
};

/** A badge for the card, or null when the status needs no explaining. */
export function statusLabel(status: TreasureStatus): string | null {
  return STATUS_LABEL[status] ?? null;
}

function money(amount: number): string {
  // Whole dollars read better on a card; cents only appear if there are any.
  return amount % 1 === 0 ? `$${amount}` : `$${amount.toFixed(2)}`;
}

export type PriceDisplay = { amount: string | null; was: string | null; note: string | null };

/**
 * Turns a price into what the card shows.
 *
 * An empty amount is not a missing value to paper over — it is the honest
 * state of a commissioned piece, and the note carries it. `originalAmount` is
 * only shown when it is genuinely higher than the price being charged, so a
 * mistyped figure cannot render as a fake discount.
 */
export function priceDisplay(price?: Price): PriceDisplay {
  if (!price || typeof price.amount !== "number") {
    return { amount: null, was: null, note: price?.note ?? "Price on request" };
  }
  const was =
    typeof price.originalAmount === "number" && price.originalAmount > price.amount
      ? money(price.originalAmount)
      : null;
  return { amount: money(price.amount), was, note: null };
}

/**
 * The price shown on a card when a product has variants.
 *
 * Quotes the cheapest variant as a "from" figure rather than the first one in
 * the list, because the first is an editing accident and the cheapest is a
 * promise the catalogue can keep.
 */
export function cardPrice(product: TreasureProduct): PriceDisplay & { from: boolean } {
  const variantAmounts = (product.variants ?? [])
    .map((v) => v.price?.amount)
    .filter((n): n is number => typeof n === "number");

  if (variantAmounts.length > 0) {
    const cheapest = Math.min(...variantAmounts);
    const ownAmount = typeof product.price?.amount === "number" ? product.price.amount : Infinity;
    const lowest = Math.min(cheapest, ownAmount);
    return { amount: money(lowest), was: null, note: null, from: variantAmounts.length > 1 || ownAmount < Infinity };
  }

  return { ...priceDisplay(product.price), from: false };
}
