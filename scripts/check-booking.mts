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
import { disabledProvider, depositsEnabled } from "../src/lib/booking/paymentProvider";
import { NOT_INSTANT, claimsConfirmation, moneyState, replyPromise } from "../src/lib/booking/wording";
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
// 5. The payment adapter.
//
// The default provider must fail honestly. A stub that pretended to succeed
// would put "deposit held" in front of someone who has paid nothing, which is
// the exact lie the design exists to prevent.
// ---------------------------------------------------------------------------
ok("the default provider is not enabled", disabledProvider.enabled === false);

const hold = await disabledProvider.createHold({
  reference: "EE-TEST",
  amountUsd: 50,
  description: "test",
  returnUrl: "https://example.com/r",
  cancelUrl: "https://example.com/c",
});
ok("the disabled provider refuses to create a hold", hold.ok === false);
ok("a capture with no provider fails", (await disabledProvider.capture("auth")).ok === false);
ok("a release with no provider fails", (await disabledProvider.release("auth")).ok === false);

// The important one: with no configured secret there is no way to tell a real
// event from a forged one, so an unverified webhook must be refused. Accepting
// it would let anyone mark any booking as paid.
ok(
  "an unconfigured provider refuses every webhook",
  (await disabledProvider.verifyWebhook(new Headers(), "{}")) === false
);
ok("depositsEnabled() is false until a provider is configured", depositsEnabled() === false);

// ---------------------------------------------------------------------------
// 6. The customer-facing sentences.
//
// Shared by the secure page, the acknowledgement email and the account page,
// so they are asserted once, here, against the real strings. The email module
// itself cannot be imported from a script — it is `server-only` — which is
// exactly why the sentences live in their own module rather than inline.
// ---------------------------------------------------------------------------
ok("the not-instant notice says so plainly", /not an instant booking/i.test(NOT_INSTANT));
ok("the not-instant notice names the reply window", /48 hours/.test(NOT_INSTANT));
ok("the not-instant notice does not claim a confirmation", !claimsConfirmation(NOT_INSTANT));

const withDeposit = moneyState("$50");
ok("a held deposit is described as held, not charged", /held, not charged/i.test(withDeposit));
ok("a held deposit says what happens if we cannot confirm", /released|not charged at all/i.test(withDeposit));
ok("a held deposit sentence does not claim a confirmation", !claimsConfirmation(withDeposit));

const withoutDeposit = moneyState(null);
ok("with no deposit the customer is told nothing was charged", /nothing has been charged/i.test(withoutDeposit));
ok("with no deposit no hold is mentioned", !/hold/i.test(withoutDeposit));

ok("the reply promise names the window", /48 hours/.test(replyPromise()));
ok("the reply promise offers alternatives", /nearest dates/i.test(replyPromise()));

// The detector itself has to work, or every assertion above is vacuous. The
// line it draws is between an assertion ("your booking is confirmed") and a
// condition ("once your date is confirmed") — the second is a sentence the
// customer needs, and a blunt search for the word would ban it.
const DETECTOR_CASES: [string, boolean][] = [
  ["Your booking is confirmed.", true],
  ["Your date is confirmed.", true],
  ["Your dates are confirmed.", true],
  ["This booking has been confirmed.", true],
  ["We only take it once your date is confirmed.", false],
  ["Nothing is charged until your date is confirmed.", false],
  ["We will email you when your booking is confirmed.", false],
  ["If your date is confirmed we will charge the deposit.", false],
  ["We are confirming your date.", false],
  ["Our team confirms it personally.", false],
];
for (const [text, expected] of DETECTOR_CASES) {
  ok(
    `claimsConfirmation(${JSON.stringify(text)}) should be ${expected}`,
    claimsConfirmation(text) === expected
  );
}

// ---------------------------------------------------------------------------
// 7. The admin decision.
//
// Confirm and decline are the two moments a person decides, and the
// transitions are what stop a second click, a stale tab or a replayed form
// from charging someone twice or reviving a declined booking.
// ---------------------------------------------------------------------------
ok("a held booking can be marked as being checked", canTransition("held", "checking"));
ok("an unpaid booking cannot be marked as being checked", !canTransition("awaitingDeposit", "checking"));
ok("a booking being checked can still be confirmed", canTransition("checking", "confirmed"));
ok("a booking being checked can still be declined", canTransition("checking", "declined"));

// The double-click cases: every terminal state must refuse every decision.
for (const terminal of ["confirmed", "declined", "cancelled"] as BookingState[]) {
  for (const decision of ["confirmed", "declined", "checking"] as BookingState[]) {
    ok(
      `a ${terminal} booking must refuse a second "${decision}"`,
      !canTransition(terminal, decision)
    );
  }
}

// Cancelling is the customer's withdrawal and stays available after
// confirmation — a confirmed booking can still be called off.
ok("a confirmed booking can be cancelled", canTransition("confirmed", "cancelled"));

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
