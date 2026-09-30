import type { Faq, Tour } from "@/content/types";

// The buying questions a tour page has to answer, derived from the tour.
//
// Thirty-one tours were shipping with no FAQ at all — the highest-intent
// pages on the site, silent on the seven things every traveller asks before
// paying a deposit. The obvious fix is to write 31 × 7 answers by hand. That
// is also how a catalogue starts lying: the answers restate `included`,
// `excluded`, `physicalLevel`, `duration` and `price`, so the first time an
// inclusion changes, the prose disagrees with the list directly above it and
// nobody notices, because nothing checks a paragraph against a bullet.
//
// So each question is a rule over the tour's own fields, and a rule only
// fires when the data it needs is there. That makes the answers true by
// construction, keeps them in step with the page forever, and gives a new
// tour its FAQ on the day it ships.
//
// What is deliberately NOT here: deposits, payment, cancellation, children's
// pricing, visas. Those answers are identical on every tour, and publishing
// the same FAQPage entity 31 times is both a duplicate-content problem and a
// maintenance one — change the deposit and you would be editing 31 pages.
// They live once, on /faq, and each accordion links there.

/** Case-insensitive "does this list mention X" over an inclusion list. */
function mentions(list: readonly string[] | undefined, pattern: RegExp): string | undefined {
  return list?.find((item) => pattern.test(item));
}

/**
 * Joins a list the way a person would say it, because these strings land in
 * the middle of a sentence: "Tips, personal spending and your Egypt visa".
 */
function sentenceList(items: readonly string[]): string {
  const clean = items.map((i) => i.trim()).filter(Boolean);
  if (clean.length === 0) return "";
  if (clean.length === 1) return clean[0];
  return `${clean.slice(0, -1).join(", ")} and ${clean[clean.length - 1]}`;
}

/**
 * Lowercases an inclusion label so it can sit mid-sentence.
 *
 * Only labels that begin with one of these generic nouns are touched. The
 * tempting rule — "lowercase unless there's another capital later" — turns
 * "Egypt visa" into "egypt visa" and "Cairo hotels" into "cairo hotels",
 * because the proper noun is the FIRST word. An allowlist is duller and
 * cannot make that mistake.
 */
const LOWERCASABLE = new Set([
  "entrance", "admission", "hotel", "hotels", "private", "tips", "personal",
  "bottled", "lunch", "meals", "optional", "all", "professional", "local",
  "flights", "shopping", "extras", "water", "diving", "transport", "camel",
  "entry", "guide", "parking", "breakfast", "dinner", "accommodation",
]);

/** Sentence-cases a fragment that was built for mid-sentence use. */
function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function midSentence(label: string): string {
  const first = label.split(/[\s(]/)[0].toLowerCase();
  return LOWERCASABLE.has(first) ? label.charAt(0).toLowerCase() + label.slice(1) : label;
}

const PHYSICAL_LEAD: Record<string, string> = {
  easy: "Very little. This one is easy going",
  moderate: "A fair amount, but nothing strenuous",
  active: "Enough that you should be comfortable on your feet for most of the day",
  challenging: "A lot — this is the most demanding end of what we run",
};

/**
 * The FAQs shown on a tour page: anything hand-written for that tour first,
 * then the derived set, with duplicate questions dropped.
 */
export function faqsForTour(tour: Tour): Faq[] {
  const derived: Faq[] = [];
  const isMultiDay = tour.lengthDays > 1;

  // ---------------------------------------------------------------------
  // 1. Entrance fees. The single most-asked question about Egypt tours, and
  //    the one competitors most often answer with "excludes admission" in
  //    six-point grey. 23 of 31 tours include them, so the answer genuinely
  //    differs per tour and is worth stating plainly either way.
  // ---------------------------------------------------------------------
  const entranceIncluded = mentions(tour.included, /entrance|admission/i);
  const entranceExcluded = mentions(tour.excluded, /entrance|admission/i);
  if (entranceIncluded) {
    derived.push({
      question: "Are entrance fees included?",
      answer:
        `Yes — ${midSentence(entranceIncluded)} for the sites on this itinerary are in the price, so there is nothing to buy at the gate. ` +
        (tour.excluded.length > 0
          ? `What you would still pay for separately is ${sentenceList(tour.excluded.map(midSentence))}.`
          : ""),
    });
  } else if (entranceExcluded) {
    derived.push({
      question: "Are entrance fees included?",
      answer:
        `Not on this tour — ${midSentence(entranceExcluded)} are paid at the gate, and your guide will tell you the current price before you go so there are no surprises. ` +
        `Ticket prices are set by the Ministry of Tourism and Antiquities and change from time to time, which is exactly why we do not quote them as a fixed figure.`,
    });
  }

  // ---------------------------------------------------------------------
  // 2. Pickup. "Where do we meet?" is a booking blocker, not a detail.
  // ---------------------------------------------------------------------
  const pickup = mentions(tour.included, /pick[- ]?up|pickup and return|hotel pickup/i);
  if (pickup) {
    derived.push({
      question: "Do you pick me up from my hotel?",
      answer:
        `Yes. ${pickup} is included — we collect you from your hotel or Cairo address and bring you back at the end, so you are not arranging taxis around the day. ` +
        `Tell us where you are staying when you book; if you have not chosen a hotel yet, you can send it on later.`,
    });
  }

  // ---------------------------------------------------------------------
  // 3. Private vs. shared. True of the whole catalogue, but it is a question
  //    about this tour, and travellers ask it on the page they are buying
  //    from rather than on a policy page.
  // ---------------------------------------------------------------------
  const vehicle = mentions(tour.included, /vehicle|transport|transfers/i);
  const guide = mentions(tour.included, /guide|egyptologist|tour manager/i);
  if (vehicle || guide) {
    const parts = [vehicle && midSentence(vehicle), guide && midSentence(guide)].filter(Boolean);
    derived.push({
      question: "Is this a private tour, or will I be with other people?",
      answer:
        `Private. It runs for your group alone — ${sentenceList(parts as string[])} — so the pace is yours and nobody waits on a coach filling up. ` +
        `We do not merge bookings into larger groups.`,
      link: { label: "Prefer to join a small group? See Weekly Trips", href: "/weekly-trips" },
    });
  }

  // ---------------------------------------------------------------------
  // 4. How demanding it is. Almost nobody answers this honestly, and it is
  //    the question that decides whether a parent or an older traveller
  //    books. The note is already written per tour — surface it.
  // ---------------------------------------------------------------------
  if (tour.physicalLevel) {
    const lead = PHYSICAL_LEAD[tour.physicalLevel.tier] ?? PHYSICAL_LEAD.moderate;
    derived.push({
      question: "How much walking is there, and how demanding is it?",
      answer:
        `${lead}. ${tour.physicalLevel.note} ` +
        `If someone in your group has limited mobility, tell us before you book — we can usually adjust the route or the pace rather than have you find out on the day.`,
    });
  }

  // ---------------------------------------------------------------------
  // 5. Shape of the day. `duration` is authored per tour and is the honest
  //    answer to "how long will this actually take".
  // ---------------------------------------------------------------------
  derived.push({
    question: isMultiDay ? "How is the itinerary paced across the days?" : "How long does the day take?",
    answer: isMultiDay
      ? `It runs ${tour.duration} across ${tour.cities === 1 ? "a single base" : `${tour.cities} bases`}${
          tour.destinations.length > 0 ? ` — ${sentenceList(tour.destinations)}` : ""
        }. The day-by-day breakdown is on this page, and start times flex around your flights and how early you like to begin.`
      : `${tour.duration}, door to door from your hotel. Start times are flexible — going early is the single best thing you can do for both the light and the crowds, but if you would rather not, we will build the day around the time you want to leave.`,
  });

  // ---------------------------------------------------------------------
  // 6. What to budget on top. The trust question: a tour that names its
  //    exclusions plainly is the one people believe.
  // ---------------------------------------------------------------------
  if (tour.excluded.length > 0 && !entranceIncluded) {
    // When entrance fees are included, question 1 already listed the
    // exclusions and repeating them here would be filler.
    derived.push({
      question: "What should I budget for on top of the price?",
      answer:
        `${capitalise(sentenceList(tour.excluded.map(midSentence)))} sit outside the price. ` +
        `Tipping is customary in Egypt but entirely yours to judge, and nothing on the day is compulsory — you will not be taken to a shop you did not ask for.`,
    });
  }

  // ---------------------------------------------------------------------
  // 7. Making it yours. The conversion question, and the natural bridge into
  //    the rest of the catalogue.
  // ---------------------------------------------------------------------
  const addOns = tour.relatedExperiences ?? [];
  if (addOns.length > 0) {
    derived.push({
      question: "Can I add anything to this tour, or change it?",
      answer:
        `Yes. Travellers on this itinerary most often add ${sentenceList(addOns.map((e) => e.title))}, and any of them can be built into the day rather than booked separately. ` +
        `You can also swap a site, change the pace, or start from a blank page if none of this is quite right.`,
      link: { label: "Customize this tour", href: "/customize" },
    });
  } else {
    derived.push({
      question: "Can I change this itinerary?",
      answer:
        `Yes — every tour here is a starting point rather than a fixed package. Swap a site, add an experience or a photoshoot, change the pace, or extend it by a day and we will rebuild the schedule around you.`,
      link: { label: "Customize this tour", href: "/customize" },
    });
  }

  // Hand-written first: a tour that needed a specific answer should lead with
  // it. Dropping derived duplicates by question means an override genuinely
  // replaces the derived one rather than sitting awkwardly beside it.
  const authored = tour.faqs ?? [];
  const taken = new Set(authored.map((f) => f.question.trim().toLowerCase()));
  return [...authored, ...derived.filter((f) => !taken.has(f.question.trim().toLowerCase()))];
}
