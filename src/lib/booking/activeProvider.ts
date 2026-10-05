import "server-only";

import { chooseProvider, type PaymentProvider } from "./paymentProvider";
import { configuredPayPalProvider } from "./paypalProvider";

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

export function paymentProvider(): PaymentProvider {
  return chooseProvider(configuredPayPalProvider());
}

/** Whether the site should offer to take a deposit at all right now. */
export function depositsEnabled(): boolean {
  return paymentProvider().enabled;
}
