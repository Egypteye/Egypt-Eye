import type { Metadata } from "next";
import Link from "next/link";
import {
  fdAddOns,
  fdPackages,
  fdRentals,
  fdSettings,
  fdWardrobe,
} from "../_lib/content";
import { BookingRail, anyPackageTakesPaymentOnline } from "../_components/BookingRail";
import { ItemActions } from "../_components/ItemActions";
import { fdBreadcrumbJsonLd, fdJsonLd, fdMetadata, fdPath } from "../_lib/seo";

export const metadata: Metadata = fdMetadata({
  title: "Prices",
  description:
    "Flying-dress photoshoot prices in Egypt: Sand Dunes $179, Pyramids Rooftop $199, Fayoum $349, all per person, all including the dress, door-to-door transport, an assistant and 100+ colour-graded photographs. Extras and hire priced separately.",
  path: "/packages",
});

export default async function PackagesPage() {
  // Everything on this page is editable in the Studio. The content files
  // remain the fallback when no document has been published yet.
  const [settings, packages, addOns, rentalServices, wardrobe] = await Promise.all([
    fdSettings(),
    fdPackages(),
    fdAddOns(),
    fdRentals(),
    fdWardrobe(),
  ]);
  const { packageIncludes, payment, cancellation } = settings;
  const dresses = wardrobe.dresses;
  // Asked, not assumed. See anyPackageTakesPaymentOnline.
  const onlinePaymentIsOpen = await anyPackageTakesPaymentOnline(packages);

  return (
    <>
      <section className="fd-section-tight">
        <div className="fd-shell">
          <nav aria-label="Breadcrumb" className="fd-eyebrow fd-eyebrow-crumbs" style={{ marginBottom: "2rem" }}>
            <Link href={fdPath()} style={{ color: "inherit" }}>
              Home
            </Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">Prices</span>
          </nav>

          <div style={{ maxWidth: "46rem" }}>
            <h1 className="fd-display fd-h1">Prices</h1>
            <p className="fd-lead fd-muted" style={{ marginTop: "1.75rem" }}>
              Three photoshoots, priced per person. The session, the dress, the transport, the
              assistant and the photographs are the same in all three. What you are paying the
              difference for is the landscape and the drive.
            </p>
          </div>
        </div>
      </section>

      {/* The comparison. A real table, because this is tabular data and a
          three-card row would make the shared rows impossible to scan. It
          scrolls inside its own box on a phone rather than making the page
          scroll sideways. */}
      <section className="fd-section-tight">
        <div className="fd-shell">
          <div className="fd-table-wrap" tabIndex={0} role="group" aria-label="Price table, scrollable sideways">
            <table className="fd-table">
              <caption className="fd-sr">
                The three flying-dress photoshoots compared: price per person, distance from Cairo,
                and what the session gives you.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Photoshoot</th>
                  <th scope="col">Per person</th>
                  <th scope="col">Getting there</th>
                  <th scope="col">Session</th>
                  <th scope="col" />
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <tr key={pkg.slug}>
                    <th scope="row">
                      {pkg.title}
                      <span
                        className="fd-muted"
                        style={{
                          display: "block",
                          fontFamily: "var(--fd-sans)",
                          fontSize: "var(--fd-step--1)",
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          marginTop: "0.25rem",
                        }}
                      >
                        {pkg.eyebrow}
                      </span>
                    </th>
                    <td>
                      <span className="fd-price">${pkg.priceUsd}</span>
                    </td>
                    <td className="fd-muted" style={{ fontSize: "var(--fd-step--1)" }}>
                      {pkg.gettingThere}
                    </td>
                    <td className="fd-muted" style={{ fontSize: "var(--fd-step--1)" }}>
                      30 to 45 min · 100+ photographs · delivered in 6 to 10 days
                    </td>
                    <td>
                      <Link className="fd-arrow-link" href={fdPath(`/experiences/${pkg.slug}`)}>
                        See it
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Instant booking, one rail per shoot.

          Each rail asks productRail() about that shoot's Egypt Eye product
          and renders the real deposit percentage and price label, or the
          enquiry path when online deposits are not switched on. No figure on
          this page is a second copy of a price kept in this brand's content
          file. */}
      <section className="fd-section-tight" aria-labelledby="fd-book-heading">
        <div className="fd-shell">
          <div style={{ maxWidth: "44rem", marginBottom: "2.5rem" }}>
            <p className="fd-eyebrow">{onlinePaymentIsOpen ? "Book online" : "Reserve your date"}</p>
            <h2 id="fd-book-heading" className="fd-display fd-h3">
              {onlinePaymentIsOpen
                ? "Pay a deposit and choose your date now"
                : "Tell us your date and we will confirm it with you"}
            </h2>
            <p className="fd-muted" style={{ marginTop: "1.25rem" }}>
              {onlinePaymentIsOpen
                ? "Booking runs on the same secure PayPal checkout our team has used for every photoshoot. You pay a deposit online; the rest is settled with us and is never charged over the web."
                : "Online deposits are closed at the moment, so nothing is charged on this page. Send us the date you want and we will confirm availability and arrange payment with you directly. You will have the figures in writing before you pay anything."}
            </p>
          </div>

          <div className="fd-grid" style={{ ["--fd-min" as string]: "20rem" }}>
            {packages.map((pkg) => (
              <div key={pkg.slug}>
                <p className="fd-display fd-h4" style={{ margin: "0 0 1rem" }}>
                  {pkg.title}
                </p>
                <BookingRail pkg={pkg} />
                {/* Beside the rail, not instead of it: a deposit is the
                    fastest route for someone who has decided, and these two
                    are for everyone who has a question first. */}
                <ItemActions
                  label={pkg.title}
                  draft={{ subject: pkg.title, location: pkg.name }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="fd-section-tight fd-sand">
        <div className="fd-shell">
          <div style={{ maxWidth: "42rem", marginBottom: "2.5rem" }}>
            <p className="fd-eyebrow">In all three prices</p>
            <h2 className="fd-display fd-h3">What you are paying for</h2>
          </div>
          <ul className="fd-list fd-list-2">
            {packageIncludes.map((item) => (
              <li key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </li>
            ))}
          </ul>
          <p className="fd-note" style={{ marginTop: "2.5rem" }}>
            All {dresses.length} dresses in the collection are included. Choosing a colour does not
            change what you pay.
          </p>
        </div>
      </section>

      <section className="fd-section-tight">
        <div className="fd-shell fd-shell-narrow">
          <p className="fd-eyebrow">Extra, if you want it</p>
          <h2 className="fd-display fd-h3" style={{ marginBottom: "0.75rem" }}>
            Add-ons
          </h2>
          <p className="fd-muted" style={{ marginBottom: "2rem" }}>
            None of these is included in a photoshoot price, and nothing here is charged by this
            website. Anything shown as &ldquo;from&rdquo; is a starting price that we confirm with
            you before you commit.
          </p>

          <div className="fd-table-wrap" tabIndex={0} role="group" aria-label="Price table, scrollable sideways">
            <table className="fd-table">
              <caption className="fd-sr">Optional extras, their prices, and what each is.</caption>
              <thead>
                <tr>
                  <th scope="col">Extra</th>
                  <th scope="col">Price</th>
                  <th scope="col">What it is</th>
                </tr>
              </thead>
              <tbody>
                {addOns.map((addOn) => (
                  <tr key={addOn.id}>
                    <th
                      scope="row"
                      style={{ fontFamily: "var(--fd-sans)", fontSize: "var(--fd-step-0)" }}
                    >
                      {addOn.label}
                    </th>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {addOn.priceUsd === null ? (
                        <span className="fd-price-from">On request</span>
                      ) : (
                        <>
                          {addOn.fromPrice ? <span className="fd-price-from">from </span> : null}
                          <span className="fd-price">${addOn.priceUsd}</span>
                        </>
                      )}
                    </td>
                    <td className="fd-muted" style={{ fontSize: "var(--fd-step--1)" }}>
                      {addOn.detail}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Hire, kept visually separate from the priced packages — the brief's
          instruction to keep unverified offers away from confirmed ones, and
          the honest presentation either way. */}
      <section className="fd-section-tight fd-dark fd-on-dark">
        <div className="fd-shell">
          <div style={{ maxWidth: "44rem", marginBottom: "2.5rem" }}>
            <p className="fd-eyebrow">Not priced here</p>
            <h2 className="fd-display fd-h3">Hire without a photoshoot</h2>
            <p className="fd-muted" style={{ marginTop: "1.25rem" }}>
              Renting a dress, hiring accessories and hiring men&rsquo;s attire are quoted rather
              than priced, because the right figure depends on the garment, the dates and where you
              are staying. Ask and you get it in writing before anything is agreed.
            </p>
          </div>

          <ul className="fd-list fd-list-2">
            {rentalServices.map((service) => (
              <li key={service.slug}>
                <h3>
                  <Link href={fdPath(`/rentals/${service.slug}`)} style={{ color: "inherit" }}>
                    {service.title}
                  </Link>
                </h3>
                <p>{service.summary}</p>
              </li>
            ))}
          </ul>

          <div className="fd-actions" style={{ marginTop: "2.5rem" }}>
            <Link className="fd-btn" href={fdPath("/rentals")}>
              See the hire services
            </Link>
          </div>
        </div>
      </section>

      {/* Payment and changes. The cancellation terms are deliberately NOT
          published — see the note on `cancellation` in content/flyingDresses.ts:
          the brochure's 15-day and 7-day provisions overlap, and publishing
          one reading of contradictory terms as settled policy would bind the
          business to something it has not agreed. */}
      <section className="fd-section-tight fd-sand">
        <div className="fd-shell fd-shell-narrow">
          <p className="fd-eyebrow">Paying, and changing your mind</p>
          <h2 className="fd-display fd-h3" style={{ marginBottom: "1.5rem" }}>
            How payment works
          </h2>

          <ul className="fd-ticks" style={{ marginBottom: "2rem" }}>
            {payment.methods.map((method) => (
              <li key={method.label}>
                <span>
                  <strong style={{ fontWeight: 500 }}>{method.label}</strong>
                  {method.detail ? `: ${method.detail}` : null}
                </span>
              </li>
            ))}
          </ul>

          <p className="fd-note">{payment.note}</p>

          <h3 className="fd-display fd-h4" style={{ margin: "2.5rem 0 1rem" }}>
            Changes and cancellations
          </h3>
          <p className="fd-muted">{cancellation.summary}</p>
          {!cancellation.published ? (
            <p className="fd-note" style={{ marginTop: "1.5rem" }}>
              The full notice periods are not published on this page yet. They are confirmed in
              writing when we hold your date, and we would rather do that than print a version here
              that we then have to correct.
            </p>
          ) : null}
        </div>
      </section>

      <section className="fd-section-tight">
        <div className="fd-shell fd-shell-narrow fd-center">
          <h2 className="fd-display fd-h3" style={{ marginBottom: "1.5rem" }}>
            Tell us the date
          </h2>
          <div className="fd-actions" style={{ justifyContent: "center" }}>
            <Link className="fd-btn" href={fdPath("/enquire")}>
              Enquire now
            </Link>
            <Link className="fd-btn fd-btn-ghost" href={fdPath("/faq")}>
              Read the questions first
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
              { name: "Prices", path: "/packages" },
            ])
          ),
        }}
      />
    </>
  );
}
