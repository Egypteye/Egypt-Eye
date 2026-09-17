"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const PATH = "/admin/pharaoh-challenge";

export async function toggleCampaignActive(campaignId: string, active: boolean) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  await supabase.from("game_campaigns").update({ active, updated_at: new Date().toISOString() }).eq("id", campaignId);
  revalidatePath(PATH);
  revalidatePath("/pharaoh-challenge");
}

export async function updateCampaign(campaignId: string, formData: FormData) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();

  await supabase
    .from("game_campaigns")
    .update({
      name: String(formData.get("name") ?? "").trim(),
      theme: String(formData.get("theme") ?? "").trim(),
      story_intro: String(formData.get("storyIntro") ?? "").trim(),
      story_outro: String(formData.get("storyOutro") ?? "").trim(),
      ends_at: formData.get("endsAt") ? new Date(String(formData.get("endsAt"))).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", campaignId);

  revalidatePath(PATH);
  revalidatePath("/pharaoh-challenge");
}

export async function updateTier(tierId: string, formData: FormData) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();

  const configRaw = String(formData.get("config") ?? "").trim();
  let config: Record<string, unknown> | undefined;
  if (configRaw) {
    try {
      config = JSON.parse(configRaw);
    } catch {
      return; // invalid JSON — silently ignore rather than corrupt the tier's config
    }
  }

  await supabase
    .from("game_tiers")
    .update({
      name: String(formData.get("name") ?? "").trim(),
      flavor_text: String(formData.get("flavorText") ?? "").trim(),
      ...(config ? { config } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", tierId);

  revalidatePath(PATH);
  revalidatePath("/pharaoh-challenge");
}
