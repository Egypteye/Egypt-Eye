import type { Metadata } from "next";
import { AuthCard } from "@/components/AuthCard";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { trAll } from "@/i18n/T";

export const metadata: Metadata = {
  title: "Set New Password",
  robots: { index: false, follow: true },
};

export default async function ResetPasswordPage() {
  const ui = await trAll([
    "Account Recovery",
    "Choose a new password",
  ]);

  return (
    <AuthCard eyebrow={ui["Account Recovery"]} title={ui["Choose a new password"]}>
      <ResetPasswordForm />
    </AuthCard>
  );
}
