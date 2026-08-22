import type { Story } from "./types";
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
    relatedTours: toursBySlug("6-day-cairo-giza-luxor", "8-day-essential-egypt-nile-cruise", "epic-8-day-egypt-escapade"),
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
    relatedTours: toursBySlug("6-day-cairo-giza-luxor", "8-day-essential-egypt-nile-cruise"),
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
];

export function getStoryBySlug(slug: string) {
  return stories.find((s) => s.slug === slug);
}
