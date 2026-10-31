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

/**
 * Who the customer is actually dealing with, filled in Sanity Studio.
 *
 * Egypt Eye Travel is a brand and a small team. It does not hold a tourism
 * licence of its own: it works as a department under a larger licensed
 * agency, and that agency is the operator of record for the tours sold here.
 *
 * That arrangement is ordinary in Egyptian tourism and perfectly legitimate.
 * What is NOT safe is a website that stays silent about it, because then the
 * customer is left to assume the brand they paid is the licensed operator —
 * and a tour operator's licence is exactly the thing a traveller, a card
 * provider or an authority asks about when something has gone wrong.
 *
 * So these fields name the licensed operator. They are deliberately NOT
 * "our registration number": an earlier version of this type asked for one,
 * which was the wrong question and the kind of prompt that gets a number
 * invented to fill a gap. Nothing here is ever guessed — a blank field is
 * left out of the page and reported on /admin instead.
 */
export type LegalIdentity = {
  /** The licensed agency the tours are arranged and operated through. */
  operatorName?: string;
  /** Its tourism licence number, as issued to that agency — never ours. */
  operatorLicence?: string;
  /** Its registered address, one line. */
  operatorAddress?: string;
  /** Our own registered trading entity, if and when one exists. */
  entityName?: string;
};

export type PolicySection = {
  title: string;
  /** Plain paragraphs. */
  body: string[];
  /** Bullets, each a label and the fact about it. */
  items?: { label: string; text: string }[];
};

/**
 * How long a photograph sent for a papyrus commission is kept.
 *
 * Time-based, not "once the item is handed over", because nothing in this
 * system knows when that happened: a treasure request creates no database
 * row at all. It is emailed to the team with a signed link, and the photo
 * sits in a private bucket afterwards with nothing to mark it finished.
 *
 * An earlier draft of this policy promised deletion "once the finished item
 * is handed over to you", which would have been a promise no code could keep
 * — the exact defect this file exists to prevent, written into the file
 * itself. 90 days is generous against the 30-day signed link the team works
 * from, and short enough that we are not holding somebody's family
 * photograph, often of their children, indefinitely for no reason.
 */
export const COMMISSION_PHOTO_DAYS = 90;

/**
 * The moment before which a commission photograph is due for deletion.
 *
 * Here rather than beside the sweep that uses it, because the sweep imports
 * `server-only` — it talks to Supabase storage — and a `server-only` module
 * cannot be imported by the check scripts at all. Splitting the arithmetic
 * out is the pattern CLAUDE.md asks for, and the reason paypalBody.ts,
 * breakdown.ts and clientIp.ts exist. Putting it in the sweep first is how
 * this was written, and the check died on the import.
 */
export function photoCutoff(now: Date, days = COMMISSION_PHOTO_DAYS): Date {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

/** The day the wording below last changed. Shown to the reader. */
export const POLICY_UPDATED = "31 October 2026";

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
      'Runs the "Ask Egypt Eye" assistant, which opens once you have a confirmed booking. It is sent your first name and your itinerary so it can answer questions about your own trip. Separately, we read our own Google reviews from Google so we can show them on this site; that direction sends Google nothing about you.',
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
    label: "Photographs you send us for a commission",
    text: `A photograph sent for a papyrus commission is stored privately — never at a public web address — and deleted automatically ${COMMISSION_PHOTO_DAYS} days after you send it. The link our team uses to look at it stops working after 30.`,
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
  // Said plainly, and only where it is true. No sentence here claims a
  // licence, a registration or an address that has not been entered.
  const operator = legal.operatorName
    ? `Your tour is arranged and operated by ${legal.operatorName}${
        legal.operatorLicence ? `, which holds tourism licence ${legal.operatorLicence}` : ""
      }. Egypt Eye Travel is the team you deal with: we plan the trip, answer your messages and look after the information described on this page.`
    : "Egypt Eye Travel is a small specialist team. We plan your trip and are the people you deal with directly; the tours themselves are arranged and operated through the licensed Egyptian agency we work under.";

  const identity = [
    legal.entityName
      ? `We trade as Egypt Eye Travel. The business responsible for your information is ${legal.entityName}.`
      : "Egypt Eye Travel operates this website and is responsible for the personal information described on this page.",
    operator,
    legal.operatorAddress ? `The operator's registered address is ${legal.operatorAddress}.` : "",
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
          text: "Your name, email address and phone number, and the name you want engraved. We use it to make the item and to arrange handing it to you. The cartouche customiser takes no photograph — the signs come from the name you type.",
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
          label: "If you ask us for a papyrus or another commission",
          text: "What the form asks for, and the photograph if the piece is painted from one. The photograph goes to a private store that has no public address, and only our team can open it, through a link that expires. It is the one thing we take that is often a picture of somebody else — usually a family, often children — so it is handled accordingly and deleted on a timer.",
        },
        {
          label: 'If you use the "Ask Egypt Eye" assistant',
          text: "This opens only once you have a confirmed booking. To answer questions about your own trip it is sent your first name, your booking reference, your dates, how many people are travelling, your hotels and your itinerary, along with what you type. The assistant is run by Google. Your questions and its answers are saved so our staff can follow up on anything it could not settle, and so we can see when it gets something wrong.",
        },
        {
          label: "If you write a review on our review page",
          text: "Nothing you type there is sent to us. It is kept in your own browser only, so it survives you switching to Google and back, and it is gone when you close the browser. Your review is published on Google, under your own Google account, and Google decides what appears — we cannot edit or remove it.",
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
  if (!legal.operatorName?.trim()) missing.push("Name of the licensed agency we operate under");
  if (!legal.operatorLicence?.trim()) missing.push("That agency's tourism licence number");
  if (!legal.operatorAddress?.trim()) missing.push("That agency's registered address");
  return missing;
}

/**
 * Every string on the policy page, flattened for the i18n extractor.
 *
 * scripts/i18n-extract.mts walks a fixed list of modules. A string it never
 * sees is never sent for translation, and renders in English — which is how
 * the first version of this file shipped a privacy policy that the French
 * and Spanish sites would have served in English to the very readers whose
 * law the page exists to satisfy. Same reason cancellationPolicy.ts exports
 * cancellationPolicyStrings, and the reason check-privacy asserts the two
 * stay in step.
 *
 * The placeholder arguments are deliberate: the extractor wants the FIXED
 * prose, and the sentences that interpolate a contact address or an operator
 * name are assembled per-request anyway.
 */
export const privacyPolicyStrings: string[] = policySections(
  { email: "", whatsapp: "" },
).flatMap((section) => [
  section.title,
  ...section.body,
  ...(section.items ?? []).flatMap((item) => [item.label, item.text]),
]);

/**
 * Wording that must never appear on the page again.
 *
 * These are fragments of the placeholder version that was live. The check
 * script searches the rendered policy for them, so the draft cannot come
 * back by a revert or a bad merge without failing the build.
 */
export const BANNED_PLACEHOLDER_PHRASES = [
  "Draft structure",
  // From the Terms page, which had its own set. The list above was built
  // from the privacy page alone, so restoring the Terms placeholder passed
  // every assertion — the same gap, one page over.
  //
  // Narrow on purpose. A first attempt banned the bare phrase "do not
  // publish", which the privacy policy legitimately contains: "we do not
  // publish it anywhere without asking you first", in the section about
  // photographs of other people. A blocklist that fails on correct text gets
  // the correct text changed to suit it.
  "needs a lawyer",
  "do not publish liability",
  "without legal review",
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

/**
 * Does a sentence read like an instruction to whoever will write the page,
 * rather than text for the reader?
 *
 * The phrase list above is a blocklist, and a blocklist only ever covers the
 * mistakes already made: the Terms page shipped its own placeholders ("State
 * how a booking becomes confirmed", "Explain who can request a change") and
 * passed every assertion, because the list had been written from the privacy
 * page. This catches the shape instead of the wording, so a placeholder
 * nobody has seen before still fails.
 *
 * The verbs are the ones a drafting note uses. Sentences that legitimately
 * open with an imperative address the CUSTOMER — "Tell us while you are
 * still in Egypt", "Check it early", "Ask us and we will tell you" — and
 * none of them begin with these.
 */
export function readsLikeAnInstructionToTheAuthor(line: string): boolean {
  return /^(State|Explain|Confirm|Describe|List|Disclose|Cover|Reuse|Replace|Add) /.test(line.trim());
}
