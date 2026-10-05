import "server-only";

import { chooseProvider, type PaymentProvider } from "./paymentProvider";
import { configuredPayPalProvider } from "./paypalProvider";
import { describeReadiness, liveReadiness, payPalConfig } from "./paypalConfig";

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

/** Whether the site should offer to take a deposit at all right now. */
export function depositsEnabled(): boolean {
  return paymentProvider().enabled;
}
