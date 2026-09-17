import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/auth/session";
import { NotConfiguredNotice } from "../NotConfiguredNotice";
import { getPharaohChallengeStats } from "./stats";
import { toggleCampaignActive, updateCampaign, updateTier } from "./actions";
import type { GameCampaign, GameTier } from "@/lib/games/types";

export const metadata = { title: "Pharaoh's Challenge", robots: { index: false, follow: false } };

type TierWithReward = GameTier & { reward: { name: string; value: number } | null };

export default async function AdminPharaohChallengePage() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") redirect("/admin/reservations");
  if (!supabaseAdminConfigured) return <NotConfiguredNotice />;

  const supabase = createAdminSupabaseClient();
  const { data: campaign } = await supabase
    .from("game_campaigns")
    .select("*")
    .eq("slug", "pharaohs-challenge")
    .maybeSingle<GameCampaign>();

  if (!campaign) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Pharaoh&rsquo;s Challenge</h1>
        <p className="mt-3 text-sm text-ink-soft/60">
          The campaign hasn&rsquo;t been seeded yet — run migration 0014_pharaoh_challenge.sql.
        </p>
      </div>
    );
  }

  const [{ data: tiers }, stats] = await Promise.all([
    supabase.from("game_tiers").select("*").eq("campaign_id", campaign.id).order("tier_number", { ascending: true }),
    getPharaohChallengeStats(campaign.id),
  ]);

  const rewardIds = (tiers ?? []).map((t) => t.reward_discount_campaign_id).filter((id): id is string => Boolean(id));
  const { data: rewardCampaigns } =
    rewardIds.length > 0 ? await supabase.from("discount_campaigns").select("id, name, value").in("id", rewardIds) : { data: [] };
  const rewardById = new Map((rewardCampaigns ?? []).map((r) => [r.id, r]));

  const typedTiers: TierWithReward[] = (tiers ?? []).map((t) => ({
    ...(t as GameTier),
    reward: t.reward_discount_campaign_id ? (rewardById.get(t.reward_discount_campaign_id) ?? null) : null,
  }));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Pharaoh&rsquo;s Challenge</h1>
          <p className="mt-1 text-sm text-ink-soft/60">
            Rewards are edited from{" "}
            <Link href="/admin/discounts" className="font-semibold text-gold-dark hover:underline">
              Discount Campaigns
            </Link>{" "}
            — each tier below just points at one.
          </p>
        </div>
        <form action={toggleCampaignActive.bind(null, campaign.id, !campaign.active)}>
          <button
            type="submit"
            className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
              campaign.active ? "bg-nile/10 text-nile" : "bg-black/5 text-ink-soft/60"
            }`}
          >
            {campaign.active ? "Active — click to pause" : "Paused — click to activate"}
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-black/5 bg-cream p-6 shadow-sm">
        <p className="font-display text-lg font-semibold text-ink">Performance</p>
        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-black/5 pt-5 sm:grid-cols-4">
          <Stat label="Visitors" value={stats.visitors} />
          <Stat label="Challenges Started" value={stats.starts} />
          <Stat label="Rewards Issued" value={stats.rewardsIssued} />
          <Stat label="Shares" value={stats.shares} />
        </dl>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-black/5 text-xs uppercase tracking-wide text-ink-soft/50">
              <tr>
                <th className="py-2 pr-4">Chamber</th>
                <th className="py-2 pr-4">Cleared</th>
                <th className="py-2 pr-4">Drop-off Arriving Here</th>
              </tr>
            </thead>
            <tbody>
              {stats.tiers.map((t) => (
                <tr key={t.tierNumber} className="border-b border-black/5 last:border-0">
                  <td className="py-2 pr-4 font-medium text-ink">
                    {t.tierNumber}. {t.name}
                  </td>
                  <td className="py-2 pr-4 text-ink-soft/70">{t.completions}</td>
                  <td className="py-2 pr-4 text-ink-soft/70">{t.dropOffFromPrevious}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <details className="rounded-2xl border border-black/5 bg-cream p-6 shadow-sm">
        <summary className="cursor-pointer font-display text-lg font-semibold text-ink">Campaign copy &amp; dates</summary>
        <form action={updateCampaign.bind(null, campaign.id)} className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input name="name" defaultValue={campaign.name} className={inputClass} />
          </Field>
          <Field label="Theme">
            <input name="theme" defaultValue={campaign.theme} className={inputClass} />
          </Field>
          <Field label="Ends at">
            <input name="endsAt" type="date" defaultValue={campaign.ends_at?.slice(0, 10) ?? ""} className={inputClass} />
          </Field>
          <div />
          <Field label="Intro (shown before the player begins)">
            <textarea name="storyIntro" defaultValue={campaign.story_intro} rows={3} className={inputClass} />
          </Field>
          <Field label="Outro (shown on the achievement screen)">
            <textarea name="storyOutro" defaultValue={campaign.story_outro} rows={3} className={inputClass} />
          </Field>
          <button type="submit" className="self-start rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-gold-dark sm:col-span-2">
            Save
          </button>
        </form>
      </details>

      <div className="flex flex-col gap-4">
        {typedTiers.map((tier) => (
          <details key={tier.id} className="rounded-2xl border border-black/5 bg-cream p-6 shadow-sm">
            <summary className="cursor-pointer font-display text-lg font-semibold text-ink">
              Chamber {tier.tier_number} — {tier.name}
              {tier.reward && <span className="ml-3 text-sm font-normal text-gold-dark">{tier.reward.value}% reward</span>}
            </summary>
            <form action={updateTier.bind(null, tier.id)} className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Name">
                <input name="name" defaultValue={tier.name} className={inputClass} />
              </Field>
              <Field label="Puzzle type (fixed — matches a built component)">
                <input value={tier.puzzle_type} disabled className={`${inputClass} opacity-60`} />
              </Field>
              <Field label="Flavor text">
                <textarea name="flavorText" defaultValue={tier.flavor_text} rows={2} className={inputClass} />
              </Field>
              <Field label="Puzzle config (JSON — tolerance, sequence length, etc.)">
                <textarea name="config" defaultValue={JSON.stringify(tier.config)} rows={2} className={`${inputClass} font-mono text-xs`} />
              </Field>
              <button type="submit" className="self-start rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-gold-dark sm:col-span-2">
                Save Chamber
              </button>
            </form>
          </details>
        ))}
      </div>
    </div>
  );
}

const inputClass = "rounded-lg border border-black/10 bg-sand px-3 py-2 text-sm text-ink outline-none focus:border-gold w-full";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-semibold text-ink-soft/70">
      {label}
      {children}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-lg font-bold text-ink">{value}</p>
      <p className="text-xs text-ink-soft/50">{label}</p>
    </div>
  );
}
