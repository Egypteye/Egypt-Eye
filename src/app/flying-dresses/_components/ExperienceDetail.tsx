import Link from "next/link";
import {
  DELIVERY_LABELS,
  type FlyingDressExperience,
} from "@/content/flyingDressExperiences";
import { flyingDressEnquiry, whatsappHref } from "@/content/flyingDresses";
import { FaqList } from "./FaqList";
import { fdPath } from "../_lib/seo";

/**
 * One experience, rendered in full.
 *
 * THE SHAPE OF THIS COMPONENT IS AN ARGUMENT about what a customer needs to
 * know before they plan a trip around something. The order is deliberate:
 * what it is, who it is for, what we actually deliver, what costs extra and
 * who supplies it, where it happens, how far ahead to ask, and then what has
 * to be true for it to happen at all.
 *
 * That last section is the one most sites leave out. A customer booking a
 * surprise proposal from another continent is making an expensive,
 * date-locked decision, and "the rooftop belongs to a hotel and has to agree"
 * is not small print to them. It is the thing they most need to hear early.
 *
 * NO PRICE APPEARS unless the experience carries a confirmed one. Every
 * experience in the catalogue today is `enquire`, so every one of these pages
 * ends in a conversation rather than a checkout. That is correct: there is no
 * payment rail on this brand and no availability to check against.
 */
export function ExperienceDetail({ experience }: { experience: FlyingDressExperience }) {
  const enquiryHref = fdPath(`/enquire?experience=${experience.slug}`);
  const whatsapp = whatsappHref(
    flyingDressEnquiry({ subject: experience.title, location: experience.name })
  );

  return (
    <>
      <section className="fd-section-tight" aria-labelledby={`fd-${experience.slug}-heading`}>
        <div className="fd-shell fd-shell-narrow">
          <p className="fd-eyebrow">{experience.eyebrow}</p>
          <h2 id={`fd-${experience.slug}-heading`} className="fd-display fd-h2">
            {experience.title}
          </h2>
          <p className="fd-lead fd-muted" style={{ marginTop: "1.75rem" }}>
            {experience.intro}
          </p>

          <div className="fd-actions" style={{ marginTop: "2.5rem" }}>
            <Link className="fd-btn" href={enquiryHref}>
              Plan this experience
            </Link>
            <a
              className="fd-btn fd-btn-ghost"
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ask on WhatsApp
              <span className="fd-sr"> (opens in a new tab)</span>
            </a>
          </div>

          {/* WHY THERE IS NO PRICE, said rather than left as a gap.
              An absent number reads as evasion. The reason is better than the
              silence: nothing here is a fixed product yet, and quoting a
              figure we have not confirmed is worse than quoting none. */}
          {experience.pricing.kind === "enquire" ? (
            <p className="fd-note" style={{ marginTop: "2rem" }}>
              <strong style={{ fontWeight: 500 }}>No price on this page.</strong> This one is
              quoted rather than listed, because what it costs depends on the decoration, the
              venue and which extras you want. Tell us what you are planning and you will get a
              real figure, not a starting-from.
            </p>
          ) : null}
        </div>
      </section>

      <section className="fd-section-tight fd-sand">
        <div className="fd-shell fd-split">
          <div>
            <p className="fd-eyebrow">Who it is for</p>
            <ul className="fd-ticks" style={{ marginTop: "1.5rem" }}>
              {experience.whoItIsFor.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="fd-eyebrow">What we deliver</p>
            <ul className="fd-ticks" style={{ marginTop: "1.5rem" }}>
              {experience.included.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* EXTRAS, EACH ONE SAYING WHO SUPPLIES IT.
          A list of add-ons with no attribution implies we provide them all.
          Half of these are a florist's, a musician's or the hotel's, and the
          difference decides whether a thing can be confirmed today or next
          week. */}
      <section className="fd-section-tight">
        <div className="fd-shell fd-shell-narrow">
          <p className="fd-eyebrow">Optional</p>
          <h3 className="fd-display fd-h3" style={{ marginBottom: "0.75rem" }}>
            What you can add
          </h3>
          <p className="fd-muted" style={{ marginBottom: "2rem" }}>
            Each of these says who actually provides it, because that is what decides how quickly
            we can confirm it.
          </p>
          <ul className="fd-list fd-extras-list">
            {experience.extras.map((extra) => (
              <li key={extra.label}>
                <h4>{extra.label}</h4>
                <p className={`fd-supplier fd-supplier-${extra.delivery}`}>
                  {DELIVERY_LABELS[extra.delivery]}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="fd-section-tight fd-sand">
        <div className="fd-shell fd-shell-narrow">
          <dl className="fd-facts">
            <div>
              <dt>Where</dt>
              <dd>{experience.locationNote}</dd>
            </div>
            <div>
              <dt>How long</dt>
              <dd>{experience.durationNote}</dd>
            </div>
            <div>
              <dt>How far ahead</dt>
              <dd>{experience.leadTimeNote}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* THE SECTION MOST SITES LEAVE OUT.
          Someone booking this from another continent is locking a date and
          buying flights. What has to be true for it to happen is not small
          print to them, and burying it is how a surprise becomes a refund. */}
      <section className="fd-section-tight fd-dark fd-on-dark">
        <div className="fd-shell fd-shell-narrow">
          <p className="fd-eyebrow">Before you plan around it</p>
          <h3 className="fd-display fd-h3" style={{ marginBottom: "1.75rem" }}>
            What has to be <span className="fd-script-accent">true</span>
          </h3>
          <ul className="fd-ticks fd-ticks-plain">
            {experience.dependencies.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </section>

      {experience.faqs.length ? (
        <section className="fd-section-tight">
          <div className="fd-shell fd-shell-narrow">
            <h3 className="fd-display fd-h3" style={{ marginBottom: "2rem" }}>
              Questions
            </h3>
            <FaqList faqs={experience.faqs} />
          </div>
        </section>
      ) : null}
    </>
  );
}
