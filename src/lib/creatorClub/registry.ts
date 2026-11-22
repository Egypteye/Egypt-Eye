/**
 * Turning a reviewed application into a creator, and the rules that govern
 * one afterwards.
 *
 * Pure and free of `server-only`: the admin server actions that call these
 * import Supabase and `next/cache`, which would put the rules out of reach of
 * a check script. What matters here is not the database write but the
 * decisions around it, and those are tested.
 *
 * THE DISTINCTION THIS MODULE EXISTS TO HOLD. An application carries a
 * PRELIMINARY score: every figure in it was typed by the applicant and
 * nothing has been checked. A creator carries a VERIFIED score, confirmed by
 * a human against screenshots and the media kit. Promoting one to the other
 * is the moment the business commits, so it is the moment with rules:
 *
 *   - No tier without a verified score. A tier is an entitlement to a
 *     package worth hundreds of dollars; it cannot be handed out on the
 *     strength of numbers nobody has looked at.
 *   - No commission below Elite, ever (owner's decision 6).
 *   - Airport pickup is granted individually and never implied by a tier
 *     (owner's decision 3, corrected 20 Nov 2026).
 *   - Every manual score change records a reason. An adjustment with no
 *     stated grounds is the thing the audit table exists to prevent.
 */

import { TIER_THRESHOLDS, tierFor, type Tier } from "./scoring";
import { PACKAGE_RULES } from "./program";

export const CREATOR_STATUSES = ["active", "suspended", "expired", "rejected"] as const;
export type CreatorStatus = (typeof CREATOR_STATUSES)[number];

export const COLLABORATION_STATUSES = [
  "planning",
  "awaiting_agreement",
  "agreement_signed",
  "trip_confirmed",
  "active",
  "awaiting_content",
  "completed",
  "cancelled",
] as const;
export type CollaborationStatus = (typeof COLLABORATION_STATUSES)[number];

/**
 * When a tier assigned now stops being valid.
 *
 * Computed from the agreed six months and stored on the row, not derived at
 * read time: changing the policy later must not silently re-date a creator
 * who has already been told when theirs runs out.
 */
export function tierExpiry(assignedAt: Date, months = PACKAGE_RULES.validityMonths): Date {
  const out = new Date(assignedAt.getTime());
  out.setUTCMonth(out.getUTCMonth() + months);
  return out;
}

export function tierIsCurrent(validUntil: string | Date | null, now: Date = new Date()): boolean {
  if (!validUntil) return false;
  return new Date(validUntil).getTime() > now.getTime();
}

/**
 * The commission a tier earns. Elite alone, and only the approved rate.
 *
 * A function rather than a column default so there is one answer: an admin
 * screen that let someone type a rate against a Premium creator would be a
 * standing invitation to pay commission the business never agreed to.
 */
export function commissionFor(tier: Tier | null): number | null {
  return tier === "Elite Creator" ? 10 : null;
}

export type PromotionInput = {
  /** The verified score, after a human has checked the figures. */
  verifiedScore: number | null;
  /** Whether every one of the six categories has actually been assessed. */
  assessmentComplete: boolean;
  /** Whether any single platform met the 10,000-follower gate. */
  eligible: boolean;
};

export type PromotionDecision =
  | {
      ok: true;
      tier: Tier;
      /** False when the creator is below the follower gate: they can still be
       *  a partner on paid or discounted terms, but no complimentary package. */
      complimentaryEligible: boolean;
      commissionPercent: number | null;
    }
  | { ok: false; reason: string };

/**
 * Whether an application can become a creator, and at what tier.
 *
 * Deliberately refuses an incomplete assessment. The preliminary score on an
 * application is normalised over whatever categories the applicant filled in,
 * so a creator who answered three of six can read as strong; promoting on
 * that basis is how an unearned Elite package gets approved.
 */
export function decidePromotion(input: PromotionInput): PromotionDecision {
  if (input.verifiedScore === null) {
    return { ok: false, reason: "Verify the score against the creator's insights before assigning a tier." };
  }
  if (!input.assessmentComplete) {
    return {
      ok: false,
      reason:
        "All six categories must be assessed before a tier is assigned — an incomplete assessment cannot earn one.",
    };
  }
  if (input.verifiedScore < 0 || input.verifiedScore > 100) {
    return { ok: false, reason: "A verified score must be between 0 and 100." };
  }

  const tier = tierFor(input.verifiedScore);
  return {
    ok: true,
    tier,
    complimentaryEligible: input.eligible,
    commissionPercent: commissionFor(tier),
  };
}

export type AdjustmentInput = {
  previousScore: number | null;
  newScore: number;
  reason: string;
  actor: string;
};

export type AdjustmentDecision =
  | { ok: true; newTier: Tier; previousTier: Tier | null }
  | { ok: false; reason: string };

/**
 * A manual score change.
 *
 * The reason is not optional and not cosmetic: a partnership programme gets
 * asked why a creator was moved, and "an administrator changed it" is not an
 * answer. Whitespace does not count as a reason.
 */
export function decideAdjustment(input: AdjustmentInput): AdjustmentDecision {
  if (!input.reason || input.reason.trim().length < 3) {
    return { ok: false, reason: "Record why the score is being changed." };
  }
  if (!input.actor.trim()) {
    return { ok: false, reason: "An adjustment must record who made it." };
  }
  if (!Number.isInteger(input.newScore) || input.newScore < 0 || input.newScore > 100) {
    return { ok: false, reason: "A score must be a whole number between 0 and 100." };
  }
  return {
    ok: true,
    newTier: tierFor(input.newScore),
    previousTier: input.previousScore === null ? null : tierFor(input.previousScore),
  };
}

/** Every tier, highest first, for an admin dropdown. */
export function tiersHighestFirst(): Tier[] {
  return TIER_THRESHOLDS.map((t) => t.tier);
}

/**
 * The human half of the assessment, as it arrives from the admin form.
 *
 * Parsed here rather than in the server action so a check can execute it.
 * Every field is optional: a reviewer who has watched the work but not yet
 * read the audience insights should be able to save what they have, and the
 * categories they have not reached stay `pending`.
 */
export type ReviewFormInput = {
  tourismAudiencePercent?: string | null;
  storytelling?: string | null;
  cinematography?: string | null;
  editing?: string | null;
  authenticity?: string | null;
  travelRelevance?: string | null;
  postsPerWeek?: string | null;
};

/** Caps that mirror the scoring model's category maxima. */
export const CONTENT_QUALITY_MAX = {
  storytelling: 4,
  cinematography: 4,
  editing: 3,
  authenticity: 2,
  travelRelevance: 2,
} as const;

function clampNumber(raw: string | null | undefined, max: number): number | null {
  if (raw === null || raw === undefined || String(raw).trim() === "") return null;
  const n = Number.parseFloat(String(raw));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.min(n, max);
}

/**
 * Turns the admin form into ReviewInputs the scoring model accepts.
 *
 * Content quality is all-or-nothing: the model takes five sub-scores and a
 * partial set would quietly score the missing ones as zero, which reads as a
 * reviewer judging the work harshly rather than not having judged it yet.
 */
export function parseReviewInputs(form: ReviewFormInput): {
  tourismAudiencePercent?: number;
  contentQuality?: {
    storytelling: number;
    cinematography: number;
    editing: number;
    authenticity: number;
    travelRelevance: number;
  };
  postsPerWeek?: number;
} {
  const out: ReturnType<typeof parseReviewInputs> = {};

  const tourism = clampNumber(form.tourismAudiencePercent, 100);
  if (tourism !== null) out.tourismAudiencePercent = tourism;

  const posts = clampNumber(form.postsPerWeek, 100);
  if (posts !== null) out.postsPerWeek = posts;

  const cq = {
    storytelling: clampNumber(form.storytelling, CONTENT_QUALITY_MAX.storytelling),
    cinematography: clampNumber(form.cinematography, CONTENT_QUALITY_MAX.cinematography),
    editing: clampNumber(form.editing, CONTENT_QUALITY_MAX.editing),
    authenticity: clampNumber(form.authenticity, CONTENT_QUALITY_MAX.authenticity),
    travelRelevance: clampNumber(form.travelRelevance, CONTENT_QUALITY_MAX.travelRelevance),
  };
  if (Object.values(cq).every((v) => v !== null)) {
    out.contentQuality = cq as NonNullable<ReturnType<typeof parseReviewInputs>["contentQuality"]>;
  }

  return out;
}
