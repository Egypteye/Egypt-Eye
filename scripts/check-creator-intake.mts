/**
 * Guards the boundary between a public form and the Creator Club score.
 *
 * The score proposes a tier, and a tier proposes a complimentary package
 * worth hundreds of dollars. The application form is public and unauthenticated,
 * so the figures behind that number arrive from a stranger.
 *
 * FOUR WAYS THIS GOES WRONG, none of which errors:
 *
 *   1. THE SERVER TRUSTS A CLIENT-SUPPLIED SCORE. Someone posts
 *      `preliminary_score: 100, eligible: true` and is filed as an Elite
 *      creator without a single follower. This is the one that matters most,
 *      and it is why the route computes rather than reads.
 *
 *   2. UNSCORED PLATFORMS REACH THE MODEL. YouTube bands are not calibrated
 *      here; letting a YouTube account in scores long-form video against
 *      short-form thresholds and quietly inflates everyone who has one.
 *
 *   3. THE SAME PLATFORM IS SUBMITTED TWICE. Two Instagram rows would count
 *      twice toward platform diversity and double that platform's weight.
 *
 *   4. ABSURD FIGURES ARE TAKEN LITERALLY. A follower count with eight extra
 *      zeros, or a negative one, must not reach the bands.
 *
 * Everything here executes the real modules.
 */
import { readFileSync } from "node:fs";
import {
  parsePlatformAccounts,
  stripClientScore,
  CLIENT_SUPPLIED_SCORE_FIELDS,
  MAX_FOLLOWERS,
  SCORED_PLATFORMS,
} from "../src/lib/creatorClub/intake";
import { scoreCreator, VIDEO_SAMPLE } from "../src/lib/creatorClub/scoring";

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/.*$/gm, "$1");

// ---------------------------------------------------------------------------
// 1. A client-supplied score is ignored entirely.
const honest = [{ platform: "tiktok", followers: 12_000 }];
const cheating = [
  {
    platform: "tiktok",
    followers: 12_000,
    score: 100,
    preliminary_score: 100,
    tier: "Elite Creator",
    eligible: true,
  },
];
const honestResult = scoreCreator(parsePlatformAccounts(honest));
const cheatingResult = scoreCreator(parsePlatformAccounts(cheating));
ok(
  "a payload carrying its own score produced a different result from the same figures without one",
  honestResult.normalised === cheatingResult.normalised && honestResult.tier === cheatingResult.tier
);
ok(
  "a self-declared Elite creator with 12,000 followers was filed as Elite",
  cheatingResult.tier !== "Elite Creator"
);

const { cleaned, rejected } = stripClientScore({
  fullName: "A",
  preliminary_score: 100,
  tier: "Elite Creator",
  eligible: true,
  admin_score: 100,
});
ok("stripClientScore kept a client-supplied score", !("preliminary_score" in cleaned));
ok("stripClientScore kept a client-supplied tier", !("tier" in cleaned));
ok("stripClientScore kept a client-supplied eligibility flag", !("eligible" in cleaned));
ok("stripClientScore kept a client-supplied admin override", !("admin_score" in cleaned));
ok("stripClientScore dropped a legitimate field", cleaned.fullName === "A");
ok("stripClientScore did not report what it rejected", rejected.length === 4);
for (const field of CLIENT_SUPPLIED_SCORE_FIELDS) {
  const out = stripClientScore({ [field]: "x", keep: 1 });
  ok(`stripClientScore let "${field}" through`, !(field in out.cleaned));
}

// The route must COMPUTE, not read. If it ever stores a submitted score this
// whole module is decoration.
const route = stripComments(readFileSync("src/app/api/collaborate-apply/route.ts", "utf8"));
ok("the route does not compute a score at all", /scoreCreator\s*\(/.test(route));
ok("the route does not parse the submitted accounts", /parsePlatformAccounts\s*\(/.test(route));
ok(
  "the route stores a preliminary_score that does not come from scoreCreator's result",
  /preliminary_score:[^,]*scored\./.test(route)
);
ok(
  "the route stores an eligibility flag that does not come from scoreCreator's result",
  /eligible:[^,]*scored\./.test(route)
);
for (const field of ["preliminary_score", "preliminary_tier", "eligible"]) {
  ok(
    `the route reads ${field} straight off the submitted form`,
    !new RegExp(`${field}[^,\\n]*form\\.get`).test(route)
  );
}

// ---------------------------------------------------------------------------
// 2. Only the three scored platforms reach the model.
const mixed = parsePlatformAccounts([
  { platform: "tiktok", followers: 10_000 },
  { platform: "youtube", followers: 900_000 },
  { platform: "twitch", followers: 400_000 },
  { platform: "other", followers: 800_000 },
]);
ok(
  "an unscored platform reached the scoring model — its bands are not calibrated for this",
  mixed.length === 1 && mixed[0].platform === "tiktok"
);
ok(
  "a 900k YouTube account changed the audience-size score",
  scoreCreator(mixed).strongestFollowers === 10_000
);
for (const p of SCORED_PLATFORMS) {
  ok(
    `${p} was rejected as a scored platform`,
    parsePlatformAccounts([{ platform: p, followers: 10_000 }]).length === 1
  );
}
// Case should not decide eligibility.
ok(
  "a capitalised platform name was dropped",
  parsePlatformAccounts([{ platform: "TikTok", followers: 10_000 }]).length === 1
);

// ---------------------------------------------------------------------------
// 3. Duplicate platforms are merged, not counted twice.
const dupes = parsePlatformAccounts([
  { platform: "instagram", followers: 10_000 },
  { platform: "instagram", followers: 40_000 },
  { platform: "instagram", followers: 5_000 },
]);
ok("the same platform submitted three times produced three accounts", dupes.length === 1);
ok("merging duplicates did not keep the largest follower count", dupes[0].followers === 40_000);

// ---------------------------------------------------------------------------
// 4. Absurd and hostile figures are clamped or dropped.
ok(
  "a negative follower count survived parsing",
  parsePlatformAccounts([{ platform: "tiktok", followers: -5_000 }]).length === 0
);
ok(
  "a follower count above the ceiling was not clamped",
  parsePlatformAccounts([{ platform: "tiktok", followers: 9e18 }])[0].followers === MAX_FOLLOWERS
);
for (const junk of [NaN, Infinity, "abc", null, undefined, {}]) {
  ok(
    `${JSON.stringify(junk) ?? "undefined"} as a follower count did not parse to nothing`,
    parsePlatformAccounts([{ platform: "tiktok", followers: junk }]).length === 0
  );
}
ok("a non-array payload did not parse to nothing", parsePlatformAccounts("not an array").length === 0);
ok("a null payload did not parse to nothing", parsePlatformAccounts(null).length === 0);

// Videos: only the sample window, and zero-view rows dropped rather than
// counted as zeros that would drag the median down.
const manyVideos = parsePlatformAccounts([
  {
    platform: "tiktok",
    followers: 10_000,
    videos: Array.from({ length: 50 }, () => ({ views: 1_000, likes: 100 })),
  },
]);
ok(
  `more than ${VIDEO_SAMPLE} videos were kept — the sample window is not being applied`,
  (manyVideos[0].videos ?? []).length === VIDEO_SAMPLE
);
const blankRows = parsePlatformAccounts([
  {
    platform: "tiktok",
    followers: 10_000,
    videos: [{ views: 1_000, likes: 100 }, { views: 0, likes: 0 }, { views: "", likes: "" }],
  },
]);
ok(
  "a blank video row was kept as a zero and will drag the median down",
  (blankRows[0].videos ?? []).length === 1
);
ok(
  "a negative like count survived into a video",
  parsePlatformAccounts([
    { platform: "tiktok", followers: 10_000, videos: [{ views: 100, likes: -50 }] },
  ])[0].videos?.[0].likes === 0
);

// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\ncheck-creator-intake: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

console.log(
  `check-creator-intake: ok — a submitted score, tier or eligibility flag is ignored and the route ` +
    `computes its own, only ${SCORED_PLATFORMS.join("/")} reach the model, duplicate platforms merge ` +
    `to the largest, negative and absurd figures are dropped or clamped, and only the last ` +
    `${VIDEO_SAMPLE} videos with real views are scored.`
);
