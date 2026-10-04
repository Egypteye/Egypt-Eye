// The payment boundary.
//
// Everything above this file talks about holds, captures and voids. Nothing
// above it knows that PayPal exists. That matters for two reasons beyond
// tidiness:
//
//   1. The flow has to be shippable before the payment rail is proven. The
//      design in docs/booking-deposits.md depends on PayPal's AUTHORIZE intent
//      behaving as documented for the payment methods Egypt Eye's customers
//      actually use, and that can only be established in a sandbox with real
//      credentials. Until it is, `disabledProvider` is what runs, and the
//      booking flow degrades to a request with no payment rather than to a
//      broken checkout.
//   2. If holds turn out not to work well enough, the fallback is
//      capture-then-refund — a different provider implementation behind the
//      same interface, not a rewrite of the booking flow.
//
// The provider is chosen by configuration, never by a caller, so a route
// cannot accidentally reach a live payment rail in an environment that was
// not set up for one.

export type DepositIntent = {
  reference: string;
  amountUsd: number;
  /** Shown on the PayPal screen, so it must read as what it is. */
  description: string;
  returnUrl: string;
  cancelUrl: string;
};

export type HoldResult =
  | { ok: true; orderId: string; approvalUrl: string }
  | { ok: false; reason: "unavailable" | "rejected" | "error"; message: string };

export type SettleResult =
  | { ok: true; id: string }
  | { ok: false; reason: "unavailable" | "expired" | "error"; message: string };

export type PaymentProvider = {
  readonly name: string;
  /** Whether a deposit can actually be taken right now. */
  readonly enabled: boolean;
  /**
   * Places a hold. Does NOT move money — see the design doc. Returns the URL
   * the customer is sent to in order to approve it.
   */
  createHold(intent: DepositIntent): Promise<HoldResult>;
  /** Takes the held money. Called when a human confirms, never before. */
  capture(authorizationId: string): Promise<SettleResult>;
  /** Releases the hold. Called when Egypt Eye cannot do the date. */
  release(authorizationId: string): Promise<SettleResult>;
  /** Verifies a webhook really came from the provider. */
  verifyWebhook(headers: Headers, rawBody: string): Promise<boolean>;
};

/**
 * What runs until a payment rail is configured and proven.
 *
 * Deliberately not a stub that pretends to succeed. A fake success here would
 * put "deposit held" in front of a customer who has paid nothing, which is the
 * precise lie this whole design exists to prevent. It fails honestly, and the
 * booking flow is built to carry on without payment when it does.
 */
export const disabledProvider: PaymentProvider = {
  name: "disabled",
  enabled: false,
  async createHold() {
    return {
      ok: false,
      reason: "unavailable",
      message: "Online deposits are not switched on yet.",
    };
  },
  async capture() {
    return { ok: false, reason: "unavailable", message: "No payment provider is configured." };
  },
  async release() {
    return { ok: false, reason: "unavailable", message: "No payment provider is configured." };
  },
  // Refusing every webhook is the safe default: with no configured secret
  // there is no way to tell a real event from a forged one, and accepting an
  // unverified event would let anyone mark a booking as paid.
  async verifyWebhook() {
    return false;
  },
};

/**
 * The provider for this deployment.
 *
 * Reads configuration at call time rather than at module load, so a route
 * cannot capture a stale answer from build time — the same reason
 * sanity/fetchers.ts checks its own configuration per request.
 */
export function paymentProvider(): PaymentProvider {
  // The PayPal implementation lands here once the sandbox test in
  // docs/booking-deposits.md has actually been run. Until then this is the
  // only provider, by design, and every surface already handles it.
  return disabledProvider;
}

/** Whether the site should offer to take a deposit at all right now. */
export function depositsEnabled(): boolean {
  return paymentProvider().enabled;
}
