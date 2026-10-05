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
import { payPalLink, presentDeposit, resolveDeposit, type BookableProduct } from "../src/lib/booking/deposit";
import { photoshoots } from "../src/content/photoshoots";
import { experiences } from "../src/content/experiences";
import { disabledProvider, depositsEnabled } from "../src/lib/booking/paymentProvider";
import { HUMAN_CONFIRMS, claimsConfirmation, moneyState, replyPromise } from "../src/lib/booking/wording";
import { extrasTotal, normaliseExtras, selectExtras, formatUsd } from "../src/lib/booking/extras";
import { composePhone } from "../src/lib/booking/phone";
import { DIAL_CODES, dialCodeFor, flagFor } from "../src/lib/booking/countryCodes";
import {
  bookingStateFromRow,
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
// 3b. The PayPal link.
//
// This value comes from the CMS and becomes a link a paying customer clicks,
// so the host is checked in code and not merely in Studio validation — a
// document migrated in or edited before that rule existed would sail past it.
// The lookalike hosts are the cases that matter: each one would send someone
// to a convincing page to pay somebody else.
// ---------------------------------------------------------------------------
const LINKS: [string, boolean][] = [
  ["https://www.paypal.com/ncp/payment/ABC123", true],
  ["https://paypal.me/egypteye/25", true],
  ["https://www.paypal.me/egypteye", true],
  ["http://www.paypal.com/ncp/payment/ABC", false],   // not https
  ["https://notpaypal.com/pay", false],               // lookalike prefix
  ["https://paypal.com.evil.net/pay", false],         // lookalike suffix
  ["https://evil.net/?x=paypal.com", false],          // in the query string
  ["", false],
  ["not a url", false],
];
for (const [value, allowed] of LINKS) {
  ok(
    `payPalLink should ${allowed ? "allow" : "block"} ${JSON.stringify(value)}`,
    (payPalLink(value) !== null) === allowed
  );
}
ok("a non-PayPal link leaves the product with no pay button",
  resolveDeposit({ ...base, bookable: true, depositUsd: 25, paypalLink: "https://evil.net/pay" }).bookable &&
  (resolveDeposit({ ...base, bookable: true, depositUsd: 25, paypalLink: "https://evil.net/pay" }) as { paymentLink: string | null }).paymentLink === null);

// ---------------------------------------------------------------------------
// 4. The deposit flow never publishes a price.
//
// Egypt Eye does not show prices on the public site — PriceTag renders
// "Enquire for Pricing" everywhere, deliberately, while every product still
// carries a real `price` for admin and reservations. The booking page once
// showed "Total $75 · Deposit $25 · Remaining $50", which published exactly
// the figures the rest of the site withholds, at the moment a customer is
// deciding.
//
// The deposit is a figure Egypt Eye is genuinely asking for, so it is shown.
// Nothing else is.
// ---------------------------------------------------------------------------
const shown = presentDeposit(50);
ok("presentDeposit leaks a total — the public site does not publish prices", shown.kind === "depositOnly");
ok("the deposit itself is still shown", shown.deposit === "$50");
// The signature itself is the guard: it cannot be handed a price to leak.
ok(
  "presentDeposit takes a price again — that is how the total got published before",
  presentDeposit.length === 1
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
// The sentence that carries the whole honesty requirement. What it must do is
// name the human step; what it must not do is claim the date is confirmed.
//
// It used to be asserted to contain the words "not an instant booking" and to
// name a 48-hour reply window. Both assertions are gone, for different
// reasons. The window was a promise nobody at Egypt Eye had made, which the
// site was making on their behalf on every booking — a deadline is only worth
// printing if somebody is accountable for it. And "not an instant booking"
// became false as a description of the flow: a customer really can finish in
// one step now, with no account and no email. What is not instant is narrower,
// so that is what is asserted.
ok("the notice says a person confirms the date", /member of our team|a person does/i.test(HUMAN_CONFIRMS));
ok("the notice does not claim a confirmation", !claimsConfirmation(HUMAN_CONFIRMS));
ok(
  "the notice promises a reply window again — nobody at Egypt Eye committed to one",
  !/\b\d+\s*(hours?|days?)\b/i.test(HUMAN_CONFIRMS)
);

const withDeposit = moneyState("$50");
ok("a held deposit is described as held, not charged", /held, not charged/i.test(withDeposit));
ok("a held deposit says what happens if we cannot confirm", /released|not charged at all/i.test(withDeposit));
ok("a held deposit sentence does not claim a confirmation", !claimsConfirmation(withDeposit));

const withoutDeposit = moneyState(null);
ok("with no deposit the customer is told nothing was charged", /nothing has been charged/i.test(withoutDeposit));
ok("with no deposit no hold is mentioned", !/hold/i.test(withoutDeposit));

ok(
  "the reply promise names a deadline again — that promise was removed deliberately",
  !/\b\d+\s*(hours?|days?)\b/i.test(replyPromise())
);
ok("the reply promise offers alternatives", /nearest dates/i.test(replyPromise()));

// The whole customer-facing surface, swept for the window in any wording. The
// number came back twice during this change in copy that had been edited by
// hand, which is why it is asserted against the strings rather than trusted.
for (const [label, text] of [
  ["the human-step notice", HUMAN_CONFIRMS],
  ["the reply promise", replyPromise()],
  ["the link-mode money sentence", moneyState("$25", "link")],
  ["the hold-mode money sentence", moneyState("$25", "hold")],
  ["the no-deposit money sentence", moneyState(null)],
  ...ALL.map((state) => [`the ${state} message`, stateCopy(state).message] as [string, string]),
  ...ALL.map((state) => [`the ${state} link-mode message`, stateCopy(state, "link").message] as [string, string]),
] as [string, string][]) {
  ok(`${label} promises a reply within a fixed time`, !/within \d+\s*(hours?|days?)/i.test(text));
}

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
// 8. Reading a database row.
//
// The admin panel, the account page and the return page all read the same two
// columns and must agree about what they mean. A disagreement here shows a
// customer one thing while the desk sees another, which is worse than either
// being wrong on its own.
// ---------------------------------------------------------------------------
const ROWS: [{ status: string; deposit_status?: string | null }, BookingState][] = [
  [{ status: "requested", deposit_status: "awaiting" }, "awaitingDeposit"],
  [{ status: "requested", deposit_status: "authorized" }, "held"],
  // A paid payment-link deposit means the same thing to the customer as a
  // hold: the money side is done, the date is not.
  [{ status: "requested", deposit_status: "captured" }, "held"],
  [{ status: "checking", deposit_status: "authorized" }, "checking"],
  [{ status: "confirmed", deposit_status: "captured" }, "confirmed"],
  [{ status: "declined", deposit_status: "voided" }, "declined"],
  [{ status: "cancelled", deposit_status: "voided" }, "cancelled"],
  // A booking with no payment at all — the flow with deposits switched off.
  [{ status: "requested", deposit_status: "not_required" }, "awaitingDeposit"],
  [{ status: "confirmed", deposit_status: "not_required" }, "confirmed"],
  [{ status: "requested", deposit_status: null }, "awaitingDeposit"],
  [{ status: "requested" }, "awaitingDeposit"],
];
for (const [row, expected] of ROWS) {
  ok(
    `a row ${JSON.stringify(row)} should read as "${expected}"`,
    bookingStateFromRow(row) === expected
  );
}

// The decisive one: a captured payment on a booking nobody confirmed is still
// not a confirmation. If this ever flips, the return page and the account page
// both start congratulating customers on bookings that were never checked.
ok(
  "a captured deposit on an unconfirmed booking does not read as confirmed",
  bookingStateFromRow({ status: "requested", deposit_status: "captured" }) !== "confirmed"
);
ok(
  "a declined booking whose hold could not be released still reads as declined",
  bookingStateFromRow({ status: "declined", deposit_status: "failed" }) === "declined"
);

// ---------------------------------------------------------------------------
// 9. A product sold in two places must not be bookable in both.
//
// Pyramids Proposal Romance Setup is listed as a photoshoot and as an
// experience, deliberately, so either browsing path finds it — with the
// photoshoot named as the canonical page. That is fine for reading, but it is
// not fine for booking: two deposit buttons for one thing means two product
// records, two references, and a desk trying to work out whether a customer
// booked the same hour twice.
//
// The rule that falls out of it: the copy that points somewhere else as its
// canonical is not the place to take money.
// ---------------------------------------------------------------------------
const photoSlugs = new Map(photoshoots.map((p) => [p.slug, p]));
for (const experience of experiences) {
  const twin = photoSlugs.get(experience.slug);
  if (!twin) continue;

  ok(
    `"${experience.slug}" is listed as both a photoshoot and an experience, so one of them must name the ` +
      `other as canonical — otherwise two identical pages compete and Google picks the winner`,
    Boolean(experience.seo?.canonicalUrl) || Boolean(twin.seo?.canonicalUrl)
  );

  const duplicate = experience.seo?.canonicalUrl ? experience : twin;
  ok(
    `"${experience.slug}" takes deposits on the copy that points elsewhere as canonical — ` +
      `book it on the canonical page only, or one experience can be booked twice`,
    duplicate.bookable !== true
  );
}

// ---------------------------------------------------------------------------
// 10. A configured payment link must make the deposit live.
//
// This is a bug that already happened. The surfaces asked `depositsEnabled()`,
// which reports only whether the PayPal API provider is configured — so a
// product with a perfectly good payment link rendered "online deposits are not
// switched on yet", and the button said "Send my request". The deposit was
// configured, paid for, and invisible.
//
// The root cause was a boolean standing in for three states. These assertions
// are on the rule that replaced it.
// ---------------------------------------------------------------------------
const LINK = "https://www.paypal.com/ncp/payment/ABC123";
const modeFor = (d: ReturnType<typeof resolveDeposit>, providerEnabled: boolean) =>
  !d.bookable ? "none" : d.paymentLink ? "link" : providerEnabled ? "hold" : "none";

const linked = resolveDeposit({ ...base, bookable: true, depositUsd: 25, paypalLink: LINK });
ok("a product with a payment link resolves one", linked.bookable && linked.paymentLink === LINK);
ok(
  "a payment link makes the deposit live even with no API provider",
  modeFor(linked, false) === "link"
);
ok(
  "a link is preferred over the API when both are available",
  modeFor(linked, true) === "link"
);

const noLink = resolveDeposit({ ...base, bookable: true, depositUsd: 25 });
ok("with no link and no provider there is no deposit", modeFor(noLink, false) === "none");
ok("with no link but a live provider the deposit is a hold", modeFor(noLink, true) === "hold");

const badLink = resolveDeposit({ ...base, bookable: true, depositUsd: 25, paypalLink: "https://evil.net/pay" });
ok(
  "a rejected link does not leave the deposit looking live",
  modeFor(badLink, false) === "none"
);

// ---------------------------------------------------------------------------
// 11. Extras are priced by the product, never by the request.
//
// This is the same rule the deposit amount already follows and it exists for
// the same reason: a figure that arrives in a POST body is a price the
// customer set themselves. The browser sends labels; the server looks them up.
// If selectExtras ever starts trusting a price off the wire, a $60 horse ride
// becomes a $0 one and nothing anywhere else would notice.
// ---------------------------------------------------------------------------
const CATALOGUE = normaliseExtras([
  { label: "Camel Ride", priceUsd: 25 },
  { label: "Running Horse Ride", priceUsd: 60 },
  { label: "Jumping Horse", priceUsd: 25 },
  { label: "Egyptian Scarf", priceUsd: 20 },
  { label: "Video Reels", priceUsd: 25 },
]);
ok("the catalogue survives normalising", CATALOGUE.length === 5);

// The attack, stated plainly: the customer sends a price and it buys nothing,
// because selectExtras reads labels and nothing else. A priced object is not a
// label, so it is not a selection at all.
const forgedAlone = selectExtras(CATALOGUE, [
  { label: "Running Horse Ride", priceUsd: 0 } as unknown as string,
]);
ok("a price sent from the browser is not a selection", forgedAlone.length === 0);
ok("a forged selection costs nothing", extrasTotal(forgedAlone) === 0);

// And when the same extra is named honestly alongside it, the product's price
// is the one that applies.
const forgedMixed = selectExtras(CATALOGUE, [
  { label: "Running Horse Ride", priceUsd: 0 } as unknown as string,
  "Running Horse Ride",
]);
ok(
  "the product's price wins over one sent with the request",
  forgedMixed.length === 1 && forgedMixed[0].priceUsd === 60 && extrasTotal(forgedMixed) === 60
);
ok(
  "a forged label that is not on the product buys nothing",
  selectExtras(CATALOGUE, [{ label: "Private Jet", priceUsd: 1 } as unknown as string]).length === 0
);

ok("an extra that is not on the product is ignored", selectExtras(CATALOGUE, ["Private Jet"]).length === 0);
ok(
  "selecting the same extra twice bills it once",
  extrasTotal(selectExtras(CATALOGUE, ["Camel Ride", "Camel Ride"])) === 25
);
ok(
  "matching is not case-sensitive, so a label typed differently still resolves",
  extrasTotal(selectExtras(CATALOGUE, ["camel ride"])) === 25
);
ok("nothing chosen costs nothing", extrasTotal(selectExtras(CATALOGUE, [])) === 0);
ok("a non-array selection costs nothing", extrasTotal(selectExtras(CATALOGUE, "Camel Ride")) === 0);
ok(
  "every extra selected adds up",
  extrasTotal(selectExtras(CATALOGUE, CATALOGUE.map((e) => e.label))) === 155
);

// An extra with no usable price must not be offered. Showing it as free is the
// failure mode: somebody selects it and then argues about the bill.
const JUNK: [unknown, number][] = [
  [{ label: "Free thing", priceUsd: 0 }, 0],
  [{ label: "Negative", priceUsd: -10 }, 0],
  [{ label: "Unpriced" }, 0],
  [{ label: "", priceUsd: 25 }, 0],
  [{ label: "   ", priceUsd: 25 }, 0],
  [{ label: "NaN", priceUsd: Number.NaN }, 0],
  [{ label: "Text price", priceUsd: "25" }, 0],
  [{ label: "Good", priceUsd: 25 }, 1],
];
for (const [entry, kept] of JUNK) {
  ok(
    `normaliseExtras should ${kept ? "keep" : "drop"} ${JSON.stringify(entry)}`,
    normaliseExtras([entry]).length === kept
  );
}
ok("a duplicate label is kept once", normaliseExtras([
  { label: "Camel Ride", priceUsd: 25 },
  { label: "camel ride", priceUsd: 99 },
]).length === 1);
ok("extras from a null field are an empty list, not a crash", normaliseExtras(null).length === 0);

// The rule that keeps the wording honest: the deposit is a fixed amount per
// tier, so extras cannot be charged through the payment link. Nothing may add
// them together into one figure a customer could mistake for what they paid.
const deposit25 = presentDeposit(25);
ok(
  "the deposit presentation absorbed the extras total — the deposit link cannot charge it",
  deposit25.kind === "depositOnly" && deposit25.deposit === "$25"
);
ok("formatUsd prints whole dollars without decimals", formatUsd(25) === "$25");
ok("formatUsd keeps cents when there are any", formatUsd(25.5) === "$25.50");

// ---------------------------------------------------------------------------
// 12. The phone number.
//
// It carries more weight than it used to. An email address is optional now, so
// for a guest booking this is the only way back to the customer — and a
// booking nobody can reach is a row holding somebody's money that no one can
// act on. The country code is mandatory for the same reason: a bare 010… is
// undialable from outside Egypt, and a bare 1012… could be two countries.
// ---------------------------------------------------------------------------
ok("Egypt is the first country offered", DIAL_CODES[0].iso === "EG" && DIAL_CODES[0].dial === "+20");
ok("every dial code is a + and digits", DIAL_CODES.every((c) => /^\+\d{1,4}$/.test(c.dial)));
ok("every country has a two-letter code", DIAL_CODES.every((c) => /^[A-Z]{2}$/.test(c.iso)));
ok(
  "no country appears twice",
  new Set(DIAL_CODES.map((c) => c.iso)).size === DIAL_CODES.length
);
ok("the flag is derived from the code", flagFor("EG") === "🇪🇬" && flagFor("GB") === "🇬🇧");
ok("a bad code produces no flag rather than mojibake", flagFor("XYZ") === "");
ok("an unknown country resolves to nothing", dialCodeFor("ZZ") === null);

// An Egyptian mobile as Egyptians write it. The leading zero is national
// notation and makes the number undialable once a country code is in front of
// it, so it is dropped rather than rejected — this is the single most common
// way a real number arrives broken.
const egyptian = composePhone("EG", "010 1234 5678");
ok("an Egyptian mobile composes", egyptian.ok && egyptian.e164 === "+201012345678");
ok("the display keeps the code readable", egyptian.ok && egyptian.display === "+20 1012345678");

const spaced = composePhone("US", "(555) 010-9999");
ok("brackets, spaces and dashes are accepted", spaced.ok && spaced.e164 === "+15550109999");

const PHONES: [unknown, unknown, boolean][] = [
  ["EG", "01012345678", true],
  ["GB", "7700 900123", true],
  ["EG", "", false],          // nothing typed
  ["EG", "0", false],         // only a leading zero
  ["EG", "12345", false],     // too short to be anybody's number
  ["EG", "1234567890123456", false], // past the E.164 ceiling
  [null, "01012345678", false],      // no country code chosen
  ["", "01012345678", false],
  ["ZZ", "01012345678", false],      // a country we do not offer
  ["EG", null, false],
];
for (const [iso, national, allowed] of PHONES) {
  const result = composePhone(iso, national);
  ok(
    `composePhone(${JSON.stringify(iso)}, ${JSON.stringify(national)}) should ${allowed ? "pass" : "fail"}`,
    result.ok === allowed
  );
  if (!allowed && !result.ok) {
    ok(
      `the rejection for ${JSON.stringify(national)} tells the customer what to do`,
      result.message.trim().length > 10
    );
  }
}

// ---------------------------------------------------------------------------
// 13. The product the pilot actually runs on.
//
// Exclusive Pyramids Photoshoot is the one product live on this flow, and its
// time slots and extras are defined in the content file so the popup is
// complete before anybody edits the Studio. If the content ever stops carrying
// them, the popup silently loses its dropdown and its extras list and nothing
// else fails — which is the kind of regression that ships.
// ---------------------------------------------------------------------------
const pilot = photoshoots.find((p) => p.slug === "exclusive-pyramids-photoshoot");
ok("the pilot photoshoot still exists", Boolean(pilot));
if (pilot) {
  ok("it offers start times", (pilot.timeSlots ?? []).length > 0);
  ok(
    "its extras all carry a usable price",
    normaliseExtras(pilot.extras).length === (pilot.extras ?? []).length &&
      (pilot.extras ?? []).length > 0
  );
}

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
