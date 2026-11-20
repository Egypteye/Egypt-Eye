/**
 * The Egypt Eye Creator Club programme, as configuration.
 *
 * Tiers, what each one is offered, and the rules around redemption. Pure and
 * free of `server-only`, like ./scoring, so the public page, the application
 * route and the admin screens all read one definition and cannot drift apart.
 *
 * TWO THINGS THIS FILE REFUSES TO DO, both for the same reason — a benefit is
 * a commercial promise on a live site, and a promise the business has not
 * made is worse than no page at all:
 *
 *   1. It never names a product that does not exist. Every benefit lists the
 *      real slugs it is redeemed against, and scripts/check-creator-program.mts
 *      resolves each one against the actual catalogue. A benefit whose product
 *      has not been built yet is marked `pending` and is not offerable.
 *
 *   2. It never invents a number the business has not approved. Deliverable
 *      quantities are `null` — the owner approved "increase them" on 19 Nov
 *      2026 but not the figures — and a null reads as "not yet set" everywhere
 *      rather than as zero.
 *
 * Decisions recorded here were made by the owner on 19 November 2026. Where
 * one is still open the code says so rather than guessing.
 */

import { TIER_THRESHOLDS, type Tier } from "./scoring";

export type BenefitKind =
  /** Free to the creator, once, within the tier's validity. */
  | "complimentary"
  /** A percentage off the standard public retail price. */
  | "discount"
  /**
   * Granted case by case by Egypt Eye, with no published retail value.
   * Airport pickup is the only one: /transfers takes bookings but there is no
   * priced transfer product, so there is no figure to discount or account for.
   */
  | "discretionary";

export type Benefit = {
  id: string;
  kind: BenefitKind;
  /** How the benefit reads to a creator. Never names a product we do not sell. */
  label: string;
  /**
   * The catalogue slugs this is redeemed against. Checked against the real
   * catalogue — an unknown slug fails the build, not a creator's trip.
   */
  productSlugs: string[];
  /** Only on `discount`. Applied to the standard public retail price. */
  discountPercent?: number;
  /**
   * Set when the product does not exist yet, naming what is missing. A
   * pending benefit is never shown to a creator and never approved.
   */
  pending?: string;
};

/**
 * Four combined day tours and one White Desert experience the owner asked for
 * on 19 Nov 2026 (decisions 1 and 4). They are not in the catalogue yet
 * because every one of the 79 existing tours carries a numeric price and
 * none has ever used the "contact for pricing" form — so publishing these
 * without a price would put unsellable products in the listing, and the
 * prices have not been supplied. Listed here so the programme knows they are
 * coming and the check can prove they are still absent rather than silently
 * dropped.
 */
export const PENDING_PRODUCTS = {
  pyramidsMuseum: "Pyramids + Museum Tour — needs a price before it can be published",
  pyramidsKhanElKhalili: "Pyramids + Khan el Khalili Tour — needs a price",
  pyramidsMuseumFayoum: "Pyramids + Museum + Fayoum Tour — needs a price",
  pyramidsMuseumAlexandria: "Pyramids + Museum + Alexandria Tour — needs a price",
  whiteDesertFlyingDress:
    "White Desert + Flying Dresses experience — needs a price, and operational coordination with Flying Dresses Egypt",
} as const;

/**
 * Deliverables per tier.
 *
 * `null` on purpose. On 19 Nov 2026 the owner approved increasing the
 * proposed quantities but explicitly did not approve the figures, so there
 * is no honest number to put here. Everything that renders deliverables must
 * treat null as "set during the campaign brief", never as zero.
 */
export type DeliverableMatrix = {
  reels: number;
  stories: number;
  editedPhotos: number;
};

export type TierConfig = {
  tier: Tier;
  minScore: number;
  /** The creator picks ONE of these, and Egypt Eye approves it. */
  complimentary: Benefit[];
  /** Everything else they become eligible for. */
  discounts: Benefit[];
  /**
   * Granted case by case, on top of the package. Not an alternative to the
   * complimentary choice — airport pickup is an extra, not something a
   * creator picks instead of their tour.
   */
  extras: Benefit[];
  /** Only Elite earns commission (decision 6). Null everywhere else. */
  commissionPercent: number | null;
  deliverables: DeliverableMatrix | null;
};

// ---------------------------------------------------------------------------
// Benefits, each pointing at a real catalogue slug.

const pyramidsPhotoshoot: Benefit = {
  id: "pyramids-photoshoot",
  kind: "complimentary",
  label: "Pyramids photoshoot",
  productSlugs: ["exclusive-pyramids-photoshoot"],
};

const pyramidsTour: Benefit = {
  id: "pyramids-tour",
  kind: "complimentary",
  label: "Pyramids tour",
  productSlugs: ["1-day-giza-tour"],
};

const rooftopFlyingDressDiscount: Benefit = {
  id: "rooftop-flying-dress-50",
  kind: "discount",
  label: "50% off the rooftop Flying Dress photoshoot",
  productSlugs: ["pyramids-rooftop-flying-dress-photoshoot"],
  discountPercent: 50,
};

const fayoumFlyingDressDiscount: Benefit = {
  id: "fayoum-flying-dress-35",
  kind: "discount",
  label: "35% off the Fayoum Flying Dress photoshoot",
  productSlugs: ["fayoum-flying-dress-photoshoot"],
  discountPercent: 35,
};

/**
 * Decision 2. The programme originally asked for "free motorcycles at the
 * Pyramids". No such product exists, and the nearest thing is quad bikes in
 * the Sahara — a different vehicle in a different place. The owner chose to
 * substitute the real experience, so the label says what it actually is.
 */
const quadBikes: Benefit = {
  id: "sahara-quad-bikes",
  kind: "complimentary",
  label: "Sahara ATV and quad bike experience",
  productSlugs: ["atv-quad-bikes-sahara"],
};

const horsePhotography: Benefit = {
  id: "horse-photography",
  kind: "complimentary",
  label: "Horse photography session",
  productSlugs: ["jumping-horse-photoshoot", "running-horse-video-jumping-horse-photoshoot"],
};

/**
 * Decision 3. Granted case by case, with no published retail value, because
 * there is no priced transfer product to discount against.
 */
const airportPickup: Benefit = {
  id: "airport-pickup",
  kind: "discretionary",
  label: "Airport pickup, where approved",
  productSlugs: [],
};

const pyramidsMuseum: Benefit = {
  id: "pyramids-museum",
  kind: "complimentary",
  label: "Pyramids + Museum tour",
  productSlugs: [],
  pending: PENDING_PRODUCTS.pyramidsMuseum,
};

const pyramidsKhan: Benefit = {
  id: "pyramids-khan-el-khalili",
  kind: "complimentary",
  label: "Pyramids + Khan el Khalili tour",
  productSlugs: [],
  pending: PENDING_PRODUCTS.pyramidsKhanElKhalili,
};

const pyramidsMuseumFayoum: Benefit = {
  id: "pyramids-museum-fayoum",
  kind: "complimentary",
  label: "Pyramids + Museum + Fayoum tour",
  productSlugs: [],
  pending: PENDING_PRODUCTS.pyramidsMuseumFayoum,
};

const pyramidsMuseumAlexandria: Benefit = {
  id: "pyramids-museum-alexandria",
  kind: "complimentary",
  label: "Pyramids + Museum + Alexandria tour",
  productSlugs: [],
  pending: PENDING_PRODUCTS.pyramidsMuseumAlexandria,
};

const whiteDesertFlyingDress: Benefit = {
  id: "white-desert-flying-dress",
  kind: "discount",
  label: "20% off the White Desert Flying Dress experience",
  productSlugs: [],
  discountPercent: 20,
  pending: PENDING_PRODUCTS.whiteDesertFlyingDress,
};

// ---------------------------------------------------------------------------

export const PROGRAM: TierConfig[] = [
  {
    tier: "Explorer",
    minScore: 0,
    complimentary: [],
    discounts: [rooftopFlyingDressDiscount],
    extras: [],
    commissionPercent: null,
    deliverables: null,
  },
  {
    tier: "Rising Creator",
    minScore: 40,
    complimentary: [pyramidsPhotoshoot, pyramidsTour],
    discounts: [rooftopFlyingDressDiscount],
    extras: [],
    commissionPercent: null,
    deliverables: null,
  },
  {
    tier: "Established Creator",
    minScore: 55,
    complimentary: [pyramidsMuseum, pyramidsKhan],
    discounts: [rooftopFlyingDressDiscount, fayoumFlyingDressDiscount],
    extras: [],
    commissionPercent: null,
    deliverables: null,
  },
  {
    tier: "Premium Creator",
    minScore: 70,
    complimentary: [pyramidsMuseumFayoum, pyramidsMuseumAlexandria],
    discounts: [rooftopFlyingDressDiscount, fayoumFlyingDressDiscount, whiteDesertFlyingDress],
    extras: [airportPickup],
    commissionPercent: null,
    deliverables: null,
  },
  {
    tier: "Elite Creator",
    minScore: 85,
    complimentary: [pyramidsMuseumFayoum, pyramidsMuseumAlexandria, quadBikes, horsePhotography],
    discounts: [rooftopFlyingDressDiscount, fayoumFlyingDressDiscount, whiteDesertFlyingDress],
    extras: [airportPickup],
    /** Decision 6: 10% of eligible net booking value, Elite only. */
    commissionPercent: 10,
    deliverables: null,
  },
];

/** Rules that apply to every tier, confirmed by the owner. */
export const PACKAGE_RULES = {
  /** Months a tier and its package stay valid. */
  validityMonths: 6,
  /** Complimentary packages cover the creator alone — never a companion. */
  creatorOnly: true,
  /** One package per validity period. */
  redemptionsPerPeriod: 1,
  /** Every booking needs Egypt Eye's approval before it is confirmed. */
  bookingApprovalRequired: true,
  /** No exclusivity is asked of the creator. */
  exclusivity: false,
  /** Discounts are calculated against the standard public retail price. */
  discountBasis: "standard public retail price",
  /** No refundable deposit; protection comes from progressive release. */
  securityDeposit: false,
  /** Share of deliverables due before leaving Egypt. */
  beforeDeparturePercent: 70,
  /** Share of the main Reels/TikToks that must be published before departure. */
  mainVideosBeforeDeparturePercent: 50,
  /** Commission is payable only after this cancellation window has passed. */
  commissionCancellationDays: 30,
} as const;

export function tierConfig(tier: Tier): TierConfig {
  const found = PROGRAM.find((t) => t.tier === tier);
  if (!found) throw new Error(`No configuration for tier ${tier}`);
  return found;
}

/** Benefits a tier can actually be offered today — pending ones are excluded. */
export function offerableBenefits(tier: Tier): {
  complimentary: Benefit[];
  discounts: Benefit[];
  extras: Benefit[];
} {
  const config = tierConfig(tier);
  return {
    complimentary: config.complimentary.filter((b) => !b.pending),
    discounts: config.discounts.filter((b) => !b.pending),
    extras: config.extras.filter((b) => !b.pending),
  };
}

/** Every benefit mentioned anywhere in the programme, de-duplicated. */
export function allBenefits(): Benefit[] {
  const seen = new Map<string, Benefit>();
  for (const t of PROGRAM) {
    for (const b of [...t.complimentary, ...t.discounts, ...t.extras]) {
      if (!seen.has(b.id)) seen.set(b.id, b);
    }
  }
  return [...seen.values()];
}

/** Tier thresholds, read from the scoring module so the two cannot disagree. */
export function scoringThresholdFor(tier: Tier): number {
  const t = TIER_THRESHOLDS.find((x) => x.tier === tier);
  if (!t) throw new Error(`No scoring threshold for tier ${tier}`);
  return t.min;
}
