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
       * - badCap: a cap is set but is not a readable figure
       * - badPeople: the headcount is outside what we will take online
       * - zero: the rules produced nothing to charge
       */
      reason: OfferProblem;
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
/**
 * Whether a value is simply not there.
 *
 * null and undefined both mean "not set", and conflating them with "set to
 * something unreadable" is what took the deposits offline. GROQ returns null;
 * an object literal in a test omits the key and yields undefined. Both arrive
 * here and both must answer the same.
 */
export function isAbsent(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

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

  // An absent cap is null OR undefined, and the difference is not academic.
  //
  // This exact line took every deposit on the site offline. It read
  // `rules.maxUsd === undefined` and GROQ returns **null** for a field nobody
  // filled in — so an unset cap was read as a cap that could not be parsed,
  // and every bookable product reported "no deposit is configured" from the
  // moment depositMaxUsd was added to the query. The data was right the whole
  // time; the reading of it was not.
  //
  // The lesson is already written down in lib/sanityShape.ts — "GROQ returns
  // null for a field an editor cleared" — and I walked into it anyway, because
  // every test fixture used an omitted key where real data has an explicit
  // null. isAbsent() exists so the question is asked once, correctly.
  const maxCents = isAbsent(rules.maxUsd) ? null : usdToCents(rules.maxUsd);
  // A cap that IS set but cannot be read is a configuration error, and must
  // not be silently ignored — a cap nobody can rely on is worse than none.
  if (!isAbsent(rules.maxUsd) && maxCents === null) return { ok: false, reason: "badCap" };
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

export type OfferProblem = "notBookable" | "noRule" | "badCap" | "zero" | "badPeople";

export type DepositOffer =
  | { available: false; reason: OfferProblem }
  | { available: true; headline: string; perPerson: boolean; oneCents: number };

/**
 * Whether a deposit can be taken for this product at all, and what to put on
 * the button before anybody has said how many people.
 *
 * **This is the single authority on both questions,** and that is the whole
 * point of it existing. The same mistake has now been made three times in this
 * codebase: a page decides one way, the booking route decides another, and the
 * disagreement is invisible until a customer meets it. First the rail — a page
 * saying "held, not charged" about money the route captured. Then the amount —
 * a page showing $20 next to a checkout that found no rule and never opened.
 * Then bookability — a button saying "Request your date" because the page
 * asked resolveDeposit while the route asked the quote.
 *
 * Each time the fix was to make one function answer and everything read it.
 * So: if this says unavailable, no button appears anywhere; if it says
 * available, the checkout can quote a real figure. The two cannot come apart,
 * because there is no second opinion to come apart from.
 *
 * `resolveDeposit` keeps one job only — the per-product PayPal payment link.
 */
export function depositOffer(
  product: QuotableProduct,
  productType: string,
  siteDefaultUsd?: number
): DepositOffer {
  const one = quoteDeposit(product, productType, { people: 1, extraLabels: [] }, siteDefaultUsd);
  if (!one.ok) return { available: false, reason: one.reason };
  return {
    available: true,
    // The RATE, not the total — a per-person deposit has no total until
    // somebody says how many people, and showing the one-person figure as
    // though it were the price is how a group arrives at a surprise.
    headline: formatCents(one.quote.rules.serviceCents || one.quote.totalCents),
    perPerson: one.quote.rules.basis === "perPerson",
    oneCents: one.quote.totalCents,
  };
}

/** Why a product cannot take a deposit, in words somebody can act on. */
export function explainOffer(reason: OfferProblem): string {
  switch (reason) {
    case "notBookable":
      return 'The "Offer Secure your date (deposit booking)" switch is off on this product.';
    case "badCap":
      return (
        'The "Most the deposit can reach" field is set to something that is not a usable amount. ' +
        "Clear it to remove the cap, or set it to a positive figure in dollars."
      );
    case "noRule":
      return (
        "No deposit amount is set on this product, and there is no usable site-wide default. " +
        'Set one or the other, in DOLLARS — type 25 for a $25 deposit, not 2500. ' +
        'The field is "Deposit to secure a date (USD)" on the product, or "Default deposit" in Site Settings.'
      );
    case "zero":
      return "The rules add up to nothing — usually a deposit of 0, or a cap of 0 cancelling the per-person amount.";
    case "badPeople":
      return "The headcount was outside 1–20.";
    default:
      return "No deposit could be calculated.";
  }
}

/** @deprecated Use depositOffer — kept so nothing breaks mid-refactor. */
export function depositHeadline(
  product: QuotableProduct,
  productType: string,
  siteDefaultUsd?: number
): { label: string; perPerson: boolean } | null {
  const offer = depositOffer(product, productType, siteDefaultUsd);
  return offer.available ? { label: offer.headline, perPerson: offer.perPerson } : null;
}
