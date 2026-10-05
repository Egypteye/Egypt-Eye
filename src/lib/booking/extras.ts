// Optional priced extras on a booking — a camel ride, a video reel, a scarf.
//
// One rule decides the shape of this module: the customer's request carries
// which extras were chosen, never what they cost. The prices are read from the
// product on the server and the chosen labels are matched against them, so a
// request claiming "Running Horse Ride, $0" buys nothing. It is the same rule
// the deposit amount already follows, and for the same reason — a figure that
// arrives in a POST body is a price the customer set themselves.
//
// The second thing worth stating, because it shapes the wording everywhere:
// extras are NOT paid now. The PayPal payment link is a fixed amount, one per
// deposit tier, so a selection of extras cannot be charged through it. They
// are recorded on the booking and settled with the balance. Any copy that
// implies otherwise is wrong, and scripts/check-booking.mts asserts it.

export type BookingExtra = {
  label: string;
  priceUsd: number;
};

const MAX_LABEL = 120;

/**
 * A product's extras, cleaned.
 *
 * Reads whatever the CMS or a content file supplies and keeps only entries
 * that are a real label with a real positive price. An extra with a missing
 * price is dropped rather than shown as free: "Camel Ride — $0" invites
 * someone to select it and then argue about the bill.
 */
export function normaliseExtras(value: unknown): BookingExtra[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const out: BookingExtra[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const raw = (entry as { label?: unknown }).label;
    const price = (entry as { priceUsd?: unknown }).priceUsd;
    if (typeof raw !== "string") continue;
    const label = raw.trim().slice(0, MAX_LABEL);
    if (label === "") continue;
    if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) continue;
    // Two extras with the same name cannot be told apart once they are only a
    // label in a request, so the first one wins.
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ label, priceUsd: Math.round(price * 100) / 100 });
  }
  return out;
}

/**
 * The extras a customer actually chose, priced from the product.
 *
 * Anything that is not on the product's own list is ignored — silently,
 * because a stale tab selecting an extra that has since been removed should
 * still produce a booking rather than an error the customer cannot act on.
 */
export function selectExtras(available: readonly BookingExtra[], chosen: unknown): BookingExtra[] {
  if (!Array.isArray(chosen)) return [];
  const byLabel = new Map(available.map((extra) => [extra.label.toLowerCase(), extra]));
  const picked = new Map<string, BookingExtra>();
  for (const entry of chosen) {
    if (typeof entry !== "string") continue;
    const match = byLabel.get(entry.trim().toLowerCase());
    // Keyed by label, so selecting the same extra twice is still one extra.
    if (match) picked.set(match.label, match);
  }
  return [...picked.values()];
}

export function extrasTotal(extras: readonly BookingExtra[]): number {
  return Math.round(extras.reduce((sum, extra) => sum + extra.priceUsd, 0) * 100) / 100;
}

export function formatUsd(amount: number): string {
  return amount % 1 === 0 ? `$${amount}` : `$${amount.toFixed(2)}`;
}

/**
 * How extras are explained to the customer, in one sentence used everywhere.
 *
 * It has to say when the money is due, because the only figure being paid in
 * the popup is the deposit. A running total beside a pay button that charges
 * something else is the kind of thing a customer screenshots.
 */
export function extrasSettlementNote(total: number): string {
  return (
    `${formatUsd(total)} of extras is added to your final price and settled with the balance, ` +
    "not taken now."
  );
}
