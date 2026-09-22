// The full Cancellation Policy, rendered at /cancellation-policy and
// summarised on the About page's policy cards, every tour page, and the
// reservation wizard's review step.
//
// Kept here rather than in the page component for two reasons: the i18n
// extraction pipeline only reads src/content/*.ts, so policy text has to live
// here to be translated at all; and the policy is quoted in several places
// (policy card, tour sidebar, reserve step, chat widget context) which must
// never drift apart. `summary` is the one short form every surface uses —
// change it here and it changes everywhere.
//
// This is deliberately NOT a Sanity document. Legal wording should change by
// reviewed commit, not by an accidental edit in Studio, and keeping it local
// means it can never be replaced by stale CMS content the way Sanity-backed
// copy is (see the fetcher precedence note in sanity/fetchers.ts).

export type PolicyBlock =
  | { kind: "p"; text: string }
  | { kind: "list"; items: string[] };

export type PolicySection = {
  /** Stable anchor id — other pages deep-link to these, so don't rename. */
  id: string;
  title: string;
  blocks: PolicyBlock[];
};

/**
 * The short form shown wherever the full policy would be too long: the About
 * page policy card, the tour sidebar, the reservation review step, and the
 * chat widget's context. Every one of those links through to the full text.
 */
export const cancellationSummary =
  "Deposits and payments are non-refundable. Once you confirm, we commit funds to guides, drivers, hotels and permits on your behalf, and those costs stand whether or not you travel. If you cancel, we may be able to hold the recoverable value as travel credit or move it to another date — at our discretion and subject to what our suppliers release. For force majeure we charge no cancellation fee of our own, though supplier terms still apply.";

/** Shown under the page title, before the numbered sections. */
export const cancellationIntro =
  "We understand that travel plans change. Because we make arrangements in advance and commit non-refundable costs to guides, transport, hotels, attractions and permits, the following applies to every booking.";

/**
 * ISO date of the last substantive change. Shown on the policy page so a
 * traveler (or a dispute) can tell which version applied at booking time.
 */
export const cancellationLastUpdated = "2026-09-22";

export const cancellationSections: PolicySection[] = [
  {
    id: "deposits-and-payments",
    title: "Deposits and payments",
    blocks: [
      { kind: "p", text: "All deposits and payments made toward a booking are non-refundable." },
      {
        kind: "p",
        text: "As soon as a booking is confirmed we may commit funds to third-party suppliers and begin making arrangements specifically for your trip. Those amounts may be non-refundable to us even if you later cancel.",
      },
      {
        kind: "p",
        text: "Making a payment confirms that you have read and accepted this policy.",
      },
    ],
  },
  {
    id: "cancellation-by-you",
    title: "If you cancel",
    blocks: [
      {
        kind: "p",
        text: "If you cancel for any personal, business, medical, travel-document, flight or other reason within your control, no cash refund is provided.",
      },
      {
        kind: "p",
        text: "Any costs, penalties or non-refundable charges already incurred on your behalf may be retained from what you have paid, or charged to you where they exceed it.",
      },
      { kind: "p", text: "Where possible, and at our discretion, we may instead:" },
      {
        kind: "list",
        items: [
          "Hold the remaining eligible value as travel credit toward a future trip;",
          "Move it to another trip or another travel date; or",
          "Transfer it to another traveler, subject to approval and any additional supplier costs.",
        ],
      },
      {
        kind: "p",
        text: "Travel credit is not guaranteed. It depends on availability, on our suppliers’ terms, and on any additional costs those suppliers impose.",
      },
    ],
  },
  {
    id: "last-minute-cancellations",
    title: "Last-minute cancellations",
    blocks: [
      {
        kind: "p",
        text: "Cancelling close to your travel date usually costs more, because transport, guides, entrance tickets, accommodation and activities may already be paid for in full or in part.",
      },
      {
        kind: "p",
        text: "Amounts already committed or paid to third parties may be retained, or charged to you where they exceed what you have paid.",
      },
      {
        kind: "p",
        text: "No refund is issued for services you do not use as a result of a late cancellation, a late arrival, a missed activity or transfer, a flight delay or cancellation, or not taking part in any portion of the itinerary.",
      },
    ],
  },
  {
    id: "changes-to-a-booking",
    title: "Changes to a booking",
    blocks: [
      {
        kind: "p",
        text: "Requests to change travel dates, itinerary, hotels, transport, activities or any other arrangement are subject to availability and to supplier approval.",
      },
      {
        kind: "p",
        text: "Any additional cost arising from a change — supplier penalties, cancellation charges, rebooking fees, price differences or other expenses — is your responsibility.",
      },
      {
        kind: "p",
        text: "Where a supplier treats a date change as a cancellation, we must do the same: the original booking is cancelled under this policy and a new booking is created.",
      },
    ],
  },
  {
    id: "force-majeure",
    title: "Force majeure",
    blocks: [
      {
        kind: "p",
        text: "If a trip cannot go ahead because of circumstances beyond our reasonable control — including earthquakes, volcanic eruptions, severe weather, natural disasters, war, civil unrest, government restrictions, border closures, epidemics, pandemics, strikes or transport disruption — we charge no cancellation fee of our own.",
      },
      {
        kind: "p",
        text: "Force majeure does not by itself guarantee a cash refund. Amounts already paid to hotels, transport providers, guides, attractions, activity operators, airlines or other third parties remain subject to each of their own cancellation and refund terms.",
      },
      {
        kind: "p",
        text: "Where we can recover funds from a supplier, we will offer the recovered amount back to you as a refund or as travel credit, after any deductions that still apply.",
      },
    ],
  },
  {
    id: "no-shows-and-unused-services",
    title: "No-shows and unused services",
    blocks: [
      { kind: "p", text: "No refund or credit is provided for:" },
      {
        kind: "list",
        items: [
          "No-shows;",
          "Late arrivals;",
          "Early departures;",
          "Missed transfers;",
          "Missed tours or activities;",
          "Unused hotel nights or services;",
          "Not appearing at the agreed meeting point;",
          "Flight or transport changes you make independently.",
        ],
      },
    ],
  },
  {
    id: "third-party-costs",
    title: "Third-party costs",
    blocks: [
      {
        kind: "p",
        text: "We arrange trips using independent hotels, transport companies, guides, attractions, airlines and activity operators.",
      },
      {
        kind: "p",
        text: "Where any of them imposes a cancellation, amendment or rebooking charge, that charge is your responsibility.",
      },
    ],
  },
  {
    id: "travel-insurance",
    title: "Travel insurance",
    blocks: [
      {
        kind: "p",
        text: "We strongly recommend comprehensive travel insurance covering trip cancellation, trip interruption, medical emergencies, flight disruption and lost luggage. It is the single best protection against the costs described on this page.",
      },
      {
        kind: "p",
        text: "Arranging insurance is your responsibility, and holding it does not change the terms of this policy.",
      },
    ],
  },
  {
    id: "acceptance",
    title: "Acceptance of this policy",
    blocks: [
      {
        kind: "p",
        text: "Paying a deposit, or any other amount toward a booking, constitutes acceptance of this Cancellation Policy.",
      },
      {
        kind: "p",
        text: "By confirming a booking you acknowledge that payments are non-refundable, and that cancelling, changing or interrupting a trip may mean losing amounts already paid, or being charged for costs incurred on your behalf.",
      },
      {
        kind: "p",
        text: "We will always make reasonable efforts to help you change or cancel with the least possible loss. Any refund, credit or transfer remains subject to this policy and to what we can recover from our suppliers.",
      },
    ],
  },
];

/**
 * Every translatable string in the policy, flattened.
 *
 * The page hoists these through `trAll()` in one call before rendering:
 * `await tr()` only works when the immediately-enclosing function is async,
 * which a `.map()` callback is not, so per-string translation inside the
 * render loop silently returns English.
 */
export const cancellationPolicyStrings: string[] = [
  cancellationIntro,
  ...cancellationSections.flatMap((s) => [
    s.title,
    ...s.blocks.flatMap((b) => (b.kind === "p" ? [b.text] : b.items)),
  ]),
];
