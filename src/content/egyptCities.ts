import type { EgyptCity } from "./types";

// Real Egyptian cities and towns shown as secondary markers on the Explore
// Egypt map, so it reads as a complete, honest map of the country and not
// just the places currently for sale.
//
// A marker with `hubSlug` is somewhere we DO sell tours, reached from a
// bigger hub (Saqqara from Giza, Edfu from Aswan, the oases from the
// Western Desert) — clicking it points at that hub. A marker without one is
// genuinely not offered yet and shows the "not yet offered here" note.
// Places that earned their own hub (Dahab, St. Catherine, Bahariya) are not
// listed here at all — their hub pin sits at those coordinates instead.
//
// mapX/mapY use the same equirectangular projection as destinationHubs.ts
// (see the comment in EgyptMap.tsx):
//
//   x = 8 + (lon - 24.70007) * cos(26.79°) * 7.7348
//   y = 6 + (31.58568 - lat) * 7.7348

export const egyptCities: EgyptCity[] = [
  // Nile Delta & Canal cities
  { slug: "port-said", name: "Port Said", region: "Suez Canal", mapX: 60.5, mapY: 8.5, mood: ["coast"] },
  { slug: "suez", name: "Suez", region: "Suez Canal", mapX: 62.2, mapY: 18.5, mood: ["coast"] },
  { slug: "ismailia", name: "Ismailia", region: "Suez Canal", mapX: 60.3, mapY: 13.7, mood: ["coast"] },
  { slug: "mansoura", name: "Mansoura", region: "Nile Delta", mapX: 54.1, mapY: 10.2, mood: ["nile"] },
  { slug: "tanta", name: "Tanta", region: "Nile Delta", mapX: 51.5, mapY: 12.2, mood: [] },
  { slug: "zagazig", name: "Zagazig", region: "Nile Delta", mapX: 55.0, mapY: 13.7, mood: [] },
  { slug: "damietta", name: "Damietta", region: "Nile Delta", mapX: 57.1, mapY: 7.3, mood: ["coast"] },
  { slug: "rosetta", name: "Rosetta (Rashid)", region: "Nile Delta", mapX: 47.5, mapY: 7.4, mood: ["history", "coast"] },
  { slug: "kafr-el-sheikh", name: "Kafr El Sheikh", region: "Nile Delta", mapX: 51.1, mapY: 9.7, mood: [] },

  // Nile Valley & Upper Egypt
  { slug: "beni-suef", name: "Beni Suef", region: "Nile Valley", mapX: 52.2, mapY: 25.5, mood: ["nile"] },
  { slug: "minya", name: "Minya", region: "Nile Valley", mapX: 49.8, mapY: 32.9, mood: ["history", "nile"] },
  { slug: "asyut", name: "Asyut", region: "Nile Valley", mapX: 52.8, mapY: 40.1, mood: ["nile"] },
  { slug: "sohag", name: "Sohag", region: "Nile Valley", mapX: 56.3, mapY: 44.9, mood: ["history", "nile"] },
  { slug: "qena", name: "Qena", region: "Nile Valley", mapX: 63.3, mapY: 48.0, mood: ["history", "nile"] },
  { slug: "dahshur", name: "Dahshur", region: "Nile Valley", mapX: 52.9, mapY: 19.9, mood: ["history", "desert"], hubSlug: "giza" },
  { slug: "saqqara", name: "Saqqara", region: "Nile Valley", mapX: 53.0, mapY: 19.3, mood: ["history", "desert"], hubSlug: "giza" },
  { slug: "edfu", name: "Edfu", region: "Upper Egypt / Nile Valley", mapX: 64.4, mapY: 57.1, mood: ["history", "nile"], hubSlug: "aswan" },
  { slug: "kom-ombo", name: "Kom Ombo", region: "Upper Egypt / Nile Valley", mapX: 64.8, mapY: 61.0, mood: ["history", "nile"], hubSlug: "aswan" },
  { slug: "esna", name: "Esna", region: "Upper Egypt / Nile Valley", mapX: 62.2, mapY: 54.7, mood: ["history", "nile"] },

  // Farafra, Dakhla and Kharga below, and Nuweiba and Taba under Sinai,
  // lost their hubSlug when the tours covering them were withheld (see
  // content/hiddenTours.ts). Their markers are back to "not offered yet",
  // which is true again. Restoring a tour restores the tag, and
  // check:destinations will ask for the hubSlug back.
  // Western Desert oases
  { slug: "marsa-matruh", name: "Marsa Matruh", region: "Mediterranean Coast", mapX: 25.5, mapY: 7.8, mood: ["coast", "beaches"] },
  { slug: "farafra-oasis", name: "Farafra Oasis", region: "Western Desert", mapX: 30.6, mapY: 41.0, mood: ["desert"] },
  { slug: "dakhla-oasis", name: "Dakhla Oasis", region: "Western Desert", mapX: 38.7, mapY: 53.1, mood: ["desert"] },
  { slug: "kharga-oasis", name: "Kharga Oasis", region: "Western Desert", mapX: 48.4, mapY: 53.5, mood: ["desert"] },

  // Sinai
  { slug: "nuweiba", name: "Nuweiba", region: "Sinai Peninsula", mapX: 76.8, mapY: 25.8, mood: ["beaches", "diving"] },
  { slug: "taba", name: "Taba", region: "Sinai Peninsula", mapX: 78.4, mapY: 22.2, mood: ["beaches", "diving"] },

  // Red Sea coast
  { slug: "safaga", name: "Safaga", region: "Red Sea Coast", mapX: 71.7, mapY: 43.5, mood: ["beaches", "diving"] },
];
