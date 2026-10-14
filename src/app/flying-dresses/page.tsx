import type { Metadata } from "next";
import Link from "next/link";
import {
  addOns,
  brand,
  flyingDressEnquiry,
  packageIncludes,
  packages,
  rentalServices,
  whatsappHref,
} from "@/content/flyingDresses";
import { dresses, mensOutfits } from "@/content/flyingDresses";
import { Scene } from "./_components/Scene";
import { HeroVideo } from "./_components/HeroVideo";
import { agency, empty, location } from "./_lib/assets";
import { fdJsonLd, fdMetadata, fdPackagesJsonLd, fdPath } from "./_lib/seo";

/**
 * The home page.
 *
 * It is a single scroll with a deliberate order, not a stack of sections:
 *
 *   1  the hero                 — one frame, one claim, two ways in
 *   2  what it actually is      — the product, in four lines
 *   3  the rooftop story        — THE pinned scene. The only one on the site.
 *   4  the three locations      — alternating editorial panels, not three cards
 *   5  the wardrobe             — a horizontal rail of the twelve
 *   6  rent without a shoot     — the three hire services
 *   7  what every price includes
 *   8  the work                 — real photographs, and labelled gaps
 *   9  extras
 *  10  what we will not tell you — trust, built from facts rather than reviews
 *  11  the invitation
 *
 * Section 10 is where testimonials would normally go. There are none, because
 * nothing reachable in this build gave a quotable review with real
 * attribution, and inventing social proof is the one thing a photography brand
 * can never come back from. So that slot carries verifiable operational facts
 * instead, and says plainly that the reviews are not up yet.
 */

export const metadata: Metadata = fdMetadata({
  title: `${brand.name} | ${brand.tagline}`,
  description: brand.description,
});

/**
 * THE WORK GALLERY, section 8.
 *
 * Declared out here rather than inline so the sentence above the grid can be
 * counted from the same array the grid renders. The count is six because
 * .fd-gallery is pinned to 1, 2 or 3 columns and six divides evenly by all
 * three — the five cells this replaced sat in an auto-fill grid that landed on
 * four columns, stranding one frame in a row of its own.
 *
 * `empty.couple` stays in the list on purpose. It is the one subject the
 * agency has no photograph of, and a labelled gap is the brief's answer to
 * that, not a stock photograph standing in for client work.
 */
const galleryFrames = [
  agency.blueGownDesert,
  agency.whiteGownDune,
  agency.assistantAtWork,
  agency.fayoumDress,
  agency.rooftopPortrait,
  empty.couple,
];

/** How many of the above are real photographs. Drives the copy, so it cannot drift. */
const galleryOurs = galleryFrames.filter((frame) => frame.kind !== "empty").length;

export default function FlyingDressesHome() {
  return (
    <>
      {/* ================================================================
          1. THE HERO
          One photograph, the headline, the claim, two ways in.

          The image is a real photograph of the place rather than a flying
          dress, because the agency's own flying-dress files on this
          deployment are 800px on the long edge and would be visibly soft
          full-bleed. They appear at section 8, at a size they hold up at.
          ================================================================ */}
      <section className="fd-hero fd-on-dark">
        <div className="fd-hero-media">
          {/* The owner's own footage: a gold dress on the Giza rooftop, the
              pyramids behind it, from the Milya shoot. Twelve seconds, muted,
              looping, and not fetched at all for anyone who asked for less
              motion or turned Save-Data on — see HeroVideo. The poster is the
              video's own first frame, so there is no visible swap. */}
          <HeroVideo
            poster="/brand/flying-dresses/hero-poster.jpg"
            src="/brand/flying-dresses/hero.mp4"
            srcSmall="/brand/flying-dresses/hero-small.mp4"
            srcWebm="/brand/flying-dresses/hero.webm"
            alt="A gold flying dress turning on a rooftop above Giza, the pyramids on the skyline behind"
          />
        </div>
        <div className="fd-hero-scrim" aria-hidden="true" />

        <div className="fd-shell fd-hero-body">
          <p className="fd-eyebrow fd-enter">Cairo · Giza · Fayoum</p>
          <h1 className="fd-display fd-h1 fd-enter fd-enter-2">
            {brand.heroHeadline}
            <br />
            <span className="fd-italic">{brand.heroHeadlineAccent}</span>
          </h1>
          <p className="fd-hero-support fd-enter fd-enter-3">{brand.heroSupport}</p>
          <div className="fd-actions fd-enter fd-enter-4">
            <Link className="fd-btn" href={fdPath("/experiences")}>
              Discover your experience
            </Link>
            <Link className="fd-btn fd-btn-outline" href={fdPath("/wardrobe")}>
              Choose your dress
            </Link>
          </div>

          <div className="fd-cue" aria-hidden="true">
            <span className="fd-cue-line" />
            <span>Scroll</span>
          </div>
        </div>
      </section>

      {/* ================================================================
          2. WHAT IT ACTUALLY IS
          The product explained before anything is sold. The real
          flying-dress photograph sits here, at column width.
          ================================================================ */}
      <section className="fd-section">
        <div className="fd-shell fd-split">
          <div className="fd-reveal">
            <p className="fd-eyebrow">The experience</p>
            <h2 className="fd-display fd-h2">
              You bring yourself.
              <br />
              <span className="fd-italic">We bring everything else.</span>
            </h2>
            <hr className="fd-rule" style={{ marginTop: "1.75rem" }} />
            <div className="fd-prose fd-muted">
              <p>
                A car collects you from your hotel. A dress is waiting in the colour you chose.
                A photographer directs the whole session, and an assistant does the real work:
                holding the train, throwing it, keeping it out of the sand between frames.
              </p>
              <p>
                Thirty to forty-five minutes later it is done, and six to ten days after that more
                than a hundred colour-graded photographs arrive. You do not need to know how to
                pose. Nobody does. That is what the direction is for.
              </p>
            </div>
            <div className="fd-actions" style={{ marginTop: "2rem" }}>
              <Link className="fd-arrow-link" href={fdPath("/packages")}>
                See what is included
              </Link>
            </div>
          </div>

          <figure className="fd-reveal">
            <Scene
              src={agency.blueGownDesert.src}
              alt={agency.blueGownDesert.alt}
              width={agency.blueGownDesert.width}
              height={agency.blueGownDesert.height}
              ratio="fd-ratio-landscape"
              sizes="(min-width: 60rem) 36vw, 92vw"
              drift
              className="fd-fabric"
            />
            <figcaption className="fd-caption">{agency.blueGownDesert.credit}</figcaption>
          </figure>
        </div>
      </section>

      {/* ================================================================
          3. THE ROOFTOP STORY — the one pinned scene on the site.

          Pure sticky positioning. The browser's own scrolling is never
          intercepted, so a visitor who does not want the story can flick
          straight past it at any speed. Three viewports of track for three
          captions; without scroll-driven animation support, or with reduced
          motion, the three simply stack and read as a normal section.

          It earns the pin because it carries the single best competitive
          fact this brand has: the gates open at eight, and the roof has no
          gate.
          ================================================================ */}
      <section className="fd-pin" aria-labelledby="fd-rooftop-heading">
        <div className="fd-pin-track">
          <div className="fd-pin-stage fd-on-dark">
            <div className="fd-pin-media" aria-hidden="true">
              <Scene
                src={location.gizaHorseback.src}
                alt=""
                width={location.gizaHorseback.width}
                height={location.gizaHorseback.height}
                ratio=""
                sizes="100vw"
              />
            </div>

            <div className="fd-shell fd-pin-body">
              <h2 id="fd-rooftop-heading" className="fd-sr">
                The hour before the gates open
              </h2>
              <div className="fd-pin-steps">
                <div className="fd-pin-step">
                  <p className="fd-eyebrow">07:00</p>
                  <p className="fd-display fd-h2" style={{ maxWidth: "24ch" }}>
                    The Giza site does not open until eight.
                  </p>
                </div>
                <div className="fd-pin-step">
                  <p className="fd-eyebrow">The roof</p>
                  <p className="fd-display fd-h2" style={{ maxWidth: "24ch" }}>
                    From a rooftop there is no gate, and no ticket.
                  </p>
                </div>
                <div className="fd-pin-step">
                  <p className="fd-eyebrow">The frame</p>
                  <p className="fd-display fd-h2" style={{ maxWidth: "26ch" }}>
                    So the pyramids catch the first light, and nobody else is in it.
                  </p>
                  <div className="fd-actions" style={{ marginTop: "2rem" }}>
                    <Link className="fd-btn" href={fdPath("/experiences/pyramids-rooftop")}>
                      The rooftop shoot: $199
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          4. THE THREE LOCATIONS
          Alternating full-width editorial panels. Deliberately NOT three
          identical cards in a row: the three are a 45-minute morning, a
          rooftop at dawn and a three-hour drive to a lake, and a card grid
          would ask a visitor to compare them as if they were the same shape
          of thing.
          ================================================================ */}
      <section className="fd-section fd-sand" aria-labelledby="fd-locations-heading">
        <div className="fd-shell">
          <div style={{ maxWidth: "46rem", marginBottom: "clamp(2.5rem, 1rem + 5vw, 5rem)" }}>
            <p className="fd-eyebrow">Three places</p>
            <h2 id="fd-locations-heading" className="fd-display fd-h2">
              Dunes, a rooftop, and a lake in the desert
            </h2>
          </div>
        </div>

        <div className="fd-shell" style={{ display: "grid", gap: "var(--fd-section)" }}>
          {packages.map((pkg, index) => {
            const art =
              pkg.slug === "sand-dunes"
                ? location.saharaDunes
                : pkg.slug === "pyramids-rooftop"
                  ? agency.rooftopPortrait
                  : location.fayoumArchway;

            return (
              <article
                key={pkg.slug}
                className={`fd-split fd-reveal${index % 2 === 1 ? " fd-split-reverse" : ""}`}
              >
                <div>
                  <p className="fd-eyebrow">{pkg.eyebrow}</p>
                  <h3 className="fd-display fd-h3" style={{ margin: "0 0 1rem" }}>
                    {pkg.title}
                  </h3>
                  <p className="fd-lead fd-muted">{pkg.intro}</p>

                  <ul className="fd-ticks" style={{ margin: "0 0 1.75rem" }}>
                    {pkg.whyThis.map((why) => (
                      <li key={why}>{why}</li>
                    ))}
                  </ul>

                  <div className="fd-tile-meta" style={{ marginBottom: "1.5rem" }}>
                    <span className="fd-price">${pkg.priceUsd}</span>
                    <span>per person</span>
                    <span>30–45 minutes</span>
                  </div>

                  <div className="fd-actions">
                    <Link className="fd-btn fd-btn-ghost" href={fdPath(`/experiences/${pkg.slug}`)}>
                      {pkg.name} in full
                    </Link>
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
      </section>

      {/* ================================================================
          5. THE WARDROBE
          A horizontal rail: native overflow scrolling with snap points. No
          JS, no wheel hijack, swipeable on a phone and scrollable with a
          trackpad. Each item is a real link, so tabbing walks the rail and
          the browser scrolls it into view by itself.
          ================================================================ */}
      <section className="fd-section fd-dark fd-on-dark" aria-labelledby="fd-wardrobe-heading">
        <div className="fd-shell">
          <div className="fd-split" style={{ alignItems: "end", marginBottom: "2.5rem" }}>
            <div>
              <p className="fd-eyebrow">The wardrobe</p>
              <h2 id="fd-wardrobe-heading" className="fd-display fd-h2">
                Twelve dresses.
                <br />
                <span className="fd-italic">One of them is yours for the morning.</span>
              </h2>
            </div>
            <p className="fd-muted" style={{ margin: 0 }}>
              Every dress in the collection is included in the price. Choosing one does not change
              what you pay, and there are five traditional gawns for a partner in the frame.
            </p>
          </div>
        </div>

        {/* Negative margins let the rail run to the viewport edge while its
            own padding keeps the first and last card off the edge. */}
        {/* The scrollable region is the DIV, not the list.
            role="group" on the <ul> removed its list semantics, which left all
            twelve <li> reported by axe as "list item parent element has a role
            that is not role=list" — so a screen reader announced twelve
            orphaned items instead of a list of twelve dresses. The group and
            the keyboard focus belong on the scroll container; the list stays a
            list. */}
        <div style={{ marginInline: "calc(var(--fd-gutter) * -1)" }}>
          <div
            tabIndex={0}
            role="group"
            aria-label="The dress collection: scroll sideways to see all twelve"
          >
          <ul className="fd-rail" style={{ listStyle: "none", margin: 0 }}>
            {dresses.map((dress) => (
              <li key={dress.id}>
                <Link className="fd-tile" href={fdPath(`/wardrobe?dress=${dress.id}`)}>
                  <span
                    className="fd-tile-media fd-ratio-landscape"
                    style={{ display: "block", background: dress.hex }}
                  />
                  <span className="fd-tile-body" style={{ display: "block" }}>
                    <span className="fd-tile-title" style={{ display: "block" }}>
                      {dress.name}
                    </span>
                    <span className="fd-tile-meta">Photo coming soon</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          </div>
        </div>

        <div className="fd-shell">
          <p className="fd-rail-hint fd-muted" style={{ color: "var(--fd-ivory-dim)" }}>
            <span aria-hidden="true">→</span> Scroll sideways · colour swatches until the
            photographs are shot
          </p>
          <div className="fd-actions" style={{ marginTop: "1.5rem" }}>
            <Link className="fd-btn" href={fdPath("/wardrobe")}>
              Open the wardrobe
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================
          6. RENT WITHOUT A SHOOT — the three hire services.

          Given a full section rather than a footnote, because research found
          rental-only established in Cappadocia and no Egyptian operator
          selling it at all. See docs/INSPIRATION-RESEARCH.md §5.
          ================================================================ */}
      <section className="fd-section" aria-labelledby="fd-hire-heading">
        <div className="fd-shell">
          <div style={{ maxWidth: "44rem", marginBottom: "3rem" }}>
            <p className="fd-eyebrow">Rent &amp; hire</p>
            <h2 id="fd-hire-heading" className="fd-display fd-h2">
              Or take the dress and shoot it yourself
            </h2>
            <p className="fd-lead fd-muted" style={{ marginTop: "1.5rem" }}>
              Not everyone needs a photographer. Rent one dress from the same collection of twelve,
              add accessories, or hire a traditional gawn, delivered to your hotel in Cairo, or
              collected from us.
            </p>
          </div>

          <div className="fd-grid fd-reveal-group" style={{ ["--fd-min" as string]: "17rem" }}>
            {rentalServices.map((service) => {
              const art =
                service.slug === "dress-rental"
                  ? empty.dressRental
                  : service.slug === "accessories"
                    ? empty.accessories
                    : empty.mensGawn;

              return (
                <Link key={service.slug} className="fd-tile" href={fdPath(`/rentals/${service.slug}`)}>
                  <span className="fd-tile-media" style={{ display: "block" }}>
                    <Scene
                      src={art.src}
                      alt={art.alt}
                      width={art.width}
                      height={art.height}
                      ratio="fd-ratio-landscape"
                      tone="neutral"
                      label={art.wanted}
                    />
                  </span>
                  <span className="fd-tile-body" style={{ display: "block" }}>
                    <span className="fd-pill">{service.eyebrow}</span>
                    <span className="fd-tile-title" style={{ display: "block", marginTop: "0.75rem" }}>
                      {service.name}
                    </span>
                    <span className="fd-muted" style={{ display: "block", marginBottom: "0.75rem" }}>
                      {service.summary}
                    </span>
                    <span className="fd-tile-meta">
                      <span className="fd-price-from">Price on request</span>
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>

          <p className="fd-note" style={{ marginTop: "2.5rem" }}>
            Rental, accessories and men&rsquo;s attire are quoted rather than priced on this page.
            We would rather send you a price that is right for the garment, the dates and where you
            are staying than publish one here that turns out not to apply. You get it in writing
            before anything is agreed.
          </p>
        </div>
      </section>

      {/* ================================================================
          7. WHAT EVERY PRICE INCLUDES
          High on the page, not buried. Research: competitors listing the
          same $180 hour deliver six to twenty-five photographs, so the
          inclusions are this brand's strongest commercial asset.
          ================================================================ */}
      <section className="fd-section fd-sand" aria-labelledby="fd-included-heading">
        <div className="fd-shell">
          <div style={{ maxWidth: "44rem", marginBottom: "3rem" }}>
            <p className="fd-eyebrow">Included in every shoot</p>
            <h2 id="fd-included-heading" className="fd-display fd-h2">
              Six things, in every price
            </h2>
          </div>

          <ul className="fd-list fd-list-2 fd-reveal-group">
            {packageIncludes.map((item) => (
              <li key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ================================================================
          8. THE WORK
          An offset grid mixing a tall portrait, a wide landscape and
          labelled gaps — rather than a uniform wall, which would flatten
          the three locations into one beige.

          Two of these are the agency's real photographs, captioned with the
          collaboration they came from. The rest are honest, labelled gaps.
          ================================================================ */}
      <section className="fd-section" aria-labelledby="fd-work-heading">
        <div className="fd-shell">
          <div className="fd-split" style={{ alignItems: "end", marginBottom: "3rem" }}>
            <div>
              <p className="fd-eyebrow">The work</p>
              <h2 id="fd-work-heading" className="fd-display fd-h2">
                What a morning looks like
              </h2>
            </div>
            {/* COUNTED, NOT TYPED.
                This read "Two frames here are ours" for as long as two were,
                and stayed that way on the day four more arrived — a sentence
                on the page disagreeing with the pictures beside it. The
                numbers come from the gallery below now, so the claim cannot
                drift from what is actually shown. */}
            <p className="fd-muted" style={{ margin: 0 }}>
              {galleryOurs === galleryFrames.length
                ? "Every frame here is ours, from real client mornings."
                : `${galleryOurs} of these ${galleryFrames.length} frames are ours. The rest are marked as waiting for photographs.`}{" "}
              We would rather show you a labelled gap than a stock photograph you might mistake
              for our work.
            </p>
          </div>

          {/* ONE LIST, ONE SHAPE, EVERY CELL THE SAME.
              This was two hand-written figures plus a mapped three, the first
              of them carrying `gridRow: span 2`. With five cells in a
              four-column grid that left one stranded in the second row under
              nothing, and only the hand-written two had captions, so the rows
              did not line up either. A gallery of a photographer's work is the
              last place on a site that should look unconsidered.

              Every frame is now the same 3:2 cell with a caption line under
              it, captioned or deliberately blank, so the baselines align
              whatever the mix of real photographs and gaps happens to be. */}
          <div className="fd-gallery fd-reveal-group">
            {galleryFrames.map((frame) => (
              <figure key={frame.alt}>
                <Scene
                  src={frame.src}
                  alt={frame.alt}
                  width={frame.width}
                  height={frame.height}
                  ratio="fd-ratio-landscape"
                  tone="neutral"
                  sizes="(min-width: 60rem) 30vw, 92vw"
                  label={frame.wanted}
                  drift={frame.kind !== "empty"}
                />
                <figcaption className="fd-caption">
                  {frame.credit ?? (frame.kind === "empty" ? "Photograph to come" : "")}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          9. EXTRAS
          "from" prices keep their qualification, and anything with no price
          says so rather than showing a zero.
          ================================================================ */}
      <section className="fd-section-tight" aria-labelledby="fd-extras-heading">
        <div className="fd-shell fd-shell-narrow">
          <p className="fd-eyebrow">Add if you want it</p>
          <h2 id="fd-extras-heading" className="fd-display fd-h3" style={{ marginBottom: "2rem" }}>
            Makeup, hair, reels, a second dress
          </h2>

          <div className="fd-table-wrap" tabIndex={0} role="group" aria-label="Optional extras and their prices, scrollable sideways">
            <table className="fd-table">
              <caption className="fd-sr">
                Optional extras and their prices. Some are starting prices and some are quoted on
                request.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Extra</th>
                  <th scope="col">Price</th>
                  <th scope="col">Notes</th>
                </tr>
              </thead>
              <tbody>
                {addOns.map((addOn) => (
                  <tr key={addOn.id}>
                    <th scope="row">{addOn.label}</th>
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

      {/* ================================================================
          10. TRUST, WITHOUT TESTIMONIALS
          See the note at the top of this file.
          ================================================================ */}
      <section className="fd-section fd-dark fd-on-dark" aria-labelledby="fd-trust-heading">
        <div className="fd-shell">
          <div style={{ maxWidth: "44rem", marginBottom: "3rem" }}>
            <p className="fd-eyebrow">Straight answers</p>
            <h2 id="fd-trust-heading" className="fd-display fd-h2">
              What we will and will not promise
            </h2>
          </div>

          <ul className="fd-list fd-list-2">
            <li>
              <h3>The dress is a preference, not a reservation</h3>
              <p>
                We note the colour you choose and have it ready for you. If it is unavailable on the
                day we contact you before your shoot, rather than promising a specific garment three
                weeks out and sorting it out on the roof.
              </p>
            </li>
            <li>
              <h3>Nothing is charged on this website</h3>
              <p>
                There is no checkout here and we will never ask you to type card details into a form
                on this site. Visa, MasterCard, PayPal and bank transfer are arranged directly with
                us.
              </p>
            </li>
            <li>
              <h3>We cannot promise the sunset</h3>
              <p>
                The rooftop closes before the earliest sunset of the year. Afternoon sessions run and
                the light is good; the sunset itself is not ours to sell.
              </p>
            </li>
            <li>
              <h3>There are no reviews on this page yet</h3>
              <p>
                Not because there is nothing to say, but because we would rather publish real ones
                with real names attached than a star rating nobody can trace. They go here when they
                are collected.
              </p>
            </li>
          </ul>
        </div>
      </section>

      {/* ================================================================
          11. THE INVITATION
          ================================================================ */}
      <section className="fd-section" aria-labelledby="fd-invite-heading">
        <div className="fd-shell fd-shell-narrow fd-center">
          <p className="fd-script">So, which colour?</p>
          <h2
            id="fd-invite-heading"
            className="fd-display fd-h2"
            style={{ marginTop: "0.5rem", marginBottom: "1.5rem" }}
          >
            Tell us the date and we will tell you what is possible
          </h2>
          <hr className="fd-rule fd-rule-center" />
          <p className="fd-lead fd-muted" style={{ marginInline: "auto" }}>
            Send the form and you get a reply from a person, about the date, the dress, and the
            price where it is not published here. Or message us and ask one question.
          </p>
          <div
            className="fd-actions"
            style={{ justifyContent: "center", marginTop: "2.5rem" }}
          >
            <Link className="fd-btn" href={fdPath("/enquire")}>
              Plan your photoshoot
            </Link>
            <a
              className="fd-btn fd-btn-ghost"
              href={whatsappHref(flyingDressEnquiry())}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ask on WhatsApp
              <span className="fd-sr"> (opens in a new tab)</span>
            </a>
          </div>
          <p className="fd-muted" style={{ fontSize: "var(--fd-step--1)", marginTop: "1.5rem" }}>
            {mensOutfits.length} traditional styles for men · {dresses.length} dresses · Cairo,
            Giza and Fayoum
          </p>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: fdJsonLd(fdPackagesJsonLd()) }}
      />
    </>
  );
}
