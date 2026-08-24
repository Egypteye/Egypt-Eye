import type { Metadata } from "next";
import { AuthCard } from "@/components/AuthCard";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset Your Password",
  robots: { index: false, follow: true },
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard eyebrow="Account Recovery" title="Forgot your password?" subtitle="We'll email you a link to reset it.">
      <ForgotPasswordForm />
    </AuthCard>
  );
}
