import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/AuthCard";
import { getCurrentUser } from "@/lib/auth/session";
import { LoginForm } from "./LoginForm";
import { trAll } from "@/i18n/T";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your Egypt Eye account.",
  robots: { index: false, follow: true },
};

export default async function LoginPage() {
  const ui = await trAll([
    "Log in to your account",
    "Welcome Back",
  ]);

  const user = await getCurrentUser();
  if (user) redirect("/account");

  return (
    <AuthCard eyebrow={ui["Welcome Back"]} title={ui["Log in to your account"]}>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
