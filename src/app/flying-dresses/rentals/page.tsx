import type { Metadata } from "next";
import Link from "next/link";
import { RENTAL_DELIVERY_LABELS, rentalServices } from "@/content/flyingDresses";
import { Scene } from "../_components/Scene";
import { empty } from "../_lib/assets";
import { ItemActions } from "../_components/ItemActions";
import { fdBreadcrumbJsonLd, fdJsonLd, fdMetadata, fdPath } from "../_lib/seo";
import { wardrobeShareImage } from "../_lib/shareImages";

/**
 * The hire hub — the three services this build was commissioned to add.
 *
 * No prices anywhere on this page, and no placeholder figures. `RentalService`
 * has no price field at all (content/flyingDresses.ts), so there is nowhere in
 * the data for an invented number to live and nothing for a component to
 * render by accident. Every one of these says "price on request" and means it.
 */

export const metadata: Metadata = fdMetadata({
  image: wardrobeShareImage,
  title: "Rent & Hire",
  description:
    "Rent a flying dress without a photoshoot, hire accessories, or hire one of five traditional Egyptian gawns. Delivered to your hotel in Cairo or collected from us. Priced on request.",
  path: "/rentals",
});

const ART = {
  "dress-rental": empty.dressRental,
  accessories: empty.accessories,
  "mens-wear": empty.mensGawn,
} as const;

export default function RentalsPage() {
  return (
    <>
      <section className="fd-section-tight">
        <div className="fd-shell">
          <nav aria-label="Breadcrumb" className="fd-eyebrow fd-eyebrow-crumbs" style={{ marginBottom: "2rem" }}>
            <Link href={fdPath()} style={{ color: "inherit" }}>
              Home
            </Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">Rent &amp; Hire</span>
          </nav>

          <div style={{ maxWidth: "48rem" }}>
            <p className="fd-eyebrow">Without a photoshoot</p>
            <h1 className="fd-display fd-h1">Rent &amp; Hire</h1>
            <p className="fd-lead fd-muted" style={{ marginTop: "1.75rem" }}>
              Three ways to borrow the wardrobe without booking a session. Rent one dress from the
              collection of twelve and shoot it yourself, add accessories, or hire a traditional
              gawn, brought to your hotel in Cairo, or collected from us.
            </p>
          </div>
        </div>
      </section>

      <div className="fd-shell" style={{ display: "grid", gap: "var(--fd-section)" }}>
        {rentalServices.map((service, index) => {
          const art = ART[service.slug as keyof typeof ART];
          return (
            <article
              key={service.slug}
              className={`fd-split fd-reveal${index % 2 === 1 ? " fd-split-reverse" : ""}`}
            >
              <div>
                <span className="fd-pill">{service.eyebrow}</span>
                <h2 className="fd-display fd-h2" style={{ margin: "1rem 0 1.25rem" }}>
                  {service.title}
                </h2>
                <p className="fd-lead fd-muted">{service.intro}</p>

                {service.youGet.length > 0 ? (
                  <>
                    <p className="fd-eyebrow" style={{ marginTop: "2rem" }}>
                      What you get
                    </p>
                    <ul className="fd-ticks" style={{ marginBottom: "1.5rem" }}>
                      {service.youGet.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </>
                ) : null}

                <div className="fd-tile-meta" style={{ marginBottom: "1.75rem" }}>
                  <span className="fd-price-from">Price on request</span>
                  {service.delivery.map((d) => (
                    <span key={d}>{RENTAL_DELIVERY_LABELS[d]}</span>
                  ))}
                </div>

                <div className="fd-actions">
                  <Link className="fd-btn" href={fdPath(`/rentals/${service.slug}`)}>
                    {service.name} in full
                  </Link>
                  <Link
                    className="fd-btn fd-btn-ghost"
                    href={fdPath(`/enquire?service=${service.slug}`)}
                  >
                    Ask for a price
                  </Link>
                </div>

                <ItemActions label={service.title} draft={{ subject: service.title }} />
              </div>

              <figure>
                <Scene
                  src={art.src}
                  alt={art.alt}
                  width={art.width}
                  height={art.height}
                  ratio="fd-ratio-landscape"
                  sizes="(min-width: 60rem) 40vw, 92vw"
                  tone="neutral"
                  label={art.wanted}
                />
              </figure>
            </article>
          );
        })}
      </div>

      <section className="fd-section fd-dark fd-on-dark">
        <div className="fd-shell fd-shell-narrow">
          <p className="fd-eyebrow">Why there are no prices here</p>
          <h2 className="fd-display fd-h3" style={{ marginBottom: "1.5rem" }}>
            Because the right one depends on things we do not know yet
          </h2>
          <div className="fd-prose fd-muted">
            <p>
              A rental price depends on the garment, how long you want it, your dates and where in
              Cairo you are staying. We would rather send you one that is right than publish a
              figure here that turns out not to apply to you.
            </p>
            <p>
              Ask and you get the price, the length of the window and the terms, including anything
              held against damage, in writing, before you commit to anything. Nothing on this
              website charges a card.
            </p>
          </div>
          <div className="fd-actions" style={{ marginTop: "2.5rem" }}>
            <Link className="fd-btn" href={fdPath("/enquire")}>
              Ask for a price
            </Link>
            <Link className="fd-btn fd-btn-outline" href={fdPath("/experiences")}>
              Or see the photoshoots
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
              { name: "Rent & Hire", path: "/rentals" },
            ])
          ),
        }}
      />
    </>
  );
}
