// Builds the knowledge digest fed to the AI chat assistant as grounding
// context, so it answers from the site's real catalog and policies instead
// of guessing. Server-only — never sent to the browser directly.
import { tours } from "./tours";
import { experiences } from "./experiences";
import { photoshoots } from "./photoshoots";
import { signatureExperiences } from "./signatureExperiences";
import { stories } from "./stories";
import { faqs } from "./faq";
import { site } from "./site";

export function buildChatContext(): string {
  const tourLines = tours
    .map(
      (t) =>
        `- "${t.title}" (${t.category}, ${t.duration}, destinations: ${t.destinations.join(", ")}) — ${t.tagline}`
    )
    .join("\n");

  const experienceLines = experiences
    .map((e) => `- "${e.title}" (${e.duration}) — ${e.description}`)
    .join("\n");

  const photoshootLines = photoshoots
    .map((p) => `- "${p.title}" (${p.duration}, locations: ${p.locations.join(", ")}) — ${p.description}`)
    .join("\n");

  const signatureLines = signatureExperiences
    .filter((e) => e.status === "published" || e.status === "comingSoon")
    .map((e) => `- "${e.name}" (${e.status === "comingSoon" ? "coming soon" : "available"}) — ${e.shortDescription}`)
    .join("\n");

  const storyLines = stories
    .filter((s) => s.status === "published")
    .map((s) => `- "${s.title}" (/stories/${s.slug})`)
    .join("\n");

  const faqLines = faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n");

  return `
COMPANY: ${site.name} (${site.shortName}) — ${site.tagline}
${site.description}
Contact: WhatsApp ${site.contact.whatsapp}, email ${site.contact.email}.

POLICIES:
- Deposit: ${site.policies.deposit}
- Currency: ${site.policies.currency}
- Children's pricing: ${site.policies.children.map((c) => `${c.age}: ${c.price}`).join("; ")}. ${site.policies.childrenNote}
- Voucher: ${site.policies.voucher}
- Cancellation: ${site.policies.cancellation}

TOURS (private, guided — every tour includes a private vehicle and English-speaking guide):
${tourLines}

EXTRA EXPERIENCES (can be added to any tour):
${experienceLines}

PHOTOSHOOT PACKAGES:
${photoshootLines}

SIGNATURE EXPERIENCES (fully custom, multi-day, private-guided journeys):
${signatureLines}

BLOG / TRAVEL GUIDES (link to these when relevant instead of restating everything yourself):
${storyLines}

FREQUENTLY ASKED QUESTIONS:
${faqLines}
`.trim();
}
