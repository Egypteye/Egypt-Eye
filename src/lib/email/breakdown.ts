// How a deposit is shown, in money the customer can check.
//
// Deliberately free of `server-only`: these functions decide the figures a
// paying customer reads, so scripts/check-booking.mts has to be able to render
// them and assert the arithmetic. Everything above them in templates.ts needs
// a server; this does not.
//
// The rule both emails follow: the breakdown states the whole ladder — lines,
// booking total, the percentage, what was paid, what is left — and the admin
// copy and the customer copy are built from the same function, so they cannot
// disagree about money.

/**
 * HTML-escape. Lives here rather than in resend.ts because that module is
 * `server-only`, and a pure string function behind that import cannot be
 * reached by a check script — the same reason paypalConfig was split out of
 * paypalClient. resend.ts re-exports it, so nothing that imported it moved.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type QuoteFacts = {
  lines: { label: string; unitCents: number; quantity: number; amountCents: number }[];
  /** The deposit — the only amount this flow ever charges. */
  totalCents: number;
  /** The whole booking: price x people, plus every extra. */
  bookingTotalCents?: number;
  /** The share taken now, as a percentage. */
  depositPercent?: number;
  /** bookingTotal minus deposit. Never charged online. */
  balanceCents?: number;
};

/**
 * The four figures an email may state, resolved from a stored quote.
 *
 * `attempt.quote` is a jsonb snapshot written when the payment was taken, so
 * rows predating the percentage model can be missing the wider fields. They
 * are derived rather than rendered as blanks: the lines always sum to the
 * booking, and the balance is always the booking less the deposit, so nothing
 * here can disagree with the money that moved.
 */
export function financials(quote: QuoteFacts) {
  const linesTotal = quote.lines.reduce((sum, line) => sum + line.amountCents, 0);
  const bookingTotalCents = quote.bookingTotalCents ?? linesTotal;
  const depositCents = quote.totalCents;
  const balanceCents = quote.balanceCents ?? Math.max(0, bookingTotalCents - depositCents);
  return { bookingTotalCents, depositCents, balanceCents, depositPercent: quote.depositPercent };
}

export function cents(value: number): string {
  const whole = Math.trunc(value / 100);
  const part = Math.abs(value % 100);
  return part === 0 ? `$${whole}` : `$${whole}.${String(part).padStart(2, "0")}`;
}

/** The deposit, line by line, exactly as it was calculated. */
export function breakdownRows(quote: QuoteFacts): string {
  const lines = quote.lines
    .map(
      (line) =>
        `<tr><td style="padding:4px 0;">${escapeHtml(
          line.quantity > 1 ? `${line.label} — ${cents(line.unitCents)} × ${line.quantity}` : line.label
        )}</td><td style="padding:4px 0;text-align:right;">${escapeHtml(cents(line.amountCents))}</td></tr>`
    )
    .join("");
  // The whole ladder, not just the ending. It used to list the lines and then
  // jump straight to "Deposit paid", so a customer read $398 + $45 and then a
  // number that matched neither — the booking total and the balance were in
  // the stored quote the whole time, and QuoteFacts simply did not expose
  // them. Both sides now see the same four figures.
  const f = financials(quote);
  const row = (label: string, value: string, strong = false, top = false) =>
    `<tr><td style="padding:${top ? "8px 0 0" : "4px 0"};${top ? "border-top:1px solid #e4e8e5;" : ""}">${
      strong ? `<strong>${escapeHtml(label)}</strong>` : escapeHtml(label)
    }</td><td style="padding:${top ? "8px 0 0" : "4px 0"};${
      top ? "border-top:1px solid #e4e8e5;" : ""
    }text-align:right;">${strong ? `<strong>${escapeHtml(value)}</strong>` : escapeHtml(value)}</td></tr>`;

  const percent = f.depositPercent !== undefined ? `${f.depositPercent}% deposit` : "Deposit";
  return [
    lines,
    row("Booking total", cents(f.bookingTotalCents), true, true),
    row(percent, `${cents(f.bookingTotalCents)} x ${f.depositPercent ?? "—"}%`),
    row("Paid now", cents(f.depositCents), true),
    row("Balance due, never charged online", cents(f.balanceCents), true, true),
  ].join("");
}

export function breakdownText(quote: QuoteFacts): string {
  const f = financials(quote);
  return quote.lines
    .map(
      (line) =>
        `  ${line.quantity > 1 ? `${line.label} — ${cents(line.unitCents)} x ${line.quantity}` : line.label}: ${cents(line.amountCents)}`
    )
    .concat(
      `  Booking total: ${cents(f.bookingTotalCents)}`,
      `  ${f.depositPercent !== undefined ? `${f.depositPercent}% deposit` : "Deposit"}: ${cents(f.depositCents)} (paid)`,
      `  Balance due, never charged online: ${cents(f.balanceCents)}`
    )
    .join("\n");
}
