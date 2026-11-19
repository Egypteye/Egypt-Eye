/**
 * Guards the Creator Club scoring engine.
 *
 * The score proposes a tier, and the tier proposes a complimentary package
 * with real commercial value. Three of its rules are easy to break without
 * anything erroring, and each would be expensive:
 *
 *   1. SUMMING FOLLOWERS ACROSS PLATFORMS. The same person follows a creator
 *      on Instagram and on TikTok. Adding the counts invents reach that does
 *      not exist and promotes creators into tiers they have not earned — the
 *      single most costly mistake this engine can make.
 *
 *   2. PENALISING A SINGLE-PLATFORM CREATOR. The weights must renormalise
 *      across the platforms actually present. A TikTok-only creator measured
 *      against an absent Instagram scores 60% of what they should.
 *
 *   3. SILENTLY SCORING MISSING DATA AS ZERO — OR AS FULL MARKS. A half-
 *      filled application must read as incomplete. Zero makes a strong
 *      creator look weak; full marks hands out free trips on no evidence.
 *
 * Everything here executes the real module. That is why scoring.ts is pure
 * and free of `server-only`.
 */
import {
  scoreCreator,
  normalisedWeights,
  median,
  bandPoints,
  tierFor,
  AUDIENCE_BANDS,
  PLATFORM_WEIGHTS,
  MIN_FOLLOWERS_FOR_COMPLIMENTARY,
  TOTAL_POINTS,
  CATEGORY_MAX,
  type PlatformAccount,
  type VideoStat,
} from "../src/lib/creatorClub/scoring";

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

const vid = (views: number, likes: number, comments = 0, shares = 0): VideoStat => ({
  views,
  likes,
  comments,
  shares,
});
const tenVideos = (views: number, likes: number): VideoStat[] =>
  Array.from({ length: 10 }, () => vid(views, likes));

// ---------------------------------------------------------------------------
// 1. Follower counts are never summed.
const split: PlatformAccount[] = [
  { platform: "instagram", followers: 9_000 },
  { platform: "tiktok", followers: 9_000 },
  { platform: "facebook", followers: 9_000 },
];
const splitResult = scoreCreator(split);
ok(
  "27,000 followers split across three platforms was treated as one 27,000 audience — counts are being summed",
  splitResult.strongestFollowers === 9_000
);
ok(
  "a creator under 10k on every platform was marked eligible for a complimentary package",
  splitResult.eligible === false
);
const audienceCat = splitResult.categories.find((c) => c.key === "audienceSize");
ok(
  "audience size scored above the 10k band for a creator with 9k on each platform",
  audienceCat?.points === 0
);

// A single platform at 10k IS eligible, where three at 9k are not.
ok(
  "10,000 on one platform did not meet the eligibility gate",
  scoreCreator([{ platform: "tiktok", followers: MIN_FOLLOWERS_FOR_COMPLIMENTARY }]).eligible === true
);
ok(
  "9,999 on one platform passed the eligibility gate",
  scoreCreator([{ platform: "tiktok", followers: MIN_FOLLOWERS_FOR_COMPLIMENTARY - 1 }]).eligible === false
);

// ---------------------------------------------------------------------------
// 2. A single-platform creator is not penalised.
const weightsSolo = normalisedWeights([{ platform: "tiktok", followers: 50_000 }]);
ok(
  "a TikTok-only creator's weight is not renormalised to 1 — they are measured against platforms they do not use",
  Math.abs((weightsSolo.tiktok ?? 0) - 1) < 1e-9
);
const weightsPair = normalisedWeights([
  { platform: "tiktok", followers: 10_000 },
  { platform: "facebook", followers: 10_000 },
]);
const pairSum = (weightsPair.tiktok ?? 0) + (weightsPair.facebook ?? 0);
ok("two-platform weights do not sum to 1", Math.abs(pairSum - 1) < 1e-9);
ok(
  "renormalisation lost the relative weighting between TikTok and Facebook",
  Math.abs((weightsPair.tiktok ?? 0) / (weightsPair.facebook ?? 1) - PLATFORM_WEIGHTS.tiktok / PLATFORM_WEIGHTS.facebook) < 1e-9
);

// The decisive one: identical performance, one platform vs three, must give
// the same engagement and video scores.
const perf = tenVideos(50_000, 5_000);
const solo = scoreCreator([{ platform: "tiktok", followers: 100_000, videos: perf }]);
const trio = scoreCreator([
  { platform: "tiktok", followers: 100_000, videos: perf },
  { platform: "instagram", followers: 100_000, videos: perf },
  { platform: "facebook", followers: 100_000, videos: perf },
]);
for (const key of ["engagement", "videoPerformance"] as const) {
  const a = solo.categories.find((c) => c.key === key)?.points;
  const b = trio.categories.find((c) => c.key === key)?.points;
  ok(
    `${key} differs between a one-platform and a three-platform creator with identical performance (${a} vs ${b})`,
    a === b
  );
}

// ---------------------------------------------------------------------------
// 3. Missing data is pending — never 0, never full.
const bare = scoreCreator([{ platform: "tiktok", followers: 50_000 }]);
for (const key of ["engagement", "videoPerformance", "tourismRelevance", "contentQuality", "consistency"] as const) {
  const cat = bare.categories.find((c) => c.key === key);
  ok(`${key} was scored despite having no data`, cat?.status === "pending");
  ok(`${key} is pending but still carries points`, cat?.points === null);
}
ok(
  "pending categories were counted in the attainable total — a half-filled application looks weak rather than incomplete",
  bare.attainable === CATEGORY_MAX.audienceSize
);
ok("pendingCount is wrong", bare.pendingCount === 5);

// Content quality must never be awarded automatically.
ok(
  "content quality scored itself without a human review",
  scoreCreator([{ platform: "tiktok", followers: 500_000, videos: tenVideos(1_000_000, 200_000) }])
    .categories.find((c) => c.key === "contentQuality")?.status === "pending"
);

// A fully supplied application leaves nothing pending and can reach 100.
const complete = scoreCreator(
  [{ platform: "tiktok", followers: 600_000, videos: tenVideos(600_000, 60_000) }],
  {
    tourismAudiencePercent: 100,
    contentQuality: { storytelling: 4, cinematography: 4, editing: 3, authenticity: 2, travelRelevance: 2 },
    postsPerWeek: 5,
  },
);
ok("a complete application still reports pending categories", complete.pendingCount === 0);
ok("a complete application's attainable total is not 100", complete.attainable === TOTAL_POINTS);
ok("a flawless application does not reach the top tier", complete.tier === "Elite Creator");
ok("score exceeded the attainable total", complete.score <= complete.attainable);

// ---------------------------------------------------------------------------
// 4. Median, not mean — one viral video must not carry a creator.
const steady = Array.from({ length: 10 }, () => vid(1_000, 10));
const oneViral = [...Array.from({ length: 9 }, () => vid(1_000, 10)), vid(10_000_000, 1_000_000)];
const steadyScore = scoreCreator([{ platform: "tiktok", followers: 100_000, videos: steady }]);
const viralScore = scoreCreator([{ platform: "tiktok", followers: 100_000, videos: oneViral }]);
ok(
  "a single viral video changed the video-performance score — the mean is being used instead of the median",
  steadyScore.categories.find((c) => c.key === "videoPerformance")?.points ===
    viralScore.categories.find((c) => c.key === "videoPerformance")?.points
);
ok("median of an even-length list is wrong", median([1, 2, 3, 4]) === 2.5);
ok("median of an odd-length list is wrong", median([5, 1, 3]) === 3);
ok("median of nothing should be null, not 0", median([]) === null);

// ---------------------------------------------------------------------------
// 5. Bands and tiers are ordered and total correctly.
ok("the six categories do not add up to 100", TOTAL_POINTS === 100);
for (let i = 1; i < AUDIENCE_BANDS.length; i++) {
  ok(
    "AUDIENCE_BANDS is not in descending order, so bandPoints returns the wrong band",
    AUDIENCE_BANDS[i - 1].min > AUDIENCE_BANDS[i].min
  );
}
ok("bandPoints picked the wrong audience band at a boundary", bandPoints(AUDIENCE_BANDS, 100_000) === 12);
ok("bandPoints picked the wrong audience band just below a boundary", bandPoints(AUDIENCE_BANDS, 99_999) === 9);
ok("tier boundaries are wrong at 85", tierFor(85) === "Elite Creator");
ok("tier boundaries are wrong at 84", tierFor(84) === "Premium Creator");
ok("tier boundaries are wrong at 40", tierFor(40) === "Rising Creator");
ok("tier boundaries are wrong at 39", tierFor(39) === "Explorer");

// ---------------------------------------------------------------------------
// 6. Eligibility and score are independent.
// A huge creator can be ineligible; a small one can score well. Conflating
// them would either hand packages to unqualified creators or hide good ones.
const smallButStrong = scoreCreator(
  [{ platform: "instagram", followers: 4_000, videos: tenVideos(20_000, 4_000) }],
  { tourismAudiencePercent: 90, postsPerWeek: 5 },
);
ok("a sub-10k creator was marked eligible", smallButStrong.eligible === false);
ok(
  "a sub-10k creator was given no score at all — eligibility and scoring must stay independent",
  smallButStrong.normalised > 0
);

// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\ncheck-creator-scoring: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

console.log(
  `check-creator-scoring: ok — follower counts are never summed across platforms, a one-platform ` +
    `creator scores identically to a three-platform one on the same performance, missing data is ` +
    `pending rather than 0 or full marks, content quality is never scored without a human, one ` +
    `viral video cannot move the median, and the six categories total ${TOTAL_POINTS}.`
);
