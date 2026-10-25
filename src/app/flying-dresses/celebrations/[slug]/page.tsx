import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExperienceDetail } from "../../_components/ExperienceDetail";
import { Scene } from "../../_components/Scene";
import { categoryPhoto } from "../../_lib/assets";
import {
  experienceCategories,
  experienceCategoryBySlug,
  experiencesInCategory,
} from "@/content/flyingDressExperiences";
import { fdBreadcrumbJsonLd, fdFaqJsonLd, fdJsonLd, fdMetadata, fdPath } from "../../_lib/seo";
import { StoriesFromHere } from "../../_components/StoriesFromHere";
import { ProposalPage } from "../../_components/ProposalPage";
import { GenderRevealPage } from "../../_components/GenderRevealPage";
import { BirthdayPage } from "../../_components/BirthdayPage";
import { OccasionPage } from "../../_components/OccasionPage";
import { occasionByCategory } from "@/content/flyingDressOccasions";

const SECTION = "celebrations" as const;
// Written out rather than derived from SECTION: a ternary on a literal type
// is a comparison TypeScript can already see the answer to, so it refuses it.
const SECTION_LABEL = "Special Experiences";

export function generateStaticParams() {
  return experienceCategories
    .filter((c) => c.section === SECTION)
    .map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = experienceCategoryBySlug(slug);
  if (!category || category.section !== SECTION) {
    return fdMetadata({ title: "Not found", description: "", noindex: true });
  }
  return fdMetadata({
    title: category.title,
    // The intro is what a visitor reads once they are here; the description is
    // what decides whether they come. Separate fields, with the intro as the
    // fallback for any category that has not needed its own yet.
    description: category.metaDescription ?? category.intro,
    path: `/${SECTION}/${category.slug}`,
  });
}

export default async function ExperienceCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = experienceCategoryBySlug(slug);
  // A category from the OTHER section is a 404 here rather than a redirect:
  // one canonical URL per category, so the two sections cannot both answer.
  if (!category || category.section !== SECTION) notFound();

  const photo = categoryPhoto[category.id];
  const experiences = experiencesInCategory(category.id);
  const siblings = experienceCategories.filter(
    (c) => c.section === SECTION && c.id !== category.id
  );
  // The records belonging to the two categories that compose their own body,
  // read from the same array the generic renderer uses so there is one source.
  const proposal = category.id === "proposals" ? experiences[0] : undefined;
  const genderReveal = category.id === "gender-reveal" ? experiences[0] : undefined;
  const celebration = category.id === "celebrations" ? experiences[0] : undefined;
  // The three remaining celebrations share one composition: anniversaries,
  // maternity and family, and vow renewals. See _components/OccasionPage.tsx
  // for why they are not three near-identical files.
  const occasion = occasionByCategory(category.id);

  return (
    <>
            {/* JSON-LD goes in a SCRIPT TAG. fdJsonLd returns a STRING, not an
          element, so rendering it bare in JSX prints the raw JSON as visible
          page text: a 250-character unbroken string that pushed the layout
          252px sideways, and structured data that no crawler can parse
          because it is not in a script tag at all. The horizontal-overflow
          detector added a few commits ago is what caught it. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          /* THE QUESTIONS WERE ON THE PAGE AND IN NOBODY'S MARKUP.
             Every experience carries `faqs`, ExperienceDetail renders them,
             and this route emitted only a BreadcrumbList — so the answers a
             visitor can read were invisible to a crawler. The package and
             rental routes have emitted FAQPage all along, which is what makes
             it an inconsistency rather than a policy.

             Built from the SAME array the page renders, never a second copy:
             Google requires the marked-up answer to be visible on the page,
             and two hand-kept lists drift. Experiences are collapsed into one
             FAQPage so several categories cannot each claim the entity. */
          /* fdJsonLd takes ONE value. A second argument is silently dropped,
             so the two entities go up as a top-level ARRAY, which is valid
             JSON-LD and what Google's own examples use for a page carrying
             more than one. fdFaqJsonLd returns null when there are no
             questions, and that null is filtered out rather than emitted. */
          __html: fdJsonLd(
          [
          fdBreadcrumbJsonLd([
          { name: "Home", path: "" },
          { name: SECTION_LABEL, path: `/${SECTION}` },
          { name: category.name, path: `/${SECTION}/${category.slug}` },
          ]),
          fdFaqJsonLd(experiences.flatMap((e) => e.faqs)),
          ].filter(Boolean)
          ),
        }}
      />

      <section className="fd-section-tight fd-section-lede">
        <div className="fd-shell">
          <nav aria-label="Breadcrumb" className="fd-eyebrow fd-eyebrow-crumbs" style={{ marginBottom: "2rem" }}>
            <Link href={fdPath()} style={{ color: "inherit" }}>
              Home
            </Link>
            <span aria-hidden="true"> / </span>
            <Link href={fdPath(`/${SECTION}`)} style={{ color: "inherit" }}>
              {SECTION_LABEL}
            </Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">{category.name}</span>
          </nav>

          <div style={{ maxWidth: "46rem" }}>
            <h1 className="fd-display fd-h2">{category.title}</h1>
            <p className="fd-lead fd-muted" style={{ marginTop: "1.75rem" }}>
              {category.intro}
            </p>
          </div>

          {/* A photograph only where we have one OF THIS. See categoryPhoto:
              five of the eight categories have none, and show the designed
              card instead rather than borrowing someone else's occasion. */}
          {photo ? (
            <figure style={{ margin: "2.5rem 0 0" }}>
              <Scene
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                ratio="fd-ratio-landscape"
                sizes="(min-width: 60rem) 72rem, 94vw"
                priority
              />
            </figure>
          ) : null}
        </div>
      </section>

      {/* EVERY CELEBRATION NOW COMPOSES ITS OWN BODY, AND ONLY THE BODY.
          =================================================================
          The proposal is the page somebody plans for months and compares
          against other suppliers before they ever speak to us, and the
          gender reveal is a family event with guests, a supplier-dependent
          cake and a venue that has to approve whatever happens in the air.
          The shared renderer gave each of them the same four sections as a
          birthday. So they compose their own sections instead.

          The celebration is the third, and the one with the most moving
          parts: decoration, a cake through a supplier, a speaker, two
          photoshoots, up to fifteen companions and transport at an extra
          charge.

          They are NOT variations of one another. The proposal's deposit
          split, payment methods, photograph count and gallery expiry were
          supplied for the proposal; nothing of the kind has been set for a
          gender reveal or a celebration, and no page may borrow another's
          terms. See content/flyingDressGenderReveal.ts and
          content/flyingDressBirthday.ts.

          What it deliberately does NOT get is its own route. The URL, the
          metadata, the breadcrumbs, the FAQ structured data, the sibling
          rail and the story links above and below are all still this
          page's, which is what keeps the change to one category rather
          than to the celebrations section. A second route would have
          duplicated every one of those and then drifted from them. */}
      {category.id === "proposals" && proposal ? (
        <ProposalPage experience={proposal} />
      ) : category.id === "gender-reveal" && genderReveal ? (
        <GenderRevealPage experience={genderReveal} />
      ) : category.id === "celebrations" && celebration ? (
        <BirthdayPage experience={celebration} />
      ) : occasion && experiences[0] ? (
        <OccasionPage occasion={occasion} experience={experiences[0]} />
      ) : (
        /* `headless` when this category holds exactly one experience: the
           h1 and lede above are already that experience's title and intro,
           and printing them again directly underneath is the duplication
           the owner reported on the maternity page. */
        experiences.map((experience) => (
          <ExperienceDetail
            key={experience.slug}
            experience={experience}
            headless={experiences.length === 1}
          />
        ))
      )}

      <section className="fd-section-tight fd-sand">
        <div className="fd-shell">
          <h2 className="fd-display fd-h3" style={{ marginBottom: "2rem" }}>
            Other experiences
          </h2>
          <ul className="fd-list fd-list-2">
            {siblings.map((other) => (
              <li key={other.id}>
                <h3>
                  <Link href={fdPath(`/${SECTION}/${other.slug}`)}>{other.title}</Link>
                </h3>
                <p>{other.intro}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <StoriesFromHere path={`/${SECTION}/${category.slug}`} />
    </>
  );
}
