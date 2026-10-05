import type { BookingExtra } from "@/content/types";

// What a deposit actually costs, worked out from what the customer selected.
//
// This module is the only authority on the figure. The browser sends a
// headcount and a list of extra *labels*; everything else — the rates, the
// rules, the arithmetic — happens here, server side, from configuration the
// customer cannot touch. A price that arrived in a request body is a price the
// customer set themselves, and that is as true of a per-person rate as it was
// of the flat amount this replaces.
//
// Three decisions shape the rest of it.
//
// **Integer cents, end to end.** Not one float survives into a comparison.
// Money in JavaScript is only safe if it never becomes a float that something
// later rounds, and the place that bites is the amount check against PayPal:
// a payment a cent short must fail, and `0.1 + 0.2 === 0.3` is false.
//
// **A quote is a snapshot, not a calculation to repeat.** The result records
// the rates it used, not just the total. If the team changes a deposit from
// $25 to $30 next month, a booking taken today must still read $85 — and must
// still be able to say *why* it was $85, six months later, in a dispute. So
// the lines and the rules that produced them are stored with the booking and
// never recomputed.
//
// **No configuration means no deposit, never a guess.** A product with a
// broken or missing rule shows no deposit button. That rule already governed
// the flat amount and carries over unchanged: silence is the correct failure,
// because the alternative is charging somebody a number nobody chose.

export type DepositBasis = "perPerson" | "fixed";
export type ExtraDepositBasis = "booking" | "person";

/** The deposit configuration carried on a product. */
export type DepositRules = {
  /** Whether the service deposit scales with the headcount. */
  basis: DepositBasis;
  /** The per-person rate, or the fixed amount. */
  amountUsd?: number;
  /**
   * An optional ceiling on the service portion.
   *
   * It caps the per-person component only, not the extras — a party of twenty
   * should not owe a $500 deposit on a $25/head rule, but an extra somebody
   * deliberately chose is not the thing to discount silently.
   */
  maxUsd?: number;
};

export type QuoteLine = {
  kind: "service" | "extra";
  label: string;
  /** What one unit costs, in cents. */
  unitCents: number;
  /** How many units — the headcount, or 1. */
  quantity: number;
  amountCents: number;
  /** Set when a cap reduced this line, so the snapshot explains itself. */
  cappedFromCents?: number;
};

export type Quote = {
  productType: string;
  productSlug: string;
  productTitle: string;
  people: number;
  lines: QuoteLine[];
  totalCents: number;
  currency: "USD";
  computedAt: string;
  /** The rates in force when this was computed. Never read again — evidence. */
  rules: {
    basis: DepositBasis;
    serviceCents: number;
    maxCents: number | null;
    extras: { label: string; depositCents: number; basis: ExtraDepositBasis }[];
  };
};

export type QuoteResult =
  | { ok: true; quote: Quote }
  | {
      ok: false;
      /**
       * - notBookable: the product is not switched on for deposits
       * - noRule: nothing usable is configured, so there is no figure to charge
       * - badPeople: the headcount is outside what we will take online
       * - zero: the rules produced nothing to charge
       */
      reason: "notBookable" | "noRule" | "badPeople" | "zero";
    };

export const MAX_PEOPLE = 20;

/**
 * A USD figure as whole cents, or null if it is not money we will act on.
 *
 * Rejects more than it accepts on purpose. A rate with three decimal places,
 * a negative, a NaN or a string are all configuration mistakes, and a mistake
 * that resolves to "probably this" is how somebody gets charged a number
 * nobody chose.
 */
export function usdToCents(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return null;
  const cents = Math.round(value * 100);
  // Guards a rate typed with sub-cent precision: 25.005 is not a price.
  if (Math.abs(value * 100 - cents) > 1e-6) return null;
  return cents;
}

export function formatCents(cents: number): string {
  const whole = Math.trunc(cents / 100);
  const part = Math.abs(cents % 100);
  return part === 0 ? `$${whole}` : `$${whole}.${String(part).padStart(2, "0")}`;
}

/** The product fields this needs. Narrow, so the maths stays testable. */
export type QuotableProduct = {
  slug: string;
  title: string;
  bookable?: boolean;
  /** The legacy flat figure. Still the amount when no basis is configured. */
  depositUsd?: number;
  depositBasis?: string;
  depositMaxUsd?: number;
  extras?: readonly BookingExtra[];
};

/**
 * The rules a product is actually running, with the legacy field honoured.
 *
 * A product that only has `depositUsd` keeps behaving exactly as it does
 * today — a fixed amount, extras contributing nothing. That is what makes this
 * safe to deploy before anybody edits the Studio: nothing changes until a rule
 * is deliberately set.
 */
export function rulesFor(product: QuotableProduct, siteDefaultUsd?: number): DepositRules {
  return {
    basis: product.depositBasis === "perPerson" ? "perPerson" : "fixed",
    // The site-wide default, exactly as resolveDeposit has always used it.
    //
    // Leaving it out was a real bug and worth recording: the product page fell
    // back to the default and showed a figure, while this function did not and
    // produced no quote, so the route answered "we have your request" and the
    // PayPal buttons never appeared. The page and the route disagreed about
    // where the amount comes from — which is the same class of mistake
    // resolveRail exists to prevent for the rail, reintroduced for the amount.
    amountUsd: product.depositUsd ?? siteDefaultUsd,
    maxUsd: product.depositMaxUsd,
  };
}

/**
 * The deposit for one real selection.
 *
 * `chosenExtraLabels` is matched case-insensitively against the product's own
 * extras; anything unrecognised is ignored rather than refused, because a page
 * cached before an extra was removed should still produce a booking.
 */
export function quoteDeposit(
  product: QuotableProduct,
  productType: string,
  selection: { people: unknown; extraLabels: unknown },
  siteDefaultUsd?: number
): QuoteResult {
  if (product.bookable !== true) return { ok: false, reason: "notBookable" };

  const people = selection.people;
  if (typeof people !== "number" || !Number.isInteger(people) || people < 1 || people > MAX_PEOPLE) {
    return { ok: false, reason: "badPeople" };
  }

  const rules = rulesFor(product, siteDefaultUsd);
  const serviceCents = usdToCents(rules.amountUsd);
  const maxCents = rules.maxUsd === undefined ? null : usdToCents(rules.maxUsd);
  // A cap that cannot be read is a cap nobody can rely on, so it is a
  // configuration error rather than something to ignore.
  if (rules.maxUsd !== undefined && maxCents === null) return { ok: false, reason: "noRule" };
  if (serviceCents === null) return { ok: false, reason: "noRule" };

  const lines: QuoteLine[] = [];

  if (serviceCents > 0) {
    const quantity = rules.basis === "perPerson" ? people : 1;
    const gross = serviceCents * quantity;
    const amountCents = maxCents !== null && gross > maxCents ? maxCents : gross;
    lines.push({
      kind: "service",
      label: product.title,
      unitCents: serviceCents,
      quantity,
      amountCents,
      ...(amountCents !== gross ? { cappedFromCents: gross } : {}),
    });
  }

  // Extras are matched by label and priced from the product. The map is built
  // from the product, so nothing the browser sends can introduce an entry.
  const available = new Map<string, BookingExtra>();
  for (const extra of product.extras ?? []) {
    if (extra && typeof extra.label === "string") {
      available.set(extra.label.trim().toLowerCase(), extra);
    }
  }
  const chosen = Array.isArray(selection.extraLabels) ? selection.extraLabels : [];
  const taken = new Set<string>();
  const ruleExtras: Quote["rules"]["extras"] = [];

  for (const entry of chosen) {
    if (typeof entry !== "string") continue;
    const key = entry.trim().toLowerCase();
    // Selecting the same extra twice is one extra, not two.
    if (taken.has(key)) continue;
    const extra = available.get(key);
    if (!extra) continue;
    taken.add(key);

    const depositCents = usdToCents(extra.depositUsd);
    // An extra with no deposit configured is free to add now and settled with
    // the balance — which is exactly how every extra behaved before this
    // existed, so an unedited product keeps its current behaviour.
    if (depositCents === null || depositCents === 0) continue;

    const basis: ExtraDepositBasis = extra.depositBasis === "person" ? "person" : "booking";
    const quantity = basis === "person" ? people : 1;
    lines.push({
      kind: "extra",
      label: extra.label,
      unitCents: depositCents,
      quantity,
      amountCents: depositCents * quantity,
    });
    ruleExtras.push({ label: extra.label, depositCents, basis });
  }

  const totalCents = lines.reduce((sum, line) => sum + line.amountCents, 0);
  // Charging nothing to "secure" a date is a broken promise rather than a
  // generous one, so it resolves to no deposit at all.
  if (totalCents <= 0) return { ok: false, reason: "zero" };

  return {
    ok: true,
    quote: {
      productType,
      productSlug: product.slug,
      productTitle: product.title,
      people,
      lines,
      totalCents,
      currency: "USD",
      computedAt: new Date().toISOString(),
      rules: { basis: rules.basis, serviceCents, maxCents, extras: ruleExtras },
    },
  };
}

/**
 * The quote as a customer reads it.
 *
 * Deliberately only the deposit. Egypt Eye does not publish prices anywhere on
 * the public site, and the one screen where somebody is deciding is the worst
 * place to start.
 */
export function describeQuote(quote: Quote): { label: string; detail: string }[] {
  return quote.lines.map((line) => ({
    label:
      line.quantity > 1
        ? `${line.label} — ${formatCents(line.unitCents)} × ${line.quantity}`
        : line.label,
    detail: formatCents(line.amountCents),
  }));
}

/**
 * What to put on a button, before anybody has said how many people.
 *
 * The product page renders long before the dialog knows a headcount, so it
 * cannot show a total. It shows the rate instead — and critically, it gets it
 * from the same function that will do the charging, so the figure on the
 * button and the figure in the checkout cannot come from different places.
 * They did once, and the checkout silently stopped opening.
 */
export function depositHeadline(
  product: QuotableProduct,
  productType: string,
  siteDefaultUsd?: number
): { label: string; perPerson: boolean } | null {
  const one = quoteDeposit(product, productType, { people: 1, extraLabels: [] }, siteDefaultUsd);
  if (!one.ok) return null;
  const perPerson = one.quote.rules.basis === "perPerson";
  return {
    label: formatCents(one.quote.rules.serviceCents),
    perPerson,
  };
}
