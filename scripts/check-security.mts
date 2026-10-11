import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { jsonLdScript } from "../src/content/jsonLd";
import { secretMatches, bearerToken } from "../src/lib/security/secrets";
import { getClientIp } from "../src/lib/security/clientIp";

// Offline assertions for the security fixes, so that "fixed" means
// something was proved rather than something was edited.
//
// Each block states what would be true again if the fix were reverted, and
// every one of them was run against the pre-fix code to confirm it fails
// there. A check that passes on the broken version checks nothing.

const problems: string[] = [];
function ok(condition: boolean, failure: string) {
  if (!condition) problems.push(failure);
}

// ---------------------------------------------------------------------------
// 1. JSON-LD cannot break out of its <script> tag.
// ---------------------------------------------------------------------------
const hostile = {
  "@type": "Tour",
  name: `Sunrise at Giza</script><script>alert(1)</script>`,
  note: `ampersand & bracket < > and a separator here`,
};
const rendered = jsonLdScript(hostile);

ok(!rendered.includes("<"), "jsonLdScript left a literal < in its output — a </script> in CMS text can close the tag");
ok(!rendered.includes(">"), "jsonLdScript left a literal > in its output");
ok(!rendered.includes("&"), "jsonLdScript left a literal & in its output — an entity could decode into a bracket");
ok(!rendered.includes(" "), "jsonLdScript left a literal U+2028 in its output — valid JSON, but it breaks JSON.parse");
ok(!/<\/?script/i.test(rendered), "jsonLdScript output still contains a script tag");

// The escaping must not change what a parser reads back, or the fix would
// quietly corrupt the structured data Google indexes.
ok(
  JSON.stringify(JSON.parse(rendered)) === JSON.stringify(hostile),
  "jsonLdScript altered the parsed value — escaping must be lossless, not sanitising",
);

// ---------------------------------------------------------------------------
// 2. No page may go back to embedding JSON-LD with a bare JSON.stringify.
// ---------------------------------------------------------------------------
function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (full.endsWith(".tsx") || full.endsWith(".ts")) out.push(full);
  }
  return out;
}
const sourceFiles = walk("src");

// src/content/jsonLd.ts is the one exception: its comment quotes the broken
// pattern in order to explain what it fixes. Excluded by exact path, not by
// a looser rule that would also let a real regression through.
const DEFINES_THE_FIX = "src/content/jsonLd.ts";

for (const file of sourceFiles) {
  if (file === DEFINES_THE_FIX) continue;
  const text = readFileSync(file, "utf8");
  if (/__html:\s*JSON\.stringify\(/.test(text)) {
    problems.push(`${file} embeds JSON with a bare JSON.stringify — use jsonLdScript() from @/content/jsonLd`);
  }
}

// ---------------------------------------------------------------------------
// 3. Shared-secret comparison refuses everything except an exact match.
// ---------------------------------------------------------------------------
const SECRET = "s3cr3t-value-with-length";
ok(secretMatches(SECRET, SECRET), "secretMatches rejected the correct secret");
ok(!secretMatches("wrong", SECRET), "secretMatches accepted a wrong secret");
ok(!secretMatches(SECRET.slice(0, -1), SECRET), "secretMatches accepted a prefix of the secret");
ok(!secretMatches(SECRET + "x", SECRET), "secretMatches accepted the secret plus a suffix");
ok(!secretMatches(null, SECRET), "secretMatches accepted a missing guess");
ok(!secretMatches("", SECRET), "secretMatches accepted an empty guess");

// An unset env var must never authenticate anybody. This is the case that
// turns a deployment missing MIGRATE_SECRET into an open CMS-write endpoint.
ok(!secretMatches("anything", undefined), "secretMatches authenticated against an unset secret");
ok(!secretMatches("anything", ""), "secretMatches authenticated against an empty secret");
ok(!secretMatches(undefined, undefined), "secretMatches let a missing guess match a missing secret");

// ---------------------------------------------------------------------------
// 4. Bearer token parsing.
// ---------------------------------------------------------------------------
const asRequest = (headers: Record<string, string>) =>
  ({ headers: new Headers(headers) }) as unknown as Parameters<typeof bearerToken>[0];

ok(bearerToken(asRequest({ authorization: `Bearer ${SECRET}` })) === SECRET, "bearerToken failed on a well-formed header");
ok(bearerToken(asRequest({ authorization: `bearer ${SECRET}` })) === SECRET, "bearerToken is case-sensitive on the scheme");
ok(bearerToken(asRequest({ authorization: SECRET })) === null, "bearerToken accepted a header with no Bearer scheme");
ok(bearerToken(asRequest({})) === null, "bearerToken invented a token from no header");
ok(bearerToken(asRequest({ authorization: "Bearer" })) === null, "bearerToken accepted a Bearer header with no token");

// ---------------------------------------------------------------------------
// 5. A rate-limit key is never taken from the part of the header a caller
//    controls. Revert getClientIp to x-forwarded-for's first entry and the
//    last two assertions here fail.
// ---------------------------------------------------------------------------
const ipRequest = (headers: Record<string, string>) =>
  ({ headers: new Headers(headers) }) as unknown as Parameters<typeof getClientIp>[0];

ok(
  getClientIp(ipRequest({ "x-vercel-forwarded-for": "9.9.9.9", "x-forwarded-for": "1.1.1.1" })) === "9.9.9.9",
  "getClientIp ignored the platform-set header in favour of a rewritable one",
);
ok(
  getClientIp(ipRequest({ "x-forwarded-for": "203.0.113.7" })) === "203.0.113.7",
  "getClientIp broke the ordinary single-address case — this is what Vercel actually sends",
);
ok(
  getClientIp(ipRequest({ "x-forwarded-for": "6.6.6.6, 203.0.113.7" })) === "203.0.113.7",
  "getClientIp took a caller-supplied entry from the front of x-forwarded-for instead of the proxy-appended one at the end",
);
ok(
  getClientIp(ipRequest({ "x-forwarded-for": "evil, evil, evil, 203.0.113.7" })) === "203.0.113.7",
  "getClientIp can be fed a longer chain to shift which entry it reads",
);
ok(getClientIp(ipRequest({})) === "unknown", "getClientIp invented an address with no headers");
ok(
  getClientIp(ipRequest({ "x-forwarded-for": "x".repeat(5000) })).length <= 64,
  "getClientIp passes an unbounded header through as a database key",
);

// ---------------------------------------------------------------------------
// 6. The dangerous maintenance routes all go through the shared guard, and
//    none of them compares a secret itself. Requires a CALL, not a mention:
//    a comment naming the function must not satisfy this.
// ---------------------------------------------------------------------------
const MAINTENANCE = [
  "migrate",
  "image-audit",
  "dedupe-testimonials",
  "purge-testimonials",
  "purge-redirected-stories",
];
for (const route of MAINTENANCE) {
  const file = `src/app/api/${route}/route.ts`;
  const text = readFileSync(file, "utf8");
  ok(
    /refuseUnlessMaintainer\s*\(/.test(text),
    `${file} does not call refuseUnlessMaintainer() — this route can write to or delete from the CMS`,
  );
  ok(
    !/searchParams\.get\("secret"\)/.test(text),
    `${file} reads the secret from the query string itself instead of going through the shared guard`,
  );
  ok(
    !/!==\s*process\.env\.MIGRATE_SECRET/.test(text),
    `${file} compares MIGRATE_SECRET with !== — use secretMatches, which does not leak timing`,
  );
}

// ---------------------------------------------------------------------------
// 7. No route hand-rolls a bearer comparison any more.
// ---------------------------------------------------------------------------
for (const file of sourceFiles.filter((f) => f.includes("/api/"))) {
  const text = readFileSync(file, "utf8");
  if (/!==\s*`Bearer \${/.test(text) || /===\s*`Bearer \${/.test(text)) {
    problems.push(`${file} compares an Authorization header with === — use bearerMatches from @/lib/security/secrets`);
  }
}

// ---------------------------------------------------------------------------
// 8. The rate-limit table's cleanup function has a caller.
// ---------------------------------------------------------------------------
ok(
  readFileSync("src/lib/rateLimit.ts", "utf8").includes("cleanup_rate_limit_hits"),
  "nothing calls cleanup_rate_limit_hits() — rate_limit_hits grows for ever",
);
ok(
  /pruneRateLimitHits\s*\(/.test(readFileSync("src/app/api/bookings/reconcile/route.ts", "utf8")),
  "the nightly sweep does not call pruneRateLimitHits() — the cleanup function is unreachable again",
);

// ---------------------------------------------------------------------------
// 9. The rate limiter must read the error field on every query it makes.
//
//    This is the bug that made it a no-op in production: supabase-js
//    resolves with { data, error } rather than throwing, so an unchecked
//    error means `count` is undefined, the >= max test is false for ever,
//    and every caller is waved through. Asserted structurally because the
//    alternative is a live database.
// ---------------------------------------------------------------------------
const limiterSource = readFileSync("src/lib/rateLimit.ts", "utf8");

// Scoped to checkRateLimit's own body. The first version of this check read
// the whole file, and rateLimiterHealth() — which legitimately contains the
// same destructuring — satisfied it, so reverting the bug in checkRateLimit
// left the check green. Narrowing to the one function is the difference
// between asserting something and asserting nothing.
const checkStart = limiterSource.indexOf("export async function checkRateLimit");
const checkEnd = limiterSource.indexOf("export async function rateLimiterHealth");
ok(checkStart >= 0 && checkEnd > checkStart, "could not locate checkRateLimit in rateLimit.ts to inspect it");
const checkBody = limiterSource.slice(Math.max(checkStart, 0), checkEnd > checkStart ? checkEnd : undefined);

ok(
  /const { count, error: countError }/.test(checkBody),
  "checkRateLimit does not read the error from its count query — an error there leaves count undefined and allows every request",
);
ok(
  /if \(countError\)/.test(checkBody),
  "checkRateLimit does not act on a failed count query",
);
ok(
  /const { error: insertError } = await supabase\.from\("rate_limit_hits"\)/.test(checkBody),
  "checkRateLimit discards the result of its insert — if recording a hit fails, counts never accumulate and nothing is ever limited",
);
ok(
  /if \(insertError\)/.test(checkBody),
  "checkRateLimit does not act on a failed insert",
);

// Every failing-open path has to say so. A limiter that allows a request
// after an error and logs nothing is the exact failure this check exists for.
const failOpenLogs = (checkBody.match(/RATE LIMITER BROKEN/g) ?? []).length;
ok(
  failOpenLogs >= 2,
  `checkRateLimit has ${failOpenLogs} loud failure log(s); both the count and the insert paths must announce that they are failing open`,
);

// And the operator, who has no access to function logs, must be able to see it.
const paypalPage = readFileSync("src/app/[locale]/(site)/admin/paypal/page.tsx", "utf8");
ok(
  /rateLimiterHealth\s*\(/.test(paypalPage),
  "the admin diagnostics page does not call rateLimiterHealth() — a broken limiter would be invisible again",
);

if (problems.length > 0) {
  console.error("check-security FAILED:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(
  "check-security: ok — JSON-LD cannot escape its script tag and survives a round trip, " +
    "shared secrets are compared in constant time and never authenticate against an unset value, " +
    "rate-limit keys come from the proxy rather than the caller, a failed rate-limit query can no longer wave every caller "
    + "through in silence, and all five CMS-write routes go through the shared guard.",
);
