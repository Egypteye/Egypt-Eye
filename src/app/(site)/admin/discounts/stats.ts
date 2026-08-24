import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import type { DiscountCampaign } from "@/lib/discounts/types";

export type CampaignStats = {
  campaign: DiscountCampaign;
  codesGenerated: number;
  codesRedeemed: number;
  redemptionRate: number;
  revenueGenerated: number;
  discountValueGiven: number;
};

export async function getCampaignStats(): Promise<CampaignStats[]> {
  if (!supabaseAdminConfigured) return [];
  const supabase = createAdminSupabaseClient();
  const { data: campaigns } = await supabase
    .from("discount_campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  if (!campaigns || campaigns.length === 0) return [];

  const results: CampaignStats[] = [];
  for (const campaign of campaigns as DiscountCampaign[]) {
    const { data: codes } = await supabase.from("discount_codes").select("id, status").eq("campaign_id", campaign.id);
    const codeIds = (codes ?? []).map((c) => c.id);
    const codesGenerated = codeIds.length;
    const codesRedeemed = (codes ?? []).filter((c) => c.status === "redeemed").length;

    let revenueGenerated = 0;
    let discountValueGiven = 0;
    if (codeIds.length > 0) {
      const { data: redemptions } = await supabase
        .from("discount_redemptions")
        .select("reservation_id, discount_amount")
        .in("code_id", codeIds);
      discountValueGiven = (redemptions ?? []).reduce((sum, r) => sum + Number(r.discount_amount), 0);

      const reservationIds = (redemptions ?? []).map((r) => r.reservation_id);
      if (reservationIds.length > 0) {
        const { data: reservations } = await supabase
          .from("reservations")
          .select("total_estimate")
          .in("id", reservationIds);
        revenueGenerated = (reservations ?? []).reduce((sum, r) => sum + (r.total_estimate ?? 0), 0);
      }
    }

    results.push({
      campaign,
      codesGenerated,
      codesRedeemed,
      redemptionRate: codesGenerated > 0 ? Math.round((codesRedeemed / codesGenerated) * 1000) / 10 : 0,
      revenueGenerated,
      discountValueGiven,
    });
  }
  return results;
}
