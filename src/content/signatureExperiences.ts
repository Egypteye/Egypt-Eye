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
    duration: "5 days, 4 nights",
    groupSize: "Private — just you, or with the friends you bring",
    luxuryLevel: "Ultra-Luxury, Fully Private",
    location: "Cairo · Giza · the Nile · Red Sea (customizable)",
    price: { amount: null, note: "Ask us for a personal quote" },
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
];
