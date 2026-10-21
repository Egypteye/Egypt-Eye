import type { Metadata } from "next";
import Link from "next/link";
import { fdPackages, fdSettings } from "../_lib/content";
import { Scene } from "../_components/Scene";
import { agency, empty, location, type ImageSlot } from "../_lib/assets";
import { ItemActions } from "../_components/ItemActions";
import { fdBreadcrumbJsonLd, fdJsonLd, fdMetadata, fdPath } from "../_lib/seo";
import { packagePriceLabel } from "@/content/flyingDresses";

export const metadata: Metadata = fdMetadata({
  title: "The Experiences",
  description:
    "Three flying-dress photoshoots in Egypt: the sand dunes 45 minutes from Cairo at $179, a private rooftop above the Pyramids of Giza at $199, and Fayoum's lakes and white dunes at $349. Each includes the dress, transport and 100+ colour-graded photographs.",
  path: "/experiences",
});

// A PRODUCT WITH NO ENTRY HERE USED TO CRASH THE PAGE.
//
// This was `as const` and read with `ART[pkg.slug]`, which TypeScript is
// happy with and which returns undefined for any slug not listed. Adding the
// Red Sea yacht — a product the business has been selling and the site never
// mentioned — took /experiences and the shoot's own page to a 500 reading
// "Cannot read properties of undefined (reading 'src')".
//
// Typed as a partial record and read through a fallback, so the next product
// added in the Studio renders a labelled gap instead of an error page.
const ART: Partial<Record<string, ImageSlot>> = {
  "sand-dunes": location.saharaDunes,
  "pyramids-rooftop": agency.rooftopPortrait,
  fayoum: location.fayoumLake,
  "red-sea-yacht": empty.redSeaYacht,
};

export default async function ExperiencesPage() {
  const [settings, packages] = await Promise.all([fdSettings(), fdPackages()]);
  const { packageIncludes } = settings;
  return (
    <>
      <section className="fd-section-tight">
        <div className="fd-shell">
          <nav aria-label="Breadcrumb" className="fd-eyebrow fd-eyebrow-crumbs" style={{ marginBottom: "2rem" }}>
            <Link href={fdPath()} style={{ color: "inherit" }}>
              Home
            </Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">Experiences</span>
          </nav>

          <div style={{ maxWidth: "46rem" }}>
            <h1 className="fd-display fd-h1">Three places, one dress</h1>
            <p className="fd-lead fd-muted" style={{ marginTop: "1.75rem" }}>
              The same session (the dress, the direction, the assistant, the hundred-plus
              photographs) in three landscapes that produce completely different pictures. What
              changes between them is the light, the horizon, and how much of your day it takes.
            </p>
          </div>
        </div>
      </section>

      <div className="fd-shell" style={{ display: "grid", gap: "var(--fd-section)" }}>
        {packages.map((pkg, index) => {
          const art = ART[pkg.slug] ?? empty.redSeaYacht;
          return (
            <article
              key={pkg.slug}
              className={`fd-split fd-reveal${index % 2 === 1 ? " fd-split-reverse" : ""}`}
            >
              <div>
                <p className="fd-eyebrow">{pkg.eyebrow}</p>
                <h2 className="fd-display fd-h2" style={{ margin: "0 0 1.25rem" }}>
                  {pkg.title}
                </h2>
                <p className="fd-lead fd-muted">{pkg.intro}</p>

                <p className="fd-muted" style={{ fontSize: "var(--fd-step--1)" }}>
                  <strong style={{ fontWeight: 500 }}>Getting there.</strong> {pkg.gettingThere}
                </p>

                <div className="fd-tile-meta" style={{ margin: "1.75rem 0" }}>
                  <span className="fd-price">{packagePriceLabel(pkg)}</span>
                  {pkg.priceUsd === null ? null : <span>per person</span>}
                  <span>{pkg.durationNote}</span>
                  <span>100+ photographs</span>
                </div>

                <div className="fd-actions">
                  <Link className="fd-btn" href={fdPath(`/experiences/${pkg.slug}`)}>
                    Everything about {pkg.name}
                  </Link>
                  <Link
                    className="fd-btn fd-btn-ghost"
                    href={fdPath(`/enquire?package=${pkg.slug}`)}
                  >
                    Enquire
                  </Link>
                </div>

                <ItemActions
                  label={pkg.title}
                  draft={{ subject: pkg.title, location: pkg.name }}
                />
              </div>

              <figure>
                <Scene
                  src={art.src}
                  alt={art.alt}
                  width={art.width}
                  height={art.height}
                  ratio="fd-ratio-landscape"
                  sizes="(min-width: 60rem) 40vw, 92vw"
                  tone={pkg.tone}
                  label={"wanted" in art ? art.wanted : undefined}
                  drift={Boolean(art.src)}
                />
                {art.credit ? <figcaption className="fd-caption">{art.credit}</figcaption> : null}
              </figure>
            </article>
          );
        })}
      </div>

      <section className="fd-section fd-sand">
        <div className="fd-shell">
          <div style={{ maxWidth: "44rem", marginBottom: "2.5rem" }}>
            <p className="fd-eyebrow">The same in all three</p>
            <h2 className="fd-display fd-h3">What the price covers, wherever you shoot</h2>
          </div>
          <ul className="fd-list fd-list-2">
            {packageIncludes.map((item) => (
              <li key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </li>
            ))}
          </ul>
          <div className="fd-actions" style={{ marginTop: "2.5rem" }}>
            <Link className="fd-btn fd-btn-ghost" href={fdPath("/packages")}>
              Compare all three side by side
            </Link>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: fdJsonLd(
            fdBreadcrumbJsonLd([
              { name: "Home", path: "" },
              { name: "Experiences", path: "/experiences" },
            ])
          ),
        }}
      />
    </>
  );
}
