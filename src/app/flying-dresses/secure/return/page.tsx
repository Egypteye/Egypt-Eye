import type { Metadata } from "next";
import Link from "next/link";
import { loadReturnView, normaliseReference } from "@/lib/booking/returnLookup";
import { missingBookingCopy } from "@/lib/booking/returnView";
import { fdMetadata, fdPath } from "../../_lib/seo";

/**
 * WHERE PAYPAL SENDS A FLYING DRESSES CUSTOMER BACK.
 *
 * This page exists because the alternative is worse than a styling seam: a
 * customer who paid a deposit on flyingdressesegypt.com and was returned to
 * egypteyetravel.com would, at the exact moment of greatest anxiety about
 * money they have just sent, land on a different company's website. That is
 * the one place in the flow where a brand handoff reads as something having
 * gone wrong.
 *
 * Everything it reports is read and shaped by lib/booking/returnView.ts,
 * shared with Egypt Eye's return page. Read the note at the top of that file:
 * nothing about payment state comes from the URL, and the heading never
 * congratulates. This file is chrome.
 *
 * There is no account link, because this brand has no accounts. Egypt Eye's
 * version ends by sending people to /account; the honest equivalent here is
 * the email and the reference, which is what it offers.
 */

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return fdMetadata({
    title: "Your booking",
    description: "The state of your booking.",
    path: "",
    noindex: true,
  });
}

export default async function FlyingDressesReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  const booking = await loadReturnView(ref);

  if (!booking) {
    const copy = missingBookingCopy(normaliseReference(ref));
    return (
      <div className="fd-section">
        <div className="fd-shell fd-shell-narrow">
          <h1 className="fd-display fd-h1">{copy.heading}</h1>
          {copy.body.map((paragraph) => (
            <p key={paragraph} className="fd-lead">
              {paragraph}
            </p>
          ))}
          <div className="fd-actions" style={{ marginTop: "2rem" }}>
            <Link className="fd-btn" href={fdPath("/")}>
              Back to the start
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fd-section">
      <div className="fd-shell fd-shell-narrow">
        <p className="fd-eyebrow">{booking.copy.label}</p>
        <h1 className="fd-display fd-h1">{booking.heading}</h1>
        <p className="fd-lead">{booking.copy.message}</p>

        <dl className="fd-facts" style={{ marginTop: "1.5rem" }}>
          <Row label="What" value={booking.title} />
          {booking.when ? <Row label="When" value={booking.when} /> : null}
          <Row label="Reference" value={booking.reference} />
          {booking.depositAmount !== null ? (
            <Row
              label="Deposit"
              value={`${booking.depositAmount} US dollars, ${booking.depositStatusLabel}`}
            />
          ) : null}
        </dl>

        <p className="fd-muted" style={{ marginTop: "1.5rem", fontSize: "var(--fd-step--1)" }}>
          We have emailed you a copy. Quote {booking.reference} if you reply to us about it.
        </p>

        <div className="fd-actions" style={{ marginTop: "2rem" }}>
          <Link className="fd-btn fd-btn-ghost" href={fdPath("/")}>
            Back to the start
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
      <dt className="fd-muted">{label}</dt>
      <dd style={{ margin: 0, fontWeight: 500 }}>{value}</dd>
    </div>
  );
}
