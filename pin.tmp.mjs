import { chromium } from "playwright-core";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://127.0.0.1:3111/flying-dresses", { waitUntil: "networkidle", timeout: 60000 });
const track = await p.evaluate(() => {
  const el = document.querySelector(".fd-pin-track");
  const r = el.getBoundingClientRect();
  return { top: r.top + scrollY, height: r.height };
});
console.log("track top", Math.round(track.top), "height", Math.round(track.height));
for (const frac of [0, 0.15, 0.35, 0.55, 0.75, 0.95]) {
  const y = Math.round(track.top + track.height * frac - 0);
  await p.evaluate((yy) => window.scrollTo(0, yy), y);
  await p.waitForTimeout(350);
  const op = await p.evaluate(() =>
    [...document.querySelectorAll(".fd-pin-step")].map((e) =>
      Number(getComputedStyle(e).opacity).toFixed(2)
    )
  );
  const visible = op.filter((o) => Number(o) > 0.9).length;
  console.log(`scroll ${String(Math.round(frac*100)).padStart(3)}%  opacities ${op.join("  ")}   fully-visible=${visible}`);
}
await b.close();
