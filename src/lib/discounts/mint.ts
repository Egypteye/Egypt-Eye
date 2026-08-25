import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { generateDiscountCode } from "./codes";
import type { DiscountCampaign, DiscountCodeRow } from "./types";

// Mints one unique discount code for a newsletter subscriber or a customer
// account against a given campaign — server-only (uses the service-role
// client, since "does this person get a code" is a business rule that must
// never be decided by the browser). Idempotent: calling this again for the
// same owner + campaign returns their existing code instead of a second one.
export async function mintDiscountCode({
  campaignSlug,
  customerId,
  subscriberId,
}: {
  campaignSlug: string;
  customerId?: string;
  subscriberId?: string;
}): Promise<DiscountCodeRow | null> {
  if (!customerId && !subscriberId) return null;
  const supabase = createAdminSupabaseClient();

  const { data: campaign } = await supabase
    .from("discount_campaigns")
    .select("*")
    .eq("slug", campaignSlug)
    .eq("active", true)
    .maybeSingle<DiscountCampaign>();
  if (!campaign) return null;

  let existingQuery = supabase.from("discount_codes").select("*").eq("campaign_id", campaign.id);
  existingQuery = subscriberId ? existingQuery.eq("subscriber_id", subscriberId) : existingQuery.eq("customer_id", customerId!);
  const { data: existing } = await existingQuery.maybeSingle<DiscountCodeRow>();
  if (existing) {
    // A code minted while this person was only a newsletter subscriber
    // (no account yet, or not yet linked) — now that we know their
    // customer_id, attach it so the code shows up in their My Account page
    // instead of staying orphaned to just the subscriber row.
    if (customerId && !existing.customer_id) {
      const { data: linked } = await supabase
        .from("discount_codes")
        .update({ customer_id: customerId })
        .eq("id", existing.id)
        .select("*")
        .single<DiscountCodeRow>();
      return linked ?? existing;
    }
    return existing;
  }

  const expiresAt = campaign.code_validity_days
    ? new Date(Date.now() + campaign.code_validity_days * 86_400_000).toISOString()
    : null;

  // Collisions are astronomically unlikely (6 chars from a 33-char alphabet
  // = ~1.3 billion combinations) but the unique constraint is the real
  // guarantee — retry on the rare conflict rather than trusting randomness alone.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateDiscountCode();
    const { data, error } = await supabase
      .from("discount_codes")
      .insert({
        code,
        campaign_id: campaign.id,
        customer_id: customerId ?? null,
        subscriber_id: subscriberId ?? null,
        expires_at: expiresAt,
      })
      .select("*")
      .single<DiscountCodeRow>();

    if (!error && data) return data;
    if (error && error.code !== "23505") throw error; // 23505 = unique_violation
  }
  return null;
}
