/**
 * Guards the review system's rules, because they are not style preferences.
 *
 * Three of the behaviours here exist to keep the site on the right side of
 * copyright, Google's review-snippet policy and the FTC's Consumer Review
 * Rule, and all three are invisible in a build: a page that republishes a
 * Tripadvisor review in full, or emits AggregateRating over imported ratings,
 * renders perfectly. The only thing that catches a regression is asserting
 * the behaviour, so that is what this does.
 *
 * The theme tests are here for a different reason: a naive substring match
 * put food photography on fifteen unrelated stories earlier in this project,
 * because "eat" appears inside "weather", "beaten" and "great". The same
 * mistake in review tagging would put a proposal review on a family tour.
 */
import type { Testimonial } from "../src/content/types";
import {
  THIRD_PARTY_EXCERPT_CHARS,
  isFirstParty,
  reviewComplianceIssues,
  schemaEligible,
  schemaEligibleReviews,
  toDisplayReview,
} from "../src/lib/reviewPolicy";
import { deriveThemes, pickRelevantReviews, specificityScore } from "../src/lib/reviewThemes";
import {
  REVIEWS_PER_PAGE,
  groupReviewsByProduct,
  isReviewSubjectType,
  parseReviewPage,
  productReviewsPagePath,
  productReviewsPath,
  reviewPageCount,
  reviewPageSlice,
  sortByPull,
} from "../src/lib/reviewPages";
import { subjectAnchor, type ReviewEntry, type ReviewSubject } from "../src/lib/reviewSubjects";
import { testimonialsPageQuery } from "../src/sanity/queries";
import { normalizeReviewDate, parseCsv, parseReviewInput } from "../src/lib/testimonials/importParse";

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

function review(partial: Partial<Testimonial> & { quote: string }): Testimonial {
  return { name: "A Traveller", ...partial };
}

// ---------------------------------------------------------------------------
// Copyright: third-party reviews are excerpted, first-party ones are not.
// ---------------------------------------------------------------------------
const longText = "word ".repeat(300).trim();

const thirdPartyLong = toDisplayReview(
  review({ quote: longText, source: { platform: "tripadvisor", url: "https://example.com/r/1" } })
);
ok(
  "a long third-party review is excerpted rather than republished in full",
  thirdPartyLong.truncated && thirdPartyLong.text.length <= THIRD_PARTY_EXCERPT_CHARS + 1
);
ok("an excerpted review keeps a link to the original", thirdPartyLong.sourceUrl !== null);

const directLong = toDisplayReview(review({ quote: longText, source: { platform: "direct" } }));
ok("a first-party review is shown in full", !directLong.truncated && directLong.text === longText);

const shortThirdParty = toDisplayReview(
  review({ quote: "Wonderful day.", source: { platform: "airbnb", url: "https://example.com/r/2" } })
);
ok("a short third-party review is not mangled", shortThirdParty.text === "Wonderful day.");

// Nothing may ever alter a traveller's words beyond shortening them.
ok(
  "excerpting only ever removes from the end",
  longText.startsWith(thirdPartyLong.text.replace(/…$/, "").trimEnd())
);

// ---------------------------------------------------------------------------
// Photos: a traveller's photo on someone else's platform is not ours to host.
// ---------------------------------------------------------------------------
const withPhotos = { photos: ["https://example.com/a.jpg", "https://example.com/b.jpg"] };
ok(
  "photos on a third-party review are dropped",
  toDisplayReview(review({ quote: "Lovely", source: { platform: "google", url: "https://x.test" }, ...withPhotos }))
    .photos.length === 0
);
ok(
  "photos on a first-party review are kept",
  toDisplayReview(review({ quote: "Lovely", source: { platform: "direct" }, ...withPhotos })).photos.length === 2
);

// ---------------------------------------------------------------------------
// Search: "Don't aggregate reviews or ratings from other websites."
// ---------------------------------------------------------------------------
const mixed: Testimonial[] = [
  review({ quote: "Direct one", source: { platform: "direct" } }),
  review({ quote: "From TA", source: { platform: "tripadvisor", url: "https://x.test" } }),
  review({ quote: "No source field at all — legacy WhatsApp review" }),
];
ok("a review with no source is treated as first-party", isFirstParty(mixed[2]));
ok("a third-party review is not schema eligible", !schemaEligible(mixed[1]));
ok("schemaEligibleReviews drops third-party reviews", schemaEligibleReviews(mixed).length === 2);

// ---------------------------------------------------------------------------
// Attribution: a third-party review with no link is flagged.
// ---------------------------------------------------------------------------
ok(
  "a third-party review with no link is flagged",
  reviewComplianceIssues(review({ quote: "Great", source: { platform: "tripadvisor" } })).length > 0
);
ok(
  "a properly sourced third-party review is not flagged",
  reviewComplianceIssues(
    review({ quote: "Great", source: { platform: "tripadvisor", url: "https://x.test" } })
  ).length === 0
);
ok("a plain direct review is not flagged", reviewComplianceIssues(review({ quote: "Great" })).length === 0);

// ---------------------------------------------------------------------------
// Themes: word-anchored, never substring.
// ---------------------------------------------------------------------------
ok(
  "a photography review is tagged photography",
  deriveThemes(review({ quote: "The photographer helped us pose and the edits arrived fast." })).includes(
    "photography"
  )
);
ok(
  "a pickup review is tagged pickup",
  deriveThemes(review({ quote: "Our driver was waiting at the airport right on time." })).includes("pickup")
);
ok(
  "a generic review is tagged with nothing",
  deriveThemes(review({ quote: "Great experience, highly recommend!" })).length === 0
);

// The regression that matters: substrings must not match.
const substringTraps = [
  { quote: "The weather was perfect and the food was great.", mustNotHave: "guide" },
  { quote: "We had a great time throughout.", mustNotHave: "photography" },
];
for (const trap of substringTraps) {
  const themes = deriveThemes(review({ quote: trap.quote }));
  ok(
    `"${trap.quote.slice(0, 32)}…" is not tagged ${trap.mustNotHave}`,
    !themes.includes(trap.mustNotHave as never)
  );
}

// A manual override beats the derived list outright.
ok(
  "themes set by hand win",
  deriveThemes(review({ quote: "Great experience", themes: ["proposal"] })).join() === "proposal"
);

// ---------------------------------------------------------------------------
// Relevance: specific beats generic, and irrelevant is dropped entirely.
// ---------------------------------------------------------------------------
const generic = review({ name: "A", quote: "Great experience, highly recommend!" });
const specific = review({
  name: "B",
  quote:
    "The photographer kept showing us the back of the camera between shots so we knew exactly what we were getting, and the edited gallery arrived the same evening.",
});
ok("a specific review scores higher than a generic one", specificityScore(specific) > specificityScore(generic));

const picked = pickRelevantReviews([generic, specific], { themes: ["photography"] }, 3);
ok("the photography review is selected for a photography page", picked[0]?.name === "B");
ok("the generic review is not padded in", picked.length === 1);

ok(
  "a page with no relevant reviews shows none",
  pickRelevantReviews([generic], { themes: ["diving"] }, 3).length === 0
);

// ---------------------------------------------------------------------------
// Importing: an export's gaps must stay gaps.
// ---------------------------------------------------------------------------
// A review body routinely contains commas, quotes and hard newlines, so a CSV
// row is not a line. Splitting on newlines silently truncates reviews.
const tricky = parseCsv(
  'Name,Quote\n"A","Line one\nline two, with a comma and ""quotes"""\n"B","Plain"'
);
ok("CSV keeps an embedded newline inside one field", tricky[1][1].includes("\n"));
ok("CSV keeps an embedded comma", tricky[1][1].includes("with a comma"));
ok('CSV un-escapes doubled quotes', tricky[1][1].includes('"quotes"'));
ok("CSV finds both rows", tricky.length === 3);

const NOW = new Date("2026-09-28T00:00:00Z");

// Platforms give month precision at best. Storing a day nobody recorded would
// be inventing it, so everything lands on the first of its month — which is
// exactly what the site displays.
ok("a full date is trusted as given", normalizeReviewDate("2026-03-14", NOW) === "2026-03-14");
ok('"August 2026" becomes that month', normalizeReviewDate("August 2026", NOW) === "2026-08-01");
ok('"Aug 2026" becomes that month', normalizeReviewDate("Aug 2026", NOW) === "2026-08-01");
ok('"3 weeks ago" resolves to September', normalizeReviewDate("3 weeks ago", NOW) === "2026-09-01");
ok('"2 months ago" resolves to July', normalizeReviewDate("2 months ago", NOW) === "2026-07-01");
ok('"Not provided" is not a date', normalizeReviewDate("Not provided", NOW) === undefined);
ok("gibberish is dropped rather than guessed", normalizeReviewDate("sometime last spring", NOW) === undefined);

// A real export: no per-review link, no score, placeholder text in the gaps.
const exportCsv =
  'Name,Quote,Context,Source,Url,Date,Score\n' +
  '"\'Hayden","Beyond amazing!","Exclusive Pyramids Photoshoot","tripadvisor","Not provided","April 2026","Not provided"\n' +
  '"Tara","Mena took my photos.","Exclusive Pyramids Photoshoot","tripadvisor","Not provided","1 week ago","Not provided"';

const noFallback = parseReviewInput(exportCsv, { now: NOW });
ok("a third-party export with no links is refused outright", noFallback.reviews.length === 0);
ok("and says why, per row", noFallback.issues.length === 2);

const withFallback = parseReviewInput(exportCsv, { defaultUrl: "https://example.test/listing", now: NOW });
ok("a fallback listing link lets the export through", withFallback.reviews.length === 2);
ok("it is detected as CSV", withFallback.format === "csv");
ok("every row carries the link", withFallback.reviews.every((r) => r.url === "https://example.test/listing"));
ok('"Not provided" never becomes a score', withFallback.reviews.every((r) => r.score === undefined));
ok("Excel's leading apostrophe is stripped from a name", withFallback.reviews[0].name === "Hayden");
ok("the quote itself is untouched", withFallback.reviews[0].quote === "Beyond amazing!");

// The typed block format still works, and still needs a link.
const blocks = parseReviewInput("Name: Jo\nQuote: Lovely day out.\nSource: direct", { now: NOW });
ok("blocks are still detected", blocks.format === "blocks");
ok("a direct review needs no link", blocks.reviews.length === 1);

// ---------------------------------------------------------------------------
// Paging: every review lands on exactly one page, and one page only.
//
// The wall was split across URLs because it had grown to 6.3MB. The risk that
// comes with paging is silent loss — an off-by-one in the slice drops a
// traveller's review off the end of the site with nothing to show for it, and
// no page looks broken. So the arithmetic is asserted rather than trusted.
// ---------------------------------------------------------------------------
const pagedSubject: ReviewSubject = {
  type: "tour",
  mega: "tours",
  slug: "1-day-giza-tour",
  title: "1 Day Giza Tour",
  href: "/tours/1-day-giza-tour",
};

ok("page one is the bare path, never /page/1", productReviewsPagePath(pagedSubject, 1) === productReviewsPath(pagedSubject));
ok("the path is type-prefixed", productReviewsPath(pagedSubject) === "/testimonials/tour/1-day-giza-tour");
ok("page two is /page/2", productReviewsPagePath(pagedSubject, 2) === "/testimonials/tour/1-day-giza-tour/page/2");

ok("/page/1 is refused, so one page never has two URLs", parseReviewPage("1") === null);
ok("/page/0 is refused", parseReviewPage("0") === null);
ok("a padded page number is refused", parseReviewPage("01") === null);
ok("a decimal page number is refused", parseReviewPage("2.0") === null);
ok("a non-numeric page is refused", parseReviewPage("last") === null);
ok("a real page number parses", parseReviewPage("12") === 12);

ok("an empty product still has one page", reviewPageCount(0) === 1);
ok("a full page is one page", reviewPageCount(REVIEWS_PER_PAGE) === 1);
ok("one more is two pages", reviewPageCount(REVIEWS_PER_PAGE + 1) === 2);

// The property that matters: paging is a partition. Nothing is dropped and
// nothing is shown twice, at any size — including the awkward ones either
// side of a page boundary.
for (const total of [0, 1, REVIEWS_PER_PAGE - 1, REVIEWS_PER_PAGE, REVIEWS_PER_PAGE + 1, 928]) {
  const all = Array.from({ length: total }, (_, i) => i);
  const pages = reviewPageCount(total);
  const seen = Array.from({ length: pages }, (_, i) => reviewPageSlice(all, i + 1)).flat();
  ok(`every review appears exactly once across the pages (${total})`, seen.length === total && seen.every((v, i) => v === i));
  ok(`no page is over the limit (${total})`, Array.from({ length: pages }, (_, i) => reviewPageSlice(all, i + 1)).every((p) => p.length <= REVIEWS_PER_PAGE));
}

// ---------------------------------------------------------------------------
// Fetch slicing: the same partition property, one layer down.
//
// The pool is read from Sanity in slices rather than one request, because all
// of it in one response is ~2.1MB and Next.js refuses to cache a data entry
// over 2MB (see getTestimonialsInner). That makes the fetch a partition too,
// and it has a failure mode the display paging does not: the slices are
// separate requests, so if the ordering is not *total* the server may settle
// a tie differently for each one — handing back the same review twice and
// missing another, with the count still looking right.
//
// Which is why the query orders by `_id` after `order`. These assertions
// exist to stop anyone simplifying that tie-break away.
// ---------------------------------------------------------------------------
const SLICE = 500;

type Row = { _id: string; order: number | null };

// Ties everywhere: a block sharing one `order`, a block with none at all, and
// _ids that deliberately do not sort in insertion order.
const rows: Row[] = Array.from({ length: 2527 }, (_, i) => ({
  _id: `t-${String((i * 7919) % 2527).padStart(5, "0")}`,
  order: i >= 400 && i < 1300 ? 50 : i >= 2000 && i < 2100 ? null : i,
}));

// Stands in for Sanity, and models the one thing that matters: a server given
// a non-total ordering may return ties in a different sequence per request.
// Array.sort is stable, so the input is scrambled before each sort or the
// hazard would be invisible here exactly as it is in production.
function serve(query: string, seed: number, dropTieBreak = false): Row[] {
  const bounds = query.match(/\[(\d+)\.\.\.(\d+)\]/);
  if (!bounds) throw new Error(`testimonialsPageQuery no longer emits a literal slice:\n${query}`);
  // Read out of the query rather than passed in, so deleting `_id asc` from
  // the real query is what fails this check.
  const tieBreak = !dropTieBreak && /\|\s*order\([^)]*\b_id\s+asc\b/.test(query);
  const scrambled = [...rows];
  let s = seed;
  for (let i = scrambled.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
  }
  scrambled.sort((a, b) => {
    // GROQ sorts null before numbers ascending.
    const ao = a.order ?? -Infinity;
    const bo = b.order ?? -Infinity;
    if (ao !== bo) return ao - bo;
    return tieBreak ? a._id.localeCompare(b._id) : 0;
  });
  return scrambled.slice(Number(bounds[1]), Number(bounds[2]));
}

function fetchPool(total: number, dropTieBreak = false): Row[] {
  const slices = Math.ceil(total / SLICE);
  // seed = i + 1, so every slice is served from its own independent sort.
  return Array.from({ length: slices }, (_, i) =>
    serve(testimonialsPageQuery(i * SLICE, (i + 1) * SLICE), i + 1, dropTieBreak)
  ).flat();
}

const pool = fetchPool(rows.length);
ok("the sliced pool holds every review", pool.length === rows.length);
ok("the sliced pool holds no review twice", new Set(pool.map((r) => r._id)).size === rows.length);

// The guard itself: drop the tie-break and the pool must visibly corrupt. If
// this ever passes, the hazard has stopped being modelled and the assertion
// above has stopped meaning anything.
const naive = fetchPool(rows.length, true);
ok(
  "ordering by `order` alone corrupts the pool, which is why `_id` is in the query",
  new Set(naive.map((r) => r._id)).size < rows.length
);

// Boundaries, including the sizes either side of a slice edge.
for (const total of [1, SLICE - 1, SLICE, SLICE + 1, 2 * SLICE, 2527]) {
  const got = fetchPool(total).slice(0, total);
  ok(`slicing ${total} review(s) yields ${total} distinct`, new Set(got.map((r) => r._id)).size === total);
}

// And the reason for the slice size: one slice has to stay inside the 2MB
// ceiling at the size reviews actually are (2,527 of them measured 2,147,624
// bytes), with room to grow.
const BYTES_PER_REVIEW = 2147624 / 2527;
ok("a slice stays well inside the 2MB data-cache ceiling", SLICE * BYTES_PER_REVIEW * 4 < 2 * 1024 * 1024);

// ---------------------------------------------------------------------------
// Grouping: a review reaches the page for the product it is about, and the
// ordering puts the reviews that say something first.
// ---------------------------------------------------------------------------
const entry = (quote: string, productKey: string | null, featured = false): ReviewEntry => ({
  testimonial: review({ quote, featured: featured || undefined }),
  mega: productKey ? "tours" : null,
  productKey,
  productTitle: productKey ? pagedSubject.title : null,
  productHref: productKey ? pagedSubject.href : null,
});

const anchor = subjectAnchor(pagedSubject);
const grouped = groupReviewsByProduct(
  [
    entry("Great.", anchor),
    entry("Our guide collected us at six and the pyramids were empty when we reached the plateau.", anchor),
    entry("No idea what this was about.", null),
  ],
  [pagedSubject]
);
ok("reviews group under their product", grouped.groups.length === 1 && grouped.groups[0].entries.length === 2);
ok("a review naming no product is kept, not dropped", grouped.unattributed.length === 1);
ok("the review that says more leads", grouped.groups[0].entries[0].testimonial.quote.startsWith("Our guide"));

const featuredFirst = sortByPull([
  entry("Our guide collected us at six and the pyramids were empty when we reached the plateau.", anchor),
  entry("Good.", anchor, true),
]);
ok("a featured review still outranks a longer one", featuredFirst[0].testimonial.quote === "Good.");

ok("a product with no reviews gets no page", groupReviewsByProduct([], [pagedSubject]).groups.length === 0);

ok("the URL type segment is validated", isReviewSubjectType("tour") && isReviewSubjectType("photoshoot"));
ok("an invented type segment is rejected", !isReviewSubjectType("tours") && !isReviewSubjectType("../admin"));

// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\ncheck-reviews: ${errors.length} failure(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

console.log("check-reviews: ok — excerpting, photo handling, schema eligibility, theme matching, display paging, fetch slicing and importing all hold.");
