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

export const MEGA_CATEGORIES: { mega: MegaCategory; label: string; otherLabel: string }[] = [
  { mega: "photoshoots", label: "Photoshoots", otherLabel: "Other Photoshoots" },
  { mega: "tours", label: "Tours", otherLabel: "Other Tours" },
  { mega: "services", label: "Services", otherLabel: "Other Services" },
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

export type SubjectGroup = { subject: ReviewSubject; testimonials: Testimonial[] };

export type MegaSection = {
  mega: MegaCategory;
  label: string;
  otherLabel: string;
  /** Products with reviews, fullest first — each its own named group. */
  groups: SubjectGroup[];
  /** Products with no review yet. Still anchored, so their chip lands here. */
  others: ReviewSubject[];
};

/**
 * Files every review under the product that names it, and every product under
 * one of the three headings.
 *
 * Matching is the strict rule already used for per-product counts
 * (lib/reviewAttribution.ts), so a review never lands under a product it
 * merely resembles, and never in two places at once.
 *
 * A product with no reviews is not dropped — it goes in its mega's "Other"
 * list, anchored the same way. That is what lets the star chip appear on
 * every product and still land somewhere real: a reviewed product opens its
 * own group, an unreviewed one highlights its entry among its siblings.
 */
export function groupTestimonials(
  testimonials: Testimonial[],
  subjects: ReviewSubject[]
): { sections: MegaSection[]; unattributed: Testimonial[] } {
  const claimed = new Set<Testimonial>();

  const sections = MEGA_CATEGORIES.map(({ mega, label, otherLabel }) => {
    const mine = subjects.filter((subject) => subject.mega === mega);
    const groups: SubjectGroup[] = [];
    const others: ReviewSubject[] = [];

    for (const subject of mine) {
      const matched = testimonials.filter((review) => reviewMatchesProduct(review, subject));
      if (matched.length === 0) {
        others.push(subject);
        continue;
      }
      for (const review of matched) claimed.add(review);
      groups.push({ subject, testimonials: matched });
    }

    groups.sort((a, b) => b.testimonials.length - a.testimonials.length);
    others.sort((a, b) => a.title.localeCompare(b.title));

    return { mega, label, otherLabel, groups, others };
  }).filter((section) => section.groups.length > 0 || section.others.length > 0);

  return { sections, unattributed: testimonials.filter((review) => !claimed.has(review)) };
}
