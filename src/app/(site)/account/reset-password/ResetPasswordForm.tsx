"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthInput } from "@/components/AuthCard";

export function ResetPasswordForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = (form.get("password") as string) ?? "";
    const confirm = (form.get("confirmPassword") as string) ?? "";

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      setStatus("error");
      return;
    }
    if (password !== confirm) {
      setErrorMessage("Passwords don't match.");
      setStatus("error");
      return;
    }

    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMessage(error.message);
      setStatus("error");
      return;
    }

    router.push("/account?passwordReset=1");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <AuthInput label="New password" name="password" type="password" required minLength={8} autoComplete="new-password" />
      <AuthInput
        label="Confirm new password"
        name="confirmPassword"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
      />
      {status === "error" && <p className="text-sm text-terracotta">{errorMessage}</p>}
      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-2 rounded-full bg-ink py-3.5 text-sm font-semibold text-cream transition hover:bg-gold-dark disabled:opacity-60"
      >
        {status === "sending" ? "Saving…" : "Set New Password"}
      </button>
    </form>
  );
}
