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
// signatureExperiences (`heroImage`/`gallery`), and siteSettings
// (`heroImages`, the four banner photos, `destinationPhotos`) — fields that
// are typically set by uploading a real photo directly in the Studio rather
// than edited in the local content files — this route fetches whatever's
// currently set first and folds it back into the payload, so re-running it
// never wipes a Studio-uploaded photo. Any OTHER field edited directly in
// the Studio (e.g. SEO overrides) still follows normal full-replace
// semantics and gets discarded on re-run.
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
// experiences, photoshoots, ratings, nav, destinationHubs, testimonials,
// stories, faqs, siteSettings, customizePage, aboutPage, contactPage, hosts,
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
// `only=ratings` and `only=nav` are the safe ones to re-run any time — they
// only patch the `rating` field (per tour/experience/photoshoot) or the
// `nav` field (on siteSettings) respectively, unlike `tours`/`experiences`/
// `photoshoots`/`siteSettings`, which do a full createOrReplace and would
// wipe any other field edited directly in the Studio since the last full
// migration:
//
//   https://yoursite.com/api/migrate?secret=YOUR_MIGRATE_SECRET&only=ratings

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
  let existingMedia = new Map<string, { image?: unknown; gallery?: unknown }>();
  if (shouldRun("tours") || shouldRun("experiences") || shouldRun("photoshoots")) {
    const rows = await client.fetch<{ _id: string; image?: unknown; gallery?: unknown }[]>(
      `*[_type in ["tour","experience","photoshoot"]]{_id, image, gallery}`
    );
    existingMedia = new Map(rows.map((r) => [r._id, { image: r.image, gallery: r.gallery }]));
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

  // Same reasoning again, for siteSettings' own image fields. These have no
  // equivalent in content/site.ts at all — heroImages (the homepage hero
  // slideshow), the four banner photos, and destinationPhotos are Studio-only
  // — so unlike the merges above there's nothing local to merge in; this
  // purely preserves what's already there. Missing this one meant every
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

  if (shouldRun("tours")) {
    for (const [i, t] of tours.entries()) {
      const id = `tour-${t.slug}`;
      tx.createOrReplace({
        _id: id,
        _type: "tour",
        title: t.title,
        slug: { _type: "slug", current: t.slug },
        tagline: t.tagline,
        category: t.category,
        duration: t.duration,
        lengthDays: t.lengthDays,
        cities: t.cities,
        destinations: t.destinations,
        travelStyle: t.travelStyle,
        featured: t.featured,
        rating: t.rating ? { _type: "rating", ...t.rating } : undefined,
        badge: t.badge,
        imageTone: t.imageTone,
        image: existingMedia.get(id)?.image,
        gallery: existingMedia.get(id)?.gallery,
        description: t.description,
        highlights: t.highlights,
        included: t.included,
        excluded: t.excluded,
        itinerary: t.itinerary?.map((d) => ({ ...d, _type: "itineraryDay", _key: key() })),
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
        rating: e.rating ? { _type: "rating", ...e.rating } : undefined,
        price: { _type: "price", ...e.price },
        relatedTours: e.relatedTours?.map((t) => ({
          _type: "reference",
          _ref: `tour-${t.slug}`,
          _key: key(),
        })),
        imageTone: e.imageTone,
        image: existingMedia.get(id)?.image,
        gallery: existingMedia.get(id)?.gallery,
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
        duration: p.duration,
        rating: p.rating ? { _type: "rating", ...p.rating } : undefined,
        price: { _type: "price", ...p.price },
        locations: p.locations,
        imageTone: p.imageTone,
        image: existingMedia.get(id)?.image,
        gallery: existingMedia.get(id)?.gallery,
        description: p.description,
        goodFor: p.goodFor,
        included: p.included,
        addOns: p.addOns,
        delivery: p.delivery,
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
  if (shouldRun("ratings")) {
    for (const t of tours) {
      tx.patch(`tour-${t.slug}`, (p) =>
        t.rating ? p.set({ rating: { _type: "rating", ...t.rating } }) : p.unset(["rating"])
      );
      results.push(`rating: tour-${t.slug}`);
    }
    for (const e of experiences) {
      tx.patch(`experience-${e.slug}`, (p) =>
        e.rating ? p.set({ rating: { _type: "rating", ...e.rating } }) : p.unset(["rating"])
      );
      results.push(`rating: experience-${e.slug}`);
    }
    for (const ph of photoshoots) {
      tx.patch(`photoshoot-${ph.slug}`, (p) =>
        ph.rating ? p.set({ rating: { _type: "rating", ...ph.rating } }) : p.unset(["rating"])
      );
      results.push(`rating: photoshoot-${ph.slug}`);
    }
  }

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
      destinations: site.destinations.map((d) => ({ ...d, _type: "object", _key: key() })),
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
      bannerImage: { _type: "object", tone: customizePage.bannerImage.tone },
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

  try {
    await tx.commit();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, migrated: results.length, details: results });
}
