import "server-only";

import { payPalRequest } from "./paypalClient";
import {
  hasWebhookSignatureHeaders,
  moneyModeFor,
  payPalConfig,
  sameMoney,
  toPayPalAmount,
  type PayPalConfig,
} from "./paypalConfig";
import type {
  ApprovalResult,
  DepositIntent,
  HoldResult,
  PaymentProvider,
  RefundResult,
  SettleResult,
} from "./paymentProvider";

// PayPal, behind the provider interface.
//
// The rule this file exists to enforce: the browser cannot tell us that money
// moved. Everything the booking system believes about a payment is read back
// from PayPal here, over an authenticated call, and compared against what the
// reservation says it should be. The browser's only input is an order id it
// was given by us in the first place.
//
// That is not paranoia about a clever attacker. It is the same property that
// makes a half-finished payment, a double-click, a flaky connection and a
// replayed tab all resolve to the truth instead of to whatever the last
// request happened to claim.

type OrderResponse = {
  id?: string;
  status?: string;
  intent?: string;
  links?: { rel?: string; href?: string }[];
  purchase_units?: {
    custom_id?: string;
    amount?: { value?: string; currency_code?: string };
    payments?: {
      captures?: { id?: string; status?: string; amount?: { value?: string } }[];
      authorizations?: { id?: string; status?: string; amount?: { value?: string } }[];
    };
  }[];
};

export function payPalProvider(config: PayPalConfig): PaymentProvider {
  return {
    name: `paypal-${config.env}`,
    enabled: true,
    clientId: config.clientId,
    intent: config.intent,
    env: config.env,
    // CAPTURE moves the money the moment the customer approves; AUTHORIZE does
    // not. Every customer-facing sentence about the deposit is chosen from
    // this, so a mismatch here is a mismatch in what people are told — which
    // is why it is derived from the intent rather than set alongside it.
    moneyMode: moneyModeFor(config.intent),

    async createHold(deposit: DepositIntent): Promise<HoldResult> {
      const response = await payPalRequest<OrderResponse>(config, "/v2/checkout/orders", {
        method: "POST",
        // Keyed by our reference, so a retried create cannot leave two live
        // orders against one booking.
        idempotencyKey: `order-${deposit.reference}`,
        body: {
          intent: config.intent,
          purchase_units: [
            {
              // THE reconciliation key. PayPal echoes it back on the order and
              // on every webhook, which is what lets a payment find its
              // booking without anyone typing a reference into a note field.
              custom_id: deposit.reference,
              // Shown in the customer's PayPal activity and on Egypt Eye's
              // side of the transaction.
              invoice_id: deposit.reference,
              description: deposit.description.slice(0, 127),
              amount: {
                currency_code: "USD",
                value: toPayPalAmount(deposit.amountUsd),
              },
            },
          ],
          payment_source: {
            paypal: {
              experience_context: {
                brand_name: "Egypt Eye Travel and Tours",
                user_action: "PAY_NOW",
                // The buttons stay on the page, but PayPal still requires
                // these for the funding sources that redirect.
                return_url: deposit.returnUrl,
                cancel_url: deposit.cancelUrl,
              },
            },
          },
        },
      });

      if (!response.ok) {
        return {
          ok: false,
          reason: response.status === 0 ? "unavailable" : "rejected",
          message: response.message,
        };
      }
      const id = response.data.id;
      if (!id) {
        return { ok: false, reason: "error", message: "PayPal did not return an order id." };
      }
      const approvalUrl =
        response.data.links?.find((link) => link.rel === "payer-action" || link.rel === "approve")?.href ?? "";
      return { ok: true, orderId: id, approvalUrl };
    },

    async finalizeApproval(orderId, expected): Promise<ApprovalResult> {
      const path =
        config.intent === "CAPTURE"
          ? `/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`
          : `/v2/checkout/orders/${encodeURIComponent(orderId)}/authorize`;

      let response = await payPalRequest<OrderResponse>(config, path, {
        method: "POST",
        body: {},
        // The double-click guard. PayPal returns the original result for a
        // repeated request id rather than taking the money twice.
        idempotencyKey: `settle-${expected.reference}`,
      });

      // ORDER_ALREADY_CAPTURED is a success that arrives as an error: the
      // money is there, this request simply was not the one that moved it.
      // Reading the order back turns it into the truth.
      if (!response.ok && /ORDER_ALREADY_CAPTURED|ORDER_ALREADY_AUTHORIZED/i.test(response.body)) {
        response = await payPalRequest<OrderResponse>(config, `/v2/checkout/orders/${encodeURIComponent(orderId)}`, {
          method: "GET",
        });
      }

      if (!response.ok) {
        return {
          ok: false,
          reason: response.status === 0 ? "unavailable" : "rejected",
          message: response.message,
        };
      }

      const unit = response.data.purchase_units?.[0];
      const capture = unit?.payments?.captures?.[0];
      const authorization = unit?.payments?.authorizations?.[0];
      const settlement = capture ?? authorization;

      if (!settlement?.id) {
        return {
          ok: false,
          reason: "rejected",
          message: "PayPal accepted the order but reported no payment against it.",
        };
      }

      // The two checks that make this trustworthy. Neither value comes from
      // the browser: both are read from PayPal's own response and compared
      // against what the reservation says this payment should be.
      //
      // A mismatch is not a thing to tolerate and carry on from. It means the
      // order id we were handed belongs to a different booking, or is for a
      // different amount than the one the customer was shown — so the booking
      // is not marked paid and a person looks at it.
      if (unit?.custom_id && unit.custom_id !== expected.reference) {
        return {
          ok: false,
          reason: "mismatch",
          message: `That payment belongs to booking ${unit.custom_id}, not ${expected.reference}.`,
        };
      }
      const paidAmount = settlement.amount?.value ?? unit?.amount?.value;
      if (!sameMoney(expected.amountUsd, paidAmount)) {
        return {
          ok: false,
          reason: "mismatch",
          message: `PayPal reported ${paidAmount ?? "no amount"} against a ${expected.amountUsd} deposit.`,
        };
      }

      const state = capture ? "captured" : "authorized";
      // A capture can legitimately come back PENDING (a review, an echeck).
      // It is not money in the account, so it must not be reported as money in
      // the account — the booking stays unpaid and the webhook will say when
      // it settles.
      const settled = (settlement.status ?? "").toUpperCase();
      if (state === "captured" && settled !== "COMPLETED") {
        return {
          ok: false,
          reason: "pending",
          message: `PayPal has the payment but has not completed it (${settled || "unknown"}). We will update your booking when it clears.`,
        };
      }
      if (state === "authorized" && settled !== "CREATED" && settled !== "PENDING") {
        return { ok: false, reason: "pending", message: `PayPal reported the hold as ${settled || "unknown"}.` };
      }

      return { ok: true, state, id: settlement.id, orderId, amountUsd: expected.amountUsd };
    },

    async capture(authorizationId: string): Promise<SettleResult> {
      const response = await payPalRequest<{ id?: string; status?: string }>(
        config,
        `/v2/payments/authorizations/${encodeURIComponent(authorizationId)}/capture`,
        { method: "POST", body: {}, idempotencyKey: `capture-${authorizationId}` }
      );
      if (!response.ok) {
        // An expired authorization is its own outcome: nothing is wrong with
        // the system, the hold simply aged out, and the desk needs to be told
        // that rather than shown a generic failure.
        const expired = /AUTHORIZATION_EXPIRED|EXPIRED/i.test(response.body);
        return {
          ok: false,
          reason: expired ? "expired" : response.status === 0 ? "unavailable" : "error",
          message: response.message,
        };
      }
      return { ok: true, id: response.data.id ?? authorizationId };
    },

    async release(authorizationId: string): Promise<SettleResult> {
      const response = await payPalRequest<Record<string, never>>(
        config,
        `/v2/payments/authorizations/${encodeURIComponent(authorizationId)}/void`,
        { method: "POST", idempotencyKey: `void-${authorizationId}` }
      );
      if (!response.ok) {
        // Already voided or already expired both mean the customer's money is
        // not held, which is the outcome we wanted.
        if (/ALREADY_VOIDED|AUTHORIZATION_VOIDED|EXPIRED/i.test(response.body)) {
          return { ok: true, id: authorizationId };
        }
        return {
          ok: false,
          reason: response.status === 0 ? "unavailable" : "error",
          message: response.message,
        };
      }
      return { ok: true, id: authorizationId };
    },

    async refund(captureId: string, amountUsd: number): Promise<RefundResult> {
      const response = await payPalRequest<{ id?: string; status?: string }>(
        config,
        `/v2/payments/captures/${encodeURIComponent(captureId)}/refund`,
        {
          method: "POST",
          // The amount is stated rather than left to default to "everything",
          // so a refund can never quietly exceed the deposit if a capture ever
          // carries more than one booking's money.
          body: { amount: { currency_code: "USD", value: toPayPalAmount(amountUsd) } },
          idempotencyKey: `refund-${captureId}`,
        }
      );
      if (!response.ok) {
        if (/ALREADY_REFUNDED|CAPTURE_FULLY_REFUNDED/i.test(response.body)) {
          return { ok: true, id: captureId, alreadyDone: true };
        }
        return {
          ok: false,
          reason: response.status === 0 ? "unavailable" : "error",
          message: response.message,
        };
      }
      return { ok: true, id: response.data.id ?? captureId, alreadyDone: false };
    },

    async verifyWebhook(headers: Headers, rawBody: string): Promise<boolean> {
      // No webhook id means we cannot tell a real event from a forged one.
      // Refusing is the only safe answer: accepting an unverified event would
      // let anyone mark any booking as paid by POSTing to a public URL.
      if (!config.webhookId) {
        console.error("paypal: PAYPAL_WEBHOOK_ID is not set, so every webhook is refused");
        return false;
      }

      // A delivery with no signature cannot be verified by anyone, so it is
      // refused here rather than after a pointless round trip.
      if (!hasWebhookSignatureHeaders(headers)) return false;

      let event: unknown;
      try {
        event = JSON.parse(rawBody);
      } catch {
        return false;
      }

      const response = await payPalRequest<{ verification_status?: string }>(
        config,
        "/v1/notifications/verify-webhook-signature",
        {
          method: "POST",
          body: {
            auth_algo: headers.get("paypal-auth-algo"),
            cert_url: headers.get("paypal-cert-url"),
            transmission_id: headers.get("paypal-transmission-id"),
            transmission_sig: headers.get("paypal-transmission-sig"),
            transmission_time: headers.get("paypal-transmission-time"),
            webhook_id: config.webhookId,
            // PayPal verifies against the parsed event, and the signature is
            // over the bytes we received — which is why the route must hand us
            // the raw body rather than something re-serialized.
            webhook_event: event,
          },
        }
      );
      if (!response.ok) {
        console.error("paypal: webhook verification call failed", response.message);
        return false;
      }
      return response.data.verification_status === "SUCCESS";
    },
  };
}

/** The configured provider, or null when PayPal is not set up. */
export function configuredPayPalProvider(): PaymentProvider | null {
  const config = payPalConfig();
  return config ? payPalProvider(config) : null;
}
