import type { Metadata } from "next";
import Link from "next/link";
import {
  fdAddOns,
  fdPackages,
  fdRentals,
  fdSettings,
  fdWardrobe,
} from "../_lib/content";
import { FaqList } from "../_components/FaqList";
import { fdBreadcrumbJsonLd, fdFaqJsonLd, fdJsonLd, fdMetadata, fdPath } from "../_lib/seo";

/**
 * Every question, grouped.
 *
 * Composed from the data layer wherever the answer is a fact that lives there
 * — prices, dress names, the number of gawns — so an answer cannot drift from
 * the page that states the same thing. The policy answers are written to be
 * true under either reading of the brochure's contradictory cancellation
 * terms, because that contradiction is unresolved: see `cancellation.ambiguity`
 * in content/flyingDresses.ts.
 *
 * Only ONE group is emitted as FAQPage structured data. Google's guidance is
 * that FAQ rich results want the page's genuine, visible questions, and an
 * eighty-item dump is both ineligible in practice and a worse experience if it
 * ever did render.
 */

export const metadata: Metadata = fdMetadata({
  title: "Questions",
  description:
    "What is included, how to choose a dress, makeup and hair, transport, photo delivery, extra dresses, men's attire, dress rental, payment methods and changes: the questions people actually ask before a flying-dress photoshoot in Egypt.",
  path: "/faq",
});

/**
 * THE QUESTIONS, BUILT FROM WHATEVER THE STUDIO CURRENTLY SAYS.
 *
 * These lists used to be module-scope constants, which read well and quietly
 * froze them: `priceList` was computed once at module load from the content
 * file, so an edited price in the Studio would have been correct everywhere on
 * the site EXCEPT in the answer to "What does a photoshoot cost?" — the one
 * place a visitor goes looking for it.
 *
 * Composed from the data for the same reason as before: an answer that states
 * a price, a dress count or a method of payment must not be able to drift from
 * the page that states the same thing. The difference is only that the data
 * now arrives as an argument rather than as an import.
 */
function buildGroups({
  packages,
  addOns,
  dresses,
  mensOutfits,
  payment,
  cancellation,
}: {
  packages: Awaited<ReturnType<typeof fdPackages>>;
  addOns: Awaited<ReturnType<typeof fdAddOns>>;
  dresses: Awaited<ReturnType<typeof fdWardrobe>>["dresses"];
  mensOutfits: Awaited<ReturnType<typeof fdWardrobe>>["mensOutfits"];
  payment: Awaited<ReturnType<typeof fdSettings>>["payment"];
  cancellation: Awaited<ReturnType<typeof fdSettings>>["cancellation"];
}) {
  const priceList = packages.map((p) => `${p.name} $${p.priceUsd}`).join(", ");

  const BOOKING: { question: string; answer: string }[] = [
    {
      question: "What does a photoshoot cost?",
      answer: `Per person: ${priceList}. The session, the dress, the transport, the assistant and the photographs are the same in all three. The difference is the landscape and how far you have to drive to it.`,
    },
    {
      question: "What is included in the price?",
      answer:
        "Door-to-door transport, one flying dress from the collection in the colour you choose, a professional photographer directing the session, an assistant whose job is the dress, a 30 to 45 minute shoot, and more than a hundred colour-graded photographs delivered within six to ten days.",
    },
    {
      question: "How do I book?",
      answer:
        "You do not book on this website. You enquire, and we confirm. Send the form or message us with your dates and we will tell you what is free, confirm the price, and arrange payment directly. Nothing on this site charges a card.",
    },
    {
      question: "Is a WhatsApp message a booking?",
      answer:
        "No. Messaging us starts a conversation, and nothing is held until we have confirmed a date with you in writing. We are explicit about this because the alternative is somebody arriving at a rooftop on a morning nobody agreed to.",
    },
    {
      question: "How many people can be in one shoot?",
      answer:
        "The price is per person, so tell us how many of you there are and we will confirm it for your date and location. For two people, one in a dress and one in a gawn is the usual arrangement.",
    },
  ];

  const DRESSES: { question: string; answer: string }[] = [
    {
      question: "Do I bring the dress?",
      answer: `No. One flying dress is included and it is yours for the session. There are ${dresses.length} in the collection: ${dresses.map((d) => d.name).join(", ")}. Tell us which one when you enquire.`,
    },
    {
      question: "Does my choice of dress change the price?",
      answer:
        "No. Every dress in the collection is included. A second dress in the same session is $99, and a dress made or customised for you to keep is $249.",
    },
    {
      question: "Can you guarantee the dress I choose?",
      answer:
        "We note your choice and have it ready for you, and in practice it is almost always the one you get. We will not promise it absolutely, because a dress can come back from a shoot needing cleaning, and if yours is unavailable we will tell you before your shoot rather than on the day.",
    },
    {
      question: "What sizes are the dresses?",
      answer:
        "Ask us. We have not published a size range because these are long, flowing garments that fit differently from ordinary clothes, and we would rather check the actual dress against what you tell us.",
    },
    {
      question: "Can I rent a dress without a photoshoot?",
      answer:
        "Yes. One dress from the collection, delivered to your hotel in Cairo or collected from us, with no photographer and no assistant. It is priced on request. Ask and we will send the price, the length of the window and the terms in writing.",
    },
    {
      question: "Do you have accessories?",
      answer:
        "Yes, alongside a shoot or a rental. We have not published the collection or its prices on this site, so ask and we will tell you what we have that works with the dress you are considering.",
    },
  ];

  const MENS: { question: string; answer: string }[] = [
    {
      question: "Do you have outfits for men?",
      answer: `Yes. ${mensOutfits.length} styles of traditional Egyptian gawn: ${mensOutfits.map((m) => m.name).join(", ")}. They can be worn in a photoshoot or hired on their own.`,
    },
    {
      question: "What is the difference between a Saeedy and a Bahary gawn?",
      answer:
        "They are named for the two regional dress traditions: Saeedy from Upper Egypt, Bahary from the north and the Delta. What distinguishes our particular garments within each pair is easier to show than describe, so ask and we will send photographs of the actual gawns.",
    },
    {
      question: "Are there photographs of the men's outfits?",
      answer:
        "Not on this site yet, which is why the pages name them rather than showing them. Ask us and we will send you pictures.",
    },
    {
      question: "What does men's attire cost?",
      answer:
        "Price on request, both as an addition to a photoshoot and as a standalone hire. Nothing about it is published here and we are not going to invent a figure.",
    },
  ];

  const ON_THE_DAY: { question: string; answer: string }[] = [
    {
      question: "Can I have makeup and hair done?",
      answer: `Yes. ${addOns
        .filter((a) => ["light-makeup", "full-makeup", "hairdresser"].includes(a.id))
        .map((a) => `${a.label} ${a.priceUsd === null ? "on request" : `${a.fromPrice ? "from " : ""}$${a.priceUsd}`}`)
        .join(", ")}. Worth considering for the dunes and Fayoum, where there is real wind.`,
    },
    {
      question: "How do I get there?",
      answer:
        "We collect you and bring you back. Door-to-door transport is included in all three photoshoot prices. Tell us your hotel or pickup area when you enquire.",
    },
    {
      question: "What should I bring?",
      answer:
        "Shoes you can walk in, and anything you want in the photographs. The dress is here. At the dunes and Fayoum the ground is uneven sand, so sandals you can get out of easily are better than anything you have to balance in.",
    },
    {
      question: "I have never modelled. Will I know what to do?",
      answer:
        "You do not need to. The photographer directs the whole session (where to stand, how to hold the dress, when to move) and the assistant handles the fabric, which is most of the work once the wind catches it.",
    },
    {
      question: "Can we shoot at sunset?",
      answer:
        "Not on the rooftop: it closes before the earliest sunset of the year. Afternoon sessions run and the light at the end of them is the best the afternoon has. For the other locations, ask about your date and we will tell you what is possible.",
    },
  ];

  const AFTER: { question: string; answer: string }[] = [
    {
      question: "How many photographs do I get, and when?",
      answer:
        "More than a hundred, colour-graded, delivered within six to ten days of the shoot. That is the full set from the session rather than a selection of six.",
    },
    {
      question: "Can I get video as well?",
      answer: `Two Instagram Reels cut from the session are $25. They are short vertical edits for Reels and TikTok, not a film of the whole shoot.`,
    },
    {
      question: "Can I keep a dress?",
      answer:
        "Yes. A dress made or customised for you to keep is $249. That is different from the dress included in a shoot, which is rented for the session.",
    },
  ];

  const PAYING: { question: string; answer: string }[] = [
    {
      question: "How do I pay?",
      answer: `${payment.methods.map((m) => m.label).join(", ")}. Visa and MasterCard can be taken on the day of the shoot on request. ${payment.note}`,
    },
    {
      question: "Will this website ever ask for my card details?",
      answer:
        "No. There is no checkout on this site and no form here collects card details. If anything claiming to be us asks you to type a card number into a web form, it is not us.",
    },
    {
      question: "What if I need to change or cancel?",
      answer: `${cancellation.summary} Talk to us as early as you can. In practice moving a date is far easier than cancelling one.`,
    },
    {
      question: "Are deposits refundable?",
      answer:
        "Deposits are non-refundable, but can usually be moved to another date or held as credit rather than lost. The exact terms come in writing when we hold your date.",
    },
  ];

  const GROUPS = [
    { id: "booking", title: "Booking and prices", faqs: BOOKING, structured: true },
    { id: "dresses", title: "The dresses, accessories and rental", faqs: DRESSES, structured: false },
    { id: "mens", title: "Men's attire", faqs: MENS, structured: false },
    { id: "day", title: "On the day", faqs: ON_THE_DAY, structured: false },
    { id: "after", title: "Afterwards", faqs: AFTER, structured: false },
    { id: "paying", title: "Paying, changing and cancelling", faqs: PAYING, structured: false },
  ];

  return GROUPS;
}

export default async function FaqPage() {
  const [settings, packages, addOns, rentalServices, wardrobe] = await Promise.all([
    fdSettings(),
    fdPackages(),
    fdAddOns(),
    fdRentals(),
    fdWardrobe(),
  ]);
  const { contact, payment, cancellation } = settings;
  const { dresses, mensOutfits } = wardrobe;
  const GROUPS = buildGroups({
    packages,
    addOns,
    dresses,
    mensOutfits,
    payment,
    cancellation,
  });
  const structured = GROUPS.find((g) => g.structured)?.faqs ?? [];

  return (
    <>
      <section className="fd-section-tight">
        <div className="fd-shell">
          <nav aria-label="Breadcrumb" className="fd-eyebrow fd-eyebrow-crumbs" style={{ marginBottom: "2rem" }}>
            <Link href={fdPath()} style={{ color: "inherit" }}>
              Home
            </Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">Questions</span>
          </nav>

          <div style={{ maxWidth: "46rem" }}>
            <h1 className="fd-display fd-h1">Questions</h1>
            <p className="fd-lead fd-muted" style={{ marginTop: "1.75rem" }}>
              Everything people ask before a shoot, and a few things they only ask afterwards. If
              what you want is not here, send it. We would rather answer one question than have you
              guess.
            </p>
          </div>

          {/* An in-page index. Real anchors, so it works with no JavaScript
              and the browser's own scroll-padding keeps the heading clear of
              the sticky header. */}
          <nav aria-label="On this page" style={{ marginTop: "2.5rem" }}>
            <ul className="fd-swatch-row" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {GROUPS.map((group) => (
                <li key={group.id}>
                  <a className="fd-swatch" href={`#${group.id}`} style={{ textDecoration: "none" }}>
                    {group.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      {GROUPS.map((group, index) => (
        <section
          key={group.id}
          id={group.id}
          className={index % 2 === 1 ? "fd-section-tight fd-sand" : "fd-section-tight"}
          aria-labelledby={`${group.id}-heading`}
        >
          <div className="fd-shell fd-shell-narrow">
            <h2 id={`${group.id}-heading`} className="fd-display fd-h3" style={{ marginBottom: "2rem" }}>
              {group.title}
            </h2>
            <FaqList faqs={group.faqs} />
          </div>
        </section>
      ))}

      <section className="fd-section fd-dark fd-on-dark">
        <div className="fd-shell fd-shell-narrow fd-center">
          <h2 className="fd-display fd-h3" style={{ marginBottom: "1.25rem" }}>
            Still wondering something?
          </h2>
          <p className="fd-muted" style={{ marginInline: "auto", maxWidth: "40ch" }}>
            Email {contact.email}, call either number, or send the form. One question is a perfectly
            good reason to get in touch.
          </p>
          <div className="fd-actions" style={{ justifyContent: "center", marginTop: "2.5rem" }}>
            <Link className="fd-btn" href={fdPath("/enquire")}>
              Ask us
            </Link>
            <Link className="fd-btn fd-btn-outline" href={fdPath("/rentals")}>
              See the hire services
            </Link>
          </div>
          <p className="fd-muted" style={{ fontSize: "var(--fd-step--1)", marginTop: "2rem" }}>
            {rentalServices.length} hire services · {packages.length} photoshoot locations ·{" "}
            {dresses.length} dresses
          </p>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: fdJsonLd([
            fdBreadcrumbJsonLd([
              { name: "Home", path: "" },
              { name: "Questions", path: "/faq" },
            ]),
            fdFaqJsonLd(structured),
          ]),
        }}
      />
    </>
  );
}
