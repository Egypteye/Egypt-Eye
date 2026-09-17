"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { AuthInput } from "@/components/AuthCard";

export function ForgotPasswordForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = ((form.get("email") as string) ?? "").trim();

    setStatus("sending");
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/account/reset-password")}`,
    });
    // Always show the same success state, whether or not that email has an
    // account — never confirm/deny an email's existence to the requester.
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-gold/20 bg-sand-dim p-5 text-sm text-ink-soft/80">
        <p className="font-semibold text-ink">Check your inbox</p>
        <p className="mt-1.5">If an account exists for that email, we&rsquo;ve sent a link to reset your password.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <AuthInput label="Email" name="email" type="email" required autoComplete="email" />
      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-2 rounded-full bg-ink py-3.5 text-sm font-semibold text-cream transition hover:bg-gold-dark disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send Reset Link"}
      </button>
    </form>
  );
}
