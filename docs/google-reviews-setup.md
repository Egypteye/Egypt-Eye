# Connecting Google reviews to the website

The `/review` page works today without any of this. Travellers can already
write a review and publish it on Google. What this connects is the other
direction: showing those published reviews back on the site.

Everything below happens in a browser. There is no command to run.

---

## What you are connecting, and why it takes a form and a wait

Two different Google APIs can return reviews, and only one of them is any use
here.

| | Places API | **Business Profile API** |
|---|---|---|
| Reviews returned | **5**, chosen by Google | **all of them** |
| May they be stored? | **No** — only the place ID | Yes, they are your own data |
| Approval needed | No | **Yes, a form and a wait** |
| Cost | Per call | Free |

The five-review cap and the no-storage rule are why the easy option is the
wrong one: a review wall built on the Places API could never show more than
five, and would have to call Google on every single page view.

So this uses the Business Profile API, which is the owner-side one. The cost
is that Google has to approve the project first.

---

## Step 1 — Request access (do this first; it is the slow part)

1. Go to the **Google Cloud Console** and create a project, or use an existing
   one.
2. Submit the **Business Profile API access request form** (Google's
   "Application for Basic API Access"). It asks what the integration does —
   *displaying our own reviews on our own website* is a standard answer.
3. Wait. Third-party guides report anywhere from a few days to a few weeks.

**How to tell whether you have been approved**: in the Cloud Console, look at
the quota for the Business Profile APIs. **0 requests per minute means not yet
approved. 300 means approved.** The API may not even appear in the library
until then.

Eligibility: the Business Profile must be verified, active for 60+ days, and
list this website.

---

## Step 2 — Create OAuth credentials

1. In the same Cloud Console project, create an **OAuth 2.0 Client ID** of type
   *Web application*.
2. Note the **Client ID** and **Client secret**.
3. Authorise the scope `https://www.googleapis.com/auth/business.manage`,
   signed in as an account that **manages the Egypt Eye location**.
4. Complete the consent flow once to obtain a **refresh token**.

The refresh token is the long-lived credential. Google expires it on a
password change, when access is withdrawn, and after six months unused — so if
reviews stop updating, this is the first thing to check.

---

## Step 3 — Find the account and location IDs

Both come from the Business Profile API itself, from the account and location
listings. They look like long numbers. The location is the Egypt Eye listing
that the reviews belong to.

---

## Step 4 — Put the five values into Vercel

In the Vercel project, under **Settings → Environment Variables**, add:

| Variable | What it is |
|---|---|
| `GOOGLE_BUSINESS_CLIENT_ID` | from step 2 |
| `GOOGLE_BUSINESS_CLIENT_SECRET` | from step 2 |
| `GOOGLE_BUSINESS_REFRESH_TOKEN` | from step 2 |
| `GOOGLE_BUSINESS_ACCOUNT_ID` | from step 3 |
| `GOOGLE_BUSINESS_LOCATION_ID` | from step 3 |

All five are server-side only. **None of them may be given a
`NEXT_PUBLIC_` prefix** — that would publish the secret to every visitor's
browser, and `check-review-page.mts` fails the build if one ever is.

Redeploy after adding them.

---

## Step 5 — Check it worked

Open **`/admin/reviews`**. The panel at the top says one of three things:

- **Not connected yet** — the values are missing or the deploy has not picked
  them up.
- **Connected, but the last attempt failed** — with Google's own error. If it
  mentions `invalid_grant`, redo step 2.
- **The counts** — the number of reviews on Google, the average, and how many
  have text to display. If the count does not match what the Business Profile
  shows, the location ID is pointing at the wrong listing.

After that the reviews refresh nightly on their own.

---

## What this will never do

**It cannot post a review to Google.** No API, URL parameter or embedded
widget accepts a review written on another site — the Business Profile API
reads reviews and posts owner replies, and that is all. The `/review` page
therefore composes the review, copies it, and hands the traveller to Google to
publish it themselves. Any service advertising "one form, posts straight to
Google" is doing the same copy-and-paste behind the scenes.

**The reviews will never produce star snippets in search.** Google's
review-snippet guidance says not to aggregate ratings from other sites, and a
business's own pages cannot earn stars from reviews about itself. The site
therefore emits no structured data over them, deliberately.

**Never filter who gets the review link by how happy they are.** Sending
satisfied customers to Google and unhappy ones to a private form is *review
gating*, prohibited under Google's Fake Engagement policy, and penalties run
from stripping the reviews to restricting the whole Business Profile. The
`/review` page sends every rating down the same path on purpose, and a check
fails the build if that ever changes.
