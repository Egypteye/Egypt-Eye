/**
 * Guards the enquiry delivery diagnostic.
 *
 * public.enquiries has recorded email_status, email_error and email_sender
 * since 3 November 2026 and NOTHING displayed any of it. When "we stopped
 * getting emails" had to be investigated on 25 November, the one table built
 * to answer that question could only be read with a database client — which
 * the owner does not have. The investigation had to proceed from outside the
 * system instead.
 *
 * The page now exists. Four ways it stops being worth having:
 *
 *   1. THE SENDER IS HIDDEN. resend.ts falls back to onboarding@resend.dev
 *      when RESEND_FROM_EMAIL is missing, and Resend ACCEPTS those — the row
 *      is marked `sent`, the dashboard is green, and the mail reaches nobody
 *      but the account owner. Without the sender on screen, a total delivery
 *      outage looks identical to a working one.
 *
 *   2. 'pending' IS COUNTED AS SOMETHING ELSE. The column defaults to
 *      'pending', so a row whose send was never marked means the route died
 *      between storing and sending. Folding that into sent or failed hides
 *      the most alarming state the table can hold.
 *
 *   3. THE PAGE LEAKS. It lists customer names, emails and phone numbers and
 *      is one URL away from the public site.
 *
 *   4. ANONYMISED ROWS ARE RE-EXPOSED. The retention sweep blanks personal
 *      data after its window; a page that reads the raw columns without
 *      checking anonymised_at would display whatever the sweep left behind.
 */
import { readFileSync } from "node:fs";
import {
  describeSender,
  summariseDelivery,
  UNCONFIGURED_SENDER,
  type EnquiryRow,
} from "../src/lib/enquiries/delivery";

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};
const read = (p: string) => readFileSync(p, "utf8");

const row = (over: Partial<EnquiryRow>): EnquiryRow => ({
  id: "1",
  created_at: "2026-11-25T00:00:00Z",
  kind: "tour_enquiry",
  brand: "egypt_eye",
  subject_title: "A tour",
  name: "A",
  email: "a@b.co",
  phone: null,
  email_status: "sent",
  email_error: null,
  email_sender: "Egypt Eye <hello@egypteyetravel.com>",
  email_attempted_at: "2026-11-25T00:00:01Z",
  anonymised_at: null,
  ...over,
});

// ---------------------------------------------------------------------------
// 1. The silent-failure sender is called out, in words, as a failure.
const bad = describeSender(`Egypt Eye Travel <${UNCONFIGURED_SENDER}>`);
ok(
  "the unconfigured resend.dev sender is not flagged as bad — this is the state where everything reads 'sent' and nothing arrives",
  bad.severity === "bad"
);
ok(
  "the resend.dev verdict does not tell the owner the mail reached nobody",
  /never received|nobody|account owner/i.test(bad.message)
);
ok("a configured sender is flagged as a problem", describeSender("Egypt Eye <hello@egypteyetravel.com>").severity === "ok");
ok("a missing sender is treated as fine", describeSender(null).severity === "warn");

ok(
  "summariseDelivery does not notice the unconfigured sender",
  summariseDelivery([row({ email_sender: `x <${UNCONFIGURED_SENDER}>` })]).hasUnconfiguredSender === true
);
ok(
  "a healthy set is reported as having the unconfigured sender",
  summariseDelivery([row({})]).hasUnconfiguredSender === false
);

// ---------------------------------------------------------------------------
// 2. 'pending' is its own number, not folded away.
const mixed = summariseDelivery([
  row({ email_status: "sent" }),
  row({ email_status: "failed" }),
  row({ email_status: "pending", email_attempted_at: null }),
  row({ email_status: "pending", email_attempted_at: null }),
]);
ok("sent is miscounted", mixed.sent === 1);
ok("failed is miscounted", mixed.failed === 1);
ok(
  "rows that never reached a send attempt are not counted separately — that is the state where the route died between storing and sending",
  mixed.pending === 2
);
ok("the total does not match the rows given", mixed.total === 4);

// An unknown status must count as "never attempted" rather than be dropped:
// a row that falls out of every bucket is a lead nobody is told about.
ok(
  "an unrecognised status is silently dropped from every count",
  summariseDelivery([row({ email_status: "weird" })]).pending === 1
);

// Senders are only counted where a send was actually attempted.
ok(
  "a sender is counted for a row that never attempted a send",
  summariseDelivery([row({ email_attempted_at: null, email_sender: "x" })]).senders.length === 0
);
ok("senders are not ordered by frequency", (() => {
  const s = summariseDelivery([row({ email_sender: "a" }), row({ email_sender: "b" }), row({ email_sender: "b" })]).senders;
  return s[0].sender === "b" && s[0].count === 2;
})());

// ---------------------------------------------------------------------------
// 3 & 4. The page is admin-only, noindex, and respects anonymisation.
const page = read("src/app/[locale]/(site)/admin/enquiries/page.tsx");
ok(
  "the enquiries page does not check the signed-in user — it lists customer names, emails and phone numbers",
  /getCurrentUser\(\)/.test(page) && /redirect\(/.test(page)
);
ok(
  "the enquiries page does not restrict by role",
  /role !== "admin"/.test(page)
);
ok("the enquiries page is not noindex", /robots:\s*\{\s*index:\s*false/.test(page));
// BOTH personal fields, counted. Asserting "at least one" passed with the
// name left exposed, because the email beside it still carried the guard.
const guarded = (page.match(/anonymised_at\s*\?/g) ?? []).length;
ok(
  `only ${guarded} personal field(s) check anonymised_at — name AND email must both be guarded or the retention sweep's work is undone on screen`,
  guarded >= 2
);
// The RENDERED sender, not the word. `email_sender` also appears in the
// select() string, so grepping the file passed with the display removed.
ok(
  "the enquiries page no longer renders the sender — without it, a total delivery outage looks identical to a healthy one",
  /\{r\.email_sender\s*&&/.test(page) && /\{r\.email_sender\}/.test(page)
);
ok("the enquiries page does not call describeSender", /describeSender\(/.test(page));
ok(
  "the enquiries page no longer renders the delivery error",
  /\{r\.email_error\s*&&/.test(page) && /\{r\.email_error\}/.test(page)
);

const layout = read("src/app/[locale]/(site)/admin/layout.tsx");
ok(
  "the enquiries page is not linked from the admin nav — an owner with no terminal cannot find a page nothing links to",
  layout.includes("/admin/enquiries")
);

// The claim the page makes about the sender must match what resend.ts does.
const resend = read("src/lib/email/resend.ts");
ok(
  "resend.ts no longer falls back to the sender this page warns about, so the warning is now wrong",
  resend.includes(UNCONFIGURED_SENDER)
);

// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\ncheck-enquiry-delivery: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

console.log(
  "check-enquiry-delivery: ok — the resend.dev fallback is named as a silent total failure rather than described " +
    "neutrally, rows that never reached a send attempt are counted on their own instead of folded into sent or " +
    "failed, an unknown status cannot vanish from the totals, senders are ranked and only counted where a send " +
    "was tried, and the page is admin-only, noindex, linked from the nav and respects anonymised rows."
);
