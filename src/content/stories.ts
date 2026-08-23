import type { Story, StoryBodyBlock, StoryFaqItem } from "./types";
import { authors } from "./authors";
import { events } from "./events";
import { signatureExperiences } from "./signatureExperiences";
import { tours } from "./tours";

const editorialTeam = authors[0];
const eclipseEvent = events[0];
const eclipseExperience = signatureExperiences.find((e) => e.slug === "the-luxor-eclipse");
const herEgyptExperience = signatureExperiences.find((e) => e.slug === "her-egypt");

function toursBySlug(...slugs: string[]) {
  return slugs.map((slug) => tours.find((t) => t.slug === slug)).filter((t): t is (typeof tours)[number] => Boolean(t));
}

// Small body-block builders used by the SEO content batch below, so a new
// article's copy doesn't have to hand-write Portable Text block/span
// boilerplate for every paragraph.
let blockKeySeq = 0;
function nextBlockKey(prefix: string) {
  blockKeySeq += 1;
  return `${prefix}${blockKeySeq}`;
}

function p(text: string): StoryBodyBlock {
  return {
    _type: "block",
    _key: nextBlockKey("p"),
    style: "normal",
    children: [{ _type: "span", _key: nextBlockKey("s"), text, marks: [] }],
    markDefs: [],
  } as StoryBodyBlock;
}

function h2(text: string): StoryBodyBlock {
  return {
    _type: "block",
    _key: nextBlockKey("h"),
    style: "h2",
    children: [{ _type: "span", _key: nextBlockKey("s"), text, marks: [] }],
    markDefs: [],
  } as StoryBodyBlock;
}

function bullets(items: string[]): StoryBodyBlock[] {
  return items.map(
    (text) =>
      ({
        _type: "block",
        _key: nextBlockKey("li"),
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [{ _type: "span", _key: nextBlockKey("s"), text, marks: [] }],
        markDefs: [],
      }) as StoryBodyBlock
  );
}

function callout(body: string, opts?: { title?: string; tone?: "Info" | "Safety" | "Highlight" }): StoryBodyBlock {
  return { _type: "calloutBlock", _key: nextBlockKey("callout"), title: opts?.title, body, tone: opts?.tone ?? "Highlight" };
}

function faq(faqs: StoryFaqItem[], title?: string): StoryBodyBlock {
  return { _type: "faqBlock", _key: nextBlockKey("faq"), title, faqs };
}

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
    image: "/photos/pexels-18934702.jpg",
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
    image: "/photos/pexels-28013721.jpg",
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
    image: "/photos/pexels-11195786.jpg",
  },
  {
    status: "published",
    featured: false,
    slug: "capturing-unforgettable-moments",
    title: "What a Week With Egypt Eye Actually Looks Like",
    category: "Behind the Scenes",
    excerpt:
      "A first-person look at what a week with Egypt Eye actually feels like — from the Nine Pyramids View at golden hour to dinner aboard a Nile cruise.",
    imageLabel: "Nile Sunset",
    imageTone: "nile",
    image: "/photos/pexels-28601595.jpg",
  },
  {
    status: "published",
    featured: false,
    slug: "how-to-plan-a-trip-to-egypt",
    title: "How to Plan a Trip to Egypt: A First-Timer's Practical Guide",
    category: "Travel Guides",
    tags: ["Trip Planning", "First-Time Visitors", "Itinerary"],
    author: editorialTeam,
    excerpt:
      "The decisions that actually shape an Egypt trip — how long to go, where to split your time, and whether to travel privately or in a group — before you start booking anything.",
    imageTone: "giza",
    image: "/photos/pexels-15272084.jpg",
    publishedAt: "2026-08-22T00:00:00.000Z",
    destinations: ["Cairo", "Giza", "Luxor", "Aswan"],
    badge: "editorsPick",
    primaryKeyword: "how to plan a trip to egypt",
    secondaryKeywords: ["egypt trip planning", "egypt itinerary for beginners", "first time in egypt"],
    relatedTours: toursBySlug("6-day-cairo-giza-luxor", "8-day-essential-egypt-nile-cruise", "10-day-private-luxurious-trip"),
    seoTitle: "How to Plan a Trip to Egypt: A First-Timer's Guide",
    seoDescription:
      "The decisions that actually shape an Egypt trip — trip length, Cairo vs. the Nile, private vs. group, and when to go — explained plainly.",
    body: [
      {
        _type: "block",
        _key: "p1",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "p1s1",
            text: "Most of the anxiety around planning a first trip to Egypt comes from too many open questions at once — how many days, which cities, what time of year, whether to book a group tour or something private. In practice, only a handful of decisions actually shape the trip. Get those right first, and the rest — hotels, specific temples, which day to see what — sorts itself out easily.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h1",
        style: "h2",
        children: [{ _type: "span", _key: "h1s1", text: "Decide How Long You Actually Have", marks: [] }],
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
            text: "A week is enough to see Cairo and Giza properly, or to add a shorter Nile stretch, but not both without compromise — anything under seven days usually means choosing one region over the other. Ten days is the number most returning travelers wish they'd booked the first time: it fits Cairo, Giza, and a proper run between Luxor and Aswan without every hour being scheduled. Two weeks or more opens the door to Alexandria, the Red Sea, or a desert oasis like Siwa, added on rather than squeezed in.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h2",
        style: "h2",
        children: [{ _type: "span", _key: "h2s1", text: "Choose Between Cairo, the Nile, or Both", marks: [] }],
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
            text: "Cairo and Giza cover ancient Egypt's most famous single sites — the Pyramids, the Sphinx, and now the Grand Egyptian Museum — plus the older, denser city itself. The Nile, particularly the stretch between Luxor and Aswan, covers a different kind of history: temples and tombs built to be approached from the water, in a landscape that hasn't changed much since they were built. Neither replaces the other. If you can only do one, Cairo answers \"I want to see the Pyramids.\" The Nile answers \"I want to understand ancient Egypt.\" Most first-time travelers end up wanting both, which is the real argument for a week or more.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h3",
        style: "h2",
        children: [{ _type: "span", _key: "h3s1", text: "Private or Group — What Actually Changes", marks: [] }],
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
            text: "A private tour means your own vehicle, your own guide, and a schedule that moves at your pace — you can start before the crowds, linger somewhere unplanned, or skip a site that doesn't interest you. It costs more than joining a group. A group tour is cheaper and sociable, but you move on a fixed schedule set for the whole bus, not for you. For families with young children, travelers with limited mobility, or anyone visiting Egypt for a specific reason — a honeymoon, an anniversary, a once-in-a-lifetime trip — the flexibility of private travel tends to matter more than the price difference.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h4",
        style: "h2",
        children: [{ _type: "span", _key: "h4s1", text: "When to Go", marks: [] }],
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
            text: "October through April is Egypt's comfortable season, with December through February the coolest and busiest. If you'd rather have Karnak or the Valley of the Kings without a crowd around every corner, aim for November or March — the weather is still easy, but the peak-season rush hasn't arrived or has just left. Summer (June through August) is genuinely hot inland, especially in Luxor and Aswan, though it's also when the Red Sea coast is at its best for diving and snorkeling, and when tour availability and pricing tend to be at their most flexible.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "calloutBlock",
        _key: "callout1",
        title: "Before You Book Anything",
        body: "Settle these four in order: how many days you have, whether you want Cairo, the Nile, or both, private or group travel, and roughly which season. Everything else — specific hotels, which temples on which day — is much easier to decide once those four are fixed.",
        tone: "Highlight",
      },
      {
        _type: "block",
        _key: "h5",
        style: "h2",
        children: [{ _type: "span", _key: "h5s1", text: "A Simple Way to Start", marks: [] }],
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
            text: "If you'd rather not build an itinerary from scratch, start from one that's close to what you want and adjust it — swap a destination, add a day, change the pace — rather than starting from a blank page. If nothing existing fits, Customize Your Tour is built for exactly that: tell us your dates, who you're traveling with, and what you actually want to see, and we'll design the private itinerary around it.",
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
    slug: "how-many-days-do-you-need-in-egypt",
    title: "How Many Days Do You Need in Egypt?",
    category: "Travel Guides",
    tags: ["Trip Planning", "Itinerary"],
    author: editorialTeam,
    excerpt:
      "What five, seven, ten, and fourteen days actually look like on the ground in Egypt — and where the compromises are at each length.",
    imageTone: "nile",
    image: "/photos/pexels-27407536.jpg",
    publishedAt: "2026-08-22T00:00:00.000Z",
    destinations: ["Cairo", "Giza", "Luxor", "Aswan"],
    primaryKeyword: "how many days do you need in egypt",
    secondaryKeywords: ["egypt itinerary length", "7 days in egypt", "10 days in egypt", "14 days in egypt"],
    relatedTours: toursBySlug(
      "6-day-cairo-giza-luxor",
      "8-day-essential-egypt-nile-cruise",
      "10-day-private-luxurious-trip",
      "epic-8-day-egypt-escapade"
    ),
    seoTitle: "How Many Days Do You Need in Egypt? A Length-by-Length Guide",
    seoDescription:
      "What 5, 7, 10, and 14 days actually cover in Egypt, and where each length forces a compromise — a practical guide to picking your trip's duration.",
    body: [
      {
        _type: "block",
        _key: "p1",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "p1s1",
            text: "There's no single right answer to how long an Egypt trip should be — it depends on what you're willing to leave out. What's more useful than a single number is knowing exactly what each length actually buys you, so you can pick the trade-off you're comfortable with rather than guessing.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h1",
        style: "h2",
        children: [{ _type: "span", _key: "h1s1", text: "5 to 6 Days: Cairo and Giza, Properly", marks: [] }],
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
            text: "This is enough time to see Cairo and Giza without rushing — the Pyramids and the Sphinx, the Grand Egyptian Museum, Islamic and Coptic Cairo, and Khan el-Khalili — with a day or two of breathing room. What it doesn't fit is the Nile Valley: Luxor and Aswan need their own days, not a rushed add-on, so at this length they're usually left for a future trip rather than squeezed in.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h2",
        style: "h2",
        children: [{ _type: "span", _key: "h2s1", text: "7 to 8 Days: Cairo Plus a Taste of Luxor", marks: [] }],
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
            text: "A week is the shortest trip that reasonably includes both Cairo and Luxor — the Pyramids, then a flight or overnight to Luxor for Karnak, Luxor Temple, and the West Bank's Valley of the Kings and Hatshepsut Temple. It's a full week with little slack, and Aswan and a full Nile cruise usually don't fit unless you extend to eight days and let one of the Cairo days go.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h3",
        style: "h2",
        children: [{ _type: "span", _key: "h3s1", text: "10 Days: The Length Most People Wish They'd Booked", marks: [] }],
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
            text: "Ten days consistently comes up as the sweet spot, and the reason is simple: it's enough for Cairo and Giza plus a full Nile cruise between Luxor and Aswan — Karnak, the Valley of the Kings, Philae Temple, the Aswan High Dam — without any single day feeling rushed. It also leaves a little room for a rest day, a photoshoot, or an experience added on top, rather than every hour being accounted for.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h4",
        style: "h2",
        children: [{ _type: "span", _key: "h4s1", text: "14 Days or More: Room to Add Somewhere Different", marks: [] }],
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
            text: "Two weeks covers the full Cairo-and-Nile route with genuine spare time — enough to add Alexandria's Mediterranean coast, a few unhurried days on the Red Sea, or a detour to a desert oasis like Siwa. This is the length that stops feeling like a checklist and starts feeling like a trip with room in it, which is why it tends to suit second-time visitors or travelers who already know they don't want to rush.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "calloutBlock",
        _key: "callout1",
        title: "The Short Version",
        body: "Under a week, pick Cairo or the Nile, not both. A week to eight days fits both, tightly. Ten days is the most comfortable full-country trip. Two weeks or more leaves room to add somewhere beyond Cairo and the Nile entirely.",
        tone: "Highlight",
      },
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "luxor-travel-guide",
    title: "The Ultimate Luxor Travel Guide",
    category: "Travel Guides",
    tags: ["Luxor", "Ancient Egypt", "Nile"],
    author: editorialTeam,
    excerpt:
      "What Luxor actually is beyond \"temples\" — the East Bank, the West Bank, how many days it deserves, and how to see it without treating it as a single day trip.",
    imageTone: "luxor",
    image: "/photos/pexels-18934711.jpg",
    publishedAt: "2026-08-22T00:00:00.000Z",
    destinations: ["Luxor"],
    badge: "editorsPick",
    relatedExperience: eclipseExperience,
    primaryKeyword: "luxor travel guide",
    secondaryKeywords: ["things to do in luxor", "luxor egypt", "how many days in luxor", "luxor east bank west bank"],
    relatedTours: toursBySlug("2-day-luxor-tour", "6-day-cairo-giza-luxor", "8-day-essential-egypt-nile-cruise", "epic-8-day-egypt-escapade"),
    seoTitle: "Luxor Travel Guide: How to Actually See Ancient Thebes",
    seoDescription:
      "A practical Luxor guide — East Bank vs. West Bank, how many days to spend, and the temples and tombs worth building your time around.",
    body: [
      {
        _type: "block",
        _key: "p1",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "p1s1",
            text: "Luxor gets called an open-air museum so often that it starts to sound like a slogan, but it's a fair description — this was ancient Thebes, the religious and political capital of Egypt for centuries, and its temples and tombs were built at a scale meant to be walked through, not glanced at from a bus window. Treating Luxor as a single day trip from Cairo is the most common mistake first-time visitors make.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h1",
        style: "h2",
        children: [{ _type: "span", _key: "h1s1", text: "Two Banks, Two Different Cities", marks: [] }],
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
            text: "Luxor splits cleanly into two halves along the Nile, and they don't feel like the same place. The East Bank is where the living city is — Luxor town, most of the hotels and restaurants, and the temples built for the living: Karnak, the largest religious complex ever built, and Luxor Temple, connected to Karnak by the recently restored Avenue of Sphinxes. The West Bank belongs to the dead — the Valley of the Kings, Hatshepsut's mortuary temple, and the Colossi of Memnon — and has a quieter, more rural feel entirely. We've written a longer comparison of the two banks separately if you want the specifics side by side.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h2",
        style: "h2",
        children: [{ _type: "span", _key: "h2s1", text: "Karnak Temple", marks: [] }],
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
            text: "Karnak isn't one temple but a complex built and expanded by successive pharaohs over roughly two thousand years — the Great Hypostyle Hall alone, with its 134 massive columns, is worth the visit on its own. Go early. It's Luxor's single most-visited site, and the light through the columns in the first hour after opening is very different from midday.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h3",
        style: "h2",
        children: [{ _type: "span", _key: "h3s1", text: "The Valley of the Kings", marks: [] }],
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
            text: "This is where New Kingdom pharaohs — including Tutankhamun — were buried, in tombs cut deep into the valley rock and decorated with some of the best-preserved painted reliefs anywhere in Egypt. A standard ticket includes entry to a handful of tombs; a few of the most famous, including Tutankhamun's, require a separate ticket. Choose which tombs to see based on what's actually open that day rather than a fixed list — access rotates to protect the paintings from humidity and crowding.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h4",
        style: "h2",
        children: [{ _type: "span", _key: "h4s1", text: "How Many Days Does Luxor Actually Need?", marks: [] }],
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
            text: "Two to three days is the honest answer. One full day per bank is the minimum to see the major sites without rushing — Karnak and Luxor Temple can realistically fill a morning to early afternoon on the East Bank; the Valley of the Kings, Hatshepsut's temple, and the Colossi of Memnon take a similar block of time on the West Bank. A third day leaves room for a sunrise hot-air balloon over the West Bank's temples and tombs — reliably one of the best views in Egypt — or simply a slower pace through sites you'd otherwise have to rush.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h5",
        style: "h2",
        children: [{ _type: "span", _key: "h5s1", text: "Best Time to Visit Luxor", marks: [] }],
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
            text: "Luxor's summer heat is serious — well above 40°C (104°F) inland from June through August — which makes October through April far more comfortable for a full day of walking between open-air temple courts. Early morning starts matter here more than almost anywhere else in Egypt: most sites open at dawn specifically so visitors can be finished before the worst of the midday heat, whatever the season.",
            marks: [],
          },
        ],
        markDefs: [],
      },
    ],
    relatedStories: [
      {
        slug: "luxor-east-bank-vs-west-bank",
        title: "East Bank vs. West Bank in Luxor: What Actually Changes",
        excerpt:
          "Two very different halves of one city — what each bank is actually for, and how to split your days between them.",
        imageTone: "luxor",
        category: "Travel Guides",
      },
      {
        slug: "best-things-to-do-in-luxor-egypt",
        title: "The Best Things to Do in Luxor, Egypt: A Journey Through Ancient Thebes",
        excerpt:
          "The essential Luxor experiences, one at a time — from the Valley of the Kings to a sunrise balloon over the West Bank.",
        imageTone: "luxor",
        category: "Travel Guides",
      },
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "luxor-east-bank-vs-west-bank",
    title: "East Bank vs. West Bank in Luxor: What Actually Changes",
    category: "Travel Guides",
    tags: ["Luxor", "Ancient Egypt"],
    author: editorialTeam,
    excerpt:
      "Luxor's East and West Banks aren't two halves of the same sightseeing list — one belonged to the living, the other to the dead, and it still shows.",
    imageTone: "luxor",
    image: "/photos/pexels-18934704.jpg",
    publishedAt: "2026-08-22T00:00:00.000Z",
    destinations: ["Luxor"],
    primaryKeyword: "luxor east bank vs west bank",
    secondaryKeywords: ["luxor west bank", "luxor east bank", "valley of the kings vs karnak"],
    relatedTours: toursBySlug("2-day-luxor-tour", "6-day-cairo-giza-luxor", "8-day-essential-egypt-nile-cruise"),
    relatedStories: [
      {
        slug: "luxor-travel-guide",
        title: "The Ultimate Luxor Travel Guide",
        excerpt:
          "What Luxor actually is beyond \"temples\" — the East Bank, the West Bank, how many days it deserves, and how to see it properly.",
        imageTone: "luxor",
        category: "Travel Guides",
      },
    ],
    seoTitle: "Luxor East Bank vs. West Bank: What's the Difference?",
    seoDescription:
      "Karnak and Luxor Temple sit on the East Bank; the Valley of the Kings sits on the West. Here's what that split actually means for your visit.",
    body: [
      {
        _type: "block",
        _key: "p1",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "p1s1",
            text: "Ancient Thebans built their city around a straightforward idea: the living belonged on the east side of the Nile, where the sun rises, and the dead belonged on the west, where it sets. Three thousand years later, that division still organizes how you'll actually spend your time in Luxor — and it's worth understanding before you plan your days, not after.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h1",
        style: "h2",
        children: [{ _type: "span", _key: "h1s1", text: "The East Bank: Temples for the Living", marks: [] }],
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
            text: "This is where modern Luxor actually lives — the town, most hotels and restaurants, and the temples built to be used by the living: Karnak, Egypt's largest religious complex, and Luxor Temple, connected to it by the restored Avenue of Sphinxes. Both are close together and walkable from most East Bank hotels, which makes this the more convenient half to explore. Give it a comfortable half-day to a full day, ideally starting at Karnak before the heat and the crowds build.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h2",
        style: "h2",
        children: [{ _type: "span", _key: "h2s1", text: "The West Bank: A Landscape Built for the Dead", marks: [] }],
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
            text: "The West Bank holds the Valley of the Kings, Hatshepsut's mortuary temple carved into a cliff face, the Colossi of Memnon, and the villages and workshops of the people who actually built the tombs. It's quieter, greener in patches, and spread out enough that a private vehicle matters more here than on the East Bank — sites sit further apart, and the desert heat between them is no place for a long walk. Plan a full morning here at minimum, starting as early as tickets allow.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h3",
        style: "h2",
        children: [{ _type: "span", _key: "h3s1", text: "So Which Should You See First?", marks: [] }],
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
            text: "There's no wrong order, but there is a practical one: the West Bank rewards an early start more than the East Bank does, since the Valley of the Kings has less shade and more walking between sites. Most private itineraries put the West Bank first for that reason, saving Karnak's covered colonnades and Luxor Temple's evening lighting for later in the day, when the desert heat has eased but there's still enough light to see the reliefs clearly.",
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
    slug: "nile-cruise-vs-dahabiya",
    title: "Nile Cruise vs. Dahabiya: Which Is Right for You?",
    category: "Travel Guides",
    tags: ["Nile", "Luxury Travel", "Luxor", "Aswan"],
    author: editorialTeam,
    excerpt:
      "A standard Nile cruise and a traditional dahabiya sailboat cover the same river between Luxor and Aswan very differently — here's what actually changes.",
    imageTone: "nile",
    image: "/photos/pexels-27730261.jpg",
    publishedAt: "2026-08-22T00:00:00.000Z",
    destinations: ["Luxor", "Aswan"],
    badge: "editorsPick",
    primaryKeyword: "nile cruise vs dahabiya",
    secondaryKeywords: ["what is a dahabiya", "luxury nile cruise", "nile cruise luxor to aswan"],
    relatedTours: toursBySlug("8-day-essential-egypt-nile-cruise", "10-day-private-luxurious-trip"),
    seoTitle: "Nile Cruise vs. Dahabiya: Which Is Right for You?",
    seoDescription:
      "A standard Nile cruise ship and a traditional dahabiya sailboat cover the same route very differently. Here's what actually changes between them.",
    body: [
      {
        _type: "block",
        _key: "p1",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "p1s1",
            text: "The stretch of Nile between Luxor and Aswan is the single most scenic way to see ancient Egypt — temples appear right at the water's edge, in roughly the order the pharaohs who built them intended. How you travel that stretch, though, changes the experience more than almost any other decision in an Egypt itinerary.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h1",
        style: "h2",
        children: [{ _type: "span", _key: "h1s1", text: "The Standard Nile Cruise", marks: [] }],
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
            text: "A modern Nile cruise ship is a motor vessel, typically carrying anywhere from 40 to well over 100 passengers, with balcony cabins, a pool deck, multiple dining rooms, and evening entertainment — closer to a small floating hotel than a boat in the traditional sense. It's the more structured way to travel the river: a fixed itinerary, shared meals, and shore excursions organized for the whole ship. For travelers who want the comfort of a proper cabin and the reassurance of a set schedule, it's genuinely hard to beat.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h2",
        style: "h2",
        children: [{ _type: "span", _key: "h2s1", text: "What Is a Dahabiya?", marks: [] }],
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
            text: "A dahabiya is a traditional Egyptian sailing boat — a shallow wooden hull, tall lateen sails, and a wide open sun deck — carrying a small fraction of a standard cruise ship's passengers, usually somewhere between 8 and 20 guests. The sailing itself becomes part of the experience rather than a means of transport: without a ship's engine noise, you notice things a large cruise moves past — fishermen working the shallows at dawn, villages along the bank, the sound of the water itself. It's a quieter, slower, more private way to cover the same route, generally at a higher cost per guest than a standard cruise cabin.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h3",
        style: "h2",
        children: [{ _type: "span", _key: "h3s1", text: "So Which Should You Choose?", marks: [] }],
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
            text: "If a pool, a full-size cabin, several dining options, and a well-established schedule matter to you, a standard Nile cruise will feel more comfortable — it's the right choice for most families, first-time visitors, and anyone who'd rather not think about logistics. If what you actually want is quiet, a smaller group, and the sailing itself as part of the memory rather than just the transport between temples, a dahabiya is worth asking about directly — it isn't part of our standard tour catalog today, but it's exactly the kind of request Customize Your Tour was built to handle.",
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
    slug: "private-vs-group-tours-egypt",
    title: "Private vs. Group Tours in Egypt: What Actually Changes",
    category: "Travel Guides",
    tags: ["Luxury Travel", "Trip Planning"],
    author: editorialTeam,
    excerpt:
      "The price difference between private and group Egypt tours is obvious. What it actually buys you is less talked about — here's what changes day to day.",
    imageTone: "desert",
    image: "/photos/pexels-15127135.jpg",
    publishedAt: "2026-08-22T00:00:00.000Z",
    destinations: ["Cairo", "Giza", "Luxor", "Aswan"],
    primaryKeyword: "private vs group tour egypt",
    secondaryKeywords: ["private egypt tour", "is a private egypt tour worth it", "egypt tour with private guide"],
    relatedTours: toursBySlug("10-day-private-luxurious-trip", "3-days-jordan"),
    relatedExperience: herEgyptExperience,
    seoTitle: "Private vs. Group Tours in Egypt: What Actually Changes",
    seoDescription:
      "The price gap between private and group Egypt tours is obvious. What it buys you day to day is less talked about — here's the honest breakdown.",
    body: [
      {
        _type: "block",
        _key: "p1",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "p1s1",
            text: "Every Egypt tour operator will tell you private is better. It usually is — but it's worth being specific about why, because the price difference is real, and it should buy you something you'd actually notice, not just a nicer-sounding word on a brochure.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h1",
        style: "h2",
        children: [{ _type: "span", _key: "h1s1", text: "What Changes on a Private Tour", marks: [] }],
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
            text: "Your vehicle is yours alone, which means your schedule is yours alone. You can start at sunrise to beat both the heat and the crowds at Karnak or the Pyramids, linger somewhere that unexpectedly catches you, or leave early if someone in your group is tired — none of which is possible when twenty other people's preferences are also on the itinerary. Your guide is dedicated to your group specifically, which tends to mean deeper, more responsive explanations rather than a fixed script delivered to the same size crowd every day.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h2",
        style: "h2",
        children: [{ _type: "span", _key: "h2s1", text: "What You're Actually Paying For", marks: [] }],
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
            text: "A group tour splits the cost of the vehicle, guide, and driver across everyone on board, which is why it's cheaper. A private tour means you're covering that full cost yourself, in exchange for controlling exactly how the day runs. It's the same trade-off as a private car versus a scheduled bus route: the destination can be identical, but the experience of getting there rarely is.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h3",
        style: "h2",
        children: [{ _type: "span", _key: "h3s1", text: "Who Actually Benefits Most", marks: [] }],
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
            text: "Families with young children benefit enormously — no waiting on twenty strangers when someone needs a bathroom break or a snack. Travelers marking a specific occasion — a honeymoon, an anniversary, a milestone trip — tend to feel the difference too, since the day can actually be shaped around what matters to them rather than a fixed group schedule. And anyone who simply dislikes being herded through a site on someone else's clock will notice it immediately, from the very first temple.",
            marks: [],
          },
        ],
        markDefs: [],
      },
    ],
  },
  {
    status: "published",
    featured: true,
    slug: "grand-egyptian-museum-guide",
    title: "The Grand Egyptian Museum: What to Know Before You Go",
    category: "Travel Guides",
    tags: ["Cairo", "Giza", "Ancient Egypt", "Museums"],
    author: editorialTeam,
    excerpt:
      "The Grand Egyptian Museum is now fully open, with Tutankhamun's complete collection displayed together for the first time. Here's what a visit actually involves.",
    imageTone: "giza",
    image: "/photos/pexels-1270163.jpg",
    publishedAt: "2026-08-22T00:00:00.000Z",
    contentReviewDate: "2026-12-01",
    destinations: ["Cairo", "Giza"],
    badge: "mostHelpful",
    primaryKeyword: "grand egyptian museum guide",
    secondaryKeywords: ["grand egyptian museum tickets", "gem cairo", "tutankhamun museum", "is the grand egyptian museum worth visiting"],
    relatedTours: toursBySlug("3-day-cairo-giza", "1-day-giza-tour", "5-day-giza-cairo-alexandria"),
    seoTitle: "Grand Egyptian Museum Guide: What to Know Before You Go",
    seoDescription:
      "The GEM is now fully open near Giza, with Tutankhamun's complete collection together for the first time. What to expect, and how to plan your visit.",
    body: [
      {
        _type: "block",
        _key: "p1",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "p1s1",
            text: "The Grand Egyptian Museum opened in full on November 1, 2025, after two decades of construction, and it changes what a Cairo and Giza itinerary actually looks like. It sits close to the Pyramids themselves — meaning a single day can now realistically combine the Giza plateau with one of the largest archaeological museums in the world, something that wasn't possible before it opened.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h1",
        style: "h2",
        children: [{ _type: "span", _key: "h1s1", text: "What's Actually Inside", marks: [] }],
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
            text: "The museum holds more than 100,000 artifacts across its main galleries, but the single biggest draw is Tutankhamun: for the first time, his complete funerary collection — all 5,398 pieces, from the golden mask to objects that had never left storage — is displayed together in dedicated galleries. The Khufu Boat Museum, housing the full-size solar barque buried beside the Great Pyramid, is also part of the complex. Between the Tutankhamun galleries and the wider collection, it's realistic to spend a half day here without feeling rushed.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h2",
        style: "h2",
        children: [{ _type: "span", _key: "h2s1", text: "Tickets and Booking", marks: [] }],
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
            text: "Tickets are sold online through the museum's official site, and advance booking is strongly recommended — it lets you skip the ticket line entirely and lock in a specific time slot. As of this writing, standard foreign-visitor admission runs around $30, with reduced rates for students and children; given how recently the museum opened, treat any specific price as a starting estimate and confirm the current rate when you book, rather than something fixed. If you're touring with us, this is exactly the kind of detail we handle as part of your itinerary rather than something you need to manage yourself.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h3",
        style: "h2",
        children: [{ _type: "span", _key: "h3s1", text: "Is It Worth Visiting?", marks: [] }],
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
            text: "Yes, straightforwardly. Seeing Tutankhamun's collection displayed as a complete set, rather than split across galleries as it was for decades in downtown Cairo, is a genuinely different experience — and pairing it with the Pyramids on the same day, now that they're a short drive apart, makes a Giza day noticeably more complete than it was before the museum opened.",
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
    slug: "best-time-to-visit-egypt",
    title: "The Best Time to Visit Egypt, Month by Month",
    category: "Travel Guides",
    tags: ["Trip Planning", "Seasonal Travel"],
    author: editorialTeam,
    excerpt:
      "Egypt's comfortable season runs October through April — but within that window, crowds, prices, and weather shift enough to matter. Here's how to pick your month.",
    imageTone: "desert",
    image: "/photos/pexels-16386724.jpg",
    publishedAt: "2026-08-22T00:00:00.000Z",
    contentReviewDate: "2027-02-01",
    destinations: ["Cairo", "Luxor", "Aswan", "Red Sea"],
    badge: "editorsPick",
    primaryKeyword: "best time to visit egypt",
    secondaryKeywords: ["egypt weather by month", "egypt in november", "egypt in winter", "best time for nile cruise"],
    relatedTours: toursBySlug("8-day-essential-egypt-nile-cruise", "10-day-private-luxurious-trip", "red-sea-relaxation"),
    seoTitle: "Best Time to Visit Egypt: A Month-by-Month Guide",
    seoDescription:
      "Egypt's comfortable season runs October to April, but crowds, prices, and heat shift within it. A practical, month-by-month guide to picking yours.",
    body: [
      {
        _type: "block",
        _key: "p1",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "p1s1",
            text: "The short answer — October through April — is true but not that useful on its own, because those seven months aren't interchangeable. Crowds, prices, and how hot it actually feels standing at the Valley of the Kings at noon all shift meaningfully within that window. Here's what each part of the year is actually like.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h1",
        style: "h2",
        children: [{ _type: "span", _key: "h1s1", text: "December to February: Peak Season", marks: [] }],
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
            text: "This is Egypt's coolest, most comfortable stretch, and also its busiest — January in particular draws the year's largest crowds to Giza, Karnak, and the Valley of the Kings. If you're traveling privately, crowding matters less, since an early start and a private guide can route around the worst of it. If comfortable weather matters more to you than avoiding a crowd, this remains the safest bet.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h2",
        style: "h2",
        children: [{ _type: "span", _key: "h2s1", text: "October–November and February–March: The Sweet Spot", marks: [] }],
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
            text: "These shoulder-season windows consistently come up as the smartest time to go: the weather is still genuinely comfortable, but the peak-season crowds either haven't arrived yet or have just thinned out. If your dates are flexible at all, this is where we'd point you first — it's the best ratio of good weather to manageable sites anywhere on the calendar.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h3",
        style: "h2",
        children: [{ _type: "span", _key: "h3s1", text: "May to September: Real Heat, and a Different Kind of Trip", marks: [] }],
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
            text: "Summer heat inland is serious — Luxor and Aswan regularly exceed 40°C (104°F) — and it does change what a day of temple-touring feels like, even with early starts and air-conditioned transport between stops. It's not a reason to rule the season out entirely, though: the Red Sea coast stays warm and inviting for swimming and diving right through summer, and if your trip leans toward the coast rather than a full temple circuit, these months work well. Cairo and Giza are more manageable than Upper Egypt in summer, if the Nile Valley's heat is the main concern.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h4",
        style: "h2",
        children: [{ _type: "span", _key: "h4s1", text: "A Note on Ramadan", marks: [] }],
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
            text: "Ramadan's dates shift each year on the Islamic calendar, so it doesn't map to a fixed month — it's worth checking against your travel dates specifically. During it, some restaurants and shops keep shorter daytime hours before the evening iftar meal, and the pace of daily life shifts generally. Major sites stay open and tours run as normal; it simply changes some of the rhythm around them, in ways many travelers find genuinely interesting to witness firsthand.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "calloutBlock",
        _key: "callout1",
        title: "If You're Only Picking One Detail",
        body: "Want the best weather-to-crowd ratio without overthinking it? Aim for November or March. Want guaranteed cool weather and don't mind company at the major sites? December through February. Building your trip around the Red Sea rather than temples? Summer works fine, and pricing tends to be more flexible.",
        tone: "Highlight",
      },
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "womens-guide-to-traveling-egypt",
    title: "A Woman's Guide to Traveling Egypt Well",
    category: "Travel Guides",
    tags: ["Women's Travel", "Trip Planning"],
    author: editorialTeam,
    excerpt:
      "Egypt is a genuinely rewarding destination for women travelers — what to actually expect, what's worth preparing for, and what tends to get overstated.",
    imageTone: "desert",
    image: "/photos/pexels-38810253.jpg",
    publishedAt: "2026-08-22T00:00:00.000Z",
    destinations: ["Cairo", "Luxor", "Aswan"],
    badge: "editorsPick",
    relatedExperience: herEgyptExperience,
    primaryKeyword: "women traveling to egypt",
    secondaryKeywords: ["is egypt safe for women", "solo female travel egypt", "what to wear in egypt as a woman"],
    relatedTours: toursBySlug("10-day-private-luxurious-trip"),
    seoTitle: "A Woman's Guide to Traveling Egypt Well",
    seoDescription:
      "What women travelers actually encounter in Egypt, what's worth preparing for, and what tends to get overstated online — a grounded, honest guide.",
    body: [
      {
        _type: "block",
        _key: "p1",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "p1s1",
            text: "Egypt draws an enormous number of women travelers every year — solo, in pairs, and in groups — and the overwhelming majority have a genuinely good trip. That said, it's fair to want real information rather than either extreme: neither the alarmist warnings some corners of the internet traffic in, nor a blanket \"don't worry about it\" that skips useful detail entirely.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h1",
        style: "h2",
        children: [{ _type: "span", _key: "h1s1", text: "What You're Actually Likely to Encounter", marks: [] }],
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
            text: "The most common friction women report isn't danger — it's persistent attention in crowded areas: vendors who don't take a polite no the first time, or unsolicited comments in busy markets and streets. It's rarely threatening, but it can be tiring over a long trip if you're navigating it alone, without a guide who can run interference. Tourist police are visibly present at every major site, and violent crime against tourists is genuinely rare.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h2",
        style: "h2",
        children: [{ _type: "span", _key: "h2s1", text: "What Actually Helps", marks: [] }],
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
            text: "A private guide changes this more than almost anything else — vendors and touts direct their attention differently toward a group traveling with a local guide than toward visibly independent travelers, and having someone who can navigate a situation in Arabic, calmly and immediately, removes most of the friction entirely. Modest, breathable clothing — covered shoulders and knees, loose rather than tight — is comfortable in the heat regardless of gender, and also draws less unwanted attention in more conservative areas outside tourist zones. None of this requires dressing differently from how you'd naturally dress for a hot, dusty, walking-heavy trip.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h3",
        style: "h2",
        children: [{ _type: "span", _key: "h3s1", text: "Where a Different Kind of Trip Helps", marks: [] }],
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
            text: "This is exactly why we built Her Egypt as its own Signature Experience rather than treating \"women's travel\" as a checkbox on a standard tour — it's designed from the ground up around the pace, comfort, and specific questions that come up on a trip built for women, with hosts who've thought through the details in advance rather than improvising them on the day. It isn't the only way to see Egypt well as a woman, but it's built for exactly this.",
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
    slug: "best-things-to-do-in-luxor-egypt",
    title: "The Best Things to Do in Luxor, Egypt: A Journey Through Ancient Thebes",
    category: "Travel Guides",
    tags: ["Luxor", "Ancient Egypt", "Nile"],
    author: editorialTeam,
    excerpt:
      "The essential Luxor experiences, one at a time — from the Valley of the Kings and Karnak Temple to sunrise over the West Bank and the quieter sites most visitors miss.",
    imageTone: "luxor",
    image: "/photos/pexels-36549458.jpg",
    publishedAt: "2026-08-22T00:00:00.000Z",
    destinations: ["Luxor"],
    relatedExperience: eclipseExperience,
    primaryKeyword: "things to do in Luxor",
    secondaryKeywords: [
      "Luxor Egypt",
      "Luxor tours",
      "Luxor travel",
      "Valley of the Kings",
      "Karnak Temple",
      "Luxor Temple",
      "Luxor experiences",
      "Luxor itinerary",
    ],
    relatedTours: toursBySlug("2-day-luxor-tour", "6-day-cairo-giza-luxor", "8-day-essential-egypt-nile-cruise", "epic-8-day-egypt-escapade"),
    relatedStories: [
      {
        slug: "luxor-travel-guide",
        title: "The Ultimate Luxor Travel Guide",
        excerpt:
          "What Luxor actually is beyond \"temples\" — the East Bank, the West Bank, how many days it deserves, and how to see it without treating it as a single day trip.",
        imageTone: "luxor",
        category: "Travel Guides",
      },
      {
        slug: "luxor-east-bank-vs-west-bank",
        title: "East Bank vs. West Bank in Luxor: What Actually Changes",
        excerpt:
          "Two very different halves of one city — what each bank is actually for, and how to split your days between them.",
        imageTone: "luxor",
        category: "Travel Guides",
      },
    ],
    seoTitle: "Best Things to Do in Luxor, Egypt | Luxury Travel Guide",
    seoDescription:
      "The best things to do in Luxor, Egypt — from the Valley of the Kings and Karnak Temple to sunrise over the Nile and private, unhurried experiences.",
    body: [
      {
        _type: "block",
        _key: "p1",
        style: "normal",
        children: [
          { _type: "span", _key: "p1s1", text: "There are places you visit for their history. And then there is Luxor.", marks: [] },
        ],
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
            text: "Here, history isn't confined to a museum or a page in a guidebook. It stretches across the landscape. The Nile divides the city into two very different worlds: the temples of the East Bank and the ancient necropolis of the West Bank. Between them are thousands of years of stories, monuments, tombs, and rituals that once made ancient Thebes one of the most important cities in Egypt.",
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
            text: "Today, Luxor remains one of the most extraordinary places to experience Egypt. But the best way to see it isn't to rush from one monument to another. It's to give the city time.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h1",
        style: "h2",
        children: [{ _type: "span", _key: "h1s1", text: "So, What Are the Best Things to Do in Luxor?", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "p4",
        style: "normal",
        children: [
          { _type: "span", _key: "p4s1", text: "If you're planning a trip to Luxor, the essential experiences include:", marks: [] },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "l1",
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [{ _type: "span", _key: "l1s1", text: "Exploring the Valley of the Kings", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "l2",
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [{ _type: "span", _key: "l2s1", text: "Walking through Karnak Temple", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "l3",
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [{ _type: "span", _key: "l3s1", text: "Visiting Luxor Temple after sunset", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "l4",
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [{ _type: "span", _key: "l4s1", text: "Seeing the Temple of Hatshepsut", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "l5",
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [{ _type: "span", _key: "l5s1", text: "Watching the sunrise from above the West Bank", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "l6",
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [{ _type: "span", _key: "l6s1", text: "Sailing the Nile", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "l7",
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [{ _type: "span", _key: "l7s1", text: "Discovering the quieter temples of the West Bank", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "l8",
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [{ _type: "span", _key: "l8s1", text: "Experiencing Luxor with a private Egyptologist", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "l9",
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [{ _type: "span", _key: "l9s1", text: "Taking time to simply watch life along the Nile", marks: [] }],
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
            text: "And that last one matters more than it sounds. Because Luxor isn't only about what you see. It's about how you experience it.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h2",
        style: "h2",
        children: [{ _type: "span", _key: "h2s1", text: "1. Walk Through the Valley of the Kings", marks: [] }],
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
            text: "Few places bring you as close to ancient Egypt as the Valley of the Kings. Hidden among the desert hills on Luxor's West Bank, the valley became the burial place of many of the pharaohs of Egypt's New Kingdom. Instead of enormous pyramids, these rulers chose something very different: tombs carved deep into the rock. Inside, the darkness gives way to walls covered with painted scenes, hieroglyphs, and ancient religious texts.",
            marks: [],
          },
        ],
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
            text: "The experience changes completely when you stop treating the Valley of the Kings as a checklist. Rather than trying to see every tomb, choose carefully and allow yourself time to understand what you're looking at. A knowledgeable Egyptologist can make an enormous difference here — a hieroglyph on a wall can look beautiful, but a guide can tell you why it's there. The paintings stop being simply decoration. They become a story.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "calloutBlock",
        _key: "callout1",
        title: "Best Way to Experience It",
        body: "Visit early in the morning, before the heat becomes intense, and explore with a private Egyptologist who can explain the symbolism and history behind the tombs.",
        tone: "Highlight",
      },
      {
        _type: "ctaBlock",
        _key: "cta1",
        title: "Experience Luxor Your Way",
        body: "Explore our private Luxor experiences.",
        buttonLabel: "See the Journey",
        buttonHref: "/signature-experiences",
      },
      {
        _type: "block",
        _key: "h3",
        style: "h2",
        children: [{ _type: "span", _key: "h3s1", text: "2. Stand Beneath the Columns of Karnak Temple", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "p8",
        style: "normal",
        children: [
          { _type: "span", _key: "p8s1", text: "Karnak is difficult to understand until you're standing inside it. The scale is enormous — its Great Hypostyle Hall is filled with gigantic columns, creating one of the most memorable architectural spaces in Egypt.", marks: [] },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "p9",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "p9s1",
            text: "But Karnak isn't simply one temple built by one ruler. It developed over centuries, with generations of pharaohs adding their own structures, statues, inscriptions, and sacred spaces. That's part of what makes walking through Karnak so fascinating — you're not looking at a single moment in Egyptian history. You're walking through layers of it. Go early if you can: the morning light, cooler temperatures, and quieter atmosphere make the experience considerably more enjoyable.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h4",
        style: "h2",
        children: [{ _type: "span", _key: "h4s1", text: "3. Visit Luxor Temple After Dark", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "p10",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "p10s1",
            text: "Luxor Temple feels completely different from Karnak — more intimate, and because modern Luxor has grown up right around it, the contrast between ancient Egypt and everyday Egyptian life becomes part of the experience. Come later in the day and stay into the evening: as the lights come on, the columns and statues take on a completely different character. This is one of those moments where you don't need to do much. Just walk, look up, and let the scale of the place sink in.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h5",
        style: "h2",
        children: [{ _type: "span", _key: "h5s1", text: "4. See Hatshepsut's Temple Against the Cliffs", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "p11",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "p11s1",
            text: "On the West Bank, the Temple of Hatshepsut rises dramatically from the cliffs of Deir el-Bahari. Its design is unlike many of the temples elsewhere in Egypt — long terraces climb toward the limestone cliffs, creating a striking relationship between architecture and landscape. Hatshepsut herself was one of ancient Egypt's most remarkable rulers, and her story makes the temple even more interesting. Take your time here, and look beyond the obvious photographs to notice how deliberately the temple was positioned within the surrounding landscape.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h6",
        style: "h2",
        children: [{ _type: "span", _key: "h6s1", text: "5. See Luxor From the Sky at Sunrise", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "p12",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "p12s1",
            text: "If there is one experience that changes your perspective on Luxor, it's seeing it from above. A sunrise hot-air balloon flight takes you over the West Bank as the first light reaches the temples, desert, and Nile valley below. From the air, you suddenly understand Luxor geographically — the green agricultural land follows the Nile, the desert begins almost immediately beyond it, and scattered between the two are the monuments of ancient Thebes.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "p13",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "p13s1",
            text: "It's one of the rare experiences where the landscape itself becomes part of the history. This is not just sightseeing — it's a completely different way of seeing Luxor. Flights are weather-dependent, so they're always operated according to the appropriate safety conditions.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "ctaBlock",
        _key: "cta2",
        title: "Make It Yours",
        body: "Add a Luxor experience to your private Egypt journey.",
        buttonLabel: "Explore Experiences",
        buttonHref: "/experiences",
      },
      {
        _type: "block",
        _key: "h7",
        style: "h2",
        children: [{ _type: "span", _key: "h7s1", text: "6. Sail the Nile", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "p14",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "p14s1",
            text: "After temples and tombs, slow down. The Nile has always been at the heart of life in Luxor, and a traditional felucca offers one of the simplest ways to experience it — no engines, no crowds, just the movement of the boat, the wind in the sail, and the changing light over the river.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "p15",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "p15s1",
            text: "For something longer, the Nile can become the journey itself. A cruise between Luxor and Aswan lets you experience Egypt at a completely different pace — instead of travelling through Egypt, you begin to travel with the river. And that distinction matters.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h8",
        style: "h2",
        children: [{ _type: "span", _key: "h8s1", text: "7. Go Beyond the Famous Monuments", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "p16",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "p16s1",
            text: "Luxor's most famous sites deserve their reputation. But some of the most rewarding moments happen away from the headline attractions:",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "l10",
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [
          { _type: "span", _key: "l10s1", text: "Medinet Habu — ", marks: ["strong"] },
          { _type: "span", _key: "l10s2", text: "a remarkable temple complex on the West Bank, known for its surviving reliefs and inscriptions.", marks: [] },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "l11",
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [
          { _type: "span", _key: "l11s1", text: "Valley of the Queens — ", marks: ["strong"] },
          { _type: "span", _key: "l11s2", text: "a quieter royal necropolis with some exceptionally preserved decoration.", marks: [] },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "l12",
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [
          { _type: "span", _key: "l12s1", text: "The Ramesseum — ", marks: ["strong"] },
          { _type: "span", _key: "l12s2", text: "the remains of Ramesses II's enormous mortuary temple.", marks: [] },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "l13",
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [
          { _type: "span", _key: "l13s1", text: "Luxor Museum — ", marks: ["strong"] },
          { _type: "span", _key: "l13s2", text: "a more intimate museum experience for travelers who want context without the scale of a huge collection.", marks: [] },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "l14",
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [
          { _type: "span", _key: "l14s1", text: "Avenue of Sphinxes — ", marks: ["strong"] },
          { _type: "span", _key: "l14s2", text: "the restored processional route connecting Luxor Temple and Karnak, offering another way to understand the ancient city.", marks: [] },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h9",
        style: "h2",
        children: [{ _type: "span", _key: "h9s1", text: "8. Experience Luxor With an Egyptologist", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "p17",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "p17s1",
            text: "You can visit Luxor without a guide. But you experience it differently with one. A statue can look impressive; a guide can tell you who commissioned it, why it was built, and what happened to it centuries later. The difference isn't simply information — it's context. And in a place as historically dense as Luxor, context changes everything.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "p18",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "p18s1",
            text: "For a private journey, we recommend building your day around the places that genuinely interest you rather than trying to see everything.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "ctaBlock",
        _key: "cta3",
        title: "Egypt Tours That Include Luxor",
        body: "See how a full Egypt itinerary can be built around this pace.",
        buttonLabel: "Explore Egypt Tours",
        buttonHref: "/tours",
      },
      {
        _type: "block",
        _key: "h10",
        style: "h2",
        children: [{ _type: "span", _key: "h10s1", text: "9. Leave Time for the Nile", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "p19",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "p19s1",
            text: "One of the easiest mistakes in Luxor is overplanning: temple, tomb, temple, lunch, another temple, another tomb — then suddenly the sun is setting and you've technically \"seen\" Luxor without ever experiencing it. Leave space. Sit beside the Nile. Watch the boats. Walk through the local streets. Have tea. Stay for sunset. The moments between the major sights are often the ones you remember.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h11",
        style: "h2",
        children: [{ _type: "span", _key: "h11s1", text: "How Many Days Do You Need in Luxor?", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "p20",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "p20s1",
            text: "For most travelers, two full days is a good starting point. A well-paced two-day visit could look like this:",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "p21",
        style: "normal",
        children: [{ _type: "span", _key: "p21s1", text: "Day One — the West Bank:", marks: ["strong"] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "p22",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "p22s1",
            text: "Sunrise experience, the Valley of the Kings, the Temple of Hatshepsut, Medinet Habu, the Colossi of Memnon, a relaxed afternoon, and a Nile sunset.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "p23",
        style: "normal",
        children: [{ _type: "span", _key: "p23s1", text: "Day Two — the East Bank:", marks: ["strong"] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "p24",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "p24s1",
            text: "Karnak Temple, Luxor Museum, lunch, free time, Luxor Temple, and an evening in Luxor town.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "p25",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "p25s1",
            text: "This gives you the major highlights without turning the trip into a race. Travelers with three days can slow the pace further or add experiences such as a longer Nile sailing trip or a visit to one of the quieter West Bank sites.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h12",
        style: "h2",
        children: [{ _type: "span", _key: "h12s1", text: "When Is the Best Time to Visit Luxor?", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "p26",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "p26s1",
            text: "The cooler months — roughly October through April — are generally the most comfortable for exploring Luxor, particularly when spending long periods outdoors at archaeological sites. But there's another consideration: time of day. Even during warmer seasons, an early start can transform the experience — the desert feels completely different at sunrise than it does in the middle of the afternoon. That's why we design many Luxor experiences around the rhythm of the day rather than simply the opening hours of monuments.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "h13",
        style: "h2",
        children: [{ _type: "span", _key: "h13s1", text: "The Luxor Experience We Believe In", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "p27",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "p27s1",
            text: "Luxor doesn't need to be rushed, and it doesn't need to be reduced to a checklist — Karnak, the Valley of the Kings, Hatshepsut, Luxor Temple. Those places are extraordinary. But the real luxury is having enough time to experience them properly: to enter a tomb without watching the clock, to stand beneath the columns of Karnak, to watch the Nile turn gold, to see the West Bank from above at sunrise, and to sit down after a long day and realize — this is exactly why you came to Egypt.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "ctaBlock",
        _key: "cta4",
        title: "Ready to Experience Luxor?",
        body: "Whether you want to explore ancient Egypt with a private Egyptologist, sail the Nile, add a sunrise balloon flight, or build Luxor into a longer journey through Egypt, your trip doesn't have to follow a fixed formula. If you already know what you want, let us turn it into a journey designed around you.",
        buttonLabel: "Plan Your Trip",
        buttonHref: "/customize",
      },
      {
        _type: "faqBlock",
        _key: "faq1",
        title: "Frequently Asked Questions",
        faqs: [
          {
            question: "Is Luxor worth visiting in Egypt?",
            answer:
              "Absolutely. Luxor contains some of Egypt's most important ancient sites, including the Valley of the Kings, Karnak Temple, Luxor Temple, and the Temple of Hatshepsut. It's one of the essential destinations for travelers interested in ancient Egypt.",
          },
          {
            question: "How many days do you need in Luxor?",
            answer:
              "Two full days are enough to cover the major highlights at a comfortable pace. Three days allow more time for additional experiences and slower exploration.",
          },
          {
            question: "What is the best thing to do in Luxor?",
            answer:
              "It depends on what you enjoy. The Valley of the Kings and Karnak are essential for history lovers, while a sunrise hot-air balloon flight and sailing on the Nile offer a more experiential way to see Luxor.",
          },
          {
            question: "Is the Luxor hot-air balloon experience worth it?",
            answer:
              "For travelers who enjoy unique experiences, a sunrise balloon flight offers a spectacular perspective over Luxor's West Bank and the Nile valley. Flights are weather-dependent and are always operated under appropriate safety conditions.",
          },
          {
            question: "Can I visit Luxor as part of a Nile cruise?",
            answer:
              "Yes. Luxor is a major starting or ending point for Nile journeys between Luxor and Aswan, making it easy to combine the city's archaeological sites with a longer journey along the river.",
          },
        ],
      },
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "egypt-visa-guide-2026",
    title: "Egypt Visa Guide: How to Get Your e-Visa in 2026",
    category: "Travel Guides",
    tags: ["Visa", "Trip Planning", "Egypt Travel"],
    author: editorialTeam,
    excerpt:
      "What the Egypt e-visa actually costs, how long it takes, and the mistakes that trip up first-time applicants — a straightforward guide to getting the paperwork right.",
    imageTone: "giza",
    image: "/photos/pexels-37923846.jpg",
    publishedAt: "2026-08-23T00:00:00.000Z",
    destinations: ["Cairo", "Luxor", "Aswan"],
    primaryKeyword: "egypt visa",
    secondaryKeywords: ["egypt e-visa", "egypt visa cost", "egypt visa requirements", "how to get an egypt visa"],
    relatedTours: toursBySlug("6-day-cairo-giza-luxor", "8-day-essential-egypt-nile-cruise"),
    seoTitle: "Egypt Visa Guide 2026: e-Visa Cost, Requirements, and How to Apply",
    seoDescription:
      "Everything to know about the Egypt e-visa in 2026 — cost, processing time, requirements, and the common mistakes that delay applications.",
    body: [
      p(
        "Most visitors to Egypt need a visa, and the easiest route for the vast majority of travelers is the official e-visa — applied for online, before you fly, with no visit to an embassy required."
      ),
      h2("Single-Entry or Multiple-Entry"),
      p(
        "The e-visa comes in two forms. A single-entry visa allows a stay of up to 30 days and is valid for use within 3 months of issue; a multiple-entry visa allows up to 30 days per visit and stays valid for 6 months, useful if your trip includes a side visit elsewhere and a return to Egypt. As of 2026, official fees run around $30 for single-entry and $65 for multiple-entry."
      ),
      callout(
        "Only apply through Egypt's official e-visa portal. A number of unofficial third-party sites mimic it and charge two to three times the real fee for the same visa.",
        { tone: "Safety", title: "Watch for Unofficial Sites" }
      ),
      h2("What You'll Need"),
      ...bullets([
        "A passport valid for at least 6 months beyond your travel dates, with at least one to two blank pages",
        "A digital passport-style photo",
        "Your travel dates and a valid email address for the approved visa PDF",
        "A debit or credit card for the application fee",
      ]),
      h2("Timing"),
      p(
        "Processing typically takes around 3 business days, though it can occasionally take longer. Apply at least a week before departure to leave room for that, and save the approved visa PDF — you'll be asked to show it on arrival alongside your passport."
      ),
      faq([
        {
          question: "Do I need a visa to visit Egypt?",
          answer:
            "Most nationalities do, yes. Check the official e-visa portal for your specific passport, as a small number of nationalities have different requirements or are not eligible for the e-visa.",
        },
        {
          question: "Can I get a visa on arrival in Egypt?",
          answer:
            "Visa-on-arrival is available at some airports for eligible nationalities, but it typically costs more than the e-visa and creates a line to wait in after a long flight. Applying online in advance is simpler.",
        },
        {
          question: "How much does an Egypt visa cost?",
          answer:
            "As of 2026, the official e-visa fee is roughly $30 for single-entry and $65 for multiple-entry. Prices on unofficial sites are often significantly higher.",
        },
      ]),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "is-egypt-safe-to-visit",
    title: "Is Egypt Safe to Visit in 2026?",
    category: "Travel Guides",
    tags: ["Safety", "Trip Planning"],
    author: editorialTeam,
    excerpt:
      "A plain-spoken look at where Egypt's travel advisories actually apply, what tourist areas are like day to day, and the difference between South Sinai and the areas travelers are told to avoid.",
    imageTone: "desert",
    image: "/photos/pexels-29678689.jpg",
    publishedAt: "2026-08-23T00:00:00.000Z",
    destinations: ["Cairo", "Luxor", "Aswan", "Sinai", "Red Sea"],
    primaryKeyword: "is egypt safe to visit",
    secondaryKeywords: ["egypt safety 2026", "is egypt safe for tourists", "sharm el sheikh safe", "sinai travel advisory"],
    relatedTours: toursBySlug("8-day-essential-egypt-nile-cruise", "10-day-private-luxurious-trip"),
    seoTitle: "Is Egypt Safe to Visit in 2026? A Grounded Answer",
    seoDescription:
      "What Egypt's travel advisories actually say, what the main tourist areas are like on the ground, and the real distinction between South Sinai and North Sinai.",
    body: [
      p(
        "Millions of tourists visit Egypt every year, and the country's main destinations — Cairo, Giza, Luxor, Aswan, and the Red Sea coast — operate normally, with a visible tourist police presence at every major site. That's the honest baseline before getting into specifics."
      ),
      h2("What the Advisories Actually Say"),
      p(
        "Egypt as a whole is generally rated as a country requiring increased caution, similar to many popular travel destinations, rather than a country to avoid. Within that, some specific areas — Northern and Middle Sinai, and stretches near the western border with Libya — carry stronger advisories against travel. Cairo, Giza, Luxor, Aswan, Alexandria, and the Red Sea resort towns are not part of those warnings."
      ),
      h2("The Sinai Confusion, Cleared Up"),
      p(
        "This is the detail that trips people up most. \"Sinai\" gets treated online as one place, but it isn't. South Sinai — Sharm El Sheikh, Dahab, Nuweiba, St. Catherine, and Mount Sinai — is the heavily touristed, resort-developed part of the peninsula, and it operates normally. The areas under stronger advisories sit in the north of the Sinai peninsula, a different region entirely, far from the coastal towns visitors actually go to. Confusing the two leads a lot of people to skip destinations that are, in practice, perfectly normal to visit."
      ),
      h2("What Actually Happens Day to Day"),
      p(
        "The realistic risk most tourists encounter isn't danger — it's persistent vendors, occasional overcharging, and the ordinary hassle of a busy tourist market. Violent crime against visitors is rare. Traveling with a licensed guide, sticking to your itinerary's arranged transport rather than unmarked taxis, and keeping copies of your passport and visa are the same sensible habits that apply in any major destination."
      ),
      faq([
        {
          question: "Is it safe to travel to Cairo?",
          answer: "Yes. Cairo and Giza are Egypt's most visited region and operate normally for tourism, with visible security at major sites.",
        },
        {
          question: "Is Sharm El Sheikh safe?",
          answer: "Yes. Sharm sits in South Sinai, a well-developed resort region distinct from the parts of Sinai under travel advisories.",
        },
        {
          question: "What part of Egypt should I avoid?",
          answer:
            "Northern and Middle Sinai, and areas near the western border with Libya, carry stronger travel advisories. These are not part of any standard tourist itinerary.",
        },
      ]),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "how-much-does-a-trip-to-egypt-cost",
    title: "How Much Does a Trip to Egypt Actually Cost?",
    category: "Travel Guides",
    tags: ["Trip Planning", "Budgeting"],
    author: editorialTeam,
    excerpt:
      "A realistic breakdown of what a budget, mid-range, and luxury Egypt trip actually costs — accommodation, Nile cruises, and daily spending, by the numbers.",
    imageTone: "nile",
    image: "/photos/pexels-38944955.jpg",
    publishedAt: "2026-08-23T00:00:00.000Z",
    destinations: ["Cairo", "Luxor", "Aswan"],
    primaryKeyword: "cost of a trip to egypt",
    secondaryKeywords: ["egypt travel budget", "how much does a nile cruise cost", "egypt trip cost per day"],
    relatedTours: toursBySlug("10-day-private-luxurious-trip", "8-day-essential-egypt-nile-cruise", "4-day-nile-cruise-luxor-aswan"),
    seoTitle: "How Much Does a Trip to Egypt Cost? A Realistic Budget Breakdown",
    seoDescription:
      "What a budget, mid-range, and luxury Egypt trip actually costs per day — plus how Nile cruise and accommodation pricing scales with comfort.",
    body: [
      p(
        "Egypt can be genuinely affordable or genuinely luxurious, and the honest answer to \"how much will this cost\" depends entirely on which end of that range you're aiming for. Here's roughly how the numbers break down."
      ),
      h2("Three Rough Tiers"),
      p(
        "Budget travel — hostels or basic hotels, local food, public transport — runs somewhere around $35 to $55 a day, not including international flights. Mid-range travel, with comfortable three- or four-star hotels, private transport for day tours, and a mix of local and touristy restaurants, lands closer to $80 to $150 a day. Luxury travel, with five-star hotels, private guides throughout, and premium Nile cruise cabins, starts around $300 a day and climbs from there."
      ),
      h2("Where the Big Costs Sit"),
      p(
        "Accommodation is the widest range of any category — a basic double room can run $10 to $40 a night, while five-star Nile-view or desert-lodge properties run $250 to $600 or more. A multi-night cruise between Luxor and Aswan follows a similar spread: standard cruise cabins on a 3- or 4-night sailing often run somewhere in the $150 to $250 range per person, while a luxury dahabiya sailing or a high-end cabin can run into the high hundreds or beyond, per night."
      ),
      callout(
        "These figures are general market context, not what we charge — every Egypt Eye itinerary is quoted individually once we know your dates, group size, and the level of comfort you want, so you always know the actual number before booking.",
        { tone: "Info", title: "A Note on Our Own Pricing" }
      ),
      h2("A Sample Ten-Day Trip"),
      p(
        "A well-paced ten-day mid-range trip covering Cairo, Giza, and a Luxor-to-Aswan cruise typically lands somewhere between $2,500 and $4,000 per person, including domestic flights or trains, guided touring, and most meals — excluding the international flight to Egypt itself."
      ),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "what-to-pack-for-egypt",
    title: "What to Pack for Egypt: A Practical Packing Guide",
    category: "Travel Guides",
    tags: ["Trip Planning", "Packing"],
    author: editorialTeam,
    excerpt:
      "What actually earns a spot in your suitcase for an Egypt trip — from sun protection and modest layers to the small items first-time visitors forget.",
    imageTone: "desert",
    image: "/photos/pexels-16726602.jpg",
    publishedAt: "2026-08-23T00:00:00.000Z",
    destinations: ["Cairo", "Luxor", "Aswan"],
    primaryKeyword: "what to pack for egypt",
    secondaryKeywords: ["egypt packing list", "what to wear in egypt", "egypt travel essentials"],
    relatedTours: toursBySlug("6-day-cairo-giza-luxor", "8-day-essential-egypt-nile-cruise"),
    seoTitle: "What to Pack for Egypt: A Practical, Season-Aware Packing List",
    seoDescription:
      "A realistic Egypt packing list — clothing, sun protection, and the small essentials that make a difference on a walking-heavy, sun-heavy trip.",
    body: [
      p(
        "Egypt is hot, dusty, and full of open-air sites with very little shade, which should shape most of what goes in your suitcase more than anything else."
      ),
      h2("Clothing"),
      p(
        "Loose, breathable layers in light colors work far better than anything tight or dark. Covered shoulders and knees are comfortable in the heat and also appropriate at religious sites and outside resort areas — a lightweight long-sleeve shirt and loose trousers or a maxi skirt do double duty for sun protection and modesty. Bring a warm layer too: desert nights, and Nile-side mornings from November through February, get genuinely cool."
      ),
      h2("Footwear and Sun Protection"),
      ...bullets([
        "Comfortable, broken-in walking shoes — temple floors are uneven stone, not paved paths",
        "A wide-brimmed hat and UV-protective sunglasses",
        "High-SPF sunscreen, reapplied more than you'd expect — the desert sun is strong even in cooler months",
        "A reusable water bottle; dehydration is the most common thing that ruins an otherwise good day of touring",
      ]),
      h2("Small Essentials Worth Not Forgetting"),
      p(
        "A portable phone charger or power bank, a downloaded copy of your e-visa, a few small-denomination local currency notes for tipping, and any prescription medication in its original packaging. If you're visiting between June and August, pack lighter and looser than you think you need to — temperatures inland regularly pass 40°C (104°F)."
      ),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "mistakes-first-time-egypt-travelers-make",
    title: "Common Mistakes First-Time Egypt Travelers Make",
    category: "Travel Guides",
    tags: ["Trip Planning", "First-Time Visitors"],
    author: editorialTeam,
    excerpt:
      "The planning mistakes that come up again and again on a first Egypt trip — and how to sidestep each one before you book.",
    imageTone: "giza",
    image: "/photos/pexels-35549794.jpg",
    publishedAt: "2026-08-23T00:00:00.000Z",
    destinations: ["Cairo", "Luxor", "Aswan"],
    primaryKeyword: "egypt travel mistakes",
    secondaryKeywords: ["egypt travel tips", "first time in egypt mistakes", "egypt trip planning tips"],
    relatedTours: toursBySlug("6-day-cairo-giza-luxor", "10-day-private-luxurious-trip"),
    seoTitle: "Common Mistakes First-Time Egypt Travelers Make (and How to Avoid Them)",
    seoDescription:
      "The planning mistakes that trip up first-time Egypt visitors most often — rushed itineraries, midday touring, and underpricing the Nile Valley.",
    body: [
      p(
        "Egypt rewards a bit of planning more than most destinations, largely because its major sites are spread across a long stretch of the country. Most first-trip regrets trace back to a handful of avoidable decisions."
      ),
      h2("Treating Luxor as a Day Trip"),
      p(
        "Luxor holds more history than most countries — Karnak, Luxor Temple, the Valley of the Kings, Hatshepsut's temple — and trying to see it in a single rushed day from Cairo means seeing almost none of it properly. Two to three days is the realistic minimum."
      ),
      h2("Touring Through the Hottest Hours"),
      p(
        "Sites open early specifically so visitors can be through the major stops before midday heat sets in, yet a surprising number of first-time itineraries start late and end up touring at the worst possible hour. An early start, especially outside the cooler months, changes the whole day."
      ),
      h2("Underestimating Distances"),
      p(
        "Cairo to Luxor is roughly the distance of a long domestic flight, not a short drive — Egypt is a big country, and its main sites sit hours apart by road or a short flight apart by air. Building an itinerary around realistic travel times, rather than a wish list of every site in the country, makes for a far better trip."
      ),
      h2("Booking the Cheapest Operator Without Checking Credentials"),
      p(
        "Price alone doesn't tell you much about a tour operator. A licensed guide, a roadworthy vehicle, and transparent inclusions matter more than shaving a small amount off the price — especially on longer, multi-day itineraries where a poor guide affects every single day, not just one."
      ),
      callout(
        "The single highest-leverage fix for most of these is booking private rather than a rigid group schedule — it gives you room to start early, linger, or adjust without twenty other people's preferences in the way."
      ),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "memphis-saqqara-dahshur-egypts-first-pyramids",
    title: "Memphis, Saqqara, and Dahshur: Egypt's Original Pyramid Fields",
    category: "Ancient Egypt",
    tags: ["Cairo", "Ancient Egypt", "Pyramids"],
    author: editorialTeam,
    excerpt:
      "Before Giza, there was Saqqara — Egypt's first pyramid, its oldest necropolis, and a day trip that draws a fraction of the crowd for a comparable amount of history.",
    imageTone: "giza",
    image: "/photos/pexels-18291196.jpg",
    publishedAt: "2026-08-23T00:00:00.000Z",
    destinations: ["Cairo", "Saqqara", "Dahshur"],
    primaryKeyword: "saqqara and dahshur",
    secondaryKeywords: ["step pyramid of djoser", "bent pyramid dahshur", "memphis egypt ancient capital", "saqqara vs giza"],
    relatedTours: toursBySlug("memphis-saqqara-dahshur-tour", "3-day-cairo-giza"),
    seoTitle: "Memphis, Saqqara, and Dahshur: Egypt's First Pyramid Fields",
    seoDescription:
      "Before Giza, Egypt built its first pyramids at Saqqara and Dahshur. What's there, why it matters, and why it's worth a day beyond the Giza plateau.",
    body: [
      p(
        "Giza gets the crowds, but the pyramids there weren't Egypt's first. That distinction belongs to Saqqara, about half an hour south, where the earliest large-scale stone monument in the world still stands."
      ),
      h2("Saqqara and the Step Pyramid"),
      p(
        "The Step Pyramid of Djoser, built around 2670 BCE for Egypt's Third Dynasty, predates Giza's Great Pyramid by roughly a century and represents the first time Egyptians built primarily in stone rather than mudbrick at this scale. Its six stacked stone tiers, designed by the architect Imhotep, mark the actual starting point of pyramid-building as a tradition — everything at Giza follows from what was worked out here first."
      ),
      h2("Dahshur's Two Experiments"),
      p(
        "A short drive from Saqqara, Dahshur holds the Bent Pyramid and the Red Pyramid, both built under the pharaoh Sneferu. The Bent Pyramid changes angle partway up — a visible record of ancient builders adjusting their approach mid-construction — while the Red Pyramid, built afterward with lessons learned, is considered the first successful true smooth-sided pyramid in Egypt, predating Giza's Great Pyramid."
      ),
      h2("Memphis: The Capital Itself"),
      p(
        "Memphis was ancient Egypt's capital for much of the Old Kingdom, and while little of the city itself survives above ground, its open-air museum holds a colossal fallen statue of Ramesses II and an alabaster sphinx, giving a sense of the city's scale even in fragments."
      ),
      callout(
        "This whole area draws far fewer visitors than Giza, which means more room to actually look at what you're seeing — including, at Saqqara, some of the best-preserved painted tomb reliefs anywhere near Cairo.",
        { title: "Why It's Worth the Extra Day" }
      ),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "islamic-and-coptic-cairo-walking-guide",
    title: "Islamic and Coptic Cairo: A Walking Guide to Old Cairo",
    category: "Travel Guides",
    tags: ["Cairo", "Culture", "Architecture"],
    author: editorialTeam,
    excerpt:
      "Beyond the Pyramids, Cairo holds a thousand years of Islamic architecture and some of Christianity's oldest surviving churches — both walkable, both often skipped.",
    imageTone: "giza",
    image: "/photos/pexels-15349855.jpg",
    publishedAt: "2026-08-23T00:00:00.000Z",
    destinations: ["Cairo"],
    primaryKeyword: "islamic and coptic cairo",
    secondaryKeywords: ["old cairo walking tour", "khan el khalili", "hanging church cairo", "cairo citadel"],
    relatedTours: toursBySlug("islamic-coptic-cairo-walking-tour", "3-day-cairo-giza"),
    seoTitle: "Islamic and Coptic Cairo: A Walking Guide to Old Cairo",
    seoDescription:
      "Cairo's Islamic and Coptic quarters hold a thousand years of architecture and some of the oldest churches in Christianity — a walkable guide to both.",
    body: [
      p(
        "Most first-time visitors spend their Cairo time entirely at Giza and the new museum, which means skipping a part of the city that tells a completely different story — medieval Islamic Cairo and, a short distance away, Coptic Cairo's cluster of ancient churches."
      ),
      h2("Islamic Cairo"),
      p(
        "Centered around the Citadel of Saladin and the sprawling market of Khan el-Khalili, this district holds one of the largest collections of medieval Islamic architecture anywhere in the world — mosques, madrasas, and mausoleums built across nearly a thousand years, many still in active use. The Citadel itself, with the Mohamed Ali Mosque's Ottoman-style domes overlooking the city, is the natural anchor point for a walk through the area."
      ),
      h2("Coptic Cairo"),
      p(
        "A few kilometers south, Coptic Cairo is a walled, largely pedestrian quarter holding some of the oldest churches in Christianity, including the Hanging Church, suspended over the gatehouse of a Roman fortress, and the Church of Saints Sergius and Bacchus, built over a site associated with the Holy Family's traditional stay in Egypt. The Ben Ezra Synagogue, one of Cairo's oldest, sits in the same small area."
      ),
      h2("Walking Both in One Day"),
      p(
        "The two districts are close enough by car to combine into a single, full day — Islamic Cairo in the morning, when the light through Khan el-Khalili's covered alleys is best, and Coptic Cairo in the afternoon, when its narrow lanes are quieter. A knowledgeable local guide makes a real difference here, since much of what makes both districts interesting isn't obvious from the architecture alone."
      ),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "cairo-nile-dinner-cruise-what-to-expect",
    title: "What to Expect on a Cairo Nile Dinner Cruise",
    category: "Travel Guides",
    tags: ["Cairo", "Nile"],
    author: editorialTeam,
    excerpt:
      "A dinner cruise down the Nile through central Cairo — what the evening actually involves, and whether it's worth building into your itinerary.",
    imageTone: "nile",
    image: "/photos/pexels-5996471.jpg",
    publishedAt: "2026-08-23T00:00:00.000Z",
    destinations: ["Cairo"],
    primaryKeyword: "cairo nile dinner cruise",
    secondaryKeywords: ["nile dinner cruise cairo", "cairo night cruise", "cairo evening things to do"],
    relatedTours: toursBySlug("cairo-nile-dinner-cruise-night-tour"),
    seoTitle: "What to Expect on a Cairo Nile Dinner Cruise",
    seoDescription:
      "A Cairo Nile dinner cruise, explained plainly — the route, the format of the evening, and whether it's worth adding to a Cairo itinerary.",
    body: [
      p(
        "After a full day of touring temples and museums in the heat, a Cairo Nile dinner cruise is a genuinely different kind of evening — a boat, dinner, and the city's skyline lit up along the water, at a pace that asks nothing of you."
      ),
      h2("What the Evening Actually Involves"),
      p(
        "A typical dinner cruise runs two to three hours, departing in the early evening and covering a stretch of the Nile through central Cairo, passing under its bridges and past riverside landmarks lit up after dark. Dinner is usually a multi-course buffet with a mix of Egyptian and international dishes, served at a table with a river view, and most cruises include some form of live entertainment — often a Tanoura dance performance, a distinctly Egyptian spinning folk dance."
      ),
      h2("Is It Worth Adding to Your Itinerary?"),
      p(
        "It's a low-effort, high-comfort way to close out a Cairo day, particularly for travelers who've spent the daylight hours walking through Giza or Islamic Cairo and want an evening that doesn't ask for more walking. It's not a substitute for the multi-day Nile cruises further south between Luxor and Aswan, which are a different experience entirely — this is a single evening in the capital, not a journey along the river."
      ),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "aswan-travel-guide",
    title: "Aswan Travel Guide: Egypt's Nubian Nile",
    category: "Travel Guides",
    tags: ["Aswan", "Nile", "Nubian Culture"],
    author: editorialTeam,
    excerpt:
      "Aswan feels different from the rest of Egypt — Nubian rather than Egyptian in character, quieter, and built around the most scenic stretch of the Nile. Here's what to see and how much time it deserves.",
    imageTone: "nile",
    image: "/photos/pexels-25070513.jpg",
    publishedAt: "2026-08-23T00:00:00.000Z",
    destinations: ["Aswan"],
    badge: "editorsPick",
    primaryKeyword: "aswan travel guide",
    secondaryKeywords: ["things to do in aswan", "aswan egypt", "philae temple", "aswan high dam"],
    relatedTours: toursBySlug("aswan-abu-simbel-tour", "aswan-nubian-village-philae-tour", "8-day-essential-egypt-nile-cruise"),
    seoTitle: "Aswan Travel Guide: What to See in Egypt's Nubian South",
    seoDescription:
      "Aswan's Nubian villages, Philae Temple, and the High Dam — a practical guide to Egypt's southernmost major city and its most scenic stretch of Nile.",
    body: [
      p(
        "Aswan sits at Egypt's southern edge, where the Nile narrows between granite outcrops and Nubian villages line the riverbanks in shades of blue and ochre. It has a different rhythm from Cairo or even Luxor — slower, and shaped as much by Nubian culture as by ancient Egyptian history."
      ),
      h2("Philae Temple"),
      p(
        "Dedicated to the goddess Isis, Philae was moved stone by stone to its current island location in the 1960s and 70s to save it from the rising waters of the Aswan High Dam — an engineering effort nearly as remarkable as the temple itself. Reached by a short boat ride, it's one of the most photogenic temples on the Nile, particularly in late afternoon light."
      ),
      h2("The Unfinished Obelisk"),
      p(
        "Still attached to the bedrock it was carved from, this abandoned obelisk — cracked during construction thousands of years ago — is one of the clearest windows anywhere into how ancient Egyptians actually quarried stone, tool marks and all."
      ),
      h2("A Nubian Village by Boat"),
      p(
        "A felucca or motorboat trip to a Nubian village on Elephantine Island or the west bank is one of Aswan's most distinctive experiences — colorful houses, a different language and cuisine from the rest of Egypt, and a slower pace that contrasts with the temple-hopping further north."
      ),
      h2("How Much Time to Give Aswan"),
      p(
        "Two days covers Philae, the Unfinished Obelisk, and a Nubian village visit comfortably. It's also the natural jumping-off point for a day trip to Abu Simbel, which is worth its own extra day if your schedule allows it."
      ),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "is-abu-simbel-worth-the-trip",
    title: "Is Abu Simbel Worth the Trip From Aswan?",
    category: "Travel Guides",
    tags: ["Aswan", "Abu Simbel", "Ancient Egypt"],
    author: editorialTeam,
    excerpt:
      "Abu Simbel sits far south of Aswan, adds a long day to your itinerary, and is one of the most striking monuments in Egypt. Here's what the trip actually involves.",
    imageTone: "nile",
    image: "/photos/pexels-4606523.jpg",
    publishedAt: "2026-08-23T00:00:00.000Z",
    destinations: ["Aswan", "Abu Simbel"],
    primaryKeyword: "is abu simbel worth it",
    secondaryKeywords: ["abu simbel day trip", "abu simbel from aswan", "ramesses ii temple"],
    relatedTours: toursBySlug("aswan-abu-simbel-tour", "lake-nasser-cruise-aswan-abu-simbel"),
    seoTitle: "Is Abu Simbel Worth the Trip From Aswan? An Honest Answer",
    seoDescription:
      "Abu Simbel adds a long day to an Aswan itinerary. Here's what the journey involves, what you'll actually see, and whether it's worth the extra time.",
    body: [
      p(
        "Abu Simbel sits roughly three hours south of Aswan, close to the Sudanese border, which makes it the single biggest time commitment of any major site in Egypt. It's also, for most visitors who make the trip, unambiguously worth it."
      ),
      h2("What's Actually There"),
      p(
        "Ramesses II built the Great Temple's facade with four colossal seated statues of himself, each around 20 meters tall, cut directly into a sandstone cliff — built partly as a monument to his own reign and partly as a statement of Egyptian power at the southern frontier. Beside it, the smaller Temple of Hathor honors his queen, Nefertari, with statues of the royal couple standing at equal height on the facade — an unusual gesture in Egyptian royal art."
      ),
      h2("The Relocation Story"),
      p(
        "Like Philae, Abu Simbel would have been lost to the Aswan High Dam's floodwaters if UNESCO hadn't led an enormous international effort in the 1960s to cut both temples into large blocks and reassemble them on higher ground, inside an artificial mountain built to replicate their original setting. It remains one of the largest archaeological rescue operations ever undertaken."
      ),
      h2("How to Actually Get There"),
      p(
        "Most visitors go by road in an early-morning convoy from Aswan, arriving by mid-morning and returning by early evening — a long day, but a single one. A smaller number fly directly from Aswan, cutting the travel time significantly at additional cost. Either way, it's typically done as a long day trip rather than an overnight stay."
      ),
      faq([
        {
          question: "How far is Abu Simbel from Aswan?",
          answer: "Roughly 280 kilometers, about a three-hour drive each way, or a short flight.",
        },
        {
          question: "Can you visit Abu Simbel in one day?",
          answer: "Yes — most visitors see it as a long day trip from Aswan, departing early morning and returning by evening.",
        },
        {
          question: "Is Abu Simbel worth the long drive?",
          answer:
            "For most travelers, yes. The scale of the facade and the story of its relocation are unlike anything else in Egypt, even accounting for the travel time.",
        },
      ]),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "philae-temple-aswan-high-dam-guide",
    title: "Philae Temple and the Aswan High Dam: A Practical Guide",
    category: "Travel Guides",
    tags: ["Aswan", "Ancient Egypt", "Engineering"],
    author: editorialTeam,
    excerpt:
      "Two very different kinds of achievement sit a short drive apart in Aswan — a temple to Isis moved to save it from the water, and the dam that made moving it necessary.",
    imageTone: "nile",
    image: "/photos/pexels-16535879.jpg",
    publishedAt: "2026-08-23T00:00:00.000Z",
    destinations: ["Aswan"],
    primaryKeyword: "philae temple aswan",
    secondaryKeywords: ["philae temple", "aswan high dam facts", "temple of isis aswan"],
    relatedTours: toursBySlug("aswan-nubian-village-philae-tour", "kalabsha-temple-nubian-museum-tour"),
    seoTitle: "Philae Temple and the Aswan High Dam: A Practical Visitor's Guide",
    seoDescription:
      "Philae Temple and the Aswan High Dam sit close together and tell connected stories. What to see, how they relate, and how to visit both in a day.",
    body: [
      p(
        "Philae Temple and the Aswan High Dam are usually visited within the same day, and understanding how they're connected makes both sites more interesting."
      ),
      h2("Philae Temple"),
      p(
        "Built primarily during the Ptolemaic period and dedicated to Isis, Philae was one of the last places in Egypt where the ancient religion was actively practiced, continuing well into the Christian era before finally being closed in the sixth century CE. Reaching the temple today means a short boat ride to the island of Agilkia, where the entire complex was rebuilt after being moved."
      ),
      h2("Why It Had to Move"),
      p(
        "The original Philae sat on an island that would have been permanently submerged by the reservoir created behind the Aswan High Dam. Between 1972 and 1980, an international UNESCO-led project dismantled the temple into more than 40,000 numbered blocks and reassembled it on the nearby island of Agilkia, at a higher elevation — a project that saved the temple entirely, though the original island it once stood on is gone for good."
      ),
      h2("The Aswan High Dam"),
      p(
        "Completed in 1970, the High Dam controls the Nile's seasonal flooding and generates a large share of Egypt's electricity, but it also created Lake Nasser, one of the largest reservoirs in the world, submerging a stretch of ancient Nubia and forcing the relocation of Philae, Abu Simbel, and other monuments. Visitors can see the dam itself and the vast lake it created, though the technical interior isn't open to tourists."
      ),
      h2("Visiting Both"),
      p(
        "Most Aswan itineraries pair a morning at the High Dam viewpoint with an early-afternoon visit to Philae, when the light on the temple's reliefs is at its best, followed by the Unfinished Obelisk on the way back into town."
      ),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "lake-nasser-cruise-guide",
    title: "Cruising Lake Nasser: Egypt's Quietest Ancient Route",
    category: "Travel Guides",
    tags: ["Aswan", "Lake Nasser", "Nile"],
    author: editorialTeam,
    excerpt:
      "A slower, far less crowded alternative to the Luxor-Aswan Nile cruise — sailing Lake Nasser between temples that were moved here to escape the water that now surrounds them.",
    imageTone: "nile",
    image: "/photos/pexels-34137936.jpg",
    publishedAt: "2026-08-23T00:00:00.000Z",
    destinations: ["Aswan", "Lake Nasser", "Abu Simbel"],
    primaryKeyword: "lake nasser cruise",
    secondaryKeywords: ["lake nasser cruise abu simbel", "lake nasser egypt", "aswan to abu simbel by boat"],
    relatedTours: toursBySlug("lake-nasser-cruise-aswan-abu-simbel", "aswan-abu-simbel-tour"),
    seoTitle: "Cruising Lake Nasser: A Guide to Egypt's Quietest Ancient Route",
    seoDescription:
      "A Lake Nasser cruise between Aswan and Abu Simbel is a slower, far less crowded alternative to the standard Luxor-Aswan Nile cruise. Here's what it involves.",
    body: [
      p(
        "Almost everyone who cruises Egypt does it between Luxor and Aswan. A much smaller number sail Lake Nasser instead — the vast reservoir south of the Aswan High Dam, where a handful of small ships cover a route most visitors don't even know exists."
      ),
      h2("What Makes It Different"),
      p(
        "Lake Nasser cruises run only a few sailings a week, on ships that carry a fraction of the passengers of a standard Nile vessel, through a landscape with almost no other tourist traffic — open water and desert shoreline rather than the towns and farmland that line the Nile further north. The temples along the route, including Kalabsha, Amada, and Wadi es-Sebua, were all relocated here for the same reason as Philae and Abu Simbel: to save them from the dam's floodwaters."
      ),
      h2("Abu Simbel by Water"),
      p(
        "The route's centerpiece is arriving at Abu Simbel by boat rather than by road convoy — a genuinely different way to approach the temple's facade, without the coach-park crowds that build up around the midday road arrivals."
      ),
      h2("Who It Suits"),
      p(
        "This is a trip for travelers who've already done a standard Nile cruise, or who specifically want a quieter, slower pace over ticking off maximum sites. It's a smaller, less frequent product than the Luxor-Aswan route, so it needs to be booked further ahead."
      ),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "dendera-and-abydos-temples-guide",
    title: "Dendera and Abydos: The Temples Most Visitors Skip",
    category: "Ancient Egypt",
    tags: ["Luxor", "Ancient Egypt", "Temples"],
    author: editorialTeam,
    excerpt:
      "North of Luxor, Dendera and Abydos hold some of the best-preserved temple ceilings and reliefs in Egypt — and draw a fraction of the visitors Karnak does.",
    imageTone: "luxor",
    image: "/photos/pexels-15131543.jpg",
    publishedAt: "2026-08-23T00:00:00.000Z",
    destinations: ["Dendera", "Abydos"],
    primaryKeyword: "dendera and abydos",
    secondaryKeywords: ["temple of hathor dendera", "temple of seti i abydos", "dendera temple complex"],
    relatedTours: toursBySlug("dendera-abydos-day-tour"),
    seoTitle: "Dendera and Abydos: The Egypt Temples Most Visitors Skip",
    seoDescription:
      "North of Luxor, Dendera and Abydos hold exceptionally well-preserved reliefs and ceilings, with far fewer visitors than Karnak. What's there and why it's worth the day.",
    body: [
      p(
        "Most Luxor itineraries stop at Karnak, Luxor Temple, and the West Bank tombs, and never make it to two of the best-preserved temple complexes in Egypt, both a couple of hours north."
      ),
      h2("Dendera's Temple of Hathor"),
      p(
        "The Temple of Hathor at Dendera is remarkable mostly for what's survived intact — its roof, largely complete, protected the interior ceiling reliefs and painted astronomical scenes from the erosion that's stripped color from most other temples in Egypt. The famous Dendera zodiac ceiling relief (the original is now in the Louvre, with a replica in place) is one of the clearest surviving records of how ancient Egyptians mapped the night sky."
      ),
      h2("Abydos's Temple of Seti I"),
      p(
        "Further north, Abydos was one of ancient Egypt's most sacred sites, believed to be the burial place of the god Osiris, and its Temple of Seti I holds some of the finest carved reliefs anywhere in Egypt — cut with a precision and subtlety that's rare even by the high standard of New Kingdom temple art. The temple's king list, a carved record of pharaohs recognized by Seti I, is one of the most important chronological sources historians have for ancient Egyptian history."
      ),
      h2("Visiting Both in a Day"),
      p(
        "Dendera and Abydos are usually combined into a single long day trip from Luxor, since both sit in the same general direction north of the city. It's a full day of driving relative to a standard in-Luxor itinerary, but for travelers who've already covered Karnak and the Valley of the Kings and want to go further, it's one of the best-value additions available."
      ),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "edfu-and-kom-ombo-temples-guide",
    title: "Edfu and Kom Ombo: The Temples Between Luxor and Aswan",
    category: "Ancient Egypt",
    tags: ["Luxor", "Aswan", "Ancient Egypt", "Temples"],
    author: editorialTeam,
    excerpt:
      "Between Luxor and Aswan sit two of Egypt's best-preserved Ptolemaic temples — one dedicated to the falcon god Horus, the other split between a crocodile god and a falcon god.",
    imageTone: "nile",
    image: "/photos/pexels-15188089.jpg",
    publishedAt: "2026-08-23T00:00:00.000Z",
    destinations: ["Edfu", "Kom Ombo"],
    primaryKeyword: "edfu and kom ombo temples",
    secondaryKeywords: ["temple of horus edfu", "kom ombo temple", "edfu temple egypt"],
    relatedTours: toursBySlug("edfu-kom-ombo-day-tour", "4-day-nile-cruise-luxor-aswan"),
    seoTitle: "Edfu and Kom Ombo: The Temples Between Luxor and Aswan",
    seoDescription:
      "Edfu's Temple of Horus and the twin temple at Kom Ombo are among Egypt's best-preserved Ptolemaic monuments. What to expect at both.",
    body: [
      p(
        "Any Nile cruise between Luxor and Aswan stops at Edfu and Kom Ombo along the way, and both are worth far more attention than their status as \"cruise stops\" suggests."
      ),
      h2("The Temple of Horus at Edfu"),
      p(
        "Built during the Ptolemaic period, the Temple of Horus at Edfu is one of the best-preserved temples anywhere in Egypt, largely because it was buried under desert sand for centuries before excavation, which protected it from the weathering that damaged more exposed sites. Its pylon entrance, at over 30 meters tall, is the largest and most complete of its kind still standing."
      ),
      h2("Kom Ombo's Unusual Double Temple"),
      p(
        "Kom Ombo is unique among Egyptian temples for its symmetrical double design — one half dedicated to Sobek, the crocodile god, and the other to Horus, each with its own matching entrance, hall, and sanctuary running side by side. A small on-site museum displays mummified crocodiles found near the temple, connected to Sobek worship at the site."
      ),
      h2("How They Fit Into a Nile Itinerary"),
      p(
        "Both temples are usually visited as scheduled stops on a Luxor-Aswan cruise, typically Kom Ombo in the late afternoon or evening — when the light on its riverside setting is especially good — and Edfu the following morning, often reached from the boat by a short horse-drawn carriage ride into town."
      ),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "what-a-nile-cruise-luxor-aswan-actually-looks-like",
    title: "What a Nile Cruise Between Luxor and Aswan Actually Looks Like",
    category: "Travel Guides",
    tags: ["Nile", "Luxor", "Aswan"],
    author: editorialTeam,
    excerpt:
      "Day by day, what a standard Nile cruise between Luxor and Aswan actually involves — the stops, the pace, and how a 4-night sailing differs from a longer one.",
    imageTone: "nile",
    image: "/photos/pexels-31607973.jpg",
    publishedAt: "2026-08-23T00:00:00.000Z",
    destinations: ["Luxor", "Aswan"],
    primaryKeyword: "nile cruise luxor to aswan",
    secondaryKeywords: ["4 day nile cruise", "nile cruise itinerary", "luxor aswan cruise what to expect"],
    relatedTours: toursBySlug("4-day-nile-cruise-luxor-aswan", "7-night-nile-cruise-luxor-aswan", "8-day-essential-egypt-nile-cruise"),
    seoTitle: "What a Nile Cruise Between Luxor and Aswan Actually Looks Like",
    seoDescription:
      "A day-by-day look at what a standard Luxor-to-Aswan Nile cruise actually involves — the stops, the pace, and what changes between a 4-night and longer sailing.",
    body: [
      p(
        "\"Nile cruise\" covers a specific, well-established route — Luxor to Aswan or the reverse — and once you know the shape of it, choosing between a shorter and longer sailing gets much easier."
      ),
      h2("The Standard Route"),
      p(
        "A typical cruise begins in Luxor with Karnak and Luxor Temple, sails south with a stop at Edfu's Temple of Horus, continues to Kom Ombo's double temple, and ends in Aswan with time for Philae Temple and, often, an optional add-on day to Abu Simbel. Each stop is a scheduled shore excursion — the ship sails, mostly overnight or during less scenic stretches, while touring happens on land during the day."
      ),
      h2("4 Nights vs. a Longer Sailing"),
      p(
        "A 4-night cruise covers the full core route — Luxor, Edfu, Kom Ombo, Aswan — at a comfortable but efficient pace, and suits travelers with a week or less total in Egypt. A longer sailing, a week or more, adds more time at anchor in Luxor and Aswan themselves, room for the West Bank's full tomb circuit without rushing, and sometimes an extra stop or two along quieter stretches of river — better suited to travelers who'd rather slow down than see more sites in the same number of days."
      ),
      h2("What a Typical Day Looks Like"),
      p(
        "Mornings usually start early with a shore excursion before the heat builds, followed by lunch back on board while the ship is underway, an afternoon either at another site or resting on deck, and dinner on the ship in the evening — often with some form of entertainment. It's a genuinely different pace from a land-based itinerary, with far less packing and unpacking and far more time actually on the water."
      ),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "hurghada-vs-sharm-el-sheikh-vs-dahab",
    title: "Hurghada vs. Sharm El Sheikh vs. Dahab: Which Red Sea Town Fits You?",
    category: "Travel Guides",
    tags: ["Red Sea", "Diving", "Trip Planning"],
    author: editorialTeam,
    excerpt:
      "Egypt's three main Red Sea towns aren't interchangeable — one's family-friendly and mainland, one's polished resort territory, and one's a laid-back diving village. Here's the real difference.",
    imageTone: "redsea",
    image: "/photos/pexels-36879915.jpg",
    publishedAt: "2026-08-23T00:00:00.000Z",
    destinations: ["Hurghada", "Sharm El Sheikh", "Dahab", "Red Sea"],
    primaryKeyword: "hurghada vs sharm el sheikh vs dahab",
    secondaryKeywords: ["best red sea town egypt", "sharm el sheikh vs hurghada", "dahab vs sharm"],
    relatedTours: toursBySlug("hurghada-red-sea-diving-snorkeling", "ras-mohammed-snorkeling-tour", "dahab-blue-hole-three-pools-tour"),
    seoTitle: "Hurghada vs. Sharm El Sheikh vs. Dahab: Which Red Sea Town Fits You?",
    seoDescription:
      "Hurghada, Sharm El Sheikh, and Dahab cover the same Red Sea but feel completely different. A practical comparison to help pick the right one.",
    body: [
      p("All three sit on the Red Sea, all three offer excellent diving and snorkeling, and beyond that, they're genuinely different kinds of places."),
      h2("Hurghada"),
      p(
        "On the Egyptian mainland rather than the Sinai peninsula, Hurghada is the most family-friendly and generally the most affordable of the three, often running 10 to 30 percent cheaper than Sharm for comparable resorts. It's a bigger, livelier town with a wide range of hotel styles and a well-developed selection of boat-based diving and snorkeling trips."
      ),
      h2("Sharm El Sheikh"),
      p(
        "Sharm, on the southern tip of the Sinai peninsula, tends toward larger, more polished resort properties and is generally considered to have the best boat-accessible diving of the three, with easy access to Ras Mohammed National Park and the wreck-diving sites of the Strait of Tiran."
      ),
      h2("Dahab"),
      p(
        "About an hour north of Sharm, Dahab has a completely different character — laid-back, low-rise, and built around shore diving rather than resort life. Its biggest draw is walk-in access to world-famous sites like the Blue Hole, reachable without a boat, which makes it the pick for travelers who want a slower pace and easy, frequent diving over five-star amenities."
      ),
      h2("So Which One?"),
      p(
        "Traveling with family and want the most straightforward, well-rounded resort experience — Hurghada. Want the best all-around diving with polished resort comfort — Sharm. Want a quieter, more bohemian base built specifically around diving — Dahab. All three are part of South Sinai or the Red Sea coast's normally functioning tourist areas, not the parts of the region under any travel advisory."
      ),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "is-scuba-diving-in-egypt-worth-it",
    title: "Is Scuba Diving in the Red Sea Worth It?",
    category: "Travel Guides",
    tags: ["Red Sea", "Diving"],
    author: editorialTeam,
    excerpt:
      "The Red Sea is consistently ranked among the world's best diving destinations. Here's what actually makes it worth the trip, and what a first-timer should know.",
    imageTone: "redsea",
    image: "/photos/pexels-1540108.jpg",
    publishedAt: "2026-08-23T00:00:00.000Z",
    destinations: ["Red Sea", "Sinai"],
    primaryKeyword: "red sea diving worth it",
    secondaryKeywords: ["egypt scuba diving", "red sea diving for beginners", "best red sea dive sites"],
    relatedTours: toursBySlug("ras-mohammed-snorkeling-tour", "marsa-alam-dolphin-house-tour", "hurghada-red-sea-diving-snorkeling"),
    seoTitle: "Is Scuba Diving in the Red Sea Worth It? An Honest Look",
    seoDescription:
      "The Red Sea is one of the world's best-known diving destinations. What actually makes it stand out, and what beginners should know before booking.",
    body: [
      p(
        "Divers talk about the Red Sea the way they talk about very few other destinations — exceptional visibility, warm water nearly year-round, and coral reef systems that have largely avoided the bleaching damage seen elsewhere. For most travelers weighing whether to add it to an Egypt trip, the answer is yes."
      ),
      h2("What Makes It Stand Out"),
      p(
        "Visibility routinely exceeds 20 meters, water temperatures stay comfortable for most of the year, and the reef walls drop dramatically close to shore in places like Ras Mohammed National Park, putting healthy coral and a wide range of marine life within easy reach of shore or a short boat ride. Wreck diving is another major draw, particularly around the Strait of Tiran and the well-known Thistlegorm wreck near Sharm."
      ),
      h2("For Beginners"),
      p(
        "You don't need to be a certified diver to get a real sense of it — snorkeling over the same reefs delivers a surprising amount of what makes the Red Sea special, and PADI-certified introductory dives are widely available for first-timers through licensed dive centers. For anyone considering full certification, Egypt is one of the more affordable and accessible places in the world to do it."
      ),
      h2("Best Time to Go"),
      p(
        "The Red Sea is diveable nearly year-round, with water temperatures rarely dropping uncomfortably even in winter. Summer offers the warmest water and best visibility for most sites, while spring and autumn avoid the peak heat on land between dives."
      ),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "mount-sinai-sunrise-hike-what-to-expect",
    title: "The Mount Sinai Sunrise Hike: What to Actually Expect",
    category: "Travel Guides",
    tags: ["Sinai", "Hiking", "Religious Sites"],
    author: editorialTeam,
    excerpt:
      "Climbing Mount Sinai for sunrise is one of Egypt's most physically demanding and most rewarding experiences — here's what the night actually involves.",
    imageTone: "desert",
    image: "/photos/pexels-28322810.jpg",
    publishedAt: "2026-08-23T00:00:00.000Z",
    destinations: ["Sinai"],
    primaryKeyword: "mount sinai sunrise hike",
    secondaryKeywords: ["mount sinai hike difficulty", "st catherine's monastery", "climbing mount sinai at night"],
    relatedTours: toursBySlug("mount-sinai-sunrise-hike"),
    seoTitle: "The Mount Sinai Sunrise Hike: What to Actually Expect",
    seoDescription:
      "Climbing Mount Sinai for sunrise is a genuine physical undertaking. What the overnight hike actually involves, how hard it is, and what to bring.",
    body: [
      p(
        "Mount Sinai — traditionally identified as the mountain where Moses received the Ten Commandments — draws hikers for a reason that has nothing to do with religion as much as it does the view: sunrise from the summit, over a landscape of bare granite peaks, is one of the most striking sights in Egypt."
      ),
      h2("The Climb Itself"),
      p(
        "Most hikes begin around midnight or 1 or 2 AM, climbing in darkness so as to reach the 2,285-meter summit before dawn. The main camel path is a longer but gentler ascent, roughly two and a half to three hours at a steady pace; a steeper route of some 3,750 stone steps cuts the distance but demands far more from your legs and lungs. Either way, the final stretch to the summit is on foot, up a set of steps too steep and narrow for camels."
      ),
      h2("How Hard Is It?"),
      p(
        "It's a genuine physical undertaking, not a casual walk — a moderate fitness level and comfortable hiking shoes matter, and it gets cold at altitude even in a country known for heat, so warm layers are essential regardless of the season. It is not technical climbing; no ropes or special equipment are needed, just stamina and sturdy footing in the dark."
      ),
      h2("St. Catherine's Monastery"),
      p(
        "At the mountain's base sits St. Catherine's Monastery, one of the oldest continuously operating Christian monasteries in the world, built around what's traditionally identified as the Burning Bush. Most itineraries visit the monastery after the hike, once the morning opening hours begin, closing the loop on a single overnight visit to the mountain."
      ),
      faq([
        {
          question: "How hard is the Mount Sinai hike?",
          answer:
            "It's a moderate, sustained climb of two and a half to three hours by the camel path, done in darkness — manageable for a reasonably fit hiker but not a casual walk.",
        },
        {
          question: "What should I bring for the Mount Sinai sunrise hike?",
          answer:
            "Warm layers (it's cold at altitude even at night), a headlamp or flashlight, sturdy shoes, and water. A walking stick, rentable at the base, helps on the steeper sections.",
        },
        {
          question: "Can you visit St. Catherine's Monastery without doing the hike?",
          answer:
            "Yes — the monastery keeps its own visiting hours during the day and can be visited on its own, separate from the overnight sunrise climb.",
        },
      ]),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "dahab-blue-hole-guide",
    title: "Dahab's Blue Hole: A Diver's Guide",
    category: "Travel Guides",
    tags: ["Dahab", "Diving", "Red Sea"],
    author: editorialTeam,
    excerpt:
      "One of the most famous dive sites in the world sits just off the road north of Dahab — a dramatic sinkhole with a serious reputation. Here's what it actually is.",
    imageTone: "redsea",
    image: "/photos/pexels-16959271.jpg",
    publishedAt: "2026-08-23T00:00:00.000Z",
    destinations: ["Dahab", "Sinai"],
    primaryKeyword: "dahab blue hole",
    secondaryKeywords: ["blue hole dahab diving", "dahab three pools", "blue hole egypt"],
    relatedTours: toursBySlug("dahab-blue-hole-three-pools-tour"),
    seoTitle: "Dahab's Blue Hole: A Diver's Guide to Egypt's Most Famous Sinkhole",
    seoDescription:
      "The Blue Hole near Dahab is one of the world's most recognized dive sites. What it is, how deep it goes, and how to visit it safely.",
    body: [
      p(
        "A short drive north of Dahab, the Blue Hole is a submarine sinkhole around 130 meters deep, dropping straight down from the shoreline into water so clear its color shifts through nearly every shade of blue as the depth increases."
      ),
      h2("What Makes It Famous"),
      p(
        "Walk-in access from the shore, combined with the dramatic drop-off just a few meters out, makes the Blue Hole one of the most accessible major dive sites anywhere — no boat required, which is part of why Dahab built its whole diving identity around shore access rather than boat trips."
      ),
      h2("A Site With a Serious Reputation"),
      p(
        "The Blue Hole is also known, honestly, for a difficult safety history, tied specifically to \"the Arch\" — a natural tunnel connecting the Blue Hole to the open sea at roughly 55 meters depth, well beyond recreational diving limits and requiring technical training and equipment to attempt safely. Diving the Blue Hole itself, within recreational depth limits and without attempting the Arch, is a very different and well-established activity, done daily by certified divers of ordinary experience levels with a local guide."
      ),
      h2("The Three Pools"),
      p(
        "Just along the coast from the Blue Hole, the Three Pools are a series of naturally connected reef pools, popular for snorkeling and a calmer alternative for anyone not diving — clear, shallow water over reef without the Blue Hole's dramatic depth."
      ),
      callout(
        "Dive within your certification level, always with a local guide familiar with the site, and never attempt the Arch without specific technical training. Recreational diving in the Blue Hole itself, done properly, is routine and well-established.",
        { tone: "Safety", title: "Diving It Safely" }
      ),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "swimming-with-dolphins-sataya-reef",
    title: "Swimming With Dolphins at Sataya Reef, Marsa Alam",
    category: "Travel Guides",
    tags: ["Marsa Alam", "Red Sea", "Wildlife"],
    author: editorialTeam,
    excerpt:
      "Sataya Reef, off Marsa Alam, is home to a resident pod of wild spinner dolphins — one of the most reliable wild dolphin encounters anywhere in the world.",
    imageTone: "redsea",
    image: "/photos/pexels-4620455.jpg",
    publishedAt: "2026-08-23T00:00:00.000Z",
    destinations: ["Marsa Alam", "Red Sea"],
    primaryKeyword: "swimming with dolphins marsa alam",
    secondaryKeywords: ["sataya reef dolphins", "dolphin house marsa alam", "wild dolphins egypt"],
    relatedTours: toursBySlug("marsa-alam-dolphin-house-tour"),
    seoTitle: "Swimming With Wild Dolphins at Sataya Reef, Marsa Alam",
    seoDescription:
      "Sataya Reef near Marsa Alam is home to a resident pod of wild spinner dolphins. What the experience actually involves, and how to do it responsibly.",
    body: [
      p(
        "Off the coast of Marsa Alam, Sataya Reef — often called Dolphin House — is home to a resident pod of spinner dolphins that use the reef's calm lagoon to rest during the day, making it one of the most consistent wild dolphin encounters anywhere in the world."
      ),
      h2("What the Trip Involves"),
      p(
        "Boats depart Marsa Alam early, typically reaching the reef by mid-morning, when the dolphins are most reliably present resting in the lagoon. Snorkeling alongside them — never scuba diving, which disturbs their resting behavior more — is the standard way to experience it, in open water rather than any kind of enclosure."
      ),
      h2("Doing It Responsibly"),
      p(
        "These are wild animals in their natural resting ground, not a performance — reputable operators maintain distance, avoid chasing or touching the dolphins, and limit boat numbers and time in the water to reduce disturbance. Choosing an operator who follows these practices matters more here than at almost any other Red Sea site, since the dolphins' continued use of the reef depends on it."
      ),
      h2("What Else Is at the Reef"),
      p(
        "Beyond the dolphins, Sataya's coral formations support their own snorkeling and diving worth the trip on their own — reef fish, occasional turtles, and healthy coral in the surrounding lagoon, for the stretches when the pod has moved elsewhere in the reef system."
      ),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "el-gouna-and-soma-bay-guide",
    title: "El Gouna and Soma Bay: Egypt's Purpose-Built Red Sea Resorts",
    category: "Travel Guides",
    tags: ["El Gouna", "Soma Bay", "Red Sea"],
    author: editorialTeam,
    excerpt:
      "Two planned resort towns on the Red Sea coast, built for lagoons, watersports, and a slower pace than Hurghada or Sharm — here's what each actually offers.",
    imageTone: "redsea",
    image: "/photos/pexels-28494110.jpg",
    publishedAt: "2026-08-23T00:00:00.000Z",
    destinations: ["El Gouna", "Soma Bay", "Red Sea"],
    primaryKeyword: "el gouna vs soma bay",
    secondaryKeywords: ["el gouna egypt", "soma bay egypt", "red sea lagoon towns"],
    relatedTours: toursBySlug("el-gouna-lagoon-day", "soma-bay-watersports-relaxation"),
    seoTitle: "El Gouna and Soma Bay: Egypt's Purpose-Built Red Sea Resort Towns",
    seoDescription:
      "El Gouna and Soma Bay are planned resort towns built around lagoons and watersports. What sets each apart from Hurghada and Sharm El Sheikh.",
    body: [
      p(
        "Not every Red Sea town grew up organically — El Gouna and Soma Bay were both built from scratch as planned resort developments, and it shows, in a good way: wide lagoons, purpose-built marinas, and infrastructure designed around watersports rather than retrofitted for them."
      ),
      h2("El Gouna"),
      p(
        "Built across a network of man-made lagoons and islands connected by bridges, El Gouna has developed a reputation as one of the more upscale, design-conscious resort towns on the Red Sea — golf courses, a marina, and a lagoon system particularly well suited to kitesurfing, thanks to consistent wind conditions."
      ),
      h2("Soma Bay"),
      p(
        "Further south, Soma Bay sits on its own peninsula, largely occupied by a small number of large resort properties rather than a town in the conventional sense. It's built heavily around watersports — kitesurfing and windsurfing especially, thanks to reliable Red Sea winds — alongside diving access and a genuinely quiet, resort-only atmosphere."
      ),
      h2("Which Fits Your Trip"),
      p(
        "Both work well as an add-on to a Cairo-and-Nile itinerary rather than a standalone destination — a few days of lagoon and reef time to close out a longer trip. El Gouna suits travelers who want a real town with restaurants and nightlife alongside the resort; Soma Bay suits those who want a quieter, more self-contained few days focused purely on the water."
      ),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "western-desert-oases-guide",
    title: "The Western Desert Oases: Siwa, Bahariya, Dakhla, and Kharga",
    category: "Travel Guides",
    tags: ["Western Desert", "Oases", "Off the Beaten Path"],
    author: editorialTeam,
    excerpt:
      "Egypt's Western Desert holds a string of oases most itineraries never reach — hot springs, salt lakes, and a landscape unlike anywhere else in the country.",
    imageTone: "desert",
    image: "/photos/pexels-36754304.jpg",
    publishedAt: "2026-08-23T00:00:00.000Z",
    destinations: ["Siwa", "Bahariya", "Dakhla", "Kharga"],
    primaryKeyword: "western desert oases egypt",
    secondaryKeywords: ["siwa oasis", "bahariya oasis", "dakhla oasis", "kharga oasis"],
    relatedTours: toursBySlug("siwa-oasis", "white-desert-safari-bahariya", "dakhla-kharga-oasis-circuit"),
    seoTitle: "The Western Desert Oases: A Guide to Siwa, Bahariya, Dakhla, and Kharga",
    seoDescription:
      "Egypt's Western Desert oases — Siwa, Bahariya, Dakhla, and Kharga — sit far from the standard Nile route. What makes each one distinct.",
    body: [
      p(
        "West of the Nile, Egypt's Great Sand Sea holds a chain of oases that most visitors never see, each shaped by centuries of isolation into its own distinct culture and landscape."
      ),
      h2("Siwa"),
      p(
        "The most remote of the four, close to the Libyan border, Siwa has its own Amazigh (Berber) language and culture distinct from the rest of Egypt, along with natural spring pools, ancient salt lakes, and the ruins of the Oracle Temple, once consulted by Alexander the Great."
      ),
      h2("Bahariya and the White Desert"),
      p(
        "Bahariya is the gateway to the White Desert, a surreal landscape of wind-carved white chalk formations rising out of the sand — one of Egypt's most photographed desert landscapes, usually visited on an overnight camping trip from the oasis."
      ),
      h2("Dakhla and Kharga"),
      p(
        "Further south, Dakhla and Kharga hold well-preserved mudbrick old towns, Roman-era temples, and natural hot springs, and are usually visited together as a multi-day circuit through the desert rather than as single stops — a genuinely off-the-beaten-path route even by Egypt's standards."
      ),
      h2("How to Actually Visit"),
      p(
        "These oases sit far from the standard Cairo–Luxor–Aswan route and from each other, so a proper visit means either a dedicated multi-day desert circuit or picking one oasis as a focused add-on to a longer trip, rather than trying to fit all four into a standard itinerary."
      ),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "is-the-white-desert-worth-visiting",
    title: "Is the White Desert Worth Visiting?",
    category: "Travel Guides",
    tags: ["White Desert", "Bahariya", "Camping"],
    author: editorialTeam,
    excerpt:
      "Chalk formations carved by wind into shapes unlike anything else in Egypt, with a night of camping under some of the darkest skies in the country — here's what it actually involves.",
    imageTone: "desert",
    image: "/photos/pexels-34328977.jpg",
    publishedAt: "2026-08-23T00:00:00.000Z",
    destinations: ["Bahariya", "White Desert"],
    primaryKeyword: "is the white desert worth it",
    secondaryKeywords: ["white desert egypt camping", "white desert national park", "bahariya white desert tour"],
    relatedTours: toursBySlug("white-desert-safari-bahariya"),
    seoTitle: "Is the White Desert Worth Visiting? An Honest Look",
    seoDescription:
      "The White Desert's chalk rock formations and overnight camping are unlike anything else in Egypt. What the trip actually involves, and who it suits.",
    body: [
      p(
        "The White Desert doesn't look like the rest of Egypt, or much like anywhere else — a protected national park of chalk-white rock formations, sculpted by millennia of wind erosion into shapes that shift depending on the angle and the light."
      ),
      h2("What You'll Actually See"),
      p(
        "The formations range from mushroom-shaped outcrops to larger structures locals have nicknamed for what they resemble — a sphinx, a rabbit, a chicken — scattered across a stretch of open desert that turns gold, then pink, then white as the sun moves through the day."
      ),
      h2("Camping Overnight"),
      p(
        "Most visits include an overnight camp directly among the formations — a genuinely memorable night, with a campfire, a simple desert dinner, and, far from any city light pollution, one of the clearest views of the stars available anywhere in Egypt. It's a basic camping setup, not a luxury one, which is part of the appeal for travelers looking for something different from a hotel-based itinerary."
      ),
      h2("Who It Suits"),
      p(
        "Travelers comfortable with a night of simple camping and an interest in landscape over ancient monuments will find it a genuine highlight. It's a considerable detour from the standard Nile route, best added by travelers with ten days or more, or as a focused desert-specific trip on its own."
      ),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "wadi-el-hitan-whale-valley-guide",
    title: "Wadi El Hitan: The Desert Full of Fossil Whales",
    category: "Travel Guides",
    tags: ["Fayoum", "Fossils", "Natural History"],
    author: editorialTeam,
    excerpt:
      "In the middle of the Egyptian desert lies the skeletal record of whales that lived here 40 million years ago, when this was open ocean — a UNESCO site most visitors have never heard of.",
    imageTone: "desert",
    image: "/photos/pexels-28638835.jpg",
    publishedAt: "2026-08-23T00:00:00.000Z",
    destinations: ["Wadi El Hitan", "Fayoum"],
    primaryKeyword: "wadi el hitan whale valley",
    secondaryKeywords: ["whale valley egypt", "wadi el hitan fossils", "fayoum whale fossils"],
    relatedTours: toursBySlug("wadi-el-hitan-whale-valley-safari", "fayoum-nature-tour"),
    seoTitle: "Wadi El Hitan: The Egyptian Desert Full of Fossil Whales",
    seoDescription:
      "Wadi El Hitan, Egypt's Whale Valley, holds fossilized whale skeletons from a time this desert was open ocean. A guide to this UNESCO World Heritage site.",
    body: [
      p(
        "It's a strange thing to stand in open desert, hours from any coastline, and find the fossilized skeleton of a whale lying in the sand — but that's exactly what Wadi El Hitan, the Whale Valley, offers."
      ),
      h2("What's Actually There"),
      p(
        "Around 40 million years ago, this stretch of desert was open sea, and Wadi El Hitan preserves the fossilized remains of Basilosaurus and Dorudon, early whale species that still had vestigial hind legs — physical evidence of the evolutionary transition from land mammals to fully aquatic whales. It's one of the most complete fossil records of this transition found anywhere on Earth, which is why it holds UNESCO World Heritage status."
      ),
      h2("What a Visit Looks Like"),
      p(
        "A marked trail through the valley passes numerous fossil skeletons left largely in place where they were found, along with an on-site museum explaining the science behind them. The surrounding desert landscape, with its own wind-carved rock formations, is worth the visit even setting the fossils aside."
      ),
      h2("How It Fits a Trip"),
      p(
        "Wadi El Hitan sits near the Fayoum Oasis, a couple of hours from Cairo, which makes it realistic as a day trip from the capital — often combined with Fayoum's lakes and waterfalls into a single day focused on Egypt's natural rather than ancient-Egyptian history."
      ),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "who-was-hatshepsut",
    title: "Who Was Hatshepsut, Egypt's Female Pharaoh?",
    category: "Ancient Egypt",
    tags: ["Luxor", "Ancient Egypt", "History"],
    author: editorialTeam,
    excerpt:
      "One of the most successful rulers of ancient Egypt was a woman who took the throne as pharaoh in her own right — and whose monuments still dominate Luxor's West Bank.",
    imageTone: "luxor",
    image: "/photos/pexels-29487501.jpg",
    publishedAt: "2026-08-23T00:00:00.000Z",
    destinations: ["Luxor"],
    primaryKeyword: "who was hatshepsut",
    secondaryKeywords: ["hatshepsut temple luxor", "female pharaoh egypt", "hatshepsut facts"],
    relatedTours: toursBySlug("luxor-west-bank-day-tour", "6-day-cairo-giza-luxor"),
    seoTitle: "Who Was Hatshepsut? Egypt's Most Successful Female Pharaoh",
    seoDescription:
      "Hatshepsut ruled ancient Egypt as pharaoh in her own right, and her mortuary temple still dominates Luxor's West Bank. Her story, explained plainly.",
    body: [
      p(
        "Hatshepsut ruled Egypt as pharaoh for roughly two decades during the 18th Dynasty, one of only a handful of women to take the throne in her own right rather than as a regent — and by most measures, one of the most successful."
      ),
      h2("How She Came to Power"),
      p(
        "Hatshepsut began as regent for her young stepson, Thutmose III, after her husband's death, and within a few years took on the full title and regalia of pharaoh herself, including the ceremonial false beard shown in her official statues. Her reign is generally regarded by historians as a period of stability and prosperity, marked by extensive building projects and expanded trade, notably a famous expedition to the Land of Punt."
      ),
      h2("Her Mortuary Temple"),
      p(
        "Her mortuary temple at Deir el-Bahari, on Luxor's West Bank, remains one of ancient Egypt's most striking pieces of architecture — a series of colonnaded terraces cut directly into the cliff face, built to align with the winter solstice sunrise. It's one of the most visited sites on the West Bank today, and unlike almost anything else built in this period."
      ),
      h2("What Happened After"),
      p(
        "After her death, many of Hatshepsut's monuments and images were defaced or removed on the order of Thutmose III, for reasons historians still debate — possibly political consolidation rather than personal animosity. Much of what's known about her today comes from the monuments that survived that erasure, including her temple, which endures as the clearest record of her reign."
      ),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "how-were-the-great-pyramids-built",
    title: "How Were the Great Pyramids Actually Built?",
    category: "Ancient Egypt",
    tags: ["Giza", "Ancient Egypt", "Engineering"],
    author: editorialTeam,
    excerpt:
      "The Great Pyramid of Giza has stood for over 4,500 years. Here's what archaeologists actually know — and don't know — about how it was built.",
    imageTone: "giza",
    image: "/photos/pexels-10124763.jpg",
    publishedAt: "2026-08-23T00:00:00.000Z",
    destinations: ["Giza"],
    primaryKeyword: "how were the pyramids built",
    secondaryKeywords: ["great pyramid of giza construction", "how did ancient egyptians build pyramids", "pyramid building theories"],
    relatedTours: toursBySlug("1-day-giza-tour", "3-day-cairo-giza"),
    seoTitle: "How Were the Great Pyramids of Giza Actually Built?",
    seoDescription:
      "The Great Pyramid has stood for over 4,500 years. What archaeologists actually know about how it was built, who built it, and what remains uncertain.",
    body: [
      p(
        "The Great Pyramid of Giza, built for the pharaoh Khufu around 2560 BCE, is made of roughly 2.3 million limestone and granite blocks and remained the tallest man-made structure on Earth for nearly 3,800 years. How exactly it was built is one of the most studied questions in archaeology — and while much is understood, the full picture still isn't settled."
      ),
      h2("Who Actually Built It"),
      p(
        "Contrary to a persistent myth, the pyramids were not built by enslaved foreign labor. Archaeological evidence, including a nearby workers' town with bakeries, medical facilities, and worker burial sites, points to a large organized workforce of skilled Egyptian laborers, likely working in rotating shifts, fed and housed by the state as part of a genuine national construction project."
      ),
      h2("Moving the Stone"),
      p(
        "The leading theories involve ramps — straight, spiraling, or internal — combined with sledges, and evidence from other sites suggests workers wetted the sand in front of sledges to reduce friction, a technique depicted in ancient tomb paintings showing exactly this method in use. Precisely which ramp configuration was used for the Great Pyramid specifically remains debated among Egyptologists, since no definitive ramp structure has survived intact."
      ),
      h2("The Precision Itself"),
      p(
        "What's not in dispute is the sheer precision involved — the pyramid's base is level to within a few centimeters across its entire footprint, and its sides align to true north with remarkable accuracy for a structure built without modern surveying tools. That precision, more than the size alone, is what continues to draw serious scholarly attention to how it was actually achieved."
      ),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "tutankhamun-boy-king-facts",
    title: "Tutankhamun: What We Actually Know About the Boy King",
    category: "Ancient Egypt",
    tags: ["Luxor", "Ancient Egypt", "Tutankhamun"],
    author: editorialTeam,
    excerpt:
      "Tutankhamun ruled for less than a decade and died young, yet his tomb became the most famous archaeological discovery of the twentieth century. Here's the real story.",
    imageTone: "luxor",
    image: "/photos/pexels-16086933.jpg",
    publishedAt: "2026-08-23T00:00:00.000Z",
    destinations: ["Luxor"],
    primaryKeyword: "tutankhamun facts",
    secondaryKeywords: ["king tut tomb", "howard carter tutankhamun", "tutankhamun death"],
    relatedTours: toursBySlug("luxor-west-bank-day-tour", "3-day-cairo-giza"),
    seoTitle: "Tutankhamun: What We Actually Know About the Boy King",
    seoDescription:
      "Tutankhamun ruled ancient Egypt briefly and died young, yet his tomb became archaeology's most famous discovery. The real story, without the myths.",
    body: [
      p(
        "Tutankhamun ruled Egypt for roughly nine years, becoming pharaoh at around age nine and dying at about eighteen or nineteen — a minor figure in the actual political history of ancient Egypt, whose fame today rests almost entirely on the survival of his tomb."
      ),
      h2("A Short, Difficult Reign"),
      p(
        "Tutankhamun came to the throne shortly after the reign of Akhenaten, whose religious reforms had upended traditional Egyptian worship, and much of his own short reign was spent reversing those changes and restoring the old religious order — a significant political undertaking for such a young king, likely guided heavily by senior advisors."
      ),
      h2("Why His Tomb Matters So Much"),
      p(
        "Most royal tombs in the Valley of the Kings were looted in antiquity. Tutankhamun's, likely because it was minor and hidden beneath the debris of a later tomb's construction, survived largely intact until archaeologist Howard Carter discovered it in 1922 — the only near-complete royal burial ever found in the valley, including the iconic solid gold funerary mask now displayed at the Grand Egyptian Museum."
      ),
      h2("How Did He Die?"),
      p(
        "The exact cause remains debated. Modern examinations, including CT scans and genetic testing, have identified a broken leg, evidence of malaria, and signs of several inherited health conditions likely linked to his parents being closely related — any of which, in combination, could plausibly explain an early death, though no single definitive cause has been established."
      ),
      h2("Seeing It Today"),
      p(
        "Tutankhamun's complete funerary collection — over 5,000 objects — is now displayed together for the first time at the Grand Egyptian Museum near Giza, while his mummy remains in his original tomb in the Valley of the Kings, on Luxor's West Bank."
      ),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "egyptian-food-guide-what-to-eat",
    title: "What to Eat in Egypt: A Practical Food Guide",
    category: "Culture",
    tags: ["Egyptian Food", "Culture"],
    author: editorialTeam,
    excerpt:
      "Koshari, ful medames, and the dishes that actually define everyday Egyptian eating — what to order, and why they matter beyond just being tasty.",
    imageTone: "giza",
    image: "/photos/pexels-36090548.jpg",
    publishedAt: "2026-08-23T00:00:00.000Z",
    destinations: ["Cairo", "Luxor", "Aswan"],
    primaryKeyword: "egyptian food guide",
    secondaryKeywords: ["what to eat in egypt", "koshari egypt", "ful medames", "egyptian cuisine"],
    relatedTours: toursBySlug("cairo-nile-dinner-cruise-night-tour", "3-day-cairo-giza"),
    seoTitle: "What to Eat in Egypt: A Practical Guide to Egyptian Food",
    seoDescription:
      "Koshari, ful medames, and the dishes that define everyday Egyptian eating — what to order, where they come from, and why they're worth seeking out.",
    body: [
      p("Egyptian food rarely gets the same attention as its ancient sites, which is a shame, because a handful of dishes are genuinely worth building a meal or two around."),
      h2("Koshari"),
      p(
        "Widely considered Egypt's national dish, koshari layers rice, macaroni, and lentils with chickpeas, a spiced tomato sauce, and crispy fried onions, usually finished with a garlic-vinegar sauce and a chili sauce on the side. Its exact origins trace to the 19th century, with likely Indian and British colonial influences on the rice-and-lentil base — but the dish as eaten today, sold everywhere from street carts to sit-down restaurants, is entirely, unmistakably Egyptian."
      ),
      h2("Ful Medames"),
      p(
        "Egypt's most popular breakfast dish by a wide margin, ful medames is slow-cooked fava beans, typically mashed and dressed with olive oil, lemon, cumin, and garlic. Its roots go back to Pharaonic Egypt, making it one of the oldest continuously eaten dishes in the country — still served every morning in households and street stalls across Cairo."
      ),
      h2("Beyond the Basics"),
      ...bullets([
        "Molokhia — a garlicky, jute-leaf stew, usually served over rice with chicken or rabbit",
        "Mahshi — vegetables stuffed with spiced rice, a common home-cooking staple",
        "Ta'ameya — Egypt's version of falafel, made with fava beans rather than chickpeas",
        "Fresh Nile-side seafood in Luxor and Aswan, and grilled seafood along the Red Sea coast",
      ]),
      h2("Eating Well on a Tour"),
      p(
        "A private guide is worth its weight here too — knowing which street stall is actually good, or which restaurant does koshari properly, makes a real difference, and it's exactly the kind of local knowledge a good guide brings to a day that otherwise defaults to hotel restaurants."
      ),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "is-the-luxor-hot-air-balloon-safe",
    title: "Is the Luxor Hot Air Balloon Ride Safe?",
    category: "Travel Guides",
    tags: ["Luxor", "Hot Air Balloon", "Safety"],
    author: editorialTeam,
    excerpt:
      "A sunrise balloon over Luxor's West Bank is one of Egypt's most iconic experiences, and it comes with a safety history worth understanding honestly before you book.",
    imageTone: "luxor",
    image: "/photos/pexels-36890534.jpg",
    publishedAt: "2026-08-23T00:00:00.000Z",
    destinations: ["Luxor"],
    primaryKeyword: "is luxor hot air balloon safe",
    secondaryKeywords: ["luxor hot air balloon safety", "luxor balloon ride", "hot air balloon egypt accident"],
    relatedTours: toursBySlug("2-day-luxor-tour", "luxor-west-bank-day-tour"),
    seoTitle: "Is the Luxor Hot Air Balloon Ride Safe? An Honest Answer",
    seoDescription:
      "A sunrise balloon flight over Luxor is iconic, but has a real safety history worth understanding. What happened, what changed, and how to choose an operator.",
    body: [
      p(
        "A sunrise hot-air balloon over Luxor's West Bank, drifting above the Valley of the Kings and Hatshepsut's temple as the sun comes up, is one of the most-photographed experiences in Egypt — and a reasonable question before booking one is whether it's actually safe."
      ),
      h2("What Actually Happened"),
      p(
        "Luxor's ballooning industry has had two serious incidents worth being honest about — a multi-balloon collision in 2009, and a more serious accident in 2013 in which a balloon caught fire after landing and resulted in 19 deaths, among the worst hot-air balloon accidents on record anywhere. Both incidents led to real scrutiny of the industry's safety practices at the time."
      ),
      h2("What Changed Afterward"),
      p(
        "In the years since, Egypt's Civil Aviation Authority tightened oversight of balloon operators significantly — stricter licensing, additional mandatory pilot training, limits on how many balloons can fly simultaneously, and more rigorous equipment inspection requirements. Today, ballooning in Luxor is generally regarded as safe with established, licensed operators, and it remains one of the region's most popular tourist activities for exactly that reason."
      ),
      h2("How to Choose an Operator"),
      p(
        "The clearest safety signal is an established, licensed operator with a long operating history, rather than the cheapest option available on the day — newer or budget operators are generally considered a relatively higher risk within the industry. Flights are also weather-dependent and routinely cancelled or postponed by operators when conditions aren't right, which is itself a sign of a safety-conscious operation rather than an inconvenience to push past."
      ),
      callout(
        "We only arrange balloon flights through established, licensed operators with strong safety records, and we won't push a flight forward if conditions or an operator's judgment say otherwise — even if it means an early rebooking.",
        { tone: "Safety", title: "How We Handle It" }
      ),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "egypt-honeymoon-guide",
    title: "Planning an Egypt Honeymoon: A Practical Guide",
    category: "Travel Guides",
    tags: ["Honeymoon", "Luxury Travel", "Trip Planning"],
    author: editorialTeam,
    excerpt:
      "Egypt makes an unusual, genuinely memorable honeymoon destination — ancient temples, a private Nile cruise, and a level of privacy a beach resort can't quite match.",
    imageTone: "nile",
    image: "/photos/pexels-5727263.jpg",
    publishedAt: "2026-08-23T00:00:00.000Z",
    destinations: ["Cairo", "Luxor", "Aswan", "Nile"],
    relatedExperience: herEgyptExperience,
    primaryKeyword: "egypt honeymoon",
    secondaryKeywords: ["egypt honeymoon itinerary", "romantic things to do in egypt", "nile cruise honeymoon"],
    relatedTours: toursBySlug("10-day-private-luxurious-trip", "4-day-nile-cruise-luxor-aswan", "red-sea-relaxation"),
    seoTitle: "Planning an Egypt Honeymoon: A Practical, Romantic Itinerary Guide",
    seoDescription:
      "Egypt makes a genuinely memorable honeymoon destination — private Nile cruising, sunset over ancient temples, and real privacy. How to plan it well.",
    body: [
      p(
        "Egypt isn't the first place most couples think of for a honeymoon, which is exactly what makes it work — instead of another beach resort, it offers ancient temples at sunset, a private sail down the Nile, and a sense of occasion that's hard to replicate anywhere else."
      ),
      h2("Why Egypt Works for a Honeymoon"),
      p(
        "A private itinerary here means your own guide and vehicle for the entire trip, which translates directly into privacy most standard honeymoon destinations can't offer at the same price point — no shared group schedule, no waiting on anyone else's preferences, and the flexibility to linger somewhere that catches you both."
      ),
      h2("Building the Itinerary"),
      p(
        "A well-paced honeymoon usually opens in Cairo and Giza, moves to a private or small-group Nile cruise between Luxor and Aswan — genuinely one of the most romantic ways to travel anywhere, with temples appearing at the water's edge and dinner on deck as the sun sets — and closes with a few unhurried days on the Red Sea coast for pure relaxation after a history-heavy first half."
      ),
      h2("A Few Details Worth Planning For"),
      p(
        "Sunset and sunrise are worth building the schedule around specifically — sailing past a riverside temple at golden hour, or a quiet Karnak before the day's crowds arrive, tend to be the moments couples remember most. A private candlelit dinner on a felucca, or a personalized photoshoot at a temple or in the desert, are the kind of additions worth requesting directly rather than assuming they're standard."
      ),
      callout(
        "Her Egypt, one of our Signature Experiences, was built with exactly this kind of trip in mind — a considered, private pace rather than a standard group schedule. It's worth a look if privacy and pacing matter most to your honeymoon.",
        { title: "Worth Knowing About" }
      ),
    ],
  },
  // --- Jordan guides ---
  {
    status: "published",
    featured: false,
    slug: "petra-travel-guide",
    title: "Petra Travel Guide: What to Know Before You Go",
    category: "Travel Guides",
    tags: ["Jordan", "Petra", "Trip Planning"],
    author: editorialTeam,
    excerpt: "How Petra actually works — the Siq walk, the Monastery climb, timing, and what a single day realistically covers.",
    imageLabel: "Petra Treasury",
    imageTone: "jordan",
    image: "/photos/pexels-15998107.jpg",
    destinations: ["Jordan"],
    publishedAt: "2026-02-03T09:00:00+02:00",
    primaryKeyword: "petra travel guide",
    secondaryKeywords: ["petra jordan", "how to visit petra", "petra treasury"],
    seoTitle: "Petra Travel Guide: What to Know Before You Go | Egypt Eye",
    seoDescription: "A practical Petra guide — the Siq walk, the Monastery climb, timing your visit, and what a single day covers.",
    body: [
      p("Petra is bigger than most photos suggest. The Treasury — the facade everyone recognizes — is only the entrance. The Nabataean city carved into these sandstone cliffs covers several square kilometers, and seeing more than the Treasury takes real walking."),
      h2("The Siq"),
      p("You reach the Treasury through the Siq, a natural canyon roughly a kilometer long and, in places, barely wide enough for two people to pass. It's the single most photographed stretch of the visit, and for good reason — the Treasury appears suddenly, framed by a narrow gap in the rock, exactly as it would have to a Nabataean trader arriving 2,000 years ago."),
      h2("The Monastery climb"),
      p("Beyond the Treasury and the Royal Tombs, the Monastery (Ad Deir) sits at the top of roughly 800 rock-cut steps. It's a real climb — 45 minutes to an hour at a steady pace — but it's also less crowded than the Treasury and, by most visitors' accounts, just as striking."),
      ...bullets([
        "Wear real walking shoes — the Siq floor and the Monastery steps are uneven stone, not pavement",
        "Bring more water than you think you need; there's little shade",
        "A full day covers the Treasury, Royal Tombs, and the Monastery climb comfortably",
        "Petra by Night runs three evenings a week and is worth pairing with a daytime visit, not a substitute for one",
      ]),
      callout("Petra opens early and the Siq gets genuinely hot by midday — starting at opening time is the single best way to beat both the heat and the crowds.", { tone: "Info" }),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "wadi-rum-desert-guide",
    title: "Wadi Rum: Jordan's Desert of Red Sand and Bedouin Camps",
    category: "Travel Guides",
    tags: ["Jordan", "Wadi Rum", "Desert"],
    author: editorialTeam,
    excerpt: "What a night in Wadi Rum actually looks like, and why the landscape kept showing up in Mars films.",
    imageLabel: "Wadi Rum Desert",
    imageTone: "jordan",
    image: "/photos/pexels-13806469.jpg",
    destinations: ["Jordan"],
    publishedAt: "2026-02-04T09:00:00+02:00",
    primaryKeyword: "wadi rum jordan",
    secondaryKeywords: ["wadi rum desert", "bedouin camp jordan", "wadi rum 4x4"],
    seoTitle: "Wadi Rum Guide: Jordan's Red Desert & Bedouin Camps | Egypt Eye",
    seoDescription: "What to expect from a Wadi Rum visit — the 4x4 safari, a Bedouin camp night, and why film crews keep coming back.",
    body: [
      p("Wadi Rum's sandstone valleys and towering rock formations have stood in for Mars in several films — the red sand and the scale of the landscape need almost no alteration on camera. In person, the effect is less about recognizing a movie set and more about the sheer quiet of the place."),
      h2("A typical visit"),
      p("Most visits combine an afternoon 4x4 safari — Bedouin drivers know routes through canyons and past rock bridges that aren't obvious from the main track — with a night at a desert camp. Dinner is usually a zarb, meat and vegetables cooked slowly underground, and once the fire dies down, the sky does the rest."),
      ...bullets([
        "Nights get genuinely cold, even in summer — bring a layer",
        "Camps range from simple tents to Bedouin-run camps with proper beds",
        "The stargazing here is some of the best in the region — minimal light pollution for miles",
        "A single overnight is enough; longer treks exist for those who want more",
      ]),
      callout("Wadi Rum pairs naturally with Petra — the two are about an hour and a half apart by road, and most Jordan itineraries connect them on the same trip.", { tone: "Highlight" }),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "amman-jordan-travel-guide",
    title: "Amman Travel Guide: Jordan's Layered Capital",
    category: "Travel Guides",
    tags: ["Jordan", "Amman", "City Guide"],
    author: editorialTeam,
    excerpt: "What's actually worth a stop in Amman between Petra and Wadi Rum.",
    imageLabel: "Amman Citadel",
    imageTone: "jordan",
    image: "/photos/pexels-18717635.jpg",
    destinations: ["Jordan"],
    publishedAt: "2026-02-05T09:00:00+02:00",
    primaryKeyword: "amman travel guide",
    secondaryKeywords: ["amman jordan", "things to do in amman", "amman citadel"],
    seoTitle: "Amman Travel Guide: Jordan's Capital | Egypt Eye",
    seoDescription: "What's worth seeing in Amman — the Citadel, the Roman Theatre, and downtown — for travelers passing through before Petra or Wadi Rum.",
    body: [
      p("Most Jordan itineraries treat Amman as a stopover between the airport and Petra, and for a first visit, that's a reasonable read — but the city itself has more layers than a quick transit suggests."),
      h2("What to see with limited time"),
      ...bullets([
        "Amman Citadel — a hilltop site with the Temple of Hercules and sweeping views over the city",
        "The Roman Theatre — a 2nd-century amphitheater still used for events, seated into the hillside downtown",
        "Downtown Amman — souqs, coffee houses, and the general texture of a working Middle Eastern capital",
        "Rainbow Street — cafés and a good spot for an evening walk",
      ]),
      p("A half-day covers the Citadel and the Roman Theatre comfortably. If you have a full day before heading south, downtown's markets are worth the extra time — this isn't a city built primarily for tourism, which is part of what makes it worth a look."),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "jerash-ajloun-guide",
    title: "Jerash & Ajloun Castle: Jordan's Roman and Islamic Layers",
    category: "Ancient Egypt",
    tags: ["Jordan", "Jerash", "History"],
    author: editorialTeam,
    excerpt: "One of the best-preserved Roman provincial cities in the world, and the 12th-century castle nearby.",
    imageLabel: "Jerash Ruins",
    imageTone: "jordan",
    image: "/photos/pexels-18717595.jpg",
    destinations: ["Jordan"],
    publishedAt: "2026-02-06T09:00:00+02:00",
    primaryKeyword: "jerash jordan",
    secondaryKeywords: ["jerash ruins", "ajloun castle", "roman ruins jordan"],
    seoTitle: "Jerash & Ajloun Castle Guide | Egypt Eye",
    seoDescription: "Jerash's Roman ruins and Ajloun's 12th-century castle — what to see, and how the two connect on a day trip from Amman.",
    body: [
      p("Jerash rarely gets the recognition Petra does, which is strange given what's actually there — a Roman provincial city with its street plan, forum, and two theatres still largely intact, an hour north of Amman."),
      h2("Jerash's highlights"),
      ...bullets([
        "The Oval Forum, an unusually shaped public square ringed by columns",
        "The Cardo, the city's main colonnaded street, still paved with the original stones in places",
        "The South and North Theatres, both still structurally sound enough to host performances",
      ]),
      h2("Ajloun Castle"),
      p("Ajloun Castle was built in 1184 by a commander under Saladin, specifically to watch these hills for Crusader troop movements. It's a working example of Islamic military architecture from the period, and the hilltop position still gives a clear read on why it was placed exactly there."),
      p("Most day trips from Amman combine both sites — Jerash in the morning, Ajloun after lunch, back in the capital by evening."),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "dead-sea-jordan-guide",
    title: "The Dead Sea: What Floating Actually Feels Like",
    category: "Travel Guides",
    tags: ["Jordan", "Dead Sea"],
    author: editorialTeam,
    excerpt: "What to expect from a Dead Sea day — the salt, the mud, and a few things nobody mentions beforehand.",
    imageLabel: "Dead Sea Shore",
    imageTone: "jordan",
    image: "/photos/pexels-30645989.jpg",
    destinations: ["Jordan"],
    publishedAt: "2026-02-07T09:00:00+02:00",
    primaryKeyword: "dead sea jordan",
    secondaryKeywords: ["floating in the dead sea", "dead sea mud", "dead sea day trip"],
    seoTitle: "Dead Sea Guide: What to Know Before You Float | Egypt Eye",
    seoDescription: "What a Dead Sea day actually involves — the floating, the mud, and practical tips nobody mentions beforehand.",
    body: [
      p("The Dead Sea sits about 430 meters below sea level, the lowest point on Earth's land surface, and its salt content — roughly ten times that of the ocean — is high enough that floating isn't really a skill. You simply don't sink."),
      h2("What nobody mentions beforehand"),
      ...bullets([
        "The water stings — badly — in any cut, scrape, or recently shaved skin",
        "Don't get it in your eyes; it genuinely hurts",
        "The mud along the shore is free to use and is the thing everyone photographs",
        "Most resorts along the shore offer day-access with showers, which is worth paying for afterward",
      ]),
      p("A half-day is enough — an hour or two floating and applying mud, a shower, and time to dry off. Most Jordan itineraries schedule it as a closing activity, right before a flight home, for exactly that reason."),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "is-jordan-safe-to-visit",
    title: "Is Jordan Safe to Visit? A Straight Answer",
    category: "Travel Guides",
    tags: ["Jordan", "Trip Planning", "Safety"],
    author: editorialTeam,
    excerpt: "Jordan's actual safety record for travelers, and what regional headlines usually get wrong.",
    imageLabel: "Amman Citadel",
    imageTone: "jordan",
    image: "/photos/pexels-18717593.jpg",
    destinations: ["Jordan"],
    publishedAt: "2026-02-08T09:00:00+02:00",
    primaryKeyword: "is jordan safe to visit",
    secondaryKeywords: ["jordan safety", "jordan travel safety", "is amman safe"],
    seoTitle: "Is Jordan Safe to Visit? | Egypt Eye",
    seoDescription: "A straight answer on Jordan's safety for travelers — what the record actually shows, and what regional headlines tend to get wrong.",
    body: [
      p("Jordan is consistently ranked among the more stable countries in the region, and the numbers back that up — violent crime against tourists is rare, and the tourist sites (Petra, Wadi Rum, Amman, the Dead Sea) see heavy daily foot traffic without incident."),
      h2("Where the confusion comes from"),
      p("Jordan borders several countries that do make regional headlines, and travelers sometimes read that proximity as a direct risk to Jordan itself. In practice, the border regions covered by news coverage are not the areas any standard itinerary passes through — Petra, Wadi Rum, Amman, and the Dead Sea sit well within the country's stable interior."),
      ...bullets([
        "Standard travel precautions apply — watch belongings in crowded areas, use reputable transport",
        "Solo female travelers generally report feeling safe, particularly with a private guide",
        "Check your own government's current travel advisory before booking, as a matter of course",
      ]),
    ],
  },

  // --- Practical / logistics ---
  {
    status: "published",
    featured: false,
    slug: "egyptian-currency-money-guide",
    title: "Egyptian Pounds: A Practical Money Guide",
    category: "Travel Guides",
    tags: ["Trip Planning", "Money"],
    author: editorialTeam,
    excerpt: "Cash, cards, and ATMs in Egypt — what actually works day to day.",
    imageLabel: "Cairo Skyline",
    imageTone: "giza",
    image: "/photos/pexels-15126865.jpg",
    publishedAt: "2026-02-09T09:00:00+02:00",
    primaryKeyword: "egyptian currency guide",
    secondaryKeywords: ["egyptian pounds", "money in egypt", "atms in egypt"],
    seoTitle: "Egyptian Pounds: A Practical Money Guide | Egypt Eye",
    seoDescription: "How money actually works in Egypt — cash vs. cards, ATMs, and what to budget for day-to-day spending.",
    body: [
      p("Egypt runs largely on cash for everyday spending — tips, small purchases, market stalls, and many local restaurants — while hotels, larger restaurants, and most tour operators accept cards without issue."),
      h2("Getting cash"),
      ...bullets([
        "ATMs are widely available in cities and tourist areas; airport ATMs are a reliable first stop on arrival",
        "USD and EUR are easy to exchange at banks and official exchange offices",
        "Keep a stock of smaller denomination notes for tips and small vendors — breaking large notes is often awkward",
      ]),
      h2("What to budget cash for"),
      p("Tips (baksheesh) are a genuine part of daily transactions in Egypt — for guides, drivers, hotel staff, and bathroom attendants at some sites. Carrying a mix of small notes solves most of this."),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "tipping-etiquette-in-egypt",
    title: "Tipping in Egypt: Who, How Much, and Why",
    category: "Culture",
    tags: ["Trip Planning", "Culture"],
    author: editorialTeam,
    excerpt: "Baksheesh isn't optional in Egypt the way tipping can feel elsewhere — here's how it actually works.",
    imageLabel: "Cairo Skyline",
    imageTone: "giza",
    image: "/photos/pexels-33041900.jpg",
    publishedAt: "2026-02-10T09:00:00+02:00",
    primaryKeyword: "tipping in egypt",
    secondaryKeywords: ["baksheesh egypt", "how much to tip in egypt"],
    seoTitle: "Tipping in Egypt: A Practical Guide | Egypt Eye",
    seoDescription: "How tipping (baksheesh) actually works in Egypt — who to tip, roughly how much, and why it matters more here than in many destinations.",
    body: [
      p("Tipping in Egypt, known locally as baksheesh, is woven more tightly into daily transactions than it tends to be in many other destinations. Many service-sector wages are built around the expectation of tips, which makes them a genuine part of how people earn a living, not an optional bonus."),
      h2("Who to tip"),
      ...bullets([
        "Your driver and guide, typically per day of service",
        "Hotel staff — porters, housekeeping",
        "Restaurant waitstaff, on top of any service charge already included",
        "Bathroom attendants at many public and tourist sites, who often expect a small coin",
      ]),
      callout("Carrying small Egyptian pound notes solves most tipping situations before they become awkward — you rarely want to be handing over a large note for a small tip.", { tone: "Info" }),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "sim-cards-internet-in-egypt",
    title: "SIM Cards & Staying Connected in Egypt",
    category: "Travel Guides",
    tags: ["Trip Planning"],
    author: editorialTeam,
    excerpt: "Getting a local SIM, Wi-Fi reliability, and what actually works for staying online.",
    imageLabel: "Cairo Skyline",
    imageTone: "giza",
    image: "/photos/pexels-33021028.jpg",
    publishedAt: "2026-02-11T09:00:00+02:00",
    primaryKeyword: "sim card egypt",
    secondaryKeywords: ["internet in egypt", "egypt sim card tourist"],
    seoTitle: "SIM Cards & Staying Connected in Egypt | Egypt Eye",
    seoDescription: "How to get a local SIM in Egypt, what coverage is like outside major cities, and Wi-Fi reliability at hotels.",
    body: [
      p("A local SIM is the simplest way to stay connected in Egypt, and it's easy to buy — kiosks at Cairo International Airport sell tourist SIMs from the major carriers (Vodafone, Orange, Etisalat) with data packages ready to go, and you'll need your passport to register it."),
      ...bullets([
        "Coverage is strong in Cairo, Luxor, Aswan, and Red Sea resort towns",
        "Coverage thins out in the deep desert (White Desert, parts of Sinai) — don't rely on it there",
        "Hotel Wi-Fi is generally reliable in mid-range and upscale properties, less consistent at budget options",
      ]),
      p("If you're only visiting for a short trip, an eSIM purchased before arrival is another straightforward option, though physical SIMs from the airport are usually cheaper for longer stays."),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "what-to-wear-visiting-temples-mosques",
    title: "What to Wear at Temples, Mosques & Churches in Egypt",
    category: "Culture",
    tags: ["Trip Planning", "Culture"],
    author: editorialTeam,
    excerpt: "Dress codes for religious and historic sites — what's actually required versus what's just courtesy.",
    imageLabel: "Islamic Cairo",
    imageTone: "giza",
    image: "/photos/pexels-16366492.jpg",
    publishedAt: "2026-02-12T09:00:00+02:00",
    primaryKeyword: "what to wear in egypt temples",
    secondaryKeywords: ["mosque dress code egypt", "egypt dress code"],
    seoTitle: "What to Wear at Egypt's Temples & Mosques | Egypt Eye",
    seoDescription: "Dress code guidance for ancient temples, mosques, and churches in Egypt — what's actually required versus general courtesy.",
    body: [
      p("Ancient temples (Karnak, Luxor Temple, Abu Simbel) have no formal dress code, though lightweight, sun-covering clothing is more about the heat than any rule. Active mosques and churches are different — modest dress is expected, and some ask for it explicitly."),
      h2("For working mosques"),
      ...bullets([
        "Shoulders and knees covered, for both men and women",
        "Women typically need a headscarf — many mosques that see tourist visits keep spares at the entrance",
        "Shoes come off before entering the prayer hall",
      ]),
      h2("For churches (Coptic Cairo, monasteries)"),
      p("Similar modesty applies — covered shoulders and knees is the safe default. St. Catherine's Monastery in Sinai, an active monastery rather than a museum, is stricter about this than most tourist sites."),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "getting-around-cairo-traffic-transport",
    title: "Getting Around Cairo: Traffic, Taxis & the Metro",
    category: "Travel Guides",
    tags: ["Cairo", "Trip Planning"],
    author: editorialTeam,
    excerpt: "Cairo's traffic has a reputation for a reason — here's what actually works for getting around.",
    imageLabel: "Cairo Skyline",
    imageTone: "giza",
    image: "/photos/pexels-35549688.jpg",
    destinations: ["Cairo"],
    publishedAt: "2026-02-13T09:00:00+02:00",
    primaryKeyword: "getting around cairo",
    secondaryKeywords: ["cairo traffic", "cairo metro", "cairo transport"],
    seoTitle: "Getting Around Cairo: Traffic, Taxis & Metro | Egypt Eye",
    seoDescription: "How to actually get around Cairo — traffic patterns, ride-hailing apps, the metro, and why a private driver solves most of it.",
    body: [
      p("Cairo's traffic is genuinely intense, and it doesn't follow the rush-hour logic you might expect elsewhere — congestion can hit at almost any hour, and travel times between two points can vary wildly depending on when you leave."),
      ...bullets([
        "Ride-hailing apps (Uber, Careem) are widely used and generally reliable for point-to-point trips",
        "The Cairo Metro is fast and cheap but doesn't reach most tourist sites directly",
        "A private driver removes the guesswork entirely — the standard approach for multi-stop sightseeing days",
        "Crossing the street as a pedestrian takes some nerve; watch how locals do it before attempting it yourself",
      ]),
      p("For a short trip focused on sightseeing, a private vehicle for the day is almost always the simplest option — it removes the need to negotiate fares, navigate unfamiliar routes, or plan around traffic."),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "domestic-flights-vs-trains-egypt",
    title: "Domestic Flights vs. Trains: Getting Between Cairo, Luxor & Aswan",
    category: "Travel Guides",
    tags: ["Trip Planning"],
    author: editorialTeam,
    excerpt: "How travelers actually move between Egypt's major cities, and which option fits which trip.",
    imageLabel: "Nile Valley",
    imageTone: "nile",
    image: "/photos/pexels-5265481.jpg",
    publishedAt: "2026-02-14T09:00:00+02:00",
    primaryKeyword: "cairo to luxor flight or train",
    secondaryKeywords: ["egypt domestic flights", "egypt sleeper train"],
    seoTitle: "Domestic Flights vs. Trains in Egypt | Egypt Eye",
    seoDescription: "Flying versus taking the train between Cairo, Luxor, and Aswan — travel times, comfort, and which suits which itinerary.",
    body: [
      p("Cairo, Luxor, and Aswan are connected by both domestic flights and an overnight sleeper train, and which makes sense depends mostly on how much time you have."),
      h2("Domestic flights"),
      p("Roughly an hour in the air, versus most of a day (or night) by train or road. For travelers with a fixed number of days, flying is the standard choice — it's what most of our own multi-city itineraries are built around."),
      h2("The overnight sleeper train"),
      p("An overnight cabin between Cairo and Luxor/Aswan doubles as both transport and a night's accommodation — a genuinely different, slower-paced way to cover the distance, and one some travelers specifically seek out for the experience itself rather than the efficiency."),
      ...bullets([
        "Flying: about an hour, best for time-limited itineraries",
        "Overnight train: roughly 10-12 hours, doubles as accommodation, more of an experience than a shortcut",
      ]),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "egypt-family-travel-tips",
    title: "Egypt With Kids: What Actually Works",
    category: "Travel Guides",
    tags: ["Family Travel", "Trip Planning"],
    author: editorialTeam,
    excerpt: "Practical notes on traveling Egypt as a family — pacing, heat, and which sites hold kids' attention.",
    imageLabel: "Giza Pyramids",
    imageTone: "giza",
    image: "/photos/pexels-34812111.jpg",
    publishedAt: "2026-02-15T09:00:00+02:00",
    primaryKeyword: "egypt family travel",
    secondaryKeywords: ["egypt with kids", "family trip to egypt"],
    seoTitle: "Egypt With Kids: Practical Family Travel Tips | Egypt Eye",
    seoDescription: "What actually works for a family trip to Egypt — pacing, heat management, and which sites hold kids' attention.",
    body: [
      p("Egypt works well as a family destination, but the trips that go smoothly tend to share a few things in common: shorter sightseeing blocks, built-in pool or beach time, and a private guide who can read a tired kid before a full-blown meltdown starts."),
      ...bullets([
        "Schedule major sites (Giza, Karnak) for the morning, before the heat peaks",
        "Build in downtime — a hotel pool afternoon does more for a family trip's success than a fourth temple",
        "The Egyptian Museum and Grand Egyptian Museum both hold kids' interest well, especially anything mummy-related",
        "A private vehicle and guide, rather than group tours, lets the pace flex around your kids rather than a fixed schedule",
      ]),
      callout("A Nile cruise segment is often the easiest stretch of an Egypt trip with kids — meals, a pool (on many boats), and the scenery all happen without anyone needing to be herded anywhere.", { tone: "Highlight" }),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "solo-travel-in-egypt-tips",
    title: "Traveling Egypt Solo: What to Know",
    category: "Travel Guides",
    tags: ["Trip Planning", "Solo Travel"],
    author: editorialTeam,
    excerpt: "Practical notes for solo travelers — safety, cost, and why a private guide changes the math.",
    imageLabel: "Luxor Temple",
    imageTone: "luxor",
    image: "/photos/pexels-15131543.jpg",
    publishedAt: "2026-02-16T09:00:00+02:00",
    primaryKeyword: "solo travel egypt",
    secondaryKeywords: ["egypt solo trip", "traveling egypt alone"],
    seoTitle: "Traveling Egypt Solo: A Practical Guide | Egypt Eye",
    seoDescription: "What solo travelers should know before a trip to Egypt — safety, logistics, and why a private guide often makes more sense than a group tour.",
    body: [
      p("Solo travel in Egypt is common and generally straightforward, though the country's sites are spread out enough that navigating independently — public transport, entrance logistics, negotiating with unofficial guides at site entrances — adds real friction that a private guide removes entirely."),
      ...bullets([
        "A private guide costs more per person alone than split among a group, but often less than the time and hassle saved",
        "Standard safety precautions apply, as anywhere — stick to reputable transport and licensed guides",
        "Solo travelers, including women, generally report feeling safe at Egypt's major sites, particularly with a guide",
        "Evenings in Cairo, Luxor, and coastal towns are generally fine to walk in well-lit, populated areas",
      ]),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "budget-egypt-trip-guide",
    title: "Egypt on a Budget: What's Actually Worth Paying For",
    category: "Travel Guides",
    tags: ["Trip Planning", "Budget Travel"],
    author: editorialTeam,
    excerpt: "Where to save, and where cutting corners in Egypt tends to backfire.",
    imageLabel: "Giza Pyramids",
    imageTone: "giza",
    image: "/photos/pexels-28682219.jpg",
    publishedAt: "2026-02-17T09:00:00+02:00",
    primaryKeyword: "egypt budget travel",
    secondaryKeywords: ["cheap egypt trip", "egypt on a budget"],
    seoTitle: "Egypt on a Budget: What's Worth Paying For | Egypt Eye",
    seoDescription: "Where to genuinely save money on an Egypt trip, and where cutting corners — especially on guides and transport — tends to backfire.",
    body: [
      p("Egypt can be visited on a range of budgets, but a few costs are worth protecting even on a tight one, because skimping on them tends to cost more in frustration than it saves in cash."),
      h2("Worth paying for"),
      ...bullets([
        "A licensed guide at major sites — unofficial guides at entrances are a common source of overcharging and misinformation",
        "Private or reputable transport over unmarked taxis, especially for airport transfers",
        "A mid-range hotel with reliable air conditioning — Egypt's heat makes this less of a luxury than it sounds",
      ]),
      h2("Where you can genuinely save"),
      ...bullets([
        "Street food and local restaurants over hotel dining",
        "Domestic trains over flights, if you have time to spare",
        "Shopping in local markets rather than tourist-focused shops, with some negotiation expected",
      ]),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "luxury-egypt-trip-guide",
    title: "A Luxury Egypt Trip: What Actually Changes",
    category: "Travel Guides",
    tags: ["Trip Planning", "Luxury Travel"],
    author: editorialTeam,
    excerpt: "What a higher-end Egypt itinerary actually buys you, beyond the obvious hotel upgrade.",
    imageLabel: "Nile Valley",
    imageTone: "nile",
    image: "/photos/pexels-15131486.jpg",
    publishedAt: "2026-02-18T09:00:00+02:00",
    primaryKeyword: "luxury egypt trip",
    secondaryKeywords: ["luxury egypt travel", "private egypt tour luxury"],
    seoTitle: "A Luxury Egypt Trip: What Changes | Egypt Eye",
    seoDescription: "What a higher-end Egypt itinerary actually buys beyond a nicer hotel — timing, access, and privacy at major sites.",
    body: [
      p("The obvious upgrade in a luxury Egypt trip is the hotel, but the bigger difference is usually in timing and access — private early entry before general opening hours, a dahabiya or private yacht instead of a shared cruise ship, and a schedule built entirely around your own pace rather than a group's."),
      ...bullets([
        "Early or after-hours access at sites like the Pyramid interior or Abu Simbel, avoiding the bulk of daytime crowds",
        "A privately chartered Nile vessel instead of a multi-cabin cruise ship",
        "A dedicated Egyptologist rather than a shared group guide",
        "Flexibility to linger at a site that's caught your interest, or skip one that hasn't",
      ]),
      p("The sites themselves don't change — everyone sees the same Pyramids — but how crowded they feel, and how much you're rushed through them, changes considerably."),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "photography-tips-for-egypt",
    title: "Photographing Egypt: What Actually Helps",
    category: "Travel Guides",
    tags: ["Photography", "Trip Planning"],
    author: editorialTeam,
    excerpt: "Timing, light, and a few practical notes for getting better photos at Egypt's major sites.",
    imageLabel: "Giza Pyramids",
    imageTone: "giza",
    image: "/photos/pexels-31133003.jpg",
    publishedAt: "2026-02-19T09:00:00+02:00",
    primaryKeyword: "egypt photography tips",
    secondaryKeywords: ["photographing the pyramids", "egypt travel photography"],
    seoTitle: "Photographing Egypt: Practical Tips | Egypt Eye",
    seoDescription: "Timing, light, and practical notes for better photos at Egypt's major sites — from the Pyramids to Luxor's temples.",
    body: [
      p("The single biggest factor in Egypt photography isn't gear — it's timing. The desert light at midday is flat and harsh; the same site an hour after sunrise or before sunset looks like a different place entirely."),
      ...bullets([
        "Arrive at opening time — both for the light and for fewer people in frame",
        "Sand and dust are hard on camera gear; a basic lens cloth and a bag that seals well go a long way",
        "Interior tomb and temple photography sometimes requires an extra ticket or is restricted — check before you go",
        "A hot air balloon flight over Luxor at sunrise is one of the more reliable ways to get a genuinely different angle on the Nile Valley",
      ]),
      callout("Some sites charge a separate camera fee, and flash photography is often restricted inside tombs to protect original pigment on the walls — always ask before shooting inside.", { tone: "Info" }),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "best-time-to-visit-jordan",
    title: "Best Time to Visit Jordan",
    category: "Travel Guides",
    tags: ["Jordan", "Trip Planning"],
    author: editorialTeam,
    excerpt: "Jordan's desert climate swings hard between seasons — here's when it actually works best.",
    imageLabel: "Petra Treasury",
    imageTone: "jordan",
    image: "/photos/pexels-15998100.jpg",
    destinations: ["Jordan"],
    publishedAt: "2026-02-20T09:00:00+02:00",
    primaryKeyword: "best time to visit jordan",
    secondaryKeywords: ["jordan weather", "when to go to petra"],
    seoTitle: "Best Time to Visit Jordan | Egypt Eye",
    seoDescription: "When to visit Jordan for the best weather at Petra, Wadi Rum, and the Dead Sea — and what to expect in each season.",
    body: [
      p("Jordan's climate is a true desert climate — hot, dry summers and genuinely cold winter nights, especially in the desert and at altitude in Amman."),
      h2("Spring (March-May) and Autumn (September-November)"),
      p("Widely considered the best windows — daytime temperatures are comfortable for walking through Petra or hiking in Wadi Rum, and nights aren't yet (or still) uncomfortably cold."),
      h2("Summer (June-August)"),
      p("Hot, particularly in Petra and Wadi Rum, where there's little shade. Early starts become essential rather than optional. The Dead Sea and Aqaba's coast are more forgiving, since there's water nearby."),
      h2("Winter (December-February)"),
      p("Mild by day in most of the country, but desert nights — especially camping in Wadi Rum — get cold enough that a proper layer isn't optional. Amman occasionally sees snow."),
    ],
  },

  // --- History & culture ---
  {
    status: "published",
    featured: false,
    slug: "who-was-ramses-ii",
    title: "Who Was Ramses II?",
    category: "Ancient Egypt",
    tags: ["Ancient Egypt", "History"],
    author: editorialTeam,
    excerpt: "The pharaoh behind Abu Simbel, a 66-year reign, and more monuments than any ruler before or after him.",
    imageLabel: "Abu Simbel",
    imageTone: "nile",
    image: "/photos/pexels-5488754.jpg",
    publishedAt: "2026-02-21T09:00:00+02:00",
    primaryKeyword: "who was ramses ii",
    secondaryKeywords: ["ramses the great", "abu simbel pharaoh"],
    seoTitle: "Who Was Ramses II? | Egypt Eye",
    seoDescription: "The pharaoh behind Abu Simbel — Ramses II's 66-year reign, his military campaigns, and why he built more than any ruler before him.",
    body: [
      p("Ramses II ruled Egypt for 66 years, from roughly 1279 to 1213 BCE, and used that unusually long reign to build more monuments than any pharaoh before or since — Abu Simbel, the Ramesseum, additions to Karnak and Luxor Temple, and colossal statues across the country, several still standing."),
      h2("The Battle of Kadesh"),
      p("Ramses fought the Hittites at Kadesh in one of history's earliest documented battles, and — even though the outcome was closer to a draw — had it recorded across multiple temple walls as a decisive Egyptian victory. It's a useful early example of propaganda as a genre."),
      h2("Why Abu Simbel exists"),
      p("Abu Simbel's two temples, carved directly into a sandstone cliff, were positioned so that twice a year sunlight reaches deep into the inner sanctuary to illuminate statues of Ramses himself alongside the gods — a level of architectural ambition matched by very few other ancient structures."),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "who-was-cleopatra",
    title: "Who Was Cleopatra, Really?",
    category: "Ancient Egypt",
    tags: ["Ancient Egypt", "History"],
    author: editorialTeam,
    excerpt: "Egypt's last active pharaoh, and how much of her popular image comes from Roman propaganda rather than history.",
    imageLabel: "Alexandria Coast",
    imageTone: "redsea",
    image: "/photos/pexels-15238644.jpg",
    publishedAt: "2026-02-22T09:00:00+02:00",
    primaryKeyword: "who was cleopatra",
    secondaryKeywords: ["cleopatra history", "cleopatra egypt"],
    seoTitle: "Who Was Cleopatra? | Egypt Eye",
    seoDescription: "Egypt's last active pharaoh — what's actually documented about Cleopatra, versus what comes from later Roman propaganda.",
    body: [
      p("Cleopatra VII was the last active pharaoh of ancient Egypt, ruling from 51 to 30 BCE, and Greek by ancestry — a member of the Ptolemaic dynasty descended from one of Alexander the Great's generals, not ethnically Egyptian, though she was reportedly the only Ptolemaic ruler who bothered to learn the Egyptian language."),
      h2("Politics, not just romance"),
      p("Her alliances with Julius Caesar and later Mark Antony are usually framed as romances, but they were, first and foremost, political strategy — attempts to keep Egypt independent against an expanding Rome. It worked for a while."),
      h2("The propaganda problem"),
      p("Much of Cleopatra's popular image — manipulative, purely seductive — comes from Roman writers working after her death, under Augustus, who had every incentive to justify his war against her and Mark Antony by discrediting her afterward. Contemporary accounts describe her primarily as sharp, multilingual, and politically capable."),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "abu-simbel-relocation-story",
    title: "How Abu Simbel Was Moved to Save It From Flooding",
    category: "Behind the Scenes",
    tags: ["Ancient Egypt", "Abu Simbel"],
    author: editorialTeam,
    excerpt: "A UNESCO project cut the temples into 20-ton blocks and reassembled them 65 meters higher.",
    imageLabel: "Abu Simbel",
    imageTone: "nile",
    image: "/photos/pexels-18991573.jpg",
    publishedAt: "2026-02-23T09:00:00+02:00",
    primaryKeyword: "abu simbel relocation",
    secondaryKeywords: ["abu simbel moved", "abu simbel history"],
    seoTitle: "How Abu Simbel Was Moved | Egypt Eye",
    seoDescription: "How UNESCO relocated the Abu Simbel temples block by block in the 1960s to save them from the rising waters of Lake Nasser.",
    body: [
      p("Abu Simbel's temples don't stand where Ramses II built them. When Egypt constructed the Aswan High Dam in the 1960s, the resulting Lake Nasser would have submerged both temples entirely — so, in one of the largest archaeological rescue projects ever undertaken, UNESCO coordinated their relocation."),
      h2("How it was done"),
      p("Between 1964 and 1968, engineers cut both temples into more than 1,000 blocks, some weighing over 20 tons, and reassembled them 65 meters higher and 200 meters back from the original site — rebuilt to match the original orientation so closely that the temple's famous solar alignment (sunlight reaching the inner sanctuary on specific dates) still functions."),
      p("It's rare that a historic site's backstory is nearly as remarkable as the site itself, but Abu Simbel is a genuine case of that — a monument saved not by luck, but by a deliberate, internationally funded engineering effort."),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "rosetta-stone-explained",
    title: "The Rosetta Stone: How Hieroglyphics Were Finally Decoded",
    category: "Ancient Egypt",
    tags: ["Ancient Egypt", "History"],
    author: editorialTeam,
    excerpt: "One slab of granodiorite, three scripts, and the key that unlocked a language nobody could read for 1,400 years.",
    imageLabel: "Egyptian Museum",
    imageTone: "giza",
    image: "/photos/pexels-4353815.jpg",
    publishedAt: "2026-02-24T09:00:00+02:00",
    primaryKeyword: "rosetta stone explained",
    secondaryKeywords: ["rosetta stone history", "how hieroglyphics were decoded"],
    seoTitle: "The Rosetta Stone Explained | Egypt Eye",
    seoDescription: "How the Rosetta Stone's three parallel scripts finally let scholars decode hieroglyphics, 1,400 years after the writing system fell out of use.",
    body: [
      p("By the time Napoleon's troops found the Rosetta Stone in 1799, nobody had been able to read hieroglyphics for roughly 1,400 years — the script had fallen out of use as Egypt shifted to Coptic and Greek, and the knowledge to read it simply died out."),
      h2("Three scripts, one decree"),
      p("The stone carries the same royal decree, from 196 BCE, written in three scripts: hieroglyphics, Demotic (an everyday Egyptian script), and Ancient Greek — which scholars could still read. That gave them a way in."),
      h2("Champollion's breakthrough"),
      p("It took until 1822 for French scholar Jean-François Champollion to fully crack the system, realizing hieroglyphics combined phonetic sounds with symbolic meaning rather than being purely pictorial. His work reopened a language that had been unreadable for well over a millennium."),
      callout("The original Rosetta Stone is held at the British Museum, not in Egypt — a fact that still generates real debate over repatriation of Egyptian antiquities.", { tone: "Info" }),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "curse-of-the-pharaohs-myth-or-fact",
    title: "The Curse of the Pharaohs: Where the Myth Actually Came From",
    category: "Culture",
    tags: ["Ancient Egypt", "Culture"],
    author: editorialTeam,
    excerpt: "Tutankhamun's tomb, a run of unlucky deaths, and how a newspaper turned coincidence into legend.",
    imageLabel: "Valley of the Kings",
    imageTone: "luxor",
    image: "/photos/pexels-18934684.jpg",
    publishedAt: "2026-02-25T09:00:00+02:00",
    primaryKeyword: "curse of the pharaohs",
    secondaryKeywords: ["tutankhamun curse", "mummy curse egypt"],
    seoTitle: "The Curse of the Pharaohs: Myth or Fact? | Egypt Eye",
    seoDescription: "Where the 'curse of the pharaohs' legend actually came from — Tutankhamun's tomb, a string of deaths, and 1920s newspaper sensationalism.",
    body: [
      p("The 'curse of the pharaohs' traces almost entirely to one event: the 1923 death of Lord Carnarvon, financial backer of the team that discovered Tutankhamun's tomb, a few months after the excavation. Newspapers ran with it, and the legend has outlived the actual details ever since."),
      h2("What actually happened"),
      p("Carnarvon died from blood poisoning after a mosquito bite became infected — a real but mundane cause of death in the 1920s, well before antibiotics. Of the other people present at the tomb's opening, most lived for decades afterward; Howard Carter himself, the lead archaeologist, lived another 17 years."),
      p("Statistically, there was never anything unusual about the death rate among the excavation team. The 'curse' was largely a newspaper sales story, seized on because it was a better headline than 'man dies of infected mosquito bite.'"),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "ancient-egyptian-gods-explained",
    title: "Ancient Egyptian Gods: A Short Introduction",
    category: "Ancient Egypt",
    tags: ["Ancient Egypt", "Culture"],
    author: editorialTeam,
    excerpt: "Who Ra, Isis, Horus, and Anubis actually were, and why Egyptian temples are dedicated to them.",
    imageLabel: "Karnak Temple",
    imageTone: "luxor",
    image: "/photos/pexels-15131541.jpg",
    publishedAt: "2026-02-26T09:00:00+02:00",
    primaryKeyword: "ancient egyptian gods",
    secondaryKeywords: ["egyptian mythology", "egyptian gods explained"],
    seoTitle: "Ancient Egyptian Gods Explained | Egypt Eye",
    seoDescription: "A short introduction to Egypt's major gods — Ra, Isis, Horus, and Anubis — and why so many temples are dedicated to them.",
    body: [
      p("Ancient Egyptian religion had well over a thousand named deities across its history, but a handful show up again and again on temple walls, and knowing them makes visiting the sites considerably more legible."),
      ...bullets([
        "Ra — the sun god, often depicted with a falcon head and sun disk; central to royal legitimacy",
        "Isis — goddess of magic and motherhood, worshipped at Philae Temple in Aswan",
        "Horus — falcon-headed god of kingship, honored at the Temple of Edfu",
        "Anubis — jackal-headed god of mummification and the afterlife",
        "Osiris — god of the underworld and resurrection, Isis's husband",
        "Hathor — goddess of love, music, and joy, honored at the Temple of Dendera",
      ]),
      p("Most major temples are dedicated to a specific triad of gods, which is part of why Karnak, Luxor, Edfu, and Dendera all feel distinct despite sharing a broadly similar architectural layout."),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "how-to-read-hieroglyphics-basics",
    title: "How to Read Hieroglyphics: The Basics",
    category: "Ancient Egypt",
    tags: ["Ancient Egypt"],
    author: editorialTeam,
    excerpt: "You won't leave fluent, but a few symbols make temple walls far more readable.",
    imageLabel: "Karnak Temple",
    imageTone: "luxor",
    image: "/photos/pexels-34101559.jpg",
    publishedAt: "2026-02-27T09:00:00+02:00",
    primaryKeyword: "how to read hieroglyphics",
    secondaryKeywords: ["hieroglyphics basics", "egyptian hieroglyphs"],
    seoTitle: "How to Read Hieroglyphics: The Basics | Egypt Eye",
    seoDescription: "A few basic hieroglyphic symbols worth knowing before visiting Egypt's temples — cartouches, the ankh, and how to spot a pharaoh's name.",
    body: [
      p("Nobody expects to become fluent from a blog post, but a handful of recurring symbols make Egypt's temple walls significantly more readable, and guides will often point them out if you know to ask."),
      ...bullets([
        "The cartouche — an oval loop surrounding a name, always marking royalty",
        "The ankh — the looped cross symbolizing life",
        "The eye of Horus (wadjet) — protection and royal power",
        "The scarab beetle — rebirth and the sun's daily cycle",
        "A seated figure with a feather headdress — often Maat, goddess of truth and balance",
      ]),
      p("Once you can spot a cartouche, you can start noticing which pharaoh's name repeats across a given wall — a small but genuinely satisfying skill to pick up mid-trip."),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "nubian-culture-and-history",
    title: "Nubian Culture: Aswan's Living History",
    category: "Culture",
    tags: ["Aswan", "Culture", "History"],
    author: editorialTeam,
    excerpt: "Nubia's own kingdoms predate and outlasted several pharaonic dynasties — and its culture is still visible in Aswan today.",
    imageLabel: "Nubian Village",
    imageTone: "nile",
    image: "/photos/pexels-18991544.jpg",
    destinations: ["Aswan"],
    publishedAt: "2026-02-28T09:00:00+02:00",
    primaryKeyword: "nubian culture aswan",
    secondaryKeywords: ["nubian village egypt", "nubia history"],
    seoTitle: "Nubian Culture: Aswan's Living History | Egypt Eye",
    seoDescription: "Nubia's own ancient kingdoms and its living culture today — colorful villages, distinct language, and a history separate from pharaonic Egypt.",
    body: [
      p("Nubia is often treated as a footnote to pharaonic Egypt, but it had its own kingdoms — Kerma, Kush, and others — that at times ruled Egypt itself, not the other way around. The Nubian Pharaohs of the 25th Dynasty governed a unified Egypt and Nubia together."),
      h2("Nubian culture today"),
      p("Aswan's Nubian villages, with their brightly painted domed houses, are a living continuation of this culture rather than a museum piece — distinct language, music, and cuisine that differ noticeably from the rest of Egypt."),
      p("A visit to a Nubian village, often paired with a felucca ride around Elephantine Island, is less about ancient ruins and more about a culture that's still actively practiced along this stretch of the Nile."),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "bedouin-culture-sinai",
    title: "Bedouin Culture in the Sinai",
    category: "Culture",
    tags: ["Sinai", "Culture"],
    author: editorialTeam,
    excerpt: "The desert communities behind Wadi Rum's camps and Sinai's hiking guides.",
    imageLabel: "Desert Stargazing",
    imageTone: "desert",
    image: "/photos/pexels-11768608.jpg",
    destinations: ["Sinai"],
    publishedAt: "2026-03-01T09:00:00+02:00",
    primaryKeyword: "bedouin culture sinai",
    secondaryKeywords: ["bedouin egypt", "sinai desert culture"],
    seoTitle: "Bedouin Culture in the Sinai | Egypt Eye",
    seoDescription: "Who the Bedouin communities of the Sinai are, and how their traditional knowledge of the desert shapes experiences like the Mount Sinai hike.",
    body: [
      p("The Bedouin of the Sinai Peninsula are traditionally semi-nomadic desert communities with a distinct set of tribes, dialects, and customs — and they're the reason experiences like the Mount Sinai night hike or a Wadi Rum-style desert camp work at all, since navigating and surviving this terrain long-term is knowledge built over generations."),
      ...bullets([
        "Bedouin guides lead most Mount Sinai and Sahara-adjacent desert treks",
        "Hospitality is a genuinely central Bedouin value — tea offered to guests is a real custom, not a tourist performance",
        "Traditional zarb cooking (meat and vegetables slow-cooked underground) comes from Bedouin desert-camp tradition",
      ]),
      p("Spending a night at a Bedouin-run camp, in the Sinai or in Wadi Rum, is as much a chance to learn how people actually live in this landscape as it is a stargazing opportunity."),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "islamic-cairo-architecture-guide",
    title: "Islamic Cairo's Architecture: A Short Guide",
    category: "Culture",
    tags: ["Cairo", "Islamic Cairo", "Architecture"],
    author: editorialTeam,
    excerpt: "Minarets, mashrabiya screens, and why Cairo has more medieval Islamic monuments than almost anywhere else.",
    imageLabel: "Islamic Cairo",
    imageTone: "giza",
    image: "/photos/pexels-18991500.jpg",
    destinations: ["Cairo"],
    publishedAt: "2026-03-02T09:00:00+02:00",
    primaryKeyword: "islamic cairo architecture",
    secondaryKeywords: ["cairo mosques", "medieval cairo"],
    seoTitle: "Islamic Cairo's Architecture: A Guide | Egypt Eye",
    seoDescription: "A short guide to Islamic Cairo's architecture — minarets, mashrabiya screens, and why the district holds one of the densest concentrations of medieval Islamic monuments in the world.",
    body: [
      p("Cairo holds one of the highest concentrations of medieval Islamic architecture anywhere in the world — hundreds of mosques, madrasas, and mausoleums dating from the 7th century through the Ottoman period, many still standing largely intact along Al-Muizz Street and the surrounding district."),
      ...bullets([
        "Minarets — the tall towers used for the call to prayer, styles varying by era and dynasty",
        "Mashrabiya — carved wooden lattice screens on windows, letting airflow through while blocking direct sun and outside view",
        "Muqarnas — honeycomb-like decorative vaulting often found over doorways and domes",
        "Sabil-kuttabs — combined public water fountains and Quranic schools, a distinctly Cairene building type",
      ]),
      p("Walking Al-Muizz Street end to end is, in effect, walking through several centuries of Islamic architectural styles laid out consecutively along one road."),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "coptic-christianity-in-egypt",
    title: "Coptic Christianity in Egypt: A Short History",
    category: "Culture",
    tags: ["Cairo", "Culture", "History"],
    author: editorialTeam,
    excerpt: "One of the oldest Christian communities in the world, still centered in Cairo's walled Coptic quarter.",
    imageLabel: "Coptic Cairo",
    imageTone: "giza",
    image: "/photos/pexels-17963262.jpg",
    destinations: ["Cairo"],
    publishedAt: "2026-03-03T09:00:00+02:00",
    primaryKeyword: "coptic christianity egypt",
    secondaryKeywords: ["coptic cairo", "coptic christians egypt"],
    seoTitle: "Coptic Christianity in Egypt: A History | Egypt Eye",
    seoDescription: "A short history of Coptic Christianity in Egypt — one of the oldest Christian communities in the world, and where to see its history in Cairo today.",
    body: [
      p("Coptic Christianity traces its roots to the 1st century CE, traditionally to Saint Mark's arrival in Alexandria — making it one of the oldest continuous Christian communities anywhere. Today, Copts remain Egypt's largest religious minority."),
      h2("Coptic Cairo"),
      p("The walled district known as Coptic Cairo holds some of the faith's oldest surviving sites: the Hanging Church, built atop a Roman fortress gate; the Church of St. Sergius and Bacchus, built over a cave tradition holds sheltered the Holy Family; and Ben Ezra Synagogue, a reminder of the district's older Jewish community as well."),
      p("Coptic identity carries its own script (a descendant of ancient Egyptian, written with Greek letters), its own calendar, and its own liturgical traditions — a genuinely distinct thread running through Egypt's broader religious history."),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "mummification-process-explained",
    title: "How Ancient Egyptian Mummification Actually Worked",
    category: "Ancient Egypt",
    tags: ["Ancient Egypt", "History"],
    author: editorialTeam,
    excerpt: "A 70-day process, canopic jars, and why the brain was the one organ they didn't bother preserving.",
    imageLabel: "Egyptian Museum",
    imageTone: "giza",
    image: "/photos/pexels-2076370.jpg",
    publishedAt: "2026-03-04T09:00:00+02:00",
    primaryKeyword: "mummification process egypt",
    secondaryKeywords: ["how mummies were made", "egyptian mummification"],
    seoTitle: "How Egyptian Mummification Worked | Egypt Eye",
    seoDescription: "How ancient Egyptian mummification actually worked — the 70-day process, canopic jars, and what happened to each organ.",
    body: [
      p("Mummification in ancient Egypt took roughly 70 days from start to finish, carried out by trained embalmers whose techniques improved considerably over the centuries — the best-preserved royal mummies date from the New Kingdom, well after the practice had been refined."),
      h2("The process, roughly"),
      ...bullets([
        "Internal organs (except the heart) were removed and preserved separately in canopic jars",
        "The brain was removed through the nose and discarded — Egyptians believed the heart, not the brain, was the seat of intelligence and emotion",
        "The body was packed and covered in natron, a natural salt, for about 40 days to dry it out completely",
        "The body was then wrapped in layers of linen, often with amulets placed between the layers for protection in the afterlife",
      ]),
      p("The goal wasn't preservation for its own sake — it was practical belief. Egyptians held that the soul needed a recognizable body to return to in the afterlife, which is exactly why so much care went into the process."),
    ],
  },

  // --- Site-specific guides ---
  {
    status: "published",
    featured: false,
    slug: "karnak-temple-complete-guide",
    title: "Karnak Temple: A Complete Guide",
    category: "Ancient Egypt",
    tags: ["Luxor", "Ancient Egypt"],
    author: editorialTeam,
    excerpt: "Egypt's largest religious complex, built and expanded over roughly 2,000 years by more than 30 pharaohs.",
    imageLabel: "Karnak Temple",
    imageTone: "luxor",
    image: "/photos/pexels-18934707.jpg",
    destinations: ["Luxor"],
    publishedAt: "2026-03-05T09:00:00+02:00",
    primaryKeyword: "karnak temple guide",
    secondaryKeywords: ["karnak temple luxor", "hypostyle hall"],
    seoTitle: "Karnak Temple: A Complete Guide | Egypt Eye",
    seoDescription: "A complete guide to Karnak Temple — the Hypostyle Hall, the Avenue of Sphinxes, and how more than 30 pharaohs expanded the complex over 2,000 years.",
    body: [
      p("Karnak isn't a single temple — it's a complex of temples, chapels, and pylons built and expanded continuously for roughly 2,000 years, by more than 30 different pharaohs, making it the largest ancient religious site in the world by area."),
      h2("What to see"),
      ...bullets([
        "The Great Hypostyle Hall — 134 massive columns, some over 20 meters tall, several still bearing original color",
        "The Avenue of Sphinxes — a processional way that once connected Karnak directly to Luxor Temple, partially restored",
        "The Sacred Lake — used for ritual purification by ancient priests",
        "Obelisks of Hatshepsut and Thutmose I, among the tallest surviving from ancient Egypt",
      ]),
      p("A visit takes two to three hours at a comfortable pace. Karnak's own Sound & Light Show, held after dark, is worth pairing with a daytime visit rather than treating as a substitute for one."),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "luxor-temple-guide",
    title: "Luxor Temple: A Guide",
    category: "Ancient Egypt",
    tags: ["Luxor", "Ancient Egypt"],
    author: editorialTeam,
    excerpt: "Unlike most Egyptian temples, Luxor Temple sits in the middle of a living, modern city.",
    imageLabel: "Luxor Temple",
    imageTone: "luxor",
    image: "/photos/pexels-31217077.jpg",
    destinations: ["Luxor"],
    publishedAt: "2026-03-06T09:00:00+02:00",
    primaryKeyword: "luxor temple guide",
    secondaryKeywords: ["luxor temple egypt", "luxor temple at night"],
    seoTitle: "Luxor Temple: A Guide | Egypt Eye",
    seoDescription: "A guide to Luxor Temple — built mainly by Amenhotep III and Ramesses II, and one of the few major Egyptian temples set directly inside a modern city.",
    body: [
      p("Unlike most of Egypt's major temples, which sit apart from modern settlements, Luxor Temple is built directly into the fabric of the city — cafés and streets run right up against its walls, which makes it one of the more accessible and atmospheric temples to visit, especially at dusk when it's lit."),
      h2("What's there"),
      ...bullets([
        "Built mainly by Amenhotep III and expanded by Ramesses II",
        "A colossal seated statue of Ramesses II at the entrance pylon",
        "An Avenue of Sphinxes leading toward Karnak, partially restored",
        "A mosque built directly into the temple structure, still active today — a genuine layering of history rather than a preserved relic",
      ]),
      p("Luxor Temple is particularly worth visiting after dark, when it's lit and considerably cooler than during the day — a shorter, easier stop than Karnak, and a good closing point to an East Bank day."),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "valley-of-the-queens-guide",
    title: "Valley of the Queens: A Guide",
    category: "Ancient Egypt",
    tags: ["Luxor", "Ancient Egypt"],
    author: editorialTeam,
    excerpt: "Home to Nefertari's tomb — widely considered the most beautifully decorated tomb in Egypt.",
    imageLabel: "Valley of the Kings",
    imageTone: "luxor",
    image: "/photos/pexels-18934713.jpg",
    destinations: ["Luxor"],
    publishedAt: "2026-03-07T09:00:00+02:00",
    primaryKeyword: "valley of the queens",
    secondaryKeywords: ["nefertari tomb", "luxor west bank"],
    seoTitle: "Valley of the Queens Guide | Egypt Eye",
    seoDescription: "A guide to the Valley of the Queens on Luxor's West Bank — home to Nefertari's tomb, widely considered the most beautifully decorated in Egypt.",
    body: [
      p("The Valley of the Queens sits a short distance from the Valley of the Kings and holds the tombs of royal wives, princes, and princesses — smaller in scale than the kings' tombs nearby, but in several cases better preserved."),
      h2("Nefertari's tomb"),
      p("The valley's centerpiece is the tomb of Nefertari, Ramesses II's principal wife — widely regarded as the most beautifully decorated tomb in all of Egypt, with vivid, still-vibrant color that's rare at this age. Access is limited and usually requires a separate, higher-cost ticket due to preservation concerns."),
      p("Several other tombs in the valley are included in the standard entrance fee and are well worth the visit even without the Nefertari add-on."),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "ramesseum-guide",
    title: "The Ramesseum: Ramses II's Mortuary Temple",
    category: "Ancient Egypt",
    tags: ["Luxor", "Ancient Egypt"],
    author: editorialTeam,
    excerpt: "The temple that partly inspired Shelley's 'Ozymandias' — a fallen colossus and a much quieter site than Luxor's headline temples.",
    imageLabel: "Valley of the Kings",
    imageTone: "luxor",
    image: "/photos/pexels-18934674.jpg",
    destinations: ["Luxor"],
    publishedAt: "2026-03-08T09:00:00+02:00",
    primaryKeyword: "ramesseum luxor",
    secondaryKeywords: ["ramses ii mortuary temple", "ozymandias temple"],
    seoTitle: "The Ramesseum: A Guide | Egypt Eye",
    seoDescription: "A guide to the Ramesseum, Ramses II's mortuary temple on Luxor's West Bank — the fallen colossus that inspired Shelley's 'Ozymandias.'",
    body: [
      p("The Ramesseum was Ramses II's mortuary temple, built to sustain his cult after death — and it's the site of a fallen colossal statue, once over 17 meters tall, that partly inspired Percy Bysshe Shelley's poem 'Ozymandias,' about the inevitable decay of even the greatest monuments."),
      p("Compared to Karnak or Luxor Temple, the Ramesseum sees relatively few visitors, which makes it one of the more atmospheric West Bank stops — enough quiet to actually take in the scale of what's left standing, and what's fallen."),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "medinet-habu-guide",
    title: "Medinet Habu: Ramses III's Mortuary Temple",
    category: "Ancient Egypt",
    tags: ["Luxor", "Ancient Egypt"],
    author: editorialTeam,
    excerpt: "One of the best-preserved temples on the West Bank, with battle reliefs still holding their original color.",
    imageLabel: "Valley of the Kings",
    imageTone: "luxor",
    image: "/photos/pexels-16386720.jpg",
    destinations: ["Luxor"],
    publishedAt: "2026-03-09T09:00:00+02:00",
    primaryKeyword: "medinet habu luxor",
    secondaryKeywords: ["ramses iii temple", "medinet habu temple"],
    seoTitle: "Medinet Habu: A Guide | Egypt Eye",
    seoDescription: "A guide to Medinet Habu, Ramses III's mortuary temple on Luxor's West Bank — among the best-preserved temples in Egypt, with original color still visible.",
    body: [
      p("Medinet Habu, the mortuary temple of Ramses III, is often cited by Egyptologists as one of the best-preserved temples in the country — the fortified enclosure walls, the reliefs depicting his military campaigns against the 'Sea Peoples,' and traces of original paint that have survived on parts of the ceiling."),
      p("It's less visited than Karnak or the Valley of the Kings despite the preservation quality, which makes it a good addition for travelers with an extra half-day on the West Bank and an interest in seeing color and detail that's faded almost entirely elsewhere."),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "colossi-of-memnon-guide",
    title: "The Colossi of Memnon: What's Left of a Vanished Temple",
    category: "Ancient Egypt",
    tags: ["Luxor", "Ancient Egypt"],
    author: editorialTeam,
    excerpt: "Two seated statues, all that remains of what was once Egypt's largest temple.",
    imageLabel: "Valley of the Kings",
    imageTone: "luxor",
    image: "/photos/pexels-18934680.jpg",
    destinations: ["Luxor"],
    publishedAt: "2026-03-10T09:00:00+02:00",
    primaryKeyword: "colossi of memnon",
    secondaryKeywords: ["colossi of memnon luxor", "amenhotep iii statues"],
    seoTitle: "The Colossi of Memnon: A Guide | Egypt Eye",
    seoDescription: "The Colossi of Memnon on Luxor's West Bank — two 18-meter seated statues, all that survives of what was once Egypt's largest mortuary temple.",
    body: [
      p("The two seated statues known as the Colossi of Memnon, each roughly 18 meters tall, once flanked the entrance to Amenhotep III's mortuary temple — a complex that, in its day, was reportedly the largest religious structure in Egypt, larger even than Karnak. Almost none of it survives beyond these two figures."),
      p("They sit directly beside the main road on the West Bank, making them one of the easiest stops to fold into any Luxor itinerary — usually a brief photo stop rather than a dedicated visit, but a genuine reminder of how much has been lost even from Egypt's largest monuments."),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "siwa-oasis-travel-guide",
    title: "Siwa Oasis: Egypt's Most Remote Escape",
    category: "Travel Guides",
    tags: ["Siwa Oasis", "Desert"],
    author: editorialTeam,
    excerpt: "A distinct Berber culture, salt lakes, and one of the quietest corners of Egypt's Western Desert.",
    imageLabel: "Siwa Oasis",
    imageTone: "desert",
    image: "/photos/pexels-12437205.jpg",
    destinations: ["Siwa Oasis"],
    publishedAt: "2026-03-11T09:00:00+02:00",
    primaryKeyword: "siwa oasis guide",
    secondaryKeywords: ["siwa oasis egypt", "siwa travel guide"],
    seoTitle: "Siwa Oasis Travel Guide | Egypt Eye",
    seoDescription: "A guide to Siwa Oasis — Egypt's most remote major oasis, its distinct Berber culture, salt lakes, and the Oracle Temple Alexander the Great once visited.",
    body: [
      p("Siwa Oasis sits close to the Libyan border, roughly eight hours by road from Cairo — remote enough that it developed a genuinely distinct culture, with its own Berber (Amazigh) language, separate from the rest of Egypt."),
      h2("What's there"),
      ...bullets([
        "The Oracle Temple, which Alexander the Great reportedly traveled here specifically to consult",
        "Shali Fortress, a centuries-old mudbrick citadel that dominates the town's skyline",
        "Salt lakes with high enough mineral content to float in, similar in effect to the Dead Sea",
        "Palm groves and freshwater springs that make Siwa genuinely green against the surrounding desert",
      ]),
      p("Siwa's distance from Cairo means it suits travelers with time to spend, rather than a quick add-on — most visits run two to three days given the drive."),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "saqqara-step-pyramid-guide",
    title: "Saqqara's Step Pyramid: Egypt's First Pyramid",
    category: "Ancient Egypt",
    tags: ["Cairo", "Ancient Egypt", "Pyramids"],
    author: editorialTeam,
    excerpt: "Built before Giza's pyramids, and the structure that made everything after it possible.",
    imageLabel: "Giza Pyramids",
    imageTone: "giza",
    image: "/photos/pexels-29390088.jpg",
    destinations: ["Cairo"],
    publishedAt: "2026-03-12T09:00:00+02:00",
    primaryKeyword: "saqqara step pyramid",
    secondaryKeywords: ["djoser pyramid", "egypt's first pyramid"],
    seoTitle: "Saqqara's Step Pyramid: A Guide | Egypt Eye",
    seoDescription: "A guide to Saqqara's Step Pyramid of Djoser — built before Giza's pyramids, and the structure that made everything that followed it possible.",
    body: [
      p("Before Giza's smooth-sided pyramids existed, there was Saqqara's Step Pyramid, built for Pharaoh Djoser around 2670 BCE — the first monumental stone building in Egyptian history, and the design that every later pyramid ultimately descends from."),
      p("Designed by the architect Imhotep, later deified for the achievement, the Step Pyramid began as a simpler mastaba tomb and was expanded in stages into its distinctive six-tiered form. The surrounding funerary complex, with its columned entrance hall and courtyards, is often overlooked in favor of the pyramid itself but is genuinely worth the extra time."),
      callout("Saqqara pairs naturally with a Dahshur visit on the same day — both sit close together southwest of Cairo, and together they tell the fuller story of how pyramid-building actually developed before Giza.", { tone: "Highlight" }),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "dahshur-bent-pyramid-guide",
    title: "Dahshur's Bent Pyramid & Red Pyramid",
    category: "Ancient Egypt",
    tags: ["Cairo", "Ancient Egypt", "Pyramids"],
    author: editorialTeam,
    excerpt: "The pyramid where ancient builders had to change the angle partway through, and the one that came next.",
    imageLabel: "Giza Pyramids",
    imageTone: "giza",
    image: "/photos/pexels-15127142.jpg",
    destinations: ["Cairo"],
    publishedAt: "2026-03-13T09:00:00+02:00",
    primaryKeyword: "dahshur bent pyramid",
    secondaryKeywords: ["red pyramid egypt", "dahshur pyramids"],
    seoTitle: "Dahshur's Bent Pyramid & Red Pyramid | Egypt Eye",
    seoDescription: "A guide to Dahshur's Bent Pyramid and Red Pyramid — the two structures that bridge Saqqara's Step Pyramid and Giza's smooth-sided design.",
    body: [
      p("Dahshur holds two pyramids that show the exact moment Egyptian builders figured out how to make a true, smooth-sided pyramid — a technical transition that Saqqara and Giza alone don't fully explain."),
      h2("The Bent Pyramid"),
      p("Built for Pharaoh Sneferu, the Bent Pyramid changes angle partway up its face — the lower section steep, the upper section noticeably shallower. The likely explanation is structural: builders realized the original angle risked collapse and adjusted mid-construction, leaving the change visible for anyone who visits today."),
      h2("The Red Pyramid"),
      p("Sneferu tried again nearby, this time getting the angle right from the base — the Red Pyramid is considered Egypt's first successful true smooth-sided pyramid, built before the Great Pyramid of Giza and, in effect, its direct predecessor."),
      p("Dahshur sees a fraction of Giza's visitor numbers, and both pyramids can be entered — a genuinely different, quieter experience than the interior of the Great Pyramid."),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "abydos-temple-of-seti-guide",
    title: "Abydos: The Temple of Seti I",
    category: "Ancient Egypt",
    tags: ["Ancient Egypt"],
    author: editorialTeam,
    excerpt: "Some of the finest relief carving surviving from ancient Egypt, in a temple most itineraries skip.",
    imageLabel: "Dendera Temple",
    imageTone: "nile",
    image: "/photos/pexels-18934711.jpg",
    publishedAt: "2026-03-14T09:00:00+02:00",
    primaryKeyword: "abydos temple egypt",
    secondaryKeywords: ["temple of seti i", "abydos egypt"],
    seoTitle: "Abydos: The Temple of Seti I | Egypt Eye",
    seoDescription: "A guide to Abydos and the Temple of Seti I — home to some of the finest surviving relief carving in ancient Egypt, and the Abydos King List.",
    body: [
      p("Abydos was one of ancient Egypt's most sacred sites, believed to be connected to the god Osiris, and the Temple of Seti I here holds some of the finest relief carving to survive from anywhere in ancient Egypt — deep, precise, and still crisp enough that the craftsmanship reads clearly even today."),
      p("The temple also holds the Abydos King List, a carved chronological list of pharaohs that's been a key reference for Egyptologists reconstructing the sequence of ancient Egyptian rulers."),
      p("Abydos is usually paired with Dendera on the same day trip from Luxor — both are a couple of hours' drive and, together, cover two of the country's most artistically significant temples that most standard itineraries otherwise skip."),
    ],
  },

  // --- Listicles & planning ---
  {
    status: "published",
    featured: false,
    slug: "best-photo-spots-in-egypt",
    title: "The Best Photo Spots in Egypt",
    category: "Travel Guides",
    tags: ["Photography", "Trip Planning"],
    author: editorialTeam,
    excerpt: "Where the light, the angle, and the crowd size actually line up.",
    imageLabel: "Giza Pyramids",
    imageTone: "giza",
    image: "/photos/pexels-28013729.jpg",
    publishedAt: "2026-03-15T09:00:00+02:00",
    primaryKeyword: "best photo spots in egypt",
    secondaryKeywords: ["egypt photography locations", "instagram spots egypt"],
    seoTitle: "The Best Photo Spots in Egypt | Egypt Eye",
    seoDescription: "The best photo locations in Egypt — from the Giza Panoramic Point to a Luxor sunrise balloon flight — and the timing that makes each one work.",
    body: [
      ...bullets([
        "The Giza Panoramic Point — the classic wide shot with all three pyramids in frame",
        "Karnak's Hypostyle Hall — dramatic scale, best photographed early before crowds fill the columns",
        "A hot air balloon over Luxor at sunrise — a genuinely different angle on the Nile Valley",
        "Abu Simbel's facade, lit by the first direct sun of the day",
        "The White Desert at sunset, when the chalk formations pick up warm color",
        "Philae Temple from the boat crossing, before you've even landed on the island",
      ]),
      p("In almost every case, the difference between an average shot and a genuinely good one is timing — arriving at opening time, or staying for the last light, rather than visiting at midday."),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "top-egyptian-dishes-to-try",
    title: "What to Eat in Egypt: The Essential Dishes",
    category: "Culture",
    tags: ["Food", "Culture"],
    author: editorialTeam,
    excerpt: "Koshary, ful medames, and the everyday food that tells you more about Egypt than any temple wall.",
    imageLabel: "Khan el-Khalili",
    imageTone: "giza",
    image: "/photos/pexels-36090553.jpg",
    publishedAt: "2026-03-16T09:00:00+02:00",
    primaryKeyword: "what to eat in egypt",
    secondaryKeywords: ["egyptian food guide", "koshary egypt"],
    seoTitle: "What to Eat in Egypt: Essential Dishes | Egypt Eye",
    seoDescription: "The essential dishes to try in Egypt — koshary, ful medames, molokhia, and the street food worth seeking out over hotel buffets.",
    body: [
      ...bullets([
        "Koshary — rice, lentils, macaroni, and crispy onions under a spiced tomato sauce; arguably Egypt's national dish",
        "Ful medames — slow-cooked fava beans, usually eaten for breakfast with bread",
        "Molokhia — a garlicky, jute-leaf stew usually served with rice or bread",
        "Ta'meya — Egyptian falafel, made with fava beans rather than chickpeas",
        "Fresh sugarcane juice — sold from street-side presses, especially common around Khan el-Khalili",
        "Om Ali — a warm bread pudding dessert, Egypt's answer to bread-and-butter pudding",
      ]),
      p("Street food and small local restaurants are where most of this is genuinely best — worth prioritizing over hotel buffets at least a few nights of any trip."),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "best-day-trips-from-cairo",
    title: "The Best Day Trips from Cairo",
    category: "Travel Guides",
    tags: ["Cairo", "Trip Planning"],
    author: editorialTeam,
    excerpt: "What's realistically reachable from Cairo in a single day, and what isn't.",
    imageLabel: "Cairo Skyline",
    imageTone: "giza",
    image: "/photos/pexels-35797719.jpg",
    destinations: ["Cairo"],
    publishedAt: "2026-03-17T09:00:00+02:00",
    primaryKeyword: "best day trips from cairo",
    secondaryKeywords: ["cairo day trips", "day trip from cairo"],
    seoTitle: "The Best Day Trips from Cairo | Egypt Eye",
    seoDescription: "The best day trips from Cairo — Giza and Saqqara, Alexandria, Fayoum, and Dahshur — with realistic travel times for each.",
    body: [
      ...bullets([
        "Giza & Saqqara — the essential Cairo day, roughly 30-45 minutes each way",
        "Alexandria — about 2.5 hours each way, a full but doable day on the Mediterranean coast",
        "Fayoum & Wadi El Rayan — around 1.5-2 hours each way, for waterfalls and desert lake scenery",
        "Dahshur's Bent and Red Pyramids — close enough to combine with Saqqara in a single half-day",
        "Islamic and Coptic Cairo — no travel time needed if you're already based in the city",
      ]),
      p("Alexandria and Fayoum both push a full-day trip toward its practical limit given the drive — if you're short on time, Giza, Saqqara, and Islamic/Coptic Cairo combine more comfortably in a single day."),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "best-sunset-spots-in-egypt",
    title: "The Best Places to Watch the Sunset in Egypt",
    category: "Travel Guides",
    tags: ["Trip Planning", "Photography"],
    author: editorialTeam,
    excerpt: "From a Nile felucca to the White Desert, a handful of spots where sunset is worth planning around.",
    imageLabel: "Nile Felucca",
    imageTone: "nile",
    image: "/photos/pexels-36224723.jpg",
    publishedAt: "2026-03-18T09:00:00+02:00",
    primaryKeyword: "best sunset in egypt",
    secondaryKeywords: ["nile sunset", "egypt sunset spots"],
    seoTitle: "The Best Sunset Spots in Egypt | Egypt Eye",
    seoDescription: "The best places to watch the sunset in Egypt — a Nile felucca in Aswan or Cairo, the White Desert, and the Giza plateau.",
    body: [
      ...bullets([
        "A felucca on the Nile in Aswan or Cairo — sailing, no engine noise, just the water and the changing light",
        "The Giza plateau, once the crowds thin toward closing time",
        "The White Desert, when the chalk formations pick up warm color against the darkening sky",
        "A Red Sea beach in Dahab or Sharm El Sheikh, over the Sinai mountains across the gulf",
        "Wadi Rum, right before the temperature drops and the stars take over",
      ]),
      p("A felucca sail is the easiest of these to plan around a normal sightseeing schedule — an hour or two, usually right after a full day, with almost no logistics required beyond booking the boat."),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "best-souvenirs-to-buy-in-egypt",
    title: "What to Buy in Egypt: Souvenirs Worth Bringing Home",
    category: "Travel Guides",
    tags: ["Trip Planning", "Culture"],
    author: editorialTeam,
    excerpt: "What's actually worth buying in Egypt's markets, and what to skip.",
    imageLabel: "Khan el-Khalili",
    imageTone: "giza",
    image: "/photos/pexels-28515826.jpg",
    publishedAt: "2026-03-19T09:00:00+02:00",
    primaryKeyword: "egypt souvenirs",
    secondaryKeywords: ["what to buy in egypt", "khan el khalili shopping"],
    seoTitle: "What to Buy in Egypt: Souvenir Guide | Egypt Eye",
    seoDescription: "What's genuinely worth buying in Egypt's markets — spices, copperware, cotton textiles, and how to navigate the negotiation.",
    body: [
      ...bullets([
        "Spices — Egypt's spice markets sell quality that often beats what's available back home, at a fraction of the price",
        "Egyptian cotton textiles — genuinely high-quality, given the country's cotton-growing history",
        "Hand-hammered copperware and brass — a Khan el-Khalili specialty",
        "Papyrus art — worth buying from a reputable workshop rather than a street stall, where quality varies wildly",
        "Alabaster — common around Luxor, sold in various carved forms",
      ]),
      p("Negotiation is expected in most markets — starting well below the initial asking price is normal, not rude. Fixed-price shops exist too, for anyone who'd rather skip the back-and-forth."),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "best-markets-and-bazaars-in-egypt",
    title: "The Best Markets & Bazaars in Egypt",
    category: "Culture",
    tags: ["Trip Planning", "Culture"],
    author: editorialTeam,
    excerpt: "Beyond Khan el-Khalili — a handful of markets worth the detour.",
    imageLabel: "Khan el-Khalili",
    imageTone: "giza",
    image: "/photos/pexels-14529372.jpg",
    publishedAt: "2026-03-20T09:00:00+02:00",
    primaryKeyword: "egypt markets and bazaars",
    secondaryKeywords: ["khan el khalili", "aswan souk"],
    seoTitle: "The Best Markets & Bazaars in Egypt | Egypt Eye",
    seoDescription: "Egypt's best markets and bazaars — Khan el-Khalili in Cairo, the Aswan souk, and Luxor's local markets.",
    body: [
      ...bullets([
        "Khan el-Khalili, Cairo — the country's most famous bazaar, dating back to the 14th century",
        "Aswan Souk — a long, covered market street known for spices, textiles, and Nubian crafts",
        "Luxor's local markets — smaller and less touristic, good for produce and everyday goods alongside souvenirs",
        "Attarine Market, Alexandria — antiques and secondhand goods, a different character from Cairo's bazaars",
      ]),
      p("Aswan's souk in particular tends to feel less tourist-oriented than Khan el-Khalili, with a genuinely different product mix reflecting the city's Nubian influence."),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "egypt-proposal-engagement-trip-ideas",
    title: "Planning a Proposal in Egypt: A Few Ideas",
    category: "Travel Guides",
    tags: ["Romance", "Trip Planning"],
    author: editorialTeam,
    excerpt: "A handful of settings that hold up to the moment, from a sunrise balloon to a private felucca.",
    imageLabel: "Nile Felucca",
    imageTone: "nile",
    image: "/photos/pexels-20954992.jpg",
    publishedAt: "2026-03-21T09:00:00+02:00",
    primaryKeyword: "proposal in egypt",
    secondaryKeywords: ["egypt engagement trip", "romantic egypt ideas"],
    seoTitle: "Planning a Proposal in Egypt | Egypt Eye",
    seoDescription: "Ideas for planning a proposal in Egypt — a sunrise hot air balloon, a private felucca sail, or Petra by candlelight in Jordan.",
    body: [
      ...bullets([
        "A hot air balloon over Luxor at sunrise — genuinely hard to beat for scale and privacy in the basket",
        "A private felucca sail at sunset, with the Nile and the city skyline behind you",
        "Abu Simbel at first light, particularly on the solar alignment dates in February or October",
        "Petra by Night, if the trip extends into Jordan — the Treasury lit by candlelight",
      ]),
      p("Whatever the setting, arranging it privately — a chartered felucca rather than a shared boat, an early or after-hours slot at a major site — matters more to how the moment actually feels than the specific location does."),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "how-to-choose-a-nile-cruise-ship",
    title: "How to Choose a Nile Cruise Ship",
    category: "Travel Guides",
    tags: ["Nile Cruise", "Trip Planning"],
    author: editorialTeam,
    excerpt: "Cabin size, cruise length, and the one factor that matters more than either.",
    imageLabel: "Nile Valley",
    imageTone: "nile",
    image: "/photos/pexels-35556386.jpg",
    publishedAt: "2026-03-22T09:00:00+02:00",
    primaryKeyword: "how to choose a nile cruise",
    secondaryKeywords: ["best nile cruise", "nile cruise tips"],
    seoTitle: "How to Choose a Nile Cruise Ship | Egypt Eye",
    seoDescription: "What actually matters when choosing a Nile cruise — cabin size, itinerary length, and private versus shared-group excursions ashore.",
    body: [
      ...bullets([
        "Cruise length — 3, 4, or 7 nights are the standard options between Luxor and Aswan; longer isn't automatically better, but it does mean fewer early mornings squeezed into each stop",
        "Cabin position — lower decks feel the engine vibration more; higher decks and a private balcony cost more but are noticeably quieter",
        "Group size ashore — some cruises bus large groups to each temple together; a private guide, arranged separately, lets you set your own pace at each stop",
        "A dahabiya versus a standard cruise ship — a dahabiya carries a handful of cabins and sails partly under wind power, a genuinely different, slower pace than a multi-deck ship",
      ]),
      p("The single factor that affects trip satisfaction most, more than the ship itself, is whether the shore excursions are private or shared with dozens of other passengers — a private guide changes the pace of every stop, regardless of which boat you're sleeping on."),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "weather-in-egypt-by-month",
    title: "Weather in Egypt by Month: A Practical Breakdown",
    category: "Travel Guides",
    tags: ["Trip Planning"],
    author: editorialTeam,
    excerpt: "What to actually expect from Cairo, Luxor, and the Red Sea coast, month by month.",
    imageLabel: "Giza Pyramids",
    imageTone: "giza",
    image: "/photos/pexels-16908875.jpg",
    publishedAt: "2026-03-23T09:00:00+02:00",
    primaryKeyword: "egypt weather by month",
    secondaryKeywords: ["best month to visit egypt", "egypt temperature"],
    seoTitle: "Weather in Egypt by Month | Egypt Eye",
    seoDescription: "A month-by-month breakdown of Egypt's weather in Cairo, Luxor, and the Red Sea coast, to help time your trip.",
    body: [
      h2("November–February"),
      p("The coolest, most comfortable window for sightseeing in Cairo and Luxor, with pleasant daytime temperatures and cool evenings. The Red Sea coast stays swimmable, though the water is cooler than summer."),
      h2("March–May"),
      p("Warming up steadily; still comfortable for most of this window, though late May starts pushing into real heat, especially in Luxor and Aswan."),
      h2("June–August"),
      p("Genuinely hot in Cairo and Luxor, often well above 38°C (100°F) in Upper Egypt. This is the strongest season for the Red Sea coast, where sea breezes soften the heat considerably."),
      h2("September–October"),
      p("Temperatures begin easing, with October in particular becoming a favored shoulder-season window — warm, but no longer extreme."),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "egypt-jordan-combined-itinerary-guide",
    title: "Combining Egypt and Jordan: How to Plan It",
    category: "Travel Guides",
    tags: ["Jordan", "Trip Planning", "Itinerary"],
    author: editorialTeam,
    excerpt: "The logistics of visiting both countries on one trip, and how much time each side realistically needs.",
    imageLabel: "Petra Treasury",
    imageTone: "jordan",
    image: "/photos/pexels-36723805.jpg",
    destinations: ["Jordan", "Cairo", "Luxor"],
    publishedAt: "2026-03-24T09:00:00+02:00",
    primaryKeyword: "egypt and jordan itinerary",
    secondaryKeywords: ["combine egypt and jordan trip", "egypt jordan tour"],
    seoTitle: "Combining Egypt and Jordan: A Planning Guide | Egypt Eye",
    seoDescription: "How to plan a combined Egypt and Jordan trip — flight connections, how many days each country needs, and a suggested route.",
    body: [
      p("Cairo and Amman are a short flight apart — under two hours — which makes combining Egypt and Jordan on a single trip far more practical than it might first appear, especially for travelers already crossing multiple time zones to get to the region."),
      h2("How much time each side needs"),
      ...bullets([
        "Egypt: a minimum of 5-6 days to cover Cairo, Giza, and a Luxor stop without rushing; more if a Nile cruise or Red Sea extension is added",
        "Jordan: 3-4 days covers Amman, Petra, and Wadi Rum comfortably; add a day for the Dead Sea",
      ]),
      p("Most combined itineraries run Egypt first, ending in Luxor or Cairo, then fly to Amman for the Jordan leg — though the order works equally well reversed, depending on international flight connections."),
    ],
  },
];

export function getStoryBySlug(slug: string) {
  return stories.find((s) => s.slug === slug);
}
