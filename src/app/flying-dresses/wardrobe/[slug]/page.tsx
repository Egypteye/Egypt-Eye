import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Scene } from "../../_components/Scene";
import { PhotoGallery } from "../../_components/PhotoGallery";
import { StoriesFromHere } from "../../_components/StoriesFromHere";
import {
  UNATTRIBUTED_SHOOT,
  WARDROBE_PRICE_NOTE,
  dressPageById,
  dressPages,
} from "@/content/flyingDressWardrobe";
import { FLYING_DRESS_COLLECTION } from "@/content/outfitCollection";
import { fdBreadcrumbJsonLd, fdJsonLd, fdMetadata, fdPath } from "../../_lib/seo";

/**
 * ONE PAGE PER DRESS.
 *
 * Statically generated for all thirteen. No Studio read and no dynamic data,
 * so these are HTML on the CDN like the experience pages, which the LCP target
 * needs on a page whose whole point is six large photographs.
 *
 * WHY THERE IS NO COLOUR SWATCH ON THIS PAGE. See the long note at the top of
 * src/content/flyingDressWardrobe.ts. Short version: every one of these pages
 * carries real photographs of the garment, a hex swatch beside a photograph
 * adds nothing, and the stored swatch and the photographs already disagree for
 * at least one dress. One source of truth, and it is the photograph.
 *
 * WHY NO Product SCHEMA. We are not selling the dress. We are selling a
 * session that includes it, and marking thirteen garments up as purchasable
 * products would be a schema claim that does not match what a visitor can
 * actually buy. Breadcrumbs only. CLAUDE.md §7.
 */

export function generateStaticParams() {
  return dressPages.map((d) => ({ slug: d.id }));
}

/** A slug that is not one of the thirteen 404s rather than rendering empty. */
export const dynamicParams = false;

function outfitName(id: string): string {
  return FLYING_DRESS_COLLECTION.find((o) => o.id === id)?.name ?? id;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dress = dressPageById(slug);
  if (!dress) return fdMetadata({ title: "Not found", description: "", noindex: true });
  return fdMetadata({
    title: dress.seoTitle,
    description: dress.metaDescription,
    path: `/wardrobe/${dress.id}`,
    image: {
      src: `/photos/flying-dresses/wardrobe/${dress.frames[0].file}`,
      alt: dress.frames[0].alt,
      width: dress.frames[0].w,
      height: dress.frames[0].h,
    },
  });
}

export default async function DressPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dress = dressPageById(slug);
  if (!dress) notFound();

  const name = outfitName(dress.id);
  const [hero, ...rest] = dress.frames;
  // Counted, never asserted, and NAMED sessions only.
  //
  // The page says how many people it is showing you, so if a frame is added
  // or removed the sentence follows it. The wardrobe index has been bitten
  // three times by a sentence that stayed true only until the photographs
  // changed, which is why this is derived rather than written down.
  //
  // Unattributed frames are excluded from the count on purpose. Nine frames
  // arrived as IMG_nnnn with no session recorded; they might be a person
  // already in the set or a tenth, and "on 2 different people" when one of
  // the two is a filename we could not resolve is exactly the small overclaim
  // these pages are meant not to make.
  const shoots = new Set(
    dress.frames.filter((f) => f.shoot !== UNATTRIBUTED_SHOOT).map((f) => f.shoot)
  ).size;

  return (
    <>
      <section className="fd-section-tight">
        <div className="fd-shell">
          <nav aria-label="Breadcrumb" className="fd-eyebrow fd-eyebrow-crumbs" style={{ marginBottom: "2rem" }}>
            <Link href={fdPath()} style={{ color: "inherit" }}>
              Home
            </Link>
            <span aria-hidden="true"> / </span>
            <Link href={fdPath("/wardrobe")} style={{ color: "inherit" }}>
              The Wardrobe
            </Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">{name}</span>
          </nav>

          <div style={{ maxWidth: "46rem" }}>
            <p className="fd-eyebrow">The collection</p>
            <h1 className="fd-display fd-h1">{name}</h1>
            <p className="fd-lead fd-muted" style={{ marginTop: "1.75rem" }}>
              {dress.colour}
            </p>
          </div>
        </div>
      </section>

      <section className="fd-section-tight">
        <div className="fd-shell">
          <figure className="fd-figure">
            <Scene
              src={`/photos/flying-dresses/wardrobe/${hero.file}`}
              alt={hero.alt}
              width={hero.w}
              height={hero.h}
              ratio="auto"
              sizes="(min-width: 60rem) 72rem, 100vw"
              priority
            />
          </figure>
        </div>
      </section>

      <section className="fd-section-tight" aria-labelledby="fd-dress-ground">
        <div className="fd-shell fd-shell-narrow">
          <h2 id="fd-dress-ground" className="fd-display fd-h3">
            Against limestone and sand
          </h2>
          <div className="fd-prose" style={{ marginTop: "1.25rem" }}>
            {dress.againstTheGround.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
          <h2 className="fd-display fd-h3" style={{ marginTop: "2.5rem" }}>
            The cut and the fabric
          </h2>
          <div className="fd-prose" style={{ marginTop: "1.25rem" }}>
            <p>{dress.fabric}</p>
          </div>
          <p className="fd-note" style={{ marginTop: "1.25rem" }}>
            Every dress in the collection is adjustable and is worn across a wide range of heights
            and builds.{" "}
            <Link className="fd-inline-link" href={fdPath("/stories/one-size-cut-to-fit")}>
              What adjustable actually means when you put it on
            </Link>
            .
          </p>
        </div>
      </section>

      {rest.length > 0 ? (
        <>
          <PhotoGallery
            heading={shoots > 1 ? `${name} on ${shoots} different people` : `${name}, photographed`}
            intro={
              shoots > 1
                ? "Every frame is a real client session. The same dress, different people, different light."
                : "Every frame is a real client session."
            }
            frames={rest.map((f, i) => ({
              // The first of the remaining frames spans the row; the rest pair
              // up. With all of this photography shot 3:2 landscape, a single
              // wide frame at the top is what stops the grid reading as a
              // contact sheet.
              span: i === 0 ? ("lead" as const) : ("pair" as const),
              src: `/photos/flying-dresses/wardrobe/${f.file}`,
              alt: f.alt,
              width: f.w,
              height: f.h,
              caption:
                f.shoot === UNATTRIBUTED_SHOOT
                  ? `${name}, photographed at ${UNATTRIBUTED_SHOOT}.`
                  : `${name}, photographed at ${f.shoot}'s session.`,
            }))}
          />
          {dress.note ? (
            <section className="fd-section-tight">
              <div className="fd-shell">
                <p className="fd-note" style={{ maxWidth: "46rem" }}>
                  {dress.note}
                </p>
              </div>
            </section>
          ) : null}
        </>
      ) : null}

      <section className="fd-section-tight fd-sand">
        <div className="fd-shell fd-split">
          <div>
            <h2 className="fd-display fd-h3">Where it works best</h2>
            <ul className="fd-ticks" style={{ marginTop: "1.5rem" }}>
              {dress.locations.map((l) => (
                <li key={l.path}>
                  <Link className="fd-inline-link" href={fdPath(l.path)}>
                    {l.label}
                  </Link>
                  {". "}
                  {l.why}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="fd-display fd-h3">Occasions that choose it</h2>
            <ul className="fd-ticks" style={{ marginTop: "1.5rem" }}>
              {dress.occasions.map((o) => (
                <li key={o.path}>
                  <Link className="fd-inline-link" href={fdPath(o.path)}>
                    {o.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="fd-section-tight">
        <div className="fd-shell fd-shell-narrow">
          <h2 className="fd-display fd-h3">What it costs</h2>
          <div className="fd-prose" style={{ marginTop: "1.25rem" }}>
            <p>{WARDROBE_PRICE_NOTE}</p>
          </div>
          <div className="fd-actions" style={{ marginTop: "2rem" }}>
            <Link className="fd-btn" href={fdPath(`/enquire?dress=${dress.id}`)}>
              Enquire with {name}
            </Link>
            <Link className="fd-btn fd-btn-ghost" href={fdPath("/experiences/pyramids-rooftop")}>
              See the rooftop photoshoot
            </Link>
          </div>
        </div>
      </section>

      <section className="fd-section-tight fd-sand">
        <div className="fd-shell">
          <h2 className="fd-display fd-h3">If you are weighing it against another</h2>
          <ul className="fd-ticks" style={{ marginTop: "1.5rem", maxWidth: "46rem" }}>
            {dress.related.map((r) => (
              <li key={r.id}>
                <Link className="fd-inline-link" href={fdPath(`/wardrobe/${r.id}`)}>
                  {outfitName(r.id)}
                </Link>
                {". "}
                {r.why}
              </li>
            ))}
          </ul>
          <div className="fd-actions" style={{ marginTop: "2rem" }}>
            <Link className="fd-btn fd-btn-ghost" href={fdPath("/wardrobe")}>
              All thirteen dresses
            </Link>
          </div>
        </div>
      </section>

      <StoriesFromHere path="/wardrobe" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: fdJsonLd(
            fdBreadcrumbJsonLd([
              { name: "Home", path: "" },
              { name: "The Wardrobe", path: "/wardrobe" },
              { name, path: `/wardrobe/${dress.id}` },
            ])
          ),
        }}
      />
    </>
  );
}
