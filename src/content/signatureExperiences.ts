// Local fallback for Signature Experiences — used until the "Signature
// Experiences" documents in Sanity are published, and pushed there as
// seed content by the migration route. Launches as "comingSoon" by
// design: price, hosts, and exact logistics should be confirmed for real
// before this goes fully live — flip status to "published" in the Studio
// once that's done.
import type { SignatureExperience } from "./types";
import { hosts } from "./hosts";

export const signatureExperiences: SignatureExperience[] = [
  {
    status: "comingSoon",
    order: 0,
    slug: "her-egypt",
    name: "Her Egypt",
    forWhom: "For women who've spent years taking care of everyone else — now it's your turn.",
    emotionalHeadline: "This Time, Everything Is Designed Around You.",
    shortDescription:
      "Five unhurried days of Egypt, arranged entirely around you — a private host, a photographer who knows how to make you look like yourself on a good day, and nothing left for you to organize. You show up. We've handled the rest.",
    heroImageTone: "desert",
    heroImage: "/photos/pexels-28601583.jpg",
    duration: "5 days, 4 nights",
    groupSize: "Private — just you, or with the friends you bring",
    luxuryLevel: "Ultra-Luxury, Fully Private",
    location: "Cairo · Giza · the Nile · Red Sea (customizable)",
    price: { amount: 2400 },
    whoIsThisForTitle: "Who This Was Designed For",
    whoIsThisForBody:
      "You've spent decades being the one who plans things — the trips, the schedules, the meals, everyone else's needs before your own. Her Egypt was built for the woman who's finally ready to be the one who's looked after: financially comfortable, done raising the logistics of other people's lives, and no longer interested in a vacation that turns into a second job. You don't want an itinerary to manage. You want one to simply follow.",
    whyWeCreatedThisTitle: "Why We Created This",
    whyWeCreatedThisBody:
      "Most travel in Egypt is built around sights — get to the Pyramids, get to the museum, get to the next stop. We noticed a different kind of traveler kept asking for something we weren't quite offering: fewer stops, more care, and someone else finally doing the thinking. Her Egypt flips the usual order. The places you'd expect — the Pyramids, the Nile, the markets — are still here. They're just no longer the whole plan. The plan is you: how you want your mornings to feel, when you want to be around people and when you don't, and having a photographer nearby so the moment gets kept without you ever having to hand your phone to a stranger.",
    experienceIntro:
      "A typical day moves at the pace you set — mornings with nowhere to rush to, a few hours built around Egypt's icons, and afternoons that are genuinely yours. Here's a glimpse of what that looks like.",
    experienceHighlights: [
      {
        title: "Slow mornings, on purpose",
        description:
          "No 6 a.m. meeting points. Breakfast is unhurried, often with a view, and the day starts when you're ready for it to.",
      },
      {
        title: "A photographer, not a selfie stick",
        description:
          "A professional travels with you through the moments worth keeping — the Pyramids at golden hour, dinner on the Nile — so you're in the photos instead of taking them.",
      },
      {
        title: "The icons, without the crowds' pace",
        description:
          "You'll still see the Pyramids, the museum, the markets — timed and guided so you're not competing with a tour bus schedule to enjoy them.",
      },
      {
        title: "Time that belongs to no one else",
        description:
          "Every day holds real, unscheduled hours — a spa afternoon, a nap, a wander through the souq alone — with nobody's needs to weigh against yours.",
      },
    ],
    itineraryDays: [
      {
        dayNumber: 1,
        title: "Arrival, and the moment you stop organizing",
        description:
          "From the second you land, this stops being something you're managing. Someone is holding a sign with your name on it.",
        items: [
          {
            time: "14:00",
            title: "Private airport pickup",
            duration: "45 minutes",
            description:
              "No queueing for a taxi, no working out the exchange rate at arrivals. Your host meets you at the gate and handles your luggage and the drive in.",
            location: "Cairo International Airport",
            category: "Travel",
            includedOrOptional: "included",
          },
          {
            time: "15:30",
            title: "Check-in, already done",
            duration: "20 minutes",
            description:
              "Your room is confirmed and waiting — no forms, no front desk line. Just the key, and the rest of the afternoon.",
            location: "Your hotel, Cairo",
            category: "Travel",
            includedOrOptional: "included",
          },
          {
            time: "17:00",
            title: "Free time to settle in",
            duration: "2 hours",
            description: "Unpack at your own pace, nap off the flight, or take a first look around — nothing planned, on purpose.",
            category: "Free Time",
            includedOrOptional: "included",
          },
          {
            time: "20:00",
            title: "Welcome dinner",
            duration: "2 hours",
            description:
              "A quiet, well-chosen restaurant to ease into the trip — good food, good conversation with your host about how you'd like the days ahead to feel.",
            category: "Dining",
            includedOrOptional: "included",
            notes: "Menu and pace are yours to set — this is a conversation, not a briefing.",
          },
        ],
      },
      {
        dayNumber: 2,
        title: "The Pyramids, at your pace — then the rest of the day is yours",
        items: [
          {
            time: "08:30",
            title: "Slow morning, proper breakfast",
            duration: "1 hour",
            description: "No early meeting point. Breakfast first, with a view, before anyone asks anything of you.",
            category: "Free Time",
            includedOrOptional: "included",
          },
          {
            time: "10:00",
            title: "Giza Pyramids & the Sphinx, privately guided",
            duration: "2.5 hours",
            description:
              "Timed to avoid the peak crowds, with a guide who reads the pace of the group rather than a script — and a photographer quietly capturing it, so you're in the frame.",
            location: "Giza Plateau",
            category: "Culture",
            includedOrOptional: "included",
          },
          {
            time: "13:00",
            title: "Lunch overlooking the plateau",
            duration: "1.5 hours",
            description: "A relaxed lunch with the Pyramids still in view, no rush back to a bus.",
            category: "Dining",
            includedOrOptional: "included",
          },
          {
            time: "15:00",
            title: "Spa afternoon",
            duration: "2.5 hours",
            description: "An afternoon that belongs entirely to you — no one else's preferences to balance against your own.",
            category: "Wellness",
            includedOrOptional: "included",
          },
          {
            time: "19:30",
            title: "Dinner, your choice",
            duration: "2 hours",
            description: "Your host offers a short list of places that fit the mood you're in — you pick, or hand it back to us entirely.",
            category: "Dining",
            includedOrOptional: "optional",
            notes: "Happy to book somewhere lively or somewhere quiet — just tell us which.",
          },
        ],
      },
      {
        dayNumber: 3,
        title: "The Nile, and a sunset that isn't rushed",
        items: [
          {
            time: "09:30",
            title: "Late, easy breakfast",
            duration: "1 hour",
            description: "Yesterday earns today a slower start.",
            category: "Free Time",
            includedOrOptional: "included",
          },
          {
            time: "11:00",
            title: "Cairo's markets, without the hustle",
            duration: "2 hours",
            description:
              "A guided wander through the souq with someone who handles the haggling if you'd rather not, and steps back if you'd rather browse alone.",
            location: "Khan el-Khalili",
            category: "Shopping",
            includedOrOptional: "included",
          },
          {
            time: "14:00",
            title: "Free afternoon",
            duration: "3 hours",
            description: "Back to the hotel, the pool, or nowhere in particular. This block exists specifically so nothing is scheduled into it.",
            category: "Free Time",
            includedOrOptional: "included",
          },
          {
            time: "17:30",
            title: "Sunset felucca sail on the Nile",
            duration: "1.5 hours",
            description:
              "A private sailboat, no engine noise, timed precisely for the light — with your photographer aboard for the ten minutes that end up mattering most.",
            location: "The Nile",
            category: "Scenic",
            includedOrOptional: "included",
          },
          {
            time: "20:00",
            title: "Dinner on the water",
            duration: "2 hours",
            description: "A table booked in advance, so the only decision left is what to order.",
            category: "Dining",
            includedOrOptional: "included",
          },
        ],
      },
    ],
    careTitle: "You Enjoy the Experience. We Handle the Details.",
    careIntro:
      "This is the actual product: not one more thing on your list, but everything already handled before you land.",
    careItems: [
      "Airport arrival and every transfer",
      "Your luggage, from curb to room",
      "Hotel check-in, arranged before you arrive",
      "Every restaurant reservation",
      "Spa and wellness bookings",
      "Private transportation throughout",
      "A dedicated guide and host each day",
      "Professional photography — no selfie stick required",
      "Special requests, timing, and the small logistics you'd otherwise carry yourself",
      "One point of contact for anything that comes up",
    ],
    hosts,
    faqs: [
      {
        question: "Do I need to travel with someone, or can I come alone?",
        answer:
          "Either works. Many guests come alone and never feel it — your host and guide are with you throughout, and past guests often overlap with each other if they'd like company.",
      },
      {
        question: "How much of this can I customize?",
        answer:
          "Meaningfully. The structure — the pace, the care, the photography — stays. The specific hotels, restaurants, and activities can be adjusted to you.",
      },
      {
        question: "What if I'd rather skip an activity?",
        answer:
          "Nothing here is mandatory. Free time is free time, and any included activity can be swapped or skipped — this is your itinerary, not a schedule you're bound to.",
      },
    ],
  },
  {
    status: "comingSoon",
    order: 1,
    slug: "the-luxor-eclipse",
    relatedStory: {
      slug: "2027-total-solar-eclipse-luxor",
      title: "Six Minutes of Totality Over the Valley of the Kings",
      excerpt:
        "On August 2, 2027, Luxor gets the longest total solar eclipse anywhere on Earth until 2114 — roughly six minutes and twenty-two seconds, almost directly overhead, above one of the oldest cities on the planet.",
      imageTone: "luxor",
      category: "Celestial Events",
    },
    name: "The Luxor Eclipse",
    forWhom: "For travelers who want to watch totality from one of the greatest historical sites on Earth.",
    emotionalHeadline: "Six Minutes of Totality, Over Three Thousand Years of History.",
    shortDescription:
      "On August 2, 2027, Luxor gets roughly six minutes and twenty-two seconds of total solar eclipse — the longest anywhere on Earth until 2114. Two unhurried days built around it: West Bank in the cool of the morning, then an afternoon spent watching the sky do something it won't do again in most of our lifetimes.",
    heroImageTone: "luxor",
    heroImage: "/photos/pexels-38674439.jpg",
    duration: "2 days, 1 night",
    groupSize: "Private, or small group — ask us either way",
    luxuryLevel: "Ultra-Luxury, Fully Private",
    location: "Luxor, Egypt",
    price: { amount: 890 },
    whoIsThisForTitle: "Who This Was Designed For",
    whoIsThisForBody:
      "Eclipse chasers who'd rather not spend the day it happens standing in a parking lot. History travelers who've always meant to see Luxor and would like a reason that won't wait. And anyone who understands that a six-minute event most of the planet will never witness deserves more planning than a pair of glasses and a hope for clear skies — which, in Luxor, are about as reliable as anywhere on the eclipse path.",
    whyWeCreatedThisTitle: "Why We Created This",
    whyWeCreatedThisBody:
      "Luxor didn't need help becoming an eclipse destination — it sits almost exactly on the path of totality, in a city with famously clear August skies, and it happens to hold the longest totality anywhere on the 2027 path. What it needed was someone thinking about the two days around those six minutes: how to see the Valley of the Kings without competing with eclipse crowds, where to actually be standing at 1:02 PM, and what to do with a group of people who just watched the sun disappear at midday. That's the part we built.",
    experienceIntro:
      "Two days, deliberately unbalanced: an easier first day to settle in, and a second day built entirely around being in the right place, calm and ready, when totality arrives.",
    experienceHighlights: [
      {
        title: "West Bank before the heat",
        description:
          "The Valley of the Kings and Hatshepsut's temple in the cool of the morning, finished well before midday — both for comfort and to leave the afternoon completely clear.",
      },
      {
        title: "A viewing setup built for looking straight up",
        description:
          "At maximum eclipse the sun sits almost directly overhead in Luxor — around 82° up. We're planning shaded, reclined seating rather than folding chairs, so six minutes of looking up is comfortable, not a neck strain.",
      },
      {
        title: "Certified eclipse protection, briefed properly",
        description:
          "Certified solar viewers for every guest, with a plain-language safety briefing the evening before — not a leaflet handed out five minutes before totality.",
      },
      {
        title: "A moment to actually process it",
        description:
          "No rushing to the next stop the second totality ends. Time built in afterward to sit with what just happened, before the day continues.",
      },
    ],
    itineraryDays: [
      {
        dayNumber: 1,
        title: "Arrival in the City of Thebes",
        description: "An easy first day — arrive, settle in, and see Luxor Temple the way it's best seen: lit, at night, without a midday crowd.",
        items: [
          {
            time: "Afternoon",
            title: "Private arrival & transfer",
            description: "Met at Luxor International Airport and driven straight to your hotel — no queues, no logistics to manage.",
            location: "Luxor International Airport",
            category: "Travel",
            includedOrOptional: "included",
          },
          {
            time: "Afternoon",
            title: "Luxury hotel check-in",
            description: "A Nile-view room, already confirmed. The rest of the afternoon is yours.",
            category: "Free Time",
            includedOrOptional: "included",
          },
          {
            time: "Evening",
            title: "Luxor Temple, illuminated",
            duration: "1.5 hours",
            description:
              "Guided through Luxor Temple after dark, when it's lit and considerably quieter than by day — one of the East Bank's genuinely best experiences.",
            location: "Luxor Temple, East Bank",
            category: "Culture",
            includedOrOptional: "included",
          },
          {
            time: "Evening",
            title: "Dinner",
            duration: "1.5 hours",
            description: "A relaxed dinner to close out the day.",
            category: "Dining",
            includedOrOptional: "included",
          },
          {
            time: "Evening",
            title: "Eclipse briefing & solar viewers",
            duration: "30 minutes",
            description:
              "A short, practical briefing on the next day — timing, what to expect during totality, and certified eclipse glasses issued to every guest, so tomorrow starts with nothing left to explain.",
            category: "Wellness",
            includedOrOptional: "included",
            notes: "Certified solar viewers meeting ISO 12312-2 safety standards are provided and required for all partial-phase viewing.",
          },
        ],
      },
      {
        dayNumber: 2,
        title: "Eclipse Day",
        description:
          "West Bank in the cool of the morning, rest through the worst of the midday heat, then everything narrows to one thing: being in the right place, calm and ready, at 1:02 PM.",
        items: [
          {
            time: "06:30",
            title: "Early breakfast",
            duration: "45 minutes",
            description: "Early on purpose — to be well ahead of both the heat and the day's only fixed appointment.",
            category: "Dining",
            includedOrOptional: "included",
          },
          {
            time: "07:30",
            title: "Valley of the Kings & Hatshepsut's Temple",
            duration: "3 hours",
            description:
              "A privately guided morning across the West Bank's two essentials, timed to finish before the midday heat — August in Luxor can reach the low 40s°C (over 100°F).",
            location: "West Bank, Luxor",
            category: "Culture",
            includedOrOptional: "included",
          },
          {
            time: "11:00",
            title: "Return & rest",
            duration: "1.5 hours",
            description: "Back to the hotel, out of the sun, with a light lunch — deliberately unhurried before the afternoon ahead.",
            category: "Free Time",
            includedOrOptional: "included",
          },
          {
            time: "12:15",
            title: "Transfer to the eclipse viewing location",
            duration: "30–45 minutes",
            description:
              "A short transfer to your viewing location, timed with margin before the partial eclipse begins at approximately 11:40 AM.",
            category: "Travel",
            includedOrOptional: "included",
            notes:
              "Final viewing location will be confirmed closer to the event based on access, crowd management, and local authority arrangements. We're evaluating elevated, uncrowded sites on Luxor's edges alongside select Nile-side locations for an open horizon and comfortable, shaded setup.",
          },
          {
            time: "12:45",
            title: "Eclipse preparation & safety briefing",
            duration: "20 minutes",
            description:
              "Shaded, reclined seating set up in advance — with the sun nearly overhead at maximum eclipse, comfort matters. A final safety reminder before the partial phase begins.",
            category: "Wellness",
            includedOrOptional: "included",
            notes:
              "Looking directly at the sun during the partial phases can cause serious eye injury. Certified solar viewers must be worn at all times except during the brief window of full totality.",
          },
          {
            time: "13:02",
            title: "Totality",
            duration: "≈ 6 minutes 22 seconds",
            description:
              "The moment the sun is fully covered, it's safe to view directly — no glasses needed until it ends. The sky darkens, the temperature drops, and Luxor gets one of the longest totalities anywhere on the 2027 path.",
            location: "Confirmed viewing location, Luxor",
            category: "Scenic",
            includedOrOptional: "included",
            notes: "Solar viewers go back on the instant totality ends — our team will signal this clearly.",
          },
          {
            time: "13:15",
            title: "After totality",
            duration: "45 minutes",
            description: "No rush to the next stop. Time to sit with it, share what everyone just saw, and enjoy a celebratory round of refreshments.",
            category: "Social",
            includedOrOptional: "included",
          },
          {
            time: "Evening",
            title: "Return, and dinner at leisure",
            description: "Back to the hotel to freshen up, with dinner and the rest of the evening entirely optional and unscheduled.",
            category: "Free Time",
            includedOrOptional: "optional",
          },
        ],
      },
    ],
    careTitle: "You Watch the Sky. We Handle Everything Below It.",
    careIntro:
      "An event this precisely timed leaves no room for logistics to go wrong — so we've built the day around removing every one of them.",
    careItems: [
      "Airport arrival and transfer",
      "Luxury hotel accommodation",
      "A private Egyptologist guide throughout",
      "Certified ISO 12312-2 solar viewers for every guest",
      "A pre-briefed, comfortable eclipse viewing setup",
      "All transportation, timed with safety margin",
      "Meals as noted in the itinerary",
      "One point of contact for anything that comes up",
    ],
    hosts,
    faqs: [
      {
        question: "Is the eclipse viewing location guaranteed?",
        answer:
          "Not yet, this far out — and we won't pretend otherwise. We're evaluating several strong options around Luxor and will confirm the exact site closer to the event, based on access, crowd management, and local authority arrangements. Wherever we land, it will be chosen for horizon, comfort, and shade.",
      },
      {
        question: "Is it actually safe to look at the eclipse?",
        answer:
          "During the partial phases — before and after totality — looking directly at the sun without certified eclipse protection can cause serious eye injury. We provide ISO 12312-2 certified solar viewers for every guest. The only time it's safe to view without protection is during totality itself, when the sun is completely covered — roughly six minutes and twenty-two seconds in Luxor.",
      },
      {
        question: "What if it's cloudy on the day?",
        answer:
          "Nobody can guarantee weather two years out, but Luxor has among the best odds on the entire 2027 eclipse path — historically clear skies on this date roughly four years out of five.",
      },
      {
        question: "How hot will it be?",
        answer:
          "August in Luxor is genuinely hot, with midday temperatures that can reach the low-to-mid 40s°C (over 100°F). The itinerary is built around that — West Bank sightseeing early, rest through the hottest hours, and shaded seating for the eclipse itself.",
      },
    ],
  },
  {
    status: "published",
    order: 2,
    slug: "november-group-trip-2026",
    name: "November Group Trip 2026",
    forWhom: "For travelers who want Egypt's essentials — Cairo, Giza, Aswan, and a Nile cruise to Luxor — on one set departure, fully arranged, without piecing it together themselves.",
    emotionalHeadline: "One Set Departure. Every Detail Already Arranged.",
    shortDescription:
      "An 8-day group departure from 22–30 November 2026, covering Cairo, Giza, Aswan, and a Nile cruise to Luxor, with a private certified Egyptologist guide throughout. Choose a 3★ or 5★ hotel — both pair with a 5★ Nile Cruise — with rates starting from $1,500 per person.",
    heroImageTone: "nile",
    heroImage: "/photos/pexels-37559132.jpg",
    duration: "8 days",
    groupSize: "Set group departure — book your spot",
    luxuryLevel: "Choice of 3★ or 5★ hotel, both paired with a 5★ Nile Cruise",
    location: "Cairo · Giza · Aswan · Luxor · Nile Cruise",
    price: { amount: 1500, note: "From $1,500 per person, double occupancy" },
    whoIsThisForTitle: "Who This Is For",
    whoIsThisForBody:
      "This is for travelers who want Egypt's core route — the Pyramids, Old Cairo, Aswan, Abu Simbel, and a Nile cruise into Luxor — without spending weeks arranging hotels, internal flights, a cruise, and a guide themselves. It's a set departure: everyone travels the same dates, 22–30 November 2026, with a private certified Egyptologist guide throughout and every transfer, entrance fee, and cruise night already arranged.",
    whyWeCreatedThisTitle: "Why We Created This",
    whyWeCreatedThisBody:
      "Building a first Egypt trip from scratch means coordinating a Cairo hotel, a domestic flight to Aswan, a multi-night Nile cruise, a Luxor departure, and a guide who can actually explain what you're looking at — usually across several separate bookings. This trip bundles all of it into one itinerary, one guide, and one price, with two hotel/cruise tiers depending on what you'd like your trip to feel like.",
    experienceIntro:
      "Eight days moving from Cairo's icons to a Nile cruise through Aswan, Abu Simbel, and Luxor — here's a glimpse of the route.",
    experienceHighlights: [
      {
        title: "Giza, with a professional photoshoot",
        description:
          "The Pyramids of Giza, a camel or horse ride, the Grand Sphinx, and a professional photoshoot at the Pyramids, followed by a visit to the Grand Egyptian Museum.",
      },
      {
        title: "Old Cairo in a day",
        description:
          "Coptic Cairo's churches, the National Civilizations Museum, and Khan el-Khalili's old market — Cairo's historic and Islamic quarters, covered together.",
      },
      {
        title: "A Nile cruise from Aswan to Luxor",
        description:
          "Philae Temple, the Nubian Village, Kom Ombo, and Edfu's Horus Temple, sailing between them aboard your Nile cruise ship, with dinner and overnight stays on board.",
      },
      {
        title: "A full day at Abu Simbel",
        description:
          "An early departure from the cruise for Abu Simbel's colossal temples, before returning to the ship — one of the trip's dedicated full days.",
      },
    ],
    itineraryDays: [
      {
        dayNumber: 1,
        title: "Arrival Day",
        description: "Landing in Cairo and settling in — nothing else scheduled.",
        items: [
          {
            time: "Flexible",
            title: "Pick up from Cairo Airport",
            description: "Met on arrival and taken to your private, air-conditioned transfer bus.",
            location: "Cairo International Airport",
            category: "Travel",
            includedOrOptional: "included",
          },
          {
            time: "Flexible",
            title: "Transfer to the hotel",
            description: "A private AC bus transfer from the airport to your hotel in Cairo.",
            category: "Travel",
            includedOrOptional: "included",
          },
          {
            time: "Flexible",
            title: "Check in and relax",
            description: "Check-in and a free evening to rest after the flight.",
            category: "Free Time",
            includedOrOptional: "included",
          },
        ],
      },
      {
        dayNumber: 2,
        title: "Giza Tour Day",
        items: [
          { time: "08:00", title: "Breakfast at the hotel", description: "Breakfast before the day's pickup.", category: "Dining", includedOrOptional: "included" },
          { time: "09:00", title: "Pick up from the hotel", description: "Departure for the Pyramids of Giza Complex.", category: "Travel", includedOrOptional: "included" },
          { time: "09:30", title: "Pyramids of Giza Complex", description: "The Pyramids of Giza, with a camel or horse ride included.", location: "Giza", category: "Sightseeing", includedOrOptional: "included" },
          { time: "10:30", title: "Professional photoshoot at the Pyramids", description: "A professional photoshoot with the Pyramids as the backdrop.", location: "Giza", category: "Photoshoot", includedOrOptional: "included" },
          { time: "11:30", title: "The Grand Sphinx", description: "A visit to the Great Sphinx of Giza.", location: "Giza", category: "Sightseeing", includedOrOptional: "included" },
          { time: "12:30", title: "Oils and essence factory", description: "A stop at a local oils and essence factory.", category: "Sightseeing", includedOrOptional: "included" },
          { time: "13:30", title: "Lunch", description: "An included lunch during the day's touring.", category: "Dining", includedOrOptional: "included" },
          { time: "15:00", title: "The Grand Egyptian Museum (GEM)", description: "A visit to the Grand Egyptian Museum.", category: "Sightseeing", includedOrOptional: "included" },
          { time: "17:30", title: "Back to the hotel", description: "Return transfer to the hotel.", category: "Travel", includedOrOptional: "included" },
        ],
      },
      {
        dayNumber: 3,
        title: "Old Cairo Tour Day",
        items: [
          { time: "08:00", title: "Breakfast at the hotel", description: "Breakfast before the day's pickup.", category: "Dining", includedOrOptional: "included" },
          { time: "09:00", title: "Pick up from the hotel", description: "Departure for Old Cairo.", category: "Travel", includedOrOptional: "included" },
          { time: "09:30", title: "Old Cairo & Coptic Cairo churches", description: "Old Cairo's historic Coptic churches.", location: "Old Cairo", category: "Sightseeing", includedOrOptional: "included" },
          { time: "11:00", title: "The National Civilizations Museum", description: "A visit to the National Museum of Egyptian Civilization.", category: "Sightseeing", includedOrOptional: "included" },
          { time: "13:00", title: "Lunch", description: "An included lunch during the day's touring.", category: "Dining", includedOrOptional: "included" },
          { time: "14:30", title: "Khan el-Khalili, the old market", description: "Time to explore Khan el-Khalili's historic bazaar.", location: "Khan el-Khalili", category: "Free Time", includedOrOptional: "included" },
          { time: "17:00", title: "Back to the hotel", description: "Return transfer to the hotel.", category: "Travel", includedOrOptional: "included" },
        ],
      },
      {
        dayNumber: 4,
        title: "Aswan Tour Day",
        description: "Flying to Aswan and boarding the Nile cruise.",
        items: [
          { time: "Flexible", title: "Pick up from the hotel", description: "Transfer to Cairo Airport for your flight to Aswan.", category: "Travel", includedOrOptional: "included" },
          { time: "Flexible", title: "Flight to Aswan", description: "Domestic flight from Cairo to Aswan.", category: "Travel", includedOrOptional: "included" },
          { time: "Flexible", title: "Pick up from Aswan Airport", description: "Met on arrival in Aswan.", location: "Aswan Airport", category: "Travel", includedOrOptional: "included" },
          { time: "Flexible", title: "Philae Temple", description: "A visit to Philae Temple.", location: "Aswan", category: "Sightseeing", includedOrOptional: "included" },
          { time: "Flexible", title: "Check in to the Nile Cruise & lunch", description: "Boarding your Nile cruise ship, with lunch on board.", location: "Aswan", category: "Dining", includedOrOptional: "included" },
          { time: "Flexible", title: "Nubian Village", description: "Exploring Nubian culture with a visit to a Nubian village.", location: "Aswan", category: "Sightseeing", includedOrOptional: "included" },
          { time: "Evening", title: "Dinner & overnight on the cruise", description: "Dinner and an overnight stay aboard the ship.", category: "Dining", includedOrOptional: "included" },
        ],
      },
      {
        dayNumber: 5,
        title: "Abu Simbel Tour Day",
        items: [
          { time: "Early morning", title: "Breakfast box prepared", description: "An early breakfast box prepared for the day trip.", category: "Dining", includedOrOptional: "included" },
          { time: "Early morning", title: "Early pick up from the cruise", description: "Early departure for Abu Simbel.", category: "Travel", includedOrOptional: "included" },
          { time: "Morning", title: "Abu Simbel Temple", description: "The colossal temples of Abu Simbel.", location: "Abu Simbel", category: "Sightseeing", includedOrOptional: "included" },
          { time: "Midday", title: "Back to the cruise for lunch", description: "Return to the ship for lunch.", category: "Dining", includedOrOptional: "included" },
          { time: "Afternoon", title: "Kom Ombo Temple", description: "A visit to Kom Ombo's riverside temple.", location: "Kom Ombo", category: "Sightseeing", includedOrOptional: "optional", notes: "Marked optional in the itinerary." },
          { time: "Evening", title: "Dinner & overnight by the cruise", description: "Dinner and an overnight stay aboard the ship.", category: "Dining", includedOrOptional: "included" },
        ],
      },
      {
        dayNumber: 6,
        title: "Horus & East Bank Tour Day",
        items: [
          { time: "Morning", title: "Breakfast on the Nile Cruise", description: "Breakfast aboard the ship.", category: "Dining", includedOrOptional: "included" },
          { time: "Morning", title: "Early pick up from the cruise", description: "Departure for Horus Temple.", category: "Travel", includedOrOptional: "optional", notes: "Marked optional in the itinerary." },
          { time: "Morning", title: "Horus Temple, Edfu", description: "A visit to the Temple of Horus at Edfu.", location: "Edfu", category: "Sightseeing", includedOrOptional: "included" },
          { time: "Midday", title: "Lunch on the cruise", description: "Return to the ship for lunch.", category: "Dining", includedOrOptional: "included" },
          { time: "Evening", title: "Luxor East Bank temples", description: "Exploring Luxor's East Bank temples in the evening, timed around the cruise's sailing schedule.", location: "Luxor", category: "Sightseeing", includedOrOptional: "included" },
          { time: "Evening", title: "Luxor Temple", description: "A visit to Luxor Temple.", location: "Luxor", category: "Sightseeing", includedOrOptional: "included" },
          { time: "Evening", title: "Karnak Temple", description: "A visit to the Karnak Temple complex.", location: "Luxor", category: "Sightseeing", includedOrOptional: "included" },
          { time: "Night", title: "Dinner on the cruise", description: "Return to the ship for dinner.", category: "Dining", includedOrOptional: "included" },
        ],
      },
      {
        dayNumber: 7,
        title: "Luxor West Bank Tour Day",
        description: "Luxor's West Bank, then a return flight to Cairo.",
        items: [
          { time: "Morning", title: "Breakfast on the Nile Cruise", description: "Breakfast aboard the ship.", category: "Dining", includedOrOptional: "included" },
          { time: "Morning", title: "Pick up from the Nile Cruise", description: "Departure for Luxor's West Bank.", category: "Travel", includedOrOptional: "included" },
          { time: "Morning", title: "Valley of the Kings", description: "The UNESCO-listed Valley of the Kings.", location: "Luxor West Bank", category: "Sightseeing", includedOrOptional: "included" },
          { time: "Morning", title: "Temple of Hatshepsut", description: "A colonnaded temple surrounded by cliffs.", location: "Luxor West Bank", category: "Sightseeing", includedOrOptional: "included" },
          { time: "Midday", title: "Alabaster & marble workshop", description: "A free visit to an alabaster and marble workshop, with a demonstration of grinding alabaster the old-fashioned way.", location: "Luxor West Bank", category: "Sightseeing", includedOrOptional: "included" },
          { time: "Midday", title: "Colossi of Memnon", description: "A stop at the Colossi of Memnon.", location: "Luxor West Bank", category: "Sightseeing", includedOrOptional: "included" },
          { time: "13:00", title: "Lunch", description: "An included Egyptian lunch.", category: "Dining", includedOrOptional: "included" },
          { time: "Afternoon", title: "Drop off at Luxor Airport", description: "Transfer to Luxor Airport for your flight to Cairo.", location: "Luxor Airport", category: "Travel", includedOrOptional: "included" },
          { time: "Afternoon", title: "Pick up from Cairo Airport", description: "Met on arrival back in Cairo.", location: "Cairo Airport", category: "Travel", includedOrOptional: "included" },
          { time: "Evening", title: "Check in and resting", description: "Transfer to the hotel, check-in, and a free evening.", category: "Free Time", includedOrOptional: "included" },
        ],
      },
      {
        dayNumber: 8,
        title: "Departure Day",
        items: [
          { time: "Flexible", title: "Pick up from the hotel", description: "Transfer to Cairo Airport for your departure flight.", category: "Travel", includedOrOptional: "included" },
          { time: "Flexible", title: "Flight back home", description: "Departure flight home.", category: "Travel", includedOrOptional: "included" },
        ],
      },
    ],
    careTitle: "One Guide, One Itinerary, Every Detail Already Arranged",
    careIntro:
      "Everything below is arranged before you land — you're following one itinerary with one guide, not coordinating separate bookings.",
    careItems: [
      "A professional, certified English-speaking Egyptologist guide",
      "All in-town private transfers",
      "Admission and entry fees to every historical site on the itinerary",
      "Parking fees and road tolls for the whole itinerary",
      "Every tour and activity mentioned in the program",
      "24-hour follow-up and service throughout the trip",
      "Nile cruise accommodation",
      "Hotel accommodation",
      "6 breakfasts, 6 lunches, and 3 dinners",
    ],
    faqs: [
      {
        question: "What are the hotel and cruise tier options?",
        answer:
          "Two tiers: a 5★ hotel (Giza Palace or similar) with a 5★ Premium Nile Cruise (MS Concerto or similar) — $2,000 per person double, $3,500 single. Or a 3★ hotel (Pyramids New Height or similar) with a 5★ Standard Nile Cruise (Semiramis II or similar) — $1,500 per person double, $2,400 single. All rates are per person.",
      },
      {
        question: "What's not included?",
        answer:
          "Tipping for guides and drivers, optional tours and tickets (like the Kom Ombo stop on Day 5), PCR test fees, any tours or meals not mentioned in the program, and shopping or souvenirs.",
      },
      {
        question: "Is this a private trip, or does it depart on fixed dates?",
        answer:
          "This is a set group departure — everyone on this trip travels the same 22–30 November 2026 dates. If you need different dates or a fully private itinerary, ask us about our other Egypt trips instead.",
      },
      {
        question: "Can I customize the itinerary?",
        answer:
          "The hotel and cruise tier are yours to choose, and a couple of stops (Kom Ombo on Day 5, the early Horus Temple departure on Day 6) are marked optional. The core route and dates are fixed for this group departure.",
      },
    ],
  },
];
