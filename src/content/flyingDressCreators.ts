/**
 * CREATOR, EDITORIAL AND BRAND SHOOTS: the rooftop as a commercial location.
 *
 * =========================================================================
 * WHAT THIS PAGE IS, AND WHAT CHANGED
 * =========================================================================
 * The route and the record already existed. What they did not have was a
 * COMMERCIAL SHAPE: the creator record carries `pricing: { kind: "enquire" }`
 * and a `confirm` line reading "PRICE. Nothing set." The owner's October 2026
 * brief set the part that was missing, and only that part:
 *
 *   The ROOFTOP is $150 an hour. There is no minimum booking.
 *   Additional hours carry 10% off, which is $135 each.
 *   25% of the agreed total secures the date.
 *   Everything else is quoted separately, and the discount does NOT touch it.
 *
 * So the base price is now set and the SESSION price still is not. Those are
 * two different facts and the page keeps them apart, because a brand reading
 * "$150 an hour" and assuming it includes a photographer has been misled by
 * us rather than by their own optimism.
 *
 * =========================================================================
 * WHY THE RATE SURVIVES COMPARISON, FROM RESEARCH RATHER THAN HOPE
 * =========================================================================
 * Searched October 2026, and it is the reason the page leads with the figure.
 *
 * Commercial location hire for a rooftop runs roughly $105 to $370 an hour on
 * the US marketplaces: one Los Angeles studio publishes two rooftops at $165
 * and $105 an hour for shoots, another lists a rooftop photo area from $300 an
 * hour on a two-hour minimum, and the platform averages sit near $306 an hour
 * overall, $358 in Los Angeles and $399 in New York. $150 an hour with no
 * minimum is inside that band at the bottom, for a backdrop none of them has.
 *
 * The SECOND finding is the stronger one and it is about access, not money.
 * Shooting a commercial INSIDE the Giza archaeological complex is reported by
 * production fixers at around $3,000 a day for a product shoot, on a permit
 * that takes two to four weeks to clear through the Ministry, with longer
 * timelines for larger productions. This rooftop is private property outside
 * the complex. That is the argument: a brand gets the skyline without the
 * antiquities permit, the lead time or the day rate.
 *
 * Those are published fixer and marketplace figures for CONTEXT, used to
 * decide how to present our own rate. None of them is quoted to a visitor as
 * a competitor's price, and none is presented as a guarantee about what any
 * third party charges today.
 *
 * =========================================================================
 * THE THREE THINGS THE BRIEF SAID NOT TO OVERSTATE
 * =========================================================================
 * 1. NINE PYRAMIDS, not three. The owner was explicit: the rooftop overlooks
 *    all nine pyramids of the Giza plateau, and the page must not describe it
 *    as simply overlooking the three main ones. (The plateau carries Khufu,
 *    Khafre and Menkaure plus the six subsidiary queens' pyramids.)
 *
 * 2. THE HOTEL ROOM IS NOT A PROMISE. A luxury five-star room for changing
 *    and preparation exists at the venue. The owner's own brief says its
 *    inclusion conditions must be verified and not assumed for every booking,
 *    so it is written here as a facility that is confirmed per booking, never
 *    as an inclusion. See `preparationRoom`.
 *
 * 3. NOTHING ELSE IS INVENTED. No cancellation policy, no refund conditions,
 *    no overtime rule, no restriction. The brief forbade inventing them and
 *    none has been set, so `termsNotSet` says so rather than filling the gap.
 *
 * =========================================================================
 * WHERE THE MOVING PICTURES CAME FROM
 * =========================================================================
 * The owner's Drive folder, 29 October 2026: a real commercial production run
 * on this rooftop. Seven vertical phone clips, one GoPro cut, one camera cut
 * and two stills. They are the first footage this site has ever had of a
 * production working on the roof, and they are what the page shows.
 *
 * The AUDIO IS STRIPPED from every clip. The session is a live DJ set, so the
 * audio is someone else's recorded music, and a muted autoplaying loop is what
 * these are used as anyway. See docs/FLYING-DRESSES-CREATOR-SHOOTS.md.
 *
 * The same Drive folder's own "Creator, editorial and brand shoots" directory
 * holds four 1536x1024 PNGs whose bytes carry C2PA provenance naming OpenAI,
 * "gpt-image" and "trainedAlgorithmicMedia". NONE of them is installed. The
 * page shows a real production instead, which is the better picture anyway.
 */

// ---------------------------------------------------------------------------
// THE MONEY.
//
// CLAUDE.md §5: integer cents, end to end, ONE rounding at the end, and one
// authority rather than a second answer computed beside it. Everything a
// visitor reads about price on this page comes out of the three constants
// below through the functions below, and nothing is typed twice.
//
// $135 IS NEVER WRITTEN DOWN. It is 150 less 10%, computed. The brief stated
// both the rate and the discounted figure, and the single most likely way this
// page goes wrong in a year is the owner changing $150 in one place and
// leaving a hand-typed $135 behind it. checkCreatorRates() in
// scripts/check-flying-dresses.mts fails if the derived figure stops agreeing
// with the brief's stated one, and fails if any visitor-facing string on this
// page carries a hard-coded price.
// ---------------------------------------------------------------------------

/** The rooftop, per hour, as the owner set it. The only price on this page. */
export const ROOFTOP_HOURLY_USD = 150;

/** Applied to every hour AFTER the first. Never to an optional service. */
export const ADDITIONAL_HOUR_DISCOUNT_PERCENT = 10;

/** Of the total agreed booking cost, to secure the date. */
export const DEPOSIT_PERCENT = 25;

/** Dollars in, integer cents out. The only place a dollar figure becomes cents. */
export function usdToCents(usd: number): number {
  return Math.round(usd * 100);
}

/**
 * Cents to the string a visitor reads.
 *
 * Whole dollars print without a decimal, because "$150.00 per hour" reads like
 * a utility bill. A figure with cents keeps them rather than hiding a rounding.
 */
export function centsToUsd(cents: number): string {
  return cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`;
}

/** The first hour, and the only figure the owner stated directly. */
export function firstHourCents(): number {
  return usdToCents(ROOFTOP_HOURLY_USD);
}

/**
 * The discount, applied to any full-rate figure in cents.
 *
 * IT TAKES THE RATE AS AN ARGUMENT SO THE DERIVATION CAN ACTUALLY BE TESTED,
 * and that is the whole reason this is a separate function rather than two
 * lines inside additionalHourCents().
 *
 * The first version of the check for this read:
 *
 *     additionalHourCents() === firstHourCents() - round(firstHourCents() * pct / 100)
 *
 * which is the broken-guard pattern CLAUDE.md §4 describes exactly. Replacing
 * the body with a flat `return 13500` left it GREEN, because at $150 and 10%
 * the right answer and the hard-coded one are the same number. The assertion
 * restated the implementation instead of testing it.
 *
 * With the rate as a parameter the check can ask for a discount on a figure
 * that is not $150 at all, and a hard-coded return fails immediately.
 */
export function discountedHourCents(fullCents: number): number {
  return fullCents - Math.round((fullCents * ADDITIONAL_HOUR_DISCOUNT_PERCENT) / 100);
}

/** The deposit on any agreed total, in cents. Parameterised for the same reason. */
export function depositOnCents(totalCents: number): number {
  return Math.round((totalCents * DEPOSIT_PERCENT) / 100);
}

/**
 * Every hour after the first.
 *
 * DERIVED, never typed. The brief says 10% off additional hours and names
 * $135; this returns 13500 from 150 and 10.
 */
export function additionalHourCents(): number {
  return discountedHourCents(firstHourCents());
}

export type RooftopQuote = {
  hours: number;
  firstHourCents: number;
  additionalHours: number;
  additionalHourCents: number;
  /** Rooftop access only. Optional services are never inside this. */
  totalCents: number;
  depositCents: number;
  balanceCents: number;
};

/**
 * What a given number of rooftop hours costs, and what secures it.
 *
 * ROOFTOP ACCESS ONLY. This function must never learn about optional services:
 * the brief is explicit that the additional-hour discount does not apply to
 * them, and the surest way to honour that is for the discounted calculation to
 * have no way of reaching them.
 *
 * Fractional and zero hours are refused rather than guessed. The venue is
 * booked in whole hours and a half-hour rate has never been set, so returning
 * one would be inventing a term the brief forbids.
 */
export function rooftopQuote(hours: number): RooftopQuote | null {
  if (!Number.isInteger(hours) || hours < 1) return null;

  const first = firstHourCents();
  const extra = additionalHourCents();
  const additionalHours = hours - 1;
  const totalCents = first + additionalHours * extra;
  // The single rounding, at the end, on the total rather than on each hour.
  const depositCents = depositOnCents(totalCents);

  return {
    hours,
    firstHourCents: first,
    additionalHours,
    additionalHourCents: extra,
    totalCents,
    depositCents,
    balanceCents: totalCents - depositCents,
  };
}

/** "$150 per hour". The unit is never separated from the number. */
export const hourlyDisplay = `${centsToUsd(firstHourCents())} per hour`;

/** "$135 per additional hour". Derived, so it follows the rate. */
export const additionalHourDisplay = `${centsToUsd(additionalHourCents())} per additional hour`;

/** "25%". */
export const depositDisplay = `${DEPOSIT_PERCENT}%`;

/** "10%". */
export const additionalHourDiscountDisplay = `${ADDITIONAL_HOUR_DISCOUNT_PERCENT}%`;

// ---------------------------------------------------------------------------
// THE VENUE.
// ---------------------------------------------------------------------------

export const creatorsVenue = {
  heading: "A private rooftop above the Giza plateau",
  /**
   * NINE, not three. The owner's brief was explicit about this and about not
   * reducing it to the three main pyramids.
   */
  lede:
    "The rooftop looks out over all nine pyramids of the Giza plateau, not only the three that everyone photographs. The Great Pyramid, Khafre and Menkaure sit across the skyline with the smaller queens' pyramids beside them, and the whole line is in frame from the shooting positions.",
  points: [
    {
      title: "Outside the archaeological complex",
      detail:
        "This is private property with a view of the plateau, not a location inside the site itself. There is no antiquities permit to clear, no ticket gate and no queue, and the lead time is the venue's availability rather than a ministry's.",
    },
    {
      title: "Open from before sunrise to after dark",
      detail:
        "Golden hour is the hour most shoots are built around, and the roof faces it. Blue hour and night setups work here too: the footage on this page was filmed across a single evening.",
    },
    {
      title: "Room to build a set",
      detail:
        "The roof carries a pool, seating, shade and open deck. There is space for lighting stands, several camera positions and a crew working around talent without crowding the frame.",
    },
    {
      title: "Power and access, agreed with the venue",
      detail:
        "What a production can draw, where a vehicle can unload and how large a crew can be are the venue's answers rather than ours. They are confirmed for your date before anything is final.",
    },
  ],
  /**
   * THE HELD ONE. The owner's brief named a luxury five-star hotel room for
   * changing and preparation AND said in the same breath that its inclusion
   * conditions must be verified and must not be assumed for every booking.
   *
   * So this states the facility and refuses the inclusion. The same discipline
   * as the proposal page's changingRoom switch: a facility a guest already in
   * wardrobe discovers is unavailable is the specific failure being avoided.
   */
  preparationRoom:
    "There is a five-star hotel room at the venue for changing and preparation. Whether it is part of your booking, and on what terms, is confirmed in writing with your quotation: it is not automatically included in every booking and we will not pretend otherwise before we have checked it for your date.",
  dependency:
    "The rooftop belongs to a hotel, not to us. Every date is confirmed with the venue before anything is final, and a commercial shoot needs their approval as well as a free slot.",
} as const;

// ---------------------------------------------------------------------------
// WHO IT IS FOR. The four audiences from the brief, in the brief's order.
// ---------------------------------------------------------------------------

export type Audience = {
  id: string;
  name: string;
  detail: string;
  /** What this group actually leaves with. Never a performance promise. */
  uses: string[];
};

export const audiences: readonly Audience[] = [
  {
    id: "fashion",
    name: "Fashion designers and clothing brands",
    detail:
      "A collection photographed against a skyline that places it instantly. The roof takes a rail, a steamer and several looks through an afternoon, and the light does most of the work from mid afternoon onwards.",
    uses: [
      "Lookbooks and campaign stills",
      "Collection launches and seasonal drops",
      "E-commerce and editorial crossover",
    ],
  },
  {
    id: "agencies",
    name: "Marketing and advertising agencies",
    detail:
      "A location that clears quickly. You are booking private property by the hour rather than applying for access to an archaeological site, which is usually the difference between a shoot that happens this month and one that happens next quarter.",
    uses: [
      "Client campaigns needing a recognisable location",
      "Content days producing a quarter of assets at once",
      "Stills and motion captured in the same block",
    ],
  },
  {
    id: "beauty",
    name: "Beauty and lifestyle brands",
    detail:
      "Warm, directional light and an uncluttered horizon, which is a combination product photography rarely gets outdoors. The roof works for both the held-product frame and the wider lifestyle scene behind it.",
    uses: [
      "Product and packaging in natural light",
      "Founder and talent portraits",
      "Lifestyle scenes with the plateau behind",
    ],
  },
  {
    id: "international",
    name: "International brands and production teams",
    detail:
      "A crew arriving from abroad gets a location that is confirmed before they fly, a local team that knows the roof, and no dependency on a permit timeline. Tell us the call sheet and we will tell you what the venue can carry.",
    uses: [
      "Fixed-date international productions",
      "Multi-day blocks across rooftop and desert",
      "Local crew, equipment and talent sourcing",
    ],
  },
] as const;

// ---------------------------------------------------------------------------
// WHAT THE HOUR BUYS, AND WHAT IT DOES NOT.
//
// The brief: "base price = rooftop access only". This is the section that
// stops the rate being read as a package, and it is deliberately blunt.
// ---------------------------------------------------------------------------

export const rooftopAccess = {
  heading: "What the hourly rate covers",
  lede:
    "The rate is for the rooftop. It is a location fee, in the way a studio charges for a studio, and it is the whole of what the figure includes.",
  covers: [
    "Exclusive use of the rooftop for the hours you book, confirmed with the venue for your date.",
    "The view itself: all nine pyramids across the skyline, in frame rather than placed behind you.",
    "Space for your own lighting, camera positions, rails and crew.",
    "A planning conversation before the day about the hour, the light and what you are bringing.",
  ],
  excludes:
    "Photography, videography, models, wardrobe, makeup, decoration and production assistance are not inside the hourly rate. Each is an optional service, quoted separately for the shoot you describe.",
} as const;

// ---------------------------------------------------------------------------
// THE OPTIONAL SERVICES. Seven, from the brief, none of them priced.
// ---------------------------------------------------------------------------

export type OptionalService = {
  id: string;
  name: string;
  detail: string;
  /** Who performs it. The site has always distinguished these. */
  delivery: "in-house" | "partner";
};

export const optionalServices: readonly OptionalService[] = [
  {
    id: "photography",
    name: "Photography",
    detail:
      "A directed shoot with our photographer, planned around the frames you need and delivered colour graded.",
    delivery: "in-house",
  },
  {
    id: "videography",
    name: "Videography",
    detail:
      "Motion captured alongside the stills, including vertical cuts for social. The clips on this page are our own footage from this roof.",
    delivery: "in-house",
  },
  {
    id: "talent",
    name: "Model and talent sourcing",
    detail:
      "Models and on-camera talent found and booked for your shoot. Rates, usage and availability are agreed per person before the day.",
    delivery: "partner",
  },
  {
    id: "wardrobe",
    name: "Dresses and wardrobe",
    detail:
      "Access to our own collection, including the flying dresses, plus men's wear and accessories. Every piece is one we hold rather than a catalogue we order from.",
    delivery: "in-house",
  },
  {
    id: "beauty",
    name: "Makeup and hairstyling",
    detail:
      "Hair and makeup arranged for your call time, on the roof or in the preparation room where that is part of your booking.",
    delivery: "partner",
  },
  {
    id: "decoration",
    name: "Custom decoration and set styling",
    detail:
      "Built for the shoot rather than chosen from a list. What is possible on the roof on a given date is agreed with the venue first.",
    delivery: "in-house",
  },
  {
    id: "production",
    name: "Production assistance",
    detail:
      "Coordination on the day: load-in, timings, the venue conversation and the people who keep a shoot moving.",
    delivery: "in-house",
  },
] as const;

export const SERVICE_DELIVERY_LABEL: Record<OptionalService["delivery"], string> = {
  "in-house": "Our own team",
  partner: "Arranged with partners",
};

// ---------------------------------------------------------------------------
// THE BOOKING TERMS.
//
// Four facts, all of them from the brief, and NOTHING ELSE. The brief said not
// to invent cancellation policies, refund conditions, overtime rules or
// restrictions, so `termsNotSet` states their absence rather than filling it.
// ---------------------------------------------------------------------------

export const bookingTerms = {
  heading: "How a booking works",
  /**
   * The rate, said for the rate card specifically.
   *
   * It is NOT rooftopAccess.lede, which the terms card used to reuse: that put
   * the same sentence on the page twice, two sections apart, and it read like
   * a copy-paste because it was one. Caught by reading the rendered page
   * rather than the source.
   */
  hourly:
    "Exclusive use of the roof, for as many hours as you book, on a date confirmed with the venue. Billed by the hour like a studio.",
  noMinimum:
    "There is no minimum booking. One hour is a real booking and is quoted as one, which is unusual for a commercial location and is deliberate.",
  additionalHours:
    "Hours after the first carry a discount, so a longer block costs less per hour than a short one. The discount applies to rooftop hours only.",
  deposit:
    "A deposit of the agreed total secures your date. The balance is settled as set out in your written quotation.",
  optionalServicesNote:
    "Optional services are quoted separately and the additional-hour discount does not apply to them. A longer rooftop booking reduces the cost of the rooftop, not the cost of a photographer.",
  /**
   * THE RECORD OF ABSENCE. Read by the check script, which is what makes it a
   * deliberate silence rather than an oversight.
   */
  termsNotSet:
    "We do not publish a cancellation policy, refund conditions or an overtime rate for this booking, because none has been set. The terms that apply to your shoot are written into your quotation before you pay anything.",
} as const;

// ---------------------------------------------------------------------------
// THE SEQUENCE.
// ---------------------------------------------------------------------------

export const creatorSteps = [
  {
    title: "Tell us the shoot",
    detail:
      "The date, roughly how many hours, what you are producing and what the pictures are for. Commercial or personal matters here, because it changes the venue's terms and the usage we agree.",
  },
  {
    title: "We put it to the venue",
    detail:
      "The rooftop is a hotel's, so the date, the crew size and anything you want to build are confirmed with them rather than assumed by us.",
  },
  {
    title: "You get a written quotation",
    detail:
      "The rooftop hours priced out, each optional service priced separately beside them, and the terms that apply. One document, before any money moves.",
  },
  {
    title: "A deposit holds the date",
    detail:
      "The agreed percentage of the total secures the booking. Until it is paid the date is not held, and we would rather say that than imply otherwise.",
  },
  {
    title: "We plan the day properly",
    detail:
      "Call time against the light, load-in, the order of the looks, and who is on the roof. A production day that has been planned is the difference between four usable hours and two.",
  },
  {
    title: "Shoot day",
    detail:
      "You shoot. Where we are producing, our team runs the roof around you so the hours go to the work rather than to logistics.",
  },
  {
    title: "Delivery",
    detail:
      "Colour-graded stills and cut video where those are part of your booking, delivered as agreed in the quotation.",
  },
] as const;

// ---------------------------------------------------------------------------
// WHAT WE WILL NOT DO. Carried over from the record, because both still hold
// and both are the kind of thing a brand assumes until told.
// ---------------------------------------------------------------------------

export const limits = {
  heading: "Two things we will not do",
  points: [
    {
      title: "We do not fly drones",
      detail:
        "Drone use in Egypt is restricted and flying one without authorisation risks the equipment being seized. We do not offer it, we do not arrange it, and we would be wary of anyone who says otherwise.",
    },
    {
      title: "We do not promise performance",
      detail:
        "We produce the photographs and the footage. Whether a campaign converts or a reel travels is not something anyone honest will sell you, and we are not going to be the exception.",
    },
  ],
} as const;

// ---------------------------------------------------------------------------
// THE QUESTIONS. These are APPENDED to the record's own three, which is why
// none of them repeats the drone or the performance answer.
// ---------------------------------------------------------------------------

export const creatorFaqs = [
  {
    question: "What does the hourly rate actually include?",
    answer:
      "The rooftop, for the hours you book, and nothing else. It is a location fee. Photography, video, models, wardrobe, makeup, decoration and production are each quoted separately, so you can book the roof alone and bring your own crew, or have us produce the whole day.",
  },
  {
    question: "Is there a minimum booking?",
    answer:
      "No. One hour is a real booking. Most commercial locations set a two or four hour minimum and we do not, which makes a short product shoot or a single golden hour genuinely affordable here.",
  },
  {
    question: "Do longer bookings cost less per hour?",
    answer:
      "Yes. Hours after the first carry a discount on the rooftop rate. It applies to the rooftop only: a longer booking reduces what the location costs, not what an optional service costs.",
  },
  {
    question: "How do I secure a date?",
    answer:
      "A deposit against the agreed total holds it, and the exact figure is on your written quotation because it depends on what you have booked. Until the deposit is paid the date is not held.",
  },
  {
    question: "Do I need a permit to shoot here?",
    answer:
      "Not for the rooftop. It is private property outside the archaeological complex, so there is no antiquities permit and no ministry lead time. If you also want to shoot inside the complex itself, that is a separate process with its own costs and timeline, and it is not something this booking covers.",
  },
  {
    question: "Can we change and prepare on site?",
    answer:
      "There is a five-star hotel room at the venue used for changing and preparation. Whether it forms part of your booking is confirmed with your quotation rather than assumed, so ask for it when you enquire and we will check it for your date.",
  },
  {
    question: "Can I bring my own crew and equipment?",
    answer:
      "Yes, and plenty of bookings are exactly that. Tell us what you are bringing when you enquire: crew size, vehicles and power draw are the venue's questions, and they are better answered before the day than at the door.",
  },
  {
    question: "Who owns the footage?",
    answer:
      "What you shoot is yours. Where we produce, the usage is agreed in writing before the shoot rather than afterwards, and a paid brand campaign is a different conversation from a personal shoot. Say which it is when you enquire.",
  },
] as const;

// ---------------------------------------------------------------------------
// WHAT IS STILL OPEN. The record's `confirm` list, narrowed by the brief.
//
// Not rendered. It is the honest ledger of what the page still cannot say, and
// it is what the next brief should answer.
// ---------------------------------------------------------------------------

export const stillOpen = [
  "THE PREPARATION ROOM. The owner named it and said its inclusion conditions must be verified. Until they are, the page offers to check it per booking rather than listing it as an inclusion.",
  "WHAT A PRODUCED SHOOT COSTS. The rooftop is set; photography, video, talent, wardrobe, makeup, decoration and production are all still quoted case by case with no published figures.",
  "STANDARD DELIVERY. How many edited images, and in what time, is still unstated, which is why no number appears anywhere on this page.",
  "CANCELLATION, REFUNDS AND OVERTIME. None set. The brief explicitly forbade inventing them.",
  "WHETHER A HALF-HOUR OR PART-HOUR RATE EXISTS. rooftopQuote() refuses fractional hours rather than inventing one.",
] as const;
