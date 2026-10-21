import {
  addOns as localAddOns,
  brand as localBrand,
  cancellation as localCancellation,
  contact as localContact,
  nav as localNav,
  packageIncludes as localIncludes,
  packages as localPackages,
  payment as localPayment,
  rentalServices as localRentals,
  type AddOn,
  type FlyingDressPackage,
  type Inclusion,
  type RentalService,
} from "@/content/flyingDresses";
import {
  FLYING_DRESS_COLLECTION,
  MENS_OUTFITS,
} from "@/content/outfitCollection";
import type { Outfit } from "@/lib/booking/outfits";
import { dressPhotos } from "./dressPhotos";

/* ------------------------------------------------------------------------ */
/* The shapes the GROQ projections return                                    */
/*                                                                           */
/* Declared HERE rather than in sanity/fetchers.ts so this module imports    */
/* nothing from the Sanity client. fetchers.ts reaches env.ts, which throws  */
/* when the project id is not configured — which is every check script, and  */
/* the merge rules are precisely the part worth checking. CLAUDE.md §6.      */
/* ------------------------------------------------------------------------ */

export type FdSettingsDoc = {
  name: string | null;
  shortName: string | null;
  tagline: string | null;
  description: string | null;
  heroHeadline: string | null;
  heroHeadlineAccent: string | null;
  heroSupport: string | null;
  email: string | null;
  phoneDisplay: string | null;
  location: string | null;
  socials: { platform: string | null; handle: string | null; profileUrl: string | null }[] | null;
  packageIncludes: { title: string | null; detail: string | null }[] | null;
  paymentNote: string | null;
  paymentMethods: { label: string | null; detail: string | null }[] | null;
  cancellationPublished: boolean | null;
  cancellationSummary: string | null;
  nav: { label: string | null; href: string | null }[] | null;
};

export type FdPackageDoc = {
  slug: string | null;
  name: string | null;
  title: string | null;
  eyebrow: string | null;
  order: number | null;
  priceUsd: number | null;
  durationNote: string | null;
  eyeSlug: string | null;
  priceStoryHeading: string | null;
  priceStoryBody: string[] | null;
  intro: string | null;
  metaDescription: string | null;
  whyThis: string[] | null;
  gettingThere: string | null;
  visualDirection: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  tone: string | null;
  timeline: { when: string | null; what: string | null }[] | null;
  faqs: { question: string | null; answer: string | null }[] | null;
};

export type FdAddOnDoc = {
  addOnId: string | null;
  label: string | null;
  priceUsd: number | null;
  priceIsFrom: boolean | null;
  homeNote: string | null;
  detail: string | null;
  order: number | null;
};

export type FdRentalDoc = {
  slug: string | null;
  name: string | null;
  title: string | null;
  order: number | null;
  priceUsd: number | null;
  eyebrow: string | null;
  intro: string | null;
  summary: string | null;
  howItWorks: { title: string | null; detail: string | null }[] | null;
  youGet: string[] | null;
  notIncluded: string[] | null;
  faqs: { question: string | null; answer: string | null }[] | null;
};

export type FdOutfitDoc = {
  outfitId: string | null;
  name: string | null;
  category: string | null;
  photoUrl: string | null;
  alt: string | null;
  hex: string | null;
  shoot: string | null;
  order: number | null;
};

/**
 * THE MERGE RULES, AS PURE FUNCTIONS.
 *
 * Split out of content.ts on purpose, and the reason is the one CLAUDE.md §6
 * names: a module that reaches the Sanity client reaches env.ts, which throws
 * without a project id — so nothing in scripts/ could import it, and the merge
 * rules would be the one part of this integration no check could see.
 *
 * They are also the part most worth checking. Every rule here fails silently
 * when it is wrong: a `||` where `??` was needed turns a genuine price of 0
 * into last week's figure; an array helper that treats [] as "missing"
 * resurrects a list an editor deliberately emptied. Neither throws, neither
 * logs, and both are invisible until a customer reads the wrong number.
 *
 * content.ts does the fetching and calls these. scripts/check-flying-dresses
 * feeds them the real payload captured from the production dataset.
 */
/**
 * EVERYTHING THIS BRAND RENDERS, AFTER THE STUDIO HAS HAD ITS SAY.
 *
 * =========================================================================
 * WHY ONE MODULE RATHER THAN A FETCH PER PAGE
 * =========================================================================
 * Seventeen pages render this brand and most of them need more than one of
 * these lists. A fetch-per-page would mean the home page asking Sanity five
 * times, each with its own chance of being wired up slightly differently —
 * and the failure of a CMS integration is never an exception, it is one page
 * quietly showing last year's price because somebody forgot a call.
 *
 * So there is one accessor per kind, every page awaits the ones it needs, and
 * the merge rules live here once. Next dedupes identical fetches within a
 * render pass, so the cost is one request per kind per page, not per call.
 *
 * =========================================================================
 * THE MERGE RULES, WHICH ARE THE DOCUMENTED ONES
 * =========================================================================
 * From .claude/skills/sanity-content, and they are not negotiable because
 * getting them wrong fails silently:
 *
 *   - A published document REPLACES its content-file entry WHOLESALE. It does
 *     not merge field by field. A field in the content file with no Studio
 *     counterpart becomes empty in production for that item.
 *   - null / undefined means Studio never set it -> fall back to local.
 *   - [] means an editor deliberately cleared it -> KEEP IT EMPTY. Restoring
 *     the repo's copy here would overrule a real edit.
 *   - No local counterpart -> [] rather than a crash.
 *
 * `local()` below is the gap-filler and it is matched BY SLUG, never by
 * position. Matching by index is how a reordered list in Studio silently
 * attaches one shoot's unconfirmed-facts list to another shoot.
 *
 * =========================================================================
 * WHAT STUDIO IS DELIBERATELY NOT ALLOWED TO SET
 * =========================================================================
 * Fields that are editorial bookkeeping rather than content keep their local
 * values: `priceConfidence`, `confirm`, `imageIsPlaceholder`,
 * `gettingThereConfidence`. They record what the business has and has not
 * verified, they are read by check scripts, and an editor has no way to
 * answer them correctly from a form. A Studio document that omits them
 * inherits the local entry's; a Studio-only item gets safe defaults that mean
 * "nobody has confirmed this", which is the honest answer for something that
 * appeared without a developer.
 */

/** Keeps a deliberate [], falls back on null/undefined. The documented rule. */
function arr<T>(value: readonly T[] | null | undefined, fallback?: readonly T[]): T[] {
  if (Array.isArray(value)) return [...value];
  return fallback ? [...fallback] : [];
}

/** A value, or the local one, or a final default. */
function str(value: string | null | undefined, fallback: string | undefined, final = ""): string {
  const v = typeof value === "string" ? value.trim() : "";
  if (v) return v;
  return fallback ?? final;
}

function bySlug<T extends { slug: string }>(items: readonly T[]): Map<string, T> {
  return new Map(items.map((i) => [i.slug, i]));
}

/* ------------------------------------------------------------------------ */
/* Settings                                                                  */
/* ------------------------------------------------------------------------ */

export type FdSettings = {
  brand: {
    name: string;
    shortName: string;
    tagline: string;
    description: string;
    heroHeadline: string;
    heroHeadlineAccent: string;
    heroSupport: string;
    /** NOT editable. See the note in flyingDressSettings.ts. */
    domain: string;
    url: string;
  };
  contact: {
    email: string;
    phones: { display: string; tel: string; primary: boolean }[];
    whatsapp: string;
    whatsappNumber: string;
    socials: { platform: string; handle: string; profileUrl: string | null }[];
    location: string;
  };
  packageIncludes: Inclusion[];
  payment: { methods: { label: string; detail: string | null }[]; note: string };
  cancellation: { published: boolean; summary: string; ambiguity: string };
  nav: { label: string; href: string }[];
};

const digits = (phone: string) => phone.replace(/\D/g, "");

/**
 * PURE, AND EXPORTED, SO A CHECK CAN REACH IT.
 *
 * `server-only` and a network call put the merge rules out of reach of every
 * script in scripts/ (CLAUDE.md §6). The rules are the part that can be
 * silently wrong — a `||` where `??` was needed turns a real 0 into last
 * week's value — so they live in a function that takes a payload and returns
 * a result, and check-flying-dresses.mts feeds it the real GROQ response.
 */
export function mergeSettings(doc: FdSettingsDoc | null): FdSettings {

  // THE PHONE IS ONE FIELD AND THREE OUTPUTS. The display string is what an
  // editor types; the dial link and the WhatsApp number are derived from it
  // here rather than stored separately, so they cannot drift apart. That was
  // already true in the content file and it stays true through the CMS.
  const phoneDisplay = str(doc?.phoneDisplay, localContact.phones[0]?.display);
  const phoneDigits = digits(phoneDisplay);

  return {
    brand: {
      name: str(doc?.name, localBrand.name),
      shortName: str(doc?.shortName, localBrand.shortName),
      tagline: str(doc?.tagline, localBrand.tagline),
      description: str(doc?.description, localBrand.description),
      heroHeadline: str(doc?.heroHeadline, localBrand.heroHeadline),
      heroHeadlineAccent: str(doc?.heroHeadlineAccent, localBrand.heroHeadlineAccent),
      heroSupport: str(doc?.heroSupport, localBrand.heroSupport),
      // Technical configuration. Not in the Studio on purpose: an editor who
      // can change the domain can take the site off the internet, and the
      // canonical URLs, the sitemap and the share images are all built on it.
      domain: localBrand.domain,
      url: localBrand.url,
    },
    contact: {
      email: str(doc?.email, localContact.email),
      phones: [{ display: phoneDisplay, tel: `+${phoneDigits}`, primary: true }],
      whatsapp: phoneDisplay,
      whatsappNumber: phoneDigits,
      socials: arr(doc?.socials, undefined)
        .map((s) => ({
          platform: str(s.platform, undefined),
          handle: str(s.handle, undefined),
          // A social entry with no link is published as text, never guessed
          // at: a sameAs pointing at the wrong account ties this business to
          // somebody else's.
          profileUrl: s.profileUrl?.trim() || null,
        }))
        .filter((s) => s.platform !== "")
        .concat(doc?.socials ? [] : localContact.socials.map((s) => ({ ...s }))),
      location: str(doc?.location, localContact.location),
    },
    packageIncludes: arr(
      doc?.packageIncludes?.map((i) => ({
        title: str(i.title, undefined),
        detail: str(i.detail, undefined),
      })),
      localIncludes
    ),
    payment: {
      methods: arr(
        doc?.paymentMethods?.map((m) => ({
          label: str(m.label, undefined),
          detail: m.detail?.trim() || null,
        })),
        localPayment.methods
      ),
      note: str(doc?.paymentNote, localPayment.note),
    },
    cancellation: {
      published: typeof doc?.cancellationPublished === "boolean"
        ? doc.cancellationPublished
        : localCancellation.published,
      summary: str(doc?.cancellationSummary, localCancellation.summary),
      // Not editable. It records an unresolved contradiction in the brochure
      // for whoever writes the real policy; it is not published copy.
      ambiguity: localCancellation.ambiguity,
    },
    nav: arr(
      doc?.nav
        ?.map((n) => ({ label: str(n.label, undefined), href: str(n.href, undefined) }))
        .filter((n) => n.label !== "" && n.href !== ""),
      localNav
    ),
  };
}

/* ------------------------------------------------------------------------ */
/* Packages                                                                  */
/* ------------------------------------------------------------------------ */

export function mergePackages(docs: FdPackageDoc[] | null): FlyingDressPackage[] {
  // Non-empty Sanity list wins. An EMPTY list falls back rather than emptying
  // the site: unlike a field an editor cleared, "no photoshoot documents" is
  // overwhelmingly "nobody has made them yet", and a brand with no products
  // is not a state worth rendering faithfully.
  if (!docs || docs.length === 0) return localPackages;

  const local = bySlug(localPackages);

  return docs
    .filter((d): d is FdPackageDoc & { slug: string } => Boolean(d.slug))
    .map((d) => {
      const l = local.get(d.slug);
      const tone = d.tone === "dunes" || d.tone === "rooftop" || d.tone === "fayoum"
        ? d.tone
        : (l?.tone ?? "rooftop");

      return {
        slug: d.slug,
        name: str(d.name, l?.name, d.slug),
        title: str(d.title, l?.title, d.slug),
        eyebrow: str(d.eyebrow, l?.eyebrow),
        eyeSlug: str(d.eyeSlug, l?.eyeSlug),
        // A price is a number or it is not. `?? local` rather than `|| local`,
        // because 0 is falsy and would silently become the old price.
        // The fallback is `?? null`, not `?? 0`: a product with no
        // confirmed price renders "Price on request", and a zero renders
        // as free. `??` not `||` because a genuine 0 is falsy.
        priceUsd: typeof d.priceUsd === "number" ? d.priceUsd : (l?.priceUsd ?? null),
        durationNote: str(d.durationNote, l?.durationNote),
        intro: str(d.intro, l?.intro),
        metaDescription: d.metaDescription?.trim() || l?.metaDescription,
        whyThis: arr(d.whyThis, l?.whyThis),
        gettingThere: str(d.gettingThere, l?.gettingThere),
        visualDirection: str(d.visualDirection, l?.visualDirection),
        image: d.imageUrl ?? l?.image ?? null,
        imageAlt: str(d.imageAlt, l?.imageAlt),
        tone,
        faqs: arr(
          d.faqs?.map((f) => ({ question: str(f.question, undefined), answer: str(f.answer, undefined) })),
          l?.faqs
        ),
        priceStory:
          d.priceStoryHeading && d.priceStoryBody?.length
            ? { heading: d.priceStoryHeading, body: d.priceStoryBody }
            : l?.priceStory,
        timeline:
          d.timeline?.length
            ? d.timeline.map((t) => ({ when: str(t.when, undefined), what: str(t.what, undefined) }))
            : l?.timeline,
        // Editorial bookkeeping. See the note at the top of this file: a
        // Studio-only shoot is "unconfirmed" because nobody has said otherwise.
        priceConfidence: l?.priceConfidence ?? "confirm",
        gettingThereConfidence: l?.gettingThereConfidence ?? "confirm",
        imageIsPlaceholder: l?.imageIsPlaceholder ?? false,
        confirm: l?.confirm ?? [],
      } satisfies FlyingDressPackage;
    });
  // No sort here: the GROQ query already orders by the Position field, which
  // is what an editor dragged. Re-sorting in JavaScript would silently
  // override the one ordering control the Studio offers.
}

/* ------------------------------------------------------------------------ */
/* Add-ons                                                                   */
/* ------------------------------------------------------------------------ */

export function mergeAddOns(docs: FdAddOnDoc[] | null): AddOn[] {
  if (!docs || docs.length === 0) return localAddOns;

  const local = new Map(localAddOns.map((a) => [a.id, a]));

  return docs
    .filter((d): d is FdAddOnDoc & { addOnId: string } => Boolean(d.addOnId))
    .map((d) => {
      const l = local.get(d.addOnId);
      return {
        id: d.addOnId,
        label: str(d.label, l?.label, d.addOnId),
        // `null` means price on request, and that is a real, publishable
        // answer. `?? ` not `|| `: a genuine 0 would otherwise become null.
        priceUsd: typeof d.priceUsd === "number" ? d.priceUsd : null,
        fromPrice: Boolean(d.priceIsFrom ?? l?.fromPrice),
        homeNote: str(d.homeNote, l?.homeNote),
        detail: str(d.detail, l?.detail),
        // Editorial bookkeeping, as above: a Studio-only extra is
        // "unconfirmed" until somebody says otherwise.
        confidence: l?.confidence ?? "confirm",
      } satisfies AddOn;
    });
}

/* ------------------------------------------------------------------------ */
/* Rentals                                                                   */
/* ------------------------------------------------------------------------ */

export function mergeRentals(docs: FdRentalDoc[] | null): RentalService[] {
  if (!docs || docs.length === 0) return localRentals;

  const local = bySlug(localRentals);

  return docs
    .filter((d): d is FdRentalDoc & { slug: string } => Boolean(d.slug))
    .map((d) => {
      const l = local.get(d.slug);
      return {
        ...(l ?? ({} as RentalService)),
        slug: d.slug,
        name: str(d.name, l?.name, d.slug),
        title: str(d.title, l?.title, d.slug),
        eyebrow: str(d.eyebrow, l?.eyebrow),
        intro: str(d.intro, l?.intro),
        summary: str(d.summary, l?.summary),
        howItWorks: arr(
          d.howItWorks?.map((h) => ({ title: str(h.title, undefined), detail: str(h.detail, undefined) })),
          l?.howItWorks
        ),
        youGet: arr(d.youGet, l?.youGet),
        notIncluded: arr(d.notIncluded, l?.notIncluded),
        faqs: arr(
          d.faqs?.map((f) => ({ question: str(f.question, undefined), answer: str(f.answer, undefined) })),
          l?.faqs
        ),
      } as RentalService;
    });
}

/* ------------------------------------------------------------------------ */
/* The wardrobe                                                              */
/* ------------------------------------------------------------------------ */

export type FdWardrobe = {
  dresses: Outfit[];
  mensOutfits: Outfit[];
  /** Photographs keyed by outfit id, in the shape _lib/dressPhotos.ts uses. */
  photos: Record<string, { src: string; alt: string; shoot: string }>;
};

// Re-exported so a page importing one thing from here does not also have to
// import the type from two other modules.
export type { AddOn, FlyingDressPackage, Inclusion, Outfit, RentalService };

/**
 * The wardrobe, after the Studio.
 *
 * NO DOCUMENTS means the content file plus the local photograph map, which is
 * the state the site has been in all along. One or more documents replaces
 * BOTH: the garment list and its photographs come from the same place, so a
 * dress published without a picture shows its colour swatch rather than
 * borrowing the photograph of whatever used to hold that id.
 */
export function mergeWardrobe(docs: FdOutfitDoc[] | null): FdWardrobe {
  if (!docs || docs.length === 0) {
    return {
      dresses: FLYING_DRESS_COLLECTION,
      mensOutfits: MENS_OUTFITS,
      photos: dressPhotos,
    };
  }

  const dresses: Outfit[] = [];
  const mens: Outfit[] = [];
  const photos: FdWardrobe["photos"] = {};

  for (const d of docs) {
    if (!d.outfitId) continue;
    const category = d.category === "mens-outfit" ? "mens-outfit" : "womens-dress";
    const outfit = {
      id: d.outfitId,
      name: str(d.name, undefined, d.outfitId),
      category,
      ...(d.hex ? { hex: d.hex } : {}),
    } as Outfit;

    (category === "mens-outfit" ? mens : dresses).push(outfit);

    // PER GARMENT, NOT PER COLLECTION, and that distinction was a live bug.
    //
    // This used to fill `photos` only from documents that carry an image, and
    // fall back to the local photographs solely when there were NO documents
    // at all. Seeding the wardrobe therefore replaced twelve photographs with
    // an empty map in one step — the "Sanity wins wholesale" rule (CLAUDE.md
    // §3) biting a map instead of a field. It did no visible damage only
    // because nothing was reading this map yet; the moment the wardrobe was
    // wired to it, publishing the seed would have emptied the page.
    //
    // So each garment falls back on its own: a document with no photograph
    // keeps the local one, and uploading a photograph for one dress cannot
    // blank the other eleven.
    const local = dressPhotos[d.outfitId];
    if (d.photoUrl) {
      photos[d.outfitId] = {
        src: d.photoUrl,
        alt: str(d.alt, local?.alt, outfit.name),
        shoot: str(d.shoot, local?.shoot, "Agency shoot"),
      };
    } else if (local) {
      photos[d.outfitId] = local;
    }
  }

  return { dresses, mensOutfits: mens, photos };
}
