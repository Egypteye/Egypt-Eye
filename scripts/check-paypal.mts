/**
 * Guards the PayPal integration's pure logic.
 *
 * PayPal itself cannot be reached from CI, and that is exactly why this file
 * matters: the parts that decide whether a customer's money moved have to be
 * provable without a network. What is asserted here is the reasoning, not the
 * round trip — the money parsing, the configuration reading, and above all the
 * rule that an unverified webhook is refused.
 *
 * The round trip is proven separately and by hand, with real sandbox
 * credentials, by scripts/paypal-smoke.mts.
 */
import {
  hasWebhookSignatureHeaders,
  moneyModeFor,
  parsePayPalAmount,
  payPalConfig,
  sameMoney,
  toPayPalAmount,
  WEBHOOK_SIGNATURE_HEADERS,
} from "../src/lib/booking/paypalConfig";
import { disabledProvider } from "../src/lib/booking/paymentProvider";

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

// ---------------------------------------------------------------------------
// 1. Money.
//
// PayPal speaks decimal strings; JavaScript speaks floats. Every bug in this
// area is the same bug — a value that went through a float and came back a
// cent short — so the conversion is exact in both directions and compared in
// integer cents.
// ---------------------------------------------------------------------------
ok("a whole dollar amount formats with cents", toPayPalAmount(25) === "25.00");
ok("a half dollar formats exactly", toPayPalAmount(25.5) === "25.50");
ok("a third of a cent rounds to the nearest cent", toPayPalAmount(0.005) === "0.01");
ok("a large amount keeps two decimals", toPayPalAmount(1234.5) === "1234.50");

const AMOUNTS: [unknown, number | null][] = [
  ["25.00", 2500],
  ["25", 2500],
  ["0.01", 1],
  ["1234.56", 123456],
  ["25.000", null],   // three decimals is not a PayPal amount
  ["-25.00", null],   // a negative payment is not a payment
  ["25.00 USD", null],
  ["", null],
  ["abc", null],
  [25, null],         // a number, not the string PayPal sends
  [null, null],
  [undefined, null],
];
for (const [input, expected] of AMOUNTS) {
  ok(`parsePayPalAmount(${JSON.stringify(input)}) should be ${expected}`, parsePayPalAmount(input) === expected);
}

// The comparison that stands between a booking and being marked paid for the
// wrong amount. A $25 deposit settled for $0.25 must not pass, and floats make
// that less obvious than it sounds.
ok("an exact match passes", sameMoney(25, "25.00"));
ok("a trailing-zero difference still matches", sameMoney(25, "25"));
ok("a cents amount matches", sameMoney(25.5, "25.50"));
ok("a short payment is refused", !sameMoney(25, "24.99"));
ok("an over-payment is refused", !sameMoney(25, "25.01"));
ok("a decimal-point slip is refused", !sameMoney(25, "2.50"));
ok("a factor-of-100 slip is refused", !sameMoney(25, "0.25"));
ok("a missing amount is refused", !sameMoney(25, undefined));
ok("a non-numeric amount is refused", !sameMoney(25, "free"));
// The float case specifically: 0.1 + 0.2 is the canonical example, and money
// compared as floats is how it reaches production.
ok("cents arithmetic survives a float", sameMoney(0.1 + 0.2, "0.30"));

// ---------------------------------------------------------------------------
// 2. Configuration.
//
// The dangerous default is the one that guesses. An unreadable or mistyped
// setting must land somewhere safe, not somewhere surprising.
// ---------------------------------------------------------------------------
const saved = { ...process.env };
const withEnv = <T,>(env: Record<string, string | undefined>, run: () => T): T => {
  for (const key of ["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET", "PAYPAL_ENV", "PAYPAL_INTENT", "PAYPAL_WEBHOOK_ID"]) {
    delete process.env[key];
  }
  Object.assign(process.env, env);
  try {
    return run();
  } finally {
    for (const key of Object.keys(process.env)) if (!(key in saved)) delete process.env[key];
    Object.assign(process.env, saved);
  }
};

const CREDS = { PAYPAL_CLIENT_ID: "id", PAYPAL_CLIENT_SECRET: "secret" };

ok("no credentials means no PayPal", withEnv({}, () => payPalConfig()) === null);
ok("a client id alone is not enough", withEnv({ PAYPAL_CLIENT_ID: "id" }, () => payPalConfig()) === null);
ok("a secret alone is not enough", withEnv({ PAYPAL_CLIENT_SECRET: "s" }, () => payPalConfig()) === null);

// Sandbox is the default. Reaching the live API by accident is the one
// mistake here that moves real money.
const bare = withEnv(CREDS, () => payPalConfig());
ok("the default environment is sandbox", bare?.env === "sandbox");
ok("the default base url is the sandbox one", bare?.baseUrl.includes("sandbox") === true);
ok("live is reached only by asking for it", withEnv({ ...CREDS, PAYPAL_ENV: "live" }, () => payPalConfig())?.env === "live");
for (const value of ["LIVE", "Live", " live "]) {
  ok(`PAYPAL_ENV="${value}" is understood as live`, withEnv({ ...CREDS, PAYPAL_ENV: value }, () => payPalConfig())?.env === "live");
}
for (const value of ["production", "prod", "yes", "1", ""]) {
  ok(
    `PAYPAL_ENV="${value}" must not be mistaken for live — a guess here spends real money`,
    withEnv({ ...CREDS, PAYPAL_ENV: value }, () => payPalConfig())?.env === "sandbox"
  );
}

// The intent decides whether money moves at approval, so a typo must fall to
// the mode somebody is actually watching — not to holds that silently expire.
ok("the default intent is CAPTURE", bare?.intent === "CAPTURE");
ok("AUTHORIZE is opt-in", withEnv({ ...CREDS, PAYPAL_INTENT: "AUTHORIZE" }, () => payPalConfig())?.intent === "AUTHORIZE");
ok("the intent is read case-insensitively", withEnv({ ...CREDS, PAYPAL_INTENT: "authorize" }, () => payPalConfig())?.intent === "AUTHORIZE");
for (const value of ["AUTHORISE", "HOLD", "auth", "capture", "", "true"]) {
  ok(
    `PAYPAL_INTENT="${value}" must fall back to CAPTURE rather than to an unwatched hold`,
    withEnv({ ...CREDS, PAYPAL_INTENT: value }, () => payPalConfig())?.intent === "CAPTURE"
  );
}
ok("a missing webhook id reads as null, not as an empty string", bare?.webhookId === null);

// ---------------------------------------------------------------------------
// 3. The intent decides what the customer is told.
//
// This is the link that, if it ever breaks, tells somebody their money is held
// while PayPal has taken it. Two fields that can disagree eventually do, so
// moneyMode is derived from the intent rather than configured beside it.
// ---------------------------------------------------------------------------
// Asserted on the derivation rather than on the provider object, because the
// provider is server-only and this check must keep running. It is the same
// function the provider calls — not a restatement of it.
ok("a capturing intent means the money moved", moneyModeFor("CAPTURE") === "paid");
ok("an authorizing intent means the money is held", moneyModeFor("AUTHORIZE") === "hold");
ok("the two modes are never the same", moneyModeFor("CAPTURE") !== moneyModeFor("AUTHORIZE"));

ok("the disabled provider offers no client id", disabledProvider.clientId === null);
ok("the disabled provider's money mode is none", disabledProvider.moneyMode === "none");
ok("the disabled provider is not enabled", disabledProvider.enabled === false);

// ---------------------------------------------------------------------------
// 4. Webhooks.
//
// An unverified body is not an event. It is a POST from the internet to a
// public URL, and acting on one would let anyone mark any booking as paid —
// so a provider with no webhook id configured must refuse every one of them,
// without reaching the network to find out.
// ---------------------------------------------------------------------------
const signed = new Headers({
  "paypal-auth-algo": "SHA256withRSA",
  "paypal-cert-url": "https://api.sandbox.paypal.com/cert.pem",
  "paypal-transmission-id": "t-1",
  "paypal-transmission-sig": "sig",
  "paypal-transmission-time": "2026-01-01T00:00:00Z",
});
const body = JSON.stringify({ id: "WH-1", event_type: "PAYMENT.CAPTURE.COMPLETED" });
void body;

ok("the disabled provider refuses every webhook", (await disabledProvider.verifyWebhook(signed, body)) === false);
ok("a fully signed delivery is recognised as signed", hasWebhookSignatureHeaders(signed));

// Every signature header is load-bearing: a delivery missing any one of them
// cannot be verified by anybody, so it must be refused before PayPal is called
// rather than after. Dropping one at a time proves none is decorative.
for (const missing of WEBHOOK_SIGNATURE_HEADERS) {
  const headers = new Headers(signed);
  headers.delete(missing);
  ok(`a delivery missing ${missing} still counts as signed`, !hasWebhookSignatureHeaders(headers));
}
for (const blank of ["", "   "]) {
  const headers = new Headers(signed);
  headers.set("paypal-transmission-sig", blank);
  ok(`an empty signature (${JSON.stringify(blank)}) counts as signed`, !hasWebhookSignatureHeaders(headers));
}
ok("a delivery with no PayPal headers at all is refused", !hasWebhookSignatureHeaders(new Headers()));

// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\ncheck-paypal: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}
console.log(
  "check-paypal: ok — money is compared in whole cents, an unreadable setting falls back to sandbox and CAPTURE, " +
    "the customer's wording follows the intent, and an unverified webhook is always refused."
);
