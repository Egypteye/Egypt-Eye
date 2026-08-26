import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { getCurrentUser } from "@/lib/auth/session";
import { getActiveCampaign, getCampaignTiers, getAttempt } from "@/lib/games/queries";
import { siteUrl } from "@/content/seo";
import { PharaohChallengeClient } from "./PharaohChallengeClient";
import { logVisit } from "./actions";

const CAMPAIGN_SLUG = "pharaohs-challenge";

export const metadata: Metadata = {
  title: "Pharaoh's Challenge — Play & Win",
  description:
    "Five Ancient-Egypt-inspired chambers, one attempt, and a discount reward that grows the deeper you go. Play the Pharaoh's Challenge.",
  alternates: { canonical: `${siteUrl}/pharaoh-challenge` },
};

export default async function PharaohChallengePage() {
  const [campaign, user] = await Promise.all([getActiveCampaign(CAMPAIGN_SLUG), getCurrentUser()]);

  if (!campaign) {
    return (
      <section className="bg-ink py-24">
        <Container className="mx-auto max-w-xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-light/80">Pharaoh&rsquo;s Challenge</p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-cream">This challenge isn&rsquo;t open right now</h1>
          <p className="mt-4 text-cream/70">Check back soon — a new chamber may open before long.</p>
        </Container>
      </section>
    );
  }

  const [tiers, attempt] = await Promise.all([
    getCampaignTiers(campaign.id),
    user ? getAttempt(campaign.id, user.id) : Promise.resolve(null),
  ]);

  // Awaited (not fire-and-forget): an un-awaited promise in a serverless
  // function can be killed once the response is sent, before it ever runs.
  try {
    await logVisit(campaign.id);
  } catch {
    // Analytics failure should never block the page itself.
  }

  return (
    <section className="relative bg-[radial-gradient(ellipse_at_top,_#22331f_0%,_#1b2a20_60%,_#12190f_100%)] py-20 sm:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, #e4c878 0, #e4c878 1px, transparent 1px, transparent 22px)",
        }}
      />
      <Container className="relative">
        <PharaohChallengeClient campaign={campaign} tiers={tiers} initialAttempt={attempt} siteUrl={siteUrl} />
      </Container>
    </section>
  );
}
