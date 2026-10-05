/**
 * Proves the PayPal credentials actually work, against the real API.
 *
 * This exists because PayPal cannot be reached from CI or from the environment
 * this integration was written in, so the round trip is the one part that was
 * never executed here. Everything it checks is the plumbing rather than the
 * reasoning — the reasoning is covered by check-paypal.mts, which runs
 * everywhere.
 *
 * It creates a real order and then reads it back. With PAYPAL_ENV unset that
 * is a sandbox order, which costs nothing and nobody ever approves, so it
 * leaves no mess. It will NOT run against live unless you ask twice, because
 * an unapproved live order is harmless but a habit of pointing test scripts at
 * live is not.
 *
 *   PAYPAL_CLIENT_ID=... PAYPAL_CLIENT_SECRET=... npm run paypal:smoke
 *
 * Add PAYPAL_WEBHOOK_ID to also check that the id you created in the dashboard
 * is one this account can see.
 */
import { payPalConfig } from "../src/lib/booking/paypalConfig";

const config = payPalConfig();
if (!config) {
  console.error(
    "\nPAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are not both set.\n\n" +
      "Run it like this, with the values from your REST app in the PayPal dashboard:\n" +
      "  PAYPAL_CLIENT_ID=xxx PAYPAL_CLIENT_SECRET=yyy npm run paypal:smoke\n"
  );
  process.exit(1);
}

if (config.env === "live" && process.env.PAYPAL_SMOKE_ALLOW_LIVE !== "yes") {
  console.error(
    "\nPAYPAL_ENV=live. This script creates a real order.\n" +
      "It is harmless — an order nobody approves expires on its own and moves no money —\n" +
      "but run it against sandbox first. To go ahead anyway:\n" +
      "  PAYPAL_SMOKE_ALLOW_LIVE=yes npm run paypal:smoke\n"
  );
  process.exit(1);
}

console.log(`\nPayPal: ${config.env}, intent ${config.intent}`);
console.log(`  ${config.baseUrl}`);
console.log(`  client id …${config.clientId.slice(-6)}`);
console.log(`  webhook id ${config.webhookId ? `…${config.webhookId.slice(-6)}` : "NOT SET — webhooks will all be refused"}\n`);

const basic = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");

// 1. Credentials.
const tokenResponse = await fetch(`${config.baseUrl}/v1/oauth2/token`, {
  method: "POST",
  headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
  body: "grant_type=client_credentials",
});
if (!tokenResponse.ok) {
  console.error(`✗ Could not authenticate (HTTP ${tokenResponse.status}).`);
  console.error(await tokenResponse.text());
  console.error(
    "\nThe usual cause is a sandbox key against the live host or the reverse — check PAYPAL_ENV.\n"
  );
  process.exit(1);
}
const { access_token: token } = (await tokenResponse.json()) as { access_token: string };
console.log("✓ Credentials accepted");

// 2. An order, exactly as the booking route creates one.
const reference = `EE-SMOKE${Date.now().toString(36).toUpperCase().slice(-4)}`;
const orderResponse = await fetch(`${config.baseUrl}/v2/checkout/orders`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    intent: config.intent,
    purchase_units: [
      {
        custom_id: reference,
        invoice_id: reference,
        description: "Egypt Eye deposit — connection test",
        amount: { currency_code: "USD", value: "25.00" },
      },
    ],
  }),
});
const orderBody = await orderResponse.text();
if (!orderResponse.ok) {
  console.error(`✗ Could not create an order (HTTP ${orderResponse.status}).`);
  console.error(orderBody);
  process.exit(1);
}
const order = JSON.parse(orderBody) as { id: string; status: string; intent?: string };
console.log(`✓ Order created: ${order.id} (${order.status}, intent ${order.intent ?? config.intent})`);

// 3. Read it back, and check the reference survived the round trip. This is
//    the property the whole reconciliation depends on: if custom_id does not
//    come back, payments cannot find their bookings by themselves.
const readback = await fetch(`${config.baseUrl}/v2/checkout/orders/${order.id}`, {
  headers: { Authorization: `Bearer ${token}` },
});
if (!readback.ok) {
  console.error(`✗ Could not read the order back (HTTP ${readback.status}).`);
  process.exit(1);
}
const read = (await readback.json()) as {
  purchase_units?: { custom_id?: string; amount?: { value?: string } }[];
};
const unit = read.purchase_units?.[0];
if (unit?.custom_id !== reference) {
  console.error(`✗ custom_id came back as ${unit?.custom_id ?? "(nothing)"}, expected ${reference}.`);
  console.error("  Payments would not be able to find their bookings. Do not go live with this.");
  process.exit(1);
}
if (unit?.amount?.value !== "25.00") {
  console.error(`✗ The amount came back as ${unit?.amount?.value ?? "(nothing)"}, expected 25.00.`);
  process.exit(1);
}
console.log(`✓ Reference and amount survive the round trip (${reference}, $${unit.amount.value})`);

// 4. The webhook id, if one is set. A webhook that does not exist on this
//    account means every delivery fails verification and every payment
//    reconciles late or not at all — and nothing visible says so.
if (config.webhookId) {
  const hooks = await fetch(`${config.baseUrl}/v1/notifications/webhooks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (hooks.ok) {
    const { webhooks } = (await hooks.json()) as { webhooks?: { id?: string; url?: string }[] };
    const found = webhooks?.find((hook) => hook.id === config.webhookId);
    if (found) {
      console.log(`✓ Webhook ${config.webhookId} exists on this account → ${found.url}`);
    } else {
      console.error(`✗ Webhook ${config.webhookId} is NOT on this account.`);
      console.error("  Every delivery would fail verification. Check PAYPAL_WEBHOOK_ID.");
      if (webhooks?.length) {
        console.error("  This account has: " + webhooks.map((h) => `${h.id} (${h.url})`).join(", "));
      }
      process.exit(1);
    }
  }
} else {
  console.log("· No PAYPAL_WEBHOOK_ID set — set one before going live, or webhooks are all refused.");
}

console.log(
  `\nAll good. The order above was never approved, so no money moved and it expires on its own.\n`
);
