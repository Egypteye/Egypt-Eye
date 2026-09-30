import type { TreasureCategory, TreasureProduct } from "./types";

// Take Egypt Home — the shopping section. See docs/take-egypt-home.md for the
// naming, the two-journey split, and the list of business facts still needed.
//
// WHAT IS NOT IN THIS FILE, and must not be added without Egypt Eye supplying
// it: prices, metals, karats, weights, hallmarks, production times, collection
// promises, shop names and addresses, "natural" or "airline safe" claims. The
// pages are built to display all of those the moment they are real. Until
// then a product says what it is and stops.
//
// The sample listings below carry `placeholder: true`. That is load-bearing:
// it marks the card, keeps the item out of structured data, and is asserted by
// scripts/check-treasures.mts. Shipping twenty invented cartouches would have
// been twenty business facts nobody supplied.

export const TREASURES_PATH = "/take-egypt-home";

export const treasureCategories: TreasureCategory[] = [
  // -------------------------------------------------------------------------
  {
    slug: "cartouches",
    active: true,
    order: 1,
    title: "Cartouches",
    eyebrow: "Gold & Silver",
    heroHeadline: "Your name, written the way a pharaoh's was",
    heroSub:
      "A cartouche is the oval a royal name was carved inside, so that it could be read for as long as the stone lasted. Yours is made in Cairo and waiting when you land.",
    image:
      "https://images.unsplash.com/photo-1692986172397-ef662fba9152?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    imageAlt: "Carved hieroglyphs on an ancient Egyptian wall, birds and symbols cut into pale stone",
    imageCredit: {
      source: "Unsplash",
      creator: "Hasmik Ghazaryan Olson",
      sourceUrl: "https://unsplash.com/photos/a-wall-with-egyptian-writing-and-birds-on-it-EACmLohYwqY",
      license: "Unsplash License",
    },
    cardBlurb:
      "The oval a royal name was carved inside, made in gold or silver with your own name inside it.",
    cardHook: "Your name, in hieroglyphs",
    story: [
      {
        title: "What a cartouche actually is",
        body:
          "Egyptologists borrowed the word from Napoleon's soldiers, who thought the shape looked like a gun cartridge. The Egyptians called it a shen — a loop of rope with no beginning and no end, drawn around a king's name so that whatever the rope enclosed was protected. It is one of the few pieces of ancient Egyptian design still made for the same reason it was invented: to hold a name.",
      },
      {
        title: "Why your name can be written at all",
        body:
          "Hieroglyphs are not an alphabet in the way English is, but a set of them stand for sounds, and those are the ones used to spell foreign names — which is precisely how Ptolemy and Cleopatra were written, and how their cartouches gave Champollion the key to the whole script. Your name goes into the same signs, by sound rather than by letter. Two people who spell a name differently can end up with the same cartouche, and that is correct rather than a mistake.",
      },
    ],
    beforeYouArrive: [
      { title: "Choose a design", description: "Pick the piece and the metal." },
      {
        title: "Give us the name",
        description: "The exact spelling you want read aloud, and any second name for a matching piece.",
      },
      {
        title: "We confirm before anything is made",
        description:
          "You get the specification, the price and the date it will be ready, in writing, before you are asked to commit to anything.",
      },
      { title: "It is made while you pack", description: "Production runs in Cairo while you are still at home." },
      { title: "Collect when you arrive", description: "Handed over during your trip, at a point agreed with you." },
    ],
    personalization: [
      {
        kind: "text",
        name: "cartoucheName",
        label: "Name to be written",
        help: "Exactly as you would say it out loud. Hieroglyphs follow sound, not spelling.",
        maxLength: 40,
        required: true,
      },
      {
        kind: "text",
        name: "secondName",
        label: "A second name (optional)",
        help: "For a matching pair — a couple, or two children.",
        maxLength: 40,
      },
      {
        kind: "choice",
        name: "metal",
        label: "Metal",
        options: ["Gold", "Silver", "Not sure yet — advise me"],
        required: true,
      },
      {
        kind: "choice",
        name: "wornAs",
        label: "Worn as",
        options: ["Pendant on a chain", "Pendant only", "Not sure yet"],
      },
    ],
    trust: [
      "You will be sent the metal, weight and dimensions of the exact piece before you are asked to confirm.",
      "Nothing is made until you have approved how your name will be written.",
      "The price is agreed in writing first. A commissioned piece is never a surprise at handover.",
    ],
    faqs: [
      {
        question: "How is my name turned into hieroglyphs?",
        answer:
          "By sound. A subset of hieroglyphs work as phonetic signs, and those are the ones used for names that are not Egyptian — the same method that wrote Ptolemy and Cleopatra on real monuments. We send you the proposed spelling to approve before anything is made, so you can see what each sign is doing.",
      },
      {
        question: "Can two people have matching cartouches?",
        answer:
          "Yes, and it is one of the most common requests — couples, and parents having one made for each child. Give us both names on the form and we will quote them together.",
      },
      {
        question: "Can I order before I travel and collect in Egypt?",
        answer:
          "That is what this is designed for. Telling us your arrival date is what lets the piece be made while you are still at home, so it is finished rather than started when you land.",
      },
      {
        question: "What if I am already in Egypt?",
        answer:
          "Say so on the form and we will tell you what is possible in the days you have left. A simpler piece is quicker than an elaborate one, and how much time remains changes the honest answer.",
      },
    ],
    relatedTourSlugs: ["1-day-giza-tour"],
    relatedStorySlugs: ["best-souvenirs-to-buy-in-egypt"],
    seo: {
      seoTitle: "Egyptian Cartouche in Gold or Silver — Your Name in Hieroglyphs",
      seoDescription:
        "Have your name written in hieroglyphs inside a cartouche, made in Cairo in gold or silver. Reserve before you travel and collect it during your trip with Egypt Eye.",
    },
  },

  // -------------------------------------------------------------------------
  {
    slug: "papyrus",
    active: true,
    order: 2,
    title: "Papyrus",
    eyebrow: "Personalised",
    heroHeadline: "Not a picture of ancient Egypt. A place in it.",
    heroSub:
      "Choose a scene, send us a photograph, and the faces in the painting become yours — hand-finished on papyrus made the way it has been made for five thousand years.",
    image:
      "https://images.unsplash.com/photo-1608546043931-6c9678ea9feb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    imageAlt: "An Egyptian papyrus scroll painted with figures and hieroglyphs",
    imageCredit: {
      source: "Unsplash",
      creator: "Lea Kobal",
      sourceUrl: "https://unsplash.com/photos/egyptian-papyrus-scroll-with-painted-figures-UlHxDEtBDM0",
      license: "Unsplash License",
    },
    cardBlurb:
      "Choose an Egyptian scene and send a photograph. The figures in it are painted with your faces.",
    cardHook: "Become part of the story",
    story: [
      {
        title: "Why papyrus is not just paper",
        body:
          "It is made from the pith of a reed that once grew thickly along the Nile, cut into strips, layered at right angles, pressed and dried. The plant's own sap binds the sheet — nothing is added. Egypt wrote on it for over three thousand years, and sheets buried in dry ground have come back legible after two.",
      },
      {
        title: "A very old idea about portraits",
        body:
          "Egyptian tomb painting was never decoration. Putting someone into a scene was how you placed them in it permanently — at the offering table, on the boat, in front of the god. Having your own face painted into an Egyptian scene is a modern souvenir built on an idea the people who invented the art form would have recognised immediately.",
      },
    ],
    beforeYouArrive: [
      { title: "Choose a scene", description: "Each design is a different story to be written into." },
      { title: "Send a photograph", description: "Faces clear and well lit. One person, a couple, or a family." },
      {
        title: "We confirm what is possible",
        description:
          "Before anything is painted, you are told whether your photograph will work, what it will cost, and when it will be ready.",
      },
      { title: "It is painted while you travel", description: "Hand-finished work, begun once you approve." },
      { title: "Collect it in Egypt", description: "Flat-packed for the flight home." },
    ],
    personalization: [
      {
        kind: "photo",
        name: "photo",
        label: "Your photograph",
        help: "JPEG, PNG or WebP, up to 8 MB. Faces clear, well lit, looking at the camera if you can.",
        required: true,
      },
      {
        kind: "choice",
        name: "who",
        label: "Who is in it",
        options: ["One person", "A couple", "A family", "Other — I'll explain below"],
        required: true,
      },
      {
        kind: "text",
        name: "inscription",
        label: "Name or date to include (optional)",
        help: "A name, a wedding date, the year of the trip.",
        maxLength: 60,
      },
      {
        kind: "longtext",
        name: "notes",
        label: "Anything the artist should know",
        maxLength: 600,
      },
    ],
    trust: [
      "Your photograph is used for this commission and nothing else. It is not published anywhere, and you can ask us to delete it at any point.",
      "You will be told whether your photograph is usable before you commit to anything — resolution and lighting decide what is possible.",
      "The price and the date it will be ready are agreed in writing first.",
    ],
    faqs: [
      {
        question: "What kind of photograph works best?",
        answer:
          "A well-lit one where faces are clear and reasonably large in the frame. A phone photo taken in daylight is usually better than an old scanned print. Sunglasses, heavy shadow across the face, and very low resolution are the three things that most often cause us to ask for another.",
      },
      {
        question: "What happens to my photo?",
        answer:
          "It is used to make the piece you have commissioned and for nothing else — it is not published, not used in marketing, and not passed on beyond the people making your papyrus. Ask us to delete it and we will.",
      },
      {
        question: "Do I see it before it is finished?",
        answer:
          "The approval steps are set by the workshop, and we will tell you exactly what they are when we confirm your commission rather than promising something here that may not match how your particular piece is made.",
      },
      {
        question: "Will it survive the flight home?",
        answer:
          "Papyrus travels flat and is more robust than it looks — it is a woven sheet rather than a brittle one. It is packed for the journey when you collect it.",
      },
    ],
    relatedPhotoshootSlugs: ["exclusive-pyramids-photoshoot"],
    relatedStorySlugs: ["best-souvenirs-to-buy-in-egypt"],
    seo: {
      seoTitle: "Personalised Egyptian Papyrus — Your Photo Painted Into the Scene",
      seoDescription:
        "Choose an Egyptian scene, send a photograph, and have your own faces painted into it on real papyrus. Commission before you travel and collect it in Egypt.",
    },
  },

  // -------------------------------------------------------------------------
  {
    slug: "clothing",
    active: true,
    order: 3,
    title: "Clothing",
    eyebrow: "Curated & fitted",
    heroHeadline: "Egyptian cotton, cut the way Egypt cuts it",
    heroSub:
      "A short, chosen selection online — and a shop appointment for everything that has to be tried on. Most of what is worth buying is not on this page, and that is deliberate.",
    image:
      "https://images.unsplash.com/photo-1784762609693-c034b587b95b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    imageAlt: "Goods stacked and hanging along a narrow lane in an Egyptian bazaar",
    imageCredit: {
      source: "Unsplash",
      creator: "bora acar",
      sourceUrl: "https://unsplash.com/",
      license: "Unsplash License",
    },
    cardBlurb:
      "A few pieces worth seeing before you come, and an appointment for the rest — because fit is not a screen decision.",
    cardHook: "Wear it while you're here",
    story: [
      {
        title: "Why this page is short on purpose",
        body:
          "Clothing is the one category where buying from a photograph usually disappoints. Sizing is not standardised, cut varies between makers, and the weight of a fabric is something your hand tells you and a screen cannot. So the website shows a small selection to give you the idea, and the real choosing happens in a shop with the pieces in front of you.",
      },
      {
        title: "Worn during the trip, not just after it",
        body:
          "The travellers who get the most out of this buy early in the trip rather than on the last afternoon. A galabeya bought on day two is worn at dinner on the Nile, in the desert, and in every photograph taken afterwards — which is a different souvenir from one that comes out of a suitcase at home.",
      },
    ],
    beforeYouArrive: [
      { title: "See what we have selected", description: "A few pieces, so you know what kind of thing to expect." },
      {
        title: "Tell us what you are after",
        description: "Occasion, rough sizes, and whether it is for you or a gift.",
      },
      {
        title: "We book the appointment",
        description: "A time at the shop, arranged around your itinerary rather than squeezed into it.",
      },
      { title: "Try, choose, buy", description: "With the full range in front of you." },
    ],
    inEgypt: {
      title: "Already in Egypt?",
      body:
        "This is the category where that is an advantage. Tell us roughly when you are free and we will arrange a time at the shop, so you are not navigating a bazaar alone at the end of a long day.",
      steps: [
        { title: "Tell us your dates", description: "And which part of the city you are staying in." },
        { title: "We arrange a time", description: "Somewhere you can actually try things on." },
        { title: "Go and choose", description: "The selection in the shop is far wider than this page." },
      ],
    },
    personalization: [
      {
        kind: "choice",
        name: "occasion",
        label: "What is it for",
        options: [
          "Wearing during the trip",
          "A photoshoot",
          "A dinner or an evening",
          "A gift",
          "Not sure yet",
        ],
        required: true,
      },
      { kind: "text", name: "sizes", label: "Rough sizes", help: "However you normally describe them.", maxLength: 80 },
      { kind: "longtext", name: "notes", label: "Anything else", maxLength: 600 },
    ],
    trust: [
      "Nothing is charged before you have seen and tried the piece.",
      "The appointment is a time to look, not a commitment to buy.",
      "Sizes and stock are confirmed with the shop before we promise you anything.",
    ],
    faqs: [
      {
        question: "Can I buy directly from this page?",
        answer:
          "Not for clothing, and that is deliberate rather than a limitation. Sizing is not standardised and fabric weight is something you judge by hand, so we arrange for you to try things instead of shipping you a guess.",
      },
      {
        question: "Can I wear it for a photoshoot?",
        answer:
          "Yes, and it is worth timing on purpose — choosing an outfit early in the trip means it can be worn on the shoot rather than bought after it. Tell us on the form if that is the plan and we will arrange the shop visit before your shoot date.",
      },
      {
        question: "Is this a shop you own?",
        answer:
          "No. We arrange the appointment and come with you; the shop is a specialist we work with. You buy from them directly, at their price.",
      },
    ],
    relatedPhotoshootSlugs: ["exclusive-pyramids-photoshoot", "flying-dress-photoshoot"],
    relatedStorySlugs: ["best-markets-and-bazaars-in-egypt"],
    seo: {
      seoTitle: "Egyptian Clothing — Curated Pieces and a Shop Appointment in Cairo",
      seoDescription:
        "A short selection of Egyptian clothing to see before you travel, and an arranged shop visit for everything that has to be tried on. Wear it during your trip.",
    },
  },

  // -------------------------------------------------------------------------
  {
    slug: "essence-oils",
    active: true,
    order: 4,
    title: "Essence Oils",
    eyebrow: "Fragrance",
    heroHeadline: "The one souvenir that brings the place back without being looked at",
    heroSub:
      "Concentrated Egyptian fragrance oils, chosen by smelling them. Reserve a bottle to collect, or spend an hour at the shop working out which one is yours.",
    image: "/photos/pexels-18991500.jpg",
    imageAlt: "A lane in Khan El-Khalili, Cairo's oldest bazaar, lit by hanging lamps",
    cardBlurb:
      "Concentrated oils rather than sprays. Reserve one you already know, or come and find yours.",
    cardHook: "Egypt, from a bottle",
    story: [
      {
        title: "Why oil rather than spray",
        body:
          "A conventional perfume is mostly alcohol, which carries the scent up into the air and then leaves. An oil sits on the skin and releases slowly, so it stays closer and lasts longer, and a very small bottle goes a very long way. It is the older way of wearing fragrance, and it is still how most fragrance is sold in Egypt.",
      },
      {
        title: "Scent is the sense that remembers",
        body:
          "Smell is wired almost directly into the parts of the brain that handle memory and emotion, which is why a scent can return a place to you more completely than a photograph. It is the reason this is, quietly, the best souvenir on this page — and the reason it is worth choosing properly rather than grabbing at the airport.",
      },
    ],
    beforeYouArrive: [
      { title: "Read the collection", description: "What each oil is built around." },
      { title: "Tell us what you tend to wear", description: "We will point you at two or three to try first." },
      { title: "Reserve, or book to smell", description: "Both are fine. Neither costs anything up front." },
      { title: "Collect during your trip", description: "Or choose at the shop and take it with you." },
    ],
    inEgypt: {
      title: "Choosing by smelling",
      body:
        "No description of a fragrance survives contact with your own nose. If you have an hour, the shop visit is the better version of this — a range to work through, and time to let something sit on your skin before you decide.",
      steps: [
        { title: "Tell us when you are free", description: "An hour is enough." },
        { title: "We arrange the visit", description: "With someone who knows the range." },
        { title: "Try, then choose", description: "Buy only what you actually liked on your own skin." },
      ],
    },
    personalization: [
      {
        kind: "choice",
        name: "profile",
        label: "What do you usually wear?",
        options: [
          "Floral",
          "Warm and resinous — amber, incense, woods",
          "Fresh and citrus",
          "Musk",
          "No idea — surprise me",
        ],
        required: true,
      },
      {
        kind: "choice",
        name: "purpose",
        label: "Who is it for",
        options: ["Myself", "A gift", "Both"],
      },
      { kind: "longtext", name: "notes", label: "Anything else", maxLength: 600 },
    ],
    trust: [
      "We make no claim about what any oil is or is not made of. Composition is something a supplier has to state in writing, and we will publish it here when they do.",
      "Nothing about carrying fragrance on a flight is promised here — see Travel Notes below.",
      "You can always smell before you buy. Nobody should choose a fragrance from a paragraph.",
    ],
    faqs: [
      {
        question: "Are these alcohol-free?",
        answer:
          "Concentrated fragrance oils are generally oil-based rather than alcohol-based, but we are not going to put that claim against a specific bottle until the supplier has confirmed it in writing for that product. Ask us about a particular oil and we will tell you what we actually know.",
      },
      {
        question: "Can I take them on a plane?",
        answer:
          "Liquids in hand luggage are limited by container size and total volume, and the exact rules differ by airline, airport and destination. We will not promise you that any given bottle is fine in a cabin bag — check with your airline for the route you are flying, and if in doubt put it in hold luggage.",
      },
      {
        question: "How do I choose without smelling them?",
        answer:
          "Tell us what you already wear and we will narrow it to two or three. But if your trip allows an hour at the shop, take it — it is a better way to spend that hour than reading fragrance descriptions, which are unreliable for everybody.",
      },
    ],
    relatedStorySlugs: ["best-souvenirs-to-buy-in-egypt", "best-markets-and-bazaars-in-egypt"],
    seo: {
      seoTitle: "Egyptian Essence Oils — Concentrated Fragrance Oils, Chosen Properly",
      seoDescription:
        "Concentrated Egyptian fragrance oils rather than alcohol sprays. Reserve a bottle to collect during your trip, or book time at the shop to find yours by smelling it.",
    },
  },
];

// -----------------------------------------------------------------------------
// Sample listings.
//
// Every one is marked `placeholder: true` and carries no price, no metal and no
// dimensions, because none of those have been supplied. They exist to show the
// grid and to be replaced. See "What I need from you" in docs/take-egypt-home.md.
// -----------------------------------------------------------------------------

export const treasureProducts: TreasureProduct[] = [
  {
    slug: "cartouche-classic-pendant",
    category: "cartouches",
    name: "Classic cartouche pendant",
    blurb: "The traditional upright oval, one name, worn on a chain.",
    image:
      "https://images.unsplash.com/photo-1601121141461-920cb1993441?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    imageAlt: "A gold and silver pendant necklace resting against fabric",
    imageCredit: {
      source: "Unsplash",
      creator: "Vaibhav Nagare",
      sourceUrl: "https://unsplash.com/photos/person-wearing-gold-and-silver-necklace-vv2vIFeNEMg",
      license: "Unsplash License",
    },
    placeholder: true,
    status: "onRequest",
    order: 1,
  },
  {
    slug: "cartouche-double-name",
    category: "cartouches",
    name: "Two-name cartouche",
    blurb: "Two names in one oval, or a matching pair — the usual choice for couples.",
    placeholder: true,
    status: "onRequest",
    order: 2,
  },
  {
    slug: "cartouche-open-back",
    category: "cartouches",
    name: "Open-back cartouche",
    blurb: "Pierced so the signs read from either side.",
    placeholder: true,
    status: "onRequest",
    order: 3,
  },
  {
    slug: "papyrus-royal-portrait",
    category: "papyrus",
    name: "Royal portrait",
    blurb: "Seated in the posture the New Kingdom reserved for royalty, with your own face.",
    placeholder: true,
    status: "onRequest",
    order: 1,
  },
  {
    slug: "papyrus-offering-scene",
    category: "papyrus",
    name: "The offering scene",
    blurb: "Two figures facing each other across a table — the oldest way Egypt painted a couple.",
    placeholder: true,
    status: "onRequest",
    order: 2,
  },
  {
    slug: "papyrus-nile-boat",
    category: "papyrus",
    name: "The Nile boat",
    blurb: "A family crossing the river, which is how tomb painting showed a household together.",
    placeholder: true,
    status: "onRequest",
    order: 3,
  },
  {
    slug: "clothing-cotton-galabeya",
    category: "clothing",
    name: "Cotton galabeya",
    blurb: "The everyday long robe, in Egyptian cotton.",
    placeholder: true,
    status: "onRequest",
    order: 1,
  },
  {
    slug: "clothing-embroidered-kaftan",
    category: "clothing",
    name: "Embroidered kaftan",
    blurb: "Hand-worked detail at the neck and cuffs.",
    placeholder: true,
    status: "onRequest",
    order: 2,
  },
  {
    slug: "oil-collection-sampler",
    category: "essence-oils",
    name: "Three-oil sampler",
    blurb: "A way to take three home and decide later which one is yours.",
    placeholder: true,
    status: "onRequest",
    order: 1,
  },
  {
    slug: "oil-single-bottle",
    category: "essence-oils",
    name: "Single bottle",
    blurb: "One oil, chosen by smelling it.",
    image:
      "https://images.unsplash.com/photo-1671493229066-f36e86b35841?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    imageAlt: "A hand holding a small amber glass bottle of fragrance oil",
    imageCredit: {
      source: "Unsplash",
      creator: "Denise Chan",
      sourceUrl: "https://unsplash.com/photos/a-person-holding-a-bottle-of-essential-oils-d8X84PjlfiY",
      license: "Unsplash License",
    },
    placeholder: true,
    status: "onRequest",
    order: 2,
  },
];

export function treasureCategoryBySlug(slug: string): TreasureCategory | undefined {
  return treasureCategories.find((c) => c.slug === slug);
}

export function treasureProductsFor(slug: string): TreasureProduct[] {
  return treasureProducts.filter((p) => p.category === slug).sort((a, b) => a.order - b.order);
}
