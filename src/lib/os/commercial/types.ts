// Shared shapes for the commercial layer. Kept free of `server-only` so the
// client components that render pipelines and score breakdowns can import the
// types without dragging the database in.

export type Pipeline = "b2c" | "b2b";

export type StageCategory = "new" | "qualifying" | "proposing" | "negotiating" | "won" | "lost";

export type DealStage = {
  id: string;
  pipeline: Pipeline;
  key: string;
  label: string;
  description: string | null;
  category: StageCategory;
  color: string;
  sortOrder: number;
  probabilityPct: number;
  staleAfterDays: number | null;
  requirements: Record<string, boolean>;
};

/**
 * One reason a score is what it is.
 *
 * Nothing in this application renders a score without the factors beside it.
 * `explanation` is the sentence a salesperson reads to decide whether they
 * agree — and disagreeing with it means editing a configuration row, not
 * arguing with a black box.
 */
export type ScoreFactor = {
  key: string;
  label: string;
  points: number;
  explanation: string;
  /** What made this rule match for this particular record. */
  detail?: string;
};

export type LeadListItem = {
  id: string;
  ref: string;
  pipeline: Pipeline;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  companyName: string | null;
  country: string | null;
  source: string;
  campaign: string | null;
  interest: string | null;
  typeName: string | null;
  requestedDate: string | null;
  dateFlexible: boolean;
  guests: number | null;
  budgetAmount: number | null;
  budgetCurrency: string | null;
  message: string | null;
  status: string;
  ownerId: string | null;
  ownerName: string | null;
  clientId: string | null;
  companyId: string | null;
  dealId: string | null;
  score: number;
  scoreBand: "hot" | "warm" | "cool" | "cold";
  scoreFactors: ScoreFactor[];
  receivedAt: string;
  firstResponseAt: string | null;
  firstResponseMinutes: number | null;
  /** True when nobody has replied and the target has already passed. */
  responseOverdue: boolean;
  notes: string | null;
};

export type DealListItem = {
  id: string;
  ref: string;
  pipeline: Pipeline;
  title: string;
  status: "open" | "won" | "lost" | "abandoned";
  stageId: string | null;
  stageKey: string | null;
  stageLabel: string | null;
  stageCategory: StageCategory | null;
  stageColor: string;
  clientId: string | null;
  clientName: string | null;
  companyId: string | null;
  companyName: string | null;
  ownerId: string | null;
  ownerName: string | null;
  expectedCloseOn: string | null;
  requestedDate: string | null;
  guests: number | null;
  typeName: string | null;
  source: string | null;
  nextStep: string | null;
  nextStepDueOn: string | null;
  stageEnteredAt: string;
  lastActivityAt: string | null;
  daysInStage: number;
  /** Past the stage's own stale_after_days. Named, not guessed. */
  stalled: boolean;
  lostReason: string | null;
  lostNote: string | null;
  /** Present only when the actor holds deals.value. */
  money: {
    value: number;
    currency: string;
    probabilityPct: number;
    probabilitySource: "stage" | "owner";
    weighted: number;
  } | null;
};

export type CompanyListItem = {
  id: string;
  code: string;
  name: string;
  kind: string;
  status: string;
  tier: string;
  country: string | null;
  city: string | null;
  ownerId: string | null;
  ownerName: string | null;
  primaryContactId: string | null;
  primaryContactName: string | null;
  contactCount: number;
  openDeals: number;
  lastContactAt: string | null;
  healthScore: number;
  healthState: string;
  healthFactors: ScoreFactor[];
  creditHold: boolean;
  activeAgreementId: string | null;
  activeAgreementTitle: string | null;
  agreementEndsOn: string | null;
  /** Present only when the actor holds companies.terms. */
  terms: {
    commissionPct: number | null;
    paymentTerms: string | null;
    currency: string;
    creditLimit: number | null;
  } | null;
  /** Present only when the actor holds deals.value or companies.terms. */
  lifetime: { trips: number; revenue: number; currency: string } | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
  notes: string | null;
};

export type StageBlocker = { key: string; label: string; detail: string };
