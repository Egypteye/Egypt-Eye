import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { getCurrentUser } from "@/lib/auth/session";
import { getActiveCampaign, getCampaignTiers, getAttempt } from "@/lib/games/queries";
import { siteUrl } from "@/content/seo";
import { PharaohChallengeClient } from "./PharaohChallengeClient";
import { logVisit } from "./actions";

const CAMPAIGN_SLUG = "pharaohs-challenge";

const PAGE_TITLE = "Pharaoh's Challenge — Play & Win | Egypt Eye";
const PAGE_DESCRIPTION =
  "Five Ancient-Egypt-inspired chambers, one attempt, and a discount reward that grows the deeper you go. Play the Pharaoh's Challenge.";
const PAGE_URL = `${siteUrl}/pharaoh-challenge`;
// Explicit page-level openGraph/twitter blocks (rather than relying on
// inheriting the root layout's generic ones) — this is what lets Facebook's
// sharer.php and other link-preview crawlers render a card for this page at
// all; without it, a crawler that can't find any og:* tags on the page shows
// nothing, which is why sharing previously looked like it "did nothing."
// Auth-gated: this segment reads the signed-in user server-side, so it must
// never be statically prerendered. Declared explicitly rather than inferred
// from cookie access, so a build missing the Supabase env vars fails loudly
// instead of silently shipping a cached logged-out page.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    images: [{ url: `${siteUrl}/brand/egypt-eye-badge-gold.png`, width: 1200, height: 1200, alt: "Egypt Eye" }],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [`${siteUrl}/brand/egypt-eye-badge-gold.png`],
  },
};

export default async function PharaohChallengePage() {
  const [campaign, user] = await Promise.all([getActiveCampaign(CAMPAIGN_SLUG), getCurrentUser()]);

  if (!campaign) {
    return (
      <section className="bg-ink py-24">
        <Container className="mx-auto max-w-xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light/80">Pharaoh&rsquo;s Challenge</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-cream">This challenge isn&rsquo;t open right now</h1>
          <p className="mt-4 text-lg text-cream/70">Check back soon — a new chamber may open before long.</p>
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
