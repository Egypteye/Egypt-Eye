"use server";

import { requireAdmin } from "@/lib/auth/session";
import { payPalConfig, toPayPalAmount } from "@/lib/booking/paypalConfig";
import { payPalRequest } from "@/lib/booking/paypalClient";
import { reconcilePayments } from "@/lib/booking/reconcile";

// The connection test behind /admin/paypal.
//
// It exists because the person setting PayPal up does not have a terminal. The
// command-line smoke test proves the same things, but asking somebody to
// install Node and clone a repository in order to check that two environment
// variables are correct is a worse answer than a button.
//
// It makes a real order and never approves it, so nothing moves and nothing is
// left behind — an unapproved order simply expires. That is also why it is
// safe to run against live: it is the cheapest possible way to find out that a
// credential is wrong, and finding out from a customer is the expensive one.

export type PayPalTestResult = {
  ok: boolean;
  steps: { label: string; ok: boolean; detail: string }[];
};

export async function testPayPalConnection(): Promise<PayPalTestResult> {
  // Admin only. This creates orders against the real account and reports on
  // the configuration, so it is not for reservations staff.
  await requireAdmin();

  const config = payPalConfig();
  const steps: PayPalTestResult["steps"] = [];
  if (!config) {
    return {
      ok: false,
      steps: [
        {
          label: "Credentials found",
          ok: false,
          detail: "PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are not both set on this deployment.",
        },
      ],
    };
  }

  // 1. Do the credentials work at all? Everything else is downstream of this,
  //    and the usual cause of failure is a sandbox key against the live host
  //    or the reverse.
  const reference = `EE-TEST${Date.now().toString(36).toUpperCase().slice(-4)}`;
  const created = await payPalRequest<{ id?: string; status?: string }>(config, "/v2/checkout/orders", {
    method: "POST",
    body: {
      intent: config.intent,
      purchase_units: [
        {
          custom_id: reference,
          invoice_id: reference,
          description: "Egypt Eye — connection test",
          amount: { currency_code: "USD", value: toPayPalAmount(1) },
        },
      ],
    },
  });

  if (!created.ok) {
    steps.push({
      label: "PayPal accepted the credentials",
      ok: false,
      detail:
        created.message +
        (config.env === "live"
          ? " — check you used the LIVE keys, not the sandbox ones."
          : " — check you used the SANDBOX keys, not the live ones."),
    });
    return { ok: false, steps };
  }
  steps.push({
    label: "PayPal accepted the credentials",
    ok: true,
    detail: `Connected to ${config.env}.`,
  });
  steps.push({
    label: "A test order was created",
    ok: true,
    detail: `Order ${created.data.id} (${created.data.status}). Nobody will approve it, so no money moves and it expires on its own.`,
  });

  // 2. Does the booking reference survive the round trip? This is the property
  //    the whole reconciliation depends on — if custom_id does not come back,
  //    payments cannot find their bookings and somebody has to match every one
  //    by hand.
  const readBack = await payPalRequest<{
    purchase_units?: { custom_id?: string; amount?: { value?: string } }[];
  }>(config, `/v2/checkout/orders/${created.data.id}`, { method: "GET" });

  if (!readBack.ok) {
    steps.push({ label: "The order could be read back", ok: false, detail: readBack.message });
    return { ok: false, steps };
  }
  const unit = readBack.data.purchase_units?.[0];
  const referenceSurvived = unit?.custom_id === reference;
  steps.push({
    label: "Bookings will match their payments automatically",
    ok: referenceSurvived,
    detail: referenceSurvived
      ? `The reference ${reference} came back intact, so payments find their own booking.`
      : `The reference came back as "${unit?.custom_id ?? "nothing"}" instead of ${reference}. Do not take real payments until this is understood.`,
  });
  const amountSurvived = unit?.amount?.value === "1.00";
  steps.push({
    label: "Amounts arrive exactly as sent",
    ok: amountSurvived,
    detail: amountSurvived ? "$1.00 sent, $1.00 returned." : `Sent $1.00, PayPal returned ${unit?.amount?.value ?? "nothing"}.`,
  });

  // 3. The webhook. Payments work without it; everything that happens after
  //    the customer closes the tab does not.
  if (config.webhookId) {
    const hooks = await payPalRequest<{ webhooks?: { id?: string; url?: string }[] }>(
      config,
      "/v1/notifications/webhooks",
      { method: "GET" }
    );
    const found = hooks.ok ? hooks.data.webhooks?.find((hook) => hook.id === config.webhookId) : undefined;
    steps.push({
      label: "The webhook exists on this account",
      ok: Boolean(found),
      detail: found
        ? `Delivering to ${found.url}`
        : `PAYPAL_WEBHOOK_ID is set to ${config.webhookId}, but no webhook with that id is on this ${config.env} account. Every delivery would be refused.`,
    });
  }

  return { ok: steps.every((step) => step.ok), steps };
}

/**
 * Runs the payment sweep by hand.
 *
 * The cron runs daily, which is the right cadence for something that mostly
 * finds nothing. This is for the times somebody has a reason to think a
 * payment went missing and does not want to wait until tomorrow to find out.
 */
export async function runReconciliation(): Promise<{ summary: string; problems: string[] }> {
  await requireAdmin();
  const report = await reconcilePayments();
  const parts = [
    `${report.checked} in-flight payment${report.checked === 1 ? "" : "s"} checked`,
    report.captured > 0 ? `${report.captured} captured that nobody had told us about` : "",
    report.fulfilled > 0 ? `${report.fulfilled} set of emails sent` : "",
    report.expired > 0 ? `${report.expired} closed as abandoned` : "",
    report.stillPending > 0 ? `${report.stillPending} still pending at PayPal` : "",
  ].filter(Boolean);
  return {
    summary: parts.length > 1 ? parts.join(", ") + "." : "Nothing needed doing.",
    problems: report.problems,
  };
}
