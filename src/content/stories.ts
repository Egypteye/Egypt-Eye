import type { Story } from "./types";

// Stories / blog listing.

export const stories: Story[] = [
  {
    slug: "best-travel-agencies-in-egypt-2026-guide",
    title: "Best Travel Agencies in Egypt (2026 Guide)",
    excerpt:
      "What to actually look for when booking an Egypt tour operator in 2026 — licensing, guide quality, transparency on inclusions, and why photography access matters more than people think.",
    imageLabel: "Cairo Skyline",
    imageTone: "giza",
  },
  {
    slug: "best-travel-agencies-in-egypt-2025-guide",
    title: "Best Travel Agencies in Egypt (2025 Guide)",
    excerpt:
      "Our 2025 breakdown of how to compare Egypt tour operators, from private vs. group transportation to what a genuinely private Egyptologist guide should include.",
    imageLabel: "Khan el-Khalili",
    imageTone: "giza",
  },
  {
    slug: "girls-getaway-cairo-giza-jordan",
    title: "A Girls' Getaway: Exploring Cairo, Giza, and Jordan",
    excerpt:
      "A recap of a girls' trip across two countries — Pyramids at sunrise, a flying dress shoot in the dunes, and Petra's Treasury by lantern light.",
    imageLabel: "Petra, Jordan",
    imageTone: "jordan",
  },
  {
    slug: "capturing-unforgettable-moments",
    title:
      "Capturing Unforgettable Moments: Our Egyptian Adventure with Egypt Eye Travel and Tours",
    excerpt:
      "A first-person look at what a week with Egypt Eye actually feels like — from the Nine Pyramids View at golden hour to dinner aboard a Nile cruise.",
    imageLabel: "Nile Sunset",
    imageTone: "nile",
  },
];

export function getStoryBySlug(slug: string) {
  return stories.find((s) => s.slug === slug);
}
