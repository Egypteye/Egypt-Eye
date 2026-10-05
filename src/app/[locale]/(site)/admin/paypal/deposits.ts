import "server-only";

import { client } from "@/sanity/client";

// Mirrors the private check in sanity/fetchers.ts rather than importing it,
// because that module's own fetches are the cached ones this file exists to
// bypass.
const sanityConfigured = Boolean(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "placeholder0"
);
import { photoshootsQuery, experiencesQuery, siteSettingsQuery } from "@/sanity/queries";
import { depositOffer, quoteDeposit, type QuotableProduct } from "@/lib/booking/quote";

// What the Studio says about deposits, read fresh every time.
//
// This exists because the diagnostic page lied. Every Sanity read on this site
// goes through safeFetch, which caches for an hour, and Next's data cache on
// Vercel survives a redeploy — so somebody could set a deposit, publish,
// redeploy, open this page and be told confidently that no deposit was set.
// A page whose entire job is to say what the Studio currently contains cannot
// read a cached copy of what it contained an hour ago.
//
// So this one query bypasses the cache. It is the only place in the codebase
// that does, and the cost is one Sanity round trip on an admin page nobody but
// staff opens — which is the right trade for a tool whose only value is being
// right.

export type DepositRow = {
  kind: "photoshoot" | "experience";
  title: string;
  slug: string;
  offer: ReturnType<typeof depositOffer>;
  /** What three people would pay, so a per-person rule is visibly per person. */
  forThreeCents: number | null;
  extras: { label: string; depositUsd?: number; depositBasis?: string }[];
};

export type DepositDiagnostics = {
  configured: boolean;
  siteDefaultUsd: number | undefined;
  rows: DepositRow[];
};

async function fresh<T>(query: string): Promise<T | null> {
  if (!sanityConfigured) return null;
  try {
    // no-store, deliberately. See the note above.
    return await client.fetch<T>(query, {}, { cache: "no-store" });
  } catch (err) {
    console.error("fresh Sanity read failed:", err);
    return null;
  }
}

export async function depositDiagnostics(): Promise<DepositDiagnostics> {
  if (!sanityConfigured) return { configured: false, siteDefaultUsd: undefined, rows: [] };

  const [photoshoots, experiences, settings] = await Promise.all([
    fresh<QuotableProduct[]>(photoshootsQuery),
    fresh<QuotableProduct[]>(experiencesQuery),
    fresh<{ defaultDepositUsd?: number }>(siteSettingsQuery),
  ]);

  const siteDefaultUsd = settings?.defaultDepositUsd;
  const all: { kind: DepositRow["kind"]; product: QuotableProduct }[] = [
    ...(photoshoots ?? []).map((product) => ({ kind: "photoshoot" as const, product })),
    ...(experiences ?? []).map((product) => ({ kind: "experience" as const, product })),
  ];

  const rows = all
    .filter(({ product }) => product.bookable === true)
    .map(({ kind, product }) => {
      const three = quoteDeposit(product, kind, { people: 3, extraLabels: [] }, siteDefaultUsd);
      return {
        kind,
        title: product.title,
        slug: product.slug,
        offer: depositOffer(product, kind, siteDefaultUsd),
        forThreeCents: three.ok ? three.quote.totalCents : null,
        extras: (product.extras ?? []).map((extra) => ({
          label: extra.label,
          depositUsd: extra.depositUsd,
          depositBasis: extra.depositBasis,
        })),
      };
    });

  return { configured: true, siteDefaultUsd, rows };
}
