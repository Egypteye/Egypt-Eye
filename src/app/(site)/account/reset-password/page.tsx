import type { Metadata } from "next";
import { AuthCard } from "@/components/AuthCard";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Set New Password",
  robots: { index: false, follow: true },
};

export default function ResetPasswordPage() {
  return (
    <AuthCard eyebrow="Account Recovery" title="Choose a new password">
      <ResetPasswordForm />
    </AuthCard>
  );
}
