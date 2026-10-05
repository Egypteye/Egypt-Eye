import "server-only";

import { chooseProvider, disabledProvider, type PaymentProvider } from "./paymentProvider";
import { configuredPayPalProvider } from "./paypalProvider";
import { describeReadiness, isPublicSite, liveReadiness, payPalConfig } from "./paypalConfig";

// The live provider, resolved from the environment.
//
// Split from paymentProvider.ts only because that module must stay importable
// from a plain tsx script: pulling `server-only` into it would take the
// booking checks offline, and those checks are the thing standing between a
// wording change and a customer being told their money is held when PayPal has
// taken it. So the rules live in the pure module and the credentials live
// here.
//
// Read per call rather than at module load, so a route can never serve an
// answer captured at build time — the same reason sanity/fetchers.ts and the
// Supabase client check their own configuration per request.

// Said once per process rather than per request, so it is findable in the
// logs without drowning them.
const announced = new Set<string>();

export function paymentProvider(): PaymentProvider {
  announceReadiness();
  return chooseProvider(configuredPayPalProvider());
}

/**
 * Says what is wrong with a live configuration that still takes payments.
 *
 * A deployment missing its webhook id works perfectly right up to the first
 * payment that needs it, and then fails in a way nobody is looking for. The
 * log line is the only thing between that and finding out from a customer.
 */
function announceReadiness(): void {
  const config = payPalConfig();
  if (!config) return;
  for (const warning of liveReadiness(config)) {
    if (warning === "sandbox") continue;
    if (announced.has(warning)) continue;
    announced.add(warning);
    console.warn(`paypal: ${describeReadiness(warning)}`);
  }
}

/**
 * The provider this particular visitor may use.
 *
 * It exists for one situation, and that situation is how PayPal actually gets
 * set up: the person doing it needs to test against the sandbox, and the only
 * site they can reach is the real one. Sandbox credentials on the real domain
 * would let a customer complete a payment that moves no money while the
 * booking is recorded as paid — so the straightforward answer was a separate
 * preview deployment, which means branches, preview URLs and a second copy of
 * every environment variable. That is a lot of moving parts to get wrong while
 * trying to prove one thing works.
 *
 * So sandbox on a public site is simply not offered to customers. An admin
 * gets the PayPal buttons and can test the whole path on the real site;
 * everybody else falls through to the payment links on each product, which is
 * exactly what they get today. Nothing a customer can reach changes, and the
 * testing has nowhere to leak to.
 *
 * Live is unaffected: this only ever narrows the sandbox.
 */
export function paymentProviderFor(viewer: { isAdmin: boolean }): PaymentProvider {
  const provider = paymentProvider();
  if (
    provider.env === "sandbox" &&
    isPublicSite(process.env.NEXT_PUBLIC_SITE_URL) &&
    !viewer.isAdmin
  ) {
    return disabledProvider;
  }
  return provider;
}

/** Whether a customer — not an admin — would be offered a deposit right now. */
export function depositsEnabled(): boolean {
  return paymentProviderFor({ isAdmin: false }).enabled;
}
