import Link from "next/link";
import { redirect } from "next/navigation";
import { SignInForm } from "./SignInForm";
import { getActor } from "@/lib/os/actor";
import { osConfigured } from "@/lib/os/db";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function OsSignInPage() {
  if (osConfigured) {
    const actor = await getActor();
    if (actor) redirect("/os");
  }

  // Distinguish the two "you cannot get in" cases, because the fix is
  // completely different. Signed in but not staff is an administrator task;
  // signed out is a password.
  let signedInEmail: string | null = null;
  if (supabaseConfigured) {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.auth.getUser();
    signedInEmail = data.user?.email ?? null;
  }

  return (
    <div className="os-root flex min-h-screen flex-col justify-center bg-os-ink px-5 py-12">
      <div className="mx-auto w-full max-w-[400px]">
        <div className="mb-7 text-center">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-os-gold text-[15px] font-bold text-os-ink">EE</span>
          <p className="os-wordmark mt-3 text-[12px] font-semibold text-os-gold">EGYPT EYE</p>
          <h1 className="mt-1 text-[19px] font-semibold text-white">Operating System</h1>
          <p className="mt-1.5 text-[13px] text-white/45">Staff access only.</p>
        </div>

        {signedInEmail ? (
          <div className="rounded-2xl bg-white p-6">
            <h2 className="text-[15px] font-semibold text-os-text">This account is not on the Egypt Eye team</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-os-muted">
              You are signed in as <span className="font-medium text-os-text">{signedInEmail}</span>, and that address is
              not linked to a staff record. An administrator links an account under Admin, Users and access.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/account" className="rounded-lg border border-os-line-strong px-3 py-2 text-[13px] font-medium text-os-text hover:bg-black/[0.03]">
                Go to my customer account
              </Link>
              <Link href="/" className="rounded-lg px-3 py-2 text-[13px] font-medium text-os-muted hover:text-os-text">
                Back to the website
              </Link>
            </div>
          </div>
        ) : (
          <SignInForm />
        )}

        <p className="mt-6 text-center text-[12px] text-white/35">
          Egypt Eye OS is accessible from any device with a browser. Add it to your home screen for one-tap access.
        </p>
      </div>
    </div>
  );
}
