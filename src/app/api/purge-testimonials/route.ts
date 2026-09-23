import { NextRequest, NextResponse } from "next/server";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

// Clears every Testimonial document out of Sanity, for when the reviews on
// the site are not ones the business can stand behind.
//
// This has to be an endpoint rather than a content edit. src/content/
// testimonials.ts is already empty and has been all along — the reviews on
// the live site exist only as Sanity documents, so nothing in the codebase
// can take them down. The migration route can't either: it writes the
// content file into Sanity, and writing an empty list creates nothing and
// removes nothing.
//
//   https://yoursite.com/api/purge-testimonials?secret=YOUR_MIGRATE_SECRET
//   https://yoursite.com/api/purge-testimonials?secret=YOUR_MIGRATE_SECRET&apply=1
//
// Without `apply=1` this is a dry run: it lists what it would clear and
// changes nothing. Read that list first — these documents are the only copy,
// so take a Sanity export if the wording is worth keeping.
//
// The section itself stays. The Testimonials list in Studio, the Bulk Add
// Reviews tool, the /testimonials page and its empty state, and the homepage
// and About review blocks (which hide themselves while the list is empty)
// are all untouched, so importing real reviews later brings everything back
// with no code change.
//
// `reviewsOverride` goes too, unless `keepOverride=1`. It is the Site
// Settings figure that states a review count on every tour, experience and
// photoshoot, independently of the Testimonials list. Emptying the reviews
// while leaving it set would leave the site claiming reviews that no longer
// exist anywhere — the exact thing the schema's own description warns is an
// FTC and CMA matter. It is a number, not a document: retyping it in Studio
// restores it.
export const maxDuration = 30;

type TestimonialDoc = {
  _id: string;
  name?: string;
  quote?: string;
  context?: string;
  score?: number;
};

type ReviewsOverride = { count?: number; score?: number } | null;

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
  const keepOverride = request.nextUrl.searchParams.get("keepOverride") === "1";

  const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

  const [docs, override] = await Promise.all([
    client.fetch<TestimonialDoc[]>(`*[_type == "testimonial"]{_id, name, quote, context, score}`),
    client.fetch<ReviewsOverride>(`*[_id == "siteSettings"][0].reviewsOverride`),
  ]);

  // Enough of each quote to recognise it, not the whole thing — this is a
  // confirmation screen, not an export.
  const preview = docs.map((d) => ({
    _id: d._id,
    name: d.name ?? "",
    score: d.score,
    quote: (d.quote ?? "").slice(0, 120) + ((d.quote ?? "").length > 120 ? "…" : ""),
  }));

  const overrideSet = Boolean(override && (override.count || override.score));
  const overrideAction = !overrideSet
    ? "not set — nothing to clear"
    : keepOverride
      ? "left as-is (keepOverride=1)"
      : "will be cleared";

  if (!apply) {
    return NextResponse.json({
      dryRun: true,
      totalTestimonials: docs.length,
      wouldRemove: docs.length,
      reviewsOverride: override ?? null,
      reviewsOverrideAction: overrideAction,
      details: preview,
      note:
        "Nothing was changed. Re-run with &apply=1 to clear every testimonial listed above. " +
        "This is permanent — take a Sanity export first if you want a copy. " +
        "Add &keepOverride=1 to leave the Site Settings review figure alone.",
    });
  }

  const tx = client.transaction();
  for (const doc of docs) tx.delete(doc._id);
  if (overrideSet && !keepOverride) {
    tx.patch("siteSettings", (p) => p.unset(["reviewsOverride"]));
  }
  // An empty transaction is rejected by the API, so skip the commit when
  // there was nothing to do — re-running this against an already-clean
  // dataset should report success rather than throw.
  if (docs.length > 0 || (overrideSet && !keepOverride)) await tx.commit();

  return NextResponse.json({
    applied: true,
    removed: docs.length,
    reviewsOverrideCleared: overrideSet && !keepOverride,
    details: preview,
    note:
      "The Testimonials section is still in place — import real reviews in Studio " +
      "(Testimonials, or the Bulk Add Reviews tool) and every review block returns on its own.",
  });
}
