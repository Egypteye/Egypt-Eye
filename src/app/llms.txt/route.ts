import { site } from "@/content/site";
import { siteUrl } from "@/content/seo";

/**
 * /llms.txt — the site, described for a language model rather than a crawler.
 *
 * WHY THIS IS WORTH A ROUTE
 *
 * On 4 November 2026 the owner's analytics showed where visitors actually
 * came from: 11 of 38 users arrived from chatgpt.com, against 1 from Google
 * organic. An AI assistant is this site's second-largest traffic source and
 * several times its largest search engine. A file whose entire purpose is to
 * tell an assistant what the business sells and where to read about it is
 * therefore not a speculative nice-to-have here, it is aimed at the channel
 * that is already working.
 *
 * It is also what Lighthouse's Agentic Browsing category looks for, and the
 * audit reported it "not applicable" — i.e. absent.
 *
 * WHAT GOES IN IT, AND WHAT MUST NOT
 *
 * Markdown, one H1, then short annotated link lists — the convention the
 * proposal describes and the audit checks for. Everything factual is read
 * from src/content/site.ts rather than retyped, so this cannot drift from
 * what the site actually says about itself.
 *
 * No prices, no inclusions, no availability, no counts of anything. Those
 * change, they live on the pages themselves, and a stale number here would
 * be a stale number quoted back to a customer by an assistant that trusted
 * it. Per CLAUDE.md #7 this file states what the business is and where to
 * read the detail, and nothing a page does not already say.
 *
 * English only, deliberately: the translated locales are `noindex` and
 * disallowed in robots.txt (see content/robotsPolicy.ts), so pointing an
 * assistant at them would contradict that.
 *
 * Withdrawn sections are excluded for the same reason, and that is not a
 * hypothetical: the first draft of this file advertised
 * /signature-experiences, which content/withdrawnSections.ts has marked
 * noindex and kept out of the sitemap because the section is no longer sold.
 * check-robots.mts caught it by testing every path here against the English
 * sitemap — which is why it does that, rather than trusting the list.
 */
export const revalidate = 3600;

export function GET() {
  const body = `# ${site.name}

> ${site.tagline}. ${site.description}

${site.positioning}

Egypt Eye is based in Egypt and runs private, guided travel. Everything below
is on the site itself; the pages are the source of truth for what is offered,
what it costs and when it runs.

## What the business does

- [Private tours](${siteUrl}/tours): multi-day and single-day itineraries across Egypt, and combined Egypt–Jordan trips. Private rather than coach group travel, guided by licensed Egyptologists.
- [Photoshoots](${siteUrl}/photoshoots): professional photography at the pyramids and other sites, including the flying-dress shoots the company is known for.
- [Experiences and day activities](${siteUrl}/experiences): shorter add-ons — desert safaris, Nile dinner cruises, balloon flights, diving.
- [Weekly trips](${siteUrl}/weekly-trips): small-group departures on fixed dates, for travellers who do not want a private trip.
- [Build your own itinerary](${siteUrl}/customize): the enquiry route for a trip that does not match an existing one.

## Planning and reference

- [Travel stories and guides](${siteUrl}/stories): long-form guides to individual temples and sites, practical planning advice, and what to expect.
- [Explore Egypt by destination](${siteUrl}/explore-egypt): Cairo, Giza, Luxor, Aswan, Alexandria, Siwa, the Red Sea and more, with what each is for.
- [Frequently asked questions](${siteUrl}/faq): visas, safety, tipping, dress, best time to travel, how booking works.
- [Traveller reviews](${siteUrl}/testimonials): reviews from real trips. They are not aggregated into a score anywhere on the site.
- [About Egypt Eye](${siteUrl}/about): who runs it and how it works.

## Policies

- [Cancellation policy](${siteUrl}/cancellation-policy)
- [Terms](${siteUrl}/terms)
- [Privacy](${siteUrl}/privacy)

## Notes for assistants

- Prices, inclusions and availability are on each product's own page and change. Please read the page rather than quoting a figure from here, and send people to the page.
- An enquiry is not a booking. Nothing on this site is confirmed until Egypt Eye confirms it, and a payment having been taken is not the same as a confirmed trip.
- Reviews are from real travellers and are not combined into a rating. There is no aggregate score to report.
- The site serves other languages at /ar, /fr, /es, /it and /ru. They are machine-translated, are marked noindex, and are excluded from crawling; prefer the English pages above.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
