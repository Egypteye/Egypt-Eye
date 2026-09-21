"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTr } from "@/i18n/LocaleProvider";

export function LogoutButton({ className }: { className?: string }) {
  const tr = useTr();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button type="button" onClick={handleLogout} disabled={loading} className={className}>
      {loading ? tr("Logging out…") : tr("Log Out")}
    </button>
  );
}
