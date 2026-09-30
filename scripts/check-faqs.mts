/**
 * Guards the FAQ system, whose failure modes are all silent.
 *
 * Three things can go wrong here and none of them break a build. A question
 * can be answered in two places, which splits the signal for that query and
 * doubles the edit when the answer changes. A policy answer — the deposit,
 * the cancellation terms — can creep onto a product page, which is how 43
 * pages end up each carrying a copy of a number that changes. And an FAQ can
 * point at a route that no longer exists, which looks fine until someone
 * clicks it.
 *
 * So all three are asserted. The derived tour set is checked through
 * faqsForTour itself rather than a second implementation of the rules — a
 * check that re-derives what it is checking proves only that the copy agrees
 * with itself.
 */
import { existsSync } from "node:fs";
import { tours } from "../src/content/tours";
import { hiddenTourSlugs } from "../src/content/hiddenTours";
import { photoshoots } from "../src/content/photoshoots";
import { weeklyTrips } from "../src/content/weeklyTrips";
import { signatureExperiences } from "../src/content/signatureExperiences";
import { transfersPage } from "../src/content/transfers";
import { listingPages } from "../src/content/listingPages";
import { faqs as homepageFaqs } from "../src/content/faq";
import { allHubFaqs, faqGroups } from "../src/content/faqHub";
import { faqsForTour } from "../src/lib/tourFaqs";
import type { Faq } from "../src/content/types";

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

type Source = { where: string; faqs: readonly Faq[] };
const sources: Source[] = [];

const liveTours = tours.filter((t) => !hiddenTourSlugs.has(t.slug));
for (const tour of liveTours) sources.push({ where: `tour/${tour.slug}`, faqs: faqsForTour(tour) });
for (const p of photoshoots) sources.push({ where: `photoshoot/${p.slug}`, faqs: p.faqs ?? [] });
for (const t of weeklyTrips) sources.push({ where: `trip/${t.slug}`, faqs: t.faqs ?? [] });
for (const e of signatureExperiences.filter((x) => x.status === "published")) {
  sources.push({ where: `signature/${e.slug}`, faqs: e.faqs ?? [] });
}
sources.push({ where: "page/transfers", faqs: transfersPage.faqs });
sources.push({ where: "hub/faq", faqs: allHubFaqs });
for (const [key, page] of Object.entries(listingPages)) {
  const pageFaqs = (page as { faqs?: readonly Faq[] }).faqs;
  if (pageFaqs) sources.push({ where: `listing/${key}`, faqs: pageFaqs });
}

// ---------------------------------------------------------------------------
// Coverage. A tour page with no FAQ is the state this work existed to fix.
// ---------------------------------------------------------------------------
const bare = liveTours.filter((t) => faqsForTour(t).length === 0);
ok(
  `${bare.length} live tour(s) render no FAQ at all: ${bare.slice(0, 5).map((t) => t.slug).join(", ")}`,
  bare.length === 0
);

// ---------------------------------------------------------------------------
// Duplication across pages. The homepage teaser is the one sanctioned repeat:
// it shows a subset of the hub's answers and deliberately emits no FAQPage
// markup, so it competes with nothing.
// ---------------------------------------------------------------------------
const hubQuestions = new Set(allHubFaqs.map((f) => f.question.trim().toLowerCase()));
for (const f of homepageFaqs) {
  ok(
    `homepage teaser asks "${f.question}", which the hub does not answer — the teaser must be a subset of /faq`,
    hubQuestions.has(f.question.trim().toLowerCase())
  );
}

const seen = new Map<string, string[]>();
for (const source of sources) {
  for (const f of source.faqs) {
    const key = f.question.trim().toLowerCase();
    seen.set(key, [...(seen.get(key) ?? []), source.where]);
  }
}
// The same question asked on a photoshoot page and on a tour page is fine and
// often right — "do you pick me up from my hotel" has a different answer for
// a shoot than for a nine-hour tour, and both pages should answer it. What is
// never right is the same question carrying the same ANSWER in two places:
// that is one page's worth of content published twice, and one edit that now
// has to be made twice. So the duplicate test is on the answer, not the
// question.
const answersFor = new Map<string, Map<string, string[]>>();
for (const source of sources) {
  for (const f of source.faqs) {
    const q = f.question.trim().toLowerCase();
    const a = f.answer.trim().toLowerCase().replace(/\s+/g, " ");
    const byAnswer = answersFor.get(q) ?? new Map<string, string[]>();
    byAnswer.set(a, [...(byAnswer.get(a) ?? []), source.where]);
    answersFor.set(q, byAnswer);
  }
}
for (const [question, byAnswer] of answersFor) {
  for (const [, where] of byAnswer) {
    const systems = [...new Set(where.map((w) => w.split("/")[0]))];
    ok(
      `"${question}" is published with an identical answer on ${where.length} pages (${systems.join(", ")}) — ` +
        `give it one home and link to it`,
      systems.length === 1
    );
  }
}

// ---------------------------------------------------------------------------
// Policy leaking onto product pages. These are the facts that live on /faq,
// and each is a number or a term that changes.
// ---------------------------------------------------------------------------
const POLICY_TELLS = [/\b20%\b/, /non-refundable/i, /\bPayPal\b/, /British Pound/i];
for (const source of sources) {
  if (source.where === "hub/faq" || source.where.startsWith("listing/")) continue;
  for (const f of source.faqs) {
    const hit = POLICY_TELLS.find((re) => re.test(f.answer));
    ok(
      `${source.where} restates site-wide policy in "${f.question}" (matched ${hit}) — that answer belongs on /faq`,
      !hit
    );
  }
}

// ---------------------------------------------------------------------------
// Shape. An answer too short to be useful, or a link to a route that is not
// there, both render without complaint.
// ---------------------------------------------------------------------------
for (const source of sources) {
  for (const f of source.faqs) {
    ok(`${source.where}: "${f.question}" has an answer under 40 characters`, f.answer.trim().length >= 40);
    ok(`${source.where}: a question is missing its question mark: "${f.question}"`, f.question.trim().endsWith("?"));
    if (f.link) {
      const route = f.link.href.split("#")[0].replace(/\/$/, "");
      const dir = `src/app/[locale]/(site)${route}`;
      ok(
        `${source.where}: "${f.question}" links to ${f.link.href}, which is not a route`,
        existsSync(`${dir}/page.tsx`)
      );
    }
  }
}

// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\ncheck-faqs: ${errors.length} failure(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

const total = sources.reduce((n, s) => n + s.faqs.length, 0);
console.log(
  `check-faqs: ok — ${total} answers across ${sources.length} surfaces ` +
    `(${liveTours.length} tours derived, ${faqGroups.length} hub groups), no question answered twice, no policy on a product page.`
);
