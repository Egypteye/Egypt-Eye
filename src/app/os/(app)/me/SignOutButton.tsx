"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/os/action";
import { Icon } from "@/components/os/icons";

// Two kinds of sign-out, because they answer different worries.
//
// "This device" ends the local session. "Everywhere" calls Supabase Auth with
// global scope, which revokes every refresh token on the account — the right
// button when a phone has been lost, and the reason it says so plainly.
export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState<"local" | "global" | null>(null);

  async function signOut(scope: "local" | "global") {
    setPending(scope);
    try {
      const supabase = createClient();
      await supabase.auth.signOut({ scope });
      router.replace("/os/sign-in");
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => signOut("local")}
        disabled={pending !== null}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-os-line-strong bg-white px-3 py-2 text-[13px] font-medium text-os-text transition hover:bg-black/[0.03] disabled:opacity-60"
      >
        {pending === "local" ? <Spinner /> : <Icon.Logout size={15} />}
        Sign out of this device
      </button>
      <button
        onClick={() => signOut("global")}
        disabled={pending !== null}
        className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-[12.5px] font-medium text-os-muted transition hover:text-os-red disabled:opacity-60"
      >
        {pending === "global" ? <Spinner /> : null}
        Sign out everywhere (lost phone)
      </button>
    </div>
  );
}
