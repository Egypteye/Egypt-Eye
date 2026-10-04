import type { Experience, Photoshoot, Price } from "@/content/types";

// What a deposit is, and when the "Secure your date" door appears.
//
// The rules live here rather than in the page because three surfaces ask the
// same questions — the product page's button, the secure page itself, and the
// team email — and a product that is bookable on one and not on another is the
// kind of thing a customer screenshots.
//
// See docs/booking-deposits.md for why the deposit is a flat per-product
// amount rather than a percentage: a small fixed sum is defensible as the real
// cost of holding a date, where a percentage of a large trip is not.

/** A product that can carry a deposit. Tours deliberately do not, yet. */
export type BookableProduct = Pick<Photoshoot | Experience, "slug" | "title" | "price"> & {
  bookable?: boolean;
  depositUsd?: number;
  paypalLink?: string;
};

export type DepositResolution =
  | { bookable: false; reason: "notEnabled" | "noAmount" }
  | {
      bookable: true;
      amountUsd: number;
      source: "product" | "siteDefault";
      /** Where the customer pays, when a PayPal link is configured and valid. */
      paymentLink: string | null;
    };

/**
 * The deposit for a product, or why there isn't one.
 *
 * A product with no figure set anywhere resolves to `noAmount` and shows no
 * button. That is the correct failure: silence, rather than a guess at what
 * somebody should be charged. Egypt Eye turns each product on by typing a
 * number into the Studio, which means the feature ships dark and goes live one
 * product at a time.
 */
export function resolveDeposit(
  product: BookableProduct,
  siteDefaultUsd?: number
): DepositResolution {
  if (product.bookable !== true) return { bookable: false, reason: "notEnabled" };

  const paymentLink = payPalLink(product.paypalLink);

  const own = usableAmount(product.depositUsd);
  if (own !== null) return { bookable: true, amountUsd: own, source: "product", paymentLink };

  const fallback = usableAmount(siteDefaultUsd);
  if (fallback !== null) return { bookable: true, amountUsd: fallback, source: "siteDefault", paymentLink };

  return { bookable: false, reason: "noAmount" };
}

/**
 * A deposit has to be a real, positive, payable figure. Zero is not "free" —
 * it is an unset field that someone typed a zero into, and charging $0 to
 * secure a date would be a broken promise rather than a generous one.
 */
function usableAmount(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null;
  // Whole dollars. A $49.99 deposit reads as a price, and this is not a price.
  return Math.round(value);
}

export type DepositPresentation =
  | { kind: "withTotal"; total: string; deposit: string; balance: string }
  | { kind: "depositOnly"; deposit: string };

/**
 * How the deposit is explained, which depends on whether a total exists.
 *
 * Both forms state the deposit as one exact number, because that is the only
 * number being charged. The second form says plainly that the price is still
 * to be agreed — which is honest in a way a "from" price would not be, and is
 * the case that covers most Extra Experiences.
 */
export function presentDeposit(amountUsd: number, price?: Price): DepositPresentation {
  const deposit = money(amountUsd);
  const total = price?.amount;

  // A total lower than the deposit is an editing mistake, not a product. Fall
  // back to the deposit-only form rather than rendering a negative balance.
  if (typeof total !== "number" || !Number.isFinite(total) || total <= amountUsd) {
    return { kind: "depositOnly", deposit };
  }

  return {
    kind: "withTotal",
    total: money(total),
    deposit,
    balance: money(total - amountUsd),
  };
}

function money(amount: number): string {
  return amount % 1 === 0 ? `$${amount}` : `$${amount.toFixed(2)}`;
}

/**
 * A PayPal link, or nothing.
 *
 * Checked here rather than trusted from the CMS because this value becomes a
 * link a paying customer clicks. Studio validation catches an honest typo at
 * the point of editing, but it is advisory: a document migrated in, pasted
 * from elsewhere, or edited before that rule existed would sail past it. The
 * host check is what actually stands between a mistyped field and a customer
 * being sent somewhere that is not PayPal to pay.
 *
 * Returns null rather than throwing: a bad link should remove the pay button,
 * not take the page down.
 */
export function payPalLink(value: unknown): string | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:") return null;
    // Exactly paypal.com / paypal.me, or a subdomain of one. The leading
    // boundary matters: "notpaypal.com" and "paypal.com.evil.net" must both
    // fail, and a looser `includes` check would pass both.
    if (!/(^|\.)paypal\.(com|me)$/i.test(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}
