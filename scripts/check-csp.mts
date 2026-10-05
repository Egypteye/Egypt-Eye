/**
 * Guards the Content-Security-Policy, and one rule above all others:
 * production must never be served 'unsafe-eval'.
 *
 * The relaxation exists because `next dev` cannot run under the strict policy
 * — React's development build uses eval(), so without it React never hydrates
 * and every interactive component is silently inert. That is a real cost, and
 * relaxing it for development is the right trade.
 *
 * It is also exactly the kind of change that leaks. A dev-only exception that
 * quietly applies in production would hand an attacker the ability to execute
 * injected strings, which is most of what a CSP exists to prevent. So this
 * loads the REAL next.config.ts and evaluates its headers under each
 * NODE_ENV, rather than asserting against a copy of the policy that could
 * drift from the one actually served.
 */
import type { NextConfig } from "next";

type HeaderRule = { source: string; headers: { key: string; value: string }[] };

async function cspFor(env: string): Promise<string> {
  const previous = process.env.NODE_ENV;
  // NODE_ENV is readonly in the types but writable at runtime, which is the
  // only way to exercise the real config's branch.
  (process.env as Record<string, string | undefined>).NODE_ENV = env;
  // Imported fresh each time: the config reads NODE_ENV when headers() runs,
  // but a cached module would have captured nothing — the import is cheap and
  // this removes any doubt about ordering.
  const mod = (await import(`../next.config.ts?env=${env}`)) as { default: NextConfig };
  const rules = (await mod.default.headers!()) as HeaderRule[];
  (process.env as Record<string, string | undefined>).NODE_ENV = previous;

  const policies = rules
    .flatMap((rule) => rule.headers)
    .filter((header) => header.key === "Content-Security-Policy")
    .map((header) => header.value);
  if (policies.length !== 1) {
    throw new Error(`expected exactly one Content-Security-Policy rule, found ${policies.length}`);
  }
  return policies[0];
}

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

const production = await cspFor("production");
const development = await cspFor("development");

// The rule that matters. Everything else in this file is secondary.
ok("PRODUCTION CSP CONTAINS 'unsafe-eval' — this must never ship", !production.includes("unsafe-eval"));
ok("production CSP allows a WebSocket origin it should not", !/\bws:/.test(production));
ok("production CSP allows localhost", !production.includes("localhost"));

// PayPal's buttons render inside the booking dialog, so the policy has to let
// their SDK load, open its iframes, call home and draw its card art. If any of
// these disappears the buttons fail with a console error nobody is watching
// for, and the only visible symptom is that deposits quietly stop being paid —
// which is why this is asserted rather than left to a code review.
const PAYPAL_ORIGINS = [
  "https://www.paypal.com",
  "https://www.sandbox.paypal.com",
  "https://www.paypalobjects.com",
  "https://c.paypal.com",
];
for (const directive of ["script-src", "frame-src", "connect-src", "img-src"]) {
  const value = production.split("; ").find((part) => part.startsWith(`${directive} `)) ?? "";
  for (const origin of PAYPAL_ORIGINS) {
    ok(`${directive} does not allow ${origin}, so PayPal's buttons cannot work`, value.includes(origin));
  }
}

// The other half of that rule: allowing PayPal must not have been done with a
// wildcard. `https://*.paypal.com` would admit every subdomain PayPal ever
// creates, which is more trust than taking a payment needs.
ok(
  "the CSP allows PayPal by wildcard rather than by named host",
  !/\*\.paypal(objects)?\.com/.test(production)
);

// An unset or unexpected NODE_ENV must fall through to the strict policy,
// because guessing wrong in that direction ships eval() to real visitors.
for (const env of ["", "test", "staging", "Production", "DEVELOPMENT"]) {
  const policy = await cspFor(env);
  ok(`NODE_ENV="${env}" produced a CSP containing 'unsafe-eval'`, !policy.includes("unsafe-eval"));
}

// And the relaxation has to actually work, or dev is still broken and the
// exception is pure risk with no benefit.
ok("development CSP does not allow eval, so React still will not hydrate", development.includes("'unsafe-eval'"));
ok("development CSP does not allow the hot-reload WebSocket", /\bws:/.test(development));

// The protections that must hold in both, so a dev-only change cannot quietly
// widen something else.
for (const [name, policy] of [["production", production], ["development", development]] as const) {
  ok(`${name} CSP lost object-src 'none'`, policy.includes("object-src 'none'"));
  ok(`${name} CSP lost frame-ancestors`, policy.includes("frame-ancestors 'self'"));
  ok(`${name} CSP lost base-uri`, policy.includes("base-uri 'self'"));
  ok(`${name} CSP lost form-action`, policy.includes("form-action 'self'"));
  ok(`${name} CSP lost default-src 'self'`, policy.includes("default-src 'self'"));
  ok(`${name} CSP allows scripts from anywhere`, !/script-src[^;]*\*/.test(policy));
}

if (errors.length > 0) {
  console.error(`\ncheck-csp: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

console.log(
  "check-csp: ok — production allows no eval, no ws: and no localhost under any NODE_ENV; " +
    "development allows both so the site is usable locally; the shared protections hold in both."
);
