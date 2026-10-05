// The five states a deposit booking moves through, and the only words the site
// is allowed to use for each.
//
// This exists because of one failure mode that the research into tour
// platforms turns up again and again: a customer pays, the site says
// "confirmed", and the operator has not actually checked anything yet. The
// complaint that follows is never about the wait — it is about having been
// told something that was not true.
//
// So the mapping from state to wording is code, not a set of strings typed
// into a template. `confirmed` is reachable from exactly one place: a human
// pressing confirm in the admin. No payment event can reach it.

import type { PaymentMode } from "./wording";

export type BookingState =
  /** The request exists; no money involved yet (abandoned payment lands here). */
  | "awaitingDeposit"
  /** PayPal is holding the deposit. Nothing has been charged. */
  | "held"
  /** A person is checking the date. */
  | "checking"
  /** A person confirmed it. The deposit is captured at this moment. */
  | "confirmed"
  /** The date could not be done. The hold is released, nothing charged. */
  | "declined"
  /** The customer called it off. */
  | "cancelled";

export type StateCopy = {
  /** Short label for the account page and the admin list. */
  label: string;
  /** What the customer is told, in full. */
  message: string;
  /** True only where the booking is actually secured. */
  isConfirmed: boolean;
  /** Whether the customer's money has actually moved. */
  charged: boolean;
};

const COPY: Record<BookingState, StateCopy> = {
  awaitingDeposit: {
    label: "Awaiting deposit",
    message:
      "Your request is saved. It is not held yet — the deposit secures your date, and nothing has been charged.",
    isConfirmed: false,
    charged: false,
  },
  held: {
    label: "Deposit held",
    message:
      "Your deposit is held and your request is with our team. We are confirming your date now and will come back to you. Nothing has been charged yet.",
    isConfirmed: false,
    charged: false,
  },
  checking: {
    label: "Confirming your date",
    message:
      "Our team is confirming your date. Your deposit is still only held — it has not been charged.",
    isConfirmed: false,
    charged: false,
  },
  confirmed: {
    label: "Confirmed",
    message:
      "Your date is confirmed. Your deposit has now been charged and is credited against your final price.",
    isConfirmed: true,
    charged: true,
  },
  declined: {
    label: "Date unavailable",
    message:
      "We could not confirm this date. The hold on your deposit has been released, so you have not been charged. We have sent you the nearest dates we can offer.",
    isConfirmed: false,
    charged: false,
  },
  cancelled: {
    label: "Cancelled",
    message: "This booking was cancelled.",
    isConfirmed: false,
    charged: false,
  },
};

/**
 * What the customer is told, adjusted for how the deposit is actually taken.
 *
 * With a PayPal payment link the money moves when they pay, so the "held, not
 * charged" sentences are false and are replaced. Everything else — above all
 * that only a person reaches `confirmed` — is identical in both modes.
 */
export function stateCopy(state: BookingState, mode: PaymentMode = "hold"): StateCopy {
  const base = COPY[state];
  if (mode !== "link") return base;
  const forLink = LINK_COPY[state];
  return forLink ? { ...base, ...forLink } : base;
}

/** Overrides for payment-link mode, where the deposit is paid rather than held. */
const LINK_COPY: Partial<Record<BookingState, Partial<StateCopy>>> = {
  awaitingDeposit: {
    label: "Deposit not paid yet",
    message:
      "Your request is saved. Your date is not secured until the deposit is paid — nothing has been taken yet.",
    charged: false,
  },
  held: {
    label: "Deposit paid",
    message:
      "Thank you — we have your deposit, and your request is with our team. We are confirming your date now and will come back to you. Your deposit is credited toward your final price.",
    charged: true,
  },
  checking: {
    label: "Confirming your date",
    message: "Our team is confirming your date. Your deposit is credited toward your final price.",
    charged: true,
  },
  confirmed: {
    message: "Your date is confirmed. Your deposit is credited against your final price.",
    charged: true,
  },
  declined: {
    message:
      "We could not confirm this date, so we are refunding your deposit in full. We have sent you the nearest dates we can offer.",
    charged: false,
  },
};

/**
 * What a payment event is allowed to do.
 *
 * A verified PayPal authorization moves a booking to `held` and no further.
 * Capture only ever happens because a person pressed confirm, so the capture
 * event confirms a decision that was already made rather than making one.
 */
export function stateAfterPaymentHeld(current: BookingState): BookingState {
  return current === "awaitingDeposit" ? "held" : current;
}

/** The states a human is allowed to move a booking into, and from where. */
export const HUMAN_TRANSITIONS: Record<string, BookingState[]> = {
  checking: ["held"],
  confirmed: ["held", "checking"],
  declined: ["awaitingDeposit", "held", "checking"],
  cancelled: ["awaitingDeposit", "held", "checking", "confirmed"],
};

export function canTransition(from: BookingState, to: BookingState): boolean {
  return HUMAN_TRANSITIONS[to]?.includes(from) ?? false;
}

/** Whether this state still has a PayPal authorization that must be resolved. */
export function holdsFunds(state: BookingState): boolean {
  return state === "held" || state === "checking";
}

/**
 * The state of a reservation row, in the vocabulary these rules are written
 * in.
 *
 * Lives here rather than beside either caller because the admin panel and the
 * customer's account page must agree about what a booking is. Two copies of
 * this mapping would be two chances for a customer to be told one thing while
 * the desk sees another.
 */
export function bookingStateFromRow(row: { status: string; deposit_status?: string | null }): BookingState {
  if (row.status === "confirmed") return "confirmed";
  if (row.status === "declined") return "declined";
  if (row.status === "cancelled") return "cancelled";
  if (row.status === "checking") return "checking";
  // "authorized" is a hold; "captured" is a payment-link deposit that has
  // actually arrived. Both mean the same thing to the customer and the desk —
  // the money side is done, the date is not — so both read as `held`.
  const settled = row.deposit_status === "authorized" || row.deposit_status === "captured";
  return settled ? "held" : "awaitingDeposit";
}
