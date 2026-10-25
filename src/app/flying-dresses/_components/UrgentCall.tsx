import { urgentCall } from "@/content/flyingDresses";

/**
 * The call-first route, for a date that is too close for a form.
 *
 * Asked for directly: urgent and last minute enquiries should ring the line
 * rather than queue behind an email. Everywhere else on this site the form is
 * the front door and the phone is the alternative; here that is reversed, and
 * the point of the component is that the reversal looks deliberate rather than
 * like a stray phone number.
 *
 * THE NUMBER IS A PROP, NEVER A CONSTANT. It is editable in the Studio, and
 * once that document exists Sanity replaces the content file wholesale
 * (CLAUDE.md §3). Hardcoding it here would leave this one card dialling a
 * retired number, on the route used by exactly the people who cannot afford a
 * second attempt. Callers pass fdSettings().contact.phones; urgentCall.fallback
 * is for surfaces with no settings to read.
 *
 * It is a real <a href="tel:">, so a phone dials and a desktop hands off to
 * whatever the person uses for calls. No click handler, no analytics wrapper:
 * a link that needs JavaScript to dial is a link that fails in the one case
 * this exists for.
 *
 * THREE WEIGHTS, BECAUSE THE SAME ROUTE IS NOT EQUALLY URGENT EVERYWHERE.
 * "card" is the loud one, for a page that is not otherwise about getting in
 * touch. "quiet" is the same content turned down, for the foot of a page that
 * already IS a way of getting in touch — on the enquiry page the loud card sat
 * above the form and shouted at every visitor, including the ones whose date
 * is next spring. "inline" is one sentence, for inside another block.
 */
export function UrgentCall({
  phone,
  variant = "card",
}: {
  phone: { display: string; tel: string };
  /** "card" for a page section, "quiet" for under one, "inline" for inside a block. */
  variant?: "card" | "quiet" | "inline";
}) {
  if (variant === "inline") {
    return (
      <p style={{ margin: "0.75rem 0 0" }}>
        {urgentCall.eyebrow}?{" "}
        <a href={`tel:${phone.tel}`} className="fd-link">
          {phone.display}
        </a>
      </p>
    );
  }

  return (
    <div className={variant === "quiet" ? "fd-urgent-quiet" : "fd-urgent"}>
      <p className="fd-eyebrow">{urgentCall.eyebrow}</p>
      <p className="fd-urgent-number">
        <a href={`tel:${phone.tel}`}>{phone.display}</a>
      </p>
      <p className="fd-urgent-blurb">{urgentCall.blurb}</p>
    </div>
  );
}
