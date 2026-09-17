import { transfersPage } from "@/content/transfers";
import type {
  Experience,
  Photoshoot,
  SignatureExperience,
  Testimonial,
  Tour,
} from "@/content/types";
import { reviewMatchesProduct } from "./reviewAttribution";

// The one place that answers "what can a review be about?".
//
// Reviews arrive over WhatsApp naming a trip or a shoot, and every surface
// that wants to link a product to its reviews — the star chip on a card, the
// grouped /testimonials page — needs the same answer about which products
// exist and where each one's reviews live on that page. Deriving that here,
// from the catalogues themselves, is what keeps the feature scalable: a tour
// added in Studio tomorrow gets its own group and its own chip with no code
// change and nothing to register by hand.

export type ReviewSubjectType = "tour" | "photoshoot" | "experience" | "service";

export type ReviewSubject = {
  type: ReviewSubjectType;
  slug: string;
  title: string;
  /** The product's own page, or null for services that have no detail page. */
  href: string | null;
};

// Order here is the order the sections appear on /testimonials.
export const SUBJECT_SECTIONS: { type: ReviewSubjectType; label: string }[] = [
  { type: "tour", label: "Tours" },
  { type: "photoshoot", label: "Photoshoots" },
  { type: "experience", label: "Experiences" },
  { type: "service", label: "Services" },
];

/**
 * Where this subject's reviews sit on /testimonials.
 *
 * Type-prefixed because slugs are only unique within a catalogue — the
 * pyramids proposal setup, for one, exists as both an experience and a
 * photoshoot, and an unprefixed anchor would send both chips to one group.
 */
export function subjectAnchor(subject: Pick<ReviewSubject, "type" | "slug">): string {
  return `reviews-${subject.type}-${subject.slug}`;
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
 * Transfer categories join as services: they're sold and reviewed like the
 * rest, they just live on one page instead of having a page each, so their
 * `href` points at that page and their chip is the section rather than a
 * detail route.
 */
export function collectReviewSubjects(catalogues: Catalogues): ReviewSubject[] {
  const { tours = [], photoshoots = [], experiences = [], signatureExperiences = [] } = catalogues;

  return [
    ...tours.map((t) => ({
      type: "tour" as const,
      slug: t.slug,
      title: t.title,
      href: `/tours/${t.slug}`,
    })),
    ...photoshoots.map((p) => ({
      type: "photoshoot" as const,
      slug: p.slug,
      title: p.title,
      href: `/photoshoots/${p.slug}`,
    })),
    ...experiences.map((e) => ({
      type: "experience" as const,
      slug: e.slug,
      title: e.title,
      href: `/experiences/${e.slug}`,
    })),
    ...signatureExperiences.map((s) => ({
      type: "experience" as const,
      slug: s.slug,
      title: s.name,
      href: `/signature-experiences/${s.slug}`,
    })),
    ...transfersPage.categories.map((c) => ({
      type: "service" as const,
      slug: c.id,
      title: c.label,
      href: "/transfers",
    })),
  ];
}

export type SubjectGroup = { subject: ReviewSubject; testimonials: Testimonial[] };
export type SubjectSection = { type: ReviewSubjectType; label: string; groups: SubjectGroup[] };

/**
 * Buckets reviews under the product each one names, using the same strict
 * matching the per-product counts already use (lib/reviewAttribution.ts) so a
 * review never lands in two places or under a product it merely resembles.
 *
 * Returns only the products that actually have a review: a section with an
 * empty list is worse than no section, and the star chip is hidden on those
 * products anyway, so an empty group could only ever be reached by hand.
 */
export function groupTestimonials(
  testimonials: Testimonial[],
  subjects: ReviewSubject[]
): { sections: SubjectSection[]; unattributed: Testimonial[] } {
  const claimed = new Set<Testimonial>();

  const sections = SUBJECT_SECTIONS.map(({ type, label }) => {
    const groups = subjects
      .filter((subject) => subject.type === type)
      .map((subject) => {
        const matched = testimonials.filter((review) => reviewMatchesProduct(review, subject));
        for (const review of matched) claimed.add(review);
        return { subject, testimonials: matched };
      })
      .filter((group) => group.testimonials.length > 0)
      // Most-reviewed first, so the fullest groups lead each section.
      .sort((a, b) => b.testimonials.length - a.testimonials.length);

    return { type, label, groups };
  }).filter((section) => section.groups.length > 0);

  return { sections, unattributed: testimonials.filter((review) => !claimed.has(review)) };
}

/** The slugs, per type, that have at least one review — what the chip keys on. */
export function reviewedSubjectKeys(
  testimonials: Testimonial[],
  subjects: ReviewSubject[]
): Set<string> {
  const keys = new Set<string>();
  for (const subject of subjects) {
    if (testimonials.some((review) => reviewMatchesProduct(review, subject))) {
      keys.add(subjectAnchor(subject));
    }
  }
  return keys;
}
