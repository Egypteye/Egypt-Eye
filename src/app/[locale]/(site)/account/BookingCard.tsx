import { stateCopy, type BookingState } from "@/lib/booking/states";

// One deposit booking, as its owner sees it.
//
// The card's whole job is to answer "what is happening and has my money
// moved", which an ordinary reservation row cannot: it has one badge and no
// notion of a payment that is held rather than taken. Every word here comes
// from lib/booking/states.ts, so this page, the emails and the secure page
// cannot drift into describing the same booking differently.

const TONE: Record<BookingState, string> = {
  awaitingDeposit: "bg-black/5 text-ink-soft",
  held: "bg-gold/15 text-gold-dark",
  checking: "bg-gold/15 text-gold-dark",
  confirmed: "bg-nile/10 text-nile",
  declined: "bg-terracotta/10 text-terracotta",
  cancelled: "bg-black/5 text-ink-soft",
};

export function BookingCard({
  reference,
  state,
  title,
  startsAt,
  slotLabel,
  depositAmount,
}: {
  reference: string;
  state: BookingState;
  title: string;
  startsAt: string | null;
  slotLabel: string | null;
  depositAmount: number | null;
}) {
  const copy = stateCopy(state);
  const when = startsAt
    ? new Date(startsAt).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div className="rounded-2xl border border-black/5 bg-cream p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-ink">{title}</p>
          <p className="mt-0.5 text-xs text-ink-soft/85">
            {when ?? "Date to be confirmed"}
            {slotLabel ? ` · ${slotLabel}` : ""} · <span className="font-mono">{reference}</span>
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${TONE[state]}`}>{copy.label}</span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{copy.message}</p>

      {/* Stated separately from the sentence above, because "has my card been
          charged" is the question people actually come here to answer. */}
      {depositAmount !== null && (
        <p className="mt-2 text-xs text-ink-soft/85">
          Deposit ${depositAmount} — {copy.charged ? "charged" : "not charged"}.
        </p>
      )}
    </div>
  );
}
