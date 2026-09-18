import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/AuthCard";
import { AccountBenefits } from "@/components/AccountBenefits";
import { getCurrentUser } from "@/lib/auth/session";
import { SignupForm } from "./SignupForm";
import { trAll } from "@/i18n/T";

export const metadata: Metadata = {
  title: "Create Your Account",
  description: "Create your Egypt Eye account to save journeys, manage reservations, and access your personalized trip.",
  robots: { index: false, follow: true },
};

export default async function SignupPage() {
  const ui = await trAll([
    "Create Your Account",
    "Free — takes less than a minute.",
    "Save your Egypt journey",
  ]);

  const user = await getCurrentUser();
  if (user) redirect("/account");

  return (
    <AuthCard
      eyebrow={ui["Create Your Account"]}
      title={ui["Save your Egypt journey"]}
      subtitle={ui["Free — takes less than a minute."]}
      aside={<AccountBenefits />}
    >
      <Suspense fallback={null}>
        <SignupForm />
      </Suspense>
    </AuthCard>
  );
}
