/**
 * WHO WE WANT TO HEAR FROM, and what each of them is actually proposing.
 *
 * A single "get in touch" form treats a hotel offering a rooftop, a brand
 * buying a campaign and an influencer proposing an exchange as the same
 * conversation. They are not, and the differences decide who reads the
 * message and how fast it gets answered.
 *
 * So the categories below are routing, not decoration. Each one carries the
 * question that actually matters for that kind of partner, and the form shows
 * only that question rather than asking a DJ for their engagement rate.
 *
 * NOTHING HERE PROMISES ANYTHING. Every one of these is an invitation to
 * propose, reviewed by a person. No collaboration is approved by submitting a
 * form, no free shoot is offered, and the page says so.
 */

export type CollaborationCategoryId =
  | "creators"
  | "music"
  | "brands"
  | "venues"
  | "travel-trade"
  | "production";

export type CollaborationCategory = {
  id: CollaborationCategoryId;
  name: string;
  /** Who this is, in their words. */
  who: string;
  /** What a partnership with them tends to look like. */
  shape: string;
  /** The one question worth asking this kind of partner first. */
  prompt: string;
};

export const collaborationCategories: CollaborationCategory[] = [
  {
    id: "creators",
    name: "Creators and photographers",
    who: "Influencers, content creators, photographers, videographers and models.",
    shape:
      "Usually a shoot in exchange for content, sometimes paid work, sometimes a recurring arrangement. We look at the work rather than the follower count.",
    prompt: "Where can we see your work, and what are you proposing?",
  },
  {
    id: "music",
    name: "DJs, producers and musicians",
    who: "DJs, music producers, musicians, performers and labels.",
    shape:
      "A filmed set, a visualiser, promotional content around a release, or a performance in a shoot. We bring cameras and lighting; sound and decks are yours or a supplier's.",
    prompt: "What are you making, and do you have a rooftop already or need one found?",
  },
  {
    id: "brands",
    name: "Brands and campaigns",
    who: "Fashion, beauty, lifestyle, travel and hospitality brands.",
    shape:
      "Paid production, usually with a usage licence agreed in advance. Tell us the deliverables and where they will run.",
    prompt: "What are the deliverables, where will they run, and what is the budget?",
  },
  {
    id: "venues",
    name: "Venues and suppliers",
    who: "Hotels, rooftops, florists, decorators, cake makers, hair and makeup artists, event suppliers.",
    shape:
      "An ongoing supply or venue relationship. This is the category we most want to hear from: almost every experience we sell depends on a rooftop somebody else owns.",
    prompt: "What do you provide, and where?",
  },
  {
    id: "travel-trade",
    name: "Travel trade",
    who: "Travel agencies, tour operators, destination management companies and planners.",
    shape:
      "Referral or commission arrangements, or adding our experiences to an itinerary you already sell.",
    prompt: "Who are your clients, and how do you usually structure a referral?",
  },
  {
    id: "production",
    name: "Production companies",
    who: "Production companies, directors, creative studios and equipment providers.",
    shape:
      "Crewing, equipment, or a larger production where we are one part of it. Also the right category if you need a local team in Cairo.",
    prompt: "What is the project, and what part would we play in it?",
  },
];

export function collaborationCategoryById(
  id: string
): CollaborationCategory | undefined {
  return collaborationCategories.find((c) => c.id === id);
}

/**
 * What somebody is proposing, commercially.
 *
 * Kept separate from the category because they cross: a brand may want paid
 * work OR an exchange, and a creator may want either. Asking both questions is
 * what makes the answer routable.
 */
export const collaborationModels = [
  { id: "paid", label: "Paid work, by us or by you" },
  { id: "exchange", label: "Content or services in exchange" },
  { id: "referral", label: "Referral, affiliate or commission" },
  { id: "supplier", label: "Supplying something we need" },
  { id: "venue", label: "Offering a venue or rooftop" },
  { id: "longterm", label: "An ongoing partnership" },
  { id: "other", label: "Something else" },
] as const;

export type CollaborationModelId = (typeof collaborationModels)[number]["id"];

export function collaborationModelById(id: string) {
  return collaborationModels.find((m) => m.id === id);
}

/**
 * Said on the page and in the confirmation email, in the same words.
 *
 * A collaboration page that reads as an open invitation generates a lot of
 * mail from people who believe submitting the form was the agreement. This is
 * the sentence that prevents that, so it lives in one place.
 */
export const COLLABORATION_NO_PROMISE =
  "Sending this is a proposal, not an agreement. A person reads every one, and nothing is agreed until we have replied and said so in writing.";
