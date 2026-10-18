import type { Metadata } from "next";
import Link from "next/link";
import { CollaborateForm } from "../_components/CollaborateForm";
import { collaborationCategories } from "@/content/flyingDressCollaborations";
import { fdBreadcrumbJsonLd, fdJsonLd, fdMetadata, fdPath } from "../_lib/seo";

export const metadata: Metadata = fdMetadata({
  title: "Collaborate With Us",
  description:
    "Proposals from creators, DJs and musicians, brands, hotels and rooftops, travel agencies and production companies. A person reads every one.",
  path: "/collaborate",
});

export default async function CollaboratePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.category) ? params.category[0] : params.category;
  // Resolved against the catalogue, not trusted. An unknown value simply
  // selects nothing, so a stale link still opens a working form.
  const initialCategory =
    collaborationCategories.find((c) => c.id === raw)?.id ?? "";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: fdJsonLd(
            fdBreadcrumbJsonLd([
              { name: "Home", path: "" },
              { name: "Collaborate", path: "/collaborate" },
            ])
          ),
        }}
      />

      <section className="fd-section-tight">
        <div className="fd-shell">
          <nav aria-label="Breadcrumb" className="fd-eyebrow fd-eyebrow-crumbs" style={{ marginBottom: "2rem" }}>
            <Link href={fdPath()} style={{ color: "inherit" }}>
              Home
            </Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">Collaborate</span>
          </nav>

          <div style={{ maxWidth: "46rem" }}>
            <h1 className="fd-display fd-h2">
              Work with <span className="fd-script-accent">us</span>
            </h1>
            <p className="fd-lead fd-muted" style={{ marginTop: "1.75rem" }}>
              We are a small team with cameras, lighting, a wardrobe of flying dresses and a
              working relationship with rooftops that look at the pyramids. Most of what we sell
              depends on somebody else as well as us, so the list below is the kind of partner we
              actually need rather than a general invitation.
            </p>
          </div>
        </div>
      </section>

      <section className="fd-section-tight" style={{ paddingTop: 0 }}>
        <div className="fd-shell">
          <div className="fd-card-grid fd-reveal-group">
            {collaborationCategories.map((category) => (
              <Link
                key={category.id}
                className="fd-tile fd-experience-card"
                href={fdPath(`/collaborate?category=${category.id}`)}
              >
                <span className="fd-tile-body">
                  <span className="fd-tile-title fd-display">{category.name}</span>
                  <span className="fd-tile-meta">{category.who}</span>
                  <span className="fd-arrow-link" aria-hidden="true">
                    Propose this
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="fd-section-tight fd-sand" aria-labelledby="fd-collab-form">
        <div className="fd-shell fd-shell-narrow">
          <h2 id="fd-collab-form" className="fd-display fd-h3" style={{ marginBottom: "0.75rem" }}>
            Tell us what you have in mind
          </h2>
          <p className="fd-muted" style={{ marginBottom: "2.5rem" }}>
            The questions change a little depending on what you pick, so you are not asked for a
            media kit when you are offering a rooftop.
          </p>
          <CollaborateForm initialCategory={initialCategory} />
        </div>
      </section>
    </>
  );
}
