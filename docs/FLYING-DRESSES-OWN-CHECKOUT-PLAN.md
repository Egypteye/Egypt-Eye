# Deposits on flyingdressesegypt.com: the plan

25 November 2026. **Nothing built yet.** This is the design, the risk and the
one decision I need from you.

---

## What happens today

The booking button on a Flying Dresses shoot links to
`egypteyetravel.com/secure/photoshoot/<slug>`. The customer leaves the brand,
pays a 25% deposit on the travel domain, and the reservation is written there.

The code is honest about why: one PayPal rail, one authority for what a shoot
costs, and no second integration that could quote a second deposit for the
same shoot. That reasoning still holds. **What changes is where the page is
served, not how many rails there are.**

---

## The shape of the work

Smaller than the old note in `BookingRail.tsx` suggests. That note warns about
forking "a 1,200-line form", which is `SecureDateButton.tsx`, the rich in-page
widget on Egypt Eye product pages. The hand-off does not use it. It uses the
standalone page at `/secure/[type]/[slug]`, which is **137 lines of page and a
268-line form asking four questions**. That is the thing to bring across, and
it is a different size of job from the one the note describes.

### 1. A checkout page in this brand's chrome
A route under `/flying-dresses/` so it renders in the Flying Dresses layout,
fonts and colours, reusing the same four-question form. Not a fork of the
money logic: the form posts to the same `/api/bookings`, and `productRail()`
stays the single authority for price and deposit.

### 2. Three API routes allowed on this hostname
`src/proxy.ts` deliberately 404s every booking route on this domain, and its
own comment names the three that come back when the checkout is presented in
this brand's chrome: `/api/bookings`, `/api/bookings/rail`, and
`/api/bookings/paypal/capture`.

**Two stay out, and the proxy already explains why.** `/api/bookings/reconcile`
belongs to one deployment and a second domain answering it is a second thing
that can double-settle. `/api/webhooks/paypal` finds a booking by order ID in
the shared Supabase, so an order started here is already settled by the
registration on the Egypt Eye domain; a second endpoint needs a second
registration and buys nothing.

### 3. The PayPal return URL
`/api/bookings/route.ts` builds `returnUrl` from Egypt Eye's `siteUrl`. A
customer who starts on this domain has to come back to it, so that has to
become origin-aware, with a `/secure/return` equivalent in this brand's chrome.

### 4. Environment variables on the Flying Dresses Vercel project
This is the decision. See below.

---

## The one decision: secrets on a second deployment

`docs/FLYING-DRESSES-DEPLOYMENT.md` currently says, for this project:

> | **`PAYPAL_*` (all)** | **No** | It cannot and must not take money. |
> | **`SUPABASE_SERVICE_ROLE_KEY`** | **No** | Nothing on this brand's pages writes to the database. |

Taking deposits here reverses both. The Flying Dresses deployment would hold a
PayPal secret that can take payments and issue refunds, and a Supabase service
role key that bypasses row-level security.

That is not a reason not to do it. It is the actual cost, and it is worth
naming rather than discovering: **one compromised deployment becomes two.**

**Still one PayPal app.** No second app, no second set of credentials. The same
client ID and secret, set on a second project, so both domains speak to one
PayPal account with one history and one reconciliation. A second app would be
the two-deposits problem the architecture was built to prevent.

---

## Why this can ship safely before you touch Vercel

`payPalConfig()` returns null when the credentials are absent, and
`canCompleteBookingHere()` requires both the provider and Supabase. With no
environment variables set, a Flying Dresses checkout page renders **the enquiry
path, not a dead button**, exactly as it does today.

So the code can go live inert, and you turn it on by adding variables. Nothing
charges anybody until you do.

---

## Suggested order

1. I build it. It ships inert, because the Flying Dresses project has no
   PayPal variables. Nothing changes for a customer.
2. You add the **sandbox** credentials to the Flying Dresses Vercel project.
3. We run a real test booking end to end on the live domain with sandbox money,
   and check the row in Supabase and the order in PayPal.
4. You swap `PAYPAL_ENV` to `live` and the credentials to the live app.
5. One real low-value booking, confirmed in the PayPal dashboard, then refunded.

Steps 2 and 4 are yours; I cannot set a secret. Step 3 and 5 I can drive.

---

## What I need before I start

**Confirm you are content for the Flying Dresses deployment to hold the PayPal
secret and the Supabase service role key.** That is the whole of the new risk,
and it is reversible only by taking the feature out again.

Everything else I can decide and do.
