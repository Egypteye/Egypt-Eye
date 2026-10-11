// What a customer will wear: the Flying Dress collection and the men's
// outfits beside it.
//
// This module is deliberately shaped like lib/booking/extras.ts, because it
// obeys the same rule for the same reason: the request carries WHICH outfit
// was chosen, never anything about it. The names, photographs and
// availability are read from the product on the server and the chosen ids are
// matched against them. A request naming an outfit that was retired last week,
// or one that never existed, selects nothing.
//
// ONE DIFFERENCE FROM EXTRAS, AND IT IS THE IMPORTANT ONE: an Outfit has no
// price field. Not "price optional" — no field at all. Every outfit in the
// collection is included in the experience price, and if that ever stops being
// true the option belongs in `extras`, which is already the authoritative
// priced path with a quote, a server-side total and a line in both emails.
// Leaving the field out means there is nowhere for an invented fee to live:
// outfit selection cannot move the price, structurally, rather than by
// promise. scripts/check-booking.mts asserts it.

import type { SanityImage } from "@/content/types";

export type OutfitCategory = "womens-dress" | "mens-outfit";

export type Outfit = {
  /**
   * Stable identifier, not the display name.
   *
   * A booking stores the id AND the name it was shown under. The id is what
   * matching is done on, so renaming "BronZey" to "Bronze" in the CMS does not
   * orphan a selection; the stored name is what an old booking is read back
   * with, so a rename does not quietly rewrite history either.
   */
  id: string;
  name: string;
  category: OutfitCategory;
  /**
   * A colour, used for the swatch until a photograph exists.
   *
   * This is a fallback, not the design. A customer choosing a dress wants to
   * see the dress. The hex keeps the picker usable and honest on the day the
   * business adds a colour before it has shot it, and the UI labels such an
   * option as having no photo yet rather than pretending the circle is the
   * garment.
   */
  hex?: string;
  image?: SanityImage;
  /** Short factual note — "long train", "lined". Never a promise. */
  note?: string;
  /**
   * Retired options stay in the data and disappear from the pickers, so a
   * booking taken last month still reads back with the name the customer
   * actually chose. Absent means active.
   */
  active?: boolean;
};

/** What a booking records: the choice, with the name as shown at the time. */
export type OutfitChoice = {
  id: string;
  name: string;
  category: OutfitCategory;
  quantity: number;
};

const MAX_NAME = 80;
const MAX_ID = 60;
const MAX_NOTE = 160;

/** The most of any single outfit one booking can ask for. */
export const MAX_OUTFIT_QUANTITY = 12;

/**
 * A product's outfits, cleaned.
 *
 * Drops anything without an id, a name and a known category — an entry the
 * picker cannot render or the server cannot match is worse than absent,
 * because it looks like a choice and then does not survive the booking.
 */
export function normaliseOutfits(value: unknown): Outfit[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const out: Outfit[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const row = entry as Record<string, unknown>;

    const rawId = typeof row.id === "string" ? row.id.trim().slice(0, MAX_ID) : "";
    const rawName = typeof row.name === "string" ? row.name.trim().slice(0, MAX_NAME) : "";
    const category = row.category;
    if (rawId === "" || rawName === "") continue;
    if (category !== "womens-dress" && category !== "mens-outfit") continue;

    // Ids collide across categories as easily as within them, so the key is
    // the id alone: two outfits a request cannot tell apart must not both be
    // selectable.
    const key = rawId.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const hex = typeof row.hex === "string" && /^#[0-9a-f]{6}$/i.test(row.hex.trim()) ? row.hex.trim() : undefined;
    const note = typeof row.note === "string" && row.note.trim() !== "" ? row.note.trim().slice(0, MAX_NOTE) : undefined;

    out.push({
      id: rawId,
      name: rawName,
      category,
      ...(hex ? { hex } : {}),
      ...(note ? { note } : {}),
      ...(row.image ? { image: row.image as SanityImage } : {}),
      ...(row.active === false ? { active: false } : {}),
    });
  }
  return out;
}

/** The ones a customer may actually pick right now. */
export function selectableOutfits(outfits: readonly Outfit[]): Outfit[] {
  return outfits.filter((o) => o.active !== false);
}

export function womensDresses(outfits: readonly Outfit[]): Outfit[] {
  return selectableOutfits(outfits).filter((o) => o.category === "womens-dress");
}

export function mensOutfits(outfits: readonly Outfit[]): Outfit[] {
  return selectableOutfits(outfits).filter((o) => o.category === "mens-outfit");
}

/**
 * How many outfits this booking may choose in total.
 *
 * The headcount, plus one for each extra dress bought.
 *
 * The headcount part is the real rule: the experience price is per person and
 * includes an outfit for each, so a booking for three may dress three. It is a
 * ceiling rather than a quota — a group of three with one man and no men's
 * outfits loaded yet picks two dresses and books fine.
 *
 * The extra-dress part is a convenience for the one product that sells a
 * second look ("Extra Dress", $99 on the rooftop shoot). It is matched on the
 * label because that is all an extra has, which makes it fragile to a CMS
 * rename — so it is written to fail safe: an unrecognised label simply leaves
 * the allowance at the headcount, which is never harmful, only conservative.
 * Nobody is blocked from booking by this; at worst they mention the second
 * colour in their notes and the desk sorts it out.
 */
export function outfitAllowance(people: number, extras?: readonly { label: string; quantity?: number }[]): number {
  const base = Math.max(1, Math.floor(people) || 1);
  if (!Array.isArray(extras)) return base;
  const extraDresses = extras.reduce((sum, extra) => {
    if (typeof extra?.label !== "string") return sum;
    const label = extra.label.toLowerCase();
    // "Extra Dress", "Extra dress ×2", "Additional dress" — but not
    // "Dress steaming" or anything else that merely mentions the word.
    const isExtraDress = /\b(extra|additional|second|2nd)\b/.test(label) && /\bdress(es)?\b/.test(label);
    if (!isExtraDress) return sum;
    const qty = typeof extra.quantity === "number" && extra.quantity > 0 ? Math.floor(extra.quantity) : 1;
    return sum + qty;
  }, 0);
  return base + extraDresses;
}

/**
 * The outfits a customer actually chose, resolved against the product.
 *
 * Unknown, retired and malformed selections are dropped silently, exactly as
 * extras are, and for the same reason: a page cached before a colour was
 * retired should still produce a booking rather than an error a customer can
 * do nothing about. The desk sees what was recorded; nobody is told their
 * booking failed because of a swatch.
 *
 * The allowance is enforced HERE and not only in the browser, because the
 * browser's copy is a convenience. Quantities are trimmed in the order given
 * until the allowance is reached, so a request asking for nine dresses on a
 * booking for two records two.
 */
export function selectOutfits(
  available: readonly Outfit[],
  chosen: unknown,
  allowance: number,
): OutfitChoice[] {
  if (!Array.isArray(chosen)) return [];
  const byId = new Map(selectableOutfits(available).map((o) => [o.id.toLowerCase(), o]));
  const picked = new Map<string, OutfitChoice>();

  for (const entry of chosen) {
    if (!entry || typeof entry !== "object") continue;
    const row = entry as Record<string, unknown>;
    const id = typeof row.id === "string" ? row.id.trim().toLowerCase() : "";
    if (id === "") continue;
    const match = byId.get(id);
    if (!match) continue;

    const rawQty = row.quantity;
    const qty =
      typeof rawQty === "number" && Number.isFinite(rawQty)
        ? Math.min(MAX_OUTFIT_QUANTITY, Math.max(1, Math.floor(rawQty)))
        : 1;

    // Same outfit twice in one request is one line, quantities added.
    const existing = picked.get(match.id);
    picked.set(match.id, {
      id: match.id,
      // The name is taken from the PRODUCT, never from the request. A request
      // supplying its own name could otherwise write "Cherry (free upgrade)"
      // onto a booking and into an email the business is then held to.
      name: match.name,
      category: match.category,
      quantity: Math.min(MAX_OUTFIT_QUANTITY, (existing?.quantity ?? 0) + qty),
    });
  }

  // Trim to the allowance, in the order chosen.
  const cap = Math.max(1, Math.floor(allowance) || 1);
  const out: OutfitChoice[] = [];
  let used = 0;
  for (const choice of picked.values()) {
    if (used >= cap) break;
    const room = cap - used;
    const quantity = Math.min(choice.quantity, room);
    out.push({ ...choice, quantity });
    used += quantity;
  }
  return out;
}

export function totalOutfitsChosen(choices: readonly OutfitChoice[]): number {
  return choices.reduce((sum, c) => sum + c.quantity, 0);
}

/** "Cherry × 2, Emerald" — one line for an email or an admin list. */
export function describeOutfits(choices: readonly OutfitChoice[]): string {
  return choices.map((c) => (c.quantity > 1 ? `${c.name} × ${c.quantity}` : c.name)).join(", ");
}

/**
 * What the customer is told about outfit selection, in one sentence used
 * everywhere it appears.
 *
 * It says "included" because every outfit is, and it says the choice is a
 * preference rather than a reservation because the business cannot promise a
 * specific dress is clean, unbooked and on the roof at 7am on a date three
 * weeks away. Promising it here and failing on the day is worse than saying
 * so now, and nothing in this codebase tracks dress stock.
 */
export const OUTFIT_INCLUDED_NOTE =
  "Every outfit in the collection is included in the price — choosing one does not change what you pay.";

export const OUTFIT_PREFERENCE_NOTE =
  "We note your choice and have it ready for you. If anything is unavailable on the day we will contact you before your shoot.";
