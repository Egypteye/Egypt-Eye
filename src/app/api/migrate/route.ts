import { NextRequest, NextResponse } from "next/server";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { tours } from "@/content/tours";
import { experiences } from "@/content/experiences";
import { photoshoots } from "@/content/photoshoots";
import { testimonials } from "@/content/testimonials";
import { stories } from "@/content/stories";
import { faqs } from "@/content/faq";
import { site } from "@/content/site";

// One-time (safely re-runnable) migration: pushes all the existing tour/
// experience/photoshoot/testimonial/blog/FAQ/site-settings content into
// Sanity, so the CMS starts populated instead of empty. Visit this URL once
// in a browser, with the secret, after setting up Sanity + deploying:
//
//   https://yoursite.com/api/migrate?secret=YOUR_MIGRATE_SECRET
//
// Uses createOrReplace with deterministic IDs, so visiting it again just
// re-syncs from the local content files without creating duplicates —
// safe, but note it will overwrite any edits already made in the Studio
// for those same documents.

function key() {
  return Math.random().toString(36).slice(2, 10);
}

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

  const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

  const results: string[] = [];

  for (const [i, t] of tours.entries()) {
    await client.createOrReplace({
      _id: `tour-${t.slug}`,
      _type: "tour",
      title: t.title,
      slug: { _type: "slug", current: t.slug },
      tagline: t.tagline,
      category: t.category,
      duration: t.duration,
      lengthDays: t.lengthDays,
      cities: t.cities,
      destinations: t.destinations,
      rating: t.rating ? { _type: "rating", ...t.rating } : undefined,
      badge: t.badge,
      imageTone: t.imageTone,
      description: t.description,
      highlights: t.highlights,
      included: t.included,
      excluded: t.excluded,
      itinerary: t.itinerary?.map((d) => ({ ...d, _type: "itineraryDay", _key: key() })),
      price: { _type: "price", ...t.price },
      order: i,
    });
    results.push(`tour: ${t.slug}`);
  }

  for (const [i, e] of experiences.entries()) {
    await client.createOrReplace({
      _id: `experience-${e.slug}`,
      _type: "experience",
      title: e.title,
      slug: { _type: "slug", current: e.slug },
      duration: e.duration,
      rating: e.rating ? { _type: "rating", ...e.rating } : undefined,
      price: { _type: "price", ...e.price },
      imageTone: e.imageTone,
      description: e.description,
      included: e.included,
      order: i,
    });
    results.push(`experience: ${e.slug}`);
  }

  for (const [i, p] of photoshoots.entries()) {
    await client.createOrReplace({
      _id: `photoshoot-${p.slug}`,
      _type: "photoshoot",
      title: p.title,
      slug: { _type: "slug", current: p.slug },
      duration: p.duration,
      rating: p.rating ? { _type: "rating", ...p.rating } : undefined,
      price: { _type: "price", ...p.price },
      locations: p.locations,
      imageTone: p.imageTone,
      description: p.description,
      goodFor: p.goodFor,
      included: p.included,
      addOns: p.addOns,
      delivery: p.delivery,
      order: i,
    });
    results.push(`photoshoot: ${p.slug}`);
  }

  for (const [i, t] of testimonials.entries()) {
    await client.createOrReplace({
      _id: `testimonial-${i}`,
      _type: "testimonial",
      name: t.name,
      quote: t.quote,
      context: t.context,
      order: i,
    });
    results.push(`testimonial: ${t.name}`);
  }

  for (const s of stories) {
    await client.createOrReplace({
      _id: `story-${s.slug}`,
      _type: "story",
      title: s.title,
      slug: { _type: "slug", current: s.slug },
      excerpt: s.excerpt,
      imageTone: s.imageTone,
      publishedAt: new Date().toISOString(),
    });
    results.push(`story: ${s.slug}`);
  }

  for (const [i, f] of faqs.entries()) {
    await client.createOrReplace({
      _id: `faq-${i}`,
      _type: "faqItem",
      question: f.question,
      answer: f.answer,
      order: i,
    });
    results.push(`faq: ${f.question}`);
  }

  await client.createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    name: site.name,
    shortName: site.shortName,
    tagline: site.tagline,
    heroHeadline: site.heroHeadline,
    heroSubheadline: site.heroSubheadline,
    description: site.description,
    positioning: site.positioning,
    contact: { _type: "object", ...site.contact },
    socials: { _type: "object", ...site.socials },
    pillars: site.pillars.map((p) => ({ ...p, _type: "object", _key: key() })),
    policies: {
      _type: "object",
      deposit: site.policies.deposit,
      currency: site.policies.currency,
      children: site.policies.children.map((c) => ({ ...c, _type: "object", _key: key() })),
      childrenNote: site.policies.childrenNote,
      voucher: site.policies.voucher,
      cancellation: site.policies.cancellation,
    },
  });
  results.push("siteSettings");

  return NextResponse.json({ ok: true, migrated: results.length, details: results });
}
