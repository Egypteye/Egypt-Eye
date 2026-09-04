import Link from "next/link";
import { ResetForm } from "./ResetForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Set a new password",
  robots: { index: false, follow: false },
};

// Reached from the reset email sent by the OS project. Nothing here touches
// the website's auth: a staff password and a customer password are different
// accounts in different databases.
export default function OsResetPasswordPage() {
  return (
    <div className="os-root flex min-h-screen flex-col justify-center bg-os-ink px-5 py-12">
      <div className="mx-auto w-full max-w-[400px]">
        <div className="mb-7 text-center">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-os-gold text-[15px] font-bold text-os-ink">EE</span>
          <p className="os-wordmark mt-3 text-[12px] font-semibold text-os-gold">EGYPT EYE</p>
          <h1 className="mt-1 text-[19px] font-semibold text-white">Set a new password</h1>
          <p className="mt-1.5 text-[13px] text-white/45">For your staff account.</p>
        </div>

        <ResetForm />

        <p className="mt-6 text-center text-[12px] text-white/35">
          <Link href="/os/sign-in" className="font-medium text-white/60 hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
