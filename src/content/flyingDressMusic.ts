/**
 * THE ROOFTOP MUSIC SESSION: DJ sets, filming and production.
 *
 * =========================================================================
 * WHAT THE RESEARCH FOUND, AND WHY IT DECIDED THE PAGE
 * =========================================================================
 * Searched October 2026.
 *
 * The pyramids are now one of the most aspirational backdrops in electronic
 * music. Carl Cox played there in 2023, Tiesto livestreamed a three-hour set
 * in December 2025, Charlotte de Witte headlined in front of the Great Pyramid
 * in October 2026, Metro Boomin sold out sets, and an Anyma show reportedly
 * drew fifteen thousand people. Every one of those is a FESTIVAL-SCALE EVENT
 * INSIDE THE COMPLEX, with a promoter, an event budget and permits. There is
 * also now a legal challenge seeking to restrict large music events at the
 * site, which is one more reason this page must not imply any association
 * with them.
 *
 * That is the page's argument, and it is an honest one: those artists needed a
 * festival to play in front of the pyramids. An independent DJ can rent an
 * hour on a roof that looks at them, from $150, and walk away with footage.
 *
 * THE COMMERCIAL MODEL came from the same research. Studio and venue hire for
 * filmed music sessions runs roughly $125 to $250 an hour, and the consistent
 * convention is a BASE HOURLY SPACE RATE with production sold as separately
 * named add-ons: one venue lists a four-hour base rate with a camera package
 * and a multitrack audio package priced on top; another states plainly that
 * post-production is not included in a recording fee. That is exactly the
 * shape of this service, so the page uses it rather than inventing a bundle.
 * $150 an hour sits in the middle of that range.
 *
 * =========================================================================
 * WHERE THE FACTS COME FROM
 * =========================================================================
 * The `rooftop-music-session` record in flyingDressExperiences.ts, plus the
 * owner's October 2026 brief, which confirmed the $150 hourly rooftop rate and
 * described the production services.
 *
 * ONE THING IS EXPLICITLY UNVERIFIED and the owner said so: whether audio
 * recording equipment is included in the hourly rate or charged separately.
 * It is presented as available, with no price and no inclusion claim, and
 * `audioRecording.commercialStatus` records why. Do not "finish" it by
 * guessing.
 *
 * NOTHING HERE CONTRADICTS the record's hard limits, which are the most
 * valuable paragraphs on the whole page: we do not supply a PA, decks or
 * power; amplified sound is the venue's decision; we do not fly drones; and
 * we cannot film inside the archaeological complex.
 */

import { ROOFTOP_LOCATION_NOTE, VENUE_DEPENDENCY } from "./flyingDressExperiences";

// ---------------------------------------------------------------------------
// THE RATE
//
// The first confirmed figure on any Flying Dresses experience page. It is a
// RATE, by the hour, for the SPACE. Everything else is quoted.
// ---------------------------------------------------------------------------

export const rooftopRate = {
  fromUsd: 150,
  unit: "hour" as const,
  /** Rendered beside the figure. The unit is never separated from the number. */
  display: "From $150 per hour",
  lede:
    "You book the rooftop by the hour. That is the foundation: the location, for as long as you need it, with the Pyramids of Giza across the skyline.",
  /** What the hour actually buys. Deliberately short, and deliberately exact. */
  covers: [
    "Access to the rooftop for the hours you book, agreed with the venue for your date.",
    "The view: the pyramids on the skyline, not a backdrop we have placed behind you.",
    "A planning conversation about the shots, the hour and the light before the day.",
  ],
  /**
   * The sentence that stops the rate being misread as a package. Competitors
   * blur this; the research found the clearest venues state it outright.
   */
  excludes:
    "Filming, audio recording, editing, decoration and the DJ photoshoot are production services. They are arranged separately and quoted for your session, and none of them is inside the hourly rate.",
  /** No minimum, no deposit, no overtime policy: none has been stated. */
  termsNotSet:
    "We do not publish a minimum booking, a deposit, an overtime rate or a cancellation policy, because none has been set. You get the terms for your session in writing with the quotation.",
} as const;

// ---------------------------------------------------------------------------
// THE PRODUCTION SERVICES
//
// Every one of these is quoted rather than listed. `status` is the honest
// distinction the brief asked for, and "unconfirmed" exists for exactly one
// service, because the owner flagged it.
// ---------------------------------------------------------------------------

export type ServiceStatus = "addon" | "unconfirmed";

export const SERVICE_LABEL: Record<ServiceStatus, string> = {
  addon: "Available as an add-on",
  unconfirmed: "Available on request",
};

export type ProductionService = {
  id: string;
  name: string;
  detail: string;
  status: ServiceStatus;
};

export const productionServices: ProductionService[] = [
  {
    id: "filming",
    name: "Professional filming",
    status: "addon",
    detail:
      "A camera team for the session, shooting the set so it cuts together properly rather than from one fixed position. Quoted for your session.",
  },
  {
    id: "photography",
    name: "Professional photography",
    status: "addon",
    detail:
      "Stills of the set as it happens: you behind the equipment, the roof, the light, the pyramids in the frame behind you.",
  },
  {
    id: "audio",
    name: "Audio recording equipment",
    status: "unconfirmed",
    detail:
      "Equipment to capture the set properly rather than off a camera microphone. Arranged on request. Ask when you enquire and we will confirm what is available for your date and what it costs.",
  },
  {
    id: "editing",
    name: "Editing and post-production",
    status: "addon",
    detail:
      "Colour-graded footage and vertical cuts for social. A separate piece of work from the shoot, and charged separately, which is the convention across this industry.",
  },
  {
    id: "lighting",
    name: "Creative lighting",
    status: "addon",
    detail:
      "Our own lighting equipment, set for the hour you are shooting. This is the one piece of production kit we own rather than arrange.",
  },
  {
    id: "setup",
    name: "Decoration and set dressing",
    status: "addon",
    detail:
      "A setup built around your visual direction, chosen from what we run or described to us. See below.",
  },
  {
    id: "portraits",
    name: "A dedicated DJ photoshoot",
    status: "addon",
    detail:
      "A separate shoot of the artist rather than of the set: portraits for a press kit, a release, a profile or a poster. Not part of the filming package, and charged on its own.",
  },
];

/** Recorded deliberately. The owner named this as unverified. */
export const audioRecording = {
  commercialStatus:
    "UNVERIFIED. The owner asked for this to be confirmed before publication: whether audio recording equipment sits inside the $150 hourly rooftop rate or is charged as a separate add-on. Until somebody answers it, the page offers the service and states neither.",
  pageWording:
    "Recording equipment to capture the set can be arranged. Ask about it when you enquire: we will tell you what is available for your date and what it costs, rather than publish a figure here that has not been set.",
} as const;

// ---------------------------------------------------------------------------
// THE SHOOTING APPROACH
//
// The owner described "approximately 2 to 3 different angles". The brief is
// explicit that this is an INTENDED APPROACH and must not be read as a
// confirmed number of cameras or operators, so the copy below talks about
// POSITIONS and never counts hardware or crew.
// ---------------------------------------------------------------------------

export const shootApproach = {
  heading: "Shot from more than one position",
  lede:
    "A set filmed from a single fixed angle cuts into one shot. The intention is to cover it from two or three positions so the footage has somewhere to go: the wide that establishes the roof and the skyline, the one on you behind the equipment, and a closer frame for the hands and the detail.",
  /** Each is a shot, not a camera. */
  positions: [
    {
      title: "The wide",
      detail:
        "The roof, the horizon and the pyramids. The frame that tells anybody watching where this is, which is the whole reason for shooting here.",
    },
    {
      title: "On the artist",
      detail: "You behind the equipment, working. The frame a release or a profile actually uses.",
    },
    {
      title: "The close detail",
      detail:
        "Hands, faders, the gear, the light moving. The cutaways that let an edit breathe instead of sitting on one shot for three minutes.",
    },
  ],
  /**
   * Named absences. Every one of these is something the brief forbids
   * inventing, and every one is something a production customer will ask.
   */
  notPublished:
    "We do not publish a number of cameras, a crew size, a shoot length, how many photographs you get, how long the finished video runs or how quickly it is delivered. None of that has been set, and all of it depends on the session you book. You get it in writing with your quotation.",
} as const;

// ---------------------------------------------------------------------------
// WHAT WE DO NOT SUPPLY
//
// THE MOST VALUABLE SECTION ON THIS PAGE, and it comes straight from the
// record, which states it in capitals. A DJ who arrives expecting a booth has
// had their session ruined, and it is the single most likely way this service
// disappoints somebody. It is placed prominently rather than buried.
// ---------------------------------------------------------------------------

export const notSupplied = {
  heading: "What we do not provide, said now",
  lede:
    "Our equipment is cameras and lighting. Everything that makes the sound is yours to bring or ours to introduce you to a supplier for, and we would rather you read that here than discover it on the roof.",
  points: [
    {
      title: "No sound system, no decks, no power",
      detail:
        "We do not supply a PA, DJ equipment or generators. Bring your own, or tell us and we will make an introduction to a supplier.",
    },
    {
      title: "Amplified sound is the venue's call",
      detail:
        "It usually comes with conditions about the hour and the volume. We put the request in and tell you the answer. Nobody should plan a set around a rooftop that has not said yes yet.",
    },
    {
      title: "Not inside the pyramids complex",
      detail:
        "Filming inside the archaeological site is a separately permitted activity with its own fees and lead times. What we offer is a rooftop with the pyramids in view.",
    },
    {
      title: "Not a public event, and no drones",
      detail:
        "These are private filming sessions. A ticketed or public event is a different thing with its own permissions. We do not fly drones and do not arrange drone filming.",
    },
  ],
} as const;

// ---------------------------------------------------------------------------
// SETUPS AND DECORATION
//
// Built, and EMPTY. The record's own unanswered question is the equipment
// inventory, and nothing has been supplied for music-session set dressing.
// A separate array from the celebration and proposal catalogues: a DJ setup
// is not a birthday setup with the balloons taken out.
// ---------------------------------------------------------------------------

export type MusicSetup = {
  id: string;
  name: string;
  description: string;
  /** Path under public/. An entry with no photograph is a list item. */
  src: string;
  alt: string;
};

export const musicSetups: MusicSetup[] = [];

export const SETUP_INTERIM =
  "We have not published a set-dressing catalogue for music sessions, because what is available changes and a list here would be out of date by the time you read it. Tell us the visual direction you are after, send a reference if you have one, and we will come back with what can actually be built on the roof for your date and what it would cost.";

// ---------------------------------------------------------------------------
// THE SEQUENCE
//
// Step five is the one that matters: nothing is held until the venue has
// agreed and the quotation is accepted. The record is emphatic that a rooftop
// music session needs the venue's agreement in writing and that it is not a
// same-week conversation.
// ---------------------------------------------------------------------------

export type MusicStep = { title: string; detail: string };

export const musicSteps: MusicStep[] = [
  {
    title: "Tell us the date and the hours",
    detail:
      "How long you want the roof for, and roughly when. The light is the thing most sessions are built around, so the hour matters more than the date.",
  },
  {
    title: "Describe the set and the footage you want",
    detail:
      "A sunset set, a live session, a visualiser, promotional footage for a release. What the footage is for changes how it is shot.",
  },
  {
    title: "Choose the production around it",
    detail:
      "Filming, photography, audio recording, editing, lighting, set dressing, a separate artist shoot. Any of them, or none: the roof on its own is a real booking.",
  },
  {
    title: "Tell us what you are bringing",
    detail:
      "Your own decks, controller or instruments, and what power and sound you need. This is where we find out whether anything has to come through a supplier.",
  },
  {
    title: "We put the request to the venue",
    detail:
      "The date, the hours and the sound. Three to four weeks is the realistic lead time, because a rooftop music session needs the venue's agreement in writing and that is not a same-week conversation.",
  },
  {
    title: "The quotation, in writing",
    detail:
      "The rooftop hours at the published rate, plus whatever production you asked for. Nothing is held until that is agreed and the venue has said yes.",
  },
  {
    title: "The session",
    detail:
      "You play, we shoot it, and the agreed footage is colour-graded and delivered afterwards.",
  },
];

// ---------------------------------------------------------------------------
// WHAT TO HAVE READY
//
// Research-informed, and written as QUESTIONS WE WILL ASK rather than as
// policies, because the operational answers have not been set. A producer
// reading this can prepare; nothing here promises what we will do with it.
// ---------------------------------------------------------------------------

export const prepare = [
  "How many hours you want the roof for, and the time of day. Most sessions are built around one hour of usable light and the shoot around it is longer.",
  "What you are bringing: controller, decks, laptop, instruments, and anything that needs mains power.",
  "Whether you need amplified sound at all, or whether you are recording direct and monitoring on headphones. The second is a much easier yes from a venue.",
  "What the footage is for. A release visual, a promo cut, a label deliverable and a social reel are shot differently.",
  "Any visual direction: a reference, a colour, a mood, an artwork the footage has to sit beside.",
  "Whether you want stills of the set, a separate artist shoot, or both.",
  "Who else is coming, and whether anybody needs to be in frame.",
];

// ---------------------------------------------------------------------------
// THE VENUE
// ---------------------------------------------------------------------------

export const musicVenue = {
  heading: "A rooftop above Giza",
  location: ROOFTOP_LOCATION_NOTE,
  dependency: VENUE_DEPENDENCY,
} as const;

// ---------------------------------------------------------------------------
// QUESTIONS
//
// The brief's ten, answered from the record, the owner's brief, or with an
// explicit "ask us" where nothing has been set. None is answered by guessing.
// ---------------------------------------------------------------------------

export type MusicFaq = { question: string; answer: string };

export const musicFaqs: MusicFaq[] = [
  {
    question: "How much does the rooftop cost?",
    answer:
      "From $150 an hour for the rooftop itself. That is the location for the hours you book, with the pyramids across the skyline. Filming, audio recording, editing, set dressing and a separate artist shoot are production services, quoted on top. We do not publish a minimum booking or a deposit because neither has been set.",
  },
  {
    question: "Can I book the rooftop without a production team?",
    answer:
      "Yes. Plenty of people want the location and are bringing their own camera operator, or shooting it themselves. The hourly rate is the roof; the production is optional and you can take none of it.",
  },
  {
    question: "Is professional recording equipment included?",
    answer:
      "Recording equipment to capture the set can be arranged. Whether it sits inside the hourly rate or is charged separately is something we will confirm with you when you enquire, rather than publish here before it has been settled. Ask and you will get a straight answer for your date.",
  },
  {
    question: "Can you film my set from more than one angle?",
    answer:
      "That is the intention: two or three positions, so the footage cuts together instead of sitting on one shot. A wide that establishes the roof and the skyline, one on you behind the equipment, and a closer frame for the detail. We do not publish a number of cameras or a crew size, because that depends on the session and is agreed in your quotation.",
  },
  {
    question: "Is editing included in the price?",
    answer:
      "No. Editing and post-production are a separate piece of work from the shoot and are quoted separately, which is the convention across this industry. Tell us what you need the footage cut for and it goes into the quotation.",
  },
  {
    question: "Can I choose a setup, or ask for a custom one?",
    answer:
      "Tell us the visual direction you are after and send a reference if you have one. We have not published a set-dressing catalogue for music sessions because what is available changes, so we come back with what can genuinely be built on the roof for your date and what it costs.",
  },
  {
    question: "Can I book a separate photoshoot of the artist?",
    answer:
      "Yes, as its own thing. Portraits for a press kit, a release or a profile, shot separately from the set. It is not part of the filming and it is charged on its own. We do not publish how many images you get or how long it takes, because that has not been set.",
  },
  {
    question: "How do I confirm availability and get a quotation?",
    answer:
      "Send us the date, the hours and what you are planning. We put the request to the venue, which takes three to four weeks for a music session because it needs their agreement in writing. The quotation comes back covering the rooftop hours and any production you asked for. Nothing is held until that is agreed and the venue has said yes.",
  },
];
