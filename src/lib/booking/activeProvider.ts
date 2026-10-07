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
 * Sandbox on a public site is refused outright. Not to customers, not to
 * admins — to nobody, because a test credential live on the real domain is a
 * payment that looks real, moves no money, and leaves a booking recorded as
 * paid.
 *
 * It was not always refused. While PayPal was being set up, the only site the
 * person doing it could reach was the real one, so signed-in admins were given
 * the sandbox buttons there and everybody else fell through to the payment
 * links. That was the right trade while testing and is the wrong one the
 * moment real money is taken: "no sandbox configuration active on the live
 * website" has to mean none, including the convenient kind.
 *
 * PAYPAL_SANDBOX_ADMIN_PREVIEW=1 brings the old behaviour back for admins, so
 * testing on the real domain is still possible without editing code. It is off
 * unless deliberately set, and liveReadiness reports it when it is on, so it
 * cannot be left enabled unnoticed.
 */
export function paymentProviderFor(viewer: { isAdmin: boolean }): PaymentProvider {
  const provider = paymentProvider();
  if (provider.env === "sandbox" && isPublicSite(process.env.NEXT_PUBLIC_SITE_URL)) {
    const previewing = process.env.PAYPAL_SANDBOX_ADMIN_PREVIEW === "1" && viewer.isAdmin;
    if (!previewing) return disabledProvider;
  }
  return provider;
}

/** Whether a customer — not an admin — would be offered a deposit right now. */
export function depositsEnabled(): boolean {
  return paymentProviderFor({ isAdmin: false }).enabled;
}
