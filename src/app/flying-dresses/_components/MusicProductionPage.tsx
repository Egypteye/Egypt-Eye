import Link from "next/link";
import { Scene } from "./Scene";
import { FaqList } from "./FaqList";
import { PhotoGallery, type GalleryFrame } from "./PhotoGallery";
import { ProductionReel } from "./ProductionReel";
import { MusicSetups } from "./MusicSetups";
import { agency } from "../_lib/assets";
import { fdPath } from "../_lib/seo";
import { mergeFaqs } from "@/content/flyingDressExperiences";
import {
  SERVICE_LABEL,
  SETUP_INTERIM,
  audioRecording,
  musicFaqs,
  musicSetups,
  musicSteps,
  musicVenue,
  notSupplied,
  productionClips,
  prepare,
  productionServices,
  rooftopRate,
  shootApproach,
  type ServiceStatus,
} from "@/content/flyingDressMusic";

/**
 * THE ROOFTOP MUSIC SESSION.
 *
 * =========================================================================
 * THE ARGUMENT, WHICH CAME OUT OF THE RESEARCH
 * =========================================================================
 * Carl Cox, Tiesto, Charlotte de Witte, Metro Boomin and Anyma have all
 * played the pyramids. Every one of those was a festival-scale event inside
 * the complex, with a promoter and a permit budget, and there is now a legal
 * challenge seeking to restrict large music events at the site.
 *
 * So the page does not pretend to be adjacent to any of that. It sells the
 * opposite: those artists needed a festival to play in front of the pyramids,
 * and an independent DJ can rent an hour on a roof that looks at them, from
 * $150, and leave with footage. That is a real, defensible and honest
 * position, and it is the one thing on this site that is genuinely cheap
 * relative to what it buys.
 *
 * The COMMERCIAL SHAPE is also from the research. Filmed-music venues and
 * studios charge roughly $125 to $250 an hour for the space and sell
 * production as separately named add-ons, with post-production explicitly
 * outside the recording fee. This page uses that structure rather than
 * inventing a bundle, which is also what the owner described.
 *
 * =========================================================================
 * THE TWO THINGS THIS PAGE MUST NOT SOFTEN
 * =========================================================================
 * 1. WE DO NOT SUPPLY SOUND. No PA, no decks, no generators. The experience
 *    record states it in capitals, and it is the single most likely way this
 *    service disappoints somebody: a DJ who arrives expecting a booth has had
 *    their session ruined. It gets a real section, high up, not a footnote.
 *
 * 2. THE AUDIO RECORDING QUESTION IS OPEN. The owner flagged it explicitly:
 *    nobody has settled whether recording equipment sits inside the hourly
 *    rate or is charged separately. The page offers the service and states
 *    neither. See audioRecording.commercialStatus.
 *
 * =========================================================================
 * THE PHOTOGRAPHS
 * =========================================================================
 * THIS USED TO READ: "there is no photograph of a DJ, a set, decks or a stage
 * anywhere in this repository. Not one." That stopped being true on 29 October
 * 2026, when the owner delivered a real production filmed on this roof: an
 * artist behind Pioneer decks, speakers, a camera rig on tripods, shot through
 * golden hour into the dark.
 *
 * So the page now leads with FOUR VERTICAL CLIPS of that session, directly
 * under the hero, because they are the only thing here that proves the rest.
 * The gallery keeps its discipline: one frame is the real set and says so,
 * three are the same roof on other occasions and each caption names which, and
 * the one shot still genuinely missing is still a labelled gap rather than a
 * borrowed photograph. Never a stock image, and never somebody else's set.
 * docs/FLYING-DRESSES-MUSIC-PAGE.md lists what is still needed.
 */

function StatusTag({ status }: { status: ServiceStatus }) {
  return (
    <span className={`fd-charge fd-charge-${status === "addon" ? "confirm" : "extra"}`}>
      {SERVICE_LABEL[status]}
    </span>
  );
}

/**
 * The roof, and the shots we are missing.
 *
 * The real frames come from the asset registry. The gaps are deliberate and
 * each names the photograph it is waiting for, so the page is honest about
 * what it cannot yet show without being empty where a gallery belongs.
 */
function galleryFrames(): GalleryFrame[] {
  const real: {
    slot: (typeof agency)[keyof typeof agency];
    span: GalleryFrame["span"];
    caption: string;
  }[] = [
    {
      slot: agency.heroRooftop,
      span: "lead",
      caption:
        "The usable width of the roof, with the skyline behind it. Photographed at a flying-dress session, not a music session.",
    },
    {
      slot: agency.couplesVows,
      span: "pair",
      caption:
        "The light on this roof at golden hour, which is the hour most sessions are built around. Photographed at an anniversary shoot.",
    },
    {
      slot: agency.genderReveal,
      span: "pair",
      caption:
        "An evening setup this team lit and built on the same roof, after dark. Photographed at a gender reveal.",
    },
    /* THE FIRST REAL ONE. October 2026: an actual set on this roof, which is
       what the four labelled gaps above it used to be waiting for. */
    {
      slot: agency.productionDecks,
      span: "pair",
      caption:
        "Decks, mixer and the plateau behind them. Photographed at a music production on this roof, October 2026.",
    },
  ];

  const gaps: { wanted: string; alt: string; span: GalleryFrame["span"]; caption: string }[] = [
    {
      span: "pair",
      wanted: "An artist portrait on the roof",
      alt: "A press-kit portrait of a DJ on the rooftop at golden hour with the pyramids behind",
      caption: "From the separate artist shoot.",
    },
  ];

  return [
    ...real
      .filter((entry) => typeof entry.slot.src === "string" && entry.slot.src.length > 0)
      .map((entry) => ({
        src: entry.slot.src as string,
        alt: entry.slot.alt,
        width: entry.slot.width,
        height: entry.slot.height,
        span: entry.span,
        caption: entry.slot.credit ? `${entry.caption} ${entry.slot.credit}.` : entry.caption,
      })),
    ...gaps.map((gap) => ({
      src: null,
      alt: gap.alt,
      wanted: gap.wanted,
      span: gap.span,
      caption: gap.caption,
    })),
  ];
}

export function MusicProductionPage({
  experience,
}: {
  experience: { faqs: { question: string; answer: string }[] };
}) {
  const hero = agency.heroRooftop;
  const frames = galleryFrames();
  const enquire = fdPath("/enquire?experience=rooftop-music-session");

  return (
    <>
      {/* ---------------------------------------------------------------
          A. HERO. The rate goes in the hero, because it is the single
          most persuasive fact on the page: the backdrop that needed a
          festival for everybody else costs $150 an hour here. The unit
          is never separated from the number.
          --------------------------------------------------------------- */}
      <section className="fd-section-tight fd-section-lede">
        <div className="fd-shell">
          <div style={{ maxWidth: "46rem" }}>
            <p className="fd-eyebrow">DJs, producers and artists</p>
            <h2 className="fd-display fd-h2" style={{ marginTop: "0.9rem" }}>
              Record your set above the pyramids
            </h2>
            <p className="fd-lead fd-muted" style={{ marginTop: "1.5rem" }}>
              A private rooftop in Giza with the Great Pyramids across the skyline, rented by the
              hour. Bring your own setup and shoot it yourself, or build a full production around
              it: filming from several positions, stills, recording, lighting and editing.
            </p>
            <p className="fd-display fd-h3" style={{ marginTop: "2rem" }}>
              {rooftopRate.display}
            </p>
            <p className="fd-muted" style={{ marginTop: "0.5rem", fontSize: "var(--fd-step--1)" }}>
              For the rooftop. Production services are quoted separately.
            </p>
            <div className="fd-actions" style={{ marginTop: "2rem" }}>
              <Link className="fd-btn" href={enquire}>
                Plan your session
              </Link>
              <a className="fd-btn fd-btn-ghost" href="#gallery">
                See the rooftop
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
              ratio="fd-ratio-wide"
              sizes="(min-width: 60rem) 72rem, 94vw"
              priority
              credit={hero.credit}
            />
          </div>
        </section>
      ) : null}

      {/* ---------------------------------------------------------------
          THE FOOTAGE. It sits directly under the hero because it is the
          only thing on this page that PROVES the rest. Everything above
          it is a claim; this is a set actually filmed on this roof.
          --------------------------------------------------------------- */}
      <ProductionReel
        clips={productionClips}
        heading="A set, filmed on this roof"
        intro="Our own footage from a music production here: an artist behind the decks, filmed with a camera rig across one evening, golden hour into the dark. The clips are silent because the original audio is the artist's own set."
      />

      {/* ---------------------------------------------------------------
          B + 4. THE RATE, AND WHAT IT IS NOT. One section, because the
          hourly rate only means something next to the list of what sits
          outside it. Competitors blur this; the clearest venues in the
          research state it outright.
          --------------------------------------------------------------- */}
      <section className="fd-section-tight">
        <div className="fd-shell fd-split">
          <div>
            <p className="fd-eyebrow">The booking</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              The roof, by the hour
            </h2>
            <p className="fd-muted" style={{ marginTop: "1rem" }}>
              {rooftopRate.lede}
            </p>
            <ul className="fd-list" style={{ marginTop: "1.5rem" }}>
              {rooftopRate.covers.map((line) => (
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
              <p style={{ margin: "0 0 0.75rem" }}>{rooftopRate.excludes}</p>
              <p style={{ margin: 0 }}>{rooftopRate.termsNotSet}</p>
            </div>
          </aside>
        </div>
      </section>

      <PhotoGallery
        frames={frames}
        heading="The roof, and the shots we are still missing"
        intro="One of these is a real set on this roof, photographed at a music production in October 2026. The rest are the same roof on other occasions, and each caption says which is which. What they all show is the thing you are really booking: the width of the roof, the skyline, and the light at golden hour and after dark. The labelled frames are shots we still want and do not have, left visible rather than filled with somebody else's."
      />

      {/* ---------------------------------------------------------------
          C. WHAT WE DO NOT PROVIDE. High on the page, not buried, and
          it is the most valuable section here. A DJ who arrives
          expecting a booth has had their session ruined.
          --------------------------------------------------------------- */}
      <section className="fd-section-tight fd-sand">
        <div className="fd-shell">
          <div style={{ maxWidth: "46rem", marginBottom: "2.5rem" }}>
            <p className="fd-eyebrow">Read this before you book</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              {notSupplied.heading}
            </h2>
            <p className="fd-muted" style={{ marginTop: "1rem" }}>
              {notSupplied.lede}
            </p>
          </div>
          <ul className="fd-list fd-list-2">
            {notSupplied.points.map((point) => (
              <li key={point.title}>
                <h3>{point.title}</h3>
                <p>{point.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          5. BUILD YOUR OWN PRODUCTION. Every service quoted, every one
          labelled. The audio line carries the open commercial question
          rather than an answer nobody has given.
          --------------------------------------------------------------- */}
      <section className="fd-section-tight">
        <div className="fd-shell">
          <div style={{ maxWidth: "46rem", marginBottom: "2.5rem" }}>
            <p className="fd-eyebrow">Build it up</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              Production, added to the hours
            </h2>
            <p className="fd-muted" style={{ marginTop: "1rem" }}>
              Take all of it, some of it, or none. The roof on its own is a real booking, and
              nothing below carries a published price: each is quoted for the session you describe.
            </p>
          </div>
          <ul className="fd-list fd-list-2">
            {productionServices.map((service) => (
              <li key={service.id}>
                <h3>
                  {service.name} <StatusTag status={service.status} />
                </h3>
                <p>{service.detail}</p>
              </li>
            ))}
          </ul>
          <div className="fd-note" style={{ marginTop: "2.5rem", maxWidth: "46rem" }}>
            <p style={{ margin: "0 0 0.75rem", fontWeight: 500, color: "var(--fd-ink)" }}>
              About recording your audio
            </p>
            <p style={{ margin: 0 }}>{audioRecording.pageWording}</p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          F. THE SHOOTING APPROACH. Positions, never a camera count: the
          owner described two or three angles as an INTENTION, and the
          brief is explicit that it must not become a hardware claim.
          --------------------------------------------------------------- */}
      <section className="fd-section-tight fd-sand">
        <div className="fd-shell">
          <div style={{ maxWidth: "46rem", marginBottom: "2.5rem" }}>
            <p className="fd-eyebrow">How it is filmed</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              {shootApproach.heading}
            </h2>
            <p className="fd-muted" style={{ marginTop: "1rem" }}>
              {shootApproach.lede}
            </p>
          </div>
          <ul className="fd-list fd-list-2">
            {shootApproach.positions.map((position) => (
              <li key={position.title}>
                <h3>{position.title}</h3>
                <p>{position.detail}</p>
              </li>
            ))}
          </ul>
          <div className="fd-note" style={{ marginTop: "2.5rem", maxWidth: "46rem" }}>
            <p style={{ margin: 0 }}>{shootApproach.notPublished}</p>
          </div>
        </div>
      </section>

      <MusicSetups setups={musicSetups} interim={SETUP_INTERIM} />

      {/* 7. THE SEQUENCE. */}
      <section className="fd-section-tight">
        <div className="fd-shell">
          <div style={{ maxWidth: "46rem", marginBottom: "2.5rem" }}>
            <p className="fd-eyebrow">How it works</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              From the first message to the footage
            </h2>
          </div>
          <ol className="fd-steps">
            {musicSteps.map((step, i) => (
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
          8. WHAT TO HAVE READY, beside the venue. Written as the
          questions we will ask rather than as policies, because the
          operational answers have not been set.
          --------------------------------------------------------------- */}
      <section className="fd-section-tight fd-sand">
        <div className="fd-shell fd-split">
          <div>
            <p className="fd-eyebrow">Before you enquire</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              What to have ready
            </h2>
            <ul className="fd-list" style={{ marginTop: "1.5rem" }}>
              {prepare.map((line) => (
                <li key={line}>
                  <p>{line}</p>
                </li>
              ))}
            </ul>
          </div>
          <aside>
            <p className="fd-eyebrow">Where it happens</p>
            <h2 className="fd-display fd-h4" style={{ marginTop: "0.75rem" }}>
              {musicVenue.heading}
            </h2>
            <p className="fd-muted" style={{ marginTop: "1rem" }}>
              {musicVenue.location}
            </p>
            <div className="fd-note" style={{ marginTop: "1.5rem" }}>
              <p style={{ margin: 0 }}>{musicVenue.dependency}</p>
            </div>
          </aside>
        </div>
      </section>

      {/* 9. The questions. The record's own four are appended so the page
          and the FAQ structured data built by the route cannot drift. */}
      <section className="fd-section-tight">
        <div className="fd-shell">
          <h2 className="fd-display fd-h3" style={{ marginBottom: "2rem" }}>
            Questions
          </h2>
          <FaqList faqs={mergeFaqs(experience.faqs, musicFaqs)} headingLevel={3} />
        </div>
      </section>

      {/* 10. The last word. */}
      <section className="fd-section-tight fd-sand">
        <div className="fd-shell" style={{ maxWidth: "46rem" }}>
          <h2 className="fd-display fd-h3">Book the roof, and build from there</h2>
          <p className="fd-muted" style={{ marginTop: "1rem" }}>
            Tell us the date, how many hours you want, what you are bringing and what the footage
            is for. We put the request to the venue and come back with what is possible and what it
            costs, in writing.
          </p>
          <div className="fd-actions" style={{ marginTop: "2rem" }}>
            <Link className="fd-btn" href={enquire}>
              Plan your session
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
