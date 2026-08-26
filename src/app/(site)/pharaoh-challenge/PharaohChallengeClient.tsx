"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { PuzzleFrame } from "./PuzzleFrame";
import { PUZZLE_REGISTRY } from "./puzzles";
import { ShareAchievement } from "./ShareAchievement";
import { startAttempt, completeTier, claimReward } from "./actions";
import type { GameAttempt, GameCampaign, GameTier } from "@/lib/games/types";

type Phase = "intro" | "playing" | "cleared" | "achievement";

const REWARD_VALUES: Record<number, number> = { 1: 2, 2: 4, 3: 6, 4: 8, 5: 10 };

export function PharaohChallengeClient({
  campaign,
  tiers,
  initialAttempt,
  siteUrl,
}: {
  campaign: GameCampaign;
  tiers: GameTier[];
  initialAttempt: GameAttempt | null;
  siteUrl: string;
}) {
  const [attempt, setAttempt] = useState(initialAttempt);
  const [phase, setPhase] = useState<Phase>(() => {
    if (initialAttempt?.status === "completed") return "achievement";
    if (initialAttempt) return "playing";
    return "intro";
  });
  const [rewardCode, setRewardCode] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [tierStartedAt, setTierStartedAt] = useState<number>(() => Date.now());

  const currentTier = useMemo(
    () => tiers.find((t) => t.tier_number === (attempt?.current_tier ?? 1)),
    [tiers, attempt]
  );
  const clearedTier = useMemo(
    () => tiers.find((t) => t.tier_number === (attempt?.highest_tier_completed ?? 0)),
    [tiers, attempt]
  );

  function handleBegin() {
    setError(null);
    startTransition(async () => {
      try {
        const updated = await startAttempt(campaign.id);
        setAttempt(updated);
        setTierStartedAt(Date.now());
        setPhase("playing");
      } catch {
        setError("Couldn't start the challenge. Please try again.");
      }
    });
  }

  function handleSolved() {
    if (!currentTier) return;
    const duration = Date.now() - tierStartedAt;
    startTransition(async () => {
      try {
        const updated = await completeTier(campaign.id, currentTier.tier_number, duration);
        setAttempt(updated);
        setPhase("cleared");
      } catch {
        setError("Something went wrong saving your progress. Please try again.");
      }
    });
  }

  function handleContinue() {
    setTierStartedAt(Date.now());
    setPhase("playing");
  }

  function handleClaim() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await claimReward(campaign.id);
        setRewardCode(result.code ?? null);
        setAttempt((prev) => (prev ? { ...prev, status: "completed" } : prev));
        setPhase("achievement");
      } catch {
        setError("Couldn't issue your reward. Please try again.");
      }
    });
  }

  const shareUrl = `${siteUrl}/pharaoh-challenge`;

  return (
    <div className="mx-auto max-w-xl">
      {error && (
        <p className="mb-6 rounded-xl border border-terracotta/30 bg-terracotta/10 px-4 py-3 text-center text-base text-terracotta">
          {error}
        </p>
      )}

      {phase === "intro" && (
        <div className="flex flex-col items-center gap-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light/80">{campaign.theme}</p>
          <h1 className="font-display text-4xl font-semibold text-cream sm:text-5xl">{campaign.name}</h1>
          <p className="max-w-md text-lg text-cream/70">{campaign.story_intro}</p>
          <p className="text-sm text-cream/40">
            One attempt per account. Sign in to begin — your progress is saved as you go.
          </p>
          <button
            type="button"
            onClick={handleBegin}
            disabled={pending}
            className="rounded-full bg-gold px-8 py-3.5 text-base font-semibold text-ink transition hover:bg-gold-light disabled:opacity-60"
          >
            {pending ? "Opening the way…" : "Begin the Challenge"}
          </button>
        </div>
      )}

      {phase === "playing" && currentTier && (() => {
        const Puzzle = PUZZLE_REGISTRY[currentTier.puzzle_type];
        return (
          <PuzzleFrame tierNumber={currentTier.tier_number} name={currentTier.name} flavorText={currentTier.flavor_text}>
            <Puzzle key={currentTier.id} config={currentTier.config} onSolved={handleSolved} />
          </PuzzleFrame>
        );
      })()}

      {phase === "cleared" && clearedTier && attempt && (
        <div className="flex flex-col items-center gap-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light/80">Chamber Cleared</p>
          <h2 className="font-display text-3xl font-semibold text-cream sm:text-4xl">{clearedTier.name}</h2>
          <p className="max-w-sm text-lg text-cream/70">
            You&rsquo;ve secured a {REWARD_VALUES[clearedTier.tier_number]}% reward. Continue deeper for a better one,
            or stop here and claim what you&rsquo;ve won.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {attempt.current_tier <= 5 && attempt.highest_tier_completed < 5 && (
              <button
                type="button"
                onClick={handleContinue}
                className="rounded-full bg-gold px-7 py-3 text-base font-semibold text-ink transition hover:bg-gold-light"
              >
                Continue to Chamber {attempt.current_tier}
              </button>
            )}
            <button
              type="button"
              onClick={handleClaim}
              disabled={pending}
              className="rounded-full border border-cream/25 px-7 py-3 text-base font-semibold text-cream/80 transition hover:bg-cream/10 disabled:opacity-60"
            >
              {pending ? "Sealing your reward…" : `Claim My ${REWARD_VALUES[clearedTier.tier_number]}% & Stop Here`}
            </button>
          </div>
        </div>
      )}

      {phase === "achievement" && (
        <div className="flex flex-col items-center gap-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/egypt-eye-mark-gold.png"
            alt=""
            className="h-16 w-16 drop-shadow-[0_0_25px_rgba(228,200,120,0.7)]"
          />
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light/80">The Threshold Opens</p>
          <h2 className="font-display text-3xl font-semibold text-cream sm:text-4xl">{campaign.story_outro}</h2>
          {rewardCode ? (
            <div className="rounded-2xl border border-gold/30 bg-cream/5 px-6 py-5">
              <p className="text-base text-cream/60">Your reward code</p>
              <p className="mt-1 font-mono text-2xl font-bold tracking-wide text-gold-light">{rewardCode}</p>
            </div>
          ) : (
            <p className="text-lg text-cream/70">Your reward is saved to your account.</p>
          )}
          <ShareAchievement
            campaignId={campaign.id}
            campaignName={campaign.name}
            tierName={clearedTier?.name ?? campaign.name}
            rewardPercent={REWARD_VALUES[attempt?.highest_tier_completed ?? 0] ?? 0}
            shareUrl={shareUrl}
            shareText="I just made it through the Pharaoh's Challenge at Egypt Eye 𓁿 — try it yourself:"
          />
          <Link href="/account" className="text-base font-semibold text-gold-light underline underline-offset-4">
            View my reward in My Account
          </Link>
        </div>
      )}
    </div>
  );
}
