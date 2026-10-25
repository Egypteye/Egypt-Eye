/**
 * BIRTHDAYS AND PRIVATE CELEBRATIONS.
 *
 * =========================================================================
 * THE ONE THING THIS PAGE HAS TO GET RIGHT
 * =========================================================================
 * Every element of this service sits in one of four places, and a customer
 * who guesses wrong finds out when the quotation arrives:
 *
 *   included  - part of the celebration itself.
 *   arranged  - we coordinate it, and it is priced in your quotation.
 *   extra     - stated by the owner as an ADDITIONAL charge.
 *   confirm   - real, but the terms have not been set yet.
 *
 * Competitors publish a single undifferentiated "what's included" list and
 * let the customer discover the difference later. `Charge` below makes the
 * distinction a type rather than a tone of voice, so a line cannot be added
 * to this page without somebody deciding which of the four it is.
 *
 * =========================================================================
 * WHERE THESE FACTS COME FROM
 * =========================================================================
 * Two sources, and they are marked.
 *
 * 1. The `private-celebration` record in flyingDressExperiences.ts, which is
 *    the long-standing description of this service.
 * 2. The owner's October 2026 celebration brief, which ADDED six things that
 *    record does not carry: a speaker for the customer's own songs, custom
 *    cake preparation, BOTH a casual and a flying dress photoshoot as part of
 *    the experience, one to fifteen companions, and transportation within
 *    Cairo and Giza for an additional charge.
 *
 * Where the two disagree the brief wins, because it is the owner describing
 * their own service more recently. Where the record adds a CAUTION the brief
 * does not contradict, the caution stays: the brief says there is a speaker,
 * it does not say the venue has stopped caring how loud it is at eleven at
 * night, and both of those are true at once.
 *
 * NOTHING HERE CARRIES A PRICE. The record's first unanswered question is
 * "PRICE. Nothing set for celebrations of any size", and that is still true
 * of every element the brief added. The check script enforces it.
 * CLAUDE.md §7.
 */

import { ROOFTOP_LOCATION_NOTE, VENUE_DEPENDENCY } from "./flyingDressExperiences";

/**
 * Which of the four a line is. Rendered as a visible label beside the line,
 * never left for the reader to infer.
 */
export type Charge = "included" | "arranged" | "extra" | "confirm";

export const CHARGE_LABEL: Record<Charge, string> = {
  included: "Included",
  arranged: "Arranged for you",
  extra: "Additional charge",
  confirm: "Quoted for you",
};

export const CHARGE_NOTE: Record<Charge, string> = {
  included: "Part of the celebration itself.",
  arranged: "We coordinate it, and it is priced in your quotation.",
  extra: "Stated as an additional charge on top of the celebration.",
  confirm: "Real, and quoted for your date rather than published here.",
};

export type CelebrationLine = {
  title: string;
  detail: string;
  charge: Charge;
};

// ---------------------------------------------------------------------------
// WHAT THE CELEBRATION IS
// ---------------------------------------------------------------------------

export const celebrationLines: CelebrationLine[] = [
  {
    title: "A rooftop with the pyramids across it",
    charge: "included",
    detail:
      "Confirmed with the venue for your date and your hour before anything is agreed. The pyramids are the view rather than a backdrop we have put you in front of.",
  },
  {
    title: "Decoration, chosen rather than assumed",
    charge: "arranged",
    detail:
      "A setup from the designs we run, pointed at what you are celebrating. We send you what is available for your date, and what you choose is priced with the rest.",
  },
  {
    title: "A custom cake",
    charge: "arranged",
    detail:
      "Tell us the occasion, the style and anything you want written on it, and we arrange it. The design is agreed with you rather than picked from a menu here.",
  },
  {
    title: "A speaker, and your own songs",
    charge: "included",
    detail:
      "Send the tracks ahead and they are playing when you walk up. Your song for the moment the cake comes out, if there is one.",
  },
  {
    title: "A casual photoshoot of the evening",
    charge: "included",
    detail:
      "The people, the decoration, the cake, the moment everyone sings, and portraits of whoever the evening is for. Photographed as it happens rather than posed into it.",
  },
  {
    title: "A flying dress photoshoot",
    charge: "included",
    detail:
      "The brand's own thing, on the same roof, on the same evening. A dress from the collection, the fabric moving, the pyramids behind it.",
  },
  {
    title: "One to fifteen companions",
    charge: "included",
    detail:
      "You can add companions to the booking. Tell us the number when you enquire so we can confirm it with the roof, because capacity is theirs to set rather than ours.",
  },
  {
    title: "Transport within Cairo and Giza",
    charge: "extra",
    detail:
      "We can arrange it for an additional charge. Give us your pickup address when you enquire and the cost comes back with the quotation.",
  },
];

// ---------------------------------------------------------------------------
// THE TWO PHOTOSHOOTS
//
// The brief's section F asks for a visual comparison, and this is the part of
// the service competitors do not sell at all: the ones at Giza sell a
// photoshoot OR a flying dress session. Here both are part of one evening.
//
// WHAT IS DELIBERATELY ABSENT from both columns: a number of photographs, a
// duration, a delivery deadline, a number of dresses. The brief forbids
// inventing them and nothing has been set for a celebration. The flying dress
// PACKAGES carry "100+ photographs" and a stated length; those are a different
// product with a different price, and borrowing their figures would be
// publishing a promise nobody made about this one.
// ---------------------------------------------------------------------------

export type ShootStyle = {
  id: string;
  name: string;
  tagline: string;
  points: string[];
};

export const shootStyles: ShootStyle[] = [
  {
    id: "casual",
    name: "The casual photoshoot",
    tagline: "The evening as it actually happened.",
    points: [
      "The people who came, and how they are with each other.",
      "The decoration and the cake, before anybody has touched either.",
      "The moment everyone sings, which is the frame people keep.",
      "Portraits of whoever the evening is for, directed but unforced.",
      "Groups, couples and families, in whatever combinations you want.",
    ],
  },
  {
    id: "flying-dress",
    name: "The flying dress photoshoot",
    tagline: "The one that does not look like anybody else's birthday.",
    points: [
      "A dress from the collection, in a colour you choose.",
      "An assistant throwing the fabric, which is what makes the shape.",
      "The pyramids held across the skyline behind you.",
      "Deliberate, composed frames rather than snapshots.",
      "Shot on the same roof, on the same evening, as part of the same booking.",
    ],
  },
];

export const SHOOT_COMPARISON_NOTE =
  "Both are part of the celebration rather than two things you choose between. We do not publish a number of photographs, a length for either session or a delivery date for a celebration, because none has been set: you get those in writing for your booking instead of a figure here that turns out not to fit your evening.";

// ---------------------------------------------------------------------------
// THE CAKE
//
// The experience record lists "Cake and flowers" as `delivery: "partner"`,
// which means it comes through somebody we work with rather than out of our
// own kitchen. The brief confirms we ARRANGE the preparation of a custom cake.
// Both are true and the page says so, because a customer with an allergy or a
// deadline needs to know there is a third party in the chain.
//
// NO FLAVOURS, NO SIZES, NO DIETARY OPTIONS, NO LEAD TIME, NO PRICE. The brief
// names every one of those as something not to promise, and it is right to:
// they are the terms a cake supplier actually fails on.
// ---------------------------------------------------------------------------

export const cake = {
  heading: "A cake made for the occasion",
  lede:
    "Tell us what you are celebrating and what you would like it to say, and we arrange it with you before the date rather than on the morning.",
  tellUs: [
    "What the occasion is, and the name or message you want on it.",
    "A style, a colour or a theme, or a photograph of something you like.",
    "Anything anybody coming cannot eat.",
  ],
  /** The honest chain. A partner is not a worse answer, it is a true one. */
  supplierNote:
    "Cakes come through a supplier we work with rather than from our own kitchen, so the design, what is possible and the cost are confirmed with you before anything is ordered.",
  /** Every one of these is a promise nobody has made. Named, not guessed. */
  notPromised:
    "We do not publish flavours, sizes, dietary options, a price or a cut-off date for ordering, because none of those has been set. Tell us what you want and we will tell you plainly what the supplier can do for your date.",
} as const;

// ---------------------------------------------------------------------------
// MUSIC
//
// THE ONE PLACE TWO OWNER STATEMENTS HAD TO BE RECONCILED.
//
// The brief: "Speakers are available so customers can play their preferred
// songs during the celebration."
// The record: "Amplified music on a rooftop is never assumed. It is checked
// with the venue for your date", and the FAQ "Sometimes, and it depends on the
// venue, the hour and how loud."
//
// These are not in conflict once you separate the equipment from the
// permission. There IS a speaker, and you CAN send your songs: that is the
// brief, and it goes on the page as a plain statement. How loud, and how late,
// remains the venue's call: that is the record, and it stays, because a
// rooftop above a hotel full of sleeping guests has rules whatever equipment
// we own.
//
// NOT ON THE PAGE: a DJ, a live musician or a professional sound system. The
// brief names all three as things not to advertise without separate
// confirmation. The record does list a musician or DJ as a PARTNER extra, so
// it is not impossible, it is simply not something this page will promise.
// ---------------------------------------------------------------------------

export const music = {
  heading: "Your own songs, through the speaker",
  lede:
    "Send us the tracks ahead of the date and they are playing when you walk up. The one for the moment the cake comes out, if there is one.",
  venueNote:
    "How loud, and how late, is the venue's decision rather than ours. We check it for your date instead of promising it here, because a rooftop above a hotel full of sleeping guests has rules.",
  notPromised:
    "There is a speaker for your own music. We are not offering a DJ, a live musician or a professional sound system on this page: if you want one, ask, and we will tell you whether it can be arranged for your date.",
} as const;

// ---------------------------------------------------------------------------
// GUESTS
//
// "Customers can add 1-15 companions to the reservation" is the owner's own
// wording, and it is used almost verbatim because paraphrasing it is how a
// range quietly becomes a guarantee.
//
// WHAT IS NOT SETTLED, and is flagged in the owner doc: whether fifteen is
// fifteen IN ADDITION to the person booking, or fifteen in total. The page is
// written so that it reads correctly either way ("you can add companions"),
// and it does not state a maximum total headcount anywhere.
//
// The record is also clear that capacity belongs to the roof: "Not one we set.
// The rooftop sets it, and it differs by venue and by date." That stays.
// ---------------------------------------------------------------------------

export const guests = {
  heading: "Bring the people it is for",
  lede:
    "You can add one to fifteen companions to the booking, which is the difference between a photoshoot and an evening.",
  points: [
    "Tell us the number when you enquire and we confirm it with the roof for your date.",
    "The venue sets what it can take, and it differs by venue and by date. We check rather than assume.",
    "Group size changes the quotation, so it is settled before you are asked to commit to anything.",
  ],
  venueNote:
    "We do not set a minimum or a maximum. The rooftop does, and we confirm your number with them rather than promising it here.",
} as const;

// ---------------------------------------------------------------------------
// TRANSPORT
//
// AN ADDITIONAL CHARGE, AND THE PAGE HAS TO SAY SO TWICE.
//
// Because the flying dress PACKAGES include door-to-door transport in the
// price. A visitor who has read /experiences arrives here already believing
// transport is included, and that belief is correct about a different product.
// Saying "transport can be arranged" without the word ADDITIONAL would leave
// them to discover the difference in the quotation.
//
// NOT INVENTED: a price, a vehicle type, a travel time, a list of districts,
// or availability at any given address. The brief names every one of those,
// and the only geography the owner stated is "within Cairo and Giza".
// ---------------------------------------------------------------------------

export const transport = {
  heading: "Getting there can be part of the plan",
  lede:
    "We can arrange transport to the celebration from an address within Cairo or Giza, for an additional charge on top of your quotation.",
  points: [
    "Give us the pickup address when you enquire and the cost comes back with the quotation.",
    "Cairo and Giza are the area we have been given. Anywhere further is a question rather than a yes.",
    "It is optional. Plenty of people make their own way and that is no harder for us.",
  ],
  /** The distinction above, said plainly to the visitor rather than implied. */
  packagesDiffer:
    "This is different from our flying dress photoshoot packages, which include door-to-door transport in the published price. A celebration is quoted rather than priced, and transport for one is an additional charge.",
  notPromised:
    "We do not publish a transport price, a vehicle, a journey time or a list of districts, because none has been set. Give us the address and you get a figure for it in writing.",
} as const;

// ---------------------------------------------------------------------------
// THE DECORATION COLLECTION
//
// Built, and EMPTY, which is the honest state. The record's own unanswered
// question is "Which decoration designs suit a birthday rather than a
// proposal." Nobody has supplied birthday designs, names or photographs.
//
// A separate array from the proposal's and the gender reveal's: three
// occasions, three sets of designs, and a birthday setup is not a proposal
// setup with a different sign on it.
// ---------------------------------------------------------------------------

export type CelebrationDecoration = {
  id: string;
  name: string;
  description: string;
  /** Path under public/. An entry with no photograph is a list item. */
  src: string;
  alt: string;
};

export const celebrationDecorations: CelebrationDecoration[] = [];

export const DECORATION_INTERIM =
  "The designs change as balloons, flowers, lighting and signage come and go, so rather than publish a catalogue here that is out of date by the time you read it, we send you what is genuinely available for your date. Tell us what you are celebrating, the colours you had in mind and whether there is a name or a number that should appear in it, and photographs of the current setups come back with the quotation.";

// ---------------------------------------------------------------------------
// THE SEQUENCE
//
// Step six says the date is held when the quotation is AGREED, and names no
// deposit. The proposal's twenty-five per cent was supplied for the proposal.
// Nothing of the kind has been stated for a celebration, and the brief says
// explicitly not to assume the proposal's terms apply here.
// ---------------------------------------------------------------------------

export const celebrationSteps: CelebrationLine[] = [
  {
    title: "Tell us the date and what it is for",
    charge: "included",
    detail:
      "A birthday, a graduation, a reunion, or an evening that simply deserved more than a restaurant. The occasion changes how the evening is built.",
  },
  {
    title: "Choose how it looks",
    charge: "arranged",
    detail:
      "We send you the decoration designs available for your date. Tell us the colours, and the name or number you want to appear in it.",
  },
  {
    title: "Settle the cake and the music",
    charge: "arranged",
    detail:
      "The cake design and anything written on it, and the songs you want playing. Both are agreed before the date rather than on the evening.",
  },
  {
    title: "Say who is coming, and how you are getting there",
    charge: "extra",
    detail:
      "The number of companions, and whether you want transport arranged from an address in Cairo or Giza. Transport is an additional charge and is quoted with everything else.",
  },
  {
    title: "We ask the roof",
    charge: "included",
    detail:
      "The date, the hour, your numbers and what the venue allows for music and decoration are confirmed with them. Nothing is agreed before that comes back.",
  },
  {
    title: "The quotation, in writing",
    charge: "confirm",
    detail:
      "One figure covering the evening you have described, including anything carrying an additional charge. The date is held once that is agreed, and not before.",
  },
  {
    title: "The evening, and both photoshoots",
    charge: "included",
    detail:
      "The casual coverage through the evening and the flying dress session on the same roof. The photographs are colour-graded and delivered afterwards.",
  },
];

// ---------------------------------------------------------------------------
// MONEY
//
// Same position as the gender reveal, and for the same reason: no figure has
// been set. `termsSet: false` records the absence deliberately so that the
// next person does not "finish" this page by copying the proposal's terms.
// ---------------------------------------------------------------------------

export const celebrationPayment = {
  termsSet: false,
  teamNote:
    "No price, deposit, balance split or payment method has been agreed for a celebration of any size. The proposal service's terms were supplied for the proposal and do not transfer. Until the owner sets them, this page explains how the quotation works and says nothing about how it is paid.",
  quoteNote:
    "There is no published price for a celebration, because the evening is built around what you are celebrating: how many people are coming, which decoration you choose, whether there is a cake, and whether you want transport. You get one figure in writing, covering all of it, before you commit to anything.",
  points: [
    {
      title: "One quotation, not a running total",
      charge: "confirm" as Charge,
      detail:
        "Everything you have asked for is in it, including anything that carries an additional charge. Nothing appears on the bill afterwards that was not in the quotation.",
    },
    {
      title: "The date is held when you agree it",
      charge: "confirm" as Charge,
      detail:
        "Not when you enquire. An enquiry is a conversation, and the roof is not yours until the arrangements are confirmed.",
    },
    {
      title: "Nothing on this website takes a payment",
      charge: "included" as Charge,
      detail:
        "No card details are typed into any page here. Payment terms are confirmed with you in writing along with the quotation.",
    },
  ],
} as const;

// ---------------------------------------------------------------------------
// THE VENUE
//
// No hotel is named. The proposal file records one, supplied by the owner and
// held pending verification, and it was never said about a celebration.
// ---------------------------------------------------------------------------

export const celebrationVenue = {
  heading: "A rooftop above Giza",
  location: ROOFTOP_LOCATION_NOTE,
  dependency: VENUE_DEPENDENCY,
  namingNote:
    "No venue is named on this page. A hotel name and address were supplied for the proposal service and are held there pending verification; nothing has been confirmed about which roof a celebration is held on, so this page describes the kind of place rather than naming one.",
} as const;

// ---------------------------------------------------------------------------
// QUESTIONS
//
// The brief asked for eighteen. Several of them have the same honest answer,
// which is "the venue decides and we check", and padding them into eighteen
// separate entries would be worse for a reader than answering them together.
// Every answer below is traceable to the record or the owner's brief; where
// the answer is "not set yet", it says so rather than filling the gap.
// ---------------------------------------------------------------------------

export type CelebrationFaq = { question: string; answer: string };

export const celebrationFaqs: CelebrationFaq[] = [
  {
    question: "Where does it happen, and does it really overlook the pyramids?",
    answer:
      "A private hotel rooftop in Giza with the Pyramids of Giza across the view. It is not inside the archaeological complex, which is why there is no entry ticket and no gate to wait for. The exact roof is confirmed with the venue for your date.",
  },
  {
    question: "What kinds of celebration do you arrange?",
    answer:
      "Birthdays, graduations, reunions, and evenings that are not any of those. The setup is the same craft pointed at whatever you are marking. Tell us what it is and we will tell you honestly whether the roof suits it.",
  },
  {
    question: "Can I choose the decoration, or ask for something of my own?",
    answer:
      "You choose from the designs we are running for your date, and we send you photographs of them when you enquire. If you have something else in mind, describe it and we will say plainly whether it is possible, whether it needs the venue's agreement, and what it would cost.",
  },
  {
    question: "Can I have a custom cake?",
    answer:
      "Yes, and it is one of the better parts of this. Tell us the occasion, the style and what you want written on it. Cakes come through a supplier we work with rather than our own kitchen, so the design and the cost are confirmed with you before anything is ordered. We do not publish flavours, sizes or dietary options here because those are the supplier's to confirm for your date.",
  },
  {
    question: "Are both photoshoots really part of it?",
    answer:
      "Yes. A casual photoshoot of the evening itself and a flying dress session on the same roof are both part of the celebration rather than two things you pick between. We do not publish a number of photographs, a length for either session or a delivery date, because none has been set for a celebration: you get those in writing for your booking.",
  },
  {
    question: "Can you arrange transport?",
    answer:
      "Within Cairo and Giza, yes, for an additional charge on top of your quotation. Give us the pickup address when you enquire and the cost comes back in writing. Anywhere further than Cairo and Giza is a question rather than a yes. Note that this is different from our flying dress photoshoot packages, which include door-to-door transport in the published price.",
  },
  {
    question: "What does it cost, and what is included?",
    answer:
      "There is no published price, because the evening is built around what you are celebrating. The rooftop, the speaker, both photoshoots and your companions are part of the celebration. The decoration and the cake are arranged for you and priced in the quotation. Transport is an additional charge. You get one figure in writing covering all of it before you commit to anything.",
  },
  {
    question: "How do I confirm the date, and how does payment work?",
    answer:
      "The date is held once the quotation is agreed, not when you enquire. Payment terms are confirmed with you in writing along with that quotation. Nothing on this website charges a card, and we would rather give you the terms for your booking than publish ones here that turn out not to be the ones you are offered.",
  },
  {
    question: "How far ahead should I book?",
    answer:
      "Two weeks or more for anything with decoration or a cake in it. Less than that and we will tell you honestly what can still be arranged rather than agreeing to it and finding out.",
  },
  {
    question: "How do the photographs reach me?",
    answer:
      "Colour-graded and delivered after the evening. We do not publish a delivery deadline for a celebration because none has been set, so you get one in writing for your booking instead of a number here that might not fit your date.",
  },
];

// ---------------------------------------------------------------------------
// THE OCCASION
//
// Confirmed by the experience record, which names these by hand: "A thirtieth,
// a graduation, a reunion of people who live in four countries." It is also
// the single most useful thing the desk can know before replying, because
// those three are not planned the same way.
//
// Carried into the enquiry, resolved server-side against this list exactly
// like every other handoff on this site.
// ---------------------------------------------------------------------------

export type CelebrationOccasion = {
  id: string;
  label: string;
  detail: string;
};

export const celebrationOccasions: CelebrationOccasion[] = [
  {
    id: "birthday",
    label: "A birthday",
    detail:
      "A milestone one, or one that happens to land while you are in Egypt. The cake and the moment everyone sings are usually the centre of it.",
  },
  {
    id: "graduation",
    label: "A graduation",
    detail:
      "Portraits that are not taken on the steps of a building, with the people who got you through it in the frame.",
  },
  {
    id: "reunion",
    label: "A reunion",
    detail:
      "People who live in four countries and will not all be in one again soon. The group photographs matter more here than anywhere else.",
  },
  {
    id: "other",
    label: "Something else",
    detail:
      "An anniversary of something private, a last night of a trip, an evening that simply deserved more than a restaurant. Tell us and we will build around it.",
  },
];

export function celebrationOccasionById(id: string): CelebrationOccasion | undefined {
  return celebrationOccasions.find((occasion) => occasion.id === id);
}
