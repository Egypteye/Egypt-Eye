/**
 * Opens the real site in a real browser and reports what it actually looks
 * like and does, at three sizes.
 *
 * This exists because the alternative is writing CSS and believing it. Every
 * other check in scripts/ reads source files; this one is the only thing in
 * the repository that can tell you a heading is invisible against its own
 * hero image, or that a tap target on a phone is too small to hit.
 *
 * It points at a URL, not at a build, which is deliberate. It runs against
 * production, against a Vercel preview deployment, or against `next dev` on
 * localhost, with no code change — so the same command verifies a branch
 * before merge and the live site afterwards.
 *
 *   npx tsx scripts/visual-audit.mts                          # live site
 *   npx tsx scripts/visual-audit.mts --base http://localhost:3000
 *   npx tsx scripts/visual-audit.mts --pages / /tours /faq
 *   npx tsx scripts/visual-audit.mts --out .visual-audit
 *
 * Needs a Chromium binary. It finds one from CHROME_PATH, or from
 * PLAYWRIGHT_BROWSERS_PATH, or at the usual system locations, and says so
 * plainly if it cannot — rather than failing with a stack trace about a
 * missing executable.
 *
 * playwright-core is used rather than playwright on purpose: it bundles no
 * browser and runs no download on install, so adding this tool cannot slow
 * down or break a Vercel production build.
 */
import { chromium, type Browser, type Page } from "playwright-core";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// --------------------------------------------------------------------------
// Configuration
// --------------------------------------------------------------------------

const DEFAULT_BASE = "https://egypteyetravel.com";

// The commercial journey, not a sample of pages. If one of these is broken
// the business loses money, which is the bar for being in this list.
const DEFAULT_PAGES = [
  "/",
  "/tours",
  "/photoshoots",
  "/photoshoots/pyramids-rooftop-flying-dress-photoshoot",
  "/faq",
];

const VIEWPORTS = [
  // 320px IS NOT A LEGACY WIDTH. It is an iPhone SE, and it is what any
  // phone becomes when its owner turns text size up or zooms — which the
  // audience for this site, people reading a foreign website on holiday,
  // does constantly. It was missing from this list, and the header spent a
  // release overflowing its own viewport by 37px there: the capsule ran off
  // the right edge and took the menu button with it. Nothing caught it
  // because nothing looked at a screen that narrow.
  { name: "narrow", width: 320, height: 760 },
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

// Apple and Google both publish ~44px as the minimum comfortable touch
// target. Anything smaller on a phone is a thing people miss and re-tap.
const MIN_TAP_TARGET = 44;

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
function argList(flag: string): string[] | undefined {
  const i = process.argv.indexOf(flag);
  if (i < 0) return undefined;
  const out: string[] = [];
  for (let j = i + 1; j < process.argv.length && !process.argv[j].startsWith("--"); j++) out.push(process.argv[j]);
  return out.length ? out : undefined;
}

const BASE = (arg("--base") ?? DEFAULT_BASE).replace(/\/$/, "");
const PAGES = argList("--pages") ?? DEFAULT_PAGES;
const OUT = arg("--out") ?? ".visual-audit";

// --------------------------------------------------------------------------
// Finding a browser
// --------------------------------------------------------------------------

function findChromium(): string | null {
  const candidates = [
    process.env.CHROME_PATH,
    process.env.PLAYWRIGHT_BROWSERS_PATH ? join(process.env.PLAYWRIGHT_BROWSERS_PATH, "chromium") : undefined,
    "/opt/pw-browsers/chromium",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ].filter((c): c is string => Boolean(c));
  return candidates.find((c) => existsSync(c)) ?? null;
}

// --------------------------------------------------------------------------
// Findings
// --------------------------------------------------------------------------

type Severity = "error" | "warning" | "note";
type Finding = { severity: Severity; page: string; viewport?: string; area: string; detail: string };

const findings: Finding[] = [];
const add = (severity: Severity, page: string, area: string, detail: string, viewport?: string) =>
  findings.push({ severity, page, viewport, area, detail });

// --------------------------------------------------------------------------
// Per-page checks
// --------------------------------------------------------------------------

/** Page-level facts worth knowing before looking at any screenshot. */
async function inspectStructure(page: Page, path: string) {
  // NOTE: no named helpers inside this callback. tsx compiles with esbuild's
  // keepNames, which wraps any function assigned to a const in a __name()
  // helper — and that helper does not exist inside the browser, so the
  // evaluate dies with "__name is not defined". Everything here is therefore
  // inlined or an anonymous callback.
  const info = await page.evaluate((minTap) => {
    const headings = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6")).map((h) => ({
      level: Number(h.tagName[1]),
      text: (h.textContent ?? "").trim().slice(0, 80),
    }));

    const imagesWithoutAlt = Array.from(document.querySelectorAll("img"))
      .filter((img) => !img.hasAttribute("alt"))
      .map((img) => (img.getAttribute("src") ?? "").slice(0, 120));

    // Interactive things too small to hit reliably on a phone. Measured from
    // the rendered box, so it accounts for padding, not just font size.
    //
    // Anything 1px or smaller in either direction is skipped: that is the
    // visually-hidden pattern a "Skip to content" link uses, which is an
    // accessibility feature, not a tap target. Flagging it taught me to
    // distrust the whole list, which is worse than not flagging it.
    //
    // TWO MORE THINGS ARE NOT TAP TARGETS, both learned from this form.
    //
    // 1. A control a finger cannot reach. The enquiry form's honeypot is a
    //    real 204x33 input parked at left: -9999px, on purpose: it is
    //    aria-hidden, tabIndex -1, and off-screen rather than display:none
    //    because some bots fill positioned fields and skip hidden ones. It
    //    was reported as an undersized tap target on the most
    //    conversion-critical page on the site.
    //
    // 2. A checkbox inside its own <label>. The box is 24x24 and the label
    //    around it is 207x46, and the label is what a thumb actually hits,
    //    because clicking a label activates its control. Measuring the input
    //    reported eight failures on a form whose targets are all 46px.
    //
    // Both were wrong, both were on /enquire, and a page that cries wolf
    // twice is a page whose next warning nobody reads.
    const smallTargets = Array.from(document.querySelectorAll('a,button,[role="button"],input,select'))
      .map((el) => {
        const cs = getComputedStyle(el);
        // The real target is the label wrapping a control, when there is one.
        const label = el.closest("label");
        const target = label ?? el;
        const r = target.getBoundingClientRect();
        const unreachable =
          el.closest("[aria-hidden='true']") !== null ||
          el.getAttribute("tabindex") === "-1" ||
          r.right < 0 ||
          r.bottom < 0 ||
          r.left > innerWidth;
        return {
          tag: el.tagName.toLowerCase(),
          label: (target.textContent ?? "").trim().slice(0, 40),
          w: Math.round(r.width),
          h: Math.round(r.height),
          hidden:
            cs.visibility === "hidden" ||
            cs.display === "none" ||
            Number(cs.opacity) < 0.02 ||
            unreachable,
        };
      })
      .filter((t) => t.w > 1 && t.h > 1 && !t.hidden && (t.w < minTap || t.h < minTap));

    // Grouped by what they are, not listed one by one. A flat count says
    // "5126 tap targets are too small", which reads as a broken check and
    // gets ignored. Grouped, the same data says "2674 × View on
    // Tripadvisor", which names the component rendering them — that is how
    // the 18 MB homepage was found.
    const targetGroups: Record<string, number> = {};
    for (const t of smallTargets) {
      const key = `${t.tag} "${t.label}" ${t.w}x${t.h}`;
      targetGroups[key] = (targetGroups[key] ?? 0) + 1;
    }
    const topTargetGroups = Object.entries(targetGroups).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // TEXT PRINTED ON TOP OF OTHER TEXT.
    //
    // This exists because the home page shipped with three headlines stacked
    // in one grid cell, all at full opacity, rendering as an unreadable smear
    // — and every check in this repository passed on it. The console was
    // clean, axe was happy (it measures contrast, not collision), the tap
    // targets were fine and the HTML was valid. The owner found it by looking
    // at the site.
    //
    // The cause was a cross-fade whose timeline never activated, so the rule
    // that stacks the captions applied while the rule that fades them did
    // not. That specific bug is fixed; this is here so the next one of its
    // shape is caught by a machine instead of a customer.
    //
    // Compares only elements with their own visible text at 18px or larger —
    // display type, where a collision is both most likely and most damaging.
    // Ancestor/descendant pairs are skipped: a heading always overlaps the
    // section containing it, and that is not a defect.
    const bigText = Array.from(document.querySelectorAll("h1,h2,h3,h4,p,span,li,figcaption,div"))
      .filter((el) => {
        const own = Array.from(el.childNodes)
          .filter((n) => n.nodeType === 3)
          .map((n) => n.textContent ?? "")
          .join("")
          .trim();
        if (own.length < 8) return false;
        // checkVisibility walks the ANCESTORS. getComputedStyle(el).opacity
        // does not, and that distinction is the whole check: in the pinned
        // scene the <p> carrying the headline is always opacity 1 — it is the
        // .fd-pin-step WRAPPING it that the cross-fade animates. Reading the
        // paragraph alone reported every caption as permanently visible, so
        // this flagged three collisions on correct code and would have been
        // switched off within a day.
        if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true, contentVisibilityAuto: true })) {
          return false;
        }
        const cs = getComputedStyle(el);
        if (parseFloat(cs.fontSize) < 18) return false;
        // Mid-fade is not a collision. Walk up for the effective opacity: a
        // genuinely stuck element sits at full opacity all the way to the
        // root, which is what this threshold means.
        let eff = 1;
        let n: Element | null = el;
        while (n && n !== document.documentElement) {
          eff *= Number(getComputedStyle(n).opacity);
          if (eff < 0.9) return false;
          n = n.parentElement;
        }
        const r = el.getBoundingClientRect();
        return r.width > 24 && r.height > 12;
      });

    const collisions = [];
    for (let i = 0; i < bigText.length; i++) {
      for (let j = i + 1; j < bigText.length; j++) {
        const a = bigText[i];
        const b = bigText[j];
        if (a.contains(b) || b.contains(a)) continue;
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        const w = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
        const h = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
        if (w <= 0 || h <= 0) continue;
        const overlap = w * h;
        const smaller = Math.min(ra.width * ra.height, rb.width * rb.height);
        if (overlap / smaller < 0.6) continue;
        collisions.push(
          `"${(a.textContent ?? "").trim().slice(0, 40)}" over "${(b.textContent ?? "").trim().slice(0, 40)}"`
        );
        if (collisions.length >= 3) break;
      }
      if (collisions.length >= 3) break;
    }

    // A BOX THAT ASKED FOR AN ASPECT RATIO AND GOT NO HEIGHT.
    //
    // aspect-ratio does nothing on an inline box. `.fd-outfit-media` is a
    // <span> that set `aspect-ratio` and never set `display`, so it computed
    // to 0x0 and the wardrobe's twelve colour swatches drew nothing at all —
    // on the page whose whole purpose is showing twelve dresses. It shipped
    // that way and no check noticed, because an element with no height is
    // invisible to contrast, heading and tap-target checks alike: there is
    // nothing there to measure.
    //
    // So this looks for the shape of that mistake rather than that one
    // element: anything that declares an aspect ratio and then renders with
    // no height is either a collapsed box or a rule with no effect, and both
    // are worth knowing about.
    const collapsed = [];
    for (const el of document.querySelectorAll("*")) {
      const cs = getComputedStyle(el);
      // "auto 1600 / 900" is the INTRINSIC ratio a browser derives from an
      // img's width/height attributes, not a rule anybody wrote. Only an
      // authored aspect-ratio can be the mistake this looks for, and the
      // distinction is the leading "auto". Without it this flagged the
      // fallback <img> inside the hero <video>, which is 0x0 precisely
      // because the video is playing — a correct state reported as a fault,
      // which is how a check gets switched off.
      if (!cs.aspectRatio || cs.aspectRatio === "auto" || cs.aspectRatio.startsWith("auto")) continue;
      if (cs.display === "none") continue;
      // Fallback content of a <video> or <audio> never renders while the
      // media works. It is markup for a browser that cannot play it.
      if (el.closest("video, audio, picture")) continue;
      const r = el.getBoundingClientRect();
      if (r.height >= 1) continue;
      collapsed.push(
        `${el.tagName.toLowerCase()}.${(el.className || "").toString().split(" ")[0]} ` +
          `has aspect-ratio ${cs.aspectRatio} but renders ${Math.round(r.width)}x${Math.round(r.height)} ` +
          `(display: ${cs.display})`
      );
      if (collapsed.length >= 3) break;
    }

    // TEXT EATEN BY A ROUNDED CORNER.
    //
    // `overflow: hidden` plus `border-radius` clips content to the CURVE, not
    // to the box. Any text that reaches a corner loses its first or last
    // letters to it, and it is invisible in code review because the two
    // properties are usually in different rules written months apart: the
    // overflow belonged to the card, the radius arrived with a restyle.
    //
    // It shipped exactly that way here. A tile's last line sat at inset 0 from
    // the left and 0 from the bottom of a 28px radius, so "PRICE ON REQUEST"
    // rendered with the P sliced in half. The owner spotted it; nothing else
    // did, because the text is present in the DOM, correctly sized, correctly
    // contrasted, and simply not all drawn.
    const cornerClipped = [];
    for (const box of document.querySelectorAll("*")) {
      const cs = getComputedStyle(box);
      if (cs.overflow === "visible" && cs.overflowX === "visible") continue;
      const radii = [
        parseFloat(cs.borderTopLeftRadius),
        parseFloat(cs.borderTopRightRadius),
        parseFloat(cs.borderBottomLeftRadius),
        parseFloat(cs.borderBottomRightRadius),
      ];
      const maxR = Math.max(...radii.map((n) => (Number.isFinite(n) ? n : 0)));
      if (maxR < 4) continue;
      const br = box.getBoundingClientRect();
      if (br.width < 10 || br.height < 10) continue;
      for (const el of box.querySelectorAll("p,span,a,h1,h2,h3,h4,h5,h6,li,dt,dd,figcaption")) {
        const own = Array.from(el.childNodes)
          .filter((n) => n.nodeType === 3)
          .map((n) => n.textContent ?? "")
          .join("")
          .trim();
        if (own.length < 3) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 5 || r.height < 5) continue;
        // Inside the square region a corner's curve cuts into?
        const nearLeft = r.left - br.left < maxR;
        const nearRight = br.right - r.right < maxR;
        const nearTop = r.top - br.top < maxR;
        const nearBottom = br.bottom - r.bottom < maxR;
        if ((nearLeft || nearRight) && (nearTop || nearBottom)) {
          cornerClipped.push(
            `"${own.slice(0, 32)}" sits in a ${Math.round(maxR)}px rounded corner of ` +
              `${box.tagName.toLowerCase()}.${(box.className || "").toString().split(" ")[0]} (overflow: ${cs.overflow})`
          );
          break;
        }
      }
      if (cornerClipped.length >= 3) break;
    }

    // Total rendered text. A homepage carrying a megabyte of it is shipping
    // a database to the browser, whatever it looks like.
    const bodyChars = document.body.innerText.length;
    const domNodes = document.getElementsByTagName("*").length;

    return {
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.getAttribute("content") ?? null,
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
      robots: document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? null,
      ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute("content") ?? null,
      headings,
      imagesWithoutAlt,
      smallTargets,
      topTargetGroups,
      collisions,
      collapsed,
      cornerClipped,
      bodyChars,
      domNodes,
      jsonLdBlocks: document.querySelectorAll('script[type="application/ld+json"]').length,
      htmlLang: document.documentElement.getAttribute("lang"),
    };
  }, MIN_TAP_TARGET);

  // --- SEO basics
  if (!info.title) add("error", path, "seo", "No <title>.");
  else if (info.title.length > 60) add("note", path, "seo", `Title is ${info.title.length} chars; Google truncates around 60: "${info.title}"`);
  if (!info.description) add("warning", path, "seo", "No meta description — Google writes its own snippet.");
  if (!info.canonical) add("warning", path, "seo", "No canonical link.");
  if (!info.ogImage) add("note", path, "seo", "No og:image — shares render without a picture.");
  if (!info.htmlLang) add("warning", path, "a11y", "<html> has no lang attribute; screen readers guess the language.");

  // --- Heading structure
  const h1s = info.headings.filter((h) => h.level === 1);
  if (h1s.length === 0) add("error", path, "a11y", "No <h1> on the page.");
  if (h1s.length > 1) add("warning", path, "a11y", `${h1s.length} <h1> elements: ${h1s.map((h) => `"${h.text}"`).join(", ")}`);
  for (let i = 1; i < info.headings.length; i++) {
    const jump = info.headings[i].level - info.headings[i - 1].level;
    if (jump > 1) {
      add("note", path, "a11y", `Heading level jumps h${info.headings[i - 1].level} → h${info.headings[i].level} at "${info.headings[i].text}"`);
      break; // one example is enough to act on
    }
  }

  // --- Text printed on top of other text
  for (const c of info.collisions) {
    add("error", path, "layout", `Text overlaps text: ${c}`);
  }

  // --- Boxes that asked for a ratio and got no height
  for (const c of info.collapsed) {
    add("error", path, "layout", `Collapsed box: ${c}`);
  }

  // --- Text eaten by a rounded corner
  for (const c of info.cornerClipped) {
    add("error", path, "layout", `Corner clip: ${c}`);
  }

  // --- Images and JSON-LD
  if (info.imagesWithoutAlt.length) {
    add("warning", path, "a11y", `${info.imagesWithoutAlt.length} <img> without alt, e.g. ${info.imagesWithoutAlt[0]}`);
  }
  if (info.jsonLdBlocks === 0) add("note", path, "seo", "No JSON-LD structured data on this page.");

  return info;
}

/** axe-core, injected from the installed package rather than a CDN. */
async function runAxe(page: Page, path: string) {
  let source: string;
  try {
    source = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
  } catch {
    add("note", path, "a11y", "axe-core is not installed; accessibility rules were not run.");
    return null;
  }
  await page.evaluate(source);

  // SETTLE THE SCROLL REVEALS BEFORE MEASURING COLOUR.
  //
  // Every section on the Flying Dresses pages fades in on a `view()` timeline,
  // so at scroll-top the sections below the fold legitimately sit part-way
  // through `fd-rise` — and axe blends an ancestor's opacity into the
  // foreground colour before testing it. It therefore measured the eyebrow in
  // section 2 as #e3dccf on #f8f4ed, a ratio of 1.24, and reported six serious
  // contrast violations on a page whose real colours are #614919 and #3a2e1c
  // on #f8f4ed and pass AA comfortably.
  //
  // Verified before writing this: scrolling the whole page in half-viewport
  // steps and recording each element's highest opacity, all 20 reveal
  // elements reach 1 at both 390px and 1440px. Nothing was dim; axe was
  // simply reading them mid-fade.
  //
  // Desktop hid the problem, which is the dangerous part. At exactly opacity 0
  // axe skips an element as invisible, so the wider viewport — where the
  // sections are further from `entry` — reported zero violations while mobile
  // reported six. A rule that fires only at one width, on correct code, is a
  // rule the next person learns to ignore.
  //
  // So contrast is measured against the state a reader actually reads: the
  // animations are pinned to their end, scoped to this scan and reverted
  // straight after, which leaves the screenshots and the layout detectors
  // (they need the live animation — the pinned-caption bug was only visible
  // mid-scroll) untouched.
  const SETTLE_ID = "__audit_settle_reveals";
  await page.evaluate((id) => {
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      .fd-reveal, .fd-reveal-group > *, .fd-fabric, .fd-words > span, .fd-pin-step {
        animation: none !important;
        opacity: 1 !important;
        transform: none !important;
        clip-path: none !important;
      }`;
    document.head.appendChild(style);
  }, SETTLE_ID);

  const result = (await page.evaluate(async () => {
    // @ts-expect-error injected at runtime
    return await window.axe.run(document, { resultTypes: ["violations"] });
  })) as { violations: { id: string; impact: string | null; description: string; nodes: unknown[] }[] };

  await page.evaluate((id) => document.getElementById(id)?.remove(), SETTLE_ID);

  for (const v of result.violations) {
    const severity: Severity = v.impact === "critical" || v.impact === "serious" ? "warning" : "note";
    add(severity, path, "a11y", `${v.id} (${v.impact ?? "unknown"}, ${v.nodes.length} element(s)): ${v.description}`);
  }
  return result.violations.length;
}

// --------------------------------------------------------------------------
// Main
// --------------------------------------------------------------------------

const executablePath = findChromium();
if (!executablePath) {
  console.error(
    "visual-audit: no Chromium found.\n" +
      "  Set CHROME_PATH to a Chrome or Chromium binary, or install one:\n" +
      "    npx playwright install chromium\n" +
      "  (On this project's cloud sandbox one is already at /opt/pw-browsers/chromium.)",
  );
  process.exit(2);
}

mkdirSync(OUT, { recursive: true });

// The cloud sandbox routes outbound HTTPS through an agent proxy, and
// Chromium has to be told about it or every request to a deployed site hangs.
//
// But a LOCAL base must never go through it. Chromium's --proxy-server applies
// to localhost too, and the agent proxy answers a localhost request with
// HTTP 405 Method Not Allowed — so auditing `next dev` reported every page as
// a 405 with no title and no <h1>, which reads exactly like a catastrophically
// broken site rather than like a misrouted request. That cost a real debugging
// detour; hence the bypass and the note.
//
// `*.localhost` counts as local too. RFC 6761 reserves the whole .localhost
// TLD for loopback, and the second brand is only reachable in `next dev` by
// hostname — flyingdressesegypt.localhost:3000 — because the proxy routes by
// Host header. A pattern that matched bare `localhost` only sent exactly that
// audit through the agent proxy and reported the entire brand as 405s.
const isLocalBase =
  /^https?:\/\/([a-z0-9-]+\.)*(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/i.test(BASE);
const proxy = isLocalBase ? undefined : process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
const browser: Browser = await chromium.launch({
  executablePath,
  args: ["--ignore-certificate-errors"],
  ...(proxy
    ? {
        proxy: {
          server: proxy,
          // Belt and braces: even against a remote base, anything local that
          // a page happens to request stays off the proxy.
          bypass: "localhost,*.localhost,127.0.0.1,::1",
        },
      }
    : {}),
});

console.log(`visual-audit: ${BASE}`);
console.log(`  browser  ${executablePath}`);
console.log(`  pages    ${PAGES.length}   viewports ${VIEWPORTS.map((v) => v.name).join(", ")}`);
if (proxy) console.log(`  proxy    ${proxy} (load times below include proxy overhead and are NOT the site's real speed)`);
if (isLocalBase) console.log("  proxy    bypassed for a local base");
console.log("");

const pageReports: Record<string, unknown> = {};

for (const path of PAGES) {
  const url = `${BASE}${path}`;
  const label = path === "/" ? "home" : path.replace(/^\//, "").replace(/\//g, "-");
  const perPage: Record<string, unknown> = { url };

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      ignoreHTTPSErrors: true,
      isMobile: vp.name === "mobile",
      hasTouch: vp.name === "mobile",
      deviceScaleFactor: vp.name === "mobile" ? 2 : 1,
    });
    const page = await context.newPage();

    const consoleErrors: string[] = [];
    const failedRequests: string[] = [];
    page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text().slice(0, 240)); });
    page.on("requestfailed", (r) => failedRequests.push(`${r.failure()?.errorText ?? "failed"} ${r.url().slice(0, 140)}`));
    page.on("pageerror", (e) => consoleErrors.push(`uncaught: ${e.message}`.slice(0, 240)));

    const started = Date.now();
    let status: number | undefined;
    try {
      const res = await page.goto(url, { waitUntil: "load", timeout: 60_000 });
      status = res?.status();
    } catch (err) {
      add("error", path, "load", `${vp.name}: navigation failed: ${err instanceof Error ? err.message : String(err)}`, vp.name);
      await context.close();
      continue;
    }
    const loadMs = Date.now() - started;

    if (status && status >= 400) add("error", path, "load", `${vp.name}: HTTP ${status}`, vp.name);

    // Let entrance animations and carousels settle. Screenshotting mid-fade
    // produces a washed-out image that looks exactly like a real contrast
    // bug, which is a false positive worth paying 1.2s to avoid.
    await page.waitForTimeout(1200);

    const shot = join(OUT, `${label}-${vp.name}.png`);
    await page.screenshot({ path: shot, fullPage: false });

    // THE PAGE SLIDING SIDEWAYS — measured on EVERY viewport, deliberately.
    //
    // This is in the per-viewport loop and not in inspectStructure (which
    // only runs the mobile pass) because the real instance of this bug was a
    // desktop nav that switched on at 1024px and needed 1440: 312px of
    // sideways scroll at 1024 and 86px at 1280, with the phone perfectly
    // fine. A detector that only looked at 390px would have reported the page
    // as clean while every laptop slid under the cursor.
    const slide = await page.evaluate(() => {
      const overflow =
        document.documentElement.scrollWidth - document.documentElement.clientWidth;
      const culprits: string[] = [];
      if (overflow > 1) {
        const vw = document.documentElement.clientWidth;
        Array.from(document.querySelectorAll("*")).forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width < 1 || r.right <= vw + 1) return;
          const parent = el.parentElement;
          if (!parent || parent.getBoundingClientRect().right > vw + 1) return;
          const cs = getComputedStyle(el);
          // An element that scrolls itself is MEANT to be wider than its box.
          if (cs.overflowX === "auto" || cs.overflowX === "scroll") return;
          // AND NEITHER IS ANYTHING INSIDE ONE. A wide table in a scrolling
          // wrapper is correct and is not why the page slid; reporting it
          // sends the reader to the wrong element. This cost a real
          // diagnosis: /packages was named as "table.fd-table, div" when the
          // actual culprit was a grid cell with a 20rem minimum.
          //
          // The walk stops at <body> ON PURPOSE. `body` here carries
          // `overflow-x: hidden` while `html` does not, so the page scrolls
          // even though body clips what sticks out — treat body as a clipper
          // and every culprit on the page disappears while the error stays.
          for (let a: HTMLElement | null = parent; a && a !== document.body; a = a.parentElement) {
            const ao = getComputedStyle(a).overflowX;
            if (ao === "auto" || ao === "scroll" || ao === "hidden") return;
          }
          const cls = typeof el.className === "string" ? el.className.trim() : "";
          const name = el.tagName.toLowerCase() + (cls ? "." + cls.split(/\s+/).join(".") : "");
          if (culprits.length < 4 && !culprits.includes(name)) culprits.push(name);
        });
      }
      return { overflow, culprits };
    });
    if (slide.overflow > 1) {
      add(
        "error",
        path,
        "layout",
        `Page scrolls sideways by ${slide.overflow}px` +
          (slide.culprits.length ? ` — widest: ${slide.culprits.join(", ")}` : ""),
        vp.name
      );
    }

    for (const e of consoleErrors.slice(0, 3)) add("error", path, "console", `${vp.name}: ${e}`, vp.name);
    for (const f of failedRequests.slice(0, 3)) add("error", path, "network", `${vp.name}: ${f}`, vp.name);

    // Structure and a11y are page facts, not viewport facts — but tap
    // targets only mean something on a phone, so the mobile pass owns them.
    if (vp.name === "mobile") {
      const info = await inspectStructure(page, path);
      if (info.smallTargets.length) {
        const worst = info.topTargetGroups.map(([k, n]) => `${n}× ${k}`).join("; ");
        add("warning", path, "mobile", `${info.smallTargets.length} tap target(s) under ${MIN_TAP_TARGET}px — ${worst}`, "mobile");
      }
      // Payload. These thresholds are not style opinions: a page past them
      // is slow on a phone no matter how good it looks.
      if (info.bodyChars > 200_000) {
        add("error", path, "payload", `${info.bodyChars.toLocaleString()} characters of rendered text — this page is shipping a dataset, not a page`, "mobile");
      } else if (info.bodyChars > 80_000) {
        add("warning", path, "payload", `${info.bodyChars.toLocaleString()} characters of rendered text`, "mobile");
      }
      if (info.domNodes > 5_000) {
        add("error", path, "payload", `${info.domNodes.toLocaleString()} DOM nodes — browsers struggle past about 5,000`, "mobile");
      } else if (info.domNodes > 2_500) {
        add("warning", path, "payload", `${info.domNodes.toLocaleString()} DOM nodes`, "mobile");
      }
      const axeCount = await runAxe(page, path);
      perPage.structure = info;
      perPage.axeViolations = axeCount;
    }

    perPage[vp.name] = { status, loadMs, screenshot: shot, consoleErrors: consoleErrors.length, failedRequests: failedRequests.length };
    console.log(`  ${status === 200 ? "ok " : "!! "} ${path.padEnd(52)} ${vp.name.padEnd(8)} ${String(loadMs).padStart(6)}ms  → ${shot}`);

    await context.close();
  }

  pageReports[path] = perPage;
}

await browser.close();

// --------------------------------------------------------------------------
// Report
// --------------------------------------------------------------------------

const errors = findings.filter((f) => f.severity === "error");
const warnings = findings.filter((f) => f.severity === "warning");
const notes = findings.filter((f) => f.severity === "note");

const lines: string[] = [`# Visual audit — ${BASE}`, "", `Run ${new Date().toISOString()}`, ""];
for (const [heading, group] of [["Errors", errors], ["Warnings", warnings], ["Notes", notes]] as const) {
  lines.push(`## ${heading} (${group.length})`, "");
  if (!group.length) lines.push("_None._", "");
  for (const f of group) lines.push(`- **${f.page}**${f.viewport ? ` _(${f.viewport})_` : ""} · \`${f.area}\` — ${f.detail}`);
  lines.push("");
}
writeFileSync(join(OUT, "report.md"), lines.join("\n"));
writeFileSync(join(OUT, "report.json"), JSON.stringify({ base: BASE, ranAt: new Date().toISOString(), findings, pages: pageReports }, null, 2));

console.log("");
console.log(`visual-audit: ${errors.length} error(s), ${warnings.length} warning(s), ${notes.length} note(s)`);
console.log(`  report  ${join(OUT, "report.md")}`);
console.log(`  shots   ${OUT}/*.png  — LOOK AT THEM. This script cannot tell you a page is ugly.`);

// Errors fail the command so this can gate a deploy. Warnings and notes do
// not: a heading-order nit should never block a release on its own.
process.exit(errors.length > 0 ? 1 : 0);
