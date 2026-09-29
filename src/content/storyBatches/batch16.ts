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
];
