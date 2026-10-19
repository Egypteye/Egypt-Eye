/**
 * THE FLYING DRESSES STORIES.
 *
 * =========================================================================
 * WHY THIS FILE EXISTS, AND WHY IT IS NARROWER THAN IT LOOKS
 * =========================================================================
 * Flying Dresses Egypt had no editorial section at all. Every URL on the
 * domain was a page trying to sell something, which means the only visitors
 * it could ever win were people already searching for a flying-dress
 * photoshoot by name. That is a small room.
 *
 * It is NOT, however, an empty field. Before a word of this was written, the
 * repository was searched for existing coverage, and the owner's OTHER site —
 * egypteyetravel.com, in src/content/stories.ts — already publishes seven
 * articles on this exact subject, including a 21,000-character pillar guide.
 * Five of them cover topics that would otherwise have been the obvious first
 * five here:
 *
 *   flying-dress-photoshoot-egypt-guide          (the pillar)
 *   flying-dress-photoshoot-pyramids-giza
 *   what-to-wear-flying-dress-photoshoot
 *   best-flying-dress-photoshoot-locations-egypt
 *   best-time-flying-dress-photoshoot
 *
 * Writing those again here would not add a reader. It would split one
 * business's own signal across two domains, one of which has years of history
 * and one of which had its DNS pointed this month. That is the textbook
 * definition of cannibalising yourself, and it is avoidable simply by writing
 * about something else.
 *
 * So EVERY article here is first-party operational knowledge: what the
 * assistant does, what the wind does, what the colour does against limestone,
 * what the forty-five minutes consists of, what a rooftop with a view of the
 * pyramids is and is not. None of it is destination journalism, none of it is
 * "best time to visit", and none of it could be written by someone who has not
 * run one of these sessions. The check script enforces the first half of that
 * claim: a slug that already exists in the travel site's stories fails.
 *
 * =========================================================================
 * WHAT MAY AND MAY NOT BE SAID HERE
 * =========================================================================
 * The same rules as the rest of this brand's content, and one more.
 *
 *   - Prices: only the three confirmed photoshoot prices and the add-ons that
 *     already carry a figure in flyingDresses.ts. No article invents one.
 *   - Venues: a rooftop belongs to a hotel. Nothing here states that a venue
 *     permits evening sessions, amplified music, catering or a particular
 *     reveal, because the venue matrix does not exist yet. See
 *     docs/FLYING-DRESSES-SERVICE-CONFIRMATIONS.md §2.
 *   - Testimonials: none. There are no quoted customers in this file, because
 *     no customer has authorised one.
 *   - AND THE NEW ONE: no article states a third party's ticket price, opening
 *     hour or permit fee. Research for this batch found public sources
 *     disagreeing with each other by a factor of three on the Giza general
 *     admission ticket and giving two different winter opening times. An
 *     article that picks one of those numbers is not informing a customer, it
 *     is laundering somebody else's guess into our voice and taking the blame
 *     when it is wrong on the day. Where a figure like that matters, the
 *     article says who owns the answer instead. The research log, including
 *     the sources and what each one could and could not support, is in
 *     docs/FLYING-DRESSES-CONTENT-RESEARCH.md.
 */

export type StoryClusterId = "the-session" | "the-dress" | "the-place" | "the-occasion";

export const storyClusters: { id: StoryClusterId; name: string; blurb: string }[] = [
  {
    id: "the-session",
    name: "The session",
    blurb:
      "What actually happens between being collected from your hotel and the photographs arriving. Written by the people running it.",
  },
  {
    id: "the-dress",
    name: "The dress",
    blurb:
      "Twelve colours, one cut, a five-metre train and an assistant. How to choose, and what the fabric does when the wind arrives.",
  },
  {
    id: "the-place",
    name: "The place",
    blurb:
      "Rooftops above Giza, the dunes, the lakes of Fayoum, and the difference between a view of the pyramids and the pyramids.",
  },
  {
    id: "the-occasion",
    name: "The occasion",
    blurb: "Proposals, reveals and the shoots where something other than the photographs is the point.",
  },
];

/** A paragraph run, optionally followed by a list. */
export type StorySection = {
  heading: string;
  body: string[];
  list?: string[];
};

/**
 * A source, with the date it was read and — the part that matters — what it
 * did NOT establish. A citation that only records agreement is how a
 * disagreement between sources becomes an invented fact.
 */
export type StorySource = {
  label: string;
  url: string;
  /** ISO date the source was read. */
  accessed: string;
  supports: string;
  doesNotSupport?: string;
};

export type FlyingDressStory = {
  slug: string;
  cluster: StoryClusterId;
  /** The h1. Editorial length; no character budget applies. */
  title: string;
  /**
   * The <title>. fdMetadata appends " | Flying Dresses Egypt" — 23 of the 60
   * characters a result list shows — so this has about 37 to work in. The
   * split exists for the same reason metaDescription is separate from intro on
   * the experience categories: the sentence that works as a headline on the
   * page is not the sentence that works in a list of ten blue links.
   */
  seoTitle: string;
  metaDescription: string;
  /** Shown on the index and in the related rail. */
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
  /**
   * `first-party` means the article rests on running these sessions, and
   * carries no citation because there is nothing external to cite.
   * `cited` means it leans on something outside the business, and then
   * `sources` is mandatory — the check script fails without it.
   */
  basis: "first-party" | "cited";
  sections: StorySection[];
  faqs: { question: string; answer: string }[];
  /** Internal only. See the note on cross-domain links at the end of this file. */
  related: { label: string; path: string }[];
  sources?: StorySource[];
};

export const flyingDressStories: FlyingDressStory[] = [
  // -----------------------------------------------------------------------
  {
    slug: "how-a-flying-dress-flies",
    cluster: "the-dress",
    title: "How a flying dress actually flies",
    seoTitle: "How a Flying Dress Flies",
    metaDescription:
      "A flying dress does not catch the wind by itself. Someone throws it. What the assistant does, what the air does, and why the session is short.",
    excerpt:
      "The photograph people arrive wanting is a dress mid-air with five metres of fabric behind it. That picture is made by a second person standing just outside the frame, and almost everything about how the session runs follows from that.",
    publishedAt: "2026-10-19T00:00:00.000Z",
    basis: "first-party",
    sections: [
      {
        heading: "The train is the product",
        body: [
          "A flying dress is an ordinary bodice attached to an extraordinary amount of fabric. The part you wear is close-fitting and unremarkable. The part that makes the photograph is the train behind it, metres of light synthetic cloth cut wide and hemmed to be thrown rather than worn.",
          "That is worth understanding before you choose anything else, because it explains the whole shape of the session. You are not being photographed in a dress. You are being photographed in the middle of a piece of fabric that somebody else is operating, and the two of you are working together on a timing problem.",
        ],
      },
      {
        heading: "Someone throws it. That someone is on the payroll",
        body: [
          "Every one of the three photoshoots includes an assistant whose entire job is the dress. Not a second photographer, not a guide. One person holding the train, lifting it, throwing it on the photographer's count, and getting it off the ground between frames.",
          "This is the single most common thing people do not expect, and it is the reason the pictures look the way they do. Left alone, a train of this size lies on the floor. A soft breeze lifts the edge of it and nothing else. The arc you have seen in other people's photographs is a throw, caught at the top of its travel, usually within about a fifth of a second of leaving the assistant's hands.",
          "It also means you are never wrangling your own dress. You hold a pose, you look where you are asked to look, and the fabric is someone else's problem. People consistently relax once they realise this, and relaxed is most of what a good frame needs.",
        ],
      },
      {
        heading: "What the wind does, and what it does not",
        body: [
          "Wind helps and cannot be relied on. A steady breeze across a rooftop will hold a thrown train open for an extra half second, which is a long time at these shutter speeds and produces the frames that look effortless. On a still morning the same shot is purely a throw, and it still works. It is simply tighter timing and more of them.",
          "Strong wind is the harder case. Past a certain point the fabric stops forming a shape and starts behaving like a sail: it wraps, it covers your face, it pulls. A photographer who has done this before will turn you so the air is coming across rather than at you, and will shoot the half-second after the gust rather than during it.",
          "What none of this involves is standing still waiting for weather. The session is built to produce the photograph on a calm day and to take the gift when the air cooperates.",
        ],
      },
      {
        heading: "Why thirty to forty-five minutes is the right length",
        body: [
          "Each of the three photoshoots is a thirty to forty-five minute shoot, and people occasionally read that as short. It is not a cost decision, it is a physical one.",
          "Throwing a five-metre train is work. The assistant does it dozens of times, and so, in a quieter way, do you: holding an extended pose repeatedly, often with your arms up, usually on an uneven surface, in a garment with real weight to it. The frames from the first twenty-five minutes are, reliably, the ones you choose. After that the throws lose height, the poses stiffen, and the fabric picks up dust that then has to be edited out.",
          "Forty-five minutes of this produces well over a hundred usable frames. That is what gets colour-graded and delivered, and it is why the inclusion is written as a number of photographs rather than a number of hours.",
        ],
      },
      {
        heading: "What to do with this on the day",
        body: [
          "Three small things make a measurable difference, and all three are about cooperating with the throw rather than the camera.",
        ],
        list: [
          "Hold the pose through the throw, not during it. The fabric takes a beat to open. Most of the frames people lose are lost by relaxing early.",
          "Keep your weight on the back foot. It lets the photographer find a line between you and the horizon, and it stops the train pulling you off balance.",
          "Tell the assistant if the dress is pulling. They can change which side they throw from. Nobody can see that from behind you.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do I have to hold the dress myself?",
        answer:
          "No. An assistant whose only job is the fabric is included in all three photoshoots. They hold the train, throw it, and keep it off the ground between frames.",
      },
      {
        question: "What happens if there is no wind at all?",
        answer:
          "The photographs still work. On a still day the shape in the fabric comes entirely from the throw rather than the air, which means tighter timing and more attempts, both of which are already built into the session.",
      },
      {
        question: "Is thirty to forty-five minutes long enough?",
        answer:
          "Yes, and it is deliberate. Throwing a train of this size is physical work for both of you, and the frames from the first half of a session are consistently the ones people choose. The session is sized to deliver more than a hundred colour-graded photographs, not to fill an hour.",
      },
    ],
    related: [
      { label: "The three photoshoots", path: "/experiences" },
      { label: "The wardrobe", path: "/wardrobe" },
      { label: "Choosing a dress colour", path: "/stories/choosing-a-dress-colour" },
    ],
  },

  // -----------------------------------------------------------------------
  {
    slug: "choosing-a-dress-colour",
    cluster: "the-dress",
    title: "Choosing a dress colour, when the background is limestone and sand",
    seoTitle: "Choosing a Dress Colour",
    metaDescription:
      "Twelve colours in the collection, and a background made of limestone, sand and haze. Which colours separate from it, which disappear, and why.",
    excerpt:
      "Choosing a colour does not change what you pay, which means the only thing to optimise is the photograph. Against pale stone and paler sand, that question has a fairly short answer.",
    publishedAt: "2026-10-19T00:00:00.000Z",
    basis: "first-party",
    sections: [
      {
        heading: "Twelve colours, one price",
        body: [
          "The collection holds twelve flying dresses: Cherry, Emerald, Navy, Black, Verdant, Ginger, Snowy, Golden, BronZey, Aqua, Lavender and Orchid. One is included in every photoshoot, in the colour you choose, and choosing one does not change the price. There is no premium colour.",
          "That removes the only reason to compromise, and leaves a single question: which of these will look like something against the particular background you are standing in front of.",
        ],
      },
      {
        heading: "What the background is actually made of",
        body: [
          "All three locations are variations on one palette. Giza is limestone, sand and, for most of the year, a pale haze that lifts the sky towards white near the horizon. The dunes are sand and sky. Fayoum adds water and the white dunes, which are the brightest ground of the three.",
          "In other words: the background is light, warm and low in contrast almost everywhere. This is lovely, and it is unforgiving of a dress in the same register. The colours that fail here are not ugly colours. They are colours that happen to be made of the same light as the sand.",
        ],
      },
      {
        heading: "The ones that separate",
        body: [
          "Against that palette, a saturated colour from the cool or deep end of the collection reads immediately, at any distance, in any light.",
        ],
        list: [
          "Cherry and Orchid are the strongest performers against stone. They hold their colour in direct sun, they stay readable in silhouette, and they photograph as the subject even when the dress is small in a wide frame.",
          "Emerald, Verdant and Aqua work on the same principle from the other side of the wheel. Emerald in particular is the one people are surprised by, because there is no green anywhere in a Giza frame, so it has the whole scene to itself.",
          "Navy and Black are the most reliable choices of all for a wide landscape shot, because the separation does not depend on colour at all. They work as shape. They are also the two that take the hottest midday sun least comfortably, which is worth weighing against the time of day you are shooting.",
          "Lavender sits between the two groups. It separates well in the softer light either side of the middle of the day and loses a little of its distinctness under a hard overhead sun.",
        ],
      },
      {
        heading: "The ones that need thought",
        body: [
          "Snowy, Golden, Ginger and BronZey are the colours the background is already wearing. None of them is a bad choice, and all four produce photographs that people love, but they ask for something in return.",
          "Snowy against white dunes or hazed limestone is a tonal photograph rather than a graphic one: all the interest is in the fold and the movement of the fabric, not in the contrast. It is the most bridal of the twelve and the one that most rewards being shot low against sky rather than ground.",
          "Golden, Ginger and BronZey are the warm earth tones, and they are at their best when there is something behind you that is not earth: sky, water at Fayoum, or the shaded face of a building on a rooftop. Put any of them against a sunlit dune at the same angle and the dress and the ground become one object.",
          "If one of these four is the colour you want, say so. The adjustment is the photographer's, not yours. It is a matter of what goes behind you, and that is a decision made on the roof in ten seconds.",
        ],
      },
      {
        heading: "If you genuinely cannot choose",
        body: [
          "Two things are worth knowing. The first is that an extra dress is an add-on with a published price rather than a negotiation, so a second colour in the same session is a known quantity before you arrive.",
          "The second is that the colour is confirmed with you before the date, along with fit, because availability is per date and not everything is on every roof on every morning. Tell us a first and second choice when you enquire and that conversation ends in one message instead of three.",
        ],
      },
    ],
    faqs: [
      {
        question: "Does the colour change the price?",
        answer:
          "No. One dress from the collection is included in every photoshoot in the colour you choose, and all twelve cost the same.",
      },
      {
        question: "Which colour photographs best at the pyramids?",
        answer:
          "Cherry, Orchid and Emerald separate most strongly from limestone and sand, and Navy and Black work as pure shape in a wide frame. The warm tones (Golden, Ginger, BronZey) and Snowy need a non-sand background behind them, which the photographer arranges on the day.",
      },
      {
        question: "Can I have two colours in one session?",
        answer:
          "Yes. An extra dress is a published add-on rather than a custom quote, so you will know what it costs before you book. Availability is confirmed for your date like any other colour.",
      },
      {
        question: "What if my colour is not available on my date?",
        answer:
          "We confirm the colour with you before the date rather than on the morning. Giving a first and second choice when you enquire usually settles it in one message.",
      },
    ],
    related: [
      { label: "The wardrobe", path: "/wardrobe" },
      { label: "How a flying dress flies", path: "/stories/how-a-flying-dress-flies" },
      { label: "Prices and add-ons", path: "/packages" },
    ],
  },

  // -----------------------------------------------------------------------
  {
    slug: "a-pyramid-view-is-not-the-pyramid-complex",
    cluster: "the-place",
    title: "A rooftop with a view of the pyramids is not the pyramid complex",
    seoTitle: "Rooftop vs the Pyramid Complex",
    metaDescription:
      "The Giza rooftop shoots happen on private roofs overlooking the plateau, not inside the archaeological site. What that gets you, and what it does not.",
    excerpt:
      "This is the distinction most listings blur and the one most worth being clear about, because it decides what your morning looks like. It is also, on balance, in your favour.",
    publishedAt: "2026-10-19T00:00:00.000Z",
    basis: "cited",
    sections: [
      {
        heading: "Where you are actually standing",
        body: [
          "The Pyramids Rooftop photoshoot happens on a private roof in the streets below the Giza plateau, looking across at it. It is not inside the archaeological complex, it is not on the sand beside the Great Pyramid, and there is no gate between you and your car.",
          "Everything else about the brand's locations follows the same pattern. The Sand Dunes shoot is on open desert. Fayoum is the lakes and the white dunes, about three hours from central Cairo. None of the three is a shoot inside an antiquities site.",
        ],
      },
      {
        heading: "Why that is the better deal, not the consolation prize",
        body: [
          "A roof above the plateau gives you four things the plateau itself does not.",
        ],
        list: [
          "The hour before the site opens. A private roof has no opening time, which is why these sessions can start in the best light of the day rather than after the first coaches.",
          "Nobody else in the frame. A wide shot on the plateau is a wide shot with other people's holidays in it. A roof is yours for the session.",
          "No ticket, no gate, no queue, and no walk in a five-metre train across open sand before you have taken a photograph.",
          "Somewhere to change, and somewhere to put the other eleven colours.",
        ],
      },
      {
        heading: "And what it is not",
        body: [
          "It is not a photograph taken from the base of the pyramids, and the geometry is honestly different: you are across from the plateau rather than under it, so the pyramids sit in the background at a distance rather than looming behind your shoulder.",
          "If the photograph you have in your head is the one taken on the sand at the foot of the Great Pyramid, a rooftop will not produce it, and you should know that before you book rather than after. Say so when you enquire. Filming and photography inside an antiquities site is a separate permitted activity with its own cost and lead time, and it is a different conversation rather than an upgrade on this one.",
        ],
      },
      {
        heading: "A note on tickets, hours and permits",
        body: [
          "You will find a great many web pages stating the Giza general admission price, the complex's opening hours and the fee for using a tripod. We are deliberately not adding one more.",
          "When this article was written, publicly available sources disagreed with each other by roughly a factor of three on the general admission ticket for foreign visitors, gave two different winter opening times, and quoted at least three different figures for a tripod. The sources are listed at the foot of this page so you can see the spread for yourself.",
          "None of those numbers is ours to confirm. They are set by the Egyptian antiquities authority, they change, and a figure repeated confidently by a photography company is exactly the kind of detail that turns into an argument at a ticket window. If you are planning to visit the complex as well as shoot on a roof, which many people sensibly do on the same day, check the price and the hours with the official ticketing channel close to your date.",
          "What we can tell you without qualification is the part that is ours: the rooftop session needs no complex ticket, because it does not enter the complex.",
        ],
      },
      {
        heading: "What to ask any provider, including us",
        body: [
          "The marketplace listings for this kind of shoot are, as a group, vague about location in a way that is hard to read as accidental. Four questions settle it.",
        ],
        list: [
          "Is the shoot inside the archaeological site, or on a private roof or stage overlooking it? There is no third answer.",
          "Who owns the roof, and is access arranged for my specific date or standing?",
          "Does the price include a complex entry ticket? If the shoot is not inside the complex, it should not need one.",
          "If I also want photographs inside the site, what permit does that require and what does it cost?",
        ],
      },
    ],
    faqs: [
      {
        question: "Is the photoshoot inside the Giza pyramid complex?",
        answer:
          "No. The Pyramids Rooftop session is on a private roof overlooking the plateau, not inside the archaeological site. That is why it needs no entry ticket and can start before the site opens.",
      },
      {
        question: "Do I need a pyramids ticket for the rooftop shoot?",
        answer:
          "No. The session does not enter the complex. If you want to visit the complex separately on the same day, that is your own ticket and we would encourage you to check the current price through the official channel rather than any third-party page.",
      },
      {
        question: "Can you photograph me inside the complex instead?",
        answer:
          "That is a different arrangement, not an upgrade. Photography and filming inside an antiquities site is a separately permitted activity with its own cost and lead time. Ask us and we will tell you what we know rather than guess.",
      },
      {
        question: "Will the pyramids be clearly visible in my photographs?",
        answer:
          "They sit in the background across the plateau rather than directly behind you. Visibility also depends on haze, which is usually lightest in the early morning, one of the reasons these sessions start early.",
      },
    ],
    related: [
      { label: "The Pyramids Rooftop photoshoot", path: "/experiences/pyramids-rooftop" },
      { label: "All three photoshoots", path: "/experiences" },
      { label: "Inside a forty-five minute session", path: "/stories/inside-a-forty-five-minute-session" },
    ],
    sources: [
      {
        label: "Third Eye Traveller: photography in Egypt: spots, prices, tips",
        url: "https://thirdeyetraveller.com/guide-photography-in-egypt-spots-prices-tips/",
        accessed: "2026-10-19",
        supports:
          "That personal photography at Giza is generally permitted and that tripod use attracts a separate small fee.",
        doesNotSupport:
          "The amount of that fee, or the general admission price: this source's figures conflict with the others below.",
      },
      {
        label: "Egypt Tours Portal: tips for visiting the Pyramids of Giza",
        url: "https://www.egypttoursportal.com/en-gb/blog/tips-for-visiting-the-pyramids-of-giza/",
        accessed: "2026-10-19",
        supports: "That the complex has seasonal opening hours and that climbing is not permitted.",
        doesNotSupport:
          "The specific opening times. This source and the next give different winter opening hours.",
      },
      {
        label: "Strikolith blog: Giza pyramid tickets: prices, tours and how to buy",
        url: "https://belgie.strikolith.com/blog/giza-pyramid-tickets-prices-tours-and-how-to-buy-1764799188/",
        accessed: "2026-10-19",
        supports:
          "That published general admission figures for foreign visitors vary widely between third-party sources, which is the only claim this article makes about them.",
        doesNotSupport:
          "Any single correct price. Figures seen across sources on this date ranged from roughly EGP 200 to EGP 700.",
      },
    ],
  },

  // -----------------------------------------------------------------------
  {
    slug: "inside-a-forty-five-minute-session",
    cluster: "the-session",
    title: "Inside a forty-five minute session, minute by minute",
    seoTitle: "Inside a 45-Minute Session",
    metaDescription:
      "From the car arriving at your hotel to the photographs landing in your inbox: what each part of a flying dress photoshoot actually consists of.",
    excerpt:
      "People book this having seen the results and not the process. Here is the process, in order, including the parts that are less glamorous than the photographs suggest.",
    publishedAt: "2026-10-19T00:00:00.000Z",
    basis: "first-party",
    sections: [
      {
        heading: "Before the car: the two things we confirm",
        body: [
          "Nothing is held until a date is confirmed with you in writing. A message is the start of a conversation, not a booking. We are explicit about that because the alternative is somebody arriving at a rooftop on a morning nobody agreed to.",
          "Once the date is fixed, two details get settled in advance rather than on the day: the dress colour, and fit. The collection is cut to fit all sizes, which removes most of the usual sizing anxiety, but availability is per date and the fit conversation is still worth having before you are standing on a roof.",
        ],
      },
      {
        heading: "The collection, and the drive",
        body: [
          "Door-to-door transport is included in all three photoshoots. You are collected from your hotel or your address and brought back afterwards, which is both a convenience and a practical necessity: a flying dress is bulky, the locations are not somewhere to arrive on foot in one, and early light means leaving at an hour when arranging your own car is its own small project.",
          "The drive is where the difference between the three photoshoots is largest. Sand Dunes and the Pyramids Rooftop give you your afternoon back. Fayoum is roughly three hours from central Cairo each way, so there is about six hours of driving wrapped around a forty-five minute shoot, with the car and driver yours for all of it. That is the honest shape of the Fayoum day, and it is the reason it is priced where it is.",
        ],
      },
      {
        heading: "Arriving, and the first ten minutes",
        body: [
          "You change on site. The dress comes out of its bag, the assistant checks the back, and the photographer spends a few minutes walking the space, which is less about you than about where the sun is and what will be behind you.",
          "The first ten minutes of actual shooting are the warm-up and nobody pretends otherwise. The throws are being calibrated, you are learning what holding a pose through a throw feels like, and the photographer is finding out how you stand. Frames from this stretch are kept, and occasionally one of them is the best thing in the set, but that is luck rather than plan.",
        ],
      },
      {
        heading: "The middle, which is where your photographs come from",
        body: [
          "Minutes ten to thirty are the session. By then the throw is landing consistently, you have stopped thinking about the fabric, and the photographer is working through positions rather than finding them. If you want a specific frame (a particular angle on the pyramids, a shot low against the sky, the two of you together), this is when to ask for it, out loud, while there is time to try it twice.",
          "It is also when the physical cost starts to show, which is why it ends where it does. Throwing five metres of fabric is work; so is holding an extended pose with your arms up on uneven ground. Past about thirty-five minutes the throws lose height and the poses stiffen, and the frames stop being better than the ones already taken.",
        ],
      },
      {
        heading: "The last frames, and going home",
        body: [
          "The final stretch is usually the deliberate ones: the close portrait, the detail of the fabric, anything specific you asked for and did not get the first time. Then the dress goes back in the bag. It is rented for the session, not sold, and it goes back to the collection. Then the car takes you back.",
          "Total time out of your day for Giza or the dunes is a morning. For Fayoum it is a day.",
        ],
      },
      {
        heading: "The six to ten days afterwards",
        body: [
          "More than a hundred colour-graded photographs are delivered within six to ten days. That is the inclusion as written, and the number is the point: a session like this produces hundreds of frames, and the choice made in this project was to grade and deliver the great majority of the usable ones rather than hand over a curated handful.",
          "Grading is where the dust comes off the hem and the sky stops being three different colours across one frame. It is also why the delivery is measured in days rather than hours. If you need a particular frame sooner than that, for an announcement, a print or a flight home, say so on the day rather than afterwards.",
        ],
      },
    ],
    faqs: [
      {
        question: "How long does the whole thing take, door to door?",
        answer:
          "For the Pyramids Rooftop and Sand Dunes photoshoots, a morning. For Fayoum, a full day: it is about three hours from central Cairo each way, so roughly six hours of driving surround a forty-five minute shoot.",
      },
      {
        question: "Where do I change?",
        answer:
          "On site. The dress is brought to the location and goes back into its bag at the end. It is rented for the session and returns to the collection.",
      },
      {
        question: "When do I get the photographs?",
        answer:
          "More than a hundred colour-graded photographs within six to ten days. If you need one particular frame sooner, ask on the day rather than after.",
      },
      {
        question: "Does messaging you hold a date?",
        answer:
          "No. A message starts a conversation. Nothing is held until a date has been confirmed with you in writing.",
      },
    ],
    related: [
      { label: "What is included", path: "/packages" },
      { label: "The three photoshoots", path: "/experiences" },
      { label: "Enquire about a date", path: "/enquire" },
    ],
  },

  // -----------------------------------------------------------------------
  {
    slug: "photographing-a-proposal-she-does-not-know-about",
    cluster: "the-occasion",
    title: "Photographing a proposal the other person does not know about",
    seoTitle: "Shooting a Secret Proposal",
    metaDescription:
      "A surprise proposal on a rooftop has one failure mode: the surprise. How the cover story, the photographer's position and the dress are handled.",
    excerpt:
      "The photographs are the easy part. The hard part is the forty minutes before them, during which one of the two people present must not work out what is happening.",
    publishedAt: "2026-10-19T00:00:00.000Z",
    basis: "first-party",
    sections: [
      {
        heading: "The problem, stated plainly",
        body: [
          "A proposal shoot is not a photoshoot with a question in it. It is a logistics exercise with a photoshoot as its cover, and the thing most likely to go wrong is not the light or the wind. It is that the surprise collapses twenty minutes early, in the car, because something did not add up.",
          "Everything below is about that, and it comes from running these rather than from theory.",
        ],
      },
      {
        heading: "The cover story has to be boring",
        body: [
          "The most reliable cover is the true one with a piece removed: you have booked a photoshoot. That is already a complete, plausible reason to be collected from a hotel at an early hour, to be wearing a dress, and to be on a roof with a photographer.",
          "What gives it away is over-explanation. A booked photoshoot does not need a reason, a story about a friend's recommendation, or an unusual amount of enthusiasm from the person who booked it. The people who get caught out are almost always the ones who built a second layer of fiction on top of a cover that was already working.",
          "Tell us the cover story when you enquire, and we will use the same one. The most common failure we see is two people giving a visitor two different accounts of why the car is early.",
        ],
      },
      {
        heading: "Where the photographer stands",
        body: [
          "A proposal inside a booked session is easier to photograph than a proposal in the open, because the camera is already there and already pointed at you. Nobody has to hide in a hedge.",
          "The practical arrangement is a signal and a lens. You agree a signal beforehand (a phrase, a hand on the back, taking a knee), and the photographer changes nothing visible when it comes. The frames people keep from these are usually the two seconds after the question rather than the question itself, so the aim is a photographer who is already in the right place and does not move.",
          "The one thing that genuinely helps is telling the photographer your plan in detail, in advance, in writing. Not the gesture of it: the actual sequence, including which direction you will be facing and roughly when in the session you intend to do it.",
        ],
      },
      {
        heading: "The dress complicates a surprise, and that is manageable",
        body: [
          "Two specifics are worth planning around. The first is that a five-metre train is not a garment you drop to one knee in casually. The assistant needs to know the moment is coming so the fabric is clear rather than under your shoe.",
          "The second is that the ring has to be somewhere. There is no pocket in a flying dress. In practice it travels with the person proposing, and the handover, if there is one, happens before the dress comes out of the bag rather than on the roof.",
        ],
      },
      {
        heading: "What we can arrange, and what depends on someone else",
        body: [
          "This is the part where honesty is more useful than enthusiasm. The session, the photographer, the assistant, the transport and the dress are ours. The roof is not.",
          "A rooftop with a view of the pyramids belongs to a hotel, and anything beyond a daytime photoshoot on it (an evening, music, flowers, a cake, dinner, a decorated space) is the venue's decision and not ours to promise in advance. If one of those is central to your plan, raise it at the enquiry stage and we will find out rather than assume. What we will not do is confirm something a venue has not confirmed to us, which is the failure mode that ruins the day rather than merely complicating it.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can you keep the proposal a surprise?",
        answer:
          "Yes, and the most reliable way is to use the booked photoshoot itself as the cover rather than inventing a second story. Tell us the cover you are using when you enquire so that everyone gives the same account.",
      },
      {
        question: "What do you need from me in advance?",
        answer:
          "The sequence in writing: your signal, roughly when in the session you plan to do it, which way you will be facing, and who is carrying the ring. The photographer's job is to already be in the right place.",
      },
      {
        question: "Can you arrange flowers, music, a cake or an evening setting?",
        answer:
          "Ask, and we will find out. The roof belongs to a hotel, and anything beyond a daytime photoshoot is the venue's decision. We would rather check than confirm something that then falls through on the day.",
      },
    ],
    related: [
      { label: "Marriage proposals", path: "/celebrations/marriage-proposals" },
      { label: "All celebrations", path: "/celebrations" },
      { label: "Enquire", path: "/enquire" },
    ],
  },

  // -----------------------------------------------------------------------
  {
    slug: "one-size-cut-to-fit",
    cluster: "the-dress",
    title: "Cut to fit all sizes: what that means when you put it on",
    seoTitle: "One Size, Cut to Fit",
    metaDescription:
      "The flying dress collection is cut to fit all sizes. What that actually means for the bodice, the train, your height, and a maternity shoot.",
    excerpt:
      "This is the question people are most reluctant to ask and most relieved to have answered, so here is the answer before you have to ask it.",
    publishedAt: "2026-10-19T00:00:00.000Z",
    basis: "first-party",
    sections: [
      {
        heading: "What fit-all-size means here",
        body: [
          "The collection is cut to fit all sizes. That is not a slogan smoothing over a narrow size range. It is how this kind of garment is constructed. The bodice closes adjustably rather than to a fixed measurement, and the part of the dress doing the work in the photograph is not fitted to anybody at all.",
          "The practical consequence is that the thing people worry about most before one of these sessions is, in the ordinary case, not a problem. You are not choosing between a dress that fits and a colour you want.",
        ],
      },
      {
        heading: "The bodice, and why adjustable is not the same as universal",
        body: [
          "An adjustable closure covers a wide range and is not infinite, and pretending otherwise would be the kind of promise that gets discovered on a roof at six in the morning. This is why fit is still confirmed with you before the date rather than assumed.",
          "That confirmation is a short conversation, not a fitting. It exists so that if there is anything to accommodate, it is accommodated in advance, which usually means the assistant knows how the back is being closed before the dress comes out of the bag.",
        ],
      },
      {
        heading: "Height, and the only measurement that really changes the picture",
        body: [
          "Length is the one dimension where your body and the dress interact in a way worth planning for. The train is long by design; what varies is how much of it is behind you and how much is pooled around you before the throw.",
          "Neither case is a problem, and both change what the photographer does. Shorter and the frames tend to work better low and against sky, where the fabric reads as a shape rather than a puddle. Taller and the dress sits closer to the proportion it was cut for, which means more of the wide landscape frames work straight out of the camera.",
          "Say your height when you enquire. It is more useful to us than a dress size.",
        ],
      },
      {
        heading: "Maternity",
        body: [
          "A maternity shoot is one of the clearest cases for this cut, and it is why the maternity page answers the sizing question rather than deferring it: an adjustable bodice over an unfitted train accommodates a bump without alteration and without a separate garment.",
          "What still gets confirmed is the same as for anyone else: fit and colour availability for your date. What does not need discussing is whether a dress exists.",
        ],
      },
      {
        heading: "What to wear underneath, briefly",
        body: [
          "Two things matter and the rest is comfort. Wear something seamless and in a tone close to the dress rather than contrasting with it, because an adjustable back and a bright strap are not friends. And wear footwear you can stand on uneven ground in for forty minutes. Nobody photographs your shoes in a five-metre train, and a rooftop or a dune is not a floor.",
        ],
      },
      {
        heading: "The sentence to take away",
        body: [
          "The dress is cut to fit all sizes. Fit and colour are confirmed with you before the date, because availability is per date and because a surprise at six in the morning is worth one message the week before.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do I need to know my dress size?",
        answer:
          "No. The collection is cut to fit all sizes, with an adjustable closure rather than a fixed measurement. Your height is more useful to us than a size.",
      },
      {
        question: "Will a flying dress work for a maternity shoot?",
        answer:
          "Yes. An adjustable bodice over an unfitted train accommodates a bump without alteration or a separate garment. Fit and colour availability for your date are confirmed in advance, as they are for any session.",
      },
      {
        question: "Why do you still confirm fit if it fits everyone?",
        answer:
          "Because an adjustable closure covers a wide range rather than an infinite one, and anything worth accommodating is better accommodated the week before than on a roof at six in the morning.",
      },
      {
        question: "What should I wear under the dress?",
        answer:
          "Something seamless in a tone close to the dress rather than contrasting with it, and footwear you can stand on uneven ground in. Nobody photographs your shoes under a five-metre train.",
      },
    ],
    related: [
      { label: "Maternity and family", path: "/celebrations/maternity-and-family" },
      { label: "The wardrobe", path: "/wardrobe" },
      { label: "Questions", path: "/faq" },
    ],
  },
];

/**
 * Slugs the owner's OTHER site already publishes on this subject.
 *
 * Recorded here rather than in a comment so the check script can assert that
 * nothing in this file collides with them. See the note at the top: these are
 * on egypteyetravel.com, in src/content/stories.ts, and duplicating them on
 * this domain would split one business's signal rather than add a reader.
 *
 * The check does NOT trust this list — it reads the travel site's content file
 * and fails on any slug collision it finds there, so a new article on either
 * domain cannot quietly create a duplicate just because this list went stale.
 */
export const EGYPT_EYE_FLYING_DRESS_STORIES = [
  "flying-dress-photoshoot-egypt-guide",
  "flying-dress-photoshoot-pyramids-giza",
  "what-to-wear-flying-dress-photoshoot",
  "best-flying-dress-photoshoot-locations-egypt",
  "best-time-flying-dress-photoshoot",
  "egypt-eye-travel-photography-experiences",
  "abby-zoobi-midnight-flying-dress-booking",
] as const;

export function storyBySlug(slug: string): FlyingDressStory | undefined {
  return flyingDressStories.find((s) => s.slug === slug);
}

export function storiesInCluster(cluster: StoryClusterId): FlyingDressStory[] {
  return flyingDressStories.filter((s) => s.cluster === cluster);
}

/** Every word a reader sees, which is what both the word count and the reading estimate are about. */
export function storyWordCount(story: FlyingDressStory): number {
  const text = [
    story.title,
    story.excerpt,
    ...story.sections.flatMap((s) => [s.heading, ...s.body, ...(s.list ?? [])]),
    ...story.faqs.flatMap((f) => [f.question, f.answer]),
  ].join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}

/** ~200 wpm, same basis as the travel site's estimate. A label, not a measurement. */
export function storyReadingMinutes(story: FlyingDressStory): number {
  return Math.max(1, Math.round(storyWordCount(story) / 200));
}

/**
 * NO CROSS-DOMAIN LINKS, DELIBERATELY.
 *
 * Every `related.path` is internal. The obvious SEO move is to link these
 * articles to the travel site's pillar guide and collect the topical
 * association, and it was not taken, because the owner's instruction is to
 * keep the Flying Dresses website separate from the live Egypt Eye Travel
 * website. Interlinking two domains is the opposite of separating them, and
 * that is a brand decision rather than a technical one.
 *
 * It is worth revisiting once the owner has decided what relationship the two
 * sites should have in public. Until then the cost of not linking is a little
 * lost authority; the cost of linking against instruction is a brand the owner
 * did not agree to.
 */
