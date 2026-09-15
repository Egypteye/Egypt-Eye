// Story slugs pulled from the site on 10 September 2026 — off-topic
// world-trends articles that were diluting the domain's travel authority
// (see the content audit). Their documents keep status: "archived", which is
// what removes them from every public query and from the sitemap.
//
// This list exists separately because middleware.ts needs it, and middleware
// runs on the Edge runtime where importing the full stories content — every
// article body — would be far too heavy. Keep the two in step: a slug listed
// here must also carry status: "archived" in its content file.
//
// Why 410 and not 404: 410 Gone tells Google the page was deliberately
// removed and is not coming back, which drops it from the index in weeks
// rather than the months of periodic re-crawling a 404 earns.
export const RETIRED_STORY_SLUGS: ReadonlySet<string> = new Set([
  "what-are-ai-agents-2026",
  "ai-generated-video-2026-guide",
  "ai-jobs-what-ai-can-and-cant-replace",
  "ai-company-valuations-2026-explained",
  "vibe-coding-2026-great-pyramid-precision",
  "us-china-ai-race-suez-canal-parallel",
  "oil-prices-2026-suez-two-crises",
  "middle-east-energy-security-2026-sumed-pipeline",
  "red-sea-shipping-crisis-2026-suez-canal-recovery",
  "inflation-2026-ancient-egypt-grain-reserves",
  "future-of-us-dollar-2026-nubian-gold-history",
  "chinas-tech-revolution-2026-hyksos-parallel",
  "us-alliance-recalibration-2026-sadat-camp-david-parallel",
  "us-china-tensions-2026-nasser-nonalignment-playbook",
  "nuclear-tensions-2026-egypt-wmd-free-zone-diplomacy",
  "north-korea-nuclear-2026-egypt-el-dabaa-contrast",
  "russia-ukraine-war-2026-egypt-wheat-bread",
  "gaza-peace-process-2026-egypt-mediation-role",
  "future-of-geopolitics-2026-egypt-longest-running-power",
  "future-of-smartphones-2026-papyrus-portable-information",
  "tesla-autonomous-driving-2026-way-of-horus-ancient-road",
  "robots-everyday-life-2026-shaduf-oldest-labor-saving-device",
  "climate-change-2026-egypt-old-kingdom-megadrought",
  "egypt-2026-world-cup-historic-run",
  "2016-nostalgia-2026-egypt-oldest-bucket-list-destination",
  "80s-90s-nostalgia-2026-michael-jackson-remember-the-time",
  "tiktok-instagram-search-engine-2026-egypt-visual-information",
  "human-authenticity-vs-ai-content",
]);
