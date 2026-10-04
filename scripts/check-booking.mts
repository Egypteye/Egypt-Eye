/**
 * Guards the deposit booking rules, which are promises rather than behaviour.
 *
 * Two of them are the whole design, and both fail silently if they regress:
 *
 *   1. No payment event may ever produce a confirmed booking. The research
 *      into tour platforms turns up the same complaint repeatedly — a customer
 *      pays, the site says "confirmed", and nobody has checked anything. The
 *      wait is never the complaint; being told something untrue is.
 *   2. A product with no deposit figure shows no button. Inventing a figure
 *      would be inventing a business fact, and charging $0 to "secure" a date
 *      would be a broken promise rather than a free one.
 */
import { presentDeposit, resolveDeposit, type BookableProduct } from "../src/lib/booking/deposit";
import {
  canTransition,
  holdsFunds,
  stateAfterPaymentHeld,
  stateCopy,
  type BookingState,
} from "../src/lib/booking/states";

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

const ALL: BookingState[] = ["awaitingDeposit", "held", "checking", "confirmed", "declined", "cancelled"];

// ---------------------------------------------------------------------------
// 1. Payment can never confirm a booking.
// ---------------------------------------------------------------------------
for (const state of ALL) {
  // Leaving an already-confirmed booking alone is correct; turning any other
  // state into a confirmed one is the failure.
  const after = stateAfterPaymentHeld(state);
  ok(
    `a payment event turned a ${state} booking into a confirmed one — only a human may do that`,
    after !== "confirmed" || state === "confirmed"
  );
}
ok("a held payment moves an awaiting booking to held", stateAfterPaymentHeld("awaitingDeposit") === "held");
ok("a second payment event does not move a confirmed booking", stateAfterPaymentHeld("confirmed") === "confirmed");
ok("a payment event cannot revive a declined booking", stateAfterPaymentHeld("declined") === "declined");

// Only `confirmed` may claim to be confirmed, and only it says money moved.
for (const state of ALL) {
  const copy = stateCopy(state);
  ok(`${state} claims to be confirmed`, copy.isConfirmed === (state === "confirmed"));
  ok(`${state} claims money was charged`, copy.charged === (state === "confirmed"));
}

// The word "confirmed" must not appear in a state that is not confirmed —
// "we are confirming your date" is fine, "your booking is confirmed" is not.
for (const state of ALL) {
  if (state === "confirmed") continue;
  const { message } = stateCopy(state);
  ok(
    `the ${state} message contains "is confirmed", which reads as a confirmation`,
    !/\bis confirmed\b|\bbooking is confirmed\b/i.test(message)
  );
}

// Every pre-capture state must say, in words, that nothing has been charged.
for (const state of ["held", "checking", "declined"] as BookingState[]) {
  ok(
    `the ${state} message never says the customer has not been charged`,
    /nothing has been charged|not been charged|has been released/i.test(stateCopy(state).message)
  );
}

// ---------------------------------------------------------------------------
// 2. Transitions.
// ---------------------------------------------------------------------------
ok("a human can confirm a held booking", canTransition("held", "confirmed"));
ok("a human can decline a held booking", canTransition("held", "declined"));
ok("a confirmed booking cannot be silently re-confirmed", !canTransition("confirmed", "confirmed"));
ok("a declined booking cannot be confirmed afterwards", !canTransition("declined", "confirmed"));
ok("an unpaid booking cannot be confirmed", !canTransition("awaitingDeposit", "confirmed"));

// Anything still holding money must be resolvable, or an authorization expires
// with nobody noticing and the customer is left with a stale hold.
for (const state of ALL) {
  if (!holdsFunds(state)) continue;
  ok(
    `${state} holds funds but cannot be declined, so a hold could never be released`,
    canTransition(state, "declined")
  );
}

// ---------------------------------------------------------------------------
// 3. No deposit figure, no button.
// ---------------------------------------------------------------------------
const base: BookableProduct = { slug: "x", title: "X", price: { amount: 199 } };

ok("a product not marked bookable shows no button", resolveDeposit({ ...base }).bookable === false);
ok(
  "a bookable product with no figure anywhere shows no button",
  resolveDeposit({ ...base, bookable: true }).bookable === false
);
ok(
  "a zero deposit is treated as unset, not as free",
  resolveDeposit({ ...base, bookable: true, depositUsd: 0 }).bookable === false
);
ok(
  "a negative deposit is refused",
  resolveDeposit({ ...base, bookable: true, depositUsd: -50 }).bookable === false
);
ok(
  "a NaN deposit is refused",
  resolveDeposit({ ...base, bookable: true, depositUsd: Number.NaN }).bookable === false
);

const own = resolveDeposit({ ...base, bookable: true, depositUsd: 50 }, 25);
ok("the product's own figure wins over the site default", own.bookable && own.amountUsd === 50);
const fallback = resolveDeposit({ ...base, bookable: true }, 25);
ok("the site default applies when the product has none", fallback.bookable && fallback.amountUsd === 25);
const rounded = resolveDeposit({ ...base, bookable: true, depositUsd: 49.4 });
ok("a deposit is whole dollars", rounded.bookable && rounded.amountUsd === 49);

// ---------------------------------------------------------------------------
// 4. How it reads, in both price cases.
// ---------------------------------------------------------------------------
const withTotal = presentDeposit(50, { amount: 199 });
ok("a priced product shows total, deposit and balance", withTotal.kind === "withTotal");
if (withTotal.kind === "withTotal") {
  ok("the balance is the total less the deposit", withTotal.balance === "$149");
  ok("the total is shown", withTotal.total === "$199");
}

const noPrice = presentDeposit(50);
ok("an unpriced product shows the deposit alone", noPrice.kind === "depositOnly");
ok("an unpriced product still shows an exact deposit", noPrice.kind === "depositOnly" && noPrice.deposit === "$50");

// A total at or below the deposit is an editing mistake — it must never render
// a zero or negative balance to a customer.
ok("a total equal to the deposit falls back to deposit-only", presentDeposit(50, { amount: 50 }).kind === "depositOnly");
ok("a total below the deposit falls back to deposit-only", presentDeposit(50, { amount: 20 }).kind === "depositOnly");
// `amount: null` is how the 18 unpriced Extra Experiences are actually
// stored — "contact for pricing" — so this is the real case, not an edge one.
ok(
  "a null amount (contact for pricing) falls back to deposit-only",
  presentDeposit(50, { amount: null }).kind === "depositOnly"
);
ok(
  "a null amount with a note still falls back to deposit-only",
  presentDeposit(50, { amount: null, note: "On request" }).kind === "depositOnly"
);

// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\ncheck-booking: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}
console.log(
  "check-booking: ok — no payment event can confirm a booking, every pre-capture state says nothing is charged, " +
    "and a product with no deposit figure shows no button."
);
