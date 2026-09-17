import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/AuthCard";
import { AccountBenefits } from "@/components/AccountBenefits";
import { getCurrentUser } from "@/lib/auth/session";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = {
  title: "Create Your Account",
  description: "Create your Egypt Eye account to save journeys, manage reservations, and access your personalized trip.",
  robots: { index: false, follow: true },
};

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect("/account");

  return (
    <AuthCard
      eyebrow="Create Your Account"
      title="Save your Egypt journey"
      subtitle="Free — takes less than a minute."
      aside={<AccountBenefits />}
    >
      <Suspense fallback={null}>
        <SignupForm />
      </Suspense>
    </AuthCard>
  );
}
