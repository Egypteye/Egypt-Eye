import type { ResolvedSiteSettings } from "@/content/types";

// One definition of "where Egypt Eye is on social", rendered everywhere the
// links appear (footer, About's Get in Touch, the creators programme page).
// Icons are inline SVG rather than an icon package — the project already
// draws its icons this way, and six paths aren't worth a dependency.
//
// Deliberately drawn in the site's own gold/ink/cream palette instead of each
// platform's brand colour: a row of blue/red/pink logos would be the loudest
// thing on a page otherwise built from sandstone and gold.

type Platform = { key: string; label: string; href: string; path: React.ReactNode };

// 24x24 viewBox, solid fills, so they sit on the same optical weight.
const ICONS: Record<string, React.ReactNode> = {
  instagram: (
    <>
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 3.72a6.12 6.12 0 1 0 0 12.24 6.12 6.12 0 0 0 0-12.24Zm0 10.1a3.98 3.98 0 1 1 0-7.96 3.98 3.98 0 0 1 0 7.96Zm7.79-10.34a1.43 1.43 0 1 1-2.86 0 1.43 1.43 0 0 1 2.86 0Z" />
    </>
  ),
  facebook: (
    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.91h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
  ),
  tiktok: (
    <path d="M16.6 5.82a4.28 4.28 0 0 1-1.06-2.82h-3.1v12.4a2.59 2.59 0 0 1-2.6 2.5 2.6 2.6 0 0 1 0-5.2c.27 0 .53.04.78.12v-3.2a5.8 5.8 0 0 0-.78-.05 5.75 5.75 0 1 0 5.75 5.75V9.4a7.42 7.42 0 0 0 4.32 1.38V7.7a4.3 4.3 0 0 1-3.31-1.88Z" />
  ),
  youtube: (
    <path d="M21.58 7.19a2.5 2.5 0 0 0-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42a2.5 2.5 0 0 0-1.77 1.77A26.1 26.1 0 0 0 2 12a26.1 26.1 0 0 0 .42 4.81 2.5 2.5 0 0 0 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42a2.5 2.5 0 0 0 1.77-1.77A26.1 26.1 0 0 0 22 12a26.1 26.1 0 0 0-.42-4.81ZM10 15.25v-6.5L15.5 12 10 15.25Z" />
  ),
  pinterest: (
    <path d="M12 2a10 10 0 0 0-3.65 19.31c-.09-.79-.17-2 .03-2.86.18-.78 1.19-4.98 1.19-4.98s-.3-.61-.3-1.5c0-1.41.82-2.46 1.83-2.46.87 0 1.29.65 1.29 1.43 0 .87-.55 2.17-.84 3.38-.24 1.01.51 1.83 1.5 1.83 1.8 0 3.19-1.9 3.19-4.65 0-2.43-1.75-4.13-4.24-4.13a4.4 4.4 0 0 0-4.59 4.41c0 .87.34 1.81.76 2.32.08.1.09.19.07.29l-.28 1.13c-.04.18-.14.22-.33.13-1.25-.58-2.03-2.4-2.03-3.87 0-3.15 2.29-6.04 6.6-6.04 3.46 0 6.16 2.47 6.16 5.77 0 3.44-2.17 6.21-5.18 6.21-1.01 0-1.96-.53-2.29-1.15l-.62 2.37c-.22.87-.83 1.96-1.24 2.62A10 10 0 1 0 12 2Z" />
  ),
  whatsapp: (
    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35ZM12.04 2C6.6 2 2.17 6.43 2.17 11.87c0 1.74.46 3.44 1.32 4.94L2 22l5.33-1.4a9.83 9.83 0 0 0 4.71 1.2h.01c5.44 0 9.87-4.43 9.87-9.87S17.48 2 12.04 2Zm0 18.05h-.01a8.2 8.2 0 0 1-4.17-1.14l-.3-.18-3.1.81.83-3.02-.2-.31a8.17 8.17 0 0 1-1.25-4.34c0-4.52 3.68-8.2 8.2-8.2a8.2 8.2 0 0 1 0 16.38Z" />
  ),
};

const LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  pinterest: "Pinterest",
  whatsapp: "WhatsApp",
};

// WhatsApp comes from `contact`, not `socials`: it's how people reach the
// team, and it deliberately stays out of the Organization JSON-LD's `sameAs`
// (which is for profile pages, not a chat link).
export function getSocialPlatforms(site: ResolvedSiteSettings, includeWhatsApp: boolean): Platform[] {
  const entries: [string, string | undefined][] = [
    ["instagram", site.socials.instagram],
    ["facebook", site.socials.facebook],
    ["tiktok", site.socials.tiktok],
    ["youtube", site.socials.youtube],
    ["pinterest", site.socials.pinterest],
    ...(includeWhatsApp ? ([["whatsapp", site.contact.whatsappLink]] as [string, string | undefined][]) : []),
  ];

  // Skip anything unset — a Sanity siteSettings doc can leave a platform blank.
  return entries
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    .map(([key, href]) => ({ key, label: LABELS[key], href, path: ICONS[key] }));
}

export function SocialLinks({
  site,
  tone = "dark",
  includeWhatsApp = false,
  className = "",
}: {
  site: ResolvedSiteSettings;
  /** "dark" for the ink footer, "light" for cream/sand sections. */
  tone?: "dark" | "light";
  includeWhatsApp?: boolean;
  className?: string;
}) {
  const platforms = getSocialPlatforms(site, includeWhatsApp);
  if (platforms.length === 0) return null;

  const styles =
    tone === "dark"
      ? "border-white/15 text-cream/70 hover:border-gold/60 hover:bg-gold/10 hover:text-gold-light"
      : "border-black/10 bg-cream text-ink-soft hover:border-gold/50 hover:bg-gold/10 hover:text-gold-dark";

  return (
    <ul className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {platforms.map((p) => (
        <li key={p.key}>
          <a
            href={p.href}
            target="_blank"
            rel="noreferrer"
            aria-label={`Egypt Eye on ${p.label}`}
            title={p.label}
            className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-200 ${styles}`}
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
              {p.path}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
