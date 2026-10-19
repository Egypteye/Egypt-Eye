/**
 * THE EXPERIENCES CATALOGUE.
 *
 * Everything this brand can be asked for beyond the three flying-dress
 * photoshoots: proposals, gender reveals, celebrations, maternity and family,
 * vow renewals, creator and editorial work, and rooftop production.
 *
 * =========================================================================
 * THE RULE THIS FILE EXISTS TO ENFORCE
 * =========================================================================
 * Almost none of this is a product yet. The owner listed what the business can
 * DO; that is not the same as a price, a venue agreement, a permit or an
 * inventory. So the shape of this file makes the honest answer the easy one:
 *
 *   - `pricing` defaults to "enquire". A number can only appear here once
 *     somebody has confirmed it, and the check script refuses a price on an
 *     experience whose `confirm` list still has an open price question.
 *   - `delivery` says who actually performs each thing. "in-house" is the
 *     only value that means we can simply do it. "venue", "partner" and
 *     "permissions" each mean a dependency a customer must be told about
 *     BEFORE they plan around it.
 *   - `included` may only list capabilities the owner has stated the business
 *     has. Everything aspirational goes in `extras` and is marked.
 *   - `dependencies` is rendered on the page, not hidden in a comment. A
 *     customer planning a surprise deserves to know that the rooftop is a
 *     hotel's and not ours.
 *
 * =========================================================================
 * THE LOCATION SENTENCE, WHICH IS NOT MARKETING
 * =========================================================================
 * These experiences happen on PRIVATE HOTEL ROOFTOPS AND APPROVED STAGES WITH
 * A VIEW OF THE PYRAMIDS. They are not inside the Giza archaeological
 * complex. That distinction is commercially good (no ticket, no gate, and the
 * hour before the site opens) and it is also a compliance boundary: filming
 * inside an antiquities site is a separate permitted activity with its own
 * cost and lead time. Nothing here may blur the two.
 */

export type ExperienceCategoryId =
  | "proposals"
  | "gender-reveal"
  | "celebrations"
  | "romance"
  | "maternity-family"
  | "vows-engagement"
  | "creators"
  | "music-production";

/**
 * Who actually performs a thing. Rendered to the customer, because the
 * difference between "we do this" and "a hotel has to agree to this" is the
 * difference between a plan and a disappointment.
 */
export type ExperienceDelivery = "in-house" | "venue" | "partner" | "permissions";

export const DELIVERY_LABELS: Record<ExperienceDelivery, string> = {
  "in-house": "We do this ourselves",
  venue: "Needs the venue's agreement",
  partner: "Arranged through a supplier we work with",
  permissions: "May need permissions confirming first",
};

/**
 * `enquire` is the default and the honest one. A figure may only appear here
 * when the owner has confirmed it, which is why the other two shapes carry the
 * number rather than it living loose on the experience.
 */
export type ExperiencePricing =
  | { kind: "enquire" }
  | { kind: "from"; fromUsd: number }
  | { kind: "fixed"; priceUsd: number };

export type FlyingDressExperience = {
  slug: string;
  category: ExperienceCategoryId;
  /** Short label for cards and navigation. */
  name: string;
  /** Full editorial title. */
  title: string;
  eyebrow: string;
  intro: string;
  /** Who this is for, in their own words rather than ours. */
  whoItIsFor: string[];
  /** CONFIRMED capabilities only. Anything aspirational belongs in `extras`. */
  included: string[];
  /** Optional, and each one says who supplies it. */
  extras: { label: string; delivery: ExperienceDelivery }[];
  delivery: ExperienceDelivery[];
  pricing: ExperiencePricing;
  durationNote: string;
  locationNote: string;
  /** How far ahead this realistically needs booking. */
  leadTimeNote: string;
  /** Shown on the page. A customer planning around this deserves to see it. */
  dependencies: string[];
  faqs: { question: string; answer: string }[];
  /** What the owner still has to confirm before any of this is sold as fixed. */
  confirm: string[];
};

export type ExperienceCategory = {
  id: ExperienceCategoryId;
  /** URL segment under /celebrations or /creative. */
  slug: string;
  section: "celebrations" | "creative";
  name: string;
  title: string;
  intro: string;
  /**
   * The <meta name="description">, when the intro should not be it.
   *
   * These routes used `intro` for both, and the two have different jobs. An
   * intro is the first thing a visitor reads once they have already arrived,
   * so it can be short and can assume the page around it. A description is
   * read in a result list with no page around it, by someone deciding whether
   * to click, and Google renders roughly 110 to 160 characters of it. Five of
   * these intros came in at 91 to 105: not wrong, just leaving half the line
   * empty where the location and what is actually included could have been.
   *
   * Padding the intro to fix the description would have damaged the page to
   * serve the result, so the two are separate fields now. Every one of these
   * is assembled from facts already on its own page — the rooftop above Giza,
   * the sitting, what is photographed. None adds a claim the page does not
   * already make, and none carries a price, because no price is confirmed.
   */
  metaDescription?: string;
};

export const experienceCategories: ExperienceCategory[] = [
  {
    id: "proposals",
    slug: "marriage-proposals",
    section: "celebrations",
    name: "Marriage proposals",
    title: "Proposals, above the pyramids",
    intro:
      "A private rooftop, a decoration you choose, and a photographer already in position when she turns around. We plan it with you and nobody else hears about it.",
  },
  {
    id: "gender-reveal",
    slug: "gender-reveals",
    section: "celebrations",
    name: "Gender reveals",
    title: "Gender reveals with a view",
    intro:
      "The moment itself, photographed and filmed, with the family in the frame and the pyramids behind them.",
    metaDescription:
      "The moment you both find out, photographed and filmed on a rooftop above Giza, with your family in the frame and the pyramids behind them.",
  },
  {
    id: "celebrations",
    slug: "birthdays-and-celebrations",
    section: "celebrations",
    name: "Birthdays and celebrations",
    title: "Birthdays and private celebrations",
    intro:
      "A milestone birthday, a graduation, a reunion, or an evening that simply deserved more than a restaurant.",
    metaDescription:
      "A milestone birthday, a graduation or a reunion, photographed on a private rooftop above the Pyramids of Giza instead of in a restaurant.",
  },
  {
    id: "romance",
    slug: "anniversaries-and-romance",
    section: "celebrations",
    name: "Anniversaries and romance",
    title: "Anniversaries and romantic evenings",
    intro:
      "For couples who are not proposing and still want the evening to be the one they talk about.",
    metaDescription:
      "For couples who are not proposing: an anniversary or a romantic evening on a rooftop above the Pyramids of Giza, photographed properly.",
  },
  {
    id: "maternity-family",
    slug: "maternity-and-family",
    section: "celebrations",
    name: "Maternity and family",
    title: "Maternity and family portraits",
    intro:
      "A pregnancy announcement, a maternity session in a flowing dress, or three generations in one frame.",
    metaDescription:
      "A pregnancy announcement, a maternity session in a flowing dress, or three generations in one frame, on a rooftop above the Pyramids of Giza.",
  },
  {
    id: "vows-engagement",
    slug: "vow-renewals-and-engagements",
    section: "celebrations",
    name: "Vow renewals and engagements",
    title: "Vow renewals and engagement celebrations",
    intro:
      "A symbolic ceremony and the photographs to go with it. A celebration, not a legal marriage.",
    metaDescription:
      "A symbolic vow renewal or engagement celebration on a rooftop above the Pyramids of Giza, with the photographs to go with it. Not a legal marriage.",
  },
  {
    id: "creators",
    slug: "creators-and-editorial",
    section: "creative",
    name: "Creators and editorial",
    title: "Creator, editorial and brand shoots",
    intro:
      "For people whose work is the picture: creators, models, fashion labels and personal brands.",
    metaDescription:
      "Rooftop and desert shoots near Giza for creators, models, fashion labels and personal brands, with the pyramids on the skyline behind you.",
  },
  {
    id: "music-production",
    slug: "dj-and-music",
    section: "creative",
    name: "DJ and music",
    title: "DJ, music and rooftop production",
    intro:
      "A set filmed at golden hour with the pyramids on the skyline, planned properly rather than improvised.",
    metaDescription:
      "A DJ set or music session filmed at golden hour on a rooftop above Giza, with the pyramids on the skyline. Planned with the venue, not improvised.",
  },
];

export function experienceCategoryById(id: string): ExperienceCategory | undefined {
  return experienceCategories.find((c) => c.id === id);
}

export function experienceCategoryBySlug(slug: string): ExperienceCategory | undefined {
  return experienceCategories.find((c) => c.slug === slug);
}

/**
 * The location sentence, written once.
 *
 * It appears on every experience page, because every one of them depends on it
 * and because a customer who skims one page should not be able to miss it.
 */
export const ROOFTOP_LOCATION_NOTE =
  "A private hotel rooftop or an approved stage with a view of the Pyramids of Giza. These experiences are not held inside the archaeological complex, which is why there is no entry ticket and no gate to wait for.";

/** Said on every page that mentions a rooftop. */
export const VENUE_DEPENDENCY =
  "The rooftop belongs to a hotel, not to us. Every date is confirmed with the venue before anything is final, and some setups need their approval first.";

/**
 * THE EXPERIENCES.
 *
 * Every `included` line below traces to a capability the owner stated the
 * business has: the dress collection, photography and posing direction, video
 * and social content, lighting equipment, rooftop access subject to the venue,
 * proposal and gender-reveal planning with a choice of existing decoration
 * designs, male outfits, dress rental, and coordination of custom requests.
 *
 * Nothing else is in `included`. Cake, flowers, musicians, dining, transport
 * and sound equipment are all in `extras` with the supplier named, because the
 * owner has not confirmed that any of them is ours to promise.
 *
 * Every price is `enquire`. Not one figure in this catalogue has been
 * confirmed, and inventing one is the single most expensive mistake available
 * here: it is the number a customer plans around and the number they quote
 * back when it turns out to be wrong.
 */
export const flyingDressExperiences: FlyingDressExperience[] = [
  {
    slug: "rooftop-proposal",
    category: "proposals",
    name: "The rooftop proposal",
    title: "A proposal she does not see coming",
    eyebrow: "Planned in private",
    intro:
      "You tell us the date and what she loves. We set the rooftop, position the photographer where she will not look, and stay out of the way until the moment happens. Afterwards there is time for portraits, while she is still shaking.",
    whoItIsFor: [
      "Someone proposing in Egypt who wants the moment itself photographed, not re-enacted afterwards.",
      "Travellers who want the pyramids in the frame without a ticket queue or a crowd.",
      "Anyone who would rather hand the planning to somebody who has done it before.",
    ],
    included: [
      "A planning conversation in private, on the channel you choose, so nothing reaches your partner.",
      "A choice from our existing proposal decoration designs.",
      "A private rooftop with a view of the pyramids, confirmed with the venue for your date.",
      "A photographer in position before you arrive, shooting the approach, the moment and the reaction.",
      "Couple portraits afterwards, directed throughout.",
      "Colour-graded photographs delivered after the shoot.",
    ],
    extras: [
      { label: "A cinematic film of the proposal", delivery: "in-house" },
      { label: "Vertical reels for social media", delivery: "in-house" },
      { label: "A flying dress session afterwards, with an outfit change", delivery: "in-house" },
      { label: "A coordinated outfit for him", delivery: "in-house" },
      { label: "Creative lighting for an evening setup", delivery: "in-house" },
      { label: "A custom sign, names or a personal message in the decoration", delivery: "in-house" },
      { label: "Your own song playing as she arrives", delivery: "venue" },
      { label: "A live musician, singer or DJ", delivery: "partner" },
      { label: "Cake, flowers or refreshments", delivery: "partner" },
      { label: "A private dining arrangement at the venue", delivery: "venue" },
      { label: "Transport to and from your hotel", delivery: "partner" },
    ],
    delivery: ["in-house", "venue", "partner"],
    pricing: { kind: "enquire" },
    durationNote:
      "Allow two to three hours on the day: the setup before you arrive, the proposal itself, and the portraits afterwards.",
    locationNote: ROOFTOP_LOCATION_NOTE,
    leadTimeNote:
      "Two weeks or more is comfortable. Shorter notice is sometimes possible and depends entirely on whether the rooftop is free.",
    dependencies: [
      VENUE_DEPENDENCY,
      "Musicians, cake, flowers and transport are arranged through suppliers, so they are confirmed separately and may change the price.",
      "An evening proposal depends on what the venue allows after dark on your date.",
    ],
    faqs: [
      {
        question: "Will anything reach my partner?",
        answer:
          "No. You choose how we contact you when you enquire, and we use only that channel. Nothing is sent to anyone else, and there is no shared notification, calendar invitation or confirmation that goes anywhere but to you.",
      },
      {
        question: "What if none of the decoration designs is right?",
        answer:
          "Tell us what you had in mind. We coordinate custom setups, and whether yours is possible depends on the design, the date and what the venue allows. We will tell you honestly before you commit to anything.",
      },
      {
        question: "What happens if she says no?",
        answer:
          "The photographer stops. That is the whole answer. You are not charged differently and nobody will ask you about it.",
      },
      {
        question: "Can we do this inside the pyramids complex?",
        answer:
          "Not through us. These are rooftop experiences with a view of the pyramids. Filming inside the archaeological site is a separate permitted activity with its own cost and lead time, and it is not what we sell.",
      },
    ],
    confirm: [
      "PRICE. No figure has been set for any proposal package. Nothing can be quoted on the site until one is.",
      "Which of the existing decoration designs are currently available, and photographs of each.",
      "Which rooftop venues are agreed, and what each allows after dark.",
      "Whether live musicians are a supplier we can reliably call on, or an aspiration.",
      "Whether transport is offered directly or arranged through a partner.",
    ],
  },
  {
    slug: "gender-reveal",
    category: "gender-reveal",
    name: "Gender reveal",
    title: "The moment you both find out",
    eyebrow: "For the family",
    intro:
      "The reveal is over in two seconds and the photographs are what is left. We plan the moment with whoever is keeping the secret, and film it so you can watch your own face afterwards.",
    whoItIsFor: [
      "Parents who want the reveal itself captured rather than described.",
      "Families travelling together who want everyone in the frame.",
      "Anyone combining the announcement with a maternity session.",
    ],
    included: [
      "A planning conversation with whoever is holding the secret.",
      "A choice from our existing decoration designs, in a colour theme you pick.",
      "A rooftop with a view of the pyramids, confirmed with the venue.",
      "Photography of the reveal and of the family around it.",
      "Family portraits before or after the moment.",
      "Colour-graded photographs delivered after the session.",
    ],
    extras: [
      { label: "Cinematic video of the reveal", delivery: "in-house" },
      { label: "Slow-motion footage and vertical reels", delivery: "in-house" },
      { label: "A maternity flying dress session on the same day", delivery: "in-house" },
      { label: "Personalised names or a message in the decoration", delivery: "in-house" },
      { label: "Cake or reveal props", delivery: "partner" },
      { label: "Flowers and additional styling", delivery: "partner" },
    ],
    delivery: ["in-house", "venue", "partner"],
    pricing: { kind: "enquire" },
    durationNote:
      "Usually ninety minutes to two hours, depending on how many people are coming and whether portraits are part of it.",
    locationNote: ROOFTOP_LOCATION_NOTE,
    leadTimeNote:
      "Two weeks or more, mainly so the decoration and any props can be arranged properly.",
    dependencies: [
      VENUE_DEPENDENCY,
      "The reveal mechanism is agreed case by case with the venue. We will not confirm a particular prop or effect until they have.",
      "Cake, props and flowers come through suppliers and are confirmed separately.",
    ],
    faqs: [
      {
        question: "How do you keep it a secret from us?",
        answer:
          "Someone has to know, and it is usually a family member or the clinic. We take the result from them and neither of us tells you. If nobody is available to hold it, say so when you enquire and we will suggest another way.",
      },
      {
        question: "Can we bring our own cake or props?",
        answer:
          "Usually, and it depends on the venue. Tell us what you are planning when you enquire so we can check rather than guess.",
      },
      {
        question: "How many people can come?",
        answer:
          "That is a venue question rather than ours. Tell us the number when you enquire and we will confirm what the rooftop can take on your date.",
      },
    ],
    confirm: [
      "PRICE. Nothing has been set for a gender reveal, with or without video.",
      "Which decoration designs exist for this, and photographs of them.",
      "What reveal mechanisms the venues actually permit. Nothing specific should be advertised until this is answered.",
      "Whether cake and props are reliably available through a supplier.",
    ],
  },
  {
    slug: "private-celebration",
    category: "celebrations",
    name: "Private celebration",
    title: "Birthdays, milestones and the evenings in between",
    eyebrow: "Your occasion",
    intro:
      "A thirtieth, a graduation, a reunion of people who live in four countries. The setup is the same craft as a proposal, pointed at whatever you are celebrating.",
    whoItIsFor: [
      "Travellers marking something while they are in Egypt.",
      "Groups who want photographs that are not taken on a phone.",
      "Anyone who wants an evening organised rather than improvised.",
    ],
    included: [
      "A choice from our existing decoration designs.",
      "A rooftop with a view of the pyramids, confirmed with the venue.",
      "Photography through the evening, directed where you want it.",
      "Colour-graded photographs delivered afterwards.",
    ],
    extras: [
      { label: "Video and vertical reels", delivery: "in-house" },
      { label: "A flying dress session as part of the evening", delivery: "in-house" },
      { label: "Coordinated outfits", delivery: "in-house" },
      { label: "Creative lighting for an evening setup", delivery: "in-house" },
      { label: "Personalised signs and messages", delivery: "in-house" },
      { label: "Cake and flowers", delivery: "partner" },
      { label: "A musician or DJ", delivery: "partner" },
      { label: "Catering or a private dining arrangement", delivery: "venue" },
    ],
    delivery: ["in-house", "venue", "partner"],
    pricing: { kind: "enquire" },
    durationNote: "Set by what you are planning. Tell us the shape of the evening and we will tell you what it needs.",
    locationNote: ROOFTOP_LOCATION_NOTE,
    leadTimeNote: "Two weeks or more for anything with decoration or catering in it.",
    dependencies: [
      VENUE_DEPENDENCY,
      "Group size, music and catering are all venue decisions before they are ours.",
      "Amplified music on a rooftop is never assumed. It is checked with the venue for your date.",
    ],
    faqs: [
      {
        question: "Is there a minimum or maximum group size?",
        answer:
          "Not one we set. The rooftop sets it, and it differs by venue and by date. Give us your number when you enquire.",
      },
      {
        question: "Can we have music?",
        answer:
          "Sometimes, and it depends on the venue, the hour and how loud. We check rather than promise, because a rooftop above a hotel full of sleeping guests has rules.",
      },
    ],
    confirm: [
      "PRICE. Nothing set for celebrations of any size.",
      "Which decoration designs suit a birthday rather than a proposal.",
      "What each venue allows for group size, catering and amplified music.",
    ],
  },
  {
    slug: "anniversary-and-romance",
    category: "romance",
    name: "Anniversary and romance",
    title: "For couples who are not proposing",
    eyebrow: "Already together",
    intro:
      "An anniversary, a honeymoon, or a surprise for somebody who did not expect one. The same rooftop and the same photography, without the question at the end.",
    whoItIsFor: [
      "Couples on honeymoon who want photographs worth printing.",
      "Anyone planning a surprise for a partner.",
      "Travellers marking an anniversary somewhere that will be remembered.",
    ],
    included: [
      "A choice from our existing decoration designs.",
      "A rooftop with a view of the pyramids, confirmed with the venue.",
      "A directed couple session, so neither of you has to know how to pose.",
      "Colour-graded photographs delivered afterwards.",
    ],
    extras: [
      { label: "A cinematic couple's film", delivery: "in-house" },
      { label: "A flying dress and a coordinated outfit for him", delivery: "in-house" },
      { label: "A personalised sign or message", delivery: "in-house" },
      { label: "Creative lighting for an evening session", delivery: "in-house" },
      { label: "Cake, flowers or refreshments", delivery: "partner" },
      { label: "A private dining arrangement at the venue", delivery: "venue" },
      { label: "A musician", delivery: "partner" },
    ],
    delivery: ["in-house", "venue", "partner"],
    pricing: { kind: "enquire" },
    durationNote: "Around two hours for a session with a setup and portraits.",
    locationNote: ROOFTOP_LOCATION_NOTE,
    leadTimeNote: "A week or two is usually enough unless there is catering or a musician involved.",
    dependencies: [
      VENUE_DEPENDENCY,
      "Dining and musicians are confirmed separately and change the price.",
    ],
    faqs: [
      {
        question: "Can this be a surprise for my partner?",
        answer:
          "Yes, and we handle it the same way as a proposal: you choose the channel we contact you on, and nothing goes anywhere else.",
      },
    ],
    confirm: [
      "PRICE. Nothing set.",
      "Whether a private dining arrangement is genuinely available at any venue, and on what terms.",
    ],
  },
  {
    slug: "maternity-and-family",
    category: "maternity-family",
    name: "Maternity and family",
    title: "Maternity and family portraits",
    eyebrow: "The people in it",
    intro:
      "A maternity session in a flowing dress, a pregnancy announcement, or three generations in one frame with the pyramids behind them.",
    whoItIsFor: [
      "Expecting parents who want the photographs while it still shows.",
      "Families travelling together who will not all be in one country again soon.",
      "Anyone announcing a pregnancy and wanting the picture to carry it.",
    ],
    included: [
      "A dress from our collection, cut to fit all sizes, in the colour you choose.",
      "A rooftop or outdoor location with a view of the pyramids, confirmed for your date.",
      "A directed session at a pace that suits whoever is in it.",
      "Colour-graded photographs delivered afterwards.",
    ],
    extras: [
      { label: "Video and vertical reels", delivery: "in-house" },
      { label: "A gender reveal on the same day", delivery: "in-house" },
      { label: "Coordinated outfits for partners and children", delivery: "in-house" },
      { label: "Additional edited images", delivery: "in-house" },
      { label: "Hair and makeup", delivery: "partner" },
    ],
    delivery: ["in-house", "venue", "partner"],
    pricing: { kind: "enquire" },
    durationNote:
      "Allow around ninety minutes. We work at whatever pace the session needs, and there is somewhere to sit between frames.",
    locationNote: ROOFTOP_LOCATION_NOTE,
    leadTimeNote: "A week or two, and earlier in a pregnancy is easier to schedule than later.",
    dependencies: [
      VENUE_DEPENDENCY,
      "The dresses are cut to fit all sizes. We still confirm the fit and the colour for your stage of pregnancy before the date rather than on the day.",
    ],
    faqs: [
      {
        question: "Will a dress fit at any stage of pregnancy?",
        answer:
          "The collection is cut to fit all sizes, so a maternity session is not a question of whether we have your size. Tell us how far along you will be on the date and we will confirm the fit and the colours available for it before you book, rather than on the morning.",
      },
      {
        question: "How early in the day is it?",
        answer:
          "Early, for the light, and that is the one thing we will not move. We will tell you the exact time for your date when we confirm it.",
      },
    ],
    confirm: [
      "PRICE. Nothing set for maternity or family sessions.",
      "Whether hair and makeup is a supplier we can reliably call on.",
    ],
  },
  {
    slug: "vow-renewal",
    category: "vows-engagement",
    name: "Vow renewal",
    title: "Saying it again, on a rooftop",
    eyebrow: "A celebration, not a wedding",
    intro:
      "A symbolic ceremony with the people you brought, photographed properly. It marks the occasion; it does not change anything on paper.",
    whoItIsFor: [
      "Couples marking a significant anniversary away from home.",
      "Anyone who wants the ceremony they did not get the first time.",
      "Small groups travelling together for the occasion.",
    ],
    included: [
      "A choice from our existing decoration designs, styled for a ceremony.",
      "A rooftop with a view of the pyramids, confirmed with the venue.",
      "Photography of the ceremony and portraits afterwards.",
      "Colour-graded photographs delivered afterwards.",
    ],
    extras: [
      { label: "A cinematic film of the ceremony", delivery: "in-house" },
      { label: "A flying dress session afterwards", delivery: "in-house" },
      { label: "Personalised signage and messages", delivery: "in-house" },
      { label: "Flowers and additional styling", delivery: "partner" },
      { label: "A musician or singer", delivery: "partner" },
      { label: "A celebrant to lead the words", delivery: "partner" },
    ],
    delivery: ["in-house", "venue", "partner"],
    pricing: { kind: "enquire" },
    durationNote: "Two to three hours including the setup and the portraits.",
    locationNote: ROOFTOP_LOCATION_NOTE,
    leadTimeNote: "A month is comfortable, because the venue, the styling and any musician all have to line up.",
    dependencies: [
      VENUE_DEPENDENCY,
      "A celebrant, if you want one, is arranged through a partner and confirmed separately.",
    ],
    faqs: [
      {
        question: "Is this a legal marriage?",
        answer:
          "No, and we are being precise rather than cautious. This is a symbolic celebration. It creates no legal marriage in Egypt or anywhere else, we do not provide legal officiation, and nothing signed on the day has legal effect. If you need a legal ceremony, that is a separate process with your embassy and the Egyptian authorities.",
      },
      {
        question: "Can we bring our own words?",
        answer: "Yes. Most people do, and nobody will ask to read them first.",
      },
    ],
    confirm: [
      "PRICE. Nothing set.",
      "Whether a celebrant is genuinely available through a partner, or whether this should be removed.",
      "LEGAL REVIEW of the wording above before it is published, since it is the sentence that stops a symbolic ceremony being mistaken for a legal one.",
    ],
  },
  {
    slug: "creator-session",
    category: "creators",
    name: "Creator session",
    title: "For people whose work is the picture",
    eyebrow: "Content and editorial",
    intro:
      "A shoot built around what you need to publish: stills, vertical video, several looks, and a location nobody else in your feed has.",
    whoItIsFor: [
      "Creators and influencers who need a block of content, not six photographs.",
      "Models building a portfolio.",
      "Fashion labels and personal brands shooting a campaign or a collection.",
    ],
    included: [
      "A directed session with a photographer, planned around the shots you need.",
      "Access to our dress collection for the looks you choose.",
      "A rooftop or outdoor location with a view of the pyramids, confirmed for your date.",
      "Creative lighting setups where the shoot calls for them.",
      "Colour-graded photographs delivered afterwards.",
    ],
    extras: [
      { label: "Short-form vertical video and reels", delivery: "in-house" },
      { label: "Behind-the-scenes footage", delivery: "in-house" },
      { label: "Multiple outfit changes", delivery: "in-house" },
      { label: "Coordinated male outfits for a couple's session", delivery: "in-house" },
      { label: "Additional edited images beyond the standard delivery", delivery: "in-house" },
      { label: "A half-day or full-day content block", delivery: "in-house" },
      { label: "Hair, makeup and styling", delivery: "partner" },
    ],
    delivery: ["in-house", "venue", "partner", "permissions"],
    pricing: { kind: "enquire" },
    durationNote:
      "From a single session to a full day. A content block is quoted by the hour rather than by the frame.",
    locationNote: ROOFTOP_LOCATION_NOTE,
    leadTimeNote:
      "Two weeks for a straightforward session. Longer for a brand campaign, which may need usage terms agreed first.",
    dependencies: [
      VENUE_DEPENDENCY,
      "A commercial shoot is a different conversation from a personal one. Tell us which it is when you enquire: it changes the venue's terms and the usage we agree, and both are settled before the shoot rather than after it.",
      "We do not fly drones and do not arrange drone filming. Egypt restricts it, and we are not going to put your shoot or our equipment at risk.",
    ],
    faqs: [
      {
        question: "Can I use the photographs for a paid brand campaign?",
        answer:
          "Tell us it is commercial when you enquire and we will handle it as its own conversation. Usage for a paid campaign is agreed case by case, in writing, before the shoot, and the venue may have its own terms about commercial work on their roof. It is a different quote rather than a surcharge sprung on you afterwards.",
      },
      {
        question: "Do you guarantee the content will perform?",
        answer:
          "No, and nobody honest does. We produce the photographs and the video. Reach, engagement and whether a reel travels are not things anyone can sell you.",
      },
      {
        question: "Can you film with a drone?",
        answer:
          "No. Drone use in Egypt is restricted and flying one without authorisation risks the equipment being seized. We will not offer it and we would advise against anyone who does.",
      },
    ],
    confirm: [
      "PRICE. Nothing set for sessions, half-days or full days.",
      "What the standard delivery actually is: how many edited images, and in what time.",
      "COMMERCIAL USAGE is deliberately not advertised as a standard offering (owner's rule, October 2026): these enquiries are handled individually. Standard usage terms could still be drafted so the case-by-case answer starts from something rather than nothing.",
      "Whether hair and makeup is a reliable supplier.",
    ],
  },
  {
    slug: "rooftop-music-session",
    category: "music-production",
    name: "Rooftop music session",
    title: "A set, filmed with the pyramids behind you",
    eyebrow: "DJs, producers and musicians",
    intro:
      "A sunset set, a live session, a visualiser, or promotional footage for a release. We plan the shoot, coordinate the rooftop, and film it properly.",
    whoItIsFor: [
      "DJs and producers who need footage that does not look like every other rooftop.",
      "Musicians filming a live session or a visualiser.",
      "Labels and managers producing promotional content around a release.",
    ],
    included: [
      "A planning conversation about the shots, the hour and the light.",
      "A rooftop request put to the venue for your date.",
      "Photography and video of the session.",
      "Creative lighting setups using our own equipment.",
      "Vertical reels cut for social media.",
      "Colour-graded delivery of the agreed footage.",
    ],
    extras: [
      { label: "Additional camera operators", delivery: "in-house" },
      { label: "A flying dress performer or model in the frame", delivery: "in-house" },
      { label: "Behind-the-scenes content", delivery: "in-house" },
      { label: "Sound equipment and DJ gear", delivery: "partner" },
      { label: "Introductions to sound, lighting and equipment suppliers", delivery: "partner" },
      { label: "Power beyond what the venue provides", delivery: "partner" },
    ],
    delivery: ["in-house", "venue", "partner", "permissions"],
    pricing: { kind: "enquire" },
    durationNote:
      "Most sessions are built around one hour of usable light. The shoot around it is longer.",
    locationNote: ROOFTOP_LOCATION_NOTE,
    leadTimeNote:
      "Three to four weeks. A rooftop music session needs the venue's agreement in writing and that is not a same-week conversation.",
    dependencies: [
      VENUE_DEPENDENCY,
      "WE DO NOT SUPPLY A SOUND SYSTEM, DJ EQUIPMENT OR GENERATORS. Our equipment is cameras and lighting. Everything else is yours to bring or ours to introduce you to a supplier for.",
      "Amplified sound on a hotel rooftop is the venue's decision, and often a conditional one. Treat it as unconfirmed until they confirm it.",
      "A commercial music video may need permissions beyond the venue's. We will say so rather than find out on the day.",
      "We do not fly drones and do not arrange drone filming.",
    ],
    faqs: [
      {
        question: "Do you provide the sound system?",
        answer:
          "No. We bring cameras and lighting. Sound, decks and power are either yours or arranged through a supplier, and we are happy to make the introduction. We would rather say this now than have you arrive expecting a booth.",
      },
      {
        question: "Can I play loud on the rooftop?",
        answer:
          "That is the venue's call and it usually comes with conditions about the hour and the volume. We put the request in and tell you the answer. Nobody should plan a set around a rooftop that has not said yes yet.",
      },
      {
        question: "Is this a public event?",
        answer:
          "No. These are private filming sessions. A ticketed or public event is a different thing entirely, with its own permissions, and it is not what this is.",
      },
      {
        question: "Can you film inside the pyramids complex?",
        answer:
          "No. Filming inside the archaeological site is a separately permitted activity with its own fees and lead times. What we offer is a rooftop with the pyramids in view.",
      },
    ],
    confirm: [
      "PRICE. Nothing set. The commercial model itself is still open: a coordination fee, an hourly production rate, a package, or a custom quote.",
      "EQUIPMENT INVENTORY. Exactly what cameras and lighting exist, so `included` can be specific instead of general.",
      "WHICH VENUES will agree to amplified music at all, and under what conditions. Until this is answered, no music session should be presented as straightforwardly available.",
      "Whether there are sound and equipment suppliers we can genuinely introduce people to.",
      "Whether a commercial music video needs permissions beyond the venue's, confirmed with an authoritative source rather than assumed.",
    ],
  },
];

export function experienceBySlug(slug: string): FlyingDressExperience | undefined {
  return flyingDressExperiences.find((e) => e.slug === slug);
}

export function experiencesInCategory(id: ExperienceCategoryId): FlyingDressExperience[] {
  return flyingDressExperiences.filter((e) => e.category === id);
}

/** Every experience that still has an unanswered price question. */
export function experiencesAwaitingPrice(): FlyingDressExperience[] {
  return flyingDressExperiences.filter((e) => e.pricing.kind === "enquire");
}

/**
 * WHERE AN EXPERIENCE LIVES, answered once.
 *
 * The category's `id` and its `slug` are deliberately different ("proposals"
 * against "marriage-proposals"): the id is the stable key the code joins on,
 * the slug is the URL a customer sees and a search engine indexes. Building
 * the path from the id gives /celebrations/proposals, which is a 404.
 *
 * That bug was written and caught here within a minute of each other, which is
 * exactly why this is a function rather than a template literal repeated in
 * the page, the sitemap and the enquiry email.
 */
export function experiencePath(experience: FlyingDressExperience): string {
  const category = experienceCategoryById(experience.category);
  if (!category) return "/celebrations";
  return `/${category.section}/${category.slug}`;
}

export function categoryPath(category: ExperienceCategory): string {
  return `/${category.section}/${category.slug}`;
}
