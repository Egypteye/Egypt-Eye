import { NextRequest, NextResponse } from "next/server";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { reviewDuplicateKey } from "@/lib/testimonials/normalize";

// One-time (safely re-runnable) cleanup for exact-duplicate Testimonial
// documents — the Bulk Add Reviews Studio tool (src/sanity/tools/
// BulkReviewsTool.tsx) always creates new documents on import with no
// dedup check, so pasting the same batch twice (or a source list that
// already had repeats) leaves multiple identical review documents live on
// the site. Visit this URL once, with the secret, to see (and then apply)
// a cleanup:
//
//   https://yoursite.com/api/dedupe-testimonials?secret=YOUR_MIGRATE_SECRET
//   https://yoursite.com/api/dedupe-testimonials?secret=YOUR_MIGRATE_SECRET&apply=1
//
// Without `apply=1` this only reports what it WOULD remove (a dry run) —
// nothing is deleted. Reviewer name + quote text are normalized (case,
// punctuation, whitespace) and grouped; within each group of 2+ matching
// documents, the one with the lowest `order` (ties broken by earliest
// _id) is kept and the rest are deleted.
export const maxDuration = 30;

type TestimonialDoc = {
  _id: string;
  name?: string;
  quote?: string;
  context?: string;
  order?: number;
};

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (!process.env.MIGRATE_SECRET || secret !== process.env.MIGRATE_SECRET) {
    return NextResponse.json({ error: "Invalid or missing secret" }, { status: 401 });
  }

  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "SANITY_API_WRITE_TOKEN is not set in this deployment's environment variables" },
      { status: 500 }
    );
  }

  const apply = request.nextUrl.searchParams.get("apply") === "1";

  const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });
  const docs = await client.fetch<TestimonialDoc[]>(`*[_type == "testimonial"]{_id, name, quote, context, order}`);

  const groups = new Map<string, TestimonialDoc[]>();
  for (const doc of docs) {
    const key = reviewDuplicateKey(doc.name, doc.quote);
    const group = groups.get(key);
    if (group) group.push(doc);
    else groups.set(key, [doc]);
  }

  const toDelete: TestimonialDoc[] = [];
  const duplicateGroups: { name: string; quote: string; kept: string; removed: string[] }[] = [];

  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const sorted = [...group].sort((a, b) => {
      const orderDiff = (a.order ?? 0) - (b.order ?? 0);
      if (orderDiff !== 0) return orderDiff;
      return a._id.localeCompare(b._id);
    });
    const [keep, ...rest] = sorted;
    toDelete.push(...rest);
    duplicateGroups.push({
      name: keep.name ?? "",
      quote: keep.quote ?? "",
      kept: keep._id,
      removed: rest.map((d) => d._id),
    });
  }

  if (!apply) {
    return NextResponse.json({
      dryRun: true,
      totalTestimonials: docs.length,
      duplicateGroups: duplicateGroups.length,
      wouldDelete: toDelete.length,
      details: duplicateGroups,
      note: "Nothing was deleted. Re-run with &apply=1 to actually remove the duplicates listed above.",
    });
  }

  if (toDelete.length === 0) {
    return NextResponse.json({ applied: true, totalTestimonials: docs.length, deleted: 0, details: [] });
  }

  const tx = client.transaction();
  for (const doc of toDelete) tx.delete(doc._id);
  await tx.commit();

  return NextResponse.json({
    applied: true,
    totalTestimonials: docs.length,
    duplicateGroups: duplicateGroups.length,
    deleted: toDelete.length,
    details: duplicateGroups,
  });
}
