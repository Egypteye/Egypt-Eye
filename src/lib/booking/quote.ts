import type { BookingExtra } from "@/content/types";

// What a deposit actually costs, worked out from what the customer selected.
//
// This module is the only authority on the figure. The browser sends a
// headcount and a list of extras with quantities; everything else — the price,
// the percentage, the arithmetic — happens here, server side, from
// configuration the customer cannot touch. A price that arrived in a request
// body is a price the customer set themselves.
//
// **The model, after the pricing rebuild.** One backend price drives
// everything:
//
//     booking value = (price × people) + Σ(extra price × quantity)
//     deposit       = booking value × depositPercent
//
// and the deposit is the only amount collected online. The remaining balance
// is never charged through this flow.
//
// It replaces a flat `depositUsd` per product, which was a second source of
// truth for money: a product could carry a $25 deposit and a $200 price that
// had nothing to do with each other, and changing the price left the deposit
// wrong with nothing to notice it. The flat fields are gone rather than
// deprecated, because a field that still parses is a field that still fights.
//
// Three decisions shape the rest of it, and all three survive the rebuild.
//
// **Integer cents, end to end.** Not one float survives into a comparison.
// Money in JavaScript is only safe if it never becomes a float that something
// later rounds, and the place that bites is the amount check against PayPal:
// a payment a cent short must fail, and `0.1 + 0.2 === 0.3` is false. The
// percentage is applied to integer cents and rounded once, deliberately.
//
// **A quote is a snapshot, not a calculation to repeat.** The result records
// the price and the percentage it used, not just the total. If the team
// changes a price from $200 to $240 next month, a booking taken today must
// still read $100 — and must still be able to say *why* it was $100, six
// months later, in a dispute. So the lines and the rules that produced them
// are stored with the booking and never recomputed.
//
// **No price means no booking, never a guess.** A product with no price shows
// no Instant Booking button anywhere. Silence is the correct failure, because
// the alternative is charging somebody a percentage of a number nobody chose.

/** How a quote can fail to exist. Each maps to a sentence in explainOffer. */
export type OfferProblem = "notBookable" | "noPrice" | "badPercent" | "zero" | "badPeople";

export type QuoteLine = {
  kind: "service" | "extra";
  label: string;
  /** What one unit costs, in cents. */
  unitCents: number;
  /** The headcount for the service line; the chosen quantity for an extra. */
  quantity: number;
  amountCents: number;
};

export type Quote = {
  productType: string;
  productSlug: string;
  productTitle: string;
  people: number;
  /** The service and extra lines, at full price — what the booking is worth. */
  lines: QuoteLine[];
  /** The whole booking: price × people, plus every extra. */
  bookingTotalCents: number;
  /** The percentage taken now. Whole or half percents only. */
  depositPercent: number;
  /** What the customer pays online. The only amount this flow ever charges. */
  totalCents: number;
  /** What is left to settle later. bookingTotal − deposit, for the copy. */
  balanceCents: number;
  currency: "USD";
  computedAt: string;
  /** The rates in force when this was computed. Never read again — evidence. */
  rules: {
    /** Per person, in cents, as the backend had it at the time. */
    priceCents: number;
    depositPercent: number;
    extras: { label: string; priceCents: number; quantity: number }[];
  };
};

export type QuoteResult = { ok: true; quote: Quote } | { ok: false; reason: OfferProblem };

/** Nobody books twenty-one people online; past that it is a conversation. */
export const MAX_PEOPLE = 20;
/** The ceiling on one extra. Same reasoning, smaller number. */
export const MAX_EXTRA_QUANTITY = 20;
/** Used when neither the product nor the site settings say otherwise. */
export const DEFAULT_DEPOSIT_PERCENT = 25;

/**
 * Whether a value is simply not there.
 *
 * null and undefined both mean "not set", and conflating them with "set to
 * something unreadable" once took every deposit on the site offline. GROQ
 * returns null for a field an editor cleared; an object literal in a test
 * omits the key and yields undefined. Both arrive here and both must answer
 * the same. The lesson is written down in lib/sanityShape.ts as well.
 */
export function isAbsent(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * A USD figure as whole cents, or null if it is not money we will act on.
 *
 * Rejects more than it accepts on purpose. A price with three decimal places,
 * a negative, a NaN or a string are all configuration mistakes, and a mistake
 * that resolves to "probably this" is how somebody gets charged a number
 * nobody chose.
 */
export function usdToCents(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return null;
  const cents = Math.round(value * 100);
  // Guards a price typed with sub-cent precision: 25.005 is not a price.
  if (Math.abs(value * 100 - cents) > 1e-6) return null;
  return cents;
}

export function formatCents(cents: number): string {
  const whole = Math.trunc(cents / 100);
  const part = Math.abs(cents % 100);
  return part === 0 ? `$${whole}` : `$${whole}.${String(part).padStart(2, "0")}`;
}

/**
 * The deposit percentage, or null if what is configured is not usable.
 *
 * Half percents are allowed because 12.5% is a real commercial number; finer
 * than that is a typo. 0 and 100 are both refused: a 0% deposit is not a
 * deposit, and 100% would collect the full balance online, which is the one
 * thing this flow must never do.
 */
export function readPercent(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (value <= 0 || value >= 100) return null;
  if (Math.abs(value * 2 - Math.round(value * 2)) > 1e-9) return null;
  return value;
}

/** The product fields this needs. Narrow, so the maths stays testable. */
export type QuotableProduct = {
  slug: string;
  title: string;
  /** The Instant Booking switch, set in the Studio. */
  bookable?: boolean | null;
  /** The backend price, per person. The single source of truth for money. */
  price?: { amount?: number | null } | null;
  /** An override on the site-wide deposit percentage. */
  depositPercent?: number | null;
  extras?: readonly BookingExtra[] | null;
};

/** The per-person price in cents, or null when none is configured. */
export function priceCentsOf(product: QuotableProduct): number | null {
  if (isAbsent(product.price) || isAbsent(product.price.amount)) return null;
  const cents = usdToCents(product.price.amount);
  return cents === null || cents <= 0 ? null : cents;
}

/** The percentage this product runs, falling back to the site setting. */
export function percentFor(product: QuotableProduct, sitePercent?: number | null): number | null {
  if (!isAbsent(product.depositPercent)) return readPercent(product.depositPercent);
  if (!isAbsent(sitePercent)) return readPercent(sitePercent);
  return DEFAULT_DEPOSIT_PERCENT;
}

/**
 * Instant Booking, answered once.
 *
 * Both halves are required and they are deliberately separate: a price is what
 * makes a booking *possible*, the switch is what makes it *offered*. Setting a
 * price does not put a product on sale, which is the behaviour asked for —
 * price with the switch off shows the price and no button.
 */
export function isInstantBookable(product: QuotableProduct): boolean {
  return product.bookable === true && priceCentsOf(product) !== null;
}

/** One chosen extra. Quantity 0 means it was not taken. */
export type ExtraSelection = { label: string; quantity: number };

/**
 * Normalises whatever the browser sent into extras with quantities.
 *
 * Accepts the old shape — a bare array of labels — as quantity 1 each, so a
 * page cached before the quantity steppers shipped still produces a correct
 * booking rather than an error the customer cannot act on.
 */
export function readExtraSelection(raw: unknown): ExtraSelection[] {
  if (!Array.isArray(raw)) return [];
  const out: ExtraSelection[] = [];
  for (const entry of raw) {
    if (typeof entry === "string") {
      out.push({ label: entry, quantity: 1 });
      continue;
    }
    if (!entry || typeof entry !== "object") continue;
    const label = (entry as { label?: unknown }).label;
    const quantity = (entry as { quantity?: unknown }).quantity;
    if (typeof label !== "string") continue;
    // A non-integer, negative or absurd quantity is dropped to zero rather
    // than clamped upward: never invent a charge the customer did not make.
    const n =
      typeof quantity === "number" && Number.isInteger(quantity) && quantity > 0
        ? Math.min(quantity, MAX_EXTRA_QUANTITY)
        : 0;
    out.push({ label, quantity: n });
  }
  return out;
}

/**
 * The deposit for one real selection.
 *
 * Extras are matched case-insensitively against the product's own list;
 * anything unrecognised is ignored rather than refused, because a page cached
 * before an extra was removed should still produce a booking.
 */
export function quoteDeposit(
  product: QuotableProduct,
  productType: string,
  selection: { people: unknown; extras: unknown },
  sitePercent?: number | null
): QuoteResult {
  if (product.bookable !== true) return { ok: false, reason: "notBookable" };

  const people = selection.people;
  if (typeof people !== "number" || !Number.isInteger(people) || people < 1 || people > MAX_PEOPLE) {
    return { ok: false, reason: "badPeople" };
  }

  const unitCents = priceCentsOf(product);
  if (unitCents === null) return { ok: false, reason: "noPrice" };

  const percent = percentFor(product, sitePercent);
  if (percent === null) return { ok: false, reason: "badPercent" };

  const lines: QuoteLine[] = [
    {
      kind: "service",
      label: product.title,
      unitCents,
      quantity: people,
      amountCents: unitCents * people,
    },
  ];

  // Priced from the product, matched by label. The map is built from the
  // product, so nothing the browser sends can introduce an entry or a price.
  const available = new Map<string, BookingExtra>();
  for (const extra of product.extras ?? []) {
    if (extra && typeof extra.label === "string") {
      available.set(extra.label.trim().toLowerCase(), extra);
    }
  }

  const ruleExtras: Quote["rules"]["extras"] = [];
  const taken = new Set<string>();
  for (const choice of readExtraSelection(selection.extras)) {
    const key = choice.label.trim().toLowerCase();
    // Selecting the same extra twice is one extra, not two.
    if (taken.has(key)) continue;
    const extra = available.get(key);
    if (!extra || choice.quantity < 1) continue;
    const extraCents = usdToCents(extra.priceUsd);
    // An extra with no readable price is dropped, not offered free. Charging
    // nothing for something a customer deliberately added is the worse error.
    if (extraCents === null || extraCents <= 0) continue;
    taken.add(key);
    lines.push({
      kind: "extra",
      label: extra.label,
      unitCents: extraCents,
      quantity: choice.quantity,
      amountCents: extraCents * choice.quantity,
    });
    ruleExtras.push({ label: extra.label, priceCents: extraCents, quantity: choice.quantity });
  }

  const bookingTotalCents = lines.reduce((sum, line) => sum + line.amountCents, 0);
  // One rounding, at the end, on integer cents. Rounding each line would let
  // a half-cent per extra accumulate into a figure PayPal then rejects.
  const depositCents = Math.round((bookingTotalCents * percent) / 100);

  // Charging nothing to "secure" a date is a broken promise rather than a
  // generous one, so it resolves to no deposit at all.
  if (depositCents <= 0) return { ok: false, reason: "zero" };

  return {
    ok: true,
    quote: {
      productType,
      productSlug: product.slug,
      productTitle: product.title,
      people,
      lines,
      bookingTotalCents,
      depositPercent: percent,
      totalCents: depositCents,
      balanceCents: bookingTotalCents - depositCents,
      currency: "USD",
      computedAt: new Date().toISOString(),
      rules: { priceCents: unitCents, depositPercent: percent, extras: ruleExtras },
    },
  };
}

export type DepositOffer =
  | { available: false; reason: OfferProblem }
  | {
      available: true;
      /** The per-person price, for the product page. */
      priceLabel: string;
      priceCents: number;
      depositPercent: number;
      /** What one person would pay now, for the button's supporting line. */
      onePersonDepositCents: number;
    };

/**
 * Whether this product can be booked instantly, and at what price.
 *
 * **This is the single authority on both questions,** and that is the whole
 * point of it existing. The same mistake has now been made four times in this
 * codebase: a page decides one way, the booking route decides another, and the
 * disagreement is invisible until a customer meets it. First the rail, then
 * the amount, then bookability, then the viewer.
 *
 * Each time the fix was to make one function answer and everything read it.
 * So: if this says unavailable, no price and no button appear anywhere; if it
 * says available, the checkout can quote a real figure from the same price.
 */
export function depositOffer(
  product: QuotableProduct,
  productType: string,
  sitePercent?: number | null
): DepositOffer {
  const one = quoteDeposit(product, productType, { people: 1, extras: [] }, sitePercent);
  if (!one.ok) return { available: false, reason: one.reason };
  return {
    available: true,
    priceLabel: formatCents(one.quote.rules.priceCents),
    priceCents: one.quote.rules.priceCents,
    depositPercent: one.quote.depositPercent,
    onePersonDepositCents: one.quote.totalCents,
  };
}

/** Why a product cannot be booked instantly, in words somebody can act on. */
export function explainOffer(reason: OfferProblem): string {
  switch (reason) {
    case "notBookable":
      return 'The "Instant Booking" switch is off on this product. The price still shows; the button does not.';
    case "noPrice":
      return "No price is set on this product. Instant Booking needs a price to take a percentage of.";
    case "badPercent":
      return "The deposit percentage is not a usable figure. It must be above 0 and below 100.";
    case "zero":
      return "The price and percentage together come to nothing, so there is no deposit to take.";
    case "badPeople":
      return `The headcount is outside 1–${MAX_PEOPLE}.`;
  }
}

/**
 * The quote as a customer reads it, as lines of arithmetic.
 *
 * Deliberately shows the working — "$200 × 2 = $400" — because a percentage
 * the customer cannot check is a number they have to trust.
 */
export function describeQuote(quote: Quote): { label: string; detail: string }[] {
  const rows = quote.lines.map((line) => ({
    label: line.quantity > 1 ? `${line.label} × ${line.quantity}` : line.label,
    detail:
      line.quantity > 1
        ? `${formatCents(line.unitCents)} × ${line.quantity} = ${formatCents(line.amountCents)}`
        : formatCents(line.amountCents),
  }));
  rows.push({
    label: `${quote.depositPercent}% deposit`,
    detail: `${formatCents(quote.bookingTotalCents)} × ${quote.depositPercent}% = ${formatCents(quote.totalCents)}`,
  });
  return rows;
}
