"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { osBrowserClient } from "@/lib/os/supabase/client";
import { recordSignIn } from "@/lib/os/actions/session";
import { Spinner } from "@/components/os/action";
import { ForgotPassword } from "./ForgotPassword";

// Credentials never touch Egypt Eye code. Supabase Auth owns password
// hashing, sessions, refresh tokens, verification and reset; this form hands
// the email and password straight to it and does nothing else with them.
export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const supabase = osBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (signInError) {
        // Never say which half was wrong: that turns the form into a way of
        // discovering which email addresses have accounts.
        setError("That email and password combination did not work.");
        return;
      }
      // Who signed in, from what, and when. Recorded server-side from the
      // session cookie — the browser never asserts an identity here — and
      // deliberately awaited, so it happens while the session is fresh rather
      // than racing the navigation away from this page.
      await recordSignIn();
      router.replace("/os");
      router.refresh();
    } catch {
      setError("Could not reach the sign-in service. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl bg-white p-6">
      <label className="block">
        <span className="mb-1 block text-[12px] font-medium text-os-text">Work email</span>
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          required autoComplete="username" autoFocus
          className="w-full rounded-lg border border-os-line-strong px-3 py-2.5 text-[14px] focus:border-os-gold focus:outline-none focus:ring-2 focus:ring-os-gold/25"
          placeholder="you@egypteyetravel.com"
        />
      </label>

      <label className="mt-3.5 block">
        <span className="mb-1 block text-[12px] font-medium text-os-text">Password</span>
        <input
          type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          required autoComplete="current-password"
          className="w-full rounded-lg border border-os-line-strong px-3 py-2.5 text-[14px] focus:border-os-gold focus:outline-none focus:ring-2 focus:ring-os-gold/25"
        />
      </label>

      <label className="mt-3.5 flex items-center gap-2 text-[12.5px] text-os-muted">
        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-os-gold" />
        Keep me signed in on this device
      </label>

      {error ? (
        <p className="mt-3 rounded-lg border border-os-red/25 bg-os-red-soft px-3 py-2 text-[12.5px] text-os-red">{error}</p>
      ) : null}

      <button
        type="submit" disabled={pending}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-os-ink px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-os-ink-2 disabled:opacity-60"
      >
        {pending ? <Spinner /> : null}
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <ForgotPassword email={email} />
    </form>
  );
}
