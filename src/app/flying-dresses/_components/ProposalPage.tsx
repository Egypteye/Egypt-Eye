import Link from "next/link";
import { Scene } from "./Scene";
import { FaqList } from "./FaqList";
import { ProposalGallery, type ProposalFrame } from "./ProposalGallery";
import { ProposalDecorations } from "./ProposalDecorations";
import { agency } from "../_lib/assets";
import { fdPath } from "../_lib/seo";
import {
  DECORATION_INTERIM,
  proposalDecorations,
  proposalInclusions,
  proposalPayment,
  proposalPersonalisation,
  proposalPhotography,
  proposalSteps,
  proposalVenue,
} from "@/content/flyingDressProposal";
import type { FlyingDressExperience } from "@/content/flyingDressExperiences";

/**
 * THE PROPOSAL PAGE.
 *
 * =========================================================================
 * WHY THIS ONE CATEGORY HAS ITS OWN COMPOSITION
 * =========================================================================
 * Eight celebration categories share one route and one renderer, which is
 * right for seven of them: a title, an intro, an experience record, the
 * siblings. The proposal is the one somebody plans for months, compares
 * against other suppliers, and spends real money on without ever meeting us,
 * and the generic renderer gives it the same four sections as a birthday.
 *
 * So the ROUTE is unchanged, the URL is unchanged, and the metadata, the
 * breadcrumbs and the structured data still come from the shared page. Only
 * the body is different, and only for this category. Nothing else on the site
 * moves.
 *
 * =========================================================================
 * THE RULE THIS PAGE IS BUILT AROUND
 * =========================================================================
 * We have no photograph of a proposal we have run. The agency work on this
 * roof is real and credited, and none of it is a proposal — it is couples, a
 * vow renewal, a gender reveal, groups. Every frame below says what it
 * actually is. The page sells by showing the ROOM, the LIGHT and the TEAM'S
 * WORK honestly, which it can, rather than by implying a portfolio it does
 * not have. See ProposalGallery.
 *
 * Likewise the venue. The owner supplied a name and a street and asked for
 * both to be verified; they are recorded in content/flyingDressProposal.ts
 * and held back from the page until somebody confirms them. The page says
 * what is true of the service regardless of which roof is confirmed.
 */

/**
 * The frames, each labelled with what it is rather than what it would be
 * convenient for it to be.
 *
 * Built from the asset registry rather than from paths typed here, so a
 * photograph that is retired or re-credited moves in one place. Order is
 * editorial: the roof and the view first, because that is the question a
 * visitor arrives with.
 */
function galleryFrames(): ProposalFrame[] {
  const slots: { slot: (typeof agency)[keyof typeof agency]; span: ProposalFrame["span"]; caption: string }[] = [
    {
      slot: agency.couplesRomance,
      span: "lead",
      caption:
        "The rooftop at sunrise, with the pyramids across the horizon. A couples shoot, not a proposal.",
    },
    {
      slot: agency.couplesVows,
      span: "pair",
      caption: "Golden hour on the same roof. Photographed at a vow renewal.",
    },
    {
      slot: agency.genderReveal,
      span: "pair",
      caption:
        "A decorated setup our team built on this roof, with a lit sign, an arch and evening lighting. Photographed at a gender reveal.",
    },
    {
      slot: agency.rooftopPortrait,
      span: "pair",
      caption: "The view the roof gives you, in daylight. A flying-dress session.",
    },
    {
      slot: agency.heroRooftop,
      span: "pair",
      caption: "The usable width of the roof, with the skyline behind it.",
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

export function ProposalPage({ experience }: { experience: FlyingDressExperience }) {
  const hero = agency.couplesRomance;
  const frames = galleryFrames();
  const enquire = fdPath("/enquire?experience=rooftop-proposal");

  return (
    <>
      {/* ---------------------------------------------------------------
          A. HERO. The photograph is the page's first argument, so it is
          given the whole width and the type sits under it rather than on
          top of it. An overlay at this contrast would either wash out the
          pyramids or make the headline unreadable, and the brand's own
          stylesheet has no scrim treatment for a reason.
          --------------------------------------------------------------- */}
      <section className="fd-section-tight fd-section-lede">
        <div className="fd-shell">
          <div style={{ maxWidth: "46rem" }}>
            <p className="fd-eyebrow">A private rooftop. Your setup. The moment you ask.</p>
            <h2 className="fd-display fd-h2" style={{ marginTop: "0.9rem" }}>
              Plan it so she never sees it coming
            </h2>
            <p className="fd-lead fd-muted" style={{ marginTop: "1.5rem" }}>
              You tell us the date and what she loves. We confirm a rooftop above Giza, build the
              setup before you arrive, and put the photographer where she will not be looking. The
              moment is photographed as it happens, not staged again afterwards.
            </p>
            <div className="fd-actions" style={{ marginTop: "2rem" }}>
              <Link className="fd-btn" href={enquire}>
                Plan your proposal
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
          B. WHAT IS INCLUDED. Two columns of short entries rather than a
          bulleted list: each one is a title somebody can scan and a
          sentence that earns it.
          --------------------------------------------------------------- */}
      <section className="fd-section-tight">
        <div className="fd-shell">
          <div style={{ maxWidth: "46rem", marginBottom: "2.5rem" }}>
            <p className="fd-eyebrow">What it includes</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              Everything in the morning, arranged before you get there
            </h2>
          </div>
          <ul className="fd-list fd-list-2">
            {proposalInclusions.map((item) => (
              <li key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ProposalGallery
        frames={frames}
        heading="The roof, and the light on it"
        intro="We have not photographed a proposal yet, so nothing below is one, and each frame says what it actually is. What they show is the room you would be standing in: the view, the width of the roof, the light at either end of the day, and a decorated setup this team built up there."
      />

      <ProposalDecorations decorations={proposalDecorations} interim={DECORATION_INTERIM} />

      {/* ---------------------------------------------------------------
          E. THE SEQUENCE. Numbered, because the question underneath this
          section is "what do I actually have to do", and an ordered list
          is the honest shape of that answer.
          --------------------------------------------------------------- */}
      <section className="fd-section-tight">
        <div className="fd-shell">
          <div style={{ maxWidth: "46rem", marginBottom: "2.5rem" }}>
            <p className="fd-eyebrow">Start to finish</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              From the first message to the photographs
            </h2>
          </div>
          <ol className="fd-steps">
            {proposalSteps.map((step, i) => (
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
          F + G. PERSONALISATION AND THE VENUE, side by side. The venue
          column carries the distinction this brand is most careful about:
          a rooftop with a view of the pyramids is not the complex.
          --------------------------------------------------------------- */}
      <section className="fd-section-tight fd-sand">
        <div className="fd-shell fd-split">
          <div>
            <p className="fd-eyebrow">Yours to decide</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem", marginBottom: "1.5rem" }}>
              What you can change
            </h2>
            <ul className="fd-list">
              {proposalPersonalisation.map((item) => (
                <li key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </li>
              ))}
            </ul>
          </div>

          <aside>
            <p className="fd-eyebrow">Where it happens</p>
            <h2 className="fd-display fd-h4" style={{ marginTop: "0.75rem" }}>
              A rooftop above Giza
            </h2>
            <p className="fd-muted" style={{ marginTop: "1rem" }}>
              {proposalVenue.description}
            </p>
            <div className="fd-note" style={{ marginTop: "1.5rem" }}>
              <p style={{ margin: 0 }}>{proposalVenue.notTheComplex}</p>
            </div>
            <p className="fd-muted" style={{ marginTop: "1.5rem", fontSize: "var(--fd-step--1)" }}>
              {proposalVenue.changingRoomInterim}
            </p>
          </aside>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          H. PHOTOGRAPHY. Its own section because it is the deliverable,
          and because the delivery terms the owner confirmed are the part
          competitors leave vague.
          --------------------------------------------------------------- */}
      <section className="fd-section-tight">
        <div className="fd-shell fd-split">
          <div>
            <p className="fd-eyebrow">What you receive</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              {proposalPhotography.countNote}
            </h2>
            <ul className="fd-list" style={{ marginTop: "1.5rem" }}>
              {proposalPhotography.covers.map((line) => (
                <li key={line}>
                  <p>{line}</p>
                </li>
              ))}
            </ul>
          </div>
          <aside>
            <div className="fd-note">
              <p style={{ margin: "0 0 0.75rem", fontWeight: 500, color: "var(--fd-ink)" }}>
                How they reach you
              </p>
              <p style={{ margin: "0 0 0.75rem" }}>{proposalPhotography.delivery}</p>
              <p style={{ margin: 0 }}>{proposalPhotography.noTurnaroundPromise}</p>
            </div>
          </aside>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          J. MONEY. A split, never a price: no figure has been set for any
          proposal package and this page must not imply one exists.
          --------------------------------------------------------------- */}
      <section className="fd-section-tight fd-sand">
        <div className="fd-shell">
          <div style={{ maxWidth: "46rem", marginBottom: "2.5rem" }}>
            <p className="fd-eyebrow">Securing the date</p>
            <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
              How the booking works
            </h2>
            <p className="fd-muted" style={{ marginTop: "1rem" }}>
              {proposalPayment.quoteNote}
            </p>
          </div>

          <div className="fd-paysplit">
            <div className="fd-paysplit-cell">
              <p className="fd-paysplit-figure">{proposalPayment.depositPercent}%</p>
              <p className="fd-paysplit-label">To hold your date</p>
              <p className="fd-paysplit-detail">{proposalPayment.depositNote}</p>
            </div>
            <div className="fd-paysplit-cell">
              <p className="fd-paysplit-figure">{proposalPayment.balancePercent}%</p>
              <p className="fd-paysplit-label">On the day, afterwards</p>
              <p className="fd-paysplit-detail">{proposalPayment.balanceNote}</p>
            </div>
            <div className="fd-paysplit-cell">
              <p className="fd-paysplit-label" style={{ marginTop: 0 }}>
                Ways to pay
              </p>
              <ul className="fd-paysplit-methods">
                {proposalPayment.methods.map((method) => (
                  <li key={method}>{method}</li>
                ))}
              </ul>
              <p className="fd-paysplit-detail">
                No card details are typed into this website, and no page here takes a payment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* M. The questions, from the experience record so the page and the
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

      {/* N. The last word. One primary action, one quieter one. */}
      <section className="fd-section-tight fd-sand">
        <div className="fd-shell" style={{ maxWidth: "46rem" }}>
          <h2 className="fd-display fd-h3">Plan the moment, and we will build the setting</h2>
          <p className="fd-muted" style={{ marginTop: "1rem" }}>
            Tell us when you are thinking of asking, what she would love, and how you are
            imagining it. We will come back with what is possible for your date, what it costs,
            and the setups available, in writing and on whichever channel you choose.
          </p>
          <div className="fd-actions" style={{ marginTop: "2rem" }}>
            <Link className="fd-btn" href={enquire}>
              Plan your proposal
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
