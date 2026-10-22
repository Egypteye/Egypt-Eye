import type { Experience, ExperienceTheme } from "./types";
import { unsplashCredit, unsplashUrl } from "./unsplash";

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

// Shared with the homepage destination tiles — see ./unsplash.ts.
const unsplash = unsplashUrl;
const credit = unsplashCredit;

export const activities: Experience[] = [
  // ── Giza ───────────────────────────────────────────────────────────────
  {
    slug: "camel-ride-giza-pyramids",
    physicalLevel: {
      tier: "moderate",
      note:
        "Mounting a kneeling camel and an hour or two in the saddle on soft sand. Long trousers and closed shoes are considerably more comfortable than shorts and sandals.",
    },
    title: "Camel Ride at the Pyramids of Giza",
    duration: "1–2 hours",
    location: "Giza Plateau, Giza",
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
    physicalLevel: {
      tier: "moderate",
      note:
        "A full day of village walking on dirt paths and farm ground, with hands-on work at a real farm. Going down inside the Red Pyramid is steep, low-ceilinged and warm — and completely optional.",
    },
    title: "Village & Farm Experience in Dahshur",
    // Deliberately no hour count. The day can end at the farmhouse in the
    // afternoon or run through the sunset outing and the evening gathering,
    // and those depend on the season and the farm's own programme — so an
    // "about 8 hours" here would be wrong half the time. See goodToKnow.
    duration: "Full day",
    location: "Saqqara Tourist Road, Dahshur, near the Dahshur Pyramid entrance",
    price: { amount: null },
    imageTone: "nile",
    image: unsplash("photo-1725958242753-34e7fe712c56"),
    imageCredit: credit(
      "Mohamad Sameh",
      "https://unsplash.com/photos/a-field-of-green-plants-in-a-muddy-area-vS_tzihh-e0"
    ),
    description:
      "A full day of rural Egyptian life in the farming village beneath Sneferu's Bent and Red Pyramids. Bread baked in a wood-fired oven, a guided walk through the crops and the date palms, hands in the work — planting, pottery, a donkey ride — and a long countryside meal at a family table. It can be run on its own, or combined with Dahshur's two pyramids and the necropolis of Saqqara as one private day.",
    steps: [
      {
        title: "Early pickup in Cairo or Giza",
        description:
          "Private transfer from your hotel out through the southern suburbs into open farmland. The day starts early on purpose: the drive, the farm's own programme and the sites' opening hours all have to line up, so we fix the running order with you beforehand.",
      },
      {
        title: "Baladi bread, in the morning",
        description:
          "The morning opens at the oven — mixing, shaping and baking traditional Egyptian baladi bread, then eating it warm.",
      },
      {
        title: "A guided walk through the farm",
        description:
          "An introduction to how the land is actually worked, crop by crop, and to the date varieties grown here — including how the palms are climbed and how the harvest is traditionally taken. The fresh harvest itself is an August event; outside it, this is the explanation and a tasting of the farm's date products rather than fruit off the tree.",
      },
      {
        title: "Hands in the work",
        description:
          "Planting and whatever the season's work happens to be, pottery and traditional handicrafts at the wheel and the bench, and a donkey ride through the lanes. Which of these run on your day depends on the season and the farm's work that week.",
      },
      {
        title: "At the family table",
        description:
          "A full countryside breakfast or lunch, cooked at the farmhouse — tell us which suits your day. Breakfast runs to feteer meshaltet, bread straight from the oven, bee honey and blackstrap molasses, fresh and aged farmhouse cheese, fried potatoes, boiled eggs, ful medames and falafel, with seasonal vegetables and salad. Lunch runs to assorted mahshi — grape leaves, cabbage, eggplant, zucchini — vermicelli rice, oven-baked dishes, molokhia and soup, with chicken, meat and kofta. These are examples of what the kitchen cooks, not a fixed menu: the day's table depends on the season and is confirmed with the farm.",
      },
      {
        title: "The Bent and Red Pyramids",
        description:
          "Sneferu's failed experiment and the correction that made Giza possible, usually with a fraction of Giza's crowd. Going down inside the Red Pyramid is optional.",
      },
      {
        title: "Sunset from the mountain",
        description:
          "An outing up to the high ground for the last of the light, with the pyramids on the horizon. Weather and timing dependent.",
      },
      {
        title: "Tea around the fire",
        description:
          "A traditional evening gathering to close the day — singing, and tea made over a wood fire. This runs subject to the season and the farm's arrangements for that evening.",
      },
      {
        title: "Return transfer",
        description:
          "Private transfer back to your hotel in Cairo or Giza. The return time depends on how much of the day you take — an afternoon finish at the farmhouse and a stay through the evening gathering are very different endings.",
      },
    ],
    included: [
      "Private air-conditioned transport from and back to Cairo or Giza",
      "English-speaking guide for the day",
      "Tea on arrival and the guided farm tour",
      "Hands-on farm activities, bread baking and handicrafts",
      "A traditional countryside meal at the family table",
      "Dahshur site entrance fees",
    ],
    goodToKnow: [
      // The seasonal line the owner asked for, close to verbatim. It is first
      // because it is the one expectation this product used to set wrongly:
      // the page previously implied the date harvest was simply part of the
      // visit, in any month.
      "The farm's fresh date harvest takes place annually in August. Outside the harvest season, guests can learn about the date varieties grown on the farm and sample a selection of the farm's date products. Fresh dates on the palms and direct harvesting experiences are seasonal and cannot be guaranteed outside August.",
      "If seeing and tasting freshly harvested dates is your main reason for coming, August is the month to plan around.",
      "Children under 12 years old are charged at half the adult rate for the farm experience.",
      "The farm is on the Saqqara Tourist Road in Dahshur, near the Dahshur Pyramid entrance, roughly 5 km beyond Saqqara.",
      "The farm day can be combined with the Bent Pyramid, the Red Pyramid and Saqqara in one private trip, with hotel pickup and drop-off in Cairo or Giza. It is a lot for one day and needs an early start, so we check opening hours, driving times and the farm's programme for your date before fixing the itinerary.",
      "Which activities run depends on the season, the weather and the farm's own work that day — planting, the sunset outing and the evening gathering in particular. We confirm the day's programme with the farm before your visit.",
      "You can go down inside the Red Pyramid. The descent is steep, low-ceilinged and warm; it is entirely optional.",
      "This is a working village, so modest dress is appreciated.",
      "October to April is the comfortable season for a day spent mostly outdoors.",
      "Vegetarian and other dietary requirements are easy — tell us when you book so the family can cook for them.",
    ],
    // What the reservations team otherwise has to write back and ask. None of
    // these selects or prices anything — they are preferences, passed through
    // to the enquiry email in the guest's own words.
    enquiryOptions: [
      "Breakfast at the farm",
      "Lunch at the farm",
      "Add the Bent and Red Pyramids",
      "Add Saqqara",
      "I'd like a tailored itinerary",
    ],
    destinations: ["Dahshur", "Giza", "Cairo"],
  },

  // ── Cairo ──────────────────────────────────────────────────────────────
  {
    slug: "nile-kayaking-cairo",
    physicalLevel: {
      tier: "moderate",
      note:
        "Two hours paddling on flat, sheltered water. No experience needed and the guide stays alongside, but it's two hours of steady arm work.",
    },
    title: "Kayaking on the Nile in Cairo",
    duration: "About 3 hours door to door (2 hours on the water)",
    location: "Maadi, Cairo",
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

  // ── Cairo: craft, heritage and photography ─────────────────────────────
  //
  // Ten products researched in October 2026 against what Cairo operators
  // actually sell. Every one of them quotes by enquiry and carries no
  // supplier, permit, price or availability we have not confirmed — several
  // of these need a relationship built before they can run, and the page says
  // so rather than implying a workshop is standing by.
  {
    slug: "cairo-metal-engraving-workshop",
    theme: "craft",
    physicalLevel: {
      tier: "easy",
      note: "Seated work at a bench, with a walk through the lanes to reach it. No standing for long and nothing strenuous.",
    },
    title: "Engrave Your Own Keepsake with a Cairo Metalworker",
    duration: "About half a day",
    location: "Islamic Cairo",
    price: { amount: null },
    imageTone: "luxor",
    image: unsplash("photo-1541430840663-7979db8e3046"),
    imageCredit: credit(
      "Sam Dan Truong",
      "https://unsplash.com/photos/brown-and-gray-wooden-wall-decor-SGni-rVlhz4"
    ),
    description:
      "Sit down at a metalworker's bench in the old city and cut your own piece — a name, a line of hieroglyphs, a date — into brass or copper under the hands of someone who has done it since they were a teenager. You leave with the thing you made, not a thing you bought.",
    steps: [
      {
        title: "Into the workshop lanes",
        description:
          "A short guided walk through the metalworkers' quarter to the bench, past the trades that still supply it — this part is the context the finished object is missing without it.",
      },
      {
        title: "Choosing what to cut",
        description:
          "Your design, worked out with the artisan: a name in Arabic or English, a cartouche, a date, a short inscription. Simple lines cut better than crowded ones, and they will tell you which is which.",
      },
      {
        title: "At the bench",
        description:
          "Marking, cutting and finishing your own piece with the artisan working beside you. How far you get is a matter of how intricate a design you chose.",
      },
      {
        title: "Taking it home",
        description: "The piece is yours to take with you the same day.",
      },
    ],
    included: [
      "Private transfer from and back to your hotel in Cairo or Giza",
      "English-speaking guide for the session",
      "The workshop session with the artisan",
      "Materials for one piece per person",
      "The piece you make",
    ],
    goodToKnow: [
      "We arrange the artisan for your date rather than running a fixed class, so the workshop, the metal and what is achievable in the time are confirmed with you before you book.",
      "This is hand tooling, not machine engraving. The result looks made rather than manufactured, which is the point of it.",
      "Tell us the name or inscription you want when you enquire — Arabic, English or hieroglyphs — so the artisan can advise before the day.",
      "Working metal shops are hot, noisy and full of sharp tooling. Closed shoes, and children only by arrangement.",
      "If you want a cartouche made for you by a workshop rather than made by you, our Boutique already sells those — this is the hands-on alternative.",
    ],
    enquiryOptions: [
      "In Arabic script",
      "In hieroglyphs",
      "A private session, just our group",
      "I'd like a tailored itinerary",
    ],
    destinations: ["Cairo"],
  },
  {
    slug: "arabic-calligraphy-workshop-cairo",
    theme: "craft",
    physicalLevel: {
      tier: "easy",
      note: "Seated throughout, at a desk. Nothing physical about it beyond holding a pen at an unfamiliar angle.",
    },
    title: "Arabic Calligraphy with a Cairo Calligrapher",
    duration: "About 3 hours",
    location: "Cairo",
    price: { amount: null },
    imageTone: "luxor",
    image: unsplash("photo-1628962691167-27b7db9997e0"),
    imageCredit: credit(
      "Oussama Abouchatir",
      "https://unsplash.com/photos/person-writing-on-white-paper-_d2YajYba98"
    ),
    description:
      "Arabic script is a craft with rules — the reed pen is cut a certain way, the proportions of every letter are measured in dots, and the hand is trained rather than expressive. A working calligrapher takes you through one script from the pen upward, and you write your own name in it by the end.",
    steps: [
      {
        title: "The pen, and why it is cut like that",
        description:
          "The qalam, the ink, the angle of the nib, and the dot system that sets every proportion in the script. Ten minutes of this changes how the rest of the city's walls read.",
      },
      {
        title: "One script, properly",
        description:
          "Rather than a tour of six hands, you work in one — the calligrapher will suggest which suits the time you have — and practise the strokes it is built from.",
      },
      {
        title: "Your own name",
        description:
          "Writing your name, or a short phrase, in the script you have been practising. You keep what you write.",
      },
    ],
    included: [
      "Private transfer from and back to your hotel in Cairo or Giza",
      "The workshop session with the calligrapher",
      "Pen, ink and paper",
      "The pieces you write",
    ],
    goodToKnow: [
      "Cairo has real calligraphy teaching — the Ministry has run a calligraphy school at the Gayer-Anderson Museum and Bayt Al-Sinnari hosts workshops — but those are public programmes on their own calendars, not ours. We arrange a calligrapher privately for your date, and confirm the teacher and the venue with you before you book.",
      "The session is taught in English unless you ask otherwise; we do not promise every language.",
      "No Arabic is needed. Reading the letters is not the exercise — drawing them is.",
      "Three hours is enough to write your name well in one script. It is not enough to learn the script.",
      "Left-handed writers can absolutely do this; tell us when you enquire so the calligrapher can prepare.",
    ],
    enquiryOptions: [
      "A private session, just our group",
      "We'd like to write a specific phrase",
      "I'd like a tailored itinerary",
    ],
    destinations: ["Cairo"],
  },
  {
    slug: "egyptian-pantry-market-walk",
    theme: "craft",
    physicalLevel: {
      tier: "moderate",
      note: "Two to three hours mostly on your feet, on uneven market ground and through crowded lanes.",
    },
    title: "The Egyptian Pantry: A Cook's Walk Through the Market",
    duration: "About 3 hours",
    location: "Cairo",
    price: { amount: null },
    imageTone: "desert",
    image: unsplash("photo-1784741924166-af7f9f220afc"),
    imageCredit: credit(
      "Lothar Boris Piltz",
      "https://unsplash.com/photos/a-vibrant-display-of-various-dried-fruits-teas-and-spices-yU_L8HwlBeY"
    ),
    description:
      "What an Egyptian kitchen actually keeps, bought where Egyptians actually buy it. Through a working food market with someone who cooks from it — the spice blends that have no English name, the cheeses that scare visitors and shouldn't, the difference between the molokhia everyone warns you about and the molokhia people go home for.",
    steps: [
      {
        title: "Into a working market",
        description:
          "Not a tourist bazaar — a market that exists to feed the neighbourhood around it, which is why the prices and the produce are real.",
      },
      {
        title: "The pantry, item by item",
        description:
          "Spices and blends, pulses, the bread, the cheeses, the preserved and the pickled. What each is for, what it replaces in your own kitchen, and what actually survives the flight home.",
      },
      {
        title: "Tasting as you go",
        description:
          "Small tastes along the way from vendors your host buys from. Enough to add up to a meal if you pace it badly.",
      },
      {
        title: "Taking it with you",
        description:
          "Help choosing and buying what you want to take home, and the sense to know what will be confiscated at a border.",
      },
    ],
    included: [
      "Private transfer from and back to your hotel in Cairo or Giza",
      "An English-speaking host who cooks",
      "Tastings along the walk",
    ],
    goodToKnow: [
      "Which market we use depends on the day and on what is trading; we confirm the route with you beforehand rather than printing one here.",
      "Anything you buy to take home is yours to pay for — we do not mark up a vendor's prices.",
      "Tell us about allergies and dietary restrictions when you enquire. A market walk is a hard place to improvise around a nut allergy.",
      "Markets are busiest and best in the morning. Afternoons are quieter and hotter.",
      "This is a walk and a tasting, not a cooking class. If you want to cook what you buy, say so when you enquire and we will look at arranging it.",
    ],
    enquiryOptions: [
      "We'd like to cook afterwards as well",
      "Vegetarian or vegan",
      "A private walk, just our group",
      "I'd like a tailored itinerary",
    ],
    destinations: ["Cairo"],
  },
  {
    slug: "city-of-the-dead-heritage-walk",
    theme: "heritage",
    physicalLevel: {
      tier: "moderate",
      note: "Two to three hours walking on dust, rubble and uneven ground, with very little shade.",
    },
    title: "The City of the Dead: Cairo's Living Necropolis",
    duration: "About half a day",
    location: "Al-Qarafa, Cairo",
    price: { amount: null },
    imageTone: "giza",
    description:
      "A square mile of Cairo where the tombs have doors, the streets have names, and families have lived among their dead for centuries. It holds some of the finest Mamluk funerary architecture anywhere — and parts of it are being cleared for a road network, which is why seeing it with someone who can read it matters now rather than later.",
    steps: [
      {
        title: "Why a cemetery has streets",
        description:
          "How Cairo came to bury its dead in courtyard houses, why people live in them, and what the architecture was built to do.",
      },
      {
        title: "The Mamluk domes",
        description:
          "The carved stone domes this necropolis is famous for, which are the reason it forms part of the Historic Cairo World Heritage inscription.",
      },
      {
        title: "What is still standing",
        description:
          "Demolition for a new road network has been under way since 2023 and the ground changes between visits, so the route is set on the day by the guide rather than promised in advance.",
      },
    ],
    included: [
      "Private transfer from and back to your hotel in Cairo or Giza",
      "An English-speaking guide who knows the area and its residents",
      "The walking route for the day",
    ],
    goodToKnow: [
      "People live here. We walk with a guide who is known locally, we do not photograph residents or their homes without asking first, and anyone who would rather not be visited is not visited.",
      "Demolition for a road and flyover scheme has been clearing parts of Al-Qarafa since 2023, and UNESCO has stated it was not consulted. What is reachable genuinely changes, which is why we set the route on the day.",
      "This is a cemetery and an inhabited neighbourhood at once. Modest dress, quiet voices, and the guide's lead on where cameras come out.",
      "Dust, rubble and no shade. Closed shoes, a hat, and water.",
      "If the day's conditions make the visit intrusive or unsafe, we will say so and offer you something else rather than walking you through it anyway.",
    ],
    enquiryOptions: [
      "Combine with Islamic Cairo",
      "A private walk, just our group",
      "I'd like a tailored itinerary",
    ],
    destinations: ["Cairo"],
  },
  {
    slug: "mokattam-cave-church",
    theme: "heritage",
    physicalLevel: {
      tier: "moderate",
      note: "The church is cut into the cliff and built in tiers — expect steps and slopes between the levels.",
    },
    title: "The Cave Church of Mokattam",
    duration: "About half a day",
    location: "Mokattam, Cairo",
    price: { amount: null },
    imageTone: "giza",
    description:
      "An amphitheatre carved into the Mokattam cliff, seating thousands, with the rock face itself sculpted in relief around it. The Monastery of Saint Simon is one of the largest churches in the Middle East and almost no visitor itinerary includes it — a guided visit to the church, its scripture reliefs, and the Coptic history that put it there.",
    steps: [
      {
        title: "Up to the cliff",
        description:
          "The drive up through Mokattam to the monastery gate, with the history of Cairo's Coptic community on the way.",
      },
      {
        title: "The carved amphitheatre",
        description:
          "The main church cut into the rock, the scale of it, and the reliefs carved directly into the cliff face around the seating.",
      },
      {
        title: "The smaller churches and the relief work",
        description:
          "The chapels on the other terraces, and the sculpted scripture scenes that cover the rock between them.",
      },
    ],
    included: [
      "Private transfer from and back to your hotel in Cairo or Giza",
      "An English-speaking guide",
      "The guided visit to the monastery",
    ],
    goodToKnow: [
      "This is an active place of worship for a large congregation. Modest dress — knees and shoulders covered — quiet during services, and the guide's lead on photography inside.",
      "The monastery sits above the quarter where Cairo's zabbaleen live and work. We go there for the church; we do not run a tour of anyone's neighbourhood or livelihood, and we will not package it as a sight.",
      "The site is built in tiers up a cliff. There are steps and slopes between the levels, and parts are steep.",
      "Opening times follow the church's own calendar and feast days, so we confirm the day's access before you travel.",
      "Fridays and Sundays bring very large congregations. Beautiful to witness, and busy.",
    ],
    enquiryOptions: [
      "Combine with Coptic Cairo",
      "A private visit, just our group",
      "I'd like a tailored itinerary",
    ],
    destinations: ["Cairo"],
  },
  {
    slug: "wadi-el-natrun-monasteries",
    theme: "heritage",
    physicalLevel: {
      tier: "easy",
      note: "Walking between buildings on level monastery ground, with a long drive either side of it.",
    },
    title: "Wadi El Natrun: The Desert Monasteries",
    duration: "Full day",
    location: "Wadi El Natrun, Beheira",
    price: { amount: null },
    imageTone: "desert",
    description:
      "Christian monasticism began in this desert. The monasteries of Wadi El Natrun have been continuously inhabited for roughly sixteen centuries — keep-towers, ancient wall paintings, libraries and a working community of monks — about an hour and a half northwest of Cairo, and almost entirely off the standard route.",
    steps: [
      {
        title: "Out of Cairo into the desert",
        description:
          "The drive northwest along the desert road, and why this particular valley became the cradle of monastic life.",
      },
      {
        title: "The monasteries",
        description:
          "Two of the valley's monasteries, usually including Deir Anba Bishoy — the churches, the keep-towers built against raids, and the wall paintings.",
      },
      {
        title: "The community today",
        description:
          "What a working monastery is, how the day is ordered, and the continuity that makes this different from visiting a ruin.",
      },
      {
        title: "Back to Cairo",
        description: "Return transfer to your hotel.",
      },
    ],
    included: [
      "Private air-conditioned transport from and back to Cairo or Giza",
      "An English-speaking guide for the day",
      "Visits to the monasteries open on your date",
    ],
    goodToKnow: [
      "Which monasteries are open to visitors varies by day, by feast and by fasting season, and each sets its own hours and photography rules. We confirm the day's itinerary with the monasteries rather than printing a fixed one here.",
      "Modest dress is required: shoulders and knees covered for everyone, and a head covering for women inside the churches. Visitors have been refused entry for less.",
      "Photography differs between monasteries and between buildings — some interiors are not photographed at all. The guide will tell you where.",
      "Parts of the monasteries are reserved for the monastic community and are not open to visitors. That is not a closure; it is a working monastery.",
      "It is a long day with roughly three hours of driving in total. There is little to buy out there, so bring what you want to eat and drink.",
    ],
    enquiryOptions: [
      "A private day, just our group",
      "We'd like a Coptic-heritage focus",
      "I'd like a tailored itinerary",
    ],
    destinations: ["Cairo"],
  },
  {
    slug: "zamalek-private-photoshoot",
    theme: "photography",
    physicalLevel: {
      tier: "easy",
      note: "A couple of hours strolling between locations on flat island streets, at whatever pace you set.",
    },
    title: "Zamalek Photoshoot: Cairo's Island Streets",
    duration: "About 2 hours",
    location: "Zamalek, Cairo",
    price: { amount: null },
    imageTone: "nile",
    image: unsplash("photo-1634154955216-0a8455e2fb15"),
    imageCredit: credit(
      "Jens Aber",
      "https://unsplash.com/photos/the-sun-is-setting-over-a-city-with-a-bridge-dBYlE_IACP8"
    ),
    description:
      "Not the pyramids. Zamalek is the Cairo of balconied 1930s apartment blocks, jacaranda, embassy gardens and the Nile at the end of the street — a private shoot through the island with a photographer who knows which corners hold the light and at what hour.",
    steps: [
      {
        title: "Planning the route",
        description:
          "The look you want, settled before the day: architecture, the river, the greener streets, or a mix. The route follows the light rather than a map.",
      },
      {
        title: "Shooting through the island",
        description:
          "Moving between locations on foot, shooting as you go. Two or three changes of backdrop in a session is comfortable; more is rushing.",
      },
      {
        title: "Your edited images",
        description:
          "A selection of edited photographs delivered after the shoot. The number and the turnaround are agreed with you when you book.",
      },
    ],
    included: [
      "A private photographer for the session",
      "Location planning around the light",
      "Edited images, to an agreed count",
    ],
    goodToKnow: [
      "Egypt allows personal photography in public places without a permit, but professional and commercial shoots, and lighting equipment set up in the street, are a different matter. We confirm what your shoot needs before the day rather than assuming.",
      "Egyptian law requires a person's consent before they are photographed, and photographing children is not permitted. A street shoot works around people rather than through them.",
      "Some buildings, gardens and compounds are private or diplomatic and cannot be used as backdrops. The photographer plans around that.",
      "The first and last hours of daylight are the shoot worth having. Midday on an open street is the one to avoid.",
      "Outfit changes need somewhere to change — tell us when you enquire and we will build it into the route.",
      "This is a shoot of you. If you want to learn to take the photographs yourself, the photography class is the other product.",
    ],
    enquiryOptions: [
      "Couple or engagement shoot",
      "Family shoot",
      "Solo portraits",
      "We'd like outfit changes",
      "I'd like a tailored itinerary",
    ],
    destinations: ["Cairo"],
  },
  {
    slug: "cairo-photography-class",
    theme: "photography",
    physicalLevel: {
      tier: "moderate",
      note: "Two to three hours on your feet in a historic quarter, carrying your own camera.",
    },
    title: "Photography Class in Historic Cairo",
    duration: "About 3 hours",
    location: "Historic Cairo",
    price: { amount: null },
    imageTone: "luxor",
    image: unsplash("photo-1777621175513-caa47fc3584f"),
    imageCredit: credit(
      "Yunshuo Qu",
      "https://unsplash.com/photos/man-taking-a-picture-with-a-vintage-camera-n1CJh1hNWbY"
    ),
    description:
      "A working Egyptian photographer, your own camera, and one of the most photographed quarters on earth — spent learning to see it rather than collecting it. Light, framing, and the particular problem of shooting a crowded street without either flattening it or intruding on it.",
    steps: [
      {
        title: "What you brought, and what it does",
        description:
          "Your camera or your phone, set up properly for the conditions — Cairo's contrast between a shaded lane and an open courtyard is the whole technical problem of the day.",
      },
      {
        title: "Shooting the quarter",
        description:
          "Working through the streets putting each idea into practice — composition, light, and the judgement about when a photograph of a person is a portrait and when it is a trophy.",
      },
      {
        title: "Looking at what you got",
        description:
          "Sitting down over your own frames at the end: what worked, what didn't, and what to do differently tomorrow.",
      },
    ],
    included: [
      "Private transfer from and back to your hotel in Cairo or Giza",
      "A professional photographer teaching the session",
      "The review at the end",
    ],
    goodToKnow: [
      "Bring your own camera — any camera, including a phone. This is a class, so we do not supply equipment.",
      "Egyptian law requires a person's written consent before photographing them, and photographing children is not permitted. How to ask, and when not to, is part of what is taught.",
      "Which quarter we use depends on the day and on what is accessible; we confirm it with you beforehand.",
      "Museums and archaeological sites have their own photography rules and separate permits, so the class works in the streets rather than inside ticketed sites.",
      "Taught in English unless you ask otherwise; we do not promise every language.",
      "If you would rather be photographed than learn to photograph, the Zamalek shoot or a photographer by the hour is the better fit.",
    ],
    enquiryOptions: [
      "Beginner",
      "I shoot already and want to improve",
      "Phone photography",
      "I'd like a tailored itinerary",
    ],
    destinations: ["Cairo"],
  },
  {
    slug: "photographer-by-the-hour",
    theme: "photography",
    physicalLevel: {
      tier: "easy",
      note: "Whatever your own plans involve — the photographer goes where you go.",
    },
    title: "A Photographer, by the Hour",
    duration: "From one hour; you set the length",
    location: "Cairo and Giza",
    price: { amount: null },
    imageTone: "nile",
    image: unsplash("photo-1679238211153-546821b75f98"),
    imageCredit: credit(
      "Michael Starkie",
      "https://unsplash.com/photos/a-view-of-a-city-with-a-pyramid-in-the-distance-TtlvTrqxXno"
    ),
    description:
      "Not an itinerary — a photographer, for as long as you want one. Bring them to the pyramids for an hour, keep them for a whole day across the city, or have them quietly cover a proposal, a birthday or a family trip. You choose the where and the how long; we match the photographer to it.",
    steps: [
      {
        title: "Tell us the shape of it",
        description:
          "Where you will be, how long you want a photographer there, and what the photographs are for. That is the whole brief.",
      },
      {
        title: "Matched to a photographer",
        description:
          "Cairo photographers specialise — documentary, portrait, wedding, fashion. We match the one whose work fits what you described rather than sending whoever is free.",
      },
      {
        title: "The shoot itself",
        description:
          "They meet you where you are and work around your day rather than running it.",
      },
      {
        title: "Your edited images",
        description:
          "Edited photographs delivered afterwards, to a count and a turnaround agreed before you book.",
      },
    ],
    included: [
      "A photographer for the hours you book",
      "Matching the photographer to the brief",
      "Edited images, to an agreed count",
    ],
    goodToKnow: [
      "This is a service, not a tour. There is no itinerary, no guide and no transport unless you ask for them.",
      "Site entry is separate. The pyramids, museums and ticketed sites each have their own rules for professional photography, and some require a permit we have to arrange in advance.",
      "Egyptian law requires consent before photographing a person, and photographing children is not permitted. That applies to a hired photographer too.",
      "Tell us the hours and the locations when you enquire. The rate for an hour at one location and a full day across the city are not the same thing, and we would rather quote you properly than post a number that fits neither.",
      "For a planned shoot with a route built around the light, the Zamalek photoshoot is the better product.",
    ],
    enquiryOptions: [
      "One hour",
      "Half a day",
      "A full day",
      "A proposal or celebration",
      "I'd like a tailored itinerary",
    ],
    destinations: ["Cairo"],
  },
  {
    slug: "wadi-degla-hike-stargazing",
    theme: "outdoors",
    physicalLevel: {
      tier: "active",
      note: "Several hours walking a dry limestone canyon on loose rock, with no shade and no water on the route.",
    },
    title: "Wadi Degla: Canyon Hike, Sunset and Stars",
    duration: "About half a day, into the evening",
    location: "Wadi Degla Protectorate, Cairo",
    price: { amount: null },
    imageTone: "desert",
    description:
      "A limestone canyon inside the city limits. Wadi Degla is a protected area at the edge of Maadi — a dry riverbed cut through fossil-bearing rock, walked out in the afternoon, turned around for sunset on the canyon wall, and dark enough afterwards for a sky Cairo normally hides.",
    steps: [
      {
        title: "Into the wadi",
        description:
          "Through the protectorate gate and out along the canyon floor, with the geology and the fossils that make this a protected area rather than a quarry.",
      },
      {
        title: "The walk out",
        description:
          "A few hours along the dry riverbed, as far as the group's pace takes it. The canyon walls rise as you go.",
      },
      {
        title: "Sunset on the rock",
        description: "Turning for the light on the canyon wall, which is the hour this place is for.",
      },
      {
        title: "Stars, and back",
        description:
          "Time under the sky once it is properly dark, then the drive back into the city — which is startlingly short.",
      },
    ],
    included: [
      "Private transfer from and back to your hotel in Cairo or Giza",
      "An English-speaking guide for the walk",
      "Protectorate entry fees",
      "Drinking water for the route",
    ],
    goodToKnow: [
      "Wadi Degla is a declared protectorate and the rules are the protectorate's, not ours: entry fees are set at the gate and we confirm the current ones for your date rather than quoting a figure here.",
      "Camping overnight is allowed only in designated areas and we have not confirmed the current permit process. If you want to stay the night, ask when you enquire and we will find out what is possible for your date — we will not promise it in advance.",
      "No shade, no water on the route and no phone signal in parts of the canyon. Closed walking shoes, a hat, and more water than you think.",
      "Loose rock underfoot the whole way. This is a walk rather than a scramble, but it is not a stroll, and it is not suitable in sandals.",
      "October to April is the season for this. A summer afternoon in a limestone canyon is genuinely dangerous.",
      "The fossils and the rock are protected. Nothing leaves the wadi — that is a condition of entry, not a request.",
    ],
    enquiryOptions: [
      "We'd like to camp overnight if permitted",
      "A private walk, just our group",
      "I'd like a tailored itinerary",
    ],
    destinations: ["Cairo"],
  },

  // ── Fayoum ─────────────────────────────────────────────────────────────
  {
    slug: "fayoum-desert-safari",
    physicalLevel: {
      tier: "active",
      note:
        "Around five hours of driving in total, repeated climbs in and out of a 4x4, and soft-sand walking between sites. Sandboarding can be done sitting down.",
    },
    title: "4×4 Desert Safari in Fayoum Oasis",
    duration: "Full day (about 10 hours from Cairo)",
    location: "Wadi El Rayan & Wadi El Hitan, Fayoum",
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
    physicalLevel: {
      tier: "active",
      note:
        "Desert driving, walking on soft sand, and a night at a camp with deliberately basic facilities. Nights from November to February get properly cold.",
    },
    title: "Overnight Camping in Fayoum Oasis",
    duration: "2 days, 1 night",
    location: "Magic Lake & Wadi El Rayan, Fayoum",
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
    physicalLevel: {
      tier: "easy",
      note:
        "Mostly sitting still in the dark, well away from any light. The cold is the only real demand — it drops sharply after sunset in every season.",
    },
    title: "Stargazing in Fayoum Oasis",
    duration: "Evening into the early hours, with an optional overnight",
    location: "Wadi El Hitan, Fayoum",
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
    physicalLevel: {
      tier: "moderate",
      note:
        "Flat, sheltered water with a guide alongside. Mornings are calmer; the wind gets up across the lakes in the afternoon and makes it harder work.",
    },
    title: "Kayaking in Fayoum Oasis",
    duration: "Half day, or added to a Fayoum day tour",
    location: "Magic Lake & Lake Qarun, Fayoum",
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
    physicalLevel: {
      tier: "easy",
      note:
        "About two hours seated at the wheel. Messy rather than strenuous — wear something you don't mind getting clay on.",
    },
    title: "Pottery Experience in Tunis Village, Fayoum",
    duration: "About 2 hours at the wheel",
    location: "Tunis Village, above Lake Qarun, Fayoum",
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
    physicalLevel: {
      tier: "easy",
      note:
        "Boarding at the marina, then a day on deck at your own pace. Swimming from the boat is optional.",
    },
    title: "Private Yacht Experience in Ain Sokhna",
    duration: "Full day (about 10 hours from Cairo)",
    location: "Ain Sokhna Marina, Red Sea",
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
    physicalLevel: {
      tier: "moderate",
      note:
        "A 4:00am pickup and a climb in and out over the side of the basket, then standing for the 45 to 60 minutes airborne. The flight itself is smooth.",
    },
    title: "Hot Air Balloon Experience in Luxor",
    duration: "About 4 hours door to door (45–60 minutes airborne)",
    location: "Luxor West Bank",
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
    physicalLevel: {
      tier: "easy",
      note:
        "A boat crossing with a step ashore, then flat walking on sand and village lanes at an unhurried pace.",
    },
    title: "Nubian Village Visit in Aswan",
    duration: "Half day (about 3–4 hours)",
    location: "Gharb Soheil, Soheil Island, Aswan",
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
    physicalLevel: {
      tier: "moderate",
      note:
        "A 3:00am start and roughly three and a half hours on the road each way, with about two hours of level walking at the temples. The road, not the site, is the hard part.",
    },
    title: "Abu Simbel Excursion from Aswan",
    duration: "Full day (about 8–10 hours)",
    location: "Abu Simbel, 280 km south of Aswan",
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
    physicalLevel: {
      tier: "active",
      note:
        "Boat boarding, a tender ashore at the island, and reef snorkeling entered from the boat rather than a beach.",
    },
    title: "Giftun Island Yacht Trip in Hurghada",
    duration: "Full day (about 8 hours)",
    location: "Giftun Island National Park (Mahmya), Hurghada",
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
    physicalLevel: {
      tier: "easy",
      note:
        "Shallow, clear water off a sandbar, reached by boat. This is the trip for families and nervous swimmers — you can stand up in most of it.",
    },
    title: "Orange Bay Yacht Trip in Hurghada",
    duration: "About 7 hours",
    location: "Orange Bay, Giftun Island, Hurghada",
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
    physicalLevel: {
      tier: "active",
      note:
        "A 5:00am pickup, a crossing of over two hours each way, and quiet open-water snorkeling entered from the boat.",
    },
    title: "Dolphin House Trip in Marsa Alam",
    duration: "Full day (about 8 hours)",
    location: "Sataya Reef (Dolphin House), off Hamata",
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
    physicalLevel: {
      tier: "challenging",
      note:
        "A 2:00am start and two and a half to three and a half hours up in the dark, descending the roughly 3,750 Steps of Repentance. A camel covers most of the path up, but everyone walks the final 750 steps.",
    },
    title: "Mount Sinai Climbing Experience from Saint Catherine",
    duration: "Overnight climb, with the monastery in the morning",
    location: "Mount Sinai & St Catherine's Monastery, South Sinai",
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
    physicalLevel: {
      tier: "active",
      note:
        "Four hours' drive each way before the desert driving even begins, walking on soft sand, and a camp night that gets close to freezing from November to February.",
    },
    title: "White Desert Overnight Camping from Bahariya Oasis",
    duration: "2 days, 1 night",
    location: "White Desert National Park, via Bahariya Oasis",
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
    physicalLevel: {
      tier: "easy",
      note:
        "The water is salt-saturated, so you float without any effort at all. The crusted edges are sharp underfoot — water shoes are genuinely worth packing.",
    },
    title: "Salt Lakes Swimming & Floating Experience in Siwa Oasis",
    duration: "1–2 hours at the lakes, within a Siwa day",
    location: "Siwa Oasis salt lakes, Western Desert",
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
/**
 * The four collections, in the order they read on the page.
 *
 * Ordered by how a visitor chooses rather than alphabetically: the things you
 * make and taste, then the things you go and see, then the photography, then
 * the one that needs walking shoes.
 */
export const experienceThemes: {
  key: ExperienceTheme;
  name: string;
  blurb: string;
}[] = [
  {
    key: "craft",
    name: "Local culture & craft",
    blurb: "Half a day at somebody's bench or in their market — you leave with the thing you made, or the sense to shop like a local.",
  },
  {
    key: "heritage",
    name: "Heritage & faith",
    blurb: "Places Cairo keeps for itself: a necropolis people live in, a church cut into a cliff, and the desert where monasticism began.",
  },
  {
    key: "photography",
    name: "Photography",
    blurb: "Three different things — a shoot of you, a lesson in shooting, and a photographer for however long you want one.",
  },
  {
    key: "outdoors",
    name: "Outdoors",
    blurb: "A limestone canyon inside the city limits, walked at the hour it is worth walking.",
  },
];

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
