/**
 * Guards Google Analytics on egypteyetravel.com.
 *
 * Four things here fail silently, and three of them fail in the direction of
 * collecting data the site has no permission to collect.
 *
 *   CONSENT DEFAULTS. analytics_storage must start denied. Flipping it to
 *   granted is one word, looks like a fix for "analytics isn't reporting
 *   anything", and sets a cookie on every EU and UK visitor before they have
 *   been asked — which is what the policy promises does not happen.
 *
 *   DOUBLE PAGEVIEWS. send_page_view must stay false. With it on, gtag sends
 *   one pageview at load AND this code sends one per route change, so every
 *   landing page is counted twice and every bounce rate is wrong. Nothing
 *   errors; the numbers are just quietly false.
 *
 *   TWO BRANDS, ONE PROPERTY. Flying Dresses has its own GA4 and its own
 *   measurement ID. Sharing one ID, or mounting either tag where it covers
 *   both trees, produces a property neither brand can read.
 *
 *   A DARK-PATTERN BANNER. Consent obtained through a notice where refusing
 *   is harder than accepting is not consent under EU guidance — which would
 *   make the data unusable rather than merely impolite.
 */
import { existsSync, readFileSync } from "node:fs";
import { GA_MEASUREMENT_ID, isTrackedPath } from "../src/content/analytics";

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/.*$/gm, "$1");

const tag = stripComments(readFileSync("src/components/SiteAnalytics.tsx", "utf8"));
const banner = stripComments(readFileSync("src/components/AnalyticsConsent.tsx", "utf8"));
const layout = stripComments(readFileSync("src/app/[locale]/layout.tsx", "utf8"));

// ---------------------------------------------------------------------------
// 1. The measurement ID.
// ---------------------------------------------------------------------------
ok("the measurement ID is not a GA4 ID", /^G-[A-Z0-9]{6,}$/.test(GA_MEASUREMENT_ID));
const fdId = readFileSync("src/app/flying-dresses/_lib/analytics.ts", "utf8");
ok(
  "Flying Dresses reads the main site's hardcoded measurement ID — the two brands would share one property",
  !fdId.includes(GA_MEASUREMENT_ID)
);
ok(
  "Flying Dresses no longer takes its measurement ID from its own environment variable",
  /NEXT_PUBLIC_GA_MEASUREMENT_ID/.test(fdId)
);

// ---------------------------------------------------------------------------
// 2. Consent defaults. The assertion that keeps the policy true.
// ---------------------------------------------------------------------------
ok(
  "the tag does not set Consent Mode defaults at all — GA4 would store cookies immediately",
  /gtag\('consent', 'default'/.test(tag)
);
ok(
  "analytics_storage does not default to denied — every EU and UK visitor would be given a cookie before being asked",
  /analytics_storage: eeStored === 'granted' \? 'granted' : 'denied'/.test(tag)
);
for (const signal of ["ad_storage", "ad_user_data", "ad_personalization"]) {
  ok(
    `${signal} is not denied — this site runs no advertising and the policy says these are off permanently`,
    new RegExp(`${signal}: 'denied'`).test(tag)
  );
}
// Ordering: consent defaults must be queued before config, or GA4 treats the
// default as an update and the first events are recorded under the wrong one.
const consentAt = tag.indexOf("'consent', 'default'");
const configAt = tag.indexOf("gtag('config'");
ok(
  "the consent default is queued after config — GA4 requires it before, or the first events use the wrong consent state",
  consentAt !== -1 && configAt !== -1 && consentAt < configAt
);

// ---------------------------------------------------------------------------
// 3. Exactly one pageview per navigation.
// ---------------------------------------------------------------------------
ok(
  "send_page_view is not false — gtag's own pageview plus this code's would count every landing page twice",
  /send_page_view: false/.test(tag)
);
ok("the tag sends no page_view of its own, so nothing is counted", /'event', 'page_view'/.test(tag) || /"event", "page_view"/.test(tag));
// useSearchParams in a root-layout client component opts the entire site out
// of static rendering unless it is wrapped in Suspense. That is a real cost
// to every page's performance and SEO for a small gain in query accuracy.
ok(
  "the tag uses useSearchParams, which would opt the whole site out of static rendering from the root layout",
  !/useSearchParams/.test(tag)
);

// ---------------------------------------------------------------------------
// 4. Mounted once, on the right tree.
// ---------------------------------------------------------------------------
ok("the locale root layout does not mount the tag", /<SiteAnalytics \/>/.test(layout));
ok("the locale root layout does not mount the consent notice", /<AnalyticsConsent \/>/.test(layout));
// A shared root above both trees would put this tag on Flying Dresses pages
// too, inside the other brand's property.
ok(
  "a root src/app/layout.tsx now exists — anything mounted there would tag Flying Dresses as well",
  !existsSync("src/app/layout.tsx")
);
ok(
  "the Flying Dresses layout mounts the main site's tag",
  !/SiteAnalytics/.test(readFileSync("src/app/flying-dresses/layout.tsx", "utf8"))
);

// ---------------------------------------------------------------------------
// 5. The banner must leave refusing as easy as accepting.
// ---------------------------------------------------------------------------
ok("the consent notice offers no way to refuse", /choose\("denied"\)/.test(banner));
ok("the consent notice offers no way to accept", /choose\("granted"\)/.test(banner));
ok(
  "refusing is not the same size as accepting — consent obtained through an unequal choice is not consent",
  // Both buttons carry the same sizing classes; only the colours differ.
  (banner.match(/min-h-\[44px\] flex-1 rounded-full border border-ink\/20/g) ?? []).length === 2
);
ok("the consent notice does not link the privacy policy", /href="\/privacy"/.test(banner));
// A browser test caught the banner sending its own page_view on accept, for a
// page whose page_view had already gone. Under Consent Mode a denied visitor
// still reaches Google as a cookieless ping, so nothing was ever withheld and
// the second event simply counted the page twice.
ok(
  "the consent notice sends a page_view on accept — that page already sent one, so it is counted twice",
  !/page_view/.test(banner)
);
ok(
  "a refusal is not sent to Google — the tag would sit on its default waiting for wait_for_update",
  /analytics_storage: choice === "granted" \? "granted" : "denied"/.test(banner)
);

// ---------------------------------------------------------------------------
// 6. The owner's own screens are not counted as visitors.
// ---------------------------------------------------------------------------
for (const path of ["/admin", "/en/admin/reviews", "/os", "/studio/desk"]) {
  ok(`${path} is tracked as a visitor page`, !isTrackedPath(path));
}
for (const path of ["/", "/tours/1-day-giza-tour", "/ar/testimonials", "/review"]) {
  ok(`${path} is excluded from analytics but is a real visitor page`, isTrackedPath(path));
}

// ---------------------------------------------------------------------------
// 7. The CSP has to allow all of it, or the tag is dead on arrival.
// ---------------------------------------------------------------------------
const config = readFileSync("next.config.ts", "utf8");
// Specific to the script field. A bare search for the hostname passes even
// when script-src has been emptied, because the same host also appears under
// img-src and connect-src — which was exactly what a mutation test found.
ok(
  "the CSP no longer allows googletagmanager.com as a SCRIPT source, so the browser refuses the tag and nothing is ever collected",
  /script:\s*"https:\/\/www\.googletagmanager\.com"/.test(config) &&
    /script-src[^`]*\$\{googleAnalytics\.script\}/.test(config)
);
ok(
  "the CSP no longer allows the GA4 beacon endpoints, so events are collected and then blocked on send",
  config.includes("google-analytics.com")
);

// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\ncheck-analytics: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

console.log(
  `check-analytics: ok — GA4 (${GA_MEASUREMENT_ID}) is mounted once on the locale root, separate from the Flying ` +
    "Dresses property; storage and all three advertising signals default to denied until the visitor agrees; " +
    "refusing is the same size as accepting; exactly one page_view is sent per navigation; admin, os and studio " +
    "are not counted; and the CSP allows both the tag and its beacons."
);
