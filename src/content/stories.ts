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
    relatedTours: toursBySlug("8-day-essential-egypt-nile-cruise", "6-day-cairo-giza-luxor", "hot-air-balloon-luxor-east-bank-combo", "2-day-luxor-tour"),
    seoTitle: "Total Solar Eclipse in Luxor, Egypt — August 2, 2027",
    seoDescription:
      "Everything you need to know about the August 2, 2027 total solar eclipse in Luxor — verified timing, why totality is longest here, and how to plan around it.",
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
      {
        _type: "block",
        _key: "hx1",
        style: "h2",
        children: [{ _type: "span", _key: "hx1s1", text: "Where to Actually Watch It From", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "px1",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "px1s1",
            text: "Where you're actually standing matters more than people expect. The West Bank, near Hatshepsut's temple or looking out across the river toward the Theban hills, puts you low in a landscape built for exactly this kind of sky event — open, quiet, with three-thousand-year-old cliffs as a backdrop instead of a hotel wall. A rooftop on the East Bank with a clear view toward Karnak works well too, and it puts you closer to shade, water, and a bathroom, which matters more than it sounds like it will after four hours in the sun. What you want to avoid is anywhere boxed in on all sides — you lose the horizon-to-horizon change in light that's half of what makes a total eclipse different from a partial one.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "hx2",
        style: "h2",
        children: [{ _type: "span", _key: "hx2s1", text: "What to Bring, Beyond the Glasses", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "px2",
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [
          {
            _type: "span",
            _key: "px2s1",
            text: "A certified ISO 12312-2 solar viewer for everyone in your group, plus at least one spare",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "px3",
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [
          { _type: "span", _key: "px3s1", text: "Water and something with electrolytes — the heat by early afternoon is real", marks: [] },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "px4",
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [{ _type: "span", _key: "px4s1", text: "A hat and light, long sleeves rather than sunscreen alone", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "px5",
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [
          {
            _type: "span",
            _key: "px5s1",
            text: "A solar filter for your camera or phone lens, if you plan to photograph the partial phases",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "px6",
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [
          {
            _type: "span",
            _key: "px6s1",
            text: "A portable charger — phone networks get busy on eclipse day, and batteries drain faster in the heat",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "hx3",
        style: "h2",
        children: [{ _type: "span", _key: "hx3s1", text: "Photographing Six Minutes", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "px7",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "px7s1",
            text: "The temptation is to spend the whole six minutes looking through a viewfinder instead of at the sky. A wide shot that includes a piece of the Luxor skyline or the West Bank cliffs, set up on a tripod beforehand and left mostly alone once totality starts, usually makes a better memory than a close telephoto attempt managed in real time. If you do want a closer shot of the corona, remove the solar filter from your lens only during totality itself — the same rule that applies to your eyes — and put it straight back on the instant the first bright edge of the Sun reappears.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "hx4",
        style: "h2",
        children: [{ _type: "span", _key: "hx4s1", text: "Booking Around a Fixed Six Minutes", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "px8",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "px8s1",
            text: "Hotel rooms and flights into Luxor for the first days of August 2027 will fill up well before the date itself — this is a rare, headline astronomical event landing on one of Egypt's most visited historical sites, and interest is already building years out. A private, pre-scoped viewing location solves two problems at once: it removes the uncertainty of where you'll actually be standing when totality starts, and it means someone has already worked out the practical side — shade, water, a clear sightline — so the only thing left to do on the day itself is watch the sky.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "calloutBlock",
        _key: "calloutx1",
        tone: "Highlight",
        title: "Six Minutes, No Second Chance",
        body: "There's no encore on eclipse day — once totality ends, it's over for another century in this exact spot. Knowing your viewing location and your shade, water, and restroom plan in advance matters more here than on almost any other single day of a trip to Egypt.",
      },
      {
        _type: "faqBlock",
        _key: "faqx1",
        title: "Eclipse Day, Answered",
        faqs: [
          {
            question: "Do I need to wear eclipse glasses for the entire eclipse?",
            answer:
              "Only during the partial phases, before and after totality. Once the Moon fully covers the Sun — starting at 1:02:14 PM and lasting roughly six minutes and twenty-two seconds — it's safe to look directly at it without any protection. The moment the first bright sliver of Sun reappears, glasses go back on immediately.",
          },
          {
            question: "What happens if it's cloudy that day?",
            answer:
              "Luxor's skies are historically clear on this date roughly four years out of five — among the best odds anywhere on the 2027 path — but no forecast is a guarantee years out. Even on a rare cloudy day, the drop in temperature and light is still dramatic, and Luxor's temples make the rest of the trip worthwhile regardless of what happens at 1:02 PM.",
          },
          {
            question: "Can I see this eclipse without traveling all the way to Luxor?",
            answer:
              "Partial phases will be visible across a much wider stretch of Egypt and the surrounding region, but totality — the Sun fully covered, the sky going dark — only happens inside a band roughly 250 kilometers wide crossing central Egypt. Luxor sits close to the centerline of that band, which is also why its totality runs close to the maximum length anywhere on the path.",
          },
          {
            question: "Is it worth arranging a private guide just for eclipse day?",
            answer:
              "For six minutes with no do-over, yes. A private arrangement means your viewing spot, your shade, and the rest of your day's schedule are all worked out ahead of time, rather than figured out in the heat alongside everyone else trying to do the same thing at once.",
          },
        ],
      },
      {
        _type: "block",
        _key: "px9",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "px9s1",
            text: "Total solar eclipses happen somewhere on Earth every year or two. One lasting six minutes, over a city that has stood since before most of recorded history began, will not happen again in most of our lifetimes. Luxor on August 2, 2027 is worth building a trip around.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      { _type: "ctaBlock", _key: "ctax1", title: "Plan Your Trip Around the Eclipse", body: "Egypt Eye's Luxor Eclipse experience pairs eclipse day with private access to the temples that make Luxor worth the trip on its own.", buttonLabel: "Explore The Luxor Eclipse", buttonHref: "/signature-experiences/the-luxor-eclipse" },
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
    relatedTours: toursBySlug("10-day-private-luxurious-trip", "8-day-essential-egypt-nile-cruise", "6-day-cairo-giza-luxor"),
    seoTitle: "Best Travel Agencies in Egypt: What to Check in 2026",
    seoDescription:
      "How to actually vet an Egypt tour operator in 2026 — licensing, guide quality, hidden exclusions, red flags, and why photography access separates good operators from average ones.",
    body: [
      p(
        "Egypt has thousands of tour operators, and the gap between the best and the worst of them is enormous — the same nine-day Cairo-to-Luxor-to-Aswan itinerary can be an unhurried, well-guided trip, or four rushed days spent being herded past monuments and into commission shops, depending entirely on who's running it. Picking the right operator matters more here than in most destinations, because so much of what actually shapes the trip — which guide you get, how early you arrive at a site, whether you're given time to actually take a photo — never shows up on a price comparison page."
      ),
      h2("Check the License Before Anything Else"),
      p(
        "Every legitimate Egyptian tour operator is licensed through the Ministry of Tourism and Antiquities, and that licensing is what allows a company to actually operate inside archaeological sites — hire registered guides, coordinate with site security, and take legal responsibility for a group. An operator that can't produce a license or company registration, or that runs entirely through informal messaging-app bookings with no business name attached, is a real risk, not just an inconvenience: if anything goes wrong on-site, an unlicensed operator has no standing to fix it."
      ),
      h2("Look at the Guides, Not Just the Itinerary"),
      p(
        "Two companies can sell an identical-looking itinerary — same temples, same days, same hotels — and deliver completely different trips, because the difference is the guide. Egypt's best guides are licensed Egyptologists, often with real academic backgrounds in Egyptology or archaeology, who can explain what you're actually looking at rather than reciting a memorized script. Before booking, ask directly whether the guide is licensed, whether they speak your language fluently, and whether the same guide stays with you for the whole trip or changes city to city with no continuity."
      ),
      h2("Read the Inclusions Line by Line"),
      p(
        "The single biggest source of Egypt trip complaints isn't the sites — it's the gap between what a quote implies and what it actually includes. A cheap-looking price that excludes site entry fees, meals, or Nile cruise cabin category can end up costing more, once everything is added back in, than a transparent quote that included it all from the start. Before comparing two prices, make sure they're actually quoting the same things."
      ),
      ...bullets([
        "Entry fees for every site on the itinerary — Egyptian monument tickets add up fast across a multi-day trip",
        "Meals — full board, half board, or sightseeing only, and which specific meals are covered",
        "Nile cruise cabin category, if the itinerary includes a cruise segment",
        "Domestic flights or overnight trains between Cairo and Luxor or Aswan",
        "Tipping — expected in Egypt, and worth knowing the norm for before arrival, not after",
        "Optional add-ons like a hot air balloon ride or a private photoshoot, which most operators quote separately",
      ]),
      h2("Ask About Group Size and Pace"),
      p(
        "A 'small group' tour in Egypt can mean six people, or it can mean twenty-five people on one bus following one fixed schedule. Ask directly how many people will actually be in your group and how much flexibility the schedule has — whether you can start before the crowds reach Karnak, or whether you're locked into whatever time slot the whole bus was assigned. Private touring costs more, but it buys back the one thing a group tour structurally can't offer: your own pace."
      ),
      h2("Photography and Access — Can They Actually Get You the Shot"),
      p(
        "This matters more in Egypt than in almost any other destination, because so many of the country's best photo opportunities depend on timing and access that a generic tour simply doesn't plan around. Getting an empty-plaza shot at the Pyramids, or a few uncrowded minutes inside a tomb in the Valley of the Kings, depends on an operator that builds the day around light and crowds on purpose — arriving before sunrise, knowing which sites empty out by early afternoon, and having a working relationship with on-site security rather than hoping for the best. If photography is part of why you're going, ask specifically what access an operator can actually arrange, not just whether photography is 'allowed.'"
      ),
      h2("Red Flags Worth Walking Away From"),
      ...bullets([
        "Pressure to book and pay a deposit within hours, with no time to think it over",
        "No verifiable online presence — no real reviews, no consistent company name across platforms, no registration details",
        "A quote with no itinerary breakdown, just a single total price",
        "An itinerary padded with stops at 'government' papyrus, perfume, or essential-oil shops that mainly exist to pay guide commissions",
        "No clear cancellation or refund policy offered in writing",
      ]),
      callout(
        "Ask for the exact itinerary, the exact inclusions, the guide's licensing, and the cancellation policy — all in writing, before any money changes hands. An operator confident in what they're offering will have all four ready without being asked twice.",
        { title: "Before You Pay a Deposit", tone: "Info" }
      ),
      h2("Reviews Worth Trusting"),
      p(
        "A page full of five-star reviews doesn't tell you much on its own — what matters is whether those reviews describe an actual trip. Look for reviews that mention a specific guide by name, a specific itinerary, or a specific problem that got solved well, rather than generic praise. Be a little wary of a sudden cluster of near-identical five-star reviews posted within the same week, and check whether the reviewer's other reviews look like a real travel history rather than a one-off account created to post a single glowing post."
      ),
      h2("What a Confirmed Booking Should Include"),
      p(
        "Once you've actually booked, the confirmation you get back tells you almost as much about the operator as the sales conversation did. A confirmation that names your actual hotels — not 'similar category' — your actual guide or at least how guides are assigned, your vehicle type, and a direct emergency contact number for the trip itself is a good sign you're dealing with an operator who runs a tight operation rather than one juggling more bookings than they can properly service."
      ),
      ...bullets([
        "A day-by-day itinerary with named hotels, not 'similar category' placeholders",
        "Confirmation of whether the guide is licensed and whether they stay with you for the whole trip",
        "The vehicle type and whether it's private to your group or shared",
        "A direct emergency contact number for the days you're actually traveling",
      ]),
      faq(
        [
          {
            question: "Is it cheaper to book directly with a local Egyptian operator than through an international agency?",
            answer:
              "Usually, yes. Booking directly with a licensed, well-reviewed local operator often costs less than routing through an international agency that then subcontracts to the same local companies anyway — you're mainly cutting out a markup layer. The trade-off is that vetting the operator yourself matters more.",
          },
          {
            question: "Are online travel marketplaces reliable for booking Egypt tours?",
            answer:
              "Some listings are excellent and some aren't — being listed on a marketplace doesn't guarantee quality on its own. The same due diligence on licensing, guides, and inclusions applies whether you found an operator through a marketplace or found them directly.",
          },
          {
            question: "How far in advance should I book a private Egypt tour?",
            answer:
              "For peak season (December through February) or around a major event, several months ahead gives the widest choice of guides and hotel rooms. Outside peak season, a few weeks is often enough, though earlier is always safer when your dates are fixed.",
          },
          {
            question: "Is private touring actually worth the extra cost over a group tour?",
            answer:
              "For most travelers, yes — particularly on a first trip, or a trip built around something specific, like a proposal, a photoshoot, or a limited number of days. The price difference buys pace, flexibility, and a guide's full attention, which tends to matter more once you're standing in front of Karnak than it did on a spreadsheet.",
          },
        ],
        "Choosing an Operator, Answered"
      ),
      p(
        "None of this is about finding the cheapest possible quote — it's about knowing which questions actually predict a good trip versus a frustrating one. A licensed, transparent operator with real guides and a clear cancellation policy will answer every one of these without hesitation. That's usually all the vetting a first-time visitor to Egypt actually needs."
      ),
      { _type: "ctaBlock", _key: nextBlockKey("cta"), title: "See How Egypt Eye Does It", body: "Licensed guides, transparent pricing, and private-paced itineraries built around what you actually want to see.", buttonLabel: "Browse Our Tours", buttonHref: "/tours" },
    ],
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
    relatedTours: toursBySlug(
      "9-day-egypt-jordan-combo",
      "petra-by-night",
      "sunrise-camel-ride-giza-pyramids",
      "wadi-rum-overnight-bedouin-camp"
    ),
    seoTitle: "A Girls' Trip to Egypt & Jordan: Cairo, Giza & Petra",
    seoDescription:
      "Inside a real girls' getaway across Egypt and Jordan — sunrise at the Pyramids, a flying dress shoot in the dunes, and Petra's Treasury by lantern light.",
    body: [
      p(
        "There were four of us, a group chat that had said 'we should really do this' for two years, and a decision made at eleven at night on a random Tuesday that this was finally the year. Egypt first, then Jordan — a little over a week that we're all still talking about the following Christmas."
      ),
      h2("Landing in Cairo, Overwhelmed in the Right Way"),
      p(
        "Nobody warns you properly about the first twenty minutes out of Cairo airport — the traffic, the noise, the sheer size of a city of over twenty million people moving at once. It's a lot, and then it isn't, because by the time we'd checked into our hotel and stood on a balcony with the city lit up below us, the overwhelm had already turned into something closer to excitement. We ordered koshary from room service because none of us could agree on going back out, and it remains, unreasonably, one of the best meals of the whole trip."
      ),
      h2("Sunrise at the Pyramids, No Crowds Yet"),
      p(
        "We were up before it was light, which felt insane at the time and made complete sense about forty minutes later. The Giza Plateau at sunrise is a different place than the Giza Plateau at noon — no tour buses yet, no vendors, just the Pyramids catching the first orange light while the sky behind them was still half-dark. We climbed up to the Nine Pyramids View point and just stood there for a while, not really talking, which is not something four friends on a trip together do very often."
      ),
      h2("The Flying Dress in the Dunes"),
      p(
        "This was the one we'd all seen on Instagram a hundred times and half-doubted we'd actually pull off. A flowing dress, a stretch of open sand dunes outside the city, and a photographer who knew exactly how to time the wind so the fabric caught the light instead of just whipping around chaotically. It took a few tries — sand in shoes, sand in everything, honestly — and a lot of laughing between takes, but the shots that came out of it are the ones that ended up printed and framed, not just posted and forgotten."
      ),
      h2("One Last Egyptian Evening"),
      p(
        "Our last night in Cairo we did almost nothing, on purpose — a quiet felucca out on the Nile as the sun went down, the city noise fading out the further we sailed from the bank. After four days of being genuinely dazzled by ancient Egypt, that hour on the water, wind on the sail instead of an engine, was exactly the kind of ending the Cairo half of the trip needed before we packed for Jordan."
      ),
      h2("Crossing Into Jordan"),
      p(
        "The mood shifts the moment you land in Jordan — smaller, quieter, the desert reddening the further south you drive. We based ourselves for a couple of nights near Petra, which turned out to be the right call, because Petra is not something you rush through in an afternoon, however much a shorter itinerary might try to convince you otherwise."
      ),
      h2("Petra by Lantern Light"),
      p(
        "Walking the Siq at night is nothing like walking it during the day. The narrow canyon that leads into Petra was lined with hundreds of paper lanterns, the only light for most of the walk, until it opens out and the Treasury appears lit up ahead of you — the same building everyone recognizes from photos, but seen for the first time in candlelight instead of full sun. Bedouin musicians were playing near the base of it, and we sat on the ground in the cold desert air and didn't say much for a while. It's one of those experiences that photographs badly and matters enormously anyway."
      ),
      h2("Wadi Rum Under a Ridiculous Number of Stars"),
      p(
        "We added an overnight in the desert almost as an afterthought, and it turned into one of the best decisions of the trip. Wadi Rum at night, away from any real light pollution, makes you realize how few genuinely dark skies most of us ever actually see. We slept in a Bedouin camp, ate dinner cooked in the sand, and lay outside afterward picking out constellations none of us could actually name, which somehow didn't matter at all."
      ),
      h2("The Little Chaos of Traveling as Four"),
      p(
        "Nobody warns you how much logistics four grown women generate — whose turn it was for the bathroom mirror, who packed the phone charger everyone needed, who fell asleep in the van by 8 PM every single night no matter what time we'd started. There were small arguments about pace, mostly resolved by whoever was hungriest at the time, and there was a lot of laughing about things that weren't actually that funny, the way things only are when you're overtired and somewhere extraordinary at the same time."
      ),
      h2("Splitting the Cost, Without the Awkwardness"),
      p(
        "One of the quieter reasons this trip worked as well as it did: we booked it as a single private group rather than four separate bookings stitched together. One vehicle, one guide, one invoice split evenly four ways, instead of four people trying to coordinate separate itineraries that happened to overlap. It sounds like a small thing until you've tried to plan a group trip the other way and spent more energy on logistics than the actual travel deserved."
      ),
      h2("What We'd Do Differently"),
      p(
        "If we did it again, we'd give Wadi Rum two nights instead of one — by the time we'd figured out where the best stargazing spot near camp actually was, it was time to leave. We'd also build in one genuinely lazy day somewhere in the middle instead of stacking everything back to back, because by day five even the most enthusiastic person in the group was running on fumes by early afternoon."
      ),
      ...bullets([
        "Comfortable, closed sandals or trainers — Petra and the dunes both mean a lot of walking on sand and uneven stone",
        "A light scarf or shawl, useful for sun, wind, and covering shoulders at religious or conservative sites",
        "A portable charger — between two photoshoot-worthy countries, phone batteries do not last",
        "A printed or downloaded copy of your itinerary and hotel confirmations, in case signal is patchy in Wadi Rum",
        "An open mind about sand getting into absolutely everything, because it will",
      ]),
      callout(
        "Petra by Night doesn't run every night of the week — check the schedule before building the rest of your Jordan days around it, so you're not stuck choosing between the lantern-lit Siq and your only free evening.",
        { title: "Good to Know", tone: "Info" }
      ),
      h2("Food We Still Talk About"),
      p(
        "Somewhere between the Pyramids and Petra we became fully unserious about trying everything put in front of us — koshary in Cairo, fresh-baked bread from a Nubian village near Aswan on a detour we almost skipped, mint tea in Jordan strong enough to wake the dead. None of it was planned as a food trip. Most of what we remember best from the meals wasn't even the food itself, it was sitting somewhere unglamorous with good light and no schedule for the next hour, which barely happened anywhere else on the itinerary."
      ),
      faq(
        [
          {
            question: "Is a girls' trip to Egypt and Jordan safe to do together, just as a group of women?",
            answer:
              "Yes, and it's a genuinely popular trip to do this way. Traveling with a private guide and driver for the Egypt legs, and a licensed local guide in Jordan, removes most of the friction solo or group female travelers worry about most — navigating unfamiliar cities and getting reliable transport.",
          },
          {
            question: "How many days do you actually need for both countries?",
            answer:
              "A little over a week is workable if you keep Jordan focused on Petra and Wadi Rum rather than trying to add Amman and the Dead Sea too. Nine or ten days gives you room to actually enjoy both countries instead of rushing between them.",
          },
          {
            question: "Do you need a visa to cross from Egypt into Jordan?",
            answer:
              "Requirements depend on your nationality and how you're crossing, so it's worth confirming with your operator or embassy before you book flights — this is exactly the kind of logistics a private itinerary sorts out for you in advance.",
          },
          {
            question: "What's the best time of year for a trip like this?",
            answer:
              "October through April in both countries — comfortable temperatures for walking Petra's Siq and standing out in the Giza sun, without the peak heat of summer working against you in either place.",
          },
        ],
        "Planning Your Own Version of This Trip"
      ),
      p(
        "None of us expected the Jordan half to hit as hard as the Egypt half did — we'd booked it almost as an add-on, and it ended up being half the reason we still talk about this trip. What stuck wasn't any single site, honestly. It was doing all of it together, four friends who'd been saying 'we should really do this' for two years and finally just did."
      ),
      {
        _type: "ctaBlock",
        _key: nextBlockKey("cta"),
        title: "Plan Your Own Girls' Trip",
        body: "Egypt and Jordan, done properly, in one private itinerary — Pyramids, flying dress, and Petra by lantern light included.",
        buttonLabel: "See the Egypt & Jordan Combo",
        buttonHref: "/tours/9-day-egypt-jordan-combo",
      },
    ],
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
    relatedTours: toursBySlug(
      "8-day-essential-egypt-nile-cruise",
      "hot-air-balloon-luxor-east-bank-combo",
      "cairo-nile-dinner-cruise-night-tour",
      "10-day-private-luxurious-trip"
    ),
    seoTitle: "A Week in Egypt: What a Private Trip Actually Looks Like",
    seoDescription:
      "A day-by-day, first-person account of a week traveling Egypt privately — Giza at golden hour, Karnak, a hot air balloon sunrise, and dinner aboard a Nile cruise.",
    body: [
      p(
        "I kept notes on my phone the whole week, mostly so I wouldn't lose track of which day was which once I got home, because they blur together fast when every single one has its own version of 'best day of the trip.' This is roughly what those notes turned into — seven days, more or less as they happened."
      ),
      h2("Day One: Cairo at Dusk"),
      p(
        "I landed in the late afternoon, and by the time I'd checked into the hotel the call to prayer was echoing across the city from a dozen directions at once — my first real signal that I wasn't in a generic big city anymore, I was specifically in Cairo. My guide met me that evening just to walk through the plan, not to sightsee yet, which turned out to be the right pace. No rush on night one. Just dinner, and a city outside the window that I already couldn't wait to actually be in."
      ),
      h2("Day Two: Golden Hour at Nine Pyramids View"),
      p(
        "This was the day I'd built the whole trip around, if I'm honest. We got to the Giza Plateau early enough that the light was still soft and low, and stood at the Nine Pyramids View point — the one spot where you can actually see all nine pyramids of the Giza complex lined up together — while the stone went from grey to gold in about twenty minutes. I'd seen a hundred photos of the Pyramids before this trip. None of them prepared me for how it feels to stand there in person while the light does that."
      ),
      h2("Day Three: Khan el-Khalili and Old Cairo"),
      p(
        "A slower day, and I needed it. We wandered Khan el-Khalili's market alleys, drank tea that was stronger than any tea has a right to be, and spent the afternoon in Islamic and Coptic Cairo — mosques and churches that are centuries old sitting a short walk from each other, which says something about the city that no single monument really can. I bought more spices than I had any real plan for. No regrets."
      ),
      h2("Day Four: Karnak by Golden Light, Luxor Temple at Night"),
      p(
        "A short flight put me in Luxor by mid-morning, and by late afternoon I was standing in the Great Hypostyle Hall at Karnak — the largest religious complex ever built, a hundred and thirty-something columns still standing after more than three thousand years, catching that same late gold light Giza had two days earlier. We went back to Luxor Temple after dark, when it's lit differently and far quieter, and I think I liked it there even more than Karnak, which I did not expect to say."
      ),
      h2("Day Five: Hot Air Balloon Sunrise, Then the Valley of the Kings"),
      p(
        "Up before 4 AM, which felt brutal for about ten minutes and then felt completely worth it once the balloon lifted off over the West Bank and the whole Theban landscape opened up below — Hatshepsut's temple, the Valley of the Kings, the Nile catching first light in the distance. We landed, had breakfast, and went straight into the Valley of the Kings itself, walking down into tombs painted the way they were left thousands of years ago. Two completely different ways of seeing the same landscape, in the same morning."
      ),
      h2("Day Six: Sailing to Aswan, Dinner Aboard"),
      p(
        "The Nile slows everything down, in the best way. We sailed south toward Aswan with not much to do but watch the riverbanks change — palm groves, small villages, fishermen in narrow boats that looked like they hadn't changed design in centuries. Dinner that night was on deck as the sun went down over the water, and it's still the meal I think about most from the whole trip, not because of what was on the plate but because of where I was sitting while I ate it."
      ),
      h2("Day Seven: Philae Temple, and Home"),
      p(
        "Last full day, and it started with Philae Temple, reached by a short boat ride across the water — a temple that was actually moved, piece by piece, to save it from the rising waters after the Aswan High Dam was built, which is its own remarkable story. I spent the last afternoon just sitting by the Nile instead of scheduling one more site, which felt like exactly the right way to close out a week that had, until then, been full to the brim."
      ),
      h2("A Note on the Heat"),
      p(
        "Nobody exaggerated the heat, and I'm glad I didn't underestimate it either. By early afternoon most days, the only sensible plan was to be somewhere shaded, ideally horizontal, with cold water within reach. My guide built the whole week around that reality instead of pretending it wasn't there — sightseeing early, a real break through the hottest hours, and evenings that started back up once the temperature dropped. Fighting that rhythm would have wrecked the trip. Working with it made every single day better."
      ),
      h2("What I'd Do Differently Next Time"),
      p(
        "I'd add a day in Aswan. I said yes to Philae Temple and then found myself wishing I had one more unhurried afternoon by the water there before flying home, instead of it being the very last thing on the itinerary. I'd also pack fewer clothes and more patience for laundry — a week of temples and desert dust is hard on anything you bring, and half of what I packed never left the suitcase."
      ),
      ...bullets([
        "How much quiet is actually built into the days — the boat, the balloon, the early mornings — not just monument after monument",
        "How hospitable people were, everywhere, not performatively so",
        "How different the same site looks in early morning light versus midday light",
        "How much the heat shapes the day if you don't plan around it — starting early wasn't optional, it was the whole strategy",
        "How much better the photos came out once I stopped worrying about getting a photo and just let the guide time it",
      ]),
      h2("The Meals I Still Think About"),
      p(
        "Nobody told me the food would end up being its own storyline. Koshary on the first night out of pure convenience, then genuinely craving it again by day four. Fresh-baked bread and grilled fish beside the Nile in Aswan, eaten with my hands because nobody handed me cutlery and it felt wrong to ask. Dinner on the cruise the last night, plates cleared while the boat kept moving south and the lights of a small riverside village slid past the window. None of it was fancy in the way a hotel restaurant is fancy. All of it mattered more than the hotel restaurant would have."
      ),
      h2("Why I Went Private Instead of Joining a Group"),
      p(
        "I almost booked a group tour to save money, and I'm genuinely glad I didn't. The version of this week that stuck with me depended entirely on timing — being at Giza before the buses arrived, having the guide adjust the Karnak visit because the light was doing something worth waiting for, not being rushed out of a tomb in the Valley of the Kings because twenty other people on the bus were ready to move on. None of that is available on a fixed group schedule, and it turned out to be the actual difference between a good trip and the trip I keep thinking about."
      ),
      callout(
        "Build at least one slower day into a week-long trip — the felucca, the Nile cruise stretch, an unscheduled afternoon. The monuments are the reason to go, but the quiet time between them is usually what actually sticks with you afterward.",
        { title: "What I'd Tell a Friend", tone: "Highlight" }
      ),
      faq(
        [
          {
            question: "Is a week actually enough time to see Egypt properly?",
            answer:
              "It's enough for Cairo and Giza plus a real taste of Luxor, especially with a private, well-paced itinerary. It won't fit Aswan and a full Nile cruise without extending a day or two, but a week gives you a genuinely complete first look at the country.",
          },
          {
            question: "Do you need to know what you're doing with a camera to get good photos?",
            answer:
              "No — most of what made the photos from this trip work was timing and access, not camera skill. Being in the right spot at golden hour, with a guide who knows exactly where to stand, does more than an expensive lens ever could.",
          },
          {
            question: "How physically demanding is a week like this?",
            answer:
              "Moderately — plenty of walking, some early mornings, and heat to manage, but nothing technical. A reasonable fitness level and comfortable shoes cover almost all of it.",
          },
        ],
        "Questions I Got Asked After I Got Home"
      ),
      p(
        "People keep asking me which day was the best day, and I still don't have one answer. It was the accumulation of it — Giza at dawn, Karnak at dusk, a balloon over the Valley of the Kings, dinner on the Nile — that made the week what it was, not any single moment on its own."
      ),
      {
        _type: "ctaBlock",
        _key: nextBlockKey("cta"),
        title: "Build Your Own Week Like This",
        body: "A private, golden-hour-timed itinerary across Cairo, Giza, Luxor, and Aswan — built around the moments, not just the checklist.",
        buttonLabel: "See the 8-Day Itinerary",
        buttonHref: "/tours/8-day-essential-egypt-nile-cruise",
      },
    ],
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
      {
        _type: "block",
        _key: "hx1",
        style: "h2",
        children: [{ _type: "span", _key: "hx1s1", text: "What a Typical Day Actually Looks Like", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "px1",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "px1s1",
            text: "On a private itinerary, most days start earlier than a typical vacation morning — not because it's demanded, but because the sites are simply better before the heat and the crowds arrive. A driver and guide collect you from the hotel, the pace through each site is yours to set, and the afternoon is usually left looser: lunch, a rest at the hotel, an optional add-on if you want one. It isn't a bus schedule dictating the day; it's closer to having a knowledgeable friend who happens to know exactly when each site is at its best.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "hx2",
        style: "h2",
        children: [{ _type: "span", _key: "hx2s1", text: "What to Budget For, Without Fake Numbers", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "px2",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "px2s1",
            text: "Egypt trip costs vary enormously depending on trip length, hotel category, and private versus group travel, so a single number is more misleading than useful. What's worth knowing instead is what actually drives the cost up or down: private touring versus joining a group, five-star versus mid-range hotels, a Nile cruise cabin category if one's included, and how many extras — a hot air balloon, a photoshoot, a sound and light show — get added on top of the base itinerary. Ask any operator for a full breakdown by category rather than a single bottom-line figure, so you can see exactly where your money is actually going.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "hx3",
        style: "h2",
        children: [{ _type: "span", _key: "hx3s1", text: "What to Sort Out Before You Arrive", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "px3",
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [{ _type: "span", _key: "px3s1", text: "Visa requirements for your nationality — many travelers can get one on arrival or online in advance", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "px4",
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [{ _type: "span", _key: "px4s1", text: "Domestic flights between Cairo and Luxor or Aswan, which fill up faster around peak season", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "px5",
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [{ _type: "span", _key: "px5s1", text: "Travel insurance that covers the specific activities you're planning, including anything adventurous like diving or a hot air balloon", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "px6",
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [{ _type: "span", _key: "px6s1", text: "A local eSIM or roaming plan, so you're not relying entirely on hotel wifi to stay in touch with your guide", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "px7",
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [{ _type: "span", _key: "px7s1", text: "US dollars in small denominations for tipping, which is customary in Egypt for guides, drivers, and hotel staff", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "hx4",
        style: "h2",
        children: [{ _type: "span", _key: "hx4s1", text: "Common First-Timer Mistakes", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "px9",
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [{ _type: "span", _key: "px9s1", text: "Treating Luxor as a rushed day trip from Cairo instead of giving it its own days", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "px10",
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [{ _type: "span", _key: "px10s1", text: "Packing the itinerary so tightly there's no room for a delay, a rest, or an unplanned detour", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "px11",
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [{ _type: "span", _key: "px11s1", text: "Scheduling major sightseeing through the hottest hours of the afternoon instead of around them", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "px12",
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [{ _type: "span", _key: "px12s1", text: "Skipping travel insurance, especially for anything involving diving, a hot air balloon, or a desert excursion", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "px13",
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [{ _type: "span", _key: "px13s1", text: "Leaving visa and flight-timing questions until the last minute instead of confirming them early", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "hx5",
        style: "h2",
        children: [{ _type: "span", _key: "hx5s1", text: "Working With a Travel Specialist vs. Booking It Yourself", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "px14",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "px14s1",
            text: "Egypt is entirely bookable independently — flights, hotels, and site tickets can all be arranged piece by piece. What's harder to book yourself is the local knowledge: which entrance to the Grand Egyptian Museum avoids the longest line, which guide is actually good versus just available, how the timing of a Nile cruise cabin category affects which side of the boat gets the better view. A specialist who works in Egypt daily isn't selling convenience so much as selling the difference between a trip that goes smoothly and one where you're troubleshooting logistics on vacation.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "faqBlock",
        _key: "faqx1",
        title: "Quick Questions Before You Book",
        faqs: [
          {
            question: "Is Egypt safe for tourists right now?",
            answer:
              "The main tourist areas — Cairo, Giza, Luxor, Aswan, and the Red Sea resorts — see millions of visitors a year and have dedicated tourism police. As anywhere, common-sense precautions apply, and traveling with a reputable, licensed operator adds another layer of comfort, especially for first-time visitors.",
          },
          {
            question: "Should I fly or take an overnight train between Cairo and Luxor?",
            answer:
              "Flying is faster and what most private itineraries use, especially with limited days. An overnight train is a slower, more atmospheric option some travelers add deliberately, but it eats into a day either at the start or the end of the trip.",
          },
          {
            question: "Do I need to speak Arabic to get by?",
            answer:
              "No — English is widely spoken throughout Egypt's tourism industry, and a private guide handles the rest. It's still a nice touch to learn a few basic Arabic greetings, purely for the reaction you'll get.",
          },
          {
            question: "How much should I tip guides and drivers?",
            answer:
              "Tipping is customary and expected in Egypt, generally on a per-day basis for guides and drivers separately. Ask your operator for their standard guidance before you travel so you're not guessing on the day.",
          },
        ],
      },
      {
        _type: "block",
        _key: "px8",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "px8s1",
            text: "Every Egypt trip that goes well starts from the same handful of decisions covered here — length, region, travel style, and season — made deliberately rather than left to chance. Once those are settled, the rest of the planning gets a lot easier, and a lot more fun.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      { _type: "ctaBlock", _key: "ctax1", title: "Let Us Build the Itinerary", body: "Tell us your dates, who's traveling, and what you want to see — we'll design a private Egypt itinerary around it.", buttonLabel: "Start Customizing", buttonHref: "/customize" },
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
      {
        _type: "block",
        _key: "hx1",
        style: "h2",
        children: [{ _type: "span", _key: "hx1s1", text: "Under 5 Days: Possible, But Tight", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "px1",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "px1s1",
            text: "A three or four day trip can work if Cairo and Giza are genuinely all you want — the Pyramids, the Sphinx, and one more site or the Grand Egyptian Museum. The math is unforgiving, though: with international flights on both ends, you often only get two full sightseeing days out of four calendar days. It's a real trip, just not one to expect to feel unhurried. Anything shorter than three full days rarely justifies the flight time for most travelers coming from outside the region.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "hx2",
        style: "h2",
        children: [{ _type: "span", _key: "hx2s1", text: "Adding the Red Sea or Jordan: Budget Extra Days", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "px2",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "px2s1",
            text: "The Red Sea coast and Jordan both get added onto an Egypt trip fairly often, and both deserve their own days rather than being squeezed into a single afternoon. Hurghada or the Sinai coast is worth two to three days minimum once you factor in the flight or drive to get there — going for less than that means most of your trip is transit. Jordan is a bigger addition: Petra and Wadi Rum alone justify three to four extra days once border logistics and travel time between sites are accounted for, which is why most combined Egypt-and-Jordan itineraries run nine days or more.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "hx3",
        style: "h2",
        children: [{ _type: "span", _key: "hx3s1", text: "How Travel Style Changes the Math", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "px3",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "px3s1",
            text: "Private travel compresses these numbers slightly, because there's no waiting on a group to assemble, no fixed departure times, and no lost time backtracking to accommodate someone else's pace. A private ten-day itinerary can cover, comfortably, what a group tour needs eleven or twelve days to do at the same unhurried pace. It's not a huge difference, but on a trip where every day matters, it's often the difference between fitting in one more site and not.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "px4",
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [{ _type: "span", _key: "px4s1", text: "5-6 days: Cairo and Giza only, done properly", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "px5",
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [{ _type: "span", _key: "px5s1", text: "7-8 days: Cairo plus a real taste of Luxor", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "px6",
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [{ _type: "span", _key: "px6s1", text: "10 days: Cairo, Giza, and a full Luxor-to-Aswan Nile stretch", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "px7",
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [{ _type: "span", _key: "px7s1", text: "14 days: the full route plus Alexandria, the Red Sea, or a desert oasis", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "px8",
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [{ _type: "span", _key: "px8s1", text: "16+ days: room to add Jordan or the Western Desert oases without cutting anything else", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "hx4",
        style: "h2",
        children: [
          { _type: "span", _key: "hx4s1", text: "Solo Travelers, Families, and Honeymooners: Does the Math Change?", marks: [] },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "px10",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "px10s1",
            text: "Who you're traveling with changes how much a given number of days actually covers. Families with young children usually need slightly more days than the lengths above suggest, since afternoon rest breaks and shorter site visits eat into what a childless itinerary would cover in the same window. Honeymooners often want the opposite adjustment — fewer sites, more time built around a single unhurried experience like a Nile cruise or a private photoshoot, rather than maximizing how much ground gets covered. Solo travelers and small private groups tend to move fastest of anyone, since there's no group consensus to manage and no one waiting on anyone else.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "hx5",
        style: "h2",
        children: [{ _type: "span", _key: "hx5s1", text: "The Off-Season Trade-Off", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "px11",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "px11s1",
            text: "Traveling in summer changes the calculation slightly. The heat forces an earlier start and a longer midday break, but the trade-off is thinner crowds at every site and more flexibility on flights and hotel availability, which can make a shorter trip feel less compressed than the same length would in the December-to-February peak. Winter buys comfortable weather but demands more advance planning, since the same number of days has to compete with everyone else's itinerary for the best time slots at popular sites.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "hx6",
        style: "h2",
        children: [{ _type: "span", _key: "hx6s1", text: "Why More Days Isn't Automatically Better", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "px12",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "px12s1",
            text: "It's tempting to assume a longer trip is always the safer choice, but past a certain point extra days stop adding new sites and start adding repetition or filler stops that don't earn their place on the itinerary. A trip stretched to fourteen days without a genuine second region to explore — the Red Sea, Jordan, a desert oasis — often ends up feeling slower rather than richer. The better question isn't 'how many days can I get' but 'what would I actually do with each additional day,' and if the honest answer is 'rest at the hotel,' that's a fine answer, but it's worth knowing that's what you're booking.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "faqBlock",
        _key: "faqx1",
        title: "Length-Specific Questions",
        faqs: [
          {
            question: "Is 4 days enough for a first trip to Egypt?",
            answer:
              "It's enough for Cairo and Giza specifically, but not enough to add Luxor or Aswan without the trip feeling rushed. If four days is genuinely all you have, focus entirely on Cairo rather than trying to fit in a flight to the Nile Valley as well.",
          },
          {
            question: "Can you realistically do Egypt in a long weekend?",
            answer:
              "You can see the Pyramids in a long weekend, which for some travelers is the whole point of going. It's not enough to get a real sense of the country beyond that single, extraordinary sight.",
          },
          {
            question: "How many days does Cairo alone deserve?",
            answer:
              "Two to three full days covers Giza, the Grand Egyptian Museum, Islamic and Coptic Cairo, and Khan el-Khalili without rushing any of them. Less than that means picking two or three highlights and accepting you'll miss the rest.",
          },
          {
            question: "Is three weeks too long for an Egypt trip?",
            answer:
              "Not if you're genuinely interested in going beyond the standard route — three weeks fits Cairo, the full Nile, the Red Sea, and a desert oasis or two without feeling padded. It's simply more time than most first-time visitors need or have available.",
          },
          {
            question: "What length trip do returning visitors usually book?",
            answer:
              "Ten to fourteen days, most often — long enough to revisit favorite sites at a slower pace, or to add a region skipped the first time, like the Red Sea or a desert oasis, without needing to repeat the full Cairo-to-Aswan route from scratch.",
          },
        ],
      },
      {
        _type: "block",
        _key: "px9",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "px9s1",
            text: "There's no wrong length, as long as it's chosen on purpose. The trips that disappoint people aren't the short ones or the long ones — they're the ones where the itinerary tried to fit a fourteen-day country into a six-day trip and something important got rushed as a result. Decide what you're willing to leave out before you book, and whatever length you land on will feel like the right one once you're actually there.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      { _type: "ctaBlock", _key: "ctax1", title: "Find the Right Length for You", body: "Browse itineraries from a single day in Giza to a full three-week grand tour, and filter by exactly how much time you have.", buttonLabel: "Browse All Tours", buttonHref: "/tours" },
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
      "A practical Luxor guide covering East Bank vs. West Bank, how many days to spend, getting there, and the temples worth building your trip around.",
    body: [
      p(
        "Luxor gets called an open-air museum so often it starts to sound like a slogan, but it holds up. This was ancient Thebes, the religious and political capital of Egypt for centuries, and its temples and tombs were built at a scale meant to be walked through, not glanced at from a bus window. Treating Luxor as a single long day trip from Cairo is the most common mistake first-time visitors make, and it's the one that leaves them wishing they'd planned differently."
      ),
      p(
        "This guide covers what a Luxor trip actually involves: how to get here, how the East and West Banks divide the city, which sites are worth building your days around, how many days to give it, and when to come. Treat it as the planning layer underneath the more detailed pieces we've written on specific decisions, like how to split your time between the two banks."
      ),
      h2("Getting to Luxor"),
      p(
        "Most visitors reach Luxor one of three ways: a short domestic flight from Cairo, an overnight sleeper train, or arriving already on a Nile cruise or dahabiya that starts or ends here. The flight is the fastest option and the one most private itineraries use when Luxor is one stop among several. The sleeper train has its own appeal — you go to bed in Cairo and wake up in Upper Egypt — though it demands more patience than comfort seekers might want. If Luxor is the starting or ending point of a Nile cruise between here and Aswan, you'll already be arriving by water, which settles the question for you."
      ),
      h2("Two Banks, Two Different Worlds"),
      p(
        "The Nile splits Luxor into two halves that don't feel like the same place. The East Bank holds modern Luxor town, most hotels and restaurants, and the temples built for the living — Karnak and Luxor Temple, connected by the restored Avenue of Sphinxes. The West Bank belongs to the dead: the Valley of the Kings, Hatshepsut's mortuary temple, the Colossi of Memnon, and the villages of the workers who built it all. It's quieter, more spread out, and requires a vehicle to move between sites comfortably. We've written a longer comparison of the two banks if you want the specifics side by side before you plan your days."
      ),
      h2("The Sites Worth Building Your Trip Around"),
      p("Every Luxor itinerary should include a handful of non-negotiables, and a few more that reward the traveler willing to slow down."),
      ...bullets([
        "Karnak Temple — Egypt's largest religious complex, expanded by generations of pharaohs over roughly two thousand years; the Great Hypostyle Hall alone, with its 134 massive columns, justifies the visit on its own",
        "Luxor Temple — smaller and more intimate than Karnak, especially striking after dark when the columns and statues are lit",
        "The Valley of the Kings — the burial ground of New Kingdom pharaohs, including Tutankhamun, in tombs cut into the rock and decorated with painted reliefs",
        "Hatshepsut's Temple — a three-tiered temple built directly into the cliffs of Deir el-Bahari, unlike almost anything else in Egypt",
        "The Colossi of Memnon — two enormous seated statues that once guarded a vanished mortuary temple, easy to combine with a West Bank morning",
        "The quieter West Bank sites — Medinet Habu and the tombs of the nobles draw far fewer visitors than the Valley of the Kings and reward the extra time",
      ]),
      h2("How Many Days Does Luxor Actually Need?"),
      p(
        "Two to three days is the honest answer, not the single day a lot of standard itineraries allow. One full day per bank is the minimum to see the major sites without rushing: Karnak and Luxor Temple can fill a morning into early afternoon on the East Bank, while the Valley of the Kings, Hatshepsut's temple, and the Colossi of Memnon take a similar block of time on the West Bank. A third day leaves room for a sunrise hot-air balloon over the West Bank's temples and tombs — reliably one of the best views in Egypt — or simply a slower pace through sites you'd otherwise have to rush."
      ),
      h2("Getting Around Once You're There"),
      p(
        "Luxor town is walkable on the East Bank, but crossing to the West Bank and moving between its spread-out sites is not something to do on foot in the heat. Most private itineraries include a dedicated driver and vehicle for the length of your stay, which removes the need to negotiate taxis or haggle over a felucca crossing each morning. If you're arranging things independently, a bridge now connects both banks by road, alongside the traditional public ferry that still carries most foot traffic across the river near the Luxor Temple corniche."
      ),
      h2("Where to Stay"),
      p(
        "Most travelers base themselves on the East Bank, close to Karnak, Luxor Temple, and the town's restaurants, with a Nile-facing room turning breakfast or a sundowner into part of the experience. A smaller number of boutique properties sit on the West Bank itself, closer to the Valley of the Kings and away from the town's noise — worth considering if you'd rather wake up already on the quiet side of the river."
      ),
      h2("A Sample Two-Day Plan"),
      p(
        "If two days is what you have, a workable split looks like this: spend day one on the West Bank, starting at the Valley of the Kings as early as tickets allow, then Hatshepsut's Temple and the Colossi of Memnon before the heat peaks in early afternoon. Spend day two on the East Bank, with Karnak first thing in the morning and Luxor Temple saved for late afternoon into evening, when it's lit and the crowds have thinned. A third day, if you can manage it, is best spent either on a sunrise balloon flight or simply revisiting whichever site pulled at you the most."
      ),
      h2("Best Time to Visit Luxor"),
      p(
        "Luxor's summer heat is serious — well above 40°C (104°F) inland from June through August — which makes October through April far more comfortable for a full day of walking between open-air temple courts. Early starts matter here more than almost anywhere else in Egypt: most sites open at dawn specifically so visitors can finish before the worst of the midday heat, whatever the season. If your dates are flexible, we've written a fuller month-by-month breakdown of when to visit Egypt generally."
      ),
      callout(
        "Ticket rules for the Valley of the Kings rotate to protect the paintings from humidity and crowding — a standard ticket includes entry to a handful of tombs, while a few of the most famous, including Tutankhamun's, require a separate ticket. Choose which tombs to see based on what's actually open the day you visit rather than a fixed list.",
        { title: "Good to Know", tone: "Info" }
      ),
      h2("Practical Notes for Planning"),
      ...bullets([
        "Dress for temple visits the way you would for any conservative site — shoulders and knees covered, loose and breathable fabric",
        "Bring more water than feels necessary, especially on West Bank mornings with real walking between sites",
        "A private Egyptologist guide is worth it in Luxor more than almost anywhere else in Egypt — the difference between looking at a wall of hieroglyphs and understanding the story on it is enormous",
        "Photography is generally allowed at most sites, though some tombs restrict or charge for cameras — check locally before you go",
      ]),
      faq(
        [
          {
            question: "Is Luxor safe to visit?",
            answer:
              "Yes. Luxor is one of Egypt's most tourism-oriented cities, with a visible tourist police presence at every major site, and violent crime against visitors is rare.",
          },
          {
            question: "Can I see Luxor in one day?",
            answer:
              "You can see a compressed highlight reel, usually Karnak and the Valley of the Kings, but you'll be moving fast and skipping most of what makes Luxor worth the trip. Two to three days is the realistic minimum.",
          },
          {
            question: "Do I need a guide inside the temples?",
            answer:
              "You don't need one to enter, but you'll get far more out of the visit with one. Luxor's sites are dense with symbolism that isn't explained on-site, and a good Egyptologist turns a wall of carvings into an actual story.",
          },
          {
            question: "Is Luxor part of a standard Nile cruise?",
            answer:
              "Yes. Luxor is the traditional starting or ending point for cruises and dahabiya sails to and from Aswan, which is why many Egypt itineraries combine a Luxor stay with the river journey rather than treating them separately.",
          },
          {
            question: "How does a Luxor stay fit into a wider Egypt trip?",
            answer:
              "Most multi-day Egypt itineraries treat Luxor as one stop in a Cairo–Luxor–Aswan route, often continuing by Nile cruise or private car to Aswan afterward. It pairs naturally with a Nile cruise on one end and Cairo and Giza on the other, which is how most of our own multi-day itineraries are built.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "Luxor rewards patience more than almost anywhere else in Egypt. Rush it and you'll leave with photographs of temples. Give it two or three unhurried days and you'll leave understanding why this was ancient Egypt's capital for so long."
      ),
      { _type: "ctaBlock", _key: nextBlockKey("cta"), title: "Plan Your Luxor Days", body: "See how a private Luxor stay fits into your Egypt itinerary.", buttonLabel: "Explore Luxor Tours", buttonHref: "/tours/2-day-luxor-tour" },
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
    relatedTours: toursBySlug("luxor-east-bank-day-tour", "luxor-west-bank-day-tour", "2-day-luxor-tour", "6-day-cairo-giza-luxor"),
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
      p(
        "Ancient Thebans built their city around a straightforward idea: the living belonged on the east side of the Nile, where the sun rises, and the dead belonged on the west, where it sets. Three thousand years later, that division still organizes how you'll actually spend your time in Luxor — and it's worth understanding before you plan your days, not after you've already booked a single rushed itinerary that tries to cram both into an afternoon."
      ),
      h2("The East Bank: Temples for the Living"),
      p(
        "This is where modern Luxor actually lives — the town, most hotels and restaurants, and the temples built to be used by the living: Karnak, Egypt's largest religious complex, and Luxor Temple, connected to it by the restored Avenue of Sphinxes. Both are close together and walkable from most East Bank hotels, which makes this the more convenient half to explore. Karnak alone can absorb two or three hours if you take it slowly, and Luxor Temple is worth a second visit after dark, when it's lit and feels almost like a different site entirely."
      ),
      p(
        "Give the East Bank a comfortable half-day to a full day, ideally starting at Karnak before the heat and the crowds build, then working through Luxor Temple later — either right after, or saved for evening. The corniche along the Nile here is also genuinely pleasant to walk, with cafes and river views that make a good stretch for people who've had enough temple walls for one morning."
      ),
      h2("The West Bank: A Landscape Built for the Dead"),
      p(
        "The West Bank holds the Valley of the Kings, Hatshepsut's mortuary temple carved into a cliff face, the Colossi of Memnon, and the villages and workshops of the people who actually built the tombs. It's quieter, greener in patches near the cultivated land by the river, and spread out enough that a private vehicle matters more here than on the East Bank — sites sit further apart, and the desert heat between them is no place for a long walk."
      ),
      p(
        "Plan a full morning here at minimum, starting as early as tickets allow. The Valley of the Kings alone deserves unhurried time inside at least two or three tombs, and Hatshepsut's Temple rewards a slow approach up its terraces rather than a quick photo from the entrance. Fewer restaurants and shops sit out here compared to the East Bank, so most visitors return across the river for lunch rather than staying through the afternoon."
      ),
      h2("Practical Differences That Actually Matter"),
      p("Beyond the history, a handful of practical differences shape how each half of Luxor actually feels to visit."),
      ...bullets([
        "Transport — the East Bank is largely walkable between major sites; the West Bank requires a car or taxi between almost every stop",
        "Shade — Karnak and Luxor Temple offer some covered colonnades; the Valley of the Kings has almost none, which makes an early start more important there",
        "Food and rest stops — East Bank restaurants and cafes are frequent; West Bank options are sparser, so plan lunch back across the river or bring supplies",
        "Pace — East Bank sites can be seen somewhat flexibly through the day; West Bank sites reward an early start more strictly because of the heat and walking distances",
        "Crowds — Karnak and the Valley of the Kings both draw the largest tour groups; arriving right at opening makes the biggest difference at either",
      ]),
      h2("So Which Should You See First?"),
      p(
        "There's no wrong order, but there is a practical one: the West Bank rewards an early start more than the East Bank does, since the Valley of the Kings has less shade and more walking between sites. Most private itineraries put the West Bank first for that reason, saving Karnak's covered colonnades and Luxor Temple's evening lighting for later in the day, when the desert heat has eased but there's still enough light to see the reliefs clearly."
      ),
      h2("Can You Do Both Banks in One Day?"),
      p(
        "Technically, yes — plenty of day-tour itineraries pack the Valley of the Kings, Hatshepsut's Temple, Karnak, and Luxor Temple into a single long day. Honestly, it's a lot: you're covering roughly five thousand years of construction across two very different landscapes, in the heat, with a river crossing in the middle. It works if Luxor is genuinely just one stop on a longer Egypt trip and a single day is all you have. If you can give it two days instead, one bank each, you'll see the same sites without racing the clock between every stop."
      ),
      h2("What First-Timers Get Wrong"),
      p(
        "The most common mistake is treating the two banks as interchangeable stops on a checklist rather than two genuinely different experiences that deserve different expectations. Visitors who rush the West Bank in the same brisk pace that works fine at Luxor Temple in the evening often come away exhausted and underwhelmed — the Valley of the Kings rewards standing quietly inside a tomb and actually looking, not speed-walking past six of them to say you saw them all. The opposite mistake happens too: spending so long on the West Bank's tombs that Karnak gets rushed at the end of a long, hot day when everyone's patience for hieroglyphs has run out."
      ),
      p(
        "The second common mistake is underestimating the West Bank's logistics. It looks close to the East Bank on a map — it's the same city, after all — but the sites themselves are spread across a wide stretch of desert foothills, and walking between them isn't realistic. Arranging a driver for the morning, whether through a private tour or a hired car, matters more here than almost anywhere else in Luxor."
      ),
      h2("A Different Way to See Both Banks at Once"),
      p(
        "If you want a single moment that ties the whole geography together, a sunrise hot-air balloon flight over the West Bank does exactly that. From the air, the relationship between the two banks becomes obvious in a way it never quite is on the ground — the green, cultivated strip that follows the Nile, the desert beginning almost immediately beyond it, and the temples and tombs of both banks visible at once in the first light of day. It's not a substitute for visiting either bank properly, but it's a genuinely useful way to understand why the ancient division existed in the first place."
      ),
      callout(
        "A public ferry still crosses the Nile near the Luxor Temple corniche and is the fastest way over for foot passengers, though most private tours use a vehicle and the newer road bridge instead, which is more practical once you're moving between spread-out West Bank sites rather than staying on foot.",
        { title: "Good to Know", tone: "Info" }
      ),
      faq(
        [
          {
            question: "Which bank has better hotels?",
            answer:
              "Most hotels, including the well-known Nile-view properties, sit on the East Bank, close to the town, restaurants, and Karnak. A smaller number of quieter boutique stays sit on the West Bank itself, appealing if you'd rather wake up already close to the Valley of the Kings.",
          },
          {
            question: "Which bank should I prioritize with limited time?",
            answer:
              "If you truly only have a few hours, the West Bank generally has the higher-priority sites for most first-time visitors — the Valley of the Kings and Hatshepsut's Temple are harder to substitute than an abbreviated visit to Karnak.",
          },
          {
            question: "Is the West Bank safe to visit independently?",
            answer:
              "Yes. It's well set up for tourism, with ticket offices, guides, and vehicles readily available, though its spread-out layout makes a private driver or guide considerably more convenient than trying to arrange transport site by site on your own.",
          },
          {
            question: "Do I need separate tickets for each bank?",
            answer:
              "Yes, generally. East Bank sites like Karnak and Luxor Temple and West Bank sites like the Valley of the Kings and Hatshepsut's Temple are ticketed separately, and some West Bank tombs — Tutankhamun's among them — require an additional ticket beyond the standard Valley of the Kings entry.",
          },
          {
            question: "How early should I start on the West Bank?",
            answer:
              "As early as tickets are sold. The Valley of the Kings has little shade, and the difference between arriving right at opening and arriving mid-morning is significant once the desert sun is fully up — both in comfort and in how thin the crowds are inside the tombs themselves.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "Neither bank is the real Luxor on its own. The East Bank's temples and the West Bank's tombs were built as two halves of one religious idea, and seeing only one leaves the story unfinished. Give both banks their own unhurried block of time, and the ancient division between the living and the dead starts to make a lot more sense than it does on paper."
      ),
      { _type: "ctaBlock", _key: nextBlockKey("cta"), title: "See Both Banks Properly", body: "Book a dedicated East Bank or West Bank day, or combine them on a longer Luxor stay.", buttonLabel: "Explore Luxor Tours", buttonHref: "/tours/luxor-west-bank-day-tour" },
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
    relatedTours: toursBySlug("8-day-essential-egypt-nile-cruise", "4-day-nile-cruise-luxor-aswan", "overnight-dahabiya-sail-esna-edfu", "private-yacht-nile-cruise-luxor-aswan"),
    seoTitle: "Nile Cruise vs. Dahabiya: Which Is Right for You?",
    seoDescription:
      "A standard Nile cruise ship and a traditional dahabiya sailboat cover the same route very differently. Here's what actually changes between them.",
    body: [
      p(
        "The stretch of Nile between Luxor and Aswan is the single most scenic way to see ancient Egypt — temples appear right at the water's edge, roughly in the order the pharaohs who built them intended. How you travel that stretch, though, changes the experience more than almost any other decision in an Egypt itinerary, and the two main options don't just differ in price. They're genuinely different kinds of trips."
      ),
      h2("The Standard Nile Cruise"),
      p(
        "A modern Nile cruise ship is a motor vessel, typically carrying anywhere from 40 to well over 100 passengers, with balcony cabins, a pool deck, multiple dining rooms, and evening entertainment — closer to a small floating hotel than a boat in the traditional sense. It's the more structured way to travel the river: a fixed itinerary, shared meals, and shore excursions organized for the whole ship. Stops typically include Edfu, Kom Ombo, and Aswan, with everyone disembarking together for guided visits to each temple along the way."
      ),
      p(
        "For travelers who want the comfort of a proper cabin, a pool to come back to after a hot morning at Kom Ombo, and the reassurance of a set schedule, it's genuinely hard to beat. It also tends to suit families and first-time visitors especially well, since meals, excursions, and onboard entertainment are all handled without much for you to plan day to day."
      ),
      h2("What Is a Dahabiya?"),
      p(
        "A dahabiya is a traditional Egyptian sailing boat — a shallow wooden hull, tall lateen sails, and a wide open sun deck — carrying a small fraction of a standard cruise ship's passengers, usually somewhere between 8 and 20 guests. The sailing itself becomes part of the experience rather than a means of transport: without a ship's engine noise, you notice things a large cruise moves past — fishermen working the shallows at dawn, villages along the bank, the sound of the water itself."
      ),
      p(
        "Because a dahabiya carries so few guests, it can also stop in places a large cruise ship simply can't — narrower stretches of river, quieter riverside villages, smaller temple sites without a mooring built for a hundred-cabin vessel. It's a slower, more private way to cover the same general route, generally at a higher cost per guest than a standard cruise cabin, and it depends more directly on wind and weather since a dahabiya genuinely sails rather than motoring on a fixed schedule."
      ),
      h2("What Actually Changes Day to Day"),
      p(
        "On a standard cruise, your day follows the ship's printed schedule: breakfast, a shore excursion with a large group, lunch back on board, an afternoon stop, dinner, and an evening show or lecture. On a dahabiya, the day bends around the wind and the group itself — a stop might run longer because everyone's enjoying it, or the boat might simply sail for an extra hour because the light on the water is good. Meals on a dahabiya are typically shared at one table with the small group aboard, which suits travelers who like that kind of company and feels different from a cruise ship's larger, more anonymous dining rooms."
      ),
      h2("Which Route Makes Sense for Each"),
      p(
        "Both typically sail the same general route between Luxor and Aswan, taking in Edfu's Temple of Horus and Kom Ombo's twin temple along the way, though the specific stops and pacing vary by itinerary and by how many days you have. A standard cruise tends to run this full stretch on a fixed multi-day schedule; a dahabiya sail can cover a shorter, more focused piece of the route — an overnight sail between Esna and Edfu is a good example of a shorter dahabiya experience that gives you the sailing and the temples without the full multi-day commitment."
      ),
      h2("Side by Side"),
      p("A quick comparison, if you want the differences in one place before reading further:"),
      ...bullets([
        "Group size — standard cruise: often 100+ guests; dahabiya: typically 8 to 20 guests",
        "Propulsion — standard cruise: engine, fixed schedule; dahabiya: sails, weather-dependent pacing",
        "Onboard amenities — standard cruise: pool, multiple restaurants, entertainment; dahabiya: sun deck, single shared dining table",
        "Atmosphere — standard cruise: bustling, hotel-like; dahabiya: quiet, intimate, closer to the water",
        "Cost per guest — standard cruise: generally lower; dahabiya: generally higher for a smaller, more personal experience",
        "Best suited to — standard cruise: families, first-time visitors, groups who want structure; dahabiya: couples, small groups, and travelers who want the sailing itself to be the memory",
      ]),
      h2("Who Tends to Regret Which Choice"),
      p(
        "Travelers who choose a standard cruise expecting dahabiya-level quiet sometimes find the ship busier and more scheduled than they pictured, especially during peak season when several large vessels dock together at the same temple at once. Travelers who choose a dahabiya expecting cruise-ship amenities — a pool, an extensive buffet, nightly entertainment — are choosing the wrong boat for the wrong reasons; a dahabiya's appeal is precisely that it doesn't try to be that. Knowing which trade-off you're actually making ahead of time avoids both disappointments."
      ),
      h2("Onboard Life: A Closer Look"),
      p(
        "On a standard cruise, expect a full daily rhythm — breakfast buffet, a shore excursion, lunch back aboard, an afternoon at the pool or in a lounge chair on deck, a multi-course dinner, and often live entertainment or a themed evening. Cabins are hotel-standard, usually with a private balcony on the higher-category ships, and staff outnumber guests enough that service feels attentive without being intrusive."
      ),
      p(
        "On a dahabiya, the rhythm slows down considerably. Mornings often start with coffee on deck as the crew raises the sails, meals are cooked fresh by a small onboard kitchen and served at one long table, and afternoons might mean reading on deck, a swim off the boat where the river allows it, or simply watching the Nile Valley pass at a walking pace rather than a motor's pace. It's a genuinely different kind of days-at-sea experience, closer to a small private yacht than a resort.",
      ),
      h2("So Which Should You Choose?"),
      p(
        "If a pool, a full-size cabin, several dining options, and a well-established schedule matter to you, a standard Nile cruise will feel more comfortable — it's the right choice for most families, first-time visitors, and anyone who'd rather not think about logistics. If what you actually want is quiet, a smaller group, and the sailing itself as part of the memory rather than just the transport between temples, a dahabiya is worth booking directly."
      ),
      callout(
        "Cabin sizes and amenities vary a lot between individual cruise ships and dahabiyas, more than the category name alone suggests. If a specific feature matters to you — a particular cabin size, a pool, a certain number of guests aboard — ask about that exact boat rather than assuming every vessel in a category is the same.",
        { title: "Good to Know", tone: "Info" }
      ),
      faq(
        [
          {
            question: "Is a dahabiya more expensive than a standard cruise?",
            answer:
              "Generally yes, per guest, since a dahabiya carries far fewer passengers to split the cost of the crew, boat, and route across. What you're paying for is the smaller group and the quieter, more personal experience, not a fundamentally different route.",
          },
          {
            question: "Do dahabiyas have air conditioning and private bathrooms?",
            answer:
              "Most modern dahabiyas built for tourism do include private en-suite cabins and air conditioning, alongside the traditional sails — it's a genuine boat with real amenities, not a rustic recreation. Specifics vary by vessel, so confirm what a particular dahabiya offers before booking.",
          },
          {
            question: "Can children join a dahabiya sail?",
            answer:
              "They can, though the smaller, quieter, adult-oriented atmosphere on most dahabiyas suits older children and teenagers better than very young kids, who may get more out of a standard cruise's pool deck and more flexible pacing.",
          },
          {
            question: "How many days does a Nile sail typically take?",
            answer:
              "It depends entirely on the route and vessel — some cruises run the full multi-day stretch between Luxor and Aswan, while shorter dahabiya sails can cover a single overnight leg of the same river. Choose based on how much time you have and how much of the sailing itself you want as part of the trip.",
          },
          {
            question: "Can I combine both on one trip?",
            answer:
              "Some travelers do — a short dahabiya sail for a couple of nights, paired with a standard cruise or a land-based Luxor and Aswan stay for the rest of the trip, gets you a taste of the quiet sailing experience without committing every night of the itinerary to it. It's exactly the kind of combination we can build into a custom itinerary rather than something you'd typically find pre-packaged.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "There's no wrong answer here, only a mismatch between the trip you actually want and the one you book without asking the right questions first. Picture your ideal afternoon on the water — a pool and a set schedule, or a quiet sail and dinner with a handful of other guests — and the choice tends to make itself."
      ),
      { _type: "ctaBlock", _key: nextBlockKey("cta"), title: "Sail the Nile Your Way", body: "From a full-service cruise to an overnight dahabiya sail, we'll help you pick the right way to see Luxor and Aswan by water.", buttonLabel: "See Nile Sailing Options", buttonHref: "/tours/overnight-dahabiya-sail-esna-edfu" },
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
    relatedTours: toursBySlug("10-day-private-luxurious-trip", "8-day-essential-egypt-nile-cruise", "6-day-cairo-giza-luxor"),
    relatedExperience: herEgyptExperience,
    seoTitle: "Private vs. Group Tours in Egypt: What Actually Changes",
    seoDescription:
      "The price gap between private and group Egypt tours is obvious. What it buys you day to day is less talked about — here's the honest breakdown.",
    body: [
      p(
        "Every Egypt tour operator will tell you private is better. It usually is — but it's worth being specific about why, because the price difference is real, and it should buy you something you'd actually notice, not just a nicer-sounding word on a brochure. Here's the honest breakdown of what actually changes."
      ),
      h2("What a Group Tour Actually Looks Like"),
      p(
        "A group tour puts you on a shared itinerary with anywhere from a handful to several dozen other travelers, moving through sites together on a fixed schedule, with a guide who's explaining the same information to the whole group at once. Meals, entry times, and pacing are all set in advance and shared across the group, which is exactly what keeps the per-person cost down. For travelers on a tighter budget, or those who genuinely enjoy meeting other people on the road, it can work well."
      ),
      h2("What Changes on a Private Tour"),
      p(
        "Your vehicle is yours alone, which means your schedule is yours alone. You can start at sunrise to beat both the heat and the crowds at Karnak or the Pyramids, linger somewhere that unexpectedly catches you, or leave early if someone in your group is tired — none of which is possible when twenty other people's preferences are also on the itinerary. Your guide is dedicated to your group specifically, which tends to mean deeper, more responsive explanations rather than a fixed script delivered to the same size crowd every day."
      ),
      h2("What You're Actually Paying For"),
      p(
        "A group tour splits the cost of the vehicle, guide, and driver across everyone on board, which is why it's cheaper. A private tour means you're covering that full cost yourself, in exchange for controlling exactly how the day runs. It's the same trade-off as a private car versus a scheduled bus route: the destination can be identical, but the experience of getting there rarely is."
      ),
      h2("Timing Matters More Than People Expect"),
      p(
        "Egypt's major sites are genuinely different places at 7am versus 11am — quieter, cooler, and better lit for photographs. A private tour lets you build your entire day around that window, arriving at Karnak or the Valley of the Kings right as the gates open. A group tour is bound to the group's collective wake-up time and the bus schedule, which usually means arriving well after the first rush of the day and standing in the same crowd everyone else is trying to avoid."
      ),
      h2("Who Actually Benefits Most"),
      p("A few kinds of travelers notice the difference between private and group touring more than others."),
      ...bullets([
        "Families with young children — no waiting on twenty strangers when someone needs a bathroom break or a snack, and naps or slower mornings don't derail the whole group's day",
        "Couples marking an occasion — a honeymoon, an anniversary, a milestone trip — where the day can be shaped around what matters to them rather than a fixed group schedule",
        "Travelers with mobility considerations — pacing, rest stops, and routes through a site can all be adjusted, which isn't possible on a bus itinerary built for the average pace of a large group",
        "Photographers — early arrivals and flexible lingering time at a site matter enormously for good light and empty frames",
        "Anyone who simply dislikes being herded — some travelers notice the loss of control from the very first temple, regardless of budget",
      ]),
      h2("What Group Tours Do Better"),
      p(
        "To be fair, group touring isn't only a compromise. It's genuinely more affordable, which matters. It also puts you around other travelers, which some people enjoy rather than tolerate — shared excitement at the Pyramids, dinner conversation with people from somewhere else entirely. And a well-run group tour still gets you to every major site; you're not missing the Sphinx because you chose the cheaper option. The real trade-off is control and pace, not access."
      ),
      h2("A Middle Ground: Small Private Groups"),
      p(
        "If cost is the main hesitation but the crowd-following experience of a large bus tour doesn't appeal, look at small private group options — traveling with one other family or a small handful of people who split a private vehicle and guide, rather than joining a large fixed-departure tour. It's not always advertised clearly, but it's worth asking about directly if you want most of a private tour's flexibility without covering the full cost alone."
      ),
      h2("What About Guide Quality?"),
      p(
        "This is where the gap between private and group touring can be widest but least visible from the outside. A group guide is managing a large crowd's attention, safety, and pace simultaneously, which naturally limits how deep any single explanation can go — there's a schedule to keep and thirty people to shepherd through a doorway. A private guide answers to your group alone, which tends to mean genuine back-and-forth rather than a memorized script: you can ask a follow-up question about a specific pharaoh or a detail on a wall, and actually get a real answer rather than a redirect toward the next stop."
      ),
      h2("Photography and the Golden Hour"),
      p(
        "Anyone serious about photography should weigh this factor specifically. The best light at the Pyramids, Karnak, or the Valley of the Kings falls in the first hour after sunrise and the last before sunset — windows that group tours rarely hit, since bus schedules are built around meal times and site opening hours that work for the whole group's logistics, not for optimal light. A private tour can be built explicitly around those windows, arriving before the tour buses and leaving before the midday crowds peak."
      ),
      h2("How Booking and Planning Differ"),
      p(
        "Booking a group tour is usually simpler upfront — you pick a fixed departure date and an itinerary someone else already designed, and that's largely the extent of the planning involved. Booking a private tour typically means more of a conversation beforehand: what you want to see, how many days you have, whether pace matters more to you than covering the maximum number of sites. That conversation takes a little more time at the start, but it's what makes the itinerary actually fit your trip rather than a generic average of what most travelers want."
      ),
      callout(
        "Group tour prices often look lower than they actually are once you check what's included — some quote a bare tour price and charge separately for entry tickets, meals, or a private guide upgrade. When comparing a group price against a private one, confirm exactly what's bundled into each before assuming the gap is as large as it first appears.",
        { title: "Good to Know", tone: "Info" }
      ),
      faq(
        [
          {
            question: "Is a private tour worth it for a first trip to Egypt?",
            answer:
              "For most first-time visitors, yes — a first trip is exactly when the flexibility to slow down at something unexpectedly moving, or speed past something that doesn't interest you, matters most. It also removes a lot of the logistical stress of a country you don't know yet.",
          },
          {
            question: "How much more does a private tour typically cost?",
            answer:
              "It varies by itinerary and group size, but private touring generally costs meaningfully more per person than a large group tour, since you're no longer splitting the vehicle and guide across many travelers. The gap narrows the more people are in your own private party.",
          },
          {
            question: "Can I customize a private tour's itinerary?",
            answer:
              "Yes — that's a large part of the point. A private itinerary can be adjusted for pacing, interests, mobility needs, or specific sites you care about, in a way a fixed group departure simply can't accommodate.",
          },
          {
            question: "Do private tours still include a knowledgeable guide?",
            answer:
              "Yes, and often a more attentive one — your guide's attention isn't divided across a large group, so questions get real answers and the explanations can go as deep as your actual interest in the subject.",
          },
          {
            question: "Is it safe to travel privately versus in a group?",
            answer:
              "Yes — private touring in Egypt is a well-established, mainstream way to travel, not a niche or higher-risk option. Licensed private guides and drivers work throughout the country's tourism industry, and a private vehicle with a dedicated guide is, if anything, easier to keep track of than coordinating with a large group.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "Traveling privately in Egypt isn't about luxury for its own sake. It's about the trip actually following your interests and your pace instead of a stranger's average preferences across twenty people. For most travelers who can manage the cost difference, that's worth quite a lot."
      ),
      { _type: "ctaBlock", _key: nextBlockKey("cta"), title: "Build a Private Egypt Itinerary", body: "Tell us your dates, interests, and pace, and we'll shape a private tour around them.", buttonLabel: "Customize Your Tour", buttonHref: "/customize" },
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
      p(
        "The Grand Egyptian Museum opened in full on November 1, 2025, after two decades of construction, and it changes what a Cairo and Giza itinerary actually looks like. It sits close to the Pyramids themselves, meaning a single day can now realistically combine the Giza plateau with one of the largest archaeological museums in the world, something that wasn't possible before it opened. This guide covers what's actually inside, how to plan the visit, and how it fits alongside the Pyramids on the same day."
      ),
      h2("What's Actually Inside"),
      p(
        "The museum holds more than 100,000 artifacts across its main galleries, but the single biggest draw is Tutankhamun: for the first time, his complete funerary collection — all 5,398 pieces, from the golden mask to objects that had never left storage — is displayed together in dedicated galleries. Seeing the boy king's collection as one complete set, rather than split across cases in downtown Cairo the way it was for decades, is genuinely different from anything Egypt's museums have offered before."
      ),
      p(
        "The Khufu Boat Museum, housing the full-size solar barque buried beside the Great Pyramid, is also part of the complex, displayed in its own dedicated space designed around the vessel's scale. Beyond Tutankhamun and the boat, the main galleries move chronologically through ancient Egyptian history, from the earliest dynasties through the Greco-Roman period, with statues, sarcophagi, and everyday objects organized to tell a continuous story rather than presenting artifacts in isolation."
      ),
      h2("The Grand Staircase"),
      p(
        "One of the museum's most photographed features isn't a single artifact but the building itself — a monumental staircase lined with statues and stone pieces, rising through the atrium and framing a view of the Pyramids visible through the museum's glass facade at the top. It's worth allowing time to walk it slowly rather than treating it as a passage between galleries."
      ),
      h2("Tickets and Booking"),
      p(
        "Tickets are sold online through the museum's official site, and advance booking is strongly recommended — it lets you skip the ticket line entirely and lock in a specific time slot. As of this writing, standard foreign-visitor admission runs around $30, with reduced rates for students and children; given how recently the museum opened, treat any specific price as a starting estimate and confirm the current rate when you book, rather than something fixed. Separate, additional tickets apply for the Tutankhamun galleries and the Khufu Boat Museum beyond the general admission ticket, so check what's included before you go. If you're touring with us, this is exactly the kind of detail we handle as part of your itinerary rather than something you need to manage yourself."
      ),
      h2("Getting There"),
      p(
        "The museum sits on the edge of the Giza plateau, close enough to the Pyramids that many visitors combine both in a single day. Most private itineraries build the museum and the Pyramids into the same day trip from Cairo, moving between the two by private vehicle rather than treating them as separate excursions on separate days."
      ),
      h2("How Much Time to Allow"),
      p(
        "Between the Tutankhamun galleries and the wider collection, it's realistic to spend a half day here without feeling rushed — figure on three to four hours minimum if you want to see the Tutankhamun collection properly rather than walking past it. Visitors trying to also fit in the Pyramids, the Sphinx, and lunch on the same day should plan an early start; the museum alone can easily fill an entire day if you let it."
      ),
      h2("Combining It With the Pyramids"),
      p(
        "Because the museum and the Giza plateau sit so close together, a full-day itinerary pairing both has become one of the most popular ways to structure a Cairo visit. A typical approach starts at the Pyramids and the Sphinx early, before the heat and crowds build, then moves to the museum for the afternoon, when its air-conditioned galleries are a welcome break from the desert sun outside. Doing it in the opposite order works too, though starting outdoors while the morning light and temperatures are still manageable tends to suit most travelers better."
      ),
      h2("Why It Took Twenty Years to Build"),
      p(
        "The museum's long construction timeline reflects both its scale and the complexity of the project — moving and conserving thousands of fragile artifacts, including entire statues and boats, is slow, careful work that can't be rushed without risking damage to pieces that have survived for thousands of years. Delays over the decades pushed the opening back repeatedly, which is partly why its full opening in November 2025 felt like such a significant moment for Egypt's tourism industry rather than a routine museum launch."
      ),
      h2("How It Changes a Cairo and Giza Itinerary"),
      p(
        "Before the museum opened, a Giza day typically meant the Pyramids, the Sphinx, and perhaps a visit to the older Egyptian Museum in downtown Cairo on a separate day, adding real travel time across the city. Now that the collection sits minutes from the plateau itself, itineraries can consolidate what used to take two separate excursions into one focused day, freeing up time elsewhere in a trip for Islamic Cairo, Coptic Cairo, or an extra day in Luxor or Aswan instead."
      ),
      h2("Visiting Tips"),
      ...bullets([
        "Book your ticket online in advance rather than planning to buy on arrival, especially during peak season",
        "Budget separate time and, if relevant, a separate ticket for the Tutankhamun galleries and the Khufu Boat Museum",
        "Wear comfortable shoes — the museum is enormous, and the distance between galleries adds up quickly",
        "Bring a light layer; the galleries are air-conditioned and noticeably cooler than outside",
        "If you're combining it with the Pyramids in one day, start outdoors in the morning and save the museum for the afternoon heat",
      ]),
      callout(
        "The museum's scale genuinely surprises first-time visitors — its total footprint is enormous compared to Cairo's older Egyptian Museum downtown, and trying to see everything in one rushed pass usually backfires. Pick what matters most to you ahead of time, whether that's Tutankhamun, the Khufu boat, or a specific period of ancient history, and build your visit around that rather than attempting comprehensive coverage in a few hours.",
        { title: "Good to Know", tone: "Info" }
      ),
      faq(
        [
          {
            question: "Is the Grand Egyptian Museum worth visiting?",
            answer:
              "Yes, straightforwardly. Seeing Tutankhamun's collection displayed as a complete set, rather than split across galleries the way it was for decades, is a genuinely different experience, and pairing it with the Pyramids on the same day makes a Giza day noticeably more complete than it was before the museum opened.",
          },
          {
            question: "Is the old Egyptian Museum in Tahrir Square still open?",
            answer:
              "Yes, it remains open with its own collection, though many of its most famous pieces, including much of the Tutankhamun material, have moved to the Grand Egyptian Museum. The two museums now serve somewhat different purposes rather than duplicating each other.",
          },
          {
            question: "How long does a visit to the Grand Egyptian Museum take?",
            answer:
              "Plan for at least three to four hours to see the Tutankhamun galleries and a meaningful slice of the main collection without rushing. A full day is realistic if you want to see everything the museum offers in real depth.",
          },
          {
            question: "Can I visit the Grand Egyptian Museum and the Pyramids on the same day?",
            answer:
              "Yes, and many travelers now do exactly that, since the museum sits close to the Giza plateau. A typical plan covers the Pyramids and Sphinx in the morning and the museum in the afternoon, though either order works depending on your preference.",
          },
          {
            question: "Do I need a guide inside the museum?",
            answer:
              "You don't need one to enter, but given how new and vast the collection is, a knowledgeable guide makes a real difference in understanding what you're looking at, particularly within the dense, artifact-packed Tutankhamun galleries.",
          },
          {
            question: "Is photography allowed inside the museum?",
            answer:
              "Photography is generally permitted in most galleries for personal use, though some areas, particularly around the Tutankhamun collection, may restrict flash or tripod use to protect the artifacts. Check current rules when you book, since policies at a museum this new can still be refined.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "The Grand Egyptian Museum isn't simply a new building for old artifacts. It's the first time in decades that a visit to Giza can genuinely combine the Pyramids with a museum experience built at the same scale as the monuments themselves, and it's already reshaping how a Cairo and Giza trip should be planned."
      ),
      { _type: "ctaBlock", _key: nextBlockKey("cta"), title: "Combine the Museum With the Pyramids", body: "Let us build a Giza day that pairs the Grand Egyptian Museum with the Pyramids and Sphinx without the rush.", buttonLabel: "See Giza Tours", buttonHref: "/tours/1-day-giza-tour" },
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
      p(
        "The short answer — October through April — is true but not that useful on its own, because those seven months aren't interchangeable. Crowds, prices, and how hot it actually feels standing at the Valley of the Kings at noon all shift meaningfully within that window. Here's what each part of the year is actually like, region by region, so you can pick a month based on what you actually care about rather than a generic rule of thumb."
      ),
      h2("December to February: Peak Season"),
      p(
        "This is Egypt's coolest, most comfortable stretch, and also its busiest — January in particular draws the year's largest crowds to Giza, Karnak, and the Valley of the Kings. If you're traveling privately, crowding matters less, since an early start and a private guide can route around the worst of it. If comfortable weather matters more to you than avoiding a crowd, this remains the safest bet, and it's also when Nile cruise cabins and popular hotels book up furthest in advance."
      ),
      h2("October–November and February–March: The Sweet Spot"),
      p(
        "These shoulder-season windows consistently come up as the smartest time to go: the weather is still genuinely comfortable, but the peak-season crowds either haven't arrived yet or have just thinned out. If your dates are flexible at all, this is where we'd point you first — it's the best ratio of good weather to manageable sites anywhere on the calendar, and pricing on hotels and cruises tends to ease slightly compared to the December through February peak."
      ),
      h2("May to September: Real Heat, and a Different Kind of Trip"),
      p(
        "Summer heat inland is serious — Luxor and Aswan regularly exceed 40°C (104°F) — and it does change what a day of temple-touring feels like, even with early starts and air-conditioned transport between stops. It's not a reason to rule the season out entirely, though: the Red Sea coast stays warm and inviting for swimming and diving right through summer, and if your trip leans toward the coast rather than a full temple circuit, these months work well. Cairo and Giza are more manageable than Upper Egypt in summer, if the Nile Valley's heat is the main concern, and hotel and tour pricing is often noticeably more flexible during these quieter months."
      ),
      h2("Weather by Region, Not Just by Month"),
      p("Egypt is a large country, and \"best time to visit\" answers differently depending on which part of it you're asking about."),
      ...bullets([
        "Cairo and Giza — hot but rarely extreme in summer, and genuinely pleasant from October through April; a year-round destination more than the Nile Valley or Sinai interior",
        "Luxor and Aswan (Upper Egypt) — the most heat-sensitive region on a standard itinerary; October through April is strongly preferred, with summer best avoided for full-day temple touring",
        "The Red Sea coast (Hurghada, El Gouna, Marsa Alam) — warm water and good diving conditions nearly year-round, including through the summer months when the Nile Valley is at its hottest",
        "Sinai (Sharm El Sheikh, Dahab) — similar to the Red Sea coast, comfortable across most of the year, with winter evenings noticeably cooler than the water itself",
      ]),
      h2("Best Time for a Nile Cruise"),
      p(
        "October through April is the strongest window for a Luxor-to-Aswan Nile cruise or dahabiya sail, for the same reason it's strongest for temple-touring generally: comfortable daytime temperatures for the shore excursions that are a core part of any river itinerary. A cruise during peak December-to-February season means busier temple stops, since several ships often dock at the same site around the same time; a shoulder-season sail in November or March usually means a quieter Kom Ombo or Edfu without sacrificing much comfort."
      ),
      h2("Best Time for the Red Sea"),
      p(
        "If your trip is built primarily around diving, snorkeling, or beach time rather than temples, the calendar opens up considerably. The Red Sea stays warm enough for swimming and diving across nearly the entire year, including summer, when Upper Egypt's heat makes a temple-heavy itinerary considerably harder. Winter evenings can be cool enough to want a light jacket after dark, but daytime water temperatures stay comfortable."
      ),
      h2("A Note on Ramadan"),
      p(
        "Ramadan's dates shift each year on the Islamic calendar, so it doesn't map to a fixed month — it's worth checking against your travel dates specifically. During it, some restaurants and shops keep shorter daytime hours before the evening iftar meal, and the pace of daily life shifts generally. Major sites stay open and tours run as normal; it simply changes some of the rhythm around them, in ways many travelers find genuinely interesting to witness firsthand."
      ),
      h2("Crowds and Pricing Trends"),
      p(
        "Broadly, price and crowd levels track each other through the year: December through February commands the highest hotel and cruise rates alongside the largest crowds, while summer months see the softest pricing and the thinnest crowds, offset by the heat trade-off in Upper Egypt. The shoulder seasons split the difference reasonably well, which is a large part of why they're so consistently recommended."
      ),
      h2("How Far in Advance to Book"),
      p(
        "For December through February travel, book flights, hotels, and Nile cruises several months out if you can — cabins on popular ships and rooms at well-located Luxor and Aswan hotels do sell out ahead of the peak. Shoulder-season and summer travel is more forgiving, with availability holding up closer to your travel dates, though a specific dahabiya or a particular hotel room category can still book out early regardless of season if it's in high demand."
      ),
      h2("A Special Case: Eclipse Travel"),
      p(
        "Occasionally a specific astronomical event reshapes the usual calendar logic entirely. A total solar eclipse crossing Luxor on August 2, 2027, for instance, will draw visitors specifically for that date regardless of the summer heat that month would otherwise discourage — proof that the \"best\" time to visit is sometimes about what's happening on a given day rather than the average weather for that month. If an event like that is the reason for your trip, plan around it first and treat the seasonal weather guidance as secondary."
      ),
      callout(
        "Want the best weather-to-crowd ratio without overthinking it? Aim for November or March. Want guaranteed cool weather and don't mind company at the major sites? December through February. Building your trip around the Red Sea rather than temples? Summer works fine, and pricing tends to be more flexible.",
        { title: "If You're Only Picking One Detail", tone: "Highlight" }
      ),
      faq(
        [
          {
            question: "What's the single best month to visit Egypt?",
            answer:
              "Most seasoned travelers point to November or March specifically — comfortable temperatures across the whole country, thinner crowds than the December-to-February peak, and generally easier pricing on hotels and cruises.",
          },
          {
            question: "Is Egypt too hot to visit in summer?",
            answer:
              "Not entirely, but it depends heavily on your itinerary. A temple-focused trip through Luxor and Aswan is genuinely difficult in peak summer heat; a Red Sea coast trip built around diving and beach time works well through the same months.",
          },
          {
            question: "When is the Nile flooded or too low to cruise?",
            answer:
              "Since the Aswan High Dam was completed, the Nile no longer floods seasonally the way it did in antiquity, and river levels are managed year-round, so cruising isn't seasonally restricted by water levels the way it once was.",
          },
          {
            question: "Does Ramadan affect tours and site access?",
            answer:
              "Major archaeological sites, temples, and tours continue operating normally during Ramadan. What changes is mostly around restaurant hours and the general daytime pace in cities, which picks back up after the evening iftar meal.",
          },
          {
            question: "Is winter too cold for a Nile cruise?",
            answer:
              "No — even Egypt's coolest months rarely bring genuinely cold daytime weather in the Nile Valley. Evenings can be cool enough for a light jacket, especially on an open sun deck, but daytime temperatures stay comfortable for sightseeing.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "There's no single correct month to visit Egypt, only a better or worse match for what you actually want from the trip. Chase comfortable weather and thinner crowds, and the shoulder seasons win easily. Chase guaranteed cool weather and don't mind sharing Karnak with a few more people, go in winter. Build the trip around the coast instead of the temples, and summer stops being a problem at all."
      ),
      { _type: "ctaBlock", _key: nextBlockKey("cta"), title: "Plan Around the Right Season", body: "Tell us your dates and priorities, and we'll build an itinerary suited to the weather you'll actually get.", buttonLabel: "Customize Your Tour", buttonHref: "/customize" },
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
    relatedTours: toursBySlug("10-day-private-luxurious-trip", "8-day-essential-egypt-nile-cruise", "6-day-cairo-giza-luxor"),
    seoTitle: "Egypt Travel for Women: A Grounded, Honest Guide",
    seoDescription:
      "What women travelers actually encounter in Egypt, what's worth preparing for, and what tends to get overstated online — a grounded, honest guide.",
    body: [
      p(
        "Egypt draws an enormous number of women travelers every year — solo, in pairs, and in groups — and the overwhelming majority have a genuinely good trip. That said, it's fair to want real information rather than either extreme: neither the alarmist warnings some corners of the internet traffic in, nor a blanket \"don't worry about it\" that skips useful detail entirely. Here's what actually shapes a woman's trip to Egypt, from the first market stall to the last temple courtyard."
      ),
      h2("What You're Actually Likely to Encounter"),
      p(
        "The most common friction women report isn't danger — it's persistent attention in crowded areas: vendors who don't take a polite no the first time, or unsolicited comments in busy markets and streets. It's rarely threatening, but it can be tiring over a long trip if you're navigating it alone, without a guide who can run interference. Tourist police are visibly present at every major site, and violent crime against tourists is genuinely rare."
      ),
      h2("What Actually Helps"),
      p(
        "A private guide changes this more than almost anything else — vendors and touts direct their attention differently toward a group traveling with a local guide than toward visibly independent travelers, and having someone who can navigate a situation in Arabic, calmly and immediately, removes most of the friction entirely. Modest, breathable clothing — covered shoulders and knees, loose rather than tight — is comfortable in the heat regardless of gender, and also draws less unwanted attention in more conservative areas outside tourist zones. None of this requires dressing differently from how you'd naturally dress for a hot, dusty, walking-heavy trip."
      ),
      h2("What to Wear, Realistically"),
      p(
        "Modesty in Egypt is less about strict rules and more about blending in comfortably. Shoulders and knees covered is the general standard outside resort pools and Nile cruise sundecks — think a loose linen shirt over lightweight trousers, a maxi dress, or wide-leg pants with a breathable top. None of this needs to feel like a costume; the goal is comfortable, sun-smart clothing that also reads as respectful in markets, temples, and mosques."
      ),
      ...bullets([
        "A few loose, lightweight layers rather than tight clothing — better for the heat and for blending in",
        "A scarf or light shawl, useful for covering shoulders at religious sites and for sun protection on exposed felucca or cruise decks",
        "Comfortable flat shoes for uneven temple stone and market cobbles",
        "A swimsuit is fine at hotel pools, Nile cruise sundecks, and private beach clubs — cover up when walking between the pool and your room",
      ]),
      h2("Solo Travel vs. Traveling With a Guide"),
      p(
        "Plenty of women do see Egypt solo, and plenty have a wonderful time doing it — trains between cities are straightforward, hotels are used to independent travelers, and major sites are well signed. What changes most with a private guide isn't safety in the dramatic sense; it's the day-to-day friction. A good guide handles ticket lines, steers unwanted attention away before it starts, and can answer the kind of question you might not think to ask a stranger."
      ),
      p(
        "For a first trip to Egypt, or for anyone who'd rather spend two weeks enjoying temples than managing logistics, a private guide is worth the cost difference over a public group tour. It also means the pace is yours — lingering at Karnak an extra hour, skipping a site that doesn't interest you, without twenty other travelers' preferences in the mix."
      ),
      h2("What to Look for in an Operator"),
      p(
        "Not every operator plans a trip the same way, and the difference shows up fastest for women traveling solo or in a small group. Ask specifically who your guide will be, whether it's the same guide across multiple days or a different person at each stop, and whether female travelers are something the company has actually built experience around rather than treating as an edge case. A company that answers these questions specifically and quickly is generally the one that's thought it through."
      ),
      p(
        "It's also worth asking about vehicle standards, hotel vetting, and what happens if a flight is delayed or a plan needs to change mid-trip — the answers tell you more about how a company handles the unexpected than any marketing copy does. A private, licensed guide who stays with your group for the length of the trip, rather than a rotating cast of local pickups at each site, tends to be the difference between a trip that feels handled and one that feels like a series of transactions."
      ),
      h2("Practical Comfort: Bathrooms, Hygiene, and Health"),
      p(
        "Public restrooms at major tourist sites are generally functional, though it's worth carrying tissue or wipes and a little local currency for attendants, who often expect a small tip. Sanitary products are available in pharmacies and supermarkets in Cairo, Luxor, Aswan, and resort towns, but the selection skews toward pads more than tampons — if you have a strong preference, it's worth packing enough for the trip rather than counting on finding your exact brand."
      ),
      p(
        "Heat and long touring days are a bigger factor than anything else — carry water, wear a hat, and don't underestimate how quickly a full day walking between open-air temples in the sun adds up. Egypt's tap water isn't recommended for drinking; bottled water is cheap and everywhere, including on every private tour we run."
      ),
      h2("How Different Cities and Regions Feel"),
      p(
        "Cairo carries the most street-level attention simply because it's the biggest, busiest city on the itinerary — Khan el-Khalili market and downtown streets have the most vendor energy. Luxor and Aswan are calmer and more geared toward temple-going travelers, with a naturally slower pace. Red Sea resort towns like Hurghada and Sharm El Sheikh, along with Nile cruise ships, run closest to a standard international resort experience, with far less of the market dynamic that shows up in Cairo."
      ),
      p(
        "None of this means avoiding Cairo — it means knowing what to expect there so it doesn't catch you off guard, which is exactly the kind of texture a good private guide navigates without you having to think about it."
      ),
      callout(
        "A private guide who's briefed on your itinerary in advance is worth more here than almost any other single decision — it changes how vendors and touts approach your group entirely, and it means someone is always nearby who can step in, translate, or simply say no on your behalf.",
        { title: "The Single Biggest Difference", tone: "Highlight" }
      ),
      h2("Where a Different Kind of Trip Helps"),
      p(
        "This is exactly why we built Her Egypt as its own Signature Experience rather than treating \"women's travel\" as a checkbox on a standard tour — it's designed from the ground up around the pace, comfort, and specific questions that come up on a trip built for women, with hosts who've thought through the details in advance rather than improvising them on the day. It isn't the only way to see Egypt well as a woman, but it's built for exactly this."
      ),
      faq([
        {
          question: "Is it safe for a woman to travel alone in Egypt?",
          answer:
            "Yes, in the sense that violent crime against tourists is rare and major sites have visible tourist police. The main friction solo women report is persistent vendor attention, which a private guide largely eliminates rather than any serious danger.",
        },
        {
          question: "What should women avoid wearing in Egypt?",
          answer:
            "Very tight or very sheer clothing draws more attention than it's worth, and sleeveless or short clothing outside a resort pool is best paired with a scarf or light layer for covering up at temples and mosques.",
        },
        {
          question: "Can women travel to Egypt during Ramadan?",
          answer:
            "Yes — the daytime pace is a little slower in some areas since many people are fasting, but tourist sites, hotels, and restaurants that cater to visitors operate as usual.",
        },
        {
          question: "Do I need to cover my hair in Egypt?",
          answer:
            "No — head covering isn't required or expected of visitors outside of specific religious sites, where a scarf may be asked for at the entrance and is easy to keep on hand.",
        },
        {
          question: "Is it appropriate to shake hands or make eye contact?",
          answer:
            "Generally yes with guides, hotel staff, and anyone in a tourism role. In more conservative settings outside tourist areas, taking a cue from the other person rather than initiating is a reasonable default.",
        },
        {
          question: "Is it worth traveling to Egypt as a woman in a group vs. going solo?",
          answer:
            "Both work well. A small group of friends or a women-only trip tends to draw less street-level attention than a single woman traveling alone, but plenty of solo women travel Egypt comfortably with the right guide and a sensibly planned itinerary.",
        },
      ]),
      p(
        "Egypt has been welcoming women travelers for as long as it's been welcoming travelers at all, and the version of the country you actually experience — market stalls, temple courtyards, a felucca sail at sunset — has very little to do with the warnings a search engine surfaces first. Prepare sensibly, choose the right kind of guide, and go."
      ),
      {
        _type: "ctaBlock",
        _key: nextBlockKey("cta"),
        title: "Plan a Trip Built Around You",
        body: "Tell us your dates, your pace, and what matters most, and we'll build a private Egypt itinerary with a guide who gets it right from day one.",
        buttonLabel: "Start Planning",
        buttonHref: "/customize",
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
    relatedTours: toursBySlug("6-day-cairo-giza-luxor", "8-day-essential-egypt-nile-cruise", "10-day-private-luxurious-trip"),
    seoTitle: "Egypt Visa Guide 2026: e-Visa Cost, Requirements, How to Apply",
    seoDescription:
      "Everything to know about the Egypt e-visa in 2026 — cost, processing time, requirements, and the common mistakes that delay applications.",
    body: [
      p(
        "Most visitors to Egypt need a visa, and the easiest route for the vast majority of travelers is the official e-visa — applied for online, before you fly, with no visit to an embassy required. Here's exactly how the process works, what it costs, and where first-time applicants tend to trip up."
      ),
      h2("How to Apply, Step by Step"),
      p(
        "The whole process runs through Egypt's official e-visa portal and takes most travelers well under half an hour to complete, aside from the waiting period for approval."
      ),
      ...bullets([
        "Go to the official Egypt e-visa portal and create an account with a valid email address",
        "Fill in your passport details and travel dates exactly as they appear on your passport",
        "Upload a digital passport-style photo and a scan of your passport's photo page",
        "Choose single-entry or multiple-entry and pay the application fee by debit or credit card",
        "Wait for the approval email, then download and save the PDF — you'll need it at check-in and on arrival",
      ]),
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
      h2("Timing: When to Apply"),
      p(
        "Processing typically takes around 3 business days, though it can occasionally run longer during busy travel periods. Apply at least a week before departure to build in a buffer, and avoid applying so early that your visa's validity window doesn't comfortably cover your actual travel dates. Airlines sometimes ask to see the approved visa PDF at check-in, so keep a copy accessible on your phone as well as a printed one in your travel documents."
      ),
      h2("Common Mistakes That Delay Approval"),
      p("Most delays and rejections trace back to a small handful of avoidable errors."),
      ...bullets([
        "Entering your name or passport number slightly differently than it appears on your passport",
        "Uploading a photo that doesn't meet the portal's size or background requirements",
        "Applying with a passport that expires within six months of your travel dates",
        "Paying through an unofficial third-party site that charges more and processes slower than the real portal",
        "Applying too close to departure, leaving no buffer if the review takes longer than usual",
      ]),
      h2("Do You Need an e-Visa at All?"),
      p(
        "Requirements vary by nationality, and it's worth checking the official portal directly for your passport rather than assuming — a small number of nationalities either aren't eligible for the e-visa and need to apply through an embassy, or fall under a different arrangement entirely. If you're transiting through Egypt without leaving the airport, you generally don't need a visa at all; check with your airline if your layover involves a terminal change."
      ),
      h2("Why the e-Visa Replaced the Old Paper Process"),
      p(
        "Egypt's e-visa system replaced what used to be a slower process involving a paper visa stamp bought at certain embassies, or exchanged for cash at the airport on arrival. Moving the whole thing online means it happens before you fly, at a fixed official price, with no need to carry exact cash for a stamp at the border — a real improvement for anyone who's dealt with the older system on a previous trip to the region."
      ),
      h2("Applying With Family or a Group"),
      p(
        "Each traveler needs their own individual e-visa application and approval, including children — there's no single visa that covers multiple passports, even when everyone is traveling together and booking the same trip. It's worth applying for the whole group at the same time so everyone's approval PDFs are ready together, rather than having one family member's visa clear days ahead of everyone else's."
      ),
      p(
        "If you're booking through a tour operator, it's still your responsibility to apply for your own visa unless the operator has explicitly told you otherwise — a private guide can advise you on the process, but the application itself goes through the official portal under each traveler's own name."
      ),
      h2("What to Expect at Immigration on Arrival"),
      p(
        "Landing in Egypt with an approved e-visa is a fairly routine process, but knowing the shape of it in advance makes it faster."
      ),
      ...bullets([
        "Have your printed or digital e-visa PDF ready alongside your physical passport, even if you also showed it at check-in",
        "Immigration counters typically take a photo and fingerprints as part of standard passport control, which is routine and quick",
        "Your passport gets stamped with your entry date — check it before you walk away, since a missing or incorrect stamp can cause problems at departure",
        "Keep the visa PDF accessible for the rest of your trip; some hotels ask to see it at check-in alongside your passport",
      ]),
      h2("If Something Goes Wrong: Rejections and Fixes"),
      p(
        "Most rejections trace back to a mismatch between the application and the passport — a name spelled slightly differently, a photo that doesn't meet spec, or a passport too close to its expiry date. If your application is rejected, the portal generally explains why, and reapplying with the corrected information usually resolves it well before your travel date, provided you applied with enough lead time in the first place. If you're traveling within the next day or two and something has gone wrong, contacting your airline or, if you're already booked with a tour operator, your Egypt-based contact directly is faster than troubleshooting alone."
      ),
      h2("Keeping Your Visa Documents Safe While Traveling"),
      p(
        "Save your approved e-visa PDF in at least two places — your email, a cloud drive, and a printed copy in your travel documents folder — so a dead phone or a lost bag doesn't leave you without proof of an approved visa. It's also worth screenshotting the confirmation page in case the email is delayed. None of this needs to be complicated; it just needs to exist somewhere you can reach quickly at an airport counter, half asleep after a long flight."
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
        {
          question: "What's the difference between an e-visa and a visa on arrival?",
          answer:
            "The e-visa is applied for online before you travel and is generally cheaper and faster than visa-on-arrival, which is issued at the airport for eligible nationalities and involves a line after a long flight.",
        },
        {
          question: "Can I extend my Egypt visa once I'm there?",
          answer:
            "Yes, extensions are possible through Egypt's immigration offices for travelers who decide to stay longer, though it's simpler to apply for the correct visa length upfront if you already know your travel dates.",
        },
        {
          question: "Do children need their own Egypt e-visa?",
          answer: "Yes — every traveler, regardless of age, needs an individual approved e-visa tied to their own passport.",
        },
        {
          question: "What if I lose my printed visa while traveling in Egypt?",
          answer:
            "As long as you have access to the approval email or a saved copy of the PDF, you can reprint it or show it digitally — the visa is tied to your passport record, not the paper copy itself.",
        },
      ]),
      p(
        "The e-visa is one of the more painless parts of planning an Egypt trip once you know where to apply and what the form actually asks for. Get it done a week or two out, save the PDF somewhere you can find it in an airport line, and the rest of the planning gets to be the fun part."
      ),
      {
        _type: "ctaBlock",
        _key: nextBlockKey("cta"),
        title: "Let Us Handle the Logistics",
        body: "Beyond the visa, a private Egypt itinerary means every transfer, ticket, and detail is arranged before you land.",
        buttonLabel: "Explore Egypt Tours",
        buttonHref: "/tours",
      },
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
    relatedTours: toursBySlug("8-day-essential-egypt-nile-cruise", "10-day-private-luxurious-trip", "sharm-el-sheikh-day-trip-from-cairo"),
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
      h2("Getting Around Safely"),
      p(
        "Private, arranged transport is the norm for tourism in Egypt, and it's also the simplest safety habit to adopt — a licensed driver and a vehicle arranged through your tour operator or hotel beats flagging down an unmarked taxi, especially at night. Domestic flights between Cairo, Luxor, Aswan, and Hurghada are frequent and normal; overnight trains between Cairo and Luxor or Aswan are a well-worn tourist route as well."
      ),
      p(
        "If you do need a taxi outside an arranged transfer, agree on the fare before getting in rather than after, and favor hotel-arranged or app-based rides where available over hailing one on the street. None of this is different from the same-city precautions travelers already take in most major destinations — it just matters slightly more in a place where the language and currency are unfamiliar."
      ),
      h2("Money, Scams, and Everyday Hassle"),
      p(
        "The most common negative experience tourists report in Egypt isn't crime — it's overcharging, insistent vendors, and the odd unofficial \"guide\" offering to show you something for a tip. None of it is dangerous, but it can wear on a trip if you're not expecting it. Agreeing on a taxi fare before getting in, keeping small bills on hand, and politely declining unsolicited offers of help at sites covers most of it."
      ),
      p(
        "Tourist police are stationed at every major site specifically to manage this kind of friction, and a private guide who's used to the local rhythm handles almost all of it before you even notice it's happening."
      ),
      h2("Health and Food Safety"),
      p(
        "Stick to bottled or filtered water, and food from restaurants and hotels used to serving tourists is very safe — the standard travel precaution of easing into street food gradually, rather than diving in on day one, applies here the same as anywhere. Basic travel insurance covering medical care is worth having, as it is for any international trip."
      ),
      h2("Heat and Environmental Safety"),
      p(
        "The more realistic day-to-day risk for most visitors isn't crime, it's the sun. Egypt's major sites are open-air, shade is minimal, and summer heat inland is genuinely intense. Carrying water, wearing a hat, pacing outdoor time around the coolest hours, and not underestimating how quickly a full day of walking between temples adds up matters more to most trips than any security consideration. Nile cruises and Red Sea resorts add water safety to the list — following posted flag warnings at beaches and staying within marked swimming or snorkeling areas covers the basics."
      ),
      h2("What Egypt's Tourism Security Actually Looks Like"),
      p(
        "Every major site — the Pyramids, the Egyptian Museum, Karnak, the Valley of the Kings — has a visible security presence and bag or metal detector checks at the entrance, which is now standard practice at major tourist attractions worldwide rather than something unique to Egypt. Hotels catering to international travelers generally have their own security checks at the entrance as well. None of this is meant to be alarming in person — it reads as routine within the first day of a trip, the same as airport security becomes routine after the first pass."
      ),
      h2("Is Egypt Safe for Solo and Women Travelers?"),
      p(
        "Yes, broadly — women travel to Egypt solo or in groups every year without incident, and the same core advice applies: stick to arranged transport, dress for the heat and the culture, and consider a private guide if you're traveling alone. It's a big enough topic that we've covered it in more depth separately."
      ),
      h2("What About Old Warnings You've Seen Online?"),
      p(
        "A lot of the most alarming Egypt travel content still circulating online is years, sometimes over a decade, out of date — written during a period of heightened instability that doesn't reflect the country's tourist areas today. Checking current, dated advisories rather than an old blog post or forum thread is worth the extra few minutes, especially since search results don't always surface the most recent information first."
      ),
      h2("A Quick Word on Political Context"),
      p(
        "Egypt's overall advisory level reflects the same general regional context that applies across much of the wider Middle East and North Africa, rather than anything specific to the day-to-day tourist experience. It's the same broad category many popular destinations carry, worth reading in that context rather than assuming it singles Egypt out. Tourism is a major part of Egypt's economy, and the areas travelers actually visit are treated accordingly — well-maintained, well-staffed, and used to hosting visitors from everywhere."
      ),
      h2("Small Practical Precautions Worth Knowing"),
      ...bullets([
        "Shake out shoes before putting them on after a desert camp or overnight stay near the dunes",
        "Keep photocopies (digital or paper) of your passport and visa separate from the originals",
        "Save your guide's and hotel's contact numbers before setting out each day",
        "Stick to well-lit, populated areas at night and use arranged transport rather than wandering unfamiliar streets alone — ordinary big-city sense rather than anything Egypt-specific",
      ]),
      callout(
        "Egypt has hosted international tourism for well over a century, through every kind of global headline. The tourist areas travelers actually visit are calm, well-patrolled, and set up specifically to host visitors — the risk that a headline suggests and the risk you'll actually encounter at Karnak or on a Nile cruise are two very different things.",
        { tone: "Safety", title: "Our Honest Take" }
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
        {
          question: "Do I need travel insurance for Egypt?",
          answer:
            "It's not legally required for most nationalities, but it's a sensible standard precaution for any international trip, covering medical care and trip disruptions.",
        },
        {
          question: "Is it safe to drink the tap water in Egypt?",
          answer: "No — stick to bottled or filtered water, which is inexpensive and available everywhere, including on every guided tour.",
        },
        {
          question: "Should I check travel advisories again close to my trip?",
          answer:
            "Yes, as routine practice for any international trip — checking again a week or two before departure takes a few minutes and is worth doing regardless of destination.",
        },
      ]),
      p(
        "The honest read is this: Egypt's tourist regions are safe, functioning, and set up to host millions of visitors a year, and the areas under genuine travel advisories are nowhere near a standard itinerary. Go in informed rather than anxious, travel with a licensed guide, and you'll likely spend more time thinking about the temples than about safety at all."
      ),
      {
        _type: "ctaBlock",
        _key: nextBlockKey("cta"),
        title: "Travel With a Trusted Local Team",
        body: "Every Egypt Eye itinerary runs with licensed guides, vetted drivers, and arranged transport from the moment you land.",
        buttonLabel: "See Our Tours",
        buttonHref: "/tours",
      },
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
        "Egypt can be genuinely affordable or genuinely luxurious, and the honest answer to \"how much will this cost\" depends entirely on which end of that range you're aiming for. Here's roughly how the numbers break down, and where the money actually goes."
      ),
      h2("Three Rough Tiers"),
      p(
        "Budget travel — hostels or basic hotels, local food, public transport — runs somewhere around $35 to $55 a day, not including international flights. Mid-range travel, with comfortable three- or four-star hotels, private transport for day tours, and a mix of local and touristy restaurants, lands closer to $80 to $150 a day. Luxury travel, with five-star hotels, private guides throughout, and premium Nile cruise cabins, starts around $300 a day and climbs from there."
      ),
      h2("Where the Big Costs Sit"),
      p(
        "Accommodation is the widest range of any category — a basic double room can run $10 to $40 a night, while five-star Nile-view or desert-lodge properties run $250 to $600 or more. A multi-night cruise between Luxor and Aswan follows a similar spread: standard cruise cabins on a 3- or 4-night sailing often run somewhere in the $150 to $250 range per person, while a luxury dahabiya sailing or a high-end cabin can run into the high hundreds or beyond, per night."
      ),
      h2("Flights: International and Domestic"),
      p(
        "International flights to Cairo vary enormously by origin and season, and are worth pricing separately well before your trip since they're often the single largest line item. Domestic flights between Cairo, Luxor, Aswan, and Hurghada are short and relatively affordable compared to the international leg, and save real time versus the equivalent overland journey — most multi-city itineraries mix a flight or two with a Nile cruise rather than driving the full length of the Nile Valley."
      ),
      h2("Meals and Daily Spending"),
      p(
        "Food is one of the more affordable parts of an Egypt trip regardless of which tier you're traveling in. Local restaurants and street-style food are inexpensive; hotel restaurants and tourist-area dining cost more, closer to what you'd pay at home. A reasonable daily food budget outside of what's already included in a tour package stays modest at local spots and rises quickly at resort and five-star hotel restaurants."
      ),
      h2("Tipping: The Cost People Forget to Budget For"),
      p(
        "Tipping, known locally as baksheesh, is a genuine part of the economy in Egypt's tourism sector and worth budgeting for separately rather than treating as an afterthought. Guides, drivers, felucca captains, hotel staff, and restroom attendants at tourist sites all expect small tips as a normal part of the transaction. It adds up over a multi-day trip, so it's worth setting aside a specific amount of small-denomination local currency for this rather than being caught short."
      ),
      h2("Entry Tickets and Extras"),
      p(
        "Site entry tickets for major monuments — the Giza Plateau, the Egyptian Museum, Karnak, the Valley of the Kings — are a real cost on top of accommodation and touring, and a few sites (the Great Pyramid's interior, certain tombs) charge extra for entry beyond the base ticket. Photography permits, a hot air balloon ride in Luxor, and optional add-ons like a felucca sunset sail or a dinner cruise are worth budgeting separately, since they're not always included in a base tour price."
      ),
      h2("Ways to Manage the Cost Without Cutting the Wrong Corners"),
      p(
        "Traveling in shoulder season (spring or autumn) rather than peak winter months, choosing a shorter but well-planned itinerary over an overly ambitious one, and booking a private guide rather than assuming a big group tour is automatically cheaper (it often isn't, once quality and time are factored in) are the moves that actually change the number without changing the experience for the worse."
      ),
      h2("Nile Cruise vs. Land-Only Itinerary"),
      p(
        "Whether a Nile cruise belongs in your budget or not changes the shape of your trip more than almost any other decision. A cruise bundles accommodation, most meals, and transport between Luxor, Kom Ombo, Edfu, and Aswan into a single nightly rate, which often works out efficient once you account for what you'd otherwise spend on hotels and private transfers covering the same ground. A land-only itinerary — staying in hotels and driving between sites — gives more flexibility to linger somewhere longer, at the cost of arranging more transitions yourself, or through your guide, along the way."
      ),
      h2("Group Size and Per-Person Cost"),
      p(
        "Private touring is priced per group more than per person in most cases, which means the per-person cost drops meaningfully as a group grows — a private guide and vehicle for two people costs roughly the same as for four, so a family or a group of friends traveling together often lands closer to mid-range pricing per person even while getting a fully private, guide-led trip. This is one of the more overlooked ways to get luxury-adjacent touring without a luxury-tier budget."
      ),
      h2("Currency and Payment Practicalities"),
      p(
        "Egypt's currency is the Egyptian pound, and while major hotels, cruise ships, and larger shops accept credit cards, cash is still the norm for tipping, small vendors, and local markets. ATMs are widely available in Cairo, Luxor, Aswan, and resort towns, and withdrawing local currency as you go tends to work out better than arriving with a large amount of pre-exchanged cash. It's worth keeping a mix of small and larger denominations on hand, since small bills matter most for the day-to-day tipping that adds up over a trip."
      ),
      callout(
        "These figures are general market context, not what we charge — every Egypt Eye itinerary is quoted individually once we know your dates, group size, and the level of comfort you want, so you always know the actual number before booking.",
        { tone: "Info", title: "A Note on Our Own Pricing" }
      ),
      h2("Souvenirs and Shopping"),
      p(
        "Papyrus art, spices, cotton textiles, and small alabaster or stone carvings are the most common souvenirs, and prices in markets are almost always negotiable — a starting price is rarely the real price. Budgeting a separate, modest amount for shopping keeps it from blending into your daily spending money, and buying from a guide's recommended, reputable shops tends to mean better quality and fairer starting prices than a blind market stall."
      ),
      h2("What's Usually Included vs. Extra"),
      p(
        "Most well-run tour packages include accommodation, guided touring, entry tickets to the sites on the itinerary, transport between stops, and many or most meals. What's typically extra: your international flight, travel insurance, tipping, alcoholic drinks, optional add-ons like a hot air balloon ride or a photoshoot experience, and any personal shopping. Reading a quote line by line for exactly what's covered avoids surprises once you're actually there."
      ),
      h2("A Sample Ten-Day Trip"),
      p(
        "A well-paced ten-day mid-range trip covering Cairo, Giza, and a Luxor-to-Aswan cruise typically lands somewhere between $2,500 and $4,000 per person, including domestic flights or trains, guided touring, and most meals — excluding the international flight to Egypt itself."
      ),
      faq([
        {
          question: "Is Egypt an expensive country to visit?",
          answer:
            "Not compared to most international destinations — a mid-range Egypt trip is generally more affordable than an equivalent trip to Western Europe, even accounting for Nile cruises and domestic flights.",
        },
        {
          question: "How much should I budget for tipping in Egypt?",
          answer:
            "It varies by trip length and group size, but setting aside a dedicated amount of small local currency notes specifically for tipping guides, drivers, and staff over a multi-day trip is worth planning for in advance rather than figuring out day by day.",
        },
        {
          question: "Are Nile cruises worth the cost?",
          answer:
            "For most travelers, yes — a Nile cruise between Luxor and Aswan covers a stretch of Egypt's most important sites (Kom Ombo, Edfu, Aswan's temples) efficiently, with accommodation, most meals, and transport between sites all bundled into one price.",
        },
        {
          question: "Does traveling in a larger group lower the cost per person?",
          answer:
            "Often, yes, for private touring specifically — a guide and vehicle are typically priced per group rather than per person, so the per-person cost drops as more people share the same private arrangement.",
        },
      ]),
      p(
        "The real answer to what an Egypt trip costs is whichever number matches the trip you actually want — and the useful next step isn't guessing at averages, it's getting a specific quote for specific dates, so you know the real number before you book anything."
      ),
      {
        _type: "ctaBlock",
        _key: nextBlockKey("cta"),
        title: "Get a Real Quote for Your Trip",
        body: "Tell us your dates, group size, and the level of comfort you're after, and we'll put together an itinerary with an actual price attached.",
        buttonLabel: "Request a Custom Quote",
        buttonHref: "/customize",
      },
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
    relatedTours: toursBySlug("6-day-cairo-giza-luxor", "8-day-essential-egypt-nile-cruise", "hurghada-red-sea-diving-snorkeling"),
    seoTitle: "What to Pack for Egypt: A Practical, Season-Aware Packing List",
    seoDescription:
      "A realistic Egypt packing list — clothing, sun protection, and the small essentials that make a difference on a walking-heavy, sun-heavy trip.",
    body: [
      p(
        "Egypt is hot, dusty, and full of open-air sites with very little shade, which should shape most of what goes in your suitcase more than anything else. Here's what actually earns a spot in the bag, and what you can safely leave behind."
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
      h2("Documents and Money"),
      p(
        "Keep both digital and printed copies of your passport photo page, your approved e-visa PDF, and any tour or hotel confirmations — a phone with a dead battery at an airport counter is a bad time to need one of these. Bring a mix of payment methods: a couple of major credit cards for hotels and larger purchases, plus enough cash for tipping, market stalls, and small vendors who don't take cards."
      ),
      h2("Electronics"),
      p(
        "Egypt runs on 220V with European-style two-pin round sockets, so a universal adapter is worth packing if you're not already carrying one. A portable power bank matters more here than on most trips — long days out at temple sites with a phone running GPS and a camera drain a battery fast, and outlets aren't always available where you're touring. A dust-resistant camera bag or case is worth it if you're bringing real camera gear into the desert or onto a felucca."
      ),
      h2("Health and Toiletries"),
      p(
        "Pack any prescription medication in its original packaging with enough supply for the full trip, plus basics like rehydration salts, anti-diarrheal medication, and mild pain relief — pharmacies are common in cities but not always convenient mid-tour. Hand sanitizer and a small pack of tissues are useful at sites where restroom supplies can be inconsistent. Sunscreen is worth buying before you arrive if you have a specific formula you rely on, since selection varies."
      ),
      h2("Packing Differently by Region"),
      p(
        "A Nile cruise calls for slightly dressier evening options — many cruise ships have a somewhat elevated dinner dress code, and a light dress or collared shirt covers it. A Red Sea or Sinai add-on (Hurghada, Sharm El Sheikh, Dahab) means swimwear, reef-safe sunscreen, and a rash guard if you're snorkeling or diving. A desert overnight in Siwa or the White Desert means warmer layers than the rest of the itinerary would suggest — desert nights get cold fast, even after a scorching day."
      ),
      h2("Packing by Season"),
      p(
        "Summer (June through August) means lightweight, loose, breathable everything, and packing less rather than more — temperatures inland regularly pass 40°C (104°F), and heavy fabric becomes a liability, not a comfort. Winter (November through February) is comfortable by day but genuinely cool at night and on the water, so a packable jacket or fleece earns its space. Spring and autumn sit in between and are the easiest seasons to pack for."
      ),
      callout(
        "Most hotels and Nile cruise ships offer same- or next-day laundry service, often at a low cost. It's a genuinely useful way to pack lighter for a longer trip rather than bringing two weeks of clothing for a two-week itinerary.",
        { tone: "Info", title: "Laundry Is Easier Than You Think" }
      ),
      h2("What Not to Bring"),
      p(
        "A few things first-timers pack out of habit end up as dead weight. A full separate outfit for every single day isn't necessary given how easy laundry service is — two or three versatile, mix-and-match pieces cover far more ground than a suitcase full of single-use outfits. Heavy jeans are uncomfortable in the daytime heat almost everywhere on a standard itinerary; save denim, if you bring it at all, for a cool desert evening. And formal wear beyond one nice outfit for a cruise dinner or a special evening is rarely needed outside of a five-star city hotel."
      ),
      h2("Carry-On Essentials"),
      p(
        "Pack your first day's essentials in your carry-on rather than checked luggage, in case a bag is delayed — a change of clothes, any medication, your e-visa printout, phone charger, and basic toiletries. Long-haul flights into Cairo often land at odd hours, and having what you need for a same-day tour start without waiting on checked baggage makes the first day far less stressful."
      ),
      h2("Packing for a Photoshoot Add-On"),
      p(
        "If your itinerary includes a professional photoshoot — a flying-dress session on the dunes, a sunrise shoot at the Pyramids — bring the actual outfit or dress you want photographed in, plus a backup, along with comfortable shoes for getting to the location itself even if you change once there. Wind is a real factor in open desert, so a dress with some structure photographs more predictably than something very sheer or lightweight in a strong breeze."
      ),
      h2("What You Can Easily Buy Once You're There"),
      p(
        "Egypt's markets and pharmacies cover more than travelers expect — sunscreen, hats, scarves, and basic toiletries are all easy to find in Cairo, Luxor, Aswan, and resort towns, so a forgotten item rarely derails a trip. This is worth remembering if you're trying to pack lighter for a long flight; a scarf bought in Khan el-Khalili doubles as both a practical item and a genuine souvenir."
      ),
      h2("Modesty at Religious Sites, Specifically"),
      p(
        "Mosques and churches on a typical itinerary — inside Islamic Cairo, Coptic Cairo, or a stop at a monastery in Sinai — generally ask for shoulders and knees covered, and some mosques ask visitors to remove shoes before entering carpeted prayer areas. A scarf that can quickly cover shoulders or hair, and shoes that slip on and off easily, make these stops smoother without needing a separate outfit."
      ),
      h2("A Sample Packing Checklist"),
      ...bullets([
        "5-7 lightweight, breathable outfits mixing tops, bottoms, and one dressier option for a cruise dinner",
        "A scarf or light shawl for temples, mosques, and sun coverage on open decks",
        "A warm layer — light jacket or fleece — for desert nights and winter mornings",
        "Broken-in walking shoes plus sandals for boat days and resort time",
        "Wide-brimmed hat, UV-protective sunglasses, and high-SPF sunscreen",
        "A reusable water bottle",
        "Universal power adapter and a portable charger",
        "Printed and digital copies of your passport, e-visa, and tour confirmations",
        "A small first-aid kit with basic medication and any prescriptions in original packaging",
        "Swimwear and reef-safe sunscreen if your trip includes the Red Sea or Sinai",
      ]),
      faq([
        {
          question: "Do I need to cover my head in Egypt?",
          answer:
            "No, head covering isn't required or expected of visitors, though a scarf is worth keeping handy for the few religious sites that ask for shoulders and hair covered at the entrance.",
        },
        {
          question: "Can I wear shorts in Egypt?",
          answer:
            "At resorts, on Nile cruise decks, and around hotel pools, yes. Elsewhere — markets, temples, cities — knee-length or longer is more comfortable both culturally and for sun protection.",
        },
        {
          question: "What shoes are best for Egypt?",
          answer:
            "Comfortable, broken-in closed-toe shoes for temple sites, which have uneven stone floors and a lot of walking, plus sandals for boat days and resort time.",
        },
        {
          question: "Should I bring my own snorkel gear to the Red Sea?",
          answer:
            "Not necessary — reputable dive and snorkel operators supply well-maintained gear, though bringing your own mask is reasonable if you have a strong fit preference.",
        },
      ]),
      p(
        "None of this is a complicated packing list — it's mostly about leaning into the heat rather than fighting it, keeping a warm layer within reach for the evenings, and packing documents like you'll actually need them at 6 a.m. before a balloon ride. Get that right and the rest of the trip takes care of itself."
      ),
      {
        _type: "ctaBlock",
        _key: nextBlockKey("cta"),
        title: "Ready to Plan the Itinerary Around It",
        body: "Once your suitcase is sorted, let's sort the trip — a private Egypt itinerary built around your dates and pace.",
        buttonLabel: "Browse Egypt Tours",
        buttonHref: "/tours",
      },
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
    relatedTours: toursBySlug("6-day-cairo-giza-luxor", "10-day-private-luxurious-trip", "8-day-essential-egypt-nile-cruise"),
    seoTitle: "Common Mistakes First-Time Egypt Travelers Make (and Fixes)",
    seoDescription:
      "The planning mistakes that trip up first-time Egypt visitors most often — rushed itineraries, midday touring, and underestimating the Nile Valley.",
    body: [
      p(
        "Egypt rewards planning more than most destinations, mainly because its major sites are spread across a genuinely large stretch of the country rather than clustered in one city. The mistakes that show up again and again on a first trip aren't exotic — they're planning decisions that seemed reasonable when booking from home and turn into real regrets once you're standing in front of Karnak at noon in July, or trying to squeeze the Egyptian Museum into forty-five minutes before a flight."
      ),
      p(
        "None of what follows requires you to become an Egypt expert before you land. It just means understanding a handful of things that aren't obvious until you've already made the mistake once."
      ),
      h2("Treating Luxor as a Day Trip"),
      p(
        "Luxor holds more concentrated ancient history than most countries manage in their entire national collection — Karnak Temple, Luxor Temple, the Valley of the Kings, the Valley of the Queens, Hatshepsut's mortuary temple, the Colossi of Memnon, and more, split across two very different banks of the Nile. Trying to see it in a single rushed day trip from Cairo, which some tour operators still sell, means you'll get a handful of photos and almost none of the actual experience. Two to three full days is the realistic minimum to cover the East Bank and West Bank properly, with time left over to actually stand inside a tomb rather than being herded through it."
      ),
      p(
        "The version of this mistake that stings the most is flying into Luxor for one day as part of a longer Cairo-based trip, because by the time you've factored in the flight and the drive time to and from the airport, you're often left with three or four usable hours on the ground — not nearly enough for a place this dense with things worth seeing."
      ),
      h2("Touring Through the Hottest Hours"),
      p(
        "Most major sites open at or before 8 a.m. specifically so visitors can get through the big stops before the midday heat sets in, yet a surprising number of first-time itineraries start at a leisurely 9:30 or 10 and end up touring the Valley of the Kings or the Giza plateau at the worst possible hour. This isn't just a comfort issue — walking through an unshaded temple courtyard at 1 p.m. in June is a genuinely different experience from doing the same walk at 7 a.m., and it affects how much you actually take in. An early start, especially outside the cooler winter months, changes the whole day for the better."
      ),
      h2("Underestimating How Big Egypt Actually Is"),
      p(
        "Cairo to Luxor is roughly the distance of a long domestic flight, not a short drive, and Luxor to Aswan adds another few hours on top of that. Egypt is a big country, and its headline sites — the Pyramids, Luxor's temples, Abu Simbel, the Red Sea coast — sit hours apart by road or a short flight apart by air. First-time visitors sometimes build a wish-list itinerary that tries to touch every region in a week, which usually means spending more time in transit than at the sites themselves. Building an itinerary around realistic travel times, and accepting that you probably can't do the Pyramids, Luxor, Aswan, and the Red Sea justice in under a week and a half, makes for a far better trip than cramming."
      ),
      h2("Booking the Cheapest Operator Without Checking Credentials"),
      p(
        "Price alone doesn't tell you much about a tour operator in Egypt, where the range between a bare-bones group bus tour and a private, licensed guide can be significant even for what looks like the same itinerary on paper. A licensed Egyptology guide, a roadworthy vehicle, and genuinely transparent inclusions (entry fees, meals, whether a guide is even provided at each site) matter more than shaving a modest amount off the sticker price — especially on longer, multi-day itineraries, where a mediocre guide affects every single day rather than just one afternoon."
      ),
      h2("Overpacking the Itinerary"),
      p(
        "There's a specific kind of first-timer mistake where the itinerary reads well on paper — Cairo, Alexandria, Luxor, Aswan, Abu Simbel, Hurghada, all in eight days — but leaves almost no slack for anything to run long, for a temple to be more interesting than expected, or for you to just be tired. Egypt's best moments are often the unhurried ones: an extra half hour at Karnak after the group has moved on, a slow felucca sail at sunset instead of rushing to the next stop. Building in at least one lighter day, particularly around the Nile Valley, tends to matter more than adding one more destination to the list."
      ),
      h2("Getting Dress Codes and Site Etiquette Wrong"),
      p(
        "Egypt is more relaxed about dress than many first-time visitors expect, particularly in tourist areas and at ancient sites, but mosques and churches are a different matter — modest coverage of shoulders and knees is expected, and mosques generally require women to cover their hair. Photography rules also vary more than people assume: some tombs in the Valley of the Kings charge a separate fee for photography or restrict it entirely, and flash photography can damage painted reliefs that have survived thousands of years. A quick check with your guide before raising a camera avoids an awkward moment."
      ),
      h2("Not Planning for Cash and Small Bills"),
      p(
        "Cards are accepted at hotels and larger restaurants, but plenty of everyday moments in Egypt — a bathroom attendant, a small tip for someone who helps with your bags, a purchase in a local market — run on small-denomination cash, and having only large bills or no local currency at all is a recurring first-trip headache. It's worth arriving with a mix of small notes and treating tipping as a normal, expected part of daily interactions rather than an optional extra, the same way it functions in much of the region."
      ),
      h2("Overlooking the Small Practical Basics"),
      p(
        "None of these are dramatic on their own, but skipping all of them at once is how a good trip turns into an uncomfortable one by day three."
      ),
      ...bullets([
        "Bottled or filtered water rather than tap water, kept on hand throughout the day",
        "Sunscreen and a hat, even for winter visits — the desert sun is stronger than it looks",
        "Comfortable, closed-toe walking shoes for uneven temple floors and sandy sites",
        "A light scarf or shawl, useful both for mosque visits and for sun coverage on the water",
        "Basic travel insurance that covers medical care, not just cancellations",
        "A photocopy or photo of your passport and visa, kept separate from the originals",
      ]),
      callout(
        "The single highest-leverage fix for most of these mistakes is booking private rather than a rigid fixed-group schedule. A private itinerary gives you room to start early, linger somewhere that turns out to be more interesting than expected, or swap a day around without twenty other travelers' preferences in the way — and it removes most of the guesswork about guide quality, since you can vet exactly who's leading your trip before you commit.",
        { title: "The One Fix That Solves Most of These", tone: "Highlight" }
      ),
      faq([
        {
          question: "What's the best time of year to visit Egypt for a first trip?",
          answer:
            "October through April is the most comfortable window, with cooler daytime temperatures across the Nile Valley. Summer is hotter but far less crowded, and sites are still fully open — it just rewards an earlier start.",
        },
        {
          question: "How many days do first-time visitors actually need?",
          answer:
            "Ten to twelve days lets you cover Cairo and Giza, Luxor, and Aswan without rushing. A week is workable if you're willing to cut one region, but trying to do all three plus the Red Sea in under a week usually means regretting the pace.",
        },
        {
          question: "Is it a mistake to skip a guide and explore independently?",
          answer:
            "Not necessarily for a city like Cairo, but at the ancient sites specifically, a knowledgeable guide is what turns a field of stone columns into something you actually understand — the history isn't posted on plaques the way it might be at a Western museum.",
        },
        {
          question: "Do I need to plan around Friday prayers or religious holidays?",
          answer:
            "It's worth checking your dates against Ramadan and major holidays, since hours and crowd patterns shift, but sites remain open and a good local operator will already be planning around it.",
        },
        {
          question: "Should I exchange money before arriving or after I land?",
          answer:
            "Either works, but you'll generally get a fair rate exchanging at the airport or a bank once you land, and it saves the hassle of tracking down Egyptian pounds at home in advance.",
        },
      ]),
      p(
        "Get the planning right and Egypt stops feeling like a country you're racing against the clock in, and starts feeling like what it actually is — one of the most rewarding places on earth to spend a slow, well-paced week or two."
      ),
      {
        _type: "ctaBlock",
        _key: nextBlockKey("cta"),
        title: "Skip the Guesswork, Plan It Right the First Time",
        body: "Tell us your dates and priorities, and we'll build a private itinerary paced the way Egypt actually deserves to be seen.",
        buttonLabel: "Start Planning",
        buttonHref: "/customize",
      },
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
    relatedTours: toursBySlug("memphis-saqqara-dahshur-tour", "3-day-cairo-giza", "1-day-giza-tour"),
    seoTitle: "Memphis, Saqqara & Dahshur: Egypt's First Pyramids Guide",
    seoDescription:
      "Before Giza, Egypt built its first pyramids at Saqqara and Dahshur. What's there, why it matters, and how to plan a day beyond the Giza plateau.",
    body: [
      p(
        "Giza gets the crowds, but the pyramids there weren't Egypt's first, and once you've stood in front of the Step Pyramid at Saqqara, that fact is hard to unsee. This is the building that made Giza possible — the place where Egyptians worked out, for the first time anywhere, how to build permanently in cut stone rather than mudbrick. A day trip south of Cairo covers three connected sites: Saqqara, Egypt's oldest and largest necropolis; Dahshur, where a single pharaoh's building program shows the exact moment pyramid design went from experimental to perfected; and Memphis, the capital that once stood at the center of all of it. It's one of the richest archaeological days available near Cairo, and because most visitors never get past Giza, it's also one of the quietest."
      ),
      h2("Saqqara and the Step Pyramid of Djoser"),
      p(
        "The Step Pyramid of Djoser, built around 2670 BCE for Egypt's Third Dynasty, predates Giza's Great Pyramid by roughly a century and represents the first time Egyptians built primarily in stone rather than mudbrick at this scale. Its six stacked, shrinking tiers were designed by Imhotep — chancellor to Djoser, and the first architect in history whose name we actually know — and they mark the real starting point of pyramid-building as a tradition. Everything that followed at Dahshur and Giza is a refinement of what Imhotep worked out here first."
      ),
      p(
        "The pyramid itself sits inside a much larger funerary complex, enclosed by a limestone wall nearly a mile and a half around, with courtyards, dummy buildings, and a colonnaded entrance designed to translate the light wood-and-reed architecture of Djoser's palace into permanent stone. Some of the engaged columns still carry the ribbed profile of bundled reeds carved directly into the rock — an architect working out, in real time, how a new material should imitate an old one. The Heb-Sed court, built for a royal jubilee ritual the king may never have lived to perform, is one of the more overlooked corners of the site and usually empty even when the main pyramid has a crowd around it."
      ),
      h2("Dahshur's Two Experiments"),
      p(
        "A short drive south of Saqqara, Dahshur holds the Bent Pyramid and the Red Pyramid, both built under Sneferu, the founder of the Fourth Dynasty and father of Khufu, who would go on to build Giza's Great Pyramid. Sneferu is thought to have built at least three pyramids in his reign, and Dahshur preserves the two that show his engineers changing their minds mid-project. The Bent Pyramid starts at a steep angle, then shifts abruptly to a shallower one partway up — a visible, almost embarrassing record of ancient builders realizing their original angle was structurally unsound and correcting course before the whole thing failed."
      ),
      p(
        "The Red Pyramid, built afterward with the lessons of the Bent Pyramid already learned, holds steady at that same shallower angle from base to summit and is considered the first successful true smooth-sided pyramid in Egyptian history — the direct template for the Great Pyramid a generation later. Unlike Giza, its interior chambers are open to visitors, reached by a long, low descending passage that opens into a soaring corbelled ceiling, one slab stepped in above the next. Standing inside it, empty of decoration but enormous in scale, gives a better sense of pyramid engineering than anything visible from outside at Giza."
      ),
      ...bullets([
        "Saqqara — the Step Pyramid of Djoser, its funerary enclosure, and a scattering of painted noble tombs; figure on two to three hours to see it properly.",
        "Dahshur — the Bent Pyramid (viewed from outside) and the Red Pyramid (open to enter); a lighter, quieter stop of an hour or so.",
        "Memphis — a compact open-air museum, not a walkable ancient city; twenty to thirty minutes is usually enough.",
      ]),
      h2("Memphis: The Capital That Time Erased"),
      p(
        "Memphis was founded around 3100 BCE near the point where Upper and Lower Egypt meet, and it served as ancient Egypt's capital for much of the Old Kingdom, when Saqqara and Dahshur were being built as its royal necropolis just across the river. For a city that mattered that much for that long, remarkably little survives above ground — centuries of Nile flooding buried it under silt, and later generations quarried its stone to build medieval Cairo, so what's left today is a small open-air museum rather than a walkable ancient city."
      ),
      p(
        "What is there is genuinely worth the short stop: a colossal fallen limestone statue of Ramesses II, so large it's displayed lying down under its own shelter, and a beautifully preserved alabaster sphinx from the New Kingdom that once guarded the entrance to Memphis's Temple of Ptah. Neither piece needs much imagination to be impressive — they're a reminder of the city's scale even reduced to fragments in a garden."
      ),
      h2("Saqqara Beyond the Step Pyramid"),
      p(
        "Djoser's pyramid is the reason most people come to Saqqara, but the site is Egypt's largest necropolis, used for burials across nearly its entire ancient history, and it holds plenty beyond that one monument. The mastaba tombs of Old Kingdom nobles, particularly the tombs of Mereruka and Ti, contain some of the best-preserved painted reliefs anywhere near Cairo — scenes of daily life, farming, boat-building, and offerings rendered in detail that rarely survives this well. The nearby Pyramid of Unas, smaller and less visually dramatic than Djoser's, is worth entering for a different reason: its interior walls carry the Pyramid Texts, the oldest known religious writings in the world, carved directly into the burial chamber."
      ),
      callout(
        "This whole area draws a fraction of Giza's visitors, which means more room to actually look at what you're seeing. Go early, wear shoes you don't mind getting dusty for the low tomb entrances, and budget real time at Saqqara rather than treating it as a quick add-on before Dahshur.",
        { title: "Why It's Worth the Extra Day", tone: "Info" }
      ),
      h2("Planning Your Day"),
      p(
        "Saqqara sits roughly half an hour south of central Cairo, with Dahshur another short drive beyond it and Memphis close by on the return route — the three combine naturally into one loop rather than three separate trips. Most private itineraries visit in the order Saqqara, then Dahshur, then Memphis on the way back, since Saqqara rewards the most time and benefits from cooler, earlier light. Sturdy, closed shoes matter more here than at most Egyptian sites: several of the tombs and the Red Pyramid's interior involve stooped, uneven passages that sandals don't handle well."
      ),
      p(
        "It's possible to pair this with a Giza morning in a very long single day, but the two areas deserve to be seen with a clear head rather than back to back — most travelers get more out of treating Memphis, Saqqara, and Dahshur as its own dedicated day within a longer Cairo stay, ideally with a private Egyptologist who can walk you through the difference between what Djoser's builders were attempting and what Sneferu's engineers eventually solved."
      ),
      faq(
        [
          {
            question: "Is Saqqara open to the public?",
            answer:
              "Yes. The Step Pyramid enclosure, several of the painted noble tombs, and the Pyramid of Unas are all open to visitors, though which specific tombs are accessible can shift periodically for conservation work.",
          },
          {
            question: "How does Saqqara compare to Giza?",
            answer:
              "Saqqara is older, less visually famous, and far less crowded. Giza has the scale and the iconic skyline view; Saqqara has the origin story and some of the best-preserved painted tombs near Cairo.",
          },
          {
            question: "Can you go inside the pyramids at Dahshur?",
            answer:
              "The Red Pyramid's interior chambers are open to enter, via a long descending passage. The Bent Pyramid is generally viewed from outside only.",
          },
          {
            question: "Do you need a guide for Memphis, Saqqara, and Dahshur?",
            answer:
              "You don't need one to get in, but the sites reward context more than most — a private Egyptologist can explain what's actually being demonstrated at each stop, from Imhotep's stone-carved reed columns to Sneferu's mid-build angle correction.",
          },
          {
            question: "Is this trip worth it if I've already seen Giza?",
            answer:
              "Especially so. Giza shows you the finished result; this route shows you how Egyptians got there, through one false start after another, which changes how the Great Pyramid itself reads once you've seen it.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "None of these three sites try to compete with Giza on scale, and none of them need to. What they offer instead is the working-out — the false start at Dahshur, the reed columns translated into stone at Saqqara, the fragments of a capital that once ran the whole country — and a quiet, uncrowded morning to actually take it in."
      ),
      {
        _type: "ctaBlock",
        _key: nextBlockKey("cta"),
        title: "See Where Egypt's Pyramids Began",
        body: "Our Memphis, Saqqara & Dahshur day tour pairs Egypt's original pyramid fields with a private Egyptologist guide, away from the Giza crowds.",
        buttonLabel: "View the Tour",
        buttonHref: "/tours/memphis-saqqara-dahshur-tour",
      },
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
    relatedTours: toursBySlug("islamic-coptic-cairo-walking-tour", "khan-el-khalili-food-walking-tour", "egyptian-museum-coptic-cairo-tour", "3-day-cairo-giza"),
    seoTitle: "Islamic & Coptic Cairo Walking Guide: Old Cairo on Foot",
    seoDescription:
      "A practical walking guide to Islamic Cairo and Coptic Cairo — what to see, how to route the day, and why these quarters reward slow, on-foot exploring.",
    body: [
      p(
        "Most first-time visitors spend their entire Cairo trip at Giza and the Egyptian Museum, which is understandable and also means skipping a part of the city that tells a completely different story. Medieval Islamic Cairo and, a short distance south, Coptic Cairo's cluster of ancient churches are two of the most walkable, layered districts in the country — neither one is a single monument you tick off, but a neighborhood you move through, and that's exactly why they reward a slower pace than most tour itineraries give them."
      ),
      h2("Islamic Cairo: A Thousand Years of Working Architecture"),
      p(
        "Centered around the Citadel of Saladin and the sprawling market of Khan el-Khalili, Islamic Cairo holds one of the largest collections of medieval Islamic architecture anywhere in the world — mosques, madrasas, mausoleums, and merchant houses built across nearly a thousand years, many of them still in active daily use rather than roped off as museum pieces. That's part of what makes the district different from a typical archaeological site: you're walking through a living neighborhood where the call to prayer still rings out from minarets built centuries apart, and where shopkeepers work in buildings their families have occupied for generations."
      ),
      p(
        "The Citadel itself, perched above the city with the Mohamed Ali Mosque's Ottoman-style domes and slim minarets dominating the skyline, is the natural anchor point for a walk through the area — and its terraces give one of the better panoramic views over old Cairo, haze permitting. From there, Sultan Hassan Mosque and the Al-Rifa'i Mosque sit almost facing each other at the base of the Citadel, a striking pairing of Mamluk and early-twentieth-century Islamic architecture built five centuries apart. Further into the district, the Al-Muizz Street corridor strings together some of Cairo's finest surviving monuments in a single walkable stretch, with covered market alleys, historic sabils (public water fountains), and centuries-old mosques standing shoulder to shoulder with working shops."
      ),
      h2("Khan el-Khalili: More Than a Souvenir Market"),
      p(
        "Khan el-Khalili sits at the heart of Islamic Cairo and has functioned as a working market since the fourteenth century, which shows in how it's laid out — narrow, covered alleys organized loosely by trade, opening onto small courtyards and coffeehouses that have hosted merchants and travelers for generations. It's easy to treat it purely as a place to buy souvenirs, and plenty of stalls cater exactly to that, but wandering a few streets back from the main tourist lanes turns up spice merchants, goldsmiths, and copper workers doing the same trade their families have done for decades. El Fishawy, one of Cairo's oldest coffeehouses, sits right in the middle of it and is worth a stop simply to sit, drink tea, and watch the market move around you."
      ),
      h2("Where the District Actually Comes From"),
      p(
        "Islamic Cairo traces back to the founding of al-Qahira in 969 CE by the Fatimid dynasty, and the street grid around Al-Muizz still roughly follows that original medieval city plan — one reason the district feels less like a preserved museum piece and more like a place that simply kept building on top of itself for a thousand years. Later dynasties, Ayyubid, Mamluk, and Ottoman, each added their own mosques, gates, and market halls without demolishing what came before, which is why a single short walk down Al-Muizz Street can pass architecture from four or five different centuries within a few hundred meters."
      ),
      h2("Coptic Cairo: The Oldest Churches in the Country"),
      p(
        "A few kilometers south, Coptic Cairo is a walled, largely pedestrian quarter built over the remains of a Roman fortress, holding some of the oldest churches in Christianity anywhere in the world. The Hanging Church, suspended over the fortress's ancient gatehouse and reached by a short flight of steps, is the most visited of them, with a wooden roof shaped like Noah's Ark and a collection of icons that stretch back centuries. The Church of Saints Sergius and Bacchus, built over a site associated with the Holy Family's traditional stay in Egypt during their flight from Herod, sits nearby and carries its own quieter, older atmosphere below street level."
      ),
      p(
        "The same small area holds the Ben Ezra Synagogue, one of Cairo's oldest and most significant, along with the Coptic Museum, which houses one of the best collections of Coptic art and textiles anywhere — a useful stop for context on a Christian tradition in Egypt that predates Islam by several centuries and has continued, uninterrupted, ever since. The narrow lanes between the churches are genuinely atmospheric, cobbled and quiet in a way that contrasts sharply with Khan el-Khalili's crowds a few kilometers north."
      ),
      ...bullets([
        "Islamic Cairo — the Citadel and Mohamed Ali Mosque, Sultan Hassan and Al-Rifa'i Mosques, the Al-Muizz Street corridor, and Khan el-Khalili market.",
        "Coptic Cairo — the Hanging Church, the Church of Saints Sergius and Bacchus, the Ben Ezra Synagogue, and the Coptic Museum.",
        "Both districts are best explored on foot; neither is designed around vehicle access to individual sites.",
        "Modest dress (covered shoulders and knees) is expected at both the mosques and the churches.",
      ]),
      h2("Walking Both in One Day"),
      p(
        "The two districts are close enough by car to combine into a single, full day, and most private itineraries do exactly that — Islamic Cairo in the morning, when the light through Khan el-Khalili's covered alleys is at its best and the Citadel is less crowded, and Coptic Cairo in the afternoon, when its narrow lanes are quieter and cooler. Doing it the other way around works too, but starting with the Citadel's views while the air is still relatively clear is worth the early alarm."
      ),
      p(
        "A knowledgeable local guide makes a real difference in both districts, since much of what makes them interesting isn't obvious from the architecture alone — a plain wooden door in Coptic Cairo might lead to a fourth-century foundation, and a side alley off Khan el-Khalili might hold a five-hundred-year-old sabil with no signage explaining what it is. Without that context, it's easy to walk past the most interesting layer of the city without realizing it's there."
      ),
      callout(
        "Wear real walking shoes — both districts involve cobblestones, uneven steps, and long stretches without seating — and carry small cash for tips, tea, and the inevitable moment you want to sit down at a coffeehouse and just watch the street for a while.",
        { title: "Good to Know", tone: "Info" }
      ),
      h2("Getting the Most Out of Old Cairo"),
      p(
        "The temptation with both districts is to treat them as a checklist of famous buildings, moving quickly from one landmark to the next. They reward the opposite approach. Some of the best moments in Islamic Cairo happen in the side streets off Al-Muizz, where daily commerce is still happening exactly as it has for centuries, and some of the best moments in Coptic Cairo happen simply sitting in the quiet courtyard between the churches, away from the small crush of visitors at the Hanging Church's entrance."
      ),
      faq(
        [
          {
            question: "How much time do you need for Islamic and Coptic Cairo?",
            answer:
              "A full day covers both comfortably — roughly half a day each, including time to wander Khan el-Khalili and sit with tea rather than just walking past everything.",
          },
          {
            question: "Is Islamic Cairo safe to walk around?",
            answer:
              "Yes, it's one of the more heavily visited and well-trafficked parts of the city, with a visible security presence around the major monuments and markets.",
          },
          {
            question: "Do you need to dress modestly for Coptic Cairo?",
            answer:
              "Covered shoulders and knees are appropriate at the churches, similar to expectations at the mosques in Islamic Cairo — light, loose layers work well for both.",
          },
          {
            question: "Can I combine this with the Egyptian Museum?",
            answer:
              "It's possible but makes for a very full day. Most travelers get more out of treating Old Cairo as its own dedicated day, with the museum and Giza on separate days.",
          },
          {
            question: "Is Khan el-Khalili worth visiting if I don't want to shop?",
            answer:
              "Yes — the historic sabils, coffeehouses, and market architecture are worth seeing on their own, and a local guide can steer you toward the working alleys away from the main souvenir strip.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "Cairo's pyramids get the postcards, but Islamic and Coptic Cairo are where the city itself lives — layered, working, still in daily use after a thousand years. Give them a proper day on foot and old Cairo stops being a detour from the main trip and starts being one of its best parts."
      ),
      {
        _type: "ctaBlock",
        _key: nextBlockKey("cta"),
        title: "Walk Old Cairo With a Local Guide",
        body: "Our Islamic Cairo & Coptic Cairo Walking Tour covers both quarters in one well-paced day, with a guide who knows the streets behind the landmarks.",
        buttonLabel: "View the Tour",
        buttonHref: "/tours/islamic-coptic-cairo-walking-tour",
      },
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
    relatedTours: toursBySlug("cairo-nile-dinner-cruise-night-tour", "cairo-by-night-tour", "cairo-felucca-sunset-sail"),
    seoTitle: "Cairo Nile Dinner Cruise: What to Actually Expect",
    seoDescription:
      "What a Cairo Nile dinner cruise evening actually involves — the route, the food, the entertainment, dress code, and whether it's worth booking.",
    body: [
      p(
        "After a full day of touring temples and museums in the heat, a Cairo Nile dinner cruise is a genuinely different kind of evening — a boat, dinner, and the city's skyline lit up along the water, at a pace that asks nothing of you. It's one of the more popular ways for visitors to spend a Cairo evening, and it's worth knowing exactly what you're signing up for before you book one, since cruises vary quite a bit in format and quality."
      ),
      h2("What the Evening Actually Involves"),
      p(
        "A typical dinner cruise runs two to three hours, departing in the early evening and covering a stretch of the Nile through central Cairo, passing under its bridges and past riverside landmarks lit up after dark — the Cairo Tower, the grand hotels lining the Corniche, and the general glow of a city of more than twenty million people reflected on the water. Boats range from large multi-deck vessels built specifically for tourism, with a stage and dance floor, to smaller, quieter boats aimed at a more relaxed dinner experience. Both formats exist for a reason, and which one suits you depends on whether you want an evening of entertainment or a calmer dinner with a view."
      ),
      p(
        "Dinner is usually a multi-course buffet with a mix of Egyptian and international dishes — grilled meats, rice, mezze, fresh bread, and a spread of desserts — served at a table with a river view rather than plated and brought out course by course. Most cruises include some form of live entertainment as part of the evening, most commonly a Tanoura dance performance, a distinctly Egyptian spinning folk dance rooted in Sufi tradition, and often a belly dance performance as well, both usually accompanied by a live band playing traditional Egyptian music."
      ),
      h2("Choosing the Right Cruise for You"),
      p(
        "Not every dinner cruise is built for the same kind of evening. Large entertainment-focused boats are lively, loud, and fun if you want music, dancing, and a bit of spectacle with your dinner — good for groups, celebrations, or travelers who want Cairo's more festive side. Smaller or private boats trade the show for quiet and a proper river view, better suited to couples or anyone who's had enough noise and crowds for one day. If quiet is what you're after, it's worth asking directly about boat size and whether the cruise includes a full stage show or a lighter, more relaxed format before booking."
      ),
      ...bullets([
        "Duration: typically two to three hours, departing in the early evening.",
        "Format: buffet dinner with a river view, usually including Tanoura and/or belly dance performances.",
        "Dress: smart casual is standard — nothing overly formal is required, but very casual beachwear looks out of place.",
        "Best for: an easy, low-effort evening after a full day of sightseeing, especially your first or last night in Cairo.",
      ]),
      h2("What You Actually See From the Water"),
      p(
        "Cairo looks different from the Nile than it does from the street, and that's a lot of the appeal. The Corniche's grand old hotels, several dating back to the early twentieth century, sit right at the water's edge and are lit up in a way that's easy to miss when you're walking past them during the day. Depending on the route, you'll pass beneath a handful of the bridges that connect Cairo's east bank to Zamalek and Giza, and get a clear, unobstructed view of the Cairo Tower rising above the skyline on Gezira Island — one of the better vantage points for it anywhere in the city, precisely because you're not craning your neck up from underneath it."
      ),
      p(
        "The river itself is busier after dark than you might expect. Smaller feluccas and private boats cross the cruise's path throughout the evening, their sails or lights catching the water, and it's a reminder that the Nile through central Cairo is still a working, moving part of the city rather than a static backdrop. If you've spent the day at Giza or the Egyptian Museum surrounded by history that's thousands of years old, an evening watching the modern city move along the same river it's always moved along is a good, grounding contrast."
      ),
      h2("Is It Worth Adding to Your Itinerary?"),
      p(
        "It's a low-effort, high-comfort way to close out a Cairo day, particularly for travelers who've spent the daylight hours walking through Giza or Islamic Cairo and want an evening that doesn't ask for more walking or decision-making. The view of the illuminated city from the water is genuinely different from anything you see on land, and after a day of ancient sites, an evening built around dinner, music, and the river is a welcome change of register."
      ),
      p(
        "It's not a substitute for the multi-day Nile cruises further south between Luxor and Aswan, which are a completely different kind of experience — days spent sailing between temple sites, not a single evening on the water. Think of the Cairo dinner cruise as an evening activity in the capital, not a journey along the river; if you want the slower, multi-day version of Nile travel, that happens in Upper Egypt, not Cairo."
      ),
      callout(
        "Book a cruise that departs closer to sunset rather than well after dark if you can — you get roughly twenty minutes of golden light over the river before the city's skyline takes over, and it makes for noticeably better photos than a fully dark departure.",
        { title: "Good to Know", tone: "Info" }
      ),
      h2("Practical Notes for the Evening"),
      p(
        "Boarding is usually at a designated dock along the Corniche, with security screening similar to what you'd expect at any major Cairo venue — arrive with some buffer before departure rather than right at boarding time. Photography is generally welcome throughout, though the boat's motion and evening light make a phone camera or a lens with reasonable low-light performance more useful than a tripod setup, which most boats don't have room for anyway."
      ),
      p(
        "Timing it with the rest of a Cairo day matters more than people expect. Booking the cruise for your first evening in Cairo, right after landing, is usually a mistake — jet lag and a full buffet plus live music don't mix well. It works best either on a middle evening of your stay, once you've settled in, or as a closing-night send-off after you've already covered Giza, the museum, and Islamic Cairo, when a low-effort evening with a view is exactly what the day calls for."
      ),
      faq(
        [
          {
            question: "How long does a Cairo Nile dinner cruise last?",
            answer:
              "Most run two to three hours, including boarding, dinner service, and the entertainment portion of the evening.",
          },
          {
            question: "What should I wear on a Nile dinner cruise?",
            answer:
              "Smart casual works well — nothing formal is required, but very casual beach clothing looks out of place given the dinner setting.",
          },
          {
            question: "Is a Cairo dinner cruise the same as a Luxor-Aswan Nile cruise?",
            answer:
              "No. This is a single evening on the river in the capital. The Luxor-to-Aswan cruises are multi-day journeys further south, sailing between ancient temple sites over several days.",
          },
          {
            question: "Is the food good on a Nile dinner cruise?",
            answer:
              "It's a buffet aimed at a broad range of tastes, mixing Egyptian dishes with international options — solid and satisfying rather than fine dining, which fits the relaxed nature of the evening.",
          },
          {
            question: "Is a dinner cruise a good option for families with children?",
            answer:
              "Generally yes — the format is relaxed, seated, and indoors or under cover, and children often enjoy the live music and dancing more than a formal restaurant setting would offer.",
          },
          {
            question: "Should I book a large entertainment boat or a smaller, quieter one?",
            answer:
              "Depends on the evening you want. Larger boats bring more music, dancing, and energy, good for groups and celebrations. Smaller or private boats trade the show for a calmer dinner and a clearer view of the river, better for couples or anyone who wants quiet after a long day of touring.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "A Nile dinner cruise isn't meant to be the centerpiece of an Egypt trip, and it doesn't need to be. It's a genuinely pleasant, low-stress way to end a long day in Cairo — dinner, live music, and a city lit up along the water, with nothing left to plan or decide once you're on board and the boat pulls away from the dock."
      ),
      {
        _type: "ctaBlock",
        _key: nextBlockKey("cta"),
        title: "Book Your Cairo Evening on the Nile",
        body: "Our Cairo by Night: Nile Dinner Cruise pairs dinner and live entertainment on the river with the city's illuminated skyline.",
        buttonLabel: "View the Tour",
        buttonHref: "/tours/cairo-nile-dinner-cruise-night-tour",
      },
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
    relatedTours: toursBySlug("aswan-abu-simbel-tour", "aswan-nubian-village-philae-tour", "kalabsha-temple-nubian-museum-tour", "8-day-essential-egypt-nile-cruise"),
    seoTitle: "Aswan Travel Guide: Nubian Egypt's Southern Nile City",
    seoDescription:
      "A practical Aswan travel guide — Philae Temple, the Unfinished Obelisk, Nubian villages, the High Dam, and how many days the city actually deserves.",
    body: [
      p(
        "Aswan sits at Egypt's southern edge, where the Nile narrows between granite outcrops and Nubian villages line the riverbanks in shades of blue and ochre. It has a different rhythm from Cairo or even Luxor — slower, warmer in feel, and shaped as much by Nubian culture as by ancient Egyptian history. For a lot of travelers who make it this far south, Aswan ends up being the trip's quiet favorite, the place they wish they'd given one more day."
      ),
      h2("Philae Temple"),
      p(
        "Dedicated to the goddess Isis, Philae was one of the last places in Egypt where the ancient religion was actively practiced, staying in continuous use well into the Christian era before finally being closed in the sixth century CE. The temple you see today isn't standing on its original island — between 1972 and 1980, an international UNESCO-led project dismantled Philae into more than 40,000 numbered blocks and reassembled it on the nearby island of Agilkia, at a higher elevation, to save it from the rising waters behind the Aswan High Dam. It's an engineering effort nearly as remarkable as the temple itself."
      ),
      p(
        "Reached by a short boat ride across open water, Philae is one of the most photogenic temples on the Nile, particularly in late-afternoon light when it catches the reliefs at an angle rather than flattening them from overhead. The Kiosk of Trajan, with its distinctive open columns, is the image most visitors already recognize, but it's really just the entrance to a much larger complex of courtyards, a birth house, and the main sanctuary of Isis behind it."
      ),
      h2("The Unfinished Obelisk"),
      p(
        "Still attached to the bedrock it was carved from, this abandoned obelisk — cracked during construction thousands of years ago and left exactly where the ancient workers walked away from it — is one of the clearest windows anywhere into how ancient Egyptians actually quarried stone, tool marks and all. Had it been completed, it would have been the largest single piece of stone ever raised by the ancient Egyptians, taller than any obelisk that made it out of the quarry intact. Aswan's granite quarries, in fact, supplied stone for obelisks and statues that ended up as far away as Luxor and Cairo, which is part of why the city held such a central place in ancient Egyptian building projects."
      ),
      h2("The Aswan High Dam"),
      p(
        "Completed in 1970, the High Dam controls the Nile's seasonal flooding and generates a substantial share of Egypt's electricity, but its other major effect was creating Lake Nasser, one of the largest reservoirs built by human beings, stretching south from Aswan deep into Sudan. Visitors can walk out onto the dam itself and take in the sheer scale of it — a wall of rock and concrete holding back an entire inland sea — though the technical interior isn't open to tourists. Most Aswan itineraries pair the dam with Philae in the same morning, since the two sites are directly connected: the dam is the reason the temple needed saving in the first place.",
      ),
      h2("A Nubian Village by Boat"),
      p(
        "A felucca or motorboat trip to a Nubian village on Elephantine Island or the west bank is one of Aswan's most distinctive experiences — colorful houses painted in blues and ochres, a different language and cuisine from the rest of Egypt, and a slower pace that contrasts with the temple-hopping further north. Nubian culture in this region predates the pharaonic period in some respects and has survived multiple waves of displacement, most recently when Lake Nasser's rising waters submerged many original Nubian villages further south, forcing resettlement closer to Aswan. Visiting a Nubian home, often with tea and a chance to talk with the family hosting you, gives a side of Egypt that has nothing to do with temples and everything to do with a culture that's still very much alive."
      ),
      ...bullets([
        "Philae Temple — a half-day visit including the boat crossing; best in the early afternoon for light on the reliefs.",
        "The Unfinished Obelisk — a short, focused stop, easily paired with the High Dam on the way back into town.",
        "The Aswan High Dam — a viewpoint stop rather than a full site visit; twenty to thirty minutes is typical.",
        "A Nubian village — a half-day by boat, including tea or a meal with a local family if arranged in advance.",
        "The Nubian Museum — a strong option for context on Nubian history and the Lake Nasser relocation campaign.",
      ]),
      h2("Getting to Aswan"),
      p(
        "Most travelers reach Aswan either by air from Cairo, which takes a little under two hours, or as the southern endpoint of a Nile cruise sailing down from Luxor. Both routes work well; flying in directly is the faster option if Aswan and Abu Simbel are the main focus of your trip, while arriving by cruise turns the journey itself into part of the experience, with stops at Edfu and Kom Ombo along the way. A smaller number of travelers arrive by overnight train from Cairo, which is a longer, more old-fashioned way to cover the distance but not usually the most comfortable option for a short trip."
      ),
      p(
        "Once you're there, Aswan itself is compact and walkable along the Corniche, with the main sites — Philae, the Unfinished Obelisk, and the High Dam — a short drive rather than a long haul, which makes it an easy city to base yourself in without feeling like every day involves hours in a car."
      ),
      h2("How Much Time to Give Aswan"),
      p(
        "Two days covers Philae, the Unfinished Obelisk, the High Dam, and a Nubian village visit comfortably, with time left over for the Nubian Museum or simply sitting by the river watching feluccas cross in front of Elephantine Island — one of the more underrated ways to spend an Aswan afternoon. It's also the natural jumping-off point for a day trip to Abu Simbel, roughly three hours south, which is worth its own extra day if your schedule allows it rather than trying to squeeze everything into a single rushed itinerary."
      ),
      callout(
        "Aswan is genuinely one of the more relaxed stops on a Nile Valley itinerary. Resist the urge to pack it as tightly as Luxor — leave an afternoon unplanned for a felucca sail or simply sitting by the water at sunset, since that unhurried pace is a big part of what makes the city worth visiting in the first place.",
        { title: "Good to Know", tone: "Info" }
      ),
      faq(
        [
          {
            question: "How many days should I spend in Aswan?",
            answer:
              "Two full days is a comfortable minimum for Philae, the Unfinished Obelisk, the High Dam, and a Nubian village visit. Add a third day if you're also doing Abu Simbel.",
          },
          {
            question: "Is Aswan worth visiting if I've already seen Luxor?",
            answer:
              "Yes — the character is genuinely different. Luxor is dense with monuments; Aswan is slower, more Nubian in culture, and centered on the river and its scenery as much as its temples.",
          },
          {
            question: "Can you visit Aswan without doing a Nile cruise?",
            answer:
              "Yes, Aswan works well as a standalone stop by air or train, though it's also the natural endpoint (or starting point) for the classic Luxor-to-Aswan Nile cruise.",
          },
          {
            question: "What's the best time of year to visit Aswan?",
            answer:
              "The cooler months, roughly October through April, are the most comfortable for time outdoors at Philae and the High Dam. Aswan runs noticeably hotter than Cairo in summer.",
          },
          {
            question: "How do I get from Aswan to Abu Simbel?",
            answer:
              "Most visitors go by road in an early-morning convoy, roughly three hours each way, returning the same day. A smaller number fly directly from Aswan, which cuts travel time significantly at extra cost.",
          },
          {
            question: "Is Aswan good for travelers who want a slower pace?",
            answer:
              "Very much so. Compared to Luxor's dense cluster of major monuments, Aswan spreads its highlights out with real time to sit by the river between them, which is exactly why many travelers end up preferring it.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "Aswan doesn't try to overwhelm you with monuments the way Luxor does, and that's exactly its appeal. It's the one stop on the Nile Valley circuit built around slowing down — a temple that survived by being moved, a village where the culture predates the pharaohs, granite quarries that supplied half of ancient Egypt's biggest monuments, and a river that feels, for once, like something to sit beside rather than rush past."
      ),
      {
        _type: "ctaBlock",
        _key: nextBlockKey("cta"),
        title: "Explore Aswan's Nubian South",
        body: "Our Aswan Nubian Village & Philae Temple tour pairs the temple crossing with a Nubian village visit and a private Egyptologist guide.",
        buttonLabel: "View the Tour",
        buttonHref: "/tours/aswan-nubian-village-philae-tour",
      },
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
    relatedTours: toursBySlug("aswan-abu-simbel-tour", "lake-nasser-cruise-aswan-abu-simbel", "aswan-nubian-village-philae-tour"),
    seoTitle: "Is Abu Simbel Worth the Trip From Aswan? An Honest Take",
    seoDescription:
      "Abu Simbel adds a long day to an Aswan itinerary. What the journey actually involves, what you'll see, and whether it's genuinely worth the time.",
    body: [
      p(
        "Abu Simbel sits roughly three hours south of Aswan, close to the Sudanese border, which makes it the single biggest time commitment of any major site in Egypt outside a multi-day cruise. It's a fair question to ask before committing a full day to it: is the facade actually worth the drive? For most visitors who make the trip, the honest answer is unambiguously yes — but it helps to know exactly what you're signing up for, in both scale and logistics, before you decide."
      ),
      h2("What's Actually There"),
      p(
        "Ramesses II built the Great Temple's facade with four colossal seated statues of himself, each around 20 meters tall, cut directly into a sandstone cliff — built partly as a monument to his own reign and partly as a statement of Egyptian power at the southern frontier, aimed as much at Nubia and any approaching rivals as at his own people. Photographs flatten the scale of it; standing at the base of those statues, with their faces roughly level with a multi-story building, is a genuinely different experience than seeing them in an image beforehand."
      ),
      p(
        "Beside the Great Temple, the smaller Temple of Hathor honors his queen, Nefertari, with statues of the royal couple standing at equal height on the facade — an unusual gesture in Egyptian royal art, where the queen is almost always shown smaller than the king. Inside both temples, the walls carry extensive relief work: battle scenes from Ramesses II's military campaigns in the Great Temple, and softer, more intimate imagery of Hathor and Nefertari in the smaller one. The interior chambers run deep into the cliff, aligned so that twice a year, in a phenomenon linked to the temple's original solar orientation, sunlight reaches all the way into the inner sanctuary."
      ),
      h2("The Relocation Story"),
      p(
        "Like Philae, Abu Simbel would have been lost entirely to the Aswan High Dam's floodwaters if UNESCO hadn't led an enormous international effort in the 1960s to save it. Engineers and archaeologists cut both temples into more than a thousand large blocks, each carefully numbered, and reassembled them more than 60 meters higher up the cliff, inside an artificial mountain built specifically to replicate their original setting — down to matching the temples' original orientation to the sun. It remains one of the largest and most technically ambitious archaeological rescue operations ever undertaken, and walking around to the back of the site, where the artificial dome supporting the reconstructed cliff is visible, is a small, worthwhile detour most tour groups skip."
      ),
      h2("How to Actually Get There"),
      p(
        "Most visitors go by road in an early-morning convoy from Aswan, departing well before sunrise, arriving by mid-morning, and returning by early evening — a long day, but a single one, and the standard way most itineraries handle it. A smaller number fly directly from Aswan, cutting the travel time to under an hour each way at additional cost, which suits travelers short on time or unwilling to commit to a full day in a vehicle. A third, less common option is arriving by water on a Lake Nasser cruise, approaching the temple facade from the lake rather than the road — a genuinely different, quieter way to see it, without the coach-park crowds that build up mid-morning."
      ),
      ...bullets([
        "By road convoy — the standard, most affordable option; a very long day, roughly three hours each way.",
        "By air — the fastest option, under an hour each way, at a noticeably higher cost than the road.",
        "By Lake Nasser cruise — the slowest and quietest option, arriving by water as part of a multi-day sailing rather than a single day trip.",
      ]),
      h2("The Abu Simbel Sun Festival"),
      p(
        "Twice a year, on dates in February and October roughly corresponding to Ramesses II's coronation and birthday, sunlight travels down the Great Temple's long inner corridor at dawn and illuminates statues of the king deep in the sanctuary — a deliberate feat of ancient solar alignment that still works today, more than three thousand years after the temple was cut into the cliff. The relocation team in the 1960s went to considerable lengths to preserve this alignment when they rebuilt the temple on higher ground, shifting its orientation by a matter of degrees to keep the phenomenon intact. Crowds build heavily around these two dates, with a small festival atmosphere at the site itself, and it's worth timing a visit around one of them deliberately if the scheduling works for your trip — though the temple is just as impressive to see on an ordinary day without the crowds."
      ),
      h2("Is the Long Day Actually Worth It?"),
      p(
        "The honest tradeoff is time against payoff, and Abu Simbel's payoff is genuinely large. Few monuments anywhere in Egypt combine this much scale with this dramatic a survival story — a facade built to intimidate an empire's rivals, saved three thousand years later by an international engineering effort just as ambitious in its own way. Travelers who've already seen Luxor's temples sometimes wonder if Abu Simbel will feel repetitive; in practice it doesn't, both because of the sheer size of the statues and because nothing else in Egypt has quite the same origin-and-rescue story attached to it.",
      ),
      p(
        "Where the trip is less essential is for travelers on a tight schedule who've already committed most of their time to Cairo, Giza, and Luxor. If Aswan itself is already a rushed add-on, Abu Simbel is the first thing worth cutting rather than compressing everything into an exhausting single day. But for anyone spending two or more days in Aswan, it's very hard to argue against making the trip.",
      ),
      callout(
        "If you're going by road, book the earliest departure your itinerary allows. The convoy system means most vehicles arrive within a similar window mid-morning, so leaving Aswan as early as possible buys real time at the site before the crowds and the midday heat both build, and it also means you're back in Aswan for a proper dinner rather than arriving exhausted after dark.",
        { title: "Good to Know", tone: "Info" }
      ),
      faq(
        [
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
          {
            question: "Is flying to Abu Simbel worth the extra cost?",
            answer:
              "If your schedule is tight or a long drive genuinely isn't appealing, yes — it turns a full day commitment into a half day. If time isn't the constraint, the road convoy is the more affordable, equally reliable option.",
          },
          {
            question: "Can I visit Abu Simbel without going through Aswan?",
            answer:
              "In practice, no — Aswan is the standard departure point for the road convoy, the flight, and the Lake Nasser cruise route, so any Abu Simbel visit is built around an Aswan stay.",
          },
          {
            question: "What is the Abu Simbel Sun Festival?",
            answer:
              "Twice a year, in February and October, sunlight aligns down the temple's inner corridor to illuminate statues in the sanctuary at dawn — an ancient solar alignment the 1960s relocation team preserved when they rebuilt the temple.",
          },
          {
            question: "How hot does it get at Abu Simbel?",
            answer:
              "Very, especially outside the cooler months — there's little shade around the facade itself, so sun protection, a hat, and plenty of water matter more here than at almost any other major Egyptian site.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "Abu Simbel isn't a convenient stop, and it was never meant to be — Ramesses II built it at the edge of his empire on purpose, to be seen and felt by anyone approaching from the south, friend or rival. Getting there today asks for a similar kind of commitment, whether that's an early alarm and a long drive, a short flight, or a slow approach by water. For almost everyone who actually makes the trip, that commitment is exactly what makes the arrival worth it."
      ),
      {
        _type: "ctaBlock",
        _key: nextBlockKey("cta"),
        title: "Add Abu Simbel to Your Aswan Itinerary",
        body: "Our Aswan & Abu Simbel tour covers Nubia's ancient temples with a private Egyptologist guide, handling the logistics so you don't have to.",
        buttonLabel: "View the Tour",
        buttonHref: "/tours/aswan-abu-simbel-tour",
      },
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
    relatedTours: toursBySlug("aswan-nubian-village-philae-tour", "kalabsha-temple-nubian-museum-tour", "aswan-abu-simbel-tour"),
    seoTitle: "Philae Temple and the Aswan High Dam: A Practical Visitor's Guide",
    seoDescription:
      "Philae Temple and the Aswan High Dam sit close together and tell connected stories. What to see, how they relate, and how to visit both in a day.",
    body: [
      p(
        "Most visitors to Aswan see Philae Temple and the Aswan High Dam on the same morning, often back to back, without ever hearing how directly one caused the other. The dam that keeps the lights on in Cairo is the reason the temple you're about to walk through isn't where it was originally built. Knowing that connection before you go changes how you look at both places."
      ),
      h2("The Temple of Isis at Philae"),
      p(
        "Philae was built up mainly during the Ptolemaic period, several centuries after Egypt's New Kingdom had ended, and dedicated to Isis, the goddess of magic and motherhood, whose cult had spread far beyond Egypt by the time the temple reached its final form. Pilgrims came from as far as Nubia and later from across the Roman world, and the temple kept functioning as an active place of worship long after most of Egypt's other temples had gone quiet. It held on as one of the last outposts of the old religion, still conducting rites to Isis into the sixth century CE, roughly two hundred years after the Roman Empire had officially become Christian, before the Byzantine emperor Justinian finally ordered it closed."
      ),
      p(
        "That long, layered history is visible on the walls. Ptolemaic and Roman reliefs of Isis, Osiris, and Horus sit near crosses carved by the Coptic Christians who later converted parts of the temple into a church, one relief cut over another rather than destroyed outright. Few sites in Egypt show the transition between religions this plainly, carved into the same stone."
      ),
      h2("Why the Temple Had to Move"),
      p(
        "The original Philae stood on its own island, a short way upriver from where it sits now, and by the mid-twentieth century that island was on a collision course with the rising water behind the new Aswan High Dam. Left where it was, the temple would have been submerged for good."
      ),
      p(
        "Between 1972 and 1980, an international team working under UNESCO carried out one of the most ambitious rescue projects in the history of archaeology. A cofferdam was built around the original island to hold back the Nile while the temple was dismantled block by block, more than 40,000 pieces in total, each one numbered and mapped. The blocks were then ferried to Agilkia, a nearby island reshaped to match the contours of the original site, and reassembled in the same configuration, stone for stone. The original island Philae stood on for two thousand years is gone, permanently underwater. What you visit today is a faithful, painstaking reconstruction on a different piece of land."
      ),
      h2("Walking Through Philae Today"),
      p(
        "Access to Philae is by a short motorboat ride across open water, which is part of what makes the site feel different from Luxor's land-locked temples — you arrive the way ancient pilgrims once did, approaching from the river rather than walking up from a parking lot. The Kiosk of Trajan, with its distinctive open columns, is the image most people already know from photographs, but it's really just the entrance point to a much larger complex behind it: a towering first pylon, courtyards, a birth house dedicated to the child Horus, and the main sanctuary of Isis itself."
      ),
      p(
        "Afternoon light tends to bring out the reliefs best, catching the carved surfaces at an angle rather than flattening them the way harsh midday sun does. Philae also runs an evening sound and light show, walking visitors through the temple's history as the complex is lit up after dark — a genuinely different atmosphere from the daytime visit, and worth adding on for travelers spending more than a single day in Aswan."
      ),
      h2("The Aswan High Dam"),
      p(
        "Completed in 1970 after roughly a decade of construction with substantial Soviet engineering support, the Aswan High Dam replaced an older, smaller dam built by the British early in the twentieth century, which could no longer control the Nile's flooding as reliably as Egypt needed. The new dam ended the annual flood cycle that had shaped Egyptian agriculture for thousands of years, brought large-scale, dependable irrigation to Upper Egypt, and today generates a meaningful share of the country's electricity."
      ),
      p(
        "Its other major effect was creating Lake Nasser, one of the largest reservoirs built by human beings, stretching south from Aswan deep into Sudan. Visitors can walk out onto the dam itself and look across the water, though the dam's technical interior isn't open to tourists — what you're seeing is really the scale of the thing, a wall of rock and concrete holding back an entire inland sea."
      ),
      h2("The Nubia Rescue Campaign"),
      p(
        "Philae wasn't the only monument in the dam's path. The rising water threatened dozens of temples and tombs across ancient Nubia, and UNESCO's response became one of the largest heritage preservation efforts ever undertaken, eventually saving more than twenty monuments, Abu Simbel's colossal facade among them, by physically relocating them to higher ground. It's worth remembering, standing at Philae, that you're looking at only one piece of a rescue that reshaped how the world thinks about protecting ancient heritage from modern development."
      ),
      h2("Visiting Both in a Day"),
      p(
        "Most Aswan itineraries put the High Dam first thing in the morning, when the light on the water is clearest and the site is quietest, then move to Philae in the early afternoon for the boat crossing and the temple itself. Many private guides fold in the Unfinished Obelisk on the way back into town — a granite obelisk abandoned in its quarry after a crack appeared partway through carving, left exactly where the ancient workers walked away from it, and one of the clearest windows anywhere into how these monuments were actually made."
      ),
      p("A few practical points make the day easier:"),
      ...bullets([
        "Wear real walking shoes — the boat dock to Philae involves some uneven ground, and the temple itself has stairs and courtyards to cover.",
        "Bring sun protection regardless of season; there's very little shade on the dam or the approach to the boat dock.",
        "Ask about the evening sound and light show if you're in Aswan more than one night — it runs on a rotating schedule and is worth checking in advance.",
        "Photography is allowed throughout Philae; a polarizing filter helps if you're shooting the reliefs in strong afternoon sun.",
        "Pair the visit with the Unfinished Obelisk rather than treating it as a separate outing — it's a short stop that adds real context to Aswan's granite quarries.",
      ]),
      p(
        "Those quarries, in fact, supplied the stone for obelisks and statues that ended up as far away as Luxor and Cairo, which is part of why Aswan held such a central place in ancient Egyptian building projects long before the modern dam existed."
      ),
      callout(
        "Book the boat crossing to Philae as early in the day as your schedule allows — the island gets busier as cruise groups arrive mid-morning, and the light on the reliefs is better before the sun climbs directly overhead.",
        { title: "Good to Know", tone: "Info" }
      ),
      faq(
        [
          {
            question: "How much time should I budget for Philae and the High Dam together?",
            answer:
              "A half day is enough for both — figure on two to three hours including the boat crossing, the temple itself, and a stop at the dam viewpoint, longer if you add the Unfinished Obelisk or want to linger over the reliefs.",
          },
          {
            question: "Is the boat ride to Philae included in a typical tour?",
            answer:
              "Yes, on any guided visit — the boat is the only way to reach the island, and tickets are arranged as part of the standard temple visit.",
          },
          {
            question: "Can you go inside the Aswan High Dam?",
            answer:
              "No, the dam's interior and machinery aren't open to visitors. What you see is the dam wall itself and the view across Lake Nasser, which is still an impressive stop in its own right.",
          },
          {
            question: "Is Philae worth visiting if I've already seen Karnak and Luxor Temple?",
            answer:
              "Very much so — Philae is a different style and era of temple, with a survival story that's arguably more dramatic than the architecture of the older sites, and the boat approach makes for a different kind of visit than anything in Luxor.",
          },
          {
            question: "What's the best time of day to photograph Philae?",
            answer:
              "Early to mid afternoon, when the sun angles across the reliefs rather than flattening them from directly overhead — or the evening sound and light show for a completely different look at the same stones.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "Philae and the High Dam make an unusually good pair for a single morning: one is a monument that barely survived the modern world, the other is the reason it needed saving in the first place. Seeing them together tells a more complete story about Aswan than either site does alone."
      ),
      {
        _type: "ctaBlock",
        _key: nextBlockKey("cta"),
        title: "See Philae and Aswan's Nubian Heritage in One Day",
        body: "Our Aswan Nubian Village & Philae Temple tour pairs the temple crossing with the High Dam and a private Egyptologist guide.",
        buttonLabel: "View the Tour",
        buttonHref: "/tours/aswan-nubian-village-philae-tour",
      },
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
    relatedTours: toursBySlug("lake-nasser-cruise-aswan-abu-simbel", "aswan-abu-simbel-tour", "aswan-nubian-village-philae-tour"),
    seoTitle: "Lake Nasser Cruise Guide: Aswan to Abu Simbel by Water",
    seoDescription:
      "A Lake Nasser cruise between Aswan and Abu Simbel — the quieter, slower alternative to the Luxor-Aswan Nile cruise. What it involves and who it suits.",
    body: [
      p(
        "Almost everyone who cruises Egypt does it between Luxor and Aswan. A much smaller number sail Lake Nasser instead — the vast reservoir south of the Aswan High Dam, where a handful of small ships cover a route most visitors don't even know exists. If you already know the standard Nile cruise and want something quieter, or you'd simply rather arrive at Abu Simbel by water than by road convoy, this is worth understanding in detail before you book."
      ),
      h2("What Makes It Different"),
      p(
        "Lake Nasser cruises run only a few sailings a week, on ships that carry a fraction of the passengers of a standard Nile vessel, through a landscape with almost no other tourist traffic — open water and desert shoreline rather than the towns, farmland, and constant boat traffic that line the Nile further north between Luxor and Aswan. The lake itself is one of the largest reservoirs built by human beings, created when the Aswan High Dam was completed in 1970 and stretching south from Aswan deep into Sudan. Where the Luxor-Aswan route feels like traveling through the middle of Egyptian daily life, Lake Nasser feels remote — desert to the horizon on both sides, with ancient temples appearing at intervals along the shoreline rather than towns and irrigated fields."
      ),
      p(
        "The temples along the route, including Kalabsha, Beit el-Wali, Amada, and Wadi es-Sebua, were all relocated here for the same reason as Philae and Abu Simbel: to save them from the dam's rising floodwaters during the same UNESCO-led rescue campaign of the 1960s and 70s. Because they sit along a route far fewer travelers ever take, several of them go almost entirely unvisited outside these cruises — quiet, intact temples that would draw real crowds if they sat anywhere along the standard Nile route."
      ),
      h2("What a Typical Sailing Looks Like"),
      p(
        "Most Lake Nasser cruises run a handful of nights, typically bookended by Aswan and Abu Simbel, with stops at the relocated Nubian temples along the way. Ships on this route tend to be smaller and more intimate than the large Nile cruisers further north, with a correspondingly higher level of personal service simply because there are fewer passengers aboard. Days are built around a mix of temple visits by tender boat and open time on the water — sunbathing on deck, watching the desert shoreline pass, or simply enjoying a level of quiet that's hard to find anywhere else on an Egypt itinerary."
      ),
      ...bullets([
        "Sailings run only a few times a week, considerably less frequently than Luxor-Aswan cruises — book well ahead.",
        "Ships carry a small fraction of the passengers of a standard Nile cruiser, for a quieter, more personal atmosphere.",
        "The route includes lesser-visited relocated temples like Kalabsha and Wadi es-Sebua, alongside Abu Simbel.",
        "Arrival at Abu Simbel is by boat, avoiding the road convoy and its midday crowds entirely.",
      ]),
      h2("Abu Simbel by Water"),
      p(
        "The route's centerpiece is arriving at Abu Simbel by boat rather than by road convoy — a genuinely different way to approach the temple's facade, without the coach-park crowds that build up around the midday road arrivals from Aswan. Seeing the four colossal statues of Ramesses II emerge gradually from the water as the boat approaches gives a sense of scale and setting that a bus parking lot simply can't replicate, and it's closer to how the temple would once have been approached along the Nile, before the dam changed the landscape entirely."
      ),
      h2("The Temples Along the Way"),
      p(
        "Kalabsha, the largest freestanding temple on the route, was originally built during the Roman period and dedicated to the Nubian sun god Mandulis, and it's often the first stop after leaving Aswan — an entire temple complex most Egypt visitors have never heard of, let alone seen. Wadi es-Sebua, whose name means \"Valley of the Lions\" for the sphinxes lining its approach, and the smaller rock-cut temple of Amada, one of the oldest surviving Nubian temples with reliefs dating back to the Eighteenth Dynasty, round out the typical stops. None of these sites carry Abu Simbel's scale, but each one is worth its own quiet half hour precisely because you're likely to have it entirely to yourself, a rare thing anywhere in Egypt these days."
      ),
      h2("Who It Suits"),
      p(
        "This is generally a trip for travelers who've already done a standard Nile cruise and want a different kind of sailing next time, or who specifically prioritize a quieter, slower pace over ticking off the maximum number of sites in a set number of days. It's a smaller, less frequent product than the Luxor-Aswan route, with a more limited number of cabins per sailing and fewer departure dates overall, so it needs to be booked further ahead than a standard Nile cruise — this isn't a trip you improvise a few days out."
      ),
      p(
        "It suits travelers who value atmosphere and pace as much as sightseeing density: photographers drawn to open water and desert light, honeymooners wanting privacy, and repeat visitors to Egypt looking for something genuinely different from their first Nile cruise. It suits first-time visitors with limited time less well, since the standard Luxor-Aswan cruise covers considerably more of Egypt's essential ancient sites — Karnak, the Valley of the Kings, Edfu, Kom Ombo — in the same number of days."
      ),
      callout(
        "Because sailings are infrequent and cabins limited, Lake Nasser cruises need to be locked into your itinerary earlier than most Egypt bookings — treat the date as fixed once confirmed, and build the rest of your Aswan time around it rather than the other way around.",
        { title: "Good to Know", tone: "Info" }
      ),
      h2("Planning the Rest of Your Trip Around It"),
      p(
        "Because Lake Nasser sailings run on a fixed, infrequent schedule, they work best as the anchor you plan the rest of an Aswan stay around rather than something slotted in loosely at the end. Most travelers pair it with time in Aswan itself before or after the cruise — Philae Temple, the Unfinished Obelisk, and a Nubian village visit are all easy additions on either side of a Lake Nasser sailing, and combine naturally with it since all of it sits within the same broader Nubian heritage story: monuments and communities shaped by the same dam and the same rescue campaigns."
      ),
      p(
        "Getting to Aswan to start the cruise works the same way as any other Aswan visit — by air from Cairo, or as the endpoint of a standard Luxor-Aswan Nile cruise, which some travelers use as a way to combine both routes into one longer, more complete Nile experience. Given how far ahead sailings need to be booked, it's worth deciding on a Lake Nasser cruise early in your overall Egypt planning, rather than treating it as a spontaneous addition once you're already in the country."
      ),
      faq(
        [
          {
            question: "How is a Lake Nasser cruise different from the Luxor-Aswan Nile cruise?",
            answer:
              "Lake Nasser runs south of Aswan rather than north of it, on smaller ships with far fewer passengers and sailings, through open desert scenery rather than towns and farmland, ending at Abu Simbel by boat.",
          },
          {
            question: "How many days does a Lake Nasser cruise take?",
            answer:
              "Typically a handful of nights, bookending Aswan and Abu Simbel with stops at relocated Nubian temples along the way.",
          },
          {
            question: "Is a Lake Nasser cruise more expensive than a standard Nile cruise?",
            answer:
              "It tends to run at a higher price point per night, reflecting the smaller ships, lower passenger counts, and more limited number of sailings available.",
          },
          {
            question: "Do I need to have already done a Nile cruise before trying this one?",
            answer:
              "Not strictly, but it suits repeat visitors or travelers prioritizing pace and quiet best. First-time visitors with limited days usually get more overall value from the standard Luxor-Aswan route.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "A Lake Nasser cruise isn't trying to replace the Luxor-Aswan route, and for most first Egypt trips, it shouldn't. What it offers instead is a genuinely different register — open water, desert light, temples almost nobody else visits, and an approach to Abu Simbel that feels closer to discovery than arrival. For the right traveler, at the right point in their Egypt travels, that's worth the extra planning."
      ),
      {
        _type: "ctaBlock",
        _key: nextBlockKey("cta"),
        title: "Sail Lake Nasser to Abu Simbel",
        body: "Our Lake Nasser Cruise sails from Aswan to Abu Simbel by water, stopping at relocated Nubian temples most visitors never see.",
        buttonLabel: "View the Cruise",
        buttonHref: "/tours/lake-nasser-cruise-aswan-abu-simbel",
      },
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
    relatedTours: toursBySlug(
      "ras-mohammed-snorkeling-tour",
      "marsa-alam-dolphin-house-tour",
      "hurghada-red-sea-diving-snorkeling",
      "dahab-blue-hole-three-pools-tour"
    ),
    seoTitle: "Is Scuba Diving in the Red Sea Worth It? An Honest Look",
    seoDescription:
      "The Red Sea is one of the world's best-known diving destinations. What actually makes it stand out, which sites matter, and what beginners should know.",
    body: [
      p(
        "Ask a diver who has logged time on reefs around the world where the Red Sea ranks, and most put it near the top — not because of one spectacular site, but because of the consistency. Wall after wall of coral in genuinely good condition, visibility that turns a reef thirty meters down into something you can see clearly from the surface, and a range of diving that runs from gentle shore entries suitable for a first-timer to some of the most serious wreck and current-swept wall dives anywhere in the world. For anyone weighing whether to build diving into an Egypt trip, the short answer is yes. The more useful answer explains why, and what actually varies from one base to the next."
      ),
      p(
        "The Red Sea isn't one destination with one experience. Sharm El Sheikh, Dahab, Hurghada, El Gouna, and Marsa Alam are all diving bases with genuinely different characters, and what you get out of \"the Red Sea\" depends a lot on which of them you dive from, how many days you have, and whether you're already certified. This is what actually makes the diving here worth the trip, which sites are worth knowing by name, and what to expect if you're trying it for the first time."
      ),
      h2("What Makes the Red Sea Different"),
      p(
        "Geography does most of the work. The Red Sea is narrow, deep, and gets almost no freshwater runoff, which keeps salinity high and sediment low — the reason visibility here is routinely excellent rather than occasional. Reef walls tend to start close to shore and drop fast, so healthy coral and a wide range of marine life sit within easy reach of a beach entry or a short boat ride, rather than requiring a long crossing to open water."
      ),
      p(
        "The reefs themselves are also in better shape than a lot of divers expect. Red Sea coral has proven more resistant to the warming-driven bleaching events that have damaged reef systems elsewhere, partly because corals here evolved tolerating naturally higher summer temperatures. That doesn't mean the reefs are untouched — anchor damage and diver contact are real, ongoing concerns, which is part of why buoyancy control and reputable operators matter here as much as anywhere. But structurally, a lot of what divers came here to see fifteen years ago is still there to see now."
      ),
      h2("The Sites Worth Knowing By Name"),
      p(
        "A handful of sites come up in almost every conversation about Red Sea diving, and it's worth knowing what each one actually is before you build a trip around it."
      ),
      ...bullets([
        "Ras Mohammed National Park, at the southern tip of the Sinai Peninsula near Sharm El Sheikh — dramatic coral walls, strong fish life, and some of the most consistently good visibility on the coast.",
        "The Thistlegorm, a WWII British supply ship sunk near the Strait of Tiran — widely considered one of the best wreck dives in the world, with motorcycles, trucks, and rifles still visible in the cargo holds.",
        "The Blue Hole, just north of Dahab — a dramatic submarine sinkhole, mostly dived within safe recreational limits by ordinary certified divers with a local guide, and famous enough to deserve its own visit.",
        "Elphinstone Reef, Brothers Islands, and Daedalus Reef, all off Marsa Alam — remote, current-swept, liveaboard-access sites for more experienced divers, known for reef sharks, hammerheads, and oceanic whitetips.",
      ]),
      h2("Learning to Dive, or Trying It for the First Time"),
      p(
        "You don't need a certification card to get a real sense of what makes this diving special. Licensed dive centers throughout the Red Sea resorts offer supervised introductory dives — sometimes called Discover Scuba dives — that take a complete beginner into shallow water with an instructor, no prior experience required. It's a controlled, closely watched way to see coral and fish life up close before deciding whether to go further."
      ),
      p(
        "For anyone considering full certification, Egypt is genuinely one of the more affordable and accessible places in the world to do it. A PADI Open Water course typically runs over several days, mixing classroom or e-learning modules with pool sessions and open-water dives, and dive centers in Hurghada, Sharm, and Dahab in particular are set up to run these courses constantly, in English and several other languages, with reef access a short boat ride from the classroom."
      ),
      p(
        "If diving itself isn't the goal, snorkeling over the same reefs delivers a surprising amount of what makes the Red Sea worth visiting — most of the color and fish activity happens in the top few meters of water anyway, well within snorkeling range, and it requires no certification, gear rental beyond a mask and fins, or prior experience at all."
      ),
      h2("What a Day of Diving Actually Looks Like"),
      p(
        "Most Red Sea diving happens off day boats rather than shore entries, particularly from Hurghada, El Gouna, and Marsa Alam, where the best reefs sit some distance offshore. A typical day involves an early departure, two boat dives separated by a surface interval and lunch on board, and a return by mid-afternoon — enough time in the water to see two different sites without the fatigue of a third dive. Dahab is the exception, with excellent house reefs accessible directly from the shore, which is part of why it built its reputation as a shore-diving town rather than a boat-diving one."
      ),
      h2("Best Time to Go"),
      p(
        "The Red Sea is diveable nearly year-round, which is unusual among major dive destinations and a real part of its appeal. Summer brings the warmest water and often the clearest visibility, though air temperatures on land climb high enough that time between dives matters. Winter cools the water somewhat but rarely to an uncomfortable degree, and it comes with fewer crowds on the boats and better rates. Spring and autumn tend to split the difference — comfortable air temperatures, still-warm water, and good visibility without peak-season pricing."
      ),
      callout(
        "Choose a dive center affiliated with a recognized agency (PADI, SSI, or similar), check your gear before entering the water, and always dive within your certification's depth limits — the Red Sea's more advanced sites have currents and depths that catch out divers who push past what they're trained for. Basic dive insurance through an organization like DAN is worth having, and remember the standard rule about not flying for at least eighteen to twenty-four hours after your last dive.",
        { title: "Diving It Safely", tone: "Safety" }
      ),
      h2("Is It Worth It If You're Not a Certified Diver"),
      p(
        "Yes, unreservedly. Snorkeling trips to sites like Ras Mohammed or the reefs off Marsa Alam put you over the same coral and much of the same marine life divers see, minus the depth. Families traveling together often split the difference well this way — certified divers go down while snorkelers stay on the surface above the same reef, and everyone regroups on the boat with their own version of the same morning."
      ),
      faq(
        [
          {
            question: "Is Red Sea diving good for complete beginners?",
            answer:
              "Yes. Licensed dive centers run supervised introductory dives for people with zero experience, and if you decide to go further, full Open Water certification is widely available and relatively affordable compared to many other diving destinations.",
          },
          {
            question: "Which Red Sea base is best for diving — Hurghada, Sharm, Dahab, or Marsa Alam?",
            answer:
              "Hurghada and Sharm El Sheikh offer the most polished resort infrastructure and boat access to major sites. Dahab is quieter and built around shore diving, including the Blue Hole. Marsa Alam sits closest to remote, current-swept sites like Elphinstone and the Brothers, better suited to more experienced divers.",
          },
          {
            question: "Do I need to bring my own dive gear?",
            answer:
              "No — dive centers throughout the Red Sea resorts rent full gear, including wetsuits, regulators, and BCDs, to a standard that's more than adequate for recreational diving. Serious or frequent divers sometimes bring their own mask and fins for fit and comfort.",
          },
          {
            question: "Are there sharks in the Red Sea, and is that a safety concern?",
            answer:
              "Reef sharks and, at remote sites like the Brothers, oceanic whitetips and hammerheads are part of what draws experienced divers there. Encounters at recreational sites are calm and non-threatening when following a guide's instructions; incidents are rare and almost always tied to specific, well-documented circumstances rather than ordinary diving.",
          },
          {
            question: "Can I dive the Red Sea if I only have one or two days?",
            answer:
              "Yes. A single day of boat diving out of Hurghada, Sharm, or Marsa Alam is enough to see a genuinely good reef site, and it's a common add-on to a broader Egypt itinerary rather than something that requires a dedicated diving trip on its own.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "The honest case for Red Sea diving isn't that it beats every other ocean on a single metric — it's that so little about the experience disappoints. The visibility holds up, the coral is genuinely healthy, the range of sites suits everyone from a first-time snorkeler to a technical diver chasing hammerheads at the Brothers, and the logistics of actually doing it, from certification to gear to boat access, are about as smooth as diving gets anywhere in the world."
      ),
      {
        _type: "ctaBlock",
        _key: nextBlockKey("cta"),
        title: "Get Into the Water",
        body: "Whether you're certified or trying it for the first time, we'll build a Red Sea day — or a full diving-focused trip — around what you actually want to see.",
        buttonLabel: "Book a Red Sea Diving Day",
        buttonHref: "/tours/hurghada-red-sea-diving-snorkeling",
      },
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
    relatedTours: toursBySlug("mount-sinai-sunrise-hike", "st-catherine-monastery-sinai-tour"),
    seoTitle: "Mount Sinai Sunrise Hike: What to Actually Expect",
    seoDescription:
      "Climbing Mount Sinai for sunrise is a genuine physical undertaking. What the overnight hike actually involves, how hard it is, and what to bring.",
    body: [
      p(
        "Mount Sinai — traditionally identified as the mountain where Moses received the Ten Commandments — draws hikers for a reason that has less to do with religion than with the view. Sunrise from the summit, breaking slowly over a landscape of bare granite peaks with no city light for miles, is one of the most striking sights in Egypt, and one of the few experiences in the country that has nothing to do with temples or the Nile at all."
      ),
      p(
        "It's also a genuinely demanding night. Most people who sign up for \"the Mount Sinai hike\" picture the sunrise and underestimate everything that comes before it — the pre-dawn wake-up, hours of climbing in darkness, and real cold at altitude. Here's what the night actually involves, so you arrive prepared rather than surprised."
      ),
      h2("The Climb Itself"),
      p(
        "Hikes begin late — typically around midnight, or between 1 and 2 AM — timed so climbers reach the 2,285-meter summit with enough margin before dawn to find a spot and catch their breath. Climbing in full darkness is standard, not a scheduling quirk; the mountain simply takes long enough to climb that starting any later risks missing the sunrise itself, which is the entire point of the trip."
      ),
      p(
        "The trail is well established and impossible to lose in the dark — a steady stream of headlamps ahead of and behind you marks the way on any night with more than a handful of climbers, and local Bedouin guides who know the mountain by feel lead every group. Small tea and snack stalls dot the route at intervals, run by Bedouin from the surrounding area, offering tea, coffee, and blankets for rent to anyone who underestimated the cold."
      ),
      h2("Two Routes: Camel Path or Steps of Repentance"),
      p(
        "There are two ways up, and it's worth knowing the difference before you commit to one."
      ),
      ...bullets([
        "The camel path — the standard route for most visitors, a longer but gentler ascent along a wide, well-graded trail, roughly two and a half to three hours at a steady pace. Camels can be hired for most of this route (for a fee, arranged locally), though the final stretch to the summit is on foot regardless, up a set of steps too steep and narrow for camels.",
        "The Steps of Repentance — some 3,750 stone steps built by a monk as a penance, cutting straight up the mountain rather than switchbacking. It's shorter in distance but far steeper and harder on the legs and lungs, done almost entirely in the dark without the gentler grading of the camel path.",
      ]),
      p(
        "Most first-time climbers take the camel path up; some choose to descend by the Steps of Repentance afterward, in daylight, when the drop is easier to judge and less punishing on tired legs than climbing them at night would be."
      ),
      h2("How Hard Is It, Really?"),
      p(
        "It's a genuine physical undertaking, not a casual walk, and it deserves to be taken seriously by anyone who isn't a regular hiker. A moderate fitness level matters, as do comfortable, broken-in shoes with real grip — the trail is uneven stone and gravel, and doing it in sandals or worn-out sneakers makes three hours feel like six. It is not technical climbing in any sense; no ropes, harnesses, or prior experience are needed, just sustained stamina, steady footing in the dark, and the patience to keep a slow, even pace rather than burning out in the first hour."
      ),
      p(
        "The cold surprises people more than the climb does. Egypt's reputation for heat doesn't extend to a granite summit at over two thousand meters before dawn — temperatures drop well below what the desert floor suggests, even in summer, and a stiff wind at the top makes it colder still. Dressing in layers you can add and remove is the single most useful piece of practical advice for this hike."
      ),
      ...bullets([
        "Warm layers — a fleece or jacket, even in summer, plus something to add at the summit itself",
        "Sturdy, broken-in walking shoes with real tread",
        "A headlamp or flashlight (most of the climb happens in full darkness)",
        "A refillable water bottle — tea stalls along the way sell drinks, but bring your own water too",
        "A small amount of local currency for tea, snacks, blankets, or camel hire along the route",
        "A walking stick, rentable cheaply at the base, which helps more than expected on the steeper sections",
      ]),
      h2("The Summit and Sunrise"),
      p(
        "The top of Mount Sinai is a rocky plateau with a small chapel and a mosque, both usually closed to entry but recognizable landmarks for where to settle in and wait. Space fills up as the sky starts to lighten, and finding a good spot with an unobstructed eastern view is worth arriving a little early for. Blanket rental at the summit is common and genuinely worth the small cost — the wait before first light is the coldest part of the whole night."
      ),
      p(
        "The sunrise itself unfolds slowly, the granite peaks around you shifting from black to deep red to gold as the light spreads, with the surrounding mountains of the Sinai massif visible in every direction once the sun clears the horizon. It's a quiet, almost meditative half hour that most people describe as the actual reason the climb was worth it, regardless of how tired they were getting there."
      ),
      h2("St. Catherine's Monastery"),
      p(
        "At the mountain's base sits St. Catherine's Monastery, one of the oldest continuously operating Christian monasteries in the world, built around what's traditionally identified as the site of the Burning Bush. Its walls hold an extraordinary collection of Byzantine icons and manuscripts, some of the oldest in existence anywhere. Most itineraries visit the monastery after the hike, once its morning visiting hours begin — descending from the summit, resting briefly, then walking through the monastery grounds before heading back, closing the loop on a single overnight visit built around one mountain."
      ),
      callout(
        "The descent is where knees and ankles suffer, not the climb up — tired legs on loose gravel in full daylight is when most minor injuries happen. Take the way down slowly, use a walking stick if you have one, and don't feel pressure to keep pace with faster hikers on the way back to the base.",
        { title: "Coming Down Safely", tone: "Safety" }
      ),
      faq(
        [
          {
            question: "How hard is the Mount Sinai hike?",
            answer:
              "It's a moderate, sustained climb of roughly two and a half to three hours by the camel path, done in darkness and at altitude — manageable for a reasonably fit hiker with decent shoes, but genuinely tiring and not a casual walk.",
          },
          {
            question: "What should I bring for the Mount Sinai sunrise hike?",
            answer:
              "Warm layers (it's cold at altitude even in summer), a headlamp or flashlight, sturdy broken-in shoes, water, and a bit of local currency for tea or blanket rental along the way. A walking stick, rentable at the base, helps on the steeper sections.",
          },
          {
            question: "Can you visit St. Catherine's Monastery without doing the hike?",
            answer:
              "Yes — the monastery keeps its own daytime visiting hours and can be seen on its own, separate from the overnight sunrise climb, though most travelers combine the two into a single trip.",
          },
          {
            question: "Do I need to be an experienced hiker to climb Mount Sinai?",
            answer:
              "No technical experience is needed — it's a walking climb on an established trail with no ropes or scrambling. What matters more is basic fitness, comfortable footwear, and being mentally ready for hours of climbing in the dark and cold.",
          },
          {
            question: "Is it cold at the top of Mount Sinai?",
            answer:
              "Yes, often surprisingly so — even in summer, pre-dawn temperatures at the 2,285-meter summit are far colder than the desert floor below, and wind makes it feel colder still. Warm layers are essential regardless of the season.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "People remember this night less for any single detail and more for the whole shape of it — the long dark climb, the cold wait at the top, and then a sunrise that makes all of it make sense at once. It's not a relaxing morning, and it isn't meant to be one. It's one of the few experiences in Egypt built entirely around effort and timing rather than a monument, and that's exactly why it stays with people."
      ),
      {
        _type: "ctaBlock",
        _key: nextBlockKey("cta"),
        title: "Climb Mount Sinai for Sunrise",
        body: "Join a guided overnight climb to the summit, paired with a morning visit to St. Catherine's Monastery — everything arranged, so all you have to do is climb.",
        buttonLabel: "Book the Sunrise Hike",
        buttonHref: "/tours/mount-sinai-sunrise-hike",
      },
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
