/**
 * "Shakira let you down? Egypt Eye got you." — the November 2026 campaign.
 *
 * Everything the campaign says lives here: dates, packages, itineraries, the
 * party, and the switches that turn it off. The page renders this file and
 * holds no facts of its own, so the owner can change a date or retire the
 * whole thing without anyone reading JSX.
 *
 * WHAT THIS FILE REFUSES TO CONTAIN, and why each one matters:
 *
 *   - No prices. None were supplied, and a price on a live travel page is a
 *     commitment. Every package converts through an enquiry instead.
 *   - No villa address, name, start time, end time or facilities. The venue
 *     is not booked. A fabricated address on a page selling a night out is
 *     the single most damaging thing this campaign could publish.
 *   - No accommodation and no flights. Egypt Eye sells tours; travellers
 *     arrange their own.
 *   - No seat counts, no "only N left", no deadline. Nobody has given a
 *     capacity, and inventing scarcity on a four-day runway is the oldest
 *     bad instinct in travel marketing.
 *
 * Egypt Eye is not affiliated with Shakira, her management, the promoter or
 * the ticketing providers. The headline is independent marketing copy about a
 * publicly reported postponement; nothing here implies otherwise.
 */

export type ItineraryStop = {
  label: string;
  /**
   * Set where the activity is planned but not yet operationally confirmed.
   * Rendered as a visible qualifier, never quietly dropped — a traveller who
   * books for the felucca must see that it is subject to confirmation.
   */
  pending?: string;
};

export type CampaignDay = {
  /** ISO date. The page derives every displayed date from this. */
  date: string;
  title: string;
  place: string;
  stops: ItineraryStop[];
  /** True on the day that ends at the shared party. */
  endsAtParty?: boolean;
};

export type CampaignPackage = {
  id: string;
  number: string;
  name: string;
  durationDays: number;
  summary: string;
  destinations: string[];
  imageSlug: string;
  days: CampaignDay[];
};

/**
 * The hero photograph.
 *
 * Its own image rather than a tour's: the Giza tour's picture is 1402px wide
 * and portrait-ish, and stretching that across a 100vw hero left the Sphinx
 * off-centre and the whole band reading as murky green rather than as a
 * photograph. This one is 5379x3585 and composed wide, with the sun low
 * between the pyramids.
 *
 * No identifiable faces — the riders are silhouettes. That matters on this
 * page more than most: it is a campaign about a performer, and the last thing
 * it should do is put a recognisable person's face behind that headline.
 *
 * Photograph by Simon Berger (unsplash.com/@simon_berger), Unsplash licence.
 * Recorded here because provenance that lives only in a commit message is
 * provenance nobody can find later.
 */
export const HERO_IMAGE = {
  url: "https://images.unsplash.com/photo-1539768942893-daf53e448371?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2400",
  alt: "Camel riders crossing the Giza plateau at sunset, with the pyramids behind them",
  credit: "Simon Berger / Unsplash",
};

/** The one date the whole campaign turns on. */
export const PARTY_DATE = "2026-11-28";
export const CAMPAIGN_LAUNCH = "2026-11-24";

/**
 * The master switch. Set false to take the campaign down: the homepage
 * section and the page's own content both read it, so one edit retires it
 * without a deploy touching layout.
 */
export const CAMPAIGN_ACTIVE = true;

/**
 * The party, as much of it as is actually known.
 *
 * `venueConfirmed` is the honest gate. While it is false the page says only
 * the date and that details follow for confirmed guests. Flip it once the
 * villa is booked and fill the fields below it; nothing else needs touching.
 */
export const VILLA_PARTY = {
  title: "The Egypt Eye Exclusive Villa Party",
  date: PARTY_DATE,
  venueConfirmed: false,
  /** Only rendered once venueConfirmed is true. All null until then. */
  venueName: null as string | null,
  venueAddress: null as string | null,
  startsAt: null as string | null,
  endsAt: null as string | null,
  /** What we can honestly say today. */
  holdingLine:
    "An exclusive villa celebration on 28 November. Full venue details and event arrangements will be shared with confirmed guests.",
  /**
   * Deliberately framed as intent, not inclusions. Nothing here is booked,
   * so nothing here is listed as something a traveller is buying.
   */
  intent:
    "The plan is a private villa, a DJ and an international crowd — travellers from different journeys ending the same night together.",
};

/** The three building blocks the packages are assembled from. */
const GIZA_STOPS: ItineraryStop[] = [
  { label: "Pickup from your hotel" },
  { label: "The Giza Pyramids" },
  { label: "Camel or horse ride" },
  { label: "Professional photoshoot at the Pyramids" },
  { label: "The Great Sphinx" },
  { label: "The Oils and Essence Factory" },
  { label: "The Grand Egyptian Museum" },
  { label: "Egyptian lunch" },
  { label: "Back to your hotel" },
];

const CAIRO_PARTY_STOPS: ItineraryStop[] = [
  { label: "Pickup from your hotel" },
  { label: "The Coptic churches" },
  { label: "The National Museum of Egyptian Civilization" },
  { label: "Egyptian lunch" },
  { label: "Khan el Khalili old market" },
  { label: "A Nile felucca sail", pending: "subject to operational confirmation" },
  { label: "Back to your hotel, and time to get ready" },
  { label: "The Egypt Eye exclusive villa party" },
];

const FAYOUM_STOPS: ItineraryStop[] = [
  { label: "Pickup from your accommodation" },
  { label: "Drive to the Fayoum Oasis" },
  { label: "Switch to a 4x4 desert car" },
  { label: "Prehistoric fossils in the Valley of the Whales" },
  { label: "The Whales Museum and the open museum" },
  { label: "Photoshoot in the desert" },
  { label: "Desert safari" },
  { label: "Sandboarding on the dunes" },
  { label: "Rest at the camp" },
  { label: "Bedouin lunch — BBQ, with vegan options" },
  { label: "Back to your accommodation" },
];

const ALEXANDRIA_STOPS: ItineraryStop[] = [
  { label: "Pickup from your hotel" },
  { label: "Drive to Alexandria" },
  { label: "The Catacombs" },
  { label: "Pompey's Pillar" },
  { label: "The Citadel of Qaitbay" },
  { label: "Lunch" },
  { label: "Drive back to Cairo and drop off at your hotel" },
];

/**
 * The four packages.
 *
 * Every one ends on PARTY_DATE at the same party — there is one party, not
 * four. Every Giza day includes the Grand Egyptian Museum, which is a
 * confirmed part of this campaign rather than an optional extra.
 */
export const PACKAGES: CampaignPackage[] = [
  {
    id: "giza",
    number: "01",
    name: "The Giza Experience",
    durationDays: 1,
    summary:
      "The Pyramids, the Sphinx and the Grand Egyptian Museum in a single day, finishing at the villa.",
    destinations: ["Giza"],
    imageSlug: "1-day-giza-tour",
    days: [
      {
        date: "2026-11-28",
        title: "Giza and the celebration",
        place: "Giza",
        endsAtParty: true,
        stops: [
          ...GIZA_STOPS,
          { label: "Time to get ready for the evening" },
          { label: "The Egypt Eye exclusive villa party" },
        ],
      },
    ],
  },
  {
    id: "cairo-giza",
    number: "02",
    name: "Cairo & Giza",
    durationDays: 2,
    summary: "A full day at the Pyramids, then old Cairo and the Nile before the villa.",
    destinations: ["Giza", "Cairo"],
    imageSlug: "3-day-cairo-giza",
    days: [
      { date: "2026-11-27", title: "Giza day", place: "Giza", stops: GIZA_STOPS },
      {
        date: "2026-11-28",
        title: "Cairo, and the celebration",
        place: "Cairo",
        endsAtParty: true,
        stops: CAIRO_PARTY_STOPS,
      },
    ],
  },
  {
    id: "giza-fayoum-cairo",
    number: "03",
    name: "Giza, Fayoum & Cairo",
    durationDays: 3,
    summary:
      "The Pyramids, a day in the desert at the Valley of the Whales, then old Cairo and the villa.",
    destinations: ["Giza", "Fayoum", "Cairo"],
    // fayoum-nature-tour, not wadi-el-hitan-whale-valley-safari: the Whale
    // Valley product has no image in Sanity, so this card rendered as a bare
    // gold gradient on production while the other three showed photographs.
    // The nature tour is also the closer match — this package's Fayoum day is
    // the oasis day, not specifically the fossil safari.
    imageSlug: "fayoum-nature-tour",
    days: [
      { date: "2026-11-26", title: "Giza day", place: "Giza", stops: GIZA_STOPS },
      { date: "2026-11-27", title: "Fayoum day", place: "Fayoum Oasis", stops: FAYOUM_STOPS },
      {
        date: "2026-11-28",
        title: "Cairo, and the celebration",
        place: "Cairo",
        endsAtParty: true,
        stops: CAIRO_PARTY_STOPS,
      },
    ],
  },
  {
    id: "giza-alexandria-cairo",
    number: "04",
    name: "Giza, Alexandria & Cairo",
    durationDays: 3,
    summary:
      "The Pyramids, the Mediterranean at Alexandria, then old Cairo and the villa.",
    destinations: ["Giza", "Alexandria", "Cairo"],
    imageSlug: "alexandria-day-trip",
    days: [
      { date: "2026-11-26", title: "Giza day", place: "Giza", stops: GIZA_STOPS },
      {
        date: "2026-11-27",
        title: "Alexandria day",
        place: "Alexandria",
        stops: ALEXANDRIA_STOPS,
      },
      {
        date: "2026-11-28",
        title: "Cairo, and the celebration",
        place: "Cairo",
        endsAtParty: true,
        stops: CAIRO_PARTY_STOPS,
      },
    ],
  },
];

export const CAMPAIGN_COPY = {
  path: "/shakira-got-you",
  headline: "Shakira let you down?",
  headlineTwo: "Egypt Eye got you.",
  supporting: "Your Egypt trip deserves an unforgettable ending.",
  intro:
    "The concert may have been postponed, but your Egypt adventure doesn't have to be. Explore specially curated experiences across Giza, Cairo, Fayoum and Alexandria, ending with one exclusive celebration on 28 November.",
  partyHeadline: "One city. Different journeys. One unforgettable night.",
  partyBody: "Every journey ends together. Join the Egypt Eye villa party on 28 November.",
  finalHeadline: "Your Egypt story deserves a better ending.",
  /** What Egypt Eye actually sells here. Stated plainly, not buried. */
  scope:
    "Egypt Eye provides the tours and experiences. Flights and accommodation are arranged independently by travellers.",
  /** Required on the page, not optional. */
  disclaimer:
    "An independent Egypt Eye Travel campaign. Not affiliated with, sponsored by or endorsed by Shakira, her management or the concert organisers.",
  enquiryNote:
    "Sending this starts a conversation — it is not a confirmed booking. We will come back to you with availability and what the package costs.",
};

/** Formats a campaign date for display, in one place. */
export function campaignDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

/** "26–28 November" for a package, derived rather than typed. */
export function packageDateRange(pkg: CampaignPackage): string {
  const first = pkg.days[0].date;
  const last = pkg.days[pkg.days.length - 1].date;
  if (first === last) return campaignDate(first);
  const d1 = new Date(`${first}T12:00:00Z`).getUTCDate();
  return `${d1}–${campaignDate(last)}`;
}

/**
 * Whether the party is still ahead.
 *
 * Used to stop the page speaking in the future tense once the night has
 * happened — a campaign page that still says "join us" in December is worse
 * than one that has been taken down.
 */
export function partyIsUpcoming(now: Date = new Date()): boolean {
  return now.getTime() < new Date(`${PARTY_DATE}T23:59:59Z`).getTime();
}

/**
 * The campaign's questions and answers.
 *
 * Here rather than in the page because they are facts, not layout, and
 * because the page renders them twice over: once visibly and once as FAQPage
 * structured data. Two copies of an answer is two answers that can disagree,
 * and the one that disagrees is always the one in the markup nobody reads.
 *
 * Several answers are derived rather than typed — the package list, the party
 * date, whether the venue is confirmed — so the FAQ cannot fall out of step
 * with the itineraries above it.
 */
export function campaignFaqs(): { question: string; answer: string }[] {
  return [
    {
      question: "What is Egypt Eye Got You?",
      answer:
        "An independent Egypt Eye campaign. Four curated tour packages across Giza, Cairo, Fayoum and Alexandria, each ending at the same private celebration on 28 November 2026.",
    },
    {
      question: "Is this an official Shakira event?",
      answer:
        "No. Egypt Eye is not affiliated with, sponsored by or endorsed by Shakira, her management or the concert organisers. This is our own travel campaign and our own private party.",
    },
    {
      question: "Which packages are available?",
      answer:
        PACKAGES.map(
          (p) =>
            `${p.name} — ${p.durationDays} day${p.durationDays === 1 ? "" : "s"}, ${packageDateRange(p)}`
        ).join("; ") + ".",
    },
    {
      question: "What is included in each package?",
      answer:
        "The tours and experiences listed in that package's day-by-day itinerary: private transport and pickup as set out there, the sites named, the guided and photographic elements, and the meals shown. Anything marked as subject to operational confirmation is planned rather than promised. Nothing beyond what is listed is included.",
    },
    {
      question: "Is accommodation included?",
      answer:
        "No. Egypt Eye provides the tours and experiences. Travellers arrange their own accommodation.",
    },
    {
      question: "Are flights included?",
      answer: "No. Travellers arrange their own flights.",
    },
    {
      question: "When is the villa party?",
      answer: `${campaignDate(PARTY_DATE)} 2026. Every package ends there — one party, shared by all four journeys.`,
    },
    {
      question: "Is the villa venue confirmed?",
      answer: VILLA_PARTY.venueConfirmed
        ? `Yes — ${VILLA_PARTY.venueName}.`
        : "Not yet. We are not going to publish a villa we have not booked. Full venue details and event arrangements will be shared with confirmed guests.",
    },
    {
      question: "Is the party schedule confirmed?",
      answer:
        "Not yet. Start and finish times, and the arrangements for the night, will be shared with confirmed guests rather than guessed at here.",
    },
    {
      question: "How can I book?",
      answer:
        "Send an enquiry using the form on this page. That starts a conversation: we come back with availability and a price, and nothing is confirmed until Egypt Eye confirms it.",
    },
    {
      question: "Can I customise my experience?",
      answer:
        "Yes. Tell us what you would like to change in your enquiry and we will build around it where the dates allow.",
    },
    {
      question: "Do I need proof of a Shakira concert ticket?",
      answer:
        "No. The experience is open to travellers generally. You do not need to provide proof of a concert ticket.",
    },
  ];
}
