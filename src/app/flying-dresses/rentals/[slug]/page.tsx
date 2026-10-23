import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RENTAL_DELIVERY_LABELS, flyingDressEnquiry, mailtoHref, whatsappHref } from "@/content/flyingDresses";
import { fdRentals, fdSettings, fdWardrobe } from "../../_lib/content";
import { FaqList } from "../../_components/FaqList";
import { Scene } from "../../_components/Scene";
import { Wardrobe } from "../../_components/Wardrobe";
import { AccessoryLookbook } from "../../_components/AccessoryLookbook";
import { accessoryCategories, accessoryItems } from "@/content/flyingDressAccessories";
import { empty } from "../../_lib/assets";
import {
  fdBreadcrumbJsonLd,
  fdFaqJsonLd,
  fdJsonLd,
  fdMetadata,
  fdPath,
} from "../../_lib/seo";

export async function generateStaticParams() {
  return (await fdRentals()).map((s) => ({ slug: s.slug }));
}

export const dynamicParams = false;

const ART = {
  "dress-rental": empty.dressRental,
  accessories: empty.accessories,
  "mens-wear": empty.mensGawn,
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = (await fdRentals()).find((s) => s.slug === slug);
  if (!service) return fdMetadata({ title: "Not found", description: "", noindex: true });

  return fdMetadata({
    title: service.title,
    description: service.summary,
    path: `/rentals/${service.slug}`,
  });
}

export default async function RentalServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = (await fdRentals()).find((s) => s.slug === slug);
  if (!service) notFound();

  const art = ART[service.slug as keyof typeof ART];
  const [{ payment }, rentalServices, { photos }] = await Promise.all([
    fdSettings(),
    fdRentals(),
    fdWardrobe(),
  ]);
  const others = rentalServices.filter((s) => s.slug !== service.slug);

  // The garments this service draws on. Empty for accessories, deliberately —
  // nothing has named a single accessory, so the grid is absent rather than
  // invented. See content/flyingDresses.ts.
  const dressesForService = service.outfits.filter((o) => o.category === "womens-dress");
  const mensForService = service.outfits.filter((o) => o.category === "mens-outfit");

  return (
    <>
      <section className="fd-section-tight">
        <div className="fd-shell">
          <nav aria-label="Breadcrumb" className="fd-eyebrow fd-eyebrow-crumbs" style={{ marginBottom: "2rem" }}>
            <Link href={fdPath()} style={{ color: "inherit" }}>
              Home
            </Link>
            <span aria-hidden="true"> / </span>
            <Link href={fdPath("/rentals")} style={{ color: "inherit" }}>
              Rent &amp; Hire
            </Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">{service.name}</span>
          </nav>

          <div className="fd-split">
            <div>
              <span className="fd-pill">{service.eyebrow}</span>
              <h1 className="fd-display fd-h1" style={{ marginTop: "1rem" }}>
                {service.title}
              </h1>
              <p className="fd-lead fd-muted" style={{ marginTop: "1.75rem" }}>
                {service.intro}
              </p>

              <div className="fd-tile-meta" style={{ marginBottom: "1.75rem" }}>
                <span className="fd-price-from">Price on request</span>
                {service.durationNote ? <span>{service.durationNote}</span> : null}
                {service.delivery.map((d) => (
                  <span key={d}>{RENTAL_DELIVERY_LABELS[d]}</span>
                ))}
              </div>

              <div className="fd-actions">
                <Link className="fd-btn" href={fdPath(`/enquire?service=${service.slug}`)}>
                  Ask for a price
                </Link>
                <a
                  className="fd-btn fd-btn-ghost"
                  href={mailtoHref({ subject: service.title })}
                >
                  Enquire by email
                </a>
                <a
                  className="fd-btn fd-btn-ghost"
                  href={whatsappHref(flyingDressEnquiry({ subject: service.title }))}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ask on WhatsApp
                  <span className="fd-sr"> (opens in a new tab)</span>
                </a>
              </div>
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
                credit={art.credit}
                priority
              />
            </figure>
          </div>
        </div>
      </section>

      {/* What you get, and — just as important for a hire — what you do not.
          Rental-only is the easiest product on this site to misread: someone
          could reasonably assume a dress comes with the rooftop. */}
      <section className="fd-section-tight fd-sand">
        <div className="fd-shell fd-split">
          <div>
            <p className="fd-eyebrow">What you get</p>
            <h2 className="fd-display fd-h3" style={{ marginBottom: "1.5rem" }}>
              Included
            </h2>
            <ul className="fd-ticks">
              {service.youGet.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          {service.notIncluded.length > 0 ? (
            <div>
              <p className="fd-eyebrow">What you do not</p>
              <h2 className="fd-display fd-h3" style={{ marginBottom: "1.5rem" }}>
                Not included
              </h2>
              <ul className="fd-ticks fd-crosses">
                {service.notIncluded.map((item) => (
                  <li key={item} className="fd-muted">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      {/* How it works. */}
      <section className="fd-section-tight">
        <div className="fd-shell">
          <div style={{ maxWidth: "42rem", marginBottom: "2.5rem" }}>
            <p className="fd-eyebrow">The process</p>
            <h2 className="fd-display fd-h3">How it works</h2>
          </div>
          <ol
            className="fd-list fd-list-2 fd-reveal-group"
            style={{ listStyle: "none", counterReset: "fd-step" }}
          >
            {service.howItWorks.map((step, index) => (
              <li key={step.title}>
                <h3>
                  <span className="fd-price-from" aria-hidden="true">
                    0{index + 1}
                  </span>
                  {step.title}
                </h3>
                <p>{step.detail}</p>
              </li>
            ))}
          </ol>

          <p className="fd-note" style={{ marginTop: "2.5rem" }}>
            {payment.note}
          </p>
        </div>
      </section>

      {/* The garments, where there are any to show. */}
      {service.outfits.length > 0 ? (
        <section className="fd-section-tight fd-dark fd-on-dark">
          <div className="fd-shell">
            <div style={{ maxWidth: "42rem", marginBottom: "2rem" }}>
              <p className="fd-eyebrow">The garments</p>
              <h2 className="fd-display fd-h3">
                {dressesForService.length > 0
                  ? `${dressesForService.length} dresses to choose from`
                  : `${mensForService.length} traditional styles`}
              </h2>
            </div>
            <Wardrobe
              dresses={dressesForService}
              mensOutfits={mensForService}
              photos={photos}
              showFilters={dressesForService.length > 4}
            />
          </div>
        </section>
      ) : null}

      {/* The accessories, on the one page that hires them. Rendered from the
          lookbook rather than from service.outfits, which is the booking
          picker's list — see the note on that field in content/flyingDresses. */}
      {service.slug === "accessories" ? (
        <section className="fd-section-tight">
          <div className="fd-shell">
            <div style={{ maxWidth: "42rem", marginBottom: "2rem" }}>
              <p className="fd-eyebrow">The collection</p>
              <h2 className="fd-display fd-h3">
                {accessoryItems.length} pieces, in {accessoryCategories.length} groups
              </h2>
            </div>
            <AccessoryLookbook />
          </div>
        </section>
      ) : null}

      <section className="fd-section-tight fd-sand">
        <div className="fd-shell fd-shell-narrow">
          <p className="fd-eyebrow">Questions</p>
          <h2 className="fd-display fd-h3" style={{ marginBottom: "2rem" }}>
            About {service.name.toLowerCase()}
          </h2>
          <FaqList faqs={service.faqs} />
        </div>
      </section>

      <section className="fd-section-tight">
        <div className="fd-shell">
          <p className="fd-eyebrow">Also available</p>
          <h2 className="fd-display fd-h3" style={{ marginBottom: "2rem" }}>
            The other hire services
          </h2>
          <div className="fd-grid" style={{ ["--fd-min" as string]: "18rem" }}>
            {others.map((other) => (
              <Link key={other.slug} className="fd-tile" href={fdPath(`/rentals/${other.slug}`)}>
                <span className="fd-tile-body" style={{ display: "block", paddingTop: 0 }}>
                  <span className="fd-pill">{other.eyebrow}</span>
                  <span className="fd-tile-title" style={{ display: "block", marginTop: "0.75rem" }}>
                    {other.title}
                  </span>
                  <span className="fd-muted" style={{ display: "block" }}>
                    {other.summary}
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
              { name: "Rent & Hire", path: "/rentals" },
              { name: service.name, path: `/rentals/${service.slug}` },
            ]),
            fdFaqJsonLd(service.faqs),
          ]),
        }}
      />
    </>
  );
}
