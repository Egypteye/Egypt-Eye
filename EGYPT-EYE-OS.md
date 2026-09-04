# Egypt Eye OS

The internal operating system of Egypt Eye, at **`/os`**.

It begins where the public website ends. The reservation team closes deals in
the places customers already are — Instagram, WhatsApp, booking platforms — and
the moment a deal is confirmed, it becomes a **trip** in here. From that point
the OS runs the operation: who is going, in what vehicle, wearing which dress,
what it costs, what is missing, who decided what, and where the photographs
ended up.

It is deliberately **not** an inbox, not a booking engine, and not a CRM.

---

## What it actually does

| | |
|---|---|
| **Trips** | The central object. Every booking becomes one, with a lifecycle, a crew, an itinerary, costs, media, documents, a channel and a full history. |
| **Readiness** | Every trip is continuously scored against what its service actually needs, and explains each gap in a sentence you can act on. |
| **Conflicts** | The database physically cannot double-book a confirmed person, vehicle or dress. Softer clashes are reported loudly and can only be forced with a written reason. |
| **Boards** | Today (what is running) and Tomorrow (what is broken, worst first). |
| **Calendars** | An operations calendar for trips, and a separate company calendar for meetings. Mixing them is how operations calendars become unreadable. |
| **Clients** | One permanent record per person or agency, with their whole travel history. A returning guest is matched, never duplicated. |
| **Resources** | Vehicles, dresses and equipment, with real availability — a van in the workshop cannot be assigned. |
| **Suppliers** | Partners, effective-dated rates, and the incident count that says whether to keep using them. |
| **Money** | A central price book where nothing is hardcoded, a calculator that quotes from the rates valid on the trip's own date, and estimated-versus-actual on every trip. |
| **Work** | Checklists generated from the service's template, approvals with real separation of duties, and incidents that cannot be closed without a resolution. |
| **Content** | The post-shoot pipeline from raw upload to a verified client delivery link. |
| **Knowledge** | The things only a veteran knows: which gate, which permit, what wind speed makes a flying dress unusable. |
| **Reservations (B2C)** | Enquiries with a response-time clock, an explainable score, and the pipeline from first message to closed booking. |
| **Partnerships (B2B)** | Agencies, operators and hotels; their people, their pipeline, their contracts, and a relationship health score that grades Egypt Eye as much as it grades them. |
| **Agreements** | Commission and net rates, effective-dated and superseded, so the rate that priced a booking last spring stays resolvable forever. |
| **Administration** | A live permission matrix, an append-only audit log, and an honest list of which automations are actually running. |

---

## Getting it running

The OS runs on its OWN Supabase project, separate from the website's — a
different database with its own users, not a new table set in the same one.
It is the strongest isolation available: the OS is not connected to the
customer database at all, so no query and no misconfigured permission can
reach across it, staff never land in the customer book, and a key leaked on
one side exposes nothing on the other. There is deliberately no fallback
between the two.

**1. Add the service-role key.** In Vercel → Settings → Environment Variables:

```
SUPABASE_SERVICE_ROLE_KEY=...   # Supabase → Project Settings → API → service_role
CRON_SECRET=...                 # any random string you make up
```

`SUPABASE_SERVICE_ROLE_KEY` must never be exposed to the browser and must never
be prefixed `NEXT_PUBLIC_`. See *Security* below for why the OS needs it.

**2. Run the migrations,** in order, in Supabase → SQL Editor:

| File | What it does | Required |
|---|---|---|
| `0018_egypt_eye_os_core.sql` | The whole schema: 69 tables, the conflict constraints, the reporting views, and RLS lockdown. | Yes |
| `0019_egypt_eye_os_config.sql` | The permission catalog, the 15 system roles and their matrix, business units, services, statuses, tags, pricing tiers, approval rules, settings. | Yes |
| `0020_egypt_eye_os_demo.sql` | Realistic demo data: 22 crew, 14 clients, 21 trips dated relative to *today*, resources, suppliers, knowledge. | Optional |
| `0021_egypt_eye_os_functions.sql` | Reference sequences, knowledge search, the change cursor. | Yes |

All four are safe to re-run.

**3. Link yourself to a staff record.** The OS identifies you by an
`os_employees` row whose `user_id` matches your Supabase Auth account. Create
your own account at `/account/signup` if you have not, then in the SQL Editor:

```sql
update public.os_employees
set user_id = (select id from auth.users where email = 'you@egypteyetravel.com')
where code = 'EE-001';   -- the Owner in the demo data
```

**4. Open `/os`.**

If the demo data is loaded you will land on a live command centre: trips today,
trips tomorrow with real problems on them, pending approvals, an open incident,
and a content pipeline mid-flight.

---

## Trying it as different people

The demo data ships with the whole company, each holding real roles. Link your
account to any of these codes to see what they see:

| Code | Person | Sees |
|---|---|---|
| `EE-001` | Bishoy Nassif, Founder | Everything, including every financial figure and the audit log. |
| `EE-002` | Mariam Fahmy, Operations Manager | The whole operation, supplier rates, approvals — but not company financial reporting. |
| `EE-003` | Karim Adel, Operations | Plans and staffs every trip, and **cannot see selling price, margin or profit anywhere**. |
| `EE-004` | Nour Hassan, Reservations | Creates clients and trips, quotes with full margins, does not schedule crew. |
| `EE-006` | Hana Mostafa, Finance | Every number, no scheduling authority. |
| `EE-008` | Omar Sherif, Coordinator | Scoped to the Photoshoots and Flying Dress units only. |
| `EE-010` | Ahmed Tarek, Photographer | Only his own assignments and their clients — plus one deliberate personal exception granting him costs on his own trips. |
| `EE-017` | Sayed Abdo, Driver | The narrowest role in the system: his runs, his pickups, his vehicle. |

Switching between `EE-003` and `EE-004` is the quickest way to see the
permission engine working: the same trip page renders with and without money,
and the difference is that the figures are **absent from the response**, not
hidden with CSS.

---

## How it is built

### Security

Every `os_` table has Row Level Security enabled and **no client policy**, with
the `anon` and `authenticated` grants revoked. The browser's key can read and
write nothing in the OS, whatever a crafted request asks for.

All access goes through server-only code in `src/lib/os/*`, which holds the
service-role key and follows one rule without exception: **resolve the acting
employee, check a permission, apply a scope filter — then query.** Server
actions call `requirePermission` before reading a single field of their input.
A hidden button is a convenience; the server action is the boundary.

The permission model is **permission × scope**:

- `all` — every record in the organization
- `unit` — records in a business unit the actor belongs to
- `own` — only what they are assigned to, own, or created

Effective permissions are the union of every role's grants (widest scope wins),
plus per-person exceptions, where an explicit revoke always beats a role grant.

Two rules hold absolutely, enforced server-side and unaffected by role:

- You cannot grant a role, or a permission, at or above your own authority.
- You cannot approve your own request.

### History

Nothing operational is destroyed.

- Records archive rather than delete.
- Rates are effective-dated. Changing a supplier price closes the old row's
  window and inserts a new one — a trip costed in March keeps March's number
  forever, which is exactly the Jan/Apr/Jul example in the specification.
- Cost lines snapshot both the amount **and the rate row it came from**, so a
  historical trip can explain where its numbers came from.
- Exchange rates are inserted with a date and never updated, so last quarter's
  profit does not move when the pound does. The OS refuses to record a cost in
  a currency it has no dated rate for, rather than assuming 1.0.
- `os_audit_log` has no UPDATE or DELETE grant for the role the application
  runs as. A correction is a new entry, never an edit.

### Double-booking

Two `confirmed` assignments for the same person, vehicle, dress or camera
cannot overlap in time. That is a Postgres exclusion constraint over
`(subject, tstzrange)`, not application logic — it holds under two coordinators
clicking simultaneously, which is the race an application-level check always
loses.

`assigned` (pencilled-in) overlaps are permitted, because operations really
does hold two candidate slots while a client decides. Those are reported
loudly, refused without a written reason, and the reason raises an approval.

### Readiness

What a trip needs is **configuration, not code**. Each service type carries a
`requirements` JSON:

```json
{"photographer":true,"driver":true,"vehicle":true,"dress":true,
 "client_contact":true,"pickup":true,"pricing":true,"media_folder":true}
```

The engine weights each check by consequence — a missing driver is not the same
size of problem as a missing itinerary line — and produces a score, a state and
a list of blockers each written as an instruction. Adding a new Egypt Eye
service is a row declaring what it needs; readiness, task generation and
conflict checking all follow.

A trip **cannot** be marked Ready while its score says otherwise. Someone with
approval rights can override that gate, and the override is recorded in the
status history as FORCED with their name and reason.

### Automation

Two kinds, both honest about themselves.

**On a mutation** — creating a trip generates its checklist and opens its
channel in the same request; assigning someone notifies them and posts to the
trip channel. These cannot fail silently, because they run inside the action
that caused them.

**On a schedule** — `/api/os/cron`, called hourly (already in `vercel.json`),
re-checks readiness inside the 24-hour horizon, chases shoots with no uploaded
media, and escalates approvals past their deadline. Every run is written to
`os_automation_runs`, so *"did last night's check actually run"* has an answer
rather than an assumption.

Automations that need an integration Egypt Eye has not configured — Drive
folder creation, WhatsApp briefs, calendar sync — are registered and visible in
the Admin Centre with the exact credential they are waiting on, and switching
one on is **refused with an explanation**. There is no toggle that pretends.

### Near-real-time

When operations assigns a photographer, the manager's board and the
photographer's phone update without anyone pressing refresh. That works by
polling one very small endpoint (`/api/os/pulse` returns five timestamps) and
calling `router.refresh()` only when something has actually moved — so the page
re-renders on the server with the viewer's own permissions intact, which a
websocket pushing row data could not do without duplicating the whole
permission layer on the client. Polling pauses when the tab is hidden.

It is not a live socket, and the product does not claim to be one.

### Cross-platform

One responsive web application, installable as a PWA. The same account works on
an iPhone at 05:30 in a hotel car park and on a MacBook in the office. Nothing
is installed, and there is no separate mobile build.

Mobile is not the desktop layout shrunk: it is a bottom tab bar with the five
things a field employee actually does, large enough to hit with a thumb while
holding a camera bag, with the rest behind "More". `/os/me` is the whole
product for a driver — the next trip, the pickup, the client's phone number one
tap away, and five big buttons to report status.

---

## Where things live

```
supabase/migrations/
  0018_egypt_eye_os_core.sql        schema, constraints, RLS, views
  0019_egypt_eye_os_config.sql      permissions, roles, units, services
  0020_egypt_eye_os_demo.sql        demo data (optional)
  0021_egypt_eye_os_functions.sql   sequences, search, pulse

src/lib/os/
  db.ts             the only database handle; server-only, service-role
  actor.ts          who is acting and what they may do
  permissions.ts    the compile-time permission vocabulary
  scope.ts          turning a scope into a query filter
  readiness.ts      the readiness engine
  conflicts.ts      double-booking, availability, and ranked candidates
  status.ts         the trip lifecycle and its gates
  pricing.ts        effective-dated rates and the calculator
  automation.ts     mutation-triggered rules and the hourly sweep
  audit.ts          the activity story and the forensic record
  analytics.ts      everything derived at read time
  saved-views.ts    stored filter documents -> the filter URL
  commercial/       leads, deals, partners, agreements, scoring, health
  actions/          server actions, each behind guarded()

src/app/os/
  layout.tsx        fonts and theme only — no auth gate
  sign-in/          so it is not gated by the layout above it
  (app)/            every authenticated screen

src/components/os/  the shared component kit
src/app/api/os/     search, pulse, calculate, cron, exports
```

## B2C and B2B are two workspaces, not two systems

The commercial layer is one data model with two lenses on it. `os_deals` has a
`pipeline` column; Reservations filters it to `b2c` and Partnerships to `b2b`.
The same tasks, approvals, quotes, audit log and activity feed stand behind
both, which is why "how much is open across the business" is a single query and
why a B2C guest who turns out to run an agency is re-pointed rather than
re-entered.

Three decisions carry most of that weight:

**A person is `os_clients`. There is no contacts table.** A traveller who books
for themselves and a person who books for an agency are the same row. What
joins them to a company is `os_client_companies` — a membership, not a copy —
so the same person can be a B2C customer in their own right and a contact at
two agencies at once. The partner page's "Also a customer" column exists only
because of this; with a separate contacts table it would be unanswerable.
A company is genuinely different from a person, so `os_companies` is new: it
has contracts, terms, several contacts, and it outlives any of them.

**Every score carries its reasons.** Lead score and relationship health are
arithmetic over published rules, not models. The rules live in
`os_lead_score_rules` with a points value and an `explanation` written for a
salesperson to read; the matched rules are stored on the record beside the
number, and `ScoreBreakdown` is the only component that renders a score — it
always renders the list too. A rule with an empty explanation does not run.
Disagreeing with a score means editing a configuration row, which makes it a
company decision rather than a developer's opinion compiled into the build.

**Commercial terms are superseded, never edited.** `os_agreement_terms` is
effective-dated with a GiST exclusion constraint stopping two terms covering
the same service, tier and party size on the same day. `resolveTerm` therefore
always takes a date, and there is deliberately no "the current commission"
function anywhere — a booking made in March that travels in September is a
question with two right answers depending on which one the business means.

Stage requirements are configuration too, and a refusal always names what is
missing: *"Nobody at this company is recorded as able to decide — B2B deals
stall here more than anywhere else"* rather than a greyed-out button.

## Saved views are stored queries, not stored links

A row in `os_saved_views` holds a `query` JSON document, and
`src/lib/os/saved-views.ts` is the only thing that turns it into a screen. It
translates the document into the same filter URL a person would land on by
clicking the filters by hand, which has three consequences worth stating:

- **Renaming a view changes nothing about what it shows.** Nothing matches on
  the name.
- **Editing the query is what changes the list**, and it takes effect the next
  time anyone opens it — a view is re-run, never cached.
- **A key the build cannot honour is reported, not dropped.** The chip carries
  a marker and says which part of its query was ignored. A view that quietly
  drops half its filters shows a confident, wrong list, which is worse than no
  view at all.

The same rule covers permissions. "High margin trips" filters on money, so for
somebody without `trips.financials` the page runs the rest of the view and says
plainly that the margin filter was left out — rather than showing an unfiltered
list under a filtered heading.

## What is deliberately not built

Being honest about the edges is part of the product:

- **No customer inbox.** Meta and WhatsApp keep that job. A lead records that
  an enquiry ARRIVED — where from, how fast it was answered, what became of it
  — which is the part nobody can reconstruct from a DM thread six months
  later. The OS does not receive, thread or send messages.
- **No payment processing.** Finance is a ledger of what happened, so
  *"what is outstanding"* has an answer without opening three systems.
- **No payroll.** Attendance answers "who is working today" for operations and
  stops there. Egypt Eye has an accountant.
- **No media storage.** Drive holds the files; the OS holds the link, who may
  see it, and whether anyone has verified it opens.
- **No AI model connected.** The governance layer exists — `os_ai_actions`
  records the actor, the permission snapshot each request ran under, the data
  it was allowed to see, and what it produced, so an AI answer can be audited
  exactly like a human action. Nothing pretends a model is wired up.
