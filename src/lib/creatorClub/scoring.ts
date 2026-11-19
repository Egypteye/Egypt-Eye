/**
 * The Egypt Eye Creator Club preliminary score.
 *
 * A creator applying at /collaborate is scored out of 100 across six
 * categories, which proposes a tier. The score is PRELIMINARY: every figure
 * in it is typed in by the applicant, so it proposes, and a human verifies
 * against screenshots before anything is approved. Nothing here decides
 * whether a creator receives a complimentary experience.
 *
 * Pure, and free of `server-only`, for the reason CLAUDE.md gives: logic a
 * check script cannot execute is logic nothing proves. The route that stores
 * a score imports this; so does the form that previews one, so the number a
 * creator sees and the number stored can never disagree.
 *
 * THREE RULES THAT ARE EASY TO GET WRONG, AND ARE THE REASON THIS IS ONE
 * MODULE RATHER THAN A FEW HELPERS NEXT TO THE FORM:
 *
 *   1. Follower counts are never added across platforms. The same person
 *      follows a creator on Instagram and TikTok, so a sum invents reach
 *      that does not exist. Audience size uses the single strongest
 *      eligible platform.
 *
 *   2. A creator who uses one platform is not penalised for it. The weights
 *      are renormalised across the platforms actually present, so a
 *      TikTok-only creator is measured against TikTok, not against an
 *      absent Instagram.
 *
 *   3. Missing data is PENDING, never zero and never full marks. A category
 *      with nothing to judge it on reports `pending` and is excluded from
 *      the attainable total, so a half-filled application reads as
 *      incomplete rather than as a weak creator — or, worse, as a strong one.
 *
 * Every threshold is exported and configurable. The bands are the business's
 * opening calibration, not industry truth; they are expected to move once
 * real applications have been seen.
 */

export type EligiblePlatform = "instagram" | "tiktok" | "facebook";

/**
 * Relative weight of each eligible platform.
 *
 * Renormalised across the platforms a creator actually uses — see
 * `normalisedWeights`. YouTube and anything else are collected by the form
 * and reviewed by a human, but are deliberately not in the weighted model
 * until the business has calibrated them.
 */
export const PLATFORM_WEIGHTS: Record<EligiblePlatform, number> = {
  tiktok: 0.4,
  instagram: 0.4,
  facebook: 0.2,
};

/**
 * The eligibility gate for a COMPLIMENTARY package: 10,000 followers on at
 * least one eligible platform. Not a scoring input — a creator below it can
 * still score well, and is still worth considering for paid or discounted
 * work. It gates the free package only.
 */
export const MIN_FOLLOWERS_FOR_COMPLIMENTARY = 10_000;

/** How many recent videos are considered. Median, not mean — see `median`. */
export const VIDEO_SAMPLE = 10;

export const CATEGORY_MAX = {
  audienceSize: 15,
  engagement: 20,
  videoPerformance: 20,
  tourismRelevance: 15,
  contentQuality: 15,
  consistency: 15,
} as const;

export type CategoryKey = keyof typeof CATEGORY_MAX;

export const TOTAL_POINTS = Object.values(CATEGORY_MAX).reduce((a, b) => a + b, 0);

export type Band = { min: number; points: number };

/** Followers on the strongest eligible platform. */
export const AUDIENCE_BANDS: Band[] = [
  { min: 500_000, points: 15 },
  { min: 250_000, points: 14 },
  { min: 100_000, points: 12 },
  { min: 50_000, points: 9 },
  { min: 20_000, points: 6 },
  { min: 10_000, points: 3 },
  { min: 0, points: 0 },
];

/** Engagement rate, as a percentage. Applied to both ER measures. */
export const ENGAGEMENT_BANDS: Band[] = [
  { min: 8, points: 20 },
  { min: 5, points: 16 },
  { min: 3, points: 12 },
  { min: 2, points: 8 },
  { min: 1, points: 4 },
  { min: 0, points: 0 },
];

/** Median views ÷ followers, as a percentage. */
export const VIDEO_BANDS: Band[] = [
  { min: 80, points: 20 },
  { min: 40, points: 17 },
  { min: 20, points: 13 },
  { min: 10, points: 9 },
  { min: 5, points: 5 },
  { min: 0, points: 2 },
];

export const TIER_THRESHOLDS = [
  { min: 85, tier: "Elite Creator" },
  { min: 70, tier: "Premium Creator" },
  { min: 55, tier: "Established Creator" },
  { min: 40, tier: "Rising Creator" },
  { min: 0, tier: "Explorer" },
] as const;

export type Tier = (typeof TIER_THRESHOLDS)[number]["tier"];

export function bandPoints(bands: Band[], value: number): number {
  for (const b of bands) if (value >= b.min) return b.points;
  return 0;
}

export function tierFor(score: number): Tier {
  for (const t of TIER_THRESHOLDS) if (score >= t.min) return t.tier;
  return "Explorer";
}

/**
 * Median, not mean.
 *
 * One video that happened to reach 40x a creator's following would drag a
 * mean far above anything an Egypt campaign could expect to repeat. The
 * median describes the video a brand will actually get.
 */
export function median(values: number[]): number | null {
  const sorted = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export type VideoStat = {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  /** Not reported by every platform; absent is not zero-worthy, just absent. */
  saves?: number;
};

export type PlatformAccount = {
  platform: EligiblePlatform;
  followers: number;
  /** The creator's most recent videos; only the first VIDEO_SAMPLE are used. */
  videos?: VideoStat[];
};

/**
 * Everything a human reviewer, or the applicant, has supplied beyond the raw
 * platform numbers. Each is optional, and each absent one makes its category
 * `pending` rather than scoring it.
 */
export type ReviewInputs = {
  /** Share of audience in tourism-relevant source markets, 0–100. */
  tourismAudiencePercent?: number;
  /** Human content review, already broken down. Max 4/4/3/2/2 = 15. */
  contentQuality?: {
    storytelling: number;
    cinematography: number;
    editing: number;
    authenticity: number;
    travelRelevance: number;
  };
  /** Posts per week across eligible platforms, for publishing frequency. */
  postsPerWeek?: number;
};

export type CategoryResult = {
  key: CategoryKey;
  max: number;
  /** null when the category is pending — never silently 0 and never full. */
  points: number | null;
  status: "scored" | "pending";
  /** Plain sentence for the applicant: why it is pending, or how it scored. */
  detail: string;
};

export type ScoreResult = {
  /** Points actually awarded across scored categories. */
  score: number;
  /** The total those categories could have reached. */
  attainable: number;
  /** Score normalised to 100 across SCORED categories only. */
  normalised: number;
  /** Tier from the normalised score. Provisional in every sense. */
  tier: Tier;
  eligible: boolean;
  eligibilityDetail: string;
  strongestPlatform: EligiblePlatform | null;
  strongestFollowers: number;
  categories: CategoryResult[];
  pendingCount: number;
  /**
   * True while any category is pending, which is almost always.
   *
   * Normalising over scored categories alone means a creator who fills in
   * only their follower count and video stats can read as "Elite Creator"
   * off three of six categories — the three a creator can answer without
   * uploading anything. That is the correct arithmetic and a dangerous
   * sentence: Elite proposes the largest complimentary package Egypt Eye
   * offers, and nobody should see that word as settled while half the
   * evidence is missing.
   *
   * So the tier never travels without this flag, and every consumer must
   * present a provisional tier as provisional.
   */
  provisional: boolean;
};

/** Weights for the platforms actually present, renormalised to sum to 1. */
export function normalisedWeights(
  accounts: PlatformAccount[],
): Partial<Record<EligiblePlatform, number>> {
  const present = accounts.filter((a) => a.followers > 0);
  const total = present.reduce((sum, a) => sum + PLATFORM_WEIGHTS[a.platform], 0);
  if (total === 0) return {};
  const out: Partial<Record<EligiblePlatform, number>> = {};
  for (const a of present) out[a.platform] = PLATFORM_WEIGHTS[a.platform] / total;
  return out;
}

function interactions(v: VideoStat): number {
  return v.likes + v.comments + v.shares + (v.saves ?? 0);
}

/** Views-based and followers-based ER for one account, as percentages. */
function engagementRates(
  account: PlatformAccount,
): { byViews: number | null; byFollowers: number | null } {
  const videos = (account.videos ?? []).slice(0, VIDEO_SAMPLE);
  if (videos.length === 0 || account.followers <= 0) return { byViews: null, byFollowers: null };
  const byViews = median(
    videos.filter((v) => v.views > 0).map((v) => (interactions(v) / v.views) * 100),
  );
  const byFollowers = median(videos.map((v) => (interactions(v) / account.followers) * 100));
  return { byViews, byFollowers };
}

/** Median views ÷ followers for one account, as a percentage. */
function viewsToFollowers(account: PlatformAccount): number | null {
  const videos = (account.videos ?? []).slice(0, VIDEO_SAMPLE);
  if (videos.length === 0 || account.followers <= 0) return null;
  return median(videos.map((v) => (v.views / account.followers) * 100));
}

/**
 * Scores an application.
 *
 * `accounts` should hold only the eligible platforms. Anything else the form
 * collected belongs in human review, not in this number.
 */
export function scoreCreator(
  accounts: PlatformAccount[],
  review: ReviewInputs = {},
): ScoreResult {
  const eligibleAccounts = accounts.filter((a) => a.followers > 0);
  const weights = normalisedWeights(eligibleAccounts);

  const strongest = eligibleAccounts.reduce<PlatformAccount | null>(
    (best, a) => (best === null || a.followers > best.followers ? a : best),
    null,
  );
  const strongestFollowers = strongest?.followers ?? 0;
  const eligible = strongestFollowers >= MIN_FOLLOWERS_FOR_COMPLIMENTARY;

  const categories: CategoryResult[] = [];

  // --- A. Audience size: strongest platform, never a sum. ---------------
  categories.push(
    strongest === null
      ? {
          key: "audienceSize",
          max: CATEGORY_MAX.audienceSize,
          points: null,
          status: "pending",
          detail: "Add at least one Instagram, TikTok or Facebook account with a follower count.",
        }
      : {
          key: "audienceSize",
          max: CATEGORY_MAX.audienceSize,
          points: bandPoints(AUDIENCE_BANDS, strongestFollowers),
          status: "scored",
          detail: `Measured on your strongest platform (${strongest.platform}, ${strongestFollowers.toLocaleString()} followers). Follower counts are never added together across platforms.`,
        },
  );

  // --- B. Engagement: both measures, weighted across platforms ----------
  const erWeighted = { byViews: 0, byFollowers: 0, weight: 0 };
  for (const a of eligibleAccounts) {
    const w = weights[a.platform] ?? 0;
    const { byViews, byFollowers } = engagementRates(a);
    if (byViews === null || byFollowers === null) continue;
    erWeighted.byViews += byViews * w;
    erWeighted.byFollowers += byFollowers * w;
    erWeighted.weight += w;
  }
  if (erWeighted.weight === 0) {
    categories.push({
      key: "engagement",
      max: CATEGORY_MAX.engagement,
      points: null,
      status: "pending",
      detail: `Add the likes, comments, shares and views for your last ${VIDEO_SAMPLE} videos.`,
    });
  } else {
    // Rescale: a platform with no video data contributed no weight, so the
    // remaining platforms carry the average rather than being diluted by it.
    const byViews = erWeighted.byViews / erWeighted.weight;
    const byFollowers = erWeighted.byFollowers / erWeighted.weight;
    // Both measures count. Views-based alone flatters a creator whose reach
    // collapsed; followers-based alone flatters one whose videos travel far
    // beyond their following.
    const points = Math.round(
      (bandPoints(ENGAGEMENT_BANDS, byViews) + bandPoints(ENGAGEMENT_BANDS, byFollowers)) / 2,
    );
    categories.push({
      key: "engagement",
      max: CATEGORY_MAX.engagement,
      points,
      status: "scored",
      detail: `Median engagement across your last ${VIDEO_SAMPLE} videos: ${byViews.toFixed(1)}% of views and ${byFollowers.toFixed(1)}% of followers.`,
    });
  }

  // --- C. Video performance: median views ÷ followers -------------------
  let vtfWeighted = 0;
  let vtfWeight = 0;
  for (const a of eligibleAccounts) {
    const w = weights[a.platform] ?? 0;
    const ratio = viewsToFollowers(a);
    if (ratio === null) continue;
    vtfWeighted += ratio * w;
    vtfWeight += w;
  }
  if (vtfWeight === 0) {
    categories.push({
      key: "videoPerformance",
      max: CATEGORY_MAX.videoPerformance,
      points: null,
      status: "pending",
      detail: `Add the view counts for your last ${VIDEO_SAMPLE} videos.`,
    });
  } else {
    const ratio = vtfWeighted / vtfWeight;
    categories.push({
      key: "videoPerformance",
      max: CATEGORY_MAX.videoPerformance,
      points: bandPoints(VIDEO_BANDS, ratio),
      status: "scored",
      detail: `Your median video reaches ${ratio.toFixed(0)}% of your follower count.`,
    });
  }

  // --- D. Tourism audience relevance ------------------------------------
  categories.push(
    review.tourismAudiencePercent === undefined
      ? {
          key: "tourismRelevance",
          max: CATEGORY_MAX.tourismRelevance,
          points: null,
          status: "pending",
          detail: "Upload your audience-country insights so we can see where your audience travels from.",
        }
      : {
          key: "tourismRelevance",
          max: CATEGORY_MAX.tourismRelevance,
          points: Math.round(
            (Math.min(100, Math.max(0, review.tourismAudiencePercent)) / 100) *
              CATEGORY_MAX.tourismRelevance,
          ),
          status: "scored",
          detail: `${Math.round(review.tourismAudiencePercent)}% of your audience is in markets that travel to Egypt.`,
        },
  );

  // --- E. Content quality: human review only ----------------------------
  // Never scored automatically. A model cannot judge whether a creator's
  // storytelling is worth a complimentary trip, and the spec is explicit
  // that AI must not be the sole authority for approving a creator.
  const cq = review.contentQuality;
  categories.push(
    cq === undefined
      ? {
          key: "contentQuality",
          max: CATEGORY_MAX.contentQuality,
          points: null,
          status: "pending",
          detail: "Reviewed by our team once we have watched your work.",
        }
      : {
          key: "contentQuality",
          max: CATEGORY_MAX.contentQuality,
          points: Math.min(
            CATEGORY_MAX.contentQuality,
            cq.storytelling + cq.cinematography + cq.editing + cq.authenticity + cq.travelRelevance,
          ),
          status: "scored",
          detail: "Scored by our team from your portfolio and recent work.",
        },
  );

  // --- F. Consistency and platform diversity ----------------------------
  // Diversity is 3 of 15 on purpose: a strong single-platform creator must
  // remain competitive, so this can never be the category that sinks them.
  if (review.postsPerWeek === undefined) {
    categories.push({
      key: "consistency",
      max: CATEGORY_MAX.consistency,
      points: null,
      status: "pending",
      detail: "Tell us how often you publish.",
    });
  } else {
    const frequency = Math.min(7, Math.round((Math.max(0, review.postsPerWeek) / 5) * 7));
    const platformCount = eligibleAccounts.length;
    const diversity = platformCount >= 3 ? 3 : platformCount === 2 ? 2 : 1;
    // Consistent performance needs video history on at least one platform.
    const consistent = eligibleAccounts.some((a) => (a.videos ?? []).length >= 3) ? 5 : 0;
    categories.push({
      key: "consistency",
      max: CATEGORY_MAX.consistency,
      points: frequency + consistent + diversity,
      status: "scored",
      detail: `Publishing about ${review.postsPerWeek} times a week across ${platformCount} platform${platformCount === 1 ? "" : "s"}.`,
    });
  }

  const scored = categories.filter((c) => c.status === "scored");
  const pending = categories.filter((c) => c.status === "pending").length;
  const score = scored.reduce((sum, c) => sum + (c.points ?? 0), 0);
  const attainable = scored.reduce((sum, c) => sum + c.max, 0);
  const normalised = attainable === 0 ? 0 : Math.round((score / attainable) * TOTAL_POINTS);

  return {
    score,
    attainable,
    normalised,
    tier: tierFor(normalised),
    eligible,
    eligibilityDetail: eligible
      ? `${strongestFollowers.toLocaleString()} followers on ${strongest?.platform} meets the ${MIN_FOLLOWERS_FOR_COMPLIMENTARY.toLocaleString()} minimum for a complimentary package.`
      : `A complimentary package needs ${MIN_FOLLOWERS_FOR_COMPLIMENTARY.toLocaleString()} followers on at least one of Instagram, TikTok or Facebook. We still welcome your application — paid and discounted collaborations are considered separately.`,
    strongestPlatform: strongest?.platform ?? null,
    strongestFollowers,
    categories,
    pendingCount: pending,
    provisional: pending > 0,
  };
}
