/**
 * Guards the deposit arithmetic.
 *
 * This is the module that decides what a customer is charged, so the rules it
 * has to keep are not style preferences:
 *
 *   1. The browser cannot influence the figure. It sends a headcount and a
 *      list of labels with quantities; every price comes from the product. A
 *      selection carrying its own price buys nothing.
 *   2. Money never passes through a float. Every figure is integer cents, and
 *      the comparison against what PayPal reports is in cents too — a payment
 *      a cent short has to fail, and 0.1 + 0.2 is not 0.3.
 *   3. A quote is a snapshot. It records the price and percentage that
 *      produced it, so a booking taken today still reads the same after
 *      somebody edits the Studio tomorrow.
 *   4. Broken configuration produces no booking, never a guess.
 *   5. **The deposit is the only amount collected online.** Never the balance,
 *      never the whole booking. A bug that charges the full total is the worst
 *      thing this system can do, so it is asserted rather than assumed.
 *
 * The fixtures deliberately use GROQ's shape — explicit `null` for an unset
 * field, not an omitted key. Every fixture here once used omitted keys, which
 * tested a shape production never produces, and that is how an unset cap read
 * as a broken one and took every deposit on the site offline.
 */
import {
  DEFAULT_DEPOSIT_PERCENT,
  MAX_EXTRA_QUANTITY,
  MAX_PEOPLE,
  depositOffer,
  describeQuote,
  explainOffer,
  formatCents,
  isAbsent,
  isInstantBookable,
  percentFor,
  priceCentsOf,
  quoteDeposit,
  readExtraSelection,
  readPercent,
  usdToCents,
  type OfferProblem,
  type QuotableProduct,
} from "../src/lib/booking/quote";
import { readFile } from "node:fs/promises";

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

/** The shape GROQ actually returns: unset fields are null, not missing. */
const PRODUCT: QuotableProduct = {
  slug: "exclusive-pyramids-photoshoot",
  title: "Exclusive Pyramids Photoshoot",
  bookable: true,
  price: { amount: 200 },
  depositPercent: null,
  extras: [
    { label: "Camel Ride", priceUsd: 25 },
    { label: "Running Horse Ride", priceUsd: 60 },
  ],
};

const quote = (
  product: QuotableProduct,
  people: number,
  extras: unknown = [],
  sitePercent?: number | null
) => quoteDeposit(product, "photoshoot", { people, extras }, sitePercent);

// ---------------------------------------------------------------------------
// 1. The worked example from the brief, end to end.
const two = quote(PRODUCT, 2);
ok("a $200 item for two people does not quote", two.ok);
if (two.ok) {
  ok("the booking total is not $200 × 2", two.quote.bookingTotalCents === 40000);
  ok("the deposit is not 25% of $400", two.quote.totalCents === 10000);
  ok("the balance is not the other 75%", two.quote.balanceCents === 30000);
  ok("the percentage is not recorded on the quote", two.quote.depositPercent === 25);
  ok("the service line is not price × people", two.quote.lines[0].amountCents === 40000);
  ok("the service line forgets the unit price", two.quote.lines[0].unitCents === 20000);
}

// ---------------------------------------------------------------------------
// 2. The deposit is the ONLY thing charged. The single most expensive bug
//    available here is collecting the whole booking, so it is asserted from
//    several directions rather than trusted to one line.
for (const people of [1, 2, 3, 7, MAX_PEOPLE]) {
  const r = quote(PRODUCT, people, [{ label: "Camel Ride", quantity: 2 }]);
  ok(`no quote for ${people} people`, r.ok);
  if (!r.ok) continue;
  ok(
    `the charge for ${people} equals the whole booking — the balance must never be taken online`,
    r.quote.totalCents < r.quote.bookingTotalCents
  );
  ok(
    `the charge for ${people} is not the stated percentage of the total`,
    r.quote.totalCents === Math.round((r.quote.bookingTotalCents * r.quote.depositPercent) / 100)
  );
  ok(
    `deposit and balance for ${people} do not add up to the booking`,
    r.quote.totalCents + r.quote.balanceCents === r.quote.bookingTotalCents
  );
}

// 100% would be exactly "charge the whole thing", so it is refused outright.
ok("a 100% deposit is accepted", readPercent(100) === null);
ok("a 0% deposit is accepted", readPercent(0) === null);
ok("a negative percentage is accepted", readPercent(-25) === null);
ok("a half percent is refused", readPercent(12.5) === 12.5);
ok("a third of a percent is accepted", readPercent(25.3) === null);
for (const junk of ["25", null, undefined, Number.NaN, Number.POSITIVE_INFINITY, {}]) {
  ok(`${JSON.stringify(junk)} is read as a percentage`, readPercent(junk) === null);
}

// ---------------------------------------------------------------------------
// 3. Extras: quantities, and they count toward the deposit base.
const withExtras = quote(PRODUCT, 2, [
  { label: "Camel Ride", quantity: 3 },
  { label: "Running Horse Ride", quantity: 1 },
]);
ok("a selection with quantities does not quote", withExtras.ok);
if (withExtras.ok) {
  // $400 + (25×3) + 60 = $535 → 25% = $133.75
  ok("extras are not multiplied by their quantity", withExtras.quote.bookingTotalCents === 53500);
  ok("the deposit is not 25% of item plus extras", withExtras.quote.totalCents === 13375);
  ok("a half-cent did not survive as a float", Number.isInteger(withExtras.quote.totalCents));
  const camel = withExtras.quote.lines.find((l) => l.label === "Camel Ride");
  ok("the camel line is missing", camel !== undefined);
  ok("the camel line is not 3 × $25", camel?.amountCents === 7500 && camel?.quantity === 3);
}

// A price in the request body buys nothing: prices come from the product only.
const forged = quote(PRODUCT, 1, [{ label: "Camel Ride", quantity: 1, priceUsd: 0 }]);
ok("a forged price changed the figure", forged.ok && forged.quote.lines[1].unitCents === 2500);
const invented = quote(PRODUCT, 1, [{ label: "Private Jet", quantity: 1, priceUsd: 5 }]);
ok("an extra the product does not offer was added", invented.ok && invented.quote.lines.length === 1);

// Invalid quantities resolve to "not taken", never to a negative line.
for (const bad of [-1, 0, 1.5, Number.NaN, "2", null, undefined]) {
  const r = quote(PRODUCT, 1, [{ label: "Camel Ride", quantity: bad }]);
  ok(
    `quantity ${JSON.stringify(bad)} produced a line — invalid must mean not taken`,
    r.ok && r.quote.lines.length === 1
  );
}
const huge = quote(PRODUCT, 1, [{ label: "Camel Ride", quantity: 9999 }]);
ok(
  "an absurd quantity is not capped",
  huge.ok && huge.quote.lines[1].quantity === MAX_EXTRA_QUANTITY
);
const twice = quote(PRODUCT, 1, [
  { label: "Camel Ride", quantity: 1 },
  { label: "camel ride", quantity: 5 },
]);
ok("the same extra twice became two lines", twice.ok && twice.quote.lines.length === 2);

// The old wire shape — a bare array of labels — still books, because a page
// cached before the steppers shipped must not produce an error.
const legacy = quote(PRODUCT, 1, ["Camel Ride"]);
ok("the old label-only shape stopped working", legacy.ok && legacy.quote.lines.length === 2);
ok("the old shape is not read as quantity 1", legacy.ok && legacy.quote.lines[1].quantity === 1);
ok("readExtraSelection drops a bare string", readExtraSelection(["x"])[0]?.quantity === 1);
ok("readExtraSelection accepts a non-array", readExtraSelection("nope").length === 0);

// ---------------------------------------------------------------------------
// 4. Instant Booking: both halves required, and they are separate questions.
ok("a product with price and switch on is not bookable", isInstantBookable(PRODUCT));
ok(
  "a price alone put a product on sale — the switch must be the second half",
  !isInstantBookable({ ...PRODUCT, bookable: false })
);
ok(
  "the switch alone put a product on sale with no price to charge a share of",
  !isInstantBookable({ ...PRODUCT, price: null })
);
ok("a null price amount counts as a price", !isInstantBookable({ ...PRODUCT, price: { amount: null } }));
ok("a zero price counts as a price", !isInstantBookable({ ...PRODUCT, price: { amount: 0 } }));
ok("priceCentsOf reads a real price wrong", priceCentsOf(PRODUCT) === 20000);
ok("priceCentsOf invents a price from nothing", priceCentsOf({ ...PRODUCT, price: null }) === null);
ok("a negative price counts as a price", !isInstantBookable({ ...PRODUCT, price: { amount: -10 } }));

ok("the switch off still quotes", !quote({ ...PRODUCT, bookable: false }, 1).ok);
ok(
  "the switch off reports the wrong reason",
  (quote({ ...PRODUCT, bookable: false }, 1) as { reason: OfferProblem }).reason === "notBookable"
);
ok(
  "a missing price reports the wrong reason",
  (quote({ ...PRODUCT, price: null }, 1) as { reason: OfferProblem }).reason === "noPrice"
);

// ---------------------------------------------------------------------------
// 5. Where the percentage comes from, and GROQ's nulls.
ok("a product override is ignored", percentFor({ ...PRODUCT, depositPercent: 10 }, 25) === 10);
ok("the site default is ignored", percentFor(PRODUCT, 30) === 30);
ok("a null product percent does not fall through to the site", percentFor(PRODUCT, 30) === 30);
ok(
  "with nothing set anywhere the default is not 25%",
  percentFor(PRODUCT, null) === DEFAULT_DEPOSIT_PERCENT
);
ok(
  "a product override that is junk is silently ignored rather than refused",
  percentFor({ ...PRODUCT, depositPercent: 150 }, 25) === null
);
ok("isAbsent does not treat null and undefined alike", isAbsent(null) && isAbsent(undefined));
ok("isAbsent swallows a real zero", !isAbsent(0));

const tenPercent = quote({ ...PRODUCT, depositPercent: 10 }, 1);
ok("a product override does not reach the figure", tenPercent.ok && tenPercent.quote.totalCents === 2000);
const sitePercent = quote(PRODUCT, 1, [], 50);
ok("the site percentage does not reach the figure", sitePercent.ok && sitePercent.quote.totalCents === 10000);

// ---------------------------------------------------------------------------
// 6. Cents, never floats. The rounding happens once, at the end.
ok("usdToCents accepts sub-cent precision", usdToCents(25.005) === null);
ok("usdToCents accepts a string", usdToCents("25") === null);
ok("usdToCents accepts a negative", usdToCents(-1) === null);
ok("usdToCents mangles a whole figure", usdToCents(200) === 20000);
ok("formatCents drops the cents", formatCents(13375) === "$133.75");
ok("formatCents adds cents to a whole figure", formatCents(10000) === "$100");

// 33.33% of $0.10 is 3.333 cents. One rounding, and the result is an integer.
const awkward = quote({ ...PRODUCT, price: { amount: 0.1 }, depositPercent: 33.5 }, 1);
ok("an awkward percentage produced a fraction of a cent", !awkward.ok || Number.isInteger(awkward.quote.totalCents));

// A deposit that rounds to nothing is no deposit, not a free booking.
const dust = quote({ ...PRODUCT, price: { amount: 0.01 }, depositPercent: 0.5 }, 1);
ok("a deposit rounding to zero is still offered", !dust.ok && dust.reason === "zero");

// ---------------------------------------------------------------------------
// 7. The headcount bounds.
for (const bad of [0, -1, 1.5, Number.NaN, MAX_PEOPLE + 1]) {
  const r = quote(PRODUCT, bad as number);
  ok(`a headcount of ${bad} was accepted`, !r.ok && r.reason === "badPeople");
}

// ---------------------------------------------------------------------------
// 8. The snapshot records what produced it, so a later price change cannot
//    rewrite a booking already taken.
const snapshot = quote(PRODUCT, 2, [{ label: "Camel Ride", quantity: 2 }]);
ok("the quote does not record the price it used", snapshot.ok && snapshot.quote.rules.priceCents === 20000);
ok("the quote does not record the percentage", snapshot.ok && snapshot.quote.rules.depositPercent === 25);
ok(
  "the quote does not record each extra's price and quantity",
  snapshot.ok &&
    snapshot.quote.rules.extras[0].priceCents === 2500 &&
    snapshot.quote.rules.extras[0].quantity === 2
);
if (snapshot.ok) {
  const after = quote({ ...PRODUCT, price: { amount: 999 } }, 2, [{ label: "Camel Ride", quantity: 2 }]);
  ok(
    "a price change rewrote the stored snapshot rather than producing a new quote",
    after.ok && after.quote.rules.priceCents === 99900 && snapshot.quote.rules.priceCents === 20000
  );
}

// ---------------------------------------------------------------------------
// 9. The offer: what the product page reads.
const offer = depositOffer(PRODUCT, "photoshoot");
ok("the offer is unavailable for a priced, switched-on product", offer.available);
if (offer.available) {
  ok("the offer does not carry the price", offer.priceLabel === "$200" && offer.priceCents === 20000);
  ok("the offer does not carry the percentage", offer.depositPercent === 25);
  ok("the one-person deposit is wrong", offer.onePersonDepositCents === 5000);
}
for (const reason of ["notBookable", "noPrice", "badPercent", "zero", "badPeople"] as const) {
  ok(`${reason} has no explanation an editor can act on`, explainOffer(reason).length > 20);
}
ok(
  "the notBookable explanation does not say the price still shows",
  /price still shows/i.test(explainOffer("notBookable"))
);

// ---------------------------------------------------------------------------
// 10. What the customer reads is the arithmetic, not a bare figure.
if (two.ok) {
  const rows = describeQuote(two.quote);
  ok("describeQuote does not show the multiplication", rows[0].detail === "$200 × 2 = $400");
  ok("describeQuote does not end with the percentage line", rows[rows.length - 1].label === "25% deposit");
  ok(
    "the percentage line does not show its working",
    rows[rows.length - 1].detail === "$400 × 25% = $100"
  );
}

// ---------------------------------------------------------------------------
// 11. One place assembles the rail, because four places used to. Unchanged by
//     the pricing rebuild, and still the thing that stops a page and the route
//     naming different numbers.
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
  ok(`${file} does not pick a provider for itself`, !text.includes("paymentProviderFor("));
}

// 12. And the frontend does no pricing of its own. Every figure in the popup
//     comes from quoteDeposit; a multiplication written in the component is a
//     second pricing system that will drift from the server's.
const dialog = await readFile("src/components/SecureDateButton.tsx", "utf8");
ok(
  "the dialog resolves the viewer's own payment mode rather than trusting a static page",
  dialog.includes("/api/bookings/rail") && dialog.includes("const mode = viewerMode ?? paymentMode")
);
ok("the dialog no longer computes the deposit itself", !/extrasTotal\(/.test(dialog));
ok("the dialog reads its figures from the shared quote", dialog.includes("quoteDeposit("));
ok(
  "the dialog shows the booking total and the percentage, not just the amount due",
  dialog.includes("bookingTotalCents") && dialog.includes("depositPercent")
);
ok(
  "the dialog does not promise the balance is never charged online",
  /never charged online/i.test(dialog)
);

// ---------------------------------------------------------------------------
// 13. The published promise and the code agree on the percentage.
//
// The site states the deposit share in three places a customer reads before
// they ever open the popup. It said 20% while this module was about to start
// charging 25% — a contradiction about money, on the same site, and nothing
// would have caught it. These are static sentences, so they cannot follow a
// Studio change by themselves; this check is what makes the divergence loud.
const published = await Promise.all(
  ["src/content/site.ts", "src/content/faqHub.ts", "src/content/customizePage.ts"].map(
    async (file) => ({ file, text: await readFile(file, "utf8") })
  )
);
for (const { file, text } of published) {
  const stated = [...text.matchAll(/(\d+(?:\.\d+)?)% (?:down payment|deposit)/g)].map((m) => m[1]);
  ok(`${file} no longer states a deposit percentage at all`, stated.length > 0);
  for (const value of stated) {
    ok(
      `${file} promises a ${value}% deposit while the code charges ${DEFAULT_DEPOSIT_PERCENT}% — change both or neither`,
      Number(value) === DEFAULT_DEPOSIT_PERCENT
    );
  }
}

// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\ncheck-quote: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}
console.log(
  "check-quote: ok — the deposit is a percentage of the backend price times the quantities, computed in " +
    "whole cents, never larger than the booking it is a share of; a selection cannot carry its own price; " +
    "Instant Booking needs both a price and the switch; and a quote records the figures that produced it."
);
