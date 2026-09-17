import { transfersPage } from "@/content/transfers";
import type {
  Experience,
  Photoshoot,
  SignatureExperience,
  Testimonial,
  Tour,
} from "@/content/types";
import { reviewMatchesProduct } from "./reviewAttribution";

// The one place that answers "what can a review be about, and where do its
// reviews live?".
//
// Every surface that connects a product to its reviews — the star chip on a
// card, the grouped /testimonials page — reads from here. Deriving it from the
// catalogues themselves is what keeps the feature hands-off: a tour added in
// Studio tomorrow gets a chip and a landing spot with no code change and
// nothing to register by hand.

/** The product's own catalogue, which decides its URL and its anchor. */
export type ReviewSubjectType = "tour" | "photoshoot" | "experience" | "service";

/** The three headings reviews are filed under on /testimonials. */
export type MegaCategory = "photoshoots" | "tours" | "services";

export type ReviewSubject = {
  type: ReviewSubjectType;
  mega: MegaCategory;
  slug: string;
  title: string;
  href: string;
};

export const MEGA_CATEGORIES: { mega: MegaCategory; label: string }[] = [
  { mega: "photoshoots", label: "Photoshoots" },
  { mega: "tours", label: "Tours" },
  { mega: "services", label: "Services" },
];

/**
 * Where this subject's reviews sit on /testimonials.
 *
 * Type-prefixed rather than mega-prefixed because slugs are only unique within
 * a catalogue: the pyramids proposal setup exists as both an experience and a
 * photoshoot, and an unprefixed anchor would send both chips to one group.
 */
export function subjectAnchor(subject: Pick<ReviewSubject, "type" | "slug">): string {
  return `reviews-${subject.type}-${subject.slug}`;
}

export function megaAnchor(mega: MegaCategory): string {
  return `reviews-${mega}`;
}

/** The link a product's star chip points at. */
export function subjectReviewsHref(subject: Pick<ReviewSubject, "type" | "slug">): string {
  return `/testimonials#${subjectAnchor(subject)}`;
}

type Catalogues = {
  tours?: Tour[];
  photoshoots?: Photoshoot[];
  experiences?: Experience[];
  signatureExperiences?: SignatureExperience[];
};

/**
 * Every product a review could name, in one flat list.
 *
 * The mega category each falls under is assigned here and nowhere else.
 * Experiences and signature experiences file under Tours: they're outings a
 * traveler goes and does, which is what a reader scanning for "Tours" is
 * looking for — Services is for the operational side, the transfers and the
 * private driver. Moving a catalogue between megas is a one-line change here.
 *
 * Transfer categories join as services. They're sold and reviewed like
 * anything else, they just share one page instead of having a page each.
 */
export function collectReviewSubjects(catalogues: Catalogues): ReviewSubject[] {
  const { tours = [], photoshoots = [], experiences = [], signatureExperiences = [] } = catalogues;

  return [
    ...photoshoots.map((p) => ({
      type: "photoshoot" as const,
      mega: "photoshoots" as const,
      slug: p.slug,
      title: p.title,
      href: `/photoshoots/${p.slug}`,
    })),
    ...tours.map((t) => ({
      type: "tour" as const,
      mega: "tours" as const,
      slug: t.slug,
      title: t.title,
      href: `/tours/${t.slug}`,
    })),
    ...experiences.map((e) => ({
      type: "experience" as const,
      mega: "tours" as const,
      slug: e.slug,
      title: e.title,
      href: `/experiences/${e.slug}`,
    })),
    ...signatureExperiences.map((s) => ({
      type: "experience" as const,
      mega: "tours" as const,
      slug: s.slug,
      title: s.name,
      href: `/signature-experiences/${s.slug}`,
    })),
    ...transfersPage.categories.map((c) => ({
      type: "service" as const,
      mega: "services" as const,
      slug: c.id,
      title: c.label,
      href: "/transfers",
    })),
  ];
}

/** One review, already resolved to the product and category it belongs to. */
export type ReviewEntry = {
  testimonial: Testimonial;
  /** null when the follow-up never recorded which trip this was about. */
  mega: MegaCategory | null;
  productKey: string | null;
  productTitle: string | null;
  productHref: string | null;
};

/** A product that has at least one review, for the filter controls. */
export type ReviewFilterOption = { key: string; mega: MegaCategory; title: string };

/**
 * Flattens reviews into one list for the unified testimonials wall.
 *
 * The page shows every review together and filters in the browser, so this
 * resolves each one to its product and category up front rather than nesting
 * them into sections. Reviews that resolve to nothing keep their place in the
 * list with a null category — they're real reviews, just not evidence about
 * one product, and hiding them would understate the wall.
 */
export function buildReviewEntries(
  testimonials: Testimonial[],
  subjects: ReviewSubject[]
): { entries: ReviewEntry[]; options: ReviewFilterOption[] } {
  const withReviews = new Map<string, ReviewFilterOption>();

  const entries = testimonials.map((testimonial) => {
    const subject = subjects.find((s) => reviewMatchesProduct(testimonial, s));
    if (!subject) {
      return { testimonial, mega: null, productKey: null, productTitle: null, productHref: null };
    }
    const key = subjectAnchor(subject);
    if (!withReviews.has(key)) {
      withReviews.set(key, { key, mega: subject.mega, title: subject.title });
    }
    return {
      testimonial,
      mega: subject.mega,
      productKey: key,
      productTitle: subject.title,
      productHref: subject.href,
    };
  });

  const options = [...withReviews.values()].sort((a, b) => a.title.localeCompare(b.title));
  return { entries, options };
}
