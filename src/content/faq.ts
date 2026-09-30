import { allHubFaqs } from "./faqHub";
import type { Faq } from "./types";

// The homepage teaser: six of the hub's answers, not six copies of them.
//
// These used to be written out here in full, which meant the homepage and
// /faq drifted the moment either was edited — by the time this was noticed
// they disagreed on the wording of two questions. Selecting by question text
// makes the subset structural: the homepage cannot answer something /faq
// does not, and an edit to an answer lands in both places at once.
//
// The homepage deliberately emits no FAQPage markup from these (see the
// comment beside the block on the homepage): /faq is the canonical entity.
const TEASER_QUESTIONS = [
  "How far in advance should I book?",
  "What's actually included in the price?",
  "Can I customize a tour, or combine experiences?",
  "How does the deposit work?",
  "Is it just my group, or will I be grouped with strangers?",
  "What if my plans change or I need to cancel?",
];

export const faqs: Faq[] = TEASER_QUESTIONS.map((question) => {
  const found = allHubFaqs.find((f) => f.question === question);
  if (!found) {
    // A build-time throw rather than a silent gap: a teaser that quietly
    // renders five items because someone reworded a hub question is exactly
    // the kind of thing nobody sees on a homepage they have stopped reading.
    throw new Error(`faq.ts: no hub answer for teaser question "${question}"`);
  }
  return found;
});
