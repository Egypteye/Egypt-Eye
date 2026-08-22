import type { Story } from "./types";
import { authors } from "./authors";
import { events } from "./events";
import { signatureExperiences } from "./signatureExperiences";

const editorialTeam = authors[0];
const eclipseEvent = events[0];
const eclipseExperience = signatureExperiences.find((e) => e.slug === "the-luxor-eclipse");

// Stories / blog listing.

export const stories: Story[] = [
  {
    status: "published",
    featured: true,
    slug: "2027-total-solar-eclipse-luxor",
    title: "Six Minutes of Totality Over the Valley of the Kings",
    category: "Celestial Events",
    tags: ["Solar Eclipse", "Luxor", "2027", "Astronomy", "Egypt Travel"],
    author: editorialTeam,
    excerpt:
      "On August 2, 2027, Luxor gets the longest total solar eclipse anywhere on Earth until 2114 — roughly six minutes and twenty-two seconds, almost directly overhead, above one of the oldest cities on the planet. Here's what's actually happening, and why Luxor is the place to see it.",
    imageTone: "luxor",
    publishedAt: "2026-08-22T00:00:00.000Z",
    relatedExperience: eclipseExperience,
    seoTitle: "Total Solar Eclipse in Luxor, Egypt — August 2, 2027",
    seoDescription:
      "Everything you need to know about the August 2, 2027 total solar eclipse in Luxor, Egypt — verified timing, why Luxor has the longest totality on the path, and how to plan around it.",
    body: [
      {
        _type: "block",
        _key: "p1",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "p1s1",
            text: "For about six minutes on an August afternoon in 2027, the sky over Luxor will do something it hasn't done in this exact way in generations: go dark at 1 o'clock in the afternoon, over temples that have stood for more than three thousand years. It will happen again elsewhere eventually. It won't happen for this long, anywhere on Earth, until the year 2114.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h1",
        style: "h2",
        children: [{ _type: "span", _key: "h1s1", text: "What's Actually Happening", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "p2",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "p2s1",
            text: "On August 2, 2027, a total solar eclipse crosses the Northern Hemisphere — the Moon's path takes it over Spain, Gibraltar, Morocco, Algeria, Tunisia, Libya, Egypt, Saudi Arabia, Yemen, and Somalia, with the path of totality stretching roughly 250 kilometers wide across central Egypt. Luxor sits almost exactly on that path, and because of the geometry of where the Moon's shadow moves slowest, it happens to be one of the best places anywhere on the route to experience it.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "p3",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "p3s1",
            text: "In Luxor, the partial eclipse begins around 11:40 AM local time, as the Moon starts to take its first, barely-visible bite out of the Sun. Totality itself — the full eclipse, when the Moon completely covers the Sun — begins at 1:02:14 PM and lasts approximately six minutes and twenty-two seconds, among the longest anywhere on the 2027 path and the longest total solar eclipse anywhere on Earth until 2114. At maximum eclipse, the Sun sits almost directly overhead, at roughly 82° of altitude — high enough that most people will find themselves tipping their heads all the way back, or lying down, to watch it.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "countdownBlock",
        _key: "countdown1",
        event: eclipseEvent,
      },
      {
        _type: "block",
        _key: "h2",
        style: "h2",
        children: [{ _type: "span", _key: "h2s1", text: "Why Luxor", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "p4",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "p4s1",
            text: "Luxor is built on the site of ancient Thebes, the capital of Egypt during the New Kingdom and, for a long stretch of history, one of the most powerful cities on Earth. The East Bank holds Karnak — the largest religious complex ever built anywhere — and Luxor Temple, still connected to Karnak by an avenue of sphinxes. Across the Nile, the West Bank holds the Valley of the Kings, where Tutankhamun and dozens of other pharaohs were buried, and the mortuary temple of Hatshepsut, cut directly into the cliffs above the desert.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "p5",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "p5s1",
            text: "The sun mattered enormously to the people who built this city — Karnak's Great Hypostyle Hall and its temples were oriented with real care toward solar alignments, and the sun god Ra was central to New Kingdom religion. We won't claim more than that: there's no evidence ancient Egyptians predicted this specific eclipse, and we're not going to dress this up with invented spiritual meaning. What's true without embellishment is enough — this will be one of the longest total solar eclipses of the century, seen from one of the most significant religious and historical sites human beings have ever built. That combination doesn't need help.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "quoteBlock",
        _key: "quote1",
        quote:
          "Stand on the West Bank at one in the afternoon, surrounded by three thousand years of temples built to the sun, and watch it disappear for six minutes.",
      },
      {
        _type: "block",
        _key: "h3",
        style: "h2",
        children: [{ _type: "span", _key: "h3s1", text: "What You'll Actually See", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "p6",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "p6s1",
            text: "The hour before totality is its own kind of strange. The light changes first — not dark, just slightly wrong, the way it looks before certain storms. Shadows sharpen. The temperature drops. Birds, by most accounts, go quiet. Then, in the final seconds before totality, the last sliver of sun vanishes and the sky does something a photograph never quite captures: it goes dark enough to see the corona, the sun's pale outer atmosphere, spread out around a perfectly black disc where the sun used to be. For roughly six minutes and twenty-two seconds, that's the sky over Luxor.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "calloutBlock",
        _key: "safety1",
        tone: "Safety",
        title: "Eclipse Safety",
        body: "Looking directly at the Sun during the partial phases — before and after totality — can cause serious, permanent eye injury. Certified solar viewers meeting the ISO 12312-2 safety standard must be worn at all times during the partial phases. The only time it's safe to look directly at the eclipse without protection is during totality itself, when the Sun is completely covered — and viewers must go back on the instant totality ends.",
      },
      {
        _type: "block",
        _key: "h4",
        style: "h2",
        children: [{ _type: "span", _key: "h4s1", text: "Planning Around Six Minutes", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "p7",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "p7s1",
            text: "Upper Egypt has some of the best weather odds anywhere on the 2027 eclipse path — Luxor's skies are clear on this date roughly four years out of five, historically. The bigger practical concern is heat: August in Luxor regularly reaches the low-to-mid 40s°C (over 100°F) by midday, which shapes how the day around the eclipse should actually be planned — sightseeing early, shade and rest through the hottest hours, and a viewing setup built for comfort rather than a folding chair in direct sun.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "p8",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "p8s1",
            text: "None of that is a reason to plan less carefully — it's the reason to plan more carefully. Six minutes is not a lot of room for logistics to go wrong.",
            marks: [],
          },
        ],
        markDefs: [],
      },
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "best-travel-agencies-in-egypt-2026-guide",
    title: "Best Travel Agencies in Egypt (2026 Guide)",
    category: "Travel Guides",
    excerpt:
      "What to actually look for when booking an Egypt tour operator in 2026 — licensing, guide quality, transparency on inclusions, and why photography access matters more than people think.",
    imageLabel: "Cairo Skyline",
    imageTone: "giza",
  },
  {
    status: "published",
    featured: false,
    slug: "best-travel-agencies-in-egypt-2025-guide",
    title: "Best Travel Agencies in Egypt (2025 Guide)",
    category: "Travel Guides",
    excerpt:
      "Our 2025 breakdown of how to compare Egypt tour operators, from private vs. group transportation to what a genuinely private Egyptologist guide should include.",
    imageLabel: "Khan el-Khalili",
    imageTone: "giza",
  },
  {
    status: "published",
    featured: false,
    slug: "girls-getaway-cairo-giza-jordan",
    title: "A Girls' Getaway: Exploring Cairo, Giza, and Jordan",
    category: "Behind the Scenes",
    excerpt:
      "A recap of a girls' trip across two countries — Pyramids at sunrise, a flying dress shoot in the dunes, and Petra's Treasury by lantern light.",
    imageLabel: "Petra, Jordan",
    imageTone: "jordan",
  },
  {
    status: "published",
    featured: false,
    slug: "capturing-unforgettable-moments",
    title:
      "Capturing Unforgettable Moments: Our Egyptian Adventure with Egypt Eye Travel and Tours",
    category: "Behind the Scenes",
    excerpt:
      "A first-person look at what a week with Egypt Eye actually feels like — from the Nine Pyramids View at golden hour to dinner aboard a Nile cruise.",
    imageLabel: "Nile Sunset",
    imageTone: "nile",
  },
];

export function getStoryBySlug(slug: string) {
  return stories.find((s) => s.slug === slug);
}
