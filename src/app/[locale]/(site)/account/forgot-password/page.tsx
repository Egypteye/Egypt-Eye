import type { Metadata } from "next";
import { AuthCard } from "@/components/AuthCard";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { trAll } from "@/i18n/T";

export const metadata: Metadata = {
  title: "Reset Your Password",
  robots: { index: false, follow: true },
};

export default async function ForgotPasswordPage() {
  const ui = await trAll([
    "Account Recovery",
    "Forgot your password?",
    "We'll email you a link to reset it.",
  ]);

  return (
    <AuthCard eyebrow={ui["Account Recovery"]} title={ui["Forgot your password?"]} subtitle={ui["We'll email you a link to reset it."]}>
      <ForgotPasswordForm />
    </AuthCard>
  );
}
