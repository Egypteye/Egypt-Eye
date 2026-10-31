/**
 * Guards /review — the URL on the business cards.
 *
 * Four things here are dangerous in a way that does not show up in a build,
 * a type error or a screenshot:
 *
 *   REVIEW GATING. Sending happy customers to Google and unhappy ones to a
 *   private form breaches Google's Fake Engagement policy, and the penalty
 *   runs from stripping the reviews to restricting the whole profile. It is
 *   one `rating >= 4` away at all times, and it would read as a helpful
 *   feature in a diff. So the star value may be used to draw the stars and
 *   nothing else.
 *
 *   A FALSE CLAIM OF PUBLICATION. This page cannot know whether a review was
 *   posted — the traveller finishes on Google, in another tab. Any wording
 *   like "thanks, your review is live" would be an assertion the site has no
 *   basis for, about a third party's system.
 *
 *   STRUCTURED DATA OVER GOOGLE REVIEWS. Google's review-snippet guidance
 *   says not to aggregate ratings from other sites, and a business's own
 *   pages cannot earn star snippets anyway. lib/reviewPolicy.ts holds this
 *   line for the testimonials wall; this page must hold it too.
 *
 *   A DEAD REVIEW LINK. The whole page exists to send people to one URL. If
 *   it is wrong, every card, QR code and follow-up message is wrong, and the
 *   only feedback is reviews that never arrive.
 */
import { readFileSync } from "node:fs";
import { GOOGLE_PROFILE_URL, GOOGLE_REVIEW_URL } from "../src/content/googleReviews";

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

// Comments stripped before every source assertion. Both files here carry long
// headers that explain the very rules being checked, so a naive search finds
// the words in the prose and passes however the code is changed. This project
// has shipped that bug more than once (CLAUDE.md #4).
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/.*$/gm, "$1");

const read = (path: string) => stripComments(readFileSync(path, "utf8"));

const composer = read("src/components/ReviewComposer.tsx");
const page = read("src/app/[locale]/(site)/review/page.tsx");
const panel = read("src/components/GoogleReviewsPanel.tsx");
const client = read("src/lib/google/businessProfile.ts");

// ---------------------------------------------------------------------------
// 1. The link.
// ---------------------------------------------------------------------------
ok(
  "GOOGLE_REVIEW_URL is not a Google review link",
  /^https:\/\/(g\.page\/r\/[^/]+\/review|search\.google\.com\/local\/writereview\?)/.test(
    GOOGLE_REVIEW_URL
  )
);
ok("GOOGLE_PROFILE_URL is not a Google link", /^https:\/\/(g\.page|maps\.app\.goo\.gl|www\.google\.)/.test(GOOGLE_PROFILE_URL));
ok(
  "the composer no longer opens the Google review URL",
  /window\.open\(GOOGLE_REVIEW_URL/.test(composer)
);
// One definition, so changing it is one edit rather than a search.
for (const [label, file] of [
  ["the composer", composer],
  ["the page", page],
  ["the panel", panel],
] as const) {
  ok(
    `${label} hardcodes a g.page URL instead of importing it from content/googleReviews`,
    !/g\.page\//.test(file)
  );
}

// ---------------------------------------------------------------------------
// 2. NO GATING. The assertion that matters most.
//
// `rating` may be compared against a star's own value to decide whether to
// fill that star, and nothing else. Any other use of it — in a branch, a
// destination, a label — is the start of gating.
// ---------------------------------------------------------------------------
const ratingUses = composer.match(/\brating\b/g) ?? [];
ok("the composer no longer tracks a rating at all", ratingUses.length > 0);
ok(
  "the composer branches on the star rating — that is review gating, which Google prohibits and penalises",
  // The only permitted comparisons: `(hovered || rating) >= value` to fill a
  // star, and `rating === value` for the radio's checked state.
  !/rating\s*[<>]=?\s*[1-5]\b/.test(composer) &&
    !/rating\s*===?\s*[1-5]\b/.test(composer)
);
ok(
  "the composer picks its destination from the rating",
  !/rating[^\n]*\?[^\n]*https?:/.test(composer)
);
ok(
  "the page sends low and high ratings to different places",
  !/rating/.test(page)
);

// ---------------------------------------------------------------------------
// 3. No claim that the review was published.
// ---------------------------------------------------------------------------
const PUBLICATION_CLAIMS = [
  /your review (?:is|has been|was) (?:now )?(?:live|published|posted)/i,
  /\byou(?:r)? review (?:is|has been) (?:being )?(?:published|posted)\b/i,
  /thanks? for (?:your )?review[^.]*\b(?:published|posted|live)\b/i,
  /review submitted/i,
  /successfully (?:posted|published|submitted)/i,
];
// Scanned across the composer AND the page. The first version of this check
// read only the composer, and a browser test then found the claim sitting in
// the page's own intro — "Your review is published on Google", which reads as
// a statement that it already happened. The check had passed.
for (const pattern of PUBLICATION_CLAIMS) {
  for (const [label, file] of [
    ["the composer", composer],
    ["the review page", page],
  ] as const) {
    ok(
      `${label} claims the review was published (${pattern}) — only Google knows that, and it tells the traveller itself`,
      !pattern.test(file)
    );
  }
}
// The button must not read as a submission either.
ok(
  'the primary button says "Submit" — nothing here submits a review, and saying so is the misunderstanding this page exists to avoid',
  !/>\s*\{?\s*tr\("Submit/i.test(composer)
);

// ---------------------------------------------------------------------------
// 4. No structured data over Google's reviews.
// ---------------------------------------------------------------------------
for (const [label, file] of [
  ["the review page", page],
  ["the Google reviews panel", panel],
] as const) {
  ok(
    `${label} emits structured data over third-party reviews — Google's guidance says not to aggregate ratings from other sites`,
    !/AggregateRating|application\/ld\+json|jsonLd/i.test(file)
  );
}

// ---------------------------------------------------------------------------
// 5. The integration degrades rather than breaking the page.
// ---------------------------------------------------------------------------
ok(
  "getGoogleReviews can throw — /review is a printed URL and must render even when Google is down",
  /catch\s*\(/.test(read("src/lib/google/reviews.ts"))
);
ok(
  "the page renders the Google panel unconditionally, so an empty or failed fetch leaves a bare heading",
  /reviews\.length > 0 &&/.test(page)
);
ok(
  "the Business Profile client is not server-only — these are OAuth credentials",
  /^import "server-only";/m.test(readFileSync("src/lib/google/businessProfile.ts", "utf8"))
);
ok(
  "a Google credential is exposed to the browser as NEXT_PUBLIC_",
  !/NEXT_PUBLIC_GOOGLE/.test(client)
);
// Places API would cap the wall at five reviews and forbid storing them.
ok(
  "the client calls the Places API, which returns at most 5 reviews and may not be cached",
  !/places\.googleapis\.com|maps\/api\/place/.test(client)
);

// ---------------------------------------------------------------------------
// 6. The cron is registered, or the cache never refreshes.
// ---------------------------------------------------------------------------
const vercel = JSON.parse(readFileSync("vercel.json", "utf8")) as {
  crons: { path: string }[];
};
ok(
  "no cron refreshes the Google reviews — the cache would only revalidate on its own daily timer",
  vercel.crons.some((c) => c.path === "/api/google-reviews/sync")
);
ok(
  "the sync route is unauthenticated",
  /bearerMatches\(request, process\.env\.CRON_SECRET\)/.test(
    read("src/app/api/google-reviews/sync/route.ts")
  )
);

// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\ncheck-review-page: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

console.log(
  "check-review-page: ok — /review sends every rating to Google by the same path with no gating, " +
    "never claims a review was published, emits no structured data over Google's reviews, " +
    "keeps the OAuth credentials server-side, renders with Google down, and refreshes on a cron."
);
