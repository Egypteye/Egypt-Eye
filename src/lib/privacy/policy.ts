// The privacy policy, as data.
//
// It lived in the page as JSX until now, and what it actually said was a list
// of instructions to whoever would one day write it — "List every field
// collected from the Customize Your Tour form", rendered in italics under a
// banner reading "Draft structure — not yet published". That page was live,
// indexable on purpose, and linked from the footer of a site taking card
// payments. A customer who went looking for what we do with their data found
// a to-do list.
//
// So: here, as data, pure and free of `server-only`, because "the policy
// names every processor and states a retention period" is exactly the kind of
// claim that has to be provable by a check script rather than by reading it.
//
// EVERY SENTENCE BELOW IS A STATEMENT OF FACT ABOUT THIS CODEBASE. If you
// change what the site collects, who processes it, or how long it is kept,
// this file is part of that change. scripts/check-privacy.mts fails if a
// processor named here stops being used, or starts being used without being
// named.

/** The legal identity of the business, filled in Sanity Studio. */
export type LegalIdentity = {
  entityName?: string;
  registrationNumber?: string;
  registeredAddress?: string;
};

export type PolicySection = {
  title: string;
  /** Plain paragraphs. */
  body: string[];
  /** Bullets, each a label and the fact about it. */
  items?: { label: string; text: string }[];
};

/** The day the wording below last changed. Shown to the reader. */
export const POLICY_UPDATED = "15 October 2026";

/**
 * Every third party that receives customer personal data, and what for.
 *
 * Named here and nowhere else. The check script cross-references this list
 * against the dependencies and environment variables the app actually uses,
 * so a processor cannot be added to the stack without appearing on this page.
 */
export const PROCESSORS = [
  {
    name: "Supabase",
    role: "Stores the database and any files you upload.",
    where: "European Union (Paris)",
  },
  { name: "Resend", role: "Delivers our emails.", where: "Outside the EU" },
  {
    name: "Google",
    role:
      'Runs the "Ask Egypt Eye" assistant, which opens once you have a confirmed booking. It is sent your first name and your itinerary so it can answer questions about your own trip.',
    where: "Outside the EU",
  },
  { name: "PayPal", role: "Takes card and PayPal payments.", where: "Outside the EU" },
  { name: "Vercel", role: "Hosts and serves this website.", where: "Outside the EU" },
] as const;

/** How long each kind of record is kept. Must match what the code does. */
export const RETENTION = [
  {
    label: "Enquiries and bookings",
    text:
      "Your name, phone number and email address are removed 12 months after your last contact with us, or after your travel date, whichever is later. An anonymous record of the booking and the payment is kept for accounting.",
  },
  {
    label: "Newsletter sign-ups you never confirmed",
    text: "Deleted after 30 days. Until then the address is never emailed anything but the one confirmation request.",
  },
  {
    label: "If you unsubscribe",
    text: "Your address is marked unsubscribed immediately and never emailed again. We keep the address on a do-not-contact list so a later sign-up cannot add you back by mistake, and your first name is removed. That is the one case where keeping something is the privacy-respecting choice.",
  },
  {
    label: "Photographs you send us",
    text:
      "A reference photo for an engraved cartouche or a papyrus commission is deleted once the finished item is handed over to you.",
  },
  {
    label: "Payment confirmations from PayPal",
    text:
      "These never contain your name, email address or postal address — they are removed before the record is written, not deleted later.",
  },
  {
    label: "IP addresses",
    text: "Kept for one day, then deleted automatically. They are used only to limit how often a form can be submitted.",
  },
] as const;

/**
 * The policy, section by section.
 *
 * `legal` fills the registered-details sentence when the owner has entered it
 * in Sanity Studio. Where it is blank the sentence is left out rather than
 * printed as a placeholder: an incomplete policy is better than one that
 * tells the reader we have not finished writing it. What is missing is
 * reported on /admin instead, where the owner will see it.
 */
export function policySections(
  contact: { email: string; whatsapp?: string },
  legal: LegalIdentity = {},
): PolicySection[] {
  const identity = [
    legal.entityName
      ? `We trade as Egypt Eye Travel. The business responsible for your information is ${legal.entityName}.`
      : "Egypt Eye Travel operates this website and is responsible for the personal information described on this page.",
    legal.registrationNumber ? `Commercial registration number: ${legal.registrationNumber}.` : "",
    legal.registeredAddress ? `Registered address: ${legal.registeredAddress}.` : "",
  ].filter(Boolean);

  const reach = contact.whatsapp
    ? `You can reach us at ${contact.email} or on WhatsApp at ${contact.whatsapp}.`
    : `You can reach us at ${contact.email}.`;

  return [
    {
      title: "Who we are",
      body: [...identity, reach, "We are a tour operator based in Egypt. We arrange tours, experiences, photoshoots and handmade items for travellers, most of whom contact us from outside Egypt."],
    },
    {
      title: "What we collect, and why",
      body: ["We ask for as little as the job needs. Nothing on this list is optional for us to collect and then used for something else."],
      items: [
        {
          label: "When you ask us for a tour or send a message",
          text: "Your name, your phone number, your email address if you give one, your travel dates, how many people are travelling, and whatever you write in the message. We use it to put a price together and to reply to you by WhatsApp or email. Without it we cannot answer you.",
        },
        {
          label: "When you book and pay a deposit",
          text: "The above, plus what you booked and what you paid. We need this to carry out the booking you asked for and to keep proper accounts.",
        },
        {
          label: "When you order something from the boutique",
          text: "Your name, email address and phone number, the name you want engraved, and a reference photograph if you send one. We use it to make the item and to arrange handing it to you.",
        },
        {
          label: "If you create an account",
          text: "Your email address, your name, your phone number, and a profile picture if you upload one.",
        },
        {
          label: "If you join the newsletter",
          text: "Your email address, your first name if you give one, and the time you confirmed. We only add you after you click a link in a confirmation email, and every newsletter carries an unsubscribe link. You can withdraw at any time. If you do, we keep the address itself on a do-not-contact list — so that a later sign-up form cannot add you back by mistake — and remove your name.",
        },
        {
          label: "If you apply to work with us",
          text: "Your company, your name, your email address, your phone number and your message, from the partner and travel-agent forms.",
        },
        {
          label: 'If you use the "Ask Egypt Eye" assistant',
          text: "This opens only once you have a confirmed booking. To answer questions about your own trip it is sent your first name, your booking reference, your dates, how many people are travelling, your hotels and your itinerary, along with what you type. The assistant is run by Google. Your questions and its answers are saved so our staff can follow up on anything it could not settle, and so we can see when it gets something wrong.",
        },
        {
          label: "To keep the site standing up",
          text: "Your IP address, briefly, so that nobody can submit a form thousands of times. It is deleted after one day. We do not use it to identify or track you.",
        },
      ],
    },
    {
      title: "Card payments",
      body: [
        "Payments are handled by PayPal. We never see, receive or store your card number.",
        "When a payment succeeds PayPal sends us a confirmation. The payer's name, email address and postal address are stripped out of it before anything is written down, so what we keep is the order reference, the amount, the currency and whether it succeeded. Nothing more.",
        "That means if you ask us who paid for a booking, we have to log in to PayPal and look, the same as you would. We consider that the right way round: your payment details stay with PayPal, under PayPal's own privacy policy, and we hold no copy of them to lose.",
      ],
    },
    {
      title: "Who else handles your information",
      body: [
        "These companies process information on our instructions, to do a specific job for us. They are not allowed to use it for anything else.",
      ],
      items: PROCESSORS.map((p) => ({ label: p.name, text: `${p.role} ${p.where}.` })),
    },
    {
      title: "What we do not do",
      body: [
        "We do not sell your personal information, and we never have.",
        "We do not share it with advertisers, data brokers or anyone else for marketing.",
        "There is no advertising network, no analytics service and no tracking pixel on this website.",
        "We do not build a profile of you, and nothing about your booking is decided automatically.",
      ],
    },
    {
      title: "Where it is kept, and for how long",
      body: [
        "The database and any files you upload are held in the European Union, in Paris. Our email and payment providers are outside the EU and process information under their own terms.",
        "We keep things for as long as the job needs and then remove them:",
      ],
      items: RETENTION.map((r) => ({ label: r.label, text: r.text })),
    },
    {
      title: "Cookies",
      body: [
        "This website sets one kind of cookie: the one that keeps you signed in, and only if you create an account. That is it.",
        "There are no analytics cookies, no advertising cookies and no third-party trackers, which is why you have not been asked to accept any. If we ever add something that needs your consent, we will ask for it, and this page will say so before it happens.",
      ],
    },
    {
      title: "Photographs of other people",
      body: [
        "Some of what we make involves a photograph — a papyrus commission, a reference picture for an engraving, a photoshoot. Often it is a photograph of somebody other than the person sending it, including children.",
        "If you send us a photograph of another person, please only do so if you are entitled to. We use it for the item or the shoot you asked for, we do not publish it anywhere without asking you first, and we delete it once the work is handed over.",
      ],
    },
    {
      title: "Your rights",
      body: [
        "You can ask us for a copy of what we hold about you, ask us to correct it, ask us to delete it, ask us to stop using it, or object to a particular use. If you gave consent — for the newsletter — you can withdraw it at any time without giving a reason.",
        `Email ${contact.email} and we will deal with it within 30 days. We will not charge you and we will not ask why.`,
        "If you are in the European Union or the United Kingdom, you can also complain to the data protection authority where you live. If you are in Egypt, you can complain to the Personal Data Protection Centre.",
      ],
    },
    {
      title: "Changes to this page",
      body: [
        `Last updated ${POLICY_UPDATED}.`,
        "If what we collect or who handles it changes, we change this page at the same time, not afterwards. There is a check in our build that fails if the two stop matching.",
      ],
    },
  ];
}

/**
 * What the owner still has to supply, for the /admin notice.
 *
 * A console warning would not reach him — he works from a browser, Sanity
 * Studio and the Vercel dashboard. See CLAUDE.md.
 */
export function missingLegalIdentity(legal: LegalIdentity = {}): string[] {
  const missing: string[] = [];
  if (!legal.entityName?.trim()) missing.push("Registered business name");
  if (!legal.registrationNumber?.trim()) missing.push("Commercial registration number");
  if (!legal.registeredAddress?.trim()) missing.push("Registered address");
  return missing;
}

/**
 * Wording that must never appear on the page again.
 *
 * These are fragments of the placeholder version that was live. The check
 * script searches the rendered policy for them, so the draft cannot come
 * back by a revert or a bad merge without failing the build.
 */
export const BANNED_PLACEHOLDER_PHRASES = [
  "Draft structure",
  "not yet published",
  "List every field",
  "Describe the actual use",
  "Name the actual systems",
  "List any service actually used",
  "Disclose any analytics",
  "Explain how a visitor",
  "Confirm the email address visitors",
  "replace it with reviewed, accurate text",
  "placeholder",
  "TODO",
  "Lorem ipsum",
] as const;
