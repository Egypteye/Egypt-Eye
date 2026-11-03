/**
 * Every lead-bearing route writes the enquiry down before it tries to email it.
 *
 * WHY THIS IS A CHECK AND NOT A CONVENTION.
 *
 * Four routes used to send an email and store nothing. When Resend refused a
 * send — an unverified sender domain, an expired key, an outage — the visitor
 * was told to go to WhatsApp and the business never learned anyone had tried.
 * The Flying Dresses route's own comment names the cost: "the rest are a
 * customer the business never hears from, and nothing anywhere records that
 * they tried."
 *
 * The fix is one line of ordering, and ordering is the easiest thing in the
 * world to lose. Moving recordEnquiry below sendEmail looks like tidying —
 * group the awaits, read the result first — and it silently restores the
 * original bug for exactly the enquiries worth keeping: the ones where the
 * send throws or returns early. Nothing would fail. No test would go red.
 * The next outage would just be invisible again.
 *
 * So: the insert must appear before the send, in source order, in every one
 * of them.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/.*$/gm, "$1");

/**
 * The routes whose email IS the lead.
 *
 * review-submission is deliberately absent. Its own header explains that it
 * writes nothing on purpose, so a review only reaches the wall once a person
 * has checked it against a real booking. That is a different promise, and
 * adding it here would quietly reverse somebody's considered decision.
 */
const LEAD_ROUTES = [
  "enquiry",
  "flying-dresses-enquiry",
  "transfer-request",
  "shop-visit",
];

for (const name of LEAD_ROUTES) {
  const path = `src/app/api/${name}/route.ts`;
  ok(`${name}: the route is gone`, existsSync(path));
  if (!existsSync(path)) continue;

  const src = stripComments(readFileSync(path, "utf8"));
  const recordAt = src.indexOf("recordEnquiry(");
  const sendAt = src.indexOf("sendEmail(");

  ok(`${name}: does not store the enquiry at all — a failed send loses the customer`, recordAt !== -1);
  ok(`${name}: no longer sends a notification email`, sendAt !== -1);
  ok(
    `${name}: stores the enquiry AFTER attempting the send — the sends that fail are exactly the ones that never reach the insert`,
    recordAt !== -1 && sendAt !== -1 && recordAt < sendAt
  );
  ok(
    `${name}: never records whether the email actually left, so a failed delivery is indistinguishable from a successful one`,
    /markEnquiryDelivery\(/.test(src)
  );
  // The sender has to reach the row. Passing the whole sendEmail result does
  // it; a hand-built object must name `from` explicitly, and shop-visit does
  // build one. Without this, a two-sender route reads "sent" whether the
  // brand domain worked or the platform fallback rescued it.
  const marks = src.match(/markEnquiryDelivery\([^;]*\)/g) ?? [];
  ok(
    `${name}: records delivery without the sender, so "sent" cannot distinguish the brand sender from the fallback`,
    marks.length > 0 && marks.every((m) => /,\s*result\s*\)/.test(m) || /from:/.test(m))
  );
}

// ---------------------------------------------------------------------------
// Nothing new may quietly join the list of routes that lose leads.
// ---------------------------------------------------------------------------
const apiDir = "src/app/api";
const unstored: string[] = [];
for (const entry of readdirSync(apiDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const path = `${apiDir}/${entry.name}/route.ts`;
  if (!existsSync(path)) continue;
  const src = stripComments(readFileSync(path, "utf8"));
  // A route that emails a human but writes nothing anywhere.
  const emails = /sendEmail\(/.test(src);
  const persists = /recordEnquiry\(|supabase|\.insert\(/.test(src);
  if (emails && !persists && entry.name !== "review-submission") unstored.push(entry.name);
}
ok(
  `a route sends mail and stores nothing, so a refused send loses whoever wrote it: ${unstored.join(", ")}`,
  unstored.length === 0
);

// ---------------------------------------------------------------------------
// The safety net must not be able to knock anyone off the wire.
// ---------------------------------------------------------------------------
const store = readFileSync("src/lib/enquiries/store.ts", "utf8");
const storeCode = stripComments(store);
// Checked per function, not by counting `try` in the file. The first version
// of this asserted that the file contained two try blocks, which a mutation
// test then satisfied while leaving one of the functions able to throw.
for (const fn of ["recordEnquiry", "markEnquiryDelivery"]) {
  const start = storeCode.indexOf(`export async function ${fn}`);
  const next = storeCode.indexOf("export async function", start + 1);
  const body = storeCode.slice(start, next === -1 ? undefined : next);
  ok(`${fn} is gone from the store`, start !== -1);
  ok(
    `${fn} can throw — a database problem would then cost the email too, which is worse than the bug this replaced`,
    /\} catch\b/.test(body)
  );
}
ok(
  "the store is not server-only, and it holds service-role credentials",
  /^import "server-only";/m.test(store)
);

// ---------------------------------------------------------------------------
// The policy promises this data is removed. Something has to do it.
// ---------------------------------------------------------------------------
const migration = "supabase/migrations/0030_enquiries.sql";
ok("the enquiries migration is missing", existsSync(migration));
if (existsSync(migration)) {
  const sql = readFileSync(migration, "utf8");
  ok(
    "the enquiries table has no retention sweep — the privacy policy's 12-month promise would be false for it",
    /create or replace function public\.apply_enquiry_retention/.test(sql)
  );
  ok(
    "apply_enquiry_retention does not pin search_path",
    /apply_enquiry_retention[\s\S]*?set search_path = public/.test(sql)
  );
  ok(
    "apply_enquiry_retention is left executable by anon — it overwrites customer records",
    /revoke execute on function public\.apply_enquiry_retention\(boolean\) from public, anon, authenticated/.test(sql)
  );
  ok(
    "the enquiries table has RLS off, and it holds names, emails and phone numbers",
    /alter table public\.enquiries enable row level security/.test(sql)
  );
}
// sendEmail must keep reporting the address it resolved. It is the single
// authority for that expression; a caller re-deriving it would drift the
// moment a default changed.
const resend = stripComments(readFileSync("src/lib/email/resend.ts", "utf8"));
ok(
  "sendEmail no longer returns the sender it used, so nothing can record which one Resend accepted",
  /from\?: string/.test(resend) && /return \{ ok: true, from \}/.test(resend)
);
ok(
  "sendEmail drops the sender on failure — which sender was refused is the more diagnostic half",
  /error: `Resend \$\{res\.status\}: \$\{errText\}`, from \}/.test(resend)
);
ok(
  "the store does not write email_sender",
  /email_sender: result\.from/.test(storeCode)
);

const retention = stripComments(readFileSync("src/lib/privacy/retention.ts", "utf8"));
ok(
  "the nightly sweep never calls apply_enquiry_retention, so enquiries are kept forever",
  /apply_enquiry_retention/.test(retention)
);

// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\ncheck-enquiry-storage: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

console.log(
  `check-enquiry-storage: ok — all ${LEAD_ROUTES.length} lead routes write the enquiry before attempting the email ` +
    "and record whether it left; no other route emails a human without storing anything; the store cannot throw; " +
    "and the enquiries table has RLS, a pinned retention sweep and no public execute on it."
);
