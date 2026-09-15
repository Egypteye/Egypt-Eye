import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

export const dynamic = "force-static";

export { viewport } from "next-sanity/studio";
import { metadata as studioMetadata } from "next-sanity/studio";

// robots.txt disallows /studio, which stops crawling but not URL-only
// indexing if something ever links here. Belt and braces.
export const metadata = { ...studioMetadata, robots: { index: false, follow: false } };

export default function StudioPage() {
  return <NextStudio config={config} />;
}
