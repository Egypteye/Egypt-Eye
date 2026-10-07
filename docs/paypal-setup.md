# Turning on PayPal payments

A runbook, in order, with the decisions first. Tick each step; none of them
depends on a later one.

**You are not starting from zero.** The integration is built and on the live
branch (`037d98d`, `f7c6421`, `83a8c06`). Nothing in the website needs writing.
What is left is PayPal's side and proving it works.

---

## 0. Check these before anything else

Do not assume. Each of these can stop the whole thing, and each is faster to
check than to discover later.

- [ ] **Can your PayPal Business account actually receive payments?**
      A new or partly-verified business account can be limited to sending.
      Log in to paypal.com → there is usually a banner or a "Complete your
      account setup" task list if anything is outstanding. Clear it first.
- [ ] **Can it receive and withdraw USD?**
      The site charges deposits in USD — that is fixed in
      `paypalProvider.ts` and is what the deposit figures in Sanity mean.
      Check Settings → Payment preferences for how non-primary currencies are
      handled, and check you can withdraw. PayPal's receiving support varies by
      country, so confirm it for *your* account rather than in general. If USD
      cannot be received, stop here and tell me — the currency is one constant
      and the figures would need rethinking, which is a conversation, not a
      code change.
- [ ] **Is the business name on the account the one customers should see?**
      It appears on the PayPal screen and on their statement.
- [ ] **Which email receives payment notifications?**
      Not used by the site, but it is how you will spot the first live payment.

---

## 1. Decisions

Three, all already decided. Change any of them by telling me — two are one
environment variable.

### Sandbox first, or straight to live?

**Sandbox first.** This is the one strong recommendation in this document.

The payment path has never been executed against PayPal from the development
environment (PayPal is blocked there), so the first real run will be the first
run ever. Sandbox costs an hour and makes that run a test instead of a
customer's money. There is no downside: the sandbox is a complete copy of
PayPal with fake accounts.

Going live first is not reckless, it is just unnecessary — you would be
debugging with real deposits and real refunds.

### Take the money, or hold it? — `PAYPAL_INTENT`

**`CAPTURE` (default).** The money arrives when the customer approves. That is
what "instant payment" means, and it is what your existing PayPal payment links
already did, so switching rails does not change what happens to anybody's
money. If you cannot do a date, declining the booking refunds it automatically;
PayPal keeps its fixed fee, so a declined booking costs you a little.

`AUTHORIZE` holds the money instead and takes it when you confirm the date.
Tidier — a date you cannot do costs the customer nothing and needs no refund —
but PayPal honours a hold for 3 days and allows capture up to 29, after which a
capture can fail or come back short. It is a clock somebody has to watch.

Stay on CAPTURE until refund fees annoy you.

### Deposit only, or the full price?

**Deposit only.** Unchanged, and the reason is in `booking-deposits.md`: the
site does not publish prices, so a full price cannot be charged at a screen
that does not show one. The deposit is a figure you are genuinely asking for.

---

## 2. What you need from PayPal

Four values. Two come from an app, one you type, one comes from a webhook.

| Value | Where it comes from | Where it goes | Secret? |
|---|---|---|---|
| Client ID | developer.paypal.com → Apps & Credentials → your app | `PAYPAL_CLIENT_ID` | No — it ships to every visitor's browser inside the PayPal SDK. It identifies your shop; it authorises nothing. |
| Secret key | Same screen, "Show" | `PAYPAL_CLIENT_SECRET` | **Yes.** It can take payments and issue refunds. Env panel only — never a file in the repo, never a message, never a screenshot. |
| Environment | You type it | `PAYPAL_ENV` = `sandbox` or `live` | No |
| Webhook ID | Same app → Webhooks → Add Webhook | `PAYPAL_WEBHOOK_ID` | No |

**Sandbox and live are two completely separate sets.** The Apps & Credentials
page has a toggle; the keys on each side only work against that side. A sandbox
key against the live host fails with an authentication error, which is the
failure you want.

If a secret is ever exposed: "+ Add Second Key", then delete the old one.
PayPal lets you hold two so you can rotate without downtime.

---

## 3. Sandbox, step by step

1. **Get the sandbox keys.** developer.paypal.com → Apps & Credentials →
   **Sandbox** → your app. Copy the Client ID and Secret.

2. **Prove them, before touching the site.** On your machine:

   ```
   PAYPAL_CLIENT_ID=... PAYPAL_CLIENT_SECRET=... npm run paypal:smoke
   ```

   It authenticates, creates an order, reads it back, and checks the booking
   reference survives the round trip. Nobody approves the order, so it leaves
   no trace. If this fails, nothing else will work — fix it here.

3. **Put them in Vercel**, Production scope, and redeploy:

   ```
   PAYPAL_CLIENT_ID=...
   PAYPAL_CLIENT_SECRET=...
   PAYPAL_ENV=sandbox
   PAYPAL_INTENT=CAPTURE
   ```

   This is safe, and it is deliberate. **Sandbox on a public site is offered to
   signed-in admins only** — customers keep the PayPal payment links set on
   each product, exactly as they have today, so nobody can complete a test
   payment and believe they have booked. See `paymentProviderFor` in
   `activeProvider.ts`.

   The alternative was a preview deployment on its own branch with a second
   copy of every environment variable, which is a lot of moving parts to get
   wrong while trying to prove one thing works.

   Env var changes only take effect on a new build, so redeploy after adding
   them.

4. **Get a sandbox buyer.** Testing Tools → Sandbox Accounts. PayPal creates a
   **Business** account (your shop) and a **Personal** account (a customer).
   You pay with the Personal one. Note its email and password.

5. **Check the wiring.** Open `/admin/paypal` on your site, signed in as an
   admin. It should say SANDBOX, show which settings are in place, and tell
   you the buttons are admins-only. Press **Test the PayPal connection** — it
   makes a $1 order nobody approves, so nothing moves.

6. **Run it.** Still signed in as an admin, open the Exclusive Pyramids
   Photoshoot, press **Instant Booking**, fill in the two steps, and pay with
   the Personal sandbox account.

7. **Check all five of these**, not just that the money moved:

   - [ ] The red **TEST MODE** panel appears above the buttons
   - [ ] After paying, the dialog thanks you for the deposit and **does not say
         your date is confirmed** — that is deliberate and is the one rule the
         whole design protects
   - [ ] `/admin/reservations` shows the booking, deposit **paid**, matched to
         the reference automatically with nothing typed into a PayPal note
   - [ ] Press **Decline** → the message says the deposit was refunded
         automatically, and the sandbox transaction shows the refund
   - [ ] Start another booking and press **Cancel** in the PayPal window → the
         dialog returns to the buttons, the booking still exists as unpaid, and
         nothing claims it was paid

---

## 4. The webhook

Skip it during local testing. It needs a public URL and localhost is not one.

Everything above works without it, because the browser settles the payment
while the customer is still on the page. The webhook is the backstop for what
happens **after** they close the tab: a payment PayPal reviews for an hour, a
refund you issue from the PayPal dashboard, a dispute.

**Set it before going live.** Without `PAYPAL_WEBHOOK_ID`, every delivery is
refused — with no webhook id there is no way to tell PayPal from anyone else
POSTing to a public URL, and accepting one would let a stranger mark any
booking paid. The server says so loudly at startup.

- Live app → Webhooks → **Add Webhook**
- URL: `https://<your-domain>/api/webhooks/paypal`
- Events: the `PAYMENT.CAPTURE.*` and `PAYMENT.AUTHORIZATION.*` ones
- Copy the **Webhook ID** it gives you into `PAYPAL_WEBHOOK_ID`

To test the webhook before going live, deploy this branch to a Vercel
**preview**, put the sandbox keys in Vercel's **Preview** scope only, and point
a sandbox webhook at the preview URL. Production is untouched.

---

## 5. Going live

Only after section 3 passes.

1. Apps & Credentials → **Live** → your app → copy Client ID and Secret
2. Create the **live** webhook (section 4) and copy its Webhook ID
3. In Vercel → Settings → Environment Variables, **Production** scope:
   ```
   PAYPAL_CLIENT_ID      = (live)
   PAYPAL_CLIENT_SECRET  = (live)
   PAYPAL_ENV            = live
   PAYPAL_INTENT         = CAPTURE
   PAYPAL_WEBHOOK_ID     = (live)
   ```
4. **Redeploy.** The product pages are prerendered, so the variables only take
   effect on a build.
5. Check the deploy log for any line starting `paypal:` — a correctly
   configured live deployment is silent.
6. **One real payment.** Set the photoshoot's deposit to `1` in the Studio, pay
   that $1 from a different PayPal account or card, confirm it appears in
   admin, then Decline and watch the $1 come back. Set the deposit to 25 again.
   That exercises order → capture → webhook → refund for a dollar.

---

## What you are and are not relying on

**Card details never touch this server.** The site loads PayPal's buttons with
`components=buttons` only — no card fields, no hosted fields. Everything a
customer types goes into PayPal's own iframe, on PayPal's domain. There is
nothing to store, and nothing stored.

**The browser is never believed.** It reports that the customer approved and
hands back an order id the server issued. The server then asks PayPal, with
your secret, and checks the order belongs to this booking, the reference still
matches, and the amount equals the recorded deposit. A mismatch leaves the
booking unpaid and tells a person.

**A payment never confirms a date.** Money moving and a date being available
are different facts. The system will say the deposit is paid; only a person
saying so makes the booking confirmed.

**What has not been proven:** the round trip against PayPal itself. It could
not be run from the environment this was written in. `npm run paypal:smoke` and
section 3 are what close that gap, and they have to be run by you.


## Going live

The code change is done; the switch is four environment variables in Vercel.
Set them on **Production**, redeploy, and check `/admin/paypal`.

| Variable | Value |
|---|---|
| `PAYPAL_ENV` | `live` |
| `PAYPAL_CLIENT_ID` | the **Live** client id from PayPal → Apps & Credentials |
| `PAYPAL_CLIENT_SECRET` | the **Live** secret for that same app |
| `PAYPAL_WEBHOOK_ID` | the id of a **Live** webhook pointed at `https://egypteyetravel.com/api/webhooks/paypal` |

Then **delete** these if they exist: `PAYPAL_SANDBOX_ADMIN_PREVIEW`, and any
sandbox client id or secret left in the Production scope. Nothing reads a
sandbox credential in a live deployment, but a variable that is still there is
one edit away from being used.

### The webhook is not optional

It is the thing that captures the money. The browser callback is an
accelerator. With no `PAYPAL_WEBHOOK_ID`, a customer who approves and closes
the tab is not charged until the daily sweep finds them, and refunds made from
the PayPal dashboard never reach the site. Subscribe the live webhook to
`CHECKOUT.ORDER.APPROVED`, `PAYMENT.CAPTURE.COMPLETED`,
`PAYMENT.CAPTURE.DENIED`, `PAYMENT.CAPTURE.REFUNDED` and
`PAYMENT.CAPTURE.REVERSED`.

### Sandbox is refused on the live domain

Not just hidden from customers — refused to everybody, admins included. A test
credential on the real domain produces a payment that looks real, moves no
money, and leaves a booking recorded as paid. `PAYPAL_SANDBOX_ADMIN_PREVIEW=1`
re-opens it for signed-in admins if testing on the real domain is ever needed
again, and `liveReadiness` reports it so it cannot be left on unnoticed.

### What "ready" looks like on /admin/paypal

* Connection test: all four ✓, and the environment reads **live**
* Safety self-test: all ✓
* Deposits by product: ✓ on everything you expect to be bookable
* No readiness warnings

### First live payment

Take one yourself, for the smallest deposit on the site, with a real card or
PayPal balance. Then check, in order: the money in the PayPal account, the
booking in `/admin/reservations`, the customer email, the team email. Refund it
from `/admin/paypal` afterwards and confirm the refund lands. That is the only
test that proves the live path, and it costs one small transaction fee.
