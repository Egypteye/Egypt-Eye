import Link from "next/link";
import { Scene } from "./Scene";
import { FaqList } from "./FaqList";
import { PhotoGallery, type GalleryFrame } from "./PhotoGallery";
import { CelebrationChoices } from "./CelebrationChoices";
import { agency } from "../_lib/assets";
import { fdPath } from "../_lib/seo";
import {
  CHARGE_LABEL,
  CHARGE_NOTE,
  DECORATION_INTERIM,
  SHOOT_COMPARISON_NOTE,
  cake,
  celebrationDecorations,
  celebrationFaqs,
  celebrationLines,
  celebrationPayment,
  celebrationSteps,
  celebrationVenue,
  guests,
  music,
  shootStyles,
  transport,
  type Charge,
} from "@/content/flyingDressBirthday";

/**
 * BIRTHDAYS AND PRIVATE CELEBRATIONS.
 *
 * =========================================================================
 * WHAT THE COMPETITOR RESEARCH ACTUALLY FOUND, AND WHAT IT CHANGED
 * =========================================================================
 * Searched October 2026. The businesses selling at Giza sell PHOTOSHOOTS:
 * a flying dress session at around $180, a private pyramids session at
 * around $100, graduation photographers working the plateau. The rooftop
 * venues sell DINNER with a view. Nobody found publishes an integrated
 * celebration: decoration, a cake, your own music, two styles of photography
 * and your people, coordinated as one evening.
 *
 * So this page does not compete on the price of a photoshoot, which it would
 * lose, and it does not try to. Its argument is the thing nobody else is
 * selling: somebody organises the whole evening. That is why the two
 * photoshoots are presented as both being part of it rather than as options,
 * and why the page spends its most careful section on what each element
 * COSTS rather than on adjectives.
 *
 * =========================================================================
 * THE FOUR-WAY DISTINCTION, AND WHY IT IS VISIBLE
 * =========================================================================
 * Every element carries a label: Included, Arranged for you, Additional
 * charge, or Quoted for you. The brief asked for the distinction and it is
 * the single most common place a premium experience page quietly misleads:
 * one undifferentiated "what's included" list, with the charges discovered
 * at quotation. `Charge` in content/flyingDressBirthday.ts makes it a type,
 * so no line can be added here without somebody deciding which it is.
 *
 * Transport is the one that matters most. Our flying dress PACKAGES include
 * door-to-door transport in the published price; a celebration's transport is
 * an additional charge. A visitor who has read /experiences arrives believing
 * the first thing, correctly, about a different product. The page says the
 * difference out loud rather than leaving it to the quotation.
 *
 * =========================================================================
 * THE PHOTOGRAPHS
 * =========================================================================
 * We have never photographed a birthday on this roof. Not one frame. What we
 * have is real, credited agency work from the same rooftop, and the gallery
 * says so in its own first sentence, with every caption naming the occasion
 * it was actually shot at.
 *
 * The one genuinely decorated setup we own is the Kayan gender reveal: a
 * balloon arch, lit letters, flowers and evening lighting, built by this team
 * on this roof. It is the lead frame BECAUSE it is the only evidence that we
 * decorate anything, and it is captioned as a gender reveal every time it
 * appears. docs/FLYING-DRESSES-BIRTHDAY-PAGE.md lists what is missing.
 */

/** The charge label, rendered beside a line rather than left to be inferred. */
function ChargeTag({ charge }: { charge: Charge }) {
  return (
    <span className={`fd-charge fd-charge-${charge}`} title={CHARGE_NOTE[charge]}>
      {CHARGE_LABEL[charge]}
    </span>
  );
}

/**
 * The gallery. None of these is a birthday, and each caption says what it is.
 * Built from the asset registry so a retired or re-credited photograph moves
 * in one place.
 *
 * `agency.heroRooftop` is deliberately absent: it is the hero above.
 */
function galleryFrames(): GalleryFrame[] {
  const slots: {
    slot: (typeof agency)[keyof typeof agency];
    span: GalleryFrame["span"];
    caption: string;
  }[] = [
    {
      slot: agency.genderReveal,
      span: "lead",
      caption:
        "A decorated setup this team built on this roof, with a balloon arch, lit letters, flowers and evening lighting. Photographed at a gender reveal, not a birthday.",
    },
    {
      slot: agency.rooftopPortrait,
      span: "pair",
      caption: "The flying dress half of the evening, on the same roof. A flying-dress session.",
    },
    {
      slot: agency.assistantAtWork,
      span: "pair",
      caption:
        "How the dress actually works: an assistant at the edge of frame, mid-throw. A flying-dress session.",
    },
    {
      slot: agency.couplesVows,
      span: "pair",
      caption: "Golden hour on the same roof. Photographed at a vow renewal.",
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
      caption: entry.slot.credit ? `${entry.caption} ${entry.slot.credit}.` : entry.caption,
    }));
}

/** The two styles, each with a real frame that is genuinely that style. */
const STYLE_PHOTO: Record<string, { slot: (typeof agency)[keyof typeof agency]; note: string }> = {
  casual: {
    slot: agency.genderReveal,
    note: "A real celebration on this roof, photographed as it happened. This one was a gender reveal.",
  },
  "flying-dress": {
    slot: agency.rooftopPortrait,
    note: "A flying dress session on the same roof, at the other end of the day.",
  },
};

export function BirthdayPage({ experience }: { experience: { faqs: { question: string; answer: string }[] } }) {
  const hero = agency.heroRooftop;
  const frames = galleryFrames();
  const enquire = fdPath("/enquire?experience=private-celebration");

  return (
    <>
      {/* ---------------------------------------------------------------
          A. HERO. The group frame, because this page's whole argument is
          that it is an evening with people in it rather than a solo
          photoshoot, and that photograph is six people on this roof with
          their arms up. It is also genuinely ours and genuinely joyful,
          which the brief asked for and which no stock image would be.
          --------------------------------------------------------------- */}
      <section className="fd-section-tight fd-section-lede">
        <div className="fd-shell">
          <div style={{ maxWidth: "46rem" }}>
            <p className="fd-eyebrow">Birthdays, graduations and reunions</p>
            <h2 className="fd-display fd-h2" style={{ marginTop: "0.9rem" }}>
              Celebrate it above the pyramids
            </h2>
            <p className="fd-lead fd-muted" style={{ marginTop: "1.5rem" }}>
              A private rooftop in Giza with the pyramids across the view, decorated for whatever
              you are marking. A cake made for the occasion, your own songs through the speaker,
              your people around you, and two kinds of photography: the evening as it happens, and
              a flying dress session on the same roof.
            </p>
            <div className="fd-actions" style={{ marginTop: "2rem" }}>
              <Link className="fd-btn" href={enquire}>
                Plan your celebration
              </Link>
              <a className="fd-btn fd-btn-ghost" href="#gallery">
                Explore the gallery
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
          B + K. THE OVERVIEW, WHICH IS ALSO THE INCLUSIONS LIST.
          One section rather than two, because the brief's section B and
          section K are the same eight facts told twice, and a premium page
          that repeats itself reads as padding. Each line carries what it
          costs, which is the part competitors leave out.
          --------------------------------------------------------------- */}
      <section className="fd-section-tight">
        <div className="fd-shell">
          <div style={{ maxWidth: "46rem", marginBottom: "2.5rem" }}>
            <p className="fd-eyebrow">What the evening is</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              Everything in it, and what each part costs
            </h2>
            <p className="fd-muted" style={{ marginTop: "1rem" }}>
              Four labels, used honestly. Something marked included is part of the celebration.
              Arranged means we coordinate it and it is priced in your quotation. An additional
              charge sits on top of it. Nothing here is a fixed price, because the evening is built
              around what you are celebrating.
            </p>
          </div>
          <ul className="fd-list fd-list-2">
            {celebrationLines.map((line) => (
              <li key={line.title}>
                <h3>
                  {line.title} <ChargeTag charge={line.charge} />
                </h3>
                <p>{line.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <PhotoGallery
        frames={frames}
        heading="The roof, and the light on it"
        intro="We have not photographed a birthday on this roof yet, so none of these is one, and each frame says what it actually is. What they show is the place and the work: a decorated setup this team built up here, the flying dress half of an evening, and the light at either end of the day."
      />

      {/* ---------------------------------------------------------------
          F. THE TWO PHOTOSHOOTS, side by side with a real frame each.
          This is the section the competitor research says nobody else
          has: the businesses at Giza sell one style or the other.
          --------------------------------------------------------------- */}
      <section className="fd-section-tight">
        <div className="fd-shell">
          <div style={{ maxWidth: "46rem", marginBottom: "2.5rem" }}>
            <p className="fd-eyebrow">Both, not either</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              Two kinds of photography, one evening
            </h2>
            <p className="fd-muted" style={{ marginTop: "1rem" }}>
              {SHOOT_COMPARISON_NOTE}
            </p>
          </div>

          <div className="fd-split fd-split-even">
            {shootStyles.map((style) => {
              const photo = STYLE_PHOTO[style.id];
              return (
                <div key={style.id}>
                  {photo?.slot.src ? (
                    <Scene
                      src={photo.slot.src}
                      alt={photo.slot.alt}
                      width={photo.slot.width}
                      height={photo.slot.height}
                      ratio="fd-ratio-landscape"
                      sizes="(min-width: 48rem) 36rem, 94vw"
                      credit={photo.slot.credit}
                    />
                  ) : null}
                  <h3 className="fd-display fd-h4" style={{ marginTop: "1.5rem" }}>
                    {style.name}
                  </h3>
                  <p className="fd-muted" style={{ marginTop: "0.5rem", fontStyle: "italic" }}>
                    {style.tagline}
                  </p>
                  <ul className="fd-list" style={{ marginTop: "1.25rem" }}>
                    {style.points.map((point) => (
                      <li key={point}>
                        <p>{point}</p>
                      </li>
                    ))}
                  </ul>
                  {photo ? (
                    <p
                      className="fd-muted"
                      style={{ marginTop: "1rem", fontSize: "var(--fd-step--1)" }}
                    >
                      {photo.note}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <CelebrationChoices decorations={celebrationDecorations} interim={DECORATION_INTERIM} />

      {/* ---------------------------------------------------------------
          E. THE CAKE. Its own section, as asked, and honest about the
          supplier in the chain: a customer with an allergy or a deadline
          needs to know there is a third party in it.
          --------------------------------------------------------------- */}
      <section className="fd-section-tight">
        <div className="fd-shell fd-split">
          <div>
            <p className="fd-eyebrow">The cake</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              {cake.heading}
            </h2>
            <p className="fd-muted" style={{ marginTop: "1rem" }}>
              {cake.lede}
            </p>
            <p className="fd-eyebrow" style={{ marginTop: "2rem" }}>
              Tell us
            </p>
            <ul className="fd-list" style={{ marginTop: "1rem" }}>
              {cake.tellUs.map((line) => (
                <li key={line}>
                  <p>{line}</p>
                </li>
              ))}
            </ul>
            <div className="fd-actions" style={{ marginTop: "2rem" }}>
              <Link className="fd-btn fd-btn-ghost" href={enquire}>
                Discuss your cake design
              </Link>
            </div>
          </div>
          <aside>
            <div className="fd-note">
              <p style={{ margin: "0 0 0.75rem", fontWeight: 500, color: "var(--fd-ink)" }}>
                How it is made
              </p>
              <p style={{ margin: "0 0 0.75rem" }}>{cake.supplierNote}</p>
              <p style={{ margin: 0 }}>{cake.notPromised}</p>
            </div>
          </aside>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          C(music) + H(guests). Side by side: both are "what the venue
          allows" answers, and both carry a caution the brief asked for.
          --------------------------------------------------------------- */}
      <section className="fd-section-tight fd-sand">
        <div className="fd-shell fd-split fd-split-even">
          <div>
            <p className="fd-eyebrow">The atmosphere</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              {music.heading}
            </h2>
            <p className="fd-muted" style={{ marginTop: "1rem" }}>
              {music.lede}
            </p>
            <div className="fd-note" style={{ marginTop: "1.5rem" }}>
              <p style={{ margin: "0 0 0.75rem" }}>{music.venueNote}</p>
              <p style={{ margin: 0 }}>{music.notPromised}</p>
            </div>
          </div>
          <div>
            <p className="fd-eyebrow">Your people</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              {guests.heading}
            </h2>
            <p className="fd-muted" style={{ marginTop: "1rem" }}>
              {guests.lede}
            </p>
            <ul className="fd-list" style={{ marginTop: "1.25rem" }}>
              {guests.points.map((point) => (
                <li key={point}>
                  <p>{point}</p>
                </li>
              ))}
            </ul>
            <p className="fd-muted" style={{ marginTop: "1rem", fontSize: "var(--fd-step--1)" }}>
              {guests.venueNote}
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          I. TRANSPORT. The one element the owner stated as an ADDITIONAL
          charge, and the one most likely to be misread, because the
          flying dress packages include transport in their price. The
          difference is stated rather than left to the quotation.
          --------------------------------------------------------------- */}
      <section className="fd-section-tight">
        <div className="fd-shell fd-split">
          <div>
            <p className="fd-eyebrow">Getting there</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              {transport.heading} <ChargeTag charge="extra" />
            </h2>
            <p className="fd-muted" style={{ marginTop: "1rem" }}>
              {transport.lede}
            </p>
            <ul className="fd-list" style={{ marginTop: "1.25rem" }}>
              {transport.points.map((point) => (
                <li key={point}>
                  <p>{point}</p>
                </li>
              ))}
            </ul>
          </div>
          <aside>
            <div className="fd-note">
              <p style={{ margin: "0 0 0.75rem", fontWeight: 500, color: "var(--fd-ink)" }}>
                Not the same as our photoshoot packages
              </p>
              <p style={{ margin: "0 0 0.75rem" }}>{transport.packagesDiffer}</p>
              <p style={{ margin: 0 }}>{transport.notPromised}</p>
            </div>
          </aside>
        </div>
      </section>

      {/* J. THE SEQUENCE. Numbered, each step carrying its charge. */}
      <section className="fd-section-tight fd-sand">
        <div className="fd-shell">
          <div style={{ maxWidth: "46rem", marginBottom: "2.5rem" }}>
            <p className="fd-eyebrow">How it works</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              From the first message to the evening
            </h2>
          </div>
          <ol className="fd-steps">
            {celebrationSteps.map((step, i) => (
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
          G + L. WHERE IT HAPPENS, AND WHAT IT COSTS. No price, because
          none has been set for a celebration of any size, and no deposit,
          because the proposal's terms belong to the proposal.
          --------------------------------------------------------------- */}
      <section className="fd-section-tight">
        <div className="fd-shell fd-split">
          <div>
            <p className="fd-eyebrow">What it costs</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              How the quotation works
            </h2>
            <p className="fd-muted" style={{ marginTop: "1rem" }}>
              {celebrationPayment.quoteNote}
            </p>
            <ul className="fd-list" style={{ marginTop: "1.5rem" }}>
              {celebrationPayment.points.map((point) => (
                <li key={point.title}>
                  <h3>
                    {point.title} <ChargeTag charge={point.charge} />
                  </h3>
                  <p>{point.detail}</p>
                </li>
              ))}
            </ul>
          </div>
          <aside>
            <p className="fd-eyebrow">Where it happens</p>
            <h2 className="fd-display fd-h4" style={{ marginTop: "0.75rem" }}>
              {celebrationVenue.heading}
            </h2>
            <p className="fd-muted" style={{ marginTop: "1rem" }}>
              {celebrationVenue.location}
            </p>
            <div className="fd-note" style={{ marginTop: "1.5rem" }}>
              <p style={{ margin: 0 }}>{celebrationVenue.dependency}</p>
            </div>
          </aside>
        </div>
      </section>

      {/* N. The questions. The record's own two are merged into this set
          so the page and the FAQ structured data cannot disagree: see the
          route, which builds FAQPage from the experience record. */}
      <section className="fd-section-tight fd-sand">
        <div className="fd-shell">
          <h2 className="fd-display fd-h3" style={{ marginBottom: "2rem" }}>
            Questions
          </h2>
          <FaqList faqs={[...celebrationFaqs, ...experience.faqs]} headingLevel={3} />
        </div>
      </section>

      {/* O. The last word. */}
      <section className="fd-section-tight">
        <div className="fd-shell" style={{ maxWidth: "46rem" }}>
          <h2 className="fd-display fd-h3">Make the next one unforgettable</h2>
          <p className="fd-muted" style={{ marginTop: "1rem" }}>
            Tell us what you are celebrating, how you want it to look and who you want there. We
            will come back with what the roof allows for your date, the decoration available, and
            one figure covering all of it, in writing.
          </p>
          <div className="fd-actions" style={{ marginTop: "2rem" }}>
            <Link className="fd-btn" href={enquire}>
              Plan your celebration
            </Link>
            <Link className="fd-btn fd-btn-ghost" href={fdPath("/faq")}>
              Ask about custom options
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
