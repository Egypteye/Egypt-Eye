import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import { ReserveWizard } from "./ReserveWizard";

// Auth-gated: this segment reads the signed-in user server-side, so it must
// never be statically prerendered. Declared explicitly rather than inferred
// from cookie access, so a build missing the Supabase env vars fails loudly
// instead of silently shipping a cached logged-out page.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Request Your Journey",
  description: "Review your Egypt journey, add your details, and send your reservation request to Egypt Eye.",
  robots: { index: false, follow: true },
};

export default async function ReservePage() {
  const user = await getCurrentUser();
  return <ReserveWizard currentUser={user ? { email: user.email, firstName: user.firstName } : null} />;
}
