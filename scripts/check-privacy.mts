import { readFileSync } from "node:fs";
import { REDACTED, containsPayerData, redactPayerData } from "../src/lib/privacy/redact";

// What we promise not to keep.
//
// The owner's instruction was plain: he does not want customer payment data
// on Supabase, because PayPal already holds the real record and he can log in
// and read it. This file is what stops that promise quietly becoming untrue.
//
// Note the assertions below check SHAPE (`=== REDACTED`), not just the
// absence of a string. An earlier version of this file only searched the
// serialised output for "Jane Traveller", and passed happily when `shipping`
// was taken off the key list — because the name underneath it was still
// caught by `full_name`. A test that can be satisfied by a different line of
// the code than the one it names is not testing that line.

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

// A realistic PayPal capture webhook, trimmed to the shape ours arrive in.
const webhook = {
  id: "WH-TEST",
  event_type: "PAYMENT.CAPTURE.COMPLETED",
  create_time: "2026-10-15T09:00:00Z",
  resource: {
    id: "CAPTURE-123",
    custom_id: "EE-ABCD1234",
    invoice_id: "EE-ABCD1234",
    status: "COMPLETED",
    amount: { value: "231.25", currency_code: "USD" },
    payer: {
      name: { given_name: "Jane", surname: "Traveller" },
      email_address: "jane@example.com",
      payer_id: "PAYERID9",
      address: { address_line_1: "1 Any Street", postal_code: "12345", country_code: "GB" },
    },
    payment_source: { paypal: { email_address: "jane@example.com" } },
    purchase_units: [
      {
        amount: { value: "231.25", currency_code: "USD" },
        custom_id: "EE-ABCD1234",
        // `note` is not on the key list, so it only disappears if the whole
        // `shipping` container is replaced. That is the point of it.
        shipping: { name: { full_name: "Jane Traveller" }, note: "SHIPPING-CONTAINER-MARKER" },
      },
    ],
    supplementary_data: { related_ids: { order_id: "ORDER-77" } },
  },
};

const clean = redactPayerData(webhook);
const text = JSON.stringify(clean);

/** Reads a dotted path out of the redacted payload without casting to `any`. */
const at = (path: string): unknown =>
  path.split(".").reduce<unknown>((node, key) => {
    if (node === null || typeof node !== "object") return undefined;
    if (Array.isArray(node)) {
      const index = Number(key);
      return Number.isInteger(index) ? node[index] : undefined;
    }
    return (node as Record<string, unknown>)[key];
  }, clean);

// ---------------------------------------------------------------------------
// 1. Each person-carrying container is replaced WHOLESALE. Structural, so
//    taking any single key off the list fails the assertion that names it.
// ---------------------------------------------------------------------------
ok("the payer block is replaced wholesale", at("resource.payer") === REDACTED);
ok("the payment source is replaced wholesale", at("resource.payment_source") === REDACTED);
ok(
  "shipping inside the purchase unit is replaced wholesale",
  at("resource.purchase_units.0.shipping") === REDACTED,
);
ok("the shipping container takes its contents with it", !/SHIPPING-CONTAINER-MARKER/.test(text));

// Each individual key still earns its own assertion, tested on its own, so
// one removal cannot hide behind another key that happens to cover the value.
const strippedAlone = (key: string, payload: Record<string, unknown>) =>
  (redactPayerData(payload) as Record<string, unknown>)[key] === REDACTED;
for (const key of [
  "payer",
  "payment_source",
  "payee",
  "payer_name",
  "payer_id",
  "given_name",
  "surname",
  "full_name",
  "email_address",
  "phone",
  "phone_number",
  "national_number",
  "address",
  "shipping",
  "address_line_1",
  "address_line_2",
  "admin_area_1",
  "admin_area_2",
  "postal_code",
  "country_code",
  "birth_date",
  "tax_info",
  "card",
  "last_digits",
  "bin_details",
]) {
  ok(`\`${key}\` is stripped on its own`, strippedAlone(key, { [key]: "SOMETHING-PERSONAL" }));
}

// And nothing identifying survives anywhere in the serialised output.
ok("no email address survives", !/jane@example\.com/.test(text));
ok("no given name survives", !/Jane/.test(text));
ok("no surname survives", !/Traveller/.test(text));
ok("no street address survives", !/Any Street/.test(text));
ok("no postcode survives", !/12345/.test(text));
ok("no payer id survives", !/PAYERID9/.test(text));
ok("the detector agrees nothing is left", !containsPayerData(clean));
ok("the detector is not simply always false", containsPayerData(webhook));

// ---------------------------------------------------------------------------
// 2. Recursion. Structural, at depth, so a redactor that stops descending
//    after the first level fails here rather than looking clean.
// ---------------------------------------------------------------------------
const deep = redactPayerData({ a: { b: { c: { email_address: "x@y.z", keep: "KEPT" } } } });
const deepAt = (path: string): unknown =>
  path.split(".").reduce<unknown>((node, key) => {
    if (node === null || typeof node !== "object") return undefined;
    return (node as Record<string, unknown>)[key];
  }, deep);
ok("nesting four levels down is still redacted", deepAt("a.b.c.email_address") === REDACTED);
ok("nesting four levels down keeps its other fields", deepAt("a.b.c.keep") === "KEPT");
ok(
  "objects inside arrays are walked",
  ((redactPayerData([{ payer: "x" }]) as unknown[])[0] as Record<string, unknown>).payer ===
    REDACTED,
);
ok("case is ignored on keys", strippedAlone("Email_Address", { Email_Address: "x@y.z" }));
ok("null does not throw", redactPayerData(null) === null);
ok("a bare string is returned as-is", redactPayerData("hello") === "hello");

// ---------------------------------------------------------------------------
// 3. The money is untouched. Reconciliation reads these, so stripping them
//    would break settlement rather than protect anybody.
// ---------------------------------------------------------------------------
ok("the capture id survives", at("resource.id") === "CAPTURE-123");
ok("the amount survives", at("resource.amount.value") === "231.25");
ok("the currency survives", at("resource.amount.currency_code") === "USD");
ok("the status survives", at("resource.status") === "COMPLETED");
ok("the booking reference survives", at("resource.custom_id") === "EE-ABCD1234");
ok("the invoice reference survives", at("resource.invoice_id") === "EE-ABCD1234");
ok("the event type survives", at("event_type") === "PAYMENT.CAPTURE.COMPLETED");
ok("the event id survives", at("id") === "WH-TEST");
ok("the timestamp survives", at("create_time") === "2026-10-15T09:00:00Z");
ok("the order id survives", at("resource.supplementary_data.related_ids.order_id") === "ORDER-77");
ok("the purchase unit amount survives", at("resource.purchase_units.0.amount.value") === "231.25");
ok("a redacted field is marked, not silently dropped", text.includes(REDACTED));

// ---------------------------------------------------------------------------
// 4. The webhook must actually USE it. A redactor nobody calls protects
//    nobody, and this is the assertion that catches it being unwired.
// ---------------------------------------------------------------------------
const route = readFileSync("src/app/api/webhooks/paypal/route.ts", "utf8");
ok("the webhook imports the redactor", /from "@\/lib\/privacy\/redact"/.test(route));
ok("the stored payload is the redacted one", /payload: redactPayerData\(event\)/.test(route));
ok("the raw event is never stored", !/payload: event\b/.test(route));

// ---------------------------------------------------------------------------
// 5. The migration that cleaned the rows written before this existed.
// ---------------------------------------------------------------------------
const migration = readFileSync("supabase/migrations/0026_strip_payer_data.sql", "utf8");
ok("old rows were cleaned", /update public\.payment_events/.test(migration));
ok("the payer block is removed", /- 'payer'/.test(migration));
ok("the payment source is removed", /- 'payment_source'/.test(migration));
ok("shipping is removed from purchase units", /- 'shipping'/.test(migration));

// The revoke that actually works. Revoking from `anon` alone does nothing,
// because PUBLIC holds the default grant and anon inherits it — the first
// attempt at this failed in exactly that way and verified as still open.
ok("execute is revoked from PUBLIC, not just the roles", /from public, anon, authenticated/.test(migration));
ok(
  "the rate-limit wipe is closed",
  /revoke execute on function public\.cleanup_rate_limit_hits\(\) from public/.test(migration),
);
ok(
  "the service role keeps what it needs",
  /grant execute on function public\.cleanup_rate_limit_hits\(\) to service_role/.test(migration),
);

if (errors.length > 0) {
  console.error(`\ncheck-privacy: ${errors.length} failure(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

console.log(
  `check-privacy: ok — ${24} person-carrying keys each proven stripped on their own, the payer, ` +
    "payment_source and shipping containers replaced wholesale at depth, and the capture id, amount, " +
    "currency, status, timestamps and booking reference all surviving; the webhook route uses the " +
    "redactor; and the public EXECUTE grant that let anyone wipe the rate limiter is revoked from PUBLIC.",
);
