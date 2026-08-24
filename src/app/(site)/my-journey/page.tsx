import type { Metadata } from "next";
import { getDestinationHubs, getSiteSettings } from "@/sanity/fetchers";
import { MyJourneyClient } from "./MyJourneyClient";

export const metadata: Metadata = {
  title: "My Journey",
  description: "The destinations, tours, and experiences you've added while exploring Egypt Eye — review, adjust, and request your journey.",
  robots: { index: false, follow: true },
};

export default async function MyJourneyPage() {
  const [hubs, site] = await Promise.all([getDestinationHubs(), getSiteSettings()]);
  return <MyJourneyClient allHubs={hubs} whatsappLink={site.contact.whatsappLink} />;
}
