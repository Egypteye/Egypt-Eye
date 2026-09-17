import "../globals.css";

// Studio needs its own root layout because the site's one moved under
// [locale] to carry `lang`/`dir`. The CMS is an internal English tool, so it
// gets a fixed shell rather than joining the translated tree.
export const metadata = { robots: { index: false, follow: false } };

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
