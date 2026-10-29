import Link from "next/link";
import { Scene } from "./Scene";
import { FaqList } from "./FaqList";
import { ProductionReel } from "./ProductionReel";
import { agency } from "../_lib/assets";
import { fdPath } from "../_lib/seo";
import { mergeFaqs } from "@/content/flyingDressExperiences";
import {
  SERVICE_DELIVERY_LABEL,
  additionalHourDiscountDisplay,
  additionalHourDisplay,
  audiences,
  bookingTerms,
  creatorFaqs,
  creatorSteps,
  creatorsVenue,
  depositDisplay,
  hourlyDisplay,
  limits,
  optionalServices,
  productionClips,
  rooftopAccess,
} from "@/content/flyingDressCreators";

/**
 * CREATOR, EDITORIAL AND BRAND SHOOTS.
 *
 * =========================================================================
 * WHY THIS ROUTE NOW COMPOSES ITS OWN BODY
 * =========================================================================
 * It is the second category in this section to need it, and for the same
 * reason as the first. The shared ExperienceDetail renderer has nowhere to put
 * an hourly rate, nowhere to put a discount that applies to one line and not
 * another, and nowhere to put a deposit. The owner's October 2026 brief
 * supplied all three.
 *
 * The URL, the metadata, the breadcrumbs, the FAQ structured data and the
 * sibling rail all stay with the route, exactly as they do for the music page
 * and the celebration pages. ONLY THE BODY DIFFERS. No new page was created,
 * nothing was duplicated, and the category record is untouched.
 *
 * =========================================================================
 * THE ORDER OF THE PAGE IS AN ARGUMENT
 * =========================================================================
 * A brand arrives asking three questions in this order: can I shoot there,
 * what does it cost, and can you prove it works. So:
 *
 *   1. The rate, immediately, because it is the most persuasive fact here.
 *   2. The venue, including the nine pyramids and the permit point.
 *   3. THE FOOTAGE, because everything above it is a claim until this.
 *   4. What the rate does and does not cover, before the audiences, so
 *      nobody reads the audience section as a package description.
 *   5. Audiences, services, terms, limits, sequence, questions.
 *
 * The footage sits third rather than last on purpose. It is a real crew
 * working this roof, and it answers "can you prove it" before the reader has
 * spent any patience on the sections that assume the answer is yes.
 *
 * =========================================================================
 * EVERY PRICE ON THIS PAGE COMES FROM ONE PLACE
 * =========================================================================
 * flyingDressCreators.ts holds the rate, the discount and the deposit, and the
 * figures below are its computed display strings. $135 is NEVER TYPED here: it
 * is $150 less 10%, derived. A hard-coded price in this file would survive the
 * owner changing the rate, and the check script fails on one.
 */

export function CreatorShootsPage({
  experience,
}: {
  experience: { faqs: { question: string; answer: string }[] };
}) {
  // The only still from the production delivery that is publishable today.
  // The wide deck frame carried the venue's wordmark and is withheld until
  // the owner releases the venue name: see _lib/assets.ts.
  const hero = agency.productionDecks;
  const enquire = fdPath("/enquire?experience=creator-session");

  return (
    <>
      {/* ---------------------------------------------------------------
          1. THE RATE, FIRST. A commercial location is chosen on price and
          access, in that order, and the figure is the strongest thing
          this page has. The unit is never separated from the number.
          --------------------------------------------------------------- */}
      <section className="fd-section-tight fd-section-lede">
        <div className="fd-shell">
          <div style={{ maxWidth: "46rem" }}>
            <p className="fd-eyebrow">Brands, agencies and production teams</p>
            <h2 className="fd-display fd-h2" style={{ marginTop: "0.9rem" }}>
              Shoot above the Giza plateau, by the hour
            </h2>
            <p className="fd-lead fd-muted" style={{ marginTop: "1.5rem" }}>
              A private rooftop looking out over all nine pyramids, rented by the hour with no
              minimum booking. Bring your own crew and shoot it yourself, or have us produce the
              whole day around you.
            </p>
            <p className="fd-display fd-h3" style={{ marginTop: "2rem" }}>
              {hourlyDisplay}
            </p>
            <p className="fd-muted" style={{ marginTop: "0.5rem", fontSize: "var(--fd-step--1)" }}>
              {additionalHourDisplay} after the first. {depositDisplay} of the agreed total secures
              your date. The rate is for the rooftop: production services are quoted separately.
            </p>
            <div className="fd-actions" style={{ marginTop: "2rem" }}>
              <Link className="fd-btn" href={enquire}>
                Enquire about a shoot
              </Link>
              <a className="fd-btn fd-btn-ghost" href="#footage">
                See the roof working
              </a>
            </div>
          </div>
        </div>
      </section>

      {hero.src ? (
        <section className="fd-section-tight" style={{ paddingTop: 0 }}>
          <div className="fd-shell">
            <Scene
              src={hero.src}
              alt={hero.alt}
              width={hero.width}
              height={hero.height}
              ratio="fd-ratio-landscape"
              sizes="(min-width: 60rem) 72rem, 94vw"
              priority
              credit={hero.credit}
            />
          </div>
        </section>
      ) : null}

      {/* ---------------------------------------------------------------
          2. THE VENUE. Nine pyramids, said once and said properly, and
          the permit point, which is the argument a production team
          actually cares about.
          --------------------------------------------------------------- */}
      <section className="fd-section-tight">
        <div className="fd-shell">
          <div style={{ maxWidth: "46rem", marginBottom: "2.5rem" }}>
            <p className="fd-eyebrow">The location</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              {creatorsVenue.heading}
            </h2>
            <p className="fd-muted" style={{ marginTop: "1rem" }}>
              {creatorsVenue.lede}
            </p>
          </div>
          <ul className="fd-list fd-list-2">
            {creatorsVenue.points.map((point) => (
              <li key={point.title}>
                <h3>{point.title}</h3>
                <p>{point.detail}</p>
              </li>
            ))}
          </ul>
          {/* The preparation room. A facility, never an inclusion: the
              owner's own brief said its conditions must be verified. */}
          <div className="fd-note" style={{ marginTop: "2.5rem", maxWidth: "46rem" }}>
            <p style={{ margin: "0 0 0.75rem", fontWeight: 500, color: "var(--fd-ink)" }}>
              Changing and preparation
            </p>
            <p style={{ margin: "0 0 0.75rem" }}>{creatorsVenue.preparationRoom}</p>
            <p style={{ margin: 0 }}>{creatorsVenue.dependency}</p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          3. THE FOOTAGE. Everything above this is a claim until here.
          --------------------------------------------------------------- */}
      <ProductionReel
        clips={productionClips}
        heading="A production, on this roof, filmed as it ran"
        intro="These are our own clips from a commercial shoot on this rooftop: a live set, filmed with a camera rig across one evening. It was a music production rather than a brand campaign, so take it for what it is, which is the thing worth proving. A crew loaded in, built a set, lit it and worked through golden hour into the dark on this roof. They are silent because the original audio is the artist's set."
      />

      {/* ---------------------------------------------------------------
          4. WHAT THE RATE COVERS, AND WHAT IT IS NOT. Before the
          audiences, so nothing below is read as a package.
          --------------------------------------------------------------- */}
      <section className="fd-section-tight">
        <div className="fd-shell fd-split">
          <div>
            <p className="fd-eyebrow">The booking</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              {rooftopAccess.heading}
            </h2>
            <p className="fd-muted" style={{ marginTop: "1rem" }}>
              {rooftopAccess.lede}
            </p>
            <ul className="fd-list" style={{ marginTop: "1.5rem" }}>
              {rooftopAccess.covers.map((line) => (
                <li key={line}>
                  <p>{line}</p>
                </li>
              ))}
            </ul>
          </div>
          <aside>
            <div className="fd-note">
              <p style={{ margin: "0 0 0.75rem", fontWeight: 500, color: "var(--fd-ink)" }}>
                What the hourly rate does not cover
              </p>
              <p style={{ margin: 0 }}>{rooftopAccess.excludes}</p>
            </div>
          </aside>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          5. THE TERMS. Four facts, all from the brief, and the record of
          what has deliberately not been set.
          --------------------------------------------------------------- */}
      <section className="fd-section-tight fd-sand">
        <div className="fd-shell">
          <div style={{ maxWidth: "46rem", marginBottom: "2.5rem" }}>
            <p className="fd-eyebrow">Rates and terms</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              {bookingTerms.heading}
            </h2>
          </div>
          <ul className="fd-list fd-list-2">
            <li>
              <h3>{hourlyDisplay}</h3>
              <p>{bookingTerms.hourly}</p>
            </li>
            <li>
              <h3>No minimum booking</h3>
              <p>{bookingTerms.noMinimum}</p>
            </li>
            <li>
              <h3>{additionalHourDisplay}</h3>
              <p>
                {bookingTerms.additionalHours} The reduction is{" "}
                {additionalHourDiscountDisplay} on each hour after the first.
              </p>
            </li>
            <li>
              <h3>{depositDisplay} deposit</h3>
              <p>{bookingTerms.deposit}</p>
            </li>
          </ul>
          <div className="fd-note" style={{ marginTop: "2.5rem", maxWidth: "46rem" }}>
            <p style={{ margin: "0 0 0.75rem" }}>{bookingTerms.optionalServicesNote}</p>
            <p style={{ margin: 0 }}>{bookingTerms.termsNotSet}</p>
          </div>
        </div>
      </section>

      {/* 6. WHO IT IS FOR. The brief's four audiences, in its order. */}
      <section className="fd-section-tight">
        <div className="fd-shell">
          <div style={{ maxWidth: "46rem", marginBottom: "2.5rem" }}>
            <p className="fd-eyebrow">Who books it</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              Built for commercial work
            </h2>
            <p className="fd-muted" style={{ marginTop: "1rem" }}>
              The roof takes a one-person content day and a full crew equally well. What changes
              between them is the planning, not the location.
            </p>
          </div>
          <ul className="fd-list fd-list-2">
            {audiences.map((audience) => (
              <li key={audience.id}>
                <h3>{audience.name}</h3>
                <p>{audience.detail}</p>
                <ul className="fd-list" style={{ marginTop: "0.75rem" }}>
                  {audience.uses.map((use) => (
                    <li key={use}>
                      <p>{use}</p>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 7. THE OPTIONAL SERVICES. Seven, none of them priced. */}
      <section className="fd-section-tight fd-sand">
        <div className="fd-shell">
          <div style={{ maxWidth: "46rem", marginBottom: "2.5rem" }}>
            <p className="fd-eyebrow">Build it up</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              Everything else, quoted separately
            </h2>
            <p className="fd-muted" style={{ marginTop: "1rem" }}>
              Take all of it, some of it, or none. The roof on its own is a real booking, and
              nothing below carries a published price: each is quoted for the shoot you describe.
            </p>
          </div>
          <ul className="fd-list fd-list-2">
            {optionalServices.map((service) => (
              <li key={service.id}>
                <h3>
                  {service.name}{" "}
                  <span
                    className={`fd-charge fd-charge-${
                      service.delivery === "in-house" ? "confirm" : "extra"
                    }`}
                  >
                    {SERVICE_DELIVERY_LABEL[service.delivery]}
                  </span>
                </h3>
                <p>{service.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 8. THE LIMITS. Both carried from the record, both still true. */}
      <section className="fd-section-tight">
        <div className="fd-shell">
          <div style={{ maxWidth: "46rem", marginBottom: "2.5rem" }}>
            <p className="fd-eyebrow">Before you plan around it</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              {limits.heading}
            </h2>
          </div>
          <ul className="fd-list fd-list-2">
            {limits.points.map((point) => (
              <li key={point.title}>
                <h3>{point.title}</h3>
                <p>{point.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 9. THE SEQUENCE. */}
      <section className="fd-section-tight fd-sand">
        <div className="fd-shell">
          <div style={{ maxWidth: "46rem", marginBottom: "2.5rem" }}>
            <p className="fd-eyebrow">How it works</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              From the first message to delivery
            </h2>
          </div>
          <ol className="fd-steps">
            {creatorSteps.map((step, i) => (
              <li key={step.title}>
                <span className="fd-step-num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="fd-step-body">
                  <span className="fd-step-title">{step.title}</span>
                  <span className="fd-step-detail">{step.detail}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 10. The questions. The record's own three are merged in so the
          page and the FAQ structured data built by the route cannot
          drift apart. */}
      <section className="fd-section-tight">
        <div className="fd-shell">
          <h2 className="fd-display fd-h3" style={{ marginBottom: "2rem" }}>
            Questions
          </h2>
          <FaqList faqs={mergeFaqs(experience.faqs, creatorFaqs)} headingLevel={3} />
        </div>
      </section>

      {/* 11. The last word. */}
      <section className="fd-section-tight fd-sand">
        <div className="fd-shell" style={{ maxWidth: "46rem" }}>
          <h2 className="fd-display fd-h3">Tell us about the shoot</h2>
          <p className="fd-muted" style={{ marginTop: "1rem" }}>
            The date, roughly how many hours, what you are producing and whether it is commercial.
            We put it to the venue and come back with what is possible and what it costs, in
            writing, before anything is committed.
          </p>
          <div className="fd-actions" style={{ marginTop: "2rem" }}>
            <Link className="fd-btn" href={enquire}>
              Enquire about a shoot
            </Link>
            <Link className="fd-btn fd-btn-ghost" href={fdPath("/faq")}>
              Ask a question first
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
