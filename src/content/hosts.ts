// Local fallback for Hosts — used until real hosts are added in the Studio
// (Hosts / Guides), and pushed there by the migration route as a starting
// example. This is intentionally a placeholder, not an invented person —
// replace the name, photo, and bio with your actual host before publishing
// any experience that lists them.
import type { Host } from "./types";

export const hosts: Host[] = [
  {
    slug: "add-your-first-host",
    name: "Add Your First Host",
    role: "Guest Experience Host",
    bio: "Replace this with a real host's bio — a few sentences on who they are, what they've done, and what makes them the right person to look after your guests. This placeholder exists so you can see how the Host card looks; it isn't a real person.",
    languages: ["English", "Arabic"],
    experience: "Add years of experience or a credibility line here",
    personality: "Add a short line on their personality and why they're part of this experience",
  },
];
