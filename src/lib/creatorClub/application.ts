/**
 * The Creator Club application: its steps, its draft, and what each step
 * needs before it can be left.
 *
 * Pure and free of `server-only`, for the usual reason — the component that
 * renders the form imports React and browser APIs, which would put these
 * rules out of reach of a check script. Keeping them here means
 * scripts/check-creator-application.mts can execute the validation rather
 * than read the JSX and hope.
 *
 * WHY THE DRAFT LIVES IN ONE OBJECT. A multi-step form that reads its values
 * out of the DOM loses every field on a step that is not currently mounted —
 * the applicant fills in six steps, goes back to check one, and arrives at
 * the end having silently lost the other five. So every value is held here
 * and the steps only ever render what is already in the draft.
 *
 * WHAT IS DELIBERATELY NOT HERE. Step 6 asks the applicant to acknowledge how
 * the programme works — the follower minimum, the six-month validity, that a
 * package covers the creator alone. It does NOT ask them to accept content
 * licensing, likeness consent or repayment terms. Those are held pending
 * Egyptian legal review (owner's decision 8, 19 Nov 2026), and a tickbox on a
 * public form is not where they will land when they arrive.
 */

export const STEPS = [
  { id: "personal", title: "About you" },
  { id: "social", title: "Your accounts" },
  { id: "performance", title: "Performance" },
  { id: "profile", title: "Your work" },
  { id: "travel", title: "Your trip" },
  { id: "agree", title: "How it works" },
  { id: "review", title: "Review" },
] as const;

export type StepId = (typeof STEPS)[number]["id"];

export const TOTAL_STEPS = STEPS.length;

/** The operational rules an applicant confirms they have read. */
export const ACKNOWLEDGEMENTS = [
  {
    id: "followers",
    text: "A complimentary package needs at least 10,000 followers on Instagram, TikTok or Facebook.",
  },
  {
    id: "mediaKit",
    text: "A media kit is required, and our team verifies the figures I have given against my insights.",
  },
  {
    id: "notGuaranteed",
    text: "Applying does not guarantee a complimentary trip. Every package is selective and agreed case by case.",
  },
  {
    id: "validity",
    text: "If approved, my tier lasts six months and covers one package in that time.",
  },
  {
    id: "creatorOnly",
    text: "A complimentary package covers me only, not a companion, unless that is separately approved.",
  },
  {
    id: "approval",
    text: "Every booking needs Egypt Eye's approval before it is confirmed.",
  },
  {
    id: "deliverables",
    text: "An approved collaboration comes with agreed content deliverables, confirmed in a campaign brief before I travel.",
  },
  {
    id: "beforeDeparture",
    text: "Most of that content is due before I leave Egypt, with the remainder to agreed deadlines afterwards.",
  },
] as const;

export type AcknowledgementId = (typeof ACKNOWLEDGEMENTS)[number]["id"];

export type SocialRow = { platform: string; handle: string; followers: string };
export type VideoRow = { views: string; likes: string; comments: string; shares: string };

export type Draft = {
  // Step 1
  fullName: string;
  creatorName: string;
  email: string;
  phone: string;
  country: string;
  website: string;
  // Step 2
  socials: SocialRow[];
  // Step 3 — videos are keyed by scoring platform; media kit is one or both
  videos: Record<string, VideoRow[]>;
  mediaKitUrl: string;
  hasMediaKitFile: boolean;
  // Step 4
  contentTypes: string[];
  languages: string;
  audienceCountries: string;
  whyEgyptEye: string;
  bestWork: string;
  // Step 5
  travelDates: string;
  destinations: string;
  requestedExperience: string;
  collaborationType: string;
  travellingAlone: string;
  message: string;
  // Step 6
  acknowledged: Record<string, boolean>;
};

export function emptyDraft(): Draft {
  return {
    fullName: "",
    creatorName: "",
    email: "",
    phone: "",
    country: "",
    website: "",
    socials: [{ platform: "Instagram", handle: "", followers: "" }],
    videos: {},
    mediaKitUrl: "",
    hasMediaKitFile: false,
    contentTypes: [],
    languages: "",
    audienceCountries: "",
    whyEgyptEye: "",
    bestWork: "",
    travelDates: "",
    destinations: "",
    requestedExperience: "",
    collaborationType: "",
    travellingAlone: "",
    message: "",
    acknowledged: {},
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** A problem with one field, named so the step can point at it. */
export type FieldIssue = { field: string; message: string };

/**
 * What is still missing on a given step.
 *
 * Returns every problem rather than the first, so an applicant fixes one
 * screen in one pass instead of being told about one field at a time.
 *
 * A step with no issues can be left. The LAST step's issues are what block
 * submission, and `blockingIssues` gathers every step's so the review screen
 * can show the lot.
 */
export function stepIssues(step: StepId, draft: Draft): FieldIssue[] {
  const issues: FieldIssue[] = [];

  if (step === "personal") {
    if (!draft.fullName.trim()) issues.push({ field: "fullName", message: "Your full name" });
    if (!EMAIL_RE.test(draft.email.trim()))
      issues.push({ field: "email", message: "A valid email address" });
    if (!draft.country.trim()) issues.push({ field: "country", message: "Where you are based" });
  }

  if (step === "social") {
    const usable = draft.socials.filter((s) => s.handle.trim() && s.followers.trim());
    if (usable.length === 0)
      issues.push({
        field: "socials",
        message: "At least one account, with its handle and follower count",
      });
  }

  if (step === "performance") {
    // The one hard requirement of the whole form. Either half satisfies it.
    if (!draft.hasMediaKitFile && !draft.mediaKitUrl.trim())
      issues.push({
        field: "mediaKit",
        message: "A media kit — upload a PDF or paste a link to one",
      });
  }

  if (step === "profile") {
    if (draft.contentTypes.length === 0)
      issues.push({ field: "contentTypes", message: "At least one kind of content you make" });
  }

  if (step === "travel") {
    if (!draft.collaborationType.trim())
      issues.push({ field: "collaborationType", message: "The kind of collaboration you have in mind" });
  }

  if (step === "agree") {
    const missing = ACKNOWLEDGEMENTS.filter((a) => !draft.acknowledged[a.id]);
    if (missing.length > 0)
      issues.push({
        field: "acknowledged",
        message: `${missing.length} point${missing.length === 1 ? "" : "s"} still to confirm`,
      });
  }

  return issues;
}

/** Every unresolved issue across the form, in step order. */
export function blockingIssues(draft: Draft): { step: StepId; issues: FieldIssue[] }[] {
  return STEPS.map((s) => ({ step: s.id, issues: stepIssues(s.id, draft) })).filter(
    (s) => s.issues.length > 0,
  );
}

export function canSubmit(draft: Draft): boolean {
  return blockingIssues(draft).length === 0;
}

/** How far along a step is, for the progress indicator. */
export function stepComplete(step: StepId, draft: Draft): boolean {
  return stepIssues(step, draft).length === 0;
}

/**
 * Videos entered against the ten the model wants, for the per-platform
 * counter. Counts only rows with a view count, because a blank row is not
 * progress.
 */
export function videoProgress(draft: Draft, platform: string): number {
  return (draft.videos[platform] ?? []).filter((v) => v.views.trim() !== "").length;
}
