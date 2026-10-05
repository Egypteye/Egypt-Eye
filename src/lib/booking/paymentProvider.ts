import type { PaymentMode } from "./wording";

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

export type RefundResult =
  | { ok: true; id: string; /** True when PayPal said it had already refunded. */ alreadyDone: boolean }
  | { ok: false; reason: "unavailable" | "error"; message: string };

/** What the reservation says this payment is supposed to be. */
export type ExpectedPayment = {
  reference: string;
  amountUsd: number;
};

export type ApprovalResult =
  | {
      ok: true;
      /** Whether the money moved or was only held. */
      state: "captured" | "authorized";
      /** The capture or authorization id — what a later refund or void needs. */
      id: string;
      orderId: string;
      amountUsd: number;
    }
  | {
      ok: false;
      reason:
        | "unavailable"
        | "rejected"
        /** The payment is real but belongs to another booking, or is for another amount. */
        | "mismatch"
        /** PayPal has it but has not completed it — not money in the account. */
        | "pending";
      message: string;
    };

export type PaymentProvider = {
  readonly name: string;
  /** Whether a deposit can actually be taken right now. */
  readonly enabled: boolean;
  /** The browser SDK's client id. Public by design; the secret never leaves the server. */
  readonly clientId: string | null;
  /** CAPTURE takes the money on approval; AUTHORIZE only holds it. */
  readonly intent: "CAPTURE" | "AUTHORIZE";
  /**
   * Which PayPal this is. Carried all the way to the browser so a test
   * payment cannot be mistaken for a real one — a sandbox payment moves no
   * money, and somebody who thinks they have paid is the worst outcome here.
   */
  readonly env: "live" | "sandbox" | "none";
  /**
   * What happens to the customer's money, which is what every sentence they
   * read is chosen from. Derived from the intent rather than set separately,
   * because two fields that can disagree eventually do.
   */
  readonly moneyMode: PaymentMode;
  /**
   * Places a hold. Does NOT move money — see the design doc. Returns the URL
   * the customer is sent to in order to approve it.
   */
  createHold(intent: DepositIntent): Promise<HoldResult>;
  /**
   * Turns a customer's approval into a known state, by asking the provider
   * rather than the browser.
   *
   * `expected` is what the reservation says this payment should be. The
   * provider compares it against what the provider itself reports and refuses
   * on a mismatch — the browser supplies only an order id that we issued.
   */
  finalizeApproval(orderId: string, expected: ExpectedPayment): Promise<ApprovalResult>;
  /** Takes the held money. Called when a human confirms, never before. */
  capture(authorizationId: string): Promise<SettleResult>;
  /** Releases the hold. Called when Egypt Eye cannot do the date. */
  release(authorizationId: string): Promise<SettleResult>;
  /**
   * Gives captured money back. Needed because CAPTURE intent takes the money
   * at approval, so "we refund it in full if we cannot confirm your date" is a
   * promise with an API call behind it rather than a note to staff.
   */
  refund(captureId: string, amountUsd: number): Promise<RefundResult>;
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
  clientId: null,
  intent: "CAPTURE",
  env: "none",
  moneyMode: "none",
  async createHold() {
    return {
      ok: false,
      reason: "unavailable",
      message: "Online deposits are not switched on yet.",
    };
  },
  async finalizeApproval() {
    return { ok: false, reason: "unavailable", message: "No payment provider is configured." };
  },
  async capture() {
    return { ok: false, reason: "unavailable", message: "No payment provider is configured." };
  },
  async refund() {
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
 * Picks the provider for this deployment.
 *
 * Deliberately takes the candidate rather than finding it. This module must
 * stay free of `server-only` so scripts/check-booking.mts can assert the rules
 * against the real code — the same reason the deposit wording lives in its own
 * pure module. Resolving the PayPal credentials is therefore the caller's job,
 * and `activeProvider.ts` is the one caller that does it.
 */
export function chooseProvider(candidate: PaymentProvider | null): PaymentProvider {
  // Configuration decides, never a caller — so a route cannot reach a live
  // payment rail in an environment that was not set up for one. With no
  // credentials this is `disabledProvider`, and every surface already handles
  // that: the booking degrades to a request with no payment rather than to a
  // broken checkout.
  return candidate ?? disabledProvider;
}
