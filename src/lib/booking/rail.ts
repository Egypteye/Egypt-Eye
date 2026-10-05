import type { DepositResolution } from "./deposit";
import type { PaymentMode } from "./wording";

// Which rail takes the deposit, and what that does to the money.
//
// This is one function because it used to be three, and they disagreed.
//
// The product page decided what to tell the customer, the booking route
// decided what to actually do, and the secure page decided a third time. While
// a PayPal payment link was the only way money could move, all three could get
// away with asking "is there a link?" — no link meant no money moved. The
// moment a PayPal API order with CAPTURE intent existed, that question stopped
// answering it: no link, money taken, and a page still saying "your deposit is
// held, not charged" to somebody PayPal had already charged.
//
// So the question is asked once, here, and everything else reads the answer.
// The ordering matters as much as the result: the API rail wins wherever it is
// configured, because an API order carries the booking reference in custom_id
// and reconciles itself, while a link payment has to be matched by a human
// reading a reference out of a PayPal note the customer may never have typed.

export type PayRail = {
  /** What happens to the customer's money. Chooses every sentence they read. */
  moneyMode: PaymentMode;
  /** The static PayPal link, used only where the API rail is not configured. */
  paymentLink: string | null;
  /** Whether a deposit can be taken at all. */
  canTakeMoney: boolean;
};

/** What the provider contributes. Narrow on purpose, so this stays testable. */
export type RailProvider = {
  enabled: boolean;
  moneyMode: PaymentMode;
};

export function resolveRail(deposit: DepositResolution, provider: RailProvider): PayRail {
  if (!deposit.bookable) {
    return { moneyMode: "none", paymentLink: null, canTakeMoney: false };
  }
  if (provider.enabled) {
    // The API rail. Its own mode decides: CAPTURE moves the money at approval,
    // AUTHORIZE only holds it. The link is deliberately dropped rather than
    // offered alongside — two ways to pay one deposit is two payments to
    // reconcile and a customer who paid twice.
    return { moneyMode: provider.moneyMode, paymentLink: null, canTakeMoney: true };
  }
  if (deposit.paymentLink) {
    // A link always means the money moves when they pay. There is no such
    // thing as a link that holds funds.
    return { moneyMode: "paid", paymentLink: deposit.paymentLink, canTakeMoney: true };
  }
  return { moneyMode: "none", paymentLink: null, canTakeMoney: false };
}
