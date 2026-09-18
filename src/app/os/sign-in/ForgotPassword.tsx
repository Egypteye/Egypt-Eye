"use client";

import { useState } from "react";
import { osBrowserClient } from "@/lib/os/supabase/client";
import { Spinner } from "@/components/os/action";

// Password reset has to go through the OS project, not the website's. A staff
// member resetting here must not end up changing a customer password on
// egypteyetravel.com — they are different accounts in different databases, and
// before the projects were split this link pointed at the wrong one.
export function ForgotPassword({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [address, setAddress] = useState(email);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  async function send() {
    if (!address.trim()) return;
    setState("sending");
    try {
      await osBrowserClient().auth.resetPasswordForEmail(address.trim(), {
        redirectTo: `${window.location.origin}/os/reset-password`,
      });
    } finally {
      // Deliberately the same outcome either way. Telling somebody "no such
      // account" here turns this box into a way of discovering which
      // addresses are staff.
      setState("sent");
    }
  }

  if (state === "sent") {
    return (
      <p className="mt-4 rounded-lg border border-os-line-strong bg-black/[0.02] px-3 py-2.5 text-center text-[12.5px] leading-relaxed text-os-muted">
        If that address belongs to a staff account, a reset link is on its way. It expires within the hour.
      </p>
    );
  }

  if (!open) {
    return (
      <p className="mt-4 text-center text-[12px] text-os-muted">
        <button onClick={() => setOpen(true)} className="font-medium text-os-gold hover:underline">
          Forgot your password?
        </button>
      </p>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-os-line-strong bg-black/[0.02] p-3">
      <label className="block">
        <span className="mb-1 block text-[12px] font-medium text-os-text">Your work email</span>
        <input
          type="email"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-lg border border-os-line-strong px-3 py-2 text-[13.5px] focus:border-os-gold focus:outline-none focus:ring-2 focus:ring-os-gold/25"
          placeholder="you@egypteyetravel.com"
          autoFocus
        />
      </label>
      <div className="mt-2.5 flex flex-wrap gap-2">
        <button
          onClick={send}
          disabled={!address.trim() || state === "sending"}
          className="flex items-center gap-2 rounded-lg bg-os-ink px-3 py-1.5 text-[12.5px] font-semibold text-white transition hover:bg-os-ink-2 disabled:opacity-60"
        >
          {state === "sending" ? <Spinner /> : null}
          Send a reset link
        </button>
        <button onClick={() => setOpen(false)} className="px-2 text-[12.5px] font-medium text-os-muted hover:text-os-text">
          Cancel
        </button>
      </div>
      <p className="mt-2 text-[11px] leading-snug text-os-faint">
        This resets your Egypt Eye OS password only. Your customer account on the website, if you have one, is a separate
        login and is not affected.
      </p>
    </div>
  );
}
