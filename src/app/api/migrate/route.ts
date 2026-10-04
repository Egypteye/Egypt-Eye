import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { tours } from "@/content/tours";
import { experiences } from "@/content/experiences";
import { photoshoots } from "@/content/photoshoots";
import { photoshootTranslations, tourTranslations } from "@/content/productTranslations";
import { testimonials } from "@/content/testimonials";
import { stories } from "@/content/stories";
import { treasureCategories, treasureProducts } from "@/content/treasures";
import { faqs } from "@/content/faq";
import { site } from "@/content/site";
import { customizePage } from "@/content/customizePage";
import { aboutPage } from "@/content/aboutPage";
import { contactPage } from "@/content/contactPage";
import { hosts } from "@/content/hosts";
import { signatureExperiences } from "@/content/signatureExperiences";
import { authors } from "@/content/authors";
import { events } from "@/content/events";
import { homepage } from "@/content/homepage";
import { listingPages } from "@/content/listingPages";
import { destinationHubs } from "@/content/destinationHubs";
import type { StoryBodyBlock, StoryCountdownBlock, StoryExperienceCardBlock } from "@/content/types";
import { planTreasureUpdate } from "@/lib/migrationPlan";

// One-time (safely re-runnable) migration: pushes all the existing tour/
// experience/photoshoot/testimonial/blog/FAQ/site-settings content into
// Sanity, so the CMS starts populated instead of empty. Visit this URL once
// in a browser, with the secret, after setting up Sanity + deploying:
//
//   https://yoursite.com/api/migrate?secret=YOUR_MIGRATE_SECRET
//
// Uses createOrReplace with deterministic IDs, which does a FULL document
// replace — any field not included in the payload below gets wiped, not
// preserved. For tours/experiences/photoshoots (`image`/`gallery`),
// destinationHubs (`image`), events (`backgroundImage`),
// signatureExperiences (`heroImage`/`gallery`), stories (`image`), and
// siteSettings (`heroImages`, the four banner photos, `destinationPhotos`)
// — fields that are typically set by uploading a real photo directly in the
// Studio rather than edited in the local content files — this route
// fetches whatever's currently set first and folds it back into the
// payload, so re-running it never wipes a Studio-uploaded photo. Any OTHER
// field edited directly in the Studio (e.g. SEO overrides) still follows
// normal full-replace semantics and gets discarded on re-run.
//
// `rating` on tours/experiences/photoshoots is Studio-owned, not content:
// it's an optional manual override an editor sets, falling back to the
// site-wide figure in Site Settings and then to the live Testimonials count
// (sanity/fetchers.ts). It has no local-content equivalent, so this route
// only ever reads it back and preserves it — there is no `only=ratings`
// pass, because writing ratings from here could only erase them.
//
// All mutations are queued onto ONE Sanity transaction and committed together
// at the end, rather than sent as separate requests. This matters for
// correctness, not just speed: Sanity's write API rejects a reference to a
// document that doesn't exist yet, so two documents that reference each
// other (e.g. two Stories that cross-link via relatedStories) can only be
// created together — a single transaction validates references against the
// FINAL combined state, so mutual/forward references resolve correctly
// regardless of which document is queued first.
//
// To migrate only specific document types (leaving everything else
// untouched), add `&only=` with a comma-separated list of: tours,
// experiences, photoshoots, nav, destinationHubs, testimonials,
// stories, treasures, faqs, siteSettings, customizePage, aboutPage, contactPage, hosts,
// signatureExperiences, authors, events, homepage, listingPages. IMPORTANT:
// stories reference tours (relatedTours) and signatureExperiences reference
// hosts/authors/events — always include every type a document you're
// migrating references, or Sanity will reject the whole transaction with a
// "references non-existent document" error (this happened in production
// once already from an incomplete `only=` list). When in doubt, omit `only`
// entirely for a full resync — it's safe to re-run (see media-preservation
// notes above) and guarantees every cross-reference resolves. E.g. to seed
// just the new Stories system (which needs authors/events/
// signatureExperiences/tours to exist first for its references):
//
//   https://yoursite.com/api/migrate?secret=YOUR_MIGRATE_SECRET&only=hosts,signatureExperiences,authors,events,tours,stories
//
// `only=nav` is the safe one to re-run any time — it patches just the `nav`
// field on siteSettings, unlike `tours`/`experiences`/`photoshoots`/
// `siteSettings`, which do a full createOrReplace and would wipe any other
// field edited directly in the Studio since the last full migration:
//
//   https://yoursite.com/api/migrate?secret=YOUR_MIGRATE_SECRET&only=nav
//
// Take Egypt Home's documents are the exception to all of the above: they
// are seeded with createIfNotExists and then left alone, because Egypt Eye
// edits them in the Studio and a resync must never undo that.
//
// To push a content-file change into treasure documents that already exist —
// a real catalogue replacing the samples, say — add `&update=1`. It patches
// instead of replacing: only fields the content file actually defines are
// written, so a price, a photograph, a variant, an availability or an SEO
// override that exists only in the Studio is left exactly as it is. A field
// the content file does not define is never unset. The trade, and the thing
// to understand before running it: for a field the content file DOES define,
// the content file wins, and a Studio edit to that same field is overwritten.
//
// It is a DRY RUN until `&apply=1` joins it, and the dry run abandons the
// whole transaction, so nothing of any type is written. Read the diff first:
//
//   https://yoursite.com/api/migrate?secret=YOUR_MIGRATE_SECRET&only=treasures&update=1
//   https://yoursite.com/api/migrate?secret=YOUR_MIGRATE_SECRET&only=treasures&update=1&apply=1
//
// The dry run also lists `orphans`: treasure documents in Sanity that the
// content files no longer describe. They are reported and never deleted —
// removing a document is destructive, it may be an editor's own work, and it
// is two clicks in the Studio. What the plan does is make sure you know they
// are there, instead of finding stale listings on the live site.
//
// Keep `&only=treasures` on an update run unless you also want every other
// type's full createOrReplace to commit in the same request.
//
// Add `&reset=media` to DISCARD the Studio-uploaded photo on every
// tour/experience/photoshoot the run covers, handing each back to the
// Unsplash/Pexels photo in the local content files. This is destructive and
// deliberate — it's how you undo hand-swapped photos in bulk. Ratings are
// still preserved (they're Studio-owned, see above), and the homepage hero
// slideshow, banner photos and destinationPhotos are never touched by it:
//
//   https://yoursite.com/api/migrate?secret=YOUR_MIGRATE_SECRET&only=tours,experiences,photoshoots&reset=media

// Vercel kills serverless functions after a plan-dependent default (10s on
// Hobby) — extend it well past what even a large single-transaction commit
// should need.
export const maxDuration = 60;

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

  const onlyParam = request.nextUrl.searchParams.get("only");
  const only = onlyParam ? onlyParam.split(",").map((s) => s.trim()) : null;
  const shouldRun = (name: string) => !only || only.includes(name);

  // `&reset=media` drops a tour/experience/photoshoot's Studio-uploaded photo
  // instead of preserving it, which hands the item back to the Unsplash/Pexels
  // photo in the local content files (fetchers.ts fills that in whenever
  // Sanity has no image of its own). It is the deliberate opposite of this
  // route's usual "never wipe a Studio upload" rule, so it only ever happens
  // when someone asks for it in the URL.
  //
  // It is scoped to those three product types on purpose. The homepage hero
  // slideshow, the banner photos and destinationPhotos are NOT affected by it
  // under any combination of parameters — they are preserved unconditionally
  // below, and there is no local content to reset them to anyway.
  const resetMedia = request.nextUrl.searchParams.get("reset") === "media";

  // `&update=1` lets the Take Egypt Home block patch documents that already
  // exist, instead of only seeding ones that don't. It is a dry run until
  // `&apply=1` joins it — the same two-step shape as the story purge, and the
  // reason is the same: this writes to the live dataset, and the diff is
  // worth reading first. The dry run abandons the whole transaction, so no
  // other type in the same run is written either.
  const updateExisting = request.nextUrl.searchParams.get("update") === "1";
  const apply = request.nextUrl.searchParams.get("apply") === "1";
  const dryRun = updateExisting && !apply;

  const treasurePlan = {
    create: [] as string[],
    update: [] as { document: string; fields: string[] }[],
    unchanged: [] as string[],
    orphans: [] as string[],
  };

  const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });
  const tx = client.transaction();
  const results: string[] = [];

  // createOrReplace fully replaces a document — any field left out of the
  // payload (like `image`/`gallery`, which have no equivalent in the local
  // content files) is gone from the result, not just "left as-is". That
  // silently wiped real photos uploaded directly in the Studio the moment
  // this migration was re-run for a type that already had them. Fetching
  // whatever's currently set and folding it back into each payload below
  // makes re-running this endpoint safe even after Studio photo uploads.
  //
  // `rating` is read back and folded in because it's Studio-owned: an
  // optional manual override with no counterpart in the content files.
  // Without this, any resync would wipe whatever an editor set by hand.
  let existingMedia = new Map<string, { image?: unknown; gallery?: unknown; rating?: unknown }>();
  if (shouldRun("tours") || shouldRun("experiences") || shouldRun("photoshoots")) {
    const rows = await client.fetch<{ _id: string; image?: unknown; gallery?: unknown; rating?: unknown }[]>(
      `*[_type in ["tour","experience","photoshoot"]]{_id, image, gallery, rating}`
    );
    existingMedia = new Map(rows.map((r) => [r._id, { image: r.image, gallery: r.gallery, rating: r.rating }]));
  }

  // Same reasoning as `existingMedia` above, for the three other document
  // types whose createOrReplace payloads previously omitted their
  // Studio-only media fields entirely (silently wiping them on every
  // re-run): destinationHub.image, event.backgroundImage, and
  // signatureExperience.heroImage/gallery.
  let existingHubMedia = new Map<string, { image?: unknown }>();
  if (shouldRun("destinationHubs")) {
    const rows = await client.fetch<{ _id: string; image?: unknown }[]>(
      `*[_type == "destinationHub"]{_id, image}`
    );
    existingHubMedia = new Map(rows.map((r) => [r._id, { image: r.image }]));
  }

  let existingEventMedia = new Map<string, { backgroundImage?: unknown }>();
  if (shouldRun("events")) {
    const rows = await client.fetch<{ _id: string; backgroundImage?: unknown }[]>(
      `*[_type == "event"]{_id, backgroundImage}`
    );
    existingEventMedia = new Map(rows.map((r) => [r._id, { backgroundImage: r.backgroundImage }]));
  }

  let existingSignatureMedia = new Map<string, { heroImage?: unknown; gallery?: unknown }>();
  if (shouldRun("signatureExperiences")) {
    const rows = await client.fetch<{ _id: string; heroImage?: unknown; gallery?: unknown }[]>(
      `*[_type == "signatureExperience"]{_id, heroImage, gallery}`
    );
    existingSignatureMedia = new Map(rows.map((r) => [r._id, { heroImage: r.heroImage, gallery: r.gallery }]));
  }

  // And for the Customize page's banner photo. Same rule as every block
  // above — a Studio upload has no equivalent in content/customizePage.ts, so
  // rewriting bannerImage from the content file alone would blank it. This was
  // missing, which meant any customizePage migration silently dropped an
  // uploaded banner back to the gradient placeholder.
  let existingCustomizeMedia: { image?: unknown } = {};
  if (shouldRun("customizePage")) {
    const row = await client.fetch<{ bannerImage?: { image?: unknown } } | null>(
      `*[_id == "customizePage"][0]{bannerImage}`
    );
    existingCustomizeMedia = { image: row?.bannerImage?.image };
  }

  // Same reasoning again, for siteSettings' own image fields. These have no
  // equivalent in content/site.ts at all — heroImages (the homepage hero
  // slideshow), the four banner photos, and destinationPhotos are Studio-only
  // — so unlike the merges above there's nothing local to merge in; this
  // purely preserves what's already there. `reset=media` does NOT reach these
  // — the homepage hero slideshow in particular is hand-picked in Studio and
  // has no content-file equivalent, so resetting it could only blank it.
  // Missing this one meant every
  // siteSettings migration (the full endpoint with no `only=`, or explicitly
  // `only=siteSettings`) silently wiped every uploaded hero slide photo (and
  // its headline/subtext/link), all four banner photos, and any destination
  // photo overrides back to blank — the homepage would then fall back to
  // gradient placeholders and the local slide defaults.
  let existingSiteSettingsMedia: {
    heroImages?: unknown;
    flyingDressImage?: unknown;
    redSeaImage?: unknown;
    ninePyramidsImage?: unknown;
    customizeImage?: unknown;
    destinationPhotos?: unknown;
  } = {};
  if (shouldRun("siteSettings")) {
    existingSiteSettingsMedia =
      (await client.fetch<typeof existingSiteSettingsMedia>(
        `*[_type == "siteSettings"][0]{heroImages, flyingDressImage, redSeaImage, ninePyramidsImage, customizeImage, destinationPhotos}`
      )) ?? {};
  }

  // Same reasoning again, for the story cover photo. Unlike `body`, `title`,
  // etc. — which really are code-authored and are supposed to be fully
  // replaced by re-running this migration — `image` is the one story field
  // that's actually set by uploading a photo in the Studio after the fact,
  // exactly like tours/experiences/photoshoots above. It was never included
  // in the stories createOrReplace payload at all, which means every past
  // run of `only=stories` (or a full resync) has been silently wiping every
  // published story's cover photo back to blank.
  let existingStoryMedia = new Map<string, { image?: unknown }>();
  if (shouldRun("stories")) {
    const rows = await client.fetch<{ _id: string; image?: unknown }[]>(`*[_type == "story"]{_id, image}`);
    existingStoryMedia = new Map(rows.map((r) => [r._id, { image: r.image }]));
  }

  if (shouldRun("tours")) {
    for (const [i, t] of tours.entries()) {
      const id = `tour-${t.slug}`;
      tx.createOrReplace({
        _id: id,
        _type: "tour",
        title: t.title,
        slug: { _type: "slug", current: t.slug },
        tagline: t.tagline,
        // The repo's translations are seeded into Studio so an editor can see
        // (and refine) what each language currently says. The site doesn't
        // depend on this having run — the fetchers merge the same table in —
        // but an empty field in Studio would wrongly read as "not translated".
        titleTranslations: tourTranslations[t.slug]?.title,
        taglineTranslations: tourTranslations[t.slug]?.tagline,
        category: t.category,
        duration: t.duration,
        lengthDays: t.lengthDays,
        cities: t.cities,
        destinations: t.destinations,
        travelStyle: t.travelStyle,
        featured: t.featured,
        rating:
          existingMedia.get(id)?.rating ?? (t.rating ? { _type: "rating", ...t.rating } : undefined),
        badge: t.badge,
        imageTone: t.imageTone,
        image: resetMedia ? undefined : existingMedia.get(id)?.image,
        gallery: resetMedia ? undefined : existingMedia.get(id)?.gallery,
        description: t.description,
        descriptionTranslations: tourTranslations[t.slug]?.description,
        highlights: t.highlights,
        included: t.included,
        excluded: t.excluded,
        itinerary: t.itinerary?.map((d) => ({ ...d, _type: "itineraryDay", _key: key() })),
        physicalLevel: t.physicalLevel ? { _type: "physicalLevel", ...t.physicalLevel } : undefined,
        mapStops: t.mapStops,
        faqs: t.faqs?.map((f) => ({ _type: "faq", _key: key(), question: f.question, answer: f.answer })),
        relatedExperiences: t.relatedExperiences?.map((e) => ({
          _type: "reference",
          _ref: `experience-${e.slug}`,
          _key: key(),
        })),
        price: { _type: "price", ...t.price },
        order: i,
      });
      results.push(`tour: ${t.slug}`);
    }
  }

  if (shouldRun("experiences")) {
    for (const [i, e] of experiences.entries()) {
      const id = `experience-${e.slug}`;
      tx.createOrReplace({
        _id: id,
        _type: "experience",
        title: e.title,
        slug: { _type: "slug", current: e.slug },
        duration: e.duration,
        rating:
          existingMedia.get(id)?.rating ?? (e.rating ? { _type: "rating", ...e.rating } : undefined),
        price: { _type: "price", ...e.price },
        relatedTours: e.relatedTours?.map((t) => ({
          _type: "reference",
          _ref: `tour-${t.slug}`,
          _key: key(),
        })),
        imageTone: e.imageTone,
        image: resetMedia ? undefined : existingMedia.get(id)?.image,
        gallery: resetMedia ? undefined : existingMedia.get(id)?.gallery,
        description: e.description,
        location: e.location,
        // Array items need their own _key or Sanity rejects the document.
        steps: e.steps?.map((step) => ({
          _type: "activityStep",
          _key: key(),
          title: step.title,
          description: step.description,
        })),
        included: e.included,
        goodToKnow: e.goodToKnow,
        destinations: e.destinations,
        physicalLevel: e.physicalLevel ? { _type: "physicalLevel", ...e.physicalLevel } : undefined,
        mapStops: e.mapStops,
        order: i,
      });
      results.push(`experience: ${e.slug}`);
    }
  }

  if (shouldRun("photoshoots")) {
    for (const [i, p] of photoshoots.entries()) {
      const id = `photoshoot-${p.slug}`;
      tx.createOrReplace({
        _id: id,
        _type: "photoshoot",
        title: p.title,
        slug: { _type: "slug", current: p.slug },
        titleTranslations: photoshootTranslations[p.slug]?.title,
        descriptionTranslations: photoshootTranslations[p.slug]?.description,
        duration: p.duration,
        rating:
          existingMedia.get(id)?.rating ?? (p.rating ? { _type: "rating", ...p.rating } : undefined),
        price: { _type: "price", ...p.price },
        locations: p.locations,
        imageTone: p.imageTone,
        image: resetMedia ? undefined : existingMedia.get(id)?.image,
        gallery: resetMedia ? undefined : existingMedia.get(id)?.gallery,
        description: p.description,
        goodFor: p.goodFor,
        included: p.included,
        addOns: p.addOns,
        delivery: p.delivery,
        faqs: p.faqs?.map((f) => ({ ...f, _type: "faq", _key: key() })),
        destinations: p.destinations,
        order: i,
      });
      results.push(`photoshoot: ${p.slug}`);
    }
  }

  // Unlike the createOrReplace blocks above, this ONLY touches the `rating`
  // field via a partial patch — safe to re-run any time (e.g. after editing
  // ratings in content/tours.ts) without wiping images, descriptions, or any
  // other field a real edit in the Studio may have changed since the last
  // full migration.
  // There is deliberately no `ratings` pass any more. A product's rating is
  // now a manual override an editor types in Studio, with no equivalent in
  // the content files — so a migration that wrote ratings could only ever
  // erase the numbers someone set by hand. The full createOrReplace passes
  // above read the current value back and fold it in, so a resync leaves
  // Studio's ratings alone.

  // Same reasoning as `ratings` above: a scoped patch on just the `nav`
  // field, so it's safe to re-run after adding/removing a nav item without
  // touching (and potentially wiping) the hero slideshow photos or banner
  // images already uploaded on this same siteSettings document.
  if (shouldRun("nav")) {
    tx.patch("siteSettings", (p) =>
      p.set({ nav: site.nav.map((n) => ({ ...n, _type: "object", _key: key() })) })
    );
    results.push("nav: siteSettings");
  }

  if (shouldRun("destinationHubs")) {
    for (const [i, d] of destinationHubs.entries()) {
      const id = `destinationHub-${d.slug}`;
      tx.createOrReplace({
        _id: id,
        _type: "destinationHub",
        name: d.name,
        slug: { _type: "slug", current: d.slug },
        region: d.region,
        tagline: d.tagline,
        intro: d.intro,
        matchNames: d.matchNames,
        mapX: d.mapX,
        mapY: d.mapY,
        mood: d.mood,
        image: existingHubMedia.get(id)?.image,
        imageTone: d.imageTone,
        order: i,
      });
      results.push(`destinationHub: ${d.slug}`);
    }
  }

  if (shouldRun("testimonials")) {
    for (const [i, t] of testimonials.entries()) {
      tx.createOrReplace({
        _id: `testimonial-${i}`,
        _type: "testimonial",
        name: t.name,
        quote: t.quote,
        context: t.context,
        order: i,
      });
      results.push(`testimonial: ${t.name}`);
    }
  }

  if (shouldRun("faqs")) {
    for (const [i, f] of faqs.entries()) {
      tx.createOrReplace({
        _id: `faq-${i}`,
        _type: "faqItem",
        question: f.question,
        answer: f.answer,
        order: i,
      });
      results.push(`faq: ${f.question}`);
    }
  }

  if (shouldRun("siteSettings")) {
    tx.createOrReplace({
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
      // Studio-only fields with no equivalent in content/site.ts — see the
      // existingSiteSettingsMedia comment above.
      heroImages: existingSiteSettingsMedia.heroImages,
      flyingDressImage: existingSiteSettingsMedia.flyingDressImage,
      redSeaImage: existingSiteSettingsMedia.redSeaImage,
      ninePyramidsImage: existingSiteSettingsMedia.ninePyramidsImage,
      customizeImage: existingSiteSettingsMedia.customizeImage,
      destinationPhotos: existingSiteSettingsMedia.destinationPhotos,
      pillars: site.pillars.map((p) => ({ ...p, _type: "object", _key: key() })),
      trustStats: { _type: "object", ...site.trustStats },
      nav: site.nav.map((n) => ({ ...n, _type: "object", _key: key() })),
      trustBadges: site.trustBadges.map((b) => ({ ...b, _type: "object", _key: key() })),
      destinations: site.citySpotlights.map((d) => ({ ...d, _type: "object", _key: key() })),
      interests: site.interests.map((i) => ({ ...i, _type: "object", _key: key() })),
      footer: { _type: "object", ...site.footer },
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
  }

  if (shouldRun("homepage")) {
    tx.createOrReplace({
      _id: "homepage",
      _type: "homepage",
      popularTours: { _type: "object", ...homepage.popularTours },
      destinationsSection: { _type: "object", ...homepage.destinationsSection },
      flyingDress: { _type: "object", ...homepage.flyingDress },
      redSea: { _type: "object", ...homepage.redSea },
      ninePyramids: { _type: "object", ...homepage.ninePyramids },
      photoshootsSection: { _type: "object", ...homepage.photoshootsSection },
      customCta: { _type: "object", ...homepage.customCta },
      reviewsSection: { _type: "object", ...homepage.reviewsSection },
      faqSection: { _type: "object", ...homepage.faqSection },
      storiesSection: { _type: "object", ...homepage.storiesSection },
      finalCta: { _type: "object", ...homepage.finalCta },
    });
    results.push("homepage");
  }

  if (shouldRun("listingPages")) {
    tx.createOrReplace({
      _id: "listingPages",
      _type: "listingPages",
      tours: {
        _type: "object",
        ...listingPages.tours,
        faqs: listingPages.tours.faqs.map((f) => ({ ...f, _type: "object", _key: key() })),
      },
      experiences: { _type: "object", ...listingPages.experiences },
      photoshoots: { _type: "object", ...listingPages.photoshoots },
      signatureExperiences: { _type: "object", ...listingPages.signatureExperiences },
      exploreEgypt: { _type: "object", ...listingPages.exploreEgypt },
      stories: { _type: "object", ...listingPages.stories },
    });
    results.push("listingPages");
  }

  if (shouldRun("customizePage")) {
    tx.createOrReplace({
      _id: "customizePage",
      _type: "customizePage",
      eyebrow: customizePage.eyebrow,
      headline: customizePage.headline,
      subtext: customizePage.subtext,
      bannerImage: {
        _type: "object",
        tone: customizePage.bannerImage.tone,
        image: existingCustomizeMedia.image,
      },
      steps: customizePage.steps.map((s) => ({ ...s, _type: "object", _key: key() })),
      formIntroEyebrow: customizePage.formIntroEyebrow,
      formIntroTitle: customizePage.formIntroTitle,
      formIntroDescription: customizePage.formIntroDescription,
      formSections: customizePage.formSections.map((section) => ({
        ...section,
        _type: "object",
        _key: key(),
        fields: section.fields.map((f) => ({ ...f, _type: "object", _key: key() })),
      })),
    });
    results.push("customizePage");
  }

  if (shouldRun("aboutPage")) {
    tx.createOrReplace({
      _id: "aboutPage",
      _type: "aboutPage",
      heroEyebrow: aboutPage.heroEyebrow,
      heroHeadline: aboutPage.heroHeadline,
      heroImage: { _type: "object", tone: aboutPage.heroImage.tone },
      storyEyebrow: aboutPage.storyEyebrow,
      storyTitle: aboutPage.storyTitle,
      whatWeDoEyebrow: aboutPage.whatWeDoEyebrow,
      whatWeDoTitle: aboutPage.whatWeDoTitle,
      whatWeDoDescription: aboutPage.whatWeDoDescription,
    });
    results.push("aboutPage");
  }

  if (shouldRun("contactPage")) {
    tx.createOrReplace({
      _id: "contactPage",
      _type: "contactPage",
      heroEyebrow: contactPage.heroEyebrow,
      heroHeadline: contactPage.heroHeadline,
      heroImage: { _type: "object", tone: contactPage.heroImage.tone },
      whatsappCardDescription: contactPage.whatsappCardDescription,
      emailCardDescription: contactPage.emailCardDescription,
      policiesEyebrow: contactPage.policiesEyebrow,
      policiesTitle: contactPage.policiesTitle,
    });
    results.push("contactPage");
  }

  if (shouldRun("hosts")) {
    for (const [i, h] of hosts.entries()) {
      tx.createOrReplace({
        _id: `host-${h.slug}`,
        _type: "host",
        name: h.name,
        slug: { _type: "slug", current: h.slug },
        role: h.role,
        bio: h.bio,
        languages: h.languages,
        experience: h.experience,
        personality: h.personality,
        order: i,
      });
      results.push(`host: ${h.slug}`);
    }
  }

  if (shouldRun("signatureExperiences")) {
    for (const e of signatureExperiences) {
      const id = `signatureExperience-${e.slug}`;
      tx.createOrReplace({
        _id: id,
        _type: "signatureExperience",
        status: e.status,
        order: e.order,
        name: e.name,
        slug: { _type: "slug", current: e.slug },
        forWhom: e.forWhom,
        emotionalHeadline: e.emotionalHeadline,
        shortDescription: e.shortDescription,
        heroImage: existingSignatureMedia.get(id)?.heroImage,
        heroImageTone: e.heroImageTone,
        gallery: existingSignatureMedia.get(id)?.gallery,
        duration: e.duration,
        groupSize: e.groupSize,
        luxuryLevel: e.luxuryLevel,
        location: e.location,
        price: { _type: "price", ...e.price },
        whoIsThisForTitle: e.whoIsThisForTitle,
        whoIsThisForBody: e.whoIsThisForBody,
        whyWeCreatedThisTitle: e.whyWeCreatedThisTitle,
        whyWeCreatedThisBody: e.whyWeCreatedThisBody,
        experienceIntro: e.experienceIntro,
        experienceHighlights: e.experienceHighlights.map((h) => ({
          ...h,
          _type: "highlight",
          _key: key(),
        })),
        itineraryDays: e.itineraryDays.map((d) => ({
          ...d,
          _type: "itineraryDay",
          _key: key(),
          items: d.items.map((it) => ({ ...it, _type: "itineraryItem", _key: key() })),
        })),
        careTitle: e.careTitle,
        careIntro: e.careIntro,
        careItems: e.careItems,
        hosts: (e.hosts ?? []).map((h) => ({
          _type: "reference",
          _ref: `host-${h.slug}`,
          _key: key(),
        })),
        faqs: (e.faqs ?? []).map((f) => ({ ...f, _type: "faq", _key: key() })),
        relatedStory: e.relatedStory
          ? { _type: "reference", _ref: `story-${e.relatedStory.slug}` }
          : undefined,
        seoTitle: e.seoTitle,
        seoDescription: e.seoDescription,
        canonicalUrl: e.canonicalUrl,
        ogImage: e.ogImage,
        noindex: e.noindex,
      });
      results.push(`signatureExperience: ${e.slug}`);
    }
  }

  if (shouldRun("authors")) {
    for (const a of authors) {
      tx.createOrReplace({
        _id: `author-${a.slug}`,
        _type: "author",
        name: a.name,
        slug: { _type: "slug", current: a.slug },
        role: a.role,
        bio: a.bio,
      });
      results.push(`author: ${a.slug}`);
    }
  }

  if (shouldRun("events")) {
    for (const ev of events) {
      if (!ev.slug) continue;
      const id = `event-${ev.slug}`;
      tx.createOrReplace({
        _id: id,
        _type: "event",
        name: ev.name,
        targetDateTime: ev.targetDateTime,
        timezoneLabel: ev.timezoneLabel,
        locationName: ev.locationName,
        displayTitle: ev.displayTitle,
        supportingText: ev.supportingText,
        backgroundImage: existingEventMedia.get(id)?.backgroundImage ?? ev.backgroundImage,
        backgroundTone: ev.backgroundTone,
        dayOfMessage: ev.dayOfMessage,
        endedMessage: ev.endedMessage,
        active: ev.active,
      });
      results.push(`event: ${ev.slug}`);
    }
  }

  // Body blocks are stored locally with embedded data (e.g. a countdown
  // block holds the full Event object) for convenience when authoring —
  // for Sanity they need to become references to the documents just
  // created above.
  function migrateBodyBlock(block: StoryBodyBlock) {
    // `PortableTextBlock._type` is a wide `string`, so TS can't fully narrow
    // the union on equality alone — the casts below are safe since these
    // shapes are content-authored, not user input.
    if (block._type === "countdownBlock") {
      const countdown = block as StoryCountdownBlock;
      return {
        ...countdown,
        event: countdown.event?.slug
          ? { _type: "reference", _ref: `event-${countdown.event.slug}` }
          : undefined,
      };
    }
    if (block._type === "experienceCardBlock") {
      const card = block as StoryExperienceCardBlock;
      return {
        ...card,
        experience: card.experience
          ? { _type: "reference", _ref: `signatureExperience-${card.experience.slug}` }
          : undefined,
      };
    }
    return block;
  }

  if (shouldRun("stories")) {
    for (const s of stories) {
      tx.createOrReplace({
        _id: `story-${s.slug}`,
        _type: "story",
        status: s.status,
        featured: s.featured,
        title: s.title,
        slug: { _type: "slug", current: s.slug },
        category: s.category,
        tags: s.tags,
        author: s.author ? { _type: "reference", _ref: `author-${s.author.slug}` } : undefined,
        excerpt: s.excerpt,
        image: existingStoryMedia.get(`story-${s.slug}`)?.image,
        imageTone: s.imageTone,
        body: s.body?.map((b) => ({ ...migrateBodyBlock(b), _key: b._key ?? key() })),
        relatedExperience: s.relatedExperience
          ? { _type: "reference", _ref: `signatureExperience-${s.relatedExperience.slug}` }
          : undefined,
        relatedTours: s.relatedTours?.map((t) => ({
          _type: "reference",
          _ref: `tour-${t.slug}`,
          _key: key(),
        })),
        relatedStories: s.relatedStories?.map((r) => ({
          _type: "reference",
          _ref: `story-${r.slug}`,
          _key: key(),
        })),
        destinations: s.destinations,
        badge: s.badge,
        publishedAt: s.publishedAt ?? new Date().toISOString(),
        primaryKeyword: s.primaryKeyword,
        secondaryKeywords: s.secondaryKeywords,
        contentReviewDate: s.contentReviewDate,
        seoTitle: s.seoTitle,
        seoDescription: s.seoDescription,
        ogImage: s.ogImage,
        canonicalUrl: s.canonicalUrl,
        noindex: s.noindex,
      });
      results.push(`story: ${s.slug}`);
    }
  }

  // Take Egypt Home.
  //
  // createIfNotExists, NOT createOrReplace — the only block in this file that
  // works that way, and deliberately. Everything else here is code-authored
  // content that is supposed to be overwritten from the repo. These documents
  // are the opposite: Egypt Eye edits them in the Studio, uploads photographs
  // to them and sets their prices. A full replace would reach in and undo
  // that, so the default seeds the shape once and then leaves it alone.
  //
  // `&update=1` is the way to push a content-file change into documents that
  // already exist — a catalogue of real products replacing the samples, say.
  // It patches rather than replaces: only the fields the content file
  // actually defines are set, so a price, a photograph, a variant or an SEO
  // override that exists only in the Studio is untouched. The flip side, and
  // the thing to understand before using it, is that for a field the content
  // file DOES define, the content file wins — an edit made in the Studio to
  // that same field is overwritten.
  //
  // It is a dry run unless `&apply=1` is also passed, so the diff can be read
  // before anything is written. That is the same shape as the story purge.
  if (shouldRun("treasures")) {
    // Deterministic, so re-running produces identical arrays instead of
    // churning every _key and making every document look changed.
    const itemKey = (slug: string, field: string, i: number) => `${slug}-${field}-${i}`;

    const categoryDoc = (c: (typeof treasureCategories)[number]) => ({
      _id: `treasureCategory-${c.slug}`,
      _type: "treasureCategory",
      title: c.title,
      slug: { _type: "slug", current: c.slug },
      active: c.active ?? true,
      order: c.order ?? 100,
      eyebrow: c.eyebrow,
      heroHeadline: c.heroHeadline,
      heroSub: c.heroSub,
      imageTone: c.imageTone ?? "desert",
      cardHook: c.cardHook,
      cardBlurb: c.cardBlurb,
      story: c.story?.map((b, i) => ({ ...b, _type: "storyBlock", _key: itemKey(c.slug, "story", i) })),
      beforeYouArrive: c.beforeYouArrive?.map((b, i) => ({
        ...b,
        _type: "treasureStep",
        _key: itemKey(c.slug, "step", i),
      })),
      inEgypt: c.inEgypt
        ? {
            _type: "object",
            title: c.inEgypt.title,
            body: c.inEgypt.body,
            steps: c.inEgypt.steps.map((b, i) => ({
              ...b,
              _type: "treasureStep",
              _key: itemKey(c.slug, "inEgypt", i),
            })),
          }
        : undefined,
      trust: c.trust,
      faqs: c.faqs?.map((f, i) => ({ ...f, _type: "faq", _key: itemKey(c.slug, "faq", i) })),
      seo: c.seo ? { _type: "object", ...c.seo } : undefined,
    });

    const productDoc = (p: (typeof treasureProducts)[number]) => ({
      _id: `treasureProduct-${p.slug}`,
      _type: "treasureProduct",
      name: p.name,
      slug: { _type: "slug", current: p.slug },
      category: { _type: "reference", _ref: `treasureCategory-${p.category}` },
      status: p.status,
      placeholder: p.placeholder,
      featured: p.featured ?? false,
      order: p.order,
      blurb: p.blurb,
      description: p.description,
      imageTone: p.imageTone ?? "desert",
      specs: p.specs?.map((spec, i) => ({ ...spec, _type: "treasureSpec", _key: itemKey(p.slug, "spec", i) })),
      tags: p.tags,
    });

    // Both shapes share only their identity, so the list is typed by what
    // the loops below actually use.
    type TreasureDoc = {
      _id: string;
      _type: string;
      slug: { _type: string; current: string };
    } & Record<string, unknown>;

    const docs: TreasureDoc[] = [
      ...treasureCategories.map(categoryDoc),
      ...treasureProducts.map(productDoc),
    ];

    if (!updateExisting) {
      for (const doc of docs) {
        tx.createIfNotExists(doc);
        results.push(`${doc._type}: ${doc.slug.current}`);
      }
    } else {
      const live = await client.fetch<Record<string, unknown>[]>(
        `*[_type in ["treasureCategory","treasureProduct"]]`
      );
      const plan = planTreasureUpdate(docs, live);
      treasurePlan.create.push(...plan.create.map((d) => `${d._type}: ${d.slug.current}`));
      treasurePlan.update.push(...plan.update.map(({ document, fields }) => ({ document, fields })));
      treasurePlan.unchanged.push(...plan.unchanged);
      treasurePlan.orphans.push(...plan.orphans);

      for (const doc of plan.create) tx.createIfNotExists(doc);
      for (const { id, changed } of plan.update) tx.patch(id, (patch) => patch.set(changed));

      results.push(
        `treasures: ${treasurePlan.create.length} to create, ${treasurePlan.update.length} to update, ` +
          `${treasurePlan.unchanged.length} unchanged, ${treasurePlan.orphans.length} orphaned`
      );
    }

    tx.createIfNotExists({ _id: "takeEgyptHomePage", _type: "takeEgyptHomePage" });
    results.push("takeEgyptHomePage");
  }

  // A dry run reports and writes nothing. Returning before commit() is what
  // makes that true — the transaction is simply abandoned.
  if (dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      message:
        "Nothing was written. Add &apply=1 to the same URL to commit exactly this plan.",
      treasures: treasurePlan,
      results,
    });
  }

  try {
    await tx.commit();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }

  // Committing to Sanity is only half the job. Every fetch in
  // sanity/fetchers.ts is cached for an hour and the product pages are
  // statically generated, so without this a migration appears to do nothing:
  // the write lands, and the site keeps serving the previous version until
  // the window happens to expire. Flushing the whole route tree here is what
  // makes a migration visible immediately, which is the only way anyone can
  // tell whether it did what they wanted.
  let revalidated = true;
  try {
    revalidatePath("/", "layout");
  } catch (err) {
    // A failed flush isn't a failed migration — the data is committed either
    // way, it just won't surface until the cache expires on its own.
    console.error("Migration committed, but revalidation failed:", err);
    revalidated = false;
  }

  // `resetMedia` is echoed back because it's the one destructive mode here —
  // seeing it in the response is how you confirm you ran what you meant to.
  // `revalidated` says whether the change is live now or waits out the cache.
  return NextResponse.json({
    ok: true,
    migrated: results.length,
    resetMedia,
    revalidated,
    cacheNote: revalidated
      ? "Site cache flushed — reload to see the change."
      : "Cache flush failed; changes appear within the hour, or after a redeploy.",
    details: results,
  });
}
