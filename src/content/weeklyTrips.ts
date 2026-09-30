import type { WeeklyTrip } from "./types";

// The Weekly Trips catalogue: the trips Egypt Eye runs on fixed dates, that
// travellers join by the seat.
//
// WHY THIS PRODUCT EXISTS, since it reads as a contradiction of the rest of
// the site. Egypt Eye sells private tours, and says so loudly. Almost every
// Egyptian operator does — search any of these destinations and the results
// are private tours bookable on any date you like. The international
// small-group operators (WeRoad, Flash Pack, Explore) sell the opposite, but
// only as 8-to-14-day itineraries you fly in for.
//
// Nobody owns the middle: short, fixed-date, seat-priced departures leaving
// Cairo, published as a calendar you can actually look at. That is the whole
// idea. It reaches three groups the private catalogue cannot — solo
// travellers who won't pay a private rate, people already in Egypt with a
// free weekend, and residents and expats in Cairo — and it does it with the
// vehicles, guides and destinations Egypt Eye already runs.
//
// WHAT IS NOT IN THIS FILE. Dates, prices, seats, and capacity. Those belong
// to a departure (supabase/migrations/0018_weekly_trips.sql), because they
// change weekly and the team edits them without a deploy. A trip is the
// repeatable half: what it is, where it goes, what's included, when in the
// year it can run at all.
//
// HOW THESE SIX WERE CHOSEN. Each one is somewhere Egypt Eye can genuinely
// operate from Cairo, has real standing demand, and works better shared than
// private — either because the cost of the vehicle is the cost of the trip
// (the desert runs), or because the group is part of the experience (the
// camps). Seasons are stated because they are hard operational limits, not
// marketing: the White Desert is not bookable in July.
//
// PHOTOGRAPHY. Each trip currently reuses the verified photo its matching
// destination hub already uses (see destinationHubs.ts) rather than a new
// Unsplash ID, so nothing here can point at a photo that doesn't exist.
// Replacing them with Egypt Eye's own photography is a straight swap.

export const weeklyTrips: WeeklyTrip[] = [
  {
    slug: "white-desert-overnight-camp",
    title: "White Desert Overnight Camp",
    tagline: "Chalk formations, a fire, and a sky with nothing in the way of it",
    category: "desert",
    duration: "2 days, 1 night",
    nights: 1,
    departsFrom: "Cairo",
    destinations: ["Bahariya Oasis", "White Desert"],
    featured: true,
    imageLabel: "White Desert",
    image:
      "https://images.unsplash.com/photo-1708008434267-dbd151d62a54?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    imageTone: "desert",
    season: "October to April. The desert is genuinely dangerous in high summer, so we don't run it.",
    typicalGroupSize: "Up to 12 travellers",
    description:
      "Four hours southwest of Cairo the tarmac reaches Bahariya, and after that it's 4WD tracks. The Black Desert comes first — low hills capped in dark volcanic ash, which is not what most people picture when they picture Egypt. Then the White Desert, where wind has cut the chalk into shapes that read as mushrooms, towers, and things harder to name. We camp among them. There is no light pollution for a very long way in any direction, which is the actual reason to stay the night rather than drive out and back.",
    highlights: [
      "Camping inside the White Desert protectorate, not at a roadside camp outside it",
      "The Black Desert's ash-capped hills and the Crystal Mountain on the way in",
      "Dinner cooked over a fire, and a sky with no town near enough to dim it",
      "Sunrise on the chalk formations before anyone else reaches them",
    ],
    included: [
      "Return transport from Cairo and 4WD through the desert sections",
      "One night camping with tents, bedding, and mats",
      "Dinner, breakfast, water, and tea through the trip",
      "Bahariya and White Desert protectorate entry fees",
      "A driver-guide who runs this route regularly",
    ],
    excluded: ["Lunch on the road", "Alcohol", "Personal equipment", "Tips"],
    bringWithYou: [
      "A genuinely warm layer — desert nights run 5–12°C between November and February, whatever the afternoon felt like",
      "A head torch, which is the difference between finding your tent and not",
      "Closed shoes for walking on chalk and gravel",
      "More water than you think, and sun cover for the daytime driving",
    ],
    plan: [
      {
        title: "Early morning — leave Cairo",
        description:
          "A pre-dawn pickup and the drive southwest. Roughly four hours to Bahariya with a stop on the way.",
      },
      {
        title: "Midday — Bahariya and the Black Desert",
        description:
          "Lunch in the oasis, then the switch to 4WD and the first desert section: the ash-capped hills, and Crystal Mountain.",
      },
      {
        title: "Late afternoon — into the White Desert",
        description:
          "Through the formations to the camp site, with time to walk among them while the light is still low and warm.",
      },
      {
        title: "Evening — camp",
        description: "Dinner over a fire, then the sky. This is the part of the trip people actually come back for.",
      },
      {
        title: "Next morning — sunrise, then Cairo",
        description:
          "First light on the chalk, breakfast, and the drive back. Usually into Cairo by early evening.",
      },
    ],
    physicalLevel: {
      tier: "moderate",
      note: "No hiking to speak of, but it is a long drive, a night on a mat on the ground, and cold mornings. The effort is the camping, not the walking.",
    },
    faqs: [
      {
        question: "How cold does it actually get at night?",
        answer:
          "Between November and February, overnight lows in the Western Desert are commonly 5–12°C, and it drops fast once the sun goes. Daytime in the same period sits around 18–26°C, which is why people underpack. A proper warm layer is not optional.",
      },
      {
        question: "What are the toilet and washing arrangements?",
        answer:
          "It is desert camping. There is no plumbing at the camp site — the arrangement is a screened area, and you wash properly the next day. Anyone who would rather not should look at the Fayoum day trip instead.",
      },
      {
        question: "Can I do this as a day trip instead?",
        answer:
          "You can reach the White Desert and return in a very long day, but the night is the reason to go. Without it you have done eight hours of driving to look at rocks in flat midday light.",
      },
      {
        question: "Is the group mixed?",
        answer:
          "Yes — that is the format. Seats are sold individually, so you will be travelling with people you haven't met. If you want the desert to yourself, we run the same route as a private trip.",
      },
    ],
    relatedTourSlugs: ["white-desert-safari-bahariya"],
    relatedStorySlugs: [],
    seo: {
      seoTitle: "White Desert Overnight Camp from Cairo — Join a Small Group",
      seoDescription:
        "Join a fixed-date overnight camping trip to Egypt's White Desert from Cairo. Small group, seats sold individually, October to April. See the next departures and what's left.",
    },
  },

  {
    // The dated half of this trip — 10-11 October 2026, eight seats, four sold,
    // and the price — is a departure row, not content. See the note at the top
    // of this file: it changes without a deploy, so it lives in Supabase and is
    // created in /admin/departures. Everything here is the repeatable half.
    //
    // It deliberately does not cannibalise wadi-el-hitan-fayoum-day-trip below.
    // That one is the lakes-and-waterfalls day, back in Cairo by evening; this
    // one is the overnight, and the night is the product. They cross-link.
    slug: "wadi-el-hitan-moonless-night-camp",
    title: "Moonless Night in Wadi El Hitan",
    tagline: "Forty million years of whale bone by day, and a sky with no moon in it by night",
    category: "desert",
    duration: "2 days, 1 night",
    nights: 1,
    departsFrom: "Cairo",
    destinations: ["Fayoum", "Wadi El Hitan"],
    imageLabel: "The desert after dark",
    // Departs from the reuse-a-hub-photo convention above, deliberately: no
    // destination hub has a night photograph, and a daytime lake shot would
    // sell the wrong half of this trip. Verified through the Unsplash API
    // rather than recalled, and credited below.
    image:
      "https://images.unsplash.com/photo-1654330352875-1f86a5b011cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    imageTone: "desert",
    imageCredit: {
      source: "Unsplash",
      creator: "Yuheng Mei",
      sourceUrl:
        "https://unsplash.com/photos/the-night-sky-with-stars-above-a-desert-landscape-cCtH0EZhoXA",
      license: "Unsplash License",
    },
    season:
      "October to April, and this departure is dated to the new moon. Wadi El Hitan is open year-round but the desert is too hot to camp in comfortably from June to August.",
    typicalGroupSize: "Maximum 8 travellers",
    description:
      "Wadi El Hitan was inscribed by UNESCO in 2005 as Egypt's first natural World Heritage site, for the whale skeletons lying exposed in it. They are roughly forty million years old, from the point in the story where whales still had back legs, and this desert was the floor of a sea. They have not been moved: the fossils sit on the surface where they were found, and the valley is closed to vehicles, so you walk to them along a set trail. Then the day turns. A 4x4 takes the group out into the open desert beyond the protected area, there are dunes to sandboard if you want them, and a camp for the night. The night is the reason for the date — the new moon falls on 10-11 October, which means no moonlight at all between dusk and dawn. This is the darkest the sky gets, 150 kilometres from Cairo.",
    highlights: [
      "Whale skeletons lying where they were found, walked rather than driven past",
      "Egypt's first natural UNESCO World Heritage site, inscribed in 2005",
      "The open-air fossil museum at the heart of the protected area",
      "4x4 into the desert beyond the fossil valley, where vehicles are allowed",
      "Sandboarding on the dunes",
      "A night at a desert camp, timed to the new moon — no moonlight until dawn",
      "Sunrise over the desert before the drive back",
      "Eight seats in the vehicle, and a content creator travelling with the group",
    ],
    included: [
      "Return transport from Cairo in a luxury 8-seat vehicle",
      "4x4 desert transport where the route calls for it",
      "A guide for both days",
      "A content creator travelling with the group",
      "The Wadi El Hitan visit, including the open-air museum",
      "Desert safari beyond the protected area",
      "Sandboarding",
      "Lunch, a barbecue dinner and breakfast — vegan options on request",
      "One night at a desert camp",
      "The stargazing session after dark",
    ],
    // Deliberately empty until Egypt Eye confirms what sits outside the price
    // for THIS departure. The page hides the block rather than showing a guess,
    // and a guess here is the one that costs a traveller money at a gate.
    excluded: [],
    bringWithYou: [
      "A warm layer. October days are mild and the desert drops sharply once the sun is down.",
      "A head torch, ideally one with a red setting — white light ruins everyone's night vision, including yours.",
      "Closed shoes for the fossil trail and the dunes.",
      "Sun cover. There is very little shade anywhere on the site.",
    ],
    plan: [
      {
        title: "07:00 — pickup in Cairo",
        description:
          "The one fixed time in the itinerary. Everything after it moves with the group and the light.",
      },
      {
        title: "Morning — south-west into Fayoum",
        description:
          "Out of the city and into farmland, then the road narrows towards the protected area and the green stops.",
      },
      {
        title: "Wadi El Hitan",
        description:
          "The fossil valley on foot, along the marked trail, with the skeletons and the open-air museum. Vehicles are not permitted here — this part is walked, which is also the only way to see it properly.",
      },
      {
        title: "Afternoon — desert and dunes",
        description:
          "By 4x4 out past the boundary of the protected area, where driving is allowed, and onto the dunes for sandboarding.",
      },
      {
        title: "Evening — camp",
        description:
          "Into camp with enough of the day left for the light to go. Dinner is a barbecue; vegan plates are made to order if you tell us in advance.",
      },
      {
        title: "After dark — the sky",
        description:
          "The reason the date was chosen. No moon rises, so the sky stays as dark as it gets all night, and there is nothing to do but look at it.",
      },
      {
        title: "Sunrise",
        description:
          "Worth the alarm. The desert changes colour twice in about twenty minutes and then the day is ordinary again.",
      },
      {
        title: "Breakfast, then Cairo",
        description: "Back on the road after breakfast, into Cairo in the morning.",
      },
    ],
    physicalLevel: {
      tier: "moderate",
      note: "The fossil trail is a flat loop on open ground with no climbing. What makes this a moderate rather than an easy trip is the shape of it: an early start, hours in a vehicle, soft sand if you sandboard, and a night spent outdoors rather than in a hotel.",
    },
    faqs: [
      {
        question: "Where exactly is Wadi El Hitan, and how far is it from Cairo?",
        answer:
          "About 150 kilometres south-west of Cairo, past Fayoum, inside the Wadi El Rayan protected area. The drive is the long part of the morning, which is why the pickup is at 07:00 — it puts the group at the fossil valley with the day still ahead of them rather than half gone.",
      },
      {
        question: "What does a moonless night actually mean?",
        answer:
          "The new moon falls on 10-11 October 2026, so the moon is between us and the sun and effectively no moonlight reaches the ground. A full moon is bright enough to read by and washes all but the brightest stars out of the sky; a new moon removes that entirely. It is the single biggest thing you can control about a night sky, and it is why this departure sits on this date rather than a more convenient one.",
      },
      {
        question: "Will we see the Milky Way?",
        answer:
          "We do not promise specific objects, and you should be sceptical of anyone who does. What we can say is that a moonless sky away from city light is the condition that makes the Milky Way visible at all — beyond that it comes down to cloud and haze on the night, which nobody can book in advance.",
      },
      {
        question: "How is this different from your Wadi El Hitan day trip?",
        answer:
          "The day trip pairs the fossil valley with Wadi El Rayan's waterfalls and the Magic Lake and has you back in Cairo the same evening. This one gives up the lakes and spends the time on the desert instead — 4x4, dunes, a camp and the night sky. If the fossils and the landscape are what you want, take the day trip. If the night is what you want, take this.",
      },
      {
        question: "Is the 4x4 and the sandboarding included, or extra?",
        answer:
          "Both are included. The 4x4 is how the group reaches the open desert past the boundary of the protected area, since vehicles are not permitted in the fossil valley itself, and the boards come with it. Sandboarding is optional on the day — nobody is counted down a dune.",
      },
      {
        question: "How many people will be on the trip?",
        answer:
          "Eight at the absolute most, because that is the size of the vehicle. It is not a coach trip and it is not sold as one. The seats left on this departure are shown on this page and update as they go.",
      },
      {
        question: "Can a solo traveller join?",
        answer:
          "Yes — that is much of the point of Weekly Trips. Seats are sold individually rather than by the vehicle, so you are not paying a private rate to travel alone, and on an eight-seat departure you will know everyone by the end of the first day.",
      },
      {
        question: "Is food included, and can you cater for vegans?",
        answer:
          "Lunch, a barbecue dinner and breakfast the next morning are included. Vegan plates are made to order — tell us when you book rather than on the day, because the food travels out to the camp with the group.",
      },
      {
        question: "Is October a good time for this?",
        answer:
          "It is one of the better months. The camping season in this part of the desert runs roughly October to April; before that it is too hot to enjoy a night outdoors, and this particular date was chosen for the moon rather than the temperature. Days are mild and nights are cold enough that a warm layer matters.",
      },
      {
        question: "What happens if the weather spoils the stargazing?",
        answer:
          "Cloud is the one part of this nobody controls, and we would rather say so here than in the desert. The trip runs regardless — the fossils, the 4x4, the dunes and the camp are unaffected by an overcast sky. What we cannot do is guarantee the stars, and we do not price the trip as though we could.",
      },
    ],
    relatedTourSlugs: ["fayoum-nature-tour", "fayoum-wadi-el-rayan-waterfalls-tour"],
    relatedStorySlugs: ["wadi-el-hitan-whale-valley-guide", "fayoum-photoshoot-guide"],
    seo: {
      seoTitle: "Moonless Night in Wadi El Hitan — Stargazing Camp, 10-11 Oct 2026",
      seoDescription:
        "A two-day small-group trip from Cairo to Wadi El Hitan's whale fossils, with 4x4 desert safari, sandboarding and a night at a desert camp timed to the new moon. Eight seats only.",
    },
  },

  {
    slug: "wadi-el-hitan-fayoum-day-trip",
    title: "Wadi El Hitan & the Fayoum Lakes",
    tagline: "Whale skeletons in a desert, and waterfalls two hours from Cairo",
    category: "nature",
    duration: "One long day",
    nights: 0,
    departsFrom: "Cairo",
    destinations: ["Fayoum", "Wadi El Hitan", "Wadi El Rayan"],
    featured: true,
    imageLabel: "Fayoum",
    image:
      "https://images.unsplash.com/photo-1591055801290-a3a48a4a0ec5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    imageTone: "desert",
    season: "October to April. Workable in spring and autumn shoulder weeks; too hot to enjoy June to August.",
    typicalGroupSize: "Up to 14 travellers",
    description:
      "Wadi El Hitan is a UNESCO World Heritage site because of what is lying in it: the fossilised skeletons of early whales, from a period when they still had back legs and this desert was ocean floor. They are in open air, where they were found. The same day takes in Wadi El Rayan's waterfalls and the Magic Lake, which is the shorthand for the fact that a country most people associate with sand and stone also has lakes, reedbeds and a completely different palette about two hours from the capital.",
    highlights: [
      "The fossil valley at Wadi El Hitan, walked rather than driven past",
      "Wadi El Rayan's waterfalls and lakes, which is not the Egypt most visitors see",
      "Dune sections by 4WD between the two",
      "Back in Cairo the same evening — no accommodation to arrange",
    ],
    included: [
      "Return transport from Cairo and the 4WD section through the protectorate",
      "Wadi El Hitan and Wadi El Rayan entry fees",
      "Lunch and drinking water",
      "A guide through the fossil site",
    ],
    excluded: ["Hotel pickups outside central Cairo and Giza", "Tips", "Anything bought at the site"],
    bringWithYou: [
      "Walking shoes — the fossil trail is a loop on open ground",
      "Sun cover: there is very little shade at either site",
      "A swimsuit between April and October if you want the lake",
    ],
    plan: [
      {
        title: "Morning — Cairo to Fayoum",
        description: "An early start and roughly two hours' drive, arriving before the heat builds.",
      },
      {
        title: "Late morning — Wadi El Rayan",
        description: "The waterfalls and the lakes, then the dune sections by 4WD.",
      },
      { title: "Midday — lunch", description: "Eaten out at the lakes rather than back in town." },
      {
        title: "Afternoon — Wadi El Hitan",
        description:
          "The fossil valley and its open-air museum, walked as a loop with time at the skeletons themselves.",
      },
      { title: "Evening — back to Cairo", description: "Returning in the early evening." },
    ],
    physicalLevel: {
      tier: "easy",
      note: "A flat walking loop at the fossil site and some soft sand underfoot. The demanding part is the length of the day and the sun, not the terrain.",
    },
    faqs: [
      {
        question: "Is this worth it if I'm not interested in fossils?",
        answer:
          "Most people book it for the landscape and come away talking about the whales. But the honest answer is that if neither the fossils nor the lakes appeal, the desert camp or Dahshur will suit you better.",
      },
      {
        question: "How much walking is there?",
        answer:
          "The Wadi El Hitan trail is a flat loop of roughly three kilometres in open desert, taken at an unhurried pace. There is no climbing.",
      },
      {
        question: "Can children come?",
        answer:
          "Yes, and it is one of the better trips on this list for them — the fossils are the sort of thing that lands. It is still a long day in a vehicle, which is the part to weigh up.",
      },
    ],
    relatedTourSlugs: ["fayoum-nature-tour"],
    relatedStorySlugs: [],
    seo: {
      seoTitle: "Wadi El Hitan Day Trip from Cairo — Fixed Dates, Join a Group",
      seoDescription:
        "A scheduled small-group day trip from Cairo to Wadi El Hitan's whale fossils, Wadi El Rayan's waterfalls and the Magic Lake. Seats sold individually — see upcoming dates.",
    },
  },

  {
    slug: "dahshur-saqqara-memphis-day-trip",
    title: "Dahshur, Saqqara & Memphis",
    tagline: "The pyramids almost nobody is standing in front of",
    category: "ancient",
    duration: "One day",
    nights: 0,
    departsFrom: "Cairo",
    destinations: ["Dahshur", "Saqqara", "Memphis"],
    imageLabel: "The pyramid fields",
    image:
      "https://images.unsplash.com/photo-1639901375872-9e7218d6c64d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    imageTone: "giza",
    season: "All year. Best October to April; summer departures start earlier to stay ahead of the heat.",
    typicalGroupSize: "Up to 14 travellers",
    description:
      "Giza is the one everybody photographs. Saqqara is where the idea started — Djoser's Step Pyramid is the oldest of them, and the thing every later pyramid was an attempt to improve on. Dahshur is where they worked out how: the Bent Pyramid, where the angle changes partway up because the original one wasn't going to hold, and the Red Pyramid beside it, which is what they built once they knew. You can usually walk into the Red Pyramid with nobody else in the passage. Memphis, the capital all of this served, closes the day.",
    highlights: [
      "The Bent Pyramid and the Red Pyramid at Dahshur, both usually near-empty",
      "Djoser's Step Pyramid at Saqqara, the oldest large stone building anywhere",
      "Going inside a pyramid without a queue for the passage",
      "Memphis, and the colossal Ramesses II lying in its own hall",
    ],
    included: [
      "Return transport from Cairo",
      "Entry to Dahshur, Saqqara and Memphis",
      "An Egyptologist guide for the day",
      "Lunch and drinking water",
    ],
    excluded: [
      "The separate ticket to enter the Step Pyramid's interior",
      "Tips",
      "Hotel pickups outside central Cairo and Giza",
    ],
    bringWithYou: [
      "Shoes you can go down a sloped passage in",
      "A hat and water — the sites are open ground",
      "Cash for the optional interior tickets",
    ],
    plan: [
      {
        title: "Morning — Dahshur",
        description:
          "Straight to the quietest site first, while the light is low: the Bent Pyramid, then the Red Pyramid and its interior passage.",
      },
      {
        title: "Late morning — Saqqara",
        description: "The Step Pyramid complex and the surrounding necropolis with the guide.",
      },
      { title: "Midday — lunch", description: "A stop before the last site." },
      {
        title: "Afternoon — Memphis",
        description: "The open-air museum on the site of the old capital, and back into Cairo.",
      },
    ],
    physicalLevel: {
      tier: "moderate",
      note: "Walking on sand and uneven stone all day. The pyramid interiors are a stooped descent down a steep, narrow, warm passage — skippable, and worth skipping if stairs or enclosed spaces are a problem.",
    },
    faqs: [
      {
        question: "How is this different from a Giza tour?",
        answer:
          "Different sites entirely, and far fewer people at them. Giza has the Great Pyramid and the Sphinx; this day has the older pyramids that explain how Giza became possible. Most people who have a few days in Cairo do both.",
      },
      {
        question: "Can I actually go inside?",
        answer:
          "At the Red Pyramid, yes, and usually without waiting. It is a long stooped walk down a narrow passage and it is warm inside — genuinely not for everyone, and nobody minds if you wait outside.",
      },
      {
        question: "Does this include Giza?",
        answer:
          "No, deliberately. Adding Giza would make it a rushed day at four sites. We run Giza as its own private tour.",
      },
    ],
    relatedTourSlugs: ["1-day-giza-tour"],
    relatedStorySlugs: [],
    seo: {
      seoTitle: "Dahshur, Saqqara & Memphis Day Trip — Scheduled Small Group",
      seoDescription:
        "Join a fixed-date small-group day trip from Cairo to the Bent and Red Pyramids at Dahshur, the Step Pyramid at Saqqara, and Memphis. Seats sold individually.",
    },
  },

  {
    slug: "siwa-oasis-long-weekend",
    title: "Siwa Oasis Long Weekend",
    tagline: "Egypt's furthest oasis, and the drive it takes to get there",
    category: "oasis",
    duration: "4 days, 3 nights",
    nights: 3,
    departsFrom: "Cairo",
    destinations: ["Siwa", "Great Sand Sea"],
    imageLabel: "Siwa Oasis",
    image:
      "https://images.unsplash.com/photo-1758720979620-26130f99de40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    imageTone: "desert",
    season:
      "September to November and February to April. Midsummer is too hot for the Sand Sea, and midwinter nights are cold for the springs.",
    typicalGroupSize: "Up to 12 travellers",
    description:
      "Siwa is close to the Libyan border and a long way from everything else, which is exactly why it looks like nowhere else in Egypt. The mudbrick ruins of Shali Fortress rise out of the middle of town. There are salt lakes the colour of swimming pools, palm groves, springs you can get into, and the Great Sand Sea starting at the edge of it all. The drive is the price of admission — most of a day each way — and it is the reason the place has stayed as it is. Going for a long weekend is the shortest trip that still makes the journey worth it.",
    highlights: [
      "Shali Fortress and the old town, walked at dusk",
      "The salt lakes, which are as strange in person as in photographs",
      "An afternoon into the Great Sand Sea by 4WD, and sunset from the dunes",
      "Cleopatra's Spring and the palm groves, at Siwa's own pace",
    ],
    included: [
      "Return transport from Cairo",
      "Three nights' accommodation in Siwa",
      "Breakfast daily, plus meals stated in the plan",
      "The Great Sand Sea 4WD excursion",
      "A guide throughout",
    ],
    excluded: ["Most lunches and dinners", "Alcohol", "Tips", "Optional sandboarding"],
    bringWithYou: [
      "A swimsuit for the springs and the salt lakes, and something to cover up with — Siwa is conservative",
      "Warm layers for the desert evenings outside high summer",
      "Cash: card acceptance in Siwa is limited",
    ],
    plan: [
      {
        title: "Day 1 — the drive",
        description:
          "Out of Cairo early, along the coast and then inland. Most of the day in the vehicle, arriving in Siwa in the evening.",
      },
      {
        title: "Day 2 — the oasis",
        description: "Shali Fortress, the old town, the springs and the palm groves, at an unhurried pace.",
      },
      {
        title: "Day 3 — the Great Sand Sea",
        description: "4WD out into the dunes for the afternoon, the salt lakes, and sunset from the sand.",
      },
      { title: "Day 4 — back to Cairo", description: "The return drive, arriving in the evening." },
    ],
    physicalLevel: {
      tier: "moderate",
      note: "Easy days once you are there, but two very long drives bracket them and the dune driving is genuinely bumpy. The travel is the demanding part.",
    },
    faqs: [
      {
        question: "How long is the drive, honestly?",
        answer:
          "Most of a day in each direction. We schedule it as four days for that reason — a shorter version would be two days of driving with barely a day of Siwa in between.",
      },
      {
        question: "Can I fly instead?",
        answer:
          "There is no regular passenger service to Siwa, so the road is the way in for everyone. It is part of the trip rather than a problem with it.",
      },
      {
        question: "What should I know about dress and customs?",
        answer:
          "Siwa is noticeably more conservative than Cairo or the Red Sea coast. Covered shoulders and knees for everyone in town, and modest swimwear at the springs, which the local guides will point you to.",
      },
    ],
    relatedTourSlugs: [],
    relatedStorySlugs: [],
    seo: {
      seoTitle: "Siwa Oasis Long Weekend from Cairo — Fixed Departure Dates",
      seoDescription:
        "A scheduled four-day small-group trip from Cairo to Siwa Oasis — Shali Fortress, the salt lakes and the Great Sand Sea. Seats sold individually. See upcoming dates.",
    },
  },

  {
    slug: "sinai-bedouin-beach-camp",
    title: "Sinai Bedouin Beach Camp",
    tagline: "A reef off the beach, a mattress under a roof of palm, and nothing scheduled",
    category: "sea",
    duration: "3 days, 2 nights",
    nights: 2,
    departsFrom: "Cairo",
    destinations: ["Nuweiba", "Sinai"],
    imageLabel: "The Sinai coast",
    image:
      "https://images.unsplash.com/photo-1679066651973-fc8336f12926?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    imageTone: "redsea",
    season: "September to May. Midsummer on this coast is punishing.",
    typicalGroupSize: "Up to 12 travellers",
    description:
      "The stretch of Sinai coast running north from Dahab towards Taba never got built up the way the rest of the Red Sea did. The camps are huts on the sand with the Gulf of Aqaba in front of them and the mountains of Saudi Arabia across the water. The reef is off the beach, so snorkelling means walking into the sea rather than boarding a boat. There is deliberately very little arranged: the point of the trip is that there is nowhere you have to be, and inland, the Coloured Canyon is there for the one morning you do want something to do.",
    highlights: [
      "Sleeping in a beach hut with the reef a few metres away",
      "Shore snorkelling straight off the sand, no boat needed",
      "The Coloured Canyon inland, as an optional morning",
      "Bedouin cooking, and a coast dark enough at night to see the stars over the water",
    ],
    included: [
      "Return transport from Cairo",
      "Two nights in a beach camp hut",
      "Breakfast and dinner daily",
      "Sinai entry formalities and protectorate fees",
    ],
    excluded: ["Lunches", "Snorkelling gear hire", "The Coloured Canyon excursion", "Tips"],
    bringWithYou: [
      "A towel — camps generally don't supply them",
      "Reef-safe sun cream, and a shirt for snorkelling rather than more cream",
      "A warm layer: the evenings are cool on this coast outside summer",
      "Your passport, which is checked at the Sinai crossings",
    ],
    plan: [
      {
        title: "Day 1 — Cairo to the coast",
        description:
          "Out through the tunnel under the canal and up the Gulf of Aqaba. A long driving day, arriving in the afternoon.",
      },
      {
        title: "Day 2 — the camp",
        description:
          "Nothing scheduled. The reef, the water, and the option of the Coloured Canyon in the morning for anyone who wants it.",
      },
      { title: "Day 3 — back to Cairo", description: "A morning on the beach, then the drive back." },
    ],
    physicalLevel: {
      tier: "easy",
      note: "As easy or as active as you make it. Snorkelling is a walk into the sea over a stony entry; the canyon walk involves some scrambling for those who go.",
    },
    faqs: [
      {
        question: "What is the accommodation actually like?",
        answer:
          "A simple hut on the sand — a mattress, a roof, shared bathrooms. It is clean and it is basic, and that combination is the whole appeal. Anyone wanting a hotel room should look at the Red Sea resorts instead.",
      },
      {
        question: "Do I need to be able to swim?",
        answer:
          "For the snorkelling, yes, and comfortably. The beach and everything else on the trip is fine either way.",
      },
      {
        question: "Is there wifi and signal?",
        answer:
          "Mobile signal is patchy and camp wifi is unreliable when it exists at all. Worth telling anyone who might try to reach you.",
      },
    ],
    relatedTourSlugs: [],
    relatedStorySlugs: [],
    seo: {
      seoTitle: "Sinai Bedouin Beach Camp from Cairo — Join a Scheduled Trip",
      seoDescription:
        "A fixed-date small-group trip from Cairo to a Bedouin beach camp on the Sinai coast — shore snorkelling, beach huts, and the Coloured Canyon. Seats sold individually.",
    },
  },

  {
    slug: "alexandria-coast-day-trip",
    title: "Alexandria on the Mediterranean",
    tagline: "A different sea, a different city, and back by evening",
    category: "ancient",
    duration: "One day",
    nights: 0,
    departsFrom: "Cairo",
    destinations: ["Alexandria"],
    imageLabel: "Alexandria",
    image:
      "https://images.unsplash.com/photo-1760973566831-4d029dc31c3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    imageTone: "redsea",
    season: "All year. The one trip here that is better in summer, when Cairo is at its worst.",
    typicalGroupSize: "Up to 14 travellers",
    description:
      "Alexandria is two and a half hours from Cairo and feels considerably further. It faces the Mediterranean rather than the desert, it was Greek before it was anything else, and the weather is milder for it. The Citadel of Qaitbay stands on the foundations of the Pharos lighthouse, using its stone. The Catacombs of Kom el Shoqafa are a Roman-era tomb complex cut down through rock with Egyptian gods carved in Roman dress. The Bibliotheca Alexandrina is the modern answer to the library that burned. It is the easiest day on this list and the best one for a hot month.",
    highlights: [
      "The Citadel of Qaitbay, built from the fallen lighthouse's own stone",
      "The Catacombs of Kom el Shoqafa, and their strange Roman-Egyptian carving",
      "The Bibliotheca Alexandrina",
      "Seafood on the Mediterranean, which is the point as much as any of the sites",
    ],
    included: [
      "Return transport from Cairo",
      "Entry to the Citadel, the Catacombs and the Bibliotheca",
      "An Egyptologist guide for the day",
      "Drinking water",
    ],
    excluded: ["Lunch, which is eaten where the group votes", "Tips"],
    bringWithYou: [
      "A light layer — the sea breeze makes Alexandria cooler than Cairo year round",
      "Comfortable shoes for the corniche and the catacomb stairs",
    ],
    plan: [
      { title: "Morning — the drive", description: "An early start and roughly two and a half hours north." },
      {
        title: "Late morning — Qaitbay and the corniche",
        description: "The citadel on the harbour, and the seafront it stands at the end of.",
      },
      { title: "Midday — lunch", description: "Seafood by the water." },
      {
        title: "Afternoon — the catacombs and the library",
        description: "Kom el Shoqafa, then the Bibliotheca Alexandrina, before the drive back.",
      },
    ],
    physicalLevel: {
      tier: "easy",
      note: "City walking on flat ground, with a spiral staircase down into the catacombs that is the only real effort.",
    },
    faqs: [
      {
        question: "Is a day enough for Alexandria?",
        answer:
          "For the headline sites, comfortably. Alexandria rewards longer, but a day covers the citadel, the catacombs and the library without rushing, and gets you back to Cairo the same night.",
      },
      {
        question: "Can I swim?",
        answer:
          "Not as part of the day — the schedule is the sites and lunch. The corniche is for looking at rather than getting into on this trip.",
      },
      {
        question: "Does this run in summer?",
        answer:
          "Yes, and it is the trip we would point you at between June and August, when the desert departures are paused and Alexandria is the coolest place in reach of Cairo.",
      },
    ],
    relatedTourSlugs: [],
    relatedStorySlugs: [],
    seo: {
      seoTitle: "Alexandria Day Trip from Cairo — Scheduled Small Group Dates",
      seoDescription:
        "Join a fixed-date small-group day trip from Cairo to Alexandria — the Qaitbay Citadel, the Catacombs of Kom el Shoqafa and the Bibliotheca Alexandrina. Seats sold individually.",
    },
  },
];

export const weeklyTripsBySlug = new Map(weeklyTrips.map((t) => [t.slug, t]));

export function weeklyTripBySlug(slug: string): WeeklyTrip | undefined {
  return weeklyTripsBySlug.get(slug);
}

// Category labels, kept here so the hub filter and the trip pages can't drift
// apart. Translated through the same content dictionary as everything else.
export const weeklyTripCategoryLabels: Record<WeeklyTrip["category"], string> = {
  desert: "Desert",
  oasis: "Oasis",
  sea: "Coast & Sea",
  ancient: "Ancient Egypt",
  nature: "Nature",
};
