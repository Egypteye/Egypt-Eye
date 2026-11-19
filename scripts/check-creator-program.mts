/**
 * Guards the Creator Club programme configuration.
 *
 * A benefit is a commercial promise on a live site. Four ways this file can
 * start promising something Egypt Eye cannot deliver, none of which errors:
 *
 *   1. A BENEFIT NAMES A PRODUCT THAT DOES NOT EXIST. A creator is approved
 *      for a "Pyramids + Museum tour", arrives, and there is no such tour to
 *      book. Every slug is resolved against the real catalogue here.
 *
 *   2. A PENDING PRODUCT QUIETLY BECOMES OFFERABLE. Four combined tours and
 *      the White Desert experience were approved on 19 Nov 2026 but have no
 *      price, so they cannot be published. If someone clears the `pending`
 *      marker without building the product, the programme starts offering
 *      it.
 *
 *   3. DELIVERABLE QUANTITIES GET INVENTED. The owner approved increasing
 *      them and explicitly did not approve figures. A number here would be
 *      fabricated, and would end up in a campaign brief a creator signs.
 *
 *   4. COMMISSION LEAKS BEYOND ELITE. Decision 6 gives 10% to Elite alone.
 *      A commission on a lower tier is money out of the door on every
 *      referred booking.
 *
 * The catalogue is read from the content files directly rather than through
 * a fetcher, so this stays offline and provable.
 */
import { readFileSync } from "node:fs";
import {
  PROGRAM,
  PACKAGE_RULES,
  allBenefits,
  offerableBenefits,
  tierConfig,
  scoringThresholdFor,
  PENDING_PRODUCTS,
} from "../src/lib/creatorClub/program";
import { TIER_THRESHOLDS } from "../src/lib/creatorClub/scoring";

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

// --- the real catalogue ----------------------------------------------------
const catalogue = new Set<string>();
for (const file of [
  "src/content/tours.ts",
  "src/content/photoshoots.ts",
  "src/content/experiences.ts",
]) {
  const src = readFileSync(file, "utf8");
  for (const m of src.matchAll(/slug:\s*"([^"]+)"/g)) catalogue.add(m[1]);
}
ok("the catalogue failed to load — nothing can be validated against it", catalogue.size > 50);

// ---------------------------------------------------------------------------
// 1. Every offerable benefit points at products that exist.
for (const b of allBenefits()) {
  if (b.pending) continue;
  if (b.kind === "discretionary") {
    ok(
      `${b.id} is discretionary but names product slugs — it has no published retail value by design`,
      b.productSlugs.length === 0
    );
    continue;
  }
  ok(`${b.id} is offerable but names no product at all`, b.productSlugs.length > 0);
  for (const slug of b.productSlugs) {
    ok(
      `${b.id} promises "${slug}", which is not in the catalogue — a creator would be approved for a product that does not exist`,
      catalogue.has(slug)
    );
  }
}

// ---------------------------------------------------------------------------
// 2. Pending products are still pending, and are never offered.
const pendingIds = allBenefits().filter((b) => b.pending).map((b) => b.id);
ok(
  "no benefit is marked pending — the four combined tours and the White Desert experience have no price and cannot be published yet",
  pendingIds.length >= 5
);
for (const b of allBenefits()) {
  if (!b.pending) continue;
  ok(
    `${b.id} is marked pending but also names catalogue slugs — if the product exists, clear the pending marker instead`,
    b.productSlugs.length === 0
  );
}
for (const tier of PROGRAM) {
  const offerable = offerableBenefits(tier.tier);
  for (const b of [...offerable.complimentary, ...offerable.discounts]) {
    ok(`${tier.tier} offers ${b.id}, which is still pending`, !b.pending);
  }
}
ok(
  "PENDING_PRODUCTS no longer lists the five products the owner asked for on 19 Nov 2026",
  Object.keys(PENDING_PRODUCTS).length === 5
);

// Established and Premium currently have NOTHING offerable, because every one
// of their complimentary options is a pending combined tour. That is the
// truth today and the page must not pretend otherwise — but it is also the
// single most important thing to notice when the prices arrive.
for (const tier of ["Established Creator", "Premium Creator"] as const) {
  ok(
    `${tier} has offerable complimentary benefits — if the combined tours were built, remove this assertion deliberately rather than letting it rot`,
    offerableBenefits(tier).complimentary.length === 0
  );
}

// ---------------------------------------------------------------------------
// 3. Deliverable quantities are not invented.
for (const tier of PROGRAM) {
  ok(
    `${tier.tier} has deliverable quantities set — the owner approved increasing them but did not approve figures, so any number here is invented`,
    tier.deliverables === null
  );
}

// ---------------------------------------------------------------------------
// 4. Commission is Elite-only, at the approved rate.
for (const tier of PROGRAM) {
  if (tier.tier === "Elite Creator") {
    ok("Elite commission is not the approved 10%", tier.commissionPercent === 10);
  } else {
    ok(
      `${tier.tier} earns commission — decision 6 gives it to Elite alone`,
      tier.commissionPercent === null
    );
  }
}
ok(
  "the commission cancellation window is not the approved 30 days",
  PACKAGE_RULES.commissionCancellationDays === 30
);

// ---------------------------------------------------------------------------
// 5. Discounts are sane, and the substituted quad-bike benefit stays honest.
for (const b of allBenefits()) {
  if (b.kind !== "discount") {
    ok(`${b.id} is not a discount but carries a percentage`, b.discountPercent === undefined);
    continue;
  }
  ok(
    `${b.id} has a discount of ${b.discountPercent}%, which is outside 1-99`,
    typeof b.discountPercent === "number" && b.discountPercent > 0 && b.discountPercent < 100
  );
}
const quad = allBenefits().find((b) => b.id === "sahara-quad-bikes");
ok("the quad bike benefit is missing", quad !== undefined);
ok(
  "the quad bike benefit calls itself motorcycles — it is quad bikes, and the owner chose the real product precisely so the label would be honest",
  !/motorcycle|motorbike/i.test(quad?.label ?? "")
);
ok(
  "the quad bike benefit claims to be at the Pyramids — the real experience is in the Sahara",
  !/pyramid/i.test(quad?.label ?? "")
);

// ---------------------------------------------------------------------------
// 6. Tiers match the scoring module, and the rules match what was agreed.
ok("the programme does not cover all five tiers", PROGRAM.length === TIER_THRESHOLDS.length);
for (const tier of PROGRAM) {
  ok(
    `${tier.tier}'s minScore (${tier.minScore}) disagrees with the scoring module (${scoringThresholdFor(tier.tier)})`,
    tier.minScore === scoringThresholdFor(tier.tier)
  );
}
ok("Explorer offers a complimentary package — it must not", tierConfig("Explorer").complimentary.length === 0);
ok("tier validity is not the agreed six months", PACKAGE_RULES.validityMonths === 6);
ok("packages are not creator-only", PACKAGE_RULES.creatorOnly === true);
ok("more than one redemption per period", PACKAGE_RULES.redemptionsPerPeriod === 1);
ok("bookings no longer require approval", PACKAGE_RULES.bookingApprovalRequired === true);
ok("exclusivity is being required of creators", PACKAGE_RULES.exclusivity === false);
ok("a security deposit has been introduced", PACKAGE_RULES.securityDeposit === false);
ok("the 70/30 split is wrong", PACKAGE_RULES.beforeDeparturePercent === 70);
ok("the main-video rule is not 50% before departure", PACKAGE_RULES.mainVideosBeforeDeparturePercent === 50);

// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\ncheck-creator-program: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

const offerableCount = allBenefits().filter((b) => !b.pending).length;
console.log(
  `check-creator-program: ok — ${offerableCount} offerable benefits all resolve to real catalogue ` +
    `products, ${Object.keys(PENDING_PRODUCTS).length} unbuilt products stay pending and unoffered, ` +
    `deliverable quantities are unset rather than invented, 10% commission is Elite-only with a ` +
    `30-day window, the quad-bike benefit names neither motorcycles nor the Pyramids, and all five ` +
    `tier thresholds match the scoring module.`
);
