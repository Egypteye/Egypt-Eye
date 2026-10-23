import type { Metadata } from "next";
import Link from "next/link";
import { ExperienceHub } from "../_components/ExperienceHub";
import { experienceCategories } from "@/content/flyingDressExperiences";
import { fdBreadcrumbJsonLd, fdJsonLd, fdMetadata, fdPath } from "../_lib/seo";

const categories = experienceCategories.filter((c) => c.section === "creative");

export const metadata: Metadata = fdMetadata({
  title: "Creative and Editorial Production",
  description:
    "Creators, models, fashion labels, DJs and musicians. Content, editorial and rooftop production with the pyramids on the skyline.",
  path: "/creative",
});

export default function CreativePage() {
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
          { name: "Creative Production", path: "/creative" },
          ])
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
            <span aria-current="page">Creative Production</span>
          </nav>

          <div style={{ maxWidth: "44rem" }}>
            <h1 className="fd-display fd-h2">Creative and editorial production</h1>
            <p className="fd-lead fd-muted" style={{ marginTop: "1.75rem" }}>
              Creators, models, fashion labels, DJs and musicians. Content, editorial and rooftop production with the pyramids on the skyline.
            </p>
          </div>
        </div>
      </section>

      <section className="fd-section-tight fd-section-joined">
        <div className="fd-shell">
          <ExperienceHub categories={categories} section="creative" />
        </div>
      </section>
    </>
  );
}
