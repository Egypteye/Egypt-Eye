import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import type { GameAttempt, GameCampaign, GameTier } from "./types";

// Public reads (game_campaigns/game_tiers have an RLS "select using (true)"
// policy — same reasoning as the hotels catalog) via the regular
// session-aware client, so game_attempts' "select own" RLS policy also
// applies correctly when a signed-in visitor's attempt is fetched below.

export async function getActiveCampaign(slug: string): Promise<GameCampaign | null> {
  if (!supabaseConfigured) return null;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("game_campaigns")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle<GameCampaign>();
  if (!data) return null;

  const now = new Date();
  if (new Date(data.starts_at) > now) return null;
  if (data.ends_at && new Date(data.ends_at) < now) return null;
  return data;
}

export async function getCampaignTiers(campaignId: string): Promise<GameTier[]> {
  if (!supabaseConfigured) return [];
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("game_tiers")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("tier_number", { ascending: true });
  return (data ?? []) as GameTier[];
}

export async function getAttempt(campaignId: string, customerId: string): Promise<GameAttempt | null> {
  if (!supabaseConfigured) return null;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("game_attempts")
    .select("*")
    .eq("campaign_id", campaignId)
    .eq("customer_id", customerId)
    .maybeSingle<GameAttempt>();
  return data;
}
