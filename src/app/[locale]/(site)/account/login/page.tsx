import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/AuthCard";
import { getCurrentUser } from "@/lib/auth/session";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your Egypt Eye account.",
  robots: { index: false, follow: true },
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/account");

  return (
    <AuthCard eyebrow="Welcome Back" title="Log in to your account">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
