# Stage 1 — discovery inventory

Taken from the code at commit `dc8d268`, not from the marketing pages.

## Scale

- **70** public page routes under `src/app/[locale]/(site)/`
- **35** API routes under `src/app/api/`
- **~110** Postgres tables, of which `os_*` (≈90) are an internal operations
  system and the rest serve the public site
- One brand ships from this repository: **Egypt Eye Travel**. Flying Dresses
  Egypt, Egypt Nomads and Hera Travels are **not in this codebase** — see
  "Ecosystem" below.

## Personal-data collection points

| Route / endpoint | Function | Data collected | Payment |
|---|---|---|---|
| `/api/bookings` | Tour & photoshoot booking | name, email, phone, dates, party size, extras, outfit choices | **Deposit** |
| `/api/boutique/order` | Cartouche purchase | name, email, phone, engraved name, collection notes | **Full payment** |
| `/api/reservations` | Reservation request | name, email, phone, trip dates, preferences | None |
| `/api/trip-seats` | Weekly-trip seat hold | name, email, phone, seats | Deposit |
| `/api/enquiry`, `/api/concierge`, `/api/customize-request` | Enquiries | name, email, phone, free text | None |
| `/api/treasure-request` | Boutique enquiry | name, email, phone, personalisation answers, **uploaded photo** | None |
| `/api/shop-visit` | Shop visit request | name, email, phone, date, party size, interests | None |
| `/api/review-submission` | Customer review | name, email, review text, **photos** | None |
| `/api/collaborate-apply`, `/api/travel-agent-apply`, `/api/affiliate-apply` | Partner applications | name, email, social handles, business details | None |
| `/api/hotel-rate-request`, `/api/transfer-request` | Trade requests | contact + trip details | None |
| `/api/newsletter/*` | Marketing list | email, **double opt-in with verify + unsubscribe** | None |
| `/account/*` | Customer accounts | Supabase Auth identity, profile | None |

**Special categories:** none collected deliberately. **But** `/api/treasure-request`
and `/api/review-submission` accept **photo uploads**, which may contain
images of identifiable people. The treasure upload goes to a **private**
Supabase bucket reached by signed URL — good — and that decision is documented
in the route.

## Processors that actually receive personal data

| Processor | What it gets | Where |
|---|---|---|
| **Supabase** | everything persisted: bookings, enquiries, accounts, uploads | EU (`eu-west-3`, Paris) |
| **Resend** | name + email + booking details in every transactional email | per Resend |
| **PayPal** | payer identity and payment data, directly | per PayPal |
| **Vercel** | hosting, request logs, IP addresses | per Vercel |
| **Sanity** | CMS content — **not customer data** | per Sanity |

**None of these is named in the privacy policy.** That is finding P‑1 and the
highest-value fixable item in the audit.

A positive, and worth noting because it is unusual: the database region is
**eu-west-3 (Paris)**, so customer data is stored in the EU rather than
transferred out of it — which simplifies the EU transfer analysis considerably.

## Tracking, cookies and browser storage

**No analytics or advertising of any kind.** Verified three ways:

1. No tracker package in `package.json`.
2. No tracker script in the layout — the only `<script>` tags are JSON-LD.
3. `next.config.ts` CSP: `script-src 'self' 'unsafe-inline'` + PayPal;
   `connect-src 'self'` + Supabase + PayPal. **A third-party tracker could not
   execute or transmit even if added by mistake.**

Browser storage, 7 files, all first-party and functional:
`src/lib/journey*.ts` (itinerary planner), `PackingChecklist.tsx`,
`ExploreModeToggle.tsx`, `NewsletterPopup.tsx` (dismissal state).

## Security posture

Strong, and most of it was built earlier in this project:

- Rate limiting on public endpoints, keyed on the **proxy-derived** client IP
- Shared honeypot field (`company`) on every public form
- Constant-time comparison for shared secrets; secrets never in query strings
- PayPal **webhook signature verification**; unverified webhooks refused
- Server-derived prices; the browser cannot send an amount
- Per-attempt idempotency keys; capture committed before fulfilment
- Admin routes gated by a **server-side** role check that redirects
- JSON-LD escaped against script-tag breakout
- CSP forbids `eval`, `ws:` and localhost in production

Open findings are listed in `00-executive-summary.md` (S‑1 to S‑5). S‑1 —
`cleanup_rate_limit_hits()` callable by `anon` — is the only one rated HIGH.

## Legal pages present vs missing

| Page | Status |
|---|---|
| `/privacy` | **Present but inaccurate** — ~640 words, names no processor, no retention period, no legal basis |
| `/terms` | Present; not yet audited against booking logic (Stage 5) |
| `/cancellation-policy` | Present; **not yet cross-checked against what the code and emails actually do** |
| Cookie / storage notice | Missing — but see EU‑2: arguably unnecessary while no tracking exists |
| Accessibility statement | Missing |
| Business identification (trader details) | Missing — needs registration number and address from the owner |
| Returns & delivery | Missing — only becomes necessary when goods ship |

## Ecosystem beyond this repository

The brief names five businesses. **Only Egypt Eye Travel is in this
repository.** Flying Dresses Egypt, Egypt Nomads and Hera Travels are not
present as code, configuration or deployment target here, and this session has
access to one repository only.

They cannot be audited from here. If they are separate sites, each needs its
own pass — and if any of them shares this Supabase project, that is itself a
data-segregation question worth asking.

## Deferred to Stage 3+

Accessibility (WCAG 2.2 AA), the full data-flow diagram, the consumer-journey
transaction audit, terms-versus-code reconciliation, and remediation.

Already known from an earlier visual audit in this project and carried forward:
**colour-contrast failures** and **mobile touch targets below the recommended
minimum on review links**.
