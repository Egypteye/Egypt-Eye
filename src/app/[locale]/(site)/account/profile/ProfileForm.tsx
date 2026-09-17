"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthInput } from "@/components/AuthCard";

type Profile = {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  marketing_consent: boolean;
};

export function ProfileForm({ userId, profile }: { userId: string; profile: Profile }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const firstName = ((form.get("firstName") as string) ?? "").trim();
    const lastName = ((form.get("lastName") as string) ?? "").trim();
    const phone = ((form.get("phone") as string) ?? "").trim();
    const marketingConsent = form.get("marketingConsent") === "on";

    setStatus("saving");
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName || null,
        last_name: lastName || null,
        phone: phone || null,
        marketing_consent: marketingConsent,
        marketing_consent_at: marketingConsent && !profile.marketing_consent ? new Date().toISOString() : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      setStatus("error");
      return;
    }
    setStatus("saved");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <AuthInput label="First name" name="firstName" type="text" defaultValue={profile.first_name ?? ""} />
        <AuthInput label="Last name" name="lastName" type="text" defaultValue={profile.last_name ?? ""} />
      </div>
      <AuthInput label="Phone (optional)" name="phone" type="tel" defaultValue={profile.phone ?? ""} />

      <label className="flex items-start gap-2.5 text-sm text-ink-soft/80">
        <input type="checkbox" name="marketingConsent" defaultChecked={profile.marketing_consent} className="mt-0.5 h-4 w-4 shrink-0 accent-gold-dark" />
        Yes, I&rsquo;d like to receive Egypt Eye travel inspiration, new experiences and special offers by email.
      </label>

      {status === "error" && <p className="text-sm text-terracotta">Something went wrong saving your profile. Please try again.</p>}
      {status === "saved" && <p className="text-sm text-nile">Saved.</p>}

      <button
        type="submit"
        disabled={status === "saving"}
        className="mt-2 self-start rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition hover:bg-gold-dark disabled:opacity-60"
      >
        {status === "saving" ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
