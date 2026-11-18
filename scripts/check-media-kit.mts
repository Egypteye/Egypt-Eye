/**
 * Guards the media kit a collaboration application must carry.
 *
 * Three separate things can quietly break here, and none of them errors:
 *
 *  1. THE FIELD STOPS BEING MANDATORY. "At least one of a PDF or a link" is
 *     not expressible as a database constraint — the retention sweep has to
 *     be able to clear both columns when it anonymises a row, and a CHECK
 *     would make that UPDATE fail. So the rule lives in one function, and the
 *     only thing standing between it and a silently optional field is this
 *     check.
 *
 *  2. THE LINK BECOMES AN XSS HOLE. The admin detail page renders the
 *     submitted link as an href, and that page belongs to the one account
 *     that can read every application. A `javascript:` URL accepted here is
 *     stored cross-site scripting aimed at exactly the wrong person.
 *
 *  3. THE PDF OUTLIVES THE ANONYMISATION. Migration 0027 blanks an
 *     applicant's name, email, phone and message after the retention window.
 *     A media kit puts all of it back: their name is on the cover and their
 *     photograph is inside. The file has to be swept too, and the sweep has
 *     to run in the nightly job rather than merely existing.
 *
 * The rules are executed rather than grepped — that is the whole reason
 * src/lib/collaborations/mediaKit.ts is a pure module with no `server-only`
 * import. The wiring, which cannot be executed offline, is read from source.
 */
import { readFileSync } from "node:fs";
import {
  validateMediaKit,
  normaliseMediaKitLink,
  MEDIA_KIT_MAX_BYTES,
  MEDIA_KIT_MIME,
} from "../src/lib/collaborations/mediaKit";

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/.*$/gm, "$1");

const pdf = (size: number) => ({ type: MEDIA_KIT_MIME, size });

// ---------------------------------------------------------------------------
// 1. Mandatory, and satisfied by either half.
ok(
  "an application with no PDF and no link is accepted — the media kit is not mandatory",
  validateMediaKit({}).ok === false
);
ok(
  "an empty file and a blank link is accepted",
  validateMediaKit({ file: { type: MEDIA_KIT_MIME, size: 0 }, link: "   " }).ok === false
);
ok(
  "a PDF on its own is rejected",
  validateMediaKit({ file: pdf(1024) }).ok === true
);
ok(
  "a link on its own is rejected",
  validateMediaKit({ link: "https://drive.google.com/file/d/abc/view" }).ok === true
);
ok(
  "a PDF and a link together is rejected",
  validateMediaKit({ file: pdf(1024), link: "https://example.com/kit" }).ok === true
);

// The mode is what the route stores, so it has to name what actually arrived.
const both = validateMediaKit({ file: pdf(10), link: "https://example.com/k" });
ok("mode is wrong when both halves are given", both.ok === true && both.mode === "both");
const fileOnly = validateMediaKit({ file: pdf(10) });
ok("mode is wrong for a PDF alone", fileOnly.ok === true && fileOnly.mode === "file");
const linkOnly = validateMediaKit({ link: "https://example.com/k" });
ok("mode is wrong for a link alone", linkOnly.ok === true && linkOnly.mode === "link");

// ---------------------------------------------------------------------------
// 2. File type and size.
for (const type of ["image/png", "application/msword", "text/html", "application/pdf; charset=x", ""]) {
  ok(
    `a ${JSON.stringify(type)} file is accepted as a media kit — only PDF should be`,
    validateMediaKit({ file: { type, size: 1024 } }).ok === false
  );
}
ok(
  "a PDF one byte over the limit is accepted",
  validateMediaKit({ file: pdf(MEDIA_KIT_MAX_BYTES + 1) }).ok === false
);
ok(
  "a PDF exactly at the limit is rejected",
  validateMediaKit({ file: pdf(MEDIA_KIT_MAX_BYTES) }).ok === true
);
// An oversized PDF must fail even when a valid link is also present: the
// applicant chose to send both, and silently dropping one is how a team ends
// up reviewing half a submission.
ok(
  "an oversized PDF passes when a link is also given",
  validateMediaKit({ file: pdf(MEDIA_KIT_MAX_BYTES + 1), link: "https://example.com/k" }).ok === false
);

// ---------------------------------------------------------------------------
// 3. Link safety. These are the ones that matter.
for (const hostile of [
  "javascript:alert(1)",
  "JaVaScRiPt:alert(1)",
  "data:text/html;base64,PHNjcmlwdD4=",
  "vbscript:msgbox(1)",
  "file:///etc/passwd",
  // These matter more than the five above. Those all parse to an EMPTY
  // hostname, so the "hostname must contain a dot" rule rejects them even
  // with no protocol check at all — which is exactly how a protocol
  // allowlist rots untested. These carry a real hostname past that rule and
  // are only stopped by the allowlist itself. `//` opens a JS comment and
  // %0A ends it, so the tail executes if this ever reaches an href.
  "javascript://example.com/%0Aalert(1)",
  "javascript://drive.google.com/%0Aalert(document.cookie)",
  "jAvAsCrIpT://example.com/%0Aalert(1)",
]) {
  ok(
    `${JSON.stringify(hostile)} is accepted as a media kit link — the admin page renders this as an href`,
    normaliseMediaKitLink(hostile) === null
  );
  ok(
    `${JSON.stringify(hostile)} passes validateMediaKit`,
    validateMediaKit({ link: hostile }).ok === false
  );
}
for (const nonsense of ["not a url", "https://", "https://localhost", "http://drive", "https://example.com."]) {
  ok(
    `${JSON.stringify(nonsense)} is accepted as a media kit link`,
    normaliseMediaKitLink(nonsense) === null
  );
}
// A scheme-less host is the normal way people paste a link, so it is upgraded
// rather than refused.
ok(
  "a scheme-less link is not upgraded to https",
  normaliseMediaKitLink("drive.google.com/file/d/abc")?.startsWith("https://") === true
);
for (const good of [
  "https://drive.google.com/file/d/abc/view",
  "http://example.com/kit.pdf",
  "https://www.dropbox.com/s/xyz/kit.pdf?dl=0",
]) {
  ok(`${JSON.stringify(good)} is rejected — it is a perfectly ordinary link`, normaliseMediaKitLink(good) !== null);
}
// A typed-but-broken link is an error even alongside a valid PDF, so nobody
// is told their link came through when it did not.
ok(
  "a broken link is silently dropped when a PDF is also attached",
  validateMediaKit({ file: pdf(10), link: "javascript:alert(1)" }).ok === false
);

// ---------------------------------------------------------------------------
// 4. The route actually asks. Executed rules are worthless if nothing calls them.
const route = stripComments(readFileSync("src/app/api/collaborate-apply/route.ts", "utf8"));
ok("collaborate-apply does not call validateMediaKit", /validateMediaKit\s*\(/.test(route));
ok(
  "collaborate-apply no longer reads multipart form data — a file cannot reach it",
  /request\.formData\(\)/.test(route)
);
ok(
  "collaborate-apply stores the raw submitted link instead of the normalised one",
  /media_kit_url:\s*mediaKitUrl/.test(route)
);
ok("collaborate-apply does not store the uploaded file's path", /media_kit_path:\s*mediaKitPath/.test(route));
ok(
  "the media kit bucket is public, or no longer named in the route",
  /collaboration-media-kits/.test(route)
);

// ---------------------------------------------------------------------------
// 5. The PDF is swept when the application is anonymised.
const sweep = stripComments(readFileSync("src/lib/privacy/mediaKitRetention.ts", "utf8"));
ok(
  "the media kit sweep no longer filters on anonymised_at — it would delete live applications' kits",
  /anonymised_at/.test(sweep)
);
ok("the media kit sweep does not remove anything from storage", /\.remove\(/.test(sweep));
const job = stripComments(readFileSync("src/app/api/bookings/reconcile/route.ts", "utf8"));
ok(
  "the nightly job does not run the media kit sweep, so media kits outlive the anonymisation that was supposed to remove them",
  /deleteAnonymisedMediaKits\s*\(/.test(job)
);

// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\ncheck-media-kit: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

console.log(
  `check-media-kit: ok — a media kit is mandatory and either half satisfies it, only PDFs up to ` +
    `${MEDIA_KIT_MAX_BYTES / 1024 / 1024} MB are taken, javascript:/data:/file: links cannot reach the ` +
    `admin page's href, a typed-but-broken link is an error rather than a silent drop, the route asks ` +
    `all of this before inserting, and an anonymised application's PDF is swept from the bucket nightly.`
);
