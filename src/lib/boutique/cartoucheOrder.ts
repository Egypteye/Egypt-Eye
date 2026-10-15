import type { Price, TreasureStatus } from "@/content/types";
import { usdToCents } from "@/lib/booking/quote";
import { CARTOUCHE_CAPACITY, describeSpelling, glyphString, spellName } from "@/lib/hieroglyphs/signs";

// What a cartouche order IS, worked out once.
//
// Pure and free of `server-only` on purpose, the same way paypalBody.ts and
// quote.ts are: the route that uses this cannot be reached by the check
// scripts, and "the browser cannot set its own price" is exactly the kind of
// claim that has to be provable offline rather than asserted in a comment.
//
// Three rules this file exists to hold:
//
// 1. THE BROWSER NEVER SENDS A PRICE. It sends a product slug, a name and a
//    quantity. The price comes from the product the SERVER looked up. There
//    is no field on the input for an amount, so a tampered request has
//    nothing to tamper with.
//
// 2. THE SPELLING IS DERIVED, NEVER RECEIVED. The signs that go in the
//    cartouche are computed here from the submitted name, so the preview a
//    customer saw and the instruction the workshop gets come from the same
//    function and cannot drift apart.
//
// 3. NO PRICE MEANS NO SALE. Every cartouche in the Boutique is currently
//    "on request" with no price set, which is the honest state of a
//    commissioned piece. This refuses to quote one rather than inventing a
//    figure, and the UI shows the enquiry form instead of a buy button. The
//    moment a real price is entered in the CMS, the button appears.

/** The least this module needs to know about a product. */
export type OrderableProduct = {
  slug: string;
  name: string;
  status: TreasureStatus;
  price?: Price;
};

/**
 * How the customer receives the piece.
 *
 * One value today. Egypt Eye hands cartouches over in Egypt — during the
 * trip or at the hotel — so there is no courier, no shipping line and no
 * address to collect. It is a named union rather than an assumption so that
 * adding posted delivery later is a case here and a column there, not a
 * rewrite.
 */
export type Fulfilment = "collect-in-egypt";

export const FULFILMENT_LABEL: Record<Fulfilment, string> = {
  "collect-in-egypt": "Collected in Egypt",
};

/** The maximum anyone can buy in one go, so a typo cannot bill for 400. */
export const MAX_QUANTITY = 10;

export type QuoteInput = {
  product: OrderableProduct;
  /** Exactly as the customer typed it. */
  name: string;
  quantity: number;
  fulfilment: Fulfilment;
  capacity?: number;
};

/**
 * The agreed figures, snapshotted.
 *
 * Written to the attempt as jsonb and never recomputed afterwards. If the
 * price changes next month this still says what was agreed and why, which is
 * the only thing that answers a dispute six months later.
 */
export type CartoucheQuote = {
  productSlug: string;
  productName: string;
  /** The name as it will be engraved, trimmed but otherwise untouched. */
  engravedName: string;
  /** Gardiner codes, in order — what the workshop actually needs. */
  signCodes: string[];
  /** The signs themselves, for the email and the record. */
  glyphs: string;
  signCount: number;
  capacity: number;
  /** One plain line for the workshop. */
  spellingLine: string;
  unitCents: number;
  quantity: number;
  fulfilment: Fulfilment;
  /** Zero today — collection in Egypt costs nothing to deliver. */
  fulfilmentCents: number;
  totalCents: number;
  currency: "USD";
};

export type QuoteRefusal =
  | "not-orderable"
  | "no-price"
  | "name-empty"
  | "name-unwritable"
  | "over-capacity"
  | "bad-quantity"
  | "unsupported-fulfilment";

export type QuoteResult =
  | { ok: true; quote: CartoucheQuote }
  | { ok: false; reason: QuoteRefusal; message: string };

/** What a customer is told. Each one is a thing they can act on. */
const REFUSAL_MESSAGE: Record<QuoteRefusal, string> = {
  "not-orderable": "This piece is not available to buy online right now. Please send us an enquiry.",
  "no-price": "This piece does not have an online price yet. Please send us an enquiry and we will quote it.",
  "name-empty": "Please enter the name you would like written.",
  "name-unwritable": "Some characters in that name have no hieroglyphic sign. Please adjust it, or send us an enquiry.",
  "over-capacity": "That name needs more signs than one cartouche holds. Please shorten it, or send us an enquiry.",
  "bad-quantity": `Please choose between 1 and ${MAX_QUANTITY}.`,
  "unsupported-fulfilment": "That delivery option is not available.",
};

/** Only these statuses may take money. Sold out and hidden never can. */
export function sellsOnline(status: TreasureStatus): boolean {
  return status === "available" || status === "preorder";
}

/**
 * The price of one piece in whole cents, or null when there is not one.
 *
 * `onRequest` is not a missing price to paper over — it is the honest state
 * of a piece whose cost depends on a conversation, and it must not resolve
 * to a number. Neither may a price of zero: a free cartouche is a
 * configuration mistake, not an offer.
 */
export function unitPriceCents(product: OrderableProduct): number | null {
  if (!sellsOnline(product.status)) return null;
  const cents = usdToCents(product.price?.amount);
  if (cents === null || cents <= 0) return null;
  return cents;
}

/** True when the page should show a buy button rather than only the form. */
export function isInstantlyOrderable(product: OrderableProduct): boolean {
  return unitPriceCents(product) !== null;
}

/**
 * Quote an order, or say exactly why not.
 *
 * Every refusal is recoverable by the customer, and every one of them leaves
 * the enquiry form as the way through — which is why none of these is an
 * error page.
 */
export function quoteCartouche(input: QuoteInput): QuoteResult {
  const refuse = (reason: QuoteRefusal): QuoteResult => ({
    ok: false,
    reason,
    message: REFUSAL_MESSAGE[reason],
  });

  if (input.fulfilment !== "collect-in-egypt") return refuse("unsupported-fulfilment");
  if (!sellsOnline(input.product.status)) return refuse("not-orderable");

  const unitCents = unitPriceCents(input.product);
  if (unitCents === null) return refuse("no-price");

  const quantity = Number(input.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    return refuse("bad-quantity");
  }

  const engravedName = input.name.trim();
  if (!engravedName) return refuse("name-empty");

  const capacity = input.capacity ?? CARTOUCHE_CAPACITY;
  const spelling = spellName(engravedName, capacity);
  if (!spelling.hasContent) return refuse("name-unwritable");
  // A name that would lose a character is never quietly engraved without it.
  if (spelling.unsupported.length > 0) return refuse("name-unwritable");
  if (spelling.signCount > spelling.capacity) return refuse("over-capacity");

  // The only arithmetic, and it is integer throughout. One rounding happened
  // in usdToCents; nothing here reintroduces a float.
  const fulfilmentCents = 0;
  const totalCents = unitCents * quantity + fulfilmentCents;

  return {
    ok: true,
    quote: {
      productSlug: input.product.slug,
      productName: input.product.name,
      engravedName,
      signCodes: spelling.signs.map((s) => s.gardiner),
      glyphs: glyphString(spelling),
      signCount: spelling.signCount,
      capacity: spelling.capacity,
      spellingLine: describeSpelling(engravedName, spelling),
      unitCents,
      quantity,
      fulfilment: input.fulfilment,
      fulfilmentCents,
      totalCents,
      currency: "USD",
    },
  };
}

/**
 * What PayPal shows the buyer.
 *
 * PayPal truncates a description at 127 characters, so the name — the one
 * part that identifies the order to its buyer — goes first.
 */
export function payPalDescription(quote: CartoucheQuote): string {
  const many = quote.quantity > 1 ? ` ×${quote.quantity}` : "";
  return `${quote.engravedName} — ${quote.productName}${many}`.slice(0, 127);
}
