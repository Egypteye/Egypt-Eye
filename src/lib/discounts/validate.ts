import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { DiscountCampaign, DiscountCodeRow } from "./types";

export type DiscountValidationResult =
  | { valid: true; code: DiscountCodeRow; campaign: DiscountCampaign; discountAmount: number }
  | { valid: false; reason: string };

// Read-only — never marks a code redeemed. Called both when a visitor types
// a code in to preview their discount (so they can see it before
// submitting) and again, server-side, right before actually creating the
// reservation (never trust a discount amount the client says it already
// calculated). Only src/lib/discounts/redeem.ts is allowed to consume a code.
export async function validateDiscountCode({
  code,
  customerId,
  tourSlugs,
  experienceSlugs,
  subtotal,
}: {
  code: string;
  customerId?: string | null;
  tourSlugs: string[];
  experienceSlugs: string[];
  subtotal: number;
}): Promise<DiscountValidationResult> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { valid: false, reason: "Please enter a code." };

  const supabase = createAdminSupabaseClient();
  const { data: codeRow } = await supabase
    .from("discount_codes")
    .select("*")
    .eq("code", normalized)
    .maybeSingle<DiscountCodeRow>();
  if (!codeRow) return { valid: false, reason: "We couldn't find that code." };

  if (codeRow.status === "redeemed") return { valid: false, reason: "This code has already been used." };
  if (codeRow.status === "revoked") return { valid: false, reason: "This code is no longer valid." };
  if (codeRow.status === "expired" || (codeRow.expires_at && new Date(codeRow.expires_at) < new Date())) {
    return { valid: false, reason: "This code has expired." };
  }

  // Customer-specific eligibility: a code minted for a specific account can
  // only be redeemed by that account.
  if (codeRow.customer_id) {
    if (!customerId) return { valid: false, reason: "Please log in to the account this code belongs to." };
    if (codeRow.customer_id !== customerId) return { valid: false, reason: "This code belongs to a different account." };
  }

  const { data: campaign } = await supabase
    .from("discount_campaigns")
    .select("*")
    .eq("id", codeRow.campaign_id)
    .maybeSingle<DiscountCampaign>();
  if (!campaign || !campaign.active) return { valid: false, reason: "This offer is no longer active." };

  const now = new Date();
  if (new Date(campaign.starts_at) > now) return { valid: false, reason: "This offer hasn't started yet." };
  if (campaign.ends_at && new Date(campaign.ends_at) < now) return { valid: false, reason: "This offer has ended." };

  // subtotal === 0 means "priced items only, everything selected is a
  // custom quote" — not a $0 trip — so the minimum doesn't apply yet; it's
  // re-checked once a real quote exists.
  if (campaign.min_booking_value && subtotal > 0 && subtotal < campaign.min_booking_value) {
    return {
      valid: false,
      reason: `This code needs a minimum estimated trip value of $${campaign.min_booking_value.toLocaleString()}.`,
    };
  }

  if (campaign.excluded_tour_slugs?.some((s) => tourSlugs.includes(s))) {
    return { valid: false, reason: "This code doesn't apply to one of the tours in your journey." };
  }
  if (campaign.excluded_experience_slugs?.some((s) => experienceSlugs.includes(s))) {
    return { valid: false, reason: "This code doesn't apply to one of the experiences in your journey." };
  }
  if (campaign.eligible_tour_slugs && campaign.eligible_tour_slugs.length > 0 && tourSlugs.length > 0) {
    const anyEligible = tourSlugs.some((s) => campaign.eligible_tour_slugs!.includes(s));
    if (!anyEligible) return { valid: false, reason: "This code doesn't apply to the tours in your journey." };
  }
  if (
    campaign.eligible_experience_slugs &&
    campaign.eligible_experience_slugs.length > 0 &&
    experienceSlugs.length > 0 &&
    tourSlugs.length === 0
  ) {
    const anyEligible = experienceSlugs.some((s) => campaign.eligible_experience_slugs!.includes(s));
    if (!anyEligible) return { valid: false, reason: "This code doesn't apply to the experiences in your journey." };
  }

  if (campaign.new_customers_only && customerId) {
    const { count } = await supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", customerId)
      .in("status", ["confirmed", "in_trip", "completed"]);
    if ((count ?? 0) > 0) return { valid: false, reason: "This code is reserved for new customers." };
  }

  let discountAmount =
    campaign.discount_type === "percentage" ? subtotal * (campaign.value / 100) : campaign.value;
  if (campaign.max_discount_amount) discountAmount = Math.min(discountAmount, campaign.max_discount_amount);
  discountAmount = Math.max(0, Math.round(discountAmount * 100) / 100);

  return { valid: true, code: codeRow, campaign, discountAmount };
}
