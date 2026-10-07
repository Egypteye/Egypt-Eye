import { quoteDeposit, type Quote } from "./quote";

// The database-free half of the payment self test, in one place because it had
// two.
//
// The admin panel at /admin/paypal asserts the payment guarantees against the
// real tables. Most of that needs a database and an admin session, so it can
// only run as a server action on a deployed site. But the first few checks are
// pure arithmetic over a fixture, and keeping them inside that server action
// meant the fixture was a second copy of the quote rules that no check script
// could reach: scripts/check-quote.mts stayed green with its own fixtures
// while the panel went red, and the staleness only surfaced when somebody
// opened the page — during a go-live, which is the worst possible moment.
//
// So the fixture lives here, free of "use server", and both callers run it:
// the panel renders the results, and check-quote.mts fails the build if any of
// them is false. A field renamed in the pricing model now breaks a check
// script, not a live admin page.
//
// The fixture uses GROQ's shape deliberately — explicit `null` for an unset
// field rather than an omitted key, because that is what production sends.

export type SelfTestCheck = { label: string; ok: boolean; detail: string };

/** The product the checks quote against: one backend price, one switch. */
const PRODUCT = {
  slug: "selftest",
  title: "Self test",
  bookable: true,
  price: { amount: 200 },
  depositPercent: null,
  extras: [{ label: "Reel", priceUsd: 25 }],
};

/** 3 x $200 = $600, plus 2 reels at $25 = $650. 25% of that is $162.50. */
const EXPECTED_DEPOSIT_CENTS = 16_250;

export function quoteSelfTest(): { checks: SelfTestCheck[]; quote: Quote | null } {
  const checks: SelfTestCheck[] = [];
  const add = (label: string, ok: boolean, detail: string) => checks.push({ label, ok, detail });

  const q = quoteDeposit(PRODUCT, "photoshoot", {
    people: 3,
    extras: [{ label: "Reel", quantity: 2 }],
  });

  add(
    "The deposit is calculated from the booking",
    q.ok && q.quote.totalCents === EXPECTED_DEPOSIT_CENTS,
    q.ok
      ? `3 x $200 + 2 x $25 = $${q.quote.bookingTotalCents / 100}, and ${q.quote.depositPercent}% of it is $${q.quote.totalCents / 100}`
      : `no quote was produced (${q.reason})`
  );

  // The deposit must never be the whole booking. This is the single most
  // expensive thing that could go wrong, so it is asserted on its own rather
  // than left implied by the figure above.
  add(
    "Only the deposit is charged, never the balance",
    q.ok && q.quote.totalCents < q.quote.bookingTotalCents,
    q.ok
      ? `$${q.quote.totalCents / 100} taken now, $${q.quote.balanceCents / 100} left to settle away from the website`
      : `no quote was produced (${q.reason})`
  );

  // A selection carrying its own price, and one naming an extra the product
  // does not offer. Both must change nothing at all.
  const forged = quoteDeposit(PRODUCT, "photoshoot", {
    people: 3,
    extras: [
      { label: "Reel", quantity: 2, priceUsd: 0 },
      { label: "Private Jet", quantity: 1, priceUsd: 1 },
    ] as unknown[],
  });
  add(
    "A price sent from the browser is ignored",
    forged.ok && forged.quote.totalCents === EXPECTED_DEPOSIT_CENTS && forged.quote.lines.length === 2,
    forged.ok
      ? `the forged prices were discarded and the figure stayed $${forged.quote.totalCents / 100}`
      : `a selection carrying its own price bought nothing (${forged.reason})`
  );

  return { checks, quote: q.ok ? q.quote : null };
}
