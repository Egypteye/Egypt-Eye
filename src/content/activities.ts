import type { Experience } from "./types";

// Activities / Extra Experiences — the add-on outings Egypt Eye runs around
// the country, organised by destination on /experiences.
//
// HOW THIS CONTENT WAS BUILT — read before editing:
//
// Every itinerary below was researched against how the activity is actually
// operated in Egypt today (published itineraries from Egyptian operators and
// the current booking platforms — GetYourGuide, Viator, TripAdvisor, Memphis
// Tours, Emo Tours and the individual site operators), not invented. Durations,
// stops, sequence, inclusions and the practical caveats in `goodToKnow` all
// come from that research. Where sources disagreed, the most common,
// most practical version of the trip was used.
//
// Two rules were applied throughout and should stay applied:
//
//   1. No invented specifics. Where the real answer is "it depends" — whether
//      the Valley of the Kings is under a balloon's flight path, whether the
//      dolphins at Sataya will come near — that is what the page says. A
//      promise this company cannot keep is worse than no promise.
//   2. No prices or ratings. `price.amount` is null and `rating` is null on
//      every activity here, so the site shows "Enquire for Pricing" and
//      "New experience" rather than a made-up figure. Fill these in only with
//      real numbers.
//
// PHOTOGRAPHY: each hero is an Unsplash photo, chosen exact-activity-and-place
// first (a camel at Giza, a kayak on the Nile in Cairo, a Nubian house in
// Aswan), then activity-in-Egypt, then the closest real equivalent. They are
// hot-linked from Unsplash's own CDN, which is what the Unsplash API
// Guidelines ask integrations to do rather than re-hosting copies, and every
// one carries its photographer and its photo page in `imageCredit` so the
// source stays identifiable. Replacing any of these with Egypt Eye's own
// photography is an improvement — swap the `image` and drop the `imageCredit`.

// Unsplash serves resized derivatives from the photo's own path. 1600px wide
// covers the largest slot any of these render in (the detail-page hero).
function unsplash(photoPath: string): string {
  return `https://images.unsplash.com/${photoPath}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600`;
}

function credit(creator: string, sourceUrl: string) {
  return { source: "Unsplash", creator, sourceUrl, license: "Unsplash License" };
}

export const activities: Experience[] = [
  // ── Giza ───────────────────────────────────────────────────────────────
  {
    slug: "camel-ride-giza-pyramids",
    title: "Camel Ride at the Pyramids of Giza",
    duration: "1–2 hours",
    location: "Giza Plateau, Giza",
    rating: null,
    price: { amount: null },
    imageTone: "giza",
    image: unsplash("photo-1677775766807-ff09c770da6e"),
    imageCredit: credit(
      "2H Media",
      "https://unsplash.com/photos/a-group-of-people-riding-horses-next-to-the-pyramids-of-giza-6bHRKJYnUwg"
    ),
    description:
      "The Giza plateau seen the way it was meant to be crossed — from the back of a camel, out on the open desert side, with all three pyramids lining up on the horizon. Run at sunrise or sunset, when the light is worth the early alarm and the plateau is at its quietest.",
    steps: [
      {
        title: "Pickup from your hotel",
        description:
          "A private air-conditioned car collects you in Cairo or Giza. Sunrise rides leave before first light; sunset rides go out mid-afternoon.",
      },
      {
        title: "Meet your camel at the desert gate",
        description:
          "You start on the open desert side of the plateau rather than in the crowd at the main gate. Short safety briefing, and a hand up into the saddle.",
      },
      {
        title: "Ride out across the sand",
        description:
          "Twenty minutes or so out into the desert behind the pyramids, away from the coach traffic, with the plateau slowly rearranging itself behind you.",
      },
      {
        title: "The panorama stop",
        description:
          "The point where Khufu, Khafre and Menkaure stack up in a single frame. You dismount here and your guide takes the photos on your own phone or camera — the shot everybody comes for.",
      },
      {
        title: "Ride back and transfer",
        description: "Back across the sand at an easy pace, then straight to your hotel or on to the rest of your day.",
      },
    ],
    included: [
      "Camel and its handler for the full ride",
      "Private air-conditioned transfer from and back to your hotel",
      "All ride fees, service charges and taxes",
      "Your guide shooting photos on your own phone or camera",
      "Bottled water",
    ],
    goodToKnow: [
      "Sunrise and sunset are the two windows worth booking — midday is hot, flat-lit and busy.",
      "One hour is the standard ride; two hours takes you further out for a wider desert horizon.",
      "Long trousers and closed shoes are much more comfortable than shorts and sandals on a saddle.",
      "This ride runs on the open desert side of the plateau. If you also want to go inside the pyramid complex, we add the entrance ticket to your quote.",
      "Pairs naturally with a Giza day tour — the ride before the site, or after it.",
    ],
    destinations: ["Giza", "Cairo"],
  },
  {
    slug: "dahshur-village-farm-experience",
    title: "Village & Farm Experience in Dahshur",
    duration: "Full day (about 8 hours)",
    location: "Dahshur, Giza Governorate",
    rating: null,
    price: { amount: null },
    imageTone: "nile",
    image: unsplash("photo-1725958242753-34e7fe712c56"),
    imageCredit: credit(
      "Mohamad Sameh",
      "https://unsplash.com/photos/a-field-of-green-plants-in-a-muddy-area-vS_tzihh-e0"
    ),
    description:
      "A day in the farmland south of Cairo, in the village that sits beneath Sneferu's Bent and Red Pyramids. Tea on arrival, a walk through the fields, hands in the work, a home-cooked lunch at a family table — and two of Egypt's most important pyramids with almost nobody else at them.",
    steps: [
      {
        title: "8:00am pickup in Cairo",
        description: "Private transfer out through the southern suburbs into open farmland — about 40 minutes from Giza.",
      },
      {
        title: "Tea, and a walk through the fields",
        description:
          "You're welcomed with Egyptian tea, then walked out through the crops and date palms to see how the land is actually worked.",
      },
      {
        title: "Time on the farm",
        description:
          "Meet the animals, learn how the date harvest works, and try your hand at the local crafts — palm-leaf weaving is the one everyone ends up doing.",
      },
      {
        title: "Lunch at the farmhouse",
        description:
          "A home-cooked countryside meal at a family table: roast chicken or duck, seasonal mahshi, rice, salads and fruit. This is the part guests write to us about.",
      },
      {
        title: "The Bent and Red Pyramids",
        description:
          "Dahshur's two great pyramids — Sneferu's failed experiment and the correction that made Giza possible — usually with a fraction of Giza's crowd.",
      },
      {
        title: "Back in Cairo by around 4:00pm",
        description: "Return transfer to your hotel.",
      },
    ],
    included: [
      "Private air-conditioned transport from and back to Cairo or Giza",
      "English-speaking guide for the day",
      "Tea on arrival and the farm visit",
      "Hands-on activities with the family",
      "Home-cooked farmhouse lunch",
      "Dahshur site entrance fees",
    ],
    goodToKnow: [
      "Dahshur is around 40 minutes from Giza — this is a real day out, not a stop on the way to somewhere else.",
      "You can go down inside the Red Pyramid. The descent is steep, low-ceilinged and warm; it is entirely optional.",
      "This is a working village, so modest dress is appreciated.",
      "October to April is the comfortable season for a day spent mostly outdoors.",
      "Vegetarian and other dietary requirements are easy — tell us when you book so the family can cook for them.",
    ],
    destinations: ["Dahshur", "Giza", "Cairo"],
  },

  // ── Cairo ──────────────────────────────────────────────────────────────
  {
    slug: "nile-kayaking-cairo",
    title: "Kayaking on the Nile in Cairo",
    duration: "About 3 hours door to door (2 hours on the water)",
    location: "Maadi, Cairo",
    rating: null,
    price: { amount: null },
    imageTone: "nile",
    image: unsplash("photo-1591602419445-f423e67d101c"),
    imageCredit: credit(
      "Youhana Nassif",
      "https://unsplash.com/photos/white-concrete-building-near-body-of-water-during-daytime-dFRxv-4-GRA"
    ),
    description:
      "Cairo from water level, under your own paddle. Two hours on the Nile from the kayak club in Maadi — river islands, herons and egrets, feluccas going past, and a version of this city almost no visitor sees.",
    steps: [
      {
        title: "Pickup from your hotel",
        description: "Private transfer from central Cairo or Giza down to the kayak club on the Maadi corniche.",
      },
      {
        title: "Briefing and fitting",
        description:
          "Kayak, paddle and life jacket sized to you, then the safety briefing and a short technique session on the bank. No experience is assumed.",
      },
      {
        title: "Two hours on the river",
        description:
          "Out onto the Nile with a guide alongside you — past the green river islands, the birdlife that lives on them, and the corniche from an angle the traffic never gives you.",
      },
      {
        title: "Back to the club and transfer",
        description: "Return to the club, dry off, and a private transfer back to your hotel.",
      },
    ],
    included: [
      "Hotel pickup and return in a private air-conditioned vehicle",
      "Kayak, paddle and life jacket",
      "Instruction and full safety briefing",
      "A guide on the water with you throughout",
      "Bottled water",
    ],
    goodToKnow: [
      "No experience needed — this is flat water and the guide stays with you.",
      "Single and double kayaks are both available. Children can paddle in a double with an adult; tell us ages when you book.",
      "Early morning and late afternoon are the calmest and coolest slots, and the best light.",
      "Bring a change of clothes — you will get some water on you — and a dry bag or waterproof case for your phone.",
      "Cairo's a big city and the river runs through the middle of it: expect a working waterway, not wilderness.",
    ],
    destinations: ["Cairo"],
  },

  // ── Fayoum ─────────────────────────────────────────────────────────────
  {
    slug: "fayoum-desert-safari",
    title: "4×4 Desert Safari in Fayoum Oasis",
    duration: "Full day (about 10 hours from Cairo)",
    location: "Wadi El Rayan & Wadi El Hitan, Fayoum",
    rating: null,
    price: { amount: null },
    imageTone: "desert",
    image: unsplash("photo-1591055801290-a3a48a4a0ec5"),
    imageCredit: credit(
      "Youhana Nassif",
      "https://unsplash.com/photos/brown-rock-formation-under-blue-sky-during-daytime-k0cLVnF2Vsk"
    ),
    description:
      "Egypt's first natural protectorate, driven properly. Waterfalls in the middle of the desert, dunes you sandboard down, a lake that changes colour through the afternoon, and a UNESCO valley full of forty-million-year-old whales — all inside two and a half hours of Cairo.",
    steps: [
      {
        title: "Early departure from Cairo",
        description:
          "Out around 7:30am for the drive southwest — roughly two and a half hours, arriving early enough to have the day rather than the leftovers of it.",
      },
      {
        title: "Wadi El Rayan waterfalls",
        description:
          "Egypt's only natural waterfalls, where the upper lake spills into the lower one. Short walk, and the first proper look at the protectorate.",
      },
      {
        title: "Mudawara Mountain viewpoint",
        description: "Up to the panorama over the lakes and the desert behind them.",
      },
      {
        title: "Into the dunes by 4×4",
        description:
          "Switch to the desert driving proper — a run across the dunes with a driver who does this daily, then sandboards out at the top of a slope.",
      },
      {
        title: "Lunch at the Magic Lake",
        description:
          "The lake sits in a bowl of dunes and shifts colour as the light moves across it. Lunch here, and time to swim or just sit with it.",
      },
      {
        title: "Wadi El Hitan — the Valley of the Whales",
        description:
          "A UNESCO World Heritage site, and the reason palaeontologists know how whales left the land. Skeletons lie where they were found, on a marked trail, with a small museum at the entrance.",
      },
      {
        title: "Return to Cairo",
        description: "Back to your hotel in the evening.",
      },
    ],
    included: [
      "Private air-conditioned vehicle from Cairo and back",
      "4×4 with an experienced desert driver",
      "English-speaking guide",
      "Wadi El Rayan and Wadi El Hitan entrance fees",
      "Sandboards",
      "Lunch and bottled water",
    ],
    goodToKnow: [
      "Around two and a half hours each way — the driving is a real part of the day.",
      "Wadi El Hitan is a World Heritage site: you stay on the marked trail, and nothing gets picked up.",
      "Sandboarding needs no experience; you can sit down on the board if standing isn't your idea of fun.",
      "October to April is the comfortable season. Summer here is genuinely hot.",
      "Bring sun protection and something for your face — the dune driving raises dust.",
    ],
    destinations: ["Fayoum"],
  },
  {
    slug: "fayoum-overnight-camping",
    title: "Overnight Camping in Fayoum Oasis",
    duration: "2 days, 1 night",
    location: "Magic Lake & Wadi El Rayan, Fayoum",
    rating: null,
    price: { amount: null },
    imageTone: "desert",
    image: unsplash("photo-1714229727637-a5d2520320a0"),
    imageCredit: credit(
      "Kaŕeem Saleh",
      "https://unsplash.com/photos/a-car-is-parked-next-to-a-campfire-in-the-desert-LYKe6G6A06s"
    ),
    description:
      "The Fayoum safari, given the night it deserves. Everything the day trip covers, plus dinner over a fire in the dunes, a sky with nothing between you and it, and sunrise over the Magic Lake before anyone else arrives.",
    steps: [
      {
        title: "Day 1 — morning: out of Cairo, into the desert",
        description:
          "Early pickup and the drive to Fayoum. Breakfast in the desert — Bedouin tea, eggs, cheese, bread — then the first sandboarding run on the old safari track.",
      },
      {
        title: "Day 1 — Wadi El Hitan",
        description:
          "The Valley of the Whales and its museum: whale skeletons lying in the sand where they were excavated, on the UNESCO trail.",
      },
      {
        title: "Day 1 — afternoon: the Magic Lake",
        description:
          "4×4 across to the lake for a barbecue lunch, a boat out on the water, and more of the dunes that ring it.",
      },
      {
        title: "Day 1 — evening: camp",
        description:
          "Camp goes up as the light goes. Bedouin-style dinner around the fire, and then the part you came for: the sky, with Cairo's glow far enough away to stop mattering.",
      },
      {
        title: "Day 2 — sunrise and breakfast",
        description: "Up for first light over the dunes, then breakfast at camp.",
      },
      {
        title: "Day 2 — morning safari and Wadi El Rayan",
        description:
          "A second run through the desert, then Wadi El Rayan — the lakes, the waterfalls and a boat out on the water before the drive back to Cairo.",
      },
    ],
    included: [
      "Private air-conditioned transport from Cairo and back",
      "4×4 desert driving on both days",
      "Camping equipment — tent, mattress and blankets",
      "Barbecue lunch, Bedouin dinner at camp and breakfast",
      "Sandboards",
      "All entrance fees for Wadi El Hitan and Wadi El Rayan",
      "Your host and guide throughout",
    ],
    goodToKnow: [
      "Desert nights get cold from November to February — properly cold, not just cool. Bring layers.",
      "Camp facilities are basic by design: this is a desert camp, not a lodge.",
      "A head torch is worth more than a phone light out there.",
      "October to April is the season. Summer nights are pleasant but the days are punishing.",
      "The whole trip starts and ends at your Cairo hotel — no separate logistics to arrange.",
    ],
    destinations: ["Fayoum"],
  },
  {
    slug: "fayoum-stargazing",
    title: "Stargazing in Fayoum Oasis",
    duration: "Evening into the early hours, with an optional overnight",
    location: "Wadi El Hitan, Fayoum",
    rating: null,
    price: { amount: null },
    imageTone: "desert",
    image: unsplash("photo-1620029288530-4ff6a684e33d"),
    imageCredit: credit(
      "Sean Jahansooz",
      "https://unsplash.com/photos/brown-rocky-mountain-under-starry-night-poED7Zsm5n4"
    ),
    description:
      "A hundred and fifty kilometres from Cairo's light, over a UNESCO valley that keeps some of the darkest skies within reach of the capital. Dinner around a fire, then an astronomy guide walking you through what's actually overhead — the Milky Way's full arc, and planets you can find without a lens.",
    steps: [
      {
        title: "Afternoon departure from Cairo",
        description: "Out to Fayoum with enough time to reach the desert before the light goes.",
      },
      {
        title: "Sunset over the dunes",
        description: "The hour before dark, from a viewpoint over Wadi El Hitan.",
      },
      {
        title: "Dinner around the fire",
        description: "Bedouin-style dinner and tea while the sky darkens and the first stars come out.",
      },
      {
        title: "The sky, properly",
        description:
          "Your astronomy guide picks out constellations, planets and the Milky Way's arc with a laser pointer, and sets up the telescope for a closer look at whatever is up that night — Jupiter and its moons, Saturn's rings, the lunar terminator.",
      },
      {
        title: "Late return, or stay the night",
        description:
          "Drive back to Cairo in the small hours, or stay at the desert camp and add sunrise and a morning safari to the trip.",
      },
    ],
    included: [
      "Private air-conditioned transport from Cairo",
      "Astronomy guide for the night",
      "Telescope viewing, weather permitting",
      "Bedouin dinner and tea around the fire",
      "Seating and blankets",
      "Wadi El Hitan entrance fees",
    ],
    goodToKnow: [
      "Book around a new moon. A full moon washes the Milky Way out completely, and no guide can fix that.",
      "October to March gives the clearest, most comfortable nights.",
      "It gets cold after dark in the desert in every season — bring more than you think.",
      "White light ruins everyone's night vision, including yours: phone torches and camera flashes stay off at the viewing spot.",
      "High cloud or wind can cancel telescope viewing. We'll tell you honestly on the day rather than drive you out for nothing.",
    ],
    destinations: ["Fayoum"],
  },
  {
    slug: "fayoum-kayaking",
    title: "Kayaking in Fayoum Oasis",
    duration: "Half day, or added to a Fayoum day tour",
    location: "Magic Lake & Lake Qarun, Fayoum",
    rating: null,
    price: { amount: null },
    imageTone: "desert",
    image: unsplash("photo-1648512805688-08129d81db61"),
    imageCredit: credit(
      "Omar Elbadry",
      "https://unsplash.com/photos/an-aerial-view-of-a-desert-with-a-body-of-water-cQ2wSTjnhxE"
    ),
    description:
      "Flat, sheltered desert water with dunes running straight down into it. An hour or two of paddling on the Magic Lake or Lake Qarun — the quietest way to see the Fayoum lakes, and the easiest thing in the world to add to a safari day.",
    steps: [
      {
        title: "Transfer to the lakeshore",
        description: "Down to the water — the Magic Lake inside Wadi El Rayan, or Lake Qarun below Tunis Village.",
      },
      {
        title: "Briefing and fitting",
        description: "Kayak, paddle and life jacket, and a short session on the bank before you get in.",
      },
      {
        title: "Out on the water",
        description:
          "Paddling the shoreline with a guide, along dunes that come right down to the waterline and past the birdlife the lakes draw in.",
      },
      {
        title: "Beach stop",
        description:
          "Pull in on the sand for a swim, or a sandboard down the dune above the lake if you've got the legs left for the climb.",
      },
    ],
    included: [
      "Kayak, paddle and life jacket",
      "A guide on the water with you",
      "Transfers within Fayoum",
      "Wadi El Rayan entrance fees",
      "Bottled water",
    ],
    goodToKnow: [
      "Flat, sheltered water — no experience needed, and the guide stays with you.",
      "Mornings are calmer; the wind usually gets up across the lakes in the afternoon.",
      "It pairs naturally with the 4×4 safari on the same day — paddle in the morning, dunes after lunch.",
      "October to April is the comfortable season.",
      "Bring something you can swim in and a change of clothes.",
    ],
    destinations: ["Fayoum"],
  },
  {
    slug: "tunis-village-pottery",
    title: "Pottery Experience in Tunis Village, Fayoum",
    duration: "About 2 hours at the wheel",
    location: "Tunis Village, above Lake Qarun, Fayoum",
    rating: null,
    price: { amount: null },
    imageTone: "desert",
    image: unsplash("photo-1595351298020-038700609878"),
    imageCredit: credit(
      "Taylor Heery",
      "https://unsplash.com/photos/pottery-wheel-with-clay-and-tools-ZSgWcW70cTs"
    ),
    description:
      "Tunis Village sits on a ridge above Lake Qarun and is, improbably, Egypt's pottery capital — the result of a school the Swiss potter Evelyne Porret founded here in 1980 and the hundred-odd local potters who trained in it. You spend two hours at a wheel with one of them.",
    steps: [
      {
        title: "Arrive in the village",
        description:
          "Up onto the ridge above Lake Qarun, into a village of mud-brick houses, studios and gardens that grew around its craft rather than around a road.",
      },
      {
        title: "Walk the studios",
        description:
          "Watch working potters throw and paint the bold, unmistakable Fayoum designs, and see what a piece looks like at each stage.",
      },
      {
        title: "At the wheel",
        description:
          "Two hours with a local potter: centring the clay, opening it, pulling the walls up. Beginners are the normal case here, not the exception.",
      },
      {
        title: "Paint and finish",
        description: "Decorate what you've made, and hand it over to be dried and fired.",
      },
      {
        title: "Lunch over the lake",
        description: "Food and tea at one of the village's eco-lodges, looking out over Lake Qarun.",
      },
    ],
    included: [
      "Private transport within Fayoum",
      "The workshop with a working local potter",
      "Clay, tools and use of the wheel",
      "Firing of your piece, with collection or shipping arranged",
      "Studio visits around the village",
      "Bottled water",
    ],
    goodToKnow: [
      "Complete beginners are the norm — this is a first-time class, not a masterclass.",
      "Around two hours at the wheel. Wear something you don't mind getting clay on.",
      "A thrown piece has to dry and be fired before it can travel, so we arrange collection on your way back through, or shipping.",
      "The village came out of the pottery school Evelyne Porret founded in 1980; the school is still there.",
      "It pairs naturally with a Fayoum day tour or an overnight in the village's eco-lodges.",
    ],
    destinations: ["Fayoum"],
  },

  // ── Ain Sokhna ─────────────────────────────────────────────────────────
  {
    slug: "ain-sokhna-private-yacht",
    title: "Private Yacht Experience in Ain Sokhna",
    duration: "Full day (about 10 hours from Cairo)",
    location: "Ain Sokhna Marina, Red Sea",
    rating: null,
    price: { amount: null },
    imageTone: "redsea",
    image: unsplash("photo-1715418194869-c612936d1fbe"),
    imageCredit: credit(
      "Kevin Woblick",
      "https://unsplash.com/photos/a-white-boat-floating-on-top-of-a-large-body-of-water-A8FmAfEypS0"
    ),
    description:
      "The Red Sea is ninety minutes from Cairo, and a chartered yacht turns that into a full day on the water with nobody else's group on the deck. Cruise the Sokhna coastline, anchor somewhere clear enough to see the bottom, swim, eat lunch the crew cooked, and be back in the city by evening.",
    steps: [
      {
        title: "Morning pickup in Cairo",
        description: "Private air-conditioned car from your hotel, and the drive east through the desert — around ninety minutes.",
      },
      {
        title: "Board at Ain Sokhna Marina",
        description: "The yacht is yours for the day. Crew briefing, and you're out of the marina.",
      },
      {
        title: "Cruise the coastline",
        description: "Along the Sokhna coast with the Red Sea mountains on one side and open water on the other.",
      },
      {
        title: "Anchor, swim, snorkel",
        description:
          "The crew picks a bay with clear water and drops anchor. Snorkelling gear is on board; the ladder goes down; the day slows right down.",
      },
      {
        title: "Lunch on board",
        description: "Cooked and served on the yacht, at anchor.",
      },
      {
        title: "Sun deck and the run back",
        description: "The afternoon on the deck, then back into the marina and the drive to Cairo.",
      },
    ],
    included: [
      "Private chartered yacht with crew — your group only",
      "Door-to-door private transfers from Cairo and back",
      "Lunch prepared and served on board",
      "Snorkelling equipment",
      "Bottled water and soft drinks",
      "Shaded seating and a sun deck",
    ],
    goodToKnow: [
      "Around ninety minutes each way from Cairo, which is what makes this a day trip rather than an overnight.",
      "The charter is private: no shared decks and no fixed group schedule.",
      "Runs year-round; March to November is the warmest water.",
      "Bring a towel and reef-safe sunscreen.",
      "Sea conditions decide the anchoring spot on the day — the crew will pick the sheltered option.",
      "Birthdays, proposals and small celebrations are easy to set up on board. Tell us in advance.",
    ],
    destinations: ["Ain Sokhna", "Red Sea"],
  },

  // ── Luxor ──────────────────────────────────────────────────────────────
  {
    slug: "luxor-hot-air-balloon",
    title: "Hot Air Balloon Experience in Luxor",
    duration: "About 4 hours door to door (45–60 minutes airborne)",
    location: "Luxor West Bank",
    rating: null,
    price: { amount: null },
    imageTone: "luxor",
    image: unsplash("photo-1703902770170-7cc56c8c3067"),
    imageCredit: credit(
      "Hongbin",
      "https://unsplash.com/photos/a-hot-air-balloon-flying-over-a-lush-green-field-DWd6P-g12aE"
    ),
    description:
      "Sunrise over the Theban necropolis, from a basket. Hatshepsut's terraces cut into the cliff, Medinet Habu, the Colossi of Memnon, and the hard green line where the floodplain stops and the desert starts — an hour of the West Bank laid out the way the maps draw it.",
    steps: [
      {
        title: "Around 4:00am — pickup",
        description: "Collected from your Luxor hotel or Nile cruise boat in the dark.",
      },
      {
        title: "Cross the Nile",
        description: "By motorboat to the West Bank, then a short drive out to the launch field.",
      },
      {
        title: "Inflation and briefing",
        description:
          "Tea and coffee while the envelope fills — about twenty minutes — and the pilot's safety briefing. You board as the sky starts to change.",
      },
      {
        title: "Lift off",
        description:
          "Forty-five minutes to an hour over the West Bank as the sun comes up: the mortuary temples, the farmland, the villages waking up, the cliffs behind the Valley of the Kings.",
      },
      {
        title: "Landing and certificate",
        description: "The chase crew meets the basket. Flight certificate, and a transfer back to your hotel — or straight on to the West Bank sites.",
      },
    ],
    included: [
      "Hotel or cruise-boat pickup and return",
      "Motorboat crossing to the West Bank",
      "Light refreshments before the flight",
      "The flight, with a pilot licensed by the Egyptian Civil Aviation Authority",
      "Flight certificate",
      "All fees and taxes",
    ],
    goodToKnow: [
      "Flights are at dawn only, and pickup is around 4:00am. There is no later option.",
      "The Egyptian Civil Aviation Authority grounds the whole field when surface winds go above roughly 8–12 mph. A cancelled flight is rescheduled or refunded — it is never flown through.",
      "The wind picks the route. Hatshepsut's temple and the Colossi of Memnon are near-certain; the Valley of the Kings is likely but genuinely not guaranteed, and any operator promising it is guessing.",
      "You stand for the flight, and helmets are worn for landing.",
      "It is cold before sunrise even in summer — bring a layer you can take off later.",
      "Basket sizes vary a lot between operators. We book the smaller baskets.",
    ],
    destinations: ["Luxor"],
  },

  // ── Aswan ──────────────────────────────────────────────────────────────
  {
    slug: "nubian-village-aswan",
    title: "Nubian Village Visit in Aswan",
    duration: "Half day (about 3–4 hours)",
    location: "Gharb Soheil, Soheil Island, Aswan",
    rating: null,
    price: { amount: null },
    imageTone: "nile",
    image: unsplash("photo-1657569802830-53d59cbc708f"),
    imageCredit: credit(
      "Thales Botelho de Sousa",
      "https://unsplash.com/photos/a-colorful-building-with-a-blue-roof-Cb3lVbvmegc"
    ),
    description:
      "Upriver from Aswan by motorboat to Gharb Soheil, where the houses are painted indigo, ochre and rose, and the Nubian language is still the one spoken at home. Tea in a family house, a walk through the lanes, and the boat ride back down the river as the light goes.",
    steps: [
      {
        title: "Pickup and board",
        description: "Collected from your hotel or cruise boat and down to the water at Aswan.",
      },
      {
        title: "Upriver by motorboat",
        description:
          "Past Elephantine Island, the Aga Khan Mausoleum on the west bank and the Botanical Garden, threading between the black granite outcrops and small islands that make this stretch of the Nile look like nowhere else on it.",
      },
      {
        title: "Tea in a Nubian home",
        description:
          "A welcome in a family house, with time to actually ask about it — the language, why the houses are built and painted the way they are, and the resettlement that moved these communities when the High Dam went up.",
      },
      {
        title: "Walk the village",
        description: "Through the painted lanes, the spice and craft stalls, and down to the sand at the river's edge.",
      },
      {
        title: "Back downriver",
        description: "The boat home, timed for sunset on the water if you go in the afternoon.",
      },
    ],
    included: [
      "Hotel or cruise-boat pickup and return",
      "Private motorboat both ways",
      "English-speaking guide",
      "Tea and a welcome in a Nubian family home",
      "Entrance fees",
      "Bottled water",
    ],
    goodToKnow: [
      "Late afternoon is the best of it — cooler, better light, and it puts you on the river for sunset.",
      "This is people's home, not an attraction. Modest dress, and ask before photographing anyone.",
      "Some houses keep young crocodiles in tanks. If you'd rather not, say so and we'll route around it.",
      "Bring small notes if you want to buy from the craft stalls — cards aren't taken.",
      "Around three to four hours door to door.",
    ],
    destinations: ["Aswan"],
  },
  {
    slug: "abu-simbel-excursion-aswan",
    title: "Abu Simbel Excursion from Aswan",
    duration: "Full day (about 8–10 hours)",
    location: "Abu Simbel, 280 km south of Aswan",
    rating: null,
    price: { amount: null },
    imageTone: "desert",
    image: unsplash("photo-1702909171830-2c4dca2ac090"),
    imageCredit: credit(
      "Michael Starkie",
      "https://unsplash.com/photos/an-image-of-an-ancient-building-in-the-desert-jKbHZwXIVcg"
    ),
    description:
      "Four seated colossi of Ramesses II, twenty metres high, cut into a cliff at the far southern edge of Egypt — then sawn into a thousand blocks in the 1960s and rebuilt sixty metres higher to keep Lake Nasser off them. It is the single most impressive thing in the country, and it is a long way to go. Worth every hour.",
    steps: [
      {
        title: "Pre-dawn departure from Aswan",
        description:
          "Out around 3:00–3:30am with the escorted convoy. The desert road south doesn't open before then, so this start time isn't negotiable.",
      },
      {
        title: "Across the Western Desert",
        description: "Around three and a half hours, with the sun coming up somewhere in the middle of it.",
      },
      {
        title: "The Great Temple of Ramesses II",
        description:
          "The four colossi, the hypostyle hall with its Osiride pillars, the battle reliefs of Kadesh, and the sanctuary at the back where the sun reaches twice a year.",
      },
      {
        title: "The Temple of Nefertari",
        description:
          "The smaller temple next door, dedicated to Hathor and to Ramesses' queen — the rare Egyptian temple where the queen is carved at the same scale as the king.",
      },
      {
        title: "The relocation cut",
        description:
          "Behind the temples, the artificial dome and the joins in the stone where UNESCO's 1960s rescue put it all back together. Once you've seen it you can't unsee it.",
      },
      {
        title: "Return convoy to Aswan",
        description: "Back across the desert, arriving Aswan in the afternoon.",
      },
    ],
    included: [
      "Private air-conditioned vehicle and driver",
      "Egyptologist guide",
      "Abu Simbel entrance fees",
      "Hotel-packed breakfast box for the early start",
      "Bottled water",
    ],
    goodToKnow: [
      "Departure is around 3:00–3:30am with the police-escorted convoy. There is a later convoy around 11:00am if that start is impossible.",
      "Roughly three and a half hours each way, and about two hours at the site. It is a long day and there's no way to shorten the road.",
      "Flying Aswan–Abu Simbel halves the day. Ask and we'll price both.",
      "On 22 February and 22 October the sunrise reaches into the sanctuary. Those two dates book out months ahead.",
      "Photography rules inside the temples change from season to season — your guide will tell you what's current on the day.",
    ],
    destinations: ["Abu Simbel", "Aswan"],
  },

  // ── Hurghada ───────────────────────────────────────────────────────────
  {
    slug: "giftun-island-yacht-trip",
    title: "Giftun Island Yacht Trip in Hurghada",
    duration: "Full day (about 8 hours)",
    location: "Giftun Island National Park (Mahmya), Hurghada",
    rating: null,
    price: { amount: null },
    imageTone: "redsea",
    image: unsplash("photo-1738935457539-936fdb320c51"),
    imageCredit: credit(
      "Jametlene Reskp",
      "https://unsplash.com/photos/a-boat-traveling-down-a-river-next-to-a-beach-ohWRAy2qv2c"
    ),
    description:
      "An hour out of Hurghada to the Giftun Island National Park, and the white sand of Mahmya on its southern shore — the beach the Red Sea postcards are usually of. Reef stops on the way, a lagoon shallow and clear enough to snorkel straight off the sand, and lunch at the beach restaurant.",
    steps: [
      {
        title: "Hotel pickup in Hurghada",
        description: "Transfer to the marina and boarding.",
      },
      {
        title: "An hour out to the park",
        description: "Sailing to the Giftun Island National Park — the time depends on weather, sea state and marina traffic.",
      },
      {
        title: "First reef stop",
        description: "In off the boat over the coral, with a guide in the water and gear provided.",
      },
      {
        title: "Ashore at Mahmya",
        description:
          "The boat moors at fixed buoys and a tender takes you in — that's how the reef here is protected. White sand, shade, and a lagoon you can snorkel from the beach.",
      },
      {
        title: "Lunch and the afternoon",
        description: "Lunch at the island restaurant, then the rest of the afternoon in the water or out of it.",
      },
      {
        title: "Sail back into Hurghada",
        description: "Return crossing and transfer to your hotel.",
      },
    ],
    included: [
      "Hotel pickup and return in Hurghada",
      "The boat and its crew",
      "Mask, fins and life jacket",
      "A snorkelling guide in the water with the group",
      "Lunch at the island",
      "Soft drinks and bottled water",
      "National park and marine fees",
    ],
    goodToKnow: [
      "Around an hour each way, weather and marina traffic depending.",
      "Boats moor at fixed buoys and you go ashore by tender. That's the reef protection rule for the national park, not an upsell.",
      "Reef-safe sunscreen only, and don't stand on the coral — it's alive and it doesn't grow back quickly.",
      "The island has shade, a restaurant and a bar; you don't need to carry a day's food out.",
      "Confident swimmers and complete beginners both work — the guide stays with the group and life jackets are there for anyone who wants one.",
    ],
    destinations: ["Hurghada", "Red Sea"],
  },
  {
    slug: "orange-bay-yacht-trip",
    title: "Orange Bay Yacht Trip in Hurghada",
    duration: "About 7 hours",
    location: "Orange Bay, Giftun Island, Hurghada",
    rating: null,
    price: { amount: null },
    imageTone: "redsea",
    image: unsplash("photo-1722264222007-3e4f1808db3e"),
    imageCredit: credit(
      "Bahaa Mourad",
      "https://unsplash.com/photos/a-birds-eye-view-of-a-resort-on-the-water-4wB6TZFvMHQ"
    ),
    description:
      "The shallow, absurdly clear turquoise strip on Giftun's northern side, with two reef stops on the way out. Shorter and gentler than the Mahmya day — the water at Orange Bay stays waist-deep a long way out, which makes it the easy one for families and non-swimmers.",
    steps: [
      {
        title: "8:30am hotel pickup",
        description: "Transfer to the marina and boarding.",
      },
      {
        title: "Out from Hurghada",
        description: "Forty-five minutes to an hour across to the island.",
      },
      {
        title: "Two snorkelling stops",
        description: "Two separate reefs on the way, with gear and a guide in the water.",
      },
      {
        title: "Ashore at Orange Bay",
        description:
          "Around two hours on the sandbar: white sand, water that stays shallow and clear a long way out, and the photographs everyone comes back with.",
      },
      {
        title: "Buffet lunch on board",
        description: "Open buffet served on the boat, with soft drinks.",
      },
      {
        title: "Sail back",
        description: "Return crossing and transfer to your hotel.",
      },
    ],
    included: [
      "Hotel pickup and return in Hurghada",
      "The boat and its crew",
      "Two guided snorkelling stops",
      "Masks and life jackets",
      "Open buffet lunch on board",
      "Soft drinks and bottled water",
      "Orange Bay island access fee",
    ],
    goodToKnow: [
      "Forty-five to sixty minutes each way, and around two hours on the island.",
      "The shallow, clear water is the whole point — this is the trip for families, nervous swimmers and anyone who wants the photo without the depth.",
      "Shade on the sandbar is limited. Bring a hat, and reef-safe sunscreen.",
      "Do Orange Bay and Giftun/Mahmya on separate days rather than trying to combine them — they're different trips to different sides of the same island.",
    ],
    destinations: ["Hurghada", "Red Sea"],
  },

  // ── Marsa Alam ─────────────────────────────────────────────────────────
  {
    slug: "dolphin-house-marsa-alam",
    title: "Dolphin House Trip in Marsa Alam",
    duration: "Full day (about 8 hours)",
    location: "Sataya Reef (Dolphin House), off Hamata",
    rating: null,
    price: { amount: null },
    imageTone: "redsea",
    image: unsplash("photo-1755335883209-4f9dfcb90935"),
    imageCredit: credit(
      "dani grau",
      "https://unsplash.com/photos/a-dolphin-swims-in-clear-blue-ocean-water-15awH_sbwM4"
    ),
    description:
      "Sataya Reef, two and a half hours out of Hamata, is a resting lagoon for a resident pod of spinner dolphins — commonly counted at sixty to eighty animals. You snorkel the reef, you eat lunch at anchor, and if the pod is resting shallow, you get into the water quietly and let them decide.",
    steps: [
      {
        title: "Early pickup from your hotel",
        description: "Around 5:00am, for the drive south along the coast to Hamata port.",
      },
      {
        title: "Board around 7:30am",
        description: "Onto the boat at Hamata and out through the reef channel.",
      },
      {
        title: "Two and a half hours to Sataya",
        description: "The crossing out to Shaab Sataya — open water, and the reason this is a full day.",
      },
      {
        title: "The lagoon",
        description:
          "Snorkelling over the reef inside the horseshoe, and time in the water where the pod rests. Your guide decides when and where you get in.",
      },
      {
        title: "Lunch at anchor",
        description: "Cooked on board and served in the lagoon.",
      },
      {
        title: "Second reef stop, then home",
        description: "A second stop on the way back, then the crossing to Hamata and the transfer to your hotel.",
      },
    ],
    included: [
      "Hotel pickup and return",
      "The boat and its crew",
      "Mask, fins and life jacket",
      "A guide in the water with the group",
      "Lunch on board",
      "Unlimited soft drinks, tea and bottled water",
      "Marine park fees",
    ],
    goodToKnow: [
      "The pod is resident and operators put the chance of seeing them at roughly 90%. Seeing them is likely. Swimming near them is not guaranteed, and nobody honest will promise it.",
      "These are wild animals resting during the day. You enter the water quietly, you never chase, touch or feed them, and the guide decides when the group gets in — that's the rule that keeps the pod coming back.",
      "Pickup is around 5:00am and the crossing is two to two and a half hours each way.",
      "The open water can be choppy. Take something for seasickness before you board if you're prone to it.",
      "Reef-safe sunscreen, and a rash vest beats reapplying sunscreen all day.",
    ],
    destinations: ["Marsa Alam", "Red Sea"],
  },

  // ── Sinai ──────────────────────────────────────────────────────────────
  {
    slug: "mount-sinai-climb",
    title: "Mount Sinai Climbing Experience from Saint Catherine",
    duration: "Overnight climb, with the monastery in the morning",
    location: "Mount Sinai & St Catherine's Monastery, South Sinai",
    rating: null,
    price: { amount: null },
    imageTone: "desert",
    image: unsplash("photo-1663179739869-2ee1b4754952"),
    imageCredit: credit(
      "Ahmad Ajmi",
      "https://unsplash.com/photos/a-group-of-people-hiking-in-the-desert-65v9pQuCEqc"
    ),
    description:
      "You set off at two in the morning with a Bedouin guide, walk up the camel path by torchlight for three hours, climb the last seven hundred and fifty stone steps, and sit down in the cold to wait for the sun to come up over the Sinai range. Afterwards, St Catherine's Monastery — the oldest continuously inhabited Christian monastery on earth.",
    steps: [
      {
        title: "Around 2:00am — set off",
        description: "From the monastery car park with your Bedouin mountain guide, by head torch.",
      },
      {
        title: "The camel path",
        description:
          "Two and a half to three and a half hours of steady switchbacks up the gentler of the two routes, with Bedouin tea huts along the way to stop at.",
      },
      {
        title: "The Steps of Repentance",
        description:
          "The last stretch to the summit is seven hundred and fifty stone steps, cut by monks. Everyone walks these — no camel goes up them.",
      },
      {
        title: "Sunrise from the summit",
        description: "The wait in the cold, and then the light coming up across the Sinai peaks. This is the part people describe years later.",
      },
      {
        title: "Down the full staircase",
        description:
          "The descent takes the Steps of Repentance the whole way — around three thousand seven hundred and fifty of them, down through the Elijah Basin. Different scenery, and much harder on the knees.",
      },
      {
        title: "St Catherine's Monastery",
        description:
          "Breakfast, then the monastery: the site of the Burning Bush, the basilica, and one of the oldest continuously used libraries in the world.",
      },
    ],
    included: [
      "Transfers to and from St Catherine",
      "A licensed Bedouin mountain guide",
      "Mount Sinai climbing permit",
      "St Catherine's Monastery visit",
      "Blankets for the summit wait",
      "Tea stops on the mountain",
    ],
    goodToKnow: [
      "The climb starts around 2:00am so you're on the summit before first light. There is no daytime version of this that ends in a sunrise.",
      "Two and a half to three and a half hours up. Most people go up the camel path and come down the roughly 3,750 Steps of Repentance.",
      "A camel can carry you most of the way up the path, but not the final 750 steps. Everyone walks those.",
      "It is genuinely cold on the summit before dawn, in every season, and you'll be sitting still while you wait.",
      "Proper closed walking shoes, a head torch, water and warm layers. Trainers and a phone light are how people get hurt on the descent.",
      "The monastery keeps its own opening hours and is closed to visitors on certain days. We build the trip around a day it's open.",
    ],
    destinations: ["Saint Catherine", "Sinai"],
  },

  // ── Bahariya & the White Desert ─────────────────────────────────────────
  {
    slug: "white-desert-overnight-camping",
    title: "White Desert Overnight Camping from Bahariya Oasis",
    duration: "2 days, 1 night",
    location: "White Desert National Park, via Bahariya Oasis",
    rating: null,
    price: { amount: null },
    imageTone: "desert",
    image: unsplash("photo-1643236312558-2725e111238b"),
    imageCredit: credit(
      "hany mohamed",
      "https://unsplash.com/photos/a-group-of-tents-sitting-on-top-of-a-sandy-beach-ObWXbck8cBY"
    ),
    description:
      "Chalk formations wind-carved into mushrooms, towers and animals, standing white against orange sand — and you sleep in the middle of them. The route out crosses the black volcanic hills of the Black Desert, stops at Crystal Mountain and drops into the Valley of Agabat before camp goes up at sunset.",
    steps: [
      {
        title: "Day 1 — Cairo to Bahariya",
        description: "The drive west across the desert to Bawiti, the oasis town, and lunch on arrival.",
      },
      {
        title: "Day 1 — into the 4×4",
        description: "Swap the road vehicle for a Land Cruiser and a driver who knows this desert. From here there's no more tarmac.",
      },
      {
        title: "Day 1 — the Black Desert",
        description: "Hills capped in black volcanic dolerite, in a landscape that looks burnt from a distance.",
      },
      {
        title: "Day 1 — a spring at Al-Haze",
        description: "A stop at the Bedouin village and its natural spring, under the palms.",
      },
      {
        title: "Day 1 — Crystal Mountain and Agabat",
        description:
          "A ridge shot through with quartz crystal, and then the Valley of Agabat, where white chalk sits on orange dune — the best landscape of the trip and everybody's photo stop.",
      },
      {
        title: "Day 1 — camp in the White Desert",
        description:
          "Sandboarding on the way in, then camp among the chalk formations. Dinner over the fire, and a sky with nothing under it for a hundred kilometres.",
      },
      {
        title: "Day 2 — sunrise and the drive home",
        description:
          "First light turns the chalk pink and gold. Breakfast at camp, a last run through the formations in the morning light, then back via Bahariya to Cairo.",
      },
    ],
    included: [
      "Private air-conditioned transport from Cairo to Bahariya and back",
      "4×4 with an experienced desert driver",
      "Camping equipment — tent or open-air bedding, mattress and blankets",
      "Lunch on the way, dinner at camp and breakfast",
      "National park entry",
      "Guide throughout",
    ],
    goodToKnow: [
      "Around four hours' drive each way from Cairo, before the desert driving starts.",
      "The White Desert is a protected national park. Nothing gets taken out of it and nothing gets left in it — the chalk formations are fragile and slow to form.",
      "Desert nights from November to February get close to freezing. Layers, a warm jacket, and a hat.",
      "Camp facilities are basic and there is no phone signal for most of it. That's the trip, not a shortcoming.",
      "October to April is the season.",
      "It can be extended to two nights to take in Farafra and more of the formations.",
    ],
    destinations: ["Bahariya Oasis", "White Desert"],
  },

  // ── Siwa ───────────────────────────────────────────────────────────────
  {
    slug: "siwa-salt-lakes",
    title: "Salt Lakes Swimming & Floating Experience in Siwa Oasis",
    duration: "1–2 hours at the lakes, within a Siwa day",
    location: "Siwa Oasis salt lakes, Western Desert",
    rating: null,
    price: { amount: null },
    imageTone: "desert",
    image: unsplash("photo-1529552193644-4e183c169aeb"),
    imageCredit: credit(
      "Benjamín Gremler",
      "https://unsplash.com/photos/person-wearing-black-shirt-sitting-near-blue-hole-under-blue-sky-during-daytime-p4gSbebmxeY"
    ),
    description:
      "Turquoise pools rimmed in white crystal, out in the desert west of Siwa town. The water is salt-saturated: you get in, lie back and float, and there is nothing you can do about it. Ninety minutes here is one of the strangest and best hours in Egypt.",
    steps: [
      {
        title: "Out to the lakes",
        description: "A short drive from Siwa town to the salt pools — old salt workings, flooded and gone an improbable colour.",
      },
      {
        title: "In the water",
        description:
          "The salt does the work. You float without swimming, and staying upright is harder than lying back. Most people spend an hour or two between the water and the crystal shore.",
      },
      {
        title: "Rinse off",
        description: "The salt dries white on your skin within minutes, so a freshwater rinse is part of the stop, not an afterthought.",
      },
      {
        title: "On to Cleopatra's Spring",
        description: "A freshwater pool to swim off the last of the salt, in the palm groves outside town.",
      },
      {
        title: "The rest of the Siwa day",
        description:
          "Shali Fortress's mud-brick ruin, the Temple of the Oracle that Alexander came to consult, and sunset from Fatnas Island over Lake Siwa.",
      },
    ],
    included: [
      "Private transport within Siwa",
      "Local guide",
      "A freshwater rinse stop and towels",
      "Entrance fees for the sites in your Siwa day",
      "Bottled water",
    ],
    goodToKnow: [
      "The water is salt-saturated — you float without effort and you cannot really sink.",
      "The crusted edges are sharp underfoot. Water shoes are genuinely worth packing.",
      "Don't put your face in and don't swallow it. If you splash your eyes, rinse them with fresh water straight away.",
      "Don't shave the day you swim. Any small cut will make itself known.",
      "One to two hours is right, and pairing it with Cleopatra's Spring gives you the freshwater rinse.",
      "Siwa is a long way west of everything — most people come on a two- or three-night trip rather than a day trip.",
    ],
    destinations: ["Siwa Oasis", "Siwa"],
  },
];

// The destination groups /experiences is organised into, in the order they're
// shown. `match` is compared against an activity's FIRST `destinations` tag —
// first tag wins, so an activity tagged ["Giza", "Cairo"] groups under Giza
// rather than being pulled into Cairo by its second tag. Anything whose first
// tag matches nothing here falls into a final "More experiences" group rather
// than disappearing, so adding an activity can never silently hide it.
export const activityDestinationGroups: {
  key: string;
  name: string;
  blurb: string;
  match: string[];
}[] = [
  {
    key: "cairo",
    name: "Cairo",
    blurb: "On and around the Nile in the middle of the city — the things to do between the museums.",
    match: ["Cairo"],
  },
  {
    key: "giza",
    name: "Giza & Dahshur",
    blurb: "The pyramid plateau, and the quieter farmland and older pyramids just south of it.",
    match: ["Giza", "Dahshur"],
  },
  {
    key: "fayoum",
    name: "Fayoum Oasis",
    blurb:
      "Two and a half hours from Cairo: desert lakes, waterfalls, a UNESCO valley full of fossil whales, and Egypt's pottery village.",
    match: ["Fayoum"],
  },
  {
    key: "ain-sokhna",
    name: "Ain Sokhna",
    blurb: "The nearest stretch of Red Sea to Cairo — close enough to be a day out.",
    match: ["Ain Sokhna"],
  },
  {
    key: "luxor",
    name: "Luxor",
    blurb: "The West Bank and the Theban necropolis, from the ground and from the air.",
    match: ["Luxor"],
  },
  {
    key: "aswan",
    name: "Aswan & Abu Simbel",
    blurb: "The Nubian south: painted villages on the river, and Ramesses II's temples near the Sudanese border.",
    match: ["Aswan", "Abu Simbel"],
  },
  {
    key: "hurghada",
    name: "Hurghada",
    blurb: "Island days on the Red Sea — reefs, sandbars and the boats that get you to them.",
    match: ["Hurghada"],
  },
  {
    key: "marsa-alam",
    name: "Marsa Alam",
    blurb: "Further south, quieter, and the best place in Egypt to share water with wild dolphins.",
    match: ["Marsa Alam"],
  },
  {
    key: "sinai",
    name: "Sinai",
    blurb: "The mountain, the sunrise, and the oldest continuously inhabited monastery in the world.",
    match: ["Saint Catherine", "Sinai", "Sharm El Sheikh", "Dahab"],
  },
  {
    key: "western-desert",
    name: "Bahariya & the White Desert",
    blurb: "Black volcanic hills, quartz ridges and white chalk formations you sleep in the middle of.",
    match: ["Bahariya Oasis", "White Desert"],
  },
  {
    key: "siwa",
    name: "Siwa Oasis",
    blurb: "Right out west by the Libyan border — salt lakes, springs, and a fortress made of salt and mud.",
    match: ["Siwa Oasis", "Siwa"],
  },
];
