import { chromium } from "playwright-core";
const ROOT = "1JctHIgc5ztIPqU8F6WsThNvPJqBkjNa7";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args:["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
const seen = new Set();
async function list(id, label, depth) {
  if (depth > 3 || seen.has(id)) return;
  seen.add(id);
  await page.goto(`https://drive.google.com/drive/folders/${id}`, { waitUntil: "networkidle", timeout: 60000 });
  for (let i = 0; i < 28; i++) { await page.mouse.wheel(0, 1200); await page.waitForTimeout(180); }
  const items = await page.evaluate(() =>
    [...document.querySelectorAll("[data-id]")]
      .map((el) => ({ id: el.getAttribute("data-id"), name: (el.getAttribute("aria-label")||el.textContent||"").trim().slice(0,130) }))
      .filter((x) => x.id && x.id.length > 20));
  const local = new Set(); const subs = [];
  for (const it of items) {
    if (local.has(it.id)) continue; local.add(it.id);
    const isFile = /\.(jpg|jpeg|png|mp4|mov|webp|heic)/i.test(it.name);
    console.log([label, it.id, isFile?"FILE":"DIR", it.name].join("\t"));
    if (!isFile) subs.push(it);
  }
  for (const s of subs) await list(s.id, `${label}/${s.name.split(/\d|Shared/)[0].trim().slice(0,26)}`, depth+1);
}
await list(ROOT, "old", 0);
await browser.close();
