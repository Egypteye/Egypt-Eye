import "server-only";

import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

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
  /** Exactly what the query returned, so nothing has to be inferred. */
  raw: { priceUsd: unknown; depositPercent: unknown; bookable: unknown };
  /** True when this row came from an unpublished draft. */
  isDraft: boolean;
  offer: ReturnType<typeof depositOffer>;
  /** What three people would pay, so a per-person rule is visibly per person. */
  forThreeCents: number | null;
  extras: { label: string; priceUsd: number }[];
};

export type DepositDiagnostics = {
  configured: boolean;
  siteDefaultUsd: number | undefined;
  rawSiteDefault: unknown;
  canSeeDrafts: boolean;
  rows: DepositRow[];
};

// Its own client, because the shared one sets useCdn: true.
//
// That matters twice over, and missing it cost an afternoon. `cache: no-store`
// bypasses Next's data cache but not Sanity's CDN, which sits in front of it —
// so a "fresh" read could still be answered from apicdn.sanity.io with a copy
// from before the edit. And the CDN serves PUBLISHED documents only, so an
// edit sitting in the Studio as an unpublished draft is invisible to it
// entirely, which looks exactly like the field never having been filled in.
//
// A token lets this see drafts too. Without one it still reads the live API
// rather than the CDN, which removes the staleness; the draft question is then
// answered by saying so rather than by looking.
const liveClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN,
  perspective: process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN ? "raw" : "published",
});

export const canSeeDrafts = Boolean(
  process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN
);

async function fresh<T>(query: string): Promise<T | null> {
  if (!sanityConfigured) return null;
  try {
    return await liveClient.fetch<T>(query, {}, { cache: "no-store" });
  } catch (err) {
    console.error("fresh Sanity read failed:", err);
    return null;
  }
}

export async function depositDiagnostics(): Promise<DepositDiagnostics> {
  if (!sanityConfigured) {
    return { configured: false, siteDefaultUsd: undefined, rawSiteDefault: undefined, canSeeDrafts, rows: [] };
  }

  const [photoshoots, experiences, settings] = await Promise.all([
    fresh<(QuotableProduct & { _id?: string })[]>(photoshootsQuery),
    fresh<(QuotableProduct & { _id?: string })[]>(experiencesQuery),
    fresh<{ defaultDepositPercent?: number }>(siteSettingsQuery),
  ]);

  const siteDefaultUsd = settings?.defaultDepositPercent;
  const all: { kind: DepositRow["kind"]; product: QuotableProduct & { _id?: string } }[] = [
    ...(photoshoots ?? []).map((product) => ({ kind: "photoshoot" as const, product })),
    ...(experiences ?? []).map((product) => ({ kind: "experience" as const, product })),
  ];

  const rows = all
    .filter(({ product }) => product.bookable === true)
    .map(({ kind, product }) => {
      const three = quoteDeposit(product, kind, { people: 3, extras: [] }, siteDefaultUsd);
      return {
        kind,
        title: product.title,
        slug: product.slug,
        raw: {
          priceUsd: product.price?.amount ?? null,
          depositPercent: product.depositPercent ?? null,
          bookable: product.bookable,
        },
        isDraft: typeof (product as { _id?: string })._id === "string" && (product as { _id: string })._id.startsWith("drafts."),
        offer: depositOffer(product, kind, siteDefaultUsd),
        forThreeCents: three.ok ? three.quote.totalCents : null,
        extras: (product.extras ?? []).map((extra) => ({
          label: extra.label,
          priceUsd: extra.priceUsd,
        })),
      };
    });

  return { configured: true, siteDefaultUsd, rawSiteDefault: settings?.defaultDepositPercent, canSeeDrafts, rows };
}
