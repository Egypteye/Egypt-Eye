"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

function parseSlugList(raw: string): string[] | null {
  const slugs = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return slugs.length > 0 ? slugs : null;
}

export async function createCampaign(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
  if (!name || !slug) return;

  await supabase.from("discount_campaigns").insert({
    name,
    slug,
    discount_type: String(formData.get("discountType") ?? "percentage"),
    value: Number(formData.get("value") ?? 0),
    min_booking_value: formData.get("minBookingValue") ? Number(formData.get("minBookingValue")) : null,
    max_discount_amount: formData.get("maxDiscountAmount") ? Number(formData.get("maxDiscountAmount")) : null,
    one_time_use: formData.get("oneTimeUse") === "on",
    new_customers_only: formData.get("newCustomersOnly") === "on",
    code_validity_days: formData.get("codeValidityDays") ? Number(formData.get("codeValidityDays")) : null,
    active: formData.get("active") === "on",
  });

  revalidatePath("/admin/discounts");
}

export async function updateCampaign(campaignId: string, formData: FormData) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();

  const eligibleTours = parseSlugList(String(formData.get("eligibleTours") ?? ""));
  const excludedTours = parseSlugList(String(formData.get("excludedTours") ?? ""));
  const eligibleExperiences = parseSlugList(String(formData.get("eligibleExperiences") ?? ""));
  const excludedExperiences = parseSlugList(String(formData.get("excludedExperiences") ?? ""));

  await supabase
    .from("discount_campaigns")
    .update({
      discount_type: String(formData.get("discountType") ?? "percentage"),
      value: Number(formData.get("value") ?? 0),
      min_booking_value: formData.get("minBookingValue") ? Number(formData.get("minBookingValue")) : null,
      max_discount_amount: formData.get("maxDiscountAmount") ? Number(formData.get("maxDiscountAmount")) : null,
      one_time_use: formData.get("oneTimeUse") === "on",
      new_customers_only: formData.get("newCustomersOnly") === "on",
      code_validity_days: formData.get("codeValidityDays") ? Number(formData.get("codeValidityDays")) : null,
      ends_at: formData.get("endsAt") ? new Date(String(formData.get("endsAt"))).toISOString() : null,
      eligible_tour_slugs: eligibleTours,
      excluded_tour_slugs: excludedTours,
      eligible_experience_slugs: eligibleExperiences,
      excluded_experience_slugs: excludedExperiences,
      updated_at: new Date().toISOString(),
    })
    .eq("id", campaignId);

  revalidatePath("/admin/discounts");
}

export async function toggleCampaignActive(campaignId: string, active: boolean) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  await supabase.from("discount_campaigns").update({ active, updated_at: new Date().toISOString() }).eq("id", campaignId);
  revalidatePath("/admin/discounts");
}
