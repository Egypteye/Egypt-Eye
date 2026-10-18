import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExperienceDetail } from "../../_components/ExperienceDetail";
import {
  experienceCategories,
  experienceCategoryBySlug,
  experiencesInCategory,
} from "@/content/flyingDressExperiences";
import { fdBreadcrumbJsonLd, fdJsonLd, fdMetadata, fdPath } from "../../_lib/seo";

const SECTION = "creative" as const;
// Written out rather than derived from SECTION: a ternary on a literal type
// is a comparison TypeScript can already see the answer to, so it refuses it.
const SECTION_LABEL = "Creative Production";

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
    description: category.intro,
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

  const experiences = experiencesInCategory(category.id);
  const siblings = experienceCategories.filter(
    (c) => c.section === SECTION && c.id !== category.id
  );

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
          __html: fdJsonLd(
          fdBreadcrumbJsonLd([
          { name: "Home", path: "" },
          { name: SECTION_LABEL, path: `/${SECTION}` },
          { name: category.name, path: `/${SECTION}/${category.slug}` },
          ])
          ),
        }}
      />

      <section className="fd-section-tight">
        <div className="fd-shell">
          <nav aria-label="Breadcrumb" className="fd-eyebrow" style={{ marginBottom: "2rem" }}>
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
        </div>
      </section>

      {experiences.map((experience) => (
        <ExperienceDetail key={experience.slug} experience={experience} />
      ))}

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
    </>
  );
}
