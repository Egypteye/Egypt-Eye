import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import { ReserveWizard } from "./ReserveWizard";

export const metadata: Metadata = {
  title: "Request Your Journey",
  description: "Review your Egypt journey, add your details, and send your reservation request to Egypt Eye.",
  robots: { index: false, follow: true },
};

export default async function ReservePage() {
  const user = await getCurrentUser();
  return <ReserveWizard currentUser={user ? { email: user.email, firstName: user.firstName } : null} />;
}
