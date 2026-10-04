import type { Metadata } from "next";
import Link from "next/link";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { bookingStateFromRow, stateCopy } from "@/lib/booking/states";
import { getLocale } from "@/i18n/dictionary";
import { localePath } from "@/i18n/locales";

// Where the payment provider sends the customer back.
//
// The single most important line in this file is the one that is not here:
// **nothing about payment state is read from the URL.** A customer landing
// here means their browser was redirected, which is not the same as a payment
// having succeeded — the redirect can be replayed, bookmarked, shared, or
// reached by someone who abandoned the payment and pressed back. The booking
// is looked up by reference and the state comes from the database, which is
// only ever written by a verified webhook or a person.
//
// So this page reports. It never decides, and it never congratulates.
//
// It is read with the service role because the customer may well be a guest
// with no account, and the row's RLS policy only admits its owner. The
// exposure that buys is small and deliberately bounded: a reference is eight
// random hex characters, and the page shows what was booked and what state it
// is in — never the guest's email, phone or anything else that would make a
// guessed reference worth guessing.

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

  const reference = typeof ref === "string" ? ref.trim().toUpperCase() : "";
  const booking = reference && supabaseAdminConfigured ? await load(reference) : null;

  return (
    <div className="mx-auto w-full max-w-xl px-5 py-16 sm:px-8">
      {!booking ? (
        <>
          <h1 className="font-display text-3xl font-semibold text-ink">We could not find that booking</h1>
          <p className="mt-4 leading-relaxed text-ink-soft">
            {reference
              ? `Nothing here matches ${reference}. If you have just paid, your confirmation email is the reliable record — please check your inbox.`
              : "This page needs a booking reference. Your confirmation email has yours."}
          </p>
          <p className="mt-4 leading-relaxed text-ink-soft">
            If something looks wrong, message us and we will sort it out — quoting that reference if you have it.
          </p>
          <Link
            href={to("/account")}
            className="mt-8 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition hover:bg-gold-dark"
          >
            Go to my account
          </Link>
        </>
      ) : (
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">{booking.copy.label}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
            {/* Never "Confirmed!" on the way back from a payment. The only
                state that may say so is one a person put the booking into. */}
            {booking.copy.isConfirmed ? "Your date is confirmed" : "Thank you — we have your booking"}
          </h1>

          <p className="mt-4 leading-relaxed text-ink-soft">{booking.copy.message}</p>

          <dl className="mt-8 space-y-2 rounded-2xl border border-black/5 bg-cream p-5 text-sm">
            <Row label="What" value={booking.title} />
            {booking.when && <Row label="When" value={booking.when} />}
            <Row label="Reference" value={booking.reference} />
            {booking.depositAmount !== null && (
              <Row
                label="Deposit"
                value={`$${booking.depositAmount} — ${booking.copy.charged ? "charged" : "not charged"}`}
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
        </>
      )}
    </div>
  );
}

async function load(reference: string) {
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase
    .from("reservations")
    .select("reference, status, deposit_status, deposit_amount, starts_at, slot_label, journey_snapshot")
    .eq("reference", reference)
    .maybeSingle();
  if (!data) return null;

  const snapshot = Array.isArray(data.journey_snapshot) ? data.journey_snapshot : [];
  const first = snapshot[0] as { title?: unknown } | undefined;

  return {
    reference: data.reference as string,
    copy: stateCopy(bookingStateFromRow(data as { status: string; deposit_status?: string | null })),
    title: typeof first?.title === "string" ? first.title : "Your booking",
    when: data.starts_at
      ? `${new Date(data.starts_at as string).toLocaleDateString(undefined, {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}${data.slot_label ? ` · ${data.slot_label}` : ""}`
      : null,
    depositAmount: (data.deposit_amount as number | null) ?? null,
  };
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="text-right font-semibold text-ink">{value}</dd>
    </div>
  );
}
