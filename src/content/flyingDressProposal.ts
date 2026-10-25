/**
 * THE PROPOSAL SERVICE, AS THE OWNER DESCRIBED IT.
 *
 * =========================================================================
 * WHY THIS IS A SEPARATE FILE
 * =========================================================================
 * `FlyingDressExperience` describes every celebration the same way: who it is
 * for, what is included, what the extras are, what still needs confirming.
 * That shape is right for eight categories and wrong for the one the business
 * most wants to sell, because the proposal has operational detail none of the
 * others has — how the money is split, how the photographs arrive, how long
 * the gallery stays up, what happens to the surprise.
 *
 * Widening the shared type to carry all of that would put seven empty fields
 * on seven other experiences. So the proposal keeps its own file, and the page
 * composes the two.
 *
 * =========================================================================
 * THE LINE BETWEEN WHAT WE PUBLISH AND WHAT WE HOLD
 * =========================================================================
 * The owner supplied these details and also, in the same breath, asked for
 * two of them to be verified before publishing. Both things are true at once,
 * and the file is built around that rather than around picking one.
 *
 * `published: true` means the owner stated it plainly and it goes on the page.
 * `published: false` means the owner supplied it AND flagged it for
 * verification, so it is recorded here, visible to the team, and NOT rendered.
 * The page reads the flag; nothing about publishing one later needs a code
 * change beyond flipping it.
 *
 * This matters most for the venue. "Palm Hotel, Mansouriya Street, near the
 * Sphinx Gate area" is a specific, checkable, legally meaningful claim about
 * somebody else's building. Getting it wrong sends a couple to the wrong
 * address on the most important morning of their trip. The page says what is
 * unambiguously true instead — a private hotel rooftop in Giza with a view of
 * the pyramids, confirmed with you for your date — which is the same promise
 * without the part nobody here can check.
 *
 * NOTHING IN THIS FILE CARRIES A PRICE, and the check script enforces it. No
 * figure has been set for any proposal package. CLAUDE.md §7.
 */

/** A fact the owner gave, and whether it may go on the page yet. */
export type ProposalFact<T> = {
  value: T;
  /** False means: recorded for the team, held back from the page. */
  published: boolean;
  /** Why it is held, and what would release it. Read by the owner docs. */
  note?: string;
};

// ---------------------------------------------------------------------------
// THE VENUE
// ---------------------------------------------------------------------------

export const proposalVenue = {
  /**
   * What the page says. True of the service regardless of which roof is
   * confirmed for a given date, which is also why it survives the venue
   * changing.
   */
  description:
    "A private hotel rooftop in Giza, looking across at the Great Pyramids. The roof is confirmed with the venue for your date before anything is agreed.",

  /** Held. See the header comment. */
  name: {
    value: "Palm Hotel",
    published: false,
    note: "Supplied by the owner and flagged by them for verification. Publishing a venue name is a claim about somebody else's business and about an arrangement we have with them. Confirm the hotel, that the rooftop arrangement is current, and that they are content to be named publicly.",
  } satisfies ProposalFact<string>,

  /** Held, and for a sharper reason than the name. */
  address: {
    value: "Mansouriya Street, near the Sphinx Gate area",
    published: false,
    note: "Same verification, plus one more: a published street address is what somebody types into a map on the morning. If any part of it is approximate, a couple arrives at the wrong gate on the day of their proposal. Confirm the exact address before this goes anywhere near the page.",
  } satisfies ProposalFact<string>,

  /**
   * The distinction the whole brand is careful about, and the one competitors
   * blur. A rooftop with a view of the pyramids is not the archaeological
   * site, and a visitor deciding between the two deserves the difference
   * stated rather than implied.
   */
  notTheComplex:
    "This is a rooftop overlooking the pyramids, not a location inside the archaeological complex. No site ticket is needed and none is included. Photography inside the complex is a separate permitted activity with its own cost and lead time, and it is not what we sell.",

  /** Held. The owner's own wording was "may be available", and that word matters. */
  changingRoom: {
    value: "Changing rooms available at the venue free of charge",
    published: false,
    note: "The owner wrote 'may be available' and asked for the access arrangements to be verified. Published as an unconditional promise it becomes something a guest in a dress discovers is untrue at the venue. Confirm whether it is guaranteed, and on what terms, and it can be stated plainly.",
  } satisfies ProposalFact<string>,

  /** What the page says in the meantime. Accurate either way. */
  changingRoomInterim:
    "Somewhere to change at the venue is arranged as part of holding your date. Tell us if you are arriving dressed or want to change there, and it is confirmed with the venue in writing with everything else.",
} as const;

// ---------------------------------------------------------------------------
// WHAT IS INCLUDED
//
// Every line here was stated by the owner. The ones that were already on the
// experience record are not repeated; this is the operational detail that
// record has no field for.
// ---------------------------------------------------------------------------

export type ProposalInclusion = {
  title: string;
  detail: string;
};

export const proposalInclusions: ProposalInclusion[] = [
  {
    title: "A private rooftop above Giza",
    detail:
      "Confirmed with the venue for your date and your time, before anything is agreed. The pyramids are the view, not a backdrop we have placed you in front of.",
  },
  {
    title: "A decoration from the collection",
    detail:
      "You choose the setup from the designs we currently run. We send you what is available when you enquire, because what is in the collection changes.",
  },
  {
    title: "Built before you arrive",
    detail:
      "The setup is prepared on the roof ahead of you, so the two of you walk into something finished. Nobody is assembling anything while she watches.",
  },
  {
    title: "A photographer already in position",
    detail:
      "In place before you arrive and shooting from where she is not looking. The moment is photographed as it happens rather than staged again afterwards.",
  },
  {
    title: "More than a hundred edited photographs",
    detail:
      "The approach, the moment, the reaction and the portraits afterwards, colour-graded and delivered as a gallery.",
  },
  {
    title: "Your song, through the speaker",
    detail:
      "There is a speaker on the roof. Send us the track you want playing as she arrives and we cue it.",
  },
  {
    title: "A team coordinating it with you",
    detail:
      "On whichever channel you choose, so nothing reaches your partner. The venue, the timing and the setup are handled between us and the roof.",
  },
];

// ---------------------------------------------------------------------------
// THE SEQUENCE
// ---------------------------------------------------------------------------

export type ProposalStep = {
  title: string;
  detail: string;
};

export const proposalSteps: ProposalStep[] = [
  {
    title: "Tell us privately",
    detail:
      "Your date, the time you are thinking of, and anything that matters about how you want it to go. You pick the channel we reply on and we use only that one.",
  },
  {
    title: "Choose the setup",
    detail:
      "We send you the decoration designs currently available and you pick one, or describe what you had in mind and we tell you honestly whether it is possible.",
  },
  {
    title: "We confirm the roof",
    detail:
      "The venue, the date and the time are agreed with the rooftop, and the quotation comes back to you in writing. Nothing is held until that is done.",
  },
  {
    title: "Hold the date",
    detail:
      "A deposit secures it. Until it is paid the roof is not yours, and we will say so rather than let you assume otherwise.",
  },
  {
    title: "We build it before you come",
    detail:
      "The setup goes up on the roof ahead of your arrival. The photographer is in position before you walk out.",
  },
  {
    title: "You ask, and we photograph it",
    detail:
      "The approach, the moment and the reaction. Then portraits, while it is still sinking in.",
  },
  {
    title: "The photographs arrive",
    detail:
      "Edited and delivered as a Google Drive gallery, yours to download for a year from the day it is shared.",
  },
];

// ---------------------------------------------------------------------------
// PHOTOGRAPHY AND DELIVERY
// ---------------------------------------------------------------------------

export const proposalPhotography = {
  countNote: "More than a hundred edited photographs.",
  covers: [
    "The approach, where she still does not know.",
    "The moment itself, shot from where she is not looking.",
    "The reaction, which is the frame most people say they look at most.",
    "Couple portraits afterwards, directed throughout.",
    "The setup and the roof, so the room you did it in is in the set too.",
  ],
  delivery:
    "The edited photographs are delivered as a Google Drive link. The gallery stays available for one year from the day it is shared, so there is no rush to download and no deadline to miss.",
  /**
   * Deliberately absent: a turnaround time. The owner did not give one, and
   * "within X days" is the single easiest promise for a photography business
   * to break. The page says when the LINK EXPIRES, which the owner did give.
   */
  noTurnaroundPromise:
    "We do not publish a delivery deadline, because we would rather give you one in writing for your booking than a number here that turns out not to fit your date.",
} as const;

// ---------------------------------------------------------------------------
// MONEY
//
// A split, not a price. Everything here was stated by the owner; the figure
// the split applies to has never been set and does not appear.
// ---------------------------------------------------------------------------

export const proposalPayment = {
  depositPercent: 25,
  balancePercent: 75,
  depositNote: "Twenty-five per cent secures your date. The roof is not held until it is paid.",
  balanceNote: "The remaining seventy-five per cent is paid on the day, after the event.",
  methods: ["Cash", "PayPal", "A payment link we send you"],
  /**
   * The thing this page must never imply. There is no checkout on this
   * domain and an enquiry is not a reservation.
   */
  quoteNote:
    "There is no published price for a proposal, because what it costs depends on the setup you choose and anything you add to it. You get a figure in writing before you commit to anything, and nothing on this website charges a card.",
} as const;

// ---------------------------------------------------------------------------
// THE DECORATION COLLECTION
//
// EMPTY, AND THAT IS THE HONEST STATE.
//
// The owner has confirmed a catalogue of designs exists and that customers
// choose from it. They have not supplied the designs, the names or the
// photographs. So the page renders a working catalogue with nothing in it,
// which tells the visitor how choosing works and offers to send the current
// designs, rather than a grid of names somebody here made up.
//
// Adding a real entry is the whole edit: drop it in this array with its
// photograph and it appears, selectable, and carries into the enquiry.
// `scripts/check-flying-dresses.mts` fails any entry with a price, and any
// entry whose photograph is missing from public/.
// ---------------------------------------------------------------------------

export type ProposalDecoration = {
  /** Stable id, used in the enquiry handoff. */
  id: string;
  name: string;
  description: string;
  /** Path under public/. Required: a catalogue entry with no photograph is a list item. */
  src: string;
  alt: string;
};

export const proposalDecorations: ProposalDecoration[] = [];

/** What the page says while the catalogue is empty. Accurate, and useful. */
export const DECORATION_INTERIM =
  "The designs change as flowers, lighting and signage come and go, so rather than publish a catalogue here that is out of date by the time you read it, we send you what is actually available for your date. Tell us the mood you are after and whether you are picturing it in daylight or after dark, and photographs of the current setups come back with the quotation.";

/**
 * Personalisation the owner has confirmed. Anything not on this list is
 * handled as a request rather than advertised as a service, which is the
 * distinction the experience record's `extras` already draws by `delivery`.
 */
export const proposalPersonalisation: ProposalInclusion[] = [
  {
    title: "The decoration",
    detail: "Chosen from the designs available for your date, or described to us if you have something else in mind.",
  },
  {
    title: "The song",
    detail: "There is a speaker on the roof. Send the track and we cue it for the moment she arrives.",
  },
  {
    title: "The date and the hour",
    detail:
      "Including whether you want the light at the start of the day or the end of it. Both change what the pyramids look like behind you.",
  },
  {
    title: "Anything else you are planning",
    detail:
      "Tell us and we will say plainly whether it is something we do, something we can arrange through someone else, or something the venue has to agree to first.",
  },
];
