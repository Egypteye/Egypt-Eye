/**
 * Turning an untrusted application payload into scoring inputs.
 *
 * Everything here arrives from a public form, so every number is hostile
 * until proven otherwise. This module's only job is to produce a clean
 * `PlatformAccount[]` that `scoreCreator` can be trusted with, and to make it
 * impossible for the client to influence the result except through the
 * figures it legitimately reports.
 *
 * THE RULE THIS EXISTS TO ENFORCE: the score is computed on the server, from
 * parsed inputs, every time. A score, tier or eligibility flag present in the
 * payload is ignored — not validated, not compared, ignored. A creator who
 * posts `{"preliminary_score": 100, "eligible": true}` must get exactly the
 * same answer as one who posts nothing of the sort, because the only thing
 * the server ever reads is the performance data.
 *
 * Pure, so scripts/check-creator-intake.mts can execute it. The route that
 * uses it imports `server-only` code and is therefore out of reach.
 */

import type { EligiblePlatform, PlatformAccount, VideoStat } from "./scoring";
import { VIDEO_SAMPLE } from "./scoring";

/** The three platforms in the weighted model. YouTube is reviewed by hand. */
export const SCORED_PLATFORMS: EligiblePlatform[] = ["instagram", "tiktok", "facebook"];

/**
 * Ceilings, not business rules.
 *
 * A follower count above this is not a creator, it is a typo or an attempt to
 * reach the top tier by typing zeros. Clamping rather than rejecting keeps a
 * fat-fingered application alive — it still scores, just not absurdly — and
 * the figure is verified against screenshots before anything is approved.
 */
export const MAX_FOLLOWERS = 500_000_000;
export const MAX_VIEWS = 10_000_000_000;

/** Fields a client might send hoping the server stores them as given. */
export const CLIENT_SUPPLIED_SCORE_FIELDS = [
  "score",
  "preliminaryScore",
  "preliminary_score",
  "tier",
  "preliminaryTier",
  "preliminary_tier",
  "eligible",
  "scoreBreakdown",
  "score_breakdown",
  "assignedTier",
  "assigned_tier",
  "adminScore",
  "admin_score",
] as const;

/** A finite, non-negative number within a ceiling. Anything else is 0. */
function safeCount(value: unknown, max: number): number {
  const n = typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(Math.floor(n), max);
}

function isScoredPlatform(value: unknown): value is EligiblePlatform {
  return typeof value === "string" && (SCORED_PLATFORMS as string[]).includes(value.toLowerCase());
}

function parseVideo(raw: unknown): VideoStat | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const views = safeCount(r.views, MAX_VIEWS);
  // A video with no views cannot contribute a ratio to anything. Dropping it
  // is right: keeping it as a zero would drag the median down and punish a
  // creator for leaving one row of the form blank.
  if (views === 0) return null;
  const video: VideoStat = {
    views,
    likes: safeCount(r.likes, MAX_VIEWS),
    comments: safeCount(r.comments, MAX_VIEWS),
    shares: safeCount(r.shares, MAX_VIEWS),
  };
  const saves = r.saves;
  if (saves !== undefined && saves !== null && saves !== "") {
    video.saves = safeCount(saves, MAX_VIEWS);
  }
  return video;
}

/**
 * Parses the submitted accounts into scoring inputs.
 *
 * Only the three scored platforms survive. A creator's YouTube or "other"
 * accounts are collected elsewhere and read by a human — letting them in here
 * would mean scoring them against bands calibrated for short-form video.
 *
 * Duplicate platforms are merged by keeping the larger follower count, so
 * submitting the same platform twice cannot inflate platform diversity or
 * double a creator's weight.
 */
export function parsePlatformAccounts(raw: unknown): PlatformAccount[] {
  if (!Array.isArray(raw)) return [];

  const byPlatform = new Map<EligiblePlatform, PlatformAccount>();

  for (const item of raw.slice(0, 20)) {
    if (typeof item !== "object" || item === null) continue;
    const r = item as Record<string, unknown>;
    if (!isScoredPlatform(r.platform)) continue;
    const platform = String(r.platform).toLowerCase() as EligiblePlatform;

    const followers = safeCount(r.followers, MAX_FOLLOWERS);
    if (followers === 0) continue;

    const videos = Array.isArray(r.videos)
      ? r.videos
          .slice(0, VIDEO_SAMPLE)
          .map(parseVideo)
          .filter((v): v is VideoStat => v !== null)
      : [];

    const existing = byPlatform.get(platform);
    if (existing === undefined || followers > existing.followers) {
      byPlatform.set(platform, { platform, followers, videos });
    }
  }

  return [...byPlatform.values()];
}

/**
 * Strips anything the client should not be able to set.
 *
 * Returns the keys it removed so the route can record an attempt rather than
 * silently discarding it — someone posting a score is worth knowing about.
 */
export function stripClientScore(payload: Record<string, unknown>): {
  cleaned: Record<string, unknown>;
  rejected: string[];
} {
  const cleaned: Record<string, unknown> = {};
  const rejected: string[] = [];
  for (const [key, value] of Object.entries(payload)) {
    if ((CLIENT_SUPPLIED_SCORE_FIELDS as readonly string[]).includes(key)) {
      rejected.push(key);
      continue;
    }
    cleaned[key] = value;
  }
  return { cleaned, rejected };
}
