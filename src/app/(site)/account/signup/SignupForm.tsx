"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthInput } from "@/components/AuthCard";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";

  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const firstName = ((form.get("firstName") as string) ?? "").trim();
    const email = ((form.get("email") as string) ?? "").trim();
    const password = (form.get("password") as string) ?? "";
    const marketingConsent = form.get("marketingConsent") === "on";

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      setStatus("error");
      return;
    }

    setStatus("sending");
    setErrorMessage("");

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        data: { first_name: firstName || null, marketing_consent: marketingConsent },
      },
    });

    if (error) {
      setErrorMessage(
        error.message.toLowerCase().includes("already registered") || error.status === 422
          ? "An account with this email already exists — try logging in instead."
          : error.message
      );
      setStatus("error");
      return;
    }

    if (data.session) {
      router.push(next);
      router.refresh();
      return;
    }

    // Email confirmation required before a session exists.
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-gold/20 bg-sand-dim p-5 text-sm text-ink-soft/80">
        <p className="font-semibold text-ink">Check your inbox</p>
        <p className="mt-1.5">
          We&rsquo;ve sent a verification link to confirm your email. Click it to finish creating your account.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <AuthInput label="First name" name="firstName" type="text" autoComplete="given-name" />
      <AuthInput label="Email" name="email" type="email" required autoComplete="email" />
      <AuthInput
        label="Password"
        name="password"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
      />
      <p className="-mt-2 text-xs text-ink-soft/50">At least 8 characters.</p>

      <label className="flex items-start gap-2.5 text-sm text-ink-soft/80">
        <input type="checkbox" name="marketingConsent" className="mt-0.5 h-4 w-4 shrink-0 accent-gold-dark" />
        Yes, I&rsquo;d like to receive Egypt Eye travel inspiration, new experiences and special offers by email.
      </label>

      {status === "error" && <p className="text-sm text-terracotta">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-2 rounded-full bg-ink py-3.5 text-sm font-semibold text-cream transition hover:bg-gold-dark disabled:opacity-60"
      >
        {status === "sending" ? "Creating your account…" : "Create My Account"}
      </button>

      <p className="text-center text-xs text-ink-soft/60">
        Already have an account?{" "}
        <Link href={`/account/login?next=${encodeURIComponent(next)}`} className="font-semibold text-gold-dark underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
