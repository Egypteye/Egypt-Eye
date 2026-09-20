import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { getCurrentUser } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ProfileForm } from "./ProfileForm";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { AvatarUpload } from "./AvatarUpload";
import { T, trAll } from "@/i18n/T";

// Auth-gated: this segment reads the signed-in user server-side, so it must
// never be statically prerendered. Declared explicitly rather than inferred
// from cookie access, so a build missing the Supabase env vars fails loudly
// instead of silently shipping a cached logged-out page.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const ui = await trAll(["Edit Profile"]);
  return {
    title: ui["Edit Profile"],
    robots: { index: false, follow: true },
  };
}

export default async function ProfilePage() {
  const ui = await trAll(["← Back to My Account"]);
  const user = await getCurrentUser();
  if (!user) redirect("/account/login?next=/account/profile");

  const supabase = await createServerSupabaseClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, phone, marketing_consent, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <section className="bg-sand py-14 sm:py-20">
      <Container className="mx-auto max-w-lg">
        <Link href="/account" className="text-sm font-semibold text-ink-soft/60 hover:text-ink">
          {ui["← Back to My Account"]}
        </Link>
        <h1 className="mt-3 font-display text-3xl font-semibold text-ink"><T>Edit Profile</T></h1>

        <div className="mt-8 rounded-3xl border border-gold/15 bg-cream p-6 shadow-xl shadow-black/5 sm:p-9">
          <h2 className="mb-5 font-display text-lg font-semibold text-ink"><T>Profile Photo</T></h2>
          <AvatarUpload userId={user.id} avatarUrl={profile?.avatar_url ?? null} firstName={profile?.first_name ?? null} />
        </div>

        <div className="mt-6 rounded-3xl border border-gold/15 bg-cream p-6 shadow-xl shadow-black/5 sm:p-9">
          <h2 className="mb-5 font-display text-lg font-semibold text-ink"><T>Your Details</T></h2>
          <ProfileForm
            userId={user.id}
            profile={
              profile ?? { first_name: null, last_name: null, phone: null, marketing_consent: false }
            }
          />
        </div>

        <div className="mt-6 rounded-3xl border border-gold/15 bg-cream p-6 shadow-xl shadow-black/5 sm:p-9">
          <h2 className="mb-5 font-display text-lg font-semibold text-ink"><T>Change Password</T></h2>
          <ChangePasswordForm />
        </div>
      </Container>
    </section>
  );
}
