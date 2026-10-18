import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  BANNED_PLACEHOLDER_PHRASES,
  privacyPolicyStrings,
  POLICY_UPDATED,
  PROCESSORS,
  RETENTION,
  missingLegalIdentity,
  policySections,
} from "../src/lib/privacy/policy";
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

// ===========================================================================
// 6. The privacy policy says what is true.
//
// What was live before this was a list of instructions to whoever would one
// day write the policy — "List every field collected from the Customize Your
// Tour form" — under a banner saying "Draft structure, not yet published",
// indexable, linked from the footer, on a site taking card payments.
//
// So these assertions are not about wording. They cross-reference the claims
// on the page against what the code actually does, in both directions: a
// processor the app uses must be named, and a claim the page makes must still
// hold. The page cannot quietly drift away from the truth.
// ===========================================================================

const sections = policySections({ email: "info@egypteyetravel.com", whatsapp: "+20 127 414 4599" });
const policyText = sections
  .flatMap((s) => [s.title, ...s.body, ...(s.items ?? []).flatMap((i) => [i.label, i.text])])
  .join("\n");

ok("the policy has real sections", sections.length >= 8);
ok("every section has a title", sections.every((s) => s.title.trim().length > 0));
ok("every section says something", sections.every((s) => s.body.length > 0 || (s.items?.length ?? 0) > 0));
ok("no section is a stub", sections.every((s) => [...s.body, ...(s.items ?? []).map((i) => i.text)].every((line) => line.trim().length > 20)));

// The draft cannot come back by a revert or a bad merge.
const page = readFileSync("src/app/[locale]/(site)/privacy/page.tsx", "utf8");
for (const phrase of BANNED_PLACEHOLDER_PHRASES) {
  ok(`the policy no longer says "${phrase}"`, !new RegExp(phrase, "i").test(policyText));
  ok(`the page no longer says "${phrase}"`, !new RegExp(phrase, "i").test(page));
}
ok("the page renders the policy module", /policySections\(/.test(page));
ok("the page shows when it was last updated", /POLICY_UPDATED/.test(page));
ok("the last-updated date is a real date", /^\d{1,2} \w+ \d{4}$/.test(POLICY_UPDATED));

// --- Processors, cross-referenced against what the app actually uses. ------
//
// The signal is the environment variables the source reads: a service the app
// talks to needs credentials, and credentials are named in the code. Add a
// MAILCHIMP_API_KEY and this check fails until Mailchimp appears on the page.
const sourceEnv = execSync(
  "grep -rhoE 'process\\.env\\.[A-Z0-9_]+' src/ --include=*.ts --include=*.tsx | sed 's/.*\\.//' | sort -u",
  { encoding: "utf8" },
).split("\n");

/** Which processor each credential prefix belongs to. */
const PREFIX_OWNER: Record<string, string> = {
  RESEND: "Resend",
  PAYPAL: "PayPal",
  SUPABASE: "Supabase",
  NEXT_PUBLIC_SUPABASE: "Supabase",
  // The concierge. It is sent the customer's first name, booking reference,
  // dates, traveller counts, hotels and itinerary — so Google is a processor
  // of personal data here, not a content tool. This check is what found it:
  // the key was in the stack and the policy had never mentioned it.
  GEMINI: "Google",
};

/**
 * Credential prefixes that are deliberately NOT on the policy page, each with
 * the reason it is exempt. An unknown prefix is not exempt — it fails below,
 * which is the point: a new third party has to be a decision, not a diff.
 */
const EXEMPT: Record<string, string> = {
  // Sanity holds the website's own text and photographs. Checked: the only
  // writes to it are the content migration and testimonial dedupe routes;
  // no customer ever reaches it. So it is not a processor of personal data.
  SANITY: "content only, no customer data",
  NEXT_PUBLIC_SANITY: "content only, no customer data",
  // Posts our own photographs to our own board. Checked: lib/pinterest only
  // ever reads our board id, our tokens and our content captions — no
  // customer is sent to Pinterest.
  PINTEREST: "our own board, our own content",
  // Ours: the scheduled-job secret.
  CRON: "our own scheduled jobs",
  // Ours, not a third party's.
  MIGRATE: "our own endpoint secret",
  ADMIN: "our own admin gate",
  NEXT_PUBLIC_SITE: "our own canonical URL",
  NEXT_PUBLIC_BASE: "our own canonical URL",
  NODE: "the Node runtime",
  NEXT: "the framework",
  NEXT_PUBLIC: "the framework",
  VERCEL: "the host, named on the page",
  CI: "build environment",
};

const namedOnPage: string[] = PROCESSORS.map((p) => p.name);
for (const processor of PROCESSORS) {
  ok(`the policy names ${processor.name}`, policyText.includes(processor.name));
  ok(`the policy says what ${processor.name} does`, processor.role.length > 15);
  ok(`the policy says where ${processor.name} is`, processor.where.length > 3);
}
ok("the policy names the host", namedOnPage.includes("Vercel") && existsSync("vercel.json"));

const unnamed = new Set<string>();
for (const name of sourceEnv) {
  if (!name.includes("_")) continue;
  const owner = Object.entries(PREFIX_OWNER).find(([prefix]) => name.startsWith(`${prefix}_`));
  if (owner) {
    if (!namedOnPage.includes(owner[1])) unnamed.add(`${name} -> ${owner[1]}`);
    continue;
  }
  const exempt = Object.keys(EXEMPT).some((prefix) => name.startsWith(`${prefix}_`));
  // A credential-shaped name we have never classified. Could be a new
  // processor; could be a local constant. Either way somebody must decide.
  if (!exempt && /_(KEY|SECRET|TOKEN|ID|URL|API|PASSWORD|DSN|WEBHOOK)$/.test(name)) {
    unnamed.add(`${name} -> unclassified`);
  }
}
ok(
  `every service the code holds credentials for is named or exempt${unnamed.size ? ` (unnamed: ${[...unnamed].join(", ")})` : ""}`,
  unnamed.size === 0,
);

// --- Claims the page makes that the code has to keep true. ----------------

// "There is no advertising network, no analytics service and no tracking
// pixel on this website." Patterns are specific URLs and call shapes, not
// bare words: an earlier version of this matched the word "plausible" in a
// story about a pyramid theory and would have failed for nothing.
const TRACKERS = [
  "googletagmanager\\.com",
  "google-analytics\\.com",
  "\\bgtag\\(",
  "plausible\\.io",
  "posthog\\.(com|js)",
  "cdn\\.mxpnl\\.com",
  "cdn\\.segment\\.com",
  "connect\\.facebook\\.net",
  "\\bfbq\\(",
  "static\\.hotjar\\.com",
  "clarity\\.ms",
  "\\b_paq\\b",
];
const trackerHits = execSync(
  `grep -rlE '${TRACKERS.join("|")}' src/ --include=*.ts --include=*.tsx --include=*.css || true`,
  { encoding: "utf8" },
).trim();
ok(
  `the no-analytics claim is still true${trackerHits ? ` (found in: ${trackerHits.split("\n").join(", ")})` : ""}`,
  trackerHits === "",
);
ok("the policy makes the no-analytics claim", /no analytics service and no tracking pixel/.test(policyText));
ok("the policy makes the no-selling claim", /do not sell your personal information/.test(policyText));

// "We never see, receive or store your card number." Nothing in the codebase
// may take a card number: PayPal's own iframe collects it and we never touch
// it. A field named card_number anywhere means that claim has become false.
const cardFields = execSync(
  "grep -rlE '(card_?number|cardNumber|cvv|cvc|card_?cvc|expiry_?month)' src/ --include=*.ts --include=*.tsx || true",
  { encoding: "utf8" },
).trim();
ok(
  `the never-see-your-card claim is still true${cardFields ? ` (found in: ${cardFields})` : ""}`,
  cardFields === "",
);
ok("the policy makes the card claim", /never see, receive or store your card number/.test(policyText));

// --- Retention: stated, specific, and matching the code. ------------------
ok("retention is stated", RETENTION.length >= 5);
// Each entry must give a period ("12 months"), an event that ends it ("once
// the item is handed over"), or say the data is never held at all. Vague is
// the failure mode here: "we keep it as long as necessary" is what this
// assertion exists to reject.
ok(
  "every retention entry gives a period, a trigger, or says nothing is kept",
  RETENTION.every((r) =>
    /(\d+|one|two|three|seven|twelve|thirty) (day|month|year)|once |immediately|never (contain|stored)/i.test(
      r.text,
    ),
  ),
);
ok("the policy states where data is held", /European Union, in Paris/.test(policyText));
ok("the policy states the newsletter double opt-in", /click a link in a confirmation email/.test(policyText));
ok("the policy states the unsubscribe right", /unsubscribe link/.test(policyText));
ok("the policy states the rate-limit retention", /Kept for one day/.test(policyText));

// The one-day IP window is in the database function, not here. If somebody
// widens it, the page stops being true, so assert the two agree.
const rateLimitSql = readFileSync("supabase/migrations/0002_rate_limits.sql", "utf8");
ok(
  "the stated IP retention matches the cleanup job",
  /interval '1 day'/.test(rateLimitSql) && /one day/.test(policyText),
);

// --- The retention job must enforce exactly what the page promises. -------
//
// This is the pairing that matters most on this page. A policy that states a
// deletion period the code never applies is a false statement published on a
// site taking card payments; it is worse than saying nothing. So the periods
// are read out of the SQL that performs them and compared with the sentences
// the customer reads.
const retentionSql = readFileSync("supabase/migrations/0027_data_retention.sql", "utf8");
ok("the retention job exists", /create or replace function public\.apply_data_retention/.test(retentionSql));
ok(
  "the stated 12 months is the period the job applies",
  /interval '12 months'/.test(retentionSql) && /12 months after your last contact/.test(policyText),
);
ok(
  "the stated 30 days is the period the job applies",
  /interval '30 days'/.test(retentionSql) && /Deleted after 30 days/.test(policyText),
);
ok(
  "the job clears the contact fields the page names",
  /guest_name = '', guest_email = null, guest_phone = null/.test(retentionSql) &&
    /name, phone number and email address are removed/.test(policyText),
);
ok(
  "the job keeps the accounting record the page says is kept",
  /An anonymous record of the booking and the payment is kept/.test(policyText) &&
    !/delete from public\.reservations/.test(retentionSql),
);
ok(
  "the job deletes unconfirmed sign-ups outright, as stated",
  /delete from public\.newsletter_subscribers\s*\n\s*where not verified/.test(retentionSql),
);
ok(
  "the do-not-contact list the page describes is what the job does",
  /do-not-contact list/.test(policyText) && /set first_name = null\s*\n\s*where unsubscribed/.test(retentionSql),
);
ok("the job is dry-run by default", /p_dry_run boolean default true/.test(retentionSql));
ok(
  "the nightly route passes false explicitly",
  /p_dry_run: false/.test(readFileSync("src/lib/privacy/retention.ts", "utf8")),
);
ok(
  "the nightly route actually calls it",
  /applyDataRetention\(\)/.test(readFileSync("src/app/api/bookings/reconcile/route.ts", "utf8")),
);
ok(
  "the retention job is not callable by anon",
  /revoke execute on function public\.apply_data_retention\(boolean\) from public, anon, authenticated/.test(
    retentionSql,
  ),
);
ok(
  "every table the job touches records that it happened",
  (retentionSql.match(/anonymised_at = now\(\)/g) ?? []).length >= 6,
);

// --- The policy has to be translatable. ----------------------------------
//
// The site serves French and Spanish. scripts/i18n-extract.mts walks a fixed
// list of modules, and a string it never sees is never translated — it just
// renders in English. The first version of this policy was invisible to the
// extractor, which would have served an English-only privacy policy to
// exactly the readers whose law the page exists to satisfy. In English
// nothing looks wrong, which is why this is asserted rather than eyeballed.
const extractor = readFileSync("scripts/i18n-extract.mts", "utf8");
// The IMPORT is not enough: a module can be imported and never walked. What
// matters is the entry in the `sources` list, which is what the extractor
// iterates. Asserting on the import alone passed with the entry deleted.
ok(
  "the policy is in the extractor's sources list",
  /\["privacyPolicy", \{ body: privacyPolicyStrings \}\]/.test(extractor),
);
ok(
  "the extractor imports them from where they live",
  /import \{ privacyPolicyStrings \} from "\.\.\/src\/lib\/privacy\/policy\.js"/.test(extractor),
);

// privacyPolicyStrings is DERIVED from policySections(), so a clause added to
// the page is in the extraction by construction — there is no divergence to
// assert, and an assertion comparing the two would be vacuous. What can still
// go wrong is the flattening losing a level (bullets dropped, items ignored),
// so the shape is what gets checked: every section contributes its title, its
// paragraphs and both halves of each bullet.
const expected = sections.reduce(
  (n, sec) => n + 1 + sec.body.length + (sec.items?.length ?? 0) * 2,
  0,
);
ok(
  `the flattening keeps every level (${privacyPolicyStrings.length} of ${expected})`,
  privacyPolicyStrings.length === expected && expected > 40,
);

ok(
  "the personalised-goods notice is extractable too",
  readFileSync("src/content/cancellationPolicy.ts", "utf8").includes("  personalisedItemNotice,"),
);

// --- No claim to a licence we do not hold. -------------------------------
//
// Egypt Eye holds no tourism licence; the tours run under a larger agency's.
// Two ways that gets us in trouble, and this guards both.
//
// The first is claiming a licence or a registration we do not have. Under
// Egypt's tourism companies law that is not a paperwork slip, it is holding
// yourself out as something you are not, and a fabricated licence number on
// a public page turns a gap into an allegation.
//
// The second is subtler and was live on the site: an SEO article called
// "Best Travel Agencies in Egypt" opened with "Check the License Before
// Anything Else" and told readers that an operator who "can't produce a
// license or company registration, or that runs entirely through informal
// messaging-app bookings" is "a real risk" — then listed "no registration
// details" as a walk-away red flag. That is this business describing itself
// as the thing to avoid, on a page built to rank for people shopping for
// exactly this, and it would be handed straight to us in any dispute. It
// now explains the arrangement honestly instead, and says we work that way.
const content = execSync("cat src/content/*.ts src/content/storyBatches/*.ts", {
  encoding: "utf8",
  maxBuffer: 256 * 1024 * 1024,
});

/** First-person claims to hold a licence, registration or accreditation. */
const SELF_LICENCE = [
  /\b(we|Egypt Eye[^.]{0,30}) (are|is) (a )?(fully )?licen[cs]ed\b/i,
  /\bour (tourism |operating )?licen[cs]e\b/i,
  /\bwe (are|is) registered (with|at|under)\b/i,
  /\bgovernment[- ]approved\b/i,
  /\bministry[- ]approved\b/i,
  /\bofficially accredited\b/i,
  /\blicen[cs]e (number|no\.?) *[:#]? *[0-9]/i,
  /\bcommercial registration (number|no\.?) *[:#]? *[0-9]/i,
];
const selfClaims = SELF_LICENCE.filter((re) => re.test(content)).map((re) => String(re));
ok(
  `no page claims a licence or registration of our own${selfClaims.length ? ` (matched: ${selfClaims.join(", ")})` : ""}`,
  selfClaims.length === 0,
);

// And the article must not set a test the business visibly fails.
const SELF_DEFEATING = [
  "can't produce a license or company registration",
  "cannot produce a license or company registration",
  "no registration details",
  "Check the License Before Anything Else",
];
const selfDefeating = SELF_DEFEATING.filter((phrase) => content.includes(phrase));
ok(
  `no article tells readers to walk away from an operator like us${selfDefeating.length ? ` (found: ${selfDefeating.join("; ")})` : ""}`,
  selfDefeating.length === 0,
);

// The honest replacement has to actually be there — deleting the bad text
// and saying nothing would pass the two assertions above while leaving the
// reader to assume the licence is ours.
ok(
  "the article explains the arrangement instead of hiding it",
  /arranged and operated through the licensed Egyptian agency we work under/.test(content) &&
    /who is the licensed operator for my trip/i.test(content),
);

// The newsletter send must still filter to confirmed, subscribed addresses —
// the page promises an unconfirmed address is never emailed anything else.
const newsletter = readFileSync("src/app/[locale]/(site)/admin/newsletter/actions.ts", "utf8");
ok('the newsletter send filters on verified', /\.eq\("verified", true\)/.test(newsletter));
ok('the newsletter send filters on unsubscribed', /\.eq\("unsubscribed", false\)/.test(newsletter));

// --- The registered details the owner still has to supply. ----------------
ok("a blank legal identity reports all three fields", missingLegalIdentity({}).length === 3);
ok(
  "a filled operator of record reports nothing",
  missingLegalIdentity({ operatorName: "X", operatorLicence: "1", operatorAddress: "A" }).length === 0,
);
ok("whitespace does not count as filled", missingLegalIdentity({ operatorName: "   " }).length === 3);

// The crucial one. Egypt Eye holds no tourism licence. Until the licensed
// agency's details are entered, no page may state or imply a licence number
// — and the page must still tell the reader the tours run under a licensed
// agency, rather than leaving them to assume the brand is the operator.
ok("no licence number is claimed while the field is blank", !/licence [0-9A-Za-z/-]+/.test(policyText));
ok(
  "the page still says the operator is a licensed agency we work under",
  /arranged and operated through the licensed Egyptian agency we work under/.test(policyText),
);
ok(
  "the operator is named once the field is filled",
  /arranged and operated by Nile Example Travel, which holds tourism licence 4242/.test(
    policySections(
      { email: "e@x.com" },
      { operatorName: "Nile Example Travel", operatorLicence: "4242" },
    )
      .flatMap((s) => s.body)
      .join("\n"),
  ),
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
    "redactor; and the public EXECUTE grant that let anyone wipe the rate limiter is revoked from PUBLIC. " +
    `The privacy policy has ${sections.length} real sections naming ${PROCESSORS.length} processors and ` +
    `${RETENTION.length} retention periods, carries none of the 13 placeholder phrases it used to, and its ` +
    "no-analytics, no-selling and never-see-your-card claims are each cross-referenced against the code.",
);
