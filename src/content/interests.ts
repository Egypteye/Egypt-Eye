// Activity interests offered on the Customize Your Tour form. Anything that
// already exists as a full product links to its slug/kind; the rest are
// inquiry-only add-ons we can quote once we know you want them.

export const interests = [
  { label: "Secrets of Saqqara", kind: "inquiry" },
  { label: "Private Photoshoot with a Professional Photographer", kind: "photoshoot", slug: "exclusive-pyramids-photoshoot" },
  { label: "Egypt Flying Dress Experience", kind: "photoshoot", slug: "flying-dress-photoshoot" },
  { label: "ATV Quad Bikes at the Pyramids", kind: "experience", slug: "atv-quad-bikes-sahara" },
  { label: "Nile Cruise Dinner, Belly Dancer & Oriental Show", kind: "experience", slug: "nile-cruise-dinner-show" },
  { label: "Quiet Sailboat (Felucca) Tour", kind: "experience", slug: "quiet-nile-felucca-tour" },
  { label: "Food Tour Through Cairo's Streets", kind: "experience", slug: "food-tour" },
  { label: "Private Yacht at the Red Sea", kind: "inquiry" },
  { label: "Cooking Classes", kind: "inquiry" },
  { label: "Pottery / Planting Workshop", kind: "inquiry" },
  { label: "Kayaking", kind: "inquiry" },
] as const;
