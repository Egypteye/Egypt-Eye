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
      "Thirteen colours, one cut, a five-metre train and an assistant. How to choose, and what the fabric does when the wind arrives.",
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

/**
 * WHERE AN ARTICLE IS IN THE EDITORIAL PIPELINE.
 *
 * Only "published" renders a page, enters the sitemap, or appears on the
 * index. Everything else is visible to the team in this file and to nobody
 * else, which is the point: a researched brief and a half-written draft both
 * need somewhere to live that is not the live site.
 *
 * "needs-update" is NOT a quieter kind of unpublished. It stays live, because
 * an article that was right in October and is stale in March is still better
 * than a 404, and pulling it would throw away whatever search position it has
 * earned. The flag is a note to the team, and the check script lists them.
 */
export type StoryStatus =
  | "idea"
  | "researched"
  | "draft"
  | "reviewed"
  | "published"
  | "needs-update";

/** The statuses that put an article in front of a reader. */
export const LIVE_STORY_STATUSES: readonly StoryStatus[] = ["published", "needs-update"];

export type FlyingDressStory = {
  slug: string;
  cluster: StoryClusterId;
  /**
   * Where this is in the pipeline. Absent means published, so the six
   * articles written before this field existed did not all need editing to
   * say what was already true of them.
   */
  status?: StoryStatus;
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

  /**
   * THE ONE COMMERCIAL PAGE THIS ARTICLE IS FOR.
   *
   * An article that links to five products sells none of them. This is the
   * single destination a reader who finishes convinced should be sent to, and
   * it is a separate field from `related` because `related` is a reading list
   * and this is the next step.
   *
   * It is required on a published article. An editorial page with no
   * commercial destination is a page the business is paying to write and not
   * being paid for, and the check script says so by name rather than leaving
   * it to be noticed in six months.
   */
  destination?: { label: string; path: string; note?: string };

  /**
   * Pages that should carry a link TO this article, by brand-relative path.
   *
   * The inverse of `related`, and it exists because the failure it prevents
   * is invisible from inside the article. Six articles were published here
   * with nothing but the index linking to them: fine for a reader who finds
   * the index, useless for every other kind of arrival, and a weak signal to
   * anything trying to work out which pages this site considers important.
   *
   * The pages read this to decide what to show, so adding a path here is the
   * whole edit. See storiesLinkedFrom().
   */
  inboundFrom?: string[];

  /** Editorially chosen related articles, overriding the relevance score. */
  relatedStorySlugs?: string[];
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
          "Every one of [the three photoshoots](/experiences) includes an assistant whose entire job is the dress. Not a second photographer, not a guide. One person holding the train, lifting it, throwing it on the photographer's count, and getting it off the ground between frames.",
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
          "Each of [the three photoshoots](/experiences) is a thirty to forty-five minute shoot, and people occasionally read that as short. It is not a cost decision, it is a physical one.",
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
    destination: {
      label: "See the photoshoots",
      path: "/experiences",
      note: "Every one of them includes the assistant, the throws and the hundred-plus colour-graded photographs described above. The locations differ; the way the dress is flown does not.",
    },
    inboundFrom: ["/experiences", "/wardrobe"],
  },

  // -----------------------------------------------------------------------
  {
    slug: "choosing-a-dress-colour",
    cluster: "the-dress",
    title: "Choosing a dress colour, when the background is limestone and sand",
    seoTitle: "Choosing a Dress Colour",
    metaDescription:
      "Thirteen colours in the collection, and a background made of limestone, sand and haze. Which colours separate from it, which disappear, and why.",
    excerpt:
      "Choosing a colour does not change what you pay, which means the only thing to optimise is the photograph. Against pale stone and paler sand, that question has a fairly short answer.",
    publishedAt: "2026-10-19T00:00:00.000Z",
    basis: "first-party",
    sections: [
      {
        heading: "Thirteen colours, one price",
        body: [
          "The collection holds thirteen flying dresses: Cherry, Emerald, Navy, Black, Verdant, Ginger, Snowy, Golden, BronZey, Aqua, Lavender, Hot Pink and Orchid. One is included in every photoshoot, in the colour you choose, and choosing one does not change the price. There is no premium colour.",
          "That removes the only reason to compromise, and leaves a single question: which of these will look like something against the particular background you are standing in front of.",
        ],
      },
      {
        heading: "What the background is actually made of",
        body: [
          "All [three locations](/experiences) are variations on one palette. Giza is limestone, sand and, for most of the year, a pale haze that lifts the sky towards white near the horizon. The dunes are sand and sky. Fayoum adds water and the white dunes, which are the brightest ground of the three.",
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
          "Snowy against white dunes or hazed limestone is a tonal photograph rather than a graphic one: all the interest is in the fold and the movement of the fabric, not in the contrast. It is the most bridal of the thirteen and the one that most rewards being shot low against sky rather than ground.",
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
          "No. One dress from the collection is included in every photoshoot in the colour you choose, and all thirteen cost the same.",
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
    destination: {
      label: "Look through the wardrobe",
      path: "/wardrobe",
      note: "Twelve colours, photographed. Nothing is reserved by looking, and the colour is confirmed with you before the day rather than decided on it.",
    },
    inboundFrom: ["/wardrobe"],
    relatedStorySlugs: ["one-size-cut-to-fit"],
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
          "[The Pyramids Rooftop photoshoot](/experiences/pyramids-rooftop) happens on a private roof in the streets below the Giza plateau, looking across at it. It is not inside the archaeological complex, it is not on the sand beside the Great Pyramid, and there is no gate between you and your car.",
          "Everything else about the brand's locations follows the same pattern. [The Sand Dunes shoot](/experiences/sand-dunes) is on open desert. [Fayoum](/experiences/fayoum) is the lakes and the white dunes, about three hours from central Cairo. None of the three is a shoot inside an antiquities site.",
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
          "Somewhere to change, and somewhere to put the other twelve colours.",
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
    destination: {
      label: "The Pyramids Rooftop shoot",
      path: "/experiences/pyramids-rooftop",
      note: "This is the one the article is about. The page says where you stand, what you can see from it, and what it does not include.",
    },
    inboundFrom: ["/experiences/pyramids-rooftop", "/experiences"],
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
          "Once the date is fixed, two details get settled in advance rather than on the day: the dress colour, and fit. The collection is adjustable and covers a wide range of sizes, which removes most of the usual anxiety, but the right dress for you is confirmed rather than assumed, and availability is per date. That conversation is worth having before you are standing on a roof.",
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
          "Total time out of your day for Giza or [the dunes](/experiences/sand-dunes) is a morning. For [Fayoum](/experiences/fayoum) it is a day.",
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
    destination: {
      label: "Compare the photoshoots",
      path: "/experiences",
      note: "The shape of the session is the same at all of them. What changes is how long you are in the car first, and what is behind you when you get out.",
    },
    inboundFrom: ["/experiences", "/faq"],
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
    destination: {
      label: "Proposals",
      path: "/celebrations/marriage-proposals",
      note: "What we need to know beforehand, what the team does on the day, and the part we will not promise until a date is held.",
    },
    inboundFrom: ["/celebrations/marriage-proposals", "/celebrations"],
  },

  // -----------------------------------------------------------------------
  {
    slug: "one-size-cut-to-fit",
    cluster: "the-dress",
    title: "Adjustable, and what that means when you put it on",
    seoTitle: "One Size, Cut to Fit",
    metaDescription:
      "The collection is adjustable and covers a wide range of sizes. What that means for the bodice, the train, your height, and a maternity shoot.",
    excerpt:
      "This is the question people are most reluctant to ask and most relieved to have answered, so here is the answer before you have to ask it.",
    publishedAt: "2026-10-19T00:00:00.000Z",
    basis: "first-party",
    sections: [
      {
        heading: "What fit-all-size means here",
        body: [
          "The collection is adjustable, and that is not a slogan smoothing over a narrow size range. It is how this kind of garment is constructed: the bodice closes adjustably rather than to a fixed measurement, and the part of the dress doing the work in the photograph is not fitted to anybody at all. Plus sizes are genuinely covered and regularly shot.",
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
          "The dresses are adjustable and cover a wide range of sizes. Which one suits you, and in what colour, is confirmed with you before the date rather than assumed, because availability is per date and because a surprise at six in the morning is worth one message the week before.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do I need to know my dress size?",
        answer:
          "Not usually. The collection closes adjustably rather than to a fixed measurement and covers a wide range, plus sizes included. We still confirm which dress suits you rather than promising that any of them will. Your height is more useful to us than a size.",
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
    destination: {
      label: "The wardrobe",
      path: "/wardrobe",
      note: "Twelve dresses, one adjustable cut. Tell us your measurements when you enquire and we will tell you honestly how it will sit.",
    },
    inboundFrom: ["/wardrobe", "/rentals/dress-rental"],
    relatedStorySlugs: ["choosing-a-dress-colour"],
  },
  // -----------------------------------------------------------------------
  {
    slug: "what-a-flying-dress-photoshoot-costs",
    cluster: "the-session",
    status: "published",
    title: "What a flying dress photoshoot in Egypt costs",
    seoTitle: "What a Flying Dress Shoot Costs",
    metaDescription:
      "Our four shoots, what each price covers, what is charged on top, and where those figures sit against what else is sold at Giza. No login, no quote form.",
    excerpt:
      "Every published price we have, what it already includes, what is charged on top of it, and the two things we still will not put a number on. Written because almost nobody selling this publishes a figure at all.",
    publishedAt: "2026-10-25T00:00:00.000Z",
    basis: "cited",
    sections: [
      {
        heading: "The short answer",
        body: [
          "Our shoots are $179, $199, $349 and $399 per person. That is the whole published range, those are the figures on [the packages page](/packages), and they are per person rather than per booking.",
          "Each one covers the photographer, the assistant whose job is the dress, the dress itself, the transport described on that shoot's page, and over a hundred colour-graded photographs. Makeup, hair, a second dress, accessories and traditional attire for a man in the frame are extras with their own figures, and three of those figures do not exist yet because we have not set them.",
          "Nothing on this website charges a card. The price is confirmed to you in writing before anything is agreed.",
        ],
      },
      {
        heading: "The four shoots, and why they are not the same number",
        body: [
          "[Sand Dunes](/experiences/sand-dunes) is $179. Open desert south of Giza, a morning out of your day.",
          "[The Pyramids Rooftop](/experiences/pyramids-rooftop) is $199. A private roof in the streets below the plateau, looking across at it. The twenty dollars between this and the dunes buys the roof, not a longer session.",
          "[Fayoum](/experiences/fayoum) is $349. The lakes and the white dunes, about three hours from central Cairo each way, so roughly six hours of driving surround the shoot. Most of what you are paying for above the Giza shoots is the day, not the photography.",
          "The Red Sea Yacht experience is $399. It is the one of the four we quote rather than list, because the boat and the date have to be confirmed before we can promise it.",
          "The session itself is thirty to forty-five minutes at all of them. Anybody pricing by the hour is pricing something else; see [what those minutes actually consist of](/stories/inside-a-forty-five-minute-session).",
        ],
      },
      {
        heading: "What the price already covers",
        body: [
          "This is the part worth reading before comparing anything, because what sits inside the number is where operators differ most.",
        ],
        list: [
          "The photographer, and the assistant. The assistant is not optional staffing we add for larger groups. A five-metre train does not fly without somebody throwing it, which is [the whole physics of the photograph](/stories/how-a-flying-dress-flies).",
          "The dress, from the twelve in [the wardrobe](/wardrobe). Hire is included in the shoot; you are not renting it separately.",
          "Transport as described on the individual shoot page, which for Fayoum is the larger part of the day.",
          "Over a hundred colour-graded photographs, delivered as a gallery. Basic editing is on all of them.",
          "One short vertical edit, included with every experience.",
        ],
      },
      {
        heading: "What is charged on top",
        body: [
          "These are the published figures, and they are the complete list of extras that carry one: light makeup from $35, full makeup $45, a hairdresser from $45, two extra Reels $25, a second dress in the same session $99, and a dress made or customised for you to keep at $249.",
          "Two more are real services with no figure yet, and we would rather say so than invent one: accessories, and traditional attire for a man in the frame. Both are quoted when you ask, in writing, before anything is agreed. Professional video production, deeper retouching on a handful of frames, and a separate session at the Nine Pyramids View inside the Giza complex are quoted the same way.",
          "If a published price matters to your planning more than the service does, say so when you [enquire](/enquire) and we will tell you plainly whether we can put a number on it yet.",
        ],
      },
      {
        heading: "Where that sits against everything else at Giza",
        body: [
          "We looked at what else was being sold in October 2026, because a price means nothing on its own. The sources are listed at the bottom of this article along with what each one does and does not establish.",
          "Marketplace listings for flying-dress sessions at Giza ran from roughly $180 to $500 per person. At the upper end, a rooftop package was listed at $500 including transport, a photographer, a dress and a video, and another operator advertised rooftop sessions from $450 for an hour with twenty edited photographs. At the lower end, four-hour and one-hour private flying-dress sessions were listed from $189 and $180. Ordinary pyramid photo sessions with no flying dress were listed from about $85.",
          "Our range sits at the bottom of the flying-dress bracket and above the plain photo tours. We are not going to pretend that makes us better value in every case: a $500 package including four hours and a video is selling something different from a forty-five minute session, and the honest comparison is what is inside the number rather than the number.",
          "Two cautions about those figures. They are marketplace listings rather than price lists, several showed a discount against a higher figure, and none of them is a quote anybody is bound to. They are a snapshot of a market on one day.",
        ],
      },
      {
        heading: "What this website will not do",
        body: [
          "No form on this site asks for card details, and no page here charges anything. That is a deliberate limit rather than a feature we have not built yet.",
          "What happens instead: you tell us the date and what you want, a person reads it, and you get back the price and the terms in writing before you commit to anything. Nothing is held until a date is confirmed with you, and a message is the start of a conversation rather than a booking.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is the price per person or per booking?",
        answer:
          "Per person. Two people at the Pyramids Rooftop is two times $199, not $199 shared, because the dress, the fitting and the frames are per person. If you are planning a group, ask us when you enquire rather than assuming either way.",
      },
      {
        question: "Is there a deposit?",
        answer:
          "A deposit arrangement is agreed with you in writing when a date is held. Nothing is charged on this website and no page here collects card details.",
      },
      {
        question: "Why do accessories and men's attire have no price?",
        answer:
          "Because we have not set one. Both are real services and both are quoted on request. We would rather tell you that than publish a figure here that turns out not to apply to your dates.",
      },
      {
        question: "Are you the cheapest?",
        answer:
          "No, and we would be suspicious of anyone who claimed to be. Plain photo sessions at the pyramids with no flying dress were listed from around $85 in October 2026. Within flying-dress sessions specifically our prices are at the lower end of what we found, but the useful comparison is what each price includes.",
      },
      {
        question: "Does the price change by season?",
        answer:
          "The published figures are the published figures. If anything about your dates changes what we can offer, you will hear it in the written reply rather than discover it afterwards.",
      },
    ],
    related: [
      { label: "Compare the shoots side by side", path: "/packages" },
      { label: "Inside a forty-five minute session", path: "/stories/inside-a-forty-five-minute-session" },
      { label: "Questions", path: "/faq" },
    ],
    destination: {
      label: "Compare the shoots",
      path: "/packages",
      note: "All four side by side, with what each one includes written out rather than summarised. Nothing on that page charges anything either.",
    },
    inboundFrom: ["/packages", "/experiences"],
    relatedStorySlugs: ["inside-a-forty-five-minute-session"],
    sources: [
      {
        label: "Tinggly: Pyramids of Giza flying dress photoshoot from a rooftop",
        url: "https://tinggly.com/experience/pyramids-of-giza-flying-dress-photoshoot-from-a-rooftop/442172P66",
        accessed: "2026-10-25",
        supports:
          "A rooftop flying-dress package listed at $500, including a photographer, a dress rental, transport and a video.",
        doesNotSupport:
          "What the session itself lasts, or whether the listed figure is what a buyer actually pays after discounts.",
      },
      {
        label: "Arabian Moments: book a photoshoot in Egypt",
        url: "https://arabianmoments.com/pages/egypt-photoshoot",
        accessed: "2026-10-25",
        supports:
          "Rooftop flying-dress sessions advertised from $450 for one hour with twenty edited photographs.",
        doesNotSupport: "Any claim about what is included beyond the figures on that page.",
      },
      {
        label: "Tripadvisor: Giza and Cairo photography tours",
        url: "https://www.tripadvisor.com/Attractions-g294202-Activities-c42-t269-Giza_Giza_Governorate.html",
        accessed: "2026-10-25",
        supports:
          "Private flying-dress sessions at Giza listed from $180 and $189 per adult, and pyramid photo sessions without a flying dress from about $85.",
        doesNotSupport:
          "That these are current prices on any given day. They are marketplace listings, several carrying a discount against a higher figure, read on one date.",
      },
    ],
  },
  // -----------------------------------------------------------------------
  {
    slug: "two-people-in-the-frame",
    cluster: "the-occasion",
    status: "published",
    title: "Two people in the frame, and what it changes",
    seoTitle: "Two People in the Frame",
    metaDescription:
      "What a flying dress session is like with a partner, a friend or a family in it: how the price works, who holds what, and the one thing that gets harder.",
    excerpt:
      "Most of what is written about flying dress photoshoots assumes one person in a dress. A second person changes the price, the choreography and the part of the session that is hardest to get right, and almost none of that is obvious before you book.",
    publishedAt: "2026-10-25T00:00:00.000Z",
    basis: "first-party",
    sections: [
      {
        heading: "The price is per person, and that is the first thing to settle",
        body: [
          "Every figure on [the packages page](/packages) is per person. Two of you at the Pyramids Rooftop is two times $199, not $199 split between you.",
          "This catches people out often enough to be worth putting first. It is not a surcharge for a second body in the photograph; it is that each person is a dress or a gawn, a fitting, a place in the car and a share of the frames. If only one of you is being dressed and the other is simply there, say so when you [enquire](/enquire) and we will tell you honestly what that costs, because it is not the same thing.",
          "Group rates are the one number we have not published. If there are more than two of you, ask.",
        ],
      },
      {
        heading: "What actually changes on the day",
        body: [
          "The session stays thirty to forty-five minutes. What changes is how much of it is spent on choreography rather than on frames.",
          "With one person, the photographer and the assistant are solving one timing problem: the throw, and where you are standing when the fabric opens. With two, there is a second person who has to be somewhere specific at the same moment, usually out of the fabric's path, and usually doing something that does not look like waiting.",
          "In practice that means fewer total attempts and more useful ones. A two-person session produces the same delivered gallery; it gets there by setting up more carefully rather than by shooting more.",
        ],
      },
      {
        heading: "The second dress, and the gawn",
        body: [
          "If both of you want to be in a flying dress, that is two shoots at the per-person price, and the throws alternate rather than happening together. Two five-metre trains in the air at once is a photograph we can occasionally get and will not promise.",
          "A second look for one person in the same session is different and cheaper: a second dress is $99, and it buys a colour change and the frames to go with it rather than a second session.",
          "For a man in the frame there are five styles of traditional gawn, in the Saeedy and Bahary traditions and a classic plain cut. They are hired rather than included, and we quote them on request, which means exactly that: we have not set a published figure and will not invent one here. Pick a style when you enquire and the cost comes back in writing with everything else.",
        ],
      },
      {
        heading: "Who holds what",
        body: [
          "The assistant holds the dress. That does not change with a second person in the picture, and it is worth saying because the instinct is to help.",
          "Being handed the train by a partner looks natural and almost never works: the throw needs height and a known release point, and an untrained throw from the wrong side wraps the fabric around whoever is nearest. If a shot genuinely calls for the two of you holding fabric between you, the photographer will set it up deliberately and it will be a different kind of frame from the flying ones.",
          "The one thing we would ask of a second person is to keep looking where they are told after the throw, not at the dress. Everyone looks at the dress. It is the single most common reason a frame with two people in it goes unused.",
        ],
      },
      {
        heading: "Friends, families and the rest",
        body: [
          "Two is the common case; it is not the only one. The same session shape covers a parent and an adult child, two friends alternating one dress, and a family where one person is dressed and the others are in the photograph as themselves.",
          "What all of those need is for us to know the composition before the day, because it changes how many dresses travel, how long the fittings take and which location is sensible. [Fayoum](/experiences/fayoum) with four people is a long day in a car; [the Pyramids Rooftop](/experiences/pyramids-rooftop) with four people is a roof with four people on it, which is a different conversation about space.",
          "If what you are planning is a specific occasion rather than a shoot, the [celebrations pages](/celebrations) say what each one involves, including the one we will not promise until a date is held.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do two people pay twice?",
        answer:
          "Yes, if both of you are being dressed and photographed: the published prices are per person. If only one of you is in a dress and the other is in the frame as themselves, tell us when you enquire and we will quote that rather than assume.",
      },
      {
        question: "Can both of us wear a flying dress at once?",
        answer:
          "Both of you can wear one in the same session, and the throws alternate rather than happening simultaneously. Two full trains in the air in one frame is something we sometimes get and never promise in advance.",
      },
      {
        question: "What does my partner wear?",
        answer:
          "Whatever they like, or one of five traditional gawns we hire out. The gawns are charged on top of the shoot and quoted on request, because we have not published a figure for them.",
      },
      {
        question: "Is a two-person session longer?",
        answer:
          "No. It is the same thirty to forty-five minutes, with more of that time spent positioning and less of it spent on repeat attempts.",
      },
      {
        question: "What about a group of us?",
        answer:
          "Ask. Group pricing is the one figure we have not published, and the location matters more with numbers than it does with two of you.",
      },
    ],
    related: [
      { label: "Anniversaries and romance", path: "/celebrations/anniversaries-and-romance" },
      { label: "Traditional attire for men", path: "/rentals/mens-wear" },
      { label: "What a shoot costs", path: "/stories/what-a-flying-dress-photoshoot-costs" },
    ],
    destination: {
      label: "See the celebrations",
      path: "/celebrations",
      note: "Proposals, anniversaries, reveals and family sittings, each with what it involves and what we will not promise until a date is held.",
    },
    inboundFrom: ["/celebrations", "/rentals/mens-wear"],
    relatedStorySlugs: ["photographing-a-proposal-she-does-not-know-about", "what-a-flying-dress-photoshoot-costs"],
  },
  // -----------------------------------------------------------------------
  // RESEARCHED, NOT PUBLISHED. It has no URL, it is not in the sitemap, and
  // the index does not show it. See StoryStatus.
  //
  // The research is done and it is the reason this is not live yet. Searching
  // in October 2026 for what you are allowed to photograph at Giza returned
  // travel blogs contradicting each other: one says no permit is needed for
  // professional photography on the plateau, another says a commercial shoot
  // needs ministry authorisation two to four weeks ahead, a third puts a
  // tripod fee at about 20 EGP per site per day, and a fourth says tripods
  // need written authorisation rather than a gate fee. None of them is an
  // official source.
  //
  // That contradiction IS the article: a reader is currently choosing between
  // four confident answers with no way to tell which is right, and the useful
  // thing we can do is show the disagreement and say who actually owns the
  // answer. What it must never become is a fifth confident answer, which is
  // what writing it from these sources alone would produce.
  //
  // WHAT IT NEEDS BEFORE IT GOES LIVE (owner):
  //   1. What our team actually does on a Giza shoot day. We run the rooftop
  //      session, which does not enter the complex at all, so our first-hand
  //      knowledge of in-complex permits may be thin. If it is, the article
  //      should say so and shrink to what we do know.
  //   2. Whether anyone here has dealt with the Ministry of Tourism and
  //      Antiquities directly, and what that process was.
  //   3. An official source for the tripod position, or confirmation that
  //      there is not one and the article should say that instead.
  // -----------------------------------------------------------------------
  {
    slug: "who-owns-the-answer-about-photographing-giza",
    cluster: "the-place",
    status: "researched",
    title: "Why every guide gives you a different answer about photographing Giza",
    seoTitle: "Photographing Giza: Who to Believe",
    metaDescription:
      "Four guides, four different answers on tripods and permits at the pyramids. What they actually disagree about, and who owns the answer on the day.",
    excerpt:
      "Search for the rules on tripods and professional photography at Giza and you will find four confident, incompatible answers. This is what they disagree about and why we are not adding a fifth.",
    publishedAt: "2026-10-25T00:00:00.000Z",
    basis: "cited",
    sections: [
      {
        heading: "Outline, pending the owner's input",
        body: [
          "Placeholder. This article is researched and briefed, not written. The block comment above this entry lists the three things needed before it can be.",
        ],
      },
    ],
    faqs: [],
    related: [
      { label: "The Pyramids Rooftop shoot", path: "/experiences/pyramids-rooftop" },
      {
        label: "A rooftop with a view of the pyramids is not the pyramid complex",
        path: "/stories/a-pyramid-view-is-not-the-pyramid-complex",
      },
    ],
    destination: {
      label: "The Pyramids Rooftop shoot",
      path: "/experiences/pyramids-rooftop",
    },
    sources: [
      {
        label: "Ahmose Travel: Egypt photography permits and drone laws at Giza",
        url: "https://ahmosetravel.com/egypt-photography-permits-drone-rules-2026/",
        accessed: "2026-10-25",
        supports:
          "The claim that tripods require authorisation from the Ministry of Tourism and Antiquities, and that drones are effectively prohibited for tourists.",
        doesNotSupport:
          "Any fee. It is a travel operator's blog, not an official publication, and it conflicts with sources that describe a small fee paid at the gate.",
      },
      {
        label: "Joy TKT: pyramids photography rules for Giza",
        url: "https://joytkt.com/pyramids-photography-rules/",
        accessed: "2026-10-25",
        supports:
          "The claim that tripod and monopod permits are bought at the entrance gate and that the receipt is checked on site.",
        doesNotSupport:
          "Its own figure, which no official source we found corroborates, and which disagrees with the authorisation-based account above.",
      },
      {
        label: "Local Lens: Egypt pyramids photoshoot guide",
        url: "https://locallens.com/egypt-pyramids-photoshoot/",
        accessed: "2026-10-25",
        supports:
          "The claim that no separate permit is required for personal or professional photography on the plateau, with commercial film productions treated separately.",
        doesNotSupport:
          "The distinction it draws between professional photography and commercial production, which is the exact point the other sources disagree on.",
      },
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

/**
 * The articles a reader can actually reach.
 *
 * Everything public goes through this rather than `flyingDressStories`: the
 * index, the sitemap, generateStaticParams, the related rail and the inbound
 * links on commercial pages. A draft that leaks onto one of those is a thin
 * page indexed under this brand's name, which is the exact thing the quality
 * bar in this file exists to prevent.
 */
export function liveStories(): FlyingDressStory[] {
  return flyingDressStories.filter((s) =>
    LIVE_STORY_STATUSES.includes(s.status ?? "published")
  );
}

export function storyBySlug(slug: string): FlyingDressStory | undefined {
  return flyingDressStories.find((s) => s.slug === slug);
}

/** Resolves only what a reader may see. Routing uses this; the checks use storyBySlug. */
export function liveStoryBySlug(slug: string): FlyingDressStory | undefined {
  return liveStories().find((s) => s.slug === slug);
}

export function storiesInCluster(cluster: StoryClusterId): FlyingDressStory[] {
  return liveStories().filter((s) => s.cluster === cluster);
}

/**
 * RELATED ARTICLES, BY RELEVANCE RATHER THAN BY POSITION IN AN ARRAY.
 *
 * This replaced `flyingDressStories.filter(not me).slice(0, 3)`, which is
 * what the article template shipped with. That version was not a weak
 * heuristic, it was no heuristic: it returned the first three articles in
 * file order to every article on the site, so the dress-colour piece and the
 * proposal piece recommended an identical rail, and the sixth article was
 * unreachable from any of them. A reader learns within two articles that the
 * rail is furniture, and stops looking at it.
 *
 * The score is deliberately small and explicable:
 *
 *   +3  the editor named it in `relatedStorySlugs`
 *   +2  same cluster — the strongest signal we have, because the clusters
 *       were drawn around what a reader is worrying about, not by subject
 *   +1  same commercial destination, i.e. it is read by someone heading for
 *       the same product
 *   +1  the other article already links here, so the pair is a real pair
 *
 * Ties break on publication date, newest first, so a genuinely undifferentiated
 * pair at least rotates as the library grows rather than freezing forever on
 * whichever happens to sit higher in the file.
 */
export function relatedStories(story: FlyingDressStory, limit = 3): FlyingDressStory[] {
  const named = new Set(story.relatedStorySlugs ?? []);
  const linksTo = new Set(
    story.related.filter((r) => r.path.startsWith("/stories/")).map((r) => r.path.slice(9))
  );

  return liveStories()
    .filter((other) => other.slug !== story.slug)
    .map((other) => {
      const otherLinksBack = other.related.some(
        (r) => r.path === `/stories/${story.slug}`
      );
      let score = 0;
      if (named.has(other.slug)) score += 3;
      if (other.cluster === story.cluster) score += 2;
      if (
        story.destination &&
        other.destination &&
        other.destination.path === story.destination.path
      ) {
        score += 1;
      }
      if (linksTo.has(other.slug) || otherLinksBack) score += 1;
      return { other, score };
    })
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        Date.parse(b.other.publishedAt) - Date.parse(a.other.publishedAt)
    )
    .slice(0, limit)
    .map((entry) => entry.other);
}

/**
 * The live articles that asked to be linked from this page.
 *
 * Called by the commercial pages, which is what turns `inboundFrom` from a
 * note into a link. Capped by the caller rather than here: a product page
 * decides how much of itself it wants to give to editorial.
 */
export function storiesLinkedFrom(path: string): FlyingDressStory[] {
  return liveStories().filter((s) => (s.inboundFrom ?? []).includes(path));
}

/** Every brand-relative path a story points at, for the link checks. */
export function storyLinkTargets(story: FlyingDressStory): string[] {
  return [
    ...(story.destination ? [story.destination.path] : []),
    ...story.related.map((r) => r.path),
    ...(story.inboundFrom ?? []),
    ...story.sections.flatMap((section) =>
      [...section.body, ...(section.list ?? [])].flatMap((text) =>
        parseStoryText(text)
          .filter((node): node is { kind: "link"; text: string; path: string } => node.kind === "link")
          .map((node) => node.path)
      )
    ),
  ];
}

/**
 * CONTEXTUAL LINKS INSIDE THE PROSE, AS `[text](/path)`.
 *
 * The articles could already link outward from a rail at the bottom, which is
 * the least useful place to put a link: it is read by whoever finishes, and
 * it is nowhere near the sentence that made them want to click. A reader who
 * has just read what the assistant does should be able to reach the wardrobe
 * from that sentence.
 *
 * Markdown's link syntax rather than a bespoke one, because it is the syntax
 * every editor already knows and because the parse is twelve lines. It is a
 * deliberately tiny subset: links only, no emphasis, no HTML. Nothing here
 * renders raw markup, so there is no injection surface — the text and the
 * path both come out as React children and `href`, never as HTML.
 *
 * Paths are brand-relative and checked against the route registry, so a link
 * to a page that does not exist fails `npm run check` rather than a customer.
 */
export type StoryTextNode =
  | { kind: "text"; text: string }
  | { kind: "link"; text: string; path: string };

const INLINE_LINK = /\[([^\]]+)\]\((\/[^)\s]*)\)/g;

export function parseStoryText(text: string): StoryTextNode[] {
  const nodes: StoryTextNode[] = [];
  let last = 0;
  for (const match of text.matchAll(INLINE_LINK)) {
    const index = match.index ?? 0;
    if (index > last) nodes.push({ kind: "text", text: text.slice(last, index) });
    nodes.push({ kind: "link", text: match[1] ?? "", path: match[2] ?? "" });
    last = index + match[0].length;
  }
  if (last < text.length) nodes.push({ kind: "text", text: text.slice(last) });
  return nodes;
}

/** The reader's words, with the link markup removed. Word counts and reading estimates use this. */
export function storyPlainText(text: string): string {
  return parseStoryText(text)
    .map((node) => node.text)
    .join("");
}

/** Every word a reader sees, which is what both the word count and the reading estimate are about. */
export function storyWordCount(story: FlyingDressStory): number {
  // storyPlainText, not the raw strings: a body paragraph may carry
  // `[the wardrobe](/wardrobe)`, and counting the slug as two words inflates
  // both the count and the reading estimate shown to the reader.
  const text = [
    story.title,
    story.excerpt,
    ...story.sections.flatMap((s) => [
      s.heading,
      ...s.body.map(storyPlainText),
      ...(s.list ?? []).map(storyPlainText),
    ]),
    ...story.faqs.flatMap((f) => [f.question, storyPlainText(f.answer)]),
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
