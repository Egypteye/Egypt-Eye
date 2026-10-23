import type { ScentFamily, TreasureProduct } from "@/content/types";

// How the Boutique sorts fragrance.
//
// Pure, and free of `server-only`, so the check scripts can prove the two
// claims that matter: every product the filter offers can actually be reached,
// and a facet with no data behind it is never shown. A filter that returns an
// empty shelf is worse than no filter, and a product-type filter built on
// guesses would be worse still — see docs/oils-research.md.

export const SCENT_FAMILIES: { key: ScentFamily; label: string; blurb: string }[] = [
  { key: "floral", label: "Floral & Romantic", blurb: "Rose, jasmine, lotus, gardenia." },
  { key: "fresh", label: "Fresh, Green & Citrus", blurb: "Citrus, mint, lemongrass, neroli." },
  { key: "woody", label: "Woody, Resinous & Earthy", blurb: "Sandalwood, frankincense, papyrus." },
  { key: "amber", label: "Amber, Musk & Warm", blurb: "Amber and the musks." },
  { key: "signature", label: "Signature Egyptian Blends", blurb: "House blends, named rather than described." },
];

const KEYS = new Set<string>(SCENT_FAMILIES.map((f) => f.key));

export function isScentFamily(value: unknown): value is ScentFamily {
  return typeof value === "string" && KEYS.has(value);
}

export function familyLabel(key: ScentFamily): string {
  return SCENT_FAMILIES.find((f) => f.key === key)?.label ?? key;
}

/** The families that at least one of these products actually belongs to. */
export function availableFamilies(products: readonly TreasureProduct[]): ScentFamily[] {
  const present = new Set<ScentFamily>();
  for (const p of products) for (const f of p.scentFamily ?? []) if (isScentFamily(f)) present.add(f);
  return SCENT_FAMILIES.map((f) => f.key).filter((k) => present.has(k));
}

/** How many products each family holds, for the count beside its name. */
export function familyCounts(products: readonly TreasureProduct[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of products) {
    for (const f of p.scentFamily ?? []) {
      if (isScentFamily(f)) counts[f] = (counts[f] ?? 0) + 1;
    }
  }
  return counts;
}

/**
 * Products matching the chosen families.
 *
 * No selection means everything, which is the honest answer to "show me the
 * collection" — not an empty shelf. A product in two families is returned once
 * for either, because it is one product and there is one record of it.
 */
export function filterByFamily(
  products: readonly TreasureProduct[],
  chosen: readonly ScentFamily[]
): TreasureProduct[] {
  if (chosen.length === 0) return [...products];
  return products.filter((p) => (p.scentFamily ?? []).some((f) => chosen.includes(f as ScentFamily)));
}

/**
 * Whether the collection knows enough about composition to filter on it.
 *
 * The brief is explicit and so is the research: a bottle labelled Sandalwood
 * is not therefore a pure essential oil. Until a supplier confirms what each
 * liquid is, this is false and the product-type filter does not render.
 */
export function canFilterByProductType(products: readonly TreasureProduct[]): boolean {
  const typed = products.filter((p) => p.productType).length;
  // Every product, or none: a half-known facet silently hides the rest.
  return typed > 0 && typed === products.length;
}
