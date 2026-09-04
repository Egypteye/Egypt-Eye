"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { osBrowserClient } from "@/lib/os/supabase/client";
import { Spinner } from "@/components/os/action";

// Where the reset email lands. Supabase puts a recovery session in place when
// the link is followed, so updateUser() is enough — the OS never sees the old
// password and never handles the new one beyond passing it straight to auth.
export function ResetForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const tooShort = password.length > 0 && password.length < 10;
  const mismatch = confirm.length > 0 && password !== confirm;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const { error: updateError } = await osBrowserClient().auth.updateUser({ password });
      if (updateError) {
        setError(
          updateError.message.toLowerCase().includes("session")
            ? "That reset link has expired or was already used. Ask for a new one from the sign-in page."
            : "That password was not accepted. Try a longer one.",
        );
        return;
      }
      setDone(true);
      setTimeout(() => router.replace("/os"), 1200);
    } catch {
      setError("Could not reach the sign-in service. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-white p-6 text-center">
        <p className="text-[14px] font-semibold text-os-text">Password changed</p>
        <p className="mt-1.5 text-[12.5px] text-os-muted">Taking you into the OS…</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-white p-6">
      <label className="block">
        <span className="mb-1 block text-[12px] font-medium text-os-text">New password</span>
        <input
          type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          required autoComplete="new-password" autoFocus minLength={10}
          className="w-full rounded-lg border border-os-line-strong px-3 py-2.5 text-[14px] focus:border-os-gold focus:outline-none focus:ring-2 focus:ring-os-gold/25"
        />
        <span className="mt-1 block text-[11.5px] text-os-muted">
          At least ten characters. This is the account that reaches every trip, client and cost in the company.
        </span>
      </label>

      <label className="mt-3.5 block">
        <span className="mb-1 block text-[12px] font-medium text-os-text">Again</span>
        <input
          type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
          required autoComplete="new-password"
          className="w-full rounded-lg border border-os-line-strong px-3 py-2.5 text-[14px] focus:border-os-gold focus:outline-none focus:ring-2 focus:ring-os-gold/25"
        />
      </label>

      {tooShort ? <p className="mt-2 text-[12px] text-os-amber">Ten characters or more.</p> : null}
      {mismatch ? <p className="mt-2 text-[12px] text-os-amber">Those two do not match.</p> : null}
      {error ? (
        <p className="mt-3 rounded-lg border border-os-red/25 bg-os-red-soft px-3 py-2 text-[12.5px] text-os-red">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending || tooShort || mismatch || !password || !confirm}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-os-ink px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-os-ink-2 disabled:opacity-60"
      >
        {pending ? <Spinner /> : null}
        {pending ? "Saving…" : "Set the new password"}
      </button>
    </form>
  );
}
