"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { osBrowserClient } from "@/lib/os/supabase/client";
import { Spinner } from "@/components/os/action";

// Somebody authenticated against the OS project but has no employee record.
// That is a dead end they need a way out of — without a sign-out here they
// would land on this screen every time and have no way to try another account.
export function NotStaffPanel({ email }: { email: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    try {
      await osBrowserClient().auth.signOut({ scope: "local" });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6">
      <h2 className="text-[15px] font-semibold text-os-text">This account is not linked to a staff record</h2>
      <p className="mt-2 text-[13px] leading-relaxed text-os-muted">
        You are signed in as <span className="font-medium text-os-text">{email}</span>. The account exists, but nobody has
        linked it to an employee record yet, so the OS has no idea who you are or what you are allowed to do.
      </p>
      <p className="mt-2 text-[12.5px] leading-relaxed text-os-muted">
        An administrator links it under Admin, Users and access. Until then there is nothing here for this account.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={signOut}
          disabled={pending}
          className="flex items-center gap-2 rounded-lg bg-os-ink px-3 py-2 text-[13px] font-semibold text-white transition hover:bg-os-ink-2 disabled:opacity-60"
        >
          {pending ? <Spinner /> : null}
          Sign out and try another account
        </button>
      </div>
    </div>
  );
}
