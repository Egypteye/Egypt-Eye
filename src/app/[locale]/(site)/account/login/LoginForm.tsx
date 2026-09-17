"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthInput } from "@/components/AuthCard";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";

  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = ((form.get("email") as string) ?? "").trim();
    const password = (form.get("password") as string) ?? "";

    setStatus("sending");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMessage(
        error.message.toLowerCase().includes("invalid login")
          ? "Incorrect email or password."
          : error.message.toLowerCase().includes("email not confirmed")
            ? "Please verify your email first — check your inbox for the confirmation link."
            : error.message
      );
      setStatus("error");
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <AuthInput label="Email" name="email" type="email" required autoComplete="email" />
      <div className="flex flex-col gap-1.5">
        <AuthInput label="Password" name="password" type="password" required autoComplete="current-password" />
        <Link href="/account/forgot-password" className="self-end text-xs font-semibold text-gold-dark underline">
          Forgot password?
        </Link>
      </div>

      {status === "error" && <p className="text-sm text-terracotta">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-2 rounded-full bg-ink py-3.5 text-sm font-semibold text-cream transition hover:bg-gold-dark disabled:opacity-60"
      >
        {status === "sending" ? "Logging in…" : "Log In"}
      </button>

      <p className="text-center text-xs text-ink-soft/60">
        New to Egypt Eye?{" "}
        <Link href={`/account/signup?next=${encodeURIComponent(next)}`} className="font-semibold text-gold-dark underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
