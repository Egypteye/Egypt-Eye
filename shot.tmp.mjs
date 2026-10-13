import { chromium } from "playwright-core";
const OUT = "/tmp/claude-0/-home-user-Egypt-Eye/60304ff1-6d00-5ce2-9806-9f10342b1463/scratchpad";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const [name, w, h] of [["desk", 1440, 900], ["phone", 390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto("http://127.0.0.1:3111/flying-dresses", { waitUntil: "networkidle", timeout: 60000 });
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `${OUT}/home-${name}.png`, fullPage: true });
  // Report overlapping / overflowing boxes
  const bad = await p.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll(".fd-pin-step, .fd-slot, .fd-btn, .fd-eyebrow")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const overflowing = el.scrollHeight > el.clientHeight + 2;
      const label = (el.textContent || "").trim().slice(0, 40);
      if (overflowing || (el.classList.contains("fd-btn") && label === "")) {
        out.push({ cls: el.className, label, overflowing, sh: el.scrollHeight, ch: el.clientHeight });
      }
    }
    return out;
  });
  console.log(`--- ${name} ---`);
  console.log(JSON.stringify(bad, null, 1));
  await p.close();
}
await b.close();
