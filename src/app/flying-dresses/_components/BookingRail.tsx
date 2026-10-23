import Link from "next/link";
import { getPhotoshootBySlug, getSiteSettings } from "@/sanity/fetchers";
import { productRail } from "@/lib/booking/productRail";
import { HUMAN_CONFIRMS } from "@/lib/booking/wording";
import type { FlyingDressPackage } from "@/content/flyingDresses";
import { EGYPT_EYE_ORIGIN, flyingDressEnquiry, whatsappHref } from "@/content/flyingDresses";
import { fdPath } from "../_lib/seo";

/**
 * INSTANT BOOKING — the same PayPal rail Egypt Eye already runs.
 *
 * =========================================================================
 * WHAT THIS DOES NOT DO, AND WHY THAT IS THE POINT
 * =========================================================================
 * It does not compute a deposit. It does not read a PayPal credential. It does
 * not know what percentage is charged. It does not hardcode "25%". It writes
 * no reservation and takes no money.
 *
 * It asks `productRail()` — the single authority for "can this be booked, for
 * how much, down which rail" (src/lib/booking/productRail.ts) — about the
 * Egypt Eye photoshoot document that IS this shoot, and renders a branded
 * button to the booking page that already exists and already works.
 *
 * That is deliberate and it is the whole design. CLAUDE.md §5: money is one
 * authority, and a second answer computed beside it is the bug. The three
 * flying-dress shoots are instantly bookable on egypteyetravel.com today, with
 * a live 25% PayPal deposit; the owner asked for the same PayPal, and the same
 * PayPal means the same rail, not a second integration pointed at the same
 * account. A second integration is how two sites start quoting two deposits
 * for one shoot.
 *
 * =========================================================================
 * WHY THE BUTTON LEAVES THIS DOMAIN
 * =========================================================================
 * It links to /secure/photoshoot/<slug>, which is the Egypt Eye-styled booking
 * page. That is a visible seam and it is the honest trade: the alternative is
 * forking a 1,200-line form that collects a headcount, extras, outfits and a
 * date and then runs PayPal, and a forked money form is exactly the second
 * answer the rule above forbids. Restyling that page for this brand is real
 * work with real risk and belongs in its own reviewed change — it is written
 * up in docs/FLYING-DRESSES-OWNER-CONFIRMATIONS.md rather than rushed here.
 *
 * So this component's job is to make the seam as soft as possible: it states
 * the real figures, states plainly what paying does and does not do, and sends
 * people on with no surprises.
 *
 * =========================================================================
 * WHEN THE DEPOSIT IS NOT AVAILABLE
 * =========================================================================
 * `offer.available` is false whenever the product has no price or its
 * Instant Booking switch is off in Sanity Studio — and also whenever Sanity is
 * unreachable, because the fetcher then falls back to the repo's content file,
 * which deliberately carries no `bookable` flag (see the note in
 * content/photoshoots.ts). In every one of those cases this renders the
 * ENQUIRY path instead of a dead button.
 *
 * No disabled button, no button that 404s, no "coming soon". A control that
 * looks like it books and does not is worse than no control.
 */
/**
 * CAN ANY OF THESE ACTUALLY BE PAID FOR ONLINE RIGHT NOW?
 *
 * This exists because /packages was promising something its own rails then
 * refused. The section was headed "Pay a deposit and choose your date now"
 * over the sentence "Booking runs on the same secure PayPal checkout our team
 * has used for every photoshoot" — and underneath it, all three rails said
 * "Online deposits are not open for this date right now". Typed prose above
 * a computed component, drifting apart the moment the computed half changed.
 *
 * A customer reads the promise, scrolls, finds no way to pay, and concludes
 * the site is broken — or worse, that the business is not real. It is the
 * most expensive kind of copy error: it costs trust at the exact moment the
 * visitor had decided to spend money.
 *
 * So the heading and the lede now ASK, through the same `productRail()`
 * authority the rails themselves use. One source, one answer, and the two
 * halves of the section cannot disagree again.
 */
export async function anyPackageTakesPaymentOnline(
  list: readonly FlyingDressPackage[]
): Promise<boolean> {
  const settings = await getSiteSettings();
  const results = await Promise.all(
    list.map(async (pkg) => {
      const product = await getPhotoshootBySlug(pkg.eyeSlug);
      if (!product) return false;
      const resolved = productRail(product, "photoshoot", settings.defaultDepositPercent, {
        isAdmin: false,
      });
      return resolved.offer.available && resolved.rail.moneyMode !== "none";
    })
  );
  return results.some(Boolean);
}

export async function BookingRail({ pkg }: { pkg: FlyingDressPackage }) {
  const [product, settings] = await Promise.all([
    getPhotoshootBySlug(pkg.eyeSlug),
    getSiteSettings(),
  ]);

  // Not admin: a customer's view of the rail, which is the only one that
  // should ever decide what a public page shows.
  const resolved = product
    ? productRail(product, "photoshoot", settings.defaultDepositPercent, { isAdmin: false })
    : null;

  // DepositOffer is a discriminated union on `available`, so this is written
  // as a guard rather than a boolean: narrowing it here is what lets the
  // markup below read offer.priceLabel and offer.depositPercent at all. The
  // type makes it impossible to render a deposit figure for an offer that does
  // not have one — which is the failure this whole component is guarding.
  const offer = resolved?.offer;
  const takesMoney = resolved ? resolved.rail.moneyMode !== "none" : false;

  if (!offer || !offer.available || !takesMoney) {
    return (
      <div className="fd-note">
        <p style={{ margin: "0 0 0.75rem", fontWeight: 500, color: "var(--fd-ink)" }}>
          {/* TWO DIFFERENT SITUATIONS, AND THEY SHOULD NOT READ THE SAME.
              "not open for this date right now" implies a temporary,
              date-specific state somebody could wait out. That is true for a
              shoot whose deposit happens to be switched off, and false for a
              shoot with no Egypt Eye product behind it at all: the button is
              not closed, it does not exist. A customer who waits for a button
              that is never coming is a customer who does not enquire.

              THIS ASKED THE WRONG QUESTION UNTIL THE YACHT GOT A PRICE.
              It read `pkg.priceUsd === null`, which was a stand-in for "has
              nothing behind it" and was true of the Red Sea yacht only while
              the yacht had no figure. The owner gave it one ($399) and the
              stand-in silently flipped: a package with a price and no product
              started telling customers deposits were shut "right now", for a
              date, when there was no product to take a deposit against and
              never had been.

              So it asks about the thing it actually means. `product` is the
              Egypt Eye photoshoot this package books against, resolved from
              eyeSlug above; no product means nothing to wait for, whatever
              the package's own price says. A product that exists but is not
              currently selling is the temporary case, and keeps the
              temporary wording. */}
          {!product
            ? "This one is quoted rather than listed"
            : "Online deposits are not open for this date right now"}
        </p>
        <p style={{ margin: "0 0 1.25rem" }}>
          Nothing will be charged here. Send us your dates and we will confirm availability and
          arrange payment with you directly.
        </p>
        <div className="fd-actions">
          <Link className="fd-btn" href={fdPath(`/enquire?package=${pkg.slug}`)}>
            Request this date
          </Link>
          <a
            className="fd-btn fd-btn-ghost"
            href={whatsappHref(flyingDressEnquiry({ subject: pkg.title, location: pkg.name }))}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ask on WhatsApp
            <span className="fd-sr"> (opens in a new tab)</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        border: "1px solid var(--fd-gold-line)",
        padding: "clamp(1.25rem, 0.75rem + 1.5vw, 2rem)",
        background: "var(--fd-ivory)",
      }}
    >
      <p className="fd-eyebrow" style={{ marginBottom: "0.75rem" }}>
        Instant booking
      </p>
      <p className="fd-display fd-h4" style={{ margin: "0 0 1rem" }}>
        Secure this date with a {offer.depositPercent}% deposit
      </p>

      {/* The real figures, from the backend. Not a second copy of the price
          typed into this brand's content file — if the Studio price changes,
          this line changes with it. */}
      <dl
        style={{
          display: "grid",
          gap: "0.5rem",
          margin: "0 0 1.25rem",
          fontSize: "var(--fd-step-0)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
          <dt className="fd-muted">Price</dt>
          <dd style={{ margin: 0, fontWeight: 500 }}>{offer.priceLabel} per person</dd>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
          <dt className="fd-muted">Paid online today</dt>
          <dd style={{ margin: 0, fontWeight: 500 }}>{offer.depositPercent}% of the booking</dd>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
          <dt className="fd-muted">The rest</dt>
          <dd style={{ margin: 0, fontWeight: 500 }}>Settled with us, never charged online</dd>
        </div>
      </dl>

      {/* HUMAN_CONFIRMS, imported rather than paraphrased.
          The sentence that matters is "confirming the date is the one part a
          person does" — and it matters enough that this brand must never write
          its own version of it, which would drift from Egypt Eye's the first
          time either was edited. CLAUDE.md §5: never tell a customer a booking
          is confirmed because PayPal captured. */}
      <p className="fd-muted" style={{ fontSize: "var(--fd-step--1)", margin: "0 0 1.5rem" }}>
        {HUMAN_CONFIRMS}
      </p>

      <div className="fd-actions">
        {/* An ABSOLUTE link to the Egypt Eye origin, and a plain <a> rather
            than next/link, because this leaves the app.

            It is absolute so that this brand's own deployment never has to
            serve a payment route — see EGYPT_EYE_ORIGIN in
            content/flyingDresses.ts. The Flying Dresses project therefore
            needs no PayPal credentials at all, which is why src/proxy.ts can
            refuse every /api/bookings/* path on this domain without breaking
            anything. */}
        <a className="fd-btn" href={`${EGYPT_EYE_ORIGIN}/secure/photoshoot/${pkg.eyeSlug}`}>
          Choose your date &amp; pay the deposit
        </a>
        <Link className="fd-btn fd-btn-ghost" href={fdPath(`/enquire?package=${pkg.slug}`)}>
          Or ask us first
        </Link>
      </div>

      <p className="fd-muted" style={{ fontSize: "var(--fd-step--1)", marginTop: "1.25rem" }}>
        Secure checkout runs on our Egypt Eye booking page: the same team, the same shoot, the
        same PayPal account. Card details are never typed into a form on this site.
      </p>
    </div>
  );
}
