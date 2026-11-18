/**
 * Which inbox a form submission belongs to.
 *
 * Every public form on the site used to land in one place —
 * info@egypteyetravel.com, which is the Reservations team's inbox. That is
 * right for a booking or an enquiry and wrong for a creator application:
 * Reservations ended up triaging collaboration requests and forwarding them
 * on by hand, so the two queues were mixed and collaborations waited behind
 * trip bookings.
 *
 * Deliberately a separate, pure module. `src/lib/email/resend.ts` and
 * `templates.ts` are both `server-only`, which puts anything importing them
 * out of reach of the check scripts; keeping the decision here means
 * scripts/check-email-routing.mts can actually execute it rather than
 * grep for it.
 *
 * The fallback is the point. If the collaborations address is ever blanked —
 * in Sanity Studio, or by someone trimming the content file — applications
 * go back to the general inbox rather than to `undefined`, where Resend
 * would reject the send and the submission would be lost silently. A
 * misrouted email is recoverable; a dropped one is not.
 */

export type ContactRecipients = {
  email: string;
  collaborationsEmail?: string;
};

/**
 * Where a creator collaboration application should be delivered.
 *
 * Prefers the dedicated Collaborations inbox, falling back to the general
 * contact address when it is missing, blank or whitespace.
 */
export function collaborationRecipient(contact: ContactRecipients): string {
  const dedicated = contact.collaborationsEmail?.trim();
  return dedicated ? dedicated : contact.email;
}
