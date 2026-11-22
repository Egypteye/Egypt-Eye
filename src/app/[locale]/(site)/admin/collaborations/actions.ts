"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { CollaborationStatus } from "./constants";
import { scoreCreator } from "@/lib/creatorClub/scoring";
import {
  commissionFor,
  decideAdjustment,
  decidePromotion,
  parseReviewInputs,
  tierExpiry,
} from "@/lib/creatorClub/registry";

export async function updateCollaborationStatus(applicationId: string, status: CollaborationStatus) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  await supabase
    .from("collaboration_applications")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", applicationId);
  revalidatePath("/admin/collaborations");
  revalidatePath(`/admin/collaborations/${applicationId}`);
}

export async function updateCollaborationNotes(applicationId: string, formData: FormData) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  const notes = String(formData.get("adminNotes") ?? "").trim();
  await supabase
    .from("collaboration_applications")
    .update({ admin_notes: notes || null, updated_at: new Date().toISOString() })
    .eq("id", applicationId);
  revalidatePath(`/admin/collaborations/${applicationId}`);
}

// ---------------------------------------------------------------------------
// Creator Club review and promotion.
//
// The score is never stored twice. It is recomputed from the application's
// score_inputs plus whatever the reviewer has supplied, so the admin screen
// and the promotion decision cannot disagree about it. The one place a score
// is frozen is creators.final_score, where freezing is correct: a tier runs
// six months and must not shift under the creator if a band is recalibrated.

/** Saves the human half of the assessment. Partial saves are fine. */
export async function saveCreatorAssessment(applicationId: string, formData: FormData) {
  const admin = await requireAdmin();
  const supabase = createAdminSupabaseClient();

  const review = parseReviewInputs({
    tourismAudiencePercent: formData.get("tourismAudiencePercent") as string | null,
    storytelling: formData.get("storytelling") as string | null,
    cinematography: formData.get("cinematography") as string | null,
    editing: formData.get("editing") as string | null,
    authenticity: formData.get("authenticity") as string | null,
    travelRelevance: formData.get("travelRelevance") as string | null,
    postsPerWeek: formData.get("postsPerWeek") as string | null,
  });

  await supabase
    .from("collaboration_applications")
    .update({
      review_inputs: review,
      reviewed_by: admin?.email ?? admin?.id ?? "admin",
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", applicationId);

  revalidatePath(`/admin/collaborations/${applicationId}`);
}

/**
 * Promotes a reviewed application into a creator.
 *
 * Refuses on an incomplete assessment. The preliminary score is normalised
 * over whatever categories were filled in, so a creator who answered three of
 * six can read as strong; promoting on that basis is how an unearned package
 * gets approved. The gate lives in decidePromotion so a check can execute it.
 */
function failBack(applicationId: string, message: string): never {
  redirect(`/admin/collaborations/${applicationId}?error=${encodeURIComponent(message)}`);
}

export async function approveAsCreator(applicationId: string): Promise<void> {
  const admin = await requireAdmin();
  const supabase = createAdminSupabaseClient();

  const { data } = await supabase
    .from("collaboration_applications")
    .select("id, full_name, creator_name, email, country, score_inputs, review_inputs")
    .eq("id", applicationId)
    .single();
  if (!data) failBack(applicationId, "Application not found.");

  const accounts = Array.isArray(data.score_inputs) ? data.score_inputs : [];
  const scored = scoreCreator(accounts, (data.review_inputs ?? {}) as Parameters<typeof scoreCreator>[1]);

  const decision = decidePromotion({
    verifiedScore: scored.earned,
    assessmentComplete: scored.complete,
    eligible: scored.eligible,
  });
  if (!decision.ok) failBack(applicationId, decision.reason);

  const now = new Date();
  const { data: created, error } = await supabase
    .from("creators")
    .insert({
      application_id: applicationId,
      email: data.email,
      full_name: data.full_name,
      creator_name: data.creator_name,
      country: data.country,
      final_score: scored.earned,
      score_verified_at: now.toISOString(),
      score_verified_by: admin?.email ?? "admin",
      tier: decision.tier,
      tier_assigned_at: now.toISOString(),
      tier_valid_until: tierExpiry(now).toISOString(),
      commission_percent: decision.commissionPercent,
    })
    .select("id")
    .single();

  if (error) {
    // A creator already exists for this person. Not an error worth hiding:
    // the team needs to know they are looking at a repeat applicant.
    failBack(
      applicationId,
      /duplicate|unique/i.test(error.message)
        ? "A creator already exists for this email or application."
        : "Could not create the creator record.",
    );
  }

  await supabase
    .from("creator_score_adjustments")
    .insert({
      creator_id: created?.id,
      application_id: applicationId,
      previous_score: null,
      new_score: scored.earned,
      previous_tier: null,
      new_tier: decision.tier,
      reason: "Initial verified assessment on approval.",
      actor: admin?.email ?? "admin",
    });

  await supabase
    .from("collaboration_applications")
    .update({ status: "approved", updated_at: now.toISOString() })
    .eq("id", applicationId);

  revalidatePath("/admin/collaborations");
  revalidatePath(`/admin/collaborations/${applicationId}`);
}

/** Changes a creator's score. The reason is required, not decorative. */
export async function adjustCreatorScore(creatorId: string, formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const supabase = createAdminSupabaseClient();

  const { data: creator } = await supabase
    .from("creators")
    .select("id, final_score, tier, application_id")
    .eq("id", creatorId)
    .single();
  if (!creator) redirect("/admin/collaborations");

  const decision = decideAdjustment({
    previousScore: creator.final_score,
    newScore: Number(formData.get("newScore")),
    reason: String(formData.get("reason") ?? ""),
    actor: admin?.email ?? "admin",
  });
  if (!decision.ok) failBack(creator.application_id ?? "", decision.reason);

  const newScore = Number(formData.get("newScore"));
  await supabase
    .from("creators")
    .update({
      final_score: newScore,
      tier: decision.newTier,
      commission_percent: commissionFor(decision.newTier),
      updated_at: new Date().toISOString(),
    })
    .eq("id", creatorId);

  await supabase.from("creator_score_adjustments").insert({
    creator_id: creatorId,
    application_id: creator.application_id,
    previous_score: creator.final_score,
    new_score: newScore,
    previous_tier: creator.tier,
    new_tier: decision.newTier,
    reason: String(formData.get("reason")).trim(),
    actor: admin?.email ?? "admin",
  });

  revalidatePath(`/admin/collaborations/${creator.application_id ?? ""}`);
}

/**
 * Grants or withholds airport pickup for one creator.
 *
 * Independent of tier by design (owner's decision 3, corrected 20 Nov 2026):
 * a Premium creator cannot point at their tier and claim it.
 */
export async function setAirportPickup(creatorId: string, granted: boolean, applicationId: string) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  await supabase
    .from("creators")
    .update({ airport_pickup_granted: granted, updated_at: new Date().toISOString() })
    .eq("id", creatorId);
  revalidatePath(`/admin/collaborations/${applicationId}`);
}
