import type { Story } from "../types";
import { authors } from "../authors";
import { p, h2, bullets, callout, faq, cta, toursBySlug } from "../storyBlocks";
import { unsplashUrl, unsplashCredit } from "../unsplash";

const editorialTeam = authors[0];

// SEO cohort, batch 1 — see docs/content-strategy.md for why this cohort is
// nine articles rather than the sixty that were proposed, and which existing
// pages the other fifty-one topics belong to.
//
// This first story is the time-critical one: Forever Is Now 06 opens on
// 4 November 2026, so a page published in November cannot rank for it.
//
// Every factual claim about the exhibition was verified by web search against
// Ahram Online, CairoScene and Art D'Égypte's own event listing on
// 2026-09-29: the sixth edition, the 4-28 November 2026 dates, the Giza
// Pyramids venue, and the women-led framing. Admission, opening hours and the
// artist list were NOT confirmed from a reachable primary source — both
// artdegypte.org and cairoscene.com are unreachable from this environment —
// so the article says they are unannounced and links out, rather than
// guessing at a ticket price or naming artists who may belong to a previous
// edition. Anything added later should come from the official listing.

export const stories: Story[] = [
  {
    status: "published",
    featured: true,
    slug: "forever-is-now-2026-giza-pyramids",
    title: "Forever Is Now 06: Contemporary Art Returns to the Giza Pyramids",
    category: "Events",
    tags: ["Forever Is Now", "Art D'Égypte", "Giza", "Contemporary Art", "November 2026"],
    author: editorialTeam,
    excerpt:
      "For twenty-five days this November, monumental contemporary sculpture stands on the Giza plateau alongside the pyramids. Here are the confirmed dates, what the sixth edition is about, and how to plan a visit around it.",
    imageTone: "giza",
    image: unsplashUrl("photo-1787682179394-3adb7fffe99c"),
    imageCredit: unsplashCredit(
      "Annie Spratt",
      "https://unsplash.com/photos/great-pyramid-of-giza-in-cairo-pG9ZSNsBcJI"
    ),
    publishedAt: "2026-09-29T00:00:00.000Z",
    relatedTours: toursBySlug("1-day-giza-tour", "3-day-cairo-giza", "giza-pyramids-sound-and-light-show"),
    seoTitle: "Forever Is Now 06 at the Giza Pyramids — 4–28 November 2026",
    seoDescription:
      "Art D'Égypte's sixth Forever Is Now exhibition runs 4–28 November 2026 at the Giza Pyramids. Confirmed dates, what is on show, and how to plan a visit around it.",
    body: [
      p(
        "Once a year the Giza plateau stops being only an archaeological site. Art D'Égypte installs large-scale contemporary sculpture on the sand between the pyramids, leaves it there for a few weeks, and then takes it away again. The sixth edition, Forever Is Now 06, runs from 4 to 28 November 2026."
      ),
      p(
        "It is the rare event that is genuinely worth reorganising a trip around, because the thing on display cannot be seen anywhere else and will not be there in December. If you were already coming to Cairo in November, you are coming during it whether you planned to or not."
      ),

      h2("The confirmed details"),
      ...bullets([
        "Dates: 4–28 November 2026, twenty-five days.",
        "Location: the Giza Pyramids, on the plateau itself.",
        "Organiser: Art D'Égypte, the Egyptian arts initiative that has staged the exhibition annually since 2021.",
        "Edition: the sixth.",
        "This edition is led, for the first time in the exhibition's history, primarily by women artists.",
      ]),
      callout(
        "Admission, opening hours and the full artist list had not been published at the time of writing. Art D'Égypte announces those closer to the opening on artdegypte.org — check there before you plan a specific day, and assume standard Giza plateau entry tickets are needed to reach the installations.",
        { title: "Not yet announced", tone: "Info" }
      ),

      h2("What the sixth edition is about"),
      p(
        "The stated theme is the relationship between people, architecture and the natural world — read through what the pyramids themselves demonstrate: geometric precision, alignment to the sky, and the fact of still standing. Participating artists respond with site-specific work rather than bringing finished gallery pieces to a new room."
      ),
      p(
        "That matters for how you look at it. The installations are placed to be seen against the pyramids, at a particular distance, in particular light. A work photographed head-on in isolation loses most of what it is doing. Walk around them."
      ),

      h2("When to go, and when not to"),
      p(
        "The plateau is busiest between roughly 10am and 2pm, and during the exhibition that is compounded by visitors who have come specifically for the art. Early morning is both emptier and far better light — the low sun rakes across the sculpture and the stone in a way midday flatly does not."
      ),
      p(
        "Late afternoon is the other good window, and the better one if you want the pyramids backlit. Avoid the middle of the day if you have any choice. November is one of the most comfortable months to be outdoors in Giza, which is part of why the exhibition sits where it does in the calendar."
      ),

      h2("Planning a visit around it"),
      p(
        "The exhibition is on the plateau, not in a separate venue, so it fits inside an ordinary Giza visit rather than replacing one. A half day covers the pyramids, the Sphinx and the installations at a reasonable pace. A full day adds the Grand Egyptian Museum, which is a few minutes away and is the obvious pairing — contemporary work on the plateau in the morning, four thousand years of the original material in the afternoon."
      ),
      p(
        "If you want photographs of yourself with the installations, go early. The same light that makes the sculpture read is the light that makes portraits work, and by mid-morning both the crowds and the contrast have turned against you."
      ),

      faq(
        [
          {
            question: "When is Forever Is Now 06?",
            answer:
              "4 to 28 November 2026, at the Giza Pyramids. It is the sixth edition of the annual exhibition staged by Art D'Égypte.",
          },
          {
            question: "Where exactly is it held?",
            answer:
              "On the Giza plateau itself, among the pyramids — not in a museum or gallery. The installations are outdoors and site-specific.",
          },
          {
            question: "Do you need a separate ticket?",
            answer:
              "Art D'Égypte had not published admission details at the time of writing. Reaching the installations means entering the Giza plateau, so plan for standard plateau entry tickets and check artdegypte.org for anything additional.",
          },
          {
            question: "How long does it take to see?",
            answer:
              "The installations are spread across the plateau rather than clustered, so allow an hour or two on top of however long you were already spending at the pyramids.",
          },
          {
            question: "Is it worth planning a trip around?",
            answer:
              "If you are already in Egypt in November, yes — it is a rare chance to see the plateau in an unfamiliar state, and it costs you nothing beyond the visit you were making anyway. Building a whole trip around twenty-five days is a bigger call, and depends on how much contemporary art matters to you.",
          },
        ],
        "Forever Is Now 06: common questions"
      ),

      h2("After November"),
      p(
        "The installations come down at the end of the month and the plateau returns to itself. The pyramids, the Sphinx and the Grand Egyptian Museum are there year-round, and a seventh edition has followed every previous one."
      ),

      cta({
        title: "Seeing Giza during the exhibition",
        body: "A private guide means you go at the hour that suits the light rather than the hour the coach leaves — which during Forever Is Now is the difference between seeing the work and queueing at it.",
        buttonLabel: "See Giza tours",
        buttonHref: "/tours",
      }),
    ],
  },
  // Kai's transfer story.
  //
  // Everything below is either a fact the operator gave us directly — Cairo
  // airport to the hotel, the hotel to a cafe, the hotel back to the airport —
  // or a service fact taken from src/content/transfers.ts. Nothing about Kai
  // himself is invented: no date, no quote, no hotel name, no cafe name, no
  // nationality, no reaction, because none of that was supplied.
  //
  // Published on the operator's instruction. Still worth adding when known:
  // the month, the vehicle class, and whether the hotel and cafe can be named.
  // The cafe run is the part no competitor writes about.
  {
    status: "published",
    featured: false,
    slug: "kai-cairo-transfers-airport-hotel-cafe",
    title: "Three Movements, One Booking: How Kai Got Around Cairo",
    category: "Traveler Stories",
    tags: ["Transfers", "Cairo", "Airport Transfer", "Private Driver"],
    author: editorialTeam,
    excerpt:
      "Kai booked us for three separate movements across one Cairo stay — airport to hotel, hotel to a cafe, hotel back to the airport. It is a small itinerary, and it is the one most travelers get wrong.",
    imageTone: "giza",
    // Cairo traffic, shot in Cairo by a Cairo-based photographer — verified
    // through the Unsplash API rather than recalled, because a credit that
    // names the wrong photographer is worse than no image.
    image: unsplashUrl("photo-1713559528444-c52d007022fe"),
    imageCredit: unsplashCredit(
      "Abdelrahman Ismail",
      "https://unsplash.com/photos/a-city-street-filled-with-lots-of-traffic-next-to-tall-buildings-3u-csJAppd4"
    ),
    publishedAt: "2026-09-29T00:00:00.000Z",
    seoTitle: "Getting Around Cairo by Private Transfer — A Real Three-Leg Trip",
    seoDescription:
      "What booking private transfers across a Cairo stay actually looks like: airport to hotel, an evening out, and the return run. A real routing, and what to copy from it.",
    body: [
      p(
        "Kai's Cairo booking in September 2026 was not a tour. It was three car movements: Cairo International to his hotel when he landed, the hotel to a cafe during his stay, and the hotel back to the airport when he left. That is the whole thing."
      ),
      p(
        "It is worth writing about precisely because it is unglamorous. Most travelers book the airport pickup, then improvise everything after it — and the improvising is where Cairo costs people time, money and temper."
      ),

      h2("The arrival leg is the one people book"),
      p(
        "Almost everyone books this one, and for the obvious reason: landing in an unfamiliar city at an unknown hour with luggage is the moment you most want someone holding a sign. The part that actually matters is less obvious — the flight is tracked, so the driver's arrival time follows the plane rather than the schedule you booked against."
      ),
      p(
        "That single detail is what separates a booked transfer from a taxi rank. A delayed landing does not strand you, and an early one does not mean waiting."
      ),

      h2("The middle leg is the one people skip"),
      p(
        "Kai's second movement was the hotel to a cafe. This is the leg travelers almost never pre-book, and the one where Cairo is least forgiving. Evening traffic is heavy and unpredictable, ride-hailing pickup points at hotels are often a walk away rather than at the door, and the return trip late at night is the part you are least equipped to negotiate."
      ),
      p(
        "Booking it in advance turns an evening out from a logistics problem into an evening out. The car is at the door at the time you said, and it is the same operator who knows where you are staying."
      ),
      callout(
        "If you are going out in the evening, book the leg back at the same time as the leg there. The trip home at 11pm is the one that goes wrong, not the trip out at 8pm.",
        { title: "The practical takeaway", tone: "Highlight" }
      ),

      h2("The departure leg is the one people underestimate"),
      p(
        "Getting to Cairo International is not the same problem as getting away from it. Departure timing has to absorb traffic that varies by hours depending on the time of day, plus airport security queues before check-in. A pre-booked departure transfer fixes the pickup time against the flight rather than against a guess."
      ),

      h2("What to copy from this"),
      ...bullets([
        "Book the shape of the stay, not just the airport run. Three known movements booked once beats three separate negotiations.",
        "Pre-book the evening legs in both directions — the return is the one that strands people.",
        "Give the flight number, not just the time, so arrival tracking can do its job.",
        "Match the vehicle to the luggage, not the headcount. A sedan takes three people and two bags; four people with four bags is an SUV.",
      ]),

      faq(
        [
          {
            question: "Can you book several transfers across one stay?",
            answer:
              "Yes — that is exactly what this was. Airport arrival, a movement during the stay, and the departure run, arranged together rather than as three unrelated bookings.",
          },
          {
            question: "Is a private transfer worth it for a short hop like a cafe?",
            answer:
              "For the outbound leg it is a convenience. For the late return it is the real value, because that is the trip where you are tired, it is dark, and you are least placed to sort out a car.",
          },
          {
            question: "What happens if a flight is delayed?",
            answer:
              "Airport transfers are booked against a flight number and the arrival is tracked, so the pickup follows the aircraft rather than the original timetable.",
          },
        ],
        "Booking transfers across a stay"
      ),

      cta({
        title: "Planning your own movements",
        body: "Tell us the legs — arrival, anything in between, departure — and we will price the whole shape of the stay rather than one airport run.",
        buttonLabel: "See transfer options",
        buttonHref: "/transfers",
      }),
    ],
  },
  // ---------------------------------------------------------------------
  // September 2026 client stories. ALL DRAFT.
  //
  // The operator supplied the factual seed for each: month, what was booked,
  // locations where known, and the one thing that made it notable. Everything
  // here is built on those seeds plus product facts from photoshoots.ts and
  // transfers.ts. No quote, review, opinion or reaction is invented, and where
  // an itinerary was not supplied (Zekra) no location is named at all.
  //
  // Published on the operator's explicit instruction — they own the client
  // relationships and confirmed the names may run.
  //
  // The covers are verified Unsplash photographs of the LOCATIONS, not of the
  // clients, and every one is deliberately free of people: a stock portrait on
  // a named person's story reads as that person. Swap each for the client's
  // own Egypt Eye photographs as they are cleared.
  // ---------------------------------------------------------------------
  {
    status: "published",
    featured: false,
    slug: "abby-zoobi-midnight-flying-dress-booking",
    title: "The Message Came at Midnight",
    category: "Traveler Stories",
    tags: ["Flying Dress", "Photoshoot", "Giza", "Last Minute"],
    author: editorialTeam,
    excerpt:
      "Abby Zoobi sent her enquiry around midnight, which is usually another way of saying you will hear back tomorrow. Someone on the team was still awake.",
    imageTone: "giza",
    image: unsplashUrl("photo-1787682179401-dc7e214c8b38"),
    imageCredit: unsplashCredit(
      "Annie Spratt",
      "https://unsplash.com/photos/great-sphinx-and-pyramid-in-giza-aCz5Vo8ONI4"
    ),
    publishedAt: "2026-09-29T00:00:00.000Z",
    seoTitle: "A Last-Minute Flying Dress Photoshoot at Giza — Abby's Booking",
    seoDescription:
      "What actually happens when a flying dress photoshoot at the pyramids is booked with almost no notice. A real September 2026 booking, from midnight message to shoot.",
    body: [
      p(
        "Most enquiries that arrive after midnight get answered the next morning. That is not neglect, it is just how businesses work. Abby Zoobi sent hers around midnight in September 2026, asking about a flying dress photoshoot at the pyramids, and by her own account did not expect much before daylight."
      ),
      p("Someone on the team was still up. She got a reply."),

      h2("The part that surprised her was not the reply"),
      p(
        "Getting an answer at midnight is unusual enough. The thing Abby had not expected was the second part: that the answer was yes, we can still do this, despite how little notice there was."
      ),
      p(
        "A flying dress shoot is not a turn-up-and-shoot job. There is a dress to prepare, a photographer to confirm, and private transport to arrange, and all of it has to converge at a specific place at a specific hour. Compressing that into what was left of the night is the whole story here."
      ),

      h2("Why the timing is tighter than it looks"),
      p(
        "The constraint nobody outside the work appreciates is light. The pyramids are photographed best at the edges of the day, when the sun is low enough to give the stone texture and the dress something to glow against. That is not a preference, it is the difference between the photographs people book this for and a set of flat midday snapshots."
      ),
      p(
        "So a last-minute booking is not really a question of whether tomorrow is free. It is a question of whether everything can be ready before a window that opens once and closes within the hour."
      ),
      callout(
        "If you are trying to book a photoshoot at short notice, send the message anyway. The worst outcome is that the answer is no. The window you are worried about missing is usually narrower than you think, which is exactly why asking early in the evening beats waiting until the morning.",
        { title: "If you are in the same position", tone: "Highlight" }
      ),

      h2("What a short-notice booking actually needs from you"),
      ...bullets([
        "A date, and a willingness to take the early slot — the light decides, not the calendar.",
        "Dress size and colour preference, since the dress has to be ready before the car leaves.",
        "Where you are staying, so pickup can be arranged around the schedule rather than after it.",
        "Entrance tickets to the plateau are bought at the gate and are not included in the shoot.",
      ]),
      p(
        "None of that is complicated. It just has to happen in sequence, and at short notice the sequence is the hard part."
      ),

      cta({
        title: "Thinking about a flying dress shoot",
        body: "Ask about a date even if it is close. The answer depends on the light and the logistics, not on how far ahead you planned.",
        buttonLabel: "See photoshoot options",
        buttonHref: "/photoshoots",
      }),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "zekra-mahmoud-planning-a-trip-for-someone-else",
    title: "The Person Who Is Not in Any of the Photos",
    category: "Traveler Stories",
    tags: ["Trip Planning", "Family Travel", "Booking"],
    author: editorialTeam,
    excerpt:
      "Zekra travelled. Her brother Mahmoud did the arranging — the messages, the details, the decisions. He is the reason the trip worked, and he is in none of the pictures.",
    imageTone: "nile",
    image: unsplashUrl("photo-1680356217112-dad9300ce49d"),
    imageCredit: unsplashCredit(
      "Jordi Orts Segalés",
      "https://unsplash.com/photos/a-body-of-water-surrounded-by-palm-trees-9G7gfPz_6MI"
    ),
    publishedAt: "2026-09-29T00:00:00.000Z",
    seoTitle: "Booking a Trip to Egypt for Someone Else — How It Works",
    seoDescription:
      "A September 2026 booking arranged by a traveller's brother. What it takes to plan an Egypt trip on someone else's behalf, and what to hand over.",
    body: [
      p(
        "In September 2026, most of our conversation about Zekra's trip was not with Zekra. It was with Mahmoud, her brother, who handled the arrangements and the back-and-forth while she got on with the part that people actually remember."
      ),
      p(
        "This happens more than the photographs suggest. Someone in a family becomes the planner, and the planner is rarely the person in the picture."
      ),

      h2("Planning by proxy is a different job"),
      p(
        "Booking your own trip is easy in one specific way: you already know your own answers. You know what you want to see, what you will tolerate, how early you will get up. Arranging it for someone else means making a hundred small decisions on their behalf and being right about most of them."
      ),
      p(
        "It also means carrying the risk. If something is wrong, the planner is the one who feels it, which is why people in Mahmoud's position ask more questions than travellers booking for themselves. That is not difficulty. It is diligence, and it produces a better trip."
      ),

      h2("What makes it work"),
      p(
        "The pattern we see with proxy bookings is that they go well in proportion to how much the planner is willing to hand over. Someone who tries to micro-manage every detail from another country ends up as a message relay. Someone who states the constraints clearly and then lets the operator solve them ends up with a trip that adapts on the day."
      ),
      ...bullets([
        "Say who is travelling and what they can and cannot do — pace matters more than any single site.",
        "Name the fixed points: arrival, departure, anything already booked. Everything else can be built around them.",
        "Give one contact who can decide on the day, even if it is not you.",
        "Say what the trip is for. A first visit, a family return and a milestone are three different trips through the same country.",
      ]),
      callout(
        "If you are arranging a trip for someone else, put your own phone number on the booking and theirs on the ground. The planner should get the confirmations. The traveller should get the driver.",
        { title: "One practical thing", tone: "Info" }
      ),

      h2("The quiet part"),
      p(
        "There is no dramatic moment in this story, and that is rather the point. The measure of a well-arranged trip is that the person taking it never has to think about how it was arranged. Mahmoud did the thinking in advance so that Zekra would not have to do it in Egypt."
      ),

      cta({
        title: "Arranging a trip for someone else",
        body: "Tell us who is travelling, what is already fixed, and what the trip is for. We will build the rest around it.",
        buttonLabel: "Start planning",
        buttonHref: "/customize",
      }),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "dalia-varde-aziz-giza-gem-saqqara-memphis",
    title: "Four Thousand Years in One Day: Dalia and Aziz in Giza, Saqqara and Memphis",
    category: "Traveler Stories",
    tags: ["Giza", "Grand Egyptian Museum", "Saqqara", "Memphis", "Photoshoot"],
    author: editorialTeam,
    excerpt:
      "Giza, the Grand Egyptian Museum, Saqqara, Memphis, and a photoshoot to close it. For Dalia Varde, who has Egyptian heritage alongside Filipino roots, it was not only sightseeing.",
    imageTone: "giza",
    image: unsplashUrl("photo-1636020895075-5e598638375e"),
    imageCredit: unsplashCredit(
      "Dmitrii Zhodzishskii",
      "https://unsplash.com/photos/a-large-pyramid-in-the-middle-of-a-desert-Xyqoo7jSKvk"
    ),
    publishedAt: "2026-09-29T00:00:00.000Z",
    seoTitle: "Giza, the GEM, Saqqara and Memphis in One Trip — A Real Itinerary",
    seoDescription:
      "How Giza, the Grand Egyptian Museum, Saqqara and Memphis fit together in one journey, from a September 2026 trip that ended with a professional photoshoot.",
    body: [
      p(
        "Dalia Varde is Miss Cosmo International, and she came to Egypt in September 2026 with Aziz. She has Filipino roots and Egyptian heritage, which puts her in an unusual position at the pyramids: a visitor, and not entirely a visitor."
      ),
      p(
        "The route they took is worth describing on its own, because it is one of the better ways to see this part of Egypt and most itineraries get the order wrong."
      ),

      h2("Giza first"),
      p(
        "They started at the pyramids. There is an argument for saving them until last, and it is wrong. Giza is the thing everyone has already seen in photographs, and standing under it early resets the scale for everything that follows. Nothing later in the day is diminished by it. Several things are improved."
      ),

      h2("The Grand Egyptian Museum"),
      p(
        "Then the GEM, which is a few minutes from the plateau and is the natural second stop. It holds the objects that came out of the ground the sites are made of, in a building finished in this decade. That contrast is the point of visiting it on the same day as the pyramids rather than on a different one."
      ),

      h2("Saqqara, and then Memphis"),
      p(
        "Saqqara is where pyramid-building was worked out. The Step Pyramid of Djoser predates the ones at Giza, and it looks like what it is: an early attempt at a problem nobody had solved yet, by people who then solved it. Seeing it after Giza rather than before turns it from a lesser pyramid into a first draft, which is far more interesting."
      ),
      p(
        "Memphis closes the sequence. It was the capital when all of this was being built, and what survives is fragmentary. After a day of monuments that are overwhelmingly intact, a capital city reduced to pieces lands differently."
      ),
      callout(
        "Giza, the GEM, Saqqara and Memphis are close enough to combine in one day with a private car, and far enough apart that doing it by taxi means negotiating four times. The order matters more than most people expect: oldest-last reads as anticlimax, oldest-second reads as origin story.",
        { title: "On the route", tone: "Info" }
      ),

      h2("Ending with the photoshoot"),
      p(
        "The day finished with a professional photoshoot. Booking the photography at the end rather than the start is deliberate and we recommend it: by then you have seen the places, you know which backdrop you actually want, and you have stopped being self-conscious about the camera."
      ),
      p(
        "For a traveller with a family connection to the country, the photographs are doing something a little different from holiday pictures. We will leave what that means to Dalia."
      ),

      cta({
        title: "The same route, privately",
        body: "Giza, the Grand Egyptian Museum, Saqqara and Memphis in one day, with a photoshoot if you want one.",
        buttonLabel: "See Giza and Saqqara tours",
        buttonHref: "/tours",
      }),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "alessandra-gianluca-travelling-wedding-dress-pyramids",
    title: "Some Wedding Dresses Are Worn Once. Alessandra's Keeps Travelling",
    category: "Traveler Stories",
    tags: ["Anniversary", "Photoshoot", "Giza", "Couples"],
    author: editorialTeam,
    excerpt:
      "Every anniversary, Alessandra and Gianluca go somewhere new and photograph it in their wedding clothes. The dress has been to all of them. In September 2026 it came to Egypt.",
    imageTone: "giza",
    image: unsplashUrl("photo-1771142901695-17bc34d1be4d"),
    imageCredit: unsplashCredit(
      "waa towaw",
      "https://unsplash.com/photos/the-great-sphinx-and-pyramids-under-a-clear-blue-sky-G3r7xoQhcyg"
    ),
    publishedAt: "2026-09-29T00:00:00.000Z",
    seoTitle: "An Anniversary Photoshoot at the Pyramids in a Travelling Wedding Dress",
    seoDescription:
      "Alessandra and Gianluca mark each anniversary with wedding-style photographs somewhere new. In September 2026 the dress came to Egypt.",
    body: [
      p(
        "A wedding dress is usually worn for one day and kept for the rest of a lifetime, boxed, in a wardrobe, occasionally looked at. Alessandra and Gianluca decided against that."
      ),
      p(
        "Their anniversary tradition is to travel somewhere together and make wedding-style photographs there. The dress goes with them. It has been packed, carried and worn again in each place, and in September 2026 the place was Egypt."
      ),

      h2("The dress is the through-line"),
      p(
        "What makes this more interesting than a nice anniversary photo is continuity. It is the same dress each time. The photographs are not a series of separate occasions that happen to look similar; they are one object moving through a marriage and a map at once."
      ),
      p(
        "That is also why the backdrop matters so much. Each new location has to be distinguishable at a glance from every previous one, or the collection stops accumulating. Few places on earth are less mistakable than the Giza plateau."
      ),

      h2("Shooting a dress at Giza"),
      p(
        "Practically, a long dress in the desert is a specific job. Sand and hems do not get along. Wind, which is usually the enemy of a photoshoot, is here the thing you wait for — a dress that is simply hanging still is a dress in a shop, and a dress caught mid-movement is a photograph."
      ),
      p(
        "The light does the rest. Low sun gives the stone its texture and gives fabric an edge it does not have at midday, which is why these shoots are scheduled around the hour rather than the day."
      ),
      callout(
        "If you are bringing a dress you care about, pack it as hand luggage and tell us before the shoot. Preparation on the morning — steaming, timing, where it changes hands — is not something to improvise on a plateau.",
        { title: "If you are travelling with the dress", tone: "Info" }
      ),

      h2("Why it works as a tradition"),
      p(
        "Most anniversary traditions are a dinner. This one produces something: a growing set of photographs in which two people are visibly the same and the world behind them keeps changing. Egypt is one frame of it, not the conclusion."
      ),
      p("Whatever they choose next, the dress is going."),

      cta({
        title: "An anniversary shoot at the pyramids",
        body: "Bring the dress. We will handle the timing, the location and the photographer.",
        buttonLabel: "See photoshoot options",
        buttonHref: "/photoshoots",
      }),
    ],
  },
  // Vasileia.
  //
  // September 2026 per the operator, who has the booking records.
  //
  // Worth knowing: her imported review row records January 2026 on this same
  // tour, via Tripadvisor. That may mean she travelled twice, or that the
  // platform date on the import is off. Nothing in the text below depends on
  // it — the review is quoted and linked, not dated — but if someone later
  // reconciles the two, this is the note that explains why they differ.
  //
  // The review really is ":)" — quoted exactly, not rewritten, and it is
  // already published on this site among the 2,527. Deliberately the shortest
  // story here: the operator asked not to over-explain it, and they are right.
  {
    status: "published",
    featured: false,
    slug: "vasileia-the-shortest-review",
    title: "The Shortest Review We Have Ever Received",
    category: "Traveler Stories",
    tags: ["Reviews", "Cairo", "Walking Tour"],
    author: editorialTeam,
    excerpt:
      "Vasileia took the Islamic and Coptic Cairo walking tour. Her review, in full, was two characters long.",
    imageTone: "nile",
    // Coptic Cairo, which is half of the walk this review is about. The first
    // choice here was a Sultan Hassan shot that best-travel-agencies-in-egypt
    // already uses — check:stories caught the clash on publish, which is
    // exactly what that gate is for.
    image: unsplashUrl("photo-1680053550458-d048bbf8619b"),
    imageCredit: unsplashCredit(
      "2H Media",
      "https://unsplash.com/photos/a-large-building-with-a-cross-on-top-of-it-DEP7pQ3vHPE"
    ),
    publishedAt: "2026-09-29T00:00:00.000Z",
    seoTitle: "The Shortest Review Egypt Eye Has Received",
    seoDescription:
      "A traveller took our Islamic and Coptic Cairo walking tour and left a two-character review. On what short feedback is actually worth.",
    body: [
      p(
        "Planning a day in Cairo takes a while. There are questions about timing, about what is worth seeing, about how much walking is involved and whether the heat is manageable. It is a lot of back-and-forth for a few hours on foot."
      ),
      p("Vasileia did the Islamic and Coptic Cairo walking tour in September 2026. Afterwards she left a review. Here it is in full:"),
      {
        _type: "quoteBlock",
        _key: "vasileia-review",
        quote: ":)",
        attribution: "Vasileia, on Tripadvisor",
      },
      p(
        "We are not going to pretend that is a detailed piece of feedback. It is not. But it arrived, unprompted, after the tour was over and there was nothing left to gain by sending it, and that is a category of response worth more than its length suggests."
      ),
      p(
        "Most of the reviews on this site run to paragraphs. Those are the useful ones — they tell other travellers what the day was actually like, which is why we publish all of them as written. This one tells you nothing about the itinerary. It tells you something about the afternoon."
      ),
      p("Not every good day needs a write-up."),

      cta({
        title: "The walk in question",
        body: "Islamic and Coptic Cairo on foot, with someone who knows which doors are worth going through.",
        buttonLabel: "See Cairo tours",
        buttonHref: "/tours",
      }),
    ],
  },
  // ---------------------------------------------------------------------
  // The SEO cohort from docs/content-strategy.md. Nine articles, not sixty:
  // 24 of the proposed topics were already live and 19 more were partially
  // covered, so these are the genuine gaps. Several are deliberate merges —
  // the celebrations pillar absorbs seven briefed topics, the desert
  // comparison absorbs two, the yacht page absorbs two.
  //
  // Prices below come from src/content/photoshoots.ts and
  // src/content/transfers.ts. Distances are stated as approximations because
  // that is how they are known.
  // ---------------------------------------------------------------------
  {
    status: "published",
    featured: false,
    slug: "celebrating-a-milestone-in-egypt",
    title: "Celebrating a Milestone in Egypt: Proposals, Birthdays and Anniversaries",
    category: "Travel Guides",
    tags: ["Proposals", "Birthdays", "Anniversaries", "Celebrations", "Giza"],
    author: editorialTeam,
    excerpt:
      "What it actually takes to mark an occasion in Egypt rather than just visit during one — where it works, what it costs, and the logistics nobody mentions until you are standing there.",
    imageTone: "giza",
    image: unsplashUrl("photo-1579555973297-560c43ca7562"),
    imageCredit: unsplashCredit(
      "Andre Jackson",
      "https://unsplash.com/photos/person-holding-silver-diamond-ring-IXLS59CTgDE"
    ),
    publishedAt: "2026-09-29T00:00:00.000Z",
    relatedTours: toursBySlug("1-day-giza-tour"),
    seoTitle: "Celebrating a Milestone in Egypt — Proposals, Birthdays, Anniversaries",
    seoDescription:
      "How to plan a proposal, birthday or anniversary in Egypt: where it works, what it costs, and the practical constraints at the pyramids nobody warns you about.",
    body: [
      p(
        "Plenty of people celebrate something while they happen to be in Egypt. Fewer plan the trip around the occasion, and the two are not the same job. One needs a restaurant booking. The other needs a location, an hour, a photographer, and a plan for the ten minutes when everything has to work."
      ),
      p(
        "This covers the occasions we are actually asked to arrange, and what each one really requires."
      ),

      h2("Proposals"),
      p(
        "The pyramids are the most requested proposal location in Egypt and, handled badly, one of the worst. The plateau is busy, open, and full of people with cameras. A proposal there works when it is planned around three things: the hour, the spot, and who else knows."
      ),
      p(
        "The hour matters most. Early morning is quieter and the light is better, and those two facts are the same fact — the crowds and the harsh sun arrive together. Our Pyramids Proposal Romance Setup runs one hour at the Giza Pyramids or Nine Pyramids View and costs 150 dollars, with the setup and the photographer arranged in advance so nothing depends on improvising on the day."
      ),
      ...bullets([
        "Decide whether you want the moment photographed from a distance or up close. Distance is more natural; close is more usable.",
        "Tell us if it is a surprise. It changes the pickup, the cover story and where the photographer stands.",
        "Entrance tickets to the plateau are bought at the gate and are not included.",
        "Have a plan for wind. It is the single most common reason a setup has to be adjusted.",
      ]),

      h2("Birthdays"),
      p(
        "A birthday in Cairo does not have to be a restaurant. The versions that people remember are the ones where the day itself is the gift: a private Giza morning before the coaches, a photoshoot, a felucca hour on the Nile as the light goes. The pattern is the same — pick one thing that could only happen here, and do it properly rather than doing four things badly."
      ),
      p(
        "If the birthday is for someone else and it is a surprise, the constraint is the same as with proposals: somebody has to be in on the logistics. That is usually the person reading this."
      ),

      h2("Anniversaries"),
      p(
        "Anniversary trips tend to have a tradition attached — a photograph in the same clothes, a return to a kind of place, a repeated ritual. Those work well in Egypt because the backdrop is unmistakable, which is exactly what a recurring tradition needs. A photograph taken here will never be confused with a photograph taken anywhere else."
      ),
      p(
        "If you are bringing something with you — a dress, an outfit, an object that appears in every year's photograph — tell us before the day. Preparation is not something to improvise on a plateau."
      ),

      h2("Gender reveals and other announcements"),
      p(
        "These are less common and more logistically specific, because the result has to be visible in a photograph and usually involves something that blows away. They have their own guide."
      ),

      callout(
        "Whatever the occasion, the same three decisions do most of the work: which hour, which spot, and who knows. Everything else is arrangement. If you get those three right, a celebration in Egypt is not harder to organise than one at home — it just has to be organised earlier.",
        { title: "The short version", tone: "Highlight" }
      ),

      h2("What it costs"),
      p(
        "For the photography side, the published prices are the ones to plan against: the Exclusive Pyramids Photoshoot is 75 dollars for one to two hours with 80 or more edited pictures, the Pyramids Proposal Romance Setup is 150 dollars for an hour, and the flying dress shoots are 199 dollars at the Giza sand dunes or 219 dollars in Fayoum. Transport is included in the photoshoots. Plateau entrance tickets are not."
      ),

      faq(
        [
          {
            question: "Can you propose at the pyramids?",
            answer:
              "Yes. The practical constraints are the hour and the crowds rather than permission — early morning is both quieter and better lit. The setup and photographer are arranged in advance.",
          },
          {
            question: "How far ahead should a celebration be booked?",
            answer:
              "Further than an ordinary tour, because the hour is fixed rather than flexible. A week is comfortable. Less is often possible, but the early slot is the first thing to go.",
          },
          {
            question: "Can a celebration be added to a tour we already booked?",
            answer:
              "Usually yes. A photoshoot can be combined with any tour, and a proposal or birthday setup slots into the start of a Giza morning rather than replacing it.",
          },
          {
            question: "What happens if the weather is bad?",
            answer:
              "Shoots and setups are rescheduled rather than run in conditions that will not produce anything worth keeping. Wind is a more common problem than rain.",
          },
        ],
        "Planning a celebration in Egypt"
      ),

      cta({
        title: "Tell us what you are marking",
        body: "The occasion decides the hour, the spot and the arrangements. Tell us which one and we will build the day around it.",
        buttonLabel: "Plan a celebration",
        buttonHref: "/customize",
      }),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "gender-reveal-in-egypt-guide",
    title: "How to Plan a Gender Reveal in Egypt",
    category: "Travel Guides",
    tags: ["Gender Reveal", "Celebrations", "Photoshoot", "Giza"],
    author: editorialTeam,
    excerpt:
      "A gender reveal is a photography problem disguised as a party. Here is what works in Egypt, what the wind does to it, and how to plan the ten seconds that matter.",
    imageTone: "giza",
    image: unsplashUrl("photo-1788462810750-b8e78f17d80f"),
    imageCredit: unsplashCredit(
      "gabbiistudios",
      "https://unsplash.com/photos/woman-and-man-with-pastel-balloons-celebration-KIX1vLpmwT8"
    ),
    publishedAt: "2026-09-29T00:00:00.000Z",
    seoTitle: "How to Plan a Gender Reveal in Egypt",
    seoDescription:
      "Planning a gender reveal at the pyramids or a Cairo rooftop: what works outdoors, how wind affects it, and how the photography has to be set up in advance.",
    body: [
      p(
        "A gender reveal is not really an event. It is one photograph, or one short video, and everything else exists to produce it. That reframing is the most useful thing to understand before planning one abroad, because it tells you what actually has to be got right."
      ),

      h2("The three things that decide it"),
      p(
        "Wind, light, and who is holding the camera. In that order."
      ),
      p(
        "Wind is first because almost every reveal mechanism is something light and coloured that has to travel in a predictable direction — powder, confetti, balloons, smoke. Outdoors in Egypt, especially on open desert ground, wind is not an occasional inconvenience. It is the default condition, and it decides where everyone stands."
      ),
      p(
        "Light is second because the colour has to read. A reveal that happens in flat midday sun photographs as a pale smudge. The same reveal in low early or late light photographs as the thing you planned."
      ),
      p(
        "And the camera is third because the moment does not repeat. A phone held by a relative produces a phone video of a moment that cost you a trip to Egypt."
      ),

      h2("Where it works"),
      ...bullets([
        "Giza and Nine Pyramids View — the most recognisable backdrop, and open enough that wind direction has to be planned rather than hoped for.",
        "A Cairo rooftop — more shelter, a city skyline instead of desert, and easier to control who is present.",
        "The sand dunes outside Giza — the most dramatic setting, and the most exposed.",
      ]),
      callout(
        "Plan the reveal to happen with the wind behind the camera, not behind the people. Colour blowing towards the lens photographs as a wall; colour blowing away from it photographs as a reveal.",
        { title: "The one thing people get wrong", tone: "Info" }
      ),

      h2("The practical sequence"),
      p(
        "Arrive early, before the location fills. Set up while the light is still low. Do one rehearsal without the colour so everyone knows where to stand and where to look. Then do it once, properly, with the photographer already in position."
      ),
      p(
        "Bring the reveal materials with you rather than assuming they can be sourced locally on the morning. Whatever you are using, pack it in hand luggage."
      ),

      faq(
        [
          {
            question: "Can you do a gender reveal at the pyramids?",
            answer:
              "Yes, and the constraints are practical rather than bureaucratic: the hour, the crowds and the wind. Early morning solves the first two and makes the third manageable.",
          },
          {
            question: "What about a rooftop instead?",
            answer:
              "A rooftop gives you shelter from wind, a controlled guest list and a Cairo skyline. It is the better choice if the reveal mechanism is delicate or the group is large.",
          },
          {
            question: "Do we need our own photographer?",
            answer:
              "You need someone whose only job is the photograph. The moment is a few seconds long and does not repeat, which is the whole argument against handing a phone to a relative.",
          },
        ],
        "Gender reveals in Egypt"
      ),

      cta({
        title: "Arranging one",
        body: "Tell us the location you have in mind and what the reveal involves. The wind and the light decide the rest.",
        buttonLabel: "See photoshoot options",
        buttonHref: "/photoshoots",
      }),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "white-desert-vs-black-desert",
    title: "White Desert vs Black Desert: What Is Actually Different",
    category: "Travel Guides",
    tags: ["White Desert", "Black Desert", "Bahariya", "Western Desert"],
    author: editorialTeam,
    excerpt:
      "They are an hour apart and people treat them as one trip. They are not the same landscape, they do not photograph alike, and only one of them is worth sleeping in.",
    imageTone: "desert",
    image: unsplashUrl("photo-1708008434267-dbd151d62a54"),
    imageCredit: unsplashCredit(
      "Ahmed Azab",
      "https://unsplash.com/photos/a-view-of-the-desert-from-a-distance-otWbS3M7Qpo"
    ),
    publishedAt: "2026-09-29T00:00:00.000Z",
    seoTitle: "White Desert vs Black Desert, Egypt — The Real Difference",
    seoDescription:
      "How Egypt's White Desert and Black Desert differ in landscape, light and what they are worth doing, and why most trips visit both on the way through.",
    body: [
      p(
        "Both sit in Egypt's Western Desert, both are reached from Bahariya Oasis, and almost every trip that goes to one passes the other. That is where the similarity ends."
      ),

      h2("The Black Desert"),
      p(
        "The Black Desert is a stretch of low hills capped with dark volcanic rock, which from a distance makes the sand look scorched. It sits between Bahariya and the White Desert, so you drive through it rather than to it."
      ),
      p(
        "It is genuinely striking and it is genuinely brief. An hour there is enough: climb one of the cones, look at a landscape that appears to have been burnt, take photographs that will confuse everyone who sees them, and move on. Nobody camps in the Black Desert, and there is no reason to."
      ),

      h2("The White Desert"),
      p(
        "The White Desert is chalk. Wind has cut the plateau into free-standing formations — mushrooms, towers, shapes that look deliberate — standing on pale ground that reads as snow in photographs."
      ),
      p(
        "It is the one worth staying in. At midday it is bright and flat and slightly disappointing. At sunset the chalk turns orange and the shadows arrive, and at night, with no light pollution for a hundred kilometres, the sky is the reason people come. A day trip to the White Desert shows you the rocks. An overnight shows you why anyone bothered."
      ),

      h2("Side by side"),
      ...bullets([
        "Colour: dark volcanic caps against yellow sand, versus white chalk against pale ground.",
        "Time needed: an hour for the Black Desert, a full evening and a night for the White.",
        "Best light: Black Desert reads well in hard daylight; White Desert needs the low sun at either end of the day.",
        "Camping: only the White Desert, and it is the point of going.",
        "Between them sits Crystal Mountain, a quartz outcrop that is a five-minute stop and worth the five minutes.",
      ]),
      callout(
        "If someone offers you a one-day round trip from Cairo taking in both, do the arithmetic before agreeing. It is roughly four to five hours each way to Bahariya before you have seen anything. You would be spending nine or ten hours in a vehicle to be in the White Desert during its worst light.",
        { title: "The trap", tone: "Safety" }
      ),

      h2("So which one"),
      p(
        "This is not really a choice. The Black Desert is on the road to the White Desert, so you get it either way. The real question is whether you stay the night, and the answer is yes — the overnight camp is the difference between having seen the White Desert and having been in it."
      ),

      faq(
        [
          {
            question: "Are the White and Black Deserts close together?",
            answer:
              "Yes. The Black Desert lies between Bahariya Oasis and the White Desert, so any trip to the White Desert drives through it.",
          },
          {
            question: "Can you visit both in one day from Cairo?",
            answer:
              "Physically yes, sensibly no. Bahariya is about four to five hours from Cairo each way, which leaves you in the White Desert in the middle of the day, when it photographs worst.",
          },
          {
            question: "Is the White Desert worth an overnight?",
            answer:
              "It is the reason to go. Sunset, then a night sky with effectively no light pollution, then sunrise on the chalk. A day visit skips all three.",
          },
          {
            question: "What is Crystal Mountain?",
            answer:
              "A small quartz outcrop on the road between the Black and White Deserts. A brief stop, not a destination, but on the way regardless.",
          },
        ],
        "White Desert and Black Desert"
      ),

      cta({
        title: "Going out there",
        body: "Our White Desert overnight camp runs from Cairo and includes the Black Desert and Crystal Mountain on the way through.",
        buttonLabel: "See the White Desert trip",
        buttonHref: "/weekly-trips",
      }),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "how-to-get-from-cairo-to-bahariya-oasis",
    title: "How to Get From Cairo to Bahariya Oasis",
    category: "Travel Guides",
    tags: ["Bahariya", "Western Desert", "Transport", "Cairo"],
    author: editorialTeam,
    excerpt:
      "Every Western Desert trip starts with the same four hours of road. Here are the actual options, what each costs you in time and flexibility, and when to leave.",
    imageTone: "desert",
    image: unsplashUrl("photo-1596625676083-8b29beb59f71"),
    imageCredit: unsplashCredit(
      "Charlotte Harrison",
      "https://unsplash.com/photos/gray-concrete-road-under-gray-sky-2VDu7YD6Gf8"
    ),
    publishedAt: "2026-09-29T00:00:00.000Z",
    seoTitle: "Cairo to Bahariya Oasis — How to Get There",
    seoDescription:
      "The road from Cairo to Bahariya Oasis: how long it takes, the bus and private car options, when to leave, and why it matters for a White Desert trip.",
    body: [
      p(
        "Bahariya Oasis is roughly 365 kilometres southwest of Cairo, about four to five hours by road depending on traffic getting out of the city. It is the gateway to the Black Desert, the White Desert and Crystal Mountain, which means almost nobody goes to Bahariya for Bahariya. They go through it."
      ),
      p(
        "That matters, because it makes the journey part of the itinerary rather than a preamble to it."
      ),

      h2("The options"),
      ...bullets([
        "Private car with a driver. Four to five hours, leaves when you want, stops when you want, and continues into the desert rather than stopping at the town. The only option that puts you in the White Desert for sunset the same day.",
        "Public bus. Cheapest, runs to a fixed schedule, and drops you in Bahariya town — where you then need separate desert transport, because a coach cannot go where the formations are.",
        "Joining a scheduled trip. Someone else has already solved the timing, the vehicle and the camp.",
      ]),
      p(
        "The distinction that decides it is not comfort, it is the vehicle. A saloon car can reach Bahariya. It cannot reach the White Desert. Everything past the tarmac needs a four-wheel drive, so any plan that ends with you standing in Bahariya town still has a gap in it."
      ),

      h2("When to leave"),
      p(
        "Early. Cairo traffic is the variable that turns a four-hour drive into a six-hour one, and leaving before the morning peak removes it entirely. It also puts you in the desert with the afternoon still ahead, which is when the light starts working."
      ),
      callout(
        "A departure around 7am generally has you through the Black Desert by early afternoon and in the White Desert well before sunset. A departure at 11am generally does not.",
        { title: "Timing", tone: "Info" }
      ),

      h2("What is actually in Bahariya"),
      p(
        "The oasis itself is a working farming town with palm groves, hot and cold springs, and a small museum holding some of the Golden Mummies found nearby. It is a reasonable place to stop, eat and break the drive. It is not, on its own, a reason to spend four hours in a car."
      ),

      faq(
        [
          {
            question: "How long is the drive from Cairo to Bahariya?",
            answer:
              "About four to five hours for roughly 365 kilometres, with Cairo traffic being the main variable. Leaving early removes most of the uncertainty.",
          },
          {
            question: "Can you get there by bus?",
            answer:
              "Yes, and it is the cheapest way. It leaves you in Bahariya town, though, and the desert beyond needs a four-wheel drive you would then have to arrange separately.",
          },
          {
            question: "Do you need a 4x4?",
            answer:
              "Not for Bahariya itself, which is reached on tarmac. Yes for the Black and White Deserts, where there is no road.",
          },
          {
            question: "Can you do Bahariya as a day trip from Cairo?",
            answer:
              "You can, but eight to ten hours of driving for a few hours in an oasis is a poor trade. Bahariya makes sense as the first leg of a desert trip rather than a destination.",
          },
        ],
        "Getting to Bahariya"
      ),

      cta({
        title: "The whole run, arranged",
        body: "Cairo to Bahariya, the Black Desert, Crystal Mountain and a night in the White Desert, in one vehicle with one driver.",
        buttonLabel: "See desert trips",
        buttonHref: "/weekly-trips",
      }),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "weekend-trips-from-cairo",
    title: "Weekend Trips From Cairo: Where Two Days Actually Gets You",
    category: "Travel Guides",
    tags: ["Weekend Trips", "Cairo", "Siwa", "White Desert", "Ain Sokhna"],
    author: editorialTeam,
    excerpt:
      "A day trip from Cairo means being back by dinner. Two days changes which places are reachable at all — and the difference is not what most itineraries suggest.",
    imageTone: "giza",
    image: unsplashUrl("photo-1696269061458-0b405e2fe812"),
    imageCredit: unsplashCredit(
      "Joe deSousa",
      "https://unsplash.com/photos/a-group-of-camels-sitting-in-the-middle-of-a-desert-0rhh2jagTTI"
    ),
    publishedAt: "2026-09-29T00:00:00.000Z",
    seoTitle: "Weekend Trips From Cairo — What Two Days Gets You",
    seoDescription:
      "Where you can actually get from Cairo in a weekend: the White Desert, Ain Sokhna, Alexandria, Fayoum and Siwa, with honest travel times.",
    body: [
      p(
        "Day trips from Cairo are well covered and the answer is always the same handful of places, because the constraint is the drive home. A weekend removes that constraint, and the map opens considerably."
      ),
      p(
        "Here is what two days genuinely reaches, ordered by how much the extra day changes things."
      ),

      h2("The White Desert — the trip a weekend exists for"),
      p(
        "Four to five hours to Bahariya, then off-road into the Black Desert and on to the White Desert, where you camp. This is the clearest case in the list: as a day trip it is absurd, and as an overnight it is one of the best things in Egypt. Sunset on the chalk, a night sky with no light pollution for a hundred kilometres, sunrise, and back."
      ),

      h2("Ain Sokhna — the shortest useful escape"),
      p(
        "Roughly 120 kilometres east, an hour and a half to two hours, and you are on the Red Sea. It is the closest real coastline to Cairo, which makes it the default when the point is water rather than distance. A night there turns a long drive into a short one."
      ),

      h2("Alexandria — a different country, sort of"),
      p(
        "Two and a half to three hours north. Mediterranean rather than desert, Greco-Roman rather than pharaonic, and a city that feels almost nothing like Cairo. It is doable in a day and considerably better in two, because half of Alexandria is the evening."
      ),

      h2("Fayoum and Wadi El Rayan — closer than it sounds"),
      p(
        "About two hours southwest. Lakes, waterfalls, the Magic Lake and Wadi El Hitan, the valley of fossil whales. It works as a day trip and rewards an overnight mostly because of the light on the lakes at either end of the day."
      ),

      h2("Siwa — the honest answer is no"),
      p(
        "Siwa is ten to eleven hours from Cairo by road, near the Libyan border. People do it in a weekend and they spend most of the weekend in a vehicle. Siwa is a long-weekend destination at minimum — three days, better four — and treating it as two is the most common planning mistake in this whole category."
      ),
      callout(
        "The rule of thumb that survives contact with reality: if the one-way drive is over five hours, two days is not enough. That puts the White Desert at the far edge of a weekend and puts Siwa outside it.",
        { title: "How to judge it yourself", tone: "Highlight" }
      ),

      h2("What to do with the second day"),
      p(
        "The mistake is treating the extra day as extra distance. The places above are not better because you can drive further; they are better because you get the two hours at each end of the day when the light works, instead of arriving and leaving in the middle."
      ),

      faq(
        [
          {
            question: "What is the best weekend trip from Cairo?",
            answer:
              "The White Desert, by a distance. It is the one destination in range that is transformed by staying overnight rather than merely made more comfortable.",
          },
          {
            question: "Can you do Siwa in a weekend?",
            answer:
              "Not sensibly. It is ten to eleven hours each way from Cairo. Siwa needs a long weekend at minimum.",
          },
          {
            question: "Where is the closest beach to Cairo?",
            answer:
              "Ain Sokhna on the Red Sea, roughly 120 kilometres east and about an hour and a half to two hours by road.",
          },
        ],
        "Weekends out of Cairo"
      ),

      cta({
        title: "Scheduled weekends",
        body: "Several of these run as fixed-date small-group trips, so you can join one rather than arrange it.",
        buttonLabel: "See weekly trips",
        buttonHref: "/weekly-trips",
      }),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "private-yacht-day-trip-ain-sokhna",
    title: "A Private Yacht Day From Cairo to Ain Sokhna: How It Works",
    category: "Travel Guides",
    tags: ["Yacht", "Ain Sokhna", "Red Sea", "Day Trip"],
    author: editorialTeam,
    excerpt:
      "Cairo to the Red Sea and onto a boat, there and back in a day. What the timings really look like, what it costs to get there, and who it is genuinely worth it for.",
    imageTone: "redsea",
    image: unsplashUrl("photo-1667852976428-3b6f59f0db4f"),
    imageCredit: unsplashCredit(
      "XAVIER PHOTOGRAPHY",
      "https://unsplash.com/photos/a-boat-docked-at-a-pier-m6leBM35XyI"
    ),
    publishedAt: "2026-09-29T00:00:00.000Z",
    seoTitle: "Private Yacht Day Trip From Cairo to Ain Sokhna",
    seoDescription:
      "How a yacht day trip from Cairo to Ain Sokhna actually works: travel times, transfer costs, what the day contains, and whether it is worth doing in one day.",
    body: [
      p(
        "Ain Sokhna is the closest the Red Sea gets to Cairo — roughly 120 kilometres east, about an hour and a half to two hours by road. That proximity is the entire reason a yacht day from Cairo is possible at all. From anywhere else on the Egyptian coast it would be a flight."
      ),

      h2("What the day actually looks like"),
      p(
        "Leave Cairo early. You want to be at the marina in the morning rather than at midday, because the wind typically picks up as the day goes on and the water is calmest early. Board, head out, and spend the day on flat turquoise water with the desert mountains behind you on one side and nothing on the other."
      ),
      p(
        "Then the same road back. It is a long day with two hours of driving at each end, and being honest about that is the difference between a good day and a rushed one."
      ),

      h2("What it costs to get there"),
      p(
        "The transfer is the part with published prices. Cairo to Ain Sokhna runs 65 dollars in a sedan, 80 in an SUV, 95 in a van, 120 in a minibus and 150 in a VIP Mercedes-class car, each way. The boat itself is quoted separately depending on the vessel, the group size and the length of the day."
      ),

      h2("Is it worth it in one day"),
      p(
        "It depends on one thing: whether you want the water or the boat. If you want to swim and snorkel in the Red Sea, Ain Sokhna in a day is a reasonable way to do it and far cheaper in time than flying to Hurghada. If you want a full day at sea, the four hours of round-trip driving eat into it enough that an overnight makes more sense."
      ),
      callout(
        "The version that works best is a private boat with a small group — a family, a couple of couples, a celebration. A private yacht for two people on a day trip is an expensive way to be on a boat. For six it becomes one of the better value days out of Cairo.",
        { title: "Who it suits", tone: "Highlight" }
      ),

      h2("Practical notes"),
      ...bullets([
        "Go early. Calmer water, better light, and you are ahead of the traffic in both directions.",
        "The Red Sea is warm nearly year-round; the wind, not the temperature, decides whether a day is pleasant.",
        "Bring more sun protection than you think. There is no shade on open water and the reflection doubles the exposure.",
        "If anyone in the group is prone to seasickness, say so when booking — it changes which boat and which route.",
      ]),

      faq(
        [
          {
            question: "How far is Ain Sokhna from Cairo?",
            answer:
              "About 120 kilometres east, roughly an hour and a half to two hours by road depending on when you leave the city.",
          },
          {
            question: "Can you do a yacht trip from Cairo in one day?",
            answer:
              "Yes. Ain Sokhna is close enough that a morning departure gives you a full day on the water and gets you back the same evening.",
          },
          {
            question: "What does the transfer cost?",
            answer:
              "Cairo to Ain Sokhna is 65 dollars in a sedan, 80 in an SUV, 95 in a van, 120 in a minibus and 150 in a VIP car, each way. The boat is quoted separately.",
          },
          {
            question: "Is it better than going to Hurghada?",
            answer:
              "For a day, yes — Hurghada needs a flight. For a week, no. Ain Sokhna is the Red Sea you can reach by car, not the Red Sea you would build a holiday around.",
          },
        ],
        "Yacht days from Cairo"
      ),

      cta({
        title: "Arranging a day on the water",
        body: "Tell us the group size and the date and we will price the boat and the transfer together.",
        buttonLabel: "Plan the day",
        buttonHref: "/customize",
      }),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "professional-photoshoot-in-cairo",
    title: "Planning a Professional Photoshoot in Cairo (Not Giza)",
    category: "Photography",
    tags: ["Photoshoot", "Cairo", "Islamic Cairo", "Rooftop"],
    author: editorialTeam,
    excerpt:
      "Everyone photographs the pyramids. Cairo itself is a harder and more interesting shoot — different light, different permissions, different results.",
    imageTone: "nile",
    image: unsplashUrl("photo-1764043432344-c9640be09a48"),
    imageCredit: unsplashCredit(
      "Ömer Evren",
      "https://unsplash.com/photos/dense-urban-cityscape-with-many-apartment-buildings-iQF8dpQXBh4"
    ),
    publishedAt: "2026-09-29T00:00:00.000Z",
    seoTitle: "How to Plan a Professional Photoshoot in Cairo",
    seoDescription:
      "Shooting in Cairo rather than at the pyramids: the locations that work, how the light behaves in a dense city, and what to arrange in advance.",
    body: [
      p(
        "A Giza photoshoot is a known quantity: one landscape, one kind of light, one set of decisions. Cairo is not. It is a dense, layered, twelve-hundred-year-old city, and shooting in it is a different job with a different set of constraints."
      ),
      p(
        "It is also where you get photographs that do not look like everyone else's."
      ),

      h2("Where Cairo actually works"),
      ...bullets([
        "Islamic Cairo — carved stone, wooden screens, narrow streets and doorways. The richest texture in the city, and the most crowded.",
        "Coptic Cairo — quieter, more contained, older-feeling, and easier to shoot without a crowd in every frame.",
        "Rooftops — the skyline, minarets, and in the right spot the pyramids on the horizon. The most controllable option.",
        "The Nile and the feluccas — the only place in the city with open water and open sky.",
        "Downtown's Belle Epoque facades — European architecture with Cairo weather on it, which is a look nowhere else has.",
      ]),

      h2("Light behaves differently here"),
      p(
        "At Giza the problem is that there is nothing to block the sun. In Cairo the problem is the opposite: the streets are narrow and the buildings are tall, so for much of the day the good spots are in deep shade while a strip of wall two metres away is blown out."
      ),
      p(
        "That makes timing more important, not less. Early morning gives you low light that reaches down into the streets, and it is also the only time Islamic Cairo is quiet enough to photograph without choreographing around people."
      ),
      callout(
        "Rooftops are the exception to all of this. They get clean light all day, they are private, and they are the one Cairo location where you can plan a specific background and be confident it will be there.",
        { title: "If you only have one slot", tone: "Info" }
      ),

      h2("What to arrange in advance"),
      p(
        "Cairo shoots have more moving parts than Giza ones: getting between locations in traffic eats time, several of the interesting interiors are working religious buildings with their own expectations, and a rooftop needs the owner's agreement rather than a ticket."
      ),
      p(
        "Plan two locations, not five. The distance between them will cost more than the shooting."
      ),

      faq(
        [
          {
            question: "Can you do a photoshoot in Islamic Cairo?",
            answer:
              "Yes, and early morning is the only time it works properly — later in the day the streets are too busy to shoot without a crowd in the frame.",
          },
          {
            question: "Is Cairo better than Giza for photographs?",
            answer:
              "It is different. Giza gives you one unmistakable backdrop. Cairo gives you texture, variety and pictures that do not look like everybody else's.",
          },
          {
            question: "How many locations fit in one session?",
            answer:
              "Two, realistically. Cairo traffic means moving between locations costs more time than photographing at them.",
          },
          {
            question: "What about shooting inside mosques and churches?",
            answer:
              "Several are working places of worship with their own rules on photography and dress. That has to be checked per building rather than assumed, and it is one of the things worth arranging before the day.",
          },
        ],
        "Photoshoots in Cairo"
      ),

      cta({
        title: "A Cairo session",
        body: "Tell us which side of the city you want — the old stone, the rooftops or the river — and we will build the session around the hour that suits it.",
        buttonLabel: "See photoshoot options",
        buttonHref: "/photoshoots",
      }),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "flight-delayed-airport-transfer-egypt",
    title: "What Happens to Your Airport Transfer If Your Flight Is Delayed",
    category: "Travel Guides",
    tags: ["Transfers", "Cairo Airport", "Flight Delays", "Booking"],
    author: editorialTeam,
    excerpt:
      "The question people ask right before booking, and almost nobody answers properly. Short version: the pickup follows the aircraft, not the clock.",
    imageTone: "nile",
    image: unsplashUrl("photo-1664190426381-5f2cf0ea4ef4"),
    imageCredit: unsplashCredit(
      "Joseph Bobadilla",
      "https://unsplash.com/photos/a-group-of-people-in-a-room-EmqjMxS7IsY"
    ),
    publishedAt: "2026-09-29T00:00:00.000Z",
    seoTitle: "Flight Delayed After Booking an Airport Transfer — What Happens",
    seoDescription:
      "What happens to a pre-booked Cairo airport transfer when your flight is delayed, diverted or cancelled, and what you should give when booking.",
    body: [
      p(
        "This is the question that stops people booking a transfer in advance. The worry is reasonable: you are paying now for a car to be somewhere at a time you cannot control, in a country you have not arrived in yet."
      ),
      p("The answer is that the booking is tied to your flight, not to a time you typed in."),

      h2("Why the flight number matters more than the time"),
      p(
        "When you book an airport transfer with a flight number, the arrival is tracked. The driver's schedule follows the aircraft. If you land two hours late, the car arrives two hours later. If you land early, it is already there."
      ),
      p(
        "This is the single practical difference between a booked transfer and a taxi rank, and it is why the flight number is the most important field on the form. A transfer booked with only a time is a transfer that cannot adapt."
      ),
      callout(
        "Give the flight number and the airline, not just the landing time. Everything else in this article depends on that one field being filled in correctly.",
        { title: "The thing to get right", tone: "Safety" }
      ),

      h2("The three situations"),
      p(
        "A delay is the straightforward one. The pickup moves with the flight and there is nothing for you to do."
      ),
      p(
        "A diversion is less common and needs a message. If you land somewhere other than Cairo, tracking will show the aircraft did not arrive, but it cannot know your onward plan. Tell us what you are doing and the transfer is rearranged around it."
      ),
      p(
        "A cancellation means the trip is rescheduled to your new flight. What you should not do is say nothing and hope — a driver waiting at arrivals for a flight that is not coming helps nobody."
      ),

      h2("What to do on your side"),
      ...bullets([
        "Book with the flight number and airline, not an estimated time.",
        "Message us if your flight is cancelled or diverted, as soon as you know. A delay needs nothing.",
        "Keep the booking contact on a number that works before you have an Egyptian SIM — a messaging app over airport wifi is enough.",
        "Do not rebook a second transfer because the first one now looks wrong. It has already moved.",
      ]),

      h2("The departure side"),
      p(
        "The same logic runs in reverse, with one difference: on the way out, the risk is not your flight moving, it is Cairo traffic. Departure pickups are set against the flight with enough margin for the road and the security queue, which varies by hours depending on the time of day. If your outbound flight is delayed, that is usually a reason to keep the original pickup rather than change it — the airport is a better place to wait than the road."
      ),

      faq(
        [
          {
            question: "What if my flight is delayed after I book a transfer?",
            answer:
              "Nothing, from your side. Airport transfers are booked against a flight number and the arrival is tracked, so the driver's timing follows the aircraft.",
          },
          {
            question: "What if my flight is cancelled?",
            answer:
              "Message us with the new flight and the transfer is rescheduled to it. Tracking can see that the original flight did not operate, but not what you rebooked onto.",
          },
          {
            question: "What if I am diverted to another airport?",
            answer:
              "Tell us what your onward plan is. The pickup is rearranged around it rather than waiting at Cairo for a flight that is not coming.",
          },
          {
            question: "How long will the driver wait?",
            answer:
              "The waiting time is measured from the actual landing, not from your original scheduled arrival, which is the point of tracking the flight in the first place.",
          },
        ],
        "Delays and airport transfers"
      ),

      cta({
        title: "Booking an arrival",
        body: "Give us the flight number and the rest takes care of itself.",
        buttonLabel: "See transfer options",
        buttonHref: "/transfers",
      }),
    ],
  },
];
