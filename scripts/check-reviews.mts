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
import type { Testimonial, ReviewSourceSummary } from "../src/content/types";
import {
  THIRD_PARTY_EXCERPT_CHARS,
  isFirstParty,
  isSummaryFresh,
  reviewComplianceIssues,
  schemaEligible,
  schemaEligibleReviews,
  toDisplayReview,
} from "../src/lib/reviewPolicy";
import { deriveThemes, pickRelevantReviews, specificityScore } from "../src/lib/reviewThemes";

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
// Staleness: a hand-typed platform count expires rather than aging silently.
// ---------------------------------------------------------------------------
const summary = (checkedOn: string): ReviewSourceSummary => ({
  platform: "tripadvisor",
  label: "Egypt Eye Travels",
  url: "https://x.test",
  count: 312,
  score: 4.9,
  checkedOn,
});
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);
ok("a recently checked badge shows", isSummaryFresh(summary(daysAgo(10))));
ok("a badge checked a year ago is hidden", !isSummaryFresh(summary(daysAgo(365))));

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
if (errors.length > 0) {
  console.error(`\ncheck-reviews: ${errors.length} failure(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

console.log("check-reviews: ok — excerpting, photo handling, schema eligibility, staleness and theme matching all hold.");
