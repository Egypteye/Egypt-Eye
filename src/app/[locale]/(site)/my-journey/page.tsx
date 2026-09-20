import type { Metadata } from "next";
import { getDestinationHubs } from "@/sanity/fetchers";
import { MyJourneyClient } from "./MyJourneyClient";
import { alternatesFor } from "@/i18n/alternates";
import { getLocale } from "@/i18n/dictionary";
import { trAll } from "@/i18n/T";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const ui = await trAll([
    "My Journey",
    "The destinations, tours, and experiences you've added while exploring Egypt Eye — review, adjust, and request your journey.",
  ]);
  return {
    title: ui["My Journey"],
    description: ui["The destinations, tours, and experiences you've added while exploring Egypt Eye — review, adjust, and request your journey."],
    robots: { index: false, follow: true },
    alternates: alternatesFor("/my-journey", locale),
  };
}

export default async function MyJourneyPage() {
  const hubs = await getDestinationHubs();
  return <MyJourneyClient allHubs={hubs} />;
}
