import type { Metadata } from "next";
import Link from "next/link";
import { loadReturnView, normaliseReference } from "@/lib/booking/returnLookup";
import { missingBookingCopy } from "@/lib/booking/returnView";
import { getLocale } from "@/i18n/dictionary";
import { localePath } from "@/i18n/locales";

// Where the payment provider sends the customer back.
//
// The reading of the booking row now lives in lib/booking/returnView.ts and
// the Supabase fetch in lib/booking/returnLookup.ts, because Flying Dresses
// has a return page of its own and the two must not read the row twice. The
// note at the top of returnView.ts is the one to read: nothing about payment
// state comes from the URL, and the heading never congratulates.
//
// What is left here is Egypt Eye's chrome and its account link.

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function SecureReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  const locale = await getLocale();
  const to = (path: string) => localePath(path, locale);

  const booking = await loadReturnView(ref);

  if (!booking) {
    const copy = missingBookingCopy(normaliseReference(ref));
    return (
      <div className="mx-auto w-full max-w-xl px-5 py-16 sm:px-8">
        <h1 className="font-display text-3xl font-semibold text-ink">{copy.heading}</h1>
        {copy.body.map((paragraph) => (
          <p key={paragraph} className="mt-4 leading-relaxed text-ink-soft">
            {paragraph}
          </p>
        ))}
        <Link
          href={to("/account")}
          className="mt-8 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition hover:bg-gold-dark"
        >
          Go to my account
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl px-5 py-16 sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">{booking.copy.label}</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink">{booking.heading}</h1>

      <p className="mt-4 leading-relaxed text-ink-soft">{booking.copy.message}</p>

      <dl className="mt-8 space-y-2 rounded-2xl border border-black/5 bg-cream p-5 text-sm">
        <Row label="What" value={booking.title} />
        {booking.when && <Row label="When" value={booking.when} />}
        <Row label="Reference" value={booking.reference} />
        {booking.depositAmount !== null && (
          <Row
            label="Deposit"
            value={`$${booking.depositAmount} — ${booking.depositStatusLabel}`}
          />
        )}
      </dl>

      <p className="mt-6 text-sm leading-relaxed text-ink-soft">
        We have emailed you a copy. You can follow this booking in your account at any time.
      </p>

      <Link
        href={to("/account")}
        className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition hover:bg-gold-dark"
      >
        See it in my account
      </Link>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="text-right font-semibold text-ink">{value}</dd>
    </div>
  );
}
