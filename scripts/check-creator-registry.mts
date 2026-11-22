/**
 * Guards the promotion of an application into a creator.
 *
 * This is the moment the business commits: a tier is an entitlement to a
 * package worth hundreds of dollars, and once assigned it is valid for six
 * months. Four ways it goes wrong, none of which errors:
 *
 *   1. A TIER IS ASSIGNED ON AN UNVERIFIED SCORE. Every figure on an
 *      application is typed by the applicant. Promoting on it hands out
 *      packages on numbers nobody has checked.
 *
 *   2. A TIER IS ASSIGNED ON AN INCOMPLETE ASSESSMENT. The preliminary score
 *      is normalised over whatever categories were filled in, so a creator
 *      who answered three of six can read as strong. This is the exact
 *      failure the owner caught on the form, arriving a second time through
 *      the admin screen.
 *
 *   3. COMMISSION LEAKS BELOW ELITE. Money out of the door on every referred
 *      booking, for a tier that was never promised it.
 *
 *   4. A SCORE IS CHANGED WITH NO STATED REASON. A partnership programme gets
 *      asked why a creator was moved. "An administrator changed it" is not an
 *      answer, and the audit table is worthless if the reason can be blank.
 */
import { readFileSync } from "node:fs";
import {
  COLLABORATION_STATUSES,
  CREATOR_STATUSES,
  commissionFor,
  decideAdjustment,
  decidePromotion,
  tierExpiry,
  tierIsCurrent,
  tiersHighestFirst,
  parseReviewInputs,
  CONTENT_QUALITY_MAX,
} from "../src/lib/creatorClub/registry";
import { PACKAGE_RULES } from "../src/lib/creatorClub/program";
import { TIER_THRESHOLDS } from "../src/lib/creatorClub/scoring";

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

const verified = { verifiedScore: 90, assessmentComplete: true, eligible: true };

// ---------------------------------------------------------------------------
// 1 & 2. No tier without a verified, complete assessment.
ok(
  "a tier was assigned with no verified score",
  decidePromotion({ ...verified, verifiedScore: null }).ok === false
);
ok(
  "a tier was assigned on an incomplete assessment — the same failure the owner caught on the form",
  decidePromotion({ ...verified, assessmentComplete: false }).ok === false
);
ok("a verified, complete assessment was refused", decidePromotion(verified).ok === true);
for (const bad of [-1, 101, 1000]) {
  ok(
    `a verified score of ${bad} was accepted`,
    decidePromotion({ ...verified, verifiedScore: bad }).ok === false
  );
}

// The tier must follow the thresholds, not be chosen freely.
for (const t of TIER_THRESHOLDS) {
  const d = decidePromotion({ ...verified, verifiedScore: t.min });
  ok(`a score of ${t.min} did not map to ${t.tier}`, d.ok === true && d.tier === t.tier);
}

// Eligibility is carried, not conflated. A sub-10k creator can still be a
// partner on paid terms; they simply get no complimentary package.
const ineligible = decidePromotion({ ...verified, eligible: false });
ok(
  "an ineligible creator was refused promotion outright — they can still be a paid partner",
  ineligible.ok === true
);
ok(
  "an ineligible creator was marked eligible for a complimentary package",
  ineligible.ok === true && ineligible.complimentaryEligible === false
);

// ---------------------------------------------------------------------------
// 3. Commission is Elite-only, at the approved rate.
ok("Elite does not earn the approved 10%", commissionFor("Elite Creator") === 10);
for (const tier of ["Premium Creator", "Established Creator", "Rising Creator", "Explorer"] as const) {
  ok(`${tier} earns commission — decision 6 gives it to Elite alone`, commissionFor(tier) === null);
}
ok("a null tier earns commission", commissionFor(null) === null);
const elite = decidePromotion({ ...verified, verifiedScore: 95 });
ok("promotion to Elite did not carry the commission", elite.ok === true && elite.commissionPercent === 10);
const premium = decidePromotion({ ...verified, verifiedScore: 75 });
ok("promotion to Premium carried a commission", premium.ok === true && premium.commissionPercent === null);

// ---------------------------------------------------------------------------
// 4. An adjustment without a reason is refused.
const base = { previousScore: 50, newScore: 70, actor: "owner" };
for (const reason of ["", "   ", "\n", "ok"]) {
  ok(
    `a score change with reason ${JSON.stringify(reason)} was accepted`,
    decideAdjustment({ ...base, reason }).ok === false
  );
}
ok(
  "a score change with a real reason was refused",
  decideAdjustment({ ...base, reason: "Insights screenshot shows 4.2% engagement, not 8%." }).ok === true
);
ok(
  "a score change with no actor was accepted",
  decideAdjustment({ ...base, reason: "Verified against insights.", actor: "  " }).ok === false
);
for (const bad of [-1, 101, 50.5]) {
  ok(
    `a score change to ${bad} was accepted`,
    decideAdjustment({ ...base, newScore: bad, reason: "Verified against insights." }).ok === false
  );
}
const adjusted = decideAdjustment({ ...base, reason: "Verified against insights." });
ok(
  "an adjustment did not recompute the tier from the new score",
  adjusted.ok === true && adjusted.newTier === "Premium Creator" && adjusted.previousTier === "Rising Creator"
);

// ---------------------------------------------------------------------------
// 5. Tier validity is the agreed six months, and expiry is real.
const assigned = new Date("2026-11-22T00:00:00Z");
const expires = tierExpiry(assigned);
ok(
  `tier validity is not the agreed ${PACKAGE_RULES.validityMonths} months`,
  expires.getUTCFullYear() === 2027 && expires.getUTCMonth() === 4 // May = month 4
);
ok("a tier expiring in the future reads as expired", tierIsCurrent(expires, assigned) === true);
ok(
  "an expired tier still reads as current",
  tierIsCurrent(expires, new Date("2027-06-01T00:00:00Z")) === false
);
ok("a creator with no expiry reads as current", tierIsCurrent(null) === false);

// ---------------------------------------------------------------------------
// 5b. The human half of the assessment.
//
// Content quality is five sub-scores. A PARTIAL set must be discarded, not
// passed through: the model would score the missing ones as zero, which reads
// as a reviewer judging the work harshly rather than not having judged it.
const partialCq = parseReviewInputs({ storytelling: "4", cinematography: "4" });
ok(
  "a partial content-quality set was passed to the model — the missing fields would score as zero",
  partialCq.contentQuality === undefined
);
const fullCq = parseReviewInputs({
  storytelling: "4",
  cinematography: "4",
  editing: "3",
  authenticity: "2",
  travelRelevance: "2",
});
ok("a complete content-quality set was discarded", fullCq.contentQuality !== undefined);
ok(
  "content-quality sub-scores are not clamped to their maxima",
  parseReviewInputs({
    storytelling: "99",
    cinematography: "99",
    editing: "99",
    authenticity: "99",
    travelRelevance: "99",
  }).contentQuality?.storytelling === CONTENT_QUALITY_MAX.storytelling
);
ok(
  "a tourism percentage above 100 was not clamped",
  parseReviewInputs({ tourismAudiencePercent: "900" }).tourismAudiencePercent === 100
);
for (const junk of ["", "   ", "abc", "-5"]) {
  ok(
    `${JSON.stringify(junk)} as a tourism percentage was accepted`,
    parseReviewInputs({ tourismAudiencePercent: junk }).tourismAudiencePercent === undefined
  );
}
ok(
  "an empty review form produced inputs rather than nothing",
  Object.keys(parseReviewInputs({})).length === 0
);

// The action that promotes must actually consult the gate.
const actions = readFileSync("src/app/[locale]/(site)/admin/collaborations/actions.ts", "utf8");
ok("the approve action does not call decidePromotion", /decidePromotion\s*\(/.test(actions));
ok(
  "the approve action does not recompute the score — it must not trust a stored one",
  /scoreCreator\s*\(/.test(actions)
);
ok(
  "the score adjustment action does not call decideAdjustment, so the reason is unenforced",
  /decideAdjustment\s*\(/.test(actions)
);
ok(
  "commission is set from something other than commissionFor on adjustment",
  /commission_percent:\s*commissionFor\(/.test(actions)
);

// ---------------------------------------------------------------------------
// 6. The statuses the schema allows and the code uses must agree.
const sql = readFileSync("supabase/migrations/0036_creator_club_registry.sql", "utf8");
for (const s of CREATOR_STATUSES) {
  ok(`creator status "${s}" is not permitted by the table constraint`, sql.includes(`'${s}'`));
}
for (const s of COLLABORATION_STATUSES) {
  ok(`collaboration status "${s}" is not permitted by the table constraint`, sql.includes(`'${s}'`));
}
ok(
  "the score-adjustment reason is nullable in the schema — the audit trail can be blank",
  /reason text not null/.test(sql)
);
ok(
  "creators is missing row level security, so it is readable outside the service role",
  /alter table public\.creators enable row level security/.test(sql)
);
ok(
  "airport pickup is not an individually granted column on the creator",
  /airport_pickup_granted boolean not null default false/.test(sql)
);
ok("every tier is spelled identically in the schema", tiersHighestFirst().every((t) => sql.includes(`'${t}'`)));

// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\ncheck-creator-registry: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

console.log(
  `check-creator-registry: ok — no tier without a verified and complete assessment, scores map to the ` +
    `five thresholds rather than being chosen, commission is Elite-only at 10%, eligibility is carried ` +
    `rather than conflated with refusal, every score change records a reason and an actor, tiers run ` +
    `${PACKAGE_RULES.validityMonths} months and expire, and the schema permits exactly the statuses the code uses.`
);
