import type { Faq } from "./types";

// The canonical answers to the questions whose answer is the same everywhere.
//
// Product pages answer product questions: this tour's inclusions, this trip's
// toilets, this photoshoot's dress. Those belong beside the thing being
// bought. But "how does the deposit work" has one answer for the whole
// company, and the wrong way to publish it is on every product page — 31
// tours, 6 photoshoots and 6 trips each carrying the same paragraph is 43
// pages to edit when the deposit changes, and 43 FAQPage entities competing
// to answer one query.
//
// So the split is: if the answer varies by product, it lives on the product.
// If it doesn't, it lives here once, and product accordions link to it.
//
// Every answer below restates a fact from content/site.ts, the cancellation
// policy, or the catalogue. Nothing here may introduce a policy that is not
// already published somewhere else — this page is a shop window onto the
// terms, not a second set of them.

export type FaqGroup = {
  id: string;
  title: string;
  /** One line under the heading, saying who this group is for. */
  intro: string;
  faqs: Faq[];
};

export const faqGroups: FaqGroup[] = [
  {
    id: "booking",
    title: "Booking and payment",
    intro: "How a reservation is made, what it costs to hold, and how you pay the rest.",
    faqs: [
      {
        question: "How far in advance should I book?",
        answer:
          "For custom or multi-day itineraries, 2–4 weeks ahead gives us room to build the right plan around your dates. One-day tours and photoshoots can often be arranged with just a few days' notice — message us on WhatsApp and we'll tell you what's possible for the dates you have.",
        link: { label: "Start with a custom itinerary", href: "/customize" },
      },
      {
        question: "How does the deposit work?",
        answer:
          "A 25% down payment secures your reservation and is non-refundable. The remaining balance can be paid in cash or via PayPal at the end of the day or tour — so you settle the larger part after you have travelled, not before.",
      },
      {
        question: "Which currencies can I pay in?",
        answer:
          "You may pay in USD, Euro, or British Pound. Once your tour is confirmed, the rate we quote you is guaranteed not to change, whatever the exchange rate does between booking and arrival.",
      },
      {
        question: "Do children pay full price?",
        answer:
          "Children aged 1–4 travel free. Ages 5–8 are charged 25% of the tour price, and from 8 years upward it is the full adult price. If airfare is involved, an additional child airfare charge may apply.",
      },
      {
        question: "What do I get once I've booked?",
        answer:
          "After confirmation, we email you a final confirmation and voucher containing your tour information, operator contact numbers, customer-care information, and other useful details. That voucher is what your guide or driver will reference on the day.",
      },
      {
        question: "What if my plans change or I need to cancel?",
        answer:
          "Deposits and payments are non-refundable, because we commit costs to guides, drivers, hotels and permits as soon as a booking is confirmed. If you cancel, we may be able to hold the recoverable value as travel credit or move it to another date, at our discretion and subject to what our suppliers release. For force majeure we charge no cancellation fee of our own, though supplier terms still apply.",
        link: { label: "Read the full cancellation policy", href: "/cancellation-policy" },
      },
    ],
  },
  {
    id: "how-we-run",
    title: "How our tours run",
    intro: "What a day with us actually looks like, and what is standard across everything we sell.",
    faqs: [
      {
        question: "Is it just my group, or will I be grouped with strangers?",
        answer:
          "All of our tours are private. You'll have your own vehicle, guide, and pace — we don't merge bookings into larger group tours. If you would rather travel with others and share the cost, our Weekly Trips are small scheduled departures you buy a seat on instead.",
        link: { label: "See Weekly Trips", href: "/weekly-trips" },
      },
      {
        question: "What's actually included in the price?",
        answer:
          "Every tour lists exactly what's included and excluded on its own page — typically private transportation, an English-speaking guide, entrance fees, and lunch. Tips, flights, hotels, and your Egypt visa are generally not included unless stated. The tour page is always the authority for that specific itinerary.",
        link: { label: "Browse tours", href: "/tours" },
      },
      {
        question: "Can I customize a tour, or combine experiences?",
        answer:
          "Yes. Any tour, extra experience, or photoshoot in our catalog can be combined into a single private itinerary. Tell us what you'd like and we'll build the schedule around you rather than fitting you into a fixed package.",
        link: { label: "Customize your tour", href: "/customize" },
      },
      {
        question: "Do you arrange airport pickup separately from a tour?",
        answer:
          "Yes. Airport and hotel transfers are a service in their own right, priced by zone and vehicle tier, and you can book one without booking a tour. Drivers track your flight, so a delayed arrival does not cost you the transfer.",
        link: { label: "See transfer options and prices", href: "/transfers" },
      },
      {
        question: "Is tipping expected, and how much?",
        answer:
          "Tipping is customary in Egypt and it is genuinely yours to judge — nothing on our side depends on it, and no part of a day with us is contingent on a tip. It is not included in any price we quote, so if you want to budget for it, plan it as a separate line.",
      },
    ],
  },
  {
    id: "by-experience",
    title: "Questions about a specific experience",
    intro:
      "Photoshoots, transfers, desert camps and scheduled trips each raise their own questions — they are answered on the page for that experience, where they can be specific.",
    faqs: [
      {
        question: "Where are the photoshoot questions answered?",
        answer:
          "On the photoshoots pages. Each package answers what it costs, where it shoots, how long the session runs, how many edited images you receive and when, whether a dress or a horse is included, and what happens if the weather turns — the answers differ enough between packages that a single page-level answer would be wrong for most of them.",
        link: { label: "See photoshoot packages", href: "/photoshoots" },
      },
      {
        question: "Where are the airport transfer questions answered?",
        answer:
          "On the transfers page, alongside the zone pricing. It covers what happens when a flight is delayed, why some routes show a quote request rather than a price, round trips, and the difference between a hotel transfer and hiring a private driver for the day.",
        link: { label: "See transfers", href: "/transfers" },
      },
      {
        question: "Where are the Weekly Trip questions answered?",
        answer:
          "On each trip's own page. A White Desert overnight and an Alexandria day trip raise almost nothing in common — one is about night temperatures and toilets, the other about whether a single day is enough — so each departure answers its own.",
        link: { label: "See Weekly Trips", href: "/weekly-trips" },
      },
    ],
  },
];

/** Every hub question, flattened — for structured data and duplicate checks. */
export const allHubFaqs: Faq[] = faqGroups.flatMap((g) => g.faqs);
