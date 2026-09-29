import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadReviewData } from "@/lib/reviewData";
import { ProductReviewsView } from "../../../../ProductReviewsView";
import {
  findReviewGroup,
  isReviewSubjectType,
  parseReviewPage,
  productReviewsPagePath,
  reviewPageCount,
} from "@/lib/reviewPages";
import { getLocale } from "@/i18n/dictionary";
import { tr } from "@/i18n/T";
import { t } from "@/i18n/format";
import { alternatesFor } from "@/i18n/alternates";

// Pages two and up. Page one lives at the bare product path and is never
// reachable here: `parseReviewPage` rejects "1" along with "01", "2.0" and
// anything else that would render the same reviews at a second address.

type Params = { type: string; slug: string; n: string };

export async function generateStaticParams() {
  const { groups } = await loadReviewData();
  return groups.flatMap((g) => {
    const last = reviewPageCount(g.entries.length);
    return Array.from({ length: Math.max(0, last - 1) }, (_, i) => ({
      type: g.subject.type,
      slug: g.subject.slug,
      n: String(i + 2),
    }));
  });
}

async function resolve({ type, slug, n }: Params) {
  const page = parseReviewPage(n);
  if (page === null || !isReviewSubjectType(type)) return undefined;
  const { groups } = await loadReviewData();
  const group = findReviewGroup(groups, type, slug);
  if (!group || page > reviewPageCount(group.entries.length)) return undefined;
  return { group, page };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const found = await resolve(await params);
  if (!found) return {};
  const { group, page } = found;
  const locale = await getLocale();
  const title = t(await tr("{product} — traveller reviews, page {page}"), {
    product: group.subject.title,
    page,
  });
  return {
    title,
    description: t(await tr("More of what travellers wrote about {product}, in their own words."), {
      product: group.subject.title,
    }),
    alternates: alternatesFor(productReviewsPagePath(group.subject, page), locale),
  };
}

export default async function ProductReviewsPageRoute({ params }: { params: Promise<Params> }) {
  const found = await resolve(await params);
  if (!found) notFound();
  return <ProductReviewsView group={found.group} page={found.page} />;
}
