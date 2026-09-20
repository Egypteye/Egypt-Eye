import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import { ReserveWizard } from "./ReserveWizard";
import { alternatesFor } from "@/i18n/alternates";
import { getLocale } from "@/i18n/dictionary";
import { trAll } from "@/i18n/T";

// Auth-gated: this segment reads the signed-in user server-side, so it must
// never be statically prerendered. Declared explicitly rather than inferred
// from cookie access, so a build missing the Supabase env vars fails loudly
// instead of silently shipping a cached logged-out page.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const ui = await trAll([
    "Request Your Journey",
    "Review your Egypt journey, add your details, and send your reservation request to Egypt Eye.",
  ]);
  return {
    title: ui["Request Your Journey"],
    description: ui["Review your Egypt journey, add your details, and send your reservation request to Egypt Eye."],
    robots: { index: false, follow: true },
    alternates: alternatesFor("/reserve", locale),
  };
}

export default async function ReservePage() {
  const user = await getCurrentUser();
  return <ReserveWizard currentUser={user ? { email: user.email, firstName: user.firstName } : null} />;
}
