# Owner action list

Things no engineer can supply. Ordered by urgency.

## This month

1. **Take Egyptian legal advice on the PDPL deadline.** The executive
   regulations' compliance period is reported to end on or about **1 November
   2026**. Ask counsel specifically: (a) does Egypt Eye need PDPC
   authorisation, (b) is a DPO required at our size, (c) **can anything
   actually be filed given the portal is reported not to be live**, and (d)
   what is the exposure if the deadline passes while the regulator is not
   operational. Confirm the date against the Official Gazette — our sources
   are law-firm commentary, not the original Arabic text.

2. **Confirm headcount and turnover.** Fewer than 10 people **and** turnover
   or balance sheet **≤ €2 million** would put the EU Accessibility Act's
   microenterprise services exemption within reach. This single fact decides
   whether an EU legal obligation applies from June 2025 or does not.

3. **Confirm the tourism licence.** Which category is held, and does it cover
   photoshoots and shopping days as well as tours? Not answerable from code.

## Needed before any legal page can be written honestly

4. **Commercial registration number, tax number, registered address.** Without
   these, a trader-identification section cannot be written — and inventing
   one is explicitly off the table.

5. **Actual retention practice.** How long are bookings, enquiries, uploaded
   photographs and email records kept? A privacy policy stating a period we do
   not observe is worse than one that stays silent.

6. **Who is the contact for a data request?** An email address that a person
   actually monitors.

## Documentary

7. **Image licences and model releases.** For every customer and influencer
   photograph used commercially. Flag anything without a release rather than
   deleting it.

8. **Whether the other four businesses share this Supabase project.** If
   Flying Dresses Egypt, Egypt Nomads or Hera Travels write into the same
   database, that is a data-segregation question worth answering now.

## Decisions for you, not findings

9. **Analytics.** There is none, which is why the cookie position is currently
   simple. Adding any changes that: a tracker almost certainly needs consent
   in the EU/UK, which means a consent banner, a cookie notice and a CSP
   change. Worth doing — you are blind on conversion — but it is a trade.

10. **Whether to publish an accessibility statement.** Useful and low-cost,
    but it should describe real conformance, which means doing the Stage 3
    work first rather than publishing a claim.

## What I can fix without you (Stage 5, on your approval)

- **S‑1**: revoke `anon` EXECUTE on `cleanup_rate_limit_hits()` — a few lines
  of SQL, closes a public endpoint that can wipe rate-limit state
- **S‑2 to S‑5**: the remaining Supabase hardening, including one dashboard
  toggle for leaked-password protection
- **P‑1**: rewrite the privacy policy to describe **actual** processing —
  naming Supabase, Resend, PayPal and Vercel, and stating the EU storage
  region — with placeholders clearly marked where only you can fill a fact
- The customised-goods withdrawal exception, stated before purchase on
  cartouches
- The accessibility backlog: contrast and touch targets first
