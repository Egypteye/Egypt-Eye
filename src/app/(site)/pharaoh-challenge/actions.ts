"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { mintDiscountCode } from "@/lib/discounts/mint";
import { checkRateLimit } from "@/lib/rateLimit";
import { headers } from "next/headers";
import type { GameAttempt, GameTier } from "@/lib/games/types";

// Server Actions don't receive a NextRequest (that's route-handler-only), so
// this reads the same forwarded-for header directly via next/headers rather
// than reusing src/lib/rateLimit.ts's getClientIp(request), which expects one.
async function clientIpFromHeaders(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

const PAGE_PATH = "/pharaoh-challenge";

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect(`/account/login?next=${PAGE_PATH}`);
  return user;
}

async function logEvent(
  campaignId: string,
  eventType: "visit" | "start" | "tier_complete" | "reward_issued" | "share" | "claim",
  opts: { customerId?: string | null; tierNumber?: number; metadata?: Record<string, unknown> } = {}
) {
  const supabase = createAdminSupabaseClient();
  await supabase.from("game_events").insert({
    campaign_id: campaignId,
    customer_id: opts.customerId ?? null,
    event_type: eventType,
    tier_number: opts.tierNumber ?? null,
    metadata: opts.metadata ?? {},
  });
}

// Creates the player's one and only attempt row, if it doesn't already
// exist. The unique (campaign_id, customer_id) constraint is the real
// guarantee here — insert-then-reread means a second call (new tab,
// refresh, cleared storage, whatever) always lands on the same row rather
// than creating a fresh one.
export async function startAttempt(campaignId: string): Promise<GameAttempt> {
  const user = await requireUser();
  const supabase = createAdminSupabaseClient();

  const ip = await clientIpFromHeaders();
  const { allowed } = await checkRateLimit({ bucket: "pharaoh-start", key: ip, max: 20, windowSeconds: 3600 });
  if (!allowed) throw new Error("Too many attempts. Please try again shortly.");

  await supabase
    .from("game_attempts")
    .insert({ campaign_id: campaignId, customer_id: user.id })
    .select("id")
    .maybeSingle();
  // Ignore the result/error here (23505 = unique_violation means an attempt
  // already existed, which is exactly the desired outcome) and re-read
  // below so both the "just created" and "already existed" paths return
  // the same, single source of truth.

  const { data: attempt } = await supabase
    .from("game_attempts")
    .select("*")
    .eq("campaign_id", campaignId)
    .eq("customer_id", user.id)
    .single<GameAttempt>();
  if (!attempt) throw new Error("Couldn't start the challenge. Please try again.");

  await logEvent(campaignId, "start", { customerId: user.id });
  revalidatePath(PAGE_PATH);
  return attempt;
}

// Advances the attempt by exactly one tier — only if the caller is actually
// on that tier. This isn't full puzzle-solution verification (there's no
// hidden answer to protect: every puzzle's target state is visible on
// screen as part of play), just a guard against a crafted request skipping
// straight to a later tier.
export async function completeTier(campaignId: string, tierNumber: number, durationMs?: number): Promise<GameAttempt> {
  const user = await requireUser();
  const supabase = createAdminSupabaseClient();

  const { data: attempt } = await supabase
    .from("game_attempts")
    .select("*")
    .eq("campaign_id", campaignId)
    .eq("customer_id", user.id)
    .single<GameAttempt>();
  if (!attempt) throw new Error("No active challenge attempt found.");
  if (attempt.status !== "in_progress") return attempt;
  if (tierNumber !== attempt.current_tier) return attempt; // already past this tier, or not there yet

  await supabase
    .from("game_tier_completions")
    .insert({ attempt_id: attempt.id, tier_number: tierNumber, duration_ms: durationMs ?? null })
    .select("id")
    .maybeSingle();

  const nextTier = tierNumber + 1;
  const { data: updated } = await supabase
    .from("game_attempts")
    .update({
      current_tier: Math.min(nextTier, 5),
      highest_tier_completed: Math.max(attempt.highest_tier_completed, tierNumber),
    })
    .eq("id", attempt.id)
    .select("*")
    .single<GameAttempt>();

  await logEvent(campaignId, "tier_complete", { customerId: user.id, tierNumber });
  revalidatePath(PAGE_PATH);
  return updated ?? attempt;
}

// Ends the attempt and mints exactly one discount code, sized to the
// highest tier actually cleared — idempotent (safe to call more than once;
// mintDiscountCode itself returns the existing code rather than a second one).
export async function claimReward(campaignId: string) {
  const user = await requireUser();
  const supabase = createAdminSupabaseClient();

  const { data: attempt } = await supabase
    .from("game_attempts")
    .select("*")
    .eq("campaign_id", campaignId)
    .eq("customer_id", user.id)
    .single<GameAttempt>();
  if (!attempt) throw new Error("No active challenge attempt found.");
  if (attempt.highest_tier_completed < 1) throw new Error("Clear at least one chamber before claiming a reward.");

  if (attempt.status === "completed" && attempt.discount_code_id) {
    const { data: code } = await supabase
      .from("discount_codes")
      .select("code, campaign_id")
      .eq("id", attempt.discount_code_id)
      .single();
    return { code: code?.code ?? null };
  }

  const { data: tier } = await supabase
    .from("game_tiers")
    .select("*")
    .eq("campaign_id", campaignId)
    .eq("tier_number", attempt.highest_tier_completed)
    .single<GameTier>();
  if (!tier?.reward_discount_campaign_id) throw new Error("This tier has no reward configured yet.");

  const { data: rewardCampaign } = await supabase
    .from("discount_campaigns")
    .select("slug")
    .eq("id", tier.reward_discount_campaign_id)
    .single();
  if (!rewardCampaign) throw new Error("This tier's reward campaign is missing.");

  const minted = await mintDiscountCode({ campaignSlug: rewardCampaign.slug, customerId: user.id });
  if (!minted) throw new Error("Couldn't issue your reward. Please try again shortly.");

  await supabase
    .from("game_attempts")
    .update({ status: "completed", completed_at: new Date().toISOString(), discount_code_id: minted.id })
    .eq("id", attempt.id);

  await logEvent(campaignId, "reward_issued", { customerId: user.id, tierNumber: attempt.highest_tier_completed });
  await logEvent(campaignId, "claim", { customerId: user.id, tierNumber: attempt.highest_tier_completed });
  revalidatePath(PAGE_PATH);
  revalidatePath("/account");
  return { code: minted.code };
}

export async function logShare(campaignId: string, channel: string) {
  const user = await getCurrentUser();
  await logEvent(campaignId, "share", { customerId: user?.id ?? null, metadata: { channel } });
}

export async function logVisit(campaignId: string) {
  const user = await getCurrentUser();
  await logEvent(campaignId, "visit", { customerId: user?.id ?? null });
}
