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
  depositHeadline,
  depositOffer,
  explainOffer,
  isAbsent,
  describeQuote,
  formatCents,
  quoteDeposit,
  rulesFor,
  usdToCents,
  type QuotableProduct,
} from "../src/lib/booking/quote";
import { resolveDeposit } from "../src/lib/booking/deposit";
import { readFile } from "node:fs/promises";

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
// 9. The site-wide default, and the page agreeing with the checkout.
//
// This is a bug that shipped, and it is worth stating exactly because the
// shape of it recurs. A product with no deposit of its own falls back to the
// site-wide default. resolveDeposit — which the product page uses for the
// button — honoured that fallback. quoteDeposit — which the booking route uses
// to actually charge — did not. So the page showed "$20 deposit", the route
// found no rule, answered "we have your request", and the PayPal window never
// opened. Nothing errored. The customer simply could not pay.
//
// Two surfaces answering the same question from two functions is the defect.
// These assertions pin the agreement rather than the symptom.
// ---------------------------------------------------------------------------
const NO_OWN_RATE: QuotableProduct = { slug: "inherits", title: "Inherits", bookable: true };
const SITE_DEFAULT = 20;

const inherited = quoteDeposit(NO_OWN_RATE, "photoshoot", { people: 2, extraLabels: [] }, SITE_DEFAULT);
ok("a product with no rate of its own uses the site default", inherited.ok && inherited.quote.totalCents === 2000);
ok(
  "without the default that same product produces nothing — the bug",
  !quoteDeposit(NO_OWN_RATE, "photoshoot", { people: 2, extraLabels: [] }).ok
);
ok("rulesFor applies the default too", rulesFor(NO_OWN_RATE, SITE_DEFAULT).amountUsd === SITE_DEFAULT);
ok("a product's own rate still wins over the default", rulesFor(PRODUCT, SITE_DEFAULT).amountUsd === 25);

// The agreement itself: wherever the page would show a figure, the checkout
// must be able to charge one, and the two must match.
const AGREEMENT: [string, QuotableProduct, number | undefined][] = [
  ["a product with its own flat rate", { slug: "a", title: "A", bookable: true, depositUsd: 25 }, undefined],
  ["a product inheriting the site default", NO_OWN_RATE, SITE_DEFAULT],
  ["a product whose rate overrides the default", { slug: "c", title: "C", bookable: true, depositUsd: 50 }, SITE_DEFAULT],
];
for (const [label, product, fallback] of AGREEMENT) {
  // resolveDeposit also carries the product's price, which the quote has no
  // business knowing — the site publishes no prices. Supplied here only to
  // satisfy its signature.
  const page = resolveDeposit({ ...product, price: { amount: 199 } }, fallback);
  const checkout = quoteDeposit(product, "photoshoot", { people: 1, extraLabels: [] }, fallback);
  ok(
    `${label}: the page shows a deposit the checkout cannot charge`,
    page.bookable === checkout.ok
  );
  if (page.bookable && checkout.ok) {
    ok(
      `${label}: the page and the checkout disagree about the amount`,
      Math.round(page.amountUsd * 100) === checkout.quote.totalCents
    );
  }
}

// And the headline the button actually renders comes from the same place.
const headline = depositHeadline(NO_OWN_RATE, "photoshoot", SITE_DEFAULT);
ok("the button's figure comes from the quote", headline?.label === "$20");
ok("a flat rate is not labelled per person", headline?.perPerson === false);
const perPersonHeadline = depositHeadline(PRODUCT, "photoshoot");
ok("a per-person rate says so", perPersonHeadline?.perPerson === true && perPersonHeadline.label === "$25");
ok("an unbookable product has no headline", depositHeadline({ slug: "x", title: "X" }, "photoshoot") === null);

// ---------------------------------------------------------------------------
// 10. One authority on whether a deposit can be taken.
//
// The same mistake has been made three times in this codebase, and each time
// it was invisible until a customer met it:
//
//   1. the rail — a page saying "held, not charged" about money the route had
//      already captured;
//   2. the amount — a page showing $20 next to a checkout that found no rule
//      and never opened PayPal;
//   3. bookability — a button saying "Request your date" because the page
//      asked resolveDeposit while the route asked the quote.
//
// All three are one defect: two surfaces answering one question from two
// functions. depositOffer is now the only answer, and this is the invariant
// that keeps it that way — wherever a button appears, the checkout can quote,
// and wherever it cannot quote, no button appears.
// ---------------------------------------------------------------------------
const CONFIGS: [string, QuotableProduct, number | undefined][] = [
  ["its own flat rate", { slug: "a", title: "A", bookable: true, depositUsd: 25 }, undefined],
  ["inheriting the site default", { slug: "b", title: "B", bookable: true }, 20],
  ["a rate overriding the default", { slug: "c", title: "C", bookable: true, depositUsd: 50 }, 20],
  ["a per-person rate", { slug: "d", title: "D", bookable: true, depositUsd: 25, depositBasis: "perPerson" }, undefined],
  ["a per-person rate with a cap", { slug: "e", title: "E", bookable: true, depositUsd: 25, depositBasis: "perPerson", depositMaxUsd: 100 }, undefined],
  ["the switch off", { slug: "f", title: "F", bookable: false, depositUsd: 25 }, 20],
  ["no rate and no default", { slug: "g", title: "G", bookable: true }, undefined],
  ["a zero rate", { slug: "h", title: "H", bookable: true, depositUsd: 0 }, undefined],
  ["a zero site default", { slug: "i", title: "I", bookable: true }, 0],
  ["a cap of zero", { slug: "j", title: "J", bookable: true, depositUsd: 25, depositMaxUsd: 0 }, undefined],
];

for (const [label, product, fallback] of CONFIGS) {
  const offer = depositOffer(product, "photoshoot", fallback);
  // The invariant, both ways round, for every configuration anybody can
  // produce in the Studio.
  for (const people of [1, 3, 20]) {
    const charge = quoteDeposit(product, "photoshoot", { people, extraLabels: [] }, fallback);
    ok(
      `${label}: a button would show for ${people} people but the checkout cannot charge`,
      offer.available === charge.ok
    );
  }
  if (offer.available) {
    ok(`${label}: the button would show an empty figure`, offer.headline.startsWith("$") && offer.headline.length > 1);
  } else {
    // Every refusal has to be explainable in the admin page, or somebody is
    // reading code again to find out why a button vanished.
    const why = explainOffer(offer.reason);
    ok(`${label}: the refusal "${offer.reason}" has no explanation`, why.length > 20);
  }
}

// The specific case that was reported: the switch on, no rate of its own, and
// the site default removed. Both must agree there is nothing to charge.
const stranded: QuotableProduct = { slug: "stranded", title: "Stranded", bookable: true };
const strandedOffer = depositOffer(stranded, "photoshoot", undefined);
ok("a product with no rate anywhere offers nothing", !strandedOffer.available);
ok(
  "and says so in words somebody can act on",
  !strandedOffer.available && explainOffer(strandedOffer.reason).includes("site-wide default")
);

// The instruction has to be in the unit the field is actually in.
//
// It said "a positive figure in whole cents", meaning a figure that resolves
// to whole cents. Read plainly it says to enter cents — and somebody following
// it types 2500 for a $25 deposit and charges two and a half thousand dollars.
// The internals are in cents; nothing a human types ever is.
for (const reason of ["notBookable", "noRule", "zero", "badPeople"] as const) {
  const text = explainOffer(reason);
  ok(
    `the "${reason}" explanation tells somebody to enter cents`,
    !/\bin (whole )?cents\b/i.test(text)
  );
}
ok(
  "the missing-amount explanation says dollars, with an example",
  /DOLLARS/.test(explainOffer("noRule")) && explainOffer("noRule").includes("25")
);
ok(
  "while the same product with a default is bookable",
  depositOffer(stranded, "photoshoot", 20).available
);

// ---------------------------------------------------------------------------
// 11. GROQ-shaped data: every optional field present and null.
//
// This section exists because of the bug it would have caught, and the reason
// it did not exist is worth more than the assertions.
//
// Every fixture above builds a product as an object literal, so an optional
// field that is "not set" is an OMITTED KEY, and reads as `undefined`. Real
// data never looks like that. GROQ returns an explicit `null` for any field in
// the projection that the document does not have. So the entire check suite
// was testing a shape that does not occur in production, and passed happily
// while the live site could not quote a single deposit.
//
// The specific failure: the cap check asked `maxUsd === undefined`. With a
// real `depositMaxUsd: null` that is false, so an unset cap was treated as an
// unreadable one and every bookable product reported "no deposit configured" —
// from the moment depositMaxUsd was added to the query, with correct data in
// Sanity the whole time.
//
// These fixtures are copied from an actual API response.
// ---------------------------------------------------------------------------
const FROM_GROQ = {
  slug: "exclusive-pyramids-photoshoot",
  title: "Exclusive Pyramids Photoshoot",
  bookable: true,
  depositUsd: 25,
  depositBasis: "perPerson",
  depositMaxUsd: null,
  extras: null,
} as unknown as QuotableProduct;

const groqQuote = quoteDeposit(FROM_GROQ, "photoshoot", { people: 3, extraLabels: [] });
ok("a real GROQ document can be quoted at all", groqQuote.ok);
ok("and for the right amount", groqQuote.ok && groqQuote.quote.totalCents === 7500);
ok("a null cap is no cap, not a broken one", depositOffer(FROM_GROQ, "photoshoot").available);
ok("isAbsent treats null and undefined alike", isAbsent(null) && isAbsent(undefined));
ok("isAbsent does not swallow a real value", !isAbsent(0) && !isAbsent(25) && !isAbsent(""));

// Every optional field null at once — a document somebody switched on and
// filled in nothing else.
const ALL_NULL = {
  slug: "bare",
  title: "Bare",
  bookable: true,
  depositUsd: 25,
  depositBasis: null,
  depositMaxUsd: null,
  extras: null,
} as unknown as QuotableProduct;
const bare = quoteDeposit(ALL_NULL, "photoshoot", { people: 4, extraLabels: ["Camel Ride"] });
ok("a document with every optional field null still quotes", bare.ok);
ok("a null basis means flat, not broken", bare.ok && bare.quote.totalCents === 2500);
ok("null extras are no extras, not a crash", bare.ok && bare.quote.lines.length === 1);

// Extras as GROQ returns them: present, with null deposit fields.
const GROQ_EXTRAS = {
  slug: "x",
  title: "X",
  bookable: true,
  depositUsd: 25,
  depositBasis: null,
  depositMaxUsd: null,
  extras: [
    { label: "Camel Ride", priceUsd: 25, depositUsd: null, depositBasis: null },
    { label: "Video Reels", priceUsd: 25, depositUsd: 10, depositBasis: null },
  ],
} as unknown as QuotableProduct;
const withGroqExtras = quoteDeposit(GROQ_EXTRAS, "photoshoot", {
  people: 2,
  extraLabels: ["Camel Ride", "Video Reels"],
});
ok("an extra with a null deposit adds nothing", withGroqExtras.ok && withGroqExtras.quote.totalCents === 2500 + 1000);
ok("an extra with a null basis is charged per booking", withGroqExtras.ok && withGroqExtras.quote.lines[1].quantity === 1);

// A cap that IS set but is nonsense must still be refused — the fix must not
// have turned the check off, only taught it what "absent" means.
for (const badCap of [-5, Number.NaN, "100", {}]) {
  const product = { ...FROM_GROQ, depositMaxUsd: badCap } as unknown as QuotableProduct;
  const offer = depositOffer(product, "photoshoot");
  ok(
    `a cap of ${JSON.stringify(badCap)} must be refused, not ignored`,
    !offer.available && offer.reason === "badCap"
  );
  ok(`and explained as a cap problem, not a missing amount`, explainOffer("badCap").includes("Most the deposit can reach"));
}
// A real cap still caps.
const realCap = quoteDeposit(
  { ...FROM_GROQ, depositMaxUsd: 50 } as unknown as QuotableProduct,
  "photoshoot",
  { people: 10, extraLabels: [] }
);
ok("a cap that is set still applies", realCap.ok && realCap.quote.totalCents === 5000);

// The site default, null as siteSettings actually returns it.
const INHERITS = { slug: "i", title: "I", bookable: true, depositUsd: null, depositMaxUsd: null } as unknown as QuotableProduct;
ok(
  "a null product amount falls through to the site default",
  quoteDeposit(INHERITS, "photoshoot", { people: 1, extraLabels: [] }, 20).ok
);
ok(
  "and with a null default too, there is honestly nothing to charge",
  !quoteDeposit(INHERITS, "photoshoot", { people: 1, extraLabels: [] }, undefined).ok
);

// ---------------------------------------------------------------------------
// 12. One place assembles the rail, because four places used to.
//
// The page, the secure page and the booking route each built the same answer
// out of depositOffer + payPalLink + paymentProviderFor, in their own order.
// Three of them hardcoded `{ isAdmin: false }` while the route passed the real
// viewer, so an admin testing the sandbox was told "No payment now" by a page
// and then handed PayPal buttons by the route. That is the fourth time a page
// and the route have disagreed about money in this codebase; this check is
// here so there is no fifth.
//
// Only productRail.ts may assemble it. Everything else reads the answer.
const sources = await Promise.all(
  [
    "src/app/[locale]/(site)/photoshoots/[slug]/page.tsx",
    "src/app/[locale]/(site)/experiences/[slug]/page.tsx",
    "src/app/[locale]/(site)/secure/[type]/[slug]/page.tsx",
    "src/app/api/bookings/route.ts",
  ].map(async (file) => ({ file, text: await readFile(file, "utf8") }))
);
for (const { file, text } of sources) {
  ok(`${file} reads the rail from productRail`, text.includes("productRail("));
  ok(`${file} does not assemble one of its own`, !text.includes("resolveRail("));
  ok(
    `${file} does not pick a provider for itself`,
    !text.includes("paymentProviderFor(")
  );
}

// 13. Wherever a deposit can be quoted, the customer is shown the figure.
//
// Both symptoms the popup showed were this: a $25-per-person deposit for two
// people is $50, the quote said so, and nothing on screen said it. The footer
// hid the figure behind the rail, and the breakdown asked for two lines when
// a per-person deposit for a group produces exactly one.
const dialog = await readFile("src/components/SecureDateButton.tsx", "utf8");
ok(
  "the dialog resolves the viewer's own payment mode rather than trusting a static page",
  dialog.includes("/api/bookings/rail") && dialog.includes("const mode = viewerMode ?? paymentMode")
);
ok(
  "and no money sentence still reads the page's mode directly",
  !/\bpaymentMode (===|!==) "/.test(dialog)
);
const forTwo = quoteDeposit(FROM_GROQ, "photoshoot", { people: 2, extraLabels: [] });
ok("a $25 per-person deposit for two people is $50", forTwo.ok && forTwo.quote.totalCents === 5000);
ok(
  "and it arrives as one line charged twice, which is why a two-line test missed it",
  forTwo.ok && forTwo.quote.lines.length === 1 && forTwo.quote.lines[0].quantity === 2
);
ok(
  "so the breakdown opens on quantity, not on the number of lines",
  dialog.includes("lines.length > 1 || lines.some((line) => line.quantity > 1)")
);

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
    "a quote records the rates that produced it, one function assembles the rail, and a deposit that can be " +
    "quoted is a deposit the customer can see."
);
