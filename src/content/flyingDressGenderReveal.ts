/**
 * THE GENDER REVEAL SERVICE.
 *
 * =========================================================================
 * WHY THIS IS NOT A COPY OF flyingDressProposal.ts
 * =========================================================================
 * It would have been a twenty-minute job to duplicate the proposal file and
 * change the nouns, and the result would have been a page of fiction. The two
 * services share a brand and a skyline and almost nothing else that a customer
 * pays for.
 *
 * The owner supplied a long list of operational facts FOR THE PROPOSAL: a
 * twenty-five per cent deposit with the balance on the day, cash or PayPal or
 * a payment link, more than a hundred edited photographs, Google Drive
 * delivery with a year of access, a speaker on the roof, a setup built before
 * the couple arrives. None of that was said about a gender reveal. Not one
 * line of it appears in this file, and `scripts/check-flying-dresses.mts`
 * fails the build if any of it turns up on this page.
 *
 * That is not pedantry. A gender reveal is a family event with guests, a
 * supplier-dependent cake and a venue that has to approve whatever happens in
 * the air above its roof. Published terms belonging to a private sunrise
 * proposal would be wrong in a way the first customer discovers at the point
 * of paying.
 *
 * =========================================================================
 * WHERE EVERYTHING HERE COMES FROM
 * =========================================================================
 * `src/content/flyingDressExperiences.ts`, the `gender-reveal` record, and
 * nowhere else. Its `included`, `extras`, `durationNote`, `leadTimeNote`,
 * `dependencies` and `faqs` are the owner's own description of this service.
 * This file reshapes them into the sections a page needs; it does not add to
 * them. Its `confirm` list is the list of things nobody has answered yet, and
 * each one is honoured below by saying less rather than by guessing.
 *
 * NOTHING IN THIS FILE CARRIES A PRICE. No figure has been set for a gender
 * reveal with or without video, the record says so plainly, and the check
 * script enforces it. CLAUDE.md §7.
 */

import { ROOFTOP_LOCATION_NOTE, VENUE_DEPENDENCY } from "./flyingDressExperiences";

export type RevealEntry = {
  title: string;
  detail: string;
};

// ---------------------------------------------------------------------------
// THE SECRET
//
// This is the part of the service that is genuinely unlike anything else the
// business sells, and it is fully confirmed: the first `included` line is "A
// planning conversation with whoever is holding the secret", and the first FAQ
// explains how the result reaches us.
// ---------------------------------------------------------------------------

export const revealSecret = {
  lede:
    "Somebody has to know. The whole service is built around that person, so the two of you can find out at the same time as everyone else.",
  steps: [
    {
      title: "Someone holds the result",
      detail:
        "Usually a family member, sometimes the clinic. They are the one person in this who knows, and the planning happens with them rather than with you.",
    },
    {
      title: "It comes to us from them",
      detail:
        "We take the result from whoever is holding it. Neither of us tells you, and nothing we send you afterwards gives it away before the moment.",
    },
    {
      title: "If nobody can hold it",
      detail:
        "Say so when you enquire. There is more than one way to arrange this and we will suggest one rather than let the plan quietly depend on a person who is not available.",
    },
  ] satisfies RevealEntry[],
} as const;

// ---------------------------------------------------------------------------
// WHAT IS INCLUDED
//
// The six `included` lines from the experience record, given the titles a page
// can scan. No line has been added.
// ---------------------------------------------------------------------------

export const revealInclusions: RevealEntry[] = [
  {
    title: "A planning conversation with the secret keeper",
    detail:
      "Held with whoever knows, on a channel that does not reach you. The result, the colour and the timing are agreed with them.",
  },
  {
    title: "A decoration from the collection",
    detail:
      "Chosen from the designs we currently run, in a colour theme you pick. We send you what is available for your date when you enquire.",
  },
  {
    title: "A rooftop with the pyramids behind it",
    detail:
      "Confirmed with the venue for your date before anything is agreed. The pyramids are the view rather than a backdrop we have placed you in front of.",
  },
  {
    title: "The reveal itself, photographed",
    detail:
      "The moment lasts about two seconds. It is covered as it happens, along with the faces of everybody watching it.",
  },
  {
    title: "The family around it",
    detail:
      "Not just the two of you. Whoever came is photographed, because a reveal with nobody else in the frame is a different event.",
  },
  {
    title: "Family portraits either side of the moment",
    detail:
      "Directed, before or after, while everyone is still in one place and still dressed for it.",
  },
];

// ---------------------------------------------------------------------------
// THE REVEAL MECHANISM
//
// THE MOST CAREFUL SECTION ON THE PAGE, AND THE REASON IT EXISTS.
//
// Every competitor page lists reveal methods as a menu: balloon pop, confetti
// cannon, smoke, a box of butterflies. This business cannot, and has said so
// in two separate places in its own record:
//
//   dependencies: "The reveal mechanism is agreed case by case with the venue.
//                  We will not confirm a particular prop or effect until they
//                  have."
//   confirm:      "What reveal mechanisms the venues actually permit. Nothing
//                  specific should be advertised until this is answered."
//
// So the section explains HOW A METHOD GETS AGREED instead of listing methods
// that are available. That is not a weaker section. It is the answer to the
// question underneath the menu, which is "will the thing I have seen on
// Instagram actually be allowed on a hotel roof in Giza", and a visitor who
// reads this knows more than one who read a list.
//
// The check script fails this page if it advertises a named mechanism as
// available.
// ---------------------------------------------------------------------------

export const revealMechanism = {
  lede:
    "How the moment actually happens is agreed for your date rather than picked off a list here, and the reason is the roof.",
  points: [
    {
      title: "The venue decides what is allowed in the air",
      detail:
        "It is their building. Anything that pops, sprays, burns or drifts is their call, and it can differ by date, by wind and by who else is on the roof that evening. We ask them before we agree it with you, never after.",
    },
    {
      title: "So we will not promise you a prop on a web page",
      detail:
        "Tell us what you are imagining when you enquire and we will come back with what the venue will permit on your date. Nothing specific is advertised here, because publishing a list we have not confirmed is how somebody arrives expecting an effect that was never possible.",
    },
    {
      title: "Your own cake or props, usually",
      detail:
        "It depends on the venue, the same way everything on the roof does. Tell us what you are planning to bring and we will check instead of guessing.",
    },
    {
      title: "What comes through suppliers",
      detail:
        "Cake, reveal props, flowers and additional styling are arranged through people we work with rather than held in stock, and each one is confirmed separately once the date is held.",
    },
  ] satisfies RevealEntry[],
  /** What our ONE real gender reveal photograph genuinely proves, and no more. */
  evidenceNote:
    "The photograph at the top of this page is a gender reveal this team ran on this roof: a balloon arch, lit letters, flowers and evening light, with the family in the frame. That is the decoration rather than the mechanism, and it shows what was built on one evening rather than a design you can order by name.",
} as const;

// ---------------------------------------------------------------------------
// THE COLOUR THEME
//
// Confirmed by the record: "A choice from our existing decoration designs, in
// a colour theme you pick."
//
// WHAT THE OPTIONS ARE ACTUALLY ABOUT is the thing worth getting right. A
// parent who does not know the result cannot pick the revealing colour, so a
// plain pink-or-blue chooser is incoherent for the person using it. The real
// question is whether the decoration is allowed to give anything away, and who
// decides its colour. That is what these three are.
//
// They are a STARTING POINT CARRIED INTO THE ENQUIRY, not a confirmed design.
// The final decoration is agreed with the secret keeper and the venue, which
// is what `note` says on the page.
// ---------------------------------------------------------------------------

export type RevealTheme = {
  /** Stable id, used in the enquiry handoff. Resolved server-side. */
  id: string;
  label: string;
  detail: string;
};

export const revealThemes: RevealTheme[] = [
  {
    id: "neutral",
    label: "Neutral, so nothing gives it away",
    detail:
      "Both colours together, or neither of them, until the moment itself. The usual choice when the parents are the ones finding out.",
  },
  {
    id: "secret-keeper",
    label: "Left to whoever is holding the secret",
    detail:
      "You tell us who knows and they take the colour decision with us. Worth asking us about early, because whether it can be done without giving it away depends on the design.",
  },
  {
    id: "described",
    label: "A palette you describe to us",
    detail:
      "Your own colours, a theme from the rest of the trip, or something that matches what the guests are wearing. Tell us and we will say what is possible.",
  },
];

/** Said beside the chooser. Keeps it a preference rather than a confirmation. */
export const THEME_NOTE =
  "Choosing one here carries it into the enquiry so you do not have to explain it twice. Nothing is reserved by choosing, and the decoration is finally agreed with whoever is holding the secret and with the venue.";

export function revealThemeById(id: string): RevealTheme | undefined {
  return revealThemes.find((theme) => theme.id === id);
}

// ---------------------------------------------------------------------------
// THE DECORATION COLLECTION
//
// EMPTY, AND THAT IS THE HONEST STATE. The record confirms a choice is made
// from "our existing decoration designs" and its `confirm` list asks for
// exactly what is missing: "Which decoration designs exist for this, and
// photographs of them."
//
// A separate array from the proposal's, because these are different designs
// for a different occasion. Adding a real entry is the whole edit.
// ---------------------------------------------------------------------------

export type RevealDecoration = {
  id: string;
  name: string;
  description: string;
  /** Path under public/. A catalogue entry with no photograph is a list item. */
  src: string;
  alt: string;
};

export const revealDecorations: RevealDecoration[] = [];

/** What the page says while the catalogue is empty. Accurate, and useful. */
export const DECORATION_INTERIM =
  "The designs change as flowers, balloons, lighting and signage come and go, so rather than publish a catalogue here that is already out of date by the time you read it, we send you what is genuinely available for your date. Tell us how many people are coming and whether you want the decoration to stay neutral, and photographs of the current setups come back with the quotation.";

// ---------------------------------------------------------------------------
// THE SEQUENCE
//
// Note what step five is NOT. The proposal's fourth step is "Hold the date: a
// deposit secures it", because the owner stated a deposit for that service.
// Nothing of the kind has been stated for this one, so this sequence talks
// about LEAD TIME, which the record does give: "Two weeks or more, mainly so
// the decoration and any props can be arranged properly."
// ---------------------------------------------------------------------------

export const revealSteps: RevealEntry[] = [
  {
    title: "Tell us, and tell us who knows",
    detail:
      "Your date, roughly how many people are coming, and who is holding the result. If nobody is yet, say that too.",
  },
  {
    title: "We take the result from them",
    detail:
      "The planning conversation happens with the person who knows, on a channel that does not reach you.",
  },
  {
    title: "Choose how it looks",
    detail:
      "A design from the collection and a colour theme, or a description of what you had in mind. We send you what is available for your date.",
  },
  {
    title: "We ask the roof",
    detail:
      "The date, the numbers and what the venue will allow for the moment itself are confirmed with them, and the quotation comes back to you in writing. Nothing is agreed before that.",
  },
  {
    title: "Two weeks, not two days",
    detail:
      "Allow a fortnight or more. It is not a formality: the decoration, the balloons and anything coming through a supplier have to be arranged properly rather than found on the morning.",
  },
  {
    title: "The moment, photographed and filmed",
    detail:
      "It is over in about two seconds. Everyone watching is covered as well as the two of you, and portraits are taken either side of it while everybody is still there.",
  },
  {
    title: "The photographs arrive",
    detail:
      "Colour-graded and delivered after the session, so you can watch your own face doing something you were not aware it did.",
  },
];

// ---------------------------------------------------------------------------
// PHOTOGRAPHY, AND WHAT IS DELIBERATELY ABSENT
//
// The record says, in full: "Colour-graded photographs delivered after the
// session." That is the whole delivery promise for this service.
//
// It does NOT say a hundred photographs, Google Drive, or a year of access.
// Those are proposal facts. Publishing them here would be inventing the three
// numbers a photography customer is most likely to hold us to.
// ---------------------------------------------------------------------------

export const revealPhotography = {
  heading: "The two seconds, and the hour around them",
  covers: [
    "The moment itself, and the faces of everyone watching it.",
    "The approach, while nobody has said anything yet.",
    "The family around the reveal, including whoever travelled for it.",
    "Directed portraits before or after, while everyone is in one place.",
  ],
  delivery:
    "The photographs are colour-graded and delivered after the session. You get the delivery arrangements in writing with your quotation, for your date.",
  /**
   * Both of these are absences stated out loud rather than numbers invented.
   * A count and a turnaround are the two easiest promises in photography to
   * break, and neither has been set for this service.
   */
  noCountPromise:
    "We do not publish a number of photographs for a gender reveal. How many there are depends on how many people come and whether portraits are part of it, and a figure here would be a guess at your event.",
  noTurnaroundPromise:
    "We do not publish a delivery deadline either. You get one in writing for your booking instead of a number here that turns out not to fit your date.",
} as const;

// ---------------------------------------------------------------------------
// VIDEO
//
// THE ONE PLACE THIS PAGE CAN SAY MORE THAN THE PROPOSAL PAGE. The proposal
// brief told us not to promise video unless it was confirmed for that service,
// so that page is silent about it. This record lists two video extras as
// `delivery: "in-house"`, which is the business saying it does them itself.
//
// Still no price: the record's own first unanswered question is "PRICE.
// Nothing has been set for a gender reveal, WITH OR WITHOUT VIDEO."
// ---------------------------------------------------------------------------

export const revealVideo = {
  lede:
    "A reveal is one of the few things we photograph that is arguably better as footage, because the sound is half of it.",
  points: [
    "A cinematic film of the reveal, shot and edited in house.",
    "Slow motion of the moment itself, which is where a two second event becomes something you can actually watch.",
    "Vertical cuts for the people who are going to see this on a phone.",
  ],
  note:
    "Video is ours rather than a supplier's, so it is arranged with the rest of the session. It is quoted with everything else, because what it costs depends on how much of the event you want covered.",
} as const;

// ---------------------------------------------------------------------------
// MONEY
//
// READ THIS BEFORE ADDING ANYTHING TO IT.
//
// There are no payment terms for this service. Not an unpublished figure, not
// a split awaiting verification: nothing has been agreed. The record's first
// unanswered question is the price, with or without video.
//
// The proposal's twenty-five / seventy-five split and its three payment
// methods are NOT the default for the rest of the business. They were supplied
// for one service. `termsSet: false` is here so that the next person to open
// this file sees the absence recorded deliberately rather than as an oversight
// they can helpfully fix by copying the file next door.
// ---------------------------------------------------------------------------

export const revealPayment = {
  termsSet: false,
  teamNote:
    "No deposit, balance split or payment method has been agreed for a gender reveal. The proposal service's terms were supplied for the proposal and do not transfer. Until the owner sets them, this page states how the quotation works and nothing about how it is paid.",
  quoteNote:
    "There is no published price for a gender reveal. What it costs depends on how many people come, which decoration you choose and whether you want it filmed, so you get a figure in writing before you commit to anything.",
  points: [
    {
      title: "A written quotation first",
      detail:
        "For your date, your numbers and the setup you picked. It comes back after we have confirmed the roof, not before.",
    },
    {
      title: "Payment terms with the quotation",
      detail:
        "How and when you pay is confirmed in writing for your booking. We would rather tell you once, accurately, than publish terms here that turn out not to be the ones you are offered.",
    },
    {
      title: "Nothing on this website takes a payment",
      detail:
        "No card details are typed into any page here and no page charges you. An enquiry is a conversation, and it does not reserve the roof.",
    },
  ] satisfies RevealEntry[],
} as const;

// ---------------------------------------------------------------------------
// THE VENUE
//
// NO HOTEL IS NAMED, AND THAT IS NOT AN OVERSIGHT.
//
// The proposal file records "Palm Hotel" and a street, both supplied by the
// owner and both held back pending verification. Neither was ever said about
// a gender reveal. Importing them here would turn a held proposal fact into a
// published claim about a second service, which is the exact thing the brief
// for this page warned against twice.
//
// So this section uses the two SHARED constants from the experience record,
// which are true of every rooftop experience and already vetted, and adds the
// one thing this service specifically needs: guests are a venue question.
// ---------------------------------------------------------------------------

export const revealVenue = {
  heading: "A rooftop above Giza",
  location: ROOFTOP_LOCATION_NOTE,
  dependency: VENUE_DEPENDENCY,
  /** Confirmed by the record's third FAQ, verbatim in substance. */
  guestsNote:
    "How many people can come is a venue question rather than ours. Tell us the number when you enquire and we will confirm what the rooftop can take on your date.",
  /** Team-facing. Guarded: see scripts/check-flying-dresses.mts. */
  namingNote:
    "No venue is named on this page. A hotel name and address were supplied for the proposal service and are held there pending verification; nothing has been confirmed about which roof a gender reveal is held on, so this page describes the kind of place rather than naming one.",
} as const;

// ---------------------------------------------------------------------------
// THE PRACTICAL ANSWERS, AND THE ONE CROSS-SELL THAT IS REAL
//
// A custom page body replaces the shared `ExperienceDetail` renderer, which
// means the record's `durationNote`, `whoItIsFor` and `extras` stop being
// rendered unless this composition picks them up. Three of them are worth
// keeping and are repeated here verbatim in substance:
//
//   - the duration, because somebody planning an evening needs it;
//   - who it is for, because one of the three is a cross-sell;
//   - the maternity session on the same day, which is listed as
//     `delivery: "in-house"` HERE and reciprocated by the maternity record's
//     own extras ("A gender reveal on the same day"). Both sides of that
//     arrangement are in the owner's own description, which is what makes it
//     safe to put on the page.
// ---------------------------------------------------------------------------

export const revealPractical = {
  durationNote:
    "Usually ninety minutes to two hours, depending on how many people are coming and whether portraits are part of it.",
  leadTimeNote:
    "Two weeks or more, mainly so the decoration and any props can be arranged properly.",
  whoItIsFor: [
    "Parents who want the reveal itself captured rather than described.",
    "Families travelling together who want everyone in the frame.",
    "Anyone combining the announcement with a maternity session.",
  ],
  /** Confirmed on BOTH records. See the comment above before changing it. */
  maternityHeading: "Add a maternity session to the same day",
  maternityDetail:
    "A flying dress session for the pregnancy, on the same roof and the same evening, is something we do ourselves rather than arrange through anybody else. It is the one thing most people wish they had asked about afterwards, because everyone is already there and already dressed.",
  maternityLinkLabel: "See maternity and family sessions",
} as const;
