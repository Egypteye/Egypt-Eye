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
    title: "What a Week With Egypt Eye Actually Looks Like",
    category: "Behind the Scenes",
    excerpt:
      "A first-person look at what a week with Egypt Eye actually feels like — from the Nine Pyramids View at golden hour to dinner aboard a Nile cruise.",
    imageLabel: "Nile Sunset",
    imageTone: "nile",
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
];

export function getStoryBySlug(slug: string) {
  return stories.find((s) => s.slug === slug);
}
