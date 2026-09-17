"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function AvatarUpload({ userId, avatarUrl, firstName }: { userId: string; avatarUrl: string | null; firstName: string | null }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(avatarUrl);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setStatus("error");
      setError("Please choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setStatus("error");
      setError("Please choose an image under 5MB.");
      return;
    }

    setStatus("saving");
    setError("");
    const supabase = createClient();
    const path = `${userId}/avatar`;

    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, {
      upsert: true,
      contentType: file.type,
    });
    if (uploadError) {
      setStatus("error");
      setError("Couldn't upload that photo. Please try again.");
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path);
    // Cache-bust: the storage path is fixed (upsert overwrites it), so
    // without this the browser/CDN/Next Image cache would keep serving the
    // previous photo under the same URL after a change.
    const freshUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;

    const { error: updateError } = await supabase.from("profiles").update({ avatar_url: freshUrl }).eq("id", userId);
    if (updateError) {
      setStatus("error");
      setError("Photo uploaded, but couldn't save it to your profile. Please try again.");
      return;
    }

    setPreview(freshUrl);
    setStatus("idle");
    router.refresh();
  }

  async function handleRemove() {
    setStatus("saving");
    setError("");
    const supabase = createClient();

    await supabase.storage.from("avatars").remove([`${userId}/avatar`]);
    const { error: updateError } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", userId);
    if (updateError) {
      setStatus("error");
      setError("Couldn't remove your photo. Please try again.");
      return;
    }

    setPreview(null);
    setStatus("idle");
    router.refresh();
  }

  const initial = firstName?.trim()?.[0]?.toUpperCase();

  return (
    <div className="flex items-center gap-5">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-sand-dim text-2xl font-semibold text-ink-soft/50">
        {preview ? (
          <Image src={preview} alt="" width={80} height={80} className="h-full w-full object-cover" />
        ) : (
          initial || (
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.6}>
              <circle cx="12" cy="8" r="3.4" />
              <path d="M4.5 20c1.6-4 4.4-6 7.5-6s5.9 2 7.5 6" strokeLinecap="round" />
            </svg>
          )
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={status === "saving"}
            className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-ink-soft transition hover:border-gold/40 hover:text-ink disabled:opacity-60"
          >
            {status === "saving" ? "Saving…" : preview ? "Change Photo" : "Upload Photo"}
          </button>
          {preview && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={status === "saving"}
              className="rounded-full px-4 py-2 text-xs font-semibold text-ink-soft/60 transition hover:text-terracotta disabled:opacity-60"
            >
              Remove
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
        {status === "error" ? (
          <p className="text-xs text-terracotta">{error}</p>
        ) : (
          <p className="text-xs text-ink-soft/50">JPG, PNG, or WebP. Up to 5MB.</p>
        )}
      </div>
    </div>
  );
}
