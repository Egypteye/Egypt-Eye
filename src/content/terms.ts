// The Terms of Service, rendered at /terms.
//
// What was published here until now was a list of instructions to whoever
// would one day write them — "State how a booking becomes confirmed",
// "Explain who can request a change" — under a banner reading "Draft
// structure — not yet published". One section's entire body was "This needs
// a lawyer's input — do not publish liability language without legal
// review." That page was live, indexable and linked from the footer of a
// site taking card payments: the twin of the privacy policy defect, on the
// document that is supposed to define the contract.
//
// Every figure below is taken from somewhere it already exists in this
// repository — site.policies, cancellationPolicy.ts, and the behaviour the
// booking code actually enforces. Nothing here is a new commercial promise,
// because terms of service are not the place to invent one.
//
// In content/ rather than lib/, so the i18n extractor walks it without
// anything further being wired up. See the note at the top of
// cancellationPolicy.ts, and what went wrong with the privacy policy.
//
// ON LIABILITY. There is deliberately no clause limiting our liability. The
// draft page was right that such wording needs a lawyer, and a badly drafted
// limitation is worse than none at all: in the EU and the UK an unfair term
// in a consumer contract is simply void, and having tried to impose one is
// not a good look in the dispute that follows. So the terms state which law
// governs and that the customer's own consumer rights are untouched, which
// is accurate and needs no review. /admin lists the reviewed clause as
// outstanding.

import { cancellationSummary } from "./cancellationPolicy";
import { site } from "./site";

export type TermsBlock = { kind: "p"; text: string } | { kind: "list"; items: string[] };

export type TermsSection = {
  /** Stable anchor id — other pages deep-link to these, so don't rename. */
  id: string;
  title: string;
  blocks: TermsBlock[];
  /** A page that carries the binding detail in full. */
  href?: string;
  hrefLabel?: string;
};

export const termsLastUpdated = "18 October 2026";

export const termsIntro =
  "These terms cover what you can expect from us and what we need from you when you book a tour, an experience, a photoshoot or an item from the boutique. They sit alongside our Cancellation Policy and Privacy Policy, both published in full.";

/**
 * The sections.
 *
 * `operator` names the licensed agency when Site Settings → Operator of
 * record has been filled in, and otherwise says plainly that the tours run
 * under a licensed agency without naming or numbering one. Egypt Eye holds
 * no tourism licence of its own; see lib/privacy/policy.ts.
 */
export function termsSections(legal: {
  operatorName?: string;
  operatorLicence?: string;
  operatorAddress?: string;
} = {}): TermsSection[] {
  const operatorBlocks: TermsBlock[] = [
    {
      kind: "p",
      text: legal.operatorName
        ? `Egypt Eye Travel plans your trip and is the team you deal with. The tour itself is arranged and operated by ${legal.operatorName}${
            legal.operatorLicence ? `, which holds tourism licence ${legal.operatorLicence}` : ""
          }, and they are the operator of record for your booking.`
        : "Egypt Eye Travel plans your trip and is the team you deal with. The tour itself is arranged and operated through the licensed Egyptian agency we work under, who are the operator of record for your booking. Ask us and we will tell you who they are.",
    },
    {
      kind: "p",
      text: "This is a common arrangement in Egyptian travel and we would rather you heard it from us than wondered. It means the people answering your messages are the same people who planned your days, and the legal responsibility for operating the tour sits with a licensed agency.",
    },
  ];

  return [
    { id: "who-you-are-booking-with", title: "Who you are booking with", blocks: operatorBlocks },
    {
      id: "how-a-booking-is-confirmed",
      title: "How a booking becomes confirmed",
      blocks: [
        {
          kind: "p",
          text: "You tell us what you are looking for, we put together an itinerary and a price, and nothing is committed on either side until you accept it.",
        },
        {
          kind: "p",
          text: "A booking is confirmed when we confirm it to you in writing — not at the moment a payment goes through. If a payment succeeds but we have not yet confirmed, your booking is not yet confirmed and your money is not at risk: we either confirm it or refund you. We would rather say this plainly than let a payment screen imply something we have not agreed.",
        },
        {
          kind: "p",
          text: site.policies.voucher,
        },
      ],
    },
    {
      id: "prices-and-payment",
      title: "Prices and payment",
      blocks: [
        { kind: "p", text: site.policies.currency },
        { kind: "p", text: site.policies.deposit },
        {
          kind: "p",
          text: "What a price includes is whatever the itinerary we sent you lists, line by line. If something is not on that list it is not included, and we would rather you asked than assumed — Egypt trips go wrong far more often over a misunderstood inclusion than over anything dramatic.",
        },
        { kind: "p", text: "Children are priced as follows:" },
        {
          kind: "list",
          items: site.policies.children.map((band) => `${band.age} — ${band.price}`),
        },
        { kind: "p", text: site.policies.childrenNote },
      ],
    },
    {
      id: "cancellations-and-refunds",
      title: "Cancellations and refunds",
      href: "/cancellation-policy",
      hrefLabel: "Read the Cancellation Policy",
      blocks: [
        { kind: "p", text: cancellationSummary },
        {
          kind: "p",
          text: "Personalised items — an engraved cartouche, a papyrus painted from your photograph — are treated separately, because once the workshop has begun they cannot be sold to anybody else. That is set out in full in the Cancellation Policy, and it does not affect your right to a remake or a refund if an item arrives damaged, faulty or engraved with the wrong name.",
        },
      ],
    },
    {
      id: "changes-to-an-itinerary",
      title: "Changes to an itinerary",
      blocks: [
        {
          kind: "p",
          text: "Ask us to change something and we will tell you honestly what is possible and what it costs. Some things we can move freely; others are fixed once booked, such as a Nile cruise cabin or an internal flight.",
        },
        {
          kind: "p",
          text: "Sometimes we have to change a day ourselves. A site closes, a road is shut, the weather grounds a balloon, or security asks us to move. When that happens we tell you as soon as we know and arrange the nearest equivalent we can. We do not quietly substitute something lesser and hope it passes.",
        },
      ],
    },
    {
      id: "what-you-are-responsible-for",
      title: "What you are responsible for",
      blocks: [
        {
          kind: "p",
          text: "A few things only you can arrange, and a trip can be lost over any of them:",
        },
        {
          kind: "list",
          items: [
            "A passport valid for the period your own government and Egypt require. Check it early — a renewal takes longer than people expect.",
            "Any visa you need for Egypt, and for Jordan if your trip includes it. We can tell you what applies, but we cannot obtain it for you.",
            "Travel insurance. We strongly recommend it and will keep saying so. Egypt is a long way from home if something medical happens, and a deposit is not refundable because you fell ill.",
            "Telling us about anything health-related, or any mobility need, that affects what we should plan. Say it early and we will plan around it; say it on the day and some of it cannot be fixed.",
          ],
        },
      ],
    },
    {
      id: "suppliers",
      title: "Hotels, flights and other operators",
      blocks: [
        {
          kind: "p",
          text: "A trip involves businesses that are not us: hotels, airlines, Nile cruise operators, balloon companies, dive centres. We choose them with care, we arrange them for you, and we deal with them on your behalf when something goes wrong.",
        },
        {
          kind: "p",
          text: "They each have their own terms, and some of them — airlines and cruise operators especially — set conditions we cannot override, however much we would like to. Where that affects your trip we will tell you which supplier's rule is the one biting, rather than hiding behind a general disclaimer.",
        },
      ],
    },
    {
      id: "if-something-goes-wrong",
      title: "If something goes wrong",
      blocks: [
        {
          kind: "p",
          text: "Tell us while you are still in Egypt and still on the trip, if you possibly can. Almost everything is fixable on the day and almost nothing is fixable a month later. Message the WhatsApp number on your voucher; it reaches a person.",
        },
        {
          kind: "p",
          text: `If you would rather put it in writing, email ${site.contact.email}. We will reply, we will tell you what we think happened, and where we got something wrong we will say so.`,
        },
      ],
    },
    {
      id: "governing-law",
      title: "Governing law, and your rights",
      blocks: [
        {
          kind: "p",
          text: "The tour is operated in Egypt by an Egyptian licensed agency, and Egyptian law governs the arrangements for it.",
        },
        {
          kind: "p",
          text: "That does not take away rights you have at home. If you are a consumer in the European Union or the United Kingdom, the consumer protections where you live continue to apply, and nothing on this page reduces them. We have not written a clause limiting what we are responsible for, and we are not going to put one here without a lawyer having read it — a limitation drafted badly is void anyway, and we would rather be straightforward than look clever.",
        },
      ],
    },
    {
      id: "changes-to-these-terms",
      title: "Changes to these terms",
      blocks: [
        {
          kind: "p",
          text: `Last updated ${termsLastUpdated}. The terms that apply to your booking are the ones published when we confirmed it. If we change them we change this page, and the date above tells you which version you are reading.`,
        },
      ],
    },
  ];
}

/**
 * Every fixed string, flattened for the i18n extractor.
 *
 * Same reason as cancellationPolicyStrings and privacyPolicyStrings: a string
 * the extractor never walks is served in English to every reader, and on a
 * legal page that is a defect rather than a cosmetic gap.
 */
export const termsStrings: string[] = [
  termsIntro,
  ...termsSections().flatMap((s) => [
    s.title,
    ...(s.hrefLabel ? [s.hrefLabel] : []),
    ...s.blocks.flatMap((b) => (b.kind === "p" ? [b.text] : b.items)),
  ]),
];
