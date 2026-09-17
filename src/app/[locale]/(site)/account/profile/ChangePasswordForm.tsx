"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { AuthInput } from "@/components/AuthCard";

export function ChangePasswordForm() {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = (form.get("newPassword") as string) ?? "";
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

    setStatus("saving");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setErrorMessage(error.message);
      setStatus("error");
      return;
    }
    setStatus("saved");
    e.currentTarget.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <AuthInput label="New password" name="newPassword" type="password" required minLength={8} autoComplete="new-password" />
        <AuthInput label="Confirm new password" name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" />
      </div>
      {status === "error" && <p className="text-sm text-terracotta">{errorMessage}</p>}
      {status === "saved" && <p className="text-sm text-nile">Password updated.</p>}
      <button
        type="submit"
        disabled={status === "saving"}
        className="self-start rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-ink hover:text-cream disabled:opacity-60"
      >
        {status === "saving" ? "Saving…" : "Change Password"}
      </button>
    </form>
  );
}
