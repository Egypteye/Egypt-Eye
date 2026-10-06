// The PayPal link check, and nothing else any more.
//
// This module used to resolve the deposit as well: a flat per-product amount
// with a site-wide fallback, deliberately NOT a percentage, on the argument
// that a small fixed sum is defensible as the cost of holding a date where a
// percentage of a large trip is not.
//
// That argument lost to a worse problem. A flat deposit and a price are two
// sources of truth for one booking, with nothing keeping them in step — a
// product could carry a $25 deposit beside a $200 price, and changing the
// price left the deposit saying something nobody meant. The deposit is now
// one percentage of the backend price, computed in lib/booking/quote.ts, and
// resolveDeposit and presentDeposit are gone rather than deprecated. A second
// function that still answers is a second answer.

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
