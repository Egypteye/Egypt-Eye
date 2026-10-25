import Link from "next/link";
import { Scene } from "./Scene";
import { FaqList } from "./FaqList";
import { PhotoGallery, type GalleryFrame } from "./PhotoGallery";
import { agency } from "../_lib/assets";
import { fdPath } from "../_lib/seo";
import { mergeFaqs, type ExperienceFaq } from "@/content/flyingDressExperiences";
import { occasionVenue, type Occasion } from "@/content/flyingDressOccasions";
import {
  RATES_EVENT_PHOTOGRAPHY,
  RATES_INCLUDE_DECORATION,
  RATES_TERMS_NOT_SET,
} from "@/content/flyingDressRates";
import { liveStoryBySlug } from "@/content/flyingDressStories";

/**
 * ONE COMPOSITION FOR THREE OCCASIONS.
 *
 * =========================================================================
 * WHY NOT THREE PAGES
 * =========================================================================
 * The proposal, the gender reveal, the celebration and the music session each
 * got their own component because each sells something structurally different:
 * a secret, a two-second moment, an evening with guests, a rate card with
 * production on top. Anniversaries, maternity and vow renewals do not differ
 * that way. All three are a rooftop, an included decoration, a directed
 * session and photographs afterwards.
 *
 * Three components differing only in their nouns is how four pages drift apart
 * over a year, and this repository has the scars: a gallery that lost its CSS
 * in a rename, an intro claiming two frames were ours on the day four were.
 * So the shape is here and everything that differs is data in
 * content/flyingDressOccasions.ts, including the one section each occasion
 * genuinely needs that the other two do not.
 *
 * =========================================================================
 * THE RATES
 * =========================================================================
 * Read from content/flyingDressRates.ts, never typed here, because the only
 * way two pages quote different figures at one customer is if two pages hold
 * their own copy. Every rate renders with its unit attached: $150 is per HOUR
 * and $200 is per PERSON, and either rendered bare is wrong by a factor.
 *
 * A SESSION IS PRICED PER PERSON, AN EVENT IS THE ROOM BY THE HOUR. The vow
 * renewal is the event, so it also carries the line saying event photography
 * is charged separately. `pricing.isEvent` decides that rather than the copy.
 */

/** A gap is not a button and is not in the lightbox. See PhotoGallery. */
function buildFrames(occasion: Occasion): GalleryFrame[] {
  return occasion.frames
    .map((frame): GalleryFrame | null => {
      if (frame.slot === null) {
        return {
          src: null,
          alt: frame.alt ?? frame.wanted ?? "",
          wanted: frame.wanted,
          span: frame.span,
          caption: frame.caption,
        };
      }
      const slot = agency[frame.slot as keyof typeof agency];
      // A registry key that no longer resolves drops the frame rather than
      // rendering a broken image. The check script fails on it separately, so
      // this is the belt rather than the braces.
      if (!slot || typeof slot.src !== "string" || slot.src.length === 0) return null;
      return {
        src: slot.src,
        alt: slot.alt,
        width: slot.width,
        height: slot.height,
        span: frame.span,
        caption: slot.credit ? `${frame.caption} ${slot.credit}.` : frame.caption,
      };
    })
    .filter((frame): frame is GalleryFrame => frame !== null);
}

export function OccasionPage({
  occasion,
  experience,
}: {
  occasion: Occasion;
  experience: { faqs: ExperienceFaq[] };
}) {
  const hero = occasion.heroSlot
    ? agency[occasion.heroSlot as keyof typeof agency]
    : undefined;
  const frames = buildFrames(occasion);
  const enquire = fdPath(`/enquire?experience=${occasion.enquireSlug}`);
  const story = occasion.storySlug ? liveStoryBySlug(occasion.storySlug) : undefined;

  return (
    <>
      {/* A. HERO. The rates go in it, because they are now the most
          persuasive thing on all three pages and every competitor found
          in research publishes one. */}
      <section className="fd-section-tight fd-section-lede">
        <div className="fd-shell">
          <div style={{ maxWidth: "46rem" }}>
            <p className="fd-eyebrow">{occasion.eyebrow}</p>
            <h2 className="fd-display fd-h2" style={{ marginTop: "0.9rem" }}>
              {occasion.heading}
            </h2>
            <p className="fd-lead fd-muted" style={{ marginTop: "1.5rem" }}>
              {occasion.lede}
            </p>

            <ul className="fd-rate-row">
              {occasion.pricing.applies.map((rate) => (
                <li key={rate.id}>
                  <span className="fd-rate-figure">{rate.display}</span>
                  <span className="fd-rate-label">{rate.label}</span>
                </li>
              ))}
            </ul>
            <p className="fd-muted" style={{ marginTop: "0.75rem", fontSize: "var(--fd-step--1)" }}>
              {occasion.pricing.note}
            </p>

            <div className="fd-actions" style={{ marginTop: "2rem" }}>
              <Link className="fd-btn" href={enquire}>
                {occasion.primaryCta}
              </Link>
              <a className="fd-btn fd-btn-ghost" href="#gallery">
                See the rooftop
              </a>
            </div>
          </div>
        </div>
      </section>

      {hero?.src ? (
        <section className="fd-section-tight" style={{ paddingTop: 0 }}>
          <div className="fd-shell">
            <Scene
              src={hero.src}
              alt={hero.alt}
              width={hero.width}
              height={hero.height}
              ratio="fd-ratio-wide"
              sizes="(min-width: 60rem) 72rem, 94vw"
              priority
              credit={hero.credit}
            />
          </div>
        </section>
      ) : null}

      {/* B. WHAT IT IS. Four lines, each one scannable. */}
      <section className="fd-section-tight">
        <div className="fd-shell">
          <div style={{ maxWidth: "46rem", marginBottom: "2.5rem" }}>
            <p className="fd-eyebrow">What it is</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              What you are booking
            </h2>
          </div>
          <ul className="fd-list fd-list-2">
            {occasion.highlights.map((line) => (
              <li key={line.title}>
                <h3>{line.title}</h3>
                <p>{line.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <PhotoGallery
        frames={frames}
        heading={occasion.galleryHeading}
        intro={occasion.galleryIntro}
      />

      {/* D. THE ONE SECTION THIS OCCASION NEEDS AND THE OTHERS DO NOT:
          the surprise handling, the dress sizing, or the legal statement.
          It is the reason these three are not one page. */}
      <section className="fd-section-tight fd-sand">
        <div className="fd-shell fd-split">
          <div>
            <p className="fd-eyebrow">{occasion.feature.eyebrow}</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              {occasion.feature.heading}
            </h2>
            <p className="fd-muted" style={{ marginTop: "1rem" }}>
              {occasion.feature.lede}
            </p>
            <ul className="fd-list" style={{ marginTop: "1.5rem" }}>
              {occasion.feature.points.map((point) => (
                <li key={point.title}>
                  <h3>{point.title}</h3>
                  <p>{point.detail}</p>
                </li>
              ))}
            </ul>
          </div>
          {occasion.feature.note ? (
            <aside>
              <div className="fd-note">
                <p style={{ margin: 0 }}>{occasion.feature.note}</p>
              </div>
            </aside>
          ) : null}
        </div>
      </section>

      {/* E. THE MONEY. Decoration being included is stated here as well as
          in the hero, because it is unusual and it is the thing most
          likely to be assumed to be an extra. */}
      <section className="fd-section-tight">
        <div className="fd-shell fd-split">
          <div>
            <p className="fd-eyebrow">What it costs</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              The rates, and what sits outside them
            </h2>
            <ul className="fd-list" style={{ marginTop: "1.5rem" }}>
              {occasion.pricing.applies.map((rate) => (
                <li key={rate.id}>
                  <h3>
                    {rate.label} <span className="fd-charge fd-charge-confirm">{rate.display}</span>
                  </h3>
                  <p>{rate.detail}</p>
                </li>
              ))}
            </ul>
          </div>
          <aside>
            <div className="fd-note">
              <p style={{ margin: "0 0 0.75rem", fontWeight: 500, color: "var(--fd-ink)" }}>
                Included, and not included
              </p>
              <p style={{ margin: "0 0 0.75rem" }}>{RATES_INCLUDE_DECORATION}</p>
              {occasion.pricing.isEvent ? (
                <p style={{ margin: "0 0 0.75rem" }}>{RATES_EVENT_PHOTOGRAPHY}</p>
              ) : null}
              <p style={{ margin: 0 }}>{RATES_TERMS_NOT_SET}</p>
            </div>
          </aside>
        </div>
      </section>

      {/* F. THE SEQUENCE. */}
      <section className="fd-section-tight fd-sand">
        <div className="fd-shell">
          <div style={{ maxWidth: "46rem", marginBottom: "2.5rem" }}>
            <p className="fd-eyebrow">How it works</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              From the first message to the photographs
            </h2>
          </div>
          <ol className="fd-steps">
            {occasion.steps.map((step, i) => (
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

      {/* G. EXTRAS beside WHAT TO HAVE READY. Everything in the extras
          column is quoted rather than priced, and says so once at the top
          rather than six times. */}
      <section className="fd-section-tight">
        <div className="fd-shell fd-split fd-split-even">
          <div>
            <p className="fd-eyebrow">If you want more</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              Added to the session
            </h2>
            <p className="fd-muted" style={{ marginTop: "1rem", fontSize: "var(--fd-step--1)" }}>
              None of these carries a published price. Each is quoted for what you ask for.
            </p>
            <ul className="fd-list" style={{ marginTop: "1.5rem" }}>
              {occasion.extras.map((extra) => (
                <li key={extra.title}>
                  <h3>{extra.title}</h3>
                  <p>{extra.detail}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="fd-eyebrow">Before you enquire</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              What to have ready
            </h2>
            <ul className="fd-list" style={{ marginTop: "1.5rem" }}>
              {occasion.prepare.map((line) => (
                <li key={line}>
                  <p>{line}</p>
                </li>
              ))}
            </ul>
            <div className="fd-note" style={{ marginTop: "1.5rem" }}>
              <p style={{ margin: "0 0 0.75rem", fontWeight: 500, color: "var(--fd-ink)" }}>
                Where it happens
              </p>
              <p style={{ margin: "0 0 0.75rem" }}>{occasionVenue.location}</p>
              <p style={{ margin: 0 }}>{occasionVenue.dependency}</p>
            </div>
          </div>
        </div>
      </section>

      {/* H. THE STORY, where one genuinely exists about this occasion.
          Only the anniversary page has one, and it is the strongest piece
          of evidence on any of these three pages: a real customer, a real
          shoot on this roof, written up and published. */}
      {story ? (
        <section className="fd-section-tight fd-sand">
          <div className="fd-shell" style={{ maxWidth: "46rem" }}>
            <p className="fd-eyebrow">Somebody who did this</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              {story.title}
            </h2>
            <p className="fd-muted" style={{ marginTop: "1rem" }}>
              {story.excerpt}
            </p>
            <div className="fd-actions" style={{ marginTop: "1.5rem" }}>
              <Link className="fd-btn fd-btn-ghost" href={fdPath(`/stories/${story.slug}`)}>
                Read the story
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* J. The questions. Merged so the page and the FAQ structured data
          the route builds from the record cannot answer one twice. */}
      <section className="fd-section-tight">
        <div className="fd-shell">
          <h2 className="fd-display fd-h3" style={{ marginBottom: "2rem" }}>
            Questions
          </h2>
          <FaqList faqs={mergeFaqs(experience.faqs, occasion.faqs)} headingLevel={3} />
        </div>
      </section>

      {/* K. The last word. */}
      <section className="fd-section-tight fd-sand">
        <div className="fd-shell" style={{ maxWidth: "46rem" }}>
          <h2 className="fd-display fd-h3">{occasion.closingHeading}</h2>
          <p className="fd-muted" style={{ marginTop: "1rem" }}>
            {occasion.closingLede}
          </p>
          <div className="fd-actions" style={{ marginTop: "2rem" }}>
            <Link className="fd-btn" href={enquire}>
              {occasion.primaryCta}
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
