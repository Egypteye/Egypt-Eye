import { readFileSync } from "node:fs";
import {
  MAX_QUANTITY,
  isInstantlyOrderable,
  quoteCartouche,
  sellsOnline,
  unitPriceCents,
  type OrderableProduct,
} from "../src/lib/boutique/cartoucheOrder";
import { treasureProducts } from "../src/content/treasures";

// Buying a cartouche outright, checked offline.
//
// The route itself is unreachable from here — it imports `server-only`
// transitively — so everything that can be proven without it lives in
// cartoucheOrder.ts, and what cannot is asserted against the route's source.
// That split is the same one paypalBody.ts and quoteSelfTest.ts exist for.

/**
 * Source with its comments removed.
 *
 * A guard written in this project once passed because it matched its own
 * explanatory comment. Any assertion about what the code SAYS to a customer
 * runs against this, never the raw file.
 */
function code(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

const priced = (over: Partial<OrderableProduct> = {}): OrderableProduct => ({
  slug: "khufu-cartouche",
  name: "Khufu Cartouche",
  status: "available",
  price: { amount: 99, currency: "USD" },
  ...over,
});

const base = { name: "Omar", quantity: 1, fulfilment: "collect-in-egypt" as const };

// ---------------------------------------------------------------------------
// 1. The browser cannot name its own price.
//
//    This is the whole security argument for the route, so it is asserted
//    against the TYPE and against the route's source rather than trusted to a
//    comment. A field that does not exist cannot be tampered with.
// ---------------------------------------------------------------------------
const mod = readFileSync("src/lib/boutique/cartoucheOrder.ts", "utf8");
const route = readFileSync("src/app/api/boutique/order/route.ts", "utf8");

const quoteInput = mod.slice(mod.indexOf("export type QuoteInput"), mod.indexOf("export type CartoucheQuote"));
ok("QuoteInput has no price field", !/\b(price|amount|cents|total|currency)\b\s*[?]?:/i.test(quoteInput));
ok("QuoteInput takes the product, not a figure", /product: OrderableProduct/.test(quoteInput));

const bodyType = code(route.slice(route.indexOf("type Body = {"), route.indexOf("};", route.indexOf("type Body = {"))));
ok("the request body has no price field", !/\b(price|amount|cents|total|currency|unitCents)\b/i.test(bodyType));
ok("the request body has no sign list", !/\b(signs|glyphs|signCodes|spelling)\b/i.test(bodyType));

// The price must come off the product the server looked up, and the only
// insert must use the quote's figures rather than anything from the body.
ok("the route fetches the product server-side", /await getTreasureProducts\(\)/.test(route));
ok("the route quotes from that product", /quoteCartouche\(\{[\s\S]{0,200}?product: \{ slug: product\.slug/.test(route));
ok("the stored price comes from the quote", /unit_cents: quote\.unitCents/.test(route) && /total_cents: quote\.totalCents/.test(route));
ok("no figure from the body reaches the insert", !/(unit_cents|total_cents|amount_cents):\s*(body|Number\(body)/.test(route));

// The signs are derived, never received — the same rule the enquiry follows.
ok("the signs stored come from the quote", /sign_codes: quote\.signCodes/.test(route));

// ---------------------------------------------------------------------------
// 2. No price means no sale. This is the honest state of every cartouche in
//    the Boutique today, and it must refuse rather than invent a figure.
// ---------------------------------------------------------------------------
ok("an on-request piece does not sell online", !sellsOnline("onRequest"));
ok("a sold-out piece does not sell online", !sellsOnline("soldOut"));
ok("a hidden piece does not sell online", !sellsOnline("hidden"));
ok("an available piece does", sellsOnline("available"));
ok("a pre-order piece does", sellsOnline("preorder"));

ok("no price at all is refused", quoteCartouche({ ...base, product: priced({ price: undefined }) }).ok === false);
ok(
  "a null price is refused",
  quoteCartouche({ ...base, product: priced({ price: { amount: null } }) }).ok === false,
);
ok(
  "a zero price is refused, not sold free",
  quoteCartouche({ ...base, product: priced({ price: { amount: 0 } }) }).ok === false,
);
ok(
  "a negative price is refused",
  quoteCartouche({ ...base, product: priced({ price: { amount: -10 } }) }).ok === false,
);
ok(
  "a sub-cent price is refused rather than rounded",
  unitPriceCents(priced({ price: { amount: 25.005 } })) === null,
);
ok(
  "an on-request piece is refused even with a price typed on it",
  quoteCartouche({ ...base, product: priced({ status: "onRequest" }) }).ok === false,
);

const noPrice = quoteCartouche({ ...base, product: priced({ price: undefined }) });
ok("the refusal names its reason", !noPrice.ok && noPrice.reason === "no-price");
ok("the refusal tells the customer what to do", !noPrice.ok && /enquiry/i.test(noPrice.message));

// Today's catalogue: every cartouche is on request, so nothing may show a
// buy button. If this ever goes green because a real price was entered, that
// is the feature working — update the figure here deliberately.
const cartouches = treasureProducts.filter((p) => p.category === "cartouches");
ok("there are cartouches to check", cartouches.length > 0);
ok(
  "no cartouche is instantly orderable until a price is entered",
  cartouches.every((p) => !isInstantlyOrderable({ slug: p.slug, name: p.name, status: p.status, price: p.price })),
);

// ---------------------------------------------------------------------------
// 3. The customisation must be sound before any money is asked for.
// ---------------------------------------------------------------------------
ok("an empty name is refused", quoteCartouche({ ...base, name: "   ", product: priced() }).ok === false);
ok(
  "a name longer than the cartouche holds is refused",
  quoteCartouche({ ...base, name: "Mohamed", product: priced() }).ok === false,
);
ok(
  "a name with an unwritable character is refused, not silently dropped",
  quoteCartouche({ ...base, name: "Ana 7", product: priced() }).ok === false,
);
const overCap = quoteCartouche({ ...base, name: "Mohamed", product: priced() });
ok("over-capacity says so", !overCap.ok && overCap.reason === "over-capacity");

ok("a four-sign name is accepted", quoteCartouche({ ...base, product: priced() }).ok);
ok(
  "a digraph name that fits is accepted",
  quoteCartouche({ ...base, name: "Sharon", product: priced(), capacity: 5 } as never).ok,
);

// ---------------------------------------------------------------------------
// 4. The arithmetic. Integer cents throughout, one price, no second answer.
// ---------------------------------------------------------------------------
const q = quoteCartouche({ ...base, quantity: 3, product: priced() });
ok("a good quote comes back", q.ok);
if (q.ok) {
  ok("the unit price is whole cents", Number.isInteger(q.quote.unitCents) && q.quote.unitCents === 9900);
  ok("the total is whole cents", Number.isInteger(q.quote.totalCents));
  ok("the total is unit times quantity", q.quote.totalCents === q.quote.unitCents * q.quote.quantity);
  ok("collection in Egypt adds nothing", q.quote.fulfilmentCents === 0);
  ok("the quote records the signs for the workshop", q.quote.signCodes.length === q.quote.signCount);
  ok("the quote carries a line a human can read", /OMAR/.test(q.quote.spellingLine));
  ok("the engraved name is trimmed, not rewritten", q.quote.engravedName === "Omar");
  ok("the currency is stated", q.quote.currency === "USD");
}

ok("zero quantity is refused", quoteCartouche({ ...base, quantity: 0, product: priced() }).ok === false);
ok("a fractional quantity is refused", quoteCartouche({ ...base, quantity: 1.5, product: priced() }).ok === false);
ok(
  "a quantity past the cap is refused",
  quoteCartouche({ ...base, quantity: MAX_QUANTITY + 1, product: priced() }).ok === false,
);
ok("the cap itself is allowed", quoteCartouche({ ...base, quantity: MAX_QUANTITY, product: priced() }).ok);

// A price with cents must survive intact — 99.95 is 9995, never 9994 or 9996.
const pence = quoteCartouche({ ...base, quantity: 7, product: priced({ price: { amount: 99.95 } }) });
ok("a price with cents is exact", pence.ok && pence.quote.totalCents === 69965);

// ---------------------------------------------------------------------------
// 5. Fulfilment. One option today, and an unknown one is refused rather than
//    quietly treated as collection.
// ---------------------------------------------------------------------------
ok(
  "an unknown fulfilment is refused",
  quoteCartouche({ ...base, product: priced(), fulfilment: "post-to-uk" as never }).ok === false,
);
ok("there is no address field to collect", !/address|postcode|postal|country/i.test(bodyType));

// ---------------------------------------------------------------------------
// 6. Ordering. The row exists before PayPal is asked for anything, or a
//    payment arrives that matches nothing.
// ---------------------------------------------------------------------------
const insertAt = route.indexOf('.from("boutique_orders")');
const attemptAt = route.indexOf("createAttempt({");
ok("the order row is inserted", insertAt > 0);
ok("an attempt is opened", attemptAt > 0);
ok("the row is written BEFORE the payment is opened", insertAt < attemptAt);
ok("a failed insert does not open a payment", /if \(error \|\| !order\) \{[\s\S]{0,300}?status: 500/.test(route));
ok("the attempt is tied to the boutique order", /parent: \{ kind: "boutiqueOrder"/.test(route));

// The honeypot and the rate limit, same as every other public form here.
ok("the honeypot is the shared one", /text\(body\.company/.test(route));
ok("the route is rate limited", /checkRateLimit\(\{[\s\S]{0,160}?bucket: "boutique-order"/.test(route));
ok("the client ip comes from the proxy helper", /key: getClientIp\(request\)/.test(route));

// ---------------------------------------------------------------------------
// 7. Nothing here may tell a customer a piece is being made before it is.
// ---------------------------------------------------------------------------
ok("no route message claims the piece is being made", !/being made|in production|started making/i.test(code(route)));
const templates = readFileSync("src/lib/email/templates.ts", "utf8");
const customerEmail = templates.slice(
  templates.indexOf("export function boutiqueOrderCustomerEmail"),
  templates.indexOf("export function boutiqueOrderTeamEmail"),
);
ok("the customer email exists", customerEmail.length > 0);
ok(
  "the customer email promises the spelling is confirmed first",
  /confirm the spelling with you before anything is engraved/i.test(customerEmail),
);
ok("the customer email does not call it a deposit", !/deposit/i.test(code(customerEmail)));
ok("the customer email carries the signs", /glyphs|Signs/.test(customerEmail));

// ---------------------------------------------------------------------------
// 8. The gate. A buy button on a piece with no price would be a promise the
//    business has not made, so the decision is the SERVER's and it is made
//    from the same function that refuses to quote one.
// ---------------------------------------------------------------------------
const page = readFileSync("src/app/[locale]/(site)/boutique/[category]/page.tsx", "utf8");
const studio = readFileSync("src/components/CartoucheNameStudio.tsx", "utf8");
const panel = readFileSync("src/components/CartoucheOrderPanel.tsx", "utf8");

ok("the page gates on the shared predicate", /\.filter\(\(p\) => isInstantlyOrderable\(p\)\)/.test(page));
ok("the price passed to the UI comes from the shared function", /unitCents: unitPriceCents\(p\) \?\? 0/.test(page));
ok("the panel renders only when something is orderable", /orderable\.length > 0 && \(/.test(studio));
ok("the enquiry is offered whether or not anything is orderable", /Ask about customisation|Use this name in my enquiry/.test(studio));
ok("the panel offers the enquiry as the way out", /onAskInstead/.test(panel) && /Ask about customisation instead/.test(panel));

// The panel must not be able to invent its own price or bypass the name rules.
ok("the panel posts no price", !/totalCents:|unitCents:|amount/.test(code(panel.slice(panel.indexOf("body: JSON.stringify"), panel.indexOf("});", panel.indexOf("body: JSON.stringify"))))));
ok("the pay button is disabled until the name fits", /disabled=\{busy \|\| !nameOk\}/.test(panel));
ok("a name that overflows the cartouche blocks the sale", /spelling\.fits/.test(panel));
ok("an unwritable character blocks the sale", /spelling\.unsupported\.length === 0/.test(panel));

// PayPal reporting "pending" is not money in the account.
ok("pending has its own wording", /result\.pending/.test(panel) && /has not credited it/.test(panel));
// Scoped to the handler, not the file: a type union listing both states is
// not the same thing as the code that chooses between them.
const onSettled = panel.slice(panel.indexOf("onSettled={"), panel.indexOf("onDeadEnd={"));
ok("the settle handler branches on pending", /result\.pending/.test(onSettled));
ok(
  "pending is chosen BEFORE paid, so an uncredited payment is never called paid",
  onSettled.indexOf('at: "pending"') < onSettled.indexOf('at: "paid"'),
);

// It reuses the one payment rail rather than opening a second one.
ok("the panel reuses the existing PayPal buttons", /PayPalDepositButtons/.test(panel));
const attempts = readFileSync("src/lib/booking/attempts.ts", "utf8");
ok("there is one createAttempt, taking either parent", /parent: AttemptParent/.test(attempts));
ok("an attempt writes exactly one parent column", /reservation_id: input\.parent\.kind === "reservation"/.test(attempts));
ok("settling reads whichever parent the row has", /PARENT_TABLE\[parent\.kind\]/.test(attempts));

// ---------------------------------------------------------------------------
// 9. Symbols. A customer may add an ankh, lotus, scarab or eye, and the
//    workshop counts each as one of the four — so one on a four-sign name
//    makes five, and five does not sell.
// ---------------------------------------------------------------------------
const withAnkh = quoteCartouche({ ...base, name: "Ali", symbols: ["ankh"], product: priced() });
ok("a symbol can be added", withAnkh.ok);
if (withAnkh.ok) {
  ok("the symbol is counted", withAnkh.quote.signCount === 4);
  ok("the symbol is recorded for the workshop", withAnkh.quote.symbols.join() === "ankh");
  ok("the symbol is in the sign codes", withAnkh.quote.signCodes.includes("S34"));
  ok("the symbol comes after the name", withAnkh.quote.signCodes.at(-1) === "S34");
}
ok(
  "a symbol that pushes a name over four is refused",
  quoteCartouche({ ...base, name: "Omar", symbols: ["ankh"], product: priced() }).ok === false,
);
const over4 = quoteCartouche({ ...base, name: "Omar", symbols: ["ankh"], product: priced() });
ok("and it says the cartouche is full", !over4.ok && over4.reason === "over-capacity");

// A request cannot smuggle in a sign that is not on the card.
const fake = quoteCartouche({ ...base, name: "Ali", symbols: ["dragon", "\u{13000}"], product: priced() });
ok("an unknown symbol key is dropped, not drawn", fake.ok && fake.quote.symbols.length === 0);
ok("and the sign count is unchanged by it", fake.ok && fake.quote.signCount === 3);
ok(
  "a repeated symbol is counted once",
  (() => {
    const r = quoteCartouche({ ...base, name: "Ali", symbols: ["ankh", "ankh"], product: priced() });
    return r.ok && r.quote.signCount === 4;
  })(),
);

// Keys travel, never glyphs — so there is nothing to smuggle.
const panelBody = code(panel.slice(panel.indexOf("body: JSON.stringify"), panel.indexOf("});", panel.indexOf("body: JSON.stringify"))));
ok("the panel sends symbol keys", /symbols,/.test(panelBody));
ok("the panel sends no glyphs", !/glyph/i.test(panelBody));
ok("the route caps how many it will read", /body\.symbols\.slice\(0, 8\)/.test(route));
ok("the stored symbols come from the quote", /symbols: quote\.symbols/.test(route));

if (errors.length > 0) {
  console.error(`\ncheck-boutique: ${errors.length} failure(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

console.log(
  "check-boutique: ok — the browser cannot name a price or a sign, a piece with no price refuses to sell rather than " +
    "inventing a figure, every cartouche is still on request, the money is integer cents with one authority, and the " +
    "order row exists before PayPal is asked for anything.",
);
