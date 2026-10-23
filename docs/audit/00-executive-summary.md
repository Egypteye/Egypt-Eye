# Compliance & risk audit — executive summary

**Stages 1 and 2 only** (discovery and research), as instructed. Nothing has been
deployed. Written 15 October 2026 against commit `dc8d268` on
`claude/egypt-eye-travel-website-fckb5t`.

**This is not legal advice and does not certify compliance.** It is an engineer's
reading of the code plus research into published sources, written so that a
qualified Egyptian lawyer can be pointed at the right questions quickly.

---

## The one thing that is time-critical

**Egypt's PDPL executive regulations are in force and the compliance deadline is
roughly two weeks away.**

Ministerial Decree No. 816 of 2025 issued the Executive Regulations to Personal
Data Protection Law No. 151 of 2020 on **1 November 2025**, with a **one-year
compliance period ending on or about 1 November 2026**. Reported obligations
include **prior authorisation from the Personal Data Protection Centre for most
processing**, appointment of a **Data Protection Officer** where applicable, and
**72-hour breach notification**.

Egypt Eye is an Egyptian establishment processing personal data of customers.
This is the jurisdiction with the clearest nexus and the nearest deadline.

Two things cut against panic, and both are reported rather than confirmed by us:
the Personal Data Protection Centre is described as **established but not yet
operational**, and the **electronic portal for licence and permit applications is
reportedly not live, with application forms not yet published**. So the
obligation may currently be impossible to discharge through the official channel.

**This needs an Egyptian lawyer this month, not a code change.** See
`01-legal-applicability-matrix.md` for sources and `03-owner-actions.md`.

---

## What the code audit actually found

### The good news is real and worth stating

- **There is no tracking on this website.** No Google Analytics, no GTM, no
  Meta pixel, no Plausible, no PostHog. The Content Security Policy
  (`next.config.ts`) allows scripts only from `'self'` and PayPal, and
  `connect-src` only `'self'`, Supabase and PayPal — so a third-party tracker
  could not run even if one were added by accident. **The hardest part of
  cookie compliance is therefore already solved, by absence.**
- Browser storage is used in 7 files and all of it is first-party and
  functional: the journey planner, a packing checklist, the explore-mode
  toggle and a newsletter-popup dismissal. None of it is advertising or
  cross-site tracking.
- Payment integrity is strong and was audited earlier in this project:
  integer-cent arithmetic, server-side price derivation, per-attempt
  idempotency keys, webhook signature verification, capture committed before
  fulfilment, and a reconciliation sweep.
- Admin pages are protected by a **server-side** role check that redirects,
  not by hiding UI.

### The database posture is better than the linter headline suggests

Supabase's security advisor reports **97 tables with "RLS enabled, no policy"**.
Read naively that sounds alarming. It is not, and classifying it as critical
would be exactly the mistake this audit was told to avoid.

RLS enabled with **no** policy means **deny all** for the `anon` and
`authenticated` roles. The service role, which the server uses, bypasses RLS by
design. We confirmed the split directly:

| Table | Policies | Who reads it |
|---|---|---|
| `profiles` | 2 | the signed-in customer |
| `reservations` | 1 | the signed-in customer |
| `journeys`, `journey_items` | 1 each | the signed-in customer |
| `boutique_orders`, `payment_attempts`, `rate_limit_hits`, `newsletter_subscribers` | **0** | the server only |

The tables customers touch have policies. The tables with none are the ones no
browser should ever reach. **Severity: INFORMATIONAL.**

### The genuine security findings

| # | Finding | Severity | Evidence |
|---|---|---|---|
| S‑1 | `public.cleanup_rate_limit_hits()` is a `SECURITY DEFINER` function **executable by the `anon` role** over `/rest/v1/rpc/`. Anyone on the internet can call it and wipe the rate-limit table — defeating brute-force protection on login and on every public form at once. | **HIGH** | Supabase security advisor, 15 Oct 2026 |
| S‑2 | Three further `SECURITY DEFINER` functions exposed to `anon`: `handle_new_user`, `prevent_role_self_escalation`, `trip_departure_seat_sync`. These are trigger functions and should not be callable directly. `trip_departure_seat_sync` touches seat counts. | MEDIUM | same |
| S‑3 | **Leaked-password protection is disabled** in Supabase Auth. One dashboard toggle enables a check against HaveIBeenPwned. | MEDIUM | same |
| S‑4 | 19 functions have a mutable `search_path`. Standard Postgres privilege hardening. | LOW | same |
| S‑5 | `btree_gist` is installed in the `public` schema. | LOW | same |

S‑1 is the one worth fixing first, and it is a few lines of SQL.

### The documentation gap

Three legal pages exist: `/privacy`, `/terms`, `/cancellation-policy`.

The privacy page is about 640 words and mentions "third parties" and "your
rights" **generically**. It does not name a single actual processor. We checked:
"Supabase" appears 0 times, "Resend" 0, "PayPal" 0, "Vercel" 0, and there is no
retention statement at all.

Meanwhile the site genuinely sends customer personal data to Supabase (hosting
and storage), Resend (email), PayPal (payments), Sanity (CMS) and Vercel
(hosting and logs).

**That mismatch is the highest-value fixable item in this audit.** A privacy
policy that does not describe actual processing is a problem under essentially
every regime considered here, and unlike the licensing questions it is entirely
within our control. It is also the one thing the brief warns about most
directly: do not claim a policy describes data handling until the
implementation has been inspected. We inspected it; it does not.

Missing entirely, and each justified separately in `01-legal-applicability-matrix.md`:
cookie/storage notice, accessibility statement, business identification
(trader details), and — once physical goods ship — returns and delivery terms.

---

## What has NOT been done yet

Stages 3 to 7. Specifically: the accessibility audit (WCAG 2.2 AA keyboard,
focus, contrast, screen-reader semantics), the full data-flow inventory, the
consumer-journey transaction audit, and the remediation itself.

An earlier visual audit in this project did record **colour-contrast failures**
and **touch targets under the recommended size on mobile review links**; those
are logged but not yet fixed, and are the natural first entries in the Stage 3
accessibility backlog.

## Limits of this audit

- **No page of `egyptianchambersoils.com`, Google Maps, or most third-party
  sites could be opened from this environment.** The sandbox blocks DNS for
  them. Research was done through server-side web search, which returns
  summaries of pages rather than the pages themselves.
- **No Egyptian primary legal text was read in the original Arabic.** The PDPL
  findings rest on law-firm commentary and trackers, which is secondary
  evidence. Every date below should be confirmed against the Official Gazette.
- Nothing has been tested against the live site in this stage, and no
  production change has been made.
