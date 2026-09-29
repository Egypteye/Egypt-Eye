import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadReviewData } from "@/lib/reviewData";
import { ProductReviewsView } from "../../ProductReviewsView";
import { findReviewGroup, isReviewSubjectType, productReviewsPath } from "@/lib/reviewPages";
import { getLocale } from "@/i18n/dictionary";
import { tr } from "@/i18n/T";
import { t } from "@/i18n/format";
import { alternatesFor } from "@/i18n/alternates";

// Page one of a product's reviews, at the bare product path.
//
// Only products that actually have reviews get a page. Generating one for
// every tour in the catalogue would mean fifty addresses promising reviews of
// something nobody has reviewed yet — worse than having no address at all,
// and exactly the thin-page pattern the old hash anchors already caused.

type Params = { type: string; slug: string };

export async function generateStaticParams() {
  const { groups } = await loadReviewData();
  return groups.map((g) => ({ type: g.subject.type, slug: g.subject.slug }));
}

async function resolve({ type, slug }: Params) {
  if (!isReviewSubjectType(type)) return undefined;
  const { groups } = await loadReviewData();
  return findReviewGroup(groups, type, slug);
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const group = await resolve(await params);
  if (!group) return {};
  const locale = await getLocale();
  const title = t(await tr("{product} — traveller reviews"), { product: group.subject.title });
  const description = t(await tr("What {count} travellers wrote about {product}, in their own words, with every review linked to where it was written."), {
    count: group.entries.length.toLocaleString("en-US"),
    product: group.subject.title,
  });
  return { title, description, alternates: alternatesFor(productReviewsPath(group.subject), locale) };
}

export default async function ProductReviewsRoute({ params }: { params: Promise<Params> }) {
  const group = await resolve(await params);
  if (!group) notFound();
  return <ProductReviewsView group={group} page={1} />;
}
