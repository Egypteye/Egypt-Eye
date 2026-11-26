/**
 * WHICH SITE DOES PAYPAL SEND THE CUSTOMER BACK TO?
 *
 * =========================================================================
 * WHY THIS IS NOT JUST `request.headers.get("host")`
 * =========================================================================
 * The obvious implementation is to read the Host header and build the return
 * URL from it, so the customer comes back where they started. It is also an
 * open redirect, and the worst-shaped one: the attacker does not have to get
 * anybody to click their link, because PayPal does the redirecting for them,
 * from inside a payment flow the victim already trusts.
 *
 * `Host` is client-supplied. Vercel's own generated hostnames all answer this
 * deployment, and anything that gets a crafted Host through to the route would
 * have its value handed to PayPal as the place to deliver the customer after
 * paying. A payment page that returns you to a stranger's domain is a
 * convincing place to ask for a card number again.
 *
 * So nothing here is echoed. The host is used ONLY to CHOOSE between origins
 * this repository already knows, and the function cannot return any other
 * string. An unrecognised host falls through to Egypt Eye's canonical URL,
 * which is the same fail-safe direction the proxy takes, for the reason
 * written at the end of lib/brand/flyingDressesHost.ts: being too narrow here
 * must degrade to the wrong brand's chrome, never to an unknown domain.
 *
 * =========================================================================
 * WHY IT IS ITS OWN FILE
 * =========================================================================
 * CLAUDE.md section 6. The booking route imports `server-only` modules, so a
 * decision left inside it cannot be loaded by a check script and therefore
 * cannot be tested. This file imports one import-free module and is otherwise
 * pure, so scripts/check-booking.mts runs the real function over the real
 * hostnames — including the Vercel-generated ones that caused the incident
 * described in flyingDressesHost.ts.
 */

import { FLYING_DRESSES_HOST, isFlyingDressesHost } from "./flyingDressesHost";

/** The brand's public origin. Hardcoded, never derived from a request. */
export const FLYING_DRESSES_ORIGIN = `https://${FLYING_DRESSES_HOST}`;

/**
 * Where a booking made on `host` should return to after PayPal.
 *
 * `egyptEyeOrigin` is passed rather than imported so the caller supplies the
 * configured site URL and the check script can supply a known one.
 */
export function bookingReturnOrigin(host: string | null | undefined, egyptEyeOrigin: string): string {
  if (typeof host === "string" && isFlyingDressesHost(host)) {
    return FLYING_DRESSES_ORIGIN;
  }
  return egyptEyeOrigin;
}

/**
 * The two URLs PayPal is given for one booking.
 *
 * Built together because they must agree about the origin: a return URL on one
 * brand and a cancel URL on the other would move a customer between sites
 * depending on whether they completed the payment, which is the confusing
 * half of the problem this function exists to solve.
 */
export function bookingRedirects({
  host,
  egyptEyeOrigin,
  reference,
  productType,
  productSlug,
}: {
  host: string | null | undefined;
  egyptEyeOrigin: string;
  reference: string;
  productType: string;
  productSlug: string;
}): { returnUrl: string; cancelUrl: string } {
  const origin = bookingReturnOrigin(host, egyptEyeOrigin);
  const ref = encodeURIComponent(reference);
  return {
    returnUrl: `${origin}/secure/return?ref=${ref}`,
    // Back to the page they were on, which exists under the same path on both
    // brands — Egypt Eye at app/[locale]/(site)/secure/[type]/[slug], Flying
    // Dresses at app/flying-dresses/secure/[type]/[slug], which the proxy
    // serves from the short form.
    cancelUrl: `${origin}/secure/${encodeURIComponent(productType)}/${encodeURIComponent(
      productSlug
    )}?ref=${ref}`,
  };
}
