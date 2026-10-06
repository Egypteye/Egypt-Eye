import "server-only";

import { depositOffer, type DepositOffer, type QuotableProduct } from "./quote";
import { payPalLink } from "./deposit";
import { resolveRail, type PayRail } from "./rail";
import { paymentProviderFor } from "./activeProvider";
import type { PaymentProvider } from "./paymentProvider";

/**
 * Who is looking. The only reason this parameter exists is sandbox testing on
 * the real site — see paymentProviderFor in activeProvider.ts.
 */
export type Viewer = { isAdmin: boolean };

/**
 * What this product can charge this visitor, decided in one place.
 *
 * Four surfaces needed this answer — both product pages, the secure page and
 * the booking route — and each one assembled it from the same three calls in
 * its own order. That is the shape of a bug this codebase has now shipped four
 * times: the fourth was the product page passing `{ isAdmin: false }` because
 * it is statically rendered and cannot know, while the route passed the real
 * viewer. An admin testing the sandbox was shown "No payment now" and then
 * handed PayPal buttons by the route that the page had just promised wouldn't
 * appear.
 *
 * Making it one function does not make the static page viewer-aware — nothing
 * can, short of rendering it per request. What it does is make the gap
 * explicit and narrow: the page renders the customer's answer, and anything
 * that needs the viewer's answer asks for it (see /api/bookings/rail).
 */
export function productRail(
  product: QuotableProduct & { paypalLink?: string | null },
  productType: "photoshoot" | "experience",
  siteDefaultPercent: number | null | undefined,
  viewer: Viewer
): { offer: DepositOffer; rail: PayRail; provider: PaymentProvider } {
  const offer = depositOffer(product, productType, siteDefaultPercent);
  const provider = paymentProviderFor(viewer);
  const rail = resolveRail(
    { available: offer.available, paymentLink: payPalLink(product.paypalLink) },
    provider
  );
  // The provider comes back too, because the booking route needs its name and
  // its environment for the row it writes. Returning it here is what stops the
  // route calling paymentProviderFor a second time with a different viewer,
  // which is precisely the mistake this function exists to make impossible.
  return { offer, rail, provider };
}
