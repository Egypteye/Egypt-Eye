import type { Metadata } from "next";
import Link from "next/link";
import { ExperienceHub } from "../_components/ExperienceHub";
import { experienceCategories } from "@/content/flyingDressExperiences";
import { fdBreadcrumbJsonLd, fdJsonLd, fdMetadata, fdPath } from "../_lib/seo";

const categories = experienceCategories.filter((c) => c.section === "celebrations");

export const metadata: Metadata = fdMetadata({
  title: "Proposals, Reveals and Celebrations",
  description:
    "A proposal, a gender reveal, a birthday, an anniversary, a maternity session or a vow renewal. The same rooftop and the same photography, pointed at whatever you are marking.",
  path: "/celebrations",
});

export default function CelebrationsPage() {
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
          { name: "Special Experiences", path: "/celebrations" },
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
            <span aria-current="page">Special Experiences</span>
          </nav>

          <div style={{ maxWidth: "44rem" }}>
            <h1 className="fd-display fd-h2">Proposals, reveals and celebrations</h1>
            <p className="fd-lead fd-muted" style={{ marginTop: "1.75rem" }}>
              A proposal, a gender reveal, a birthday, an anniversary, a maternity session or a vow renewal. The same rooftop and the same photography, pointed at whatever you are marking.
            </p>
          </div>
        </div>
      </section>

      <section className="fd-section-tight fd-section-joined">
        <div className="fd-shell">
          <ExperienceHub categories={categories} section="celebrations" />
        </div>
      </section>
    </>
  );
}
