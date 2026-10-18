import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  addOns,
  cancellation,
  dresses,
  flyingDressEnquiry,
  mensOutfits,
  packageBySlug,
  packageIncludes,
  packages,
  payment,
  whatsappHref,
} from "@/content/flyingDresses";
import { BookingRail } from "../../_components/BookingRail";
import { FaqList } from "../../_components/FaqList";
import { Scene } from "../../_components/Scene";
import { agency, location } from "../../_lib/assets";
import { shootShareImages } from "../../_lib/shareImages";
import {
  fdBreadcrumbJsonLd,
  fdFaqJsonLd,
  fdJsonLd,
  fdMetadata,
  fdPath,
} from "../../_lib/seo";

/**
 * One photoshoot location, in full.
 *
 * Statically generated for all three — generateStaticParams plus no dynamic
 * data access means these are HTML on the CDN, which is what the LCP target
 * actually needs.
 */

export function generateStaticParams() {
  return packages.map((p) => ({ slug: p.slug }));
}

/** A slug that is not one of the three 404s rather than rendering empty. */
export const dynamicParams = false;

const ART = {
  "sand-dunes": { hero: location.saharaDunes, detail: agency.fayoumDress },
  "pyramids-rooftop": { hero: agency.rooftopPortrait, detail: location.gizaPlateau },
  fayoum: { hero: location.fayoumArchway, detail: agency.fayoumDress },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pkg = packageBySlug(slug);
  if (!pkg) return fdMetadata({ title: "Not found", description: "", noindex: true });

  return fdMetadata({
    title: `${pkg.title} Flying Dress Photoshoot: $${pkg.priceUsd} per person`,
    description: `${pkg.intro} Includes the dress, door-to-door transport, an assistant and 100+ colour-graded photographs delivered in 6–10 days.`,
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
  const pkg = packageBySlug(slug);
  if (!pkg) notFound();

  const art = ART[pkg.slug as keyof typeof ART];
  const others = packages.filter((p) => p.slug !== pkg.slug);
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
          <nav aria-label="Breadcrumb" className="fd-eyebrow" style={{ marginBottom: "2rem" }}>
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
                <span className="fd-price">${pkg.priceUsd}</span>
                <span>per person</span>
                <span>30–45 minutes</span>
                <span>100+ photographs</span>
              </div>

              {/* The booking rail, not a hand-written CTA pair.
                  It asks productRail() whether this shoot is instantly
                  bookable and renders either the real deposit figures and the
                  PayPal path, or the enquiry path — so there is never a
                  booking button here that cannot take a booking. */}
              <BookingRail pkg={pkg} />

              <p style={{ marginTop: "1.25rem" }}>
                <a
                  className="fd-arrow-link"
                  href={whatsappHref(enquiryMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Or ask on WhatsApp
                  <span className="fd-sr"> (opens in a new tab)</span>
                </a>
              </p>
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
              {art.hero.credit ? (
                <figcaption className="fd-caption">{art.hero.credit}</figcaption>
              ) : null}
            </figure>
          </div>
        </div>
      </section>

      {/* Why this one, and how the photographs look. */}
      {/* WHY THE PRICE IS THE PRICE, read where the price is read.
          Only Fayoum carries one. It is $349 against $179 and $199, and the
          reason sat in an FAQ three screens below the number it explains. */}
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
              {art.detail.credit ? (
                <figcaption className="fd-caption">{art.detail.credit}</figcaption>
              ) : null}
            </figure>
          </div>
        </div>
      </section>

      {/* Included. */}
      <section className="fd-section-tight">
        <div className="fd-shell">
          <div style={{ maxWidth: "42rem", marginBottom: "2.5rem" }}>
            <p className="fd-eyebrow">Included at ${pkg.priceUsd} per person</p>
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

          <ul
            className="fd-grid"
            style={{ ["--fd-min" as string]: "5rem", listStyle: "none", margin: 0, padding: 0 }}
          >
            {dresses.map((dress) => (
              <li key={dress.id}>
                <Link
                  href={fdPath(`/enquire?package=${pkg.slug}&dress=${dress.id}`)}
                  title={`Enquire with the ${dress.name} dress`}
                  style={{ display: "block", textDecoration: "none", color: "inherit" }}
                >
                  <span
                    style={{
                      display: "block",
                      aspectRatio: "2 / 3",
                      background: dress.hex,
                      boxShadow: "inset 0 0 0 1px rgba(248,244,237,0.25)",
                    }}
                  />
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
            ))}
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
                    <span className="fd-price">${other.priceUsd}</span>
                    <span>per person</span>
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

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
