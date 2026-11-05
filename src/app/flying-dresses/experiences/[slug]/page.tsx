import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { flyingDressEnquiry, mailtoHref, packagePriceLabel, packagePricePhrase, whatsappHref } from "@/content/flyingDresses";
import {
  fdAddOns,
  fdPackageBySlug,
  fdPackages,
  fdSettings,
  fdWardrobe,
} from "../../_lib/content";
import { BookingRail } from "../../_components/BookingRail";
import { FaqList } from "../../_components/FaqList";
import { Scene } from "../../_components/Scene";
import { Gallery } from "../../_components/Gallery";
import { ProductionReel } from "../../_components/ProductionReel";
import { shootAerial, shootReels } from "../../_lib/shootReels";
import { flyingDressGalleryById } from "@/content/flyingDressGalleries";
import { getFlyingDressGallery } from "@/sanity/fetchers";
import { hardenFlyingDressGallery } from "@/lib/sanityShape";
import type { FlyingDressGallery } from "@/content/types";
import {
  agency,
  empty,
  location,
  shootGenerated,
  shootPhoto,
  visibleCredit,
  type ImageSlot,
} from "../../_lib/assets";
import { shootShareImages } from "../../_lib/shareImages";
import { dressPhotos } from "../../_lib/dressPhotos";
import {
  fdBreadcrumbJsonLd,
  fdFaqJsonLd,
  fdJsonLd,
  fdMetadata,
  fdPath,
} from "../../_lib/seo";
import { StoriesFromHere } from "../../_components/StoriesFromHere";

/**
 * One photoshoot location, in full.
 *
 * Statically generated for all three — generateStaticParams plus no dynamic
 * data access means these are HTML on the CDN, which is what the LCP target
 * actually needs.
 */

export async function generateStaticParams() {
  // Async because the shoots are Studio-managed now. A shoot added in the
  // Studio gets its own statically generated page on the next build without
  // anyone touching this file.
  return (await fdPackages()).map((p) => ({ slug: p.slug }));
}

/** A slug that is not one of the three 404s rather than rendering empty. */
export const dynamicParams = false;

const ART: Partial<Record<string, { hero: ImageSlot; detail: ImageSlot }>> = {
  "sand-dunes": { hero: location.saharaDunes, detail: agency.fayoumDress },
  "pyramids-rooftop": { hero: agency.rooftopPortrait, detail: location.gizaPlateau },
  // Real camera frames, supplied November 2026, replacing the stock lake
  // photograph that stood here while the brand had none of its own.
  fayoum: { hero: shootPhoto.fayoumHero, detail: shootPhoto.fayoumGroup },
  // Generated, and credited as such on the page. Neither of these two has a
  // photograph of its location in existence; the alternative was the labelled
  // gap that stood here before, which told a buyer nothing about the product.
  "red-sea-yacht": {
    hero: shootGenerated.redSeaYachtHero,
    detail: shootGenerated.redSeaYachtDetail,
  },
  "white-desert": {
    hero: shootGenerated.whiteDesertHero,
    detail: shootGenerated.whiteDesertDetail,
  },
};

/**
 * The shoot's own gallery, Studio-first exactly as the home page's is.
 *
 * Same rule as workGallery() there, and the same reason: a gallery the owner
 * EMPTIED in the Studio stays empty, because that is an edit; one the
 * projection never returned falls back to the repo's frames, because that is
 * an absence. hardenFlyingDressGallery keeps the two apart.
 *
 * Returns null for a shoot with no gallery at all, which is every shoot but
 * the three the owner supplied folders for.
 */
async function shootGallery(slug: string): Promise<FlyingDressGallery | null> {
  const id = `shoot-${slug}`;
  const local = flyingDressGalleryById(id);
  if (!local) return null;
  const fromSanity = await getFlyingDressGallery(id);
  if (!fromSanity) return local;
  return hardenFlyingDressGallery(fromSanity, local);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await fdPackageBySlug(slug);
  if (!pkg) return fdMetadata({ title: "Not found", description: "", noindex: true });

  /* TITLE LENGTH IS A BUDGET, AND THE BRAND SUFFIX SPENDS 23 OF IT.
     fdMetadata appends " | Flying Dresses Egypt" to every page title, so a
     result truncating at about 60 characters leaves 37 for the page's own.
     These were built from `pkg.title` (up to 37 characters by itself) plus
     " Flying Dress Photoshoot: $349 per person", which ran to 101 on Fayoum
     and cut off mid-phrase. Using the short `name`, and letting the suffix
     carry "Flying Dresses", keeps the price visible, which is the part a
     visitor is scanning for. */
  return fdMetadata({
    // A price in the title earns its place; "Price on request" does not —
    // it spends 17 of the ~37 characters left after the brand suffix to
    // say nothing a searcher can act on.
    title:
      pkg.priceUsd === null
        ? `${pkg.name} Photoshoot`
        : `${pkg.name} Photoshoot: ${packagePriceLabel(pkg)}`,
    description: pkg.metaDescription ?? pkg.intro,
    path: `/experiences/${pkg.slug}`,
    image: shootShareImages[pkg.slug],
  });
}

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pkg = await fdPackageBySlug(slug);
  if (!pkg) notFound();

  const art = ART[pkg.slug] ?? { hero: empty.redSeaYacht, detail: empty.redSeaYacht };
  const [settings, addOns, wardrobe, packages, gallery] = await Promise.all([
    fdSettings(),
    fdAddOns(),
    fdWardrobe(),
    fdPackages(),
    shootGallery(pkg.slug),
  ]);
  const { packageIncludes, payment, cancellation } = settings;
  const { dresses, mensOutfits } = wardrobe;
  const others = packages.filter((p) => p.slug !== pkg.slug);
  const reels = shootReels[pkg.slug] ?? [];
  const aerial = shootAerial[pkg.slug];
  const enquiryMessage = flyingDressEnquiry({
    subject: pkg.title,
    location: pkg.name,
  });

  return (
    <>
      {/* The hero. A shorter one than the home page's — on a product page the
          price and the inclusions matter more than the drama. */}
      <section className="fd-section-tight">
        <div className="fd-shell">
          <nav aria-label="Breadcrumb" className="fd-eyebrow fd-eyebrow-crumbs" style={{ marginBottom: "2rem" }}>
            <Link href={fdPath()} style={{ color: "inherit" }}>
              Home
            </Link>
            <span aria-hidden="true"> / </span>
            <Link href={fdPath("/experiences")} style={{ color: "inherit" }}>
              Experiences
            </Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">{pkg.name}</span>
          </nav>

          <div className="fd-split">
            <div>
              <p className="fd-eyebrow">{pkg.eyebrow}</p>
              <h1 className="fd-display fd-h1">{pkg.title}</h1>
              <p className="fd-lead fd-muted" style={{ marginTop: "1.75rem" }}>
                {pkg.intro}
              </p>

              <div className="fd-tile-meta" style={{ marginBottom: "1.75rem" }}>
                <span className="fd-price">{packagePriceLabel(pkg)}</span>
                {pkg.priceUsd === null ? null : <span>per person</span>}
                <span>{pkg.durationNote}</span>
                <span>100+ photographs</span>
              </div>

              {/* The booking rail, not a hand-written CTA pair.
                  It asks productRail() whether this shoot is instantly
                  bookable and renders either the real deposit figures and the
                  PayPal path, or the enquiry path — so there is never a
                  booking button here that cannot take a booking. */}
              <BookingRail pkg={pkg} />

              {/* The two ways to ask rather than book, beside the rail
                  rather than at the foot of the page. Both carry this
                  shoot's draft, so neither arrives blank. */}
              <div className="fd-actions fd-item-actions">
                <a
                  className="fd-btn fd-btn-ghost fd-btn-sm"
                  href={mailtoHref({ subject: pkg.title, location: pkg.name })}
                >
                  Enquire by email
                </a>
                <a
                  className="fd-btn fd-btn-ghost fd-btn-sm"
                  href={whatsappHref(enquiryMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                  <span className="fd-sr"> (opens in a new tab)</span>
                </a>
              </div>
            </div>

            <figure>
              <Scene
                src={art.hero.src}
                alt={art.hero.alt}
                width={art.hero.width}
                height={art.hero.height}
                ratio="fd-ratio-landscape"
                sizes="(min-width: 60rem) 40vw, 92vw"
                tone={pkg.tone}
                label={"wanted" in art.hero ? art.hero.wanted : undefined}
                priority
              />
              {visibleCredit(art.hero) ? (
                <figcaption className="fd-caption">{visibleCredit(art.hero)}</figcaption>
              ) : null}
            </figure>
          </div>
        </div>
      </section>

      {/* Why this one, and how the photographs look. */}
      {/* WHY THE PRICE IS THE PRICE, read where the price is read.
          Only Fayoum carries one. It is $349 against $179 and $199, and the
          reason sat in an FAQ three screens below the number it explains. */}
      {/* PRICED BY PARTY SIZE. Only the White Desert is, and the hero can
          only show one number, so the tiers are printed in full here. Both
          figures come from `partyPricing` and appear nowhere in prose: one
          number, one place. See the field's note in content/flyingDresses.ts. */}
      {pkg.partyPricing && pkg.partyPricing.length > 0 ? (
        <section className="fd-section-tight" aria-labelledby="fd-party-pricing">
          <div className="fd-shell fd-shell-narrow">
            <p className="fd-eyebrow">What it costs</p>
            <h2 id="fd-party-pricing" className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              Priced by the size of the party
            </h2>
            <p className="fd-muted" style={{ marginTop: "1rem" }}>
              This one is not charged per head. Two travelling together pay less each than one
              travelling alone, so the rate depends on how many of you there are.
            </p>
            <ul className="fd-list fd-list-2" style={{ marginTop: "1.75rem" }}>
              {pkg.partyPricing.map((tier) => (
                <li key={tier.people}>
                  <h3>
                    {/* Spelled out, because this brand spells its numbers:
                        "Thirteen pieces", "Five styles of gawn". "2 people"
                        beside those reads like a spreadsheet. Falls back to
                        the digit above six, where words start to get silly. */}
                    {tier.people === 1
                      ? "One person"
                      : `${
                          ["", "", "Two", "Three", "Four", "Five", "Six"][tier.people] ??
                          String(tier.people)
                        } people`}
                  </h3>
                  <p>
                    <span className="fd-price">${tier.totalUsd}</span>
                    {tier.people > 1 ? (
                      <span className="fd-price-from">
                        {` in total, which is $${Math.round(tier.totalUsd / tier.people)} each`}
                      </span>
                    ) : (
                      <span className="fd-price-from"> in total</span>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {pkg.priceStory ? (
        <section className="fd-section-tight" aria-labelledby="fd-price-story">
          <div className="fd-shell fd-shell-narrow">
            <p className="fd-eyebrow">The price</p>
            <h2 id="fd-price-story" className="fd-display fd-h3" style={{ marginBottom: "1.5rem" }}>
              {pkg.priceStory.heading}
            </h2>
            <div className="fd-prose fd-muted">
              {pkg.priceStory.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* THE SHOOT IN ORDER. What a visitor actually wants before enquiring,
          and the thing no marketplace listing for this category bothers to
          write down. Confirmed hours only; anything unverified is in
          `confirm`, not here. */}
      {pkg.timeline ? (
        <section className="fd-section-tight fd-sand" aria-labelledby="fd-timeline">
          <div className="fd-shell fd-shell-narrow">
            <p className="fd-eyebrow">What actually happens</p>
            <h2 id="fd-timeline" className="fd-display fd-h3" style={{ marginBottom: "2rem" }}>
              The morning, in order
            </h2>
            <ol className="fd-list fd-timeline">
              {pkg.timeline.map((step) => (
                <li key={step.when}>
                  <h3>{step.when}</h3>
                  <p>{step.what}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {/* THE DAY AROUND THE SHOOT, where there is one.
          Two of these shoots sit inside a whole excursion and the pages used
          to say nothing about the hours either side of the session. The two
          cases are priced differently and the copy has to say which this is,
          because an absent number is not self-explanatory: on Fayoum the tour
          is a $75 upgrade, on the yacht day the activities are already paid
          for. See `tourItinerary` in content/flyingDresses.ts. */}
      {pkg.tourItinerary ? (
        <section className="fd-section-tight" aria-labelledby="fd-itinerary">
          <div className="fd-shell fd-shell-narrow">
            <p className="fd-eyebrow">
              {pkg.tourItinerary.supplement.kind === "included"
                ? "Included in the day"
                : "An optional extra"}
            </p>
            <h2 id="fd-itinerary" className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              {pkg.tourItinerary.heading}
            </h2>
            <p className="fd-muted" style={{ marginTop: "1rem" }}>
              {pkg.tourItinerary.lede}
            </p>
            {/* Three states, said in words. An absent number is not
                self-evident: a reader who sees none must not conclude the
                extra is free, which is what "included" is for. */}
            {pkg.tourItinerary.supplement.kind === "included" ? null : (
              <p className="fd-display fd-h4" style={{ marginTop: "1.5rem" }}>
                {pkg.tourItinerary.supplement.usd === null
                  ? "Quoted on request"
                  : `+$${pkg.tourItinerary.supplement.usd} per person`}
              </p>
            )}
            <p className="fd-muted" style={{ marginTop: "0.5rem", fontSize: "var(--fd-step--1)" }}>
              {pkg.tourItinerary.durationNote}
            </p>
            <ul className="fd-ticks" style={{ marginTop: "1.75rem" }}>
              {pkg.tourItinerary.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="fd-section-tight fd-sand">
        <div className="fd-shell fd-split">
          <div>
            <p className="fd-eyebrow">Why here</p>
            <h2 className="fd-display fd-h3" style={{ marginBottom: "1.5rem" }}>
              What this location gives you
            </h2>
            <ul className="fd-ticks">
              {pkg.whyThis.map((why) => (
                <li key={why}>{why}</li>
              ))}
            </ul>

            <p className="fd-note" style={{ marginTop: "2rem" }}>
              <strong style={{ fontWeight: 500 }}>Getting there.</strong> {pkg.gettingThere}
            </p>
          </div>

          <div>
            <p className="fd-eyebrow">The look</p>
            <h2 className="fd-display fd-h3" style={{ marginBottom: "1.5rem" }}>
              How it photographs
            </h2>
            <p className="fd-muted">{pkg.visualDirection}</p>

            <figure style={{ marginTop: "2rem" }}>
              <Scene
                src={art.detail.src}
                alt={art.detail.alt}
                width={art.detail.width}
                height={art.detail.height}
                ratio="fd-ratio-landscape"
                sizes="(min-width: 60rem) 40vw, 92vw"
                tone={pkg.tone}
                label={"wanted" in art.detail ? art.detail.wanted : undefined}
              />
              {visibleCredit(art.detail) ? (
                <figcaption className="fd-caption">{visibleCredit(art.detail)}</figcaption>
              ) : null}
            </figure>
          </div>
        </div>
      </section>

      {/* The shoot's own frames. Mixed provenance on purpose: each frame
          carries its own kind and its own caption, so a generated scene and a
          camera frame can sit in one grid without the grid making a claim. */}
      {gallery && gallery.frames.length > 0 ? (
        <section className="fd-section-tight" aria-labelledby="fd-shoot-gallery">
          <div className="fd-shell">
            <h2
              id="fd-shoot-gallery"
              className="fd-display fd-h3"
              style={{ marginBottom: "2rem" }}
            >
              {gallery.title}
            </h2>
            <Gallery frames={gallery.frames} layout={gallery.layout} />
          </div>
        </section>
      ) : null}

      {/* The one real video this brand has, kept away from the generated
          strip below so the two are never read as the same thing. */}
      {aerial ? (
        <section className="fd-section-tight">
          <div className="fd-shell">
            <figure>
              <video
                className="fd-aerial"
                src={aerial.mp4}
                poster={aerial.poster}
                width={aerial.width}
                height={aerial.height}
                muted
                loop
                playsInline
                autoPlay
                preload="none"
                aria-hidden="true"
              />
              <figcaption className="fd-caption">{aerial.caption}</figcaption>
            </figure>
          </div>
        </section>
      ) : null}

      {reels.length > 0 ? (
        <section className="fd-section-tight" aria-labelledby="fd-shoot-reels">
          <div className="fd-shell">
            <ProductionReel
              clips={reels}
              heading="In motion"
              intro="How the fabric moves out here."
            />
          </div>
        </section>
      ) : null}

      {/* Included. */}
      <section className="fd-section-tight">
        <div className="fd-shell">
          <div style={{ maxWidth: "42rem", marginBottom: "2.5rem" }}>
            <p className="fd-eyebrow">
              Included {pkg.priceUsd === null ? "in this experience" : `at ${packagePricePhrase(pkg)}`}
            </p>
            <h2 className="fd-display fd-h3">Everything in the price</h2>
          </div>
          <ul className="fd-list fd-list-2">
            {packageIncludes.map((item) => (
              <li key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The wardrobe, in context. */}
      <section className="fd-section-tight fd-dark fd-on-dark">
        <div className="fd-shell fd-split">
          <div>
            <p className="fd-eyebrow">Your dress</p>
            <h2 className="fd-display fd-h3" style={{ marginBottom: "1.25rem" }}>
              {dresses.length} colours, all included
            </h2>
            <p className="fd-muted">
              Choose when you enquire. Every dress in the collection is included in the price, so
              the choice does not change what you pay. We note it as your preference and tell you
              before the day if it is unavailable.
            </p>
            <p className="fd-muted" style={{ marginTop: "1rem" }}>
              There are also {mensOutfits.length} traditional gawns for a partner in the frame.
            </p>
            <div className="fd-actions" style={{ marginTop: "2rem" }}>
              <Link className="fd-btn" href={fdPath("/wardrobe")}>
                Open the wardrobe
              </Link>
            </div>
          </div>

          {/* PHOTOGRAPHS, NOT RECTANGLES OF COLOUR.
              This grid rendered `background: dress.hex` for all twelve and
              never asked whether a photograph existed. Every one of them had
              been supplied and was already on /wardrobe and on the home page
              rail, so the three pages where somebody is deciding whether to
              spend $179 were the only places still showing paint chips.

              That is the third time this exact fault has been found on this
              brand: content owned, valid, and never reaching the browser.

              The swatch stays as the fallback, which is still correct for
              anything unphotographed. The tile is 3/4 rather than the old
              2/3, because the frames are landscape at 1600x1067 and a tall
              crop of a wide photograph throws away the dress.

              --fd-min goes from 5rem to 7rem for the same reason: a
              photograph at 80px is a smudge, where a flat colour at 80px was
              perfectly legible. Fewer, larger tiles. */}
          <ul
            className="fd-grid"
            style={{ ["--fd-min" as string]: "7rem", listStyle: "none", margin: 0, padding: 0 }}
          >
            {dresses.map((dress) => {
              const photo = dressPhotos[dress.id];
              return (
                <li key={dress.id}>
                  <Link
                    href={fdPath(`/enquire?package=${pkg.slug}&dress=${dress.id}`)}
                    title={`Enquire with the ${dress.name} dress`}
                    style={{ display: "block", textDecoration: "none", color: "inherit" }}
                  >
                    {photo ? (
                      <span
                        style={{
                          display: "block",
                          aspectRatio: "3 / 4",
                          overflow: "hidden",
                          boxShadow: "inset 0 0 0 1px rgba(248,244,237,0.25)",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.src}
                          alt={photo.alt}
                          loading="lazy"
                          decoding="async"
                          width={1600}
                          height={1067}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                      </span>
                    ) : (
                      <span
                        style={{
                          display: "block",
                          aspectRatio: "3 / 4",
                          background: dress.hex,
                          boxShadow: "inset 0 0 0 1px rgba(248,244,237,0.25)",
                        }}
                      />
                    )}
                    <span
                      style={{
                        display: "block",
                        marginTop: "0.4rem",
                        fontSize: "var(--fd-step--1)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "var(--fd-ivory-dim)",
                      }}
                    >
                      {dress.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Extras. */}
      <section className="fd-section-tight">
        <div className="fd-shell fd-shell-narrow">
          <p className="fd-eyebrow">Optional</p>
          <h2 className="fd-display fd-h3" style={{ marginBottom: "2rem" }}>
            Extras for this shoot
          </h2>
          <div className="fd-table-wrap" tabIndex={0} role="group" aria-label="Optional extras and their prices, scrollable sideways">
            <table className="fd-table">
              <caption className="fd-sr">Optional extras and their prices.</caption>
              <thead>
                <tr>
                  <th scope="col">Extra</th>
                  <th scope="col">Price</th>
                </tr>
              </thead>
              <tbody>
                {addOns.map((addOn) => (
                  <tr key={addOn.id}>
                    <th scope="row" style={{ fontFamily: "var(--fd-sans)", fontSize: "var(--fd-step-0)" }}>
                      {addOn.label}
                    </th>
                    <td>
                      {addOn.priceUsd === null ? (
                        <span className="fd-price-from">On request</span>
                      ) : (
                        <>
                          {addOn.fromPrice ? <span className="fd-price-from">from </span> : null}
                          <span className="fd-price">${addOn.priceUsd}</span>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="fd-note" style={{ marginTop: "1.5rem" }}>
            Nothing here is charged by this website. {payment.note}
          </p>
        </div>
      </section>

      {/* FAQs — this location's, then the two policy answers that belong on
          every product page. */}
      <section className="fd-section-tight fd-sand">
        <div className="fd-shell fd-shell-narrow">
          <p className="fd-eyebrow">Questions</p>
          <h2 className="fd-display fd-h3" style={{ marginBottom: "2rem" }}>
            About {pkg.name}
          </h2>
          <FaqList faqs={pkg.faqs} />
          <div className="fd-actions" style={{ marginTop: "2rem" }}>
            <Link className="fd-arrow-link" href={fdPath("/faq")}>
              All the questions
            </Link>
          </div>

          <p className="fd-note" style={{ marginTop: "2.5rem" }}>
            <strong style={{ fontWeight: 500 }}>Payment and changes.</strong>{" "}
            {cancellation.summary} {payment.note}
          </p>
        </div>
      </section>

      {/* The other two. */}
      <section className="fd-section-tight">
        <div className="fd-shell">
          <p className="fd-eyebrow">Or</p>
          <h2 className="fd-display fd-h3" style={{ marginBottom: "2rem" }}>
            The other two locations
          </h2>
          <div className="fd-grid" style={{ ["--fd-min" as string]: "18rem" }}>
            {others.map((other) => (
              <Link key={other.slug} className="fd-tile" href={fdPath(`/experiences/${other.slug}`)}>
                <span className="fd-tile-body" style={{ display: "block", paddingTop: 0 }}>
                  <span className="fd-pill">{other.eyebrow}</span>
                  <span className="fd-tile-title" style={{ display: "block", marginTop: "0.75rem" }}>
                    {other.title}
                  </span>
                  <span className="fd-tile-meta">
                    <span className="fd-price">{packagePriceLabel(other)}</span>
                    {other.priceUsd === null ? null : <span>per person</span>}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <StoriesFromHere path={`/experiences/${pkg.slug}`} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: fdJsonLd([
            fdBreadcrumbJsonLd([
              { name: "Home", path: "" },
              { name: "Experiences", path: "/experiences" },
              { name: pkg.name, path: `/experiences/${pkg.slug}` },
            ]),
            fdFaqJsonLd(pkg.faqs),
          ]),
        }}
      />
    </>
  );
}
