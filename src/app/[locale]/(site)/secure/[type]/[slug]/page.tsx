import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getExperienceBySlug, getPhotoshootBySlug, getSiteSettings } from "@/sanity/fetchers";
import { presentDeposit, resolveDeposit } from "@/lib/booking/deposit";
import { paymentProviderFor } from "@/lib/booking/activeProvider";
import { resolveRail } from "@/lib/booking/rail";
import { SecureBookingForm } from "./SecureBookingForm";
import { getLocale } from "@/i18n/dictionary";
import { localePath } from "@/i18n/locales";
import { whatsappHref } from "@/lib/whatsapp";

// "Secure your date" — the deposit path, for travellers who already know what
// they want.
//
// A page rather than a modal, deliberately (see docs/booking-deposits.md): it
// has a URL that survives the round trip to a payment provider, can be sent to
// someone to resume, and can be the page they land back on. None of those are
// optional for something that takes money.
//
// It is noindex: it is a step in a flow, not a landing page, and a search
// result pointing at a half-finished booking helps nobody.

export const metadata: Metadata = { robots: { index: false, follow: false } };

type Params = { type: string; slug: string };

async function load(type: string, slug: string) {
  if (type === "photoshoot") return getPhotoshootBySlug(slug);
  if (type === "experience") return getExperienceBySlug(slug);
  return undefined;
}

export default async function SecurePage({ params }: { params: Promise<Params> }) {
  const { type, slug } = await params;
  if (type !== "photoshoot" && type !== "experience") notFound();

  const [product, settings] = await Promise.all([load(type, slug), getSiteSettings()]);
  if (!product) notFound();

  const deposit = resolveDeposit(product, settings.defaultDepositUsd);
  // A product nobody has switched on has no booking page. Reaching this URL by
  // hand should look like what it is — a page that does not exist — rather
  // than an empty form that cannot do anything.
  if (!deposit.bookable) notFound();

  const locale = await getLocale();
  const to = (path: string) => localePath(path, locale);
  const price = presentDeposit(deposit.amountUsd);
  // Asked once, in lib/booking/rail.ts, and read here — the same answer the
  // booking route acts on. Deriving it separately is how a page came to say
  // "held, not charged" about money the route captures.
  const paymentMode = resolveRail(deposit, paymentProviderFor({ isAdmin: false })).moneyMode;
  const productPath = type === "photoshoot" ? `/photoshoots/${slug}` : `/experiences/${slug}`;

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-12 sm:px-8 sm:py-16">
      <Link href={to(productPath)} className="text-sm font-semibold text-ink-soft/85 hover:text-ink">
        ← {product.title}
      </Link>

      <h1 className="mt-5 font-display text-3xl font-semibold text-ink sm:text-4xl">Request your date</h1>
      <p className="mt-3 leading-relaxed text-ink-soft">
        {product.title}
        {product.duration ? ` · ${product.duration}` : ""}
      </p>

      {/* The honesty notice sits ABOVE the form, not in the small print under
          the button. Someone who reads only one thing on this page should read
          this one. */}
      <div className="mt-8 rounded-2xl border border-gold/30 bg-sand/40 p-5">
        <p className="font-semibold text-ink">This is not an instant booking.</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          A member of our team checks availability for your date and confirms it personally — usually within 48
          hours. We would rather confirm properly than confirm quickly.
        </p>
        {paymentMode !== "none" ? (
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            <strong className="text-ink">Paying the deposit does not confirm your date.</strong> If we cannot
            confirm the date you asked for, we refund your {price.deposit} deposit in full, or move it to a date
            that works.
          </p>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Online deposits are not switched on yet, so <strong className="text-ink">nothing will be charged
            here</strong>. Send your request and our team will come back to you with the details.
          </p>
        )}
      </div>

      <dl className="mt-6 space-y-2 rounded-2xl border border-black/5 bg-cream p-5 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-soft">Deposit to book this date</dt>
          <dd className="font-semibold text-ink">{price.deposit}</dd>
        </div>
        <p className="pt-1 text-ink-soft">
          Credited toward your final price. We confirm the full details and price with you directly — this is the
          only amount you pay now.
        </p>
      </dl>

      <SecureBookingForm
        productType={type}
        productSlug={slug}
        productTitle={product.title}
        depositLabel={price.deposit}
        paymentMode={paymentMode}
      />

      {/* The other door stays visible the whole way through. Someone who gets
          halfway and realises they have a question should not have to go back
          to find us. */}
      <p className="mt-8 border-t border-black/5 pt-6 text-sm text-ink-soft">
        Not sure yet, or want to ask something first?{" "}
        <a
          href={whatsappHref(settings.contact.whatsappLink, { page: "the booking page", item: product.title })}
          className="font-semibold text-gold-dark underline-offset-4 hover:underline"
        >
          Message us on WhatsApp
        </a>{" "}
        — we answer questions before bookings, gladly.
      </p>
    </div>
  );
}
