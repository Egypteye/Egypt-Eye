"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthInput } from "@/components/AuthCard";
import { useTr } from "@/i18n/LocaleProvider";
import { PhoneField } from "@/components/PhoneField";

type Profile = {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  marketing_consent: boolean;
};

// Copied from AuthInput in src/components/AuthCard.tsx, which hardcodes it
// and takes no className. Named here so the phone field is visibly the same
// decision as the inputs above it rather than a coincidence.
const authFieldClass =
  "rounded-lg border border-black/10 bg-sand px-4 py-2.5 text-ink outline-none focus:border-gold";

export function ProfileForm({ userId, profile }: { userId: string; profile: Profile }) {
  const tr = useTr();
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
        <AuthInput label={tr("First name")} name="firstName" type="text" defaultValue={profile.first_name ?? ""} />
        <AuthInput label={tr("Last name")} name="lastName" type="text" defaultValue={profile.last_name ?? ""} />
      </div>
      {/* Not AuthInput: that renders one <input>, and a country code needs two
          controls. The class string is AuthInput's own, so the field still
          looks like the ones above it.

          A number already stored WITHOUT a country code cannot be saved again
          until a country is picked — see splitPhone. That is deliberate: the
          alternative is reading a legacy "07911 123456" as Egyptian and
          writing +207911123456 over a British mobile. */}
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink-soft">
        {tr("Phone (optional)")}
        <PhoneField
          errorClassName="text-sm font-semibold text-terracotta"
          id="profile-phone"
          value={profile.phone ?? ""}
          inputLabel={tr("Phone number")}
          selectClassName={authFieldClass}
          inputClassName={authFieldClass}
        />
      </label>

      <label className="flex items-start gap-2.5 text-sm text-ink-soft">
        <input type="checkbox" name="marketingConsent" defaultChecked={profile.marketing_consent} className="mt-0.5 h-4 w-4 shrink-0 accent-gold-dark" />{tr("Yes, I’d like to receive Egypt Eye travel inspiration, new experiences and special offers by email.")}</label>

      {status === "error" && <p className="text-sm text-terracotta">{tr("Something went wrong saving your profile. Please try again.")}</p>}
      {status === "saved" && <p className="text-sm text-nile">{tr("Saved.")}</p>}

      <button
        type="submit"
        disabled={status === "saving"}
        className="mt-2 self-start rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition hover:bg-gold-dark disabled:opacity-60"
      >
        {status === "saving" ? tr("Saving…") : tr("Save Changes")}
      </button>
    </form>
  );
}
