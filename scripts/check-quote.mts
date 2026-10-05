/**
 * Guards the deposit arithmetic.
 *
 * This is the module that decides what a customer is charged, so the rules it
 * has to keep are not style preferences:
 *
 *   1. The browser cannot influence the figure. It sends a headcount and a
 *      list of labels; prices come from the product. A selection carrying its
 *      own price buys nothing.
 *   2. Money never passes through a float. Every figure is integer cents, and
 *      the comparison against what PayPal reports is in cents too — a payment
 *      a cent short has to fail, and 0.1 + 0.2 is not 0.3.
 *   3. A quote is a snapshot. It records the rates that produced it, so a
 *      booking taken today still reads the same after somebody edits the
 *      Studio tomorrow.
 *   4. Broken configuration produces no deposit, never a guess.
 */
import {
  describeQuote,
  formatCents,
  quoteDeposit,
  rulesFor,
  usdToCents,
  type QuotableProduct,
} from "../src/lib/booking/quote";

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

const PRODUCT: QuotableProduct = {
  slug: "exclusive-pyramids-photoshoot",
  title: "Exclusive Pyramids Photoshoot",
  bookable: true,
  depositUsd: 25,
  depositBasis: "perPerson",
  extras: [
    { label: "Camel Ride", priceUsd: 25, depositUsd: 10, depositBasis: "person" },
    { label: "Video Reels", priceUsd: 25, depositUsd: 10, depositBasis: "booking" },
    { label: "Egyptian Scarf", priceUsd: 20 },
  ],
};

const quote = (people: unknown, extraLabels: unknown = [], product = PRODUCT) =>
  quoteDeposit(product, "photoshoot", { people, extraLabels });

// ---------------------------------------------------------------------------
// 1. Cents.
// ---------------------------------------------------------------------------
const CENTS: [unknown, number | null][] = [
  [25, 2500],
  [0, 0],
  [25.5, 2550],
  [0.01, 1],
  [1234.56, 123456],
  [25.005, null],   // sub-cent precision is not a price
  [-25, null],
  [Number.NaN, null],
  [Number.POSITIVE_INFINITY, null],
  ["25", null],
  [null, null],
  [undefined, null],
];
for (const [input, expected] of CENTS) {
  ok(`usdToCents(${JSON.stringify(input)}) should be ${expected}`, usdToCents(input) === expected);
}
// The float case, stated explicitly because it is the one that reaches
// production: 0.1 + 0.2 must still be 30 cents.
ok("a float sum lands on exact cents", usdToCents(0.1 + 0.2) === 30);
ok("formatCents drops empty cents", formatCents(2500) === "$25");
ok("formatCents keeps real cents", formatCents(2550) === "$25.50");
ok("formatCents pads a single cent", formatCents(2505) === "$25.05");

// ---------------------------------------------------------------------------
// 2. The arithmetic the brief asks for.
//
//    service deposit x guests + selected extra deposits
// ---------------------------------------------------------------------------
const solo = quote(1);
ok("one person, no extras, is one service line", solo.ok && solo.quote.lines.length === 1);
ok("one person at $25/head is $25", solo.ok && solo.quote.totalCents === 2500);

const three = quote(3);
ok("three people at $25/head is $75", three.ok && three.quote.totalCents === 7500);
ok("the service line records the rate and the count", three.ok && three.quote.lines[0].unitCents === 2500 && three.quote.lines[0].quantity === 3);

// A per-booking extra is added once however many people there are.
const withReel = quote(3, ["Video Reels"]);
ok("a per-booking extra is charged once", withReel.ok && withReel.quote.totalCents === 7500 + 1000);

// A per-person extra scales with the headcount.
const withCamels = quote(3, ["Camel Ride"]);
ok("a per-person extra scales", withCamels.ok && withCamels.quote.totalCents === 7500 + 3000);

const both = quote(3, ["Camel Ride", "Video Reels"]);
ok("both kinds of extra add up", both.ok && both.quote.totalCents === 7500 + 3000 + 1000);

// An extra with no deposit configured is free to add — exactly how extras
// behaved before deposits could vary, so an unedited product is unchanged.
const freeExtra = quote(3, ["Egyptian Scarf"]);
ok("an extra with no deposit adds nothing", freeExtra.ok && freeExtra.quote.totalCents === 7500);
ok("and does not appear as a line", freeExtra.ok && freeExtra.quote.lines.length === 1);

// ---------------------------------------------------------------------------
// 3. The browser cannot set a price.
// ---------------------------------------------------------------------------
const forged = quote(1, [{ label: "Camel Ride", depositUsd: 0 } as unknown as string]);
ok("a selection carrying its own price is not a selection", forged.ok && forged.quote.totalCents === 2500);
ok("an unknown extra is ignored", quote(1, ["Private Jet"]).ok && (quote(1, ["Private Jet"]) as { quote: { totalCents: number } }).quote.totalCents === 2500);
const twice = quote(2, ["Camel Ride", "camel ride", "CAMEL RIDE"]);
ok("the same extra selected repeatedly is charged once", twice.ok && twice.quote.totalCents === 5000 + 2000);
ok("a non-array selection is no selection", quote(1, "Camel Ride").ok && (quote(1, "Camel Ride") as { quote: { totalCents: number } }).quote.totalCents === 2500);

// ---------------------------------------------------------------------------
// 4. Headcount.
// ---------------------------------------------------------------------------
for (const people of [0, -1, 21, 1.5, Number.NaN, "3", null, undefined]) {
  const result = quote(people);
  ok(`a headcount of ${JSON.stringify(people)} must be refused`, !result.ok && result.reason === "badPeople");
}
ok("twenty people is still allowed", quote(20).ok);

// ---------------------------------------------------------------------------
// 5. The cap, which applies to the service and not to chosen extras.
// ---------------------------------------------------------------------------
const CAPPED: QuotableProduct = { ...PRODUCT, depositMaxUsd: 100 };
const capped = quoteDeposit(CAPPED, "photoshoot", { people: 10, extraLabels: [] });
ok("the service portion is capped", capped.ok && capped.quote.totalCents === 10000);
ok("the cap records what it reduced", capped.ok && capped.quote.lines[0].cappedFromCents === 25000);
const cappedPlusExtra = quoteDeposit(CAPPED, "photoshoot", { people: 10, extraLabels: ["Video Reels"] });
ok(
  "an extra is added on top of the cap, not absorbed by it",
  cappedPlusExtra.ok && cappedPlusExtra.quote.totalCents === 10000 + 1000
);
const belowCap = quoteDeposit(CAPPED, "photoshoot", { people: 2, extraLabels: [] });
ok("below the cap nothing is capped", belowCap.ok && belowCap.quote.totalCents === 5000 && belowCap.quote.lines[0].cappedFromCents === undefined);

// ---------------------------------------------------------------------------
// 6. Broken configuration produces no deposit.
// ---------------------------------------------------------------------------
const BAD: [string, QuotableProduct][] = [
  ["not switched on", { ...PRODUCT, bookable: false }],
  ["no amount at all", { slug: "x", title: "X", bookable: true }],
  ["a negative rate", { ...PRODUCT, depositUsd: -25 }],
  ["a sub-cent rate", { ...PRODUCT, depositUsd: 25.005 }],
  ["a NaN rate", { ...PRODUCT, depositUsd: Number.NaN }],
  ["a zero rate with no priced extras", { ...PRODUCT, depositUsd: 0, extras: [] }],
  ["an unreadable cap", { ...PRODUCT, depositMaxUsd: -5 }],
];
for (const [label, product] of BAD) {
  ok(`${label} must produce no deposit`, !quoteDeposit(product, "photoshoot", { people: 2, extraLabels: [] }).ok);
}

// ---------------------------------------------------------------------------
// 7. Backward compatibility.
//
// Every product configured before any of this existed carries only a flat
// `depositUsd`. It must keep behaving exactly as it does in production today,
// because this ships before anybody edits the Studio.
// ---------------------------------------------------------------------------
const LEGACY: QuotableProduct = {
  slug: "legacy",
  title: "Legacy",
  bookable: true,
  depositUsd: 25,
  extras: [{ label: "Camel Ride", priceUsd: 25 }],
};
ok("a legacy product defaults to a fixed basis", rulesFor(LEGACY).basis === "fixed");
for (const people of [1, 3, 20]) {
  const legacy = quoteDeposit(LEGACY, "photoshoot", { people, extraLabels: ["Camel Ride"] });
  ok(
    `a legacy product charges a flat $25 for ${people} people, as it does today`,
    legacy.ok && legacy.quote.totalCents === 2500
  );
}

// ---------------------------------------------------------------------------
// 8. The snapshot.
//
// A quote has to be able to explain itself later, after the rates it used have
// been edited. That is the whole reason the rules are stored rather than the
// total alone.
// ---------------------------------------------------------------------------
const snapshot = quote(3, ["Camel Ride", "Video Reels"]);
if (snapshot.ok) {
  const { quote: q } = snapshot;
  ok("the snapshot records the basis", q.rules.basis === "perPerson");
  ok("the snapshot records the service rate", q.rules.serviceCents === 2500);
  ok("the snapshot records each extra's rate", q.rules.extras.length === 2);
  ok(
    "the snapshot records how each extra was charged",
    q.rules.extras.find((e) => e.label === "Camel Ride")?.basis === "person" &&
      q.rules.extras.find((e) => e.label === "Video Reels")?.basis === "booking"
  );
  ok("the lines add up to the total", q.lines.reduce((sum, l) => sum + l.amountCents, 0) === q.totalCents);
  ok("every line's arithmetic holds", q.lines.every((l) => l.amountCents === l.unitCents * l.quantity || l.cappedFromCents !== undefined));
  ok("the currency is stated", q.currency === "USD");
  ok("the headcount is stated", q.people === 3);
  ok("it says which product", q.productSlug === "exclusive-pyramids-photoshoot");

  // The point of the snapshot: the same booking, after the rate changes.
  const laterProduct: QuotableProduct = { ...PRODUCT, depositUsd: 30 };
  const later = quoteDeposit(laterProduct, "photoshoot", { people: 3, extraLabels: ["Camel Ride", "Video Reels"] });
  ok("a changed rate changes new quotes", later.ok && later.quote.totalCents !== q.totalCents);
  ok("but the old snapshot still reads what was agreed", q.totalCents === 7500 + 3000 + 1000);

  ok("a quote describes itself for a customer", describeQuote(q).length === q.lines.length);
  ok(
    "a scaling line shows its rate and count",
    describeQuote(q)[0].label.includes("$25") && describeQuote(q)[0].label.includes("3")
  );
}

// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\ncheck-quote: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}
console.log(
  "check-quote: ok — deposits are computed in whole cents from product configuration only, a selection " +
    "cannot carry its own price, broken rules produce no deposit, legacy flat amounts are unchanged, and " +
    "a quote records the rates that produced it."
);
