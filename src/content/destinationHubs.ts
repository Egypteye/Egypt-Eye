import type { DestinationHub } from "./types";

// Powers "Explore Egypt" (/explore-egypt) — the interactive map. Each hub's
// `matchNames` are compared against the `destinations` tags already on
// tours/experiences/photoshoots/stories (see src/content/tours.ts etc.) to
// pull in everything relevant, so adding a new tour tagged "Luxor" makes it
// appear here automatically — no separate list to maintain.
//
// mapX/mapY are percentage positions (0-100) on the stylized map — editable
// from the Studio without touching code if a pin ever needs nudging.

export const destinationHubs: DestinationHub[] = [
  {
    slug: "cairo",
    name: "Cairo",
    region: "The Capital",
    tagline: "Ancient history and modern life, tangled together",
    intro:
      "Egypt's sprawling capital on the Nile — museums, medieval markets, and the launch point for nearly every trip into the country. A city that rewards a couple of unhurried days as much as a single afternoon.",
    matchNames: ["Cairo"],
    mapX: 45,
    mapY: 21,
    image: "/photos/pexels-29390088.jpg",
    imageTone: "nile",
    order: 1,
  },
  {
    slug: "giza",
    name: "Giza",
    region: "The Capital",
    tagline: "The last standing wonder of the ancient world",
    intro:
      "The Great Pyramids, the Sphinx, and the desert edge where Cairo's sprawl stops and the Sahara begins — most visitors' first, and most iconic, stop in Egypt.",
    matchNames: ["Giza"],
    mapX: 29,
    mapY: 27,
    image: "/photos/pexels-31133003.jpg",
    imageTone: "giza",
    order: 2,
  },
  {
    slug: "luxor",
    name: "Luxor",
    region: "Upper Egypt / Nile Valley",
    tagline: "The world's greatest open-air museum",
    intro:
      "Karnak Temple, the Valley of the Kings, and Hatshepsut's temple sit on opposite banks of the Nile — once ancient Thebes, and still the densest concentration of pharaonic monuments anywhere in Egypt.",
    matchNames: ["Luxor"],
    mapX: 49,
    mapY: 55,
    image: "/photos/pexels-36518565.jpg",
    imageTone: "luxor",
    order: 3,
  },
  {
    slug: "aswan",
    name: "Aswan",
    region: "Upper Egypt / Nile Valley",
    tagline: "Egypt's most relaxed river city",
    intro:
      "Felucca sails at sunset, Nubian villages, and the High Dam — Aswan moves at the Nile's own pace, and is the natural base for visiting Abu Simbel further south.",
    matchNames: ["Aswan"],
    mapX: 47,
    mapY: 68,
    image: "/photos/pexels-20954992.jpg",
    imageTone: "nile",
    order: 4,
  },
  {
    slug: "abu-simbel",
    name: "Abu Simbel",
    region: "Upper Egypt / Nile Valley",
    tagline: "Ramses II's colossal monument to himself",
    intro:
      "Four 20-meter statues of Ramses II, carved directly into a mountainside and relocated stone by stone in the 1960s to save them from the rising waters of Lake Nasser. A long day trip from Aswan, and worth every minute of the drive.",
    matchNames: ["Abu Simbel"],
    mapX: 31,
    mapY: 80,
    image: "/photos/pexels-6322875.jpg",
    imageTone: "desert",
    order: 5,
  },
  {
    slug: "siwa",
    name: "Siwa",
    region: "Western Desert",
    tagline: "Egypt's furthest, quietest oasis",
    intro:
      "A remote salt-lake oasis near the Libyan border, reachable only by a long desert drive — mud-brick ruins, natural hot springs, and a slower rhythm than anywhere else in the country.",
    matchNames: ["Siwa", "Siwa Oasis"],
    mapX: 10,
    mapY: 36,
    image: "/photos/pexels-16580393.jpg",
    imageTone: "desert",
    order: 6,
  },
  {
    slug: "hurghada",
    name: "Hurghada",
    region: "Red Sea Coast",
    tagline: "Egypt's original Red Sea resort town",
    intro:
      "Coral reefs a short boat ride from shore, a well-developed strip of resorts, and the easiest Red Sea base to combine with a Nile itinerary.",
    matchNames: ["Hurghada"],
    mapX: 58,
    mapY: 47,
    image: "/photos/pexels-31166900.jpg",
    imageTone: "redsea",
    order: 7,
  },
  {
    slug: "el-gouna",
    name: "El Gouna",
    region: "Red Sea Coast",
    tagline: "A private lagoon town built for slow mornings",
    intro:
      "A master-planned town of lagoons and car-free islands just north of Hurghada — quieter, more design-led, and popular with visitors after a calmer stretch of Red Sea coast.",
    matchNames: ["El Gouna"],
    mapX: 61,
    mapY: 31,
    image: "/photos/pexels-14137303.jpg",
    imageTone: "redsea",
    order: 8,
  },
  {
    slug: "marsa-alam",
    name: "Marsa Alam",
    region: "Red Sea Coast",
    tagline: "Egypt's least crowded reefs",
    intro:
      "South of Hurghada and still comparatively undeveloped — some of the Red Sea's healthiest reefs, dolphin encounters at the Dolphin House, and far fewer crowds than the coast further north.",
    matchNames: ["Marsa Alam"],
    mapX: 63,
    mapY: 61,
    image: "/photos/pexels-17598833.jpg",
    imageTone: "redsea",
    order: 9,
  },
  {
    slug: "sharm-el-sheikh",
    name: "Sharm El Sheikh",
    region: "Sinai Peninsula",
    tagline: "World-class diving at the tip of Sinai",
    intro:
      "Ras Mohammed National Park, the Tiran Strait, and some of the most-dived reefs on the planet, at the southern tip of the Sinai Peninsula — plus the easiest onward trip to St. Catherine and Dahab.",
    matchNames: ["Sharm El Sheikh"],
    mapX: 78,
    mapY: 45,
    image: "/photos/pexels-17681765.jpg",
    imageTone: "redsea",
    order: 10,
  },
];
