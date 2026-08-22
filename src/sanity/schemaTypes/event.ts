import { defineField, defineType } from "sanity";
import { imageTones } from "./objects";

// A reusable countdown-worthy event — not eclipse-specific. Referenced from
// a Story's "Countdown" content block (see story.ts), but usable for any
// future dated event (a festival, a launch, a seasonal experience). Store
// the target time as an ISO datetime WITH its UTC offset (Sanity's picker
// does this) so the countdown is accurate for every visitor regardless of
// their own timezone — no separate timezone-conversion logic needed.
export const event = defineType({
  name: "event",
  title: "Event / Countdown",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Event name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "targetDateTime",
      title: "Target date & time",
      description: "The exact moment the countdown counts down to, in its own local time zone.",
      type: "datetime",
      options: { timeStep: 1 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "timezoneLabel",
      title: "Timezone label (display only, e.g. 'EEST · Luxor local time')",
      type: "string",
    }),
    defineField({
      name: "locationName",
      title: "Location name (for search engines, e.g. 'Luxor, Egypt')",
      type: "string",
    }),
    defineField({
      name: "displayTitle",
      title: "Countdown display title",
      type: "string",
      description: "E.g. 'The sky is waiting.'",
    }),
    defineField({ name: "supportingText", title: "Supporting text", type: "text" }),
    defineField({
      name: "backgroundImage",
      title: "Background photo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "backgroundTone",
      title: "Placeholder color (used until a photo is uploaded)",
      type: "string",
      options: { list: imageTones },
      initialValue: "nile",
    }),
    defineField({
      name: "dayOfMessage",
      title: "\"Day of\" message",
      description: "Shown once the countdown reaches zero.",
      type: "text",
    }),
    defineField({
      name: "endedMessage",
      title: "\"Ended\" message (optional)",
      description: "Shown after the event has fully passed. Leave blank to keep showing the day-of message.",
      type: "text",
    }),
    defineField({
      name: "active",
      title: "Active",
      description: "Turn off to stop showing this countdown anywhere it's referenced.",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "targetDateTime" },
  },
});
