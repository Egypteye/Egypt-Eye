import { redirect } from "next/navigation";
import { SignInForm } from "./SignInForm";
import { getActor } from "@/lib/os/actor";
import { osConfigured } from "@/lib/os/db";
import { osServerClient } from "@/lib/os/supabase/server";
import { osSupabaseConfigured } from "@/lib/os/supabase/env";
import { NotStaffPanel } from "./NotStaffPanel";

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
  // completely different. Authenticated but not linked to a staff record is
  // an administrator task; signed out is a password.
  //
  // This reads the OS project's session, not the website's. Somebody signed
  // into egypteyetravel.com as a customer is simply not signed in here — the
  // two are different Supabase projects and neither knows about the other.
  let signedInEmail: string | null = null;
  if (osSupabaseConfigured) {
    const supabase = await osServerClient();
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
          <NotStaffPanel email={signedInEmail} />
        ) : (
          <SignInForm />
        )}

        <p className="mt-6 text-center text-[12px] leading-relaxed text-white/35">
          Egypt Eye OS is accessible from any device with a browser. Add it to your home screen for one-tap access.
          <span className="mt-1.5 block">
            Staff accounts are separate from customer accounts on the website — signing in here does not sign you in there.
          </span>
        </p>
      </div>
    </div>
  );
}
