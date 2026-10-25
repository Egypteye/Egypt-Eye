/**
 * THREE OCCASIONS: anniversaries, maternity and family, vow renewals.
 *
 * =========================================================================
 * WHY ONE MODULE AND ONE COMPOSITION
 * =========================================================================
 * The proposal, the gender reveal, the celebration and the music session each
 * earned a page of their own because each sells something structurally
 * different. These three do not. All three are a rooftop, a decoration that is
 * now confirmed as INCLUDED, a directed session, and photographs afterwards.
 * Writing three four-hundred-line components that differ in their nouns is how
 * four pages drift apart over a year.
 *
 * So the shape lives in `OccasionPage.tsx` and everything that differs lives
 * here, as data. What differs is real and is the point of each page:
 *
 *   romance          the surprise, and the one occasion we have genuinely
 *                    photographed, with a published customer story to prove it
 *   maternity-family the dress and the sizing, and the only page here with no
 *                    photograph of its own occasion at all
 *   vows-engagement  the legal statement, which is the most important
 *                    paragraph on any of these three pages
 *
 * =========================================================================
 * THE PRICES ARE THE OWNER'S, AND THEY COME FROM ONE PLACE
 * =========================================================================
 * October 2026: the rooftop is $150 an hour, a flying dress photoshoot is $200
 * per person, a regular photoshoot is $100 per person, decoration is INCLUDED,
 * and photography for an event is charged separately. Every figure is read
 * from `flyingDressRates.ts` so no two pages can quote different numbers.
 *
 * A SESSION IS PRICED PER PERSON. AN EVENT IS THE ROOM BY THE HOUR. That is
 * the distinction `pricing` below encodes, and it is why the vow renewal is
 * priced differently from the other two: a ceremony is an event.
 */

import { ROOFTOP_LOCATION_NOTE, VENUE_DEPENDENCY } from "./flyingDressExperiences";
import { rates, type Rate } from "./flyingDressRates";

/** A line with a short title, as every page on this site renders them. */
export type OccasionLine = { title: string; detail: string };

/**
 * A gallery frame. `src: null` is a designed, labelled gap naming the
 * photograph we do not have, never a stock image. Same rule as the music page.
 */
export type OccasionFrame = {
  /** Registry key on `agency`, or null for a labelled gap. */
  slot: string | null;
  span: "lead" | "pair";
  caption: string;
  /** Gaps only: the shot we are missing, and its alt text. */
  wanted?: string;
  alt?: string;
};

export type OccasionPricing = {
  /** Which rates this occasion is actually sold at. */
  applies: Rate[];
  /** How those rates combine, in a sentence. */
  note: string;
  /** True when this is an EVENT, so event photography is charged separately. */
  isEvent: boolean;
};

export type Occasion = {
  /** The experience CATEGORY id this page replaces the generic body for. */
  categoryId: "romance" | "maternity-family" | "vows-engagement";
  /** The experience record the route hands the page. */
  experienceSlug: string;
  /** Deep link into the enquiry, pre-selecting the experience. */
  enquireSlug: string;
  eyebrow: string;
  heading: string;
  lede: string;
  /** Registry key on `agency` for the hero, or null for no hero photograph. */
  heroSlot: string | null;
  primaryCta: string;
  pricing: OccasionPricing;
  highlights: OccasionLine[];
  galleryHeading: string;
  galleryIntro: string;
  frames: OccasionFrame[];
  /** The section that only this occasion needs. Rendered after the gallery. */
  feature: {
    eyebrow: string;
    heading: string;
    lede: string;
    points: OccasionLine[];
    /** Rendered in a bordered note beside the points. */
    note?: string;
  };
  steps: OccasionLine[];
  /** Extras, each quoted rather than priced. */
  extras: OccasionLine[];
  prepare: string[];
  faqs: { question: string; answer: string }[];
  /** A story on this site that is genuinely about this occasion. */
  storySlug?: string;
  closingHeading: string;
  closingLede: string;
};

const SHARED_VENUE = {
  location: ROOFTOP_LOCATION_NOTE,
  dependency: VENUE_DEPENDENCY,
};

export const occasionVenue = SHARED_VENUE;

// ---------------------------------------------------------------------------
// ANNIVERSARIES AND ROMANTIC EVENINGS
//
// THE ONLY PAGE IN THIS SERIES WITH PHOTOGRAPHS OF ITS OWN OCCASION, and it
// took reading a story to find out. Alessandra and Gianluca travel somewhere
// each anniversary and photograph it in their wedding clothes; in September
// 2026 that was Giza. Both couple frames in the registry are from that shoot.
//
// That matters twice over. It makes this page the one that can argue from
// evidence rather than by analogy, and it means the caption "photographed at a
// vow renewal", which four other pages carried, was wrong. It is an
// anniversary shoot. Fixed everywhere, and the story is linked from here.
//
// NO PRIVATE DINING. The record flags it as unverified and the owner confirmed
// in October 2026 that it should stay off the page until a venue has agreed
// it. The research says a rooftop dinner is the core premium offer competitors
// sell, which makes leaving it off a real cost and the right call anyway.
// ---------------------------------------------------------------------------

const romance: Occasion = {
  categoryId: "romance",
  experienceSlug: "anniversary-and-romance",
  enquireSlug: "anniversary-and-romance",
  eyebrow: "Already together",
  heading: "The evening you will talk about",
  lede:
    "An anniversary, a honeymoon, or a surprise for somebody who is not expecting one. The same rooftop and the same photography as a proposal, without the question at the end.",
  // No hero here: the shared route already renders agency.couplesRomance as
  // this category's photograph, and it is genuinely an anniversary shoot.
  heroSlot: null,
  primaryCta: "Plan your evening",
  pricing: {
    applies: [rates.regular, rates.flyingDress],
    note: "Priced per person, so a couple is two. Choose a regular session in your own clothes or a flying dress session with a dress from the collection. Decoration is included in both.",
    isEvent: false,
  },
  highlights: [
    {
      title: "A rooftop with the pyramids across it",
      detail:
        "Confirmed with the venue for your date and your hour. The pyramids are the view, not a backdrop we have put you in front of.",
    },
    {
      title: "Decoration, included",
      detail:
        "A setup from the designs we are running for your date, part of what you are paying rather than an extra on top. Tell us the mood and we send you what is available.",
    },
    {
      title: "Directed, so neither of you has to know how to pose",
      detail:
        "The most common worry about a couple shoot, and the easiest to solve. You are told where to stand and what to do with your hands.",
    },
    {
      title: "Colour-graded photographs afterwards",
      detail:
        "Delivered after the session. We do not publish a count or a deadline, because neither has been set: you get both in writing for your booking.",
    },
  ],
  galleryHeading: "This roof, at this hour",
  galleryIntro:
    "Unusually for this site, the first two frames below are the occasion itself. Alessandra and Gianluca mark every anniversary by travelling somewhere new and photographing it in their wedding clothes, and in September 2026 that was Giza. Every frame says what it actually is.",
  frames: [
    {
      slot: "couplesVows",
      span: "lead",
      caption:
        "Golden hour on the roof, at an anniversary shoot. The wedding dress has been to every anniversary they have had.",
    },
    {
      slot: "genderReveal",
      span: "pair",
      caption:
        "What a decorated setup on this roof looks like after dark, lit by this team. Photographed at a gender reveal.",
    },
    {
      slot: "heroRooftop",
      span: "pair",
      caption: "The usable width of the roof. A flying-dress session.",
    },
    {
      slot: null,
      span: "pair",
      wanted: "An evening couple session, after dark",
      alt: "A couple photographed on the rooftop after dark, lit for an evening session with the pyramids behind them",
      caption: "We light evening sessions and have no photograph of one with a couple in it.",
    },
  ],
  feature: {
    eyebrow: "If it is a surprise",
    heading: "Nothing reaches your partner",
    lede:
      "Planned the same way a proposal is, because the risk is identical: one message to the wrong place and the evening is no longer a surprise.",
    points: [
      {
        title: "You pick the channel",
        detail:
          "Email, WhatsApp, whichever you choose, and we use only that one. Nothing goes anywhere you have not named.",
      },
      {
        title: "Nothing is sent to a shared address",
        detail: "Tell us when you enquire if the address you are writing from is one you share.",
      },
      {
        title: "The setup is ready before you arrive",
        detail:
          "So the first time they see it is the moment you want them to, rather than while somebody is still tying a balloon.",
      },
    ],
  },
  steps: [
    {
      title: "Tell us the date and what it is for",
      detail:
        "An anniversary, a honeymoon, or just an evening that deserves more than a restaurant. Say whether it is a surprise.",
    },
    {
      title: "Choose the session",
      detail:
        "A regular session in your own clothes, or a flying dress session with a dress from the collection. The difference is the rate per person and what the photographs look like.",
    },
    {
      title: "Choose how it looks",
      detail:
        "We send you the decoration designs available for your date. It is included, so this is a choice rather than an upsell.",
    },
    {
      title: "We confirm the roof",
      detail:
        "The venue, the date and the hour are agreed, and the quotation comes back to you in writing. Nothing is held before that.",
    },
    {
      title: "The evening, photographed",
      detail:
        "Directed throughout. The photographs are colour-graded and delivered afterwards.",
    },
  ],
  extras: [
    { title: "A cinematic couple's film", detail: "Shot and edited in house, quoted for your session." },
    {
      title: "A flying dress, and a coordinated outfit for him",
      detail: "A dress from the collection and a traditional gawn, so the two of you match.",
    },
    { title: "A personalised sign or message", detail: "Worked into the setup." },
    {
      title: "Creative lighting for an evening session",
      detail: "Our own equipment. The reason an evening session looks like anything at all.",
    },
    {
      title: "Cake, flowers or refreshments",
      detail: "Through a supplier we work with, confirmed separately.",
    },
    { title: "A musician", detail: "Through a partner, and subject to what the venue allows." },
  ],
  prepare: [
    "Whether it is a surprise, and which channel we are allowed to use.",
    "The date, and whether you want sunrise or the end of the day. They look completely different.",
    "How many of you there are, since the session is priced per person.",
    "Whether you want a dress from the collection or your own clothes.",
    "Anything you want written on a sign or worked into the setup.",
  ],
  faqs: [
    {
      question: "What does it cost?",
      answer:
        "A regular photoshoot is $100 per person and a flying dress photoshoot is $200 per person, both on the rooftop above Giza, and decoration is included in both. A couple is two people. If you want the rooftop reserved for longer than the session itself, that is $150 an hour. Anything else you add is quoted with it.",
    },
    {
      question: "Is the decoration really included?",
      answer:
        "Yes. You choose a setup from the designs we are running for your date and it is part of what you are paying rather than an extra. What is available changes, so we send you photographs of the current designs when you enquire instead of publishing a catalogue that goes stale.",
    },
    {
      question: "Can we do this in the evening?",
      answer:
        "Yes, and we bring lighting for it, which is the difference between an evening photograph and a dark one. What the venue allows after a certain hour is their decision and we confirm it for your date.",
    },
    {
      question: "We are not getting engaged. Is this still for us?",
      answer:
        "That is exactly who it is for. If you are planning to propose, the proposal page is the one you want, because that is planned differently and in more secrecy. This is for couples who are already together.",
    },
  ],
  // NO storySlug. The Alessandra and Gianluca write-up lives on the Egypt Eye
  // site, not this one, and the two brands are kept separate, so linking to it
  // from here would send a Flying Dresses visitor to the other business. The
  // shoot is still the evidence this page rests on; the gallery intro tells it
  // in its own words instead. The route's own <StoriesFromHere> already links
  // the Flying Dresses stories that are relevant to this page.
  //
  // The field stays on the type: when a Flying Dresses story about an
  // anniversary exists, setting it is the whole edit. A check fails if it is
  // ever set to a slug this site does not publish, because the component
  // renders nothing for a dead slug and that is invisible.
  closingHeading: "Tell us the date, and whether they know",
  closingLede:
    "Give us the date, how many of you there are, and whether it is a surprise. We will come back with what the roof allows for your hour, the decoration available, and the figure in writing.",
};

// ---------------------------------------------------------------------------
// MATERNITY AND FAMILY
//
// NO PHOTOGRAPH OF A PREGNANCY, A FAMILY OR A CHILD EXISTS ANYWHERE IN THIS
// REPOSITORY. The owner confirmed in October 2026 that there are none yet and
// asked for the labelled-gap treatment, so the gallery is built and names the
// shots it is waiting for.
//
// What this page CAN argue from is the dress, and the research says it is a
// genuine advantage: maternity photographers commonly price per outfit and
// charge for a gown, where ours is part of the session. The sizing paragraph
// is the record's own and it is the most useful thing on the page.
// ---------------------------------------------------------------------------

const maternity: Occasion = {
  categoryId: "maternity-family",
  experienceSlug: "maternity-and-family",
  enquireSlug: "maternity-and-family",
  eyebrow: "The people in it",
  heading: "While it still shows",
  lede:
    "A maternity session in a flowing dress, a pregnancy announcement, or three generations in one frame with the pyramids behind them. Directed at whatever pace the session needs.",
  heroSlot: "rooftopPortrait",
  primaryCta: "Plan your session",
  pricing: {
    applies: [rates.flyingDress, rates.regular],
    note: "Priced per person. A maternity session in a dress from the collection is the flying dress rate; anybody joining in their own clothes is the regular rate, so a family is usually a mix of the two. Decoration is included either way.",
    isEvent: false,
  },
  highlights: [
    {
      title: "A dress from the collection, included",
      detail:
        "In the colour you choose, and it is part of the session rather than a hire charge on top. Most maternity photographers price by the outfit.",
    },
    {
      title: "Adjustable, and confirmed before the date",
      detail:
        "The collection is adjustable and covers a wide range of sizes including plus sizes. We confirm which dress suits you, and in what colour, for your stage of pregnancy before you book rather than on the morning.",
    },
    {
      title: "A pace that suits whoever is in it",
      detail:
        "Directed, unhurried, and there is somewhere to sit between frames. That matters more at thirty-four weeks than any other thing on this page.",
    },
    {
      title: "Decoration, included",
      detail:
        "A setup from the designs available for your date, part of what you are paying. Useful for an announcement, where the photograph has to carry the news on its own.",
    },
  ],
  galleryHeading: "The place, and the shots we are missing",
  galleryIntro:
    "We have not photographed a maternity or family session on this roof yet, so none of the photographs below is one, and each says what it actually is. What they show is the location, the dresses and the light. The labelled frames are the shots we want and do not have, left visible rather than filled with somebody else's.",
  frames: [
    {
      slot: "heroRooftop",
      span: "lead",
      caption:
        "How a group stands on this roof, which is the question families ask first. A flying-dress session.",
    },
    {
      slot: "fayoumDress",
      span: "pair",
      caption:
        "The same collection photographed away from the roof, at Fayoum. Shows the fabric rather than the location.",
    },
    {
      slot: null,
      span: "pair",
      wanted: "A maternity session in a flowing dress",
      alt: "An expecting mother in a flowing dress on the rooftop at first light with the pyramids behind her",
      caption: "The shot this page is really for. We do not have one.",
    },
    {
      slot: null,
      span: "pair",
      wanted: "A family in one frame, three generations",
      alt: "A family group including children and grandparents photographed together on the rooftop with the pyramids behind them",
      caption: "Nothing in the collection shows a family, or a child.",
    },
    {
      slot: null,
      span: "pair",
      wanted: "A pregnancy announcement frame",
      alt: "A couple holding a scan photograph on the rooftop with the pyramids behind them",
      caption: "The photograph that has to carry the news on its own.",
    },
  ],
  feature: {
    eyebrow: "The dress",
    heading: "Which one, and will it fit",
    lede:
      "The two questions every maternity enquiry opens with, answered before you book rather than on the morning.",
    points: [
      {
        title: "A wide range of sizes, including plus sizes",
        detail:
          "The collection is adjustable, so a maternity session is rarely a question of whether something will fit.",
      },
      {
        title: "Confirmed for your stage, not assumed",
        detail:
          "We do not promise that every dress suits every body without checking. Tell us how far along you will be on the date and we confirm which dresses work and in what colours before you book.",
      },
      {
        title: "Coordinated outfits for partners and children",
        detail:
          "Arranged in house if you want the group to match, and quoted with the session.",
      },
    ],
    note: "Most maternity photographers suggest booking somewhere between the seventh and ninth month, when it shows clearly and moving is still comfortable. We will advise on your date rather than apply a rule, but earlier in a pregnancy is easier for us to schedule than later.",
  },
  steps: [
    {
      title: "Tell us the date and how far along you will be",
      detail: "Both, because the second one changes which dresses we put in front of you.",
    },
    {
      title: "We confirm the dress and the colour",
      detail:
        "Before you book. This is the part most people expect to be left until the day, and it is the part we will not leave until the day.",
    },
    {
      title: "Say who else is in it",
      detail:
        "A partner, children, grandparents. The session is priced per person and a family is usually a mix of the two rates.",
    },
    {
      title: "We confirm the roof",
      detail:
        "The venue, the date and the hour, and the quotation comes back in writing. The light is early and that is the one thing we will not move.",
    },
    {
      title: "The session",
      detail:
        "Directed, at whatever pace it needs. The photographs are colour-graded and delivered afterwards.",
    },
  ],
  extras: [
    { title: "Video and vertical reels", detail: "Shot and edited in house, quoted with the session." },
    {
      title: "A gender reveal on the same day",
      detail:
        "Something we do ourselves rather than arrange. The one thing most people wish they had asked about afterwards.",
    },
    {
      title: "Coordinated outfits for partners and children",
      detail: "So the group reads as a group in the photographs.",
    },
    { title: "Additional edited images", detail: "Beyond what the session delivers." },
    {
      title: "Hair and makeup",
      detail:
        "Through a supplier. Ask when you enquire and we will confirm whether it can be arranged for your date rather than promise it here.",
    },
  ],
  prepare: [
    "How far along you will be on the date, which decides the dress conversation.",
    "Who else is in the session, and their ages. It is priced per person.",
    "Whether anybody else wants a dress from the collection, or their own clothes.",
    "Whether you want the announcement to be readable in the photograph itself.",
    "Whether you want a gender reveal on the same day, which we do ourselves.",
  ],
  faqs: [
    {
      question: "What does it cost?",
      answer:
        "A maternity session in a dress from the collection is $200 per person, and a regular session in your own clothes is $100 per person, both on the rooftop above Giza. A family is usually a mix: the dress rate for whoever wears one, the regular rate for everybody else. Decoration is included. If you want the rooftop reserved for longer than the session, that is $150 an hour.",
    },
    {
      question: "Will a dress fit at any stage of pregnancy?",
      answer:
        "The collection is adjustable and covers a wide range of sizes, including plus sizes, so it is rarely a question of whether something will fit. We do not promise that every dress suits every body without checking, though. Tell us how far along you will be on the date and we confirm which dresses work and in what colours before you book, rather than on the morning.",
    },
    {
      question: "How early in the day is it?",
      answer:
        "Early, for the light, and that is the one thing we will not move. We will tell you the exact time for your date when we confirm it.",
    },
    {
      question: "Can the children come?",
      answer:
        "Yes, and the session is directed at whatever pace it needs rather than run to a clock. Tell us their ages when you enquire so the order of the frames can be planned around the youngest one's patience.",
    },
    {
      question: "Can we do a gender reveal on the same day?",
      answer:
        "Yes. It is something we do ourselves rather than arrange through anybody else, and it is the thing most people say afterwards that they wish they had asked about. It is quoted with the session.",
    },
  ],
  closingHeading: "Tell us the date, and how far along you will be",
  closingLede:
    "Give us the date, who is in it and your stage of pregnancy. We will confirm which dresses work, what the roof allows for your hour, and the figure, in writing.",
};

// ---------------------------------------------------------------------------
// VOW RENEWALS AND ENGAGEMENT CELEBRATIONS
//
// THE LEGAL STATEMENT IS THE MOST IMPORTANT PARAGRAPH ON ANY OF THESE THREE
// PAGES, and the record's wording is kept verbatim rather than rewritten. It
// matches how UK registrars and professional celebrants word a renewal: no
// legal standing, not legally binding on those who take part.
//
// The record also flags that this wording still wants a LEGAL REVIEW before
// publication. It is the owner's own sentence and it was already published, so
// rendering it changes nothing; the flag stays open and is in the owner doc.
//
// A CEREMONY IS AN EVENT. The owner's rate card is explicit that photography
// for an event is charged separately, so this page is priced on the hourly
// rooftop with photography quoted on top, not per person like the other two.
//
// NO CELEBRANT IS PROMISED. The record flags it as unverified and the owner
// left the call to me. A celebrant is a person who has to turn up to a
// ceremony: promising one we cannot produce does not disappoint a customer, it
// ruins the event. So the page says couples bring their own words, which the
// record confirms most do, and treats an officiant as something to ask about.
// ---------------------------------------------------------------------------

const vows: Occasion = {
  categoryId: "vows-engagement",
  experienceSlug: "vow-renewal",
  enquireSlug: "vow-renewal",
  eyebrow: "A celebration, not a wedding",
  heading: "Saying it again, on a rooftop",
  lede:
    "A symbolic ceremony with the people you brought, photographed properly, on a rooftop above Giza. It marks the occasion. It does not change anything on paper.",
  // No hero photograph. The only candidate is the anniversary shoot, and it
  // is only honest with its caption attached, which a hero does not carry.
  // It leads the gallery instead.
  heroSlot: null,
  primaryCta: "Plan your ceremony",
  pricing: {
    applies: [rates.location],
    note: "A ceremony is an event rather than a photoshoot, so it is the rooftop by the hour with the photography quoted on top. Decoration is included. If you want a flying dress session afterwards, that is priced per person like any other session.",
    isEvent: true,
  },
  highlights: [
    {
      title: "A rooftop, reserved for your hours",
      detail:
        "Confirmed with the venue for your date. Yours for the ceremony and the portraits around it, with the pyramids across the view.",
    },
    {
      title: "Decoration, included",
      detail:
        "Styled for a ceremony rather than a party, from the designs we are running for your date. Part of what you are paying.",
    },
    {
      title: "The ceremony photographed, and portraits after",
      detail:
        "The words, the people watching, and the two of you afterwards. Event photography is quoted separately from the rooftop hours.",
    },
    {
      title: "Your own words",
      detail:
        "Most couples bring them. Nobody will ask to read them first, and nobody has to speak who does not want to.",
    },
  ],
  galleryHeading: "The roof, and the ceremony we have not photographed",
  galleryIntro:
    "We have not photographed a vow renewal on this roof, so none of the frames below is one, and each says what it actually is. The lead frame comes closest and is honest about it: a couple in wedding clothes on this roof, photographed at their anniversary. The labelled frames are the shots we want and do not have.",
  frames: [
    {
      slot: "couplesVows",
      span: "lead",
      caption:
        "A couple in wedding clothes at golden hour on this roof. Photographed at an anniversary shoot, not a vow renewal.",
    },
    {
      slot: "couplesRomance",
      span: "pair",
      caption: "Sunrise on the same roof, at the same anniversary shoot.",
    },
    {
      slot: "genderReveal",
      span: "pair",
      caption:
        "A decorated setup this team built and lit on this roof. Photographed at a gender reveal.",
    },
    {
      slot: null,
      span: "pair",
      wanted: "A ceremony in progress, guests watching",
      alt: "A couple exchanging vows on the rooftop with their guests seated watching and the pyramids behind them",
      caption: "The shot this page is for, and we do not have it.",
    },
    {
      slot: null,
      span: "pair",
      wanted: "A ceremony setup before anyone arrives",
      alt: "A rooftop styled for a symbolic ceremony, with seating and an aisle, before the guests arrive",
      caption: "Nothing shows what a ceremony styling looks like.",
    },
  ],
  feature: {
    eyebrow: "Read this first",
    heading: "This is symbolic, and that is not a technicality",
    lede:
      "We are being precise rather than cautious, because it is the one thing on this page that could be misunderstood in a way that matters.",
    points: [
      {
        title: "It creates no legal marriage",
        detail:
          "Not in Egypt and not anywhere else. We do not provide legal officiation, and nothing signed on the day has legal effect.",
      },
      {
        title: "If you need a legal ceremony",
        detail:
          "That is a separate process with your embassy and the Egyptian authorities, and it is not something we run or advise on.",
      },
      {
        title: "Which is what most people want",
        detail:
          "A renewal is a celebration of a marriage that already exists. That is how registrars and celebrants describe one everywhere, and it is what this is.",
      },
    ],
    note: "We are not offering a celebrant on this page. Most couples bring their own words, and if you want somebody to lead them, ask when you enquire and we will tell you honestly whether it can be arranged for your date rather than promise it here.",
  },
  steps: [
    {
      title: "Tell us the date and how many are coming",
      detail:
        "The number matters early: capacity belongs to the roof rather than to us, and we confirm it with them.",
    },
    {
      title: "Say what the ceremony is",
      detail:
        "A vow renewal, an engagement celebration, or a symbolic ceremony of your own shape. It changes the styling and the order of the hour.",
    },
    {
      title: "Choose how it looks",
      detail:
        "The decoration is included and styled for a ceremony. We send you the designs available for your date.",
    },
    {
      title: "We confirm the roof",
      detail:
        "The venue, the date, the hours and your numbers. A month is comfortable, because the venue, the styling and anybody you are bringing in all have to line up.",
    },
    {
      title: "The quotation, in writing",
      detail:
        "The rooftop hours, the event photography, and anything else you asked for. Nothing is held before it is agreed.",
    },
    {
      title: "The ceremony, and the portraits after",
      detail:
        "Photographed throughout. Colour-graded and delivered afterwards.",
    },
  ],
  extras: [
    { title: "A cinematic film of the ceremony", detail: "Shot and edited in house." },
    {
      title: "A flying dress session afterwards",
      detail: "On the same roof, priced per person like any other session.",
    },
    { title: "Personalised signage and messages", detail: "Worked into the styling." },
    { title: "Flowers and additional styling", detail: "Through a supplier, confirmed separately." },
    {
      title: "A musician or singer",
      detail: "Through a partner, and subject to what the venue allows at that hour.",
    },
  ],
  prepare: [
    "How many people are coming, which is a venue question before it is ours.",
    "Whether it is a vow renewal, an engagement celebration, or something of your own shape.",
    "Whether you are bringing your own words, and whether anybody else is speaking.",
    "How long you want the roof for, since a ceremony is priced by the hour.",
    "Whether you want a flying dress session afterwards, which is priced per person.",
  ],
  faqs: [
    {
      question: "Is this a legal marriage?",
      answer:
        "No, and we are being precise rather than cautious. This is a symbolic celebration. It creates no legal marriage in Egypt or anywhere else, we do not provide legal officiation, and nothing signed on the day has legal effect. If you need a legal ceremony, that is a separate process with your embassy and the Egyptian authorities.",
    },
    {
      question: "What does it cost?",
      answer:
        "A ceremony is an event rather than a photoshoot, so the rooftop is $150 an hour and the event photography is quoted on top of it. Decoration is included. A flying dress session afterwards is priced per person, at $200 for a dress from the collection or $100 in your own clothes.",
    },
    {
      question: "Do you provide someone to lead the ceremony?",
      answer:
        "We are not offering a celebrant on this page, because we would rather not promise a person we cannot be sure of. Most couples bring their own words and read them themselves. If you want somebody to lead it, ask when you enquire and we will tell you honestly whether it can be arranged for your date.",
    },
    {
      question: "Can we bring our own words?",
      answer: "Yes. Most people do, and nobody will ask to read them first.",
    },
    {
      question: "Is an engagement celebration the same thing?",
      answer:
        "Close enough that it is planned the same way: the roof by the hour, decoration included, photography quoted on top. If you are planning to actually propose, that is a different page and a different kind of secrecy.",
    },
    {
      question: "How many people can come?",
      answer:
        "Capacity belongs to the rooftop rather than to us, and it differs by venue and by date. Give us your number when you enquire and we confirm it with them rather than promising it here.",
    },
  ],
  closingHeading: "Tell us the date, and who is coming",
  closingLede:
    "Give us the date, how many of you there are and how long you want the roof. We will come back with what the venue allows, the styling available, and the figure, in writing.",
};

export const occasions: Occasion[] = [romance, maternity, vows];

export function occasionByCategory(categoryId: string): Occasion | undefined {
  return occasions.find((occasion) => occasion.categoryId === categoryId);
}
