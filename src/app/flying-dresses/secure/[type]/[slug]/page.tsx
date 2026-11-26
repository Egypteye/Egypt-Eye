import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getExperienceBySlug, getPhotoshootBySlug, getSiteSettings } from "@/sanity/fetchers";
import { productRail } from "@/lib/booking/productRail";
import { HUMAN_CONFIRMS } from "@/lib/booking/wording";
import { whatsappHref } from "@/content/flyingDresses";
import { fdMetadata, fdPath } from "../../../_lib/seo";
import { packageByEyeSlug } from "@/content/flyingDresses";
import { SecureBookingFields } from "../../../_components/SecureBookingFields";

/**
 * TAKING THE DEPOSIT ON THIS DOMAIN.
 *
 * =========================================================================
 * WHAT CHANGED, AND WHAT DELIBERATELY DID NOT
 * =========================================================================
 * This brand used to send anyone who pressed "pay the deposit" to
 * egypteyetravel.com/secure/photoshoot/<slug>. The long comment in
 * _components/BookingRail.tsx explained why, and it was right at the time:
 * the booking form was Tailwind markup, this layout loads only brand.css, and
 * mounting that form here rendered it unstyled around correct figures. The
 * same comment said the fix was real work on the one component that takes
 * money and belonged in its own change. This is that change.
 *
 * What did NOT change is the thing the seam was protecting:
 *
 *   - productRail() is still the single authority for whether this can be
 *     booked, for how much, and down which rail. It is asked here, exactly as
 *     Egypt Eye's page asks it, with the same arguments.
 *   - The form still posts to /api/bookings. One route, one reservation
 *     table, one PayPal account, one set of credentials. There is no second
 *     PayPal app and no second integration.
 *   - The behaviour and every sentence after submitting come from
 *     lib/booking/useSecureBooking.ts and lib/booking/secureResultCopy.ts,
 *     shared with Egypt Eye's form.
 *
 * So what is genuinely new is markup and a URL. CLAUDE.md section 5: one
 * authority, and no second answer computed beside it.
 *
 * =========================================================================
 * IT SHIPS INERT, AND THAT IS THE SAFETY PROPERTY
 * =========================================================================
 * The Flying Dresses Vercel project has no PAYPAL_* credentials yet. Without
 * them payPalConfig() returns null, rail.moneyMode is "none", and this page
 * renders the honest no-deposit path: send the request, a person comes back.
 * No dead button, no checkout that fails at PayPal. The owner switching the
 * credentials on is what turns the deposit live, and nothing here needs
 * editing when they do.
 *
 * =========================================================================
 * WHY A SEPARATE ROUTE RATHER THAN A SHARED ONE
 * =========================================================================
 * Because the layouts are separate, which is the point of this brand having
 * its own root layout at all (see the note in ../../../layout.tsx). A single
 * route cannot render in two <html> documents. The product it books is the
 * same Sanity document either way.
 *
 * noindex, like Egypt Eye's: a step in a flow, not a landing page, and a
 * search result pointing at a half-finished booking helps nobody.
 */

type Params = { type: string; slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const pkg = packageByEyeSlug(slug);
  return fdMetadata({
    title: pkg ? `Book ${pkg.name}` : "Book your date",
    description: "Choose your date and pay your deposit.",
    path: "",
    noindex: true,
  });
}

async function load(type: string, slug: string) {
  if (type === "photoshoot") return getPhotoshootBySlug(slug);
  if (type === "experience") return getExperienceBySlug(slug);
  return undefined;
}

export default async function FlyingDressesSecurePage({ params }: { params: Promise<Params> }) {
  const { type, slug } = await params;
  if (type !== "photoshoot" && type !== "experience") notFound();

  const [product, settings] = await Promise.all([load(type, slug), getSiteSettings()]);
  if (!product) notFound();

  /**
   * THE GATE THAT KEEPS THIS BRAND'S CHECKOUT TO THIS BRAND'S PRODUCTS.
   *
   * Without it, /secure/photoshoot/<any-egypt-eye-slug> on this domain would
   * render a desert safari or a Nile cruise in flying-dress chrome, under this
   * brand's name, taking a deposit for a product this brand does not sell.
   * That is not a styling problem; it is the site telling a customer something
   * untrue about who they are buying from.
   *
   * The allowed set is the packages this brand actually publishes, each of
   * which already names the Egypt Eye document it is sold as (`eyeSlug`), so
   * the list is derived rather than written out a second time here.
   */
  const pkg = packageByEyeSlug(slug);
  if (!pkg || type !== "photoshoot") notFound();

  // Asked exactly as Egypt Eye's page asks it, so the two pages and the
  // booking route cannot disagree about the figure.
  const { offer, rail } = productRail(product, type, settings.defaultDepositPercent, { isAdmin: false });
  // A product nobody has switched on has no booking page. Reaching this URL
  // by hand should look like what it is.
  if (!offer.available) notFound();

  const depositPercent = offer.depositPercent;
  const paymentMode = rail.moneyMode;

  return (
    <div className="fd-section">
      <div className="fd-shell fd-shell-narrow">
        <p className="fd-eyebrow fd-eyebrow-crumbs">
          <Link className="fd-link" href={fdPath(`/packages#${pkg.slug}`)}>
            ← {pkg.name}
          </Link>
        </p>

        {/* fd-h2, not fd-h1: fd-h1 is the hero scale and rendered this at
            102px, which dwarfed the form it is a label for and collided with
            the line beneath it. */}
        <h1 className="fd-display fd-h2">Request your date</h1>
        <p className="fd-lead">
          {product.title}
          {product.duration ? ` · ${product.duration}` : ""}
        </p>

        {/* The honesty notice sits ABOVE the form, not in the small print
            under the button. Someone who reads only one thing on this page
            should read this one. */}
        <div className="fd-note" style={{ marginTop: "2rem" }}>
          <p style={{ margin: "0 0 0.5rem", fontWeight: 500 }}>
            Confirming your date is the one part a person does.
          </p>
          {/* HUMAN_CONFIRMS, imported rather than paraphrased — the same rule
              BookingRail follows, for the same reason. */}
          <p className="fd-muted" style={{ margin: 0, fontSize: "var(--fd-step--1)" }}>
            {HUMAN_CONFIRMS}
          </p>
          {paymentMode !== "none" ? (
            <p className="fd-muted" style={{ margin: "0.75rem 0 0", fontSize: "var(--fd-step--1)" }}>
              <strong>Paying the deposit does not confirm your date.</strong> If we cannot offer the date
              you asked for, we refund your deposit of {offer.priceLabel} per person in full, or move it
              to a date that works.
            </p>
          ) : (
            <p className="fd-muted" style={{ margin: "0.75rem 0 0", fontSize: "var(--fd-step--1)" }}>
              Online deposits are not switched on yet, so <strong>nothing will be charged here</strong>.
              Send your request and we will come back to you with the details.
            </p>
          )}
        </div>

        {/* fd-rate-row, which is this brand's own pattern for a row of labelled
            figures, rather than fd-facts. fd-facts is a three-column grid that
            expects bare dt/dd children: wrapping each pair in a flex div gave
            it three cells of squashed label-and-value and wrapped "Paid online
            today" onto two lines. Checked against the render, not the name. */}
        <ul className="fd-rate-row">
          <li>
            <span className="fd-rate-label">Price per person</span>
            <span className="fd-rate-figure">{offer.priceLabel}</span>
          </li>
          <li>
            <span className="fd-rate-label">Paid online today</span>
            <span className="fd-rate-figure">{depositPercent}%</span>
          </li>
          <li>
            <span className="fd-rate-label">The rest</span>
            <span className="fd-rate-figure">Settled with us</span>
          </li>
        </ul>
        <p className="fd-muted" style={{ margin: "0.75rem 0 0", fontSize: "var(--fd-step--1)" }}>
          The remainder is settled with us directly and is never charged online.
        </p>

        <SecureBookingFields
          productType={type}
          productSlug={slug}
          productTitle={product.title}
          depositPercent={depositPercent}
          paymentMode={paymentMode}
        />

        {/* The other door stays visible the whole way through. Someone who
            gets halfway and realises they have a question should not have to
            go back to find us. */}
        <p className="fd-muted" style={{ marginTop: "2rem", fontSize: "var(--fd-step--1)" }}>
          Not sure yet, or want to ask something first?{" "}
          {/* fd-inline-link, not fd-link: fd-link is a standalone tap target
              (min-height 2.75rem, padding-block, border-bottom) and inside a
              sentence its border rendered as a rule floating below the
              paragraph. The inline variant underlines the words themselves. */}
          <a
            className="fd-inline-link"
            href={whatsappHref(
              `Hello, I have a question about ${pkg.name} before I book.`,
              settings.contact.whatsapp
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            Message us on WhatsApp
          </a>
          . We answer questions before bookings, gladly.
        </p>
      </div>
    </div>
  );
}
