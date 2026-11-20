/**
 * Guards the seven-step application.
 *
 * A multi-step form has failure modes a single page does not, and none of
 * them throws:
 *
 *   1. THE DRAFT LIVES IN THE DOM. Step four unmounts step one, the browser
 *      discards those inputs, and the applicant reaches the end having
 *      silently lost five screens of work. The draft must be one object in
 *      state, and the submit path must read from it rather than from a
 *      <form>.
 *
 *   2. A REQUIRED FIELD STOPS BEING REQUIRED. Splitting validation across
 *      seven screens makes it easy for a rule to end up on a step nobody
 *      has to pass. The media kit is the one that matters: it is the single
 *      hard requirement of the whole programme.
 *
 *   3. SUBMISSION BECOMES POSSIBLE WITH WORK OUTSTANDING. canSubmit must
 *      answer for every step, not just the one on screen.
 *
 *   4. LEGAL TERMS APPEAR IN THE ACKNOWLEDGEMENTS. Content licensing,
 *      likeness consent and repayment are held pending Egyptian legal review
 *      (owner's decision 8). A tickbox on a public form is not where they
 *      land when they arrive, and shipping one would publish unreviewed
 *      contractual terms.
 */
import { readFileSync } from "node:fs";
import {
  ACKNOWLEDGEMENTS,
  STEPS,
  TOTAL_STEPS,
  blockingIssues,
  canSubmit,
  emptyDraft,
  stepComplete,
  stepIssues,
  videoProgress,
  type Draft,
} from "../src/lib/creatorClub/application";

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/.*$/gm, "$1");

/** A draft that satisfies everything, so each test can remove one thing. */
function completeDraft(): Draft {
  return {
    ...emptyDraft(),
    fullName: "A Creator",
    email: "a@example.com",
    country: "Italy",
    socials: [{ platform: "Instagram", handle: "@a", followers: "20000" }],
    mediaKitUrl: "https://drive.google.com/file/d/x/view",
    contentTypes: ["Travel"],
    collaborationType: "Sponsored Trip",
    acknowledged: Object.fromEntries(ACKNOWLEDGEMENTS.map((a) => [a.id, true])),
  };
}

// ---------------------------------------------------------------------------
// 1. Seven steps, and the draft is state rather than DOM.
ok(`the application has ${TOTAL_STEPS} steps, not seven`, TOTAL_STEPS === 7);
ok("step ids are not unique", new Set(STEPS.map((s) => s.id)).size === STEPS.length);
ok("review is not the last step", STEPS[STEPS.length - 1].id === "review");

const form = stripComments(
  readFileSync("src/app/[locale]/(site)/collaborate/CollaborateForm.tsx", "utf8"),
);
ok(
  "the form reads its values out of the DOM with new FormData(form) — every unmounted step's inputs would be lost",
  !/new FormData\(\s*e\.currentTarget\s*\)/.test(form) && !/new FormData\(\s*form\s*\)/.test(form)
);
ok("the form does not hold a draft in state", /useState<Draft>/.test(form));
ok(
  "the form no longer asks the shared module whether a step is complete",
  /stepIssues\s*\(/.test(form) && /canSubmit\s*\(/.test(form)
);

// ---------------------------------------------------------------------------
// 2. The media kit is still the one hard requirement.
const noKit = { ...completeDraft(), mediaKitUrl: "", hasMediaKitFile: false };
ok(
  "an application with no media kit can be submitted — it is the single hard requirement of the programme",
  canSubmit(noKit) === false
);
ok(
  "the missing media kit is not reported on the performance step",
  stepIssues("performance", noKit).some((i) => i.field === "mediaKit")
);
ok(
  "a PDF alone does not satisfy the media kit requirement",
  canSubmit({ ...noKit, hasMediaKitFile: true }) === true
);
ok(
  "a link alone does not satisfy the media kit requirement",
  canSubmit({ ...noKit, mediaKitUrl: "https://example.com/kit.pdf" }) === true
);

// ---------------------------------------------------------------------------
// 3. Every step's rules are enforced, and canSubmit answers for all of them.
const cases: [keyof Draft | string, Draft, string][] = [
  ["fullName", { ...completeDraft(), fullName: "" }, "personal"],
  ["email", { ...completeDraft(), email: "not-an-email" }, "personal"],
  ["country", { ...completeDraft(), country: "" }, "personal"],
  ["socials", { ...completeDraft(), socials: [] }, "social"],
  ["contentTypes", { ...completeDraft(), contentTypes: [] }, "profile"],
  ["collaborationType", { ...completeDraft(), collaborationType: "" }, "travel"],
];
for (const [field, draft, step] of cases) {
  ok(`a draft missing ${String(field)} can be submitted`, canSubmit(draft) === false);
  ok(
    `the missing ${String(field)} is not reported on the ${step} step`,
    stepIssues(step as never, draft).length > 0
  );
  ok(
    `blockingIssues does not surface the missing ${String(field)}`,
    blockingIssues(draft).some((b) => b.step === step)
  );
}
ok("a complete draft cannot be submitted", canSubmit(completeDraft()) === true);
ok("a complete draft still reports blocking issues", blockingIssues(completeDraft()).length === 0);

// A social row with a handle but no follower count is not usable: the score
// needs the number, and an account with no figure cannot be assessed.
ok(
  "a social account with no follower count was accepted",
  canSubmit({ ...completeDraft(), socials: [{ platform: "Instagram", handle: "@a", followers: "" }] }) === false
);

// Every acknowledgement must be ticked, not just some.
for (const a of ACKNOWLEDGEMENTS) {
  const partial = completeDraft();
  partial.acknowledged = { ...partial.acknowledged, [a.id]: false };
  ok(`submission was allowed with "${a.id}" unconfirmed`, canSubmit(partial) === false);
}

// ---------------------------------------------------------------------------
// 4. No unreviewed legal terms in the acknowledgements.
const FORBIDDEN = [
  /licen[cs]/i,
  /perpetual/i,
  /royalty/i,
  /likeness/i,
  /intellectual property/i,
  /\brepay/i,
  /indemnif/i,
  /\bwaive/i,
  /copyright/i,
  /binding/i,
];
for (const a of ACKNOWLEDGEMENTS) {
  for (const pattern of FORBIDDEN) {
    ok(
      `acknowledgement "${a.id}" matches ${pattern} — content licensing, likeness consent and repayment are held pending Egyptian legal review and must not ship as a tickbox`,
      !pattern.test(a.text)
    );
  }
}
ok("the acknowledgements list is empty", ACKNOWLEDGEMENTS.length > 0);
ok(
  "the acknowledgements no longer state that applying is not a guarantee",
  ACKNOWLEDGEMENTS.some((a) => /does not guarantee/i.test(a.text))
);
ok(
  "the acknowledgements no longer state that a package covers the creator alone",
  ACKNOWLEDGEMENTS.some((a) => /not a companion/i.test(a.text))
);

// ---------------------------------------------------------------------------
// 5. Progress reporting.
ok("an empty draft reports a complete first step", stepComplete("personal", emptyDraft()) === false);
ok("a complete draft reports an incomplete first step", stepComplete("personal", completeDraft()) === true);
const withVideos = completeDraft();
withVideos.videos = {
  tiktok: [
    { views: "100", likes: "1", comments: "0", shares: "0" },
    { views: "", likes: "", comments: "", shares: "" },
  ],
};
ok(
  "a blank video row was counted as progress",
  videoProgress(withVideos, "tiktok") === 1
);
ok("videoProgress invented rows for a platform with none", videoProgress(completeDraft(), "tiktok") === 0);

// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\ncheck-creator-application: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

console.log(
  `check-creator-application: ok — ${TOTAL_STEPS} steps with the draft held in state rather than the DOM, ` +
    `the media kit is still the one hard requirement and either half satisfies it, every step's rules block ` +
    `submission and surface on the review screen, all ${ACKNOWLEDGEMENTS.length} acknowledgements must be ` +
    `confirmed, and none of them carries licensing, likeness or repayment wording while that is with the lawyer.`
);
