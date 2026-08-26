import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";

export type TierStats = {
  tierNumber: number;
  name: string;
  completions: number;
  dropOffFromPrevious: number; // count of players who reached the previous tier but not this one
};

export type CampaignStats = {
  visitors: number;
  starts: number;
  rewardsIssued: number;
  shares: number;
  tiers: TierStats[];
};

const EMPTY: CampaignStats = { visitors: 0, starts: 0, rewardsIssued: 0, shares: 0, tiers: [] };

export async function getPharaohChallengeStats(campaignId: string): Promise<CampaignStats> {
  if (!supabaseAdminConfigured) return EMPTY;
  const supabase = createAdminSupabaseClient();

  const [{ data: events }, { data: tiers }, { data: attempts }] = await Promise.all([
    supabase.from("game_events").select("event_type").eq("campaign_id", campaignId),
    supabase.from("game_tiers").select("tier_number, name").eq("campaign_id", campaignId).order("tier_number", { ascending: true }),
    supabase.from("game_attempts").select("id").eq("campaign_id", campaignId),
  ]);

  const attemptIds = (attempts ?? []).map((a) => a.id);
  const { data: completions } =
    attemptIds.length > 0
      ? await supabase.from("game_tier_completions").select("tier_number, attempt_id").in("attempt_id", attemptIds)
      : { data: [] as { tier_number: number; attempt_id: string }[] };

  const visitors = (events ?? []).filter((e) => e.event_type === "visit").length;
  const starts = (events ?? []).filter((e) => e.event_type === "start").length;
  const rewardsIssued = (events ?? []).filter((e) => e.event_type === "reward_issued").length;
  const shares = (events ?? []).filter((e) => e.event_type === "share").length;
  const totalAttempts = attemptIds.length;

  const completionsByTier = new Map<number, number>();
  for (const c of completions ?? []) {
    completionsByTier.set(c.tier_number, (completionsByTier.get(c.tier_number) ?? 0) + 1);
  }

  const tierStats: TierStats[] = (tiers ?? []).map((t, i) => {
    const reachedPrevious = i === 0 ? totalAttempts : (completionsByTier.get(tiers![i - 1].tier_number) ?? 0);
    const completedThis = completionsByTier.get(t.tier_number) ?? 0;
    return {
      tierNumber: t.tier_number,
      name: t.name,
      completions: completedThis,
      dropOffFromPrevious: Math.max(0, reachedPrevious - completedThis),
    };
  });

  return { visitors, starts, rewardsIssued, shares, tiers: tierStats };
}
