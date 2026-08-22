import type { EventCountdown } from "./types";

// Verified against timeanddate.com's local eclipse circumstances for Luxor
// and NASA-derived reporting (via Sky & Telescope, CNN, Forbes) cross-checked
// across multiple independent sources — see the Story content for the
// full research notes. Totality begins in Luxor at 13:02:14 local time
// (EEST, UTC+3); Egypt observes daylight saving time (EEST) from late
// April to late October 2027, so August 2 falls within it.
export const events: EventCountdown[] = [
  {
    slug: "luxor-eclipse-2027",
    name: "Total Solar Eclipse — Luxor, Egypt",
    targetDateTime: "2027-08-02T13:02:14+03:00",
    timezoneLabel: "EEST (UTC+3) · Luxor local time",
    locationName: "Luxor, Egypt",
    displayTitle: "The sky is waiting.",
    supportingText:
      "On August 2, 2027, totality reaches Luxor at 1:02 PM local time — roughly six minutes and twenty-two seconds when the sun disappears entirely. It's the longest total solar eclipse anywhere on Earth until 2114.",
    backgroundTone: "nile",
    dayOfMessage:
      "Today is the day. Totality reaches Luxor at 1:02 PM local time (EEST) — look up.",
    endedMessage:
      "Totality has passed over Luxor. The next eclipse anywhere near this long won't happen again until 2114.",
    active: true,
  },
];
