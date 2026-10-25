import Link from "next/link";
import { FaqList } from "./FaqList";
import { PhotoGallery, type GalleryFrame } from "./PhotoGallery";
import { RevealThemes } from "./RevealThemes";
import { agency } from "../_lib/assets";
import { fdPath } from "../_lib/seo";
import {
  DECORATION_INTERIM,
  THEME_NOTE,
  revealDecorations,
  revealInclusions,
  revealMechanism,
  revealPayment,
  revealPhotography,
  revealPractical,
  revealSecret,
  revealSteps,
  revealThemes,
  revealVenue,
  revealVideo,
} from "@/content/flyingDressGenderReveal";
import type { FlyingDressExperience } from "@/content/flyingDressExperiences";

/**
 * THE GENDER REVEAL PAGE.
 *
 * =========================================================================
 * THE ASSET POSITION, WHICH DECIDED THE WHOLE LAYOUT
 * =========================================================================
 * There is exactly ONE genuine gender reveal photograph in this repository:
 * the Kayan shoot, a balloon arch and lit letters on the roof at sunset with
 * the family in frame. One. It is also one of the best photographs the brand
 * owns, and it is the only frame on this site that shows the thing this page
 * is selling.
 *
 * That is the opposite problem from the proposal page, which has no photograph
 * of a proposal at all, and it needs the opposite discipline. The danger here
 * is not captioning somebody else's occasion as a reveal: it is padding. Four
 * supporting frames from couples shoots, uncaptioned, read as a reveal
 * portfolio five times the size of the real one.
 *
 * So the single real frame is given the hero, alone, at full width, where it
 * does the most work. It is then deliberately ABSENT FROM THE GALLERY, and the
 * gallery says so in its own first sentence: that photograph is the only reveal
 * we have, and these show the roof it happened on. Repeating it as the gallery
 * lead as well would make one photograph look like two and make a four-frame
 * gallery look like a portfolio.
 *
 * The brief asked for the missing assets to be documented rather than faked.
 * docs/FLYING-DRESSES-GENDER-REVEAL-PAGE.md is that list.
 *
 * =========================================================================
 * WHAT THIS PAGE DOES NOT INHERIT FROM THE PROPOSAL PAGE
 * =========================================================================
 * Everything about money, delivery and the venue's identity. No deposit split,
 * no payment methods, no photograph count, no Google Drive, no year of access,
 * no hotel name. Those were supplied for the proposal and the brief for this
 * page warned twice against assuming they transfer. See the header of
 * content/flyingDressGenderReveal.ts, and the guards in
 * scripts/check-flying-dresses.mts that fail the build if they reappear.
 *
 * What it does say that the proposal page cannot is VIDEO. The record lists a
 * cinematic film, slow motion and vertical cuts as `delivery: "in-house"`,
 * which is this business saying it shoots them itself.
 */

/**
 * The gallery: the roof, not the reveal.
 *
 * Built from the asset registry rather than from paths typed here, so a
 * photograph that is retired or re-credited moves in one place. Every caption
 * names the real occasion, because none of these is a gender reveal and a
 * visitor must not have to guess which.
 *
 * `agency.genderReveal` is intentionally not in this list. It is the hero.
 */
function galleryFrames(): GalleryFrame[] {
  const slots: {
    slot: (typeof agency)[keyof typeof agency];
    span: GalleryFrame["span"];
    caption: string;
  }[] = [
    {
      slot: agency.heroRooftop,
      span: "lead",
      caption:
        "The width of the roof with a group standing on it, which is the question most families ask first. A flying-dress session.",
    },
    {
      slot: agency.couplesVows,
      span: "pair",
      caption: "Golden hour on the same roof. Photographed at a vow renewal.",
    },
    {
      slot: agency.rooftopPortrait,
      span: "pair",
      caption: "The view the roof gives you in daylight. A flying-dress session.",
    },
    {
      slot: agency.couplesRomance,
      span: "pair",
      caption: "The other end of the day, at sunrise. A couples shoot.",
    },
  ];

  return slots
    .filter((entry) => typeof entry.slot.src === "string" && entry.slot.src.length > 0)
    .map((entry) => ({
      src: entry.slot.src as string,
      alt: entry.slot.alt,
      width: entry.slot.width,
      height: entry.slot.height,
      span: entry.span,
      // The credit travels with the photograph, as everywhere else on this
      // site. A caption that loses its attribution is how real work starts
      // looking like stock.
      caption: entry.slot.credit ? `${entry.caption} ${entry.slot.credit}.` : entry.caption,
    }));
}

export function GenderRevealPage({ experience }: { experience: FlyingDressExperience }) {
  const frames = galleryFrames();
  const enquire = fdPath("/enquire?experience=gender-reveal");

  return (
    <>
      {/* ---------------------------------------------------------------
          A. HERO. The photograph is rendered by the route above this,
          because for this one category the shared page has a real
          photograph OF THIS OCCASION to show. So the hero here is the
          type that follows it rather than a second copy of the frame.
          --------------------------------------------------------------- */}
      <section className="fd-section-tight fd-section-lede" style={{ paddingTop: 0 }}>
        <div className="fd-shell">
          <div style={{ maxWidth: "46rem" }}>
            <p className="fd-eyebrow">One evening, one rooftop, two seconds</p>
            <h2 className="fd-display fd-h2" style={{ marginTop: "0.9rem" }}>
              Find out at the same moment as everybody else
            </h2>
            <p className="fd-lead fd-muted" style={{ marginTop: "1.5rem" }}>
              Somebody else holds the result and we plan it with them, so the two of you walk up
              to a decorated roof above Giza knowing nothing. The moment is photographed and
              filmed, which matters more here than anywhere else we work: it is over before
              anyone has finished reacting, and the footage is the only way you get to watch your
              own face.
            </p>
            <div className="fd-actions" style={{ marginTop: "2rem" }}>
              <Link className="fd-btn" href={enquire}>
                Plan your reveal
              </Link>
              <a className="fd-btn fd-btn-ghost" href="#gallery">
                See the rooftop
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          B. THE SECRET. First section rather than a footnote, because it
          is the part of this service that is genuinely unlike anything
          else the business sells, and the first thing a parent wants to
          know is how it can possibly be kept from them.
          --------------------------------------------------------------- */}
      <section className="fd-section-tight">
        <div className="fd-shell">
          <div style={{ maxWidth: "46rem", marginBottom: "2.5rem" }}>
            <p className="fd-eyebrow">How it stays a surprise</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              Somebody has to know
            </h2>
            <p className="fd-muted" style={{ marginTop: "1rem" }}>
              {revealSecret.lede}
            </p>
          </div>
          <ul className="fd-list fd-list-2">
            {revealSecret.steps.map((item) => (
              <li key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* C. WHAT IS INCLUDED. Six entries, scannable titles. */}
      <section className="fd-section-tight fd-sand">
        <div className="fd-shell">
          <div style={{ maxWidth: "46rem", marginBottom: "2.5rem" }}>
            <p className="fd-eyebrow">What it includes</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              The roof, the decoration and everybody in the frame
            </h2>
          </div>
          <ul className="fd-list fd-list-2">
            {revealInclusions.map((item) => (
              <li key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <PhotoGallery
        frames={frames}
        heading="The roof it happens on"
        intro="The photograph at the top of this page is the one gender reveal we have photographed, and it is the only one, so nothing below is a reveal and each frame says what it actually is. What they show is the place: the width of the roof, how a group stands on it, and the light at either end of the day."
      />

      {/* ---------------------------------------------------------------
          E. THE MECHANISM. The most carefully worded section on the page.
          Every competitor publishes a menu of reveal methods; this record
          says twice that nothing specific should be advertised until the
          venues have confirmed what they permit. So this explains how a
          method gets agreed, which is the question underneath the menu.
          It sits after the gallery so its note about the photograph at
          the top of the page follows the frames rather than preceding
          them. See content/flyingDressGenderReveal.ts.
          --------------------------------------------------------------- */}
      <section className="fd-section-tight">
        <div className="fd-shell">
          <div style={{ maxWidth: "46rem", marginBottom: "2.5rem" }}>
            <p className="fd-eyebrow">The moment itself</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              How the reveal happens is agreed with the roof
            </h2>
            <p className="fd-muted" style={{ marginTop: "1rem" }}>
              {revealMechanism.lede}
            </p>
          </div>
          <ul className="fd-list fd-list-2">
            {revealMechanism.points.map((item) => (
              <li key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </li>
            ))}
          </ul>
          <div className="fd-note" style={{ marginTop: "2.5rem", maxWidth: "46rem" }}>
            <p style={{ margin: 0 }}>{revealMechanism.evidenceNote}</p>
          </div>
        </div>
      </section>

      <RevealThemes
        themes={revealThemes}
        themeNote={THEME_NOTE}
        decorations={revealDecorations}
        interim={DECORATION_INTERIM}
      />

      {/* G. THE SEQUENCE. Numbered, because the question underneath is
          "what do I actually have to do". Step five is lead time rather
          than a deposit: no payment terms exist for this service. */}
      <section className="fd-section-tight">
        <div className="fd-shell">
          <div style={{ maxWidth: "46rem", marginBottom: "2.5rem" }}>
            <p className="fd-eyebrow">Start to finish</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              From the first message to the photographs
            </h2>
          </div>
          <ol className="fd-steps">
            {revealSteps.map((step, i) => (
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

      {/* ---------------------------------------------------------------
          H. WHAT YOU RECEIVE. Photography beside video. The two absences
          are stated rather than filled in: no photograph count and no
          turnaround, because neither has been set for this service and
          both are promises a photography business gets held to.
          --------------------------------------------------------------- */}
      <section className="fd-section-tight fd-sand">
        <div className="fd-shell fd-split">
          <div>
            <p className="fd-eyebrow">What you receive</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              {revealPhotography.heading}
            </h2>
            <ul className="fd-list" style={{ marginTop: "1.5rem" }}>
              {revealPhotography.covers.map((line) => (
                <li key={line}>
                  <p>{line}</p>
                </li>
              ))}
            </ul>
            <div className="fd-note" style={{ marginTop: "1.5rem" }}>
              <p style={{ margin: "0 0 0.75rem", fontWeight: 500, color: "var(--fd-ink)" }}>
                How they reach you
              </p>
              <p style={{ margin: "0 0 0.75rem" }}>{revealPhotography.delivery}</p>
              <p style={{ margin: "0 0 0.75rem" }}>{revealPhotography.noCountPromise}</p>
              <p style={{ margin: 0 }}>{revealPhotography.noTurnaroundPromise}</p>
            </div>
          </div>

          <aside>
            <p className="fd-eyebrow">Moving pictures</p>
            <h2 className="fd-display fd-h4" style={{ marginTop: "0.75rem" }}>
              Filmed as well as photographed
            </h2>
            <p className="fd-muted" style={{ marginTop: "1rem" }}>
              {revealVideo.lede}
            </p>
            <ul className="fd-list" style={{ marginTop: "1.5rem" }}>
              {revealVideo.points.map((line) => (
                <li key={line}>
                  <p>{line}</p>
                </li>
              ))}
            </ul>
            <p className="fd-muted" style={{ marginTop: "1.5rem", fontSize: "var(--fd-step--1)" }}>
              {revealVideo.note}
            </p>
          </aside>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          I. WHERE IT HAPPENS. No hotel is named: see the venue note in
          the content file. The guest question lives here because it is a
          venue answer rather than one of ours.
          --------------------------------------------------------------- */}
      <section className="fd-section-tight">
        <div className="fd-shell fd-split">
          <div>
            <p className="fd-eyebrow">Where it happens</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              {revealVenue.heading}
            </h2>
            <p className="fd-muted" style={{ marginTop: "1rem" }}>
              {revealVenue.location}
            </p>
            <p className="fd-muted" style={{ marginTop: "1rem" }}>
              {revealVenue.dependency}
            </p>
          </div>
          <aside>
            <div className="fd-note">
              <p style={{ margin: "0 0 0.75rem", fontWeight: 500, color: "var(--fd-ink)" }}>
                How many people can come
              </p>
              <p style={{ margin: 0 }}>{revealVenue.guestsNote}</p>
            </div>
          </aside>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          I2. THE PRACTICALITIES, and the one cross-sell that is real.
          A custom body replaces the shared renderer, so the duration, who
          it is for and the in-house extras stop appearing unless this
          composition picks them up. The maternity session is listed as
          in-house on THIS record and reciprocated by the maternity
          record's own extras, which is both sides of the arrangement in
          the owner's own words. See content/flyingDressGenderReveal.ts.
          --------------------------------------------------------------- */}
      <section className="fd-section-tight fd-sand">
        <div className="fd-shell fd-split">
          <div>
            <p className="fd-eyebrow">Practically</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              How long it takes, and how far ahead
            </h2>
            <ul className="fd-list" style={{ marginTop: "1.5rem" }}>
              <li>
                <h3>On the evening</h3>
                <p>{revealPractical.durationNote}</p>
              </li>
              <li>
                <h3>Before the date</h3>
                <p>{revealPractical.leadTimeNote}</p>
              </li>
            </ul>
            <p className="fd-eyebrow" style={{ marginTop: "2rem" }}>
              Who books it
            </p>
            <ul className="fd-list" style={{ marginTop: "1rem" }}>
              {revealPractical.whoItIsFor.map((line) => (
                <li key={line}>
                  <p>{line}</p>
                </li>
              ))}
            </ul>
          </div>

          <aside>
            <div className="fd-note">
              <p style={{ margin: "0 0 0.75rem", fontWeight: 500, color: "var(--fd-ink)" }}>
                {revealPractical.maternityHeading}
              </p>
              <p style={{ margin: "0 0 1rem" }}>{revealPractical.maternityDetail}</p>
              <Link className="fd-link" href={fdPath("/celebrations/maternity-and-family")}>
                {revealPractical.maternityLinkLabel}
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          J. THE QUOTATION. NOT a payment section, and the difference is
          deliberate. No price, deposit, split or payment method has been
          agreed for this service. The proposal page's twenty-five /
          seventy-five split belongs to the proposal. This says how the
          figure reaches you and stops there.
          --------------------------------------------------------------- */}
      <section className="fd-section-tight fd-sand">
        <div className="fd-shell">
          <div style={{ maxWidth: "46rem", marginBottom: "2.5rem" }}>
            <p className="fd-eyebrow">What it costs</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              How the quotation works
            </h2>
            <p className="fd-muted" style={{ marginTop: "1rem" }}>
              {revealPayment.quoteNote}
            </p>
          </div>
          <ul className="fd-list fd-list-2">
            {revealPayment.points.map((item) => (
              <li key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* K. The questions, from the experience record so the page and the
          FAQ structured data cannot drift apart. */}
      {experience.faqs.length > 0 ? (
        <section className="fd-section-tight">
          <div className="fd-shell">
            <h2 className="fd-display fd-h3" style={{ marginBottom: "2rem" }}>
              Questions
            </h2>
            <FaqList faqs={experience.faqs} headingLevel={3} />
          </div>
        </section>
      ) : null}

      {/* L. The last word. One primary action, one quieter one. */}
      <section className="fd-section-tight fd-sand">
        <div className="fd-shell" style={{ maxWidth: "46rem" }}>
          <h2 className="fd-display fd-h3">Tell us the date, and who is holding the secret</h2>
          <p className="fd-muted" style={{ marginTop: "1rem" }}>
            Give us your date, roughly how many people are coming, and whether you want it filmed.
            We will come back with what the roof allows, what the decoration can look like and
            what it costs, in writing and on whichever channel you choose.
          </p>
          <div className="fd-actions" style={{ marginTop: "2rem" }}>
            <Link className="fd-btn" href={enquire}>
              Plan your reveal
            </Link>
            <Link className="fd-btn fd-btn-ghost" href={fdPath("/faq")}>
              Ask us a question
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
