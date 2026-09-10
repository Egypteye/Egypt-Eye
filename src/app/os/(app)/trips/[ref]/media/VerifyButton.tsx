"use client";

import { verifyMediaLink } from "@/lib/os/actions/records";
import { useAction, Spinner } from "@/components/os/action";

// Verification is a claim by a named person that they opened the link from
// outside the company account and it works. The OS records who said so; it
// does not pretend to have checked on their behalf.
export function VerifyButton({ mediaId, tripRef }: { mediaId: string; tripRef: string }) {
  const action = useAction(verifyMediaLink);
  return (
    <button
      onClick={() => action.run(mediaId, tripRef)}
      disabled={action.pending}
      title="Confirms you opened this link from outside the Egypt Eye account and it works."
      className="shrink-0 rounded-lg border border-os-green/30 bg-os-green-soft px-2.5 py-1.5 text-[12px] font-semibold text-os-green disabled:opacity-50"
    >
      {action.pending ? <Spinner size={12} /> : "I checked it"}
    </button>
  );
}
