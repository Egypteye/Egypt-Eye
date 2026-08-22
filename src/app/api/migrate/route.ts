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

// One-time (safely re-runnable) migration: pushes all the existing tour/
// experience/photoshoot/testimonial/blog/FAQ/site-settings content into
// Sanity, so the CMS starts populated instead of empty. Visit this URL once
// in a browser, with the secret, after setting up Sanity + deploying:
//
//   https://yoursite.com/api/migrate?secret=YOUR_MIGRATE_SECRET
//
// Uses createOrReplace with deterministic IDs, which does a FULL document
// replace — any field not included in the payload below (e.g. a photo
// uploaded directly in the Studio, for a field with no local-content
// equivalent) gets wiped, not preserved. So re-running this after you've
// started editing in the Studio will discard those edits for whichever
// document types you re-run.
//
// To migrate only specific document types (leaving everything else
// untouched), add `&only=` with a comma-separated list of: tours,
// experiences, photoshoots, testimonials, stories, faqs, siteSettings,
// customizePage, aboutPage, contactPage, hosts, signatureExperiences.
// E.g. to seed just the new Signature Experiences system without touching
// anything else:
//
//   https://yoursite.com/api/migrate?secret=YOUR_MIGRATE_SECRET&only=hosts,signatureExperiences

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

  const results: string[] = [];

  if (shouldRun("tours")) {
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
  }

  if (shouldRun("experiences")) {
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
  }

  if (shouldRun("photoshoots")) {
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
  }

  if (shouldRun("testimonials")) {
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
  }

  if (shouldRun("stories")) {
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
  }

  if (shouldRun("faqs")) {
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
  }

  if (shouldRun("siteSettings")) {
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
  }

  if (shouldRun("customizePage")) {
    await client.createOrReplace({
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
    await client.createOrReplace({
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
      teamEyebrow: aboutPage.teamEyebrow,
      teamTitle: aboutPage.teamTitle,
      teamDescription: aboutPage.teamDescription,
      teamMembers: [...aboutPage.teamMembers],
    });
    results.push("aboutPage");
  }

  if (shouldRun("contactPage")) {
    await client.createOrReplace({
      _id: "contactPage",
      _type: "contactPage",
      heroEyebrow: contactPage.heroEyebrow,
      heroHeadline: contactPage.heroHeadline,
      heroImage: { _type: "object", tone: contactPage.heroImage.tone },
      whatsappCardDescription: contactPage.whatsappCardDescription,
      emailCardDescription: contactPage.emailCardDescription,
      urgentCardDescription: contactPage.urgentCardDescription,
      policiesEyebrow: contactPage.policiesEyebrow,
      policiesTitle: contactPage.policiesTitle,
    });
    results.push("contactPage");
  }

  if (shouldRun("hosts")) {
    for (const [i, h] of hosts.entries()) {
      await client.createOrReplace({
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
      await client.createOrReplace({
        _id: `signatureExperience-${e.slug}`,
        _type: "signatureExperience",
        status: e.status,
        order: e.order,
        name: e.name,
        slug: { _type: "slug", current: e.slug },
        forWhom: e.forWhom,
        emotionalHeadline: e.emotionalHeadline,
        shortDescription: e.shortDescription,
        heroImageTone: e.heroImageTone,
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
      });
      results.push(`signatureExperience: ${e.slug}`);
    }
  }

  return NextResponse.json({ ok: true, migrated: results.length, details: results });
}
