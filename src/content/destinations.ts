// Destinations shown on the homepage panel and offered as checkboxes on the
// Customize Your Tour form. `days` is the suggested minimum length.

export const destinations = [
  { name: "Cairo", days: 1, tone: "giza", tourSlug: "3-day-cairo-giza" },
  { name: "Giza", days: 1, tone: "giza", tourSlug: "1-day-giza-tour" },
  { name: "Alexandria", days: 1, tone: "nile", tourSlug: "5-day-giza-cairo-alexandria" },
  { name: "Red Sea", days: 1, tone: "redsea", tourSlug: "red-sea-relaxation" },
  { name: "Luxor", days: 2, tone: "luxor", tourSlug: "6-day-cairo-giza-luxor" },
  { name: "Aswan", days: 2, tone: "nile", tourSlug: "8-day-essential-egypt-nile-cruise" },
  { name: "Siwa Oasis", days: 3, tone: "desert", tourSlug: "siwa-oasis" },
  { name: "Sharm El Sheikh", days: 3, tone: "redsea", tourSlug: "red-sea-relaxation" },
  { name: "Hurghada", days: 3, tone: "redsea", tourSlug: "red-sea-relaxation" },
  { name: "Jordan", days: 3, tone: "jordan", tourSlug: "3-days-jordan" },
] as const;
