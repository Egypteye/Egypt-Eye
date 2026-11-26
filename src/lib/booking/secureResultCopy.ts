/**
 * WHAT A CUSTOMER READS AFTER PRESSING THE BUTTON, IN ONE PLACE.
 *
 * Two brands now render this moment in their own chrome — Egypt Eye in
 * Tailwind utilities, Flying Dresses in brand.css. The markup differs and
 * should; these sentences must not.
 *
 * This is the same reasoning as wording.ts, one step further down the funnel.
 * The comment there says it plainly: three copies of a sentence is three
 * chances for one of them to drift into claiming a confirmation that has not
 * happened. The screen handled here is the most dangerous one in the product,
 * because it is the screen a customer reads immediately after money has moved,
 * when they are most primed to read "done" into whatever is on it. A second
 * brand rendering its own version of it would be a second chance to get that
 * wrong.
 *
 * Kept free of `server-only` imports on purpose, like wording.ts, so
 * scripts/check-booking.mts can run claimsConfirmation() over the real strings
 * rather than a paraphrase of them. CLAUDE.md section 6.
 */

import { claimsConfirmation } from "./wording";
import type { SecureBookingResult } from "./useSecureBooking";

export type SecureResultCopy = {
  heading: string;
  /** The paragraphs, in order. */
  body: string[];
  /** The PayPal hand-off, when there is one. */
  action?: { label: string; href: string };
  footnote: string;
};

export function payDepositCopy({
  reference,
  approvalUrl,
  depositPercent,
}: {
  reference: string;
  approvalUrl: string;
  depositPercent: number;
}): SecureResultCopy {
  return {
    heading: "One step left",
    body: [
      `Your request is saved as ${reference}. To hold your date, approve the ${depositPercent}% deposit. ` +
        "It is a hold, and nothing is charged until our team confirms your date.",
    ],
    action: { label: "Instant Booking", href: approvalUrl },
    footnote: footnote(reference),
  };
}

export function payLinkCopy({
  reference,
  paymentLink,
  amountUsd,
}: {
  reference: string;
  paymentLink: string;
  amountUsd: number;
}): SecureResultCopy {
  return {
    heading: "One step left",
    body: [
      `Your request is saved as ${reference}. To hold your date, pay the deposit of ${amountUsd} US dollars. ` +
        "It is credited toward your final price, and if we cannot offer the date you asked for we refund it in full.",
    ],
    action: { label: "Pay the deposit", href: paymentLink },
    footnote: footnote(reference),
  };
}

export function awaitingTeamCopy({
  reference,
  productTitle,
  notice,
}: {
  reference: string;
  productTitle: string;
  notice?: string;
}): SecureResultCopy {
  return {
    heading: "Your request is with our team",
    body: [
      notice ?? `We have your request for ${productTitle}, saved as ${reference}. Nothing has been charged.`,
      "A member of our team is checking the date now and will come back to you with your confirmation, " +
        "or with the nearest dates we can offer.",
    ],
    footnote: footnote(reference),
  };
}

/**
 * THE ONLY WAY A BRAND SHOULD TURN A RESULT INTO A SCREEN.
 *
 * This function exists because of a real bug it now makes impossible. The
 * Egypt Eye form used to branch on the result itself, in markup:
 *
 *     result.kind === "payDeposit" ? <the approval button> : <the team text>
 *
 * which meant a "payLink" result — a customer who must press a PayPal link to
 * pay — was shown "your request is with our team" and no link at all. The
 * link was in the component's state and never rendered. It was dormant rather
 * than harmless: no product in the Studio has a paypalLink set, so the branch
 * had never fired in production, and the first product the owner gave one to
 * would have started taking requests that could not be paid.
 *
 * A ternary in markup cannot be exhaustive. A switch on a union can, and the
 * `never` below makes the compiler say so. Two brands rendering this screen
 * doubled the chance of that mistake, so the mapping stopped being each
 * brand's business.
 */
export function resultCopy(
  result: SecureBookingResult,
  { productTitle, depositPercent }: { productTitle: string; depositPercent: number }
): SecureResultCopy {
  switch (result.kind) {
    case "payDeposit":
      return payDepositCopy({
        reference: result.reference,
        approvalUrl: result.approvalUrl,
        depositPercent,
      });
    case "payLink":
      return payLinkCopy({
        reference: result.reference,
        paymentLink: result.paymentLink,
        amountUsd: result.amountUsd,
      });
    case "awaitingTeam":
      return awaitingTeamCopy({
        reference: result.reference,
        productTitle,
        notice: result.notice,
      });
    default: {
      const exhaustive: never = result;
      return exhaustive;
    }
  }
}

/**
 * The result kinds that hand the customer somewhere to pay.
 *
 * Named here rather than inferred, so the guard can assert that each of them
 * produces a screen with a link on it — which is the assertion the bug above
 * would have failed.
 */
export const PAYING_RESULT_KINDS: SecureBookingResult["kind"][] = ["payDeposit", "payLink"];

function footnote(reference: string): string {
  return `We have emailed you a copy. Quote ${reference} if you reply.`;
}

/**
 * Every sentence this module can produce, for the guard to read.
 *
 * It exists because a check that only tested one function with one set of
 * arguments would prove nothing about a fourth someone adds later. This list
 * is what the guard walks, and the guard counts it, so adding a result screen
 * without adding it here goes red.
 */
export function allResultCopy(): SecureResultCopy[] {
  return [
    payDepositCopy({ reference: "EE-TEST", approvalUrl: "https://example.com", depositPercent: 30 }),
    payLinkCopy({ reference: "EE-TEST", paymentLink: "https://example.com", amountUsd: 100 }),
    awaitingTeamCopy({ reference: "EE-TEST", productTitle: "a photoshoot" }),
    awaitingTeamCopy({ reference: "EE-TEST", productTitle: "a photoshoot", notice: "Our team will be in touch." }),
  ];
}

/** True when any sentence in a result screen asserts a confirmation. */
export function resultCopyClaimsConfirmation(copy: SecureResultCopy): boolean {
  return [copy.heading, ...copy.body, copy.footnote, copy.action?.label ?? ""].some(claimsConfirmation);
}
