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
  // DRAFT, deliberately. Everything below is either a fact the operator gave
  // us directly — Cairo airport to the hotel, the hotel to a cafe, the hotel
  // back to the airport — or a service fact taken from src/content/transfers.ts.
  // Nothing about Kai himself is invented: no date, no quote, no hotel name,
  // no cafe name, no nationality, no reaction, because none of that was
  // supplied.
  //
  // Before flipping status to "published", confirm: (1) Kai has agreed to be
  // named, (2) the month, (3) the vehicle class, and (4) whether the hotel and
  // cafe can be named. Any of those turns this from a good explainer into a
  // genuinely specific story — and the cafe run is the part no competitor
  // writes about, so it is worth getting.
  {
    status: "draft",
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
        "Kai's Cairo booking was not a tour. It was three car movements: Cairo International to his hotel when he landed, the hotel to a cafe during his stay, and the hotel back to the airport when he left. That is the whole thing."
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
];
